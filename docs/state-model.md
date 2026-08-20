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

**Terminal classification.** Core imposes no common terminal vocabulary — `waived`,
`offboarded`, `cancelled` and `withdrawn` carry distinctions OCDS and the domain already make.
It imposes a common classification, so a consumer can ask "does this object have an abandonment
path" across every object type without core inventing names.

---

## 5. Relations and outcomes are not states

**R-1.** A **relation** to another object MUST NOT be a state value. It is expressed as an
`annotation` entry whose event payload carries the related identifier.

**R-2.** An **outcome** of a Decision MAY be a state value, provided the Decision is the
authority and the state is reached by an event that references it. The registry records
`decisionType` on such entries.

The distinction is projectability. `Bid.superseded` cannot be projected: you cannot derive it
without knowing superseded *by what*, and the state does not carry it. `Submission.admissible`
can: an admissibility Decision produces `submission.admitted`, and the state follows.

R-1 removes exactly one value from one schema. R-2 preserves `admissible`, `inadmissible`,
`winning`, `rejected`, `approved` and `qualified` where they stand.

---

## 6. The basis rule

**B-1.** Every core registry entry MUST name an external `basis`: the OCDS stage or status
codelists, the procedure types in `codelists/procedure.csv` and the instrument behind them,
UBL 2.3 / EN 16931 document lifecycles, the EU eProcurement Ontology, or a named regulatory
instrument. An extension entry may additionally cite its own published extension spec.

**B-2.** An entry justifiable only from one implementer's workflow goes into a **profile**, not
into core.

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
