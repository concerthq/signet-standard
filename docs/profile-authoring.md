# Authoring a SIGNET profile

**Status:** Working Draft · **Tier:** 1 · **Applies to:** v0.15.0 and later
**Companion to:** `docs/state-model.md` §7, `docs/extensions/README.md`

A profile is how an implementation carries what the core model does not. Core describes the
market-facing lifecycle — what a counterparty can observe and must be able to interpret. Everything
else an implementation needs is legitimate, common, and belongs in a profile.

This note exists because §7 states the rules and shows no worked example. Reading rules and writing
a conformant profile are different tasks.

---

## 1. What goes in a profile, and why the boundary falls there

**Core** carries what two independent implementations must agree on to interoperate. Every core
transition must be justified from OCDS, the Procurement Act procedures, UBL / EN 16931, ePO or a
named instrument (`docs/state-model.md` §6), and **none of those instruments models a buyer's
internal review**. So internal governance cannot enter core — not by policy, but by construction.

**A profile** carries everything else: assembly and review states, approval routing, rework loops,
organisation-specific vocabularies, local event codes.

The practical test: *would a counterparty receiving this document need to interpret it?* If no, it
is profile.

This is not a lesser destination. An implementation with a rich profile and a thin core footprint
is the intended shape.

---

## 2. The four mechanisms

| Need | Mechanism | Constraint |
|---|---|---|
| A state core does not have | Profile state with `coreEquivalent` | §3 |
| A transition core does not have | Profile edge in your registry | §4 |
| An event core does not name | Namespaced code in `eventType` | §5 |
| A field core does not carry | Namespaced private field | §6 |

---

## 3. Profile states

Every profile state declares the core state it projects onto, so a core-only consumer can interpret
an object carrying a profile state without knowing your profile. This is the projection discipline
SIGNET applies outward to OCDS and UBL, turned inward.

An internal governance vocabulary of `draft · assembled · in_review · returned · approved · issued`
against core `SourcingEvent`:

```json
{
  "profile": "acme",
  "object": "SourcingEvent",
  "states": {
    "acme:draft":      { "coreEquivalent": "planned", "terminal": false, "appendable": "any" },
    "acme:assembled":  { "coreEquivalent": "planned", "terminal": false, "appendable": "any" },
    "acme:in_review":  { "coreEquivalent": "planned", "terminal": false, "appendable": "any" },
    "acme:returned":   { "coreEquivalent": "planned", "terminal": false, "appendable": "any" },
    "acme:approved":   { "coreEquivalent": "planned", "terminal": false, "appendable": "any" },
    "acme:issued":     { "coreEquivalent": "active",  "terminal": false, "appendable": "any" }
  }
}
```

Five states project onto `planned` and one onto `active`. That is correct and expected: the market
cannot see any of the first five, so from a counterparty's position the event is simply planned.

**Two constraints.**

`coreEquivalent` must be a state the object could legitimately hold at that point in its lifecycle.
An `acme:approved` projecting onto `complete` would be false — the market has not seen a completed
event.

A profile state may project onto a terminal core state only if it is itself terminal, and must then
carry the same `class` (`completion`, `abandonment` or `revocation`).

---

## 4. Profile transitions

Same registry shape as core (`state-model/state-model.json`), with `basis` naming your own
authority rather than an external instrument. **Do not fabricate an external basis for an internal
edge** — an operating instruction is an honest `basis` for a profile entry and is never valid for
core.

```json
{
  "kind": "transition",
  "id": "acme:sourcingEvent.submitForReview",
  "object": "SourcingEvent",
  "from": ["acme:assembled"],
  "to": "acme:in_review",
  "eventType": "acme:sourcingEvent.submittedForReview",
  "basis": "acme:sourcing-authority-matrix-v4",
  "basisScope": "implementer"
}
```

Where a transition requires recorded authority, declare `decisionType` and set
`requiresAuthority: true`. The authority is then evidenced by a `Decision` rather than asserted by
the fact of the transition.

**The edge that crosses into core.** `acme:approved → acme:issued` projects to
`planned → active` and must emit the core `sourcingEvent.published` event as well as any profile
event. A counterparty's view of your object changes at that moment, and the core event is what tells
them.

### Rules

A profile **may** add states, add edges between core states or between core and profile states, and
declare namespaced event codes.

A profile **must not** remove a core edge or redirect one to a different target; redefine a core
state's `terminal`, `appendable` or `class`; reuse a core entry `id` for a different triple; or
declare an unnamespaced event code.

---

## 5. Event codes

`codelists/eventType.csv` is **open**. Namespaced profile codes may be added without ceremony.

`codelists/eventTypeCore.csv` is **closed and normative** — four grant-lifecycle codes whose
meanings are fixed. Do not reuse them for anything else.

Namespace every profile code: `acme:sourcingEvent.submittedForReview`. An unnamespaced code
collides with a future core addition.

---

## 6. Private fields

Namespaced private fields landed in v0.13.0. Use them for anything core does not carry.

Two live cases worth putting behind a translator rather than baking in:

**Tenancy.** Tenant, market and marketplace are three independent axes and none exists in core
today. It is a recorded defect, and any core representation will be breaking. Carry it as
`acme:tenant`, `acme:market`, `acme:marketplace` and keep the mapping at your boundary.

**Supersession.** No object carries a supersession reference (D-10). The shipped pattern is an
**annotation event** carrying the superseding identifier — see `bid.superseded` in the registry.
Follow that shape and you are aligned with whatever lands, because per-subject chain continuity is
preserved either way.

---

## 7. Deriving state, not storing it

`docs/state-model.md` §2 S-1: the current state of an object is the projection of its ordered Event
stream. S-2: a stored state value is the serialising party's assertion as at
`provenance.generatedAt`, and must equal the projection at that instant.

For a profile this means: project your own stream through your own registry, and when you serialise
a core object across the boundary, the core `status` you assert must equal what the projection
yields **through `coreEquivalent`**. An object in `acme:in_review` serialises as `planned`.

The event stream is the record. The stored value is what you tell a counterparty who cannot see it.

---

## 8. Before you ship

- [ ] Every profile state declares a `coreEquivalent` that is legitimate at that point
- [ ] No core state's `terminal`, `appendable` or `class` is redefined
- [ ] No core edge removed or redirected
- [ ] Every profile event code is namespaced
- [ ] Every profile entry carries an honest `basis`; none claims an external instrument it does not have
- [ ] Every edge crossing a `coreEquivalent` boundary emits the corresponding core event
- [ ] Serialised core `status` equals the projection through `coreEquivalent`
- [ ] Every lifecycle-bearing object has at least one terminal state, and every state can reach one
- [ ] No state value is a relation to another object (§5 R-1)

The registry checks in `conformance/rules/check-state-model.js` run against your own registry as
well as the standard’s. As of v0.15.0 that gives you **C9** — every state reachable from creation —
and **C5**, which refuses an edge originating from a terminal state.

Terminal reachability (**C11**) and the relation-valued state lint (**C1** in its registry-linting
form) arrive with `governance/IAR-0004-registry-normative.md`. That record is Tier 2 and carries a
fourteen-day comment period, so until it lands those two items are checked by reading, not by CI.
Neither has yet fired on the standard’s own registry. **C12** — every schema file declared — did:
it is how D-15 was measured.

---

## 9. Contributing back

If a profile edge turns out to be justifiable from OCDS, the Procurement Act procedures, UBL /
EN 16931 or ePO, it may belong in core. Raise it with the basis named. The `basis` field makes that
argument auditable, which is the point of it.

Edges that are genuinely yours stay yours. That is the system working, not a consolation.
