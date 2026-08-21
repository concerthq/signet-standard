# Implementer bulletin — building against v0.16.0 while two Tier 2 records are under comment

**Date:** 21 August 2026 · **Status:** advisory, not normative · **Baseline:** v0.16.0
**For:** implementations building now, ahead of two Tier 2 records completing their comment periods

Two changes are open for comment. Neither blocks you, but **one of them changes what validates**,
and building against today's looser behaviour will cost you a corpus rebuild.

---

## 1. Build to the enums now. They are about to be enforced.

Five closed codelists are bound to schema properties typed `"string"`, with the CSV named only in a
description. So this validates **today, on `main` at v0.16.0**:

```json
{ "procedure": "banana" }
```

v0.16.0 shipped the binding manifest and the checker — **not** the enums. Generating them alters
`schema/`, which is normative, so it is a Tier 2 act under **IAR-0003**, now open for comment. When
it lands, the value above stops validating. Affected:

| Codelist | Property | Under IAR-0003 |
|---|---|---|
| `procedure` | `SourcingEvent.procedure` | enum generated |
| `decisionType` | `Decision.decisionType` | enum generated |
| `partyRole` | `Party.roles[]` | enum generated |
| `documentType` | `Document.documentType` | enum generated |
| `identifierScheme` | `Identifier.scheme` | **deferred — see §4** |

`positionStatus` is bound too, but it already carries its enum and is already strict. Nothing
changes for it.

`identifierScheme` is the one to watch. It is typed loose today like the other four, but IAR-0003
**does not** generate its enum, because doing so would make a documented requirement unsatisfiable.
That is D-20, and §4 explains it. So four of the five tighten when IAR-0003 lands; the fifth stays
loose until D-20 is resolved, and an implementer relying on `Identifier.scheme` being validated
should not.

**Treat these as binding today.** A document carrying an out-of-list value is already
non-conformant — it merely validates. The change makes an existing violation visible rather than
creating a new one, so anything built against the loose behaviour is already wrong and will stop
loading when IAR-0003 lands.

The gap is recorded as **D-30**, and `check-codelist-binding.js` runs in CI and fails on it. If you
see `validate` red on `main`, that is why: five closed codelists unenforced in schema, four failing
and `identifierScheme` deferred. A green board would have been the inaccurate one.

This is not hypothetical. Enum generation immediately found a value in the standard's **own
reference implementation**, present since v0.6.1, that passed every check in force for ten releases.

### Why `identifierScheme` is deferred

Enforcing it would make the specification unsatisfiable. See §4 — this one affects you directly if
your decisions reference credentials.

---

## 2. Under IAR-0004, the registry becomes the record for state vocabularies

Schema state enums are generated from `state-model/state-model.json`, which is promoted from
informative to normative for every lifecycle vocabulary it declares.

For you:

- A change to a declared state is **Tier 2 wherever it is made**. Editing the registry is not a
  lighter route to the same change. Until IAR-0004 lands, the ownership control that enforces this
  is not in place — recorded as **D-31**.
- Your profile **must not** redefine a core state's `terminal`, `appendable` or `class`.
- If you generate anything from core state vocabularies, **source it from the registry**, not from
  the schema. The schema is derived output.

---

## 3. Two seams — put them at the translator, not in your objects

If your architecture is *only valid SIGNET objects cross into the core*, both of these belong at
that boundary, where a later change is a translator edit rather than a corpus migration.

### Tenancy — highest migration risk

Tenant, market and marketplace are three independent axes and **none exists in core**. Any core
representation will be breaking. Carry them as namespaced private fields and keep the mapping at
your boundary.

### Supersession

No object carries a supersession reference (**D-10**). The shipped pattern is an **annotation event**
carrying the superseding identifier — `bid.superseded` in the registry. Follow that shape and you
are aligned with whatever lands, because per-subject chain continuity is preserved either way.

**Do not** model supersession as a state. `Bid.status` carried `superseded` until v0.15.0 and it was
removed: a relation to another object cannot be projected from any event, because deriving it
requires knowing superseded *by what*, which the state value does not carry.

---

## 4. One open defect that will bite you at build time

**D-20.** `Decision.inputs` is documented (`docs/specification.md:409`) to hold *"the objects
considered (submissions, credentials, policies)"*. It is typed `Identifier[]`, and
`Identifier.scheme` is closed to six entity-naming codes — none of which names a credential. **No
value satisfies both.** `Provenance.derivedFrom` has the same shape, and `Credential.id` is a bare
URI string with no documented mapping to `Identifier`.

If your qualification or evaluation decisions reference credentials as inputs, you will hit this.
It is why `identifierScheme` is not being enforced: doing so would make a documented requirement
unsatisfiable.

Raised now rather than left to be discovered. It is a CDM-level question and will be resolved on its
own record with its own comment period.

---

## 5. What you can build today without waiting

Everything below is shipped or answered at v0.16.0.

| Need | Where it is |
|---|---|
| State model and transitions | `state-model/state-model.json` — all 29 objects declared, 5 lifecycle objects modelled |
| Internal workflow states | Profile with `coreEquivalent` — see the profile authoring note |
| Business event codes | `eventType` is **open**; namespace your own |
| Requester distinct from performer | Two registry entries on the same subject, using open codes |
| Human approval and authority ceiling | `Approval` — `approver`, `role`, `underMandate`, `authorityCredential` |
| Erasure vs the hash chain | Identity profile: no personal data in hash-anchored records; pseudonymous references; resolution held in your own erasable store |
| Pseudonymity | Same rule — normative today |
| Replay and state reconstruction | The registry makes projection computable; project from the stream |

**Core `status` is market-facing.** It describes what a counterparty can observe, not your internal
governance. If your model has internal review states in a core vocabulary, that is the correction to
make first, and it is cheap now because it is a profile rather than a rewrite.

---

## 6. Still open, and not worth waiting for

`D-10` supersession · `D-11` request/perform and delegation chains · `D-12` referential integrity ·
`D-20` credential references.

None has a remedy in flight. The profile route handles the first three; enforcing referential
integrity locally gives you a superset of what the standard requires. Waiting means waiting past
v1.0.

---

## 7. Comment

Both records are open for comment for fourteen days from the pull requests being marked ready.
Implementer comment is wanted, particularly on §1 — if enforcing a closed codelist breaks something
in your corpus, that is exactly what the period is for, and it is better said now than after v1.0.
