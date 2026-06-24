// onboarding-runtime.js — the SIGNET qualification harness.
//
// Orchestrates a governed qualification: read the eligibility Policy and the
// supplier's presented credentials, check each credential, apply the policy via the
// (pluggable) reasoner, gate the outcome against the Mandate (a CONDITIONAL outcome
// requires a named human approver), and emit an OnboardingCase, a
// SupplierQualification, a qualification Decision, and a hash-chained Event stream.
const fs = require("fs");
const path = require("path");
const { eventHash } = require("../conformance/runner/lib.js");
const { parsePolicy, typeOf } = require("./reasoner.js");

const DIR = __dirname;
const rd = (p) => JSON.parse(fs.readFileSync(path.join(DIR, p), "utf8"));
const AGENT = { scheme: "did", id: "did:web:buyer.example#agent-qual-2" };
const BUYER = { scheme: "did", id: "did:web:buyer.example#buyer" };
const TS = "2026-06-22T00:00:00Z";
const prov = (derivedFrom = [], usedPolicies = []) => ({
  generatedBy: AGENT, generatedAt: TS,
  ...(derivedFrom.length ? { derivedFrom } : {}),
  ...(usedPolicies.length ? { usedPolicies } : {}),
});
const short = (did) => (did || "").split("#").pop();
const fmt = (v) => `${v.amount.toLocaleString("en-GB")} ${v.currency}`;

function runScenario({ reasoner }) {
  const trace = [];
  const log = (s) => trace.push(s);

  const policy = rd("policy-onboarding.json");
  const mandate = rd("mandate.json");
  const presented = rd("presented-credentials.json");
  const { required, blocking, categoryValue } = parsePolicy(policy);
  const supplier = presented.supplier;
  const creds = presented.credentials;
  const credByType = {}; creds.forEach(c => { credByType[typeOf(c)] = c; });

  const events = [];
  const emit = (eventType, subject, payload) => {
    const e = { type: "Event", id: { scheme: "did", id: `did:web:buyer.example#oevt-${events.length + 1}` },
      eventType, subject: { scheme: "did", id: subject }, actor: AGENT, timestamp: TS, payload, provenance: prov() };
    if (events.length) e.previousEventHash = eventHash(events[events.length - 1]);
    events.push(e);
  };

  // Case opens — invited entry.
  const caseId = "did:web:buyer.example#onboarding-4471";
  const qualId = "did:web:buyer.example#qual-acme";
  log(`Onboarding case ${short(caseId)} opened for ${short(supplier.id)} (entry: invited) against policy ${short(policy.id.id)}.`);
  log(`Category: WAN services, value tier ${fmt({ amount: categoryValue, currency: "EUR" })}. Required: ${required.join(", ")}.`);
  emit("case.initiated", caseId, { entryMode: "invited", caseType: "onboarding" });
  emit("supplier.invited", caseId, { supplier: supplier.id });
  emit("credentials.submitted", caseId, { count: creds.length });

  // Verify each required credential (MCP-style tool calls).
  log(`Verifying ${required.length} required credentials:`);
  const checks = [];
  for (const reqType of required) {
    const out = reasoner.invoke("verify.credential", { credentialType: reqType, credential: credByType[reqType], categoryValue });
    checks.push(out);
    const mark = (out.present && out.valid && out.sufficient) ? "\u2713" : (out.present && out.valid ? "\u25B3" : "\u2717");
    log(`  ${mark} ${reqType}: ${out.reason}`);
  }
  emit("credentials.verified", caseId, { checks: checks.map(c => ({ type: c.type, ok: c.present && c.valid && c.sufficient })) });

  // Apply the policy -> outcome.
  const result = reasoner.invoke("qualify.supplier", { checks, blocking, categoryValue });
  log(`Outcome: ${result.outcome.toUpperCase()}. ${result.rationale}`);

  // Mandate gate — a conditional outcome requires a human approver.
  const requiresHuman = (mandate.scope.humanApprovalRequiredFor || []).includes(result.outcome);
  let humanApproval = null;
  if (requiresHuman) {
    humanApproval = { scheme: "did", id: "did:web:buyer.example#approval-cond-118" };
    log(`Mandate: attaching conditions is outside autonomous scope \u2192 human approval ${short(humanApproval.id)} required and recorded.`);
    emit("case.pending_approval", caseId, { reason: "conditional outcome" });
  } else {
    log(`Mandate: outcome "${result.outcome}" is within autonomous scope \u2192 no human approval needed.`);
  }

  // The qualification Decision.
  const decision = {
    "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
    type: "Decision",
    id: { scheme: "did", id: "did:web:buyer.example#decision-onb-4471" },
    decisionType: "qualification",
    madeBy: AGENT,
    underMandate: mandate.id,
    inputs: creds.map(c => ({ scheme: "uri", id: c.id })),
    policiesApplied: [policy.id],
    rationale: result.rationale,
    outcome: { qualification: result.outcome, conditions: result.conditions, supplier: supplier.id },
    provenance: prov(creds.map(c => ({ scheme: "uri", id: c.id })), [policy.id]),
  };
  if (humanApproval) decision.humanApproval = humanApproval;
  emit("decision.made", decision.id.id, { decisionType: "qualification", outcome: result.outcome });

  // The OnboardingCase (workflow record).
  const onboardingCase = {
    "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
    type: "OnboardingCase",
    id: { scheme: "did", id: caseId },
    subjectParty: supplier,
    initiatingParty: BUYER,
    caseType: "onboarding",
    entryMode: "invited",
    status: result.outcome === "rejected" ? "rejected" : "qualified",
    eligibilityPolicy: policy.id,
    requiredCredentialTypes: required,
    collectedCredentials: creds,
    decision: decision.id,
    producesQualification: { scheme: "did", id: qualId },
    period: { startDate: "2026-06-15T00:00:00Z", endDate: "2026-06-22T00:00:00Z" },
  };

  // The durable SupplierQualification.
  const qualification = {
    "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
    type: "SupplierQualification",
    id: { scheme: "did", id: qualId },
    supplier,
    qualifiedBy: BUYER,
    status: result.outcome === "qualified" ? "active" : result.outcome === "conditional" ? "conditional" : "offboarded",
    conditions: result.conditions,
    classifications: [policy.appliesTo],
    credentials: creds,
    validity: { startDate: "2026-06-22T00:00:00Z", endDate: "2027-06-22T00:00:00Z" },
    lastDecision: decision.id,
    originatingCase: { scheme: "did", id: caseId },
  };
  emit("qualification.created", qualId, { status: qualification.status });
  log(`SupplierQualification ${short(qualId)} created: status ${qualification.status.toUpperCase()}` +
      (qualification.conditions.length ? ` with ${qualification.conditions.length} condition(s) (cap ${fmt(qualification.conditions[0].valueCap)}).` : "."));
  log(`Event stream: ${events.length} events, hash-chained.`);

  return { policy, mandate, checks, result, decision, onboardingCase, qualification, events, requiresHuman, trace };
}

module.exports = { runScenario };
