# Governance & Versioning

SIGNET is stewarded by **Concert Foundation** as a neutral, open standard. This page covers
how the standard is versioned, what counts as normative, and how changes are controlled.

## Stewardship

- The standard is stewarded by [Concert Foundation](https://concert.foundation).
- The artifacts are dedicated to the public domain under
  [CC0 1.0](https://github.com/concerthq/signet-standard/blob/main/LICENSE) — the vocabulary
  is meant to be implemented everywhere, by anyone, without friction or attribution burden.
- Concert holds **no proprietary claim** over the model; it stewards its evolution through
  the Standards Committee and the formal change-control process.
- **No contributor, and no commercial operator (including Score Networks), gains a
  preferential position.**

## Normative vs non-normative

The single most important governance distinction:

| Tier | What | How it changes |
|------|------|----------------|
| **Normative** | `schema/`, **closed** codelists, and `conformance/levels.md` + the conformance `suite/` + `report-schema.json` | Only through the **Standards Committee revision process**, with a published comment period. |
| **Non-normative** | `docs/`, `examples/`, **open** codelist values, mapping notes, the conformance `adapter/` reference code, this wiki | May be updated **freely** by pull request. |

> **The schema takes precedence** over the prose if they ever conflict. See
> [Validation & Conformance → Precedence](Validation-and-Conformance#precedence).

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

From [CHANGELOG.md](https://github.com/concerthq/signet-standard/blob/main/CHANGELOG.md):

| Version | Highlights |
|---------|-----------|
| **0.4.0** (2026-06) | [Conformance harness](Conformance-Harness) (`conformance/`): Core/Full levels, the public suite, a reference adapter (reaches Full) and a broken adapter (rejected), neutrality rules CN-1…CN-4; `signet-to-ubl.js` refactored to a pure `toUBL()`; CI runs the harness on every commit. |
| **0.3.0** (2026-06) | Runnable `signet-to-ubl.js` transform → Peppol BIS Billing 3.0; `verify-ubl.py` reconciliation; CI now proves convertibility on every push; committed `invoice.ubl.xml`. |
| **0.2.0** (2026-06) | Complete OCDS-aligned process layer (Need, Evaluation, Award, Contract, Order, Catalogue, Obligation, Invoice); EN 16931 building blocks (Unit, InvoiceLine, VatBreakdown); EN 16931-mapped Invoice (33 BTs/BGs); Draft-07 `allOf` fix preserving BT annotations on `$ref`. |
| **0.1.0** (2026-06) | Foundation layer; initial process layer (SourcingEvent, Submission, Policy); agent layer (SyntheticAgent, Mandate, Decision); trust layer (Event, Consent); JSON-LD context; codelists; CI-validated examples. |

The **specification** itself is at **v0.1 (Working Draft / Request for Comments)** — field-
level definitions are illustrative of the model's shape and not yet frozen.

## Change control

> As a normative artifact, the **core model changes only through the formal revision process
> governed by the Standards Committee, with a published comment period.** Non-normative
> material may be updated freely (specification §12.2).

To propose a change, see [Contributing](Contributing). For adding (rather than changing)
structure, see [Extensions](Extensions).

## Marks

"SIGNET", "Concert", and "SIGNET Certified" are marks administered by Concert Foundation
under the [IP & Licensing Policy](https://concert.foundation/governance). The CC0 dedication
covers copyright in the artifacts **only**; it grants no rights in the marks.

## Where to go next

- [Contributing](Contributing) — the CLA and the change process.
- [Extensions](Extensions) — adding structure without forking.
- [Validation & Conformance](Validation-and-Conformance) — what conformance and the
  "SIGNET Certified" mark mean.
