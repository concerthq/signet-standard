#!/usr/bin/env node
/**
 * check-dialect-equivalence.js — non-gating report for CP-Extension-Composition Part 2 (D5a).
 *
 * Runs tools/migrate-2020-12.js into a temporary directory and compares verdicts between the
 * Draft-07 schemas in schema/ and the migrated set over every JSON document under examples/,
 * conformance/fixtures/ and agent/. Reports differences; exits 0 until the v1.0 train, when the
 * report becomes a gate. A non-empty diff is the finding: almost always a $ref sibling that
 * Draft-07 silently ignored and 2020-12 enforces.
 *
 * Usage: node conformance/rules/check-dialect-equivalence.js . [--gate]
 * Requires ajv, ajv-formats (already dev dependencies).
 */
const fs = require("fs"), os = require("os"), path = require("path"), cp = require("child_process");
const root = path.resolve(process.argv[2] || "."); const gate = process.argv.includes("--gate");
const Ajv07 = require("ajv"), Ajv2020 = require("ajv/dist/2020"), addFormats = require("ajv-formats");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "signet-2020-12-"));
cp.execFileSync("node", [path.join(root, "tools", "migrate-2020-12.js"), path.join(root, "schema"), tmp], { stdio: "inherit" });

function build(Ctor, dir) {
  const ajv = new Ctor({ allErrors: true, strict: false, allowUnionTypes: true }); addFormats(ajv);
  const schemas = fs.readdirSync(dir).filter(f => f.endsWith(".schema.json")).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  for (const s of schemas) ajv.addSchema(s);
  return { ajv, rootForType: t => schemas.find(s => s.properties && s.properties.type && s.properties.type.const === t) };
}
const A = build(Ajv07, path.join(root, "schema")), B = build(Ajv2020, tmp);
const list = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? list(path.join(d, e.name)) : e.name.endsWith(".json") ? [path.join(d, e.name)] : []) : [];
const verdict = (env, doc) => { const r = env.rootForType(doc.type); if (!r) return null; const v = env.ajv.getSchema(r.$id); const ok = v(doc); return { ok, paths: ok ? [] : [...new Set(v.errors.map(e => e.instancePath + " " + e.keyword))].sort() }; };
let diffs = 0, checked = 0;
for (const dir of ["examples", "conformance/fixtures", "agent"].map(d => path.join(root, d))) for (const f of list(dir)) {
  let doc; try { doc = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; }
  const a = verdict(A, doc), b = verdict(B, doc); if (!a || !b) continue; checked++;
  if (JSON.stringify(a) !== JSON.stringify(b)) { diffs++; console.error(`DIFF ${path.relative(root, f)}\n  draft-07: ${JSON.stringify(a)}\n  2020-12 : ${JSON.stringify(b)}`); }
}
console.log(`dialect-equivalence: ${checked} document(s), ${diffs} verdict difference(s).${gate ? "" : " (report only; --gate to fail)"}`);
if (gate && diffs) process.exit(1);
