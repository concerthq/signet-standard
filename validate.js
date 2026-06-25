// Validates every example in /examples against the SIGNET schemas.
// Portable across ajv 8 (CI, via `npm install ajv`) and ajv 6 (fallback).
// Run: node validate.js   (or: npm run validate)
const fs = require("fs");
const path = require("path");

let Ajv, ajvMajor;
function tryRequire(p) { try { return require(p); } catch { return null; } }
let mod = tryRequire("ajv");
const fallback = "/home/claude/.npm-global/lib/node_modules/markdown-pdf/node_modules/ajv";
let usedFallback = false;
if (!mod) { mod = tryRequire(fallback); usedFallback = true; }
if (!mod) { console.error("Could not load ajv. Run: npm install ajv ajv-formats"); process.exit(2); }
Ajv = mod.default || mod;
try { ajvMajor = parseInt(require((usedFallback ? fallback : "ajv") + "/package.json").version, 10); }
catch { ajvMajor = 6; }

const opts = ajvMajor >= 8 ? { allErrors: true, strict: false } : { allErrors: true, schemaId: "auto" };
const ajv = new Ajv(opts);
if (ajvMajor >= 8) { const f = tryRequire("ajv-formats"); if (f) (f.default || f)(ajv); }

const schemaDir = path.join(__dirname, "schema");
const exampleDir = path.join(__dirname, "examples");

const byId = {};
for (const f of fs.readdirSync(schemaDir).filter(f => f.endsWith(".schema.json"))) {
  const s = JSON.parse(fs.readFileSync(path.join(schemaDir, f), "utf8"));
  ajv.addSchema(s, s.$id);
  byId[path.basename(f)] = s.$id;
}

const map = {
  "award-decision.json": "decision.schema.json",
  "sourcing-event.json": "sourcing-event.schema.json",
  "policy-evaluation.json": "policy.schema.json",
  "need.json": "need.schema.json",
  "contract.json": "contract.schema.json",
  "invoice.json": "invoice.schema.json",
  "onboarding-conditional.json": "onboarding-case.schema.json",
  "supplier-qualification-conditional.json": "supplier-qualification.schema.json",
  "obligation.discharged.fixture.json": "obligation.schema.json",
  "obligation.pending.fixture.json": "obligation.schema.json",
  "invoice.settles.fixture.json": "invoice.schema.json",
};

let failures = 0;
for (const [exFile, schemaFile] of Object.entries(map)) {
  const data = JSON.parse(fs.readFileSync(path.join(exampleDir, exFile), "utf8"));
  const validate = ajv.getSchema(byId[schemaFile]);
  if (!validate) { console.error(`x no schema loaded for ${schemaFile}`); failures++; continue; }
  if (validate(data)) {
    console.log(`PASS  ${exFile}  ->  ${schemaFile}`);
  } else {
    failures++;
    console.error(`FAIL  ${exFile}  ->  ${schemaFile}`);
    for (const e of validate.errors) console.error(`      ${(e.instancePath || e.dataPath || "(root)")} ${e.message}`);
  }
}

if (failures) { console.error(`\n${failures} example(s) failed validation.`); process.exit(1); }
console.log(`\nAll ${Object.keys(map).length} examples valid (ajv ${ajvMajor}).`);
