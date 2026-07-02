# SIGNET Canonical Data Model — Commodity Risk Extension v0.1

**Extension id:** `commodity-risk` · **Status:** Working Draft · **Licence:** CC0 1.0
**Steward:** Concert Foundation
**Extends:** SIGNET CDM v0.1 — Process layer (linkage), Agent layer (Policy subtype,
Decision context), Trust layer (event types), Foundation (codelists).

This extension adds **portfolio-level commodity risk governance** to the SIGNET CDM:
positions, coverage policies, price marks, assessments, scenarios, and hedge
proposals, and their linkage into the core process chain. Electricity is the
reference commodity in all examples; the schema is commodity-generic (gas, fuel,
certificates, metals).

---

## 1. Motivation

The core process layer models procurement as a transactional lifecycle:
Need → SourcingEvent → … → Contract → Invoice. Commodity procurement at portfolio
scale follows that lifecycle *per transaction*, but the governing activity is
continuous: maintaining hedge coverage across markets and delivery periods, inside a
policy corridor, against moving market prices. The core has no first-class
representation of a position, a coverage corridor, a price observation, a computed
coverage state, a shock scenario, or the proposal that turns a risk decision into a
procurement action. This extension adds them. Any organisation procuring
electricity, gas, fuel, or metals at scale operates some version of policy-corridor
hedging; like auctions, it is a recurring technique the core should not carry but
the network should share one vocabulary for.

## 2. Design principles (normative intent)

- **D1 — The process chain is not forked.** A hedge execution *is* procurement. An
  approved `HedgeProposal` instantiates a core `Need`; the resulting SourcingEvent,
  Award, and Contract are unmodified core objects. The extension adds context; it
  never replaces core objects.
- **D2 — Positions derive from Contracts.** An `ExposurePosition` references the core
  `Contract` that creates it (except mark-to-market open volume, which references
  none). There is no parallel contract register.
- **D3 — Risk policy is agent governance.** The coverage corridor is a subtype of the
  Agent-layer `Policy`, so the same policy that constrains a human decision bounds a
  synthetic agent's `Mandate`, and every automated recommendation is checkable
  against it by the network.
- **D4 — Assessments are events.** Every `CoverageAssessment` and `Scenario` run
  emits a Trust-layer `Event` with a content hash: immutable, time-stamped,
  comparable portfolio states.
- **D5 — Everything reconciles.** Hedged volume + floating volume = mark-to-market
  volume per (market, delivery period, portfolio scope), enforced by the conformance
  suite as a rule, not a convention.

## 3. Scope boundaries (normative)

1. **Not a trading-system schema.** The extension does not model order books,
   intraday execution, margining, or exchange connectivity. Execution systems
   (ETRM/treasury) remain systems of record; this extension defines their governed
   representation on the network.
2. **Not a regulatory reporting mechanism.** Records under this extension do not
   constitute, and implementations MUST NOT represent them as, market-abuse or
   trade-reporting submissions under any regulatory regime. The extension provides
   internal governance and audit; regulatory reporting remains a distinct obligation
   of the participants.
3. Retail/consumption billing uses the core `Invoice` unchanged.

## 4. New objects

### 4.1 `ExposurePosition`

The atomic record: what one contract (or one block of open volume) contributes to
exposure in one market for one delivery period.

Key fields: `id`; `portfolioScope` (codelist — carries portfolio segmentation such as
core / non-core / infrastructure carve-outs as a filter, not a second dataset);
`market`; `beneficiary` and `counterparty` (`Party` references); `commodity`
(codelist); `positionStatus` ∈ {`hedged`, `floating`, `markToMarket`} (closed — the
three statuses that must reconcile, D5); `instrument` (codelist); `contract` (core
`Contract` reference — required when `positionStatus: hedged`, omitted for
`markToMarket`, whose price derives from the applicable `PriceMark`); `deliveryPeriod`
(`{year, basis, profile}` — see §7 on profiles); `volume` (amount + unit);
`economics` (commodity `price`/`cost`, optional local-currency block, optional
`regulatedPrice` and `tcoPrice` carrying the non-commodity stack so total-cost views
are computable while commodity-only analysis uses `price`); `sourceReference`
(upstream system's composite key, for audit continuity during migration);
`provenance` (Trust `Event` reference).

Illustrative instance (all values synthetic; parties neutral):

```json
{
  "id": "pos-de-2027-baseload-0042",
  "portfolioScope": "core",
  "market": "DE",
  "beneficiary": { "id": "party-buyer-de", "name": "Buyer DE" },
  "counterparty": { "id": "party-supplier-x", "name": "Example Energy AG" },
  "commodity": "electricity",
  "positionStatus": "hedged",
  "instrument": "baseloadForward",
  "contract": { "id": "contract-2026-0117" },
  "deliveryPeriod": { "year": 2027, "basis": "fiscalYear",
    "profile": { "unit": "MWh", "values": [
      { "period": "2027-04", "value": 8500 }, { "period": "2027-05", "value": 8500 },
      { "period": "2027-06", "value": 8200 }, { "period": "2027-07", "value": 8500 },
      { "period": "2027-08", "value": 8500 }, { "period": "2027-09", "value": 8200 },
      { "period": "2027-10", "value": 8500 }, { "period": "2027-11", "value": 8200 },
      { "period": "2027-12", "value": 8500 }, { "period": "2028-01", "value": 8500 },
      { "period": "2028-02", "value": 7700 }, { "period": "2028-03", "value": 8500 } ] } },
  "volume": { "amount": 100300, "unit": "MWh" },
  "economics": {
    "price": { "amount": 96.40, "currency": "EUR", "unit": "MWh" },
    "cost": { "amount": 9668920, "currency": "EUR" }
  },
  "sourceReference": "DE2027|hedged|FY|buyer-de",
  "provenance": { "eventId": "evt-ingest-2026-07-01-0093" }
}
```

### 4.2 `CoveragePolicy` — a `Policy` subtype (Agent layer)

The coverage corridor: the acceptable hedged-ratio band per market and horizon,
conditioned on declared market classifications. Modelled as a **subtype of the core
`Policy`** (`policyType: coverageCorridor`) so a `SyntheticAgent` operating a hedging
capability holds a `Mandate` bounded by it (D3).

Structure: `classification` declares the dimensions and their bands (e.g. a risk
dimension and a volume dimension, three bands each — a 3×3 corridor matrix; the
schema does not hardcode the grid, so a 4×3 or single-dimension policy validates);
`corridors[]` gives, per (band-combination, horizon), the `hedgedRatio`
`{minimum, target, maximum}`; `marketClassifications[]` assigns each market to bands;
`breachHandling` governs rule ordering.

**Normative:** `breachHandling` rule matrices MUST be ordered escalation-first —
breach and escalation rules evaluate before in-corridor rules — and MUST terminate in
a catch-all. (Mid-band-first ordering is a known latent misclassification defect in
production rule sets; the conformance suite includes a test case.)

All corridor values in examples are illustrative placeholders.

### 4.3 `PriceMark`

An observed market price for a (commodity, market, product, delivery period), from a
named source at a timestamp: the valuation input for mark-to-market volume and for
scenarios. Fields: `value` (amount/currency/unit), `markType` (codelist:
forwardClose, spotSettlement, brokerQuote, internalCurve), `source` (name + feed id),
`observedAt`, and `fxContext` (binds the mark to a rate set so local-currency
positions revalue consistently).

> **Core graduation candidate.** `PriceMark` is deliberately self-contained and
> commodity-generic. It remains in this extension for v0.1 and graduates to core
> when a second real consumer exists (e.g. auction reference pricing, indexed
> contracts). The auction extension's price handling and this object are designed to
> compose.

### 4.4 `CoverageAssessment`

The computed coverage state for one (market, delivery period, basis, portfolio
scope) at a point in time. **Derived, never hand-entered; always event-anchored
(D4).** Fields: the three `volumes` (hedged / floating / markToMarket),
`weightedPrices` (hedged / floating), `hedgedRatio`, `policyEvaluation`
(`policyId`, the `corridorApplied`, `status` ∈ {`withinCorridor`, `belowMinimum`,
`aboveMaximum`, `noPolicyDefined`} — closed codelist — and `distanceToMinimum`),
`reconciliation` (status, rule, tolerance — the D5 check materialised),
`positions[]` (every contributing `ExposurePosition` id), `provenance` (Event).

A `belowMinimum` evaluation is the standard trigger for a `HedgeProposal`.

### 4.5 `Scenario`

A defined set of price shocks applied to the open (floating + mark-to-market)
position, with results. Fields: `basePriceMarkSet`; `shockBands[]` (named bands —
codelist `shockBand`: normalRange, persistentHigh, crisis — each with shock
multipliers); `results[]` per delivery period carrying a `baseline`
(total/fixed/floating cost) and `impacts[]` (shock → delta).

**Normative integrity rule:** impacts are computed on floating cost only; **fixed
cost is invariant under shock**. A scenario in which fixed cost moves under a price
shock is non-conformant. Every result MUST expose total, fixed, and floating cost.

### 4.6 `HedgeProposal` — the bridge into the core process chain

The action item that carries a risk decision into procurement. An approved proposal
**instantiates a core `Need`** (D1); everything downstream is unmodified core.

Fields: `trigger` (`type` codelist: policyBreach, marketOpportunity, demandRevision,
contractExpiry, manual; plus the referenced `coverageAssessment` and its
`policyEvaluation`); `market`; `deliveryPeriod`; `currentHedgedRatio` /
`proposedHedgedRatio`; `incrementalVolume`; `instrument`; `executionRoute` (codelist:
newSourcingEvent, callOffUnderFramework, directNegotiation — determines what the
instantiated `Need` produces downstream); optional `frameworkContract`; `rationale`;
`decision` (Agent-layer `Decision` reference — the same record structure whether the
proposal was raised by a synthetic agent under mandate or by a human, with
human-in-the-loop approval expressed through the status lifecycle); `status`
(`draft → pendingApproval → approved → executing → executed | rejected | withdrawn`);
`onApproval` (`instantiates: Need` + a `needTemplate`).

Executed proposals close the loop: the resulting `Contract` produces new
`ExposurePosition` records, the next `CoverageAssessment` reflects them, and the
policy evaluation re-runs.

## 5. Additions to existing core objects

Kept minimal (D1, D2). All additions live under the extension's namespace key
**`commodityRisk`** and MUST NOT alter any core object's `required` set or
`additionalProperties` semantics, per the CDM extension mechanism.

| Core object | Added field (namespaced) | Purpose |
|---|---|---|
| `Contract` | `commodityRisk.positions[]` | Back-references to the positions a contract creates |
| `Need` | `commodityRisk.sourceProposal` | Traceability to the HedgeProposal that instantiated it |
| `Award` | `commodityRisk.tranche` | Tranche number/size for staged execution |
| `Decision` | `commodityRisk.assessmentContext` | The CoverageAssessment and PriceMark set decided against |
| `Event` | new event types | §6 |

## 6. Trust-layer event types

New event-type codelist entries: `position.ingested`, `position.revalued`,
`coverage.assessed`, `scenario.run`, `policy.breached`, `proposal.raised`,
`proposal.approved`, `proposal.executed`, `mark.observed`, `snapshot.published`.

`snapshot.published` carries a content hash over the full assessment set at a date —
immutable, comparable, time-stamped portfolio states; the audit answer to "what did
we know and when."

## 7. Volume profiles (normative)

Delivery-period profiles are an **array of `{period, value}`** (with a single `unit`
per profile), where `period` is an ISO month (`YYYY-MM`) or finer ISO interval. A
fixed monthly shape or a specific fiscal-year start is a profile-local constraint,
not a normative structure; profiles MAY constrain to fixed monthly granularity
locally. This admits sub-monthly granularity and any fiscal calendar.

## 8. Codelists

| Codelist | Values (initial) | Open? |
|---|---|---|
| `commodity` | electricity, gas, fuel, certificates-recEac, other | open |
| `positionStatus` | hedged, floating, markToMarket | **closed** (reconciliation depends on it) |
| `instrument` | ppa, cppa, baseloadForward, peakForward, greenTariff, fixedPriceSupply, floatingSupply, financialSwap, other | open |
| `deliveryBasis` | calendarYear, fiscalYear, quarter, month | open |
| `portfolioScope` | core, nonCore, infrastructure, other | open |
| `shockBand` | normalRange, persistentHigh, crisis | open |
| `policyEvaluationStatus` | withinCorridor, belowMinimum, aboveMaximum, noPolicyDefined | **closed** (conformance depends on it) |
| `proposalTrigger` | policyBreach, marketOpportunity, demandRevision, contractExpiry, manual | open |
| `executionRoute` | newSourcingEvent, callOffUnderFramework, directNegotiation | open |
| `markType` | forwardClose, spotSettlement, brokerQuote, internalCurve | open |

## 9. Conformance rules

Added to the conformance suite as validated examples **plus rule checks** (three of
these are cross-object arithmetic/ordering rules beyond schema validation):

1. **Reconciliation.** Per (market, deliveryPeriod, portfolioScope):
   Σ hedged + Σ floating = markToMarket volume, within declared tolerance.
2. **Scenario integrity.** Fixed cost invariant under shock; every result exposes
   total, fixed, floating.
3. **Escalation-first ordering.** `CoveragePolicy.breachHandling` matrices evaluate
   breach/escalation rules first and terminate in a catch-all.
4. **Assessment provenance.** Every `CoverageAssessment` and `Scenario` references a
   Trust `Event`; every position in an assessment resolves to an `ExposurePosition`.
5. **Chain closure.** Every `HedgeProposal` with status `executed` resolves to a core
   `Contract` whose positions appear in a subsequent assessment.
6. **No orphan positions.** Every `ExposurePosition` with status `hedged` references
   a core `Contract`.

## 10. Worked example

One validated example file accompanies the schemas: one market, one delivery period,
one full loop — policy → position set → mark set → assessment (`belowMinimum`) →
scenario → proposal → approval decision → instantiated Need → (stub) Award/Contract →
new position → re-assessment (`withinCorridor`). It is the extension's CI-validated
example in the standard repo.

> **Synthetic data statement.** All volumes, prices, ratios, corridor values,
> parties, and counterparties in this specification and its examples are synthetic.
> No live position, policy parameter, or commercial term of any organisation appears
> in this document or its artifacts.

## 11. Relationship to adjacent work

- **ESG / renewable reporting.** PPA positions created here are the same contracts
  consumed by sustainability flows; `instrument: ppa|cppa` and
  `commodity: certificates-recEac` provide the join with no duplicate register.
- **OCDS.** `HedgeProposal → Need → SourcingEvent → Award` publishes as an ordinary
  OCDS contracting process where the core maps to OCDS; extension objects are
  internal-network objects and are not published to OCDS.
- **Auction extension.** `PriceMark` and the auction extension's price handling are
  designed to compose (§4.3 graduation note).
- **Execution systems.** Positions and marks ingest from ETRM/treasury systems and
  market-data feeds; the extension is their governed network representation, not
  their replacement (§3).
