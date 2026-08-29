# SIGNET CDM — Requirements Extension v0.1
**Extension id:** `requirements` · **Status:** Working Draft (spec; schemas to follow) · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Extends:** Process/Agent layers; reuses Policy, Decision, Event, Submission, Evaluation, Obligation, SourcingEvent.
**Separately-namespaced.** Alters no core object's `required` set or `additionalProperties` semantics.

## 1. Motivation

The model carries what was offered (`Submission`), how it was scored (`Evaluation`), what was
awarded (`Award`) and what was promised (`Obligation`). It does not carry what was **asked**.
Requirements enter as documents (`documentType: specification`) and leave the model as prose in
`Obligation.description`. Between those two points nothing is addressable: a supplier cannot
state a position on a specific requirement, a score cannot name the criterion it scored, and an
obligation cannot say which requirement it descends from.

Every implementer therefore reconstructs the same three joins privately — requirement to
criterion, response to requirement, obligation to requirement — and each reconstruction is
incompatible with the next. That is the asymmetry a shared vocabulary exists to remove. A
deploying implementer's scope enquiry (SE-0001) supplied the evidence.

## 2. Design principles

- **D1 — One statement, two readers.** A requirement's `statement.text` is the normative
  human-readable form and is mandatory, mirroring `Policy.humanReadable`. Decomposed fields are
  optional and never displace the text.
- **D2 — Authored once, referenced everywhere.** A `Requirement` is a versioned, addressable
  object. A `RequirementSet` selects requirement versions for a `SourcingEvent`; selection is the
  derivation. Nothing is copied.
- **D3 — Departures are decisions.** A set that binds a parameter outside a requirement's
  default, or lowers its obligation level, records a `varies` relation whose `authority` is a
  `Decision`. Silent variance is unrepresentable.
- **D4 — Core gains sockets, not knowledge.** The three core additions this extension relies on
  (§7) are typed by scheme-qualified `Identifier` and say nothing about requirements. A core-only
  reader validates an extended instance unchanged.
- **D5 — Content is the implementer's.** This extension defines shape. No sector vocabulary, no
  requirement library and no verification method list ships with it.

## 3. New objects

**`Requirement`** — id; version (semver); status (`draft` | `active` | `retired`, registry-
generated); title?; statement {text (MANDATORY); pattern?; precondition?; trigger?; state?;
condition?; feature?; actor?; response?}; parameters? {name → {dataType, default?, constraint?,
unit?}}; obligationLevel (`mandatory` | `desirable` | `informational`); verification? {method
(sector-defined string), cadence?, description?}; classification?; additionalClassifications?;
relations[]?; provenance?.

**`RequirementSet`** — id; sourcingEvent; lot?; status (`draft` | `issued` | `withdrawn`,
registry-generated); title?; requirements[] {ref, version, parameters? (bound values; keys MUST
be declared by the referenced version), obligationLevel? (override), relations[]?}; provenance?.
The structured counterpart of the specification document.

**`RequirementRelation`** (definition) — relationType; target? + targetVersion? (a Requirement);
criterion? (a `CriterionRef`, §7); authority? (a Decision; REQUIRED for `varies`); note?.
Exactly one of `target` or `criterion`, decided by the type.

Events (open `eventType` today; prefixed per the composition grammar once closed):
`requirement.drafted`, `requirement.activated`, `requirement.retired`, `requirement.superseded`
(annotation, payload `supersededBy`), `requirementSet.drafted`, `requirementSet.issued`,
`requirementSet.withdrawn`, `requirementSet.varied` (annotation).

## 4. Relations (closed codelist `requirementRelationType`)

| Relation | From → to | Answers |
|---|---|---|
| `derivesFrom` | Requirement version → Requirement version | Where did this come from, and has the source changed since? |
| `varies` | Requirement or set entry → Requirement version, under `authority` | What was altered, and on whose authority? |
| `testedBy` | Requirement → `CriterionRef` | Is every mandatory requirement assessed? |

`supersedes` and `dependsOn` are withheld pending implementation evidence. Supersession is a
relation, not a state (state model R-1): the annotation event carries `supersededBy` and the
successor carries `derivesFrom`. Whether a requirement version is frozen is derived from the
issued sets that reference it (R-3) and is not stored.

## 5. Statement syntax

`statement.pattern`, when declared, names one of five patterns (closed codelist
`statementPattern`): ubiquitous, event-driven, state-driven, unwanted-behaviour, optional-feature.
Each names the decomposed fields it requires; the checker fails a declared pattern whose fields
are absent and passes an undeclared one. Placeholders `{name}` in the text MUST be declared in
`parameters`, and every declared parameter MUST appear. Pattern conformity is recommended;
statement *quality* is guidance, never conformance.

Parameters are declared on the `Requirement` (type, default, constraint) and bound on the
`RequirementSet` entry. A binding outside the declared constraint is a variance (D3).

## 6. Codelists

Closed, shipped with the extension: `obligationLevel` (3), `requirementRelationType` (3),
`statementPattern` (5). Lifecycle vocabularies are not codelists; they are inline enums generated
from the transition registry (state model §11 D-2).

One value contributed to a **core** closed list: `decisionType: variance` — the authority for a
`varies` relation. How an extension contributes a value to a core closed list is gate **C-4** of
CP-Codelist-Enforcement and §2.4 of CP-EventType-Closure (prefixed values). Until C-4 is
resolved this extension's worked example cannot carry a schema-valid authority Decision; see §11.
`verification.method` is deliberately unbound.

## 7. What this extension needs from core

Three additive fields, each a scheme-qualified socket that carries no requirements semantics.
They are **proposed, not shipped**; the draft is held as `CP-Requirement-Sockets` (unregistered
under the standing rule in WITHDRAWAL-2026-08) and the findings are recorded as defects.

| Core addition | Used by |
|---|---|
| `Policy.criteria[]` (`Criterion`: id, title, description?, weight?, parent?), `CriterionRef` (policy + criterion), `Score.criterionRef` | `testedBy`; a score names the criterion it scored |
| `Obligation.provenance` (existing `Provenance` definition) | `derivedFrom` references the requirement as accepted at award |
| `Submission.responses[]` (`Response`: ref, refVersion?, position, qualification?, evidence?) with closed codelist `responsePosition` | a submitting party's position on a referenced requirement |

One field attached **to** a core object by this extension: `SourcingEvent.requirements:set`
(Identifier of the issued `RequirementSet`), so the hash chain covers the specification and not
only the transaction. Attached under the CP-Extension-Composition Part 1 pattern; constrained by
this extension's own field schema, which is what Part 2 exists to make assessable.

## 8. Boundaries (normative)

SIGNET carries requirements as issued, responded to, evaluated and accepted. It does not author
them, verify them, or assess their quality. Tenancy is not modelled here: a set is bound to a
`SourcingEvent` whose `procuringParty` carries market context; if tenancy is modelled it is
modelled for the standard as a whole (CP-Tenancy). Numeric confidence or quality scores are out of
scope; `verification.method` describes an observable process.

## 9. Relationship to other extensions

- **`performance`** — a `Requirement.verification` {method, cadence} states how compliance will
  be established *before award*; a `ServiceLevelPolicy` KPI states how it is measured *after*.
  `Obligation.provenance.derivedFrom` is the bridge. The two must not overlap: this extension
  never carries targets, thresholds or measurement windows.
- **`amendments`** — a variance is a pre-award departure from a requirement as issued; an
  amendment is a post-signature delta to a contract. Different objects, different authorities.
- **`onboarding`** — `decisionType: qualification` was contributed to the core list by an
  in-tree extension; `variance` follows whichever route C-4 settles.

## 10. State model

Two lifecycle-bearing objects, both with market-facing states only (S-4). Registry entries are
drafted with `basis: ext-requirements`, `basisScope: extension`, in the registry's shape:

```
Requirement:    draft → active → retired          (retired terminal, class completion)
RequirementSet: draft → issued → withdrawn        (withdrawn terminal, class abandonment)
```

`requirementSet.issue` is guarded: every entry references a Requirement in status `active`.
Internal workflow (assembly, review, sign-off) belongs in a namespaced profile with a declared
`coreEquivalent`, per §2a.

## 11. Conformance (sketch)

Deterministic checks only. Pattern-required fields present; placeholders declared and used;
codes in codelists; relation shape matches type; `varies` carries `authority`, and where the
Decision is in the corpus it has `decisionType: variance` and lists the varied requirement in
`inputs`; `testedBy.criterion` resolves to a `Criterion` in the referenced Policy; set entries
resolve by ref + version; bound parameter keys are declared; an issued set references only active
requirements; a lowered obligation level carries a `varies` with authority. **Warnings** (never
pass/fail, preserving CN-1): a mandatory requirement with no verification; a mandatory entry in an
issued set with no `testedBy`.

## 12. Honest limits

Conformance with this extension establishes that requirements, responses, scores and obligations
are linked and that departures are attributed. It does not establish that a requirement is well
written, that a response is truthful, that a criterion is a fair test of a requirement, or that
an obligation is being met. Implementations MUST NOT represent conformance as any of those.

## 13. Open gates

⛔ **RQ-1 — Route for `decisionType: variance`.** Prefixed extension value (C-4 / §2.4) or a
core value. A core value `exception` covering variance, waiver and contract variation is the
candidate; `Obligation.status: waived` already exists with no Decision type that could have waived
it.
⛔ **RQ-2 — `sealedProof` × `responses`.** Responses are submission content and MUST NOT appear
in clear before unsealing; whether a conformance rule enforces this or the schema description
suffices.
⛔ **RQ-3 — Supplier-side review** of `Response` and `responsePosition` before schemas ship.

## 14. Declined alternatives

- **Requirements as `Item` or `Document` sub-structure.** Declined: neither is versioned,
  addressable or relatable; both are the containers the gap lives in.
- **Retyping `Score.criterion` to `Identifier`.** Declined: breaking, and a bare Identifier cannot
  address a node inside a Policy. A sibling `criterionRef` string, resolving within the Policy the
  Evaluation already names, is deterministic and additive.
- **A `supersedes` relation and a `superseded` state.** Declined: R-1, and IAR-0002's reasoning
  for `Bid`.
- **Lifecycle vocabularies as CSV codelists.** Declined: state model §11 D-2; D-13.
- **Tenancy fields on `RequirementSet`.** Declined: tenancy is modelled once or not at all.
- **The name `RequirementProfile`.** Declined: `profile` names a certification profile
  (`docs/profiles/`) and a state-model profile (§7) in this repository.

## 15. Attribution

The five statement patterns adapt the Easy Approach to Requirements Syntax (EARS), a writing
convention. The separation of a reusable requirement from an event-specific selection adapts,
structurally only, the catalog/profile layering of NIST OSCAL.
