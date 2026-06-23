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
