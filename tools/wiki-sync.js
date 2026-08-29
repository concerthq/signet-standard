#!/usr/bin/env node
/**
 * wiki-sync.js — one-way projection of the vendored wiki/ directory onto the live GitHub wiki,
 * with a drift check in both directions.
 *
 * Governance framing (matters more than the mechanics):
 *   The vendored wiki/ in the repository is the REVIEWED copy — it changes by pull request,
 *   rides the same review as everything else, and check-naming.js covers it. The live GitHub
 *   wiki is a separate git repo (…/signet-standard.wiki.git) with NO pull requests and NO CI.
 *   Therefore: the live wiki is a projection of wiki/, never an editing surface. Sync is
 *   one-way, vendored → live. A live-only edit is drift by definition (D-33's pattern), and
 *   this script refuses to silently overwrite or silently keep it.
 *
 * Usage (from the repository root, on main, up to date):
 *   node tools/wiki-sync.js                 # check only: report drift both ways, exit 1 on any
 *   node tools/wiki-sync.js --push          # check, then project vendored → live and push
 *   node tools/wiki-sync.js --push --prune  # also delete live-only pages (destructive; explicit)
 *
 * wiki/README.md (the vendoring explainer) is never published; every other top-level .md is.
 *
 * The push commit message records the source commit, so every live-wiki state is traceable
 * to a reviewed tree state. Run with the concertfoundation identity; a wiki push is a
 * Tier 1 projection of already-reviewed content, not a new change.
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");
const crypto = require("crypto");

const PUSH = process.argv.includes("--push");
const PRUNE = process.argv.includes("--prune");
const sh = (cmd, opts = {}) => cp.execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const norm = (p) => crypto.createHash("sha256").update(fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n")).digest("hex");

// ---- context guards
const branch = sh("git rev-parse --abbrev-ref HEAD");
if (branch !== "main") { console.error(`Refusing: on ${branch}, not main. The projection source is reviewed main.`); process.exit(2); }
sh("git fetch origin main");
if (sh("git rev-list --count HEAD..origin/main") !== "0") { console.error("Refusing: behind origin/main. Pull first."); process.exit(2); }
if (sh("git status --porcelain -- wiki/") !== "") { console.error("Refusing: uncommitted changes under wiki/."); process.exit(2); }
const srcCommit = sh("git rev-parse --short HEAD");
if (!fs.existsSync("wiki") || !fs.existsSync("wiki/Home.md")) { console.error("Refusing: wiki/Home.md not found — run from the repository root."); process.exit(2); }

// ---- clone the live wiki
const origin = sh("git remote get-url origin").replace(/\.git$/, "");
const wikiUrl = origin + ".wiki.git";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "signet-wiki-"));
console.log(`Source: wiki/ at ${srcCommit}   Live: ${wikiUrl}`);
try { sh(`git clone --quiet "${wikiUrl}" "${tmp}"`); }
catch (e) {
  console.error("Could not clone the live wiki. Either the wiki is not enabled/initialised on GitHub");
  console.error("(enable it and create any first page so the .wiki.git repo exists), or auth failed.");
  process.exit(2);
}

// ---- compare (top-level .md files only; the wiki surface is flat)
const list = (dir) => fs.readdirSync(dir).filter(f => f.endsWith(".md") && fs.statSync(path.join(dir, f)).isFile());
// wiki/README.md is the meta explainer for the vendoring convention, not a wiki page.
const src = new Set(list("wiki").filter(f => f !== "README.md"));
const live = new Set(list(tmp));
const inRepoOnly = [...src].filter(f => !live.has(f)).sort();
const liveOnly = [...live].filter(f => !src.has(f)).sort();
const differ = [], same = [];
for (const f of [...src].filter(f => live.has(f)).sort())
  (norm(path.join("wiki", f)) === norm(path.join(tmp, f)) ? same : differ).push(f);

console.log(`\n  in sync            : ${same.length}`);
for (const f of inRepoOnly) console.log(`  NEEDS PUBLISH      : ${f} (in wiki/, not live)`);
for (const f of differ)     console.log(`  CONTENT DIFFERS    : ${f}`);
for (const f of liveOnly)   console.log(`  LIVE-ONLY (drift)  : ${f} — edited or created on the wiki directly; the reviewed tree does not know it`);

const drift = inRepoOnly.length + differ.length + liveOnly.length;
if (!PUSH) {
  console.log(drift === 0 ? "\nLive wiki matches the reviewed tree." : `\n${drift} page(s) out of sync. Run with --push to project wiki/ → live.`);
  if (liveOnly.length) console.log("LIVE-ONLY pages need a human decision: port the edit into wiki/ by PR, or --push --prune to delete.");
  process.exit(drift ? 1 : 0);
}

// ---- push mode
if (liveOnly.length && !PRUNE) {
  console.error(`\nRefusing to push: ${liveOnly.length} live-only page(s) exist and --prune was not given.`);
  console.error("A live-only page is either content to rescue (port into wiki/ by PR first) or drift to delete (--prune).");
  process.exit(1);
}
if (drift === 0) { console.log("\nNothing to push."); process.exit(0); }

for (const f of [...inRepoOnly, ...differ]) fs.copyFileSync(path.join("wiki", f), path.join(tmp, f));
if (PRUNE) for (const f of liveOnly) fs.unlinkSync(path.join(tmp, f));
sh("git add -A", { cwd: tmp });
const msg = `wiki: project reviewed wiki/ at ${srcCommit}` + (PRUNE ? ` (pruned: ${liveOnly.join(", ")})` : "");
sh(`git commit -m "${msg}"`, { cwd: tmp });
sh("git push", { cwd: tmp });
console.log(`\nPushed: ${inRepoOnly.length} new, ${differ.length} updated` + (PRUNE ? `, ${liveOnly.length} pruned` : "") + `. Live wiki now reflects ${srcCommit}.`);
