# Withdrawal of the v1.0 proposal train, and the defects it recorded

**Date:** 2026-08-20 · **Baseline:** v0.14.0 · **Tier:** 1 (governance record)

## What is withdrawn

The seven proposals registered as the v1.0 train are withdrawn to a parked state. They are
**not rejected on merit** and this record is not an adjudication of any of them. Nothing in
`schema/`, a closed codelist, or `conformance/` is touched by this withdrawal, because — as
`CHANGELOG` 0.14.0 states — nothing in the train ever touched a normative artifact.

## Why

Registration is Tier 1; adoption is Tier 2 and requires a recorded resolution. A process in
which accumulating proposals costs one review and clearing them requires a body that does not
exist will accumulate. Seven proposals and twenty-two open gates is that arithmetic, not a
failure of anyone's judgement.

The queue also has a demonstrated failure mode. A careful reader working inside this repository
read `Policy.appliesTo` as a shipped defect and built a proposal's central argument on it. It is
not shipped; `CP-Policy-Applicability` **proposes to add it**. `GOVERNANCE.md` warns in terms
that a proposal's presence here is not a statement that it has been accepted and that it is not
part of the standard. The warning did not prevent the error. Proximity beat the disclaimer, and
implementers will read the tree the same way.

## What is kept

The **findings** are facts about current artifacts, verifiable against the tree today and
independent of any remedy. They survive as defect entries. The **remedies** are parked.

| # | Defect | Verifiable at |
|---|---|---|
| D-1 | `Mandate` asserts a lifecycle it can record on no surface. `mandate.granted` and `mandate.revoked` are closed core codes; the object carries `validity` and nothing else. | `schema/mandate.schema.json`, `codelists/eventTypeCore.csv` |
| D-2 | No artifact maps events to state changes, so design principle §1.7 and GRT-1 are not executable by an implementer. | absence |
| D-3 | `sourcingEvent.published` names a transition to a state absent from the enum. | `codelists/eventType.csv`, `schema/sourcing-event.schema.json` |
| D-4 | No rule states which surface governs where a stored `status` and an event stream disagree — the stated reason status fields on `Consent` were rejected. | `governance/proposals/README.md` |
| D-5 | `Bid.status` carries `superseded`, a relation, which no event can project. | `schema/bid.schema.json` |
| D-6 | `eventType` has nine codes for eighteen objects and stops at `contract.signed`; the implementation stage has none. | `codelists/eventType.csv` |
| D-7 | `Mandate.scope` is required and unconstrained; `{}` satisfies it. | `schema/mandate.schema.json` |
| D-8 | A relying party without stream access cannot determine whether a mandate is effective. The human side has `Approval`, an authority credential, and a Full-level check; the machine side has none. | `schema/approval.schema.json`, `conformance/rules/check-identity.js` |

D-1 to D-5 are addressed by IAR-0002 and the state model landing with it. D-6, D-7 and D-8 stand
open and are recorded, not remedied.

## Standing rule

No further change proposals are registered until the Standards Committee is constituted, with
one carve-out: a defect actively causing harm may be corrected under the bootstrap clause, with
an interim approval record, a stated comment period, and the smallest Tier 2 surface that fixes
it.

Defects are recorded as defects. A defect register asserts facts and adopts nothing; it is Tier 1
and carries no gates.

## Two matters already determined for the Committee's first session

- `governance/reviews/2026-08-normative-approval-audit.md` recommends a single resolution
  acknowledging the eleven prior normative changes as predating the written rule, rather than
  eleven back-dated approvals.
- The interests and recusals register initiates on constitution. Several artifacts have cited it
  as though it existed, including proposals now withdrawn.
