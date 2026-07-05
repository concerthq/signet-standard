// agent-runtime.js — the SIGNET agent harness.
//
// Orchestrates a governed agent action: read a SourcingEvent, check the Mandate,
// apply the evaluation Policy to each Submission via the (pluggable) reasoner,
// propose an Award as a Decision carrying rationale + inputs + policies + provenance,
// and write the whole sequence as a hash-chained Event stream.
//
// This is the "Harness" in Agent = Model + Harness: the reasoner decides, the harness
// makes the decision governed, accountable, and verifiable.
const fs = require("fs");
const path = require("path");
const { eventHash } = require("../conformance/runner/lib.js");
const { parseWeights, shortId } = require("./reasoner.js");

const DIR = __dirname;
const rd = (p) => JSON.parse(fs.readFileSync(path.join(DIR, p), "utf8"));
const rdRepo = (p) => JSON.parse(fs.readFileSync(path.join(DIR, "..", p), "utf8"));

const AGENT = { scheme: "did", id: "did:web:buyer.example#agent-eval-3" };
const TS = "2026-06-22T00:00:00Z";
const prov = (derivedFrom = [], usedPolicies = []) => ({
  generatedBy: AGENT, generatedAt: TS,
  ...(derivedFrom.length ? { derivedFrom } : {}),
  ...(usedPolicies.length ? { usedPolicies } : {}),
});

function runScenario({ reasoner }) {
  const trace = [];
  const log = (s) => trace.push(s);

  // 1. Read the inputs the agent operates on.
  const event = rdRepo("examples/sourcing-event.json");
  const policy = rdRepo("examples/policy-evaluation.json");
  const mandate = rd("mandate.json");
  const submissions = [rd("submissions/submission-a.json"), rd("submissions/submission-b.json")];
  const assess = rd("assessment-inputs.json");
  const weights = parseWeights(policy);
  const events = [];
  const emit = (eventType, subject, payload) => {
    const e = { type: "Event", id: { scheme: "did", id: `did:web:buyer.example#evt-${events.length + 1}` },
      eventType, subject: { scheme: "did", id: subject }, actor: AGENT, timestamp: TS, payload, provenance: prov() };
    if (events.length) e.previousEventHash = eventHash(events[events.length - 1]);
    events.push(e);
    return e;
  };

  log(`Agent ${shortId(AGENT.id)} reads SourcingEvent "${event.title}" (${shortId(event.id.id)}), value ${fmt(event.value)}.`);
  log(`Evaluation policy referenced: ${shortId(policy.id.id)} — "${policy.humanReadable}"`);
  emit("agent.read", event.id.id, { read: ["SourcingEvent", "Policy", "Submissions"] });

  // 2. Mandate gate — capabilities + autonomous-value ceiling (human-in-the-loop).
  const need = ["evaluate.submission", "award.decision"];
  const permitted = need.every(c => mandate.permittedCapabilities.includes(c));
  if (!permitted) throw new Error("mandate does not permit required capabilities");
  const ceiling = mandate.scope.maxAutonomousValue;
  const requiresHumanApproval = event.value.amount > ceiling.amount;
  log(`Mandate ${shortId(mandate.id.id)} permits [${need.join(", ")}] \u2713`);
  log(`Autonomous-value ceiling ${fmt(ceiling)}; event value ${fmt(event.value)} \u2192 ` +
      (requiresHumanApproval ? "EXCEEDS ceiling \u2192 human approval required before award." : "within ceiling \u2192 fully autonomous."));

  // 3. Derive price scores from the bid values (best price = 1.0), then evaluate each submission.
  const minPrice = Math.min(...submissions.map(s => s.value.amount));
  const evaluations = [];
  for (const sub of submissions) {
    const priceScore = Math.round((minPrice / sub.value.amount) * 1e6) / 1e6;
    const inputScores = { price: priceScore, quality: assess[sub.id.id].quality, social: assess[sub.id.id].social };
    const out = reasoner.invoke("evaluate.submission", { weights, scores: inputScores });   // MCP-style tool call
    const evaluation = {
      "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
      type: "Evaluation",
      id: { scheme: "did", id: `did:web:buyer.example#eval-${shortId(sub.id.id)}` },
      submission: sub.id,
      criteria: policy.id,
      scores: out.scores,
      evaluatedBy: AGENT,
      result: "ranked",
    };
    evaluations.push({ evaluation, total: out.total, submission: sub.id.id });
    log(`  Evaluated ${shortId(sub.id.id)} (bid ${fmt(sub.value)}): price ${inputScores.price} quality ${inputScores.quality} social ${inputScores.social} \u2192 score ${out.total}`);
    emit("submission.evaluated", sub.id.id, { score: out.total });
  }

  // 4. Propose the award (reasoner ranks; harness records the decision).
  const decisionOut = reasoner.invoke("award.decision",
    { evaluations: evaluations.map(e => ({ submission: e.submission, total: e.total })), weights });   // MCP-style tool call
  const winnerSub = submissions.find(s => s.id.id === decisionOut.winner);
  log(`Decision: award to ${shortId(decisionOut.winner)}. ${decisionOut.rationale}`);

  // 5. The Decision — the accountability record.
  const decision = {
    "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
    type: "Decision",
    id: { scheme: "did", id: "did:web:buyer.example#decision-8842" },
    decisionType: "award",
    madeBy: AGENT,
    underMandate: mandate.id,
    inputs: submissions.map(s => s.id),
    policiesApplied: [policy.id],
    rationale: decisionOut.rationale,
    outcome: { awardedSubmission: decisionOut.winner, ranking: decisionOut.ranking },
    provenance: prov(submissions.map(s => s.id), [policy.id]),
  };
  let approval = null;
  if (requiresHumanApproval) {
    decision.humanApproval = { scheme: "did", id: "did:web:buyer.example#approval-771" };
    log(`Human approval ${shortId(decision.humanApproval.id)} attached (mandate threshold exceeded).`);
    // Emit the verifiable Approval the humanApproval reference resolves to (identity profile).
    // Pseudonymous approver, role, and a delegation-of-authority credential whose ceiling
    // is checked against the award value — human authority made symmetric with the agent's Mandate.
    const APPROVER = { scheme: "did", id: "did:web:buyer.example#officer-7c2f" };
    approval = {
      "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
      type: "Approval",
      id: decision.humanApproval,
      decision: decision.id,
      approver: APPROVER,
      role: "category-director",
      underMandate: { scheme: "did", id: "did:web:buyer.example#mandate-doa-band4" },
      authorityCredential: {
        id: "urn:cred:doa:officer-7c2f",
        type: ["VerifiableCredential", "delegationOfAuthority"],
        issuer: { scheme: "did", id: "did:web:buyer.example#buyer" },
        issuanceDate: "2026-01-01T00:00:00Z",
        expirationDate: "2026-12-31T23:59:59Z",
        credentialSubject: { authorityBand: "band-4", approvalCeiling: { amount: 25000000, currency: "EUR" } },
        proof: { type: "organisationAttestation", attestedBy: "did:web:buyer.example#buyer" },
      },
      approvedAt: TS,
      provenance: { generatedBy: APPROVER, generatedAt: TS },
    };
    log(`Approval ${shortId(approval.id.id)}: ${shortId(APPROVER.id)} (${approval.role}), authority band-4 ceiling ${fmt(approval.authorityCredential.credentialSubject.approvalCeiling)} ≥ award ${fmt(winnerSub.value)}.`);
  }
  emit("decision.made", decision.id.id, { decisionType: "award", awarded: decisionOut.winner });

  // 6. The Award.
  const award = {
    "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
    type: "Award",
    id: { scheme: "did", id: "did:web:buyer.example#award-2208" },
    sourcingEvent: event.id,
    awardedParty: winnerSub.submittingParty,
    value: winnerSub.value,
    rationale: decisionOut.rationale,
    decision: decision.id,
    standstillPeriod: { startDate: "2026-08-16T00:00:00Z", endDate: "2026-08-26T00:00:00Z" },
  };
  emit("award.decided", award.id.id, { awardedParty: winnerSub.submittingParty.id });
  log(`Award ${shortId(award.id.id)} \u2192 ${shortId(winnerSub.submittingParty.id)} at ${fmt(winnerSub.value)} (10-day standstill).`);
  log(`Event stream: ${events.length} events, hash-chained.`);

  return { event, policy, mandate, weights, evaluations: evaluations.map(e => e.evaluation), decision, approval, award, events, requiresHumanApproval, trace };
}

function fmt(v) { return `${(v.amount).toLocaleString("en-GB")} ${v.currency}`; }

module.exports = { runScenario };
