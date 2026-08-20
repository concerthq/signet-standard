# SIGNET Canonical Data Model

**Specification v0.1 (Working Draft)**
**Steward:** Concert Foundation
**Tier:** Normative
**Licence:** CC0 1.0 (public domain dedication)
**Status:** Request for Comments

---

## About this document

This specification defines the SIGNET Canonical Data Model (CDM) — the common vocabulary for representing procurement and multi-party commerce across a SIGNET network. The CDM is the central normative artifact of the SIGNET standard. Every conforming implementation reads and writes data that is expressible in, and losslessly mappable to, this model.

The CDM is deliberately published under CC0. The vocabulary is meant to be implemented everywhere, by anyone, without friction or attribution burden. Concert Foundation holds no proprietary claim over the model; it stewards its evolution through the Standards Committee and the formal change-control process described in §11.

This is a working draft for community review. Field-level definitions in §4–§7 are illustrative of the model's shape and depth; they are not yet frozen. Comments are invited at hello@concert.foundation.

---

## 1. Purpose and design principles

The CDM exists to solve one problem: procurement data today is fragmented across mutually unintelligible standards and proprietary platforms, which prevents both interoperability and the deployment of intelligent agents across organisational boundaries. The CDM is the Rosetta Stone — a single coherent model that bridges the established standards and adds the structures needed for agent-native, governed, decentralised commerce.

The model is governed by eight design principles.

**1.1 Reuse before invention.** The CDM does not reinvent procurement semantics. Where a concept is well defined by an existing open standard — OCDS for the contracting lifecycle, EN 16931 for invoicing, UBL for document syntax, the EU eProcurement Ontology (ePO) for semantic relationships — the CDM adopts and aligns to it. New structure is introduced only where existing standards are silent, principally around synthetic agents, machine-readable policy, and decentralised identity.

**1.2 Standards as profiles, not forks.** The CDM is expressed as a coherent superset that profiles existing standards. A SIGNET document can always be projected down to a conforming OCDS release, a Peppol BIS invoice, or an eForms notice, and data arriving in those formats can always be lifted into the CDM. Mapping tables (§8) are normative.

**1.3 Agent-native by construction.** Human and synthetic agents are first-class parties. The model represents not only what was decided but which agent decided it, under what authority, using which inputs, and with what rationale. Provenance is structural, not an afterthought.

**1.4 Identity is decentralised.** Parties are identified by stable, resolvable identifiers that may be Decentralised Identifiers (DIDs). Claims about parties — certifications, financial standing, qualifications — are represented as W3C Verifiable Credentials, verifiable independently of any central registry.

**1.5 Data sovereignty is explicit.** The model distinguishes between an assertion and the right to access the data behind it. Consent and access grants are represented as data, consistent with the Solid data-sovereignty pattern. The CDM never assumes a central data warehouse.

**1.6 Policy is data.** Procurement rules — eligibility thresholds, evaluation weightings, approval routing, agent mandates — are represented as machine-readable, human-auditable policy objects, not buried in application logic.

**1.7 Events are immutable.** Every material change is an append-only event with provenance. The current state of any object is a projection over its event history. This makes audit native and tampering evident.

**1.8 Linked-data foundation.** The canonical serialisation is JSON-LD, giving every object and property a globally unique URI while remaining ordinary JSON to consumers that do not process the semantics. This aligns the CDM simultaneously with OCDS (JSON), W3C VC/DID (JSON-LD), ePO (RDF/OWL), and Solid (RDF).

---

## 2. Architectural overview

The CDM is organised into four layers. Each layer builds on the one below.

**2.1 Foundation layer** — the primitive value types and reference objects used everywhere: identifiers, parties, values, periods, classifications, documents, items, credentials. (§4)

**2.2 Process layer** — the procurement lifecycle objects, aligned to the OCDS stages of planning, tender, award, contract, and implementation: needs, sourcing events, lots, submissions, evaluations, awards, contracts, orders, catalogues, invoices, obligations, performance records. (§5)

**2.3 Agent layer** — the structures that make SIGNET agent-native: synthetic agents, capabilities, mandates, agent actions, decisions, and the policy objects that govern them. (§6)

**2.4 Trust layer** — the cross-cutting governance structures: events, provenance, consent, and audit records that wrap every object in the layers above. (§7)

```
┌─────────────────────────────────────────────────────────┐
│  Trust layer      Event · Provenance · Consent · Audit   │
├─────────────────────────────────────────────────────────┤
│  Agent layer      SyntheticAgent · Mandate · Action ·    │
│                   Decision · Policy · Capability          │
├─────────────────────────────────────────────────────────┤
│  Process layer    Need · SourcingEvent · Lot · Submission│
│                   Evaluation · Award · Contract · Order · │
│                   Catalogue · Invoice · Obligation        │
├─────────────────────────────────────────────────────────┤
│  Foundation layer Identifier · Party · Credential ·      │
│                   Value · Period · Classification ·       │
│                   Document · Item                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Notation and conformance keywords

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in RFC 2119 and RFC 8174.

Field cardinality is shown as: `1` (exactly one, required), `0..1` (optional single), `1..*` (one or more, required), `0..*` (zero or more). Data types reference the foundation types in §4 or the JSON Schema primitives `string`, `number`, `boolean`, `integer`, and ISO 8601 `date-time`.

---

## 4. Foundation layer

### 4.1 Identifier

A typed, scheme-qualified identifier. Every Party, document, and major object carries at least one.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `scheme` | string (URI) | 1 | The identifier scheme, as a URI. Registered schemes include `did`, `gleif:lei`, `gs1:gln`, `vat`, `companies-house`, `peppol`. |
| `id` | string | 1 | The identifier value within the scheme. |
| `uri` | string (URI) | 0..1 | A resolvable URI for the identified entity, where one exists. |

A `did`-scheme identifier (e.g. `did:web:supplier.example.com`) makes the Party self-sovereign and resolvable without a central registry (§1.4).

### 4.2 Party

Any actor in the network. The single most important foundation object. Subtyped by `role`.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Primary identifier (DID RECOMMENDED). |
| `identifiers` | Identifier[] | 0..* | Additional identifiers (LEI, VAT, GLN, etc.). |
| `name` | string | 1 | Legal or display name. |
| `roles` | string[] | 1..* | One or more of: `buyer`, `supplier`, `procuringEntity`, `payer`, `payee`, `humanAgent`, `syntheticAgent`, `certifier`, `observer`. |
| `partyType` | string | 1 | `organization`, `person`, or `agent`. |
| `address` | Address | 0..1 | Postal/registered address. |
| `contactPoint` | ContactPoint | 0..1 | Contact details. |
| `credentials` | Credential[] | 0..* | Verifiable Credentials held by the Party (§4.7). |
| `memberOf` | Identifier | 0..1 | The organisation a person or agent acts for. |

A Party with `partyType: agent` is further described by the Agent layer (§6).

### 4.3 Value

A monetary amount. Aligned to EN 16931 monetary representation.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `amount` | number | 1 | The numeric amount. |
| `currency` | string | 1 | ISO 4217 three-letter code. |
| `taxIncluded` | boolean | 0..1 | Whether the amount is tax-inclusive. |

### 4.4 Period

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `startDate` | date-time | 0..1 | Inclusive start. |
| `endDate` | date-time | 0..1 | Inclusive end. |
| `durationInDays` | integer | 0..1 | Convenience duration where dates are indicative. |

### 4.5 Classification

A coded classification against a controlled scheme.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `scheme` | string | 1 | e.g. `cpv`, `unspsc`, `cpvs`, `gsin`. |
| `id` | string | 1 | Code value. |
| `description` | string | 0..1 | Human-readable label. |

### 4.6 Item

A line item — a unit of what is being bought, offered, ordered, or invoiced.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string | 1 | Item identifier, unique within its containing object. |
| `description` | string | 1 | What the item is. |
| `classification` | Classification | 0..1 | Primary classification. |
| `additionalClassifications` | Classification[] | 0..* | Further classifications. |
| `quantity` | number | 0..1 | Quantity. |
| `unit` | Unit | 0..1 | Unit of measure (UN/ECE Rec 20) and unit price. |
| `deliveryLocation` | Location | 0..1 | Where the item is delivered. |

### 4.7 Credential

A reference to a W3C Verifiable Credential asserting a claim about a Party (e.g. ISO 27001 certification, EcoVadis rating, insurance cover).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string (URI) | 1 | Credential identifier. |
| `type` | string[] | 1..* | VC types, e.g. `VerifiableCredential`, `ISO27001Certificate`. |
| `issuer` | Identifier | 1 | DID or identifier of the issuing authority. |
| `issuanceDate` | date-time | 1 | When issued. |
| `expirationDate` | date-time | 0..1 | When it expires. |
| `credentialSubject` | object | 1 | The claims, per the VC data model. |
| `proof` | object | 1 | Cryptographic proof (may be a BBS proof enabling selective disclosure). |
| `selectiveDisclosure` | boolean | 0..1 | Whether the credential supports zero-knowledge selective disclosure. |

### 4.8 Document

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string | 1 | Document identifier. |
| `documentType` | string | 1 | Coded type (e.g. `tenderNotice`, `evaluationCriteria`, `signedContract`). |
| `title` | string | 0..1 | Title. |
| `url` | string (URI) | 0..1 | Resolvable location. |
| `hash` | string | 0..1 | Content hash (integrity). |
| `accessGrant` | Identifier | 0..1 | Reference to a Consent/access-grant object (§7.3) where access is controlled. |

---

## 5. Process layer

The process layer follows the OCDS lifecycle so that any SIGNET process can be projected to a conforming OCDS release. The five OCDS stages — planning, tender, award, contract, implementation — are preserved as the canonical phase model.

### 5.1 Need (planning stage)

The demand signal that initiates procurement. Equivalent to OCDS `planning`.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Need identifier. |
| `title` | string | 1 | Short description of the need. |
| `description` | string | 0..1 | Fuller description. |
| `requestingParty` | Identifier | 1 | The Party raising the need. |
| `budget` | Value | 0..1 | Indicative budget. |
| `classification` | Classification | 0..1 | What is needed. |
| `rationale` | string | 0..1 | Why it is needed. |
| `governingPolicies` | Identifier[] | 0..* | Policy objects that constrain this procurement (§6.5). |

### 5.2 SourcingEvent (tender stage)

A request to the market — RFP, RFQ, ITT, tender, or call-off competition. Equivalent to OCDS `tender`.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Event identifier. |
| `title` | string | 1 | Title. |
| `procuringParty` | Identifier | 1 | The buyer/procuring entity. |
| `procedure` | string | 1 | Procedure type, e.g. `open`, `restricted`, `competitiveFlexible`, `directAward`, `frameworkCallOff`. |
| `status` | string | 1 | `planned`, `active`, `evaluating`, `complete`, `cancelled`, `withdrawn`. |
| `lots` | Lot[] | 0..* | Divisible portions (§5.3). |
| `items` | Item[] | 0..* | What is being sourced. |
| `value` | Value | 0..1 | Estimated value. |
| `eligibilityCriteria` | Policy[] | 0..* | Machine-readable entry criteria (§6.5). |
| `evaluationCriteria` | Policy[] | 0..* | Machine-readable scoring model (§6.5). |
| `period` | Period | 0..1 | Submission window. |
| `documents` | Document[] | 0..* | Tender documents. |

### 5.3 Lot

A divisible portion of a SourcingEvent that may be awarded independently.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string | 1 | Lot identifier within the event. |
| `title` | string | 1 | Lot title. |
| `items` | Item[] | 0..* | Items in this lot. |
| `value` | Value | 0..1 | Estimated lot value. |

### 5.4 Submission

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
| `sealedProof` | object | 0..1 | Where sealed-bid cryptography applies, the encrypted submission and proof (§9.3). |
| `status` | string | 1 | `draft`, `submitted`, `withdrawn`, `admissible`, `inadmissible`. |

### 5.5 Evaluation

The scoring of submissions against the evaluation criteria.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Evaluation identifier. |
| `submission` | Identifier | 1 | The submission scored. |
| `criteria` | Policy | 1 | The evaluation model applied. |
| `scores` | Score[] | 1..* | Per-criterion scores with rationale. |
| `evaluatedBy` | Identifier | 1 | The agent (human or synthetic) performing the evaluation. |
| `result` | string | 1 | `passed`, `failed`, `ranked`. |
| `decision` | Identifier | 0..1 | Link to the Decision record (§6.4). |

### 5.6 Award (award stage)

The decision to award. Equivalent to OCDS `award`.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Award identifier. |
| `sourcingEvent` | Identifier | 1 | The event. |
| `awardedParty` | Identifier | 1 | The winning supplier. |
| `value` | Value | 1 | Awarded value. |
| `rationale` | string | 0..1 | Award rationale. |
| `decision` | Identifier | 1 | The Decision record supporting the award (§6.4). |
| `standstillPeriod` | Period | 0..1 | Where regulation requires a standstill (e.g. UK Procurement Act). |

### 5.7 Contract (contract stage)

The binding agreement. Equivalent to OCDS `contract`.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Contract identifier. |
| `award` | Identifier | 0..1 | The award it derives from. |
| `parties` | Identifier[] | 1..* | Contracting parties. |
| `title` | string | 1 | Contract title. |
| `value` | Value | 1 | Contract value. |
| `period` | Period | 1 | Contract term. |
| `obligations` | Obligation[] | 0..* | Obligations and milestones (§5.10). |
| `documents` | Document[] | 0..* | Signed contract and annexes. |
| `governingPolicies` | Identifier[] | 0..* | Policies governing performance. |

### 5.8 Order

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

### 5.9 Catalogue

A structured offering of goods/services. Aligned to UBL Catalogue and Peppol BIS Catalogue.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Catalogue identifier. |
| `providerParty` | Identifier | 1 | The supplier. |
| `items` | Item[] | 1..* | Catalogue lines with prices. |
| `validityPeriod` | Period | 0..1 | Validity. |

### 5.10 Obligation

A contractual obligation, deliverable, or milestone with a compliance state.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string | 1 | Obligation identifier within the contract. |
| `description` | string | 1 | What must be done. |
| `dueDate` | date-time | 0..1 | When. |
| `responsibleParty` | Identifier | 0..1 | Who is responsible. |
| `status` | string | 1 | `pending`, `met`, `breached`, `waived`. |
| `evidence` | Document[] | 0..* | Evidence of fulfilment. |

### 5.11 Invoice (implementation stage)

An invoice, fully aligned to EN 16931 so it is convertible to Peppol BIS / UBL Invoice or Factur-X. Field names below reference EN 16931 Business Terms (BT) for traceability.

| Field | Type | Card. | EN 16931 | Definition |
|-------|------|-------|----------|------------|
| `id` | Identifier | 1 | BT-1 | Invoice number. |
| `issueDate` | date-time | 1 | BT-2 | Issue date. |
| `contract` | Identifier | 0..1 | BT-12 | Related contract. |
| `order` | Identifier | 0..1 | BT-13 | Related order. |
| `seller` | Identifier | 1 | BG-4 | Seller. |
| `buyer` | Identifier | 1 | BG-7 | Buyer. |
| `lines` | InvoiceLine[] | 1..* | BG-25 | Invoice lines. |
| `taxTotal` | Value | 1 | BG-22 | Total tax. |
| `payableAmount` | Value | 1 | BT-115 | Amount due for payment. |
| `paymentTerms` | string | 0..1 | BT-20 | Payment terms. |

The CDM's EN 16931 alignment is what makes a SIGNET network natively compliant with the EU ViDA cross-border e-invoicing mandate (from July 2030) and the national B2B mandates preceding it.

---

## 6. Agent layer

This layer is SIGNET's distinctive contribution. No existing procurement standard represents synthetic agents as first-class, governed, accountable participants. The agent layer does.

### 6.1 SyntheticAgent

An AI agent operating within the network as a first-class Party (`partyType: agent`, role `syntheticAgent`).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Agent DID. |
| `name` | string | 1 | Agent name. |
| `operatedBy` | Identifier | 1 | The Party accountable for the agent. |
| `model` | string | 0..1 | The underlying model family (model-agnostic; for provenance only). |
| `capabilities` | AgentCapability[] | 1..* | Declared capabilities (§6.2). |
| `mandate` | Identifier | 1 | The Mandate governing the agent (§6.3). |
| `agentCard` | string (URI) | 0..1 | A2A Agent Card location (`/.well-known/agent.json`). |

### 6.2 AgentCapability

A declared capability, aligned to the A2A Agent Card model so capabilities are discoverable across organisational boundaries.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `name` | string | 1 | Capability name, e.g. `evaluate.submission`, `negotiate.price`. |
| `description` | string | 0..1 | What it does. |
| `inputSchema` | object | 0..1 | Expected input. |
| `outputSchema` | object | 0..1 | Produced output. |

### 6.3 Mandate

The authority granted to an agent — what it may do, within what limits, and where human approval is required. The structure that bounds an agent's remit, and makes an action outside it visible in the record. A **grant-type object** (§7.4): its withdrawal is recorded by appending an event, never by mutating the object.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Mandate identifier. |
| `agent` | Identifier | 1 | The agent governed. |
| `grantedBy` | Identifier | 1 | The Party granting authority. |
| `permittedCapabilities` | string[] | 1..* | Capabilities the agent may exercise. |
| `constraints` | Policy[] | 0..* | Hard limits (e.g. max discount, value ceiling). |
| `approvalThresholds` | Policy[] | 0..* | Conditions requiring human-in-the-loop approval. |
| `scope` | object | 1 | Data and entity scope the agent may operate within (sandbox boundary). |
| `validity` | Period | 0..1 | Time bound on the mandate. |

### 6.4 Decision

A record of a decision taken in the network, by a human or synthetic agent, with the inputs and rationale that produced it. The backbone of accountability.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Decision identifier. |
| `decisionType` | string | 1 | e.g. `admissibility`, `evaluation`, `award`, `negotiationMove`. |
| `madeBy` | Identifier | 1 | The agent (human or synthetic) that decided. |
| `underMandate` | Identifier | 0..1 | The mandate relied on, where the decider is synthetic. |
| `inputs` | Identifier[] | 0..* | The objects considered (submissions, credentials, policies). |
| `policiesApplied` | Identifier[] | 0..* | The policies applied. |
| `rationale` | string | 1 | Human-readable rationale. |
| `outcome` | object | 1 | The decision outcome. |
| `humanApproval` | Identifier | 0..1 | Where a mandate threshold required it, the approving Party and record. |
| `provenance` | Provenance | 1 | Full provenance (§7.2). |

A Decision record satisfies the "material decision" record-keeping that regulation increasingly requires — including the assessment-summary and decision-record obligations of the UK Procurement Act 2023, and the documentation expectations for AI-assisted evaluation under the EU AI Act.

### 6.5 Policy

A machine-readable, human-auditable rule. Policies express eligibility criteria, evaluation models, approval routing, agent constraints, and compliance rules. "Rules as code" made concrete.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Policy identifier. |
| `policyType` | string | 1 | `eligibility`, `evaluation`, `approval`, `constraint`, `compliance`. |
| `expressionLanguage` | string | 1 | The language the rule is written in, e.g. `rego`, `dmn`, `cel`. |
| `expression` | string | 1 | The executable rule. |
| `humanReadable` | string | 1 | A plain-language statement of the same rule. |
| `version` | string | 1 | Policy version. |
| `issuedBy` | Identifier | 1 | The governing Party. |

The dual requirement — `expression` (machine-executable) and `humanReadable` (auditable) — is mandatory. A Policy MUST carry both so that the same rule governs agents and is reviewable by humans.

---

## 7. Trust layer

Cross-cutting structures that wrap every object above with auditability, provenance, and consent.

### 7.1 Event

An append-only record of a material change. The current state of any object is the projection of its ordered Event stream (§1.7).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Event identifier. |
| `eventType` | string | 1 | e.g. `submission.lodged`, `award.decided`, `mandate.granted`. |
| `subject` | Identifier | 1 | The object the event concerns. |
| `actor` | Identifier | 1 | The Party (human or synthetic) that caused the event. |
| `timestamp` | date-time | 1 | When it occurred. |
| `payload` | object | 0..1 | The change. |
| `previousEventHash` | string | 0..1 | Hash of the prior event, forming a tamper-evident chain. |
| `provenance` | Provenance | 1 | Provenance (§7.2). |

### 7.2 Provenance

Who or what produced an assertion, when, and from what. Aligned to W3C PROV.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `generatedBy` | Identifier | 1 | The agent or activity that produced the assertion. |
| `generatedAt` | date-time | 1 | When. |
| `derivedFrom` | Identifier[] | 0..* | Source objects. |
| `usedPolicies` | Identifier[] | 0..* | Policies applied. |
| `signature` | object | 0..1 | Cryptographic signature over the assertion. |

### 7.3 Consent

A data-sovereignty access grant — the right of a named party, for a stated purpose, for a bounded time, to access data held by another party. Expresses the Solid consent pattern as CDM data (§1.5).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Consent identifier. |
| `grantor` | Identifier | 1 | The party who owns the data. |
| `grantee` | Identifier | 1 | The party granted access. |
| `resource` | Identifier[] | 1..* | The data resources covered. |
| `purpose` | string | 1 | The permitted purpose. |
| `validity` | Period | 1 | Time bound. |
| `revocable` | boolean | 1 | Whether revocable before expiry. |
| `proof` | object | 0..1 | Signed grant. |

`purpose` is a **human-readable statement** of the purpose for which access is granted, not a machine-evaluable term. The string interoperates; its evaluation is not defined by this specification. A profile MAY define a `purposeCode` extension with a codelist appropriate to its jurisdiction or sector (§11).

`revocable` records whether a grant *may* be withdrawn. It does not record whether one *has* been: withdrawal is an event, per §7.4.

### 7.4 Grant-type objects and withdrawal

> **Grant-type object.** A CDM object that confers authority or permission from one party to another for a bounded period, and whose conferred authority may cease before the end of that period.

**7.4.1** In this version the grant-type objects are **`Consent`** (§7.3) and **`Mandate`** (§6.3). The list is enumerated: a later primitive meeting the definition acquires the obligations below only through an explicit amendment naming it. Open-ended inheritance would let a future proposal's author acquire obligations silently.

**7.4.2 Withdrawal is an event, not a field.** An implementation MUST NOT mutate a grant-type object to record that its authority has been withdrawn. Withdrawal is recorded by appending an `Event` (§7.1) whose `subject` is the grant object. This follows §1.7: current state is the projection of the ordered event stream, not mutable state carried on the object.

**7.4.3 Projection rule (normative).** A grant-type object *G* is **effective** at time *T* if and only if:

1. an event of type `<object>.granted` naming *G* as `subject` precedes *T*; and
2. no event of type `<object>.revoked` naming *G* as `subject` precedes *T*; and
3. *T* falls within *G*'s `validity` Period.

The effective/not-effective determination MUST be reproducible by a third party from the published event stream alone.

**7.4.4 Closed core within `eventType`.** The `eventType` codelist remains **open** as an extension space, but the subset published in `codelists/eventTypeCore.csv` is **closed and normative**: codes in that subset MUST carry the meanings given there, and MUST NOT be redefined, reused, or narrowed by implementations, extensions, or profiles. A code appears in exactly one of the two files, and consumers take the union. Admission to the closed subset is append-only and occurs only through the change-control process (§12); adding an entry is a minor version, and changing the meaning of an existing entry is a major version.

The initial closed subset is `consent.granted`, `consent.revoked`, `mandate.granted`, `mandate.revoked`.

No `*.expired` code exists. Expiry occurs by the clock rather than by any party's act, so an expiry event would have no honest `actor` — which `Event` requires — and clause 3 of the projection rule tests `validity` directly.

**7.4.5** No field is added to `Consent` or `Mandate` by this section. `Event.subject` already carries the grant object's identifier, so withdrawal is fully expressible once the event types exist and their meanings are fixed.

---

## 8. Standards mapping (normative)

The CDM is a profile-and-bridge over established standards. The following mappings are normative: a conforming implementation MUST be able to transform between the CDM and these formats without loss of the fields defined in the mapping.

| CDM object | Maps to / from | Mapping basis |
|------------|----------------|---------------|
| Need | OCDS `planning` | OCDS 1.1 release |
| SourcingEvent, Lot | OCDS `tender`; eForms notice | OCDS 1.1; eForms |
| Submission | OCDS `bid` (bid extension); UBL Tender | OCDS bid extension |
| Award | OCDS `award` | OCDS 1.1 |
| Contract | OCDS `contract` | OCDS 1.1 |
| Order | UBL 2.3 Order; Peppol BIS Ordering | UBL 2.3 |
| Catalogue | UBL 2.3 Catalogue; Peppol BIS Catalogue | UBL 2.3 |
| Invoice | EN 16931; Peppol BIS Billing; UBL Invoice; Factur-X | EN 16931 semantic model |
| Party | OCDS `parties`; ePO Agent | OCDS org; ePO |
| Credential | W3C Verifiable Credentials 2.0 | VC data model |
| Identifier (`did`) | W3C DID 1.0 | DID core |
| Provenance | W3C PROV-O | PROV |
| Semantic layer (all) | EU eProcurement Ontology (ePO) | ePO OWL/RDF |

Where a CDM object has no counterpart in a target standard (notably the entire Agent layer when projecting to OCDS), the projection omits it without error, and the reverse lift leaves those fields empty. SIGNET-original structures are always cleanly separable from third-party standards, consistent with the IP & Licensing Policy.

---

## 9. Serialisation

**9.1 Canonical form.** The canonical serialisation is JSON-LD 1.1. Concert publishes the SIGNET `@context` at a stable URI. Every object type and property resolves to a URI in the SIGNET vocabulary namespace, itself aligned to ePO terms where equivalents exist.

**9.2 Plain-JSON consumption.** Consumers that do not process linked-data semantics MAY treat CDM documents as ordinary JSON; the `@context` is ignorable without loss of the document's tree structure. This preserves the low-friction adoption that made OCDS's plain-JSON approach successful.

**9.3 Cryptographic envelopes.** Where confidentiality is required — sealed-bid submissions (§5.4), selective credential disclosure (§4.7) — the relevant fields carry a cryptographic envelope (zero-knowledge proof, homomorphic ciphertext, or BBS selective-disclosure proof) in place of cleartext, with verification metadata. The envelope formats are specified in the separate SIGNET Cryptographic Profiles document.

---

## 10. Identifiers and namespaces

**10.1** Every CDM object MUST carry a network-unique `id`. Decentralised Identifiers (DIDs) are RECOMMENDED for Parties and agents; URN or URI identifiers are acceptable for process objects.

**10.2** The SIGNET vocabulary namespace, the published `@context`, and the registry of identifier schemes and codelists are maintained by Concert at stable URIs under the `concert.foundation` domain and MUST NOT be repurposed by implementers to publish non-conforming extensions under the SIGNET name.

---

## 11. Extension mechanism

The CDM is extensible without forking, following the OCDS extension pattern.

**11.1** An extension is a published, versioned package that adds object types, fields, or codelist values under its own namespace. Extensions MUST NOT redefine or remove core fields.

**11.2** Community extensions MAY be submitted to Concert for review and, if broadly useful, promotion into the core model through the change-control process (§12). This keeps the core lean while allowing domain-specific elaboration (e.g. a defence-procurement extension, a construction extension).

**11.3** Core conformance (§13) is assessed against the core model only; extensions are conformance-assessed separately.

---

## 12. Versioning and change control

**12.1** The CDM uses semantic versioning. The major version changes only on a breaking change to the core model; minor versions add backward-compatible structure; patch versions clarify without changing meaning.

**12.2** As a normative artifact, the core model changes only through the formal revision process, which requires a recorded resolution, a stated comment period of at least fourteen calendar days, and an approving review. Non-normative material (examples, guidance, mapping notes) MAY be updated under a single approving review with no comment period, consistent with the normative/non-normative distinction in the governance model. The process is recorded in `GOVERNANCE.md` and took effect on 20 August 2026; changes merged before that date followed prior practice, and `governance/reviews/2026-08-normative-approval-audit.md` records what that practice was. **No Standards Committee is constituted**: until one is, decisions that would fall to it are taken under the bootstrap clause in `governance/README.md` and recorded as interim resolutions.

**12.3** Every published version is permanently retrievable at a version-stable URI. Implementations declare the CDM version they target.

---

## 13. Conformance

**13.1** A document conforms to the CDM if it validates against the published SIGNET JSON Schema for its declared version and satisfies the structural rules in this specification.

**13.2** An implementation conforms if it (a) reads and writes conforming documents, (b) performs the normative standards mappings in §8 without loss of mapped fields, and (c) preserves provenance and event integrity for every material change it makes.

**13.3** Conformance is verified against the SIGNET conformance test suite (a separate normative artifact, Apache-2.0 licensed) and its synthetic test datasets (CDLA-Permissive). Certification of conformance, and the "SIGNET Certified" mark, are administered by Concert under the IP & Licensing Policy, on identical terms to all implementers.

---

## Appendix A — Worked example (illustrative)

A minimal award Decision made by a synthetic evaluation agent, in canonical JSON-LD (abbreviated):

```json
{
  "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
  "type": "Decision",
  "id": { "scheme": "did", "id": "did:web:buyer.example#decision-8842" },
  "decisionType": "award",
  "madeBy": { "scheme": "did", "id": "did:web:buyer.example#agent-eval-3" },
  "underMandate": { "scheme": "did", "id": "did:web:buyer.example#mandate-eval-3" },
  "inputs": [
    { "scheme": "did", "id": "did:web:buyer.example#submission-5521" },
    { "scheme": "did", "id": "did:web:buyer.example#submission-5522" }
  ],
  "policiesApplied": [
    { "scheme": "did", "id": "did:web:buyer.example#policy-eval-mat" }
  ],
  "rationale": "Most Advantageous Tender (price 0.2, quality 0.55, social 0.25). submission-5521 scored 0.859474, ahead of submission-5522 at 0.841500 (margin 0.017974). The dearer bid wins on materially higher quality, accepting a 5.56% price premium over the lower bid.",
  "outcome": { "awardedSubmission": "did:web:buyer.example#submission-5521" },
  "humanApproval": { "scheme": "did", "id": "did:web:buyer.example#approval-771" },
  "provenance": {
    "generatedBy": { "scheme": "did", "id": "did:web:buyer.example#agent-eval-3" },
    "generatedAt": "2026-06-21T14:08:00Z",
    "usedPolicies": [{ "scheme": "did", "id": "did:web:buyer.example#policy-eval-mat" }],
    "signature": { "type": "Ed25519Signature2020", "value": "z58…" }
  }
}
```

This single object records what was decided, which synthetic agent decided it, under which mandate, from which inputs, under which policy, with what rationale, with which human approval, and with cryptographic provenance — the accountability guarantee that distinguishes a SIGNET network from a conventional procurement platform.

---

*This is a working draft published for comment under CC0 1.0. © 2026 Concert Foundation — to the extent any rights subsist, they are dedicated to the public domain. SIGNET and "SIGNET Certified" are marks administered by Concert Foundation under the IP & Licensing Policy.*
