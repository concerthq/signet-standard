# Process Layer

The process layer models the procurement lifecycle. It follows the **OCDS** lifecycle so
any SIGNET process can be projected to a conforming OCDS release. The five OCDS stages —
planning, tender, award, contract, implementation — are the canonical phase model.

```
 planning      tender                          award      contract        implementation
  Need  →  SourcingEvent → Submission → Evaluation → Award → Contract →  Order / Catalogue
           (+ Lots)                                          (+Obligations)      Invoice
```

| Object | OCDS stage | Maps to / from |
|--------|-----------|----------------|
| [Need](#need) | planning | OCDS `planning` |
| [SourcingEvent](#sourcingevent) / [Lot](#lot) | tender | OCDS `tender`; eForms notice |
| [Submission](#submission) | tender | OCDS `bid` extension; UBL Tender |
| [Evaluation](#evaluation) | tender | — (SIGNET detail over OCDS) |
| [Award](#award) | award | OCDS `award` |
| [Contract](#contract) | contract | OCDS `contract` |
| [Order](#order) | implementation | UBL 2.3 Order; Peppol BIS Ordering |
| [Catalogue](#catalogue) | implementation | UBL 2.3 Catalogue; Peppol BIS Catalogue |
| [Obligation](#obligation) | contract/impl. | — |
| [Invoice](#invoice) | implementation | EN 16931; Peppol BIS Billing; UBL Invoice; Factur-X |
| [Auction](#auction) | tender → award | Profile of the sourcing flow; Prozorro-style neutral-core auction |
| [Bid](#bid) | tender | The auction's Submission; a hash-chained `bid.placed` Event stream |

See [Standards Mapping](Standards-Mapping) for the normative mapping table.

---

## Need

The demand signal that initiates procurement (OCDS `planning`).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Need identifier. |
| `title` | string | 1 | Short description of the need. |
| `description` | string | 0..1 | Fuller description. |
| `requestingParty` | Identifier | 1 | The Party raising the need. |
| `budget` | Value | 0..1 | Indicative budget. |
| `classification` | Classification | 0..1 | What is needed. |
| `rationale` | string | 0..1 | Why it is needed. |
| `governingPolicies` | Identifier[] | 0..* | [Policy](Agent-Layer#policy) objects constraining this procurement. |

See the worked instance: [`examples/need.json`](Worked-Examples#need).

---

## SourcingEvent

A request to the market — RFP, RFQ, ITT, tender, or call-off competition (OCDS `tender`).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Event identifier. |
| `title` | string | 1 | Title. |
| `procuringParty` | Identifier | 1 | The buyer / procuring entity. |
| `procedure` | string | 1 | Procedure type. See [procedure codelist](Codelists#procedure): `open`, `restricted`, `competitiveFlexible`, `directAward`, `frameworkCallOff`. |
| `status` | string | 1 | `planned`, `active`, `evaluating`, `complete`, `cancelled`, `withdrawn`. |
| `lots` | Lot[] | 0..* | Divisible portions. |
| `items` | Item[] | 0..* | What is being sourced. |
| `value` | Value | 0..1 | Estimated value. |
| `eligibilityCriteria` | Policy[] | 0..* | Machine-readable entry criteria. |
| `evaluationCriteria` | Policy[] | 0..* | Machine-readable scoring model. |
| `period` | Period | 0..1 | Submission window. |
| `documents` | Document[] | 0..* | Tender documents. |

The `eligibilityCriteria` and `evaluationCriteria` are [Policy](Agent-Layer#policy) objects:
the *same* artifact a human auditor reads is the one a synthetic agent executes. See the
worked instance: [`examples/sourcing-event.json`](Worked-Examples#sourcingevent).

---

## Lot

A divisible portion of a SourcingEvent that may be awarded independently.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string | 1 | Lot identifier within the event. |
| `title` | string | 1 | Lot title. |
| `items` | Item[] | 0..* | Items in this lot. |
| `value` | Value | 0..1 | Estimated lot value. |

---

## Submission

A supplier's response to a SourcingEvent — a bid, tender, quote, or proposal.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Submission identifier. |
| `sourcingEvent` | Identifier | 1 | The event responded to. |
| `lot` | string | 0..1 | The lot, if lot-specific. |
| `submittingParty` | Identifier | 1 | The supplier. |
| `submittedBy` | Identifier | 0..1 | The agent (human or synthetic) that lodged it. |
| `items` | Item[] | 0..* | Offered items with prices. |
| `value` | Value | 0..1 | Total offered value. |
| `disclosedCredentials` | Credential[] | 0..* | Credentials presented, possibly via selective disclosure. |
| `sealedProof` | object | 0..1 | Where sealed-bid cryptography applies, the encrypted submission and proof. |
| `status` | string | 1 | See [submissionStatus codelist](Codelists#submissionstatus): `draft`, `submitted`, `withdrawn`, `admissible`, `inadmissible`. |

`submittedBy` is where an *agent* (possibly synthetic) is recorded as having lodged a bid on
behalf of the `submittingParty`. `sealedProof` and selective-disclosure credentials support
confidential bidding — see [Serialisation §9.3](Serialisation#cryptographic-envelopes).

---

## Evaluation

The scoring of submissions against the evaluation criteria.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Evaluation identifier. |
| `submission` | Identifier | 1 | The submission scored. |
| `criteria` | Policy | 1 | The evaluation model applied. |
| `scores` | Score[] | 1..* | Per-criterion [Scores](Foundation-Layer#score) with rationale. |
| `evaluatedBy` | Identifier | 1 | The agent (human or synthetic) performing the evaluation. |
| `result` | string | 1 | `passed`, `failed`, `ranked`. |
| `decision` | Identifier | 0..1 | Link to the [Decision](Agent-Layer#decision) record. |

---

## Award

The decision to award (OCDS `award`).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Award identifier. |
| `sourcingEvent` | Identifier | 1 | The event. |
| `awardedParty` | Identifier | 1 | The winning supplier. |
| `value` | Value | 1 | Awarded value. |
| `rationale` | string | 0..1 | Award rationale. |
| `decision` | Identifier | 1 | The [Decision](Agent-Layer#decision) record supporting the award. |
| `standstillPeriod` | Period | 0..1 | Where regulation requires a standstill (e.g. UK Procurement Act). |

The `decision` link is **required** on an Award — an award is never recorded without the
accountable decision behind it.

---

## Contract

The binding agreement (OCDS `contract`).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Contract identifier. |
| `award` | Identifier | 0..1 | The award it derives from. |
| `parties` | Identifier[] | 1..* | Contracting parties. |
| `title` | string | 1 | Contract title. |
| `value` | Value | 1 | Contract value. |
| `period` | Period | 1 | Contract term. |
| `obligations` | Obligation[] | 0..* | Obligations and milestones. |
| `documents` | Document[] | 0..* | Signed contract and annexes. |
| `governingPolicies` | Identifier[] | 0..* | Policies governing performance. |

See the worked instance: [`examples/contract.json`](Worked-Examples#contract) (with
embedded obligations).

---

## Order

A call-off or purchase order against a contract or catalogue. Aligned to UBL Order.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Order identifier. |
| `contract` | Identifier | 0..1 | The contract drawn against. |
| `buyer` | Identifier | 1 | Ordering party. |
| `seller` | Identifier | 1 | Supplying party. |
| `items` | Item[] | 1..* | Ordered items. |
| `value` | Value | 1 | Order value. |
| `deliveryPeriod` | Period | 0..1 | Required delivery. |

---

## Catalogue

A structured offering of goods/services. Aligned to UBL Catalogue and Peppol BIS Catalogue.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Catalogue identifier. |
| `providerParty` | Identifier | 1 | The supplier. |
| `items` | Item[] | 1..* | Catalogue lines with prices. |
| `validityPeriod` | Period | 0..1 | Validity. |

---

## Obligation

A contractual obligation, deliverable, or milestone with a compliance state. Typically
embedded inside a [Contract](#contract).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string | 1 | Obligation identifier within the contract. |
| `description` | string | 1 | What must be done. |
| `dueDate` | date-time | 0..1 | When. |
| `responsibleParty` | Identifier | 0..1 | Who is responsible. |
| `status` | string | 1 | `pending`, `met`, `breached`, `waived`. |
| `evidence` | Document[] | 0..* | Evidence of fulfilment. |
| `dischargedBy` | Identifier[] | 0..* | The Order, Invoice, or Document(s) that discharged this obligation. SHOULD be present once `status` is `met`. |

`evidence` and `dischargedBy` are distinct: `evidence` carries the *proof* that the work was
done (a report, a certificate); `dischargedBy` carries the *settling artefact* — the order or
invoice that constitutes the doing. Together with the [`obligation.discharged`
event](Codelists#eventtype) and the [Invoice `settles`](#invoice) back-reference, they make the
commitment→discharge loop traversable as data (see [Settlement in Concepts of Open
Commerce](Concepts-of-Open-Commerce#9-settlement)).

---

## Invoice

An invoice, fully aligned to **EN 16931** so it is convertible to Peppol BIS Billing / UBL
Invoice / Factur-X (OCDS `implementation`). The Invoice carries **33 EN 16931 Business
Terms / Groups** (BT-1…BT-158, BG-4/7/23/25). Field names reference EN 16931 BTs for
traceability.

| Field | Type | Card. | EN 16931 | Definition |
|-------|------|-------|----------|------------|
| `id` | Identifier | 1 | BT-1 | Invoice number. |
| `invoiceTypeCode` | string | 0..1 | BT-3 | Invoice type. See [invoiceTypeCode codelist](Codelists#invoicetypecode). |
| `issueDate` | date-time | 1 | BT-2 | Issue date. |
| `currency` | string | 1 | BT-5 | Invoice currency code. |
| `contract` | Identifier | 0..1 | BT-12 | Related contract. |
| `order` | Identifier | 0..1 | BT-13 | Related order. |
| `settles` | Identifier[] | 0..* | — | The [Obligation(s)](#obligation) this invoice settles. **SIGNET-original** — not an EN 16931 BT; omitted on Peppol BIS projection. |
| `seller` | Identifier | 1 | BG-4 | Seller. |
| `buyer` | Identifier | 1 | BG-7 | Buyer. |
| `lines` | InvoiceLine[] | 1..* | BG-25 | [Invoice lines](Foundation-Layer#invoiceline). |
| `vatBreakdown` | VatBreakdown[] | 0..* | BG-23 | [VAT breakdown](Foundation-Layer#vatbreakdown). |
| `lineExtensionTotal` | Value | 0..1 | BT-106 | Sum of line net amounts. |
| `taxExclusiveTotal` | Value | 0..1 | BT-109 | Total without VAT. |
| `taxTotal` | Value | 1 | BG-22 / BT-110 | Total VAT. |
| `taxInclusiveTotal` | Value | 0..1 | BT-112 | Total with VAT. |
| `payableAmount` | Value | 1 | BT-115 | Amount due for payment. |
| `paymentDueDate` | date-time | 0..1 | BT-9 | Payment due date. |
| `paymentTerms` | string | 0..1 | BT-20 | Payment terms. |

The EN 16931 alignment is what makes a SIGNET network natively compliant with the EU **ViDA**
cross-border e-invoicing mandate (from July 2030) and the national B2B mandates preceding
it. The repository ships a runnable, CI-verified projection to Peppol BIS Billing UBL — see
[EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing) and the worked instance
[`examples/invoice.json`](Worked-Examples#invoice).

`settles` sits outside the EN 16931 BT set, so the projection skips it by construction: a
SIGNET invoice with or without `settles` projects to **byte-identical** Peppol BIS UBL. A
conformance guard (`npm run test:projection-skip`) asserts this, so the settlement link can
never silently leak into the e-invoicing projection and disturb ViDA convertibility.

## Auction

A **standardised auction** — a *profile of the sourcing flow*, not a separate mechanism. An
auction is a specialised `SourcingEvent → Submission → Evaluation → Award` cycle in which
submissions ([Bid](#bid)s) are revised over rounds and the close is a deterministic function
of the bids and the published rules. It therefore **reuses** the sourcing machinery rather
than duplicating it.

The design principle is Prozorro's: the auction — the moment of *price formation* — lives in
the **neutral, standardised layer**, while operators provide the front-end. The auction
`rules` (below) and the canonical bid record are normative and operator-independent: **any
conformant operator running the same rules over the same bids MUST reach the same close.**
Bidding UX, notifications, and round mechanics are operator concerns; price formation and the
[Award](#award) are not. This removes auction-clearing from the set of things any single
operator could be accused of rigging — fairness becomes a conformance property, not a matter
of trust. Reverse, English, Dutch, sealed-bid, and multi-criteria auctions are all profiles
of this one object, parameterised by `auctionType` and `rules` (**one primitive, many
profiles** — no per-type primitives).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Auction identifier. |
| `sourcingEvent` | Identifier | 0..1 | The [SourcingEvent](#sourcingevent) / Need this auction realises. |
| `procuringParty` | Identifier | 1 | The buyer / procuring entity. |
| `auctionType` | string | 1 | Profile. See [auctionType codelist](Codelists#auctiontype): `reverse`, `english`, `dutch`, `sealed-bid`, `multi-criteria`. |
| `lots` | string[] | 0..* | Lots this auction covers. |
| `rules` | object | 1 | The deterministic, normative parameters — the conformance surface (below). |
| `evaluationPolicy` | Identifier | 0..1 | For `multi-criteria`: the [Policy](Agent-Layer#policy) whose weights determine the winner (reuse of the MAT/MEAT pattern). |
| `eligibility` | object | 0..1 | Who may bid. `requiresQualification` (boolean), `minStatus` (`active` \| `conditional`). Ties to `SupplierQualification`. |
| `status` | string | 1 | `scheduled`, `open`, `in_progress`, `closed`, `cancelled` (`cancelled` reachable from any non-terminal state). |
| `period` | Period | 0..1 | Auction window. |

**`rules` — the conformance surface.** `roundStructure` (`single-round` \| `multi-round` \|
`continuous`), optional `maxRounds`, `startPrice`, `reservePrice` (a floor for reverse /
ceiling for forward — bids beyond it are invalid), `minStep` (minimum decrement or increment
between successive bids), `closeCondition` (`fixed-time` \| `no-improvement` \| `max-rounds`),
`tieBreak` (`earliest-bid` \| `random-seeded` \| `split`), and `identityDisclosure`
(`sealed-until-close` \| `anonymous-ranks` \| `open`). `tieBreak: random-seeded` MUST use a
**published seed** so resolution is reproducible — determinism is the whole point.

**Eligibility inherits the onboarding firewall.** `eligibility` ties bidding to
`SupplierQualification`: a conditionally-qualified supplier inherits its conditions — e.g. a
€5M `valueCap` structurally bars it from *winning* a €12M auction even if it may observe or
bid. The auction inherits the [onboarding firewall](Trust-Layer) for free.

**The close reuses existing machinery.** At `closeCondition` the auction closes
deterministically — **reverse** → the lowest valid bid; **english/dutch** → the highest;
**sealed-bid** → the best at the single close; **multi-criteria** → the highest-scoring under
`evaluationPolicy`. The winner is recorded as an [Award](#award) and a
[Decision](Agent-Layer#decision) (`decisionType: award`) carrying rationale, the bids
considered, the rules/policy applied, `provenance`, and `humanApproval` where the mandate
threshold requires it — the same governance gate as the [agent award demo](Agent-Layer).
Because the close is a deterministic function of the bids and `rules`, **two operators MUST
produce the same `Award`** — this is the conformance test.

**Transparency = the Event trail.** The ordered bid history, the rules applied, and the close
are an append-only, hash-chained [Event](Trust-Layer#event) stream
([`bid.placed`](Codelists#eventtype)) with `provenance`, disclosed after close per
`identityDisclosure`. Altering any bid breaks the chain — so the auction "cannot be held in
secret, and the record cannot be lost or altered" by construction, a stronger guarantee than
central storage gives.

**Scope boundary.** SIGNET governs the **rules and the canonical record**, not the real-time
mechanics; conformance means *same outcome on the same bids and rules* — not identical UX or
latency. It can defeat *some* manipulation structurally (sealed identities until close,
deterministic close and tie-break, the tamper-evident trail) but **does not and cannot**
resolve collusion or shill bidding by itself — those remain operator-policy and regulatory
concerns. Implementations MUST NOT represent SIGNET conformance as a guarantee against
collusion.

See the worked instance: [`examples/auction-reverse.json`](Worked-Examples#auction). The full
normative text is `docs/extensions/auction.md`.

---

## Bid

A bid in an [Auction](#auction) — one bidder's offer in a given round. Each bid placement is
emitted as a hash-chained [`bid.placed` Event](Codelists#eventtype); this object is the
materialised *standing* bid.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Bid identifier. |
| `auction` | Identifier | 1 | The [Auction](#auction) this bid belongs to. |
| `bidder` | Identifier | 1 | The bidding [Party](Foundation-Layer#party). |
| `qualification` | Identifier | 0..1 | The bidder's `SupplierQualification` (eligibility provenance). |
| `round` | integer | 0..1 | The round the bid was placed in. |
| `value` | Value | 1 | The offered value. |
| `submittedAt` | date-time | 1 | When the bid was submitted. |
| `status` | string | 1 | `active`, `superseded`, `withdrawn`, `winning`, `rejected`. |

See the worked instance: [`examples/bid-reverse.json`](Worked-Examples#bid).

---

## Agent participation

SIGNET's agent-native design lets bidding agents participate under [Mandate](Agent-Layer#mandate):
a supplier's agent places and revises bids within its authorised limits; a buyer's (or a
neutral) agent runs the close under the rules; every action is provenance-stamped, with human
approval above threshold. The auction is thus the first multi-agent, cross-organisational
SIGNET interaction — reusing both the qualification and award harnesses.

## Where to go next

- [Agent Layer](Agent-Layer) — Decisions, Mandates, and Policies that govern this process.
- [Trust Layer](Trust-Layer) — the Events that record every transition.
- [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).
