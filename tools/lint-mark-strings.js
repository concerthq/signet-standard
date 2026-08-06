#!/usr/bin/env node
/*
 * lint-mark-strings.js — the mark grammar, checked mechanically.
 *
 * Usage: node tools/lint-mark-strings.js [--quiet]
 *
 * The ABNF in governance/mark-grammar.md §4 was written to be CI-checkable. This is the
 * checker. It exists because a grammar nothing enforces decays into whatever people type,
 * and the mark's value is entirely in its qualification: an unqualified mark is a claim
 * about something else.
 *
 * Rules:
 *   L1  every worked form in the grammar parses            (the doc's own examples are linted)
 *   L2  known-bad strings are rejected, for the right reason
 *   L3  endorsements and roles named in a mark are in the closed registers
 *   L4  endorsements appear in register order, never alphabetical
 *   L5  no superseded mark form survives in published copy (the em-dash form)
 *   L6  no prohibited construction appears in published copy
 *   L7  every canonical mark string is ASCII
 *
 * Exit 0 = pass.
 * Licensed Apache-2.0 by Concert Foundation.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GRAMMAR = path.join(ROOT, "governance", "mark-grammar.md");
const quiet = process.argv.includes("--quiet");

const results = [];
const rule = (n, name, ok, detail) => results.push({ n, name, ok, detail: detail || "" });

// --- the closed registers -------------------------------------------------
// Register ORDER is load-bearing: the mark grammar requires endorsements to render in
// register order, so that a given set of endorsements renders identically as the register
// grows. Reading the order from the register file rather than hard-coding it is the point.
function readRegister(file, headingRe) {
  const md = fs.readFileSync(path.join(ROOT, "governance", file), "utf8");
  const names = [];
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(headingRe);
    if (m && !names.includes(m[1].trim())) names.push(m[1].trim());
  }
  return names;
}

const ENDORSEMENTS = readRegister("endorsement-register.md", /^###\s+E\d+\s+—\s+(.+)$/);
const ROLES = readRegister("role-register.md", /^\|\s*R\d+\s*\|\s*\*\*(.+?)\*\*\s*\|/);

// --- the grammar, as code -------------------------------------------------
const VERSION = String.raw`\d+\.\d+(?:\.\d+)?`;
const IMPL = new RegExp(
  `^SIGNET Certified: (Core|Full)` +
  `(?:; ([A-Za-z ]+(?:, [A-Za-z ]+)*))?` +
  ` \\(CDM v(${VERSION}), suite v(${VERSION})\\)$`
);
const PERSON = new RegExp(`^SIGNET Registered: ([A-Za-z ]+) \\(CDM v(${VERSION})\\)$`);
const PROVIDER = new RegExp(`^SIGNET Accredited Training Provider \\(syllabus v(${VERSION})\\)$`);

function parseMark(s) {
  if (!/^[\x20-\x7E]*$/.test(s)) return { ok: false, why: "not ASCII — mark strings travel through CSV exports and procurement systems" };

  let m = s.match(IMPL);
  if (m) {
    const endorsements = m[2] ? m[2].split(", ") : [];
    const unknown = endorsements.filter((e) => !ENDORSEMENTS.includes(e));
    if (unknown.length) return { ok: false, why: `not in the endorsement register: ${unknown.join(", ")}` };
    const order = endorsements.map((e) => ENDORSEMENTS.indexOf(e));
    if (order.some((v, i) => i > 0 && v <= order[i - 1])) return { ok: false, why: "endorsements are not in register order" };
    return { ok: true, kind: "implementation", level: m[1], endorsements };
  }

  m = s.match(PERSON);
  if (m) {
    if (!ROLES.includes(m[1])) return { ok: false, why: `not in the role register: ${m[1]}` };
    return { ok: true, kind: "person", role: m[1] };
  }

  if (PROVIDER.test(s)) return { ok: true, kind: "provider" };

  const afterColon = (s.match(/^SIGNET Certified: ([A-Za-z ]+?)(?: \(|$)/) || [])[1];
  if (afterColon && ENDORSEMENTS.includes(afterColon)) {
    return { ok: false, why: "an endorsement may not appear without a level — it implies a level that was not stated" };
  }
  if (/^SIGNET Certified\b/.test(s)) return { ok: false, why: "not a canonical implementation mark: expected 'SIGNET Certified: <Core|Full>[; <endorsements>] (CDM vX.Y, suite vX.Y)'" };
  if (/^SIGNET Registered\b/.test(s)) return { ok: false, why: "not a canonical person mark: expected 'SIGNET Registered: <Role> (CDM vX.Y)'" };
  return { ok: false, why: "does not match any production in the grammar" };
}

// --- L1: the grammar's own worked forms -----------------------------------
const grammarMd = fs.readFileSync(GRAMMAR, "utf8");
const worked = (grammarMd.match(/### Worked forms\s*```([\s\S]*?)```/) || [, ""])[1]
  .split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

if (!worked.length) rule("L1", "worked forms found in the grammar", false, "§4 Worked forms block is missing or empty");
else {
  const bad = worked.map((s) => ({ s, r: parseMark(s) })).filter((x) => !x.r.ok);
  rule("L1", "every worked form in the grammar parses", bad.length === 0,
    bad.length ? bad.map((b) => `"${b.s}" — ${b.r.why}`).join("; ") : `${worked.length} forms`);
}

// --- L2 / L3 / L4 / L7: known-bad strings must be rejected, for the right reason ---
const NEGATIVES = [
  ["SIGNET Certified: Mandate Enforcement (CDM v0.1, suite v0.1)", /without a level/],
  ["SIGNET Certified: Full", /not a canonical implementation mark/],
  ["SIGNET Certified — Full (CDM v0.1, suite v0.1)", /not ASCII|not a canonical/],
  ["SIGNET Certified: Full (CDM v0.1)", /not a canonical implementation mark/],
  ["SIGNET Certified: Gold (CDM v0.1, suite v0.1)", /not a canonical implementation mark/],
  ["SIGNET Certified: Full; Data Sovereignty (CDM v0.1, suite v0.1)", /not in the endorsement register/],
  ["SIGNET Certified: Core; Consent Enforcement, Mandate Enforcement (CDM v0.1, suite v0.1)", /register order/],
  ["SIGNET Registered: Assurance Reviewer (CDM v0.1)", /not in the role register/],
  ["SIGNET Registered: Foundations (CDM v0.1)", /not in the role register/],
  ["SIGNET Certified: Full (CDM v0.1, suite v0.1)—", /not ASCII|does not match/],
];
{
  const wrong = NEGATIVES
    .map(([s, why]) => ({ s, r: parseMark(s), why }))
    .filter((x) => x.r.ok || !x.why.test(x.r.why));
  rule("L2", "known-bad strings are rejected for the right reason", wrong.length === 0,
    wrong.length ? wrong.map((w) => `"${w.s}" — got: ${w.r.ok ? "ACCEPTED" : w.r.why}`).join("; ") : `${NEGATIVES.length} cases`);
}
{
  // Positive coverage for the registers, so a register edit that breaks a live mark is caught.
  const positives = [
    ...ENDORSEMENTS.map((e) => `SIGNET Certified: Full; ${e} (CDM v0.1, suite v0.1)`),
    `SIGNET Certified: Core; ${ENDORSEMENTS.join(", ")} (CDM v0.1, suite v0.1)`,
    ...ROLES.map((r) => `SIGNET Registered: ${r} (CDM v0.1)`),
    "SIGNET Accredited Training Provider (syllabus v0.1)",
  ];
  const bad = positives.map((s) => ({ s, r: parseMark(s) })).filter((x) => !x.r.ok);
  rule("L3", "every register entry renders a parseable mark", bad.length === 0,
    bad.length ? bad.map((b) => `"${b.s}" — ${b.r.why}`).join("; ") : `${ENDORSEMENTS.length} endorsements, ${ROLES.length} roles`);
  rule("L4", "endorsement register order is read from the register", ENDORSEMENTS.length > 0,
    ENDORSEMENTS.length ? ENDORSEMENTS.join(" → ") : "no endorsements parsed from the register");
}

// --- L5 / L6: published copy ----------------------------------------------
// The grammar itself is excluded: it quotes the superseded form and enumerates the
// prohibited constructions in order to prohibit them.
const SKIP_DIRS = new Set(["node_modules", ".git", "_site", "handoffs", "reports", ".playwright-mcp"]);
const EXEMPT = new Set([path.join("governance", "mark-grammar.md")]);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".github") continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (entry.name.endsWith(".md")) acc.push(p);
  }
  return acc;
}

const copy = walk(ROOT).filter((p) => !EXEMPT.has(path.relative(ROOT, p)));

const SUPERSEDED = /SIGNET Certified\s*[—–-]\s*(Core|Full)/g;
const PROHIBITED = /\b(SIGNET (?:Compliant|Ready|Enabled|Powered|Native|Approved|Endorsed|Partner)|Concert Certified|Certified by SIGNET)\b/g;

// A line may opt out with an explicit marker on the preceding line, for copy that names a
// prohibited construction in order to prohibit it. The marker is deliberately verbose and
// deliberately per-line: an exemption should be a visible decision in the diff, not a
// directory anyone can quietly widen.
// Trailing text after the token is allowed and encouraged — it is where the reason goes.
const OPT_OUT = /<!--\s*mark-lint-ignore-next-line\b[^>]*-->/;

function scan(re) {
  const hits = [];
  for (const p of copy) {
    const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (i > 0 && OPT_OUT.test(lines[i - 1])) return;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line))) hits.push(`${path.relative(ROOT, p)}:${i + 1} "${m[0]}"`);
    });
  }
  return hits;
}

{
  const hits = scan(SUPERSEDED);
  rule("L5", "no superseded mark form in published copy", hits.length === 0,
    hits.length ? hits.slice(0, 8).join("; ") + (hits.length > 8 ? ` (+${hits.length - 8} more)` : "") : `${copy.length} files`);
}
{
  const hits = scan(PROHIBITED);
  rule("L6", "no prohibited construction in published copy", hits.length === 0,
    hits.length ? hits.slice(0, 8).join("; ") + (hits.length > 8 ? ` (+${hits.length - 8} more)` : "") : `${copy.length} files`);
}
{
  const nonAscii = worked.filter((s) => !/^[\x20-\x7E]*$/.test(s));
  rule("L7", "canonical mark strings are ASCII", nonAscii.length === 0, nonAscii.join("; ") || "");
}

// ---------------------------------------------------------------------------
let all = true;
console.log("\nSIGNET mark grammar linter — governance/mark-grammar.md §4");
console.log("─".repeat(72));
for (const r of results) {
  all = all && r.ok;
  if (!quiet || !r.ok) console.log(` [${r.ok ? "OK" : "XX"}] ${r.n} ${r.name}  (${r.detail})`);
}
console.log("─".repeat(72));
console.log(all ? "ALL RULES PASS\n" : "RULE FAILURES\n");
process.exit(all ? 0 : 1);
