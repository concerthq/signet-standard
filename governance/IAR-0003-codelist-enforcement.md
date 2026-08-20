# IAR-0003 — Interim approval record: closed codelists enforced in schema

| Field | Value |
|---|---|
| **Record** | IAR-0003 · **Date** 2026-08-20 · **Baseline** v0.15.0 |
| **Authority** | Bootstrap clause. No Standards Committee is constituted. |
| **Comment period** | 14 calendar days from the pull request being marked ready. **Not waived.** |
| **Reversal risk** | `low` (see `governance/REVERSAL-RISK.md`) |
| **Closes** | D-14 |
| **Ratifies** | Nothing. Landing is not ratification. |

## The defect

Five closed codelists were bound to schema properties typed `"string"` with the CSV named only in
a description. `{"procedure": "banana"}` validated. A conformance suite that accepts invalid
documents makes every certification claim weaker than it states, and does so invisibly — the
report is identical.

Raised by an implementer who had told their own programme that a wrong vocabulary would have
failed conformance. It would have passed.

This meets the *actively causing harm* carve-out in `governance/WITHDRAWAL-2026-08.md`: the
standing rule parks proposals, not defect corrections.

## The change

`codelists/bindings.json` binds each closed codelist to the schema location whose enum it governs.
`conformance/rules/check-codelist-binding.js` asserts they agree and, with `--write`, regenerates
the enum from the CSV.

Affected: `procedure`, `decisionType`, `partyRole`, `identifierScheme`, `documentType`.
`positionStatus` already carried its enum and is brought under the binding for consistency.

Per the derived-artefact rule (`docs/state-model.md` §11): **the CSV is the record, the enum is
generated.** Two hand-maintained copies of one relationship is how this defect arose.

## Tier and breaking

**Tier 2** — `schema/` is normative. This record is the route.

**Breaking** for any implementation emitting a value outside a closed codelist. Such a document
was already non-conformant; it merely validated. The break makes an existing violation visible
rather than creating a new one. No implementation has been certified.

**Migration.** Run `--write`, then validate the existing corpus. Any document that now fails was
already violating the standard.

## Descoped after drafting: `identifierScheme` deferred (D-20)

This record was drafted to enforce six closed codelists. It delivers **five**:
`procedure`, `decisionType`, `partyRole`, `documentType` and `positionStatus`.
`identifierScheme` is **deferred**, and this record is narrower than drafted as a result.

Generating the enum on `Identifier.scheme` closes the property to six codes — `did`,
`gleif:lei`, `gs1:gln`, `vat`, `companies-house`, `peppol` — every one of which names a legal
entity, a location or a network participant. `docs/specification.md` §6.4 documents
`Decision.inputs` as holding *"The objects considered (submissions, credentials, policies)"*,
and `Provenance.derivedFrom` as holding source objects. There is no code under which a
credential can be named. Enforcing the enum therefore makes a documented specification
requirement unsatisfiable: a conformant document could not record what §6.4 says a `Decision`
records.

That is a CDM question — whether `Identifier` is the right type for a non-entity reference, or
whether the codelist is missing a namespace, or whether the prose overreaches. It is recorded as
**D-20** and is outside the scope of this record, which corrects an enforcement defect and
decides no modelling question. Resolving it needs its own record and its own comment period.

The binding is kept in `codelists/bindings.json` under `deferred`, with the defect id and the
reason, and `check-codelist-binding.js` reports it on every run. It is recorded rather than
omitted so that a codelist closed on paper and unenforced in schema stays visible instead of
reading as an oversight.

## Not included

`eventTypeCore.csv` is not enum-injected. No single property binds it — `Event.eventType` admits
open values too — so it stays enforced by `check-codelists.js`. Recorded so the omission reads as
a decision rather than an oversight.

## Included: deletion of `submissionStatus.csv` (D-13)

`codelists/submissionStatus.csv` duplicated the vocabulary carried inline on `Submission.status`
and was referenced by no schema and marked closed nowhere. **Decided: delete the CSV.** The inline
enum is the single record, which is what every other lifecycle-bearing object already does —
`SourcingEvent`, `Obligation`, `Auction`, `Bid` and the rest carry their vocabularies inline with
no parallel CSV. Retaining both would be the second hand-maintained record that
`docs/state-model.md` §11 defines as a defect.

**Tier: 1.** Closed codelists are normative; this file was referenced by no schema, carried no
closure marker, and had no consumer. Deleting it removes an unreferenced artifact rather than
changing a normative surface. It is recorded here rather than landed silently because a deletion
from `codelists/` should be visible, and because this record is already under a comment period in
which it can be contested.

> **Correction, 2026-08-20.** The claim that this file had no consumer was false.
> `concert-website` fetched it in two places — `scripts/generate-standard.mjs` names it in
> `CODELISTS` and `CLOSED`, and a `next.config.mjs` rewrite served it at
> `concert.foundation/signet/v0.1/codelists/submissionStatus.csv`, a published URL in the `$id`
> namespace. Deleting the file returned 404 to any implementer who had resolved it, and failed the
> site build cold.
>
> No artifact in this repository recorded that consumer, so the claim was **unfalsifiable from
> inside the repository at the time it was written**. That is the defect, recorded as D-24 and
> D-27: the standard declares no public interface, so no check can determine whether a deletion is
> breaking.
>
> The file is restored, retired, and bound to no schema. D-13’s reasoning is unchanged — it is not
> a source of truth. Resolvability and maintenance are different obligations.

`bindings.json` records the deletion under `retired`, and the binding check fails if the file
reappears — a file left behind after a deletion decision is the same defect the decision closed.

## Interests

The enquiry that surfaced this defect originates from a deploying implementer whose platform lead
also holds a role in the stewardship body, and is signed by that person. This is the most acute
instance of the disclosed overlap to date. Accordingly: the enquiry is published verbatim, this
record carries the full comment period with no waiver, and the correction rests on the artifacts —
the defect is verifiable by anyone against `schema/` and `codelists/` without reference to the
enquiry.
