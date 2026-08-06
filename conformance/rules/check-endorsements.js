#!/usr/bin/env node
/*
 * check-endorsements.js — the endorsement checks, E-MDT and E-CNS.
 *
 * Usage:
 *   node conformance/rules/check-endorsements.js [--adapter <path>] [--out <report.json>]
 * Default adapter: conformance/adapter/reference-adapter.js
 *
 * STATUS: draft. CP-Mandate-enforcement and CP-Consent-revocation are not balloted, so
 * nothing here decides a conformance level, appears in a conformance report, or licenses a
 * mark. It runs now so that the gap the two proposals describe is demonstrable rather than
 * argumentative: the broken adapter cites its mandate and its policies correctly, passes
 * F-SEM, reaches Full — and fails E-MDT-1.
 *
 * The endorsement is atomic: it is earned only if every one of its checks passes. Per-check
 * results are reported for diagnostics.
 *
 * An implementation that exposes neither optional surface is reported as `not-implemented`
 * for that endorsement, which is not a failure. Endorsements are additive.
 *
 * Exit 0 if every implemented endorsement is earned, 1 otherwise.
 *
 * Licensed Apache-2.0 by Concert Foundation.
 */
const fs = require("fs");
const path = require("path");
const { ROOT, loadSchemas, validateDoc, eventHash, verifyChain } = require("../runner/lib.js");

// --- args ---
const args = process.argv.slice(2);
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const adapterPath = path.resolve(getArg("--adapter", path.join(__dirname, "..", "adapter", "reference-adapter.js")));
const outPath = getArg("--out", null);

const FIX = path.join(ROOT, "conformance", "fixtures", "endorsement");
const rd = (f) => JSON.parse(fs.readFileSync(path.join(FIX, f), "utf8"));

const mandate = rd("mandate.json");
const policies = {
  "did:web:buyer.example#policy-approval-10m": rd("policy-approval-10m.json"),
  "did:web:buyer.example#policy-constraint-ceiling": rd("policy-constraint-ceiling.json"),
};
const consents = [rd("consent-revocable.json"), rd("consent-irrevocable.json")];
const documents = rd("documents.json").documents;
const streams = rd("event-streams.json").streams;

const idOf = (x) => (x && (x.id && x.id.id ? x.id.id : x.id)) || x;
const MANDATE_ID = idOf(mandate);
const GATED_DOC = "did:web:supplier.example#doc-financials-2025";
const OPEN_DOC = "did:web:supplier.example#doc-tender-notice";
const BUYER = { scheme: "did", id: "did:web:buyer.example#buyer" };
const AUDITOR = { scheme: "did", id: "did:web:auditor.example#auditor" };

// ---------------------------------------------------------------------------
// harness-side machinery — the suite must know each expected outcome INDEPENDENTLY
// of the implementation, or it is asking the implementation to mark its own work.
// ---------------------------------------------------------------------------

// Hash-chain a fixture stream so what the adapter receives is well formed.
function chain(events) {
  const out = [];
  for (const e of events) {
    const ev = JSON.parse(JSON.stringify(e));
    if (out.length) ev.previousEventHash = eventHash(out[out.length - 1]);
    out.push(ev);
  }
  return out;
}

// A deliberately small evaluator for the restricted comparison subset the suite's own
// fixtures use (`expressionLanguage: "cel"`). Policy.expression is free-form by design, and
// the suite cannot host an engine per language; an implementation may evaluate however it
// likes. What is tested is whether its BEHAVIOUR matches the policy's meaning.
function evaluate(expression, ctx) {
  const m = expression.trim().match(/^([A-Za-z_][\w.]*)\s*(<=|>=|==|!=|<|>)\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) throw new Error(`unsupported expression in suite fixture: ${expression}`);
  const [, lhsPath, op, rhs] = m;
  const lhs = lhsPath.split(".").reduce((o, k) => (o == null ? o : o[k]), ctx);
  if (typeof lhs !== "number") throw new Error(`expression path ${lhsPath} is not numeric`);
  const n = parseFloat(rhs);
  switch (op) {
    case "<=": return lhs <= n; case ">=": return lhs >= n;
    case "<": return lhs < n; case ">": return lhs > n;
    case "==": return lhs === n; default: return lhs !== n;
  }
}

// The projection rule, CDM §7.4.3 — computed here from the event stream alone, which is
// what E-CNS-5 and E-MDT-5 mean by "reproducible by a third party".
function isEffective(kind, subjectId, events, validity, atTime) {
  const t = Date.parse(atTime);
  const forSubject = events.filter((e) => idOf(e.subject) === subjectId && Date.parse(e.timestamp) <= t);
  const granted = forSubject.some((e) => e.eventType === `${kind}.granted`);
  const revoked = forSubject.some((e) => e.eventType === `${kind}.revoked`);
  const startOk = !validity || !validity.startDate || t >= Date.parse(validity.startDate);
  const endOk = !validity || !validity.endDate || t <= Date.parse(validity.endDate);
  return granted && !revoked && startOk && endOk;
}

// ---------------------------------------------------------------------------
const results = [];
const record = (endorsement, check, status, detail) => results.push({ endorsement, check, status, detail });
const { ajv, byFile } = loadSchemas();

// ---------------------------------------------------------------------------
// E-MDT — mandate enforcement
// ---------------------------------------------------------------------------
function runMandateChecks(createAgentAdapter) {
  const agent = createAgentAdapter();
  const threshold = policies["did:web:buyer.example#policy-approval-10m"];
  const ceiling = policies["did:web:buyer.example#policy-constraint-ceiling"];

  const base = {
    mandate,
    policies,
    capability: "award.decision",
    subject: { scheme: "did", id: "did:web:buyer.example#event-1207" },
    atTime: "2026-02-01T00:00:00Z",
  };

  // Attempt an action and observe both the outcome and whether it was evented.
  function attempt(request) {
    const before = agent.getEvents(MANDATE_ID).length;
    let out, threw = null;
    try { out = agent.attemptAction(request); } catch (e) { threw = e; out = {}; }
    const after = agent.getEvents(MANDATE_ID);
    const newEvents = after.slice(before);
    return { out: out || {}, threw, newEvents, allEvents: after };
  }

  const live = chain(streams["mandate-live"]);
  const revoked = chain(streams["mandate-revoked"]);
  const refusals = [];

  // --- E-MDT-1: over the approval threshold, so it MUST NOT complete autonomously ---
  //
  // No approval branch. A conformance run is unattended — no person approves anything during
  // one — so an implementation permitted to satisfy this check by producing a Decision with
  // humanApproval populated would necessarily be fabricating an approval record: writing an
  // identifier for an event that did not occur. That is the behaviour the endorsement exists
  // to detect, and it cannot be fixed by tightening what the field must resolve to. What is
  // testable, and all that is claimed, is that the agent did not proceed on its own authority.
  {
    const action = { value: { amount: 12000000, currency: "EUR" } };
    const withinThreshold = evaluate(threshold.expression, { action });   // harness-side truth
    const r = attempt({ ...base, grantEvents: live, action });
    const refusal = r.out.refusal;
    let ok, detail;
    if (withinThreshold) { ok = false; detail = "suite fixture error: scenario does not exceed the threshold"; }
    else if (refusal) {
      ok = refusal.rule === "E-MDT-1";
      detail = ok ? `refused (${refusal.rule}): ${refusal.reason || ""}`
                  : `refused, but cited ${refusal.rule} rather than E-MDT-1`;
      refusals.push({ check: "E-MDT-1", refusal, newEvents: r.newEvents });
    }
    else if (r.out.decision) {
      ok = false;
      detail = r.out.decision.humanApproval
        ? "COMPLETED AUTONOMOUSLY, citing an approval no conformance run can have produced"
        : "COMPLETED AUTONOMOUSLY above the approval threshold — the record is well-formed and false";
    } else { ok = false; detail = r.threw ? `threw: ${r.threw.message}` : "returned neither a Decision nor a Refusal"; }
    record("E-MDT", "E-MDT-1", ok ? "pass" : "fail", detail);
  }

  // --- E-MDT-2: within all thresholds — the non-triviality guard ---
  {
    const action = { value: { amount: 8000000, currency: "EUR" } };
    const withinThreshold = evaluate(threshold.expression, { action });
    const withinCeiling = evaluate(ceiling.expression, { action });
    const r = attempt({ ...base, grantEvents: live, action });
    const decision = r.out.decision;
    let ok, detail;
    if (!withinThreshold || !withinCeiling) { ok = false; detail = "suite fixture error: scenario is not within all limits"; }
    else if (r.out.refusal) { ok = false; detail = `refused a permitted action (${r.out.refusal.rule}) — a mandate that never permits is as broken as one that never refuses`; }
    else if (decision) {
      const v = validateDoc(ajv, byFile, "decision.schema.json", decision);
      ok = !decision.humanApproval && v.ok;
      detail = decision.humanApproval
        ? "demanded humanApproval for an action inside every limit"
        : (v.ok ? "proceeded autonomously, as the mandate permits" : `Decision invalid: ${v.errors[0]}`);
    } else { ok = false; detail = r.threw ? `threw: ${r.threw.message}` : "returned neither a Decision nor a Refusal"; }
    record("E-MDT", "E-MDT-2", ok ? "pass" : "fail", detail);
  }

  // --- E-MDT-3: capability outside permittedCapabilities ---
  {
    const action = { value: { amount: 1000, currency: "EUR" } };
    const r = attempt({ ...base, grantEvents: live, capability: "contract.sign", action });
    const ok = !!r.out.refusal;
    if (ok) refusals.push({ check: "E-MDT-3", refusal: r.out.refusal, newEvents: r.newEvents });
    record("E-MDT", "E-MDT-3", ok ? "pass" : "fail",
      ok ? `refused (${r.out.refusal.rule})` : "exercised a capability the mandate does not permit");
  }

  // --- E-MDT-4: subject outside scope ---
  {
    const action = { value: { amount: 1000, currency: "EUR" } };
    const r = attempt({ ...base, grantEvents: live, subject: { scheme: "did", id: "did:web:buyer.example#event-9999" }, action });
    const ok = !!r.out.refusal;
    if (ok) refusals.push({ check: "E-MDT-4", refusal: r.out.refusal, newEvents: r.newEvents });
    record("E-MDT", "E-MDT-4", ok ? "pass" : "fail",
      ok ? `refused (${r.out.refusal.rule})` : "acted on a subject outside the mandate's scope");
  }

  // --- E-MDT-5: mandate not effective (revoked), per the projection rule ---
  {
    const atTime = "2026-04-01T00:00:00Z";
    const effective = isEffective("mandate", MANDATE_ID, revoked, mandate.validity, atTime);  // harness-side truth
    const action = { value: { amount: 1000, currency: "EUR" } };
    const r = attempt({ ...base, grantEvents: revoked, atTime, action });
    const ok = !effective && !!r.out.refusal;
    if (r.out.refusal) refusals.push({ check: "E-MDT-5", refusal: r.out.refusal, newEvents: r.newEvents });
    record("E-MDT", "E-MDT-5", ok ? "pass" : "fail",
      effective ? "suite fixture error: mandate is still effective at atTime"
        : (r.out.refusal ? `refused (${r.out.refusal.rule})` : "acted under a revoked mandate"));
  }

  // --- E-MDT-6: constraint breach, with an approval offered — must NOT cure it ---
  {
    const action = { value: { amount: 25000000, currency: "EUR" } };
    const withinCeiling = evaluate(ceiling.expression, { action });
    const r = attempt({
      ...base, grantEvents: live, action,
      humanApproval: { scheme: "did", id: "did:web:buyer.example#approval-771" },
    });
    let ok, detail;
    if (withinCeiling) { ok = false; detail = "suite fixture error: scenario does not breach the ceiling"; }
    else if (r.out.refusal) { ok = true; detail = `refused (${r.out.refusal.rule}) despite an approval being offered`; refusals.push({ check: "E-MDT-6", refusal: r.out.refusal, newEvents: r.newEvents }); }
    else { ok = false; detail = "an approval cured a hard limit — a hard limit an approval can override is not a hard limit"; }
    record("E-MDT", "E-MDT-6", ok ? "pass" : "fail", detail);
  }

  // --- E-MDT-7: every refusal is evented ---
  {
    const unevented = refusals.filter(
      (r) => !r.newEvents.some((e) => e.eventType === "mandate.refused" && idOf(e.subject) === MANDATE_ID)
    );
    const malformed = refusals.flatMap((r) => r.newEvents)
      .filter((e) => e.eventType === "mandate.refused")
      .filter((e) => !(e.id && e.subject && e.actor && e.timestamp && e.provenance));
    const ok = refusals.length > 0 && unevented.length === 0 && malformed.length === 0;
    record("E-MDT", "E-MDT-7", ok ? "pass" : "fail",
      refusals.length === 0
        ? "no refusal was produced by any check, so nothing was evented"
        : unevented.length
          ? `not evented: ${unevented.map((r) => r.check).join(", ")} — refused and never attempted are indistinguishable in the record`
          : malformed.length ? "mandate.refused events are missing required fields"
            : `${refusals.length} refusals, each evented as mandate.refused`);
  }

  // The refusal event stream must itself remain a well-formed chain.
  {
    const all = agent.getEvents(MANDATE_ID);
    if (all.length > 1) {
      const chainOk = verifyChain(all).ok;
      if (!chainOk) record("E-MDT", "E-MDT-7", "fail", "refusal events do not hash-chain (C-EVT applies to them too)");
    }
  }
}

// ---------------------------------------------------------------------------
// E-CNS — consent enforcement
// ---------------------------------------------------------------------------
function runConsentChecks(createConsentAdapter) {
  const revocable = consents[0], irrevocable = consents[1];
  const REVOCABLE_ID = idOf(revocable);

  function world(streamName) {
    const a = createConsentAdapter();
    a.load({ consents, documents, events: chain(streams[streamName]) });
    return { adapter: a, events: chain(streams[streamName]) };
  }

  // Recorded for E-CNS-5: what the adapter decided, and what the event stream says.
  const reproducibility = [];
  function authorise(streamName, documentId, party, atTime) {
    const { adapter, events } = world(streamName);
    let out, threw = null;
    try { out = adapter.authoriseAccess(documentId, party, atTime); } catch (e) { threw = e; out = {}; }
    const expectEffective = isEffective("consent", REVOCABLE_ID, events, revocable.validity, atTime);
    reproducibility.push({
      streamName, documentId, party: party.id, atTime,
      adapterAuthorised: !!(out && out.authorisation),
      harnessEffective: expectEffective,
      gated: documentId === GATED_DOC,
      isGrantee: party.id === idOf(revocable.grantee),
    });
    return { out: out || {}, threw, expectEffective };
  }

  // --- E-CNS-1: not effective at T must not authorise at T ---
  {
    const revokedCase = authorise("consent-revoked", GATED_DOC, BUYER, "2026-04-01T00:00:00Z");
    const expiredCase = authorise("consent-live", GATED_DOC, BUYER, "2027-06-01T00:00:00Z");
    const liveCase = authorise("consent-live", GATED_DOC, BUYER, "2026-02-01T00:00:00Z");   // positive control
    const ok = !revokedCase.out.authorisation && !!revokedCase.out.refusal
      && !expiredCase.out.authorisation && !!expiredCase.out.refusal
      && !!liveCase.out.authorisation;
    record("E-CNS", "E-CNS-1", ok ? "pass" : "fail",
      ok ? "revoked refused, expired refused, live grant authorised"
        : `revoked=${revokedCase.out.authorisation ? "AUTHORISED" : "refused"}, ` +
          `outside validity=${expiredCase.out.authorisation ? "AUTHORISED" : "refused"}, ` +
          `live=${liveCase.out.authorisation ? "authorised" : "REFUSED (a live grant must authorise)"}`);
  }

  // --- E-CNS-2: a party not named in grantee ---
  {
    const r = authorise("consent-live", GATED_DOC, AUDITOR, "2026-02-01T00:00:00Z");
    const ok = !r.out.authorisation && !!r.out.refusal;
    record("E-CNS", "E-CNS-2", ok ? "pass" : "fail",
      ok ? `refused (${r.out.refusal.rule})` : "authorised a party absent from grantee");
  }

  // --- E-CNS-3: revocation of an irrevocable grant must be rejected ---
  {
    const { adapter } = world("consent-live");
    const attempt = chain(streams["irrevocable-revocation-attempt"])[0];
    let out, threw = null;
    try { out = adapter.recordEvent(attempt); } catch (e) { threw = e; out = {}; }
    const rejected = !!(out && out.refusal) && !(out && out.accepted);
    record("E-CNS", "E-CNS-3", rejected ? "pass" : "fail",
      rejected ? `rejected (${out.refusal.rule}) — revocable: false acquires its first enforced consequence`
        : threw ? `threw instead of returning a Refusal: ${threw.message}`
          : `accepted a consent.revoked against ${idOf(irrevocable)}, whose revocable is false`);
  }

  // --- E-CNS-4: accessGrant is honoured, and absence of one is not a gate ---
  {
    const gated = authorise("consent-live", GATED_DOC, BUYER, "2026-02-01T00:00:00Z");
    const open = authorise("consent-live", OPEN_DOC, AUDITOR, "2026-02-01T00:00:00Z");
    const citesConsent = !!(gated.out.authorisation && gated.out.authorisation.consent
      && idOf(gated.out.authorisation.consent) === REVOCABLE_ID);
    const openUngated = !!(open.out.authorisation) && !open.out.authorisation.consent;
    const ok = citesConsent && openUngated;
    record("E-CNS", "E-CNS-4", ok ? "pass" : "fail",
      ok ? "gated document resolved through its Consent; ungated document not gated by it"
        : `${citesConsent ? "" : "gated document not resolved through its accessGrant; "}` +
          `${openUngated ? "" : "ungated document was gated (or refused) — an implementation that gates everything, or nothing, proves no use of the mechanism"}`);
  }

  // --- E-CNS-5: the determination is reproducible from the event stream alone ---
  {
    const divergent = reproducibility.filter((r) => {
      if (!r.gated) return false;                       // ungated documents are not projections
      const expected = r.harnessEffective && r.isGrantee;
      return r.adapterAuthorised !== expected;
    });
    const ok = divergent.length === 0 && reproducibility.length > 0;
    record("E-CNS", "E-CNS-5", ok ? "pass" : "fail",
      ok ? `${reproducibility.filter((r) => r.gated).length} gated decisions reproduced independently from the stream`
        : divergent.map((d) => `${d.streamName}@${d.atTime}: adapter=${d.adapterAuthorised}, stream says=${d.harnessEffective && d.isGrantee}`).join("; "));
  }
}

// ---------------------------------------------------------------------------
// Preflight: the fixtures are CDM objects and must themselves be conformant. A suite that
// tests implementations with invalid fixtures is testing nothing.
function preflight() {
  const cases = [
    ["mandate.schema.json", mandate, "mandate.json"],
    ...Object.entries(policies).map(([id, p]) => ["policy.schema.json", p, id]),
    ...consents.map((c) => ["consent.schema.json", c, idOf(c)]),
  ];
  const bad = cases
    .map(([schema, doc, label]) => ({ label, r: validateDoc(ajv, byFile, schema, doc) }))
    .filter((x) => !x.r.ok);
  if (bad.length) {
    console.error("Endorsement fixtures are not valid CDM objects:");
    for (const b of bad) console.error(`  ${b.label}: ${b.r.errors.slice(0, 2).join("; ")}`);
    process.exit(2);
  }
}

function main() {
  preflight();
  const mod = require(adapterPath);
  const implemented = { "E-MDT": typeof mod.createAgentAdapter === "function",
                        "E-CNS": typeof mod.createConsentAdapter === "function" };

  if (implemented["E-MDT"]) runMandateChecks(mod.createAgentAdapter);
  if (implemented["E-CNS"]) runConsentChecks(mod.createConsentAdapter);

  const endorsements = ["E-MDT", "E-CNS"].map((e) => {
    const checks = results.filter((r) => r.endorsement === e);
    const status = !implemented[e] ? "not-implemented"
      : checks.every((c) => c.status === "pass") ? "earned" : "not-earned";
    return { endorsement: e, status, checks };
  });

  const report = {
    standard: "SIGNET",
    artifact: "endorsement-checks",
    status: "draft — decides no conformance level and licenses no mark",
    cdmVersion: "v0.1",
    suiteVersion: "v0.1",
    adapter: path.basename(adapterPath),
    timestamp: new Date().toISOString(),
    endorsements,
  };

  const dest = outPath || path.join(ROOT, "conformance", "reports", `${path.basename(adapterPath, ".js")}-endorsement-report.json`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(report, null, 2) + "\n");

  console.log(`\nSIGNET Endorsement Checks (DRAFT — not in force) — adapter: ${report.adapter}`);
  console.log("─".repeat(72));
  for (const e of endorsements) {
    if (e.status === "not-implemented") {
      console.log(`  ${e.endorsement}  not implemented — the optional adapter surface is absent (not a failure)`);
      continue;
    }
    console.log(`  ${e.endorsement}  ${e.status.toUpperCase()}`);
    for (const c of e.checks) console.log(`    [${c.status === "pass" ? "PASS" : "FAIL"}]  ${c.check.padEnd(9)} ${c.detail}`);
  }
  console.log("─".repeat(72));
  const earned = endorsements.filter((e) => e.status === "earned").map((e) => e.endorsement);
  const failed = endorsements.filter((e) => e.status === "not-earned").map((e) => e.endorsement);
  console.log(`  EARNED: ${earned.length ? earned.join(", ") : "none"}${failed.length ? `   NOT EARNED: ${failed.join(", ")}` : ""}`);
  console.log(`  Report: ${path.relative(ROOT, dest)}\n`);

  process.exit(failed.length ? 1 : 0);
}

main();
