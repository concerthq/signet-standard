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
| [decisionType](#decisiontype) | [Decision.decisionType](Agent-Layer#decision) |
| [policyType](#policytype) | [Policy.policyType](Agent-Layer#policy) |
| [eventType](#eventtype) | [Event.eventType](Trust-Layer#event) |
| [documentType](#documenttype) | [Document.documentType](Foundation-Layer#document) |
| [invoiceTypeCode](#invoicetypecode) | [Invoice.invoiceTypeCode](Process-Layer#invoice) |
| [vatCategory](#vatcategory) | [InvoiceLine.vatCategoryCode](Foundation-Layer#invoiceline), [VatBreakdown.categoryCode](Foundation-Layer#vatbreakdown) |

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

## decisionType

| Code | Title | Description |
|------|-------|-------------|
| `admissibility` | Admissibility | Whether a submission is admissible. |
| `evaluation` | Evaluation | Scoring of a submission. |
| `award` | Award | Decision to award. |
| `negotiationMove` | Negotiation move | A move within a negotiation. |

## policyType

| Code | Title | Description |
|------|-------|-------------|
| `eligibility` | Eligibility | Entry criteria for participation. |
| `evaluation` | Evaluation | Scoring model for submissions. |
| `approval` | Approval | Approval routing and thresholds. |
| `constraint` | Constraint | Hard limits on agent behaviour. |
| `compliance` | Compliance | Regulatory or policy compliance rules. |

## eventType

| Code | Title | Description |
|------|-------|-------------|
| `need.raised` | Need raised | A procurement need was raised. |
| `sourcingEvent.published` | Sourcing event published | A sourcing event was published to the market. |
| `submission.lodged` | Submission lodged | A supplier lodged a submission. |
| `evaluation.completed` | Evaluation completed | A submission was evaluated. |
| `award.decided` | Award decided | An award decision was taken. |
| `contract.signed` | Contract signed | A contract was executed. |
| `mandate.granted` | Mandate granted | An agent mandate was granted. |
| `mandate.revoked` | Mandate revoked | An agent mandate was revoked. |
| `obligation.discharged` | Obligation discharged | An obligation reached `met`, discharged by a settling artefact (Order/Invoice/Document). |

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

## Where to go next

- [Foundation Layer](Foundation-Layer) / [Process Layer](Process-Layer) — the fields these
  lists constrain.
- [Governance & Versioning](Governance-and-Versioning) — closed vs open lists.
