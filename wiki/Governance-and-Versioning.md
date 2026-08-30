# Governance & Versioning

SIGNET is stewarded by **Concert Foundation** as a neutral, open standard. This page covers
how the standard is versioned, what counts as normative, and how changes are controlled.

## Stewardship

- The standard is stewarded by [Concert Foundation](https://concert.foundation).
- The artifacts are dedicated to the public domain under
  [CC0 1.0](https://github.com/concerthq/signet-standard/blob/main/LICENSE) — the vocabulary
  is meant to be implemented everywhere, by anyone, without friction or attribution burden.
- The **conformance harness** under
  [`conformance/`](https://github.com/concerthq/signet-standard/blob/main/conformance/LICENSE)
  is instead licensed **Apache-2.0**: it is executable code implementers run and embed, and
  Apache-2.0's express patent grant provides protection CC0 does not. Spec-under-CC0 /
  code-under-Apache is the established open-standard pattern.
- Concert holds **no proprietary claim** over the model; it stewards its evolution through the
  formal change-control process in [`GOVERNANCE.md`](https://github.com/concerthq/signet-standard/blob/main/GOVERNANCE.md).
  **No Standards Committee is constituted** — see below.
- **No contributor, and no commercial operator (including Score Networks), gains a
  preferential position.**

## Normative vs non-normative

The single most important governance distinction:

| Tier | What | How it changes |
|------|------|----------------|
| **Normative** | `schema/`, **closed** codelists, and `conformance/levels.md` + the conformance `suite/` + `report-schema.json` | A **recorded resolution**, a stated **comment period of at least 14 calendar days**, and one approving review. |
| **Non-normative** | `docs/`, `examples/`, **open** codelist values, mapping notes, the conformance `adapter/` reference code, this wiki | One approving review, no comment period. |

Every change of either class arrives **by pull request**; direct commits to `main` are not a
permitted route. **No Standards Committee is constituted** — until one is, decisions that would
fall to it are taken under the [bootstrap clause](https://github.com/concerthq/signet-standard/blob/main/governance/README.md#the-bootstrap-clause)
and recorded as interim resolutions.

> **The schema takes precedence** over the prose if they ever conflict. See
> [Validation & Conformance → Precedence](Validation-and-Conformance#precedence).

**How a change in either tier is actually reviewed and adopted** — the two review tiers, the
approval each requires, the comment period on normative changes, and the interim arrangement
standing in for a Standards Committee that is **not yet constituted** — is recorded in
[`GOVERNANCE.md`](https://github.com/concerthq/signet-standard/blob/main/GOVERNANCE.md) at the
repository root. This page defines the tiers; that document says what happens to a change in
each of them.

## Semantic versioning

The CDM uses [Semantic Versioning](https://semver.org/):

- **MAJOR** changes only on a **breaking change** to the core model.
- **MINOR** versions add **backward-compatible** structure.
- **PATCH** versions **clarify** without changing meaning.

Every published version is **permanently retrievable** at a version-stable URI under
`concert.foundation/signet/<version>/`. Implementations declare the CDM version they target.

The **conformance suite is versioned with the CDM**: a certification is always qualified by
both versions (e.g. *"SIGNET Full — CDM v0.1, suite v0.1"*). A new CDM **major** version
requires re-certification; minor/patch suite updates that only add or clarify tests do not
invalidate existing certifications but may apply at renewal. See
[Conformance Harness](Conformance-Harness).

### Release history

[CHANGELOG.md](https://github.com/concerthq/signet-standard/blob/main/CHANGELOG.md) is the
release record, and it is not summarised here. A table of releases on this page is a second
hand-maintained copy of that file, and it drifted exactly as a second copy does: it stopped at
`0.10.0` and stayed there for six releases. `governance/defects.md` D-33 keeps that finding —
the stale value dated the last sweep of these pages — which is why the history of the drift is
preserved in the register rather than in the artifact that was drifting.

The **specification** is at **CDM v0.1** — the version-stable namespace at
`https://concert.foundation/signet/v0.1/`, which does not move with the repository release.
Field-level definitions are normative and change only under the revision process below; what a
conformance check validates against is the published JSON Schema in `schema/`. No release number
is restated in this prose: `package.json` carries it, and `CHANGELOG.md` is the record.

## Change control

> As a normative artifact, the **core model changes only through the formal revision process**,
> which requires a recorded resolution, a stated comment period of at least fourteen calendar
> days, and an approving review. Non-normative material may be updated under a single approving
> review with no comment period (specification §12.2).

**This took effect on 20 August 2026.** Changes merged before that date followed prior practice,
which had no written rule: of the twelve normative changes made between v0.1.0 and that date, one
carries an approving review and **none carried a comment period**. That is recorded in
[the approval audit](https://github.com/concerthq/signet-standard/blob/main/governance/reviews/2026-08-normative-approval-audit.md)
rather than left for a reader to discover from the commit history. Nothing merged is thereby
wrong — every change passed CI — but the repository could not, before that date, show the process
its own specification described.

To propose a change, see [Contributing](Contributing). For adding (rather than changing)
structure, see [Extensions](Extensions).

### Change proposals

A substantive change is drafted as a **change proposal** in `governance/proposals/`: the problem
stated against the shipped artifacts, the smallest change that closes it, the schema impact
(stated as "none" explicitly where there is none), the conformance rules, backward compatibility,
and what was rejected and why. Four are open — grant lifecycle, mandate enforcement, consent
revocation, credential semantics — and **none has been balloted**.

### Interim resolutions

No Standards Committee is yet constituted. Referring every structural decision to a body that
does not exist would defer all of them indefinitely, and several are materially cheaper to settle
before the standard is published under a stable URI — and before the first mark issues. Decisions
taken in that window are recorded as **interim resolutions**: in force, reasoned in writing, and
ratifiable, amendable, or reversible by the committee once seated.

Twenty are currently in force, listed in `governance/README.md`. An interim resolution is a
decision, minuted as such — not a deferral.

### Review records

Standards Committee decision records are published in-repo under `governance/reviews/`, so the
governance trail is public and versioned alongside the standard it governs. The first is
`governance/reviews/2026-07-commodity-risk.md` — the review of the first **member-proposed**
extension ([commodity-risk](Extensions#working-draft-the-commodity-risk-extension)), which
records that member proposals are reviewed under the identical process, terms, and bar as any
proposer, with no preferential path for any member.

## Marks

"SIGNET", "Concert", and "SIGNET Certified" are marks administered by Concert Foundation
under the [IP & Licensing Policy](https://concert.foundation/governance). The CC0 dedication
covers copyright in the artifacts **only**; it grants no rights in the marks.

Their form is fixed by the **mark grammar** (`governance/mark-grammar.md`), which is normative
for licensees and linted in CI. Three head terms, never crossed:

| Subject | Head term | Canonical form |
|---------|-----------|----------------|
| An implementation | `SIGNET Certified` | `SIGNET Certified: Full (CDM v0.1, suite v0.1)` |
| A person | `SIGNET Registered` | `SIGNET Registered: Mandate Steward (CDM v0.1)` |
| A training provider | `SIGNET Accredited` | `SIGNET Accredited Training Provider (syllabus v0.1)` |

A person is never *Certified*; an implementation is never *Registered*. Abbreviated forms are
licensed only where they resolve to the registry entry, because a claim that travels without its
qualification becomes a claim about something else.

**The mark governs claims of assessment, not claims of implementation.** Anyone may implement
SIGNET and say so — *"Implements SIGNET CDM v0.1"*, or *"Self-assessed against the SIGNET
conformance suite v0.1 — Core"*, where the `self-assessed` qualifier is mandatory. What requires
a licence is the assertion that Concert assessed you.

Enforcement is complaint-driven; Concert builds no monitoring function. The primary remedy is
the registry itself, which is the sole authority on what is held, and it is faster and stronger
than litigation.

## Where to go next

- [Contributing](Contributing) — the CLA and the change process.
- [Extensions](Extensions) — adding structure without forking.
- [Validation & Conformance](Validation-and-Conformance) — what conformance and the
  "SIGNET Certified" mark mean.
