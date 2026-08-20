# IR-2026-08 — Interim resolution: normative changes predating the written rule

| Field | Value |
|---|---|
| **Record** | IR-2026-08 |
| **Date** | 20 August 2026 |
| **Class** | Interim resolution under the bootstrap clause. Non-normative governance record. |
| **Authority** | Bootstrap clause, [`governance/README.md`](README.md#the-bootstrap-clause). The Standards Committee is not constituted. |
| **Subject** | The eleven normative changes made between v0.1.0 and 20 August 2026 that carry no approval record |
| **Source** | [`reviews/2026-08-normative-approval-audit.md`](reviews/2026-08-normative-approval-audit.md) |
| **Ratifies** | Nothing. The Committee may amend or reverse this in full once constituted. |

## What this resolves

The approval audit found twelve commits touching a Tier 2 path since v0.1.0. One carries an
approving review. **Eleven do not**, four of those reached `main` with no pull request at all,
and **none of the twelve carried a comment period** — which `docs/specification.md` §12.2 and
`CONTRIBUTING.md` had claimed for normative changes since v0.1.0.

`GOVERNANCE.md` took effect on 20 August 2026 and states that changes merged before that date
followed prior practice and are not relabelled. This resolution is the consequence of that
sentence: it says what the eleven are, and what their status is, without pretending they went
through a process that did not exist.

## Resolution

**R1 — The eleven stand.** Each remains in force as part of the shipped standard at the version
in which it landed. Nothing is reverted, re-run, or re-reviewed as a condition of this record.

**R2 — They are recorded as predating the rule, not as having satisfied it.** No approval is
backdated and no comment period is asserted for any of them. Where a claim about process is made
about this period, this record governs it.

**R3 — One resolution, not eleven.** Eleven back-dated approvals would be a fabrication of
evidence. A single record acknowledging the position is the honest form, and it is what the audit
recommends.

**R4 — This is not an assessment of merit.** Every one of the eleven passed CI at the time it
merged, and the substance of at least one — the commodity-risk extension — was reviewed twice on
the record. The gap is in evidence of process, not in care.

**R5 — The Committee reviews this on constitution.** Along with every other interim resolution.
It may ratify, amend, or reverse it, and it may direct that any of the eleven be re-examined.

## The eleven

Listed by the commit that made the normative change. Full detail, including which arrived by pull
request, is in the audit.

| Commit | Date | Normative surface touched |
|---|---|---|
| `5e97c97` | 2026-08-06 | `conformance/` |
| `8ab5974` | 2026-08-06 | `conformance/` |
| `2e1f23f` | 2026-08-06 | `codelists/eventTypeCore.csv` (closed subset) |
| `78e6b3f` | 2026-08-06 | `governance/mark-grammar.md` and the two closed registers |
| `9ee0b71` | 2026-07-05 | `schema/` — six commodity-risk schemas |
| `48be8d3` | 2026-07-05 | `schema/approval.schema.json` |
| `5646d74` | 2026-07-01 | `schema/` — `Auction`, `Bid` |
| `532a308` | 2026-06-25 | `schema/` — settlement linkage |
| `291ebbf` | 2026-06-24 | `schema/` — `OnboardingCase`, `SupplierQualification` |
| `7ab9358` | 2026-06-23 | `conformance/` — the harness |
| `9514d01` | 2026-06-22 | `schema/` — process layer, EN 16931 blocks |

The twelfth, `b0e9402` (CP-Extension-Composition Part 1, 2026-08-19), carries an approving review
and is outside this resolution.

## What this does not do

It does not amend `docs/specification.md` §12.2 or the wiki, which are corrected separately in the
same release. It does not create a comment period retrospectively, and it does not make any of the
eleven a precedent for merging a normative change without one. From 20 August 2026 the rule in
`GOVERNANCE.md` applies, and a departure from it is recorded as a departure — as one already has
been, in [`IAR-0002`](IAR-0002-state-model.md).
