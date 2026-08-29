# IAR-0003 — Interim approval record: closed codelists enforced in schema

| Field | Value |
|---|---|
| **Record** | IAR-0003 · **Date** 2026-08-20 · **Baseline** v0.15.0 |
| **Authority** | Bootstrap clause. No Standards Committee is constituted. |
| **Comment period** | 14 calendar days from the pull request being marked ready. **Not waived.** |
| **Reversal risk** | `low` (see `governance/REVERSAL-RISK.md`) |
| **Closes** | D-14 |
| **Ratifies** | Nothing. Landing is not ratification. |

> **Status as at 2026-08-21 — not landed.** This record's pull request has never been opened, so
> its comment period has never started and the change it approves is not in the tree. `schema/`
> carries no generated enum at any bound property: `procedure`, `decisionType`, `partyRole` and
> `documentType` fail `check-codelist-binding.js`, and `identifierScheme` is a recorded deferral
> pending D-20. **D-14 is therefore not closed**, and the "Closes" field above states what this
> record would close on landing, not what it has closed. The v0.16.0 CHANGELOG entry said this
> enforcement had landed; that claim is corrected in the entry and recorded as D-30. The record
> below is unaltered — it states what was decided, and is not rewritten after the fact.
>
> **Correction, 2026-08-29 (D-43).** The first sentence of this status block is false, and was
> false when written. This record's pull request **was** opened — #43, 2026-08-21T00:26Z, the same
> day — and has since been approved. Its comment period therefore started on 2026-08-21 and did
> not "never start". The sentence is left standing above rather than edited, per this record's own
> rule; this note is the correction. The same claim appears at `CHANGELOG.md` line 97 and in the
> premise of the amendment below. The structural cause — that no verification route in this
> repository can see forge state, so the three assertions were authored from each other rather
> than from the forge — is recorded as **D-43**.
>
> The rest of the status block was accurate when written and is superseded by this pull request
> itself: the generated constraints **are** in the tree as of the amendment below, and
> `check-codelist-binding.js` passes. `identifierScheme` remains a recorded deferral pending D-20.
>
> **The comment period restarts from this amendment's ready-for-review date.** A substantive
> amendment landed mid-period and post-approval does not inherit the eight days already elapsed.

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

---

# Amendment — the shape of the generated constraint (D-39)

**Folded into this record on 2026-08-29, before it merged.** The constraint this amendment governs
has not landed on `main`, C-4 has not been decided by side effect, and this pull request is
unmerged — which is the fact the ordering constraint always rested on. The amendment's own stated
premise, that this record's pull request had never been opened, is false and is corrected in the
status block above (D-43); the reasoning below is unaffected by that correction, because it turns
on what the generator emits, not on when the pull request opened.

Sourced from the constitution pack's `IAR-0003-amendment-generator-shape.md`, which does not land
separately — this section is the record. **Decides:** D-39. **Touches:**
`conformance/rules/check-codelist-binding.js` `--write` output and the bound properties in
`schema/`.

## The question

`check-codelist-binding.js --write` regenerates the schema constraint from the CSV. A bare `enum`
rejects every value not in the core list — including the prefixed extension values that
CP-EventType-Closure §2.4 requires `eventType` to accept and that CP-Codelist-Enforcement leaves
open for every other list as gate C-4. Whichever shape the generator emits **decides C-4 by
default** for `procedure`, `decisionType`, `partyRole` and `documentType`. A decision taken by
generator shape is the class of un-minuted decision this process exists to prevent.

## Resolution

1. The generator emits, at each bound property of a closed codelist:
   ```json
   "anyOf": [
     { "enum": [ "…codes from the CSV…" ] },
     { "type": "string", "pattern": "^[a-z][a-z0-9-]*:[A-Za-z][A-Za-z0-9.]*$" }
   ]
   ```
   A value is a core code verbatim, or it carries a prefix per the CP-Extension-Composition Part 1
   grammar. This resolves C-4 in the same direction §2.4 resolves it for `eventType`, as one
   mechanism rather than two.
2. **The harness, not the schema, polices the prefix** (consistent with CP-Extension-Composition
   §2.3): `signet:` and `concert:` are refused; a prefix that names a published extension MUST
   resolve to that extension's codelist file for the bound list; any other prefix is a private
   value — permitted, unconstrained, never certifiable.
3. **Reservation rule (D-37):** every prefix appearing in a core code of any closed codelist is
   reserved (today `gleif`, `gs1`, from `identifierScheme.csv`). An extension id MUST NOT equal a
   reserved prefix. Enforced in the same harness rule.
4. `identifierScheme` remains a recorded deferral pending D-20 and is not bound by this amendment.
5. The IAR-0003 fixtures gain the §2.4 quartet for one bound list: unprefixed-unknown rejected;
   prefixed-private validates; reserved-prefix refused by the harness; extension-prefixed resolves
   against the extension's codelist.

## Declined alternative

**Bare `enum`, extension values deferred to the v1.0 train.** Declined: it forecloses §2.4 for four
lists inside a defect-correction whose stated purpose is enforcement, not vocabulary policy; it
makes `decisionType: qualification` the last extension-contributed value any list can ever take
before v1.0; and reopening it later means regenerating normative schema a second time for a
decision that was available now. If the Committee prefers the bare enum, the generator change is
one line — the reversal path is stated, which is what `REVERSAL-RISK.md` asks of an interim act.

## Reversal risk

`low` — the anyOf's second branch is purely permissive at schema level; removing it narrows, and
any instance relying on it was doing so under the stated extension rules.

## What landed with this amendment

`check-codelist-binding.js` now emits `anyOf: [{enum}, {pattern}]` at every bound property and
**fails a bare enum**, so the shape cannot silently regress. Five properties were regenerated:
`procedure`, `decisionType`, `partyRole`, `documentType`, `positionStatus`.

Two of the §5 quartet ship as fixtures, both being facts the schema itself decides:
`conformance/fixtures/invalid/decision-decisiontype-unknown.json` — an unprefixed unknown value is
still rejected, because the `anyOf` widens the shape and not the vocabulary — and
`conformance/fixtures/valid/decision-decisiontype-private-prefix.json`, a prefixed private value
that validates where the bare enum rejected it.

⛔ **Gate D39-1 — the other two of the quartet are not shippable yet.** "Reserved-prefix refused by
the harness" and "extension-prefixed resolves against the extension's codelist" both require a
harness rule that polices prefixes **in values**. The rule that exists — `findReservedProperties`,
driving `reservedPrefixNegative` — inspects property *names*. Resolution against an extension's
codelist also needs the layout that gate **E-4** decides, and no in-tree extension currently
publishes a codelist for a bound core list. Recorded rather than faked: a fixture asserting a rule
that does not run asserts nothing.

---

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
