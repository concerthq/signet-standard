# CP-StateModel

**Status:** Draft — not yet balloted. **Gates:** eleven recorded as resolved by the author (§10);
none ratified. **Not adoptable as written** — see the registrar's verification at §15.
**Revision:** r2 — two gates dissolved structurally, nine adjudicated.
**Affects:** Foundation, Process, Agent and Trust layers; `codelists/eventType.csv`;
`Policy.appliesTo`; `schema/submission.schema.json`; `conformance/`; the adapter contract
**Target:** Phase A a v0.x minor; Phase B the v1.0 train
**Breaking:** Phase A no; Phase B yes — two breaking elements (§9)
**Depends on:** a versioning proposal the author identifies as COV-011, under a **hard
joint-adoption** dependency (§10 D-4). **That proposal is not in this repository** (§15.7)
**Supersedes, in part:** the status-enum-derived `eventType` generator binding proposed by
CP-EventType-Closure (§10 D-6)
**Baseline:** written against v0.5.0 artifacts. Verified against v0.14.0 at §15; the baseline
drift is material and is recorded there rather than silently corrected.
---

## 1. Problem statement

### 1.1 The presenting symptom

An implementer building against SIGNET cannot determine which state changes are legal. The
specification publishes state *vocabularies* for some objects and no *transitions* for any
object. Two independently conformant implementations can therefore disagree on whether a
given change was permitted, and both remain conformant, because nothing in the standard or
the conformance suite decides the question.

This is not a documentation gap. It has three concrete consequences already visible in the
shipped artifacts.

### 1.2 Defect D1 — objects with asserted lifecycles and nowhere to record state

The `eventType` codelist asserts lifecycle events for objects whose schemas carry no state
field:

| Object | Asserted in `eventType` | State field in schema |
|---|---|---|
| Need | `need.raised` | none |
| Award | `award.decided` | none |
| Contract | `contract.signed` | none |
| Mandate | `mandate.granted`, `mandate.revoked` | none |

Mandate is the sharpest case. Two lifecycle events exist; `validity` is a `Period` and
carries no revocation. The event chain can record that a mandate was revoked while the
mandate object continues to assert unrestricted authority. A verifier reconstructing state
from the event stream and a verifier reading the object reach different answers about
whether an agent may act — which defeats the purpose of both the Mandate object and the
Trust layer.

Objects that **do** carry a state field:

| Object | Field | Values |
|---|---|---|
| SourcingEvent | `status` | `planned`, `active`, `evaluating`, `complete`, `cancelled`, `withdrawn` |
| Submission | `status` | `draft`, `submitted`, `withdrawn`, `admissible`, `inadmissible` |
| Obligation | `status` | `pending`, `met`, `breached`, `waived` |
| OnboardingCase | `status` | `initiated`, `invited`, `submitted`, `under_verification`, `info_requested`, `pending_approval`, `qualified`, `rejected`, `withdrawn` |
| SupplierQualification | `status` | `active`, `conditional`, `suspended`, `expired`, `offboarded` |
| Evaluation | `result` | `passed`, `failed`, `ranked` — an **outcome**, not a lifecycle |

Six objects of roughly twenty-one. The remainder are stateless by omission rather than by
declaration, and no artifact distinguishes the two.

### 1.3 Defect D2 — `eventType` entries that do not correspond to any modelled transition

`sourcingEvent.published` names a transition to a state that does not exist. The enum has
`planned` and `active` and no `published`. The intended edge is presumably
`planned → active`, but that is an inference, and every implementer must make it
independently.

`evaluation.completed` asserts a lifecycle for an object whose only state-like field is an
outcome. `submission.lodged` maps to `draft → submitted` by inference only.

The `eventType` vocabulary is therefore a partial, hand-authored, unanchored edge list. It
is already doing the job this CP proposes to do properly, without the constraints that would
make it reliable.

### 1.4 Defect D3 — `Policy.appliesTo` is a dangling reference ⚠

`Policy.appliesTo` was introduced to replace the transition manifest. It references
transitions. No published artifact enumerates transitions or defines their identifiers.
Every value an implementer writes into `appliesTo` is a locally invented token, and no two
implementers will invent the same one.

This is the strongest argument that the work belongs in the standard rather than in a
deployment: the standard already contains a reference into a vocabulary it does not publish.

> ⚠ Confirm the exact shape and cardinality of `Policy.appliesTo` at v0.12.0 before
> submission. §6.4 is drafted against the described behaviour, not against the artifact.

### 1.5 Why this cannot be left to implementers

The party that fills this gap first sets the de facto transition vocabulary for the
category. If a deploying implementer enumerates sixty edges and names them, those names
become the interoperation surface regardless of what the standard later says. Declining to
specify is not neutrality; it is delegation of the vocabulary to whoever ships first.

---

## 2. Scope and normative boundary

The orchestration exclusion stands. This CP is drafted to sit strictly inside it.

**In scope — the standard specifies:**

- which object types have a lifecycle, declared rather than implied;
- the states each may hold, and whether each state is mutable and whether it is terminal;
- the ordered `(from, to)` pairs that are legal;
- that a state change MUST emit an Event;
- the stable identifier of each transition, and the `eventType` bound to it;
- how a profile state projects onto a core state.

**Out of scope — the standard is silent on:**

- who may request a transition and who may perform it (implementer; see COV-015 handling);
- which policies or gates are evaluated, and in what order;
- isolation level, concurrency, serialisation, retry, idempotency;
- where a refused caller is routed;
- deployment topology, latency, or storage.

Stating the exclusions in the published CP is what keeps this a data-model change rather
than an orchestration specification by another name.

---

## 3. Proposed model

### 3.1 Four governing principles

These are stated once here and applied throughout, rather than re-argued per object. Each
was derived while resolving a gate; the derivation is recorded in §10.

**P-1 — Lifecycle test.** An object has a lifecycle if and only if (a) it can change
materially after creation while remaining the same object, and (b) some party's permitted
actions depend on which state it is in. Otherwise it is a record: it is superseded, not
transitioned.

**P-2 — Outcome is never state.** The outcome of a Decision MUST NOT be modelled as a state
of the Decision's subject. State is what the object *is*; outcome is what was *decided about
it*. Outcomes are read from the Decision.

**P-3 — Derived states are not stored.** A state that is a pure function of a timestamp
field on the same object is derived. It is not stored, not enumerated in the object's state
vocabulary, and emits no Event.

**P-4 — Consistency where queryable, precision where semantic.** Core imposes a common
*classification* across objects where consumers need to query uniformly, and permits
object-specific *vocabulary* where the domain and the second sources already distinguish.

### 3.2 Registry entry kinds

The registry holds two kinds of entry. Every object type has exactly one `creation` entry,
whether or not it has a lifecycle. Only lifecycle-bearing objects have `transition` entries.

```json
{
  "kind": "creation",
  "id": "need.raise",
  "object": "Need",
  "eventType": "need.raised"
}
```

```json
{
  "kind": "transition",
  "id": "sourcingEvent.publish",
  "object": "SourcingEvent",
  "from": "planned",
  "to": "active",
  "eventType": "sourcingEvent.published",
  "basis": "OCDS tender lifecycle (planned → active)"
}
```

| Field | Kind | Card. | Definition |
|---|---|---|---|
| `kind` | both | 1 | `creation` \| `transition`. |
| `id` | both | 1 | Stable identifier. The value used in `Policy.appliesTo`. Immutable once published. |
| `object` | both | 1 | The object type. |
| `from` | transition | 1 | Source state. MUST appear in the object's state vocabulary. |
| `to` | transition | 1 | Target state. MUST appear in the object's state vocabulary. |
| `eventType` | both | 1 | The `eventType` emitted. See §3.4. |
| `basis` | transition | 1 | The external source justifying the edge. See §5. |

Creation entries carry `to` only where the object has a lifecycle, in which case `to` is the
initial state.

### 3.3 State declarations

Each state in a lifecycle-bearing object's vocabulary carries three properties:

| Property | Values | Meaning |
|---|---|---|
| `mutable` | boolean | Whether the object's substantive content may change in place while in this state. |
| `terminal` | boolean | Whether the state has outgoing transitions. Terminal ⊆ immutable. |
| `class` | `completion` \| `abandonment` \| `revocation` | Present on terminal states only. See §3.6. |

`mutable` is the generic basis for write guards, which answers COV-013 once rather than per
object. The mutable/immutable boundary falls at the commitment transition — the point after
which a counterparty relies on the artifact.

### 3.4 The transition → eventType mapping is a function, not a bijection

`sourcingEvent.cancelled` is reachable from `planned`, `active` and `evaluating`. Requiring
one `eventType` per edge would mint three near-identical event types and fragment the
consumer surface.

**Rule:** the mapping from registry entries to `eventType` is a **total function** — every
entry has exactly one `eventType`; an `eventType` MAY serve several entries. CI enforces
totality and the absence of orphan event types. Distinct event types are minted per edge
only where the source state materially changes what a consumer should do.

### 3.5 Derived states

Applying P-3: a state that is a pure function of a timestamp field on the same object is
computed at read time and does not appear in the stored vocabulary.

Mandate is the case in point. `expired` is a pure function of `validity.endDate` and is
therefore **removed from the enum entirely** rather than stored and left to drift. In its
place, a normative effectiveness predicate:

> A Mandate is **effective** if and only if `status == "granted"` **and** the evaluation
> instant falls within `validity`.

The predicate, not the enum value, is what an implementer needs and what F-STATE tests.

The boundary of P-3 is narrow and worth stating, because it will be misapplied. Award's
`pending → active` is **not** derived: standstill expiry is one input among several, not a
pure function of a single field. It remains a stored transition emitting an Event.

### 3.6 Terminal state classification

Applying P-4: core does not impose a common terminal *vocabulary* — Obligation abandons via
`waived`, SupplierQualification via `offboarded`, SourcingEvent via `cancelled` and
`withdrawn`, and flattening these discards distinctions OCDS and the domain already make.

Core instead imposes a common **classification** on every terminal state:

| Class | Meaning |
|---|---|
| `completion` | The object reached its intended end. |
| `abandonment` | The object was ended before completion, by a party entitled to end it. |
| `revocation` | The object's effect was withdrawn by the party that granted it. |

A consumer can then ask "does this object have an abandonment path" or "is this object in a
revocation terminal" uniformly, without core inventing names.

**Pattern:** every lifecycle-bearing object SHOULD declare at least one `abandonment`
terminal reachable from its pre-commitment states.

---

## 4. Worked models

Three objects are modelled here as the normative examples. The remaining six follow at the
same level of detail; the pattern is fully determined by §3.

### 4.1 SourcingEvent — existing enum, no schema change

States:

| State | mutable | terminal | class |
|---|---|---|---|
| `planned` | true | false | — |
| `active` | false | false | — |
| `evaluating` | false | false | — |
| `complete` | false | true | `completion` |
| `cancelled` | false | true | `abandonment` |
| `withdrawn` | false | true | `abandonment` |

The mutable boundary falls at `planned → active`: publication is the commitment transition,
after which the market relies on the artifact.

Entries:

| kind | id | from | to | eventType | basis |
|---|---|---|---|---|---|
| creation | `sourcingEvent.create` | — | `planned` | `sourcingEvent.planned` | OCDS planning→tender boundary |
| transition | `sourcingEvent.publish` | `planned` | `active` | `sourcingEvent.published` | OCDS `tender.status` active |
| transition | `sourcingEvent.closeSubmissions` | `active` | `evaluating` | `sourcingEvent.closed` | Procurement Act 2023 `competitiveFlexible` stage separation |
| transition | `sourcingEvent.complete` | `evaluating` | `complete` | `sourcingEvent.completed` | OCDS `tender.status` complete |
| transition | `sourcingEvent.cancel` | `planned` \| `active` \| `evaluating` | `cancelled` | `sourcingEvent.cancelled` | OCDS `tender.status` cancelled |
| transition | `sourcingEvent.withdraw` | `planned` \| `active` | `withdrawn` | `sourcingEvent.withdrawn` | OCDS `tender.status` withdrawn |

`evaluating` has no OCDS counterpart and is justified from procedure semantics rather than
from OCDS. Recorded explicitly so the gap is visible rather than smoothed over.

### 4.2 Submission — enum reduced (breaking, Phase B)

Applying P-2. `admissible` and `inadmissible` are the outcome of an admissibility Decision —
`decisionType: admissibility` already exists — and are removed from `status`.

States:

| State | mutable | terminal | class |
|---|---|---|---|
| `draft` | true | false | — |
| `submitted` | false | false | — |
| `withdrawn` | false | true | `abandonment` |

Entries:

| kind | id | from | to | eventType | basis |
|---|---|---|---|---|---|
| creation | `submission.create` | — | `draft` | `submission.created` | — |
| transition | `submission.lodge` | `draft` | `submitted` | `submission.lodged` | OCDS bid extension |
| transition | `submission.withdraw` | `draft` \| `submitted` | `withdrawn` | `submission.withdrawn` | OCDS bid extension |

This fixes a reachability defect in the current enum: a submission ruled `admissible` cannot
today reach `withdrawn`, and it is not evident that this was intended.

Admissibility is read from `admissibilityDecision` (§6.3). The cost is real and is the point:
an implementer performing automated admissibility can no longer flip an enum — it must record
a Decision made by an agent under a Mandate, carrying inputs, policies applied, rationale and
provenance that an enum value cannot. That is SIGNET's differentiator, and this change makes
it load-bearing rather than optional.

**Anticipated objection.** Consumers want to filter admissible submissions without resolving
Decisions. That is an indexing concern in an implementation, not a wire-contract concern, and
it does not justify two authoritative answers to one question.

### 4.3 Mandate — requires a new state field (D1)

Proposed vocabulary: `granted`, `suspended`, `revoked`. **`expired` is derived** (§3.5) and
does not appear.

| State | mutable | terminal | class |
|---|---|---|---|
| `granted` | false | false | — |
| `suspended` | false | false | — |
| `revoked` | false | true | `revocation` |

Entries:

| kind | id | from | to | eventType | basis |
|---|---|---|---|---|---|
| creation | `mandate.grant` | — | `granted` | `mandate.granted` | existing `eventType` entry |
| transition | `mandate.suspend` | `granted` | `suspended` | `mandate.suspended` | — |
| transition | `mandate.reinstate` | `suspended` | `granted` | `mandate.reinstated` | — |
| transition | `mandate.revoke` | `granted` \| `suspended` | `revoked` | `mandate.revoked` | existing `eventType` entry |

A Mandate is immutable from grant: altering the authority of a live mandate in place is
indistinguishable in the record from never having constrained it. Change is by revocation
and re-grant.

Mandate is the second worked example deliberately. It is small; it sits in the Agent layer,
which has no counterpart in any adjacent standard and is therefore where a SIGNET-specific
answer is least substitutable; and its lifecycle is currently *asserted by the event codelist
and contradicted by the schema*, which makes this CP demonstrably a correction rather than an
expansion.

⚠ Confirm against v0.12.0 whether CP-Grant-lifecycle or CP-Mandate-enforcement has already
introduced state on Mandate. If so, §4.3 reduces to registering the edges, and Contract
becomes the second worked example.

---

## 5. Generalisation test — keeping one implementer's process out of core

A deploying implementer's analysis of its own build indicates roughly sixty edges are needed
for its deployment. A core of that size would be one organisation's workflow published under
the SIGNET name.

**Rule.** Every core `transition` entry MUST carry a `basis` naming a source other than the
submitting implementer: the OCDS stage model, the procedure types already in
`codelists/procedure.csv`, UBL 2.3 / EN 16931 document lifecycles, the EU eProcurement
Ontology, or an explicit regulatory instrument. An entry that cannot be so justified goes
into a **profile**, not core.

Expected core size across the nine lifecycle-bearing objects: 25–35 entries. The surplus is a
profile.

### 5.1 Profile rules

A profile MAY:

- declare additional states on a core object, under a namespaced identifier, **provided each
  declares a `coreEquivalent`** (§5.2);
- declare additional edges between core states, or between core and profile states;
- declare additional namespaced `eventType` codes.

A profile MUST NOT:

- remove a core edge, or redirect one to a different target state;
- redefine a core state's `mutable`, `terminal` or `class` properties;
- reuse a core entry `id` for a different `(object, from, to)` triple;
- declare an unnamespaced `eventType` code.

### 5.2 `coreEquivalent`

Every profile state declares the core state it projects onto, so a core-only consumer can
interpret an object carrying a profile state without knowing the profile. An intake profile's
`under_verification` declares `coreEquivalent: submitted`.

This is the projection discipline SIGNET already applies outward — to OCDS, to UBL — turned
inward. Two constraints:

1. A profile state's `coreEquivalent` MUST be a state the object could legitimately hold at
   that point in its lifecycle.
2. A profile state MAY project onto a terminal core state only if it is itself terminal, and
   MUST then carry the same `class`.

Prohibiting profile states outright was rejected (§11 R-11): it does not contain the problem,
it relocates it, by driving implementers to overload core states with local meaning where no
CI check can detect it.

---

## 6. Schema diffs

### 6.1 New optional state fields (Phase A — non-breaking)

```diff
  // mandate.schema.json
    "properties": {
      ...
      "validity": { "$ref": "definitions.schema.json#/definitions/Period" },
+     "status": {
+       "type": "string",
+       "enum": ["granted", "suspended", "revoked"],
+       "description": "Lifecycle state. Expiry is derived from validity and is not a stored state. See state-model/state-model.json."
+     }
    }
```

```diff
  // contract.schema.json
+     "status": {
+       "type": "string",
+       "enum": ["pending", "active", "cancelled", "terminated"],
+       "description": "Lifecycle state. Aligned to OCDS contract status."
+     }
```

```diff
  // award.schema.json
+     "status": {
+       "type": "string",
+       "enum": ["pending", "active", "cancelled", "unsuccessful"],
+       "description": "Lifecycle state. Aligned to OCDS award status."
+     }
```

Contract and Award vocabularies are taken verbatim from OCDS rather than invented, which
satisfies §5 on its face and preserves lossless projection.

**Consent** ⚠ — `revocable` is a boolean capability, not a state; there is no field recording
that revocation has occurred. CP-Consent-revocation may already have addressed this at
v0.12.0. If not, `status: granted | revoked` follows the Mandate pattern, with expiry derived
from `validity` under P-3.

### 6.2 Declared statelessness (Phase A — non-breaking)

Objects with no lifecycle are declared so in the state model rather than being absent from
it, so that "not modelled" and "deliberately stateless" are distinguishable:

```json
{ "object": "Decision", "lifecycle": false,
  "rationale": "An immutable record of a decision taken. Superseded, never amended." }
```

Declared stateless, with rationale:

| Object | Rationale |
|---|---|
| Need | Fulfilment is a *relation* — a SourcingEvent references its Need — not a state. Intake workflow is profile territory. |
| Decision | Immutable record. Superseded, never amended. |
| Evaluation | `result` is an outcome under P-2, not a lifecycle. |
| Policy | Change is by supersession; versioning already carries it. |
| Party | Standing lives on SupplierQualification. Duplicating it here gives two answers to one question. |
| SyntheticAgent | Authority lives on Mandate. Same argument. |
| Invoice | EN 16931 models no invoice status; Peppol conveys it in a separate Invoice Response. |
| Order | UBL conveys order status in OrderResponse. |
| Catalogue | As Order. |
| Lot, Item | Components of their container, not independent objects. |

**Pressure points, recorded now so the later challenge is anticipated rather than novel:**
Invoice (if CP-settlement-linkage lands, something will want to say "settled" — the answer is
a linked object, not a status field); Party (supplier standing); SyntheticAgent
(decommissioning).

### 6.3 Submission — outcome removed from state (Phase B — **breaking**)

```diff
      "status": {
        "type": "string",
-       "enum": ["draft", "submitted", "withdrawn", "admissible", "inadmissible"]
+       "enum": ["draft", "submitted", "withdrawn"]
      },
+     "admissibilityDecision": {
+       "$ref": "definitions.schema.json#/definitions/Identifier",
+       "description": "The Decision (decisionType: admissibility) ruling on this submission. Absent until ruled."
+     }
```

Breaking for any implementer storing admissibility in `status`. Migration in §9.

### 6.4 `Policy.appliesTo` constrained to the registry (Phase B — **breaking**) ⚠

```diff
      "appliesTo": {
        "type": "array",
        "items": {
          "type": "string",
+         "description": "MUST be an entry id published in state-model/state-model.json."
        }
      }
```

Breaking for any implementer already writing locally invented tokens.

### 6.5 State field required where a lifecycle is declared (Phase B — **breaking**)

For every object with `"lifecycle": true`, `status` moves into `required`.

---

## 7. Codelist impact

| Codelist | Change |
|---|---|
| `eventType` | Becomes **generated output** of `state-model.json`, and becomes **closed for unnamespaced codes**. Profiles MAY declare namespaced codes, which remain open. |
| `eventType` (retained) | `sourcingEvent.published` retained, rebound to `planned → active` — a clarification of what it always meant. `need.raised` and `evaluation.completed` retained, rebound to creation entries. No code is renamed or removed. |
| `eventType` (added) | `sourcingEvent.planned`, `.closed`, `.completed`, `.cancelled`, `.withdrawn`; `submission.created`, `.withdrawn`; `mandate.suspended`, `.reinstated`; and equivalents for Contract, Award, Obligation, OnboardingCase, SupplierQualification, Consent. |
| `terminalClass` | **New closed codelist**: `completion`, `abandonment`, `revocation` (§3.6). |
| `procedure`, `partyRole`, `policyType`, `decisionType` | No change. |
| New artifact | `state-model/state-model.json` — machine-readable, not a CSV codelist; it does not fit the `Code,Title,Description` header lint and is not forced into `codelists/`. |

The material change to `eventType` is **open → closed**, not the deprecation of hand-authored
entries. That is the break, and it is worth taking: an open event vocabulary means every
implementer's consumers diverge by construction.

---

## 8. Conformance rules

### 8.1 New requirement — F-STATE (Full level)

| Req | Level | Checks |
|---|---|---|
| **F-STATE** | Full | (a) every observed state change corresponds to a declared entry for that object type, in core or in the implementation's declared profile; (b) each state change emits exactly one Event whose `eventType` is the one bound to that entry; (c) no state change originates from a terminal state; (d) content of an object in an immutable state does not change other than by supersession; (e) every `Policy.appliesTo` value resolves to a published entry id; (f) every profile state declares a `coreEquivalent` satisfying §5.2; (g) the Mandate effectiveness predicate (§3.5) is honoured — an expired Mandate is not treated as effective. |

**Full, not Core, and deliberately.** Core is the wire contract, assessable from artifacts an
implementer already produces. F-STATE requires the adapter to expose transitions, which is a
materially larger integration. Placing it in Core means nobody certifies until they have
built lifecycle enforcement — raising the floor at exactly the moment first certifications
matter most, and excluding participants who only lodge submissions.

**The honest cost, stated rather than buried:** an implementation may be Certified at Core
while permitting illegal transitions. This is handled in mark and claim language — Core makes
no lifecycle claim — not by moving the requirement. The claim triad already supplies the
vocabulary to say so precisely.

The broken adapter MUST fail F-STATE by performing an undeclared transition, per the existing
discriminator discipline.

### 8.2 Adapter contract change

```
transitionObject(subjectId, toState) → { document, event }
```

Adapters targeting Core are unaffected. Adapters claiming Full must implement it.

### 8.3 Certification versioning rule (standing, adopted with this CP)

Needed regardless of this CP, and adopted here because this CP is the first to exercise it:

1. Certification is granted against a **named conformance suite version**, which is already a
   surface distinct from the CDM version.
2. A change to the adapter contract requires a **major** suite version.
3. A major suite version triggers re-assessment **at renewal**, not immediately.
4. Marks carry the suite version against which they were earned.

F-STATE lands in suite v1.0.0 alongside CDM v1.0.0, so a first cohort faces no version
divergence to explain.

### 8.4 Repository CI checks (not conformance)

1. Every `from` and `to` in `state-model.json` appears in the object's schema enum.
2. Every entry has exactly one `eventType`; every `eventType` serves at least one entry.
3. No terminal state has an outgoing entry.
4. Every non-terminal state is reachable from a creation entry.
5. Every terminal state carries a `class`; every state carries `mutable`.
6. Every `appliesTo` value in `examples/` resolves.
7. Every core `transition` entry carries a non-empty `basis`.
8. No state in a stored vocabulary is a pure function of a timestamp field (P-3 lint).

Checks 1, 2 and 6 currently have nothing to run against and would each fail today, which is
the measure of the defect.

---

## 9. Backward compatibility and phasing

### Phase A — v0.13.0, non-breaking

- Optional `status` on Mandate, Contract, Award (and Consent, subject to §6.1 ⚠).
- `state-model/state-model.json` published as **informative**, including `mutable`, `terminal`
  and `class` on every state.
- Declared-statelessness entries published with rationale.
- `terminalClass` codelist published.
- CI checks 1–8 wired.
- `Policy.appliesTo` documented as taking entry ids, without schema constraint.

Nothing existing is invalidated. An implementer building now consumes the informative model at
implementer's risk, which is the honest framing and is materially better than inventing sixty
entry names locally.

### Phase B — v1.0.0, breaking, Committee-gated

Three breaking elements, taken together:

1. Submission `status` reduced; `admissibilityDecision` added (§6.3).
2. `Policy.appliesTo` constrained to the registry (§6.4).
3. `status` required where a lifecycle is declared (§6.5); `eventType` closed for unnamespaced
   codes (§7).

Plus: transitions become normative — an implementation MUST NOT effect a state change outside
the declared set for its declared profile — and F-STATE enters the suite.

### Migration

**Populating `status`.** For objects with an event history, state is derivable by replay —
a useful incidental proof that the Trust layer's projection claim (principle 1.7) holds in
practice.

**Submission admissibility.** An implementer holding `admissible` / `inadmissible` in `status`
must, per affected submission, mint a Decision with `decisionType: admissibility` and set
`admissibilityDecision`; `status` resolves to `submitted`. Where the historic ruling has no
recorded rationale or actor, the minted Decision records that provenance is retrospective. A
migration note should say so plainly rather than fabricating provenance.

---

## 10. Recorded decisions

Gates raised at r1. Two dissolved structurally; nine adjudicated. Recorded with reasoning so
that reopening any of them requires a new argument, not a repeat of the original one.

### 10.1 Structurally dissolved

A dissolved gate is one the right design removes rather than answers. Recorded separately
because the distinction matters: there is no adjudication here to appeal.

**◇ G-2 — Need lifecycle.** Dissolved by the creation-entry mechanism (§3.2). The gate existed
because `need.raised` looked like evidence of a lifecycle. Once creation is a first-class entry
kind, a creation event is no longer evidence of anything beyond creation, and the question does
not arise. Need is declared stateless (§6.2). Intake workflow — draft, approved, sourced — is
one organisation's process and belongs in a profile; "sourced" in particular is a relation, not
a state.

**◇ G-5 — `evaluation.completed`.** Dissolved by the same mechanism, combined with P-2.
Evaluation's `result` is an outcome, so Evaluation is stateless; `evaluation.completed` is its
creation entry. The code is retained and rebound. No rename, no deprecation, no consumer break.

### 10.2 Adjudicated

**● D-1 — Lifecycle-bearing objects.** Nine: SourcingEvent, Submission, Obligation,
OnboardingCase, SupplierQualification, Mandate, Contract, Award, Consent. Ten declared
stateless with rationale (§6.2). *Reasoning:* the list alone would be wrong within two
releases, so the classification test P-1 is published with it and governs future additions.
SyntheticAgent and Party stay stateless specifically because authority and standing already
live on Mandate and SupplierQualification; duplicating them is defect D1 reintroduced. Invoice,
Order and Catalogue stay stateless on second-source grounds (EN 16931, UBL), which makes the
position defensible in §5 terms rather than merely convenient.

**● D-3 — Submission admissibility.** Split. `status` reduced to `draft | submitted |
withdrawn`; `admissibilityDecision` added. Second breaking element accepted. *Reasoning:*
generalised into P-2. Fixes a live reachability defect; removes a two-answers problem; makes
the Decision object load-bearing rather than optional. Duplicating outcomes onto subjects is
how a standard quietly becomes ignorable.

**● D-4 — Terminality and supersession.** Terminal means *no outgoing transitions*, not
immutable-forever. Supersession never reopens a terminal object; it mints a new one. References
resolve **as-at**, never as-latest. Every state carries `mutable`. *Reasoning:* unifies three
otherwise separate problems — write guards get a generic basis (COV-013), the
mutation/supersession line falls at a transition the model already knows about, and Policy
needs no lifecycle because supersession covers it. **Dependency:** the versioning CP owns
`supersedes` / `supersededBy` and reference-resolution semantics; this CP owns `mutable` and
`terminal` and cites them. Neither may be adopted alone.

**● D-6 — Generated `eventType`.** Yes, generated. *Reasoning:* the break is open → closed, not
the deprecation of hand-authored entries — no code is removed or renamed. Core codes are
generated and closed; namespaced profile codes are permitted and open, consistent with D-9 and
with lean core. **Recorded as an explicit supersession** of the status-enum-derived generator
binding: the generator's input changes from `(object, state)` pairs to registry entries.

**● D-7 — Time-triggered transitions.** Generalised into P-3. `expired` is removed from the
Mandate vocabulary entirely; a normative effectiveness predicate replaces it. *Reasoning:* the
r1 recommendation — "computed, no event" — was wrong in a way worth naming. It left `expired`
in the stored enum, permitting a document to read `granted` while the mandate had in fact
expired: two answers to one question, which is D1 reintroduced. `partyType` is untouched, so
the `service` actor gap remains a clean separate question against COV-014. Award's `pending →
active` is explicitly outside P-3 and stays a stored transition.

**● D-8 — Cancellation and withdrawal.** Per-object vocabulary, universal classification
(§3.6). **This reverses the r1 recommendation.** *Reasoning:* universal edges force vocabulary
alignment the second sources do not support and discard distinctions OCDS and the domain
already make. Generalised into P-4.

**● D-9 — Profile extension.** Profiles MAY add states, provided each declares a
`coreEquivalent` (§5.2). *Reasoning:* prohibition relocates the problem rather than containing
it — implementers overload core states with local meaning, which no CI check can detect.
`coreEquivalent` is SIGNET's existing outward projection discipline turned inward.

**● D-10 — Conformance level.** F-STATE at Full. *Reasoning:* §8.1. The residual gap — Core
certification with unenforced lifecycles — is handled in claim language, not by moving the
requirement.

**● D-11 — Adapter contract change.** Land at v1.0, before first certification, and adopt the
standing certification versioning rule at §8.3. *Reasoning:* no implementation has yet been
certified, so nothing requires re-assessment. The timing is fortunate rather than clever, which
argues for making the change now rather than deferring it into a cycle where it would be
genuinely expensive.

---

## 11. Rejected alternatives

**R-1 — Leave the state model to implementers.** `Policy.appliesTo` already dangles;
`eventType` is already an unanchored partial edge list; two conformant systems already disagree
on legality. Declining to specify hands the vocabulary to whoever ships first.

**R-2 — Adopt the deploying implementer's ~60-edge model wholesale.** Fails the second-source
test at §5, standardises one organisation's workflow, and is unavailable to the steward as a
matter of governance regardless of its technical quality.

**R-3 — Specify transitions with guards, actors and gate bindings.** Re-opens the orchestration
exclusion, cannot be tested by a wire-format conformance suite, and duplicates what `Policy`
already expresses.

**R-4 — Enforce transitions in JSON Schema.** Schema validates a single document; a transition
is a relation between two successive documents. Enforcement belongs in the harness — the
disposition already settled for closed codelists.

**R-5 — Model transitions in profiles only, nothing in core.** No interoperable baseline; each
implementer's `eventType` vocabulary diverges immediately.

**R-6 — Make `status` required immediately.** Breaking with no migration window, and
unnecessary: Phase A delivers the artifact an implementer needs without the break.

**R-7 — Derive `eventType` mechanically from verb morphology.** English past participles are
not mechanically derivable. Declared per entry, bound by total function (§3.4).

**R-8 — One `eventType` per edge.** Mints three `sourcingEvent.cancelled` variants and
fragments the consumer surface for no gain.

**R-9 — Keep `admissible` / `inadmissible` as Submission states.** Preserves a live
reachability defect, keeps two authoritative answers to one question, and permits an
implementer to record an admissibility outcome with no actor, rationale or mandate. The
indexing objection is an implementation concern.

**R-10 — Universal cancellation edges to a shared terminal.** Rejected at D-8. Smaller, but
discards OCDS and domain distinctions and forces a vocabulary core has no second source for.

**R-11 — Prohibit profile states, permitting only profile edges.** Does not contain the
problem; drives implementers to overload core states with local meaning where no check can
detect it. `coreEquivalent` contains it in a way that is machine-checkable.

**R-12 — F-STATE at Core.** Raises the certification floor at the moment first certifications
matter most, requires the full adapter integration of every participant including
submission-only ones, and yields no interoperability gain for a document-exchange counterparty.

**R-13 — Store `expired` as a Mandate state, computed at write time.** Rejected at D-7. Permits
stored state to diverge from `validity`, which is defect D1 in a new location.

---

## 12. Implementation evidence

A deploying implementer has modelled approximately twelve transition edges across two object
types against an estimated requirement of sixty for its deployment. That analysis is available
to the Committee de-named and is offered as evidence of the shape of the problem, **not** as
the proposed core edge set (§5, R-2).

The two objects modelled are SourcingEvent and Policy(evaluationModel), which is why
SourcingEvent appears as the first worked example in §4.1.

---

## 13. Provenance and disclosure

This proposal originates from implementation questions raised by a deploying implementer whose
platform lead also holds a role in the stewardship body. The relationship is recorded in the
interests and recusals register on a role basis.

Consistent with published-artifact policy, no commercial implementer and no living individual
is named in this document. The generalisation rule at §5 exists in part to discharge this
disclosure substantively rather than procedurally: an entry admitted to core must be
justifiable without reference to the submitting implementer, and the `basis` field makes each
such justification auditable after the fact.

---

## 14. Open items requiring verification against v0.12.0

1. Exact shape and cardinality of `Policy.appliesTo` (§1.4, §6.4).
2. Whether CP-Grant-lifecycle or CP-Mandate-enforcement has introduced state on Mandate (§4.3).
   If so, the second worked example becomes Contract.
3. Whether CP-Consent-revocation has introduced state on Consent (§6.1).
4. The current input contract of the `eventType` generator, and whether `eventType` is still an
   open codelist (§7, D-6).
5. Whether Policy has acquired lifecycle semantics alongside `criteria` / `criterionRef`
   (§6.2, D-4).
6. Whether any object beyond the six listed in §1.2 has acquired a state field since v0.5.0.
7. Whether the versioning CP (COV-011) is drafted, and in what state, given the joint-adoption
   dependency at D-4.

---

## 15. Verification against v0.14.0 — registrar's note

*Added at registration. Not part of the proposal as submitted; the author's text above is
unaltered.*

The proposal is written against a **v0.5.0** baseline, and §14 lists seven items requiring
confirmation before submission. All seven were checked against the artifacts at **v0.14.0**.
The drift is material: three of the proposal's premises do not hold against the current model,
and one dependency cannot be satisfied.

None of it is corrected in the text above. A registrar does not redraft a proposal; it is
recorded here so the Committee reads the proposal against the model as it actually is.

### 15.1 `Policy.appliesTo` does not exist

Checked `schema/policy.schema.json`. Its properties are `@context`, `type`, `id`, `policyType`,
`expressionLanguage`, `expression`, `humanReadable`, `version`, `issuedBy`. There is no
`appliesTo`.

**Defect D3 (§1.4) is therefore not a current defect** — the reference cannot dangle, because it
does not exist. `appliesTo` is *proposed* by [CP-Policy-Applicability](CP-Policy-Applicability.md),
which is registered and unadopted. §6.4 has nothing to constrain, and becomes a dependency on
that proposal rather than a correction to a shipped artifact.

### 15.2 Mandate carries no state field

Confirmed. `Mandate` has `agent`, `grantedBy`, `permittedCapabilities`, `constraints`,
`approvalThresholds`, `scope`, `validity` — no state. **§4.3 stands as written, and Mandate
remains the second worked example.** Defect D1 is real: the event codelist asserts
`mandate.granted` and `mandate.revoked` against a schema with nowhere to record either.

**But it collides with a rule already landed.** [CP-Grant-lifecycle](CP-Grant-lifecycle.md)
**GRT-1** states: *"Withdrawal of a grant-type object MUST be expressed as an appended event; the
object MUST NOT be mutated in place."* Mandate is a grant-type object under that proposal's
enumerated definition. A stored `status` written on revocation is a mutation in place.

The collision is not fatal, and the proposal is close to resolving it: §3.5 already establishes
derived states, and an effectiveness predicate over the event stream would satisfy both. But the
proposal cites neither GRT-1 nor design principle 1.7, and it must, because —

### 15.3 The register records a closed position against exactly this

> **Status fields on `Consent` — rejected.** CP-Grant-lifecycle §8 A. Duplicates state that
> design principle 1.7 defines as an event projection, with no rule for which governs on
> disagreement.
> — [the register](README.md), "Positions that are closed, not open"

`Consent` likewise carries no state field (checked: `grantor`, `grantee`, `resource`, `purpose`,
`validity`, `revocable`, `proof`). Specification **§1.7** states that *"the current state of any
object is a projection over its event history."*

CP-StateModel proposes stored state fields across the model. For grant-type objects that
**reopens a closed position**, and it meets the recorded objection head-on: two sources of truth,
with no rule for which governs on disagreement. The register's convention is that a closed
position may be reopened only with **new argument**. This proposal may well have one — the
projection-replay migration at §9 gestures at it — but it is not made, because the proposal does
not know the position exists.

**This is the item for the Committee to take first.** It is not a detail. It decides whether the
proposal is a correction to the model or a change to its state philosophy.

### 15.4 `eventType` is open, but a closed subset already exists

`codelists/eventType.csv` holds nine values and `schema/event.schema.json` describes it as open.
Since the baseline, `codelists/eventTypeCore.csv` has landed: a **closed, normative** four-value
subset (`consent.granted`, `consent.revoked`, `mandate.granted`, `mandate.revoked`), protected by
CODEOWNERS and asserted in CI by `conformance/rules/check-codelists.js`.

Two of those four are Mandate lifecycle codes, so §4.3's new codes (`mandate.suspended`,
`mandate.reinstated`) would be **admissions to a closed normative subset** — a Tier 2 act under
[`GOVERNANCE.md`](../../GOVERNANCE.md), not an ordinary codelist addition.

There is no `codelists/codelists.json` and no `tools/derive-eventtypes.js`: the disposition file
and the generator are both *proposed* (CP-Codelist-Enforcement, CP-EventType-Closure) and neither
is adopted. **D-6 supersedes a binding that does not yet exist.** It is a disagreement between two
registered proposals, to be settled between them rather than by supersession.

### 15.5 Policy has no lifecycle, and `criteria` is not its field

Confirmed: no lifecycle semantics on `Policy`. The proposal's §6.2 and D-4 reference
`criteria` / `criterionRef` **on Policy**. `criteria` is a field of **`Evaluation`**, and
`criterionRef` does not appear anywhere in `schema/`. The premise is misattributed, and the
reasoning resting on it should be re-derived.

### 15.6 Nine objects carry a state field, not six — and the model is larger than the baseline

§1.2 counts "six objects of roughly twenty-one." At v0.14.0 there are **29 schemas**, and these
carry a lifecycle or outcome field:

| Object | Field | In the proposal's list? |
|---|---|---|
| SourcingEvent, Submission, Obligation, OnboardingCase, SupplierQualification, Evaluation | `status` / `result` | yes |
| **Auction** | `status` — `scheduled`, `open`, `in_progress`, `closed`, `cancelled` | **no** |
| **Bid** | `status` — `active`, `superseded`, `withdrawn`, `winning`, `rejected` | **no** |
| **HedgeProposal** | `status` — `draft`, `pendingApproval`, `approved`, `executing`, `executed`, `rejected`, `withdrawn` | **no** |
| **ExposurePosition** | `positionStatus` — `hedged`, `floating`, `markToMarket` | **no** |

The four unlisted objects arrived in v0.8.0 and v0.10.0. Three are in-tree extension objects, and
one — `ExposurePosition` — uses a differently-named field against a **closed** codelist. The
registry proposed at §3 must either cover them or declare why not. `Bid.status` matters most: it
already contains `superseded`, which interacts directly with D-4's supersession rule.

### 15.7 COV-011 is not in this repository

`git grep` finds no `COV-011`, and no versioning proposal under any name. The front matter states
that COV-011 and this proposal *"may not be adopted alone."*

**On its own terms, CP-StateModel is therefore not adoptable at present**, and the dependency
cannot be assessed, because the artifact it depends on is not here. Either it is submitted
alongside COV-011, or the joint-adoption constraint is withdrawn and D-4 re-derived without it.

### 15.8 Two further points

**The interests and recusals register does not exist.** §13 records the disclosure "in the
interests and recusals register on a role basis." No such register is in this repository. The
disclosure itself is sound and welcome — role-based, naming no individual and no implementer,
consistent with the published-artifact policy — but it cites a container that has yet to be
created. This is the second proposal to cite it. Creating it, or citing the correct location, is
outstanding either way.

**Phase A targets v0.13.0, which has shipped.** v0.13.0 delivered the namespace escape hatch and
v0.14.0 registered the v1.0 train. The next available minor is v0.15.0, and Phase A's placement in
the release sequence needs restating.

### 15.9 What is unaffected

The verification found nothing wrong with the proposal's core argument. **Defects D1 and D2 are
real, and confirmed against v0.14.0**: objects carry asserted lifecycles with nowhere to record
state, and the event codelist contains entries corresponding to no modelled transition. The
generalisation test at §5, the `basis` field, and the derived-state discipline at §3.5 are sound,
and are the parts of this proposal least likely to need rework. The problems recorded above are of
premise and dependency, not of design.
