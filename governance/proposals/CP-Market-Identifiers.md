# CP-Market-Identifiers

**Status:** Draft — not yet balloted. Registered under IAR-0006.
> *Registered pre-constitution under IAR-0006. Registration is not adoption and does not pre-empt the Committee's agenda.*

**Origin:** the steward's review of a shipped extension that the steward's implementer-advisory role proposed. **Recusal:** the steward is recused from adoption; recorded at interests register entry 4.
**Affects:** `codelists/identifierScheme.csv`, `schema/exposure-position.schema.json`, `schema/coverage-assessment.schema.json`, `schema/hedge-proposal.schema.json`, `schema/price-mark.schema.json`, `schema/coverage-policy.schema.json`, `examples/commodity-risk/`, `docs/extensions/commodity-risk.md`, `wiki/Codelists.md`
**Target:** the next v0.x minor after registration
**Breaking:** No — one codelist row and optional fields
**Depends on:** none. `CP-Quantity-Unit` §2.3 references the scheme this CP adds but does not require it
**Blocks:** nothing in core; an energy implementer's ability to identify a market area, metering point or market participant by the scheme the sector uses

---

## 1. Problem statement

**D-52.** `market` is a free string (`"DE"`) on five extension schemas. It is the partition key of the reconciliation rule and of every corridor assignment, and it has no scheme. `identifierScheme.csv` has no entry for the Energy Identification Code (EIC), the ENTSO-E scheme under which European market areas, metering points and market participants are identified. A `Party` that is an energy market participant cannot carry its EIC as an `Identifier` today.

## 2. Proposal

### 2.1 `identifierScheme` gains `eic`

One row: `eic` · "Energy Identification Code" · "ENTSO-E EIC, 16 characters; identifies market participants, areas, metering points and resources in the European energy sector." No colon in the code, so D-37's prefix collision does not arise.

### 2.2 `marketArea` beside `market`

The five extension schemas gain optional `marketArea` → `definitions.schema.json#/definitions/Identifier` next to `market`. `market` stays as the human-readable partition key (the reconciliation rule keeps keying on it). The spec §4.1 gains: "Where the market is an identified area, `marketArea` SHOULD carry its identifier (scheme `eic` for European electricity and gas areas)." `CoveragePolicy.marketClassifications[]` gains the same optional field so a corridor can be assigned to an identified area.

The examples add `"marketArea": {"scheme": "eic", "id": "<16-character synthetic code>"}` to the German-market instances, with a synthetic code stated as such — no real EIC is copied into the tree.

### 2.3 Nothing else

No `market` codelist. Market naming conventions differ by commodity and by exchange; the identifier is the interoperable fact, the label is local.

## 3. Schema changes

Extension only, additive. Core: one codelist row.

## 4. Conformance suite changes

`check-commodity-risk.js` **rule 8**: where two positions in one assessment both carry `marketArea`, they carry the same one (an assessment is per market). Fixture: an invalid assessment mixing two areas under one `market` label.

## 5. Backward compatibility

Non-breaking. Every instance on record stays valid.

## 6. Rejected alternatives

**A — Retype `market` to `Identifier`.** Declined: breaking for every extension instance, and the label has value of its own.
**B — Add `eic` only to the extension's own codelist.** Declined: EIC identifies parties, which are core; an identifier scheme lives in the core list, as `gleif:lei` does.
**C — Also add ACER registration codes.** Declined for now: a regulatory-registration identifier, which spec §3.2's boundary keeps out of scope. Re-proposal requires a consumer that is not regulatory reporting.
