---
title: oneNDA and SIGNET
kind: position
status: proposal
relatesTo: v0.17.0
claims:
  modelled: none
  tested: none
  certified: none
date: 2026-09-12
supersedes: none
---

# oneNDA and SIGNET

**A positioning paper from Concert Foundation** · status: proposal · relates to SIGNET v0.17.0

## Summary

Almost every sourcing exercise begins with a non-disclosure agreement. A buyer cannot share a specification, a supplier cannot share a price book, and neither can share a roadmap until confidentiality is settled. Yet none of the standards SIGNET bridges – OCDS, eForms, UBL, EN 16931, ePO – has a place for the NDA. It sits before the tender, in the gap the lifecycle vocabularies leave open.

oneNDA is an open, community-drafted mutual NDA whose body is fixed and whose only negotiable terms are a short list of cover-page variables. That shape is unusually well matched to SIGNET. A contract with a fixed body and a handful of variables is, in SIGNET's terms, a document with a stable hash and a small, machine-checkable set of fields. The negotiation collapses to the variables; the variables are data; and data is what a SIGNET policy can evaluate, what a mandate can bound, and what an event chain can record.

This paper sets out how oneNDA aligns with SIGNET's design principles and where it would land in the model. To be explicit about what is and is not claimed: **SIGNET does not currently model an NDA.** There is no NDA object, no `nda` document type and no confidentiality event in v0.17.0. What follows is a proposed extension, offered for comment, not a description of shipped coverage.

---

## 1. The gap: confidentiality has no home in the lifecycle standards

SIGNET's process layer follows the five OCDS stages – planning, tender, award, contract, implementation – and every process object projects to one of them. That is deliberate: reuse before invention is the first design principle.

The NDA does not fit the pattern. It is agreed before or during the tender stage, it is a contract in its own right but not the contract the tender leads to, and it governs information rather than goods or services. OCDS records tender documents; it does not record the terms on which a supplier was allowed to read them. eForms notices publish what is being bought; they do not publish the confidentiality basis on which detail is released to shortlisted bidders. EN 16931 and UBL do not start until there is an order or an invoice.

In practice this means the NDA is handled outside the data. It lives in a contract-management system, an email thread or a signature platform, and the sourcing record contains at most a checkbox or a filename. For a human-run process that is tolerable. For a governed, agent-native network it is not: a synthetic agent instructed to release a specification to a supplier has no structured way to establish that the supplier is bound, on what terms, for how long, and under which law.

SIGNET already has the components that surround this gap. `Document` carries a hash and an `accessGrant`. `Consent` records who may access which resource, for what purpose, for how long. `Policy` expresses eligibility as executable rules with a human-readable twin. What is missing is the object those components should refer to: the confidentiality agreement itself, in a form that can be checked rather than merely attached.

---

## 2. What oneNDA is

oneNDA is a crowd-sourced, open-source mutual non-disclosure agreement created by the legal community and free to use. Version 1 was released in August 2021; version 2 followed in March 2022 in response to community feedback, and the current published text is version 2.1. The initiative is now administered by Law Insider, which hosts the terms, the cover page, the adopter directory and a family of sibling standards (a unilateral variant, an M&A rider, oneSaaS and oneDPA). On the steward's own figures, several thousand organisations have adopted it, and a UK Government departmental NDA template published on GOV.UK is built on oneNDA v2.1.

Three features matter for SIGNET.

**The body is fixed.** The steward's rule is that the variables can be amended and negotiated but the body of the agreement must not be. If the body is changed, the document can no longer be called oneNDA and the brand assets may not be used. The terms are ten short clauses covering the definition of confidential information, permitted receivers, the receiver's obligations, duration and termination, and boilerplate.

**The variables are few and enumerable.** The cover page carries the parties' details and signatories plus four negotiable terms: Purpose, Confidentiality Period, Governing Law and Dispute Resolution Method. Dispute resolution is itself a two-way choice – litigation in named courts or arbitration at a named seat. The effective date was deliberately excluded as a variable; the agreement is perpetual until terminated on thirty days' notice, and the confidentiality period runs from the date each item of information is disclosed. A published "graveyard document" records every clause the community considered and rejected, with reasons.

**It can be incorporated by reference.** The steward publishes the v2.1 terms at a stable URL and states that a party may use its own cover page and incorporate the body by linking to that URL. The agreement is therefore already a pointer plus a set of values, before SIGNET does anything with it.

The licence displayed on onenda.org is Creative Commons Attribution-NoDerivatives 4.0. The Law Insider standards hub states CC BY 4.0. Either way the terms may be used freely with attribution; the no-derivatives reading is the one consistent with the fixed-body rule, and adopters should confirm the current licence with the steward.

oneNDA is not without critics. Contract-drafting specialists have argued the text is competent rather than exemplary, and jurisdiction-specific practitioners note that data-protection and alternative-dispute-resolution detail must be handled separately. Neither objection bears on the question this paper asks, which is whether a fixed-body, variables-only NDA is the right *shape* for a data standard to profile. It is.

---

## 3. Alignment with SIGNET's design principles

| Principle | How oneNDA aligns |
|---|---|
| **1.1 Reuse before invention** | SIGNET does not draft an NDA. It profiles one that already exists, is already adopted, and is already maintained by a steward with a published version history. |
| **1.2 Standards as profiles, not forks** | The extension references oneNDA by URL, version and hash. It does not embed, restate or modify the text. The fixed-body rule and the no-derivatives licence are respected by construction: SIGNET carries the pointer and the variables, never a copy. |
| **1.3 Agent-native by construction** | Because the body is fixed, the only decisions in an NDA negotiation are the four variables. That is a decision space small enough to express as a `Policy`, bound with a `Mandate`, and record as a `Decision`. A synthetic agent can be permitted to execute a oneNDA only where governing law is in an allowed set and the confidentiality period is within a ceiling – and be required to escalate anything else. |
| **1.4 Identity is decentralised** | The parties on the cover page are SIGNET `Party` objects with `did`, LEI or company-register identifiers. An executed NDA can be issued as a Verifiable Credential the supplier holds and presents across buyers. |
| **1.5 Data sovereignty is explicit** | The NDA is the legal instrument; `Consent` is the data instrument. The two should reference each other. A tender `Document` whose `accessGrant` points at a `Consent` whose `purpose` mirrors the NDA's Purpose gives the network a single answer to "may this supplier read this file, and on what legal basis?" |
| **1.6 Policy is data** | "No submission is admissible from a supplier without an executed NDA covering this event's purpose" is an `eligibility` Policy: one `expression`, one `humanReadable` statement, evaluated the same way by an auditor and an agent. |
| **1.7 Events are immutable** | Execution, amendment of variables by written agreement, and termination are material changes. Each becomes an append-only, hash-chained `Event`. The fixed body means the hash of the terms is itself an integrity check: a document that claims to be oneNDA v2.1 but hashes differently is not oneNDA. |
| **1.8 Linked-data foundation** | Incorporation by reference is already a URI pattern. The JSON-LD context can map the extension's terms to ePO where equivalents exist (contracting parties, governing law) and leave the rest under the extension namespace. |

The correspondence is close enough that oneNDA reads as if it had been designed for a data standard to consume. It was not; it was designed to stop lawyers redlining boilerplate. The two goals converge because both depend on the same move – separate what varies from what does not, and make what varies small.

---

## 4. Where it lands in the model

The proposal is an extension, following the pattern in the specification (§11.1): a published, versioned package adding object types, fields and codelist values under its own namespace, without redefining or removing anything in core. Core conformance is unaffected; the extension is conformance-assessed separately. Everything in this section is a proposal for the extension's normative document, which lands first; schemas follow it.

### 4.1 A `ConfidentialityAgreement` object

The object is standard-agnostic by design. oneNDA is the profiled default, not a hard-coded assumption, so the same object can carry a buyer's own template where one is required.

| Field | Type | Card. | Definition |
|---|---|---|---|
| `id` | Identifier | 1 | Agreement identifier. |
| `parties` | Identifier[] | 2..* | The contracting parties (`Party` references). oneNDA v2 supports multi-party execution. |
| `terms` | TermsReference | 1 | The fixed body: `standard` (e.g. `oneNDA`), `version` (e.g. `2.1`), `url` (the published terms), `hash` (content hash of the body at that version). |
| `purpose` | string | 1 | The oneNDA Purpose variable. |
| `confidentialityPeriod` | Period | 1 | The Confidentiality Period variable, expressed as `durationInDays` (runs from each disclosure, per the terms). |
| `governingLaw` | string | 1 | The Governing Law variable, as an ISO 3166 country or subdivision code. |
| `disputeResolution` | object | 1 | `method` (`litigation` or `arbitration`) plus `forum` (the named courts or the arbitral seat). |
| `noticeAddresses` | ContactPoint[] | 2..* | Per-party email for formal notices, as the terms require. |
| `executedAt` | date-time | 0..1 | Date of execution. |
| `status` | string | 1 | `draft`, `executed`, `terminated`. |
| `documents` | Document[] | 0..* | The executed instrument (`documentType: nda`), with hash. |
| `relatedSourcingEvents` | Identifier[] | 0..* | The events this agreement covers. |

Two rules follow from oneNDA's own terms and would be enforced by CI, not by reader attention. First, where `terms.standard` is `oneNDA`, `terms.hash` MUST match the registered hash for `terms.version`; a mismatch is a validation failure, because the document is by definition not oneNDA. Second, `confidentialityPeriod` is a duration, never a date range, because the period runs from disclosure and there is no single start date.

### 4.2 Codelist additions

- `documentType`: add `nda` – an executed confidentiality agreement.
- `eventType`: add `nda.executed`, `nda.varied` (written amendment of a variable) and `nda.terminated`.
- `decisionType`: consider `ndaExecution`, so an agent's decision to execute on a buyer's behalf is recorded with the same provenance as an award.

### 4.3 Where it attaches

**SourcingEvent.** A confidentiality agreement is referenced from the event, and the event's `eligibilityCriteria` may carry a Policy requiring one. Restricted and competitive-flexible procedures, where detailed documents are released only to a selected list, are the immediate case.

**Submission.** Admissibility is evaluated against the eligibility Policy. A `Decision` of type `admissibility` records that the NDA check was performed, by whom, and against which agreement.

**Document and Consent.** Tender documents released under NDA carry an `accessGrant` to a `Consent` whose `grantee` is the supplier, whose `purpose` matches the agreement's Purpose, and whose `validity` is bounded by the confidentiality period. The Consent references the agreement; the agreement references the sourcing event. The chain is closed.

**OnboardingCase and SupplierQualification.** The onboarding extension collects credential types and produces a durable qualification. An executed oneNDA can be issued as a Verifiable Credential (`type: ["VerifiableCredential", "ConfidentialityAgreementCredential"]`) and listed among `collectedCredentials`. Because the body is fixed, the credential need only assert the standard, version, parties and variables to be complete – and because SupplierQualification is designed to be portable, a supplier could present it across buyers in a federated market.

**Mandate.** A buyer that lets a synthetic agent execute NDAs grants a Mandate with `permittedCapabilities: ["execute.nda"]`, `constraints` limiting `terms.standard` to `oneNDA`, `governingLaw` to an allowed set and `confidentialityPeriod` to a ceiling, and `approvalThresholds` routing anything outside those bounds to a human. This is the three-guarantee pattern of the agent layer – bounded authority, accountable action, auditable rules – applied to the first document in the sourcing lifecycle rather than the last.

### 4.4 A worked eligibility Policy

```json
{
  "type": "Policy",
  "id": { "scheme": "did", "id": "did:web:buyer.example#policy-nda-required" },
  "policyType": "eligibility",
  "expressionLanguage": "cel",
  "expression": "submission.submittingParty in sourcingEvent.confidentialityAgreements.filter(a, a.status == 'executed' && a.terms.standard == 'oneNDA').map(a, a.parties).flatten()",
  "humanReadable": "A submission is admissible only if an executed oneNDA between the procuring party and the submitting party is recorded against this sourcing event.",
  "version": "1.0",
  "issuedBy": { "scheme": "did", "id": "did:web:buyer.example" }
}
```

The same rule governs the agent that screens submissions and is the rule an auditor reads. That is the dual requirement the Policy object exists to enforce.

---

## 5. What this proposal does not do

**It does not embed oneNDA.** SIGNET carries a reference to the published terms, a version and a hash. The text stays where its steward publishes it. This respects the fixed-body rule, the licence and the steward's naming conditions.

**It does not give legal advice.** oneNDA was drafted by lawyers qualified in English, Californian and Australian law; the steward recommends local advice for other governing laws. Whether oneNDA is suitable for a given procurement is the adopter's question. SIGNET's contribution is that, whichever NDA is used, the answer is recorded as data.

**It does not cover personal data.** oneNDA is explicit that data-protection obligations are handled separately; the steward publishes oneDPA for that purpose. A `ConfidentialityAgreement` is not a data-processing agreement and the extension should not be read as one.

**It does not create a relationship between Concert and the oneNDA steward.** Concert profiles open standards; it holds no preferential relationship with any of their stewards, exactly as it holds none with any operator. oneNDA is referenced here on the same footing as OCDS, EN 16931 or UBL.

**It does not claim coverage.** Nothing in this paper is *modelled*, *tested* or *certified* in SIGNET v0.17.0. It is a proposal. Those three words are used with care throughout Concert's work and this paper does not earn any of them yet.

---

## 6. Route to adoption

The extension would follow the published contribution path: an issue describing the gap, a normative document defining the object, fields and codelist values under a dedicated namespace, at least one validated example instance, and a pull request that passes CI. Until the Standards Committee is constituted, normative changes proceed by interim approval record under the bootstrap clause, with a fourteen-day comment period, and any active proposal moratorium is checked first.

Three questions are open and are recorded here rather than resolved:

1. **Registered hashes.** Who publishes the canonical hash for each oneNDA version – Concert, in a conformance rule, or the steward? Concert can compute and publish it; a steward-published hash would be stronger. The declined alternative is to skip the hash and trust the version string, which reintroduces the problem the hash solves.
2. **Credential issuance.** Whether the executed-NDA credential is self-issued by the buyer, issued by a signature platform, or issued by a `certifier` Party is an implementation choice the extension should leave open, as the onboarding extension does for its credential types.
3. **Scope of the first version.** Mutual oneNDA only, or the unilateral and M&A variants too? The recommendation is mutual only, with `terms.standard` left open so the others can follow without a schema change.

Comments are welcome through the standard repository. Adopters who already use oneNDA and would be willing to validate a draft instance against real sourcing events are particularly invited to say so.

---

## Appendix A – Example instance (illustrative, not validated)

```json
{
  "@context": "https://signet.concert.foundation/context/v0.17.0",
  "type": "ConfidentialityAgreement",
  "id": { "scheme": "did", "id": "did:web:buyer.example#nda-2026-0412" },
  "parties": [
    { "scheme": "did", "id": "did:web:buyer.example" },
    { "scheme": "did", "id": "did:web:supplier.example" }
  ],
  "terms": {
    "standard": "oneNDA",
    "version": "2.1",
    "url": "https://www.lawinsider.com/standards/onenda/terms/v2.1",
    "hash": "sha256:<registered hash for oneNDA v2.1>"
  },
  "purpose": "Evaluation of the supplier's response to sourcing event SE-2026-0412 (wide area network services).",
  "confidentialityPeriod": { "durationInDays": 1095 },
  "governingLaw": "GB-ENG",
  "disputeResolution": { "method": "litigation", "forum": "Courts of England and Wales" },
  "noticeAddresses": [
    { "party": "did:web:buyer.example", "email": "legal@buyer.example" },
    { "party": "did:web:supplier.example", "email": "contracts@supplier.example" }
  ],
  "executedAt": "2026-09-01T10:14:00Z",
  "status": "executed",
  "documents": [
    { "id": "doc-nda-1", "documentType": "nda", "title": "Executed oneNDA v2.1", "hash": "sha256:<executed instrument hash>" }
  ],
  "relatedSourcingEvents": [
    { "scheme": "did", "id": "did:web:buyer.example#SE-2026-0412" }
  ]
}
```

## Appendix B – Sources

- oneNDA, onenda.org – home, versions, FAQ, cover page, core principles and graveyard document (accessed September 2026)
- Law Insider Standards Hub – oneNDA v2.1 terms and adoption FAQ (accessed September 2026)
- GOV.UK – departmental NDA template built on oneNDA v2.1 (accessed September 2026)
- SIGNET specification wiki – Process Layer, Trust Layer, Agent Layer, Foundation Layer, Extensions, Standards Mapping, Governance and Versioning (v0.17.0)

*Concert Foundation is the steward of SIGNET, an open procurement data standard. "SIGNET", "Concert" and "SIGNET Certified" are marks administered by Concert Foundation. oneNDA is a standard administered by its own steward; Concert has no relationship with it beyond the reference made in this paper.*
