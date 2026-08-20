#!/usr/bin/env node
/**
 * check-public-interface.js — every path declared in public-interface.json must exist.
 *
 * The manifest is the answer to an unfalsifiable claim. IAR-0003 said
 * codelists/submissionStatus.csv had no consumer; two consumers existed in concert-website
 * and neither was recorded in this repository, so the statement could not be tested from
 * inside it. Deleting the file returned HTTP 404 on a published $id URL. (D-24, D-27)
 *
 * A manifest nothing checks is a second unfalsifiable claim, so this runs in CI.
 *
 * The two groups fail differently, deliberately:
 *   published — a resolvable URL has stopped answering. Someone else's fetch breaks.
 *   consumed  — the site build breaks. Nothing published stops resolving.
 *
 * Usage: node conformance/rules/check-public-interface.js [repoRoot]
 */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || ".";
const manifestPath = path.join(root, "public-interface.json");

if (!fs.existsSync(manifestPath)) {
  console.error("public-interface.json is absent. The public interface is undeclared.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const entries = manifest.entries || [];

if (entries.length === 0) {
  console.error("public-interface.json declares no entries.");
  process.exit(1);
}

const GROUPS = ["published", "consumed"];
const missing = { published: [], consumed: [] };
const totals = { published: 0, consumed: 0 };
const structural = [];

for (const [i, e] of entries.entries()) {
  if (!e.path || !e.group || !e.consumer) {
    structural.push(`entry ${i} is missing path, group or consumer`);
    continue;
  }
  if (!GROUPS.includes(e.group)) {
    structural.push(`entry ${i} (${e.path}) declares unknown group "${e.group}"`);
    continue;
  }
  totals[e.group] += 1;
  if (!fs.existsSync(path.join(root, e.path))) missing[e.group].push(e);
}

console.log("");
console.log("SIGNET public interface");
console.log("");
console.log(`  published  ${totals.published}  — served at ${manifest.idBase}/`);
console.log(`  consumed   ${totals.consumed}  — fetched by the site build, not published`);
console.log(`  declared   ${totals.published + totals.consumed}`);
console.log("");

if (structural.length > 0) {
  for (const s of structural) console.error(`  ! ${s}`);
  console.error("");
  process.exit(1);
}

let failed = false;

if (missing.published.length > 0) {
  failed = true;
  console.error(
    `  ✗ ${missing.published.length} PUBLISHED path(s) absent. A resolvable URL has stopped ` +
    `answering: each of these is served at ${manifest.idBase}/ and now returns 404 to a consumer ` +
    `outside this repository. Retirement says nothing is maintained here; it does not say the URL ` +
    `may stop answering.`,
  );
  for (const e of missing.published) console.error(`      · ${e.path} — ${e.consumer}`);
  console.error("");
}

if (missing.consumed.length > 0) {
  failed = true;
  console.error(
    `  ✗ ${missing.consumed.length} CONSUMED path(s) absent. Nothing published stops resolving, ` +
    `but the site build fetches each of these and will fail cold.`,
  );
  for (const e of missing.consumed) console.error(`      · ${e.path} — ${e.consumer}`);
  console.error("");
}

if (failed) process.exit(1);

console.log("Pass. Every declared path exists.");
console.log("");
