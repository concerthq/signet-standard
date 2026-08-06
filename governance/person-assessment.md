# Person Assessment — Rubric and Appeals

**Status:** Working Draft — non-normative, save for the appeals route in §6, which binds Concert.
**Version:** v0.1
**Applies to:** the four roles in the [role register](role-register.md), against CDM v0.1 and
conformance suite v0.1.
**Steward:** Concert Foundation
**Licence:** CC0-1.0

Required by [Role & Competency Framework](role-competency-framework.md) R-G1 **before any person
mark issues**. It is the honest counterpart to declaring that person assessment includes reviewer
judgement: a body that admits judgement into an assessment owes candidates a published rubric and a
route to challenge the result.

---

## 1. Division of labour

| Who | Does what |
|-----|-----------|
| **Accredited providers** | Deliver training (optional — no candidate is required to buy it) and conduct assessment against the published blueprint, attesting a pass. |
| **Concert** | Publishes the syllabus, blueprint, and this rubric; receives machine-scored submissions directly; maintains the register; issues the mark. |
| **The candidate** | May sit assessment through any accredited provider, or submit machine-scored components directly and take only the reviewer-judged components through a provider. |

**Concert never delivers training.** The register remains authoritative: a provider attests, Concert
records.

## 2. What is assessed, and how it is decided

Each competency domain declares its assessment mode. The declaration is the point — where a
judgement is required, this document says so rather than implying an objectivity the standard
cannot deliver.

| Domain | Assessment mode | Decided by |
|--------|-----------------|-----------|
| D1 Document Conformance | Artifact-scored | Schema validation. Mechanical. |
| D2 Event Integrity | Artifact-scored | Chain verification and tamper detection. Mechanical. |
| D3 Provenance | Artifact-scored | Presence and shape checks. Mechanical. |
| D4 Policy Expression | **Mixed** | Executability and structure: mechanical. Semantic fidelity between `expression` and `humanReadable`: **reviewer-judged**. |
| D5 Decision Accountability | **Mixed** | Field presence and policy citation: mechanical. Adequacy of a `rationale`: **reviewer-judged**. |
| D6 Semantic Interoperability | Artifact-scored | Mapping fidelity and total reconciliation. Mechanical. |
| D7 Consent & Data Sovereignty | **Reviewer-judged** | No conformance requirement anchors it. See the framework §6, F1. |

A candidate's machine-scored components are decided by running published tooling over submitted
artifacts. Those results are reproducible by the candidate before submission — the tooling is
public, so nobody is assessed against a check they could not run themselves.

## 3. Rubric for reviewer-judged components

Reviewers score each judged criterion on a four-band scale. Bands are defined by what the artifact
shows, not by impression.

| Band | Meaning |
|------|---------|
| **3 — Sound** | Correct, and the reasoning is legible to a reader who was not present. |
| **2 — Adequate** | Correct, with gaps a colleague would have to fill in. |
| **1 — Unsound** | Plausible but wrong, or correct by coincidence rather than by reasoning. |
| **0 — Absent** | Not attempted, or non-responsive. |

### D4 — semantic fidelity (Policy Author, Mandate Steward)

Given a `Policy` the candidate authored:

- **F1 Equivalence.** Does `humanReadable` state the same rule as `expression`, including its
  boundary conditions? A plain-language form that omits an edge the executable form handles is band
  1, not band 2 — the omission is exactly the failure the dual-form requirement exists to catch.
- **F2 Auditability.** Could a non-technical reviewer check a decision against `humanReadable`
  without reading the code?
- **F3 Versioning.** Does the policy version such that a `Decision` citing it remains interpretable
  after the policy changes?

### D5 — rationale adequacy (Decision Reviewer, Mandate Steward)

Given a `Decision` the candidate authored or reviewed:

- **A1 Sufficiency.** Does `rationale` support `outcome` from the cited `inputs`, or does it restate
  the outcome?
- **A2 Authority.** Where `underMandate` is populated, does the decision stay inside the mandate's
  `permittedCapabilities`, `scope`, `constraints`, and `approvalThresholds` — and is `humanApproval`
  present where a threshold required it?
- **A3 Trail.** Can the candidate read a decision trail as an auditor would: who decided, under what
  authority, from what inputs, applying which policies, with what reasoning, with what approval?

### D7 — consent reasoning (Mandate Steward)

- **C1 Grant construction.** A `Consent` carrying `grantor`, `grantee`, `resource`, `purpose`,
  `validity`, `revocable`, correctly used.
- **C2 Separation.** Correct application of `Document.accessGrant` — the assertion that a document
  exists is separate from the right to read it.
- **C3 Revocation reasoning.** What revocation does and does not undo in an append-only system, and
  why withdrawal is an appended event rather than a mutated field (CDM §7.4).

**Pass thresholds.** Every judged criterion must reach band 2, and the mean across a role's judged
criteria must reach 2.5. No compensation across domains: a band 0 or 1 on any criterion is a fail
for that sitting, whatever the mean. Machine-scored components are pass/fail at 100% of the
mechanical checks for the role's domains — there is no partial credit where a machine decides.

**Two markers on any judged component that would fail.** A single reviewer may pass a candidate; a
fail is confirmed by a second reviewer who has not seen the first score. This is cheap and removes
the most common source of appeal.

## 4. Retakes

A failed sitting may be retaken after **14 days**, against a different assessment instance. There is
no limit on retakes. Fees for retakes are published and are the same for everyone.

## 5. Fees and neutrality

Where fees are charged they are published and identical for all candidates and all accredited
providers. **A candidate pays to be assessed, not to pass** — consistent with CN-3. No provider,
including any affiliated with Concert's founders, receives a preferential route, advance sight of
assessment instances, or any advantage in the process.

**Conflicts.** A reviewer MUST NOT assess a candidate they trained within the preceding 12 months,
nor a candidate employed by the same organisation. Where a provider cannot avoid this, the component
is referred to Concert for reassignment.

## 6. Appeals (binding on Concert)

Assessment includes judgement, so a result can be wrong. The route is deliberately short.

**Grounds.** An appeal must assert one of:

1. **Procedural** — the published rubric or blueprint was not applied.
2. **Substantive** — a judged criterion was scored against the artifact submitted, and the score is
   not sustainable on that artifact.
3. **Material irregularity** — a conflict under §5, an access failure, or an assessment instance
   defect.

Disagreement with the rubric itself is not a ground of appeal; it is a change request against this
document, which is a different route and a welcome one.

**Timeline.**

| Step | Window |
|------|--------|
| Candidate files, in writing, citing a ground and the component | 30 days from the result |
| Concert acknowledges and requests the assessment record from the provider | 5 business days |
| Independent reviewer — not the original marker, not from the same provider — re-marks the component blind | 20 business days |
| Outcome issued in writing, with reasons | — |

**Outcomes.** Upheld (the mark issues, and the register records the issuance date, not the appeal);
upheld in part (a free re-sit of the affected component); or dismissed with reasons. A dismissal
states which criterion carried the decision and why, in enough detail that the candidate can act on
it.

**Finality.** The appeal outcome is final within Concert's process. Nothing in it removes any right
a candidate has at law.

**Publication.** Individual appeals are never published. Concert publishes an **annual aggregate** —
appeals filed, upheld, upheld in part, dismissed — because an appeals route nobody can see the shape
of is difficult to distinguish from one that never finds for the candidate.

## 7. Issuance

On a confirmed pass, Concert records the entry and licenses the mark for that role and CDM version,
in the form fixed by [mark grammar](mark-grammar.md) §4:

```
SIGNET Registered: Decision Reviewer (CDM v0.1)
```

A new CDM **major** version requires revalidation. Minor and patch updates do not invalidate a held
mark but may apply at renewal.

**Nothing issues yet.** Person marks bind only when the [role register](role-register.md) is
balloted (mark grammar R6).
