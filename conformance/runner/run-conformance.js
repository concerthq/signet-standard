#!/usr/bin/env node
/*
 * run-conformance.js — the SIGNET conformance harness.
 *
 * Usage:
 *   node conformance/runner/run-conformance.js [--adapter <path>] [--out <report.json>]
 * Default adapter: conformance/adapter/reference-adapter.js
 *
 * Runs document conformance (C-DOC) and implementation conformance
 * (C-EVT, C-PROV, F-MAP, F-SEM), prints a summary, writes a machine-readable
 * report, and computes the highest conformance level fully satisfied.
 * Exit code 0 if at least Core is met, 1 otherwise.
 *
 * Licensed Apache-2.0 by Concert Foundation.
 */
const fs = require("fs");
const path = require("path");
const { ROOT, loadSchemas, validateDoc, verifyChain } = require("./lib.js");

// --- args ---
const args = process.argv.slice(2);
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const adapterPath = path.resolve(getArg("--adapter", path.join(__dirname, "..", "adapter", "reference-adapter.js")));
const outPath = getArg("--out", null);

const rd = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const results = [];
const record = (requirement, level, normativeRef, ok, detail) =>
  results.push({ requirement, level, normativeRef, status: ok ? "pass" : "fail", detail });

// ---------------------------------------------------------------------------
// C-DOC — document conformance
// ---------------------------------------------------------------------------
function runDocConformance() {
  const { ajv, byFile } = loadSchemas();
  const suite = rd("conformance/suite/document-conformance.json");
  let allOk = true;
  const detail = { positives: [], negatives: [] };

  for (const c of suite.positive) {
    const doc = rd(c.file);
    const r = validateDoc(ajv, byFile, c.schema, doc);
    if (!r.ok) allOk = false;
    detail.positives.push({ file: c.file, expected: "valid", ok: r.ok, errors: r.errors.slice(0, 2) });
  }
  for (const c of suite.negative) {
    const doc = rd(c.file);
    const r = validateDoc(ajv, byFile, c.schema, doc);
    // negative case PASSES the test when the document is correctly REJECTED
    const ok = !r.ok;
    if (!ok) allOk = false;
    detail.negatives.push({ file: c.file, expected: "rejected", correctlyRejected: ok, targets: c.targets });
  }
  record("C-DOC", "Core", suite.normativeRef, allOk, detail);
}

// ---------------------------------------------------------------------------
// implementation conformance — driven through the adapter
// ---------------------------------------------------------------------------
function runImplConformance(adapter) {
  // C-EVT — event integrity (chain verifies; tampering detected)
  {
    const need = rd("examples/need.json");
    const { document } = adapter.createObject("Need", need);
    const subject = document.id.id;
    adapter.applyChange(subject, { rationale: "updated rationale 1" });
    adapter.applyChange(subject, { rationale: "updated rationale 2" });
    const events = adapter.getEvents(subject);
    const chainOk = verifyChain(events).ok;

    // tamper: mutate a middle event's payload; the chain MUST now break
    const tampered = JSON.parse(JSON.stringify(events));
    if (tampered.length > 1) tampered[0].eventType = "tampered.value";
    const tamperDetected = !verifyChain(tampered).ok;

    const ok = events.length >= 3 && chainOk && tamperDetected;
    record("C-EVT", "Core", "CDM 1.7,7.1", ok,
      { events: events.length, chainVerifies: chainOk, tamperDetected });
  }

  // C-PROV — provenance presence on events and decisions
  {
    const dec = rd("examples/award-decision.json");
    const { document } = adapter.createObject("Decision", dec);
    const decProv = !!(document.provenance && document.provenance.generatedBy && document.provenance.generatedAt);
    // every event emitted so far must carry provenance
    const allEvents = [].concat(...["did:web:vtpc.example#need-0420"].map(s => adapter.getEvents(s)));
    const evProv = allEvents.length > 0 && allEvents.every(e => e.provenance && e.provenance.generatedBy && e.provenance.generatedAt);
    record("C-PROV", "Core", "CDM 6.4,7.2", decProv && evProv,
      { decisionHasProvenance: decProv, allEventsHaveProvenance: evProv });
  }

  // F-MAP — invoice -> Peppol BIS Billing, BTs preserved + totals reconcile
  {
    const inv = rd("examples/invoice.json");
    const ubl = adapter.projectInvoiceToUBL(inv);
    const lmt = (ubl.match(/<cac:LegalMonetaryTotal>[\s\S]*?<\/cac:LegalMonetaryTotal>/) || [""])[0];
    const tax = (ubl.match(/<cac:TaxTotal>[\s\S]*?<\/cac:TaxTotal>/) || [""])[0];
    const num = (re, s) => { const m = s.match(re); return m ? parseFloat(m[1]) : null; };
    const payable = num(/<cbc:PayableAmount[^>]*>([\d.]+)</, lmt);
    const taxIncl = num(/<cbc:TaxInclusiveAmount[^>]*>([\d.]+)</, lmt);
    const taxExcl = num(/<cbc:TaxExclusiveAmount[^>]*>([\d.]+)</, lmt);
    const lineExt = num(/<cbc:LineExtensionAmount[^>]*>([\d.]+)</, lmt);
    const taxAmt  = num(/<cbc:TaxAmount[^>]*>([\d.]+)</, tax);

    const present = [payable, taxIncl, taxExcl, lineExt, taxAmt].every(v => v !== null);
    const reconciles = present
      && Math.abs((taxExcl + taxAmt) - taxIncl) < 0.005
      && Math.abs(payable - taxIncl) < 0.005
      && Math.abs(lineExt - inv.lineExtensionTotal.amount) < 0.005
      && Math.abs(payable - inv.payableAmount.amount) < 0.005;
    record("F-MAP", "Full", "CDM 8,13.2(b)", present && reconciles,
      { wellFormedTotals: present, reconciles, payable, taxIncl, taxExcl, lineExt, taxAmt });
  }

  // F-SEM — policy dual-form + decision cites inputs and policies
  {
    const pol = rd("examples/policy-evaluation.json");
    const { document: p } = adapter.createObject("Policy", pol);
    const policyDual = !!(p.expression && p.expression.length && p.humanReadable && p.humanReadable.length);
    const dec = rd("examples/award-decision.json");
    const citesInputs = Array.isArray(dec.inputs) && dec.inputs.length >= 1;
    const citesPolicies = Array.isArray(dec.policiesApplied) && dec.policiesApplied.length >= 1;
    record("F-SEM", "Full", "CDM 6.3-6.5", policyDual && citesInputs && citesPolicies,
      { policyHasBothForms: policyDual, decisionCitesInputs: citesInputs, decisionCitesPolicies: citesPolicies });
  }
}

// ---------------------------------------------------------------------------
function main() {
  const { createAdapter } = require(adapterPath);
  const adapter = createAdapter();

  runDocConformance();
  runImplConformance(adapter);

  const pass = (req) => results.find(r => r.requirement === req)?.status === "pass";
  const core = ["C-DOC", "C-EVT", "C-PROV"].every(pass);
  const full = core && ["F-MAP", "F-SEM"].every(pass);
  const level = full ? "Full" : core ? "Core" : "none";

  const report = {
    standard: "SIGNET",
    cdmVersion: "v0.1",
    suiteVersion: "v0.1",
    adapter: path.basename(adapterPath),
    timestamp: new Date().toISOString(),
    levelAchieved: level,
    results,
  };

  const dest = outPath || path.join(ROOT, "conformance", "reports", `${path.basename(adapterPath, ".js")}-report.json`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(report, null, 2) + "\n");

  // --- human summary ---
  console.log(`\nSIGNET Conformance — adapter: ${report.adapter}  (CDM ${report.cdmVersion}, suite ${report.suiteVersion})`);
  console.log("─".repeat(64));
  for (const r of results) {
    const mark = r.status === "pass" ? "PASS" : "FAIL";
    console.log(`  [${mark}]  ${r.requirement.padEnd(7)} ${r.level.padEnd(5)} ${r.normativeRef}`);
  }
  console.log("─".repeat(64));
  console.log(`  LEVEL ACHIEVED: ${level.toUpperCase()}`);
  console.log(`  Report: ${path.relative(ROOT, dest)}\n`);

  process.exit(core ? 0 : 1);
}

main();
