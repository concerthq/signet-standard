# CP-Grant-lifecycle

**Status:** Draft — not yet balloted. Gates resolved as interim resolutions (§9).
**Mechanism landed:** `codelists/eventTypeCore.csv`, `conformance/rules/check-codelists.js`, and
`docs/specification.md` §7.4 carry this proposal's mechanism ahead of ballot, because it must be in
place before v1.0 (§7). Landing it does not ratify it: the Standards Committee may amend or reverse
it, and until it carries the material is a Working Draft on the same footing as the rest of v0.x.
**Affects:** `codelists/eventType.csv`, `docs/specification.md` (defined term), `conformance/`
**Target:** CDM v0.2
**Breaking:** No
**Depends on:** none
**Depended on by:** CP-Consent-revocation, CP-Mandate-enforcement (check E-MDT-5)
**Sequencing:** MUST land before v1.0 publication — see §7

---

## 1. Problem statement

The model has grant-type objects — `Consent` and `Mandate` — that confer authority for a bounded
period. It has no interoperable way to express that such authority has been **withdrawn**.

**P1 — Revoked state has no representation on any grant object.** `Consent.revocable` is a
*capability* flag recording whether a grant may be withdrawn; there is no field recording that one
has been. `Mandate` carries no status field either. In both cases a revoked grant and a live grant
are byte-identical.

**P2 — The obvious carrier is a non-normative codelist.** `eventType` already contains
`mandate.granted` and `mandate.revoked`, so the model's existing pattern is clearly *revocation is
an event*. But `eventType` is an **open** codelist, explicitly non-normative: values may be added
freely by pull request and nothing fixes the meaning of any of them. There are no `consent.*`
equivalents at all. An open codelist cannot carry a normative interoperability requirement.

**P3 — The gap recurs per primitive.** Solving it for `Consent` alone leaves `Mandate` unsolved and
guarantees the same gap in any future grant primitive. Two dependent proposals currently need the
same rule, which is the signal that the rule belongs above both of them.

**Consequence.** Two implementations can each be fully conformant and represent withdrawal of
authority incompatibly, or not at all.

---

## 2. Defined term

> **Grant-type object.** A CDM object that confers authority or permission from one party to
> another for a bounded period, and whose conferred authority may cease before the end of that
> period. In CDM v0.2 the grant-type objects are `Consent` and `Mandate`.

The term is **normative** and enters the specification (`docs/specification.md` §7.4). The list is
**enumerated**: adding a primitive that
meets the definition requires an explicit amendment naming it. Open-ended inheritance was rejected
— a future proposal's author would acquire obligations silently and might not notice. An enumerated
list forces the check to be made, while the definition text says what to look for.

---

## 3. Closed normative core within `eventType`

`eventType` remains **open** as an extension space. A defined subset becomes **closed and
normative**: codes in the core subset MUST carry the meanings defined in the codelist, and MUST NOT
be redefined, reused, or narrowed by implementations, extensions, or profiles.

Proposed initial core subset:

| Code | Title | Description |
|------|-------|-------------|
| `consent.granted` | Consent granted | A data-sovereignty access grant was issued. |
| `consent.revoked` | Consent revoked | An access grant was withdrawn before expiry. |
| `mandate.granted` | Mandate granted | Delegated authority was conferred on an agent. |
| `mandate.revoked` | Mandate revoked | Delegated authority was withdrawn before expiry. |

The two `mandate.*` codes already present are promoted, not added — their meanings are fixed rather
than changed.

Admission to the core subset is append-only and occurs only through the Standards Committee
process. Dependent proposals may propose entries; this proposal owns the mechanism. CP-Mandate-enforcement
proposes `mandate.refused` under it.

### Mechanism

The core subset lives in a **separate file**, `codelists/eventTypeCore.csv`, alongside the open
`codelists/eventType.csv`.

**Sync rule.** A code appears in exactly one file. `eventType.csv` MUST NOT contain any code present
in `eventTypeCore.csv`. Consumers take the union of the two. CI asserts the intersection is empty.

**Versioning.** Adding a core entry is a minor version. Changing the meaning of an existing core
entry is a major version, and is effectively forbidden.

The two `mandate.*` codes are moved from the open file to the core file as part of this proposal.

---

## 4. Projection rule (normative)

> A grant-type object *G* is **effective** at time *T* if and only if:
>
> 1. an event of type `<object>.granted` naming *G* as `subject` precedes *T*; and
> 2. no event of type `<object>.revoked` naming *G* as `subject` precedes *T*; and
> 3. *T* falls within *G*'s `validity` Period.
>
> An implementation MUST NOT mutate a grant-type object to record withdrawal. Withdrawal is
> recorded by appending an event.
>
> The effective/not-effective determination MUST be reproducible by a third party from the
> published event stream alone.

Consistent with design principle 1.7: current state is the projection of the ordered event stream,
not mutable state carried on the object.

---

## 5. Schema additions

**None.** `Event.subject` already carries the grant object's identifier and is required;
`Event.provenance` is required. Withdrawal is fully expressible today once the event types exist
and their meanings are fixed.

This is the principal argument for the approach: it closes the gap without touching `schema/`,
which keeps it clear of the pending schema-dialect decision.

---

## 6. Conformance

This proposal defines the shared rule. Testable requirements that exercise it are defined by the
dependent proposals — `CNS-*` in CP-Consent-revocation, `E-MDT-5` in CP-Mandate-enforcement — so
that the rule is stated once and asserted where it applies.

One requirement is general and belongs here:

| Rule | Requirement |
|------|-------------|
| **GRT-1** | Withdrawal of a grant-type object MUST be expressed as an appended event; the object MUST NOT be mutated in place. |

---

## 7. Backward compatibility and sequencing

| Change | Breaking? | Notes |
|--------|-----------|-------|
| New `eventType` values | No | Additive to an open list. |
| Promoting `mandate.granted` / `mandate.revoked` to the core subset | No | Fixes meanings that were previously unfixed. No shipped example or fixture uses either code with a divergent meaning. |
| Closing a subset of `eventType` | Not on the wire | Constrains future governance, not existing documents. |
| Projection rule | No | Defines meaning for a case that previously had none. |
| Defined term | No | |
| Schema | None | |

**This proposal touches the standard, and therefore should land before v1.0 publication.** Closing a
codelist subset is a governance change that is materially cheaper before the standard is
published under a stable URI and DOI than afterwards. Its two dependents are suite-side and later.

---

## 8. Rejected alternatives

**A — Status fields on each grant object (`status`, `revokedAt`, `revokedBy`).** Rejected:
duplicates state that principle 1.7 defines as an event projection, creating two sources of truth
with no rule for which governs when they disagree. Also invites an `expired` status that drifts
from `validity`.

**B — Hybrid: events as source of truth plus a derived `status` field required to match.**
Rejected for the same reason in weaker form. A redundant field required to match a computation is a
field that will eventually not match it, and the failure is silent.

**C — A separate `Revocation` primitive.** Rejected on core leanness. A new primitive for a state
transition the `Event` primitive already models is exactly the concept sprawl the core resists.

**D — Solve per object, inside each dependent proposal.** Rejected: produces two rules that must be
kept identical by hand, leaves any future grant primitive unaddressed, and creates a cross-proposal
dependency between two CPs that are otherwise independent and can ballot separately.

**E — Rely on the open `eventType` list without closing a core subset.** Rejected: this is the
current situation. Values in an open list have no fixed meaning, so no implementation can rely on
them and no conformance rule can reference them.

---

## 9. Resolutions

Three gates, resolved as interim resolutions under the bootstrap clause.

**R-G1 — Closure mechanism.** *Separate closed file*, `codelists/eventTypeCore.csv`, with the sync
and versioning rules in §3.

The discriminator is whether the governance rule can be enforced by infrastructure or only by
vigilance. A separate file can be protected by CODEOWNERS and branch protection, so a pull request
touching it structurally requires committee sign-off. A `Normative` column on the existing file
cannot: any reviewer may approve a diff that flips a flag, and the governance boundary is invisible
in the repository layout. This is the same reasoning applied to one-org-one-vote as a primary key
constraint rather than application logic — a closed codelist whose closure depends on someone
noticing is not closed.

*Rejected:* a reserved prefix (`core:consent.revoked`) making core codes identifiable by shape. It
breaks the two `mandate.*` codes already shipped, and puts governance metadata inside the value.

**R-G2 — `*.expired` codes.** *Dropped.* Both `consent.expired` and `mandate.expired` are removed.

The decisive objection is not redundancy but that **an expiry event has no actor.** `Event` requires
`actor` and `provenance`. Expiry occurs by the clock, not by any party's act, so populating those
fields would record a fiction with no honest answer to who generated the event. The projection rule
already handles expiry directly at clause 3, which tests `validity`.

**R-G3 — Normative status of the defined term.** *Normative, with an enumerated list.* See §2.
