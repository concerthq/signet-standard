# Changelog

All notable changes to the SIGNET Canonical Data Model are recorded here.
This standard uses [Semantic Versioning](https://semver.org/): the MAJOR
version changes only on a breaking change to the core model.

## [0.4.0] — 2026-06 — Working Draft

### Added
- **Conformance harness** (`conformance/`) — the machine-runnable suite behind the
  "SIGNET Certified" mark. Implements CDM §13 and the certification neutrality
  rules CN-1…CN-4.
  - `levels.md` — Core vs Full levels; requirements C-DOC, C-EVT, C-PROV (Core)
    and F-MAP, F-SEM (Full); CN neutrality rules.
  - `certification.md` — the identical-for-all certification process.
  - `runner/run-conformance.js` — runs the suite against any implementation via a
    small adapter, emits a machine-readable report, computes the level achieved.
  - `adapter/reference-adapter.js` — a complete conformant implementation (reaches
    **Full**); `adapter/broken-adapter.js` — deliberately non-conformant, **failed**
    by the harness at C-EVT and F-MAP, proving the suite discriminates.
  - Positive + negative document fixtures (invalid documents that MUST be rejected).
  - `report-schema.json` — schema every conformance report conforms to (CN-4).
- CI now runs the harness on every commit: the reference implementation must reach
  Core+, and the broken implementation must be rejected.

### Changed
- `tools/signet-to-ubl.js` refactored to export a pure `toUBL(invoice)` function
  (shared by the CLI, the harness, and the website); CLI output unchanged.

## [0.3.0] — 2026-06 — Working Draft

### Added
- **`tools/signet-to-ubl.js`** — a dependency-free reference transform that
  projects a SIGNET canonical Invoice into a UBL 2.1 Invoice conforming to
  **Peppol BIS Billing 3.0** (EN 16931 compliant). Each mapping is annotated
  with its BT/BG reference.
- **`examples/invoice.ubl.xml`** — the generated Peppol BIS Billing output for
  the worked invoice, committed so the projection is visible without running it.
- **`tools/verify-ubl.py`** — parses the generated UBL and reconciles every key
  EN 16931 Business Term and the monetary totals against the source invoice;
  exits non-zero on mismatch.
- CI now runs the transform and verification on every push, so "convertible to
  Peppol BIS" is a continuously-proven claim, not an assertion.
- `npm run transform` and `npm run verify-ubl` scripts.

### Notes
- This is a faithful reference projection, not a substitute for official Peppol
  validation. Production use should additionally run the output through the
  Peppol/EN 16931 XSD + Schematron validation artefacts.

## [0.2.0] — 2026-06 — Working Draft

### Added
- **Complete process layer.** JSON Schema for the remaining OCDS-aligned
  lifecycle objects: Need, Evaluation, Award, Contract, Order, Catalogue,
  Obligation, and Invoice.
- **EN 16931 building blocks** in the foundation definitions: Unit, InvoiceLine,
  and VatBreakdown, with field-level mappings to EN 16931 Business Terms.
- **EN 16931-mapped Invoice** schema and worked example. The Invoice carries
  33 EN 16931 Business Terms / Groups (BT-1…BT-158, BG-4/7/23/25), so a SIGNET
  invoice is convertible to Peppol BIS Billing / UBL Invoice / Factur-X. This is
  the structural basis for the EU ViDA cross-border e-invoicing claim.
- New worked examples: `need.json`, `contract.json` (with embedded obligations),
  and `invoice.json` (EN 16931-mapped, arithmetically consistent: €6,200 net +
  €1,302 VAT @ 21% = €7,502 payable), all CI-validated.

### Fixed
- BT-mapping annotations on `$ref` fields are now preserved under Draft-07 by
  wrapping the reference in `allOf` (Draft-07 ignores keywords that sit beside a
  bare `$ref`). EN 16931 traceability is now structurally retained in the schema.

## [0.1.0] — 2026-06 — Working Draft (Request for Comments)

### Added
- Foundation layer: Identifier, Party, Value, Period, Classification, Item,
  Credential, Document, Provenance, Score.
- Process layer (initial): SourcingEvent, Submission, Policy.
- Agent layer: SyntheticAgent, Mandate, Decision.
- Trust layer: Event, Consent.
- JSON-LD `@context` aligning to ePO, PROV, and W3C VC.
- Closed and open codelists (CSV).
- Worked examples with CI validation.

### Notes
- This is a working draft for community review. Field-level definitions are
  illustrative of the model's shape and not yet frozen.
- Targets JSON Schema Draft-07 for maximum implementer-tooling compatibility.
  A migration to 2020-12 will be considered before v1.0.
