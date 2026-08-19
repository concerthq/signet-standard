# CP-Amendments-Round-2

**Status:** Draft — not yet balloted. Recorded as a reviewable amendment rather than folded
silently into the proposals it touches, so the reasoning survives against the original text.
**Amends:** CP-Tenancy (§A1), CP-Codelist-Enforcement (§A2)
**Target:** with the proposals it amends, in the v1.0 train
**Breaking:** Inherits the breaking status of each proposal it amends
**Depends on:** none
Two amendments arising from the second implementation question set. Both are recorded here
rather than folded silently into the CPs they touch, so the reasoning survives and the change
is reviewable against the original text.

---

## A1 — CP-Tenancy: same-tenant event chaining

### A1.1 What prompted it

An implementation question asked whether the event chain is partitioned by tenant or is a
single chain with tenant recorded on each event.

**Neither.** The chain is **per subject**. From the adapter contract: `createObject` emits an
Event that hash-chains "to any prior event for the subject"; `applyChange` emits an Event whose
`previousEventHash` links to "the subject's most recent event." There is no global chain and no
tenant chain — there are as many chains as there are subjects.

The question was well-formed and the model does not answer it in either of the terms offered.

### A1.2 The gap

Tenant partitioning is **emergent, not enforced**. A subject belongs to one tenant, so in
practice chains do not cross tenants. Nothing prevents it.

CP-Tenancy sets `Event.tenancy.tenant` at 1..1, which makes tenant-scoped audit extraction
possible and makes a cross-tenant link *detectable*. Detectable is not prevented, and a
multi-tenant deployment needs an isolation guarantee it can assert rather than one it can
inspect for.

### A1.3 Amendment

Add to CP-Tenancy §4.4 and to the C-EVT requirement:

> **An Event's `previousEventHash` MUST reference an Event carrying the same
> `tenancy.tenant`.**

Cost: one check in `conformance/runner/lib.js`, alongside the existing chain verification, and
one negative fixture (`event-cross-tenant-chain.json`, which MUST be rejected). The broken
adapter should gain a planted cross-tenant link so the suite demonstrably discriminates on this
rule as it does on the others.

This converts emergent isolation into a testable guarantee, which is the property a
multi-tenant deployment actually needs to assert to its own auditors.

### A1.4 What it does not provide

**There is no total order within a tenant.** A tenant-level sealed log — one chain covering
everything the tenant did — is a different design from what exists and is not proposed here.

Implementations should design assuming **one authoritative chain per subject**, and any
tenant-level ordering is a projection they construct, not a guarantee the standard makes.
State this in `Trust-Layer.md` so it is not inferred from the isolation rule.

---

## A2 — CP-Codelist-Enforcement: C-3 dissolution

### A2.1 What prompted it

Gate C-3 asked how a closed codelist retires a value without invalidating historical
instances, and proposed a fourth CSV `Status` column. `eventType` closure made the question
urgent, because event streams are permanent by design.

### A2.2 Why the fourth column is wrong

It breaks every codelist file and the CI header lint — for **all** lists — to solve a problem
that exists only for closed ones. And it embeds a lifecycle in a format with no version axis.

More fundamentally, retirement has no coherent meaning here. A closed vocabulary over an
append-only stream cannot retire a value, because retirement means "no longer valid" and every
historical event asserts otherwise. Any `deprecated` marker immediately needs a rule saying it
does not apply retroactively — at which point the marker is not doing lifecycle work. It is
doing **guidance** work.

### A2.3 Amendment

**Codes are never retired.** Make the marker guidance, and put it where guidance belongs — the
non-normative disposition file, not the normative CSV.

```json
"eventType": {
  "disposition": "closed",
  "file": "codelists/eventType.csv",
  "discouraged": {
    "award.decided": {
      "since": "1.0.0",
      "prefer": "award.created",
      "note": "Superseded by award.created; existing events remain valid."
    }
  }
}
```

Properties:

- The CSV keeps its three columns. The header lint is untouched. **No existing codelist file
  changes.**
- `discouraged` values **validate**. The harness reports them as an informational note, never
  as a pass/fail input — preserving CN-1.
- **Removal is a CDM major, and it is the only breaking path.** A code leaves the CSV only at a
  major version; instances at earlier versions remain conformant against their declared
  version, which the version-stable URIs already guarantee, and migration is a
  re-certification concern that `certification.md` already covers.

### A2.4 Changes to CP-Codelist-Enforcement

| Section | Change |
|---|---|
| §7, gate C-3 | **Resolved.** Move to resolved gates with the §A2.2 reasoning |
| §2.1 | Add the `discouraged` block to the disposition file schema |
| §4 | Report gains an informational `discouraged` result type |
| §6 | Add rejected alternative: fourth CSV column, declined per §A2.2 |
| §3 | Add a positive fixture: a discouraged value validates and is reported |

The fourth column must be recorded as declined **with reasoning**, because it is the obvious
answer and will be re-proposed otherwise.

### A2.5 Naming collision

CP-Codelist-Enforcement §2.1 uses `appliesTo` as a sidecar key meaning "where in an instance
this codelist's values appear." CP-Policy-Applicability introduces `appliesTo` as a normative
field on `Policy` meaning "where this policy is required."

**Rename the sidecar key to `valueLocations`.** The Policy field is normative and permanent;
the sidecar key is neither.

---

## A3 — Gates that dissolved

Both amendments are gates that dissolved rather than resolved. Recorded as such, with the
declined alternatives, so neither is re-proposed without new argument.

| Gate | Dissolved by | Declined alternative |
|---|---|---|
| Event chain partitioning | Chain is per subject; isolation becomes a conformance rule over the existing structure | Tenant-partitioned chains; single global chain |
| C-3 retirement semantics | Codes are never retired; guidance moves to the non-normative sidecar | Fourth CSV `Status` column |
| Transition manifest scoping (CP-Policy-Applicability) | No manifest exists to scope; the required set is derived from tenant-scoped policies | `TransitionManifest` root object |
| EventType completeness scope | Vocabulary derived from existing status enums, CI-checked | Significance-based curation |
