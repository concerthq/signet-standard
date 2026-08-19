# CP-StateModel

**Status:** Draft — not yet balloted. Revision **r3.1**, superseding r1 and r2 in full; errata
at §16.
**Affects:** a transition registry (new artifact); `codelists/eventTypeCore.csv`;
`conformance/`; the existing stored `status` fields
**Target:** Phase A a v0.x minor; Phase B the v1.0 train
**Breaking:** One breaking element, deferred to Phase B (§10), and only if the Committee
resolves T-1 as (b)
**Tier:** Registry publication is Tier 1; `eventTypeCore.csv` additions and the §6 disposition
are Tier 2 — confirmed against [`GOVERNANCE.md`](../../GOVERNANCE.md) at §17.7
**Depends on:** nothing blocking. The r2 joint-adoption dependency on COV-011 is decoupled
(§11 D-4). CP-MandateAttestation is raised alongside and is independently rejectable (§6.4)
**Adds no stored field:** r3 proposes **no new stored state field on any object**. This is the
substantive change from r2, and it adopts rather than reopens the register's closed position
**Baseline:** v0.14.0, as reported to the author by the registrar's note on r2. The author has
not inspected v0.14.0 directly; claims are sourced to that note or marked ⚠. Discharged at §17.
---

## 0. Why r3 exists

r2 was drafted against a v0.5.0 snapshot and registered against v0.14.0. Verification found
one of its three stated defects to be non-existent, several inventory claims to be wrong, and
— more seriously — its proposed remedy to be in conflict with a position the register already
records as closed.

Two things follow.

**The withdrawn defect.** r2 §1.4 claimed `Policy.appliesTo` referenced a transition vocabulary
the standard never published, and r2 §1.5 built its case for standard-level treatment on that
claim. `Policy.appliesTo` does not exist. The defect is withdrawn in full (§16 E-1). The case
for standard-level treatment now rests on D1 and D2 alone, which is a narrower argument and is
made as such at §1.4.

**The inverted remedy.** r2 proposed adding stored `status` fields to Mandate, Contract, Award
and Consent. The register records a closed position rejecting exactly that on Consent: design
principle §1.7 makes current state the projection of the ordered event stream, so a stored
field creates a second source of truth with no rule saying which governs. GRT-1 says the same
thing operationally — withdrawal is an appended event, not an in-place mutation.

r2 did not merely fail to cite these. It contradicted itself: §9 offered replay-derivability as
an incidental proof that §1.7 holds, while §6.1 proposed the fields that would break it.

r3 does not reopen the closed position, and requires no new argument to proceed past it,
because it no longer proposes what was rejected. It goes the other way: **state is derived
everywhere, and the transition registry is what makes deriving it possible.**

---

## 1. Problem statement

### 1.1 Defect D1 — asserted lifecycles that no surface can record

*Confirmed at v0.14.0 by the registrar's note.*

The event codelist asserts lifecycle events for objects that carry no state field and — this
is the part r2 stated imprecisely — for which **no rule says how state is to be determined
instead**.

Mandate is the sharp case. `mandate.granted` and `mandate.revoked` both exist. The object
carries `validity`, a Period, and nothing recording revocation. A verifier reading the event
stream and a verifier reading the object reach different answers about whether an agent may
act.

r2 diagnosed this as *the object lacks a field*. That was wrong. Under §1.7 the event stream is
authoritative, so the verifier reading the object is the one in error — and the standard never
told them so. The defect is that **the standard has never stated which surface governs, nor
published the mapping that would let anyone compute state from the surface that does.**

### 1.2 Defect D2 — no transition registry

*Confirmed. This is the whole of the proposal.*

There is no artifact stating which event moves which object from which state to which. Without
it, §1.7's projection claim is unexecutable: a stream of events cannot be projected into a
state without a mapping from events to state changes. Every implementer must invent that
mapping, and no two will invent the same one.

The event codelist is currently a partial, hand-authored, unanchored substitute for it —
already doing this job, without the constraints that would make it reliable.

### 1.3 Defect D3 — withdrawn

See §16 E-1.

### 1.4 Why this belongs in the standard

Narrower than r2's claim, and sufficient.

§1.7 is a normative principle that no implementer can currently comply with, because the
artifact compliance requires does not exist. That is a defect in the specification, not in any
deployment. It cannot be cured locally: an implementer's private event-to-transition mapping
satisfies §1.7 for that implementer and produces a state vocabulary no counterparty can read.

The first party to publish such a mapping sets the de facto vocabulary for the category.
Declining to publish is delegation, not neutrality.

---

## 2. Scope and normative boundary

The orchestration exclusion stands.

**In scope:**

- that current state is derived from the event stream, stated normatively and generally;
- the mapping from events to state changes, per object type;
- which object types have a lifecycle, declared rather than implied;
- the state vocabulary of each, and which states are terminal;
- what may and may not be appended after a terminal state;
- how a profile state projects onto a core state;
- the disposition of existing stored `status` fields (§6).

**Out of scope:**

- who may request or perform a transition (implementer; COV-015);
- which policies or gates are evaluated, and in what order;
- isolation, concurrency, retry, idempotency;
- storage, topology, latency;
- reference resolution semantics between object versions (COV-011; §11 D-4).

---

## 3. Principles

Stated once, applied throughout. Each is recorded in §11 with the reasoning that produced it.

**P-0 — Projection is authoritative.** The current state of an object is the projection of its
ordered Event stream, **for any party holding that stream**. Where another surface carries
state, it is an assertion by the party that produced it and the projection governs as between
them (§6). *This restates §1.7 and GRT-1 rather than introducing anything; it is
stated here because the rest of the CP is unintelligible without it, and because r2's error was
to propose against it.*

**P-1 — Lifecycle test.** An object has a lifecycle if and only if (a) its state can change
after creation while it remains the same object, and (b) some party's permitted actions depend
on which state it is in. Otherwise it is a record: superseded, never transitioned.

**P-2 — Outcome and relation are not state.** The outcome of a Decision, and the relation of an
object to a superseding object, MUST NOT be modelled as states of the subject. State is what an
object *is*; outcome is what was *decided about it*; supersession is a *relation between
objects*. Both are read from the object that carries them.

**P-3 — Derived predicates, not stored flags.** Where a condition is computable from the event
stream and the object's own fields, it is expressed as a normative predicate and computed. It
is not stored, not enumerated in a state vocabulary, and emits no event of its own. *r2 applied
this to timestamp expiry only. It is the general rule; the timestamp case was one instance.*

**P-4 — Consistency where queryable, precision where semantic.** Core imposes a common
*classification* where consumers query uniformly, and permits object-specific *vocabulary*
where the domain and second sources already distinguish.

**P-5 — Inventories are generated, not asserted.** Any list of objects, states, or event codes
that CI can compute from the artifacts MUST be computed. This CP asserts no such list. *This
principle exists because every claim in r1 and r2 that verification refuted was a hand-asserted
inventory, and every claim that survived was a design argument.*

---

## 4. The transition registry

### 4.1 Artifact

`state-model/state-model.json` — machine-readable, sitting beside `codelists/`. It does not fit
the `Code,Title,Description` header lint and is not forced into `codelists/`.

### 4.2 Entry kinds

Two kinds. Every object type has exactly one `creation` entry, whether or not it has a
lifecycle. Only lifecycle-bearing objects have `transition` entries.

```json
{
  "kind": "creation",
  "id": "mandate.grant",
  "object": "Mandate",
  "to": "granted",
  "eventType": "mandate.granted"
}
```

```json
{
  "kind": "transition",
  "id": "mandate.revoke",
  "object": "Mandate",
  "from": ["granted", "suspended"],
  "to": "revoked",
  "eventType": "mandate.revoked",
  "basis": "existing eventType entry; W3C VC status semantics"
}
```

| Field | Kind | Card. | Definition |
|---|---|---|---|
| `kind` | both | 1 | `creation` \| `transition`. |
| `id` | both | 1 | Stable identifier, immutable once published. |
| `object` | both | 1 | Object type. |
| `from` | transition | 1..* | Permitted source states. |
| `to` | both | 0..1 | Target state. Present on creation entries only where the object has a lifecycle. |
| `eventType` | both | 1 | The event code that effects this entry. |
| `basis` | transition | 1 | External source justifying the edge (§7). |

### 4.3 State declarations

Each state in a lifecycle-bearing object's vocabulary carries:

| Property | Values | Meaning |
|---|---|---|
| `terminal` | boolean | Whether the state has outgoing transitions. |
| `appendable` | `none` \| `annotation` \| `any` | What may still be appended to the object's stream once in this state. |
| `class` | `completion` \| `abandonment` \| `revocation` | Terminal states only (§4.5). |

`appendable` replaces r2's `mutable`. Under P-0 there is no in-place mutation to permit or
forbid; the meaningful question is **what further events the stream will accept**. `annotation`
covers events that record something about the object without changing its state — an audit
note, a linkage to a superseding object — and is what makes supersession expressible without
reopening a terminal object.

This is the generic basis for write guards (COV-013), expressed in terms the event model
already uses.

### 4.4 Event-to-entry mapping is a function, not a bijection

`sourcingEvent.cancelled` is reachable from several source states. One event code per edge
would mint near-identical codes and fragment the consumer surface.

**Rule:** every registry entry has exactly one `eventType`; an `eventType` MAY serve several
entries, provided their `from` sets are disjoint. Disjointness is what keeps projection
deterministic: given a current state and an incoming event, exactly one entry can apply. CI
enforces it.

*This is a correction to r2 §3.4, which required totality but omitted disjointness and was
therefore not sufficient to make projection deterministic.*

### 4.5 Terminal classification

Per P-4. Core imposes no common terminal vocabulary — `waived`, `offboarded`, `cancelled` and
`withdrawn` carry distinctions OCDS and the domain already make — but classifies every terminal
state:

| Class | Meaning |
|---|---|
| `completion` | Reached its intended end. |
| `abandonment` | Ended before completion by a party entitled to end it. |
| `revocation` | Its effect withdrawn by the party that granted it. |

Every lifecycle-bearing object SHOULD declare at least one `abandonment` terminal reachable
from its pre-commitment states.

---

## 5. Worked models

Three objects, chosen to demonstrate the three situations that exist in the repository: an
object with no stored state, an object with stored state that is well-formed, and an object
with stored state containing a category error.

⚠ All three require confirmation against v0.14.0. The vocabularies below are proposals where
the object has no stored state, and readings of existing enums where it does.

### 5.1 Mandate — no stored state, pure projection

*Confirmed by the registrar: the object can record neither of its two lifecycle events.*

**No `status` field is proposed.** State is projected.

| State | terminal | appendable | class |
|---|---|---|---|
| `granted` | false | `any` | — |
| `suspended` | false | `any` | — |
| `revoked` | true | `annotation` | `revocation` |

| kind | id | from | to | eventType | basis |
|---|---|---|---|---|---|
| creation | `mandate.grant` | — | `granted` | `mandate.granted` | existing code |
| transition | `mandate.suspend` | `granted` | `suspended` | `mandate.suspended` | ⚠ new code, Tier 2 |
| transition | `mandate.reinstate` | `suspended` | `granted` | `mandate.reinstated` | ⚠ new code, Tier 2 |
| transition | `mandate.revoke` | `granted`, `suspended` | `revoked` | `mandate.revoked` | existing code |

**Effectiveness predicate** (P-3, normative):

> A Mandate is **effective** at instant *t* if and only if the projection of its event stream
> at *t* yields `granted`, **and** *t* falls within `validity`.

Expiry is not a state and emits no event. Neither is revocation stored. Both are computed, from
the same authoritative surface, so the two-verifiers disagreement in D1 cannot arise: there is
only one surface.

This is the demonstration that D1 is curable without adding a field, and it is why Mandate
leads. It also sits in the Agent layer, where SIGNET's answer is least substitutable.

### 5.2 SourcingEvent — stored state, well-formed

⚠ Baseline vocabulary was `planned`, `active`, `evaluating`, `complete`, `cancelled`,
`withdrawn`. Confirm at v0.14.0.

| State | terminal | appendable | class |
|---|---|---|---|
| `planned` | false | `any` | — |
| `active` | false | `any` | — |
| `evaluating` | false | `any` | — |
| `complete` | true | `annotation` | `completion` |
| `cancelled` | true | `annotation` | `abandonment` |
| `withdrawn` | true | `annotation` | `abandonment` |

| kind | id | from | to | eventType | basis |
|---|---|---|---|---|---|
| creation | `sourcingEvent.create` | — | `planned` | ⚠ | OCDS planning→tender boundary |
| transition | `sourcingEvent.publish` | `planned` | `active` | `sourcingEvent.published` | OCDS `tender.status` active |
| transition | `sourcingEvent.closeSubmissions` | `active` | `evaluating` | ⚠ | Procurement Act 2023 `competitiveFlexible` stage separation |
| transition | `sourcingEvent.complete` | `evaluating` | `complete` | ⚠ | OCDS `tender.status` complete |
| transition | `sourcingEvent.cancel` | `planned`, `active`, `evaluating` | `cancelled` | ⚠ | OCDS `tender.status` cancelled |
| transition | `sourcingEvent.withdraw` | `planned`, `active` | `withdrawn` | ⚠ | OCDS `tender.status` withdrawn |

`sourcingEvent.published` names a transition to a state the vocabulary does not contain. The
registry binds it to `planned → active` — a clarification of what it always meant, not a
rename.

`evaluating` has no OCDS counterpart and is justified from procedure semantics. Recorded so the
weaker basis is visible rather than smoothed over.

The stored `status` field on this object becomes a declared assertion under §6.

### 5.3 Bid — stored state containing a category error

*The registrar confirms `Bid.status` carries `superseded`.*

Under P-2, `superseded` is a **relation to another object**, not a state of this one. It is the
same category error as an admissibility outcome stored as a submission state: it puts in the
state vocabulary something that is true of the pair, not of the member.

Concretely, it is unprojectable. Given `Bid` in state `superseded`, no consumer can determine
*by what*, and the registry cannot express an edge into it without inventing an event that
carries the superseding identity in its payload — at which point the payload, not the state, is
the answer.

**Proposed:** `superseded` is removed from the vocabulary; supersession is expressed as an
appended `annotation`-class event carrying the superseding object's identifier, permitted in
any state whose `appendable` is `annotation` or `any`.

⚠ This requires the rest of the `Bid` vocabulary, which the author has not seen. The reading
above may be wrong in its particulars; the principle is not conditional on them.

**This is the one breaking element in r3, and only under T-1(b).** See §6 and §10.

---

## 6. Existing stored `status` fields — the disposition

*The registrar reports nine objects carrying a state field across 29 schemas. Per P-5 this CP
does not enumerate them; CI check 1 (§9.3) generates the list.*

### 6.1 The field is an assertion, not a cache

Earlier drafts of this section called the stored field a cache. That framing was wrong, and it
produced a wrong conclusion, so it is corrected here rather than quietly replaced.

A cache is a local copy of something the reader could compute independently. This is not that.
**P-0 is true for the party that holds the event stream.** A counterparty receiving a serialised
object holds the document and nothing else. It has no stream to project, and — unless the
sending party grants stream access, which no part of the specification requires — it never will.

C-DOC is the wire contract. Document exchange with parties who do not replicate the sender's
event history is the purpose of having one. A stored state value in such a document is the
**sender's assertion, at the boundary, of the state it projected at the moment of
serialisation**, made to a party that cannot verify it against the stream.

This also completes the register's objection. What was missing was not only *which surface
governs*, but **which surface governs for whom**. The holder projects; the recipient relies on
an assertion; and the specification must say so, because an implementer reading P-0 alone would
reasonably conclude the field should go.

### 6.2 The rule

> Where an object carries a stored state value, that value MUST equal the projection of the
> object's event stream **as at `provenance.generatedAt`**.

Three properties follow, and none is available from an unqualified "MUST equal the projection".

**Testable by the holder.** The party with the stream can be tested mechanically (F-STATE (d)).

**Meaningful to the recipient.** The value is a claim about a stated instant, not about now. A
recipient holding a document from last week knows it holds a statement about last week.
Staleness becomes explicit rather than silent — which is the honest position, since the
recipient could not detect staleness under any framing.

**Accountable.** Provenance already carries `generatedBy` and an optional signature. Anchoring
the assertion to `generatedAt` puts it exactly where the Trust layer puts every other assertion:
on the asserting party. A false state value is a false assertion by an identified party, not an
untraceable inconsistency.

### 6.3 ⛔ T-1 — Disposition

Two options. Tier 2 act.

**(a) Assertion as-is.** Every existing field remains, is annotated as an assertion governed by
§6.2, and carries the MUST. No values removed.
*For:* no break at all.
*Against:* enshrines values that have no projection to equal — `Bid.superseded` under P-2 — so
the MUST is permanently unsatisfiable for them, and F-STATE (d) must carve out exceptions it
cannot justify.

**(b) Assertion, with category errors corrected.** As (a), plus removal of values that are
outcomes or relations rather than states. `Bid.superseded` is the confirmed instance; CI check 9
seeds the rest.
*For:* every remaining value is projectable, so the MUST holds without exception and F-STATE (d)
needs no carve-out.
*Against:* breaking, per removed value.

**Recommendation: (b).** (a) is not a lighter version of (b); it is a rule with holes in it, and
the holes are precisely the values that caused the confusion this CP exists to resolve.

**Removal of the fields entirely was considered and is withdrawn**, not deferred. It would break
C-DOC for every recipient without stream access. Recorded at §12 R-11 with the reasoning, so it
is not re-proposed as the principled option it appears to be.

### 6.4 This section does not authorise new fields

§6 governs objects that **already** carry a stored state value. It is not a general licence to
add one wherever a recipient might find it useful.

The recipient-without-stream problem does, however, constitute a live argument for state
assertions on objects that currently lack them — most sharply Mandate, where the relying party
is typically external and the question is authority. That argument is new: r2 argued the object
lacked a field to record its own state, which the register rejected; this argues that a relying
party cannot determine authority at all.

It is **deliberately not folded into T-1**, because a closed position must not be reversed as a
side effect of a differently-scoped decision. It is put separately as **CP-MandateAttestation**,
which proposes a signed attestation over the existing `Credential` primitive rather than a bare
field. Committee may reject that proposal without disturbing anything here.

---

## 7. Generalisation test and profiles

### 7.1 Basis rule

Every core `transition` entry MUST carry a `basis` naming a source other than the submitting
implementer: the OCDS stage model, the `procedure` codelist, UBL 2.3 / EN 16931 document
lifecycles, the EU eProcurement Ontology, W3C VC status semantics, or a named regulatory
instrument. An entry that cannot be so justified goes to a **profile**.

A deploying implementer's own analysis indicates roughly sixty edges for its deployment. A core
of that size would be one organisation's workflow published under the SIGNET name. Expected
core size is materially smaller; the surplus is a profile.

⚠ r2 estimated 25–35 core entries against nine lifecycle objects at a stale baseline. Per P-5,
no estimate is offered here. The basis rule determines the number.

### 7.2 Profile rules

A profile MAY declare additional states (each with a `coreEquivalent`, §7.3), additional edges,
and additional namespaced event codes.

A profile MUST NOT remove or redirect a core edge, redefine a core state's `terminal`,
`appendable` or `class`, reuse a core entry `id` for a different triple, or declare an
unnamespaced event code.

### 7.3 `coreEquivalent`

Every profile state declares the core state it projects onto, so a core-only consumer can
interpret an object carrying a profile state without knowing the profile. An intake profile's
`under_verification` declares `coreEquivalent: submitted`.

This is the projection discipline SIGNET already applies outward — to OCDS, to UBL — turned
inward. Two constraints: the `coreEquivalent` MUST be a state the object could legitimately
hold at that point; and a profile state may project onto a terminal core state only if it is
itself terminal, carrying the same `class`.

---

## 8. Codelist impact

*The registrar reports `eventType` remains open and `eventTypeCore.csv` is now a closed
normative subset. This changes r2's analysis materially: the open→closed transition r2 proposed
has already partly occurred.*

| Artifact | Change |
|---|---|
| `eventTypeCore.csv` | Becomes **generated output** of the registry. Every core code corresponds to at least one entry; every entry's `eventType`, where unnamespaced, is a core code. New codes required by §5 (`mandate.suspended`, `mandate.reinstated`, and the SourcingEvent codes marked ⚠) are **Tier 2 acts**, not codelist additions, and are put to the Committee as such. |
| `eventType` (open) | Unchanged. Remains available for namespaced profile and local codes. |
| `terminalClass` | **New closed codelist**: `completion`, `abandonment`, `revocation`. Tier 2. |
| `appendability` | **New closed codelist**: `none`, `annotation`, `any`. Tier 2. |
| Existing codes | None removed, none renamed. `sourcingEvent.published` is rebound, not redefined. |

---

## 9. Conformance

### 9.1 F-STATE (Full level)

| Req | Level | Checks |
|---|---|---|
| **F-STATE** | Full | (a) every Event in a subject's stream corresponds to a registry entry whose `from` set contains the state projected from the preceding events; (b) projection is deterministic — no event admits two applicable entries; (c) no state-changing event is appended after a terminal state, and appended events respect the terminal state's `appendable` class; (d) where a stored state value exists, it equals the projection of the object's event stream as at `provenance.generatedAt` (§6.2); (e) every profile state declares a conforming `coreEquivalent`; (f) declared predicates are honoured — an expired Mandate is not treated as effective. |

**Full, not Core.** Core is the wire contract, assessable from artifacts an implementer already
produces. Placing F-STATE in Core means nobody certifies until they have built lifecycle
projection — raising the floor at exactly the moment first certifications matter most, and
excluding participants who only lodge submissions.

**Stated cost:** an implementation may be Certified at Core while permitting illegal
transitions. Handled in mark and claim language — Core makes no lifecycle claim — not by moving
the requirement.

The broken adapter MUST fail F-STATE by appending an event with no applicable entry.

### 9.2 No adapter contract change

**r2's proposed `transitionObject` method is withdrawn.** Under P-0 the harness does not need to
observe state, because it can compute state from the event stream the existing adapter contract
already yields via `createObject` and `applyChange`. The registry supplies the mapping; the
harness does the projection itself.

Three consequences, all favourable. The certification surface is unchanged. The
re-assessment question r2 raised does not arise. And the harness computing projection
independently is a stronger test than asking an implementation to report its own state.

*r2's proposed standing certification-versioning rule is removed from this CP. It remains a
sound recommendation and should be put separately, on its own merits, rather than riding through
as an annex to a proposal that no longer exercises it.*

### 9.3 Repository CI checks

1. Generate the inventory of objects carrying a stored `status` field, and of their values (P-5).
2. Every `from` and `to` in the registry appears in the object's vocabulary.
3. Every entry has exactly one `eventType`; entries sharing an `eventType` have disjoint `from` sets.
4. Every unnamespaced `eventType` in the registry appears in `eventTypeCore.csv`, and conversely.
5. No terminal state has an outgoing entry.
6. Every non-terminal state is reachable from a creation entry.
7. Every terminal state carries a `class`; every state carries `appendable`.
8. Every core `transition` entry carries a non-empty `basis`.
9. No value in any stored vocabulary is a relation or an outcome (P-2 lint — seeded with the values CI finds in check 1, reviewed by hand once).
10. Examples project cleanly: replaying each example object's stream yields its stored `status`, where one exists.

Checks 3, 4 and 10 have nothing to run against today. Check 10 failing is the measure of D1.

---

## 10. Phasing

### Phase A — non-breaking, Tier 1 plus the Tier 2 codelist acts

- Registry published as **informative**, with `terminal`, `appendable` and `class` on every state.
- Declared-statelessness entries published with rationale.
- `terminalClass` and `appendability` codelists published.
- New core event codes put to the Committee as Tier 2 acts.
- CI checks 1–10 wired; check 10 expected to fail initially and its failures triaged.
- P-0 stated normatively in the specification text.

Nothing existing is invalidated and no field is added or removed. An implementer building now
consumes the informative registry at implementer's risk, which is materially better than
inventing an event-to-transition mapping privately.

### Phase B — v1.0, Committee-gated

- Registry becomes normative: an implementation MUST NOT append a state-changing event with no
  applicable entry.
- `eventTypeCore.csv` generated from the registry.
- F-STATE enters the suite.
- T-1 disposition applied. **Breaking only under (b).**

### Migration

Under T-1(b), an implementer holding a removed value must, per affected object, append the
corresponding `annotation` event and let the stored field resolve to its projected value. Where
the historic fact has no recorded actor or rationale, the appended event records that its
provenance is retrospective. Say so plainly rather than fabricating provenance.

---

## 11. Decisions

### 11.1 Carried from r2 unchanged

**D-1 lifecycle test (now P-1)** · **D-3 outcome is not state (now P-2, widened to include
relations)** · **D-8 per-object vocabulary with universal classification (now P-4)** · **D-9
profile states with `coreEquivalent`** · **D-10 F-STATE at Full**.

Each survived verification because each is a design argument rather than an inventory claim.
That pattern is now P-5.

### 11.2 Revised

**● D-4 — Terminality and supersession. Decoupled from COV-011.** r2 made this CP jointly
adoptable with the versioning CP, which the registrar reports is not in the repository — a
dependency that rendered r2 unadoptable on its own terms. r3 owns `terminal` and `appendable`
only. Reference resolution between versions (as-at versus latest) is left wholly to COV-011.
The `annotation` appendability class is what makes the decoupling possible: supersession can be
recorded against a terminal object without this CP saying anything about how a reference to it
resolves.

**● D-6 — Event codes.** r2 proposed closing an open codelist. `eventTypeCore.csv` already
exists as a closed normative subset, so the proposal reduces to generating it from the registry
and putting new codes as Tier 2 acts. The open `eventType` list is untouched.

**● D-7 — Derived conditions. Widened from a timestamp rule to P-3.** r2 applied
derived-not-stored to expiry alone while proposing stored fields elsewhere — the same
inconsistency that produced the conflict with the register. Under r3 the rule is general and the
timestamp case is one instance.

### 11.3 Dissolved

A dissolved gate is one the design removes rather than answers. No adjudication, nothing to
appeal.

**◇ G-2 (Need lifecycle)** — dissolved by the creation-entry mechanism, as in r2. A creation
event is not evidence of a lifecycle.

**◇ G-5 (`evaluation.completed`)** — dissolved by the same mechanism with P-2.

**◇ D-11 (adapter contract change)** — dissolved by P-0. The harness computes projection from
events it already receives, so no new adapter method is required and no certification surface
changes (§9.2).

**◇ r2 §6.1 (new stored state fields)** — dissolved by P-0. The remedy for D1 is the registry
and the predicate, not the field.

### 11.4 Open for the Committee

**⛔ T-1 — Disposition of existing stored state values** (§6). Recommendation: (b).

**⛔ T-2 — Adoption of P-0 as specification text.** §1.7 already says it; T-2 asks whether it is
restated as an explicit rule about surface authority, which is what the register's objection
identified as missing. Recommendation: yes, and it is a precondition for the rest of this CP
being coherent.

**⛔ T-3 — New core event codes** (§8). Tier 2 act, listed individually rather than adopted as a
block.

---

## 12. Rejected alternatives

**R-1 — Leave the mapping to implementers.** §1.7 is normative and currently uncompliable. A
private mapping satisfies it for one party and produces a vocabulary no counterparty can read.

**R-2 — Adopt the deploying implementer's edge set wholesale.** Fails §7.1, standardises one
organisation's workflow, and is unavailable to the steward as a matter of governance regardless
of technical quality.

**R-3 — Add stored `status` fields (r2 §6.1).** Rejected, and the position the register already
records is adopted rather than reopened: a stored field creates a second source of truth with no
rule for which governs. r3's contribution is that the rule which was missing (P-0) is stated
rather than the field being added.

**R-4 — Specify transitions with guards, actors and gate bindings.** Re-opens the orchestration
exclusion, is untestable in a wire-format suite, and duplicates `Policy`.

**R-5 — Enforce transitions in JSON Schema.** Schema validates one document; a transition is a
relation between successive events. Enforcement belongs in the harness.

**R-6 — Profiles only, nothing in core.** No interoperable baseline; vocabularies diverge
immediately.

**R-7 — One event code per edge.** Fragments the consumer surface. Disjoint `from` sets achieve
determinism without it (§4.4).

**R-8 — Keep relations and outcomes as state values.** Enshrines values that have no projection
to equal, making the §6.2 MUST permanently unsatisfiable for them.

**R-9 — Prohibit profile states.** Relocates the problem; drives implementers to overload core
states with local meaning where no check detects it.

**R-10 — F-STATE at Core.** Raises the certification floor at the moment first certifications
matter most, for no interoperability gain to a document-exchange counterparty.

**R-11 — Remove stored state values entirely, leaving projection as the only surface.**
Withdrawn, not deferred. P-0 holds for the party holding the event stream; a counterparty
receiving a serialised object holds the document and nothing else, and no part of the
specification obliges a sender to grant stream access. Removing the value would leave such a
recipient unable to determine state at all, which breaks C-DOC — the wire contract whose purpose
is exchange with parties who do not replicate the sender's history. This alternative reads as
the principled one and is not; it is recorded here so it is not re-proposed as such.

---

## 13. Implementation evidence

A deploying implementer has modelled approximately twelve transition edges across two object
types against an estimated sixty for its deployment. That analysis is available to the Committee
de-named, as evidence of the shape of the problem and **not** as the proposed core edge set
(§7.1, R-2).

---

## 14. Disclosure

The Standards Committee is not constituted. The interests and recusals register will be
initiated on constitution.

Until then this section **is** the disclosure, made in plain terms and not by reference to any
filed record:

> This proposal originates from implementation questions raised by a deploying implementer whose
> platform lead also holds a role in the stewardship body.

r1 and r2 stated that the relationship "is recorded in the interests and recusals register."
That was an assertion of a filed fact that did not exist, in the one place where such an
assertion is least acceptable — a disclosure pointing at a register that does not exist
represents to a reader that oversight has occurred. Recorded as erratum E-4; the same correction
is owed by the two other proposals carrying the sentence.

The basis rule at §7.1 discharges this disclosure substantively rather than procedurally: an
entry admitted to core must be justifiable without reference to the submitting implementer, and
`basis` makes each justification auditable after the fact.

---

## 15. Verification required before submission

Per P-5, none of these is asserted in the text above; each is marked ⚠ where it appears.

1. Enumerate objects carrying a stored `status` field, and their values (CI check 1). r3 works
   from the registrar's count of nine across 29 schemas without reproducing it.
2. `Bid` state vocabulary in full (§5.3).
3. `SourcingEvent` vocabulary at v0.14.0 (§5.2).
4. `Auction`, `HedgeProposal`, `ExposurePosition` — classify under P-1. `HedgeProposal` and
   `ExposurePosition` suggest scope beyond the Buy end, which makes the published test more
   valuable, not less.
5. Which SourcingEvent event codes exist in `eventTypeCore.csv` and which are new (§5.2, §8).
6. Whether Consent, Contract or Award acquired state since v0.5.0, and if so under what decision
   — a stored field on any of them would sit against the register's Consent position.
7. GOVERNANCE.md tier definitions, to confirm the Tier 1 / Tier 2 split asserted in the header.

---

## 16. Errata against r1 and r2

**E-1 — Defect D3 withdrawn.** r2 §1.4 asserted that `Policy.appliesTo` referenced an
unpublished transition vocabulary. It does not exist. r2 §1.5 built the case for standard-level
treatment on it; that case is re-argued at §1.4 above on D1 and D2 alone. The claim was marked
⚠ and relied upon regardless, which is the failure mode P-5 exists to prevent.

**E-2 — Object and schema counts wrong.** r2 asserted six objects carrying state across roughly
twenty-one schemas. Nine across twenty-nine. Not restated here; generated by CI.

**E-3 — Remedy conflicted with a closed position.** r2 §6.1 proposed stored `status` fields
against a register entry rejecting exactly that, and against GRT-1. r2 §9 simultaneously cited
replay-derivability as proof that §1.7 holds. r3 adopts the closed position rather than
reopening it.

**E-4 — Disclosure asserted a register that does not exist.** See §14.

**E-5 — Corrections owed outside this CP.** In earlier triage the author reported COV-009 as
answered by a published `Policy` shape carrying `criteria` and `criterionRef`, and stated on
that basis that the risk to the SRC-3 fixture set was retired. `criteria` belongs to Evaluation;
`criterionRef` does not exist. COV-009 returns to Partial and the fixture risk is not retired.
This correction belongs on the readiness map, not in this CP, and is recorded here because it
originated in the same analysis.

---

## 17. Verification against v0.14.0 — registrar's note on r3

*Added at registration. Not part of the proposal as submitted; the author's text above is
unaltered.*

§15 lists seven items the proposal declines to assert and leaves for verification. All seven were
checked against the artifacts at **v0.14.0**. Six are confirmed. One corrects a figure that
originated in the registrar's own note on r2 and propagated into this revision.

### 17.1 Objects carrying a stored state field — **ten**, not nine

The count in the r2 note was wrong, and this note is where that gets corrected. There are **29
schemas** — that figure holds — and **ten** carry a stored lifecycle or outcome field:

| Object | Field | Values |
|---|---|---|
| SourcingEvent | `status` | `planned`, `active`, `evaluating`, `complete`, `cancelled`, `withdrawn` |
| Submission | `status` | `draft`, `submitted`, `withdrawn`, `admissible`, `inadmissible` |
| Obligation | `status` | `pending`, `met`, `breached`, `waived` |
| OnboardingCase | `status` | `initiated`, `invited`, `submitted`, `under_verification`, `info_requested`, `pending_approval`, `qualified`, `rejected`, `withdrawn` |
| SupplierQualification | `status` | `active`, `conditional`, `suspended`, `expired`, `offboarded` |
| Evaluation | `result` | `passed`, `failed`, `ranked` |
| Auction | `status` | `scheduled`, `open`, `in_progress`, `closed`, `cancelled` |
| Bid | `status` | `active`, `superseded`, `withdrawn`, `winning`, `rejected` |
| HedgeProposal | `status` | `draft`, `pendingApproval`, `approved`, `executing`, `executed`, `rejected`, `withdrawn` |
| ExposurePosition | `positionStatus` | `hedged`, `floating`, `markToMarket` |

The r2 note said "nine" in its heading while listing ten in its table: the six original objects
plus four later additions. The proposal took the figure on trust, as its baseline statement says
it must, and reproduced it at erratum E-2. **Erratum E-2 should read ten across twenty-nine.**

This is the second time an unverified count has propagated through this proposal, and it is a
point in favour of the proposal's own P-5: the figure should be generated by the CI check at §9
rather than asserted by anyone, including a registrar.

### 17.2 `Bid` vocabulary — confirmed

`active`, `superseded`, `withdrawn`, `winning`, `rejected`, as §5.3 assumes. `superseded` is
present and does interact with the supersession treatment; the proposal is right to single it out.

### 17.3 `SourcingEvent` vocabulary — confirmed

`planned`, `active`, `evaluating`, `complete`, `cancelled`, `withdrawn`. Unchanged since the
v0.5.0 baseline.

### 17.4 `Auction`, `HedgeProposal`, `ExposurePosition` — all four late arrivals are extension objects

`Auction` and `Bid` are the auction extension (v0.8.0); `HedgeProposal` and `ExposurePosition` are
commodity-risk (v0.10.0). All ship **in-tree under the core `v0.1` namespace** rather than as
separately namespaced packages, so they are inside the schema set the registry would govern.

`ExposurePosition` is the awkward one, and the proposal's instinct at §15.4 is right. Its field is
named `positionStatus`, not `status`, and its vocabulary is a **closed codelist**
(`codelists/positionStatus.csv`) on which reconciliation arithmetic depends — the schema
description says so normatively. A registry keyed on a field named `status` will not see it. Any
generalisation test must state whether a differently-named state field is in scope or out.

### 17.5 No SourcingEvent codes are in `eventTypeCore.csv`

The closed subset holds exactly four codes, all grant-lifecycle: `consent.granted`,
`consent.revoked`, `mandate.granted`, `mandate.revoked`.

`sourcingEvent.published` sits in the **open** `eventType.csv`, alongside eight others
(`need.raised`, `submission.lodged`, `evaluation.completed`, `award.decided`, `contract.signed`,
`mandate.refused`, `obligation.discharged`, `bid.placed`). So every SourcingEvent transition code
in §5.2 is new, and the choice of which list receives it is open: the open list is a Tier 1
addition, the closed subset a Tier 2 act.

### 17.6 Consent, Contract and Award have acquired no state

Confirmed, and this is the point on which r3 turns.

- `Consent` — `grantor`, `grantee`, `resource`, `purpose`, `validity`, `revocable`, `proof`
- `Contract` — `award`, `parties`, `title`, `value`, `period`, `obligations`, `documents`, `governingPolicies`
- `Award` — `sourcingEvent`, `awardedParty`, `value`, `rationale`, `decision`, `standstillPeriod`

None carries a stored state field, and none has acquired one since v0.5.0. The register's position
on `Consent` therefore stands unqualified, and r3's decision to adopt it rather than reopen it is
consistent with the artifacts as they are.

### 17.7 The Tier 1 / Tier 2 split in the header is correct

Checked against [`GOVERNANCE.md`](../../GOVERNANCE.md). Tier 2 covers `schema/`, **closed
codelists**, `conformance/levels.md`, `conformance/suite/` and `conformance/report-schema.json`,
plus the mark grammar and the two closed registers. Tier 1 covers everything else, including
governance records and proposal registration.

So: publishing the registry is Tier 1; additions to `eventTypeCore.csv` are Tier 2, as are
conformance changes; and the §6 disposition is Tier 2 where it touches a stored field in
`schema/`. The header's split is right as stated. Note that Tier 2 additionally requires a
recorded resolution and a **stated comment period of at least 14 calendar days** — the registry's
Tier 1 publication does not, which makes phasing the registry ahead of the codelist work
procedurally cheaper as well as technically safer.

### 17.8 On the disclosure

§14 replaces a reference to a register that does not exist with the disclosure stated in plain
terms. That is the right correction and it is made in the right place.

One narrowing: r3 says "the same correction is owed by the two other proposals carrying the
sentence." Among **registered** proposals, only CP-StateModel carried it, and this revision
removes it. The sentence otherwise appears in an archived handoff pack, which is not a published
artifact and is outside the register. No other registered proposal needs the correction. The
underlying gap — that no interests and recusals register exists — is real, and §14's approach of
disclosing directly rather than by reference is the sound answer to it while that remains true.

### 17.9 What this revision does to the r2 findings

Of the problems recorded against r2, r3 resolves the substantive ones on its own initiative:

| r2 finding | Status in r3 |
|---|---|
| Defect D3 rested on a field that does not exist | **Withdrawn** in full (E-1); the case re-argued on D1 and D2 alone |
| Remedy reopened the register's closed position, and ran against GRT-1 | **Inverted** — no new stored state field on any object; the closed position is adopted |
| Joint-adoption dependency on an absent COV-011 made it unadoptable | **Decoupled** (D-4) |
| Object and schema counts wrong | Corrected (E-2), with the residual error fixed at §17.1 |
| Disclosure cited a register that does not exist | **Corrected** (E-4), and stated directly instead |
| Phase A targeted a released version | Phasing restated at §10 |

Defects **D1** and **D2** remain confirmed against v0.14.0. The proposal is now internally
consistent with the model's own state philosophy rather than in tension with it, and nothing in
this verification blocks it.
