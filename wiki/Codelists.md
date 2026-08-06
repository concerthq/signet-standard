# Codelists

Codelists are the controlled vocabularies that constrain coded fields in the CDM. They live
in `codelists/` as CSV files with a fixed header: **`Code,Title,Description`**. CI lints this
header on every push.

Codelists are split into two tiers (see [Governance & Versioning](Governance-and-Versioning)):

- **Closed lists** are *normative* — values change only through the Standards Committee
  revision process.
- **Open lists** are *non-normative* — values may be added freely by pull request.

| Codelist | Used by |
|----------|---------|
| [identifierScheme](#identifierscheme) | [Identifier.scheme](Foundation-Layer#identifier) |
| [partyRole](#partyrole) | [Party.roles](Foundation-Layer#party) |
| [procedure](#procedure) | [SourcingEvent.procedure](Process-Layer#sourcingevent) |
| [submissionStatus](#submissionstatus) | [Submission.status](Process-Layer#submission) |
| [auctionType](#auctiontype) | [Auction.auctionType](Process-Layer#auction) |
| [decisionType](#decisiontype) | [Decision.decisionType](Agent-Layer#decision) |
| [policyType](#policytype) | [Policy.policyType](Agent-Layer#policy) |
| [eventType](#eventtype) | [Event.eventType](Trust-Layer#event) |
| [documentType](#documenttype) | [Document.documentType](Foundation-Layer#document) |
| [invoiceTypeCode](#invoicetypecode) | [Invoice.invoiceTypeCode](Process-Layer#invoice) |
| [vatCategory](#vatcategory) | [InvoiceLine.vatCategoryCode](Foundation-Layer#invoiceline), [VatBreakdown.categoryCode](Foundation-Layer#vatbreakdown) |
| [credentialType](#credentialtype) | `SupplierQualification` / `Approval.authorityCredential` ([onboarding](Extensions#the-onboarding-extension) & [identity](Extensions#working-draft-the-identity-profile) extensions) |

The lists below belong to the [commodity-risk extension](Extensions#working-draft-the-commodity-risk-extension) (all open unless marked closed):

| Codelist | Used by |
|----------|---------|
| [commodity](#commodity) | `ExposurePosition.commodity`, `CoveragePolicy`, `PriceMark` |
| [positionStatus](#positionstatus) | `ExposurePosition.positionStatus` — **closed** |
| [instrument](#instrument) | `ExposurePosition.instrument` |
| [deliveryBasis](#deliverybasis) | position / horizon delivery basis |
| [markType](#marktype) | `PriceMark.markType` |
| [policyEvaluationStatus](#policyevaluationstatus) | `CoverageAssessment.status` — **closed** |
| [portfolioScope](#portfolioscope) | portfolio classification band |
| [executionRoute](#executionroute) | `HedgeProposal.executionRoute` |
| [shockBand](#shockband) | `Scenario.shockBand` |
| [proposalTrigger](#proposaltrigger) | `HedgeProposal.trigger.type` |

---

## identifierScheme

| Code | Title | Description |
|------|-------|-------------|
| `did` | Decentralised Identifier | W3C DID. RECOMMENDED for parties and agents. |
| `gleif:lei` | Legal Entity Identifier | ISO 17442 LEI issued under GLEIF. |
| `gs1:gln` | Global Location Number | GS1 GLN. |
| `vat` | VAT number | National VAT registration number. |
| `companies-house` | UK Companies House number | UK company registration number. |
| `peppol` | PEPPOL Participant Identifier | Peppol network participant id. |

## partyRole

| Code | Title | Description |
|------|-------|-------------|
| `buyer` | Buyer | The party acquiring goods/services. |
| `supplier` | Supplier | The party offering goods/services. |
| `procuringEntity` | Procuring entity | The entity running the procurement on behalf of the buyer. |
| `payer` | Payer | The party making payment. |
| `payee` | Payee | The party receiving payment. |
| `humanAgent` | Human agent | A natural person acting in the network. |
| `syntheticAgent` | Synthetic agent | An AI agent acting in the network. |
| `certifier` | Certifier | An authority issuing verifiable credentials. |
| `observer` | Observer | A read-only participant (auditor, regulator). |

## procedure

| Code | Title | Description |
|------|-------|-------------|
| `open` | Open | Any interested supplier may submit. |
| `restricted` | Restricted | Two-stage: select then invite. |
| `competitiveFlexible` | Competitive flexible procedure | Bespoke multi-stage procedure (UK Procurement Act 2023). |
| `directAward` | Direct award | Award without competition where permitted. |
| `frameworkCallOff` | Framework call-off | Call-off competition under an existing framework. |

## submissionStatus

| Code | Title | Description |
|------|-------|-------------|
| `draft` | Draft | Not yet submitted. |
| `submitted` | Submitted | Lodged with the procuring entity. |
| `withdrawn` | Withdrawn | Withdrawn by the supplier. |
| `admissible` | Admissible | Passed admissibility checks. |
| `inadmissible` | Inadmissible | Failed admissibility checks. |

## auctionType

*Open list* — the profiles of the [`Auction`](Process-Layer#auction) primitive. Reverse,
English, Dutch, sealed-bid, and multi-criteria auctions are all profiles of one object,
parameterised by `auctionType` and `rules`; new profiles may be added by pull request.

| Code | Title | Description |
|------|-------|-------------|
| `reverse` | Reverse auction | Price-descending; lowest valid bid wins. |
| `english` | English auction | Open ascending; highest bid wins. |
| `dutch` | Dutch auction | Descending offer; first acceptor wins. |
| `sealed-bid` | Sealed-bid auction | Single sealed round; best bid wins at close. |
| `multi-criteria` | Multi-criteria auction | Bids scored on price and non-price criteria under an evaluation [Policy](Agent-Layer#policy). |

## decisionType

| Code | Title | Description |
|------|-------|-------------|
| `admissibility` | Admissibility | Whether a submission is admissible. |
| `evaluation` | Evaluation | Scoring of a submission. |
| `award` | Award | Decision to award. |
| `negotiationMove` | Negotiation move | A move within a negotiation (the object model is the [negotiation extension](Extensions#specified-as-working-drafts-schemas-to-follow), a Working Draft spec). |
| `qualification` | Qualification | Decision to qualify a supplier (onboarding). |

## policyType

| Code | Title | Description |
|------|-------|-------------|
| `eligibility` | Eligibility | Entry criteria for participation. |
| `evaluation` | Evaluation | Scoring model for submissions. |
| `approval` | Approval | Approval routing and thresholds. |
| `constraint` | Constraint | Hard limits on agent behaviour. |
| `compliance` | Compliance | Regulatory or policy compliance rules. |

## eventType

`eventType` is the one codelist that is **both open and closed**, in two files. Consumers take
the union of the two; CI asserts they never intersect.

### eventTypeCore — closed, normative

`codelists/eventTypeCore.csv`. Codes here MUST carry the meanings given, and MUST NOT be
redefined, reused, or narrowed by implementations, extensions, or profiles. Admission is
append-only and is a Standards Committee act. This is what makes withdrawal of a grant
interoperable: an open value has no fixed meaning, so no conformance rule can reference it.

| Code | Title | Description |
|------|-------|-------------|
| `consent.granted` | Consent granted | A data-sovereignty access grant was issued. |
| `consent.revoked` | Consent revoked | An access grant was withdrawn before expiry. |
| `mandate.granted` | Mandate granted | Delegated authority was conferred on an agent. |
| `mandate.revoked` | Mandate revoked | Delegated authority was withdrawn before expiry. |

The two `mandate.*` codes were **promoted** from the open list, not added: their meanings are
fixed rather than changed. There is no `*.expired` code — expiry occurs by the clock, not by any
party's act, so an expiry event would have no honest `actor`, and the projection rule tests
`validity` directly. See [Trust Layer](Trust-Layer) and specification §7.4.

### eventType — open, non-normative

`codelists/eventType.csv`. The extension space. Values may be added freely by pull request, and
nothing fixes the meaning of any of them.

| Code | Title | Description |
|------|-------|-------------|
| `need.raised` | Need raised | A procurement need was raised. |
| `sourcingEvent.published` | Sourcing event published | A sourcing event was published to the market. |
| `submission.lodged` | Submission lodged | A supplier lodged a submission. |
| `evaluation.completed` | Evaluation completed | A submission was evaluated. |
| `award.decided` | Award decided | An award decision was taken. |
| `contract.signed` | Contract signed | A contract was executed. |
| `mandate.refused` | Mandate refused | An agent action was refused because it fell outside the mandate relied on. |
| `obligation.discharged` | Obligation discharged | An obligation reached `met`, discharged by a settling artefact (Order/Invoice/Document). |
| `bid.placed` | Bid placed | A bid was placed or revised in an [Auction](Process-Layer#auction); the ordered `bid.placed` stream is the hash-chained auction record. |

## documentType

| Code | Title | Description |
|------|-------|-------------|
| `tenderNotice` | Tender notice | Notice advertising a sourcing event. |
| `evaluationCriteria` | Evaluation criteria | The published evaluation model. |
| `specification` | Specification | Technical or service specification. |
| `signedContract` | Signed contract | The executed contract document. |
| `evidence` | Evidence | Evidence of obligation fulfilment. |

## invoiceTypeCode

EN 16931 BT-3. Subset of UNTDID 1001.

| Code | Title | Description |
|------|-------|-------------|
| `380` | Commercial invoice | Standard commercial invoice (EN 16931 BT-3 default). |
| `381` | Credit note | Document cancelling all or part of an invoice. |
| `384` | Corrected invoice | Invoice correcting a previously issued invoice. |
| `389` | Self-billed invoice | Invoice raised by the buyer on behalf of the supplier. |
| `326` | Partial invoice | Invoice for part of a delivery or contract. |

## vatCategory

EN 16931 BT-151 / BT-118. Subset of UNTDID 5305.

| Code | Title | Description |
|------|-------|-------------|
| `S` | Standard rate | Standard VAT rate applies. |
| `Z` | Zero rated | Goods/services taxed at zero rate. |
| `E` | Exempt | Exempt from VAT. |
| `AE` | Reverse charge | VAT reverse charge applies (buyer accounts for VAT). |
| `G` | Export outside EU | Free export item, VAT not charged. |
| `K` | Intra-community supply | Zero-rated intra-community supply of goods/services. |
| `O` | Outside scope | Services outside the scope of VAT. |

## credentialType

*Open list* — the credential kinds handled by the [onboarding extension](Extensions#the-onboarding-extension)
(carried on a [`SupplierQualification`](Extensions#the-onboarding-extension)) and the
[identity profile](Extensions#working-draft-the-identity-profile) (an
`Approval.authorityCredential` is a `delegationOfAuthority`). Screening results are carried as
**attestations** — SIGNET never performs the check.

| Code | Title | Description |
|------|-------|-------------|
| `identity` | Legal identity | Incorporation / registration evidence. |
| `vat` | VAT registration | Tax registration identifier. |
| `beneficialOwnership` | Beneficial ownership | Ultimate beneficial owner declaration/evidence. |
| `financialStanding` | Financial standing | Financial health / credit assessment result. |
| `insurance` | Insurance cover | Proof of required insurance. |
| `certification` | Certification | Standard or scheme certification (e.g. ISO 27001). |
| `sanctionsScreening` | Sanctions screening result | Result of a sanctions/AML screening, attested by the screening provider. |
| `delegationOfAuthority` | Delegation of authority | Attestation of a person's approval authority band issued by their organisation. |

---

## Commodity-risk extension codelists

These lists belong to the [commodity-risk extension](Extensions#working-draft-the-commodity-risk-extension).
`positionStatus` and `policyEvaluationStatus` are **closed** — conformance and reconciliation
depend on their values; the rest are open.

### commodity

*Open list.*

| Code | Title | Description |
|------|-------|-------------|
| `electricity` | Electricity | Electrical energy. |
| `gas` | Gas | Natural gas. |
| `fuel` | Fuel | Liquid fuels. |
| `certificates-recEac` | Certificates (REC/EAC) | Renewable energy certificates / energy attribute certificates. |
| `other` | Other | Other commodity. |

### positionStatus

**Closed list** — reconciliation depends on it (`hedged + floating = markToMarket`).

| Code | Title | Description |
|------|-------|-------------|
| `hedged` | Hedged | Volume fixed under contract. |
| `floating` | Floating | Volume exposed to market price. |
| `markToMarket` | Mark to market | Total open volume valued at the applicable PriceMark. |

### instrument

*Open list.*

| Code | Title | Description |
|------|-------|-------------|
| `ppa` | PPA | Power purchase agreement. |
| `cppa` | Corporate PPA | Corporate power purchase agreement. |
| `baseloadForward` | Baseload forward | Baseload forward contract. |
| `peakForward` | Peak forward | Peak forward contract. |
| `greenTariff` | Green tariff | Renewable supply tariff. |
| `fixedPriceSupply` | Fixed-price supply | Fixed-price supply contract. |
| `floatingSupply` | Floating supply | Index-linked supply contract. |
| `financialSwap` | Financial swap | Financially settled swap. |
| `other` | Other | Other instrument. |

### deliveryBasis

*Open list.*

| Code | Title | Description |
|------|-------|-------------|
| `calendarYear` | Calendar year | Jan–Dec delivery year. |
| `fiscalYear` | Fiscal year | Organisation fiscal year. |
| `quarter` | Quarter | Calendar quarter. |
| `month` | Month | Calendar month. |

### markType

*Open list.*

| Code | Title | Description |
|------|-------|-------------|
| `forwardClose` | Forward close | Exchange forward closing price. |
| `spotSettlement` | Spot settlement | Spot settlement price. |
| `brokerQuote` | Broker quote | Broker-provided quote. |
| `internalCurve` | Internal curve | Internally derived curve point. |

### policyEvaluationStatus

**Closed list** — conformance depends on it.

| Code | Title | Description |
|------|-------|-------------|
| `withinCorridor` | Within corridor | Hedged ratio inside the applicable band. |
| `belowMinimum` | Below minimum | Hedged ratio below the corridor minimum. |
| `aboveMaximum` | Above maximum | Hedged ratio above the corridor maximum. |
| `noPolicyDefined` | No policy defined | No corridor applies. |

### portfolioScope

*Open list.*

| Code | Title | Description |
|------|-------|-------------|
| `core` | Core | Core portfolio. |
| `nonCore` | Non-core | Non-core portfolio. |
| `infrastructure` | Infrastructure | Infrastructure carve-out. |
| `other` | Other | Other scope. |

### executionRoute

*Open list.*

| Code | Title | Description |
|------|-------|-------------|
| `newSourcingEvent` | New sourcing event | Instantiated Need produces a new SourcingEvent. |
| `callOffUnderFramework` | Call-off under framework | Executed under an existing framework contract. |
| `directNegotiation` | Direct negotiation | Direct negotiation with a counterparty. |

### shockBand

*Open list.*

| Code | Title | Description |
|------|-------|-------------|
| `normalRange` | Normal range | Shocks within normal market variation. |
| `persistentHigh` | Persistent high | Sustained elevated prices. |
| `crisis` | Crisis | Crisis-level price shock. |

### proposalTrigger

*Open list.*

| Code | Title | Description |
|------|-------|-------------|
| `policyBreach` | Policy breach | A coverage assessment breached the corridor. |
| `marketOpportunity` | Market opportunity | Favourable market conditions. |
| `demandRevision` | Demand revision | Volume forecast changed. |
| `contractExpiry` | Contract expiry | An existing hedge expires. |
| `manual` | Manual | Manually raised. |

---

## Where to go next

- [Foundation Layer](Foundation-Layer) / [Process Layer](Process-Layer) — the fields these
  lists constrain.
- [Extensions](Extensions) — the onboarding, identity, and commodity-risk extensions whose
  codelists appear above.
- [Governance & Versioning](Governance-and-Versioning) — closed vs open lists.
