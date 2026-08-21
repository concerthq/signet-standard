# SIGNET state model — surface authority and the transition registry

**Status:** Working Draft · **Steward:** Concert Foundation · **Licence:** CC0 1.0
**Applies to:** the core CDM (all layers) and every extension declaring a lifecycle-bearing object.
**Adds:** no object, no field. One generalised rule, one machine-readable registry, one CI check.

---

## 1. What this fixes

Design principle §1.7 says the current state of any object is the projection of its ordered
Event stream. `conformance/levels.md` GRT-1 says the same thing normatively for grant-type
objects: withdrawal of a `Consent` or a `Mandate` MUST be an appended event, and the object
MUST NOT be mutated in place.

Neither is executable. Projecting a stream into a state requires a mapping from events to
state changes, and no artifact publishes one. So:

- **`Mandate` asserts a lifecycle it cannot record.** `mandate.granted` and `mandate.revoked`
  are closed, normative event codes. The object carries `validity` and nothing else. A
  verifier reading the stream and a verifier reading the object disagree about whether an
  agent may act, and nothing in the standard says which is right.
- **`sourcingEvent.published` names a state that does not exist.** The enum has `planned` and
  `active`. The intended edge is inferable and has been inferred independently by every reader.
- **Nine objects carry a state field and one rule governs none of them.** Where a stored
  `status` and an event stream disagree, the standard is silent — which is the stated reason
  status fields on `Consent` were rejected: *duplicates state that design principle 1.7 defines
  as an event projection, with no rule for which governs on disagreement.*

This document supplies the missing rule and the missing mapping. It adds no field to any
object, so it does not reopen that rejection; it closes the gap the rejection identified.

---

## 2. Surface authority (normative)

**S-1.** The current state of an object is the projection of its ordered Event stream.

**S-2.** Where an object carries a stored state value, that value is the **assertion of the
party that serialised it**, as at `provenance.generatedAt`. It MUST equal the projection of
that object's event stream at that instant.

**S-3.** Between parties that hold the stream, the projection governs. A party that does not
hold the stream relies on the assertion, and relies on it as a statement about
`provenance.generatedAt` — not about the instant of reading.

S-2 and S-3 generalise GRT-1 from grant-type objects to all objects. GRT-1 is unchanged and
remains the specific case.

### Why the field is not removed

Under S-1 alone the stored field looks redundant. It is not. **C-DOC is a wire contract**, and
a counterparty receiving a serialised object holds the document and nothing else; no part of
this specification obliges a sender to grant stream access. Removing the value would leave
that recipient unable to determine state at all. The field is an assertion at the boundary,
not a cache — and S-2 is what makes it accountable, by anchoring it to an instant and to an
identified asserting party through `Provenance`.

### 2a. What CDM `status` covers (normative)

**S-4.** A core state vocabulary describes the **market-facing lifecycle** of an object: what a
counterparty can observe and must be able to interpret. It does not describe a party's internal
governance — assembly, review, return for rework, internal approval against an authority
threshold.

This is not a new decision. It follows from the basis rule at §6: every core edge must be
justified from OCDS, the Procurement Act procedures, UBL / EN 16931 or ePO, and **none of those
instruments models a buyer's internal review**. An internal-governance edge cannot satisfy B-1,
so core status is market-facing by construction. §2a states out loud what the basis rule already
entails.

Internal workflow belongs in a namespaced profile, with each profile state declaring the core
state it projects onto (§7). A buyer whose internal vocabulary runs
`draft → assembled → in_review → returned → approved → issued` projects the first five onto
`planned` and the last onto `active`. Both models are correct; they describe different things.

The corollary is worth stating because implementers reach for it: **an implementation MUST NOT
extend a core state vocabulary to carry internal workflow.** Core vocabularies are closed. The
profile mechanism is the supported route and it is not a workaround.

---

## 3. Which objects have a lifecycle

**L-1.** An object has a lifecycle if and only if (a) its state can change after creation while
it remains the same object, and (b) some party's permitted actions depend on which state it is
in. Otherwise it is a record: superseded, never transitioned.

**L-2.** Every object is declared in the registry as lifecycle-bearing or not. Statelessness by
omission is a defect; statelessness by declaration is a decision with a rationale.

`ExposurePosition.positionStatus` is the instructive case. `hedged | floating | markToMarket`
classifies what a position **is**; reconciliation arithmetic depends on it as a category, no
party's permitted actions depend on it as a stage. It fails L-1 and is declared non-lifecycle.

---

## 4. The registry

`state-model/state-model.json` holds three kinds of entry.

| Kind | Meaning |
|---|---|
| `creation` | Object created into an initial state. Exactly one per lifecycle-bearing object. |
| `transition` | A move from one or more source states to a target state. |
| `annotation` | An event appended to an object without changing its state. |

Each state declares `terminal`, `appendable` (`none` \| `annotation` \| `any`), and — where
terminal — a `class` of `completion`, `abandonment` or `revocation`.

`appendable` is the generic basis for write guards, expressed in the terms the event model
already uses: there is no in-place mutation to permit or forbid, so the question is what the
stream will still accept.

**Determinism.** An event code may serve several entries, provided their `from` sets are
disjoint. Given a current state and an incoming event, exactly one entry applies. CI enforces
this; without it, projection is not a function.

### 4a. Which kind is which

The test is what the object itself looks like afterwards.

| Question | Kind |
|---|---|
| Does something exist that did not exist before? | `creation` |
| Does **this object's own state** differ afterwards? | `transition` |
| Is a fact recorded *about* the object — including its relation to another object — with its own state unchanged? | `annotation` |

A relation is never a transition, because the object it relates to is not this object. A fact
that changes nothing about this object is never a transition either.

**Terminal classification.** Core imposes no common terminal vocabulary — `waived`,
`offboarded`, `cancelled` and `withdrawn` carry distinctions OCDS and the domain already make.
It imposes a common classification, so a consumer can ask "does this object have an abandonment
path" across every object type without core inventing names.

---

## 5. Relations and outcomes are not states

**R-1.** A **relation** to another object MUST NOT be a state value. Since the registry is the
record (§11), this is linted where states are *authored* rather than where they are generated. It is expressed as an
`annotation` entry whose event payload carries the related identifier.

**R-2.** An **outcome** of a Decision MAY be a state value, provided the Decision is the
authority and the state is reached by an event that references it. The registry records
`decisionType` on such entries.

The distinction is projectability. `Bid.superseded` cannot be projected: you cannot derive it
without knowing superseded *by what*, and the state does not carry it. `Submission.admissible`
can: an admissibility Decision produces `submission.admitted`, and the state follows.

**R-3.** A condition computable from other objects is a **derived predicate**, not a state and
not an annotation. It is not stored and emits no event.

R-3 is the sharper case and it is easy to miss. An `Evaluation` is "consumed" when an `Award`
references it — that is a fact about the graph, computable at read time, and modelling it as a
state creates a value that must be maintained and can drift. Likewise a `Policy` is "current"
when nothing supersedes it. Neither belongs in a vocabulary.

The three-way test: can it be derived from **this object's own event stream**? Then it is a state
(R-2). From **another object**? Then it is a relation (R-1) or a derived predicate (R-3), and the
difference is whether the fact needs to be *recorded at a moment* — an annotation — or merely
*computed* — a predicate.

R-1 removes exactly one value from one schema. R-2 preserves `admissible`, `inadmissible`,
`winning`, `rejected`, `approved` and `qualified` where they stand. R-3 removes candidates before
they are proposed.

### 5a. Controlled reopen

An object returning to an earlier state under recorded authority is a **transition**: the
object's own state genuinely differs afterwards, so §4a places it there rather than with
annotations.

Two constraints follow from the model rather than from policy.

**A terminal state cannot be reopened.** `terminal: true` asserts that no transition leaves the
state. If an object can be reopened, the state it is reopened from is not terminal, and the
registry must say so. Reopen and terminality are alternatives, not layers.

**A reopen edge declares `decisionType`.** Where an edge requires recorded authority, the
authority must be evidenced by a Decision rather than asserted by the fact of the transition.
CI fails an edge marked `requiresAuthority` that names no `decisionType`, so the requirement
cannot be documented and left unenforced.

---

## 6. The basis rule

**B-1.** Every core registry entry MUST name an external `basis`: the OCDS stage or status
codelists, the procedure types in `codelists/procedure.csv` and the instrument behind them,
UBL 2.3 / EN 16931 document lifecycles, the EU eProcurement Ontology, or a named regulatory
instrument. An extension entry may additionally cite its own published extension spec.

**B-2.** An entry justifiable only from one implementer's workflow goes into a **profile**, not
into core.

**B-3.** Externality is not generality, and B-1 alone conflates them. Each basis carries a scope:

| Scope | Meaning | Justifies |
|---|---|---|
| `general` | Holds across the jurisdictions core claims to serve — OCDS, UBL 2.3 / EN 16931, ePO, UNTDED/ISO 7372 | a **core** entry |
| `jurisdictional` | Binds in one jurisdiction or one sector — a national procurement act, a sector security regulation | a **profile** entry; a core entry only where a corroborating general source is also named |
| `implementer` | An operating instruction or internal workflow | a **profile** entry only. Never core |

A national instrument is a real external source and still not a general one. An edge whose only
basis is one country's telecommunications security regulation is properly a jurisdiction profile,
not core — the standard would otherwise oblige every implementer in every market to carry it.

CI warns on a core entry resting on a jurisdictional basis with no corroborating general source,
and fails one resting on an implementer basis. When B-3 was first run, it flagged two core edges
in this repository's own registry; both were corroborated rather than the check being relaxed.

This is the neutrality control, and it is deliberately a CI check rather than a review step.
It runs on every push, it is auditable after the fact, and it does not depend on anyone
remembering to apply it. `basis: inherited` marks an edge that predates the registry and has no
identified external source; it is a review marker, never a justification, and CI warns wherever
a core entry rests on it.

---

## 7. Profiles

A profile MAY declare additional states on a core object — each carrying a `coreEquivalent`,
the core state it projects onto — additional edges, and additional namespaced event codes.
Namespaced private fields landed in v0.13.0, so the mechanism exists.

A profile MUST NOT remove or redirect a core edge, redefine a core state's `terminal`,
`appendable` or `class`, reuse a core entry `id` for a different triple, or declare an
unnamespaced event code.

Prohibiting profile states outright was considered and rejected: it does not contain the
problem, it relocates it, by driving implementers to overload core states with local meaning
where no check can detect it. `coreEquivalent` is the outward projection discipline SIGNET
already applies to OCDS and UBL, turned inward.

A worked example of a conformant profile — states, edges, event codes and private fields — is at
`docs/profile-authoring.md`.

---

## 8. Coverage, stated plainly

Five of eight lifecycle-bearing objects are modelled: `SourcingEvent`, `Submission`,
`Obligation`, `Auction`, `Bid`. Three are declared lifecycle-bearing and **not yet modelled**:
`OnboardingCase`, `SupplierQualification`, `HedgeProposal`. Their edges need a basis from the
extension maintainers rather than an inference from here.

The check reports coverage on every run rather than passing silently on what is absent. This is
the claim triad applied to the registry itself: **modelled** is not **tested** is not
**certified**.

---

## 9. Conformance

No conformance requirement is added by this change. S-1 to S-3, L-1, R-1 and B-1 are enforced
in CI against the repository's own artifacts; they are **modelled and specified, not certified**.

A future `F-STATE` requirement — projection determinism, terminal-state integrity, and stored
values equal to the projection — belongs at **Full**, not Core. Core is the wire contract,
assessable from artifacts an implementer already produces; requiring lifecycle projection there
would raise the certification floor for participants who only lodge submissions, with no
interoperability gain to a document-exchange counterparty. It is not proposed here, because
`conformance/levels.md` is Tier 2 and this change is landable without it.

---

## 10. Revisability

Landed under the bootstrap clause, on the pattern established by CP-Extension-Composition:
non-breaking additions land, the design is marked revisable, and ratification follows. Landing
does not ratify. The registry is versioned independently of the CDM and expected to change as
the model is implemented; entry `id`s are stable once published, so `Policy` applicability or
any later mechanism referencing a transition has something durable to point at.

---

## 11. Derived artefacts

**D-1.** Where two records of one relationship exist, one is authoritative and the other is
generated from it. A second hand-maintained copy is a defect, not redundancy.

This is why `sourcingEvent.published` could name a state the enum does not contain: the event
vocabulary and the state vocabulary were two hand-maintained records of one relationship, and
they drifted. It is also why closed codelists were enforced by nothing — the CSV and the schema
were two records, and only one of them was ever checked.

**D-2.** SIGNET has exactly two generation sources for a schema enum, and a schema location MUST
NOT be a target of both:

| Vocabulary | Record | Generated |
|---|---|---|
| Closed codelist | `codelists/<name>.csv` | the bound schema enum, via `codelists/bindings.json` |
| Lifecycle state | `state-model/state-model.json` | `<schema>/properties/<stateField>` |

Both are checked. `check-codelist-binding.js` regenerates from the CSV;
`check-state-model.js --write` regenerates from the registry; both fail on drift when run without
`--write`. CI check C15 fails if any location is claimed by both.

*Only the lifecycle row is in force. The closed-codelist row describes the arrangement, not the
state of the tree: the bound enums have not been generated, so on `main` the bound properties are
`"type": "string"` and any string validates. That is a Tier 2 act under `governance/IAR-0003`,
which has not landed. This paragraph read "Both are enforced" and was corrected on 2026-08-21;
see `governance/defects.md` D-14 and D-30.*

Generation applies only where the registry actually declares states. An object declared
lifecycle-bearing but **not yet modelled** keeps the vocabulary it has — an unmodelled object's
enum is not ours to overwrite, and silently emptying it would be a worse defect than the drift.

**Consequence, stated because it changes the artifact's status.** Once a normative schema enum is
generated from the registry, the registry is no longer informative. It is the normative record for
every lifecycle vocabulary it declares. `state-model/state-model.json` is protected accordingly
(`CODEOWNERS`), and a change to a declared state is a Tier 2 act whether it is made in the schema
or in the registry. See `governance/IAR-0004`.

An implementer reports the same failure mode measured at scale: in a legacy estate, 58 of 68
policy gates carried a declared transition label that disagreed with the state the rule actually
tested. Sixteen agreed. The pattern is contributed and adopted here on that evidence.

---
