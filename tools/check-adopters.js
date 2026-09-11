#!/usr/bin/env node
/**
 * check-adopters.js — the adopter register is a list of statements of practice, and nothing else.
 *
 * registry/adopters.json records organisations that declare they accept SIGNET documents, emit
 * them, or use the CDM internally. It is a fourth status beside modelled / tested / certified and
 * must never be read as any of them. The schema forbids claim fields; this checker holds the rules
 * the schema cannot express, and rule 6 re-asserts the claim ban in case the schema is loosened.
 *
 *   1  every entry validates against registry/adopter-entry.schema.json
 *   2  organisation and domain are each unique across the register (case-insensitive)
 *   3  declaredOn is not after the reference date, and the register is sorted by declaredOn
 *   4  cdmVersion equals the published CDM namespace version (from the definitions schema $id)
 *   5  founding: true only within the founding window (registry/founding-window.json, IAR-0007)
 *   6  no key or string value anywhere in the file matches /certif|conform|compliant/i
 *
 * The reference date for rule 3 is the date of the commit the register is checked at, so a
 * re-run on an old commit gives the old verdict. An uncommitted register is checked against
 * today (UTC), so an entry can be tested before it is committed.
 *
 * Usage: node tools/check-adopters.js [repoRoot]
 *   ADOPTERS_PATH=<file> checks that file instead of registry/adopters.json (negative fixtures).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const registerPath = path.resolve(process.env.ADOPTERS_PATH || path.join(root, "registry", "adopters.json"));
const schemaPath = path.join(root, "registry", "adopter-entry.schema.json");
const windowPath = path.join(root, "registry", "founding-window.json");
const definitionsPath = path.join(root, "schema", "definitions.schema.json");

const CLAIM = /certif|conform|compliant/i;
const failures = [];
const fail = (rule, where, msg) => failures.push(`  ✗ rule ${rule} · ${where} — ${msg}`);

let Ajv, addFormats;
try {
  Ajv = require("ajv");
  addFormats = require("ajv-formats");
} catch {
  console.error("Could not load ajv / ajv-formats. Run: npm install ajv ajv-formats");
  process.exit(2);
}

let register;
try {
  register = JSON.parse(fs.readFileSync(registerPath, "utf8"));
} catch (e) {
  console.error(`${path.relative(root, registerPath) || registerPath}: not readable as JSON — ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(register)) {
  console.error(`${path.relative(root, registerPath)}: the register must be a JSON array.`);
  process.exit(1);
}

// Reference date: commit date when the register file is committed and clean, else today (UTC).
function referenceDate() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const rel = path.relative(root, registerPath);
    if (rel.startsWith("..") || path.isAbsolute(rel)) return { date: today, basis: "today (file outside the tree)" };
    const git = (args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const tracked = git(["ls-files", "--", rel]) !== "";
    const dirty = git(["status", "--porcelain", "--", rel]) !== "";
    if (!tracked || dirty) return { date: today, basis: "today (register uncommitted)" };
    const iso = git(["log", "-1", "--format=%cI"]);
    return { date: new Date(iso).toISOString().slice(0, 10), basis: "HEAD commit date" };
  } catch {
    return { date: today, basis: "today (git unavailable)" };
  }
}

// Rule 4 source: the namespace segment of the published definitions schema $id. Never a literal.
function publishedCdmVersion() {
  const id = JSON.parse(fs.readFileSync(definitionsPath, "utf8")).$id || "";
  const m = id.match(/\/signet\/(v\d+\.\d+)\//);
  if (!m) {
    console.error(`schema/definitions.schema.json $id carries no /signet/vN.N/ segment: "${id}"`);
    process.exit(2);
  }
  return m[1];
}

// Rule 5 source. Absent or malformed means OG-1 is unresolved, and any founding key fails.
function foundingWindow() {
  if (!fs.existsSync(windowPath)) return null;
  const w = JSON.parse(fs.readFileSync(windowPath, "utf8"));
  if (typeof w.closesAt !== "string" || Number.isNaN(Date.parse(w.closesAt))) return null;
  return {
    closesOn: new Date(w.closesAt).toISOString().slice(0, 10),
    constitutedOn: typeof w.constitutedOn === "string" ? w.constitutedOn : null,
  };
}

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(fs.readFileSync(schemaPath, "utf8")));
const cdmVersion = publishedCdmVersion();
const window = foundingWindow();
const ref = referenceDate();

const seenOrg = new Map();
const seenDomain = new Map();
let prevDate = null;

for (const [i, e] of register.entries()) {
  const where = `entry ${i}${e && e.organisation ? ` (${e.organisation})` : ""}`;

  // 1
  if (!validate(e)) {
    for (const err of validate.errors) fail(1, where, `${err.instancePath || "/"} ${err.message}${err.params && err.params.additionalProperty ? `: "${err.params.additionalProperty}"` : ""}`);
  }
  if (!e || typeof e !== "object") continue;

  // 2
  for (const [field, seen] of [["organisation", seenOrg], ["domain", seenDomain]]) {
    if (typeof e[field] !== "string") continue;
    const k = e[field].toLowerCase();
    if (seen.has(k)) fail(2, where, `${field} "${e[field]}" duplicates entry ${seen.get(k)}`);
    else seen.set(k, i);
  }

  // 3
  if (typeof e.declaredOn === "string") {
    if (e.declaredOn > ref.date) fail(3, where, `declaredOn ${e.declaredOn} is after the reference date ${ref.date} (${ref.basis})`);
    if (prevDate && e.declaredOn < prevDate) fail(3, where, `declaredOn ${e.declaredOn} precedes the entry before it (${prevDate}); the register is sorted ascending`);
    prevDate = e.declaredOn;
  }

  // 4
  if (typeof e.cdmVersion === "string" && e.cdmVersion !== cdmVersion)
    fail(4, where, `cdmVersion ${e.cdmVersion} is not the published CDM version ${cdmVersion}`);

  // 5
  if ("founding" in e) {
    if (!window) fail(5, where, "carries a founding key, but no founding window is in force (registry/founding-window.json absent or malformed)");
    else if (e.founding === true && typeof e.declaredOn === "string") {
      if (e.declaredOn > window.closesOn) fail(5, where, `founding: true, but declaredOn ${e.declaredOn} is after the window closed (${window.closesOn})`);
      if (window.constitutedOn && e.declaredOn >= window.constitutedOn) fail(5, where, `founding: true, but declaredOn ${e.declaredOn} is on or after committee constitution (${window.constitutedOn})`);
    }
  }
}

// 6 — keys as well as values: a loosened schema admitting `"certified": true` carries its claim in the key.
(function scan(node, at) {
  if (typeof node === "string") {
    if (CLAIM.test(node)) fail(6, at, `string value "${node}" reads as a conformance claim`);
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => scan(v, at === "register" ? `entry ${i}` : `${at}[${i}]`));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (CLAIM.test(k)) fail(6, at, `key "${k}" reads as a conformance claim`);
      scan(v, `${at}.${k}`);
    }
  }
})(register, "register");

console.log("");
console.log("SIGNET adopter register");
console.log("");
const shown = path.relative(root, registerPath);
console.log(`  file            ${shown.startsWith("..") ? registerPath : shown.split(path.sep).join("/")}`);
console.log(`  entries         ${register.length}`);
console.log(`  cdmVersion      ${cdmVersion} (schema/definitions.schema.json $id)`);
console.log(`  founding window ${window ? `closes ${window.closesOn}${window.constitutedOn ? `, or constitution on ${window.constitutedOn}` : ""}` : "none in force"}`);
console.log(`  reference date  ${ref.date} (${ref.basis})`);
console.log("");

if (failures.length > 0) {
  for (const f of failures) console.error(f);
  console.error("");
  console.error(`FAIL. ${failures.length} finding(s). An adopter entry is a statement of practice; it is never a conformance claim.`);
  process.exit(1);
}

console.log(`PASS, ${register.length} ${register.length === 1 ? "entry" : "entries"}.`);
console.log("");
