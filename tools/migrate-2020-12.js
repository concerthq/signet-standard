#!/usr/bin/env node
/**
 * migrate-2020-12.js — mechanical, reversible rewrite of the core schemas from Draft-07 to 2020-12.
 * Scheduled for the final pre-v1.0 release. Gated by dialect-equivalence.js. Do not land the output
 * before the gate passes and each known live implementer has confirmed 2020-12 validator support.
 *
 * Transformations (each reported):
 *  T1  "$schema" -> "https://json-schema.org/draft/2020-12/schema"
 *  T2  root "definitions" -> "$defs"; every "$ref" containing "#/definitions/" rewritten to "#/$defs/"
 *  T3  { allOf: [{ $ref }], <annotations> } -> { $ref, <annotations> }   (the v0.2.0 workaround, no longer needed)
 *      Annotation keys: title, description, examples, $comment, default, deprecated, readOnly, writeOnly.
 *  T4  "format" is annotation-only under 2020-12 unless the format-assertion vocabulary is enabled.
 *      Nothing is rewritten; the report lists every "format" so the AJV configuration can be checked
 *      (ajv-formats + strict mode reproduces Draft-07 behaviour).
 *  Not touched: "$id" (version-stable URIs are a governance matter, not a dialect one), "items" in
 *  object form (unchanged semantics), "patternProperties", "additionalProperties".
 *
 * Usage: node scripts/migrate-2020-12.js <srcDir> <outDir>
 */
const fs = require("fs"), path = require("path");
const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error("usage: migrate-2020-12.js <srcDir> <outDir>"); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const ANNOT = new Set(["title", "description", "examples", "$comment", "default", "deprecated", "readOnly", "writeOnly"]);
const report = { T1: 0, T2: 0, T3: 0, T4: [] };

function rewriteRef(s) { const r = s.replace(/#\/definitions\//g, "#/$defs/"); if (r !== s) report.T2++; return r; }

function walk(node, p) {
  if (Array.isArray(node)) return node.map((v, i) => walk(v, `${p}/${i}`));
  if (!node || typeof node !== "object") return node;
  const outNode = {};
  const keys = Object.keys(node);
  // T3: single-$ref allOf with only annotation siblings
  if (Array.isArray(node.allOf) && node.allOf.length === 1 && Object.keys(node.allOf[0]).length === 1 && node.allOf[0].$ref
      && keys.every(k => k === "allOf" || ANNOT.has(k))) {
    report.T3++;
    outNode.$ref = rewriteRef(node.allOf[0].$ref);
    for (const k of keys) if (k !== "allOf") outNode[k] = node[k];
    return outNode;
  }
  for (const k of keys) {
    const v = node[k];
    if (k === "$schema" && p === "") { outNode[k] = "https://json-schema.org/draft/2020-12/schema"; report.T1++; }
    else if (k === "definitions" && p === "") outNode.$defs = walk(v, `${p}/$defs`);
    else if (k === "$ref" && typeof v === "string") outNode[k] = rewriteRef(v);
    else if (k === "format" && typeof v === "string") { report.T4.push(`${p}: ${v}`); outNode[k] = v; }
    else outNode[k] = walk(v, `${p}/${k}`);
  }
  return outNode;
}

for (const f of fs.readdirSync(src)) {
  if (!f.endsWith(".schema.json")) continue;
  const doc = JSON.parse(fs.readFileSync(path.join(src, f), "utf8"));
  fs.writeFileSync(path.join(out, f), JSON.stringify(walk(doc, ""), null, 2) + "\n");
}
console.log(`T1 $schema rewritten: ${report.T1}\nT2 $ref rewritten: ${report.T2}\nT3 allOf unwrapped: ${report.T3}\nT4 format keywords (verify assertion config): ${report.T4.length}`);
for (const l of report.T4) console.log("   " + l);
