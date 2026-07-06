# SIGNET CDM — Contract Amendments Extension v0.1
**Extension id:** `amendments` · **Status:** Working Draft (spec; schemas to follow) · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Extends:** Process layer; reuses Contract, Decision, Event, Provenance.

## 1. Motivation
Contracts change — variations, renewals, extensions, terminations, novations — and
the core Contract cannot evolve, which contradicts an append-only event trail in an
adopter's first week. This extension models change as event-anchored deltas.

## 2. Design principles
- **D1 — Amendments are deltas, not rewrites.** The original Contract is immutable;
  an `Amendment` records the change; current state is derivable by applying the
  amendment sequence; history is tamper-evident by construction.
- **D2 — Amendments are governed decisions.** Each carries a Decision (mandate-bound;
  value-increase thresholds force human approval — the €10M-ceiling pattern applied
  to change control).

## 3. New object
**`Amendment`** — id; contract (ref); amendmentType (variation|extension|renewal|
priceAdjustment|scopeChange|novation|termination — open); sequence (integer,
per-contract, gapless); changes[] {path (JSON Pointer into Contract), previousValue,
newValue} and/or narrative; valueDelta? {amount,currency}; effectiveDate; reason;
decision (Decision ref); status: draft|pendingApproval|executed|rejected (closed);
provenance. Events: `amendment.proposed`, `amendment.executed`,
`contract.terminated`. Core addition (namespaced): `Contract.amendments[]`
back-references. Derived-state rule: implementations MUST derive current contract
state as original + executed amendments in sequence order.

## 4. Boundaries
Not a redlining/negotiation-drafting tool (CLM systems remain the drafting record);
SIGNET carries the executed change and its governance.

## 5. Conformance (sketch)
Sequence gapless per contract; every executed amendment carries a resolvable
Decision; novation updates party references coherently; termination is terminal;
replaying deltas from the original yields the asserted current state (deterministic
derivation — the cross-object check).
