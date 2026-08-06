# SIGNET Endorsement Register

**Register version:** v0.1
**Class:** Normative. Closed and append-only.
**Status:** Established under the interim-committee bootstrap clause. Both entries are `proposed`;
no endorsement is earnable and none may appear in a mark until its entry is `active`.
**Steward:** Concert Foundation
**Licence:** CC0-1.0
**Governs:** the `endorsement-list` production in [mark grammar](mark-grammar.md) §4.

An **endorsement** certifies a property that is worth certifying but does not belong on the
Core/Full level axis, because it is not universally applicable. Endorsements are additive: they
change neither Core nor Full, nobody is blocked from certifying without one, and an unearned
endorsement is inert. See [`conformance/levels.md`](../conformance/levels.md) §2.4.

---

## 1. Register mechanics

**Closed.** An endorsement exists only if it appears below. An implementation may not coin one, and
a profile may not add one.

**Append-only.** Entries are added, never removed or renamed. Withdrawing an endorsement means
marking its entry `withdrawn` and stating the date; marks already issued keep naming it, and the
register keeps explaining what it meant.

**Admission is a Standards Committee act**, at a **suite minor-version boundary** only. Every
admission records the three-part test (§2) against the entry, which makes admission auditable rather
than discretionary.

**Ordering is register order, not alphabetical.** The `endorsement-list` in a mark string MUST
follow the order below. Register order keeps a given set of endorsements rendering identically as
the register grows.

**Registry entries record the register version in force at issuance.** The register is append-only,
so without this every certification issued before a later admission would appear deficient against a
register that grew after the fact. That unfairness is created automatically by append-only design
unless entries are dated against it.

## 2. The three-part test (normative)

An endorsement may enter this register only where the property is:

- **(a) genuinely orthogonal to the Core/Full level axis** — it is not a stronger version of a level
  requirement, and adding it to a level would be wrong rather than merely aggressive;
- **(b) not universally applicable** — some conformant implementations have no occasion to exhibit
  it, so requiring it at a level would fail them for an irrelevance; and
- **(c) machine-testable under CN-1** — a public, reproducible check decides it, with no
  discretionary judgement.

A property failing (a) belongs in a level. A property failing (b) belongs in a level. A property
failing (c) belongs nowhere in certification, and should be said out loud as a scope limit instead.

## 3. Entries

### E1 — Mandate Enforcement

| Field | Value |
|-------|-------|
| **Mark string** | `Mandate Enforcement` |
| **Requirement ID** | `E-MDT` |
| **Checks** | `E-MDT-1` … `E-MDT-7` |
| **Admitted at** | suite v0.2 (proposed) |
| **Status** | `proposed` — pending ballot of [CP-Mandate-enforcement](proposals/CP-Mandate-enforcement.md) |
| **Adapter** | agent adapter — [`conformance/adapter/endorsement-adapters.md`](../conformance/adapter/endorsement-adapters.md) |
| **Tested by** | `conformance/rules/check-endorsements.js` |

**Three-part test.** (a) Orthogonal — Core and Full concern document structure, event integrity,
provenance, mapping fidelity, and the *form* of policies and decisions; whether an agent's action
was *refused* when it exceeded its mandate is a behavioural property of a different kind.
(b) Not universally applicable — an implementation that runs no synthetic agents has no mandates to
enforce. (c) Machine-testable — the harness supplies the `Mandate` and the `Policy` objects, so it
knows the expected outcome of each scenario, and the `Policy` carries an executable `expression` an
assessor can re-evaluate independently.

**What it establishes.** That the boundary sits where the mandate says it does: actions beyond an
`approvalThresholds` policy are refused or carry `humanApproval`; actions within all thresholds
proceed *without* demanding approval; capability, scope, and effectiveness limits refuse; a
`constraints` policy is a hard limit that `humanApproval` cannot cure; and every refusal is evented,
so *refused* and *never attempted* are distinguishable in the record.

**What it does not establish.** That the implementation's mandates are well drafted, that its
policies express the organisation's actual delegation of authority, or anything about actions taken
outside the SIGNET record.

### E2 — Consent Enforcement

| Field | Value |
|-------|-------|
| **Mark string** | `Consent Enforcement` |
| **Requirement ID** | `E-CNS` |
| **Checks** | `E-CNS-1` … `E-CNS-5` |
| **Admitted at** | suite v0.2 (proposed) |
| **Status** | `proposed` — pending ballot of [CP-Consent-revocation](proposals/CP-Consent-revocation.md) |
| **Adapter** | consent adapter — [`conformance/adapter/endorsement-adapters.md`](../conformance/adapter/endorsement-adapters.md) |
| **Tested by** | `conformance/rules/check-endorsements.js` |

**Three-part test.** (a) Orthogonal — C-DOC validates a `Consent` structurally and says nothing
about whether the grant has any consequence. (b) Not universally applicable — an implementation may
hold no access-controlled documents at all. (c) Machine-testable — the harness supplies the grant,
the event stream, and the evaluation time, so effectiveness is deterministic and reproducible under
CN-4.

**Scope limit (normative for this entry).** `E-CNS` certifies the **interoperability of the grant**
— its representation, its projection from the event stream, and the temporal and party evaluation
the model defines. It does **not** certify runtime access enforcement: whether a production system
physically refuses a read is a security-posture property assessed under ISO 27001 and SOC 2 regimes.
Concert does not claim to certify it, and no positioning copy may imply otherwise. This limit is why
the endorsement is named *Consent Enforcement* and not *Data Sovereignty*: a badge reading *Data
Sovereignty* would assert precisely the thing the proposal declines to assert.

**What it does establish**, stated positively so the limit does not read as a bare deficiency: grant
terms are represented interoperably; the implementation's own authorisation decisions honour those
terms as the model defines them; `revocable` acquires its first enforced consequence; and because
the effective/not-effective determination is reproducible from the published event stream, a third
party can verify after the fact whether access decisions were consistent with the grants then in
force.

## 4. Why two entries and not one

A single "governance" badge covering both properties was considered and rejected. The decisive
argument is not accuracy but that a merged badge has no coherent earning rule: the two properties
are independently applicable — an implementation may run agents but hold no access-controlled
documents, or the reverse. A conjunction rule would make the badge unearnable for most
implementations; a disjunction rule would award it on the strength of the half not done.

## 5. Change log

| Register version | Change |
|------------------|--------|
| v0.1 | Register established. E1 `Mandate Enforcement` and E2 `Consent Enforcement` entered as `proposed`. |
