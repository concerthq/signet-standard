# SIGNET CDM — Supplier Performance Extension v0.1
**Extension id:** `performance` · **Status:** Working Draft (spec; schemas to follow) · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Extends:** Process/Agent layers; reuses Policy, Decision, Event, SupplierQualification.

## 1. Motivation
Qualification says a supplier *may* transact; nothing tracks how they *perform*.
SLAs, KPIs, scorecards, and service credits are absent — the largest SRM gap. This
extension applies the proven assessment-against-policy pattern (commodity-risk's
CoverageAssessment) to supplier performance, and closes the loop into the
qualification lifecycle: sustained breach is what *drives* `conditional`/`suspended`.

## 2. Design principles
- **D1 — SLAs are Policy.** Targets, thresholds, measurement windows, and
  service-credit formulas are a `Policy` subtype (policyType: serviceLevel) attached
  to a Contract — machine-readable, so an agent and a human evaluate the same rule.
- **D2 — Assessments are derived and event-anchored** (sibling of
  CoverageAssessment): computed from measured values, never hand-entered, hash-anchored.
- **D3 — Performance feeds qualification.** Breach dispositions may open a
  `remediation` OnboardingCase or transition the SupplierQualification — the existing
  state machine, now with a driver.

## 3. New objects
**`ServiceLevelPolicy`** (Policy subtype) — kpis[] {kpiId, name, unit, target,
threshold, direction (higherIsBetter|lowerIsBetter), window, serviceCredit?
{formula, cap}}; escalation rules (escalation-first ordering, catch-all — the
commodity-risk normative rule reapplied).
**`PerformanceAssessment`** — id; supplier; contract; policy; period; measurements[]
{kpiId, measured, target, status: met|warning|breached (closed), source, provenance};
overall {score?, status}; serviceCredits[] {kpiId, amount}; disposition
{action: none|notice|remediationCase|qualificationTransition, reference?};
decision? (mandate-bound where disposition is consequential); provenance. Events:
`performance.assessed`, `sla.breached`, `serviceCredit.accrued`,
`remediation.opened`.

## 4. Boundaries (normative)
SIGNET carries measured values with provenance (monitoring systems remain the source
and system of record); it does not perform measurement. Service credits are computed
obligations, not payment execution.

## 5. Conformance (sketch)
Measurement arithmetic recomputes (status from measured vs threshold/direction);
credits match the policy formula; escalation-first ordering; every disposition
reference resolves (remediation case / qualification transition exists);
assessments event-anchored.
