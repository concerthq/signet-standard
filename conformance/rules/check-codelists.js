#!/usr/bin/env node
/* check-codelists.js — codelist governance rules.
 *
 * The `eventType` codelist is split in two (CP-Grant-lifecycle §3):
 *   codelists/eventType.csv       OPEN     — extension space; values may be added by PR,
 *                                            and nothing fixes the meaning of any of them.
 *   codelists/eventTypeCore.csv   CLOSED   — normative; meanings are fixed and MUST NOT be
 *                                            redefined, reused, or narrowed. Append-only,
 *                                            and admission is a Standards Committee act.
 *
 * Closure that depends on someone noticing is not closure, so the boundary is enforced here
 * rather than by review. Consumers take the UNION of the two files.
 *
 * Rules:
 *   K1  a code appears in exactly one file (the intersection is empty)
 *   K2  every codelist has the canonical `Code,Title,Description` header
 *   K3  no codelist has duplicate codes within itself
 *   K4  the core subset is append-only against the recorded baseline below
 *
 * Exit 0 = pass.
 * Licensed Apache-2.0 by Concert Foundation.
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "..", "codelists");

// K4 baseline — the core subset as admitted by CP-Grant-lifecycle §3. Removing or renaming an
// entry here is a MAJOR version change and is effectively forbidden; adding one is a minor
// version and a committee act. Update this list only alongside the corresponding decision.
const CORE_BASELINE = [
  "consent.granted",
  "consent.revoked",
  "mandate.granted",
  "mandate.revoked",
];

const results = [];
const rule = (n, name, ok, detail) => results.push({ n, name, ok, detail: detail || "" });

function readCodes(file) {
  const lines = fs.readFileSync(path.join(DIR, file), "utf8").split(/\r?\n/).filter(Boolean);
  return { header: lines[0], codes: lines.slice(1).map((l) => l.split(",")[0]) };
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".csv")).sort();

// K2 + K3 — every codelist, not just the eventType pair. Reported in aggregate so a clean run
// is one line per rule and a failing run names the offending files.
const badHeader = [], withDupes = [];
for (const f of files) {
  const { header, codes } = readCodes(f);
  if (!header.startsWith("Code,Title,Description")) badHeader.push(f);
  const dupes = [...new Set(codes.filter((c, i) => codes.indexOf(c) !== i))];
  if (dupes.length) withDupes.push(`${f} (${dupes.join(", ")})`);
}
rule("K2", "canonical header", badHeader.length === 0, badHeader.length ? badHeader.join(", ") : `${files.length} codelists`);
rule("K3", "no duplicate codes within a file", withDupes.length === 0, withDupes.length ? withDupes.join("; ") : `${files.length} codelists`);

// K1 — the sync rule. This is the one that makes the closed subset actually closed.
const open = readCodes("eventType.csv").codes;
const core = readCodes("eventTypeCore.csv").codes;
const intersection = open.filter((c) => core.includes(c));
rule("K1", "eventType open/core intersection is empty", intersection.length === 0,
  intersection.length ? `also in core: ${intersection.join(", ")}` : `${open.length} open + ${core.length} core`);

// K4 — append-only. A code may be added to the core subset; none may leave it.
const dropped = CORE_BASELINE.filter((c) => !core.includes(c));
rule("K4", "core subset is append-only", dropped.length === 0,
  dropped.length ? `removed from core: ${dropped.join(", ")}` : `${core.length} core entries`);

let all = true;
console.log("Codelist governance rules — " + path.relative(process.cwd(), DIR));
for (const r of results) { all = all && r.ok; console.log(` [${r.ok ? "OK" : "XX"}] ${r.n} ${r.name}  (${r.detail})`); }
console.log(all ? "ALL RULES PASS" : "RULE FAILURES");
process.exit(all ? 0 : 1);
