# Normative-change approval audit — v0.1.0 to v0.14.0

**Date:** 20 August 2026 · **Class:** non-normative governance record
**Scope:** every commit since `v0.1.0` touching a Tier 2 path as
[`GOVERNANCE.md`](../../GOVERNANCE.md) defines them — `schema/`, closed codelists
(`codelists/eventTypeCore.csv`), `conformance/levels.md`, `conformance/suite/`,
`conformance/report-schema.json`, `governance/mark-grammar.md`, and the two closed registers.

This audit records what happened. It does **not** relabel any of it: `GOVERNANCE.md` takes
effect on 20 August 2026 and states that its own merge is the last change under prior practice.
Everything below predates that date and followed prior practice, which had no written rule to
follow. The point of the audit is to know the position before someone else establishes it.

## Finding

**Twelve commits touched a Tier 2 path. One carries an approving review.**

| Commit | Date | Route | Approval record |
|---|---|---|---|
| `b0e9402` | 2026-08-19 | PR #19 | **`concertcustodian` APPROVED** |
| `5e97c97` | 2026-08-06 | PR #18 | none |
| `8ab5974` | 2026-08-06 | PR #17 | none |
| `2e1f23f` | 2026-08-06 | PR #17 | none |
| `78e6b3f` | 2026-08-06 | PR #17 | none — but the mark grammar carries its own interim resolutions R1–R6 |
| `9ee0b71` | 2026-07-05 | **direct to `main`** | two written review records in this directory |
| `48be8d3` | 2026-07-05 | **direct to `main`** | none |
| `5646d74` | 2026-07-01 | **direct to `main`** | none |
| `532a308` | 2026-06-25 | PR #11 | none |
| `291ebbf` | 2026-06-24 | **direct to `main`** | none |
| `7ab9358` | 2026-06-23 | PR #8 | none |
| `9514d01` | 2026-06-22 | PR #1 | none |

Every commit was authored and merged by `concertfoundation`.

Counted against the Tier 2 requirements now in force:

- **Approving review: 1 of 12.**
- **Written approval record of any kind: 2 of 12** — PR #19's review, and the commodity-risk
  extension's two review memos.
- **Arrived by pull request: 8 of 12.** Four schema additions reached `main` as direct commits:
  the commodity-risk schemas (six files), the auction extension (`Auction`, `Bid`), the
  onboarding extension (`OnboardingCase`, `SupplierQualification`), and the identity profile's
  `Approval`.
- **Stated comment period: 0 of 12.**
- **Recorded resolution adopting the change, in the Tier 2 sense: 0 of 12.**

## What this does and does not mean

**It is not evidence that anything merged is wrong.** Every one of these commits passed CI, and
the twelve include work that was reviewed carefully in substance — the commodity-risk extension
was reviewed twice and its second memo records required changes that were made before merge.
The gap is procedural, and it is a gap in *evidence of process*, not a gap in care.

**It does mean v1.0 cannot claim its normative content went through a documented process.** The
specification and `CONTRIBUTING.md` have both said, since v0.1.0, that normative changes go
through a revision process with a published comment period. For twelve out of twelve, no comment
period was stated. That is a discrepancy between what the repository claims about itself and
what it can show — the same shape as the two conformance findings that produced the endorsement
proposals, and of the same class as the published governance page describing a Committee that is
not constituted.

## Secondary finding — attribution in this directory

The two commodity-risk records are titled *"Standards Committee Review Memo"* and *"Standards
Committee Record of Resubmission Review"*. No Standards Committee is constituted, and the
bootstrap clause in [`governance/README.md`](../README.md) says so. Both memos close with
*"Recorded **for** the Standards Committee"* — which is accurate, and is the careful reading —
but the titles read as though a constituted body performed the review.

Retitling them would be relabelling a record after the fact, which this audit deliberately does
not do. The correct fix is a note on each stating the arrangement under which it was taken, in
the same form the registers already use.

## Recommended actions

Recorded, not taken. Each is a decision.

1. **Retrospective interim resolutions** for the eleven Tier 2 changes with no approval record.
   The honest form is one resolution recording that these predate the written rule, listing them,
   and stating that they stand unless the Committee reverses them — not eleven back-dated
   approvals, which would be exactly the retroactive relabelling `GOVERNANCE.md` forbids.
2. **A note on each commodity-risk memo** recording that it was taken under the bootstrap clause
   rather than by a constituted Committee.
3. **Reconcile the claim in `CONTRIBUTING.md` and the specification** that normative changes
   carry a published comment period. From 20 August 2026 that becomes true. Before it, it was
   not, and the v1.0 positioning copy should not imply otherwise.
4. **Decide whether v1.0 requires the nine registered proposals to carry resolutions.** Without
   them, v1.0 arrives with seven normative changes and no evidence any went through the process
   the specification describes. This is the item most likely to be found by someone else.
