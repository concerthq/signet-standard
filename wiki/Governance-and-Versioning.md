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
| **0.9.0** (2026-07) | [Identity profile](Extensions#working-draft-the-identity-profile) (Working Draft): the `Approval` object makes `humanApproval` **resolvable and verifiable** (pseudonymous approver, role, `delegationOfAuthority` credential, provenance), with a normative **no-PII** rule for hash-anchored records; the agent demo emits the `Approval` and checks the approver's authority ceiling covers the award. Lands the [commodity-risk extension](Extensions#working-draft-the-commodity-risk-extension) Working Draft spec + Standards Committee review record (first member-proposed extension). Plus a **documentation & demo alignment** pass: README refreshed (conformance harness, the three demonstrations, extensions & profiles with status), `agent/README.md` corrected to the current MAT weighting, and extension specs consolidated under `docs/extensions/<id>.md` with an index. |
| **0.8.0** (2026-07) | [Auction extension](Extensions#example-the-auction-extension): process-layer `Auction` (a profile of the sourcing flow — reverse / english / dutch / sealed-bid / multi-criteria) and `Bid`; the auction rules and canonical bid record are normative and **operator-independent** (any conformant operator closing the same bids under the same rules reaches the same `Award`), the close reuses `Decision`/`Award`, eligibility ties to `SupplierQualification`, and the bid history is a hash-chained `Event` trail; reverse-auction worked example; modelled on Prozorro's neutral-core architecture. |
| **0.7.0** (2026-06) | **Settlement linkage** — `Obligation.dischargedBy` and `Invoice.settles` make the commitment→discharge loop traversable as data; a projection-skip guard proves `settles` never leaks into the Peppol BIS / UBL projection (ViDA convertibility unchanged); `eventType: obligation.discharged`; three conformance-checked fixtures (including a *pending* obligation carrying neither new field, proving the additions are optional). The MAT evaluation policy was reweighted to **price 20 / quality 55 / social 25**, and the award scenario now demonstrates a justified price premium (the dearer, higher-quality bid wins). |
| **0.6.0** (2026-06) | **Supplier onboarding extension**: process-layer `OnboardingCase` (buyer-internal workflow) and `SupplierQualification` (durable status with first-class `conditional` qualification, value caps, category restrictions); reuses Credential/Policy/Decision/Event/Consent; screening results carried as **attestations**, never performed by SIGNET; two worked examples. |
| **0.5.0** (2026-06) | [Agent demonstration](Agent-Layer) (`agent/`): a runnable proof that a synthetic agent takes a **governed, accountable, conformant** action — reads a SourcingEvent, is bounded by a Mandate (its €12M value exceeds the €10M autonomous ceiling, so human approval is required), applies the published MAT evaluation Policy, and emits an Award Decision with rationale, inputs, policies applied, human approval, and provenance, plus a five-event hash-chained trail; the runner verifies the output is conformance-clean (every object validates, the chain holds, tampering is detected); CI runs the demo on every commit. |
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

## Where to go next

- [Contributing](Contributing) — the CLA and the change process.
- [Extensions](Extensions) — adding structure without forking.
- [Validation & Conformance](Validation-and-Conformance) — what conformance and the
  "SIGNET Certified" mark mean.
