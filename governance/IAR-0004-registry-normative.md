# IAR-0004 — Interim approval record: the transition registry becomes the normative record for lifecycle vocabularies

| Field | Value |
|---|---|
| **Record** | IAR-0004 · **Date** 2026-08-20 · **Baseline** v0.15.0 |
| **Authority** | Bootstrap clause. No Standards Committee is constituted. |
| **Comment period** | 14 calendar days from the pull request being marked ready. **Not waived.** |
| **Reversal risk** | `medium` — a design choice among defensible alternatives; the losing option is recorded below |
| **Closes** | D-18 |
| **Ratifies** | Nothing. Landing is not ratification. |

## The defect

`docs/state-model.md` §11 D-1 says that where two records of one relationship exist, one is
authoritative and the other is generated from it, and that a second hand-maintained copy is a
defect rather than redundancy.

Lifecycle state vocabularies existed twice — as a schema `enum` and as registry `states` — with CI
asserting they **agreed** rather than one being **generated** from the other. The rule was
violated by the artifact that states it, which is the same shape as D-15.

Found while resolving D-13, which was the same defect one level down.

## The change

The registry is the record. `check-state-model.js --write` generates
`<schema>/properties/<stateField>` from the declared states; run without `--write` it fails on
drift. C15 fails if a schema location is claimed by both the registry and a closed codelist.

R-1 — relations are not states — now lints the **registry**, since that is where states are
authored. Previously it linted the schema, which under generation would have been the wrong
surface: a relation-valued name would have been silently overwritten rather than caught.

Generation applies only where the registry declares states. `OnboardingCase`,
`SupplierQualification` and `HedgeProposal` are declared lifecycle-bearing and not yet modelled;
their vocabularies are untouched.

## Why this is Tier 2

Not for the mechanism, which is tooling. **For the promotion.**

`state-model/state-model.json` was published at v0.15.0 as informative. A normative schema enum
generated from an informative artifact is incoherent — the derived thing cannot carry more
authority than its source. So the registry becomes the normative record for every lifecycle
vocabulary it declares.

Consequences, taken with it:

- `state-model/state-model.json` gains `CODEOWNERS` protection, on the `eventTypeCore.csv` pattern.
- A change to a declared state is a Tier 2 act whether made in the schema or in the registry.
  Editing the registry is no longer a lighter-weight route to the same change.
- The `modelled: false` declarations remain informative — they declare an absence, not a vocabulary.

**Breaking:** no. Generated output is identical to current schema content except for `Bid`, already
corrected under IAR-0002, and enum ordering, which carries no semantics in JSON Schema.

## Rejected alternative

**Amend §11 to permit mechanically-asserted agreement between two hand-maintained records.**
Defensible: CI catches drift either way, and it avoids promoting an artifact's status.

Rejected because it weakens the rule at exactly the point the rule was written for. Asserted
agreement means two authors can each make a locally correct edit and CI reports a conflict with no
rule for which wins — which is D-4 again, one level down. Generation answers "which governs"
structurally rather than procedurally, and that has been the consistent preference throughout.

Recorded so it is not re-proposed as the lighter option without new argument.

## Interests

Arises from an implementer enquiry signed by the same natural person who operates both stewardship
identities. The defect is verifiable against `state-model/state-model.json` and `schema/` by any
reader who has not seen the enquiry: the two records exist and neither generates the other.
