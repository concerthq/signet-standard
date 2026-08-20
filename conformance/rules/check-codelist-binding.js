#!/usr/bin/env node
/**
 * check-codelist-binding.js — closed codelists must be enforced, not merely cited.
 *
 * Defect: seven closed codelists were `"type": "string"` with a CSV named only in a
 * description, so `{"procedure": "banana"}` passed document conformance. A suite that
 * accepts invalid documents makes every conformance claim weaker than it states.
 *
 * Fix, per the derived-artefact rule: the CSV is the single record and the schema enum
 * is generated from it. This check asserts they agree.
 *
 * Usage: node conformance/rules/check-codelist-binding.js [repoRoot] [--write]
 *   --write regenerates the enums from the CSVs instead of only reporting.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : process.cwd();
const WRITE = process.argv.includes('--write');
const p = (...a) => path.join(ROOT, ...a);

const fail = [];
const fixed = [];

const bindings = JSON.parse(fs.readFileSync(p('codelists', 'bindings.json'), 'utf8'));

const codes = (file) => {
  const f = p('codelists', file);
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, 'utf8')
    .split(/\r?\n/).slice(1).filter(Boolean)
    .map((l) => l.split(',')[0].trim()).filter(Boolean);
};

// RFC 6901 JSON Pointer resolution.
const resolve = (doc, ptr) =>
  ptr.split('/').slice(1).reduce((n, t) => (n === undefined ? undefined : n[t.replace(/~1/g, '/').replace(/~0/g, '~')]), doc);

for (const b of bindings.closed) {
  if (!b.schema) continue;
  const want = codes(b.codelist);
  if (!want) { fail.push(`${b.codelist}: declared closed in bindings.json but not present in codelists/`); continue; }
  const file = p(b.schema);
  if (!fs.existsSync(file)) { fail.push(`${b.codelist}: ${b.schema} not found`); continue; }
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const node = resolve(doc, b.pointer);
  if (!node) { fail.push(`${b.codelist}: ${b.schema}${b.pointer} does not resolve`); continue; }

  if (!Array.isArray(node.enum)) {
    if (WRITE) { node.enum = want; fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n'); fixed.push(`${b.schema}${b.pointer} ← ${b.codelist} (${want.length} values)`); }
    else fail.push(`${b.codelist} is CLOSED but ${b.schema}${b.pointer} has no enum — any string validates`);
    continue;
  }
  const missing = want.filter((c) => !node.enum.includes(c));
  const extra = node.enum.filter((c) => !want.includes(c));
  if (missing.length || extra.length) {
    if (WRITE) { node.enum = want; fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n'); fixed.push(`${b.schema}${b.pointer} ← ${b.codelist}`); }
    else fail.push(`${b.codelist} ≠ ${b.schema}${b.pointer} — missing [${missing}] extra [${extra}]`);
  }
}

// A retired codelist must actually be gone. A file left behind after a deletion decision
// is the same defect the decision closed.
for (const r of bindings.retired || []) {
  if (fs.existsSync(p('codelists', r.codelist)))
    fail.push(`${r.codelist}: retired by ${r.defect} but still present in codelists/`);
}

if (WRITE) { console.log('\nRegenerated:'); fixed.forEach((f) => console.log('  ✎', f)); }
if (fail.length) {
  console.log('\nFailures:');
  fail.forEach((f) => console.log('  ✗', f));
  console.log(`\n${fail.length} failure(s).\n`);
  process.exit(1);
}
console.log('\nClosed codelists bound and enforced.\n');
process.exit(0);
