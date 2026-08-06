# SIGNET Role Register

**Register version:** v0.1
**Class:** Normative. Closed and append-only.
**Status:** Established under the interim-committee bootstrap clause. All four entries are
`proposed`; no person mark issues until the register is balloted (mark grammar R6).
**Steward:** Concert Foundation
**Licence:** CC0-1.0
**Governs:** the `role` production in [mark grammar](mark-grammar.md) §4.

A **role** is a named bundle of competency domains from the
[Role & Competency Framework](role-competency-framework.md). The framework is non-normative so that
role composition can evolve without a revision process; this register is normative because it
governs what may appear in a mark string.

---

## 1. Register mechanics

Identical to the [endorsement register](endorsement-register.md): closed, append-only, admission
only through the Standards Committee, each entry citing the domains it bundles.

**Names are unrenameable once the first mark issues.** A renamed role would strand every mark
already in the field, which is why the naming was settled before issuance rather than after.

**A role is a bundle, not a job.** Operators and accredited providers may compose other job shapes
from the same domains; what they may not do is coin a role name and present it as registered.

## 2. Entries

| # | Role | Domains | Locus | Status |
|---|------|---------|-------|--------|
| R1 | **Conformance Engineer** | D1, D2, D3, D6 | Implementer side | `proposed` |
| R2 | **Policy Author** | D4, D1 | Buyer / governance side | `proposed` |
| R3 | **Mandate Steward** | D5, D4, D7 | Buyer / governance side | `proposed` |
| R4 | **Decision Reviewer** | D2, D3, D5 | Audit, second-line risk, regulator | `proposed` |

Mark form, per mark grammar §4: `SIGNET Registered: Mandate Steward (CDM v0.1)`. A person is never
*Certified*; an implementation is never *Registered*.

### R1 — Conformance Engineer

Builds and maintains the adapter exposing `createObject`, `applyChange`, `getEvents`, and
`projectInvoiceToUBL`; runs the public suite; produces a report conforming to `report-schema.json`;
owns the certification submission. The role whose work is most nearly fully machine-assessable.

### R2 — Policy Author

Converts organisational rules into `Policy` objects in dual form — an executable `expression` and a
`humanReadable` statement of **the same rule**. The scarce combination is drafting discipline plus a
rules language (`rego`, `dmn`, `cel`); most organisations hold these two capabilities in different
functions. This is also the largest reviewer-judged surface in the framework: no machine check
establishes that the two forms mean the same thing.

### R3 — Mandate Steward

Grants and bounds the authority of synthetic agents: what an agent may do, inside what scope,
against what hard limits, above what threshold a human must approve. Most organisations have no
existing role that maps to this. It is the genuinely new one.

### R4 — Decision Reviewer

Reads the trail rather than producing it: verifies chains, checks provenance completeness, assesses
whether a stated rationale supports its outcome, and confirms that decisions taken under a mandate
stayed inside it. Deliberately separated from the producing roles.

**Named `Decision Reviewer`, not `Assurance Reviewer`.** "Assurance" is load-bearing vocabulary in
the audit profession — ISAE 3000 and equivalents — and a Concert-issued *Assurance* credential could
be read as qualifying the holder to give an assurance opinion. That is a claim Concert cannot
support and should not imply.

## 3. Foundations is not a role

**`Foundations` confers no mark.** The model's shape, the four layers, the precedence rule, and the
governance structure are a **prerequisite assessment**, not a role. Granting a mark for it would
begin the badge inflation this structure exists to resist.

## 4. What a person mark asserts

That the holder passed the published assessment for the named role against a named CDM version, and
that their entry is in the public register. Nothing more: a registered individual's employer is not
thereby certified, and the mark grammar prohibits any construction implying otherwise.

Assessment is not held to CN-1. CN-1 governs **implementation certification**, where no subjective
judgement may contribute to a pass or fail; registering a person is a different act, and holding it
to CN-1 would be a category error. Person assessment includes reviewer judgement, declared as such —
see [person-assessment.md](person-assessment.md) for the rubric and the appeals route.

## 5. Change log

| Register version | Change |
|------------------|--------|
| v0.1 | Register established. R1–R4 entered as `proposed`. `Assurance Reviewer` renamed `Decision Reviewer` before entry. |
