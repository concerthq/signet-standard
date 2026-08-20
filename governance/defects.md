# SIGNET defect register

**Status:** Tier 1 governance record · **Asserts facts, adopts nothing**
**Baseline:** v0.15.0 · **Supersedes:** the defect table in `governance/WITHDRAWAL-2026-08.md`

A defect is a fact about a current artifact, verifiable against the tree. It carries no gate and
needs no resolution to be recorded. Remedies are separate; a defect may sit open indefinitely
without prejudice.

Promoted out of the withdrawal record so that record stops accreting and this becomes the single
index.

| # | Defect | Verifiable at | State |
|---|---|---|---|
| D-1 | `Mandate` asserts a lifecycle it can record on no surface | `schema/mandate.schema.json`, `codelists/eventTypeCore.csv` | **Closed** — v0.15.0 registry + S-1..S-3 |
| D-2 | No artifact maps events to state changes; §1.7 and GRT-1 not executable | absence | **Closed** — v0.15.0 registry |
| D-3 | `sourcingEvent.published` names a state absent from the enum | `codelists/eventType.csv` | **Closed** — rebound to `planned → active` |
| D-4 | No rule states which surface governs where stored `status` and the event stream disagree | `governance/proposals/README.md` | **Closed** — S-2, S-3 |
| D-5 | `Bid.status` carries `superseded`, a relation, which no event can project | `schema/bid.schema.json` | **Closed** — IAR-0002 |
| D-6 | `eventType` has nine codes for eighteen objects; nothing past `contract.signed` | `codelists/eventType.csv` | Open |
| D-7 | `Mandate.scope` is required and unconstrained; `{}` satisfies it | `schema/mandate.schema.json` | Open |
| D-8 | A relying party without stream access cannot determine whether a mandate is effective | `schema/approval.schema.json` vs `schema/mandate.schema.json` | Open |
| D-9 | Erasure versus the hash chain is unaddressed outside the `identity` extension's person-reference rule | `conformance/levels.md`, `docs/extensions/identity.md` | **In progress** — generalising the no-PII rule to core |
| D-10 | No object carries a supersession reference; only `Policy` carries `version`. Subject identity across supersession decides whether the per-subject chain continues or forks | 29 schemas | Open |
| D-11 | No distinction between an actor entitled to request a transition and one entitled to effect it; `Mandate.grantedBy` is singular with no delegation reference | `schema/mandate.schema.json`, `schema/event.schema.json` | Open — request/perform partly answered by the registry |
| D-12 | Every inter-object reference is an untyped `Identifier`. `Contract.award` may reference a `Party` and pass C-DOC | `schema/definitions.schema.json` | Open |
| D-13 | `codelists/submissionStatus.csv` duplicates the inline enum on `Submission.status` and is referenced by no schema — two records of one relationship | `codelists/submissionStatus.csv` | **Closed** — CSV deleted; the inline enum is the single record (IAR-0003) |
| D-14 | Five closed codelists were `"type": "string"` with the CSV named only in a description; `{"procedure": "banana"}` passed document conformance | `schema/sourcing-event.schema.json` and four others | **Closed** — IAR-0003 |
| D-15 | The transition registry declared 9 of 29 objects while `docs/state-model.md` L-2 requires every object declared. Statelessness by omission is the defect L-2 exists to prevent, reproduced in the artifact that defines it | `state-model/state-model.json` | **Closed** — 29 declared; CI check C12 |
| D-16 | Two core edges rested on a jurisdictional basis with no corroborating general source, which B-1 permitted because it asked only whether a source was external | `state-model/state-model.json` | **Closed** — B-3, CI check C14 |
| D-17 | `conformance/levels.md` GRT-1 is exercised only by endorsement checks not in force | `conformance/levels.md` | Open — recorded by the standard itself |

| D-18 | State vocabularies exist twice — as a schema `enum` and as registry `states` — and CI asserts agreement rather than generating one from the other. `docs/state-model.md` §11 D-1 defines a second hand-maintained copy as a defect, so the rule was violated by the artifact that states it | `state-model/state-model.json`, `schema/*.schema.json` | **Closed** — enum generated from the registry; registry promoted to normative (IAR-0004) |

| D-19 | The rule that Concert names no individual and no commercial implementer has existed since v0.13.0 and is enforced by nothing. The defect is the absent control. No instance of a breach is currently identified in the repository | absence — no check enforced the rule | **Closed** — `conformance/rules/check-naming.js` added and run in CI; the enforcement gap is closed. No breach is asserted |

| D-20 | `Decision.inputs` is documented to hold credentials (`docs/specification.md:409`, `wiki/Agent-Layer.md:113`) and is typed `Identifier[]`. `Identifier.scheme` is closed to six entity-naming codes, none of which names a credential. No value satisfies both, so the specification mandates content the schema cannot express. `Provenance.derivedFrom` has the same shape. `Credential.id` is a bare URI string with no documented mapping to `Identifier` | `schema/decision.schema.json`, `schema/definitions.schema.json#/definitions/Identifier`, `docs/specification.md:409,463` | Open — CDM-level. Present since v0.6.1; invisible until `Identifier.scheme` was constrained under IAR-0003. Not resolvable within IAR-0003; requires its own record and comment period |

| D-21 | Nothing checks that the schema can express what the prose requires. `docs/` and `wiki/` state field contents that the corresponding schema may forbid, and no check compares them. D-20 is one instance and was invisible for ten releases | absence — no check compares documented field contents against schema constraints | Open |

## Provenance of D-9 to D-13

Raised by implementer enquiry, verified against v0.15.0 before recording. Recording a defect is
not adoption of any proposed remedy, and none of these was recorded on an implementer's assertion
alone.
