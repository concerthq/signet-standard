# Changelog

All notable changes to the SIGNET Canonical Data Model are recorded here.
This standard uses [Semantic Versioning](https://semver.org/): the MAJOR
version changes only on a breaking change to the core model.

## [Unreleased]

### Added
- **Extension conformance rules** — executable cross-object checkers for the
  onboarding (case↔qualification closure, conditional integrity), auction (the
  recorded winner equals the deterministic close; reserve integrity), and identity
  (Full-level: humanApproval resolves both ways; approver ceiling covers the decided
  value) extensions, wired into CI. All four extensions now have machine-backed
  conformance. Governance: commodity-risk resubmission record — merged as Working
  Draft.

## [0.10.0] — 2026-07-05 — Working Draft

### Added
- **Onboarding extension spec** at `docs/extensions/onboarding.md` (previously
  undelivered; schemas and demo shipped in 0.6.x).
- **Commodity-risk extension — technical artifacts.** Six schemas (ExposurePosition,
  CoveragePolicy as a Policy subtype, PriceMark, CoverageAssessment, Scenario,
  HedgeProposal), ten codelists (positionStatus and policyEvaluationStatus closed),
  an eleven-file full-loop worked example (belowMinimum → proposal → executed →
  withinCorridor, arithmetically reconciled), and the six conformance rules as an
  executable checker (`conformance/rules/check-commodity-risk.js`) — three are
  cross-object checks beyond schema validation: reconciliation arithmetic, scenario
  fixed-cost invariance, escalation-first rule ordering. Completes the extension
  accepted in principle in `governance/reviews/2026-07-commodity-risk.md`.

## [0.9.0] — 2026-07-05 — Working Draft

### Added
- **Identity profile (Working Draft)** — `docs/extensions/identity.md`: how SIGNET
  represents natural persons. Humans act under Mandates (core `Mandate` reused —
  `agent` accepts any actor); authority is a `delegationOfAuthority` Credential;
  new `Approval` object makes `humanApproval` resolvable and verifiable
  (approver pseudonym, role, authority credential, provenance). Normative no-PII
  rule for hash-anchored records (pseudonymous person references only; resolution
  is an organisational obligation). Authentication is out of scope by design.
  The agent demo now emits the verifiable `Approval` at runtime and checks the
  approver's authority ceiling covers the award value.
- **Commodity-risk extension (Working Draft spec)** — `docs/extensions/commodity-risk.md`:
  portfolio-level commodity risk governance (positions, coverage corridors as Agent-layer
  Policy subtypes, price marks, assessments, scenarios, hedge proposals bridging to core
  `Need`). Accepted in principle by the Standards Committee
  (`governance/reviews/2026-07-commodity-risk.md`) — the first member-proposed extension,
  reviewed under the identical process as any proposer. Schemas, worked example, and
  conformance rules to follow as a separate change.

### Changed
- **Documentation & demo alignment.** Brought the repository's prose level with its code:
  the top-level `README.md` now documents the conformance harness, the **three
  demonstrations** (agent award, onboarding, auction) with their current outcomes, and an
  **Extensions & profiles** table with per-item status. `agent/README.md` was corrected to
  the current MAT weighting (price 0.20 / quality 0.55 / social 0.25 — the dearer,
  higher-quality bid wins 0.859474 vs 0.8415) and the verifiable-`Approval` check. Extension
  specs are consolidated under `docs/extensions/<id>.md` (the auction spec renamed to
  `auction.md`) with a new `docs/extensions/README.md` index; the wiki sidebar points at the
  specs and demos. No schema or normative change.

## [0.8.0] — 2026-07 — Working Draft

### Added
- **Auction extension** — process-layer objects `Auction` (a profile of the sourcing
  flow; reverse / english / dutch / sealed-bid / multi-criteria via `auctionType` +
  deterministic `rules`) and `Bid`. The auction rules and canonical bid record are
  normative and operator-independent — any conformant operator closing the same bids
  under the same rules MUST reach the same `Award`. The close reuses `Decision`/`Award`;
  eligibility ties to `SupplierQualification`; the bid history is a hash-chained `Event`
  trail. Open `auctionType` codelist; reverse-auction worked example. Modelled on
  Prozorro's neutral-core architecture: price formation in the standard, UX in the
  operators.

## [0.7.0] — 2026-06 — Working Draft

### Added (all optional, non-breaking)
- **Settlement linkage** — makes the commitment→discharge loop traversable as data
  (Concepts of Open Commerce §9, the Settlement primitive):
  - `Obligation.dischargedBy` — references the Order/Invoice/Document(s) that
    discharged the obligation. SHOULD be present once `status` is `met`.
  - `Invoice.settles` — references the Obligation(s) the invoice settles.
    SIGNET-original: it is **not** an EN 16931 Business Term and is **omitted on the
    Peppol BIS projection**, so ViDA convertibility is unchanged. A new projection-skip
    guard (`npm run test:projection-skip`) proves `settles` never leaks into UBL.
  - `eventType` codelist: `obligation.discharged`.
  - Three worked fixtures, all conformance-checked: a discharged obligation, a
    *pending* obligation carrying neither new field (the machine proof the additions
    are optional), and an invoice with `settles`.
- Referent granularity uses a composite `contractId/obligationId` URI (option (a));
  `Obligation.id` is unchanged. No existing field changed; documents valid before this
  release remain valid.

### Changed (non-breaking; examples only)
- **MAT evaluation policy reweighted to price 20% / quality 55% / social value 25%**
  (was 40 / 35 / 25). The change is carried in the policy's own `expression`
  (`score := price*0.2 + quality*0.55 + social*0.25`) and its `humanReadable`
  statement; `examples/policy-evaluation.json` bumped to `version: 1.1.0`. The agent
  demo reads the weights from the Policy expression, so its trace and scores
  regenerate from this single source.
- **Award scenario now demonstrates a justified price premium.** Under the new
  weighting the dearer bid wins: `submission-5521` (€11.4M, quality 0.9, social 0.7)
  scores **0.859474**, ahead of `submission-5522` (€10.8M, quality 0.78, social 0.85)
  at **0.841500** (margin 0.017974) — a 5.56% price premium accepted on materially
  higher quality. The demo is now a proof of governed multi-criteria judgement rather
  than a low-bid pick. `examples/award-decision.json` (Appendix A) and the agent run
  resolve to the same winner, weights, and scores.
- The **award value (€11.4M, the winning bid)** remains intentionally distinct from the
  **contract value (€12M, the category tier)** in `examples/contract.json`: awards are
  struck at the bid, contracts at the tier/ceiling. No schema or normative-grammar
  changes; sub-criterion scores are unchanged, only the weighting and resulting totals.

## [0.6.0] — 2026-06 — Working Draft

### Added
- **Supplier onboarding extension** — process-layer objects `OnboardingCase`
  (buyer-internal workflow; invited + submitted entry; revalidation/remediation
  case types) and `SupplierQualification` (durable status with first-class
  `conditional` qualification, value caps and category restrictions). Reuses
  Credential/Policy/Decision/Event/Consent. Screening results carried as
  attestations, never performed by SIGNET. Open `credentialType` codelist; two
  worked examples. Workflow states are normative; credential types are extensible.

## [0.5.0] — 2026-06 — Working Draft

### Added
- **Agent demonstration** (`agent/`) — a runnable proof that a synthetic agent can
  take a governed, accountable, conformant action. An agent reads a SourcingEvent,
  is bounded by a **Mandate** (its €12M value exceeds the €10M autonomous ceiling, so
  **human approval is required**), applies the **published** MAT evaluation Policy
  (weights parsed from the Policy's own expression), and emits an Award **Decision**
  with rationale, inputs, policies applied, human approval, and provenance — plus a
  five-event, hash-chained audit trail.
  - `agent-card.json` (A2A), `mandate.json`, two `Submission` bids, assessment inputs.
  - `reasoner.js` — the pluggable "Model" (deterministic default; marked seam for a
    live frontier model via MCP/A2A).
  - `agent-runtime.js` — the "Harness": mandate gate, policy application, provenance,
    event-chaining.
  - `run-agent.js` — runs the scenario, narrates it, and **verifies the output is
    conformance-clean** (every object validates; chain holds; tampering detected).
  - `LIVE_MODEL_NOTE.md` — how to swap in a real model for a live demo with no change
    to the harness.
- CI now runs the agent demo on every commit; its output must validate and the event
  chain must hold.

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
