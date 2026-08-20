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
| D-14 | Five closed codelists were `"type": "string"` with the CSV named only in a description; `{"procedure": "banana"}` passed document conformance | `schema/sourcing-event.schema.json` and four others | **Reopened** — was recorded Closed under IAR-0003. The binding manifest and the checker landed at v0.16.0; the generated enums did not, and IAR-0003 has never been opened. Four bindings fail `check-codelist-binding.js` and `identifierScheme` is deferred pending D-20, so all five remain unenforced and any string still validates. Closes when IAR-0003 lands (D-30) |
| D-15 | The transition registry declared 9 of 29 objects while `docs/state-model.md` L-2 requires every object declared. Statelessness by omission is the defect L-2 exists to prevent, reproduced in the artifact that defines it | `state-model/state-model.json` | **Closed** — 29 declared; CI check C12 |
| D-16 | Two core edges rested on a jurisdictional basis with no corroborating general source, which B-1 permitted because it asked only whether a source was external | `state-model/state-model.json` | **Closed** — B-3, CI check C14 |
| D-17 | `conformance/levels.md` GRT-1 is exercised only by endorsement checks not in force | `conformance/levels.md` | Open — recorded by the standard itself |

| D-18 | State vocabularies exist twice — as a schema `enum` and as registry `states` — and CI asserts agreement rather than generating one from the other. `docs/state-model.md` §11 D-1 defines a second hand-maintained copy as a defect, so the rule was violated by the artifact that states it | `state-model/state-model.json`, `schema/*.schema.json` | **Closed** — enum generated from the registry; registry promoted to normative (IAR-0004) |

| D-19 | The rule that Concert names no individual and no commercial implementer has existed since v0.13.0 and is enforced by nothing. The defect is the absent control. No instance of a breach is currently identified in the repository | absence — no check enforced the rule | **Closed** — `conformance/rules/check-naming.js` added and run in CI; the enforcement gap is closed. No breach is asserted |

| D-20 | `Decision.inputs` is documented to hold credentials (`docs/specification.md:409`, `wiki/Agent-Layer.md:113`) and is typed `Identifier[]`. `Identifier.scheme` is closed to six entity-naming codes, none of which names a credential. No value satisfies both, so the specification mandates content the schema cannot express. `Provenance.derivedFrom` has the same shape. `Credential.id` is a bare URI string with no documented mapping to `Identifier` | `schema/decision.schema.json`, `schema/definitions.schema.json#/definitions/Identifier`, `docs/specification.md:409,463` | Open — CDM-level. Present since v0.6.1; invisible until `Identifier.scheme` was constrained under IAR-0003. Not resolvable within IAR-0003; requires its own record and comment period |

| D-21 | Nothing checks that the schema can express what the prose requires. `docs/` and `wiki/` state field contents that the corresponding schema may forbid, and no check compares them. D-20 is one instance and was invisible for ten releases | absence — no check compares documented field contents against schema constraints | Open |

| D-22 | A drafted governance correction was superseded by other means and never closed out. Two records continued to describe it as unapplied. Nothing checks that a drafted correction is either applied or closed | `governance/site-alignment/`, `CHANGELOG.md`, `governance/README.md` | **Closed** — `OUTCOME.md` recorded; records corrected |

| D-23 | The committed Pages artifact `_site/index.html` states version 0.10.0, five releases behind `package.json`. `pages.yml` rebuilds only when `docs/specification.md`, `tools/build-pages.js` or the workflow changes, so a release alone does not regenerate it. A derived artifact that nothing regenerates on the event that invalidates it | `_site/index.html`, `.github/workflows/pages.yml` | Open |

| D-24 | Deleting `codelists/submissionStatus.csv` under IAR-0003 made `concert.foundation/signet/v0.1/codelists/submissionStatus.csv` return 404 — a published `$id`-space URL, proxied from `main` with no cache and no fallback. IAR-0003 asserted the file had no consumer; two existed in `concert-website` and neither was recorded here, so the claim was unfalsifiable from inside this repository | `governance/IAR-0003-codelist-enforcement.md:89`, `codelists/submissionStatus.csv` | **Closed** — restored retired-but-resolvable; IAR-0003 corrected |

| D-25 | `concert-website` built from this repository at `main`, unpinned — roughly eighty build-time fetches and five rewrites proxying the `signet/v0.1/` `$id` namespace. Every merge to `main` published as the standard on the next deploy, including changes still inside an open fourteen-day comment period, and any deletion broke the build cold | `concert-website` `scripts/generate-standard.mjs`, `next.config.mjs` | **Closed** — `concerthq/concert-website#12` merged (`f50ebca`). Both mechanisms pin to `v0.16.0` from one shared constant, `standard-ref.mjs`; neither declares a ref of its own |

| D-26 | Six source comments in `concert-website` and `docs/WEBSITE_BUILD_NOTE.md:17-19` stated the site fetches at a pinned tag. Both mechanisms used `main`. Three records of one decision, two of them wrong. The handoff scoping this work said five comments; there are six, and one of them — "tag below" — was inaccurate in a second way once the constant moved file | `docs/WEBSITE_BUILD_NOTE.md:17-19`, `concert-website` `scripts/generate-standard.mjs`, `next.config.mjs` | **Closed** — `concerthq/concert-website#12` merged (`f50ebca`). Code and comments agree; the one comment that was inaccurate in a second way was corrected with them |

| D-27 | The repository declares no public interface. Roughly eighty paths are consumed by an external build and five rewrites proxy published `$id` URLs, with no manifest and no check that a declared path resolves. A claim that a file has no consumer is therefore not testable from inside this repository | absence — no manifest, no check | **Closed** — `public-interface.json` declares 86 published and 26 consumed paths; `conformance/rules/check-public-interface.js` fails on any absent path and runs in CI |

| D-28 | `codelists/*.csv` admits no comment or metadata line: the workflow lint and `readCodes()` both treat line 1 as the header, so the format cannot record that a file is retired, deprecated or non-authoritative. Disposition is carried only in `codelists/bindings.json`, which a direct consumer of the CSV never sees | `.github/workflows/validate.yml` CSV header lint, `conformance/rules/check-codelists.js` | Open |

| D-29 | `governance/IAR-0005` was merged before its stated fourteen-day comment period elapsed, to restore a published `$id`-space URL returning 404. `GOVERNANCE.md` requires the period before merge for every Tier 2 change and names no urgency exception; the `WITHDRAWAL-2026-08.md` carve-out is an exception to the proposal moratorium and itself requires a stated period. So this is a departure, not an exemption. Recorded per `GOVERNANCE.md:67`. The underlying gap: the process has no route for an urgent correction, so every one becomes a recorded departure | `governance/IAR-0005-published-url-restoration.md`, `GOVERNANCE.md` | Open — closes when `GOVERNANCE.md` gains a carve-out for a defect actively causing harm, adopted under its own Tier 2 route |

| D-30 | The v0.16.0 CHANGELOG claimed closed-codelist enforcement landed. The manifest and checker landed; the generated enums are on the unopened IAR-0003 branch, so five closed codelists remain unenforced in schema and `{"procedure": "banana"}` validates on `main`. `check-codelist-binding.js` was not wired into `validate.yml`, so nothing surfaced the gap. A released record asserted an enforcement not in force. The same claim stood in `governance/defects.md` D-14, `governance/IAR-0003-codelist-enforcement.md` and `docs/state-model.md` | `CHANGELOG.md` v0.16.0, `codelists/bindings.json`, `.github/workflows/validate.yml` | Open — closes when IAR-0003 lands and the enums are generated |

| D-31 | The v0.16.0 CHANGELOG states that promoting `state-model/state-model.json` to normative means the file gains `CODEOWNERS` protection. The generated lifecycle enums did land on `main`; the ownership entry did not. `/state-model/state-model.json` is absent from `.github/CODEOWNERS` on `main`, and present only on `v0.16-iar-0004-registry-normative`, which has not merged. A normative artifact is unprotected while a released entry says it is protected | `.github/CODEOWNERS`, `CHANGELOG.md` v0.16.0, `state-model/state-model.json` | Open — closes when the CODEOWNERS entry lands with IAR-0004 |

## Provenance of D-9 to D-13

Raised by implementer enquiry, verified against v0.15.0 before recording. Recording a defect is
not adoption of any proposed remedy, and none of these was recorded on an implementer's assertion
alone.
