// Broken adapter: deliberately NON-conformant. Used to prove the harness
// actually discriminates (it must FAIL this implementation).
//
// Two planted defects:
//   1. Events are not hash-chained (previousEventHash never set)  -> fails C-EVT
//   2. projectInvoiceToUBL drops the tax total                    -> fails F-MAP
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

module.exports = { createAdapter };
