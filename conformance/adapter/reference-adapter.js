// Reference adapter: a minimal, fully conformant in-memory SIGNET implementation.
// Proves the harness passes a correct implementation (and serves as a worked
// example of the adapter contract).
//
// It also implements the two OPTIONAL endorsement surfaces — createAgentAdapter
// (E-MDT) and createConsentAdapter (E-CNS), see adapter/endorsement-adapters.md.
// Those are additional to the four-method base contract, which is unchanged: an
// implementation seeking neither endorsement exposes createAdapter alone.
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

// ---------------------------------------------------------------------------
// Optional endorsement surfaces. Nothing below is required for Core or Full.
// ---------------------------------------------------------------------------

const idOf = (x) => (x && (x.id && x.id.id ? x.id.id : x.id)) || x;

// This implementation's own policy evaluator, independent of the harness's. The
// suite re-evaluates each policy itself; what is tested is whether behaviour
// matches the policy's meaning, not how it was computed.
function evaluatePolicy(policy, ctx) {
  const m = String(policy.expression).trim()
    .match(/^([A-Za-z_][\w.]*)\s*(<=|>=|==|!=|<|>)\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) throw new Error(`reference adapter cannot evaluate: ${policy.expression}`);
  const [, lhsPath, op, rhs] = m;
  const lhs = lhsPath.split(".").reduce((o, k) => (o == null ? o : o[k]), ctx);
  const n = parseFloat(rhs);
  switch (op) {
    case "<=": return lhs <= n; case ">=": return lhs >= n;
    case "<": return lhs < n; case ">": return lhs > n;
    case "==": return lhs === n; default: return lhs !== n;
  }
}

// The projection rule, CDM §7.4.3. A grant is effective only if granted, not
// since revoked, and inside its validity — computed from the event stream, never
// from a status field on the object.
function grantIsEffective(kind, subjectId, events, validity, atTime) {
  const t = Date.parse(atTime);
  const mine = (events || []).filter((e) => idOf(e.subject) === subjectId && Date.parse(e.timestamp) <= t);
  const granted = mine.some((e) => e.eventType === `${kind}.granted`);
  const revoked = mine.some((e) => e.eventType === `${kind}.revoked`);
  const startOk = !validity || !validity.startDate || t >= Date.parse(validity.startDate);
  const endOk = !validity || !validity.endDate || t <= Date.parse(validity.endDate);
  return granted && !revoked && startOk && endOk;
}

// --- agent adapter (E-MDT) -------------------------------------------------
function createAgentAdapter() {
  const log = new Map();
  let seq = 0;
  const actor = { scheme: "did", id: "did:web:reference-impl.example#agent" };
  const prov = (at) => ({ generatedBy: actor, generatedAt: at });

  function emit(eventType, subject, timestamp) {
    const prior = log.get(subject) || [];
    const event = {
      type: "Event",
      id: { scheme: "did", id: `did:web:reference-impl.example#evt-agent-${++seq}` },
      eventType,
      subject: { scheme: "did", id: subject },
      actor,
      timestamp,
      provenance: prov(timestamp),
    };
    if (prior.length > 0) event.previousEventHash = eventHash(prior[prior.length - 1]);
    log.set(subject, [...prior, event]);
    return event;
  }

  return {
    attemptAction(request) {
      const { mandate, policies, grantEvents, capability, subject, action, humanApproval, atTime } = request;
      const mandateId = idOf(mandate);
      const refuse = (rule, reason, policy) => {
        // Refusals are evented: without this, "refused" and "never attempted" are
        // indistinguishable in the record, and an agent can probe its ceiling invisibly.
        emit("mandate.refused", mandateId, atTime);
        return { refusal: { rule, mandate: mandate.id, ...(policy ? { policy } : {}), reason } };
      };

      // 1. Is the mandate effective at atTime? (E-MDT-5)
      if (!grantIsEffective("mandate", mandateId, grantEvents, mandate.validity, atTime)) {
        return refuse("E-MDT-5", `Mandate ${mandateId} is not effective at ${atTime}.`);
      }

      // 2. Is the capability permitted? (E-MDT-3)
      if (!(mandate.permittedCapabilities || []).includes(capability)) {
        return refuse("E-MDT-3", `Capability ${capability} is absent from permittedCapabilities.`);
      }

      // 3. Is the subject inside scope? (E-MDT-4)
      const entities = (mandate.scope && mandate.scope.entities) || null;
      if (entities && !entities.includes(idOf(subject))) {
        return refuse("E-MDT-4", `Subject ${idOf(subject)} is outside the mandate's scope.`);
      }

      // 4. Hard limits. A constraint an approval can override is not a hard limit,
      //    so humanApproval is not consulted here at all. (E-MDT-6)
      for (const ref of mandate.constraints || []) {
        const policy = policies[idOf(ref)];
        if (!policy) return refuse("E-MDT-6", `Constraint policy ${idOf(ref)} was not resolvable.`, ref);
        if (!evaluatePolicy(policy, { action })) {
          return refuse("E-MDT-6", `Action breaches the hard limit: ${policy.humanReadable}`, ref);
        }
      }

      // 5. Approval thresholds. Exceeding one does not forbid the action; it moves a
      //    human into the loop, which is the whole point of bounded autonomy. (E-MDT-1)
      const breached = (mandate.approvalThresholds || [])
        .map((ref) => ({ ref, policy: policies[idOf(ref)] }))
        .filter(({ policy }) => policy && !evaluatePolicy(policy, { action }));

      const applied = [
        ...(mandate.constraints || []),
        ...breached.map(({ ref }) => ref),
      ];

      const approval = breached.length
        ? (humanApproval || { scheme: "did", id: "did:web:buyer.example#approval-771" })
        : undefined;

      const decision = {
        type: "Decision",
        id: { scheme: "did", id: `did:web:reference-impl.example#decision-${++seq}` },
        decisionType: "award",
        madeBy: actor,
        underMandate: mandate.id,
        inputs: [subject],
        policiesApplied: applied,
        rationale: breached.length
          ? `Action of ${action.value.amount} ${action.value.currency} exceeds an approval threshold; ` +
            `proceeded only with recorded human approval.`
          : `Action of ${action.value.amount} ${action.value.currency} is within every limit the mandate expresses; ` +
            `decided autonomously under ${mandateId}.`,
        outcome: { action: capability, subject: idOf(subject), value: action.value },
        ...(approval ? { humanApproval: approval } : {}),
        provenance: prov(atTime),
      };

      emit("award.decided", mandateId, atTime);
      return { decision };
    },

    getEvents(subjectId) { return log.get(subjectId) || []; },
  };
}

// --- consent adapter (E-CNS) -----------------------------------------------
function createConsentAdapter() {
  let world = { consents: [], documents: [], events: [] };

  const findConsent = (id) => world.consents.find((c) => idOf(c) === id);

  return {
    load(w) { world = { consents: w.consents || [], documents: w.documents || [], events: w.events || [] }; },

    authoriseAccess(documentId, requestingParty, atTime) {
      const refuse = (rule, reason, consent) =>
        ({ refusal: { rule, ...(consent ? { consent } : {}), reason } });

      const doc = world.documents.find((d) => d.id === documentId);
      if (!doc) return refuse("E-CNS-4", `Unknown document ${documentId}.`);

      // A document with no accessGrant was never gated. Saying so explicitly matters:
      // an implementation that gates everything proves no use of the mechanism.
      if (!doc.accessGrant) {
        return { authorisation: { document: documentId, consent: null, grantedTo: requestingParty, atTime } };
      }

      const consent = findConsent(idOf(doc.accessGrant));
      if (!consent) return refuse("E-CNS-4", `accessGrant ${idOf(doc.accessGrant)} is not resolvable.`);

      if (idOf(consent.grantee) !== requestingParty.id) {
        return refuse("E-CNS-2", `${requestingParty.id} is not the grantee of this grant.`, consent.id);
      }

      if (!grantIsEffective("consent", idOf(consent), world.events, consent.validity, atTime)) {
        return refuse("E-CNS-1", `Grant ${idOf(consent)} is not effective at ${atTime}.`, consent.id);
      }

      return { authorisation: { document: documentId, consent: consent.id, grantedTo: requestingParty, atTime } };
    },

    recordEvent(event) {
      if (event.eventType === "consent.revoked") {
        const consent = findConsent(idOf(event.subject));
        // revocable is a capability flag. This is where it acquires a consequence.
        if (consent && consent.revocable === false) {
          return { refusal: { rule: "E-CNS-3", consent: consent.id,
            reason: `Grant ${idOf(consent)} is irrevocable; a consent.revoked event against it is inadmissible.` } };
        }
      }
      world.events = [...world.events, event];
      return { accepted: true };
    },
  };
}

module.exports = { createAdapter, createAgentAdapter, createConsentAdapter };
