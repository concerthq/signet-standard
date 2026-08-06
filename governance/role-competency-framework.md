# SIGNET Role & Competency Framework

**Status:** Working Draft — non-normative. Gates resolved as interim resolutions (§8).
**Version:** v0.1 (draft, not yet balloted)
**Applies to:** CDM v0.1, conformance suite v0.1
**Steward:** Concert Foundation
**Licence:** CC0-1.0
**Normative counterpart:** the [role register](role-register.md) (§8 R-G4). Assessment and appeals:
[person assessment](person-assessment.md).

> This document defines **what a person must be able to do** to work with SIGNET, stated by
> reference to the normative artifacts. It does not define how an organisation should run an
> adoption programme, how it should be staffed, or in what sequence it should proceed. Those
> are matters for implementers and their chosen providers.

---

## 1. Design rules

Three rules constrain everything below.

**R1 — The boundary test.** A competency belongs in this framework if, and only if, it can be
stated by reference to a normative artifact: a JSON Schema in `schema/`, a closed codelist, a
conformance requirement in `conformance/levels.md`, or the neutrality rules CN-1…CN-4. If a
competency only makes sense inside a particular delivery method, tooling stack, or programme
structure, it is out of scope.

**R2 — Domains are the atomic unit; roles are compositions.** The framework defines
**competency domains** traced to artifacts. **Roles** are named bundles of domains. Domains are
the vocabulary and are intended to be stable. Roles are recombinable, so operators and
providers can compose job shapes appropriate to their context without fragmenting the
underlying terms. This is the same discipline applied to the core model: keep the primitives
lean, allow composition at the edges.

**R3 — Assessment mode is declared, not assumed.** Every domain states whether it is
**artifact-scored** (a candidate produces artifacts whose correctness is decided mechanically,
consistent with CN-1) or **reviewer-judged** (correctness requires human assessment). Where a
domain is reviewer-judged, this document says so plainly rather than implying an objectivity the
standard cannot deliver.

---

## 2. Competency domains

| ID | Domain | Normative anchor | Conformance requirement | Assessment mode |
|----|--------|------------------|-------------------------|-----------------|
| **D1** | Document Conformance | `schema/*.schema.json`; `fixtures/invalid/` | C-DOC | Artifact-scored |
| **D2** | Event Integrity | `event.schema.json` | C-EVT | Artifact-scored |
| **D3** | Provenance | `definitions.schema.json#Provenance` | C-PROV | Artifact-scored |
| **D4** | Policy Expression | `policy.schema.json` | F-SEM (partial) | **Mixed** |
| **D5** | Decision Accountability | `decision.schema.json`; `mandate.schema.json` | F-SEM (partial) | **Mixed** |
| **D6** | Semantic Interoperability | EN 16931 / UBL / Peppol BIS 3.0 mappings | F-MAP | Artifact-scored |
| **D7** | Consent & Data Sovereignty | `consent.schema.json` | **None — see §6** | Reviewer-judged |

Four of seven domains are fully artifact-scored. Two are mixed. One has no conformance anchor at
all. That distribution is the central input to the person-certification design decision (§8, G1):
the standard can assess most of this surface mechanically, and the residue is precisely where
subjective judgement would enter a body whose implementation-certification credibility rests on
CN-1.

---

## 3. Domain detail

### D1 — Document Conformance
*Anchor: the shipped schemas. Requirement: C-DOC.*

The holder can:

- Construct instances of any CDM object that validate against the published schema for a
  declared version.
- Explain why an instance is rejected, given that most objects set `additionalProperties: false`
  — unknown fields are refused, not silently dropped.
- Apply the precedence rule: schema, then prose specification, then wiki. Where the wiki and the
  schema disagree, the schema governs.
- Distinguish **document** conformance (structural, CDM §13.1) from **implementation**
  conformance (behavioural, §13.2), and state that only implementations are certified.
- Work from the negative fixtures: a document that must be rejected is as much a test of
  understanding as one that must pass.

*Assessment:* candidate submits instances; validation decides. Fully mechanical.

### D2 — Event Integrity
*Anchor: `event.schema.json`. Requirement: C-EVT.*

The holder can:

- Emit an `Event` carrying the required `id`, `eventType`, `subject`, `actor`, `timestamp`, and
  `provenance` for every material change.
- Chain events correctly via `previousEventHash`, and explain what tampering the chain detects
  and what it does not.
- Treat the ordered event stream as the system of record and derive current object state as a
  projection of it, rather than treating a mutable record as authoritative with events as a
  side-effect log.
- Recognise that `eventType` draws on an **open** codelist, and understand the governance
  consequence: open values may be extended freely, closed ones may not.

*Assessment:* candidate produces a stream; the harness verifies chaining and tamper detection.
Fully mechanical.

### D3 — Provenance
*Anchor: `definitions.schema.json#Provenance`. Requirement: C-PROV.*

The holder can:

- Populate `generatedBy` and `generatedAt` on every `Event` and every `Decision`, and populate
  `derivedFrom` and `usedPolicies` where applicable.
- Explain the difference between an assertion and its origin, and why the model carries the
  origin as data rather than as metadata about a record.
- Trace an assertion back through `derivedFrom` to its sources.

*Assessment:* presence and structure are mechanical.

### D4 — Policy Expression
*Anchor: `policy.schema.json`. Requirement: F-SEM (partial).*

The holder can:

- Author a `Policy` carrying all required fields: `policyType`, `expressionLanguage`,
  `expression`, `humanReadable`, `version`, `issuedBy`.
- Select the correct `policyType` from the closed enum — `eligibility`, `evaluation`,
  `approval`, `constraint`, `compliance` — and justify the selection.
- Write an executable rule and a plain-language statement of **the same rule**, in a form a
  non-technical reviewer or an auditor can check.
- Version a policy such that a `Decision` citing it remains interpretable after the policy
  changes.

**The assessment limit, stated plainly.** F-SEM checks that both `expression` and `humanReadable`
are *present*. No machine check establishes that they *mean the same thing*. A policy whose plain
language misdescribes its executable rule passes conformance. This is the single largest
reviewer-judged surface in the framework, and it is load-bearing: the dual-form requirement is
the mechanism by which rules-as-code remains auditable by people. Assessing it requires a human.

*Assessment:* mixed. Executability and structure are mechanical; semantic fidelity between the
two forms is reviewer-judged.

### D5 — Decision Accountability
*Anchor: `decision.schema.json`, `mandate.schema.json`. Requirement: F-SEM (partial).*

The holder can:

- Produce a `Decision` carrying the required `decisionType`, `madeBy`, `rationale`, `outcome`,
  and `provenance`, and populate `underMandate`, `inputs`, `policiesApplied`, and
  `humanApproval` where the decision was taken under delegated authority.
- Author a `Mandate` with `permittedCapabilities`, `scope`, and — where authority is bounded —
  `constraints` (policy references acting as hard limits) and `approvalThresholds` (policy
  references acting as human-in-the-loop conditions), distinguishing correctly between the two.
- Explain that `madeBy` may reference a human or a synthetic agent, and that the record shape
  does not change between them. Accountability is symmetric.
- Read a decision trail as an auditor would: who decided, under what authority, from what
  inputs, applying which policies, with what stated reasoning, and with what human approval.
- State the current limitation that `Decision.outcome` is an untyped object, and its consequence
  for machine comparison of outcomes across implementations.

*Assessment:* mixed. Field presence and policy citation are mechanical; the adequacy of a
`rationale` is reviewer-judged.

### D6 — Semantic Interoperability
*Anchor: the normative standards mappings. Requirement: F-MAP.*

The holder can:

- Project a CDM `Invoice` to Peppol BIS Billing 3.0 (EN 16931) UBL without loss of mapped
  Business Terms, and reconcile totals.
- Trace a BT/BG annotation through the schema, including the Draft-07 `allOf` wrapping that
  preserves annotations alongside a `$ref`.
- Locate the boundary between SIGNET's domain and adjacent trade-data standards, and identify
  the objects at which they meet.
- Apply the three-tier claim discipline when describing a relationship to another standard —
  normative mapping, architectural alignment, or compliance enablement — and not overstate.

*Assessment:* mapping fidelity and reconciliation are mechanical.

### D7 — Consent & Data Sovereignty
*Anchor: `consent.schema.json`. Requirement: none.*

The holder can:

- Author a `Consent` carrying all required fields: `grantor`, `grantee`, `resource`, `purpose`,
  `validity`, `revocable`.
- Apply the separation the model draws between the assertion that a `Document` exists and the
  right to read it, via `Document.accessGrant`.
- Model revocation, and reason about what revocation does and does not undo in an append-only
  system.
- Reason about selective disclosure — proving a claim from a `Credential` without disclosing the
  whole credential — in a sealed or selective-disclosure bidding context.

*Assessment:* reviewer-judged in full. See §6.

---

## 4. Roles

Roles are **non-normative bundles**. An operator may compose others; these are the four the
artifacts most clearly support. Names below are settled by §8 R-G3 and carried into the normative
[role register](role-register.md); they are unrenameable once the first mark issues.

| Role | Domains | Locus |
|------|---------|-------|
| **Conformance Engineer** | D1, D2, D3, D6 | Implementer side |
| **Policy Author** | D4, D1 | Buyer / governance side |
| **Mandate Steward** | D5, D4, D7 | Buyer / governance side |
| **Decision Reviewer** | D2, D3, D5 | Audit, second-line risk, regulator |

**Conformance Engineer.** Builds and maintains the adapter exposing `createObject`,
`applyChange`, `getEvents`, and `projectInvoiceToUBL`; runs the public suite; produces a report
conforming to `report-schema.json`; owns the certification submission. This is the role whose
work is most nearly fully machine-assessable.

**Policy Author.** Converts organisational rules into `Policy` objects in dual form. The scarce
combination is drafting discipline plus a rules language (`rego`, `dmn`, `cel`); most
organisations currently hold these two capabilities in different functions.

**Mandate Steward.** Grants and bounds the authority of synthetic agents: what an agent may do,
inside what scope, against what hard limits, above what threshold a human must approve. Most
organisations have no existing role that maps to this. It is the genuinely new one.

**Decision Reviewer.** Reads the trail rather than producing it: verifies chains, checks
provenance completeness, assesses whether a stated rationale supports its outcome, and confirms
that decisions taken under a mandate stayed inside it. Deliberately separated from the producing
roles.

**Foundations** — the model's shape, the four layers, the precedence rule, the governance
structure — is a **prerequisite assessment, not a role, and confers no mark**. Granting it one
would begin the badge inflation this structure exists to resist.

---

## 5. Credential structure

Credentials follow the existing conformance convention: **qualified by both versions**, e.g.
*Conformance Engineer — CDM v0.1, suite v0.1*. A new CDM **major** version requires
revalidation. Minor and patch updates that add or clarify do not invalidate a held credential but
may apply at renewal.

Where fees are charged, they are published and identical for all candidates and all accredited
providers. Consistent with CN-3, a candidate pays to be assessed, not to pass.

Syllabus and exam blueprint are published. Courseware is not. Any accredited provider may build
its own materials against the published syllabus; no provider's materials become the reference.

---

## 6. Two findings from grounding this against the schemas

**F1 — `Consent` has no conformance requirement.** The suite tests C-DOC, C-EVT, C-PROV, F-MAP,
and F-SEM. None of them exercises consent behaviour. `Consent` is therefore structurally
validated as a document (C-DOC) but its *use* — that access is actually gated by a grant, that
revocation takes effect, that `Document.accessGrant` is honoured — is not assessed at any level.
Data sovereignty is stated as a principle and modelled as data, but it is not certified. D7 is
consequently reviewer-judged in full, and any claim that certification covers data sovereignty
would overstate what the suite establishes.

**F2 — Mandate enforcement is demonstrated but not certified.** The agent demonstration proves
that a value exceeding a mandate's autonomous ceiling forces human approval, and CI runs it on
every commit. But no conformance requirement obliges a certified implementation to enforce
mandate constraints or approval thresholds. F-SEM requires that decisions *cite* their policies;
it does not require that the limits were *applied*. An implementation that records
`policiesApplied` while ignoring the thresholds those policies express can reach Full.

Both findings point the same way: the strongest governance claims in the model rest on requirements
the suite does not test.

**Both are being closed.** CP-Mandate-enforcement defines the `E-MDT` endorsement and
CP-Consent-revocation defines `E-CNS`, both depending on CP-Grant-lifecycle. Until those carry,
D5 and D7 remain partly unanchored, and no credential built on this framework may assert more than
the suite establishes.

---

## 7. Deliberately excluded

The following are outside this framework and belong to operators, providers, or adopting
organisations:

- Transformation programme roles, cadences, and planning structures.
- Adoption sequencing and migration planning beyond the conformance-anchored progression.
- Organisational design, team topology, and reporting lines.
- Maturity models expressed in anything other than conformance levels.
- Platform-specific or tooling-specific enablement.
- Coaching, consulting, and change management.

Publishing any of these under Concert's name would convert a standard into a method, and would
make the framework's role definitions contingent on one way of working.

---

## 8. Resolutions

Four gates, resolved as interim resolutions under the bootstrap clause.

**R-G1 — Issuance and assessment.** *Concert issues; accredited providers assess.*

The gate assumed a conflict with CN-1 that does not survive inspection. CN-1 governs
**implementation certification** — no subjective judgement contributes to a pass or fail.
Registering a person is a different act, and holding it to CN-1 is a category error. The honest
response is to declare the difference rather than engineer around it: person assessment includes
reviewer judgement, the rubric and blueprint are published, and an appeals route exists.

The mark grammar already prevents the two claims bleeding into one another through distinct head
terms, which was the substance of the original worry.

Division of labour:

- **Accredited providers** conduct assessment against the published blueprint and attest a pass.
- **Machine-scored components** are submitted directly to Concert.
- **Concert** maintains the register and issues the mark.

Concert never delivers training. The register remains authoritative.

**R-G2 — F1 and F2.** *Close both.* Endorsements are additive and optional: Core and Full are
untouched, nobody is blocked from certifying, and an unearned endorsement is inert. Documenting the
gaps as scope limits instead would retire the claim that distinguishes SIGNET from standards that
do documents and transformations only, and would make the positioning correction urgent rather than
tidy-up. See §6.

*If scope must be reduced, defer F1 rather than F2.* They need not resolve together. `E-MDT` is the
differentiating claim and is fully testable; `E-CNS` is thinner, already narrowed by its scope
limit, and more easily walked back in copy.

**R-G3 — Role and domain naming.** *Three ratified, one renamed.*

**`Assurance Reviewer` becomes `Decision Reviewer`.** "Assurance" is load-bearing vocabulary in the
audit profession — ISAE 3000 and equivalents — and a Concert-issued *Assurance* credential could be
read as qualifying the holder to give an assurance opinion. That is a claim Concert cannot support
and should not imply. The replacement is accurate to what the role does, and makes three of four
roles anchored to primitives: Policy Author, Mandate Steward, Decision Reviewer, with Conformance
Engineer anchored to the suite.

Domain names D1–D7 are descriptive labels that do not travel into mark strings. Ratified as
drafted.

**R-G4 — Normative status.** *Split.*

This framework is **non-normative**, so role composition can evolve without a revision process, and
its domain-to-artifact traces inherit authority from the artifacts they cite.

The **role register** is **normative**. It governs mark strings exactly as the endorsement register
does, and inherits the same mechanics: closed, append-only, admission only through the Standards
Committee, entries citing the domains they bundle.

---

## 9. Traceability

Every competency in §3 traces to a required field, a closed enum, a conformance requirement, or a
neutrality rule in the published artifacts. Where a competency has no such anchor, this document
says so (§6). Should the schemas change, this framework is regenerated from them — it is
derivative of the normative artifacts, never a parallel source of truth.
