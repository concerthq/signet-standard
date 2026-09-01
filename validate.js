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
  "auction-reverse.json": "auction.schema.json",
  "bid-reverse.json": "bid.schema.json",
  "approval.json": "approval.schema.json",
  "commodity-risk/coverage-policy.json": "coverage-policy.schema.json",
  "commodity-risk/position-hedged.json": "exposure-position.schema.json",
  "commodity-risk/position-floating.json": "exposure-position.schema.json",
  "commodity-risk/position-mtm.json": "exposure-position.schema.json",
  "commodity-risk/position-tranche.json": "exposure-position.schema.json",
  "commodity-risk/position-floating-t2.json": "exposure-position.schema.json",
  "commodity-risk/price-mark.json": "price-mark.schema.json",
  "commodity-risk/assessment-below.json": "coverage-assessment.schema.json",
  "commodity-risk/assessment-within.json": "coverage-assessment.schema.json",
  "commodity-risk/scenario.json": "scenario.schema.json",
  "commodity-risk/hedge-proposal.json": "hedge-proposal.schema.json",
};

// ---------------------------------------------------------------- coverage
// The map above is the explicit record for examples/. It is not the whole tree: CDM
// instances also ship under agent/, auction/, onboarding/ and conformance/fixtures/, and
// until D-54 nothing validated them — an instance added outside the map literal was checked
// by no schema, silently, on a green run. D-55 is one that got through.
//
// So coverage is discovered, not asserted: every instance under these roots must resolve to
// a schema or the run fails. Routing is by `type` against schema `title`, except where the
// map above binds a file explicitly — a subtype needs that, because commodity-risk/
// coverage-policy.json declares type "Policy" and validates as CoveragePolicy (D-48).
const DISCOVER_ROOTS = ["examples", "agent", "auction", "onboarding", "conformance/fixtures"];

// Not every instance is a root object. These files carry arrays of foundation-layer
// definitions, which have no `type` property to route on, so the binding is declared.
// documents.json is the Document.accessGrant pair that endorsement check E-CNS-4 turns on.
const DEFINITION_BINDINGS = [
  { path: "conformance/fixtures/endorsement/documents.json", key: "documents", definition: "Document" },
  { path: "onboarding/presented-credentials.json", key: "credentials", definition: "Credential" },
];

// Files under the discovery roots that are not CDM instances at all. Listed with a reason
// rather than skipped by pattern, so the exclusion is auditable — the same posture the
// naming check takes with verbatim[]. Anything not here and not bound fails the run.
const NOT_CDM = [
  { path: "agent/agent-card.json", reason: "An A2A agent card — the contents of SyntheticAgent.agentCard, not a CDM root object." },
  { path: "onboarding/agent-card.json", reason: "As above." },
  { path: "agent/assessment-inputs.json", reason: "Scoring inputs keyed by submission id; a harness fixture, not a CDM object." },
  { path: "auction/bidders.json", reason: "Bidder roster for the auction harness. Carries Identifiers, is not itself an instance." },
];
const excluded = new Set(NOT_CDM.map((e) => e.path));
const defBound = new Set(DEFINITION_BINDINGS.map((e) => e.path));

// Fixtures named in the document-conformance suite are skipped here. They carry an expected
// outcome (positive / negative / reservedPrefixNegative) that this runner cannot infer, and
// run-conformance.js already exercises them against a declared schema. Six of them are meant
// to fail validation; validating them here would report intended failures as defects.
const suite = JSON.parse(fs.readFileSync(path.join(__dirname, "conformance/suite/document-conformance.json"), "utf8"));
const declared = new Set(
  [...(suite.positive || []), ...(suite.negative || []), ...(suite.reservedPrefixNegative || [])].map((c) => c.file)
);

const byTitle = {};
for (const f of fs.readdirSync(schemaDir).filter((f) => f.endsWith(".schema.json"))) {
  const s = JSON.parse(fs.readFileSync(path.join(schemaDir, f), "utf8"));
  if (s.title) byTitle[s.title] = f;
}

const rel = (abs) => path.relative(__dirname, abs).split(path.sep).join("/");
const mapped = new Set(Object.keys(map).map((k) => "examples/" + k));

// A file whose root carries a recognised `type` is one instance. A file that does not is a
// container: recurse for typed objects, so the Event stream fixtures are covered too.
function collect(node, label, out) {
  if (Array.isArray(node)) { node.forEach((v, i) => collect(v, `${label}/${i}`, out)); return; }
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string" && byTitle[node.type]) { out.push({ label, data: node, schemaFile: byTitle[node.type] }); return; }
  for (const [k, v] of Object.entries(node)) collect(v, `${label}/${k}`, out);
}

const discovered = [];
const unbound = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) { if (!["node_modules", "output"].includes(e.name) && !e.name.startsWith(".")) walk(abs); continue; }
    if (!e.name.endsWith(".json")) continue;
    const r = rel(abs);
    if (mapped.has(r) || declared.has(r) || excluded.has(r) || defBound.has(r)) continue;
    let data;
    try { data = JSON.parse(fs.readFileSync(abs, "utf8")); } catch { unbound.push(`${r} — not parseable as JSON`); continue; }
    const found = [];
    collect(data, r, found);
    if (found.length) discovered.push(...found);
    else unbound.push(`${r} — no object carrying a \`type\` that names a schema`);
  }
}
for (const d of DISCOVER_ROOTS) walk(path.join(__dirname, d));

// Declared definition bindings, resolved against definitions.schema.json.
const DEFS = "https://concert.foundation/signet/v0.1/definitions.schema.json";
for (const b of DEFINITION_BINDINGS) {
  const abs = path.join(__dirname, b.path);
  if (!fs.existsSync(abs)) { unbound.push(`${b.path} — declared in DEFINITION_BINDINGS but absent`); continue; }
  const data = JSON.parse(fs.readFileSync(abs, "utf8"));
  const items = data[b.key];
  if (!Array.isArray(items)) { unbound.push(`${b.path} — no array at "${b.key}"`); continue; }
  items.forEach((it, i) => discovered.push({
    label: `${b.path}/${b.key}/${i}`, data: it, schemaRef: `${DEFS}#/definitions/${b.definition}`,
    schemaFile: `definitions.schema.json#${b.definition}`,
  }));
}

// ---------------------------------------------------------------- run
const checks = [
  ...Object.entries(map).map(([exFile, schemaFile]) => ({
    label: "examples/" + exFile, schemaFile, source: "map",
    data: JSON.parse(fs.readFileSync(path.join(exampleDir, exFile), "utf8")),
  })),
  ...discovered.map((d) => ({ ...d, source: "discovered" })),
];

let failures = 0;
for (const c of checks) {
  const validate = ajv.getSchema(c.schemaRef || byId[c.schemaFile]);
  if (!validate) { console.error(`x no schema loaded for ${c.schemaFile}`); failures++; continue; }
  const tag = c.source === "discovered" ? "  ·" : "   ";
  if (validate(c.data)) {
    console.log(`PASS${tag} ${c.label}  ->  ${c.schemaFile}`);
  } else {
    failures++;
    console.error(`FAIL${tag} ${c.label}  ->  ${c.schemaFile}`);
    for (const e of validate.errors) console.error(`      ${(e.instancePath || e.dataPath || "(root)")} ${e.message}`);
  }
}

if (unbound.length) {
  console.error(`
Unbound instances — no schema could be resolved. Bind each in validate.js's map,`);
  console.error(`or declare it in conformance/suite/document-conformance.json with an expected outcome:`);
  for (const u of unbound) console.error(`  x ${u}`);
}

if (failures || unbound.length) {
  console.error(`
${failures} invalid, ${unbound.length} unbound.`);
  process.exit(1);
}
const disc = checks.filter((c) => c.source === "discovered").length;
console.log(`
All ${checks.length} instances valid (ajv ${ajvMajor}): ${checks.length - disc} mapped, ${disc} discovered.`);
for (const e of NOT_CDM) console.log(`  · not a CDM instance: ${e.path} — ${e.reason}`);
console.log(`${declared.size} fixture(s) skipped — declared with an expected outcome in the document-conformance suite.`);
