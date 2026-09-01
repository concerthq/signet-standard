# CP-Policy-Applicability

**Status:** Draft — not yet balloted. **Gates open** (§8); `PA-2` is the priority gate.
**Affects:** `schema/policy.schema.json`, `conformance/runner/`,
`conformance/suite/implementation-conformance.json`, `conformance/levels.md`,
`wiki/Agent-Layer.md`, `docs/specification.md`
**Target:** the v1.0 train
**Breaking:** Conformance only — a new `F-GATE` requirement at Full; no document breaks
**Depends on:** CP-EventType-Closure (referential integrity), CP-Tenancy
(`Policy.tenancy.tenant`)
---

## 1. Problem statement

**Every gate in SIGNET is opt-in at instance level.**

A `Policy` holds a rule but cannot say what it applies to. It becomes relevant only when some
object points at it — via `Need.governingPolicies`, `SourcingEvent.eligibilityCriteria`,
`SourcingEvent.evaluationCriteria`, `Contract.governingPolicies`, `Mandate.constraints`, or
`Mandate.approvalThresholds`.

An implementation can therefore omit any gate simply by not referencing it. Nothing is
violated. Nothing is detectable.

### 1.1 The asymmetry

`Decision.policiesApplied` records which policies **were** applied, and F-SEM tests that
Decisions cite them. Nothing expresses which policies **must be**.

Post-hoc attestation exists; pre-hoc requirement does not. So "did this implementation apply
every required gate?" is not a question the harness can mechanically ask, because *required*
is unexpressed. For a standard whose claim is governed process rather than mere
interoperability, that is the load-bearing half missing.

### 1.2 Why not a transition manifest

The instinctive fix is a `TransitionManifest` root object declaring required gates per
transition. That brings a new object, new versioning, new tenant scoping, resolution semantics
for overlapping manifests, and a process-control layer competing with `Policy` for the same
job.

The rule is not missing. **The binding is.**

---

## 2. Proposal

Two optional fields on the existing `Policy` object. No new object.

```json
"appliesTo": {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "transitions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "eventType codes at which this policy is required. See codelists/eventType.csv."
    },
    "objectTypes": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Object types this policy governs."
    }
  }
},
"validity": {
  "$ref": "definitions.schema.json#/definitions/Period",
  "description": "Period during which this policy is in force."
}
```

### 2.1 The required set is derived, not declared

For any transition, the required policy set is **every Policy where**:

1. `appliesTo.transitions` contains the transition's `eventType`; **and**
2. `tenancy.tenant` matches the tenant of the object undergoing the transition; **and**
3. `validity` covers the Event `timestamp`.

There is no manifest to maintain, no manifest to version, and no manifest to reconcile.

### 2.2 Tenant scoping dissolves

The required set differs by tenant automatically, because Policy carries `tenant` at 1..1
under CP-Tenancy. Different tenants publish different Policy objects; the derived set differs
without anyone expressing that it should.

Two properties follow that a manifest would have had to state and enforce explicitly:

- **A tenant cannot inherit another tenant's gates.** Condition 2 excludes them.
- **A tenant cannot be exempted from its own.** There is no reference to omit.

### 2.3 Precedence — the rule that does the work

**Class-level applicability is a floor. Instance-level references add to it. An instance
cannot opt out of a class-level policy.**

Without this sentence the entire mechanism is decorative, because a required set that an
instance can decline is not required. It is the normative core of this CP and should be
written into the specification in those words.

### 2.4 Why `validity` is load-bearing

A derived set with no time bound is retroactively unstable: publishing a new Policy would make
every historical Event non-conformant, because the derivation would now include a policy that
did not exist when the Event was emitted.

`Mandate` and `Consent` both carry `validity`. `Policy` does not — an independent gap, since a
policy with no time bound cannot be cleanly superseded. This design makes closing it mandatory
rather than merely tidy.

### 2.5 Scope boundary

This yields a **required set**, not a workflow. Deliberately excluded:

- ordering or sequencing between gates;
- conditional branching;
- approval routing beyond `Mandate.approvalThresholds`.

If a platform needs a sequenced, branching gate engine, that stays platform-side. The moment
the standard sequences gates it is specifying an execution engine rather than stewarding a
vocabulary — the wrong side of the line, and a line that will be pushed against.

State the boundary in the specification so it cannot drift.

---

## 3. Conformance

**New requirement, F-GATE (Full level).**

> For every Event whose `eventType` appears in any Policy's `appliesTo.transitions`, the
> associated Decision's `policiesApplied` MUST contain every Policy in the derived required
> set (§2.1).

This completes what F-SEM half-does: F-SEM checks that a Decision cites *some* policies;
F-GATE checks that it cites *the required ones*.

| Fixture | Type | Must |
|---|---|---|
| `gate-complete.json` | positive | validate — Decision cites all derived policies |
| `gate-omitted.json` | negative | **be rejected** — one required policy absent from `policiesApplied` |
| `gate-cross-tenant.json` | negative | be rejected — a policy from another tenant included in the derived set |
| `gate-expired-policy.json` | positive | validate — a policy whose `validity` ended before the Event timestamp is correctly excluded |

The fourth is the one that proves §2.4 works and that the mechanism is not retroactively
unstable.

Adding a requirement to the Full level is a change to `conformance/levels.md`, which is
normative and Committee-gated.

---

## 4. Backward compatibility

**Additive at schema level** — both fields are optional, and existing Policy objects remain
valid.

**Breaking at conformance level** — F-GATE is a new Full requirement, so an implementation at
Full must satisfy it. Where no Policy declares `appliesTo`, the derived set is empty and
F-GATE passes vacuously, so the practical break lands only on implementations that adopt the
mechanism.

Rides the v1.0 window.

---

## 5. Dependency on CP-EventType-Closure

`appliesTo.transitions` references the `eventType` codelist. **While that codelist is
unenforced, a mistyped transition produces a gate that never fires, on a conformant system,
with no error.**

A governance control that fails silently and passes certification manufactures false
assurance. This is the strongest of the forcing functions on codelist closure — the others
concern consistency; this one is a security property.

If closure is declined, §2 must be documented as best-effort and the F-GATE requirement
downgraded or dropped. See CP-EventType-Closure §8.

---

## 6. Naming collision to resolve before drafting

CP-Codelist-Enforcement uses `appliesTo` as a key in the non-normative `codelists.json`
sidecar, meaning "where in an instance this codelist's values appear." This CP uses
`appliesTo` as a normative field on `Policy`, meaning "where this policy is required."

Different artifacts, unrelated meanings. **Rename the sidecar key** — the Policy field is
normative and permanent, the sidecar key is not. Proposed sidecar replacement: `valueLocations`.

**A third meaning, recorded 2026-09-01 (D-57).** `Policy.appliesTo` has already existed once, in
the withdrawn form that `governance/WITHDRAWAL-2026-08.md:20` records as a shipped defect, meaning
*the category this policy governs*. It survived in `onboarding/policy-onboarding.json` as a
`Classification` (CPV 72720000) until that instance was made schema-conformant and the key removed.
That meaning now has no artifact home: the category an onboarding eligibility policy governs is
expressed in the runtime and in prose, and nowhere in the policy a buyer would publish.

This bears on §6 rather than sitting beside it. Taking `appliesTo` for "where this policy is
required" is permanent and forecloses the earlier meaning under the name a reader would look for
it under. Either this CP states that the governed-category meaning is out of scope and needs its
own field, or the collision is resolved three ways rather than two. Evidence that the first meaning
still needs a home: D-57.

---

## 7. Rejected alternatives

**A — `TransitionManifest` root object.** **Declined** — §1.2. New object, new versioning, new
tenant scoping, overlap resolution semantics, and a process-control layer competing with
`Policy`. Everything it would provide is derivable from two fields on an object that already
exists.

**B — `requiredPolicies` array on each process object.** Moves the declaration to the
instance, which is the current failure mode: an instance that can declare its own requirements
can decline them.

**C — Sequencing and branching in `appliesTo`.** **Declined** — §2.5. That is an execution
engine, not a vocabulary.

**D — Deriving the set without `validity`.** **Declined** — §2.4. Retroactively unstable.

**E — Making `appliesTo` mandatory on `Policy`.** **Declined:** many policies are genuinely
instance-scoped (a bespoke evaluation model for one tender). Forcing a class-level binding
would produce meaningless declarations.

---

## 8. Open gates

⛔ **PA-1 — Conjunction of `transitions` and `objectTypes`.** When both are present, is the
match AND or OR? Recommend AND, but it must be stated — silence produces divergence.

⛔ **PA-2 — Transitions with no Decision.** F-GATE tests `Decision.policiesApplied`. Some
transitions emit an Event with no Decision (`invoice.created`, say). Either such transitions
cannot carry required gates, or the requirement needs a non-Decision attestation path.

⛔ **PA-3 — Policy referenced by an instance but outside its tenant.** §2.1 condition 2
excludes cross-tenant policies from the *derived* set. May an instance still reference one
explicitly? Recommend no, but this interacts directly with CP-Mandate-Scope.

⛔ **PA-4 — Superseded policies within an Event's validity window.** If two versions of a
policy have overlapping `validity`, both enter the derived set. Either forbid overlap on the
same `Policy.id`, or define precedence by `version`.
