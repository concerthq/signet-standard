# Changelog

All notable changes to the SIGNET Canonical Data Model are recorded here.
This standard uses [Semantic Versioning](https://semver.org/): the MAJOR
version changes only on a breaking change to the core model.

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
