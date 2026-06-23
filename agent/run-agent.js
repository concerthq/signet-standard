#!/usr/bin/env node
/*
 * run-agent.js — run the SIGNET agent demonstration and verify its output.
 *
 * Usage: node agent/run-agent.js
 *
 * Runs the evaluation/award scenario with the deterministic reasoner, prints a
 * narrated trace, writes the produced objects to agent/output/, then VERIFIES that
 * the agent's output is conformance-clean: every emitted object validates against
 * its schema and the Event stream is an unbroken hash chain. The point: the agent
 * did not just act — it acted in a way that is provably governed and certifiable.
 *
 * Exit 0 if the output is conformant, 1 otherwise.
 */
const fs = require("fs");
const path = require("path");
const { loadSchemas, validateDoc, verifyChain } = require("../conformance/runner/lib.js");
const { runScenario } = require("./agent-runtime.js");
const { deterministicReasoner } = require("./reasoner.js");

const OUT = path.join(__dirname, "output");

function main() {
  const r = runScenario({ reasoner: deterministicReasoner });

  // --- narrated trace ---
  console.log("\n" + "=".repeat(72));
  console.log("  SIGNET Agent Demonstration — governed evaluation & award");
  console.log("  reasoner: " + deterministicReasoner.kind + " (model-pluggable)");
  console.log("=".repeat(72));
  r.trace.forEach((line, i) => console.log(`  ${String(i + 1).padStart(2, " ")}. ${line}`));

  // --- write outputs ---
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "decision.json"), JSON.stringify(r.decision, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "award.json"), JSON.stringify(r.award, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "events.json"), JSON.stringify(r.events, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "evaluations.json"), JSON.stringify(r.evaluations, null, 2) + "\n");

  // --- verify the output is conformance-clean ---
  const { ajv, byFile } = loadSchemas();
  const checks = [];
  const check = (name, ok, detail) => { checks.push({ name, ok, detail }); };

  const dv = validateDoc(ajv, byFile, "decision.schema.json", r.decision);
  check("Decision validates (decision.schema.json)", dv.ok, dv.errors.slice(0, 2).join("; "));

  let evalOk = true, evalErr = "";
  for (const e of r.evaluations) { const v = validateDoc(ajv, byFile, "evaluation.schema.json", e); if (!v.ok) { evalOk = false; evalErr = v.errors[0]; } }
  check("Evaluations validate (evaluation.schema.json)", evalOk, evalErr);

  const av = validateDoc(ajv, byFile, "award.schema.json", r.award);
  check("Award validates (award.schema.json)", av.ok, av.errors.slice(0, 2).join("; "));

  const chain = verifyChain(r.events);
  check("Event stream is an unbroken hash chain", chain.ok, chain.ok ? `${r.events.length} events` : `broken at ${chain.brokenAt}`);

  const decProv = !!(r.decision.provenance && r.decision.provenance.generatedBy && r.decision.provenance.generatedAt);
  check("Decision carries provenance", decProv, "");

  const evProv = r.events.every(e => e.provenance && e.provenance.generatedBy);
  check("Every event carries provenance", evProv, "");

  const govt = !!r.decision.underMandate && (!r.requiresHumanApproval || !!r.decision.humanApproval);
  check("Decision is mandate-bound (+ human approval where required)", govt, "");

  // tamper check — proves the chain would catch interference
  const tampered = JSON.parse(JSON.stringify(r.events));
  if (tampered.length > 1) tampered[1].payload = { score: 9.99 };
  const tamperDetected = !verifyChain(tampered).ok;
  check("Tampering with an event is detected", tamperDetected, "");

  console.log("\n  " + "-".repeat(68));
  console.log("  CONFORMANCE VERIFICATION OF THE AGENT'S OUTPUT");
  console.log("  " + "-".repeat(68));
  let allOk = true;
  for (const c of checks) { allOk = allOk && c.ok; console.log(`   [${c.ok ? "OK" : "XX"}] ${c.name}${c.detail ? "  (" + c.detail + ")" : ""}`); }
  console.log("  " + "-".repeat(68));
  console.log(`  RESULT: ${allOk ? "the agent's action is GOVERNED, ACCOUNTABLE, and CONFORMANT." : "NON-CONFORMANT OUTPUT."}`);
  console.log(`  Output written to agent/output/  (decision, award, evaluations, events)\n`);

  process.exit(allOk ? 0 : 1);
}

main();
