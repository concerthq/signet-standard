// Shared conformance primitives used by the runner and reference adapter.
// Offline; uses the vendored ajv (Draft-07) fallback in this environment,
// or npm-installed ajv in CI.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..", "..");          // repo root
const SCHEMA_DIR = path.join(ROOT, "schema");

function tryRequire(p) { try { return require(p); } catch { return null; } }

function loadAjv() {
  let mod = tryRequire("ajv");
  const fallback = "/home/claude/.npm-global/lib/node_modules/markdown-pdf/node_modules/ajv";
  let usedFallback = false;
  if (!mod) { mod = tryRequire(fallback); usedFallback = true; }
  if (!mod) throw new Error("ajv not found; run npm install ajv ajv-formats");
  const Ajv = mod.default || mod;
  let major = 6;
  try { major = parseInt(require((usedFallback ? fallback : "ajv") + "/package.json").version, 10); } catch {}
  const ajv = new Ajv(major >= 8 ? { allErrors: true, strict: false } : { allErrors: true, schemaId: "auto" });
  if (major >= 8) { const f = tryRequire("ajv-formats"); if (f) (f.default || f)(ajv); }
  return ajv;
}

// Load all schemas into one ajv instance; return { ajv, byFile } where byFile
// maps "invoice.schema.json" -> $id.
function loadSchemas() {
  const ajv = loadAjv();
  const byFile = {};
  for (const f of fs.readdirSync(SCHEMA_DIR).filter(f => f.endsWith(".schema.json"))) {
    const s = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, f), "utf8"));
    ajv.addSchema(s, s.$id);
    byFile[f] = s.$id;
  }
  return { ajv, byFile };
}

function validateDoc(ajv, byFile, schemaFile, doc) {
  const v = ajv.getSchema(byFile[schemaFile]);
  if (!v) return { ok: false, errors: [`no schema ${schemaFile}`] };
  const ok = v(doc);
  return { ok, errors: ok ? [] : (v.errors || []).map(e => `${e.instancePath || e.dataPath || "(root)"} ${e.message}`) };
}

// Deterministic JSON (sorted keys) so hashes are reproducible (CN-4).
function stableStringify(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stableStringify).join(",") + "]";
  return "{" + Object.keys(obj).sort().map(k => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}

// Canonical hash of an event (covers its full content, including its back-pointer).
function eventHash(event) {
  return "sha256:" + crypto.createHash("sha256").update(stableStringify(event)).digest("hex");
}

// Verify an ordered event stream is an unbroken hash chain.
// Returns { ok, brokenAt }. The first event must have no previousEventHash;
// each subsequent event's previousEventHash must equal hash(previous event).
function verifyChain(events) {
  for (let i = 0; i < events.length; i++) {
    if (i === 0) {
      if (events[0].previousEventHash) return { ok: false, brokenAt: 0 };
    } else {
      if (events[i].previousEventHash !== eventHash(events[i - 1])) return { ok: false, brokenAt: i };
    }
  }
  return { ok: true, brokenAt: -1 };
}

module.exports = { ROOT, loadSchemas, validateDoc, stableStringify, eventHash, verifyChain };
