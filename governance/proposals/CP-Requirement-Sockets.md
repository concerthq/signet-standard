# CP-Requirement-Sockets

**Status:** Draft — not yet balloted. Registered under IAR-0006.
> *Registered pre-constitution under IAR-0006. Registration is not adoption and does not pre-empt the Committee's agenda.*

**Origin:** the steward's implementer-advisory role. **Recusal:** the steward is recused from adoption; recorded at interests register entry 2.
**Affects:** `schema/definitions.schema.json`, `schema/policy.schema.json`, `schema/obligation.schema.json`, `schema/submission.schema.json`, `codelists/`, `codelists/bindings.json`, `conformance/rules/`, `conformance/fixtures/`, `docs/specification.md`, `wiki/Process-Layer.md`, `wiki/Codelists.md`
**Target:** the next v0.x minor after registration
**Breaking:** No — three optional additions; every valid instance remains valid
**Depends on:** none. Independent of CP-Extension-Composition Part 2 and of the `requirements` extension; each addition is justified on its own merits (§1)
**Blocks:** `docs/extensions/requirements.md` moving from "spec only" to "schemas shipped"

---

## 1. Problem statement

Three absences, each a defect in its own right and each independently useful to close:

- **D-34.** A score cannot name the criterion that produced it. `Score.criterion` is an unconstrained string; the criteria live inside `Policy.expression`, which is opaque. Evaluation auditability — the Procurement Act assessment-summary duty and the EU AI Act documentation expectation that the specification already cites — has no addressable criterion to attach to.
- **D-35.** An obligation cannot say where it came from. `Provenance.derivedFrom` exists and is unused on `Obligation`.
- **D-36.** A submitting party cannot state a structured position on an element of what was asked.

None of the three requires the model to know what a requirement is. Each is a scheme-qualified socket.

## 2. Proposal

### 2.1 Criteria addressability

`definitions.schema.json` gains `Criterion` {id, title, description?, weight?, parent?} and `CriterionRef` {policy: Identifier, criterion: string}. `Policy` gains optional `criteria[]` (`policyType: evaluation` only; ids unique; `parent` resolves within the array; no cycles). `Score` gains optional `criterionRef: string`, resolving to a `Criterion.id` in the Policy named by the containing `Evaluation.criteria`. `Score.criterion` is retained; deprecation is a later proposal.

`criterionRef` is a string, not an `Identifier`, because the Evaluation already names exactly one Policy and a bare Identifier cannot address a node inside it without a fragment convention. `CriterionRef` exists for pointers from outside an Evaluation.

### 2.2 Obligation provenance

`Obligation` gains optional `provenance` (`#/definitions/Provenance`). No new vocabulary. `derivedFrom` SHOULD reference the specified, evaluated or accepted elements from which the obligation arose.

### 2.3 Submission responses

`definitions.schema.json` gains `Response` {ref: Identifier, refVersion?, position, qualification?, evidence[]?}. `Submission` gains optional `responses[]`. New closed codelist `responsePosition`: `compliant`, `compliantWithQualification`, `nonCompliant`, `notApplicable`; bound in `codelists/bindings.json` at `definitions.schema.json#/definitions/Response/properties/position`. `qualification` is REQUIRED when `position` is `compliantWithQualification` (harness rule). Where `sealedProof` applies, responses are sealed content.

## 3. Schema changes

Additive only. Patches against the project-workspace copies are attached (`later-patch/core/diffs/01-cp/`); **the live `Obligation` carries `dischargedBy` and the live `Submission` carries `sealedProof`, neither present in those copies, so the patches are guidance and the diff must be regenerated against `schema/` on `main`.** Whether `Criterion`, `CriterionRef` and `Response` carry the Part 1 pattern is gate E-1 material; `Score` is withheld under §2.1 of that CP, which is why `criterionRef` must be core.

## 4. Conformance suite changes

`conformance/rules/check-criteria.js` (attached): CR-1 unique ids; CR-2 parent resolves, no cycles; CR-3 criteria only on `evaluation` policies; CR-4 `criterionRef` resolves; CR-5 every score carries `criterionRef` when the Policy defines criteria; CR-6 weights agree; RP-1 position in codelist; RP-2 qualification present when required. Fixtures: `examples/policy-evaluation-criteria.json`, `examples/evaluation-criterion-ref.json`, `examples/submission-responses.json`, `examples/contract-obligation-provenance.json` (attached; identifiers follow the `did:web:<party>#<local>` convention).

## 5. Backward compatibility

Non-breaking. Every field is optional. `Score.criterion` retained. No re-certification.

## 6. Rejected alternatives

**A — Retype `Score.criterion` to `Identifier`.** Declined: breaking; and see §2.1.
**B — Carry criteria in `Policy.expression`.** Declined: the expression is opaque by design; addressability requires a node.
**C — A `Requirement` object in core.** Declined: D-34..36 close without one; the object is an extension (`docs/extensions/requirements.md`) and promotion is a later question with evidence.
**D — `Obligation.derivedFrom` as a new field.** Declined: `Provenance` already exists; two definitions for one relationship is a D-1 defect.

## 7. Open gates

⛔ **RS-1 — `sealedProof` × `responses`.** Description or harness rule.
⛔ **RS-2 — E-1 scope for the three new definitions.**
⛔ **RS-3 — Supplier-side review of `Response` and `responsePosition`.**

## 8. Documentation changes

`docs/specification.md` (Policy, Score, Obligation, Submission tables); `wiki/Process-Layer.md`; `wiki/Codelists.md` (`responsePosition`). Claim triad: *modelled* only.

## 9. Interests

The proposer's advisor is also the steward and operates both repository identities. Recusal from adoption is requested and is not currently satisfiable (GOVERNANCE.md, Repository identities). Recorded as a process departure; closes on constitution.
