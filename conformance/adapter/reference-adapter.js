// Reference adapter: a minimal, fully conformant in-memory SIGNET implementation.
// Proves the harness passes a correct implementation (and serves as a worked
// example of the adapter contract).
const path = require("path");
const { loadSchemas, validateDoc, eventHash } = require("../runner/lib.js");
const { toUBL } = require(path.join(__dirname, "..", "..", "tools", "signet-to-ubl.js"));

// Map CDM object `type` -> schema file.
const SCHEMA_FOR = {
  Need: "need.schema.json",
  SourcingEvent: "sourcing-event.schema.json",
  Submission: "submission.schema.json",
  Evaluation: "evaluation.schema.json",
  Award: "award.schema.json",
  Contract: "contract.schema.json",
  Order: "order.schema.json",
  Catalogue: "catalogue.schema.json",
  Invoice: "invoice.schema.json",
  Policy: "policy.schema.json",
  SyntheticAgent: "synthetic-agent.schema.json",
  Mandate: "mandate.schema.json",
  Decision: "decision.schema.json",
  Party: "party.schema.json",
};

function createAdapter() {
  const { ajv, byFile } = loadSchemas();
  const docs = new Map();        // subjectId -> document
  const log = new Map();         // subjectId -> [events]
  let seq = 0;

  const actor = { scheme: "did", id: "did:web:reference-impl.example#system" };
  const prov = () => ({ generatedBy: actor, generatedAt: "2026-06-22T00:00:00Z" });
  const subjId = (d) => (d && d.id && d.id.id) || `urn:signet:obj-${++seq}`;

  function emit(eventType, subject, document) {
    const prior = log.get(subject) || [];
    const event = {
      type: "Event",
      id: { scheme: "did", id: `did:web:reference-impl.example#evt-${++seq}` },
      eventType,
      subject: { scheme: "did", id: subject },
      actor,
      timestamp: "2026-06-22T00:00:00Z",
      provenance: prov(),
    };
    // Hash-chain: first event has no back-pointer; later events link to the prior.
    if (prior.length > 0) event.previousEventHash = eventHash(prior[prior.length - 1]);
    log.set(subject, [...prior, event]);
    return event;
  }

  return {
    createObject(type, data) {
      const schemaFile = SCHEMA_FOR[type];
      if (!schemaFile) throw new Error(`unknown type ${type}`);
      const document = { type, ...data };
      const res = validateDoc(ajv, byFile, schemaFile, document);
      if (!res.ok) { const e = new Error(`invalid ${type}`); e.validation = res.errors; throw e; }
      // Decisions must carry provenance (CDM §6.4); attach if absent.
      if (type === "Decision" && !document.provenance) document.provenance = prov();
      const subject = subjId(document);
      docs.set(subject, document);
      const event = emit(`${type.toLowerCase()}.created`, subject, document);
      return { document, event };
    },

    applyChange(subjectId, change) {
      const cur = docs.get(subjectId);
      if (!cur) throw new Error(`unknown subject ${subjectId}`);
      const document = { ...cur, ...change };
      docs.set(subjectId, document);
      const event = emit("object.changed", subjectId, document);
      return { document, event };
    },

    getEvents(subjectId) { return log.get(subjectId) || []; },

    projectInvoiceToUBL(invoice) { return toUBL(invoice); },
  };
}

module.exports = { createAdapter };
