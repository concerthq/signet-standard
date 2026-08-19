# CP-EventType-Closure

**Status:** Draft — not yet balloted. **Gates open** (§7); `ET-2` is the priority gate.
**Affects:** `codelists/eventType.csv`, `codelists/codelists.json`, `conformance/runner/`,
`conformance/suite/document-conformance.json`, `conformance/fixtures/`, `tools/`,
`wiki/Codelists.md`, `wiki/Trust-Layer.md`
**Target:** the v1.0 train
**Breaking:** Yes — closes a codelist that is open today
**Depends on:** CP-Codelist-Enforcement (mechanism), CP-Extension-Composition Part 1 (prefix
grammar)
**Blocks:** CP-Policy-Applicability

---

## 1. Problem statement

### 1.1 The vocabulary is a third of the model

`eventType` has eight values: `need.raised`, `sourcingEvent.published`, `submission.lodged`,
`evaluation.completed`, `award.decided`, `contract.signed`, `mandate.granted`,
`mandate.revoked`.

The model has eighteen root objects with state changes. There is no code for an Order placed,
an Invoice issued, a Catalogue published, an Obligation met or breached, a Consent granted or
revoked, a SupplierQualification suspended, an OnboardingCase progressed, a Policy superseded,
a Decision taken, or a Party registered. **The vocabulary stops at `contract.signed`** — the
entire implementation stage has no event codes at all.

### 1.2 The gap is already being filled silently

C-EVT requires that material changes emit hash-chained Events. An implementation that places
an Order must emit one. There is no code for it, `eventType` is `"type": "string"` with a
prose pointer to a CSV, and CI lints CSV headers only. So the implementation mints a code and
**passes conformance**.

Any implementation past contract signature is doing this now, holding a valid conformance
report while emitting an invented vocabulary.

### 1.3 Why closure has become urgent

CP-Policy-Applicability derives a required gate set by matching `Policy.appliesTo.transitions`
against event types. A Policy binding to `order.placed` while the implementation emits
`orderPlaced` produces **a gate that never fires, on a conformant system, with no error
anywhere.**

A governance control that fails silently and passes certification is worse than no control:
it manufactures false assurance. The guarantee requires closure on **both** sides — enforcing
referential integrity on `appliesTo.transitions` is decorative while `Event.eventType` remains
free text.

Two further consequences of the current state: two certified implementations may emit
different codes for the same transition, and "material change" — the term C-EVT rests on —
has no definition anywhere in the standard.

---

## 2. Proposal

### 2.1 Derive the vocabulary; do not curate it

The scope question — every state change, or only governance-significant ones — is a false
choice. Both branches are unfalsifiable guesses about future need.

Every root object already declares its own state vocabulary in the schema. Those enums **are**
the transition vocabulary, written as destinations rather than movements. Derive from them.

**Derivation rule (normative):**

1. **Status transitions.** For each object with a nominated lifecycle enum, one code per
   reachable value: `<object>.<value>`.
2. **Creation.** For each root object **without** a lifecycle enum, one code:
   `<object>.created`. Where a lifecycle enum exists, creation is signalled by the initial
   status transition and no separate creation code is minted.
3. **Revocation and supersession.** For objects that are revocable or supersedable but carry
   no lifecycle enum: `mandate.revoked`, `consent.revoked`, `policy.superseded`.
4. `<object>` is the lowerCamel form of the schema `title`.
5. Enum values are normalised to lowerCamel (`under_verification` → `underVerification`).
6. **`Event` is excluded.** It is the audit primitive itself; an event recording an event's
   creation recurses without termination.
7. **`Obligation` is included** despite being embedded-only. It carries independent lifecycle
   state and a breach is material.

### 2.2 Nominating the lifecycle enums

Not every enum is a lifecycle. `Party.partyType`, `Policy.policyType`,
`OnboardingCase.caseType` and `OnboardingCase.entryMode` are classifications, not states.

Nomination is explicit, recorded once in the disposition file, and then mechanical forever:

```json
"eventType": {
  "disposition": "closed",
  "file": "codelists/eventType.csv",
  "derivedFrom": [
    { "object": "SourcingEvent",         "enum": "/properties/status" },
    { "object": "Submission",            "enum": "/properties/status" },
    { "object": "Evaluation",            "enum": "/properties/result" },
    { "object": "OnboardingCase",        "enum": "/properties/status" },
    { "object": "SupplierQualification", "enum": "/properties/status" },
    { "object": "Obligation",            "enum": "/properties/status" }
  ]
}
```

JSON Pointer per RFC 6901, consistent with CP-Codelist-Enforcement and
CP-decision-subject-binding.

### 2.3 The drift check

`tools/derive-eventtypes.js` walks the schemas, applies §2.1, and compares the result against
`codelists/eventType.csv`. **CI fails on any mismatch.**

This is what makes closure safe. A closed list without the drift check diverges from the model
the first time anyone adds a status value — silently, because nothing connects them. The
generator must land in the same commit as the closure, not after.

### 2.4 Namespaced extension values

Closure without an escape hatch makes domain extensions impossible. Same resolution as the
property namespace, which keeps it one mechanism rather than two:

```
order.created               core, in the codelist, enforced
example-org:stockAllocated  private, prefixed, permitted, unconstrained
defence:clearanceVerified   published extension, in the extension's own codelist
```

**Conformance rule:** an `eventType` value MUST appear in the core codelist **or** carry a
valid prefix per the CP-Extension-Composition grammar (`^[a-z][a-z0-9-]*:`). `signet:` and
`concert:` remain reserved.

`Policy.appliesTo.transitions` inherits this: a tenant may bind a private gate to a private
transition. The core guarantee holds for core transitions; private transitions are as reliable
as the implementer's own discipline, which is the correct allocation of risk.

### 2.5 Minting convention (normative)

`object.verb` — lowerCamel object, past-tense verb. The existing eight already follow it.
Writing it down before the list grows sixfold prevents the drift that would otherwise be
argued case by case.

---

## 3. The derived codelist

47 codes. Each row costs one CSV line; none requires adjudication.

**Status transitions (32)**

| Object | Codes |
|---|---|
| SourcingEvent | `sourcingEvent.planned` `.active` `.evaluating` `.complete` `.cancelled` `.withdrawn` |
| Submission | `submission.draft` `.submitted` `.withdrawn` `.admissible` `.inadmissible` |
| Evaluation | `evaluation.passed` `.failed` `.ranked` |
| Obligation | `obligation.pending` `.met` `.breached` `.waived` |
| OnboardingCase | `onboardingCase.initiated` `.invited` `.submitted` `.underVerification` `.infoRequested` `.pendingApproval` `.qualified` `.rejected` `.withdrawn` |
| SupplierQualification | `supplierQualification.active` `.conditional` `.suspended` `.expired` `.offboarded` |

**Creation (12)**

`award.created` `catalogue.created` `consent.created` `contract.created` `decision.created`
`invoice.created` `mandate.created` `need.created` `order.created` `party.created`
`policy.created` `syntheticAgent.created`

**Revocation and supersession (3)**

`mandate.revoked` `consent.revoked` `policy.superseded`

### 3.1 The existing eight

Seven become **discouraged aliases**; one is retained. **No existing code is removed, so no
conforming implementation is invalidated by the migration itself** — only by emitting codes
outside the list.

| Existing | Disposition | Prefer |
|---|---|---|
| `need.raised` | discouraged | `need.created` |
| `sourcingEvent.published` | discouraged | `sourcingEvent.active` |
| `submission.lodged` | discouraged | `submission.submitted` |
| `evaluation.completed` | discouraged | the specific result code — `evaluation.passed` / `.failed` / `.ranked` |
| `award.decided` | discouraged | `award.created` |
| `contract.signed` | discouraged | `contract.created` |
| `mandate.granted` | discouraged | `mandate.created` |
| `mandate.revoked` | **retained** | — derived under §2.1(3) |

This is the first real exercise of the `discouraged` mechanism from CP-Codelist-Enforcement,
and it demonstrates that the mechanism works before anything depends on it.

### 3.2 What derivation exposes

`Decision` has no lifecycle enum and no event code, yet it is the most
governance-significant object in the model. Derivation gives it `decision.created` and makes
the prior absence visible rather than assumed. `Evaluation` gains `evaluation.created`
implicitly through its result codes only — see gate ET-2.

---

## 4. Conformance changes

| Fixture | Type | Must |
|---|---|---|
| `event-unknown-type.json` | negative | be rejected — unprefixed value absent from the codelist |
| `event-prefixed-type.json` | positive | **validate** — `example-org:stockAllocated` |
| `event-reserved-prefix-type.json` | negative | be rejected — `signet:something` |
| `event-discouraged-type.json` | positive | **validate**, reported as informational |

The `discouraged` result is an informational note in the report and never a pass/fail input,
preserving CN-1.

`Codelists.md` gains the full derived list and a statement that it is generated, not authored.

---

## 5. Backward compatibility

**Breaking.** Any implementation emitting a code outside the list now fails C-DOC. That is the
purpose.

Mitigated on two axes: all eight existing codes remain valid, and any implementation-specific
transition can be carried immediately as a prefixed value. The practical migration for an
implementation currently minting free-text codes is to prefix them, then adopt core codes
where one exists.

Rides the v1.0 window alongside tenancy, the dialect migration and the `$id` rebase.

---

## 6. Rejected alternatives

**A — Significance-based curation.** Mint codes only where a gate might attach. **Declined:**
"might" is unfalsifiable, the judgement must be re-made for every future object, and the
failure mode is discovering a missing code after closure. Derivation removes the judgement
entirely and is CI-checkable.

**B — Every state change on every object, uncurated.** Superficially the same as derivation
but without the nomination step, so it mints codes from classification enums
(`party.organization`, `policy.eligibility`) which are not transitions. **Declined:** produces
nonsense codes and would make the drift check meaningless.

**C — Leave `eventType` open.** **Declined:** `Policy.appliesTo` cannot then carry its
security claim. See §8 for what would have to change if this were reconsidered.

**D — Close without the namespaced escape hatch.** **Declined:** makes domain extensions
impossible and guarantees the list is reopened immediately.

**E — Retire superseded codes.** **Declined** — see CP-Codelist-Enforcement, C-3 dissolution.
Event streams are permanent; codes are discouraged, never retired.

---

## 7. Open gates

⛔ **ET-1 — Creation code for objects with a lifecycle enum.** §2.1(2) suppresses
`submission.created` in favour of `submission.draft`. Confirm, or mint both and accept the
redundancy.

⛔ **ET-2 — `Evaluation` nomination.** `result` is nominated as the lifecycle enum, but an
Evaluation is created before it has a result. Either nominate nothing and mint
`evaluation.created`, or accept that an Evaluation is only observable at completion.

⛔ **ET-3 — Cardinality of terminal states.** `supplierQualification.expired` is a transition
no actor performs — it occurs by the passage of time. Does an Event require an actor for
time-triggered transitions, and if so, which?

---

## 8. If closure is declined

`Policy.appliesTo` becomes best-effort and CP-Policy-Applicability must say so explicitly
rather than implying a guarantee the vocabulary cannot back. A derived required-gate set over
an unenforced transition vocabulary is a convention, not a control. That is a defensible
position; it is a different product.
