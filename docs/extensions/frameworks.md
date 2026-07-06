# SIGNET CDM — Framework Agreements Extension v0.1
**Extension id:** `frameworks` · **Status:** Working Draft (spec; schemas to follow) · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Extends:** Process layer; reuses Contract, SourcingEvent, Award, Policy, Decision.

## 1. Motivation
Frameworks and call-offs are how much of enterprise — and virtually all EU/UK public
— procurement actually buys. The hedging extension already references
`callOffUnderFramework` with nothing behind it. This extension supplies the objects,
aligned to UK Procurement Act 2023 / EU directive mechanics.

## 2. Design principles
- **D1 — A framework is a Contract subtype; a call-off is a profile of the sourcing
  flow** (direct award or mini-competition), not new machinery.
- **D2 — Drawdown is event-anchored arithmetic.** Ceiling vs cumulative call-off
  value is a conformance-checkable invariant, not a report.

## 3. New objects
**`FrameworkAgreement`** (Contract subtype) — suppliers[] {party, ranking?, lots[]};
ceilingValue; validity (max durations per regime noted informatively); callOffRules
(Policy ref: directAwardConditions, miniCompetitionRules, allocation:
ranking|rotation|competition); drawdown {cumulativeValue, remainingValue} (derived).
**`CallOff`** — id; framework (ref); route: directAward|miniCompetition (closed);
miniCompetition? (SourcingEvent ref — the reuse: a mini-competition IS a
SourcingEvent scoped to framework suppliers); awardedParty; value; contract
(resulting Contract ref); decision (mandate-bound — routine call-offs within agent
ceiling auto-clear; above, human approval); provenance. Events: `framework.awarded`,
`callOff.made`, `framework.ceilingWarning`, `framework.expired`.

## 4. Boundaries
Regime-specific legal limits (duration caps, transparency notices) are represented
as Policy and attested compliance, not enforced legal advice.

## 5. Conformance (sketch)
Σ call-off values ≤ ceiling (the drawdown invariant, within tolerance); direct
awards satisfy the framework's directAwardConditions policy; mini-competitions
resolve to SourcingEvents restricted to framework suppliers; every CallOff's
contract resolves; expiry blocks new call-offs.
