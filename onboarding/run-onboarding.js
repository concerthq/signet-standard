#!/usr/bin/env node
/*
 * run-onboarding.js — run the SIGNET supplier-qualification demonstration and verify it.
 *
 * An agent qualifies a supplier against a buyer's eligibility policy, lands on a
 * CONDITIONAL outcome (qualified with a value cap pending an upgraded financial
 * credential), records it under human approval, and seals a hash-chained trail.
 * The runner then verifies the output is conformance-clean against the onboarding
 * schemas. Exit 0 if conformant, 1 otherwise.
 */
const fs = require("fs");
const path = require("path");
const { loadSchemas, validateDoc, verifyChain } = require("../conformance/runner/lib.js");
const { runScenario } = require("./onboarding-runtime.js");
const { deterministicReasoner } = require("./reasoner.js");

const OUT = path.join(__dirname, "output");

function main() {
  const r = runScenario({ reasoner: deterministicReasoner });

  console.log("\n" + "=".repeat(72));
  console.log("  SIGNET Supplier-Qualification Demonstration — governed onboarding");
  console.log("  reasoner: " + deterministicReasoner.kind + " (model-pluggable)");
  console.log("=".repeat(72));
  r.trace.forEach((line, i) => console.log(`  ${String(i + 1).padStart(2, " ")}. ${line}`));

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "onboarding-case.json"), JSON.stringify(r.onboardingCase, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "supplier-qualification.json"), JSON.stringify(r.qualification, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "decision.json"), JSON.stringify(r.decision, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "events.json"), JSON.stringify(r.events, null, 2) + "\n");

  const { ajv, byFile } = loadSchemas();
  const checks = [];
  const check = (name, ok, detail) => checks.push({ name, ok, detail });

  const cv = validateDoc(ajv, byFile, "onboarding-case.schema.json", r.onboardingCase);
  check("OnboardingCase validates (onboarding-case.schema.json)", cv.ok, cv.errors.slice(0, 2).join("; "));
  const qv = validateDoc(ajv, byFile, "supplier-qualification.schema.json", r.qualification);
  check("SupplierQualification validates (supplier-qualification.schema.json)", qv.ok, qv.errors.slice(0, 2).join("; "));
  const dv = validateDoc(ajv, byFile, "decision.schema.json", r.decision);
  check("Qualification Decision validates (decision.schema.json)", dv.ok, dv.errors.slice(0, 2).join("; "));

  check("Outcome is CONDITIONAL (the hero case)", r.result.outcome === "conditional", `outcome=${r.result.outcome}`);
  check("Conditional qualification carries a value cap", r.qualification.status === "conditional" && r.qualification.conditions.some(c => c.conditionType === "valueCap"), "");
  check("Decision is mandate-bound (+ human approval for conditional)", !!r.decision.underMandate && (!r.requiresHuman || !!r.decision.humanApproval), "");

  const chain = verifyChain(r.events);
  check("Event stream is an unbroken hash chain", chain.ok, chain.ok ? `${r.events.length} events` : `broken at ${chain.brokenAt}`);
  check("Every event carries provenance", r.events.every(e => e.provenance && e.provenance.generatedBy), "");

  const tampered = JSON.parse(JSON.stringify(r.events));
  if (tampered.length > 1) tampered[1].payload = { supplier: "did:web:evil.example#x" };
  check("Tampering with an event is detected", !verifyChain(tampered).ok, "");

  console.log("\n  " + "-".repeat(68));
  console.log("  CONFORMANCE VERIFICATION OF THE AGENT'S OUTPUT");
  console.log("  " + "-".repeat(68));
  let allOk = true;
  for (const c of checks) { allOk = allOk && c.ok; console.log(`   [${c.ok ? "OK" : "XX"}] ${c.name}${c.detail ? "  (" + c.detail + ")" : ""}`); }
  console.log("  " + "-".repeat(68));
  console.log(`  RESULT: ${allOk ? "a CONDITIONAL qualification, GOVERNED, ACCOUNTABLE, and CONFORMANT." : "NON-CONFORMANT OUTPUT."}`);
  console.log(`  Output written to onboarding/output/\n`);
  process.exit(allOk ? 0 : 1);
}
main();
