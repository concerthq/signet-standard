// Broken adapter: deliberately NON-conformant. Used to prove the harness
// actually discriminates (it must FAIL this implementation).
//
// Three planted defects:
//   1. Events are not hash-chained (previousEventHash never set)  -> fails C-EVT
//   2. projectInvoiceToUBL drops the tax total                    -> fails F-MAP
//   3. The agent surface CITES its mandate and policies and does not ENFORCE them
//      -> passes F-SEM, reaches the same F-SEM result as a correct implementation,
//         and fails E-MDT-1. This is the defect that matters: the first two are
//         obvious breakages, while the third produces a record that is well-formed,
//         provenance-bearing, hash-chained by any implementation that bothers, and
//         false. It exists so the gap CP-Mandate-enforcement describes is
//         demonstrable rather than argumentative — and it is worth keeping even if
//         that proposal is declined.
const path = require("path");
const { loadSchemas, validateDoc } = require("../runner/lib.js");
const { toUBL } = require(path.join(__dirname, "..", "..", "tools", "signet-to-ubl.js"));

const SCHEMA_FOR = {
  Invoice: "invoice.schema.json", Policy: "policy.schema.json",
  Decision: "decision.schema.json", SourcingEvent: "sourcing-event.schema.json",
  Need: "need.schema.json", Contract: "contract.schema.json",
};

function createAdapter() {
  const { ajv, byFile } = loadSchemas();
  const docs = new Map();
  const log = new Map();
  let seq = 0;
  const actor = { scheme: "did", id: "did:web:broken-impl.example#system" };

  function emit(eventType, subject) {
    const prior = log.get(subject) || [];
    const event = {
      type: "Event",
      id: { scheme: "did", id: `did:web:broken-impl.example#evt-${++seq}` },
      eventType, subject: { scheme: "did", id: subject }, actor,
      timestamp: "2026-06-22T00:00:00Z",
      provenance: { generatedBy: actor, generatedAt: "2026-06-22T00:00:00Z" },
      // DEFECT 1: previousEventHash deliberately never set -> chain cannot verify.
    };
    log.set(subject, [...prior, event]);
    return event;
  }

  return {
    createObject(type, data) {
      const schemaFile = SCHEMA_FOR[type];
      const document = { type, ...data };
      if (schemaFile) { const r = validateDoc(ajv, byFile, schemaFile, document); if (!r.ok) { const e = new Error("invalid"); e.validation = r.errors; throw e; } }
      const subject = (document.id && document.id.id) || `urn:signet:obj-${++seq}`;
      docs.set(subject, document);
      const event = emit(`${type.toLowerCase()}.created`, subject);
      return { document, event };
    },
    applyChange(subjectId, change) {
      const document = { ...(docs.get(subjectId) || {}), ...change };
      docs.set(subjectId, document);
      return { document, event: emit("object.changed", subjectId) };
    },
    getEvents(subjectId) { return log.get(subjectId) || []; },
    projectInvoiceToUBL(invoice) {
      // DEFECT 2: strip the TaxTotal block from the UBL -> mapping loses BT-110.
      return toUBL(invoice).replace(/  <cac:TaxTotal>[\s\S]*?<\/cac:TaxTotal>\n/, "");
    },
  };
}

// DEFECT 3: an agent surface that cites and does not enforce.
//
// Every action proceeds. The Decision it writes is impeccable by the lights of F-SEM:
// `underMandate` names the mandate, `policiesApplied` names every policy the mandate
// references, `rationale` reads well, provenance is present and the object validates.
// Nothing in it is a lie by omission — it simply never checks whether the limits those
// policies express were respected, and never refuses. It awards EUR 25,000,000 under a
// mandate whose hard ceiling is EUR 20,000,000, with no human approval, and records that
// it applied the ceiling policy while doing so.
//
// F-SEM passes. E-MDT-1 fails. The distance between those two results is the whole of
// what the endorsement adds.
function createAgentAdapter() {
  const actor = { scheme: "did", id: "did:web:broken-impl.example#agent" };
  let seq = 0;
  return {
    attemptAction(request) {
      const { mandate, capability, subject, action, atTime } = request;
      return {
        decision: {
          type: "Decision",
          id: { scheme: "did", id: `did:web:broken-impl.example#decision-${++seq}` },
          decisionType: "award",
          madeBy: actor,
          underMandate: mandate.id,
          inputs: [subject],
          policiesApplied: [...(mandate.constraints || []), ...(mandate.approvalThresholds || [])],
          rationale: `Awarded under mandate ${mandate.id.id}, applying the governing policies.`,
          outcome: { action: capability, subject: (subject && subject.id) || subject, value: action.value },
          provenance: { generatedBy: actor, generatedAt: atTime },
        },
      };
    },
    // No refusal ever occurs, so nothing is ever evented as mandate.refused.
    getEvents() { return []; },
  };
}

// No consent surface: this implementation does not seek E-CNS, which is not a failure.
module.exports = { createAdapter, createAgentAdapter };
