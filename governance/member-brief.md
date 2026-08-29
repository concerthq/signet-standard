# Member brief — reading path into the SIGNET repository

**Status:** Non-normative orientation for incoming Committee members. Where this brief and any artifact disagree, the artifact governs — that rule itself is the first thing to internalise (`GOVERNANCE.md`, "the schemas take precedence over all prose").

## One paragraph of orientation

SIGNET is an open Common Data Model for procurement and commerce: eighteen core root objects on a spine from Need to Obligation, a hash-chained Event primitive, machine-readable Policy and Decision objects, JSON Schema Draft-07 with JSON-LD serialisation, a public conformance harness, and extensions that land spec-first. Concert Foundation stewards it and operates no implementation. Until you execute the constitution instrument, every decision since 20 August 2026 has been taken by one person under a bootstrap clause, in writing, reversible by you.

## The reading path (order matters)

| # | Read | For |
|---|---|---|
| 1 | `governance/README.md` | The bootstrap clause, the status vocabulary (Draft / Interim resolution / Ratified), the claim triad (modelled ≠ tested ≠ certified), the index of the twenty interim resolutions you will be asked to ratify |
| 2 | `GOVERNANCE.md` | Tiers, the two-account limitation stated plainly, the effective date, what changes by which route |
| 3 | `governance/WITHDRAWAL-2026-08.md` + `governance/proposals/README.md` | Why seven proposals are parked, the standing rule, the v1.0 train and its twenty-two gates |
| 4 | `governance/defects.md` | The fact base. A defect asserts and adopts nothing; several of your first decisions cite these |
| 5 | `docs/state-model.md` | The strongest piece of method in the repository: surface authority, market-facing states, relations-are-not-states, the basis rule, derived artefacts. Most disputes resolve by applying it |
| 6 | `wiki/Governance-and-Versioning.md`, `wiki/Extensions.md` | Normative/non-normative boundary; how extensions attach |
| 7 | `conformance/levels.md` (normative) + `conformance/certification.md` | What is claimable, CN-1..CN-4 neutrality rules — these bind Concert, which means they bind what you may be asked to approve |
| 8 | `governance/IR-2026-08-prior-normative-changes.md` + `governance/reviews/2026-08-normative-approval-audit.md` | The honest account of what predates the written rule |
| 9 | The generated inventory (`npm run inventory`) | The tree as data: every schema field, every codelist row and the line that decided its closure, every registry transition, the whole text of every governance record |

## Habits of the record you are joining

- Decisions carry declined alternatives so nothing is re-argued without new argument; gates are named (⛔) and resolved or dissolved on the record.
- Derived artefacts are generated, never hand-maintained twice (§11 D-1); inventories are generated, not asserted.
- Departures from process are recorded as departures (D-29), never relabelled.
- No named living individual and no commercial implementer appears in any artifact; disclosure is by role. CI enforces it.
- The word to watch in Concert-voiced prose: the operator layer's term of art is reserved and never used for the standard.

## What is being asked of you first

Ratification review of twenty interim resolutions (a proposed disposition accompanies the agenda); two registered proposals with elapsed comment periods, both steward-originated and steward-recused; one scope enquiry; four shape gates to schedule. Nothing obliges adoption at the first session; deadlock leaves a Draft a Draft.
