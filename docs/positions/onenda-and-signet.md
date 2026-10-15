---
title: oneNDA and SIGNET
kind: position
status: proposal
relatesTo: v0.17.2
claims:
  modelled: none
  tested: none
  certified: none
date: 2026-10-15
supersedes: 2026-09-12 edition of this paper
---

# oneNDA and SIGNET

**A positioning paper from Concert Foundation** · status: proposal · relates to SIGNET v0.17.2

## Summary

Almost every sourcing exercise begins with a non-disclosure agreement. A buyer cannot share a specification, a supplier cannot share a price book, and neither can share a roadmap until confidentiality is settled. Yet none of the standards SIGNET bridges, OCDS, eForms, UBL, EN 16931 or ePO, has a place for the NDA. It sits before the tender, in the gap the lifecycle vocabularies leave open.

oneNDA is an open, community-drafted mutual NDA whose body is fixed and whose only negotiable terms are a short list of cover-page variables. That shape is unusually well matched to SIGNET. A contract with a fixed body and a handful of variables is, in SIGNET's terms, a document with a stable hash and a small, machine-checkable set of fields. The negotiation collapses to the variables; the variables are data; and data is what a SIGNET Policy can evaluate, what a Mandate can bound, and what an Event chain can record.

This paper sets out how oneNDA aligns with SIGNET's design principles and where it would land in the model, as an extension that composes outward from core without touching a core object or a closed codelist. To be explicit about what is and is not claimed: **SIGNET does not currently model an NDA.** There is no agreement object, no `nda` document type and no confidentiality event in v0.17.2. What follows is a proposed extension, offered for comment, not a description of shipped coverage.

This edition replaces the paper first published on 12 September 2026. Every claim about the standard was re-checked against the `v0.17.2` tree; the corrections are listed in §8.

---

## 1. The gap: confidentiality has no home in the lifecycle standards

SIGNET's process layer follows the five OCDS stages, planning, tender, award, contract and implementation, and every process object projects to one of them. That is deliberate: reuse before invention is the first design principle.

The NDA does not fit the pattern. It is agreed before or during the tender stage, it is a contract in its own right but not the contract the tender leads to, and it governs information rather than goods or services. OCDS records tender documents; it does not record the terms on which a supplier was allowed to read them. eForms notices publish what is being bought; they do not publish the confidentiality basis on which detail is released to shortlisted bidders. EN 16931 and UBL do not start until there is an order or an invoice.

In practice this means the NDA is handled outside the data. It lives in a contract-management system, an email thread or a signature platform, and the sourcing record contains at most a checkbox or a filename. For a human-run process that is tolerable. For a governed, agent-native network it is not: a synthetic agent instructed to release a specification to a supplier has no structured way to establish that the supplier is bound, on what terms, for how long, and under which law.

SIGNET already has the components that surround this gap. `Document` carries a `hash` and an `accessGrant`. `Consent` records who may access which resource, for what purpose, for how long, and whether the grant is revocable. `Policy` expresses eligibility as an executable `expression` with a mandatory `humanReadable` twin. What is missing is the object those components should refer to: the confidentiality agreement itself, in a form that can be checked rather than merely attached.

---

## 2. What oneNDA is

oneNDA is a crowd-sourced, open-source mutual non-disclosure agreement created by the legal community and free to use. Version 1 was released in August 2021; version 2 followed in March 2022 in response to community feedback, and the published text in use is version 2.1. The initiative is administered by Law Insider, which hosts the terms, the cover page, the adopter directory and a family of sibling standards (a unilateral variant, an M&A rider, oneSaaS and oneDPA). On the steward's own figures, several thousand organisations have adopted it, and a UK Government departmental NDA template published on GOV.UK is built on oneNDA v2.1.

Three features matter for SIGNET.

**The body is fixed.** The steward's rule is that the variables can be amended and negotiated but the body of the agreement must not be. If the body is changed, the document can no longer be called oneNDA and the brand assets may not be used. The terms are ten short clauses covering the definition of confidential information, permitted receivers, the receiver's obligations, duration and termination, and boilerplate.

**The variables are few and enumerable.** The cover page carries the parties' details and signatories plus four negotiable terms: Purpose, Confidentiality Period, Governing Law and Dispute Resolution Method. Dispute resolution is itself a two-way choice, litigation in named courts or arbitration at a named seat. The effective date was deliberately excluded as a variable; the agreement is perpetual until terminated on thirty days' notice, and the confidentiality period runs from the date each item of information is disclosed. A published "graveyard document" records every clause the community considered and rejected, with reasons.

**It can be incorporated by reference.** The steward publishes the terms at a stable URL and states that a party may use its own cover page and incorporate the body by linking to that URL. The agreement is therefore already a pointer plus a set of values, before SIGNET does anything with it.

The licence displayed on onenda.org is Creative Commons Attribution-NoDerivatives 4.0. The no-derivatives reading is the one consistent with the fixed-body rule, and adopters should confirm the current licence with the steward.

oneNDA is not without critics. Contract-drafting specialists have argued the text is competent rather than exemplary, and jurisdiction-specific practitioners note that data-protection and alternative-dispute-resolution detail must be handled separately. Neither objection bears on the question this paper asks, which is whether a fixed-body, variables-only NDA is the right *shape* for a data standard to profile. It is.

---

## 3. Alignment with SIGNET's design principles

The principles are those of `docs/specification.md` §1, numbered as there.

| Principle | How oneNDA aligns |
|---|---|
| **1.1 Reuse before invention** | SIGNET does not draft an NDA. It profiles one that already exists, is already adopted, and is already maintained by a steward with a published version history. |
| **1.2 Standards as profiles, not forks** | The extension references oneNDA by URL, version and hash. It does not embed, restate or modify the text. The fixed-body rule and the no-derivatives licence are respected by construction: SIGNET carries the pointer and the variables, never a copy. |
| **1.3 Agent-native by construction** | Because the body is fixed, the only decisions in an NDA negotiation are the four variables. That is a decision space small enough to express as a Policy, bound by a Mandate, and record as a Decision. A synthetic agent can be permitted to execute a oneNDA only where governing law is in an allowed set and the confidentiality period is within a ceiling, and be required to escalate anything else. |
| **1.4 Identity is decentralised** | The parties on the cover page are SIGNET `Party` objects with DID, LEI or company-register identifiers. An executed NDA can be issued as a Verifiable Credential the supplier holds and presents across buyers. |
| **1.5 Data sovereignty is explicit** | The NDA is the legal instrument; `Consent` is the data instrument. A tender `Document` whose `accessGrant` points at a Consent whose `purpose` mirrors the NDA's Purpose gives the network a single answer to "may this supplier read this file, and on what legal basis?" |
| **1.6 Policy is data** | "No submission is admissible from a supplier without an executed NDA covering this event's purpose" is an `eligibility` Policy: one `expression`, one `humanReadable` statement, evaluated the same way by an auditor and an agent. |
| **1.7 Events are immutable** | Execution, amendment of variables by written agreement, and termination are material changes. Each becomes an append-only, hash-chained `Event`. The fixed body means the hash of the terms is itself an integrity check: a document that claims to be oneNDA v2.1 but hashes differently is not oneNDA. |
| **1.8 Linked-data foundation** | Incorporation by reference is already a URI pattern. The extension's context can map its terms to ePO where equivalents exist (contracting parties, governing law) and leave the rest under the extension namespace. |

The correspondence is close enough that oneNDA reads as if it had been designed for a data standard to consume. It was not; it was designed to stop lawyers redlining boilerplate. The two goals converge because both depend on the same move: separate what varies from what does not, and make what varies small.

---

## 4. Where it lands in the model

The proposal is an extension in the sense of `docs/specification.md` §11 and `docs/extensions/README.md`: a published, versioned package adding object types, fields and codelist values under its own namespace, without redefining or removing anything in core. Core conformance is unaffected; the extension is conformance-assessed separately. Everything in this section is a proposal for the extension's normative document, which lands first; schemas follow it.

One structural fact governs the whole design. Every shipped schema in v0.17.2 declares `additionalProperties: false`, so nothing can be added to `SourcingEvent`, `Submission`, `Consent` or any other core object. Composition therefore runs in one direction only: the new object references core objects by identifier, and core objects never reference it. Where the first edition of this paper said an agreement is "referenced from the event", that was the wrong way round, and §8 records the correction.

### 4.1 A `ConfidentialityAgreement` object

The object is standard-agnostic by design. oneNDA is the profiled default, not a hard-coded assumption, so the same object can carry a buyer's own template where one is required.

| Field | Type | Card. | Definition |
|---|---|---|---|
| `id` | Identifier | 1 | Agreement identifier. |
| `parties` | Identifier[] | 2..* | The contracting parties, as `Party` references. oneNDA v2 supports multi-party execution. |
| `terms` | object | 1 | The fixed body: `standard` (e.g. `oneNDA`), `version` (e.g. `2.1`), `url` (the published terms), `hash` (content hash of the body at that version). |
| `purpose` | string | 1 | The oneNDA Purpose variable. |
| `confidentialityPeriod` | Period | 1 | The Confidentiality Period variable, expressed as `durationInDays` only (it runs from each disclosure, per the terms). |
| `governingLaw` | string | 1 | The Governing Law variable, as an ISO 3166 country or subdivision code. |
| `disputeResolution` | object | 1 | `method` (`litigation` or `arbitration`) plus `forum` (the named courts or the arbitral seat). |
| `noticeAddresses` | object[] | 2..* | Per-party `party` (Identifier) and `email` for formal notices, as the terms require. Core defines no contact block (`Party.contactPoint` is an untyped object), so the extension defines this one. |
| `executions` | Identifier[] | 0..* | References to `Approval` objects (identity extension) recording each signatory's verifiable approval. Signatories are never named in the record; see rule R-3. |
| `executedAt` | date-time | 0..1 | Date of execution. |
| `status` | string | 1 | `draft`, `executed`, `terminated`. |
| `documents` | Document[] | 0..* | The executed instrument, with `hash`. |
| `relatedSourcingEvents` | Identifier[] | 0..* | The sourcing events this agreement covers. |
| `consents` | Identifier[] | 0..* | The `Consent` grants issued under this agreement. |

Three rules follow and would be enforced by CI, not by reader attention.

- **R-1, registered hash.** Where `terms.standard` is `oneNDA`, `terms.hash` MUST match the registered hash for `terms.version`; a mismatch is a validation failure, because the document is by definition not oneNDA.
- **R-2, duration not dates.** `confidentialityPeriod` carries `durationInDays` only, never `startDate` or `endDate`, because the period runs from each disclosure and there is no single start.
- **R-3, no personal data.** The identity extension's rule for hash-anchored records applies: signatories are referenced through pseudonymous identifiers and `Approval` objects, never by name, and `noticeAddresses` carry role addresses, not individuals'. The agreement therefore stays erasable-by-design while the chain stays intact.

### 4.2 Codelist additions, and which lists can take them

In v0.17.2 `codelists/bindings.json` divides the codelists into closed and open. `eventType` and `credentialType` are open: values may be added by pull request. `documentType` and `decisionType` are closed: a new value is a normative change under change control. The first version of the extension is designed to touch only open lists.

- `eventType` (open): add `nda.executed`, `nda.varied` (written amendment of a variable) and `nda.terminated`, following the `consent.*` and `mandate.*` pattern already in the core list.
- `credentialType` (open): add `confidentialityAgreement`, so an executed oneNDA can be collected by the onboarding extension like any other credential.
- `documentType` (closed): the executed instrument is typed `signedContract`, which it is; the `ConfidentialityAgreement` object supplies the semantics. A dedicated `nda` value is deferred to the Committee as a later closed-list change.
- `decisionType` (closed): the admissibility check uses the existing `admissibility` value, and an agent's decision to execute is recorded under the existing `approval` policy type with its mandate. A dedicated `ndaExecution` value is likewise deferred.

### 4.3 Where it attaches

**SourcingEvent.** The agreement carries `relatedSourcingEvents`; the event is not changed. The event's existing `eligibilityCriteria` may carry a Policy requiring an executed agreement. Restricted and competitive-flexible procedures, where detailed documents are released only to a selected list, are the immediate case.

**Submission.** Admissibility is evaluated against the eligibility Policy. A `Decision` of type `admissibility` records that the NDA check was performed, by whom, under which mandate, and against which agreement, through its `inputs`.

**Document and Consent.** Tender documents released under NDA carry an `accessGrant` to a Consent whose `grantee` is the supplier, whose `purpose` matches the agreement's Purpose, and whose `validity` is bounded by the confidentiality period. Consent is closed, so it cannot name the agreement; the agreement names the Consent through `consents`. The chain is still closed, read from the agreement outward.

**OnboardingCase and SupplierQualification.** The onboarding extension collects `requiredCredentialTypes` into `collectedCredentials` and produces a durable qualification. An executed oneNDA issued as a Verifiable Credential of type `confidentialityAgreement` fits that mechanism without change. Because the body is fixed, the credential need only assert the standard, version, parties and variables to be complete, and because `SupplierQualification` is designed to be portable, a supplier could present it across buyers in a federated market.

**Mandate.** A buyer that lets a synthetic agent execute NDAs grants a Mandate whose `permittedCapabilities` include `execute.nda` and whose `constraints`, which in core are references to Policy objects, point at policies limiting `terms.standard` to `oneNDA`, `governingLaw` to an allowed set and `confidentialityPeriod` to a ceiling, with `approvalThresholds` routing anything outside those bounds to a human. This is the three-guarantee pattern of the agent layer, bounded authority, accountable action, auditable rules, applied to the first document in the sourcing lifecycle rather than the last.

### 4.4 A worked eligibility Policy

The expression is evaluated over the set of agreements whose `relatedSourcingEvents` include the event under evaluation, which is how an implementation finds them given that the event cannot list them.

```json
{
  "type": "Policy",
  "id": { "scheme": "did", "id": "did:web:buyer.example#policy-nda-required" },
  "policyType": "eligibility",
  "expressionLanguage": "cel",
  "expression": "agreements.exists(a, a.status == 'executed' && a.terms.standard == 'oneNDA' && sourcingEvent.id in a.relatedSourcingEvents && submission.submittingParty in a.parties && sourcingEvent.procuringParty in a.parties)",
  "humanReadable": "A submission is admissible only if an executed oneNDA between the procuring party and the submitting party is recorded against this sourcing event.",
  "version": "1.1",
  "issuedBy": { "scheme": "did", "id": "did:web:buyer.example" }
}
```

Every field above is one the core Policy schema requires. The same rule governs the agent that screens submissions and is the rule an auditor reads. That is the dual requirement the Policy object exists to enforce.

---

## 5. What this proposal does not do

**It does not embed oneNDA.** SIGNET carries a reference to the published terms, a version and a hash. The text stays where its steward publishes it. This respects the fixed-body rule, the licence and the steward's naming conditions.

**It does not give legal advice.** oneNDA was drafted by lawyers qualified in English, Californian and Australian law; the steward recommends local advice for other governing laws. Whether oneNDA is suitable for a given procurement is the adopter's question. SIGNET's contribution is that, whichever NDA is used, the answer is recorded as data.

**It does not cover personal data.** oneNDA is explicit that data-protection obligations are handled separately; the steward publishes oneDPA for that purpose. A `ConfidentialityAgreement` is not a data-processing agreement and the extension should not be read as one. Rule R-3 is about the record's own hygiene, not about the parties' data-protection obligations to each other.

**It does not create a relationship between Concert and the oneNDA steward.** Concert profiles open standards; it holds no preferential relationship with any of their stewards, exactly as it holds none with any operator. oneNDA is referenced here on the same footing as OCDS, EN 16931 or UBL.

**It does not claim coverage.** Nothing in this paper is *modelled*, *tested* or *certified* in SIGNET v0.17.2. It is a proposal. Those three words are used with care throughout Concert's work and this paper does not earn any of them yet.

---

## 6. Route to adoption

The standing rule in `governance/WITHDRAWAL-2026-08.md` is that no further change proposals are registered until the Standards Committee is constituted, with a single carve-out for defects actively causing harm. The pre-constitution registration window opened by IAR-0006 expired on 30 September 2026. This paper is therefore a position, held until the Committee opens registration, and it does not register anything.

When registration opens, the extension would follow the published contribution path: a change proposal citing this paper as its problem statement, a normative document under `docs/extensions/` defining the object, fields and open-codelist values under a dedicated namespace, at least one validated example instance, a conformance rule for R-1 to R-3, and a pull request that passes CI. The normative document lands before any schema.

Three questions are open and are recorded here rather than resolved:

1. **Registered hashes.** Who publishes the canonical hash for each oneNDA version: Concert, in a conformance rule, or the steward? Concert can compute and publish it; a steward-published hash would be stronger. The declined alternative is to skip the hash and trust the version string, which reintroduces the problem the hash solves.
2. **Credential issuance.** Whether the executed-NDA credential is self-issued by the buyer, issued by a signature platform, or issued by a `certifier` Party is an implementation choice the extension should leave open, as the onboarding extension does for its credential types.
3. **Scope of the first version.** Mutual oneNDA only, or the unilateral and M&A variants too? The recommendation is mutual only, with `terms.standard` left open so the others can follow without a schema change.

Comments are welcome through the standard repository. Adopters who already use oneNDA and would be willing to validate a draft instance against real sourcing events are particularly invited to say so.

---

## 7. Declined alternatives

- **Embed the oneNDA text in the record.** Declined: breaks the fixed-body rule and the licence, and makes the hash pointless.
- **Add an `agreements` field to `SourcingEvent`.** Declined: core objects are closed, and composition runs outward from extensions by design.
- **Model the NDA as an ordinary `Contract`.** Declined: a Contract is the outcome of a tender and carries `value`, `period` and `obligations`; an NDA governs information, has no value and precedes the tender. Overloading the object would blur the OCDS stage mapping.
- **Express the confidentiality period as a date range.** Declined: the period runs from each disclosure; a range would assert a start date the terms do not have.
- **Add `nda` and `ndaExecution` to the closed codelists in version 1.** Declined for now: the extension can ship against open lists alone, and closed-list changes belong to the Committee.
- **Name signatories in the record.** Declined: contradicts the identity extension's no-personal-data rule and reintroduces the erasure problem the rule exists to solve.

---

## 8. Corrections from the first edition

This edition replaces the 12 September 2026 paper. Checked against `v0.17.2`:

- The example instance's `@context` URL was wrong. The published context is `https://concert.foundation/signet/v0.1/context.jsonld`; an extension carries its own context alongside it.
- `noticeAddresses` was typed `ContactPoint[]`. No such block exists in `definitions.schema.json`; the field is now an extension-defined object.
- `Mandate.constraints` are references to Policy objects, not inline limits; §4.3 now says so.
- "A confidentiality agreement is referenced from the event" and "the Consent references the agreement" reversed the only direction composition can run; §4 now runs outward from the agreement.
- `documentType` and `decisionType` are closed codelists; version 1 no longer proposes values on them.
- §6 described registration under the bootstrap clause as open. The standing rule closes it until the Committee is constituted, and IAR-0006 has expired.
- Rule R-3 and the `executions` field are new, following the identity extension's no-personal-data rule, which the first edition did not consider.

---

## Appendix A. Example instance (illustrative, not validated)

```json
{
  "@context": [
    "https://concert.foundation/signet/v0.1/context.jsonld",
    "https://concert.foundation/signet/ext/confidentiality/v0.1/context.jsonld"
  ],
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
    { "party": { "scheme": "did", "id": "did:web:buyer.example" }, "email": "legal@buyer.example" },
    { "party": { "scheme": "did", "id": "did:web:supplier.example" }, "email": "contracts@supplier.example" }
  ],
  "executions": [
    { "scheme": "did", "id": "did:web:buyer.example#approval-2026-0412-b" },
    { "scheme": "did", "id": "did:web:supplier.example#approval-2026-0412-s" }
  ],
  "executedAt": "2026-09-01T10:14:00Z",
  "status": "executed",
  "documents": [
    { "id": "doc-nda-1", "documentType": "signedContract", "title": "Executed oneNDA v2.1", "hash": "sha256:<executed instrument hash>" }
  ],
  "relatedSourcingEvents": [
    { "scheme": "did", "id": "did:web:buyer.example#SE-2026-0412" }
  ],
  "consents": [
    { "scheme": "did", "id": "did:web:buyer.example#consent-2026-0412-supplier" }
  ]
}
```

The extension context URL above is illustrative; the extension's normative document fixes it.

## Appendix B. Sources

- oneNDA, onenda.org: home, versions, FAQ, cover page, core principles and graveyard document (accessed September and October 2026)
- Law Insider Standards Hub: oneNDA v2.1 terms and adoption FAQ (accessed September 2026)
- GOV.UK: departmental NDA template built on oneNDA v2.1 (accessed September 2026)
- `concerthq/signet-standard` at `v0.17.2`: `docs/specification.md` §1, §11; `docs/extensions/README.md`; `docs/extensions/identity.md`; `codelists/bindings.json`; `schema/*.schema.json`; `governance/WITHDRAWAL-2026-08.md`; `governance/IAR-0006-registration-window.md`

*Concert Foundation is the steward of SIGNET, an open procurement data standard. "SIGNET", "Concert" and "SIGNET Certified" are marks administered by Concert Foundation. oneNDA is a standard administered by its own steward; Concert has no relationship with it beyond the reference made in this paper.*
