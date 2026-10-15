---
title: AI-ready data and SIGNET
kind: position
status: assessment
relatesTo: v0.17.2
claims:
  modelled: none
  tested: none
  certified: none
date: 2026-10-15
supersedes: none
---

# AI-ready data and SIGNET

**A positioning paper from Concert Foundation** · status: assessment · relates to SIGNET v0.17.2

## Summary

The Open Data Institute's *Framework for AI-ready data* (v2, December 2025) sets out twenty-six criteria and sub-criteria, in four pillars, that a dataset should meet before it is handed to an AI practitioner. This paper assesses SIGNET against every one of them.

SIGNET is a data standard, not a dataset, so the question is not whether the standard itself is AI-ready but whether a body of conformant records is AI-ready by construction, and where it is not, whose job the remainder is. On that reading the result is uneven in an informative way. Ten criteria are met by the standard itself, before any publisher does anything. Four are supported in part. Six are the publisher's responsibility and the standard is rightly silent on them. Six are gaps, and they cluster: every one of them concerns the *publication* of a set of records as a dataset, rather than the records themselves. Nothing in SIGNET describes a corpus, licenses it, states who stewards it, declares its data-protection posture, or marks which of its records are synthetic.

The paper proposes closing those gaps with a single non-core artefact, a publication extension, landed spec-first through the ordinary change process. It also notes one respect in which SIGNET goes beyond the framework: where the framework asks a publisher to codify the governance *around* a dataset, SIGNET records the governance *of the actions that produced each record*, as Mandate, Decision, Policy and Consent objects inside the data. The audit log is the data.

Nothing described here is modelled, tested or certified in SIGNET v0.17.2. This is an assessment and a proposal, not a description of shipped coverage.

## 1. Why assess a standard against a dataset framework

The framework was written from the perspective of a data publisher, with the guiding question "what would a user need to know to use this dataset for AI without friction". Its unit of assessment is a dataset. SIGNET's unit of design is a record: a need, a sourcing event, an award, a contract, an order, an invoice, and the events that carry each of them through its lifecycle.

The two meet when records are published in bulk. A procurement authority releasing a year of sourcing events, a market operator releasing anonymised award outcomes, a research group assembling a corpus of contracts: each is a dataset in the framework's sense, and each is made of SIGNET records. The useful assessment is therefore four-way, criterion by criterion:

- **By construction.** Any conformant record meets the criterion because the standard requires it. The publisher inherits the property for free.
- **Supported in part.** The standard carries a primitive that answers part of the criterion, and the remainder is a gap.
- **Publisher's responsibility.** The criterion is about the corpus or the publishing act, not the record, and a data standard should not try to legislate it. SIGNET is silent here on purpose.
- **Gap.** The criterion is about something a standard *could* carry, SIGNET does not carry it, and the publisher has no conformant place to put it.

The paper applies this test to all twenty-six items in §3. It does not score the framework's criteria against each other or weight them.

## 2. The framework in brief

Version 1 was published in May 2025 with three pillars: dataset properties, metadata and surrounding infrastructure. Version 2, published in December 2025, added a fourth pillar, governance, with four criteria, and extended the metadata pillar with update-frequency and access-control items that had surfaced in use. The framework deliberately takes a technical rather than a normative view: it describes the concrete steps that make data usable for AI, not what responsible use would be. Its criteria and the examples attached to them are the framework's own and are cited rather than reproduced here.

The four pillars and their criteria, as numbered in v2:

| Pillar | Criteria |
|---|---|
| 1. Dataset properties | (a) international standards and norms · (b) semantic and logical consistency · (c) identifiable class and source imbalance · (d) de-identification and anonymisation · (e) appropriate file format |
| 2. Metadata | (a) machine-readable metadata format · (b) metadata served with the data · (c) basic technical specifications: (i) modalities, (ii) dimensionality, (iii) update frequency, (iv) semantics, (v) bias, (vi) summary statistics, (vii) synthetic data · (d) supply-chain information: collection, preprocessing, annotation · (e) legal and sociotechnical information: (i) context and original purpose, (ii) licence, (iii) intended access controls, (iv) data-protection declarations |
| 3. Surrounding infrastructure | (a) user-centric portal · (b) API access · (c) version control and monitoring |
| 4. Governance | (a) governance policy-as-code · (b) documented roles and responsibilities · (c) publicly identifiable points of contact · (d) clear data access processes |

## 3. Assessment

The verdict column uses the four terms defined in §1. Where a verdict depends on a specific property of the standard, the evidence column names the artefact. Every such pointer was checked against the `v0.17.2` tree.

### 3.1 Dataset properties

| Criterion | Verdict | Evidence and reasoning |
|---|---|---|
| 1(a) International standards and norms | By construction | SIGNET is expressed in JSON Schema and JSON-LD. Monetary values carry ISO 4217 currency codes by schema pattern, dates are ISO 8601 date-times, units of measure follow UN/ECE Recommendation 20, and classifications reference named schemes such as CPV and UNSPSC (`schema/definitions.schema.json`). The published context (`schema/context.jsonld`) aligns SIGNET terms to the EU eProcurement Ontology, W3C PROV and the W3C Verifiable Credentials vocabulary, and the standard documents its bridges to OCDS, EN 16931 and UBL / Peppol BIS, so a record's semantics trace to a recognised vocabulary rather than an invented one. |
| 1(b) Semantic and logical consistency | By construction | This is the criterion SIGNET was built to satisfy. Enumerated values are bound to closed codelists under `codelists/`, the binding is checked in CI (`conformance/rules/check-codelist-binding.js`), and the state model that governs which transitions a record may make is itself a machine-checked rule (`check-state-model.js`). Two publishers cannot call the same thing by two names and both conform. |
| 1(c) Identifiable class and source imbalance | Publisher's responsibility | Imbalance is a property of a corpus. The standard supports the publisher's work without doing it: `actor` is a required field on every Event, so the source of each record is identifiable, and class membership follows from closed codelist values rather than free text. |
| 1(d) De-identification and anonymisation | Supported in part | The identity extension (`docs/extensions/identity.md`, Working Draft) carries a normative rule that objects and Events in a hash chain MUST NOT contain personal data: person references are pseudonymous identifiers, resolvable only in the identifying organisation's own erasable system of record. So the record is designed to carry no natural person's identity. Organisations remain identified, as a procurement record requires. What is missing is the publication side: no rule for which fields a published *extract* must redact, no way to mark a record as redacted, and no guidance on reading the hash chain across a redaction. |
| 1(e) Appropriate file format | By construction | JSON, with JSON-LD for semantics. The framework's preferred structured formats are tabular; the choice of a graph-capable serialisation reflects the fact that a procurement record is a graph of linked objects, not a row. |

### 3.2 Metadata

| Criterion | Verdict | Evidence and reasoning |
|---|---|---|
| 2(a) Machine-readable metadata format | Gap | The JSON-LD context describes the meaning of each field. Nothing describes a *corpus* of records: there is no dataset-level descriptor in the sense of DCAT or Croissant, and neither vocabulary is referenced anywhere in the tree. A publisher has no conformant way to say "this is a set of 40,000 sourcing events, 2024 to 2026, from these authorities". |
| 2(b) Metadata served with the data | By construction, at record level | Every schema admits an `@context` property and the worked examples carry a reference to the published context, so the semantics travel with the data. Dataset-level metadata cannot travel with the data because it does not exist (2a). |
| 2(c)(i) Modalities | By construction | Records are structured; documents are attached by reference and typed against the `documentType` codelist. The modality of a SIGNET corpus is unambiguous. |
| 2(c)(ii) Dimensionality | Publisher's responsibility | Row and column counts are properties of the extract. |
| 2(c)(iii) Update frequency | Supported in part | At record level the question dissolves: a SIGNET record is event-sourced, so "what changed and when" is the data. At corpus level there is no place to declare a refresh cycle or a change-notification channel. Folded into the extension proposed in §5. |
| 2(c)(iv) Semantics | By construction | Field semantics are in the schema descriptions and the JSON-LD context, and the state model fixes what each status value means. |
| 2(c)(v) Bias | Publisher's responsibility | Bias is a property of a corpus and its collection. The standard neither helps nor hinders. |
| 2(c)(vi) Summary statistics | Publisher's responsibility | As 2(c)(ii). |
| 2(c)(vii) Synthetic data | Gap | SIGNET's own validated example instances are synthetic by convention: every party in them is identified under a reserved `.example` domain, and the naming check enforces that convention. But the convention lives in the Foundation's tooling, not in the record. A corpus that mixed real and synthetic records would have no conformant way to say which is which. |
| 2(d) Supply-chain information | By construction, with one gap | *Collection* is the strongest point in the assessment. The hash-chained Event primitive records who created each record, under what mandate, and in what sequence, and a Provenance block aligned to W3C PROV, the ontology the framework itself cites, records what each assertion was generated by, derived from, and which policies were applied (`generatedBy`, `derivedFrom`, `usedPolicies`). Nothing is bolted on afterwards: provenance is part of the record. *Preprocessing* of a published extract (redaction, filtering, aggregation) is not modelled, which is the same residue as 1(d). *Annotation* in the framework's sense does not arise. |
| 2(e)(i) Context and original purpose | By construction | A procurement record's purpose is intrinsic: a sourcing event exists to source, an award to award. The framework's concern, data collected for one purpose and reused for another, is answered by the record type itself. |
| 2(e)(ii) Licence name, permissions and URL | Gap | The standard's artefacts are dedicated to the public domain under CC0 1.0; a set of records published under it carries no licence, because there is no field for one. |
| 2(e)(iii) Intended access controls | Supported in part | Consent is a first-class object (grantor, grantee, resource, purpose, validity, revocable), and a Document reference carries an `accessGrant` pointing at the Consent that governs it, so "a document exists" and "you may read it" are already separate statements. These were designed for process control, not for stating the access terms of a published dataset, but they are the right primitive and the extension in §5 reuses them rather than adding a parallel mechanism. |
| 2(e)(iv) Data-protection declarations | Gap | The identity extension's no-personal-data rule is a data-protection *design*, with erasure obligations as its stated rationale. A *declaration*, the statement a publisher makes about a corpus, has no field, no codelist and no guidance. |

### 3.3 Surrounding infrastructure

| Criterion | Verdict | Evidence and reasoning |
|---|---|---|
| 3(a) User-centric data portal | Publisher's responsibility | SIGNET specifies data, not the systems that serve it. A portal is an operator's or publisher's product. |
| 3(b) API access | Publisher's responsibility | As 3(a). The standard deliberately does not specify transport, so that any operator can serve conformant records over any interface. |
| 3(c) Version control and monitoring | By construction, at both levels | For the record: `previousEventHash` on every Event forms a tamper-evident chain, and a broken chain is detectable by anyone holding the records. (The hash algorithm is fixed today by the conformance tooling rather than by a schema pattern, recorded as defect D-70; `CP-Auction-Determinism`, registered at v0.17.2, remedies it, with adoption reserved to the Standards Committee.) For the standard: releases are tagged, `check-release-version.js` holds the package, changelog and citation metadata to one version, and a generated inventory with content hashes is produced in CI on every push to `main`, so drift between what the standard says and what it ships is caught mechanically. |

### 3.4 Governance

| Criterion | Verdict | Evidence and reasoning |
|---|---|---|
| 4(a) Governance policy-as-code | By construction, and beyond | The framework asks that data-access, compliance, audit and consent policies be codified in a machine-readable form such as ODRL. SIGNET does this at two levels. In the data, a Policy carries an executable `expression` in a declared `expressionLanguage` (the schema names rego, DMN and CEL as examples) alongside a mandatory `humanReadable` statement of the same rule; a Decision records the `policiesApplied` and the `underMandate` it was taken under; Consent is an object, not a flag; and audit logging is not a policy about the data but a property of it, through the Event chain. In the standard's own governance, every normative rule is enforced by CI rather than by reader attention. The one gap is alignment: there is no published mapping from SIGNET's Policy or Consent to ODRL, so a tool that speaks ODRL cannot yet read a SIGNET policy. |
| 4(b) Documented roles and responsibilities | Supported in part | For the standard itself the roles are documented: a role register (`governance/role-register.md`) defines four practitioner roles with explicit competencies, an interests register records declared conflicts, and an endorsement register records who has endorsed what. None of these defines a steward for a published corpus. The register's Mandate Steward is a different role: it concerns the mandates under which agents act, not the custody of a dataset. |
| 4(c) Publicly identifiable points of contact | Gap | The Foundation publishes a contact address with the standard, and a Party may carry a `contactPoint`, but the steward of a published corpus is not a party to the records in it, and a corpus has no field for its steward's contact. Folded into §5. |
| 4(d) Clear data access processes | Gap, partly answerable | The *decision* to grant access can already be expressed as a Policy and recorded as a Decision. The *process*, with its requirements, criteria and timelines, is prose a publisher must supply, and the extension in §5 gives it a place. |

### 3.5 Tally

| Verdict | Count | Items |
|---|---|---|
| By construction | 10 | 1(a) 1(b) 1(e) 2(b) 2(c)(i) 2(c)(iv) 2(d) 2(e)(i) 3(c) 4(a) |
| Supported in part | 4 | 1(d) 2(c)(iii) 2(e)(iii) 4(b) |
| Publisher's responsibility | 6 | 1(c) 2(c)(ii) 2(c)(v) 2(c)(vi) 3(a) 3(b) |
| Gap | 6 | 2(a) 2(c)(vii) 2(e)(ii) 2(e)(iv) 4(c) 4(d) |

The six gaps, and the residue in each of the four partial verdicts, share one cause. SIGNET models the record and its lifecycle completely and models the published corpus not at all. That is a design choice, and in v0.17.2 it is the right one: a standard that tried to govern publication before it had governed the record would have the problem backwards. But it means a publisher who wants to meet the framework today must bolt a dataset descriptor onto the outside of SIGNET, in some other vocabulary, with no conformance check. The gap is narrow and closable.

## 4. Where SIGNET goes beyond the framework

The framework treats a dataset as inert: it was collected, it is described, it is served. Its governance pillar asks what a user needs to know about the decisions that sit *around* the data.

SIGNET records are not inert. Each one is the product of actions taken by buyers, suppliers and, increasingly, software agents acting on their behalf, and the standard's distinctive contribution, the Agent and Trust layer, records those actions as data. A Mandate states what an agent was permitted to commit to: its permitted capabilities, constraints, approval thresholds, scope and validity. A Decision records what was decided, by whom, under which mandate, on what inputs, applying which policies, with what rationale and outcome, and whether a human approved it. A Policy states the rule that applied, in executable and plain-language form. Consent records that a party agreed, to what, for what purpose, and whether it can be revoked. The governance a user needs to know about is in the record, hash-chained to the events it governed.

This matters for AI-readiness in a way the framework does not yet name. A model trained on procurement data learns from decisions. If the data carries the mandate, policy and consent under which each decision was made, a practitioner can filter, weight or audit by them: train only on decisions taken within mandate, exclude decisions where consent was withdrawn, test whether a policy change moved outcomes. A dataset that records only outcomes cannot support any of that. The framework's own trajectory, from three technical pillars to a fourth on governance, points in this direction, and procurement is a field where the governance of the action and the governance of the data are the same thing.

The Foundation makes no claim that SIGNET's approach should be adopted by the framework. It notes the alignment, and notes that the ODRL mapping identified under 4(a) would make the alignment legible to tools as well as to readers.

## 5. Proposed work

None of the following is registered, modelled, tested or certified. Under the standing rule in `governance/WITHDRAWAL-2026-08.md`, no further change proposals are registered until the Standards Committee is constituted, and the pre-constitution window opened by IAR-0006 expired on 30 September 2026. Each item is therefore held as a position until registration reopens, and would then proceed spec-first, with the normative document landing before any schema.

**P-1. Publication extension.** An extension package, in the sense of `docs/extensions/README.md`, that a publisher applies to a *set* of SIGNET records. It is an extension rather than a profile because a profile carries what a counterparty need not interpret, and a dataset descriptor is exactly what a consumer must interpret. It would define a `Publication` object carrying: licence name, permissions and URL; a data-protection declaration; the steward's contact; update cadence and change-notification channel; a synthetic-data marker at record and corpus level; a redaction declaration naming which fields were de-identified and how the hash chain is to be read across the redaction; and a prose slot for the access process. Where the descriptor's concepts already exist in DCAT or Croissant, the extension would map to them in the JSON-LD context rather than reinvent them. It composes outward from core, referencing records by identifier, because every shipped schema rejects unknown properties. This closes 2(a), 2(c)(vii), 2(e)(ii), 2(e)(iv), 4(c) and 4(d) and the publication residue of 1(d), 2(c)(iii), 2(d) and 2(e)(iii). It is deliberately one artefact: gaps with one cause should have one fix.

**P-2. ODRL alignment note.** A non-normative mapping from SIGNET's Policy and Consent objects to ODRL, published under `docs/`, so that governance tooling that reads ODRL can read a SIGNET policy. If the mapping holds cleanly it may later become a context alignment; if it does not, the note records where and why.

**P-3. Corpus steward role.** One addition to the practitioner role register, defining the steward for a published corpus, distinct from the existing Mandate Steward. This is a governance change and is reserved to the Standards Committee.

**P-4. Mark the Foundation's own example corpus as synthetic in the record.** The example instances should carry the synthetic marker from P-1 as its first use, so that the `.example` convention becomes data rather than tooling. Until P-1 lands, the examples directory should say so in prose.

P-1 is the substantive item. P-2 and P-4 are small and could proceed independently. P-3 waits for the Committee.

## 6. What this paper does not claim

- It does not claim that SIGNET, or any SIGNET corpus, *is* AI-ready. The framework assesses datasets; no dataset has been assessed; "by construction" is an argument about what a conformant record carries, not a result. "AI-ready" is an assessment-shaped phrase of exactly the kind the Foundation's mark grammar prohibits as a property of SIGNET, and the paper never uses it that way.
- It does not claim that the framework has been applied by its authors to SIGNET, or that the Open Data Institute has reviewed or endorsed this paper. The assessment is the Foundation's own.
- It does not claim any of the proposed work exists. In v0.17.2 there is no publication extension, no dataset descriptor, no licence field on a record set, no synthetic marker, no redaction rule, no corpus steward role and no ODRL mapping.
- It does not propose changes to any core object. Every shipped schema is closed; the extension composes outward from them.

## 7. Declined alternatives

- **Assert "AI-ready" as a property of the standard.** Declined. It would conflate the three statements the Foundation keeps apart: modelled, tested, certified. The framework is a test; nothing has been tested. The mark grammar's prohibition on assessment-shaped claims applies.
- **Submit SIGNET to the Open Data Institute for assessment.** Out of scope for a positioning paper. If the Foundation seeks that, it would be a separate step with its own record, and the gaps in §3 would be closed first.
- **Close the gaps in core objects.** Declined. Core schemas reject unknown properties by design, and publication concerns belong to the publisher's act, not the record. An extension is the right shape.
- **Call P-1 a profile.** Declined. In SIGNET a profile carries implementation-internal matter a counterparty need not interpret; a publication descriptor is consumer-facing by definition.
- **Assess against the ODI's enterprise framework instead.** Declined for now. That framework concerns one organisation's data architecture; SIGNET records cross organisational boundaries by definition. A later paper may take it up.
- **Separate change proposals for each gap.** Declined. One cause, one artefact; splitting would produce several descriptors that each need the others.

## References

- Open Data Institute (2025). *A framework for AI-ready data*. Report, May 2025, updated with version 2, December 2025. DOI: 10.61557/ODEX6433. https://theodi.org/insights/reports/a-framework-for-ai-ready-data/
- Open Data Institute (2025). *Bringing governance into the ODI framework for AI-ready data*. Blog, December 2025. https://theodi.org/news-and-events/blog/bringing-governance-into-the-odi-framework-for-ai-ready-data/
- Concert Foundation. *SIGNET specification*, v0.17.2. https://concert.foundation/standard
- Concert Foundation. `docs/extensions/README.md`, `docs/extensions/identity.md`, `docs/profile-authoring.md`, `governance/role-register.md`, `governance/mark-grammar.md`, in `concerthq/signet-standard` at `v0.17.2`.
- Concert Foundation. *oneNDA and SIGNET*. Positioning paper, September 2026. https://concert.foundation/standard/positions/onenda-and-signet
