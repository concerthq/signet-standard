// reasoner.js — the pluggable reasoning layer for supplier qualification.
//
// Same seam as the award demo: invoke(tool, input) -> output, deterministic by
// default so the demo runs offline and identically in CI. A live model drops in at
// the marked seam with no change to the harness. The reasoning here decides whether
// a supplier's presented credentials satisfy a buyer's eligibility policy — and,
// crucially, lands on a CONDITIONAL outcome when there is a non-blocking shortfall
// rather than a blunt pass/fail.

// Parse the policy's required/blocking sets and the category value from its expression.
function parsePolicy(policy) {
  const e = policy.expression || "";
  const set = (name) => { const m = e.match(new RegExp(name + "\\s*:=\\s*\\{([^}]*)\\}")); return m ? m[1].split(",").map(s => s.replace(/[\s"]/g, "")).filter(Boolean) : []; };
  const num = (name) => { const m = e.match(new RegExp(name + "\\s*:=\\s*(\\d+)")); return m ? parseInt(m[1], 10) : null; };
  return { required: set("required"), blocking: set("blocking"), categoryValue: num("category_value") };
}

const typeOf = (cred) => (cred.type || []).find(t => t !== "VerifiableCredential");
const now = "2026-06-22T00:00:00Z";
const isExpired = (cred) => cred.expirationDate && cred.expirationDate < now;

const deterministicReasoner = {
  kind: "deterministic",

  // Tool: verify.credential — presence, validity, and (for financial) sufficiency.
  // input: { credentialType, credential, categoryValue }
  // output: { type, present, valid, sufficient, supportedValue?, reason }
  invoke(tool, input) {
    if (tool === "verify.credential") {
      const { credentialType, credential, categoryValue } = input;
      if (!credential) return { type: credentialType, present: false, valid: false, sufficient: false, reason: "not presented" };
      if (isExpired(credential)) return { type: credentialType, present: true, valid: false, sufficient: false, reason: "expired" };
      // sanctions must be clear
      if (credentialType === "sanctionsScreening") {
        const clear = credential.credentialSubject && credential.credentialSubject.result === "clear";
        return { type: credentialType, present: true, valid: clear, sufficient: clear, reason: clear ? "clear" : "not clear" };
      }
      // financial sufficiency vs the category value tier
      if (credentialType === "financialStanding") {
        const sup = credential.credentialSubject && credential.credentialSubject.maxContractValue;
        const supportedValue = sup ? sup.amount : 0;
        const sufficient = supportedValue >= categoryValue;
        return { type: credentialType, present: true, valid: true, sufficient, supportedValue, currency: sup ? sup.currency : "EUR",
          reason: sufficient ? "covers category tier" : `supports up to ${supportedValue} of ${categoryValue}` };
      }
      return { type: credentialType, present: true, valid: true, sufficient: true, reason: "valid" };
    }

    // Tool: qualify.supplier — combine the checks into an outcome.
    // input: { checks:[verify outputs], blocking:[types], categoryValue }
    // output: { outcome, conditions:[...], rationale, requiresHumanApproval }
    if (tool === "qualify.supplier") {
      const { checks, blocking, categoryValue } = input;
      const missingBlocking = checks.filter(c => blocking.includes(c.type) && (!c.present || !c.valid));
      if (missingBlocking.length) {
        return { outcome: "rejected", conditions: [],
          rationale: `Rejected: blocking requirement(s) not met — ${missingBlocking.map(c => `${c.type} (${c.reason})`).join(", ")}.`,
          requiresHumanApproval: false };
      }
      const fin = checks.find(c => c.type === "financialStanding");
      const conditions = [];
      if (fin && !fin.sufficient) {
        conditions.push({ conditionType: "valueCap",
          description: `Qualified to a maximum single-contract value of ${fin.currency} ${fin.supportedValue.toLocaleString("en-GB")} pending an upgraded financial-standing credential (category tier ${fin.currency} ${categoryValue.toLocaleString("en-GB")}).`,
          valueCap: { amount: fin.supportedValue, currency: fin.currency } });
        conditions.push({ conditionType: "pendingCheck",
          description: "Upgraded financial-standing credential required for unconditional qualification.",
          dueDate: "2026-09-30T00:00:00Z" });
      }
      if (conditions.length) {
        return { outcome: "conditional", conditions,
          rationale: `Conditional qualification: all blocking checks pass and sanctions screening is clear, but financial standing covers only part of the category value tier. Qualified with a value cap pending an upgraded financial credential.`,
          requiresHumanApproval: true };
      }
      return { outcome: "qualified", conditions: [],
        rationale: "Qualified: all required credentials present, valid, and sufficient; sanctions screening clear.",
        requiresHumanApproval: false };
    }
    throw new Error(`unknown tool ${tool}`);
  },
};

// ---- MODEL SEAM ---------------------------------------------------------------
// A live reasoner implements the same invoke(tool,input) contract, calling a model
// via MCP tools / A2A and constraining output to the shapes above. The harness —
// mandate gate, OnboardingCase/SupplierQualification production, provenance,
// event-chaining — is unchanged.
// -------------------------------------------------------------------------------

module.exports = { deterministicReasoner, parsePolicy, typeOf };
