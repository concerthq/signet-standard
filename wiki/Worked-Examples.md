# Worked Examples

The `examples/` directory holds complete, CI-validated instances of the CDM. Every example
is validated against its schema on each push and pull request (see
[Validation & Conformance](Validation-and-Conformance)), so the examples can never drift from
the schema. They share a fictional procurement: **Buyer**'s "Managed network services —
Northern region refresh", awarded to **Acme Networks**.

| File | Object | Stage |
|------|--------|-------|
| `examples/need.json` | [Need](#need) | planning |
| `examples/sourcing-event.json` | [SourcingEvent](#sourcingevent) | tender |
| `examples/policy-evaluation.json` | [Policy](#policy) | (governs tender) |
| `examples/award-decision.json` | [Decision](#decision-award) | award |
| `examples/contract.json` | [Contract](#contract) | contract |
| `examples/invoice.json` | [Invoice](#invoice) | implementation |
| `examples/invoice.ubl.xml` | UBL projection | implementation |
| `examples/auction-reverse.json` | [Auction](#auction) | tender → award |
| `examples/bid-reverse.json` | [Bid](#bid) | tender |

The last two illustrate the [auction extension](Process-Layer#auction) on a separate,
self-contained reverse-auction scenario (they are not part of the Acme Networks thread above).

The examples trace a single thread through the lifecycle:

```
Need (12M EUR)  ──>  SourcingEvent (competitiveFlexible)  ──>  [evaluated under Policy]
   #need-0420            #event-1207                              #policy-eval-mat
                                                                       │
   Decision (award) <── made by synthetic agent under mandate ────────┘
   #decision-8842
        │
        ▼
   Contract (#contract-3310, 12M EUR, 2026–2029, 2 obligations)
        │                                    ▲
        ▼                                    │ settles ob-1 / dischargedBy
   Invoice (Peppol INV-2026-000512, €7,502 payable)  ──>  invoice.ubl.xml
        └── settles ──> Obligation ob-1 (status: met)  [loop closed]
```

The Invoice `settles` the SLA obligation `ob-1`, and `ob-1` back-references the Invoice via
`dischargedBy` — the commitment made in the Contract is discharged explicitly, as data. The
`settles` link is SIGNET-original and is **omitted on the UBL projection**, so
`invoice.ubl.xml` is unchanged.

---

## Need

`examples/need.json` — a €12M demand signal, classified under CPV `72720000` (wide area
network services), governed by an ISO 27001 eligibility policy.

```json
{
  "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
  "type": "Need",
  "id": { "scheme": "did", "id": "did:web:buyer.example#need-0420" },
  "title": "Managed network services — Northern region refresh",
  "requestingParty": { "scheme": "did", "id": "did:web:buyer.example#buyer" },
  "budget": { "amount": 12000000, "currency": "EUR" },
  "classification": { "scheme": "cpv", "id": "72720000", "description": "Wide area network services" },
  "rationale": "End-of-life transport equipment refresh across the northern operating region.",
  "governingPolicies": [ { "scheme": "did", "id": "did:web:buyer.example#policy-elig-iso27001" } ]
}
```

See [Process Layer → Need](Process-Layer#need).

---

## SourcingEvent

`examples/sourcing-event.json` — an active `competitiveFlexible` procedure (UK Procurement
Act 2023) with one lot, an eligibility policy and an evaluation policy, and a submission
window. Note the criteria are references to [Policy](Agent-Layer#policy) objects.

```json
{
  "type": "SourcingEvent",
  "id": { "scheme": "did", "id": "did:web:buyer.example#event-1207" },
  "procuringParty": { "scheme": "did", "id": "did:web:buyer.example#buyer" },
  "procedure": "competitiveFlexible",
  "status": "active",
  "lots": [ { "id": "lot-1", "title": "Core transport", "value": { "amount": 12000000, "currency": "EUR" } } ],
  "eligibilityCriteria": [ { "scheme": "did", "id": "did:web:buyer.example#policy-elig-iso27001" } ],
  "evaluationCriteria": [ { "scheme": "did", "id": "did:web:buyer.example#policy-eval-mat" } ],
  "period": { "startDate": "2026-07-01T00:00:00Z", "endDate": "2026-08-15T17:00:00Z" }
}
```

See [Process Layer → SourcingEvent](Process-Layer#sourcingevent).

---

## Policy

`examples/policy-evaluation.json` — a Most-Advantageous-Tender scoring model. It carries
**both** an executable Rego `expression` and a `humanReadable` statement of the same rule —
the mandatory dual requirement.

```json
{
  "type": "Policy",
  "id": { "scheme": "did", "id": "did:web:buyer.example#policy-eval-mat" },
  "policyType": "evaluation",
  "expressionLanguage": "rego",
  "expression": "package signet.eval\nscore := price*0.4 + quality*0.35 + social*0.25",
  "humanReadable": "Most Advantageous Tender: price 40%, quality 35%, social value 25%.",
  "version": "1.0.0",
  "issuedBy": { "scheme": "did", "id": "did:web:buyer.example#buyer" }
}
```

See [Agent Layer → Policy](Agent-Layer#policy).

---

## Decision (award)

`examples/award-decision.json` — the accountability centrepiece. A **synthetic agent**
(`#agent-eval-3`) decides the award **under a mandate** (`#mandate-eval-3`), from two
submission **inputs**, applying the MAT **policy**, with a plain-language **rationale**, a
**human approval** record, and cryptographic **provenance**.

```json
{
  "type": "Decision",
  "id": { "scheme": "did", "id": "did:web:buyer.example#decision-8842" },
  "decisionType": "award",
  "madeBy": { "scheme": "did", "id": "did:web:buyer.example#agent-eval-3" },
  "underMandate": { "scheme": "did", "id": "did:web:buyer.example#mandate-eval-3" },
  "inputs": [
    { "scheme": "did", "id": "did:web:buyer.example#submission-5521" },
    { "scheme": "did", "id": "did:web:buyer.example#submission-5522" }
  ],
  "policiesApplied": [ { "scheme": "did", "id": "did:web:buyer.example#policy-eval-mat" } ],
  "rationale": "Submission 5521 ranked highest on the published MAT model (price 40%, quality 35%, social value 25%).",
  "outcome": { "awardedSubmission": "did:web:buyer.example#submission-5521" },
  "humanApproval": { "scheme": "did", "id": "did:web:buyer.example#approval-771" },
  "provenance": {
    "generatedBy": { "scheme": "did", "id": "did:web:buyer.example#agent-eval-3" },
    "generatedAt": "2026-06-21T14:08:00Z",
    "usedPolicies": [ { "scheme": "did", "id": "did:web:buyer.example#policy-eval-mat" } ],
    "signature": { "type": "Ed25519Signature2020", "value": "z58…" }
  }
}
```

This is the single object that distinguishes a SIGNET network from a conventional platform —
see [Agent Layer → Decision](Agent-Layer#decision).

---

## Contract

`examples/contract.json` — a €12M, three-year contract derived from the award, between Buyer
and Acme Networks, with two embedded [Obligations](Process-Layer#obligation) (an SLA and a
migration milestone).

```json
{
  "type": "Contract",
  "id": { "scheme": "did", "id": "did:web:buyer.example#contract-3310" },
  "award": { "scheme": "did", "id": "did:web:buyer.example#award-2208" },
  "parties": [
    { "scheme": "did", "id": "did:web:buyer.example#buyer" },
    { "scheme": "did", "id": "did:web:acme-networks.example#acme" }
  ],
  "value": { "amount": 12000000, "currency": "EUR" },
  "period": { "startDate": "2026-09-01T00:00:00Z", "endDate": "2029-08-31T23:59:59Z" },
  "obligations": [
    { "type": "Obligation", "id": "ob-1", "description": "Achieve 99.95% core availability each calendar month.",
      "status": "met", "dischargedBy": [ { "scheme": "peppol", "id": "INV-2026-000512" } ] },
    { "type": "Obligation", "id": "ob-2", "description": "Complete northern transport migration by 2027-06-30.", "dueDate": "2027-06-30T00:00:00Z", "status": "pending" }
  ]
}
```

See [Process Layer → Contract](Process-Layer#contract).

---

## Invoice

`examples/invoice.json` — an EN 16931-mapped invoice (Peppol identifier scheme), drawn
against the contract and an order. It is arithmetically self-consistent: **€6,200 net +
€1,302 VAT @ 21% = €7,502 payable**, and projects to `examples/invoice.ubl.xml`
(UBL 2.1 / Peppol BIS Billing 3.0).

```json
{
  "type": "Invoice",
  "id": { "scheme": "peppol", "id": "INV-2026-000512" },
  "invoiceTypeCode": "380",
  "issueDate": "2026-10-05T00:00:00Z",
  "currency": "EUR",
  "contract": { "scheme": "did", "id": "did:web:buyer.example#contract-3310" },
  "settles": [ { "scheme": "did", "id": "did:web:buyer.example#contract-3310/ob-1" } ],
  "seller": { "scheme": "gleif:lei", "id": "5299000ACME00NETWRK1" },
  "buyer":  { "scheme": "gleif:lei", "id": "5299000BUYER00000001" },
  "lines": [
    { "id": "1", "itemName": "Core router managed service — monthly", "quantity": 100, "unitOfMeasure": "MON",
      "itemNetPrice": { "amount": 50, "currency": "EUR" }, "netAmount": { "amount": 5000, "currency": "EUR" },
      "vatCategoryCode": "S", "vatRate": 21 },
    { "id": "2", "itemName": "Field engineering — day rate", "quantity": 10, "unitOfMeasure": "DAY",
      "itemNetPrice": { "amount": 120, "currency": "EUR" }, "netAmount": { "amount": 1200, "currency": "EUR" },
      "vatCategoryCode": "S", "vatRate": 21 }
  ],
  "vatBreakdown": [ { "taxableAmount": { "amount": 6200, "currency": "EUR" }, "taxAmount": { "amount": 1302, "currency": "EUR" }, "categoryCode": "S", "rate": 21 } ],
  "taxExclusiveTotal": { "amount": 6200, "currency": "EUR" },
  "taxTotal":          { "amount": 1302, "currency": "EUR" },
  "taxInclusiveTotal": { "amount": 7502, "currency": "EUR" },
  "payableAmount":     { "amount": 7502, "currency": "EUR" },
  "paymentTerms": "Net 30 days from invoice date."
}
```

See [Process Layer → Invoice](Process-Layer#invoice) and
[EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing) for the projection and
verification.

## Auction

`examples/auction-reverse.json` — a **closed multi-round reverse auction**: start price €12M,
reserve (floor) €9M, `minStep` €100k, closing on `no-improvement`, with `anonymous-ranks`
identity disclosure and eligibility tied to an active `SupplierQualification`. Because the
`rules` are fixed and normative, any conformant operator replaying the same bids closes it
identically.

```json
{
  "type": "Auction",
  "id": { "scheme": "did", "id": "did:web:buyer.example#auction-3310" },
  "sourcingEvent": { "scheme": "did", "id": "did:web:buyer.example#event-1207" },
  "procuringParty": { "scheme": "did", "id": "did:web:buyer.example#buyer" },
  "auctionType": "reverse",
  "rules": {
    "roundStructure": "multi-round",
    "maxRounds": 5,
    "startPrice":   { "amount": 12000000, "currency": "EUR" },
    "reservePrice": { "amount": 9000000,  "currency": "EUR" },
    "minStep":      { "amount": 100000,   "currency": "EUR" },
    "closeCondition": "no-improvement",
    "tieBreak": "earliest-bid",
    "identityDisclosure": "anonymous-ranks"
  },
  "eligibility": { "requiresQualification": true, "minStatus": "active" },
  "status": "closed",
  "period": { "startDate": "2026-07-01T09:00:00Z", "endDate": "2026-07-01T10:30:00Z" }
}
```

See [Process Layer → Auction](Process-Layer#auction).

---

## Bid

`examples/bid-reverse.json` — the **winning €10.8M bid** (round 3) in the auction above, from
bidder Globex, carrying its `SupplierQualification` as eligibility provenance. The bid
sequence is recorded as hash-chained [`bid.placed` Events](Codelists#eventtype); this object
is the materialised standing bid, marked `winning` at the close.

```json
{
  "type": "Bid",
  "id": { "scheme": "did", "id": "did:web:buyer.example#bid-3310-g3" },
  "auction": { "scheme": "did", "id": "did:web:buyer.example#auction-3310" },
  "bidder": { "scheme": "did", "id": "did:web:globex.example#globex" },
  "qualification": { "scheme": "did", "id": "did:web:buyer.example#qual-globex" },
  "round": 3,
  "value": { "amount": 10800000, "currency": "EUR" },
  "submittedAt": "2026-07-01T10:12:00Z",
  "status": "winning"
}
```

See [Process Layer → Bid](Process-Layer#bid).

---

## Run them yourself

```bash
npm install        # ajv + ajv-formats
npm run validate   # validates every example against the schemas
npm run transform  # projects examples/invoice.json -> examples/invoice.ubl.xml
npm run verify-ubl # reconciles every EN 16931 value in the UBL
```

See [Validation & Conformance](Validation-and-Conformance).
