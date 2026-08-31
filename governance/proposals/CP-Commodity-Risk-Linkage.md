# CP-Commodity-Risk-Linkage

**Status:** Draft — not yet balloted. Registered under IAR-0006.
> *Registered pre-constitution under IAR-0006. Registration is not adoption and does not pre-empt the Committee's agenda.*

**Origin:** the steward's review of a shipped extension that the steward's implementer-advisory role proposed. **Recusal:** the steward is recused from adoption; recorded at interests register entry 4.
**Affects:** `docs/extensions/commodity-risk.md`, `examples/commodity-risk/`, `codelists/eventType.csv`, `codelists/policyType.csv`, `codelists/bindings.json`, `schema/coverage-assessment.schema.json`, `schema/coverage-policy.schema.json`, `schema/hedge-proposal.schema.json`, `state-model/state-model.json`, `conformance/rules/check-commodity-risk.js`, `wiki/Codelists.md`
**Target:** the next v0.x minor after registration
**Breaking:** Core — no. Extension — yes for `CoveragePolicy` instances (§2.4 adds required fields); the extension is a Working Draft and the only instances on record are its own examples
**Depends on:** none for §2.1, §2.3, §2.5. §2.2 takes a position on a question CP-EventType-Closure also answers (gate L-1); §2.4 relies on `Policy` staying as shipped
**Blocks:** any conformance claim against the `commodity-risk` extension's rules 5 and 6; `docs/extensions/commodity-risk.md` moving from Working Draft

---

## 1. Problem statement

The `commodity-risk` extension merged at v0.10.0 with a spec, six schemas, eleven examples and an executable checker. Five things the spec says about how the extension attaches to the core are not true of the tree:

- **D-45.** The core linkage (§5) is specified under a key form the core rejects, and no example carries it.
- **D-46.** The ten event types (§6) were never minted, so D4 has no vocabulary.
- **D-47.** `policyEvaluationStatus` is described as closed and is unbound.
- **D-48.** `CoveragePolicy` is described as a `Policy` subtype and shares nothing with `Policy`.
- **D-49.** `HedgeProposal`'s lifecycle is on the surface IAR-0004 removed as a record.

Each is a divergence between a shipped record and the shipped artifact. None changes the design; every remedy makes the tree match the spec, or the spec match the mechanism that landed after it.

## 2. Proposal

### 2.1 Core linkage under the landed socket (D-45)

The spec's `commodityRisk.<field>` is replaced throughout by the Part 1 form:

| Core object | Spec §5 (as written) | Becomes |
|---|---|---|
| `Contract` | `commodityRisk.positions[]` | `commodity-risk:positions` — array of `Identifier` |
| `Need` | `commodityRisk.sourceProposal` | `commodity-risk:sourceProposal` — `Identifier` |
| `Award` | `commodityRisk.tranche` | `commodity-risk:tranche` — `{number: integer, size: {amount, unit}}` |
| `Decision` | `commodityRisk.assessmentContext` | `commodity-risk:assessmentContext` — `{coverageAssessment: Identifier, priceMarkSet: Identifier[]}` |

No core schema changes: the pattern on all four objects already admits these keys. The extension's *own* definition of the four values goes in a new `schema/commodity-risk-linkage.schema.json` (definitions only, no root object), so the values are validatable rather than merely permitted — the checker resolves the key and validates the value against it (rule 7, §4).

Three examples are added to `examples/commodity-risk/`: `contract.json` (the hedged position's `contract-2026-0117`, carrying `commodity-risk:positions`), `need.json` (instantiated by the approved proposal, carrying `commodity-risk:sourceProposal`), `decision.json` (the approval, carrying `commodity-risk:assessmentContext`). The `(stub) Award/Contract` phrase in §10 becomes true. Identifiers follow `did:web:<party>#<local>`.

### 2.2 Event types (D-46) — gate L-1

The ten events are minted as **bare rows in `codelists/eventType.csv`**, following the auction extension, renamed to the §2.5 convention of CP-EventType-Closure:

| Spec §6 | Minted | Emitted when |
|---|---|---|
| `position.ingested` | `exposurePosition.ingested` | a position record is created from an upstream contract or open-volume block |
| `position.revalued` | `exposurePosition.revalued` | a `markToMarket` position is repriced against a new `PriceMark` |
| `coverage.assessed` | `coverageAssessment.completed` | a `CoverageAssessment` is computed (carries its content hash) |
| `scenario.run` | `scenario.completed` | a `Scenario` is computed |
| `policy.breached` | `coveragePolicy.breached` | an assessment evaluates `belowMinimum` or `aboveMaximum` |
| `proposal.raised` | `hedgeProposal.raised` | transition `draft → pendingApproval` |
| `proposal.approved` | `hedgeProposal.approved` | transition `pendingApproval → approved` |
| `proposal.executed` | `hedgeProposal.executed` | transition `executing → executed` |
| `mark.observed` | `priceMark.observed` | a `PriceMark` is recorded |
| `snapshot.published` | `coverageAssessment.published` | a hash-anchored set of assessments is published as of a date |

Plus the three the lifecycle needs and §6 omitted: `hedgeProposal.rejected`, `hedgeProposal.withdrawn`, `hedgeProposal.executionStarted`. Thirteen rows. The spec §6 text is rewritten to the minted names.

**Gate L-1 — bare core rows or prefixed extension list?** CP-EventType-Closure §2.4 would put these in an extension-owned list as `commodity-risk:hedgeProposal.raised`. That CP is a parked draft and its prefix grammar carries an open defect (D-37). Registering thirteen rows into an `open` list is the smallest change, it is what the auction extension did, and if §2.4 is adopted the migration is mechanical for every extension at once. *Recommended: bare rows.* Declined alternative recorded in §6.

### 2.3 `policyEvaluationStatus` becomes a bound closed codelist (D-47)

The CSV exists; the binding does not. `codelists/bindings.json` gains an entry binding `codelists/policyEvaluationStatus.csv` at `coverage-assessment.schema.json#/properties/policyEvaluation/properties/status`, closure `closed`, in whatever form the file uses for `positionStatus.csv` (the extension's other closed list, which is bound). From that entry `check-codelist-binding.js` asserts CSV/enum agreement on every commit, and under IAR-0003 the enum is generated rather than hand-maintained. No row in the CSV changes. Spec §8's "closed" becomes true on the tree.

### 2.4 `CoveragePolicy` becomes a `Policy` (D-48)

Two changes, one in each direction:

1. `codelists/policyType.csv` gains `coverageCorridor` — "Hedged-ratio corridor per market and horizon; the `commodity-risk` extension's `Policy` subtype."
2. `schema/coverage-policy.schema.json` gains `allOf: [{ "$ref": "policy.schema.json" }]` and `policyType` becomes `const: coverageCorridor`. The corridor fields stay as they are. Consequence: `expressionLanguage`, `expression`, `version`, `issuedBy` become required on a `CoveragePolicy`. For the corridor, `expressionLanguage: "commodity-risk/corridor-v1"` and `expression` is the JSON Pointer `"#/corridors"` — the corridor *is* the expression, and `humanReadable` already exists. `examples/commodity-risk/coverage-policy.json` is updated.

This is the change that makes D3 true: a `Mandate` referencing a `CoveragePolicy` is referencing a `Policy`, and every Agent-layer rule that reads `policyType` sees `coverageCorridor`.

**Under Draft-07** the `allOf` composition with `additionalProperties: false` on both sides fails by construction (CP-Extension-Composition §1). Two ways through, and this CP takes the first: (a) `coverage-policy.schema.json` restates `Policy`'s properties instead of composing — a copy, the D-1 pattern, recorded as a *known temporary duplication* closed on the 2020-12 migration; (b) wait for the v1.0 train. *Recommended: (a), with the duplication listed in the CP's own residue so it cannot be forgotten.* Gate L-2.

### 2.5 `HedgeProposal` lifecycle into the registry (D-49)

`state-model/state-model.json` `HedgeProposal` gains the seven states and these transitions, each with a `basis` citing spec §4.6:

| From | To | Event | Class |
|---|---|---|---|
| `draft` | `pendingApproval` | `hedgeProposal.raised` | — |
| `draft` | `withdrawn` | `hedgeProposal.withdrawn` | abandonment (terminal) |
| `pendingApproval` | `approved` | `hedgeProposal.approved` | — |
| `pendingApproval` | `rejected` | `hedgeProposal.rejected` | abandonment (terminal) |
| `pendingApproval` | `withdrawn` | `hedgeProposal.withdrawn` | abandonment (terminal) |
| `approved` | `executing` | `hedgeProposal.executionStarted` | — |
| `executing` | `executed` | `hedgeProposal.executed` | completion (terminal) |

Initial: `draft`. Terminal: `executed`, `rejected`, `withdrawn`. `modelled: true`; the rationale key is removed. `check-state-model.js --write` regenerates the schema enum from the registry; the fourteen checks pass or the change does not land. R-1 holds (no relation-valued state). `approved → executed` directly is not a transition: execution is a procurement and takes time, which is the point of `executing`.

## 3. Schema changes

Additive to core (none). Extension: `coverage-policy.schema.json` per §2.4 (breaking for `CoveragePolicy` instances); `hedge-proposal.schema.json` `status` enum regenerated (same seven values — no instance change); `coverage-assessment.schema.json` unchanged in shape, its enum now bound via `bindings.json`. New `schema/commodity-risk-linkage.schema.json`. All Draft-07; `$id` in the `v0.1` namespace like the six existing.

## 4. Conformance suite changes

`check-commodity-risk.js` gains: **rule 7** — every `commodity-risk:*` key on a core instance validates against `commodity-risk-linkage.schema.json`; **rule 5 (tightened)** — an `executed` proposal resolves to a `Contract` *instance in the dataset* whose `commodity-risk:positions` includes a position appearing in a later assessment; **rule 6 (tightened)** — a `hedged` position's `contract` resolves to a `Contract` instance in the dataset. Fixtures: the three new examples plus `conformance/fixtures/invalid/commodity-risk-orphan-contract.json` (a hedged position naming a contract not in the dataset — must fail). The existing negative fixture stands.

## 5. Backward compatibility

Core: no change. Extension: `CoveragePolicy` instances gain four required fields (§2.4); every other instance stays valid. `docs/extensions/commodity-risk.md` §5, §6, §8, §4.2, §4.6 rewritten to the tree; the merge record is not edited — a note is appended stating that §1.3 and §1.4 of that record described the specification, not the schemas, and pointing here (the D-43 discipline: correct forward, never rewrite).

## 6. Rejected alternatives

**A — Keep `commodityRisk` and add it as an explicit optional property on the four core objects.** Declined: a second extension mechanism beside the one that landed; every extension would then ask for the same.
**B — Prefixed extension event list (`commodity-risk:hedgeProposal.raised`).** Declined for now: depends on a parked CP with an open grammar defect (D-37); migration later is mechanical. Re-proposal requires CP-EventType-Closure adoption.
**C — Leave `CoveragePolicy` standalone and drop the subtype claim from the spec.** Declined: it forfeits D3, which both reviews named as the reason the extension is a SIGNET extension rather than a reporting schema.
**D — Model `HedgeProposal` with `approved → executed` and no `executing`.** Declined: hides the procurement that D1 says the approval instantiates.

## 7. Open gates

- **L-1** (§2.2): bare rows — recommended — or prefixed list. ⛔ Committee.
- **L-2** (§2.4): restate `Policy` properties now with recorded duplication — recommended — or wait for 2020-12. ⛔ Committee.

Nothing else is gated; §2.1, §2.3, §2.5 are mechanical.
