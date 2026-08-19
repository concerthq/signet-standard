# CP-Process-Spine

**Status:** Draft — not yet balloted. **Gates open** (§6).
**Affects:** `schema/sourcing-event.schema.json`, `examples/sourcing-event.json`,
`wiki/Process-Layer.md`, `wiki/Standards-Mapping.md`, `wiki/Worked-Examples.md`
**Target:** the v1.0 train, or earlier — see the register
**Breaking:** No — the field is optional
**Depends on:** none
---

## 1. Problem statement

**`SourcingEvent` has no link back to `Need`.** The process spine has exactly one break in it.

Verified against the schemas. Every other hop carries an explicit reference:

```
Need    ─── ✗ no link ───▶  SourcingEvent
                                  ▲
                      Submission ─┘  (submission.sourcingEvent)
                      Evaluation ──▶ Submission        (evaluation.submission)
                      Award      ──▶ SourcingEvent     (award.sourcingEvent)
                      Contract   ──▶ Award             (contract.award)
                      Order      ──▶ Contract          (order.contract)
                      Invoice    ──▶ Contract, Order   (invoice.contract, invoice.order)
```

`SourcingEvent` properties are `id`, `title`, `procuringParty`, `procedure`, `status`, `lots`,
`items`, `value`, `eligibilityCriteria`, `evaluationCriteria`, `period`, `documents`. Nothing
points upstream. `Need` has no downstream reference either.

### 1.1 What the break costs

**Planning-to-tender traceability is unexpressible.** The OCDS lifecycle that the process layer
claims to follow runs planning → tender → award → contract → implementation. SIGNET can project
each stage but cannot state that a given tender realises a given plan.

**One need served by several events cannot be modelled.** This is the shape a multi-tenant or
multi-market programme takes: a group-level Need decomposing into per-market or per-tenant
SourcingEvents. It surfaced directly from the multi-tenant implementation questions, where a
group Need spawning per-tenant events was the natural alternative to a single event spanning
tenants — and it is currently blocked.

**Budget-to-value reconciliation is broken.** `Need.budget` and `SourcingEvent.value` cannot
be related, so no implementation can answer whether tenders in flight exceed the plan they
derive from.

---

## 2. Proposal

One optional field on `SourcingEvent`:

```json
"realisesNeed": {
  "type": "array",
  "items": { "$ref": "definitions.schema.json#/definitions/Identifier" },
  "description": "The Need or Needs this sourcing event realises."
}
```

### 2.1 Direction

Upstream, on the child. Consistent with every other hop in the spine — `Award` points at
`SourcingEvent`, `Contract` at `Award`, `Order` at `Contract`. A downstream
`Need.sourcingEvents` array would require mutating the Need each time an event is created,
which conflicts with event-sourced state and inverts the direction of every other reference.

### 2.2 Cardinality

`0..*`. Zero because not every tender derives from a recorded Need — direct awards and
call-offs frequently do not. Many because a single consolidated tender may realise several
needs, which is the normal shape of demand aggregation.

The complementary case — one Need realised by several events — is expressed by several events
each referencing the same Need. No additional structure required.

### 2.3 Naming

`realisesNeed` rather than `need`. The relationship is not containment or derivation but
fulfilment, and the verb form matches `derivedFrom` in `Provenance`. `sourcedFrom` was
considered and rejected as ambiguous with supply sourcing.

---

## 3. Conformance

No new requirement. The field participates in C-DOC through schema validation only.

Optionally strengthens F-SEM traceability, but adding a requirement that a SourcingEvent must
realise a Need would be wrong — §2.2 explains why the field is optional.

One fixture addition: `examples/sourcing-event.json` gains `realisesNeed` pointing at
`examples/need.json`, so the worked lifecycle is fully linked end to end for the first time.
This is worth doing for its own sake: the examples currently show a thread that the schemas
cannot actually express.

---

## 4. Backward compatibility

**Additive and non-breaking.** Optional field; every existing instance remains valid.

Included in the v1.0 train for convenience rather than necessity. It could ship in a v0.x
minor if the train slips, and there is an argument for doing so — it is the only item in the
set that delivers value independently of everything else.

---

## 5. Rejected alternatives

**A — `Need.sourcingEvents` downstream array.** **Declined** — §2.1. Requires mutating the
parent, inverts the spine's reference direction, and conflicts with event-sourced state.

**B — Bidirectional references.** **Declined:** two sources of truth for one relationship,
with no mechanism to keep them consistent and no rule about which wins when they disagree.

**C — A separate `Programme` object grouping Needs and events.** **Declined:** solves a
problem nobody has reported, and the aggregation case is already expressible by several events
referencing one Need. Reconsider only if a real programme-level requirement appears.

**D — Cardinality `0..1`.** **Declined:** consolidated tenders realising several needs are
common enough that a singular field would be worked around immediately, most likely by
concatenating identifiers into a string.

---

## 6. Open gates

⛔ **PS-1 — Lot-level need attribution.** Where a consolidated tender realises several needs,
should the lot carry the attribution rather than the event? Parallel to `Lot.market` in
CP-Tenancy, and probably should follow whatever that resolves to.

⛔ **PS-2 — OCDS projection.** OCDS relates planning to tender through the `ocid`, not through
an explicit reference. Confirm `realisesNeed` projects cleanly or note it as SIGNET detail
over OCDS, as `Evaluation` already is in the Process Layer mapping table.
