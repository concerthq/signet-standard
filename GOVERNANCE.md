# Governance

How changes to this repository are proposed, reviewed, and adopted.

This document records **process**. It is non-normative and changes nothing in the model. For
what the standard *is*, see the [specification](docs/specification.md) and the
[schemas](schema/) — the schemas take precedence over all prose.

## Scope

| Covered here | Covered elsewhere |
|---|---|
| Review tiers and approval requirements | Normative/non-normative tiers — [Governance & Versioning](wiki/Governance-and-Versioning.md) |
| Change proposal registration | Contribution process and CLA — [CONTRIBUTING.md](CONTRIBUTING.md) |
| Interim Committee arrangements | Certification neutrality — [conformance/levels.md](conformance/levels.md) (**normative**) |
| Repository identities | Certification process — [conformance/certification.md](conformance/certification.md) |
| | IP and licensing — [concert.foundation/governance](https://concert.foundation/governance) |

Where this document and a normative artifact disagree, **the normative artifact governs.**

## Artifact classes

The normative and non-normative tiers are defined in
[Governance & Versioning](wiki/Governance-and-Versioning.md) and are not restated here. One
addition:

**`governance/proposals/` is non-normative.** A change proposal describes a change that has
been *proposed*. The change becomes normative only when merged into `schema/`, a closed
codelist, or `conformance/`. A proposal's presence in this repository is not a statement that
it has been accepted, and **it is not part of the standard.**

## Two-tier review

Every change arrives by pull request. Direct commits to `main` are not a permitted route for
any change of any class.

### Tier 1 — non-normative changes

Documentation, the wiki source, examples, open codelist values, mapping notes, the reference
adapter, change proposal registration, and governance records other than those named under
Tier 2.

- One approving review from an account with write access.
- No comment period.
- Merged by the approver or by the author once approved.

### Tier 2 — normative changes

`schema/`, closed codelists, `conformance/levels.md`, `conformance/suite/`, and
`conformance/report-schema.json`.

Also [`governance/mark-grammar.md`](governance/mark-grammar.md) and the two closed,
append-only registers ([endorsement](governance/endorsement-register.md),
[role](governance/role-register.md)). These are not CDM artifacts — they are normative for
licensees under the IP & Licensing Policy — but they decide what may be claimed, and admission
to a closed register is an act of the same weight as a schema change. The boundary is enforced
by CODEOWNERS as well as by this rule.

- A **recorded resolution** adopting the change. Until the Standards Committee is constituted
  this is an **interim resolution** under the bootstrap clause — see below.
- A **stated comment period of at least 14 calendar days**, opened when the pull request is
  marked ready for review and recorded in the pull request.
- One approving review from an account with write access.
- The resolution, the comment period dates, and any comments received are recorded before
  merge.

A normative change merged without a recorded resolution and a stated comment period is a
defect in this process, and should be raised as one.

## Change proposals

Proposals are registered in [`governance/proposals/`](governance/proposals/) and indexed in
[its register](governance/proposals/README.md). Identifiers are **name-based**
(`CP-Tenancy`, `CP-EventType-Closure`), not numbered. Registration makes a proposal citable,
diffable and permanently retrievable. **It does not adopt it.**

A proposal carries `Status: Draft — not yet balloted` until a resolution adopts it, at which
point the status and the adopting resolution are recorded in the register.

Declined alternatives are recorded inside each proposal with their reasoning, so a rejected
option cannot be re-proposed without new argument.

## The Standards Committee

**The Standards Committee is not yet constituted.**

Until it is, decisions proceed under the bootstrap clause, which is authoritative in
[`governance/README.md`](governance/README.md#the-bootstrap-clause) and is not paraphrased
here. Decisions taken in that window are recorded as **interim resolutions**: in force,
reasoned in writing, and reversible by the Committee on the record rather than by silent
drift. They are recorded in the document they govern and indexed in
[`governance/README.md`](governance/README.md). There is no separate resolutions directory,
and no second index — one place, so the two cannot drift apart.

The status vocabulary that distinguishes a draft from a decision from a ratification is
defined in the same file. Nothing in this repository has reached `Ratified`, because no
Committee is yet constituted to ratify it.

**The Committee will be constituted at the first external certification.** That trigger is
externally observable, it is the moment independence begins to matter to someone other than
Concert, and it cannot be quietly deferred. Until then, this document describes an interim
arrangement operated in good faith. **It does not describe an independent standards body.**

## Repository identities

Two GitHub accounts act on this repository.

- **`concertfoundation`** — the authoring identity. Produces changes and opens pull requests.
- **`concertcustodian`** — the stewardship identity. Reviews, approves, and merges.

**Both are currently operated by the same natural person.** The separation is procedural, not
independent. An approval by `concertcustodian` of a pull request authored by
`concertfoundation` records that the change was reviewed against this process; **it does not
constitute independent review, and must not be read as such.**

This limitation is stated here rather than left to be inferred from the commit history. It
ends when the Committee is constituted, at which point review passes to accounts under
separate control.

## Interests and neutrality

Concert stewards the standard; it does not operate an implementation. Where a party holds both
a stewardship role and an implementer role, that overlap is disclosed structurally — by role
rather than by name.

The neutrality rules binding Concert as certifier are **normative** and are stated in
[`conformance/levels.md`](conformance/levels.md) (CN-1…CN-4). They are referenced here, not
reproduced: a normative rule restated in a non-normative file becomes two texts that can
drift.

## Effective date

This process applies from **20 August 2026**.

Changes merged before that date followed prior practice, which included direct commits to
`main` and pull requests merged with administrative override. Those are **not** relabelled as
having followed this process, because they did not. They are superseded from the effective
date.

## Changing this document

`GOVERNANCE.md` is non-normative and changes under Tier 1 — with one exception. A change to
the review rules themselves — **Two-tier review**, **Repository identities**, or this section
— follows Tier 2, including the comment period. A process that can be relaxed by the same
route as a typo is not a process.
