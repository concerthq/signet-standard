# SIGNET Conformance Levels

**Specification v0.1 (Working Draft)**
**Steward:** Concert Foundation
**Tier:** Normative
**Licence:** Apache-2.0 (suite) · CC0-1.0 (this document)

This document defines what it means for a document or an implementation to conform
to the SIGNET standard, the conformance **levels**, and the **neutrality rules**
that govern certification. It is the companion to the SIGNET Canonical Data Model
specification (CDM §13 Conformance) and the Concert IP & Licensing Policy.

The accompanying machine-runnable suite (`conformance/`) tests every requirement
below. A claim of conformance is only meaningful when accompanied by a passing
report from that suite (`report-schema.json`).

---

## 1. Conformance targets

Two things can conform:

- A **document** — a single CDM instance (an Invoice, a Decision, …). Document
  conformance is purely structural (CDM §13.1).
- An **implementation** — a system that reads, writes, and changes CDM documents.
  Implementation conformance additionally covers behaviour: round-trip fidelity,
  mapping fidelity, and event/provenance integrity (CDM §13.2).

Only **implementations** are certified. Document conformance is a building block
of implementation conformance.

---

## 2. Conformance levels

### 2.1 SIGNET Core v0.1

The floor. An implementation is **Core-conformant** if it satisfies every MUST in:

- **C-DOC — Document conformance.** Every document it emits validates against the
  published JSON Schema for its declared version, and it rejects documents that
  do not (CDM §13.1). *Tested by:* positive fixtures must validate; negative
  fixtures must be rejected.
- **C-EVT — Event & audit integrity (Layer 3).** Every material change produces
  an append-only Event carrying Provenance; Events hash-chain via
  `previousEventHash` so tampering is evident (CDM §1.7, §7.1, §7.2). *Tested by:*
  a valid chain verifies; a tampered chain is detected.
- **C-PROV — Provenance presence.** Every Decision and every Event carries a
  `provenance` object identifying what generated the assertion and when
  (CDM §6.4, §7.2). *Tested by:* provenance presence and shape checks.

Core corresponds to Layer 1 (Wire Contract) + Layer 3 (Event & Audit) of the
SIGNET architecture.

### 2.2 SIGNET Full v1.0

Core, plus:

- **F-MAP — Interoperability mapping fidelity (Layer 4).** The implementation
  performs the normative §8 standards mappings without loss of mapped fields. For
  v0.1 the tested mapping is **Invoice → Peppol BIS Billing 3.0 (EN 16931)**: the
  projection must preserve every mapped Business Term and the monetary totals must
  reconcile (CDM §8, §13.2(b)). *Tested by:* the mapping-conformance cases.
- **F-SEM — Behavioural semantics (Layer 2).** Policy objects carry both an
  executable `expression` and a `humanReadable` statement; Mandates bound agent
  actions; Decisions reference the inputs and policies they applied
  (CDM §6.3–6.5, §13.2). *Tested by:* the semantics cases.

Full corresponds to Core + Layer 2 (Behavioural Semantics) + Layer 4
(Interoperability).

### 2.3 Reporting

The suite reports, per requirement, `pass | fail | not-applicable`, and computes
the highest level fully satisfied: `Full`, `Core`, or `none`. A partial result
(e.g. Core met, Full partially met) is reported honestly as `Core` with the
failing Full requirements listed. There is no rounding up.

**`not-applicable` is narrow, and it never contributes to a level.** A requirement
is `not-applicable` only where the implementation does not exchange the object
class the requirement constrains at all — the case F-MAP raises for an
implementation that never handles invoices. It is not available for a requirement
the implementation would rather not meet, and an implementation cannot reach
**Full** on a set of results in which a Full requirement is `not-applicable`: it
reaches **Core**, with the `not-applicable` requirement recorded as such. A level
is claimed on what passed, never on what was skipped. Where a whole class of
implementation cannot reach Full for this reason, the answer is a profile
(`docs/profiles/`), which names the subset that applies to it — not an N/A that
rounds up.

### 2.4 Endorsements — a second axis (proposed, not yet in force)

Some properties are worth certifying but do not belong on the Core/Full axis at
all, because they are not universally applicable: an implementation may run
synthetic agents but hold no access-controlled documents, or the reverse. Putting
such a property in Core would fail implementations for which it is irrelevant.

**Endorsements** are the second axis. An endorsement is prefixed `E-`, is earned
only if every one of its checks passes, and is **additive**: it changes neither
Core nor Full, blocks nobody from certifying, and is inert where unearned. An
implementation either holds an endorsement or does not, so no `not-applicable`
arises on this axis. Admission to the closed
[endorsement register](../governance/endorsement-register.md) requires the
three-part test in the [mark grammar](../governance/mark-grammar.md) R2: the
property must be orthogonal to the level axis, not universally applicable, and
machine-testable under CN-1.

Two endorsements are proposed:

| Endorsement | Checks | What it establishes | Proposal |
|-------------|--------|---------------------|----------|
| **`E-MDT` Mandate Enforcement** | E-MDT-1…7 | The limits a `Mandate` expresses are respected, not merely cited | [CP-Mandate-enforcement](../governance/proposals/CP-Mandate-enforcement.md) |
| **`E-CNS` Consent Enforcement** | E-CNS-1…5 | The terms a `Consent` expresses are honoured in the implementation's own authorisation decisions | [CP-Consent-revocation](../governance/proposals/CP-Consent-revocation.md) |

Both proposals are drafts. Their checks are implemented and runnable today
(`node conformance/rules/check-endorsements.js`) so the gap they close is
demonstrable rather than argumentative, but **they decide nothing**: they are not
run by `run-conformance.js`, do not appear in a conformance report, and no
endorsement may appear in a mark until the corresponding proposal carries and its
register entry moves to `active`.

### 2.5 Requirements outside the level axis

| Rule | Requirement | Status |
|------|-------------|--------|
| **GRT-1** | Withdrawal of a grant-type object (`Consent`, `Mandate`) MUST be expressed as an appended event; the object MUST NOT be mutated in place (CDM §7.4). | Normative in the specification. Exercised only by the endorsement checks above, which are not in force — so it is **modelled and specified, not yet certified**. |

Stating this plainly is the point. A MUST that no suite exercises is a MUST no
certification establishes, and the distance between the two is exactly what §5
records.

---

## 3. Certification neutrality rules (CN)

These rules are the operational expression of the governance firewall in the IP &
Licensing Policy. They bind Concert as the certifier.

- **CN-1 — Machine-runnable.** Conformance is determined solely by the
  machine-runnable suite. No subjective assessment, interview, or discretionary
  judgement contributes to a pass/fail. If the suite cannot decide a requirement,
  that requirement is not part of certification.
- **CN-2 — Identical suite.** Every implementer is assessed against the byte-for-
  byte identical suite at a given version. There is no bespoke, relaxed, or
  extended suite for any party.
- **CN-3 — No preferential path.** No implementer — including Score Networks —
  receives early access to the suite, pre-graded fixtures, a privileged
  certification route, or any advantage in the process. The suite is public.
- **CN-4 — Reproducible & publishable.** A conformance result is reproducible by
  any third party from the published suite and the implementation's adapter, and
  the result report is publishable. Certification records which suite version and
  which CDM version were used.

A certification that cannot cite a passing, reproducible suite report under these
rules is invalid.

---

## 4. Versioning

The suite is versioned with the CDM. A certification is always qualified by both
versions, e.g. *"SIGNET Full — CDM v0.1, suite v0.1"*. A new CDM major version
requires re-certification; minor/patch suite updates that only add or clarify
tests do not invalidate existing certifications but may be required at renewal.

The canonical form of a mark, and what may be abbreviated where, is fixed by the
[mark grammar](../governance/mark-grammar.md).

---

## 5. What certification establishes — and what it does not

Three statements are routinely run together, always in the direction that
overstates. They are different claims:

- **Modelled** — the CDM represents it. Says nothing about whether any
  implementation does it.
- **Tested** — the public suite exercises it against the implementation's own
  behaviour.
- **Certified** — a passing, reproducible report is on the registry against a
  named CDM and suite version.

CN-1 says conformance is decided solely by the machine-runnable suite. It does
**not** say that every MUST in the specification is decided that way. The suite
decides the requirements listed in §2, and those only.

Two governance properties are currently **modelled but not tested**, and
therefore not certified:

| Property | Modelled | Tested | Note |
|----------|----------|--------|------|
| Consent terms have consequence — access is gated by a live grant, revocation takes effect, `Document.accessGrant` is honoured | Yes (CDM §7.3, §7.4) | **No** | `Consent` is validated structurally by C-DOC and nothing more. Addressed by `E-CNS`. |
| Mandate limits are respected — not merely cited | Yes (CDM §6.3–6.5) | **No** | F-SEM requires a Decision to cite `policiesApplied`; nothing requires the limits in those policies to have been applied. Addressed by `E-MDT`. |

A reader treating a **Full** certification as evidence that human oversight was
enforced would be relying on something this suite does not establish. Concert's
own reference implementation demonstrates the mandate gate, and CI runs that
demonstration on every commit — but a demonstration binds only the code
demonstrated, not every certified implementation.

Nothing above is a defect in what the suite reports. It is a limit on what the
report may be read to mean, and it is stated here so that no positioning copy has
to be trusted to state it.
