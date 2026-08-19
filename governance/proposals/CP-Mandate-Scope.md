# CP-Mandate-Scope

**Status:** Draft — not yet balloted. **Gates open** (§6); `MS-3` is the priority gate.
**Affects:** `schema/mandate.schema.json`, `conformance/runner/`,
`conformance/suite/implementation-conformance.json`, `conformance/levels.md`,
`agent/mandate.json`, `wiki/Agent-Layer.md`
**Target:** the v1.0 train
**Breaking:** Yes — `scope` gains structure where any object satisfies it today
**Depends on:** CP-Tenancy (`tenant` identity)
---

## 1. Problem statement

`Mandate.scope` is **required** and **completely unconstrained**:

```json
"scope": {
  "type": "object",
  "description": "Data and entity scope (sandbox boundary)."
}
```

No properties. No `additionalProperties: false`. It appears in the `required` array, so an
implementation must supply it — and `{}` satisfies it.

The field that defines an agent's read boundary has no shape, and therefore cannot be
conformance-tested. An implementation can pass every current requirement while granting an
agent unbounded read access.

### 1.1 The consequence for multi-tenancy

`Policy.expression` holds an executable rule (Rego, DMN, CEL). **The standard does not specify
what inputs that expression is evaluated against.**

So the question "may a gate read data belonging to another tenant?" has no answer in the
standard. Not permitted, not prohibited — unspecified. In a certification context that is
worse than either, because both a strictly isolated implementation and one with no isolation
at all produce identical conformance reports.

Mandate is the object whose entire purpose is to be "the structural guarantee that an agent
cannot exceed its remit." On the read axis it currently guarantees nothing.

### 1.2 Relationship to the Consent primitive

`Consent` already models exactly what a cross-tenant read requires: a named party, a stated
purpose, a bounded time, access to data held by another. It is currently referenced only from
`Document.accessGrant` — near-decorative given how little of the model routes through it.

The cross-tenant read case is what makes Consent load-bearing.

---

## 2. Proposal

Give `scope` a defined structure. Restrict it to the **read boundary** only.

```json
"scope": {
  "type": "object",
  "required": ["tenant", "crossTenantRead"],
  "additionalProperties": false,
  "properties": {
    "tenant": {
      "$ref": "definitions.schema.json#/definitions/Identifier",
      "description": "The tenant whose data this agent may read. Exactly one."
    },
    "crossTenantRead": {
      "type": "string",
      "enum": ["deny", "permit"],
      "description": "Whether the agent may read outside its tenant. Default posture is deny."
    },
    "permittedTenants": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["tenant", "underConsent"],
        "additionalProperties": false,
        "properties": {
          "tenant": { "$ref": "definitions.schema.json#/definitions/Identifier" },
          "underConsent": {
            "$ref": "definitions.schema.json#/definitions/Identifier",
            "description": "The Consent grant authorising this cross-tenant read."
          }
        }
      },
      "description": "Required and non-empty when crossTenantRead is permit; MUST be absent when deny."
    },
    "objectTypes": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Object types readable within scope. Absent means all types within the tenant."
    },
    "markets": {
      "type": "array",
      "items": { "$ref": "definitions.schema.json#/definitions/Market" },
      "description": "Markets readable within scope. Absent means all markets within the tenant."
    },
    "resources": {
      "type": "array",
      "items": { "$ref": "definitions.schema.json#/definitions/Identifier" },
      "description": "Explicit object allowlist, narrowing further within the above."
    }
  }
}
```

### 2.1 Cross-tenant reads require a cited Consent

`crossTenantRead: permit` is not sufficient on its own. Each permitted tenant must cite the
`Consent` grant that authorises the read.

This is the structurally important part. It means a cross-tenant read is not a configuration
flag but an authorised act with a named grantor, a stated purpose, a bounded validity, and a
revocation path — all of which `Consent` already provides. It also makes cross-tenant access
**revocable through an existing mechanism** rather than by editing a mandate.

### 2.2 Three-way split, no overlap

| Field | Governs |
|---|---|
| `scope` | What the agent may **read** |
| `constraints` | What the agent may **do** |
| `approvalThresholds` | When a **human must approve** |

State this in the specification. Without it, implementers will encode value ceilings in
`scope` and read boundaries in `constraints`, and both will pass.

Note this resolves the overlap flagged in CP-Tenancy §4.2 from the other side:
`tenancy.markets` on a Mandate is descriptive placement; `scope.markets` is the enforced read
boundary.

### 2.3 Default posture

Absent an explicit value, `crossTenantRead` is **deny**. It is in the `required` array, so
absence is a validation failure rather than a silent default — an implementation must state
its posture rather than inherit one.

---

## 3. Conformance

**New requirement, F-SCOPE (Full level).**

> Every Identifier in `Decision.inputs` MUST resolve to an object whose `tenancy.tenant`
> equals the deciding agent's `Mandate.scope.tenant`, or appears in
> `scope.permittedTenants` where `crossTenantRead` is `permit`. Where
> `scope.objectTypes`, `scope.markets` or `scope.resources` are present, every input MUST
> additionally fall within them.

This is the answer to "may a gate read across tenants," and it is mechanically testable
because `Decision.inputs` already exists and already lists what was considered.

| Fixture | Type | Must |
|---|---|---|
| `scope-within-tenant.json` | positive | validate |
| `scope-cross-tenant-denied.json` | negative | **be rejected** — input from another tenant, `crossTenantRead: deny` |
| `scope-cross-tenant-consented.json` | positive | validate — permitted tenant with a valid cited Consent |
| `scope-cross-tenant-no-consent.json` | negative | be rejected — `permit` without `underConsent` |
| `scope-outside-objecttypes.json` | negative | be rejected — input of a type outside `objectTypes` |

The reference adapter and `agent/mandate.json` must be updated to carry a structured scope;
the broken adapter should gain a planted scope defect so the suite demonstrably discriminates
on this requirement as it does on the others.

---

## 4. Backward compatibility

**Breaking.** `scope` is already required, so every existing Mandate supplies *something* — but
almost certainly not this shape, and `additionalProperties: false` will now reject it.

This is a case where the break is the point: the migration is the first time an implementation
has to state its agent read boundary explicitly. An implementation that cannot express its
current boundary in this structure has learned something.

Rides the v1.0 window.

---

## 5. Rejected alternatives

**A — Leave `scope` free-form and document expectations in prose.** **Declined:** this is the
status quo. A required field with no shape produces identical conformance reports for isolated
and unisolated implementations.

**B — Cross-tenant read as a boolean.** **Declined:** a boolean records a decision but not its
authority. Requiring a cited `Consent` makes the read auditable, revocable and bounded in time
through machinery that already exists.

**C — Fold the read boundary into `constraints` as a Policy.** Policies are expressive enough
to state a read boundary. **Declined:** it would be stated in Rego or CEL and therefore not
mechanically checkable by the harness without executing the policy. A structural boundary must
be structural to be testable.

**D — Put value ceilings in `scope`.** **Declined** — §2.2. Value limits are behavioural and
belong in `constraints` and `approvalThresholds`, which already carry them.

**E — Permit cross-tenant reads without naming the tenants.** **Declined:** an unbounded
permit is indistinguishable from no boundary.

---

## 6. Open gates

⛔ **MS-1 — Consent validity at read time.** F-SCOPE checks a Consent is cited. Must the
harness also check the Consent is unexpired and unrevoked at the Event timestamp? Recommend
yes, but it requires the runner to resolve Consent objects, which is a larger adapter surface.

⛔ **MS-2 — Human agents.** `Mandate.agent` may reference a human Party. Does F-SCOPE apply to
human decisions, or only where `Decision.underMandate` is present with a synthetic agent?

⛔ **MS-3 — Inputs not listed.** F-SCOPE tests declared `inputs`. An implementation that reads
across tenants without declaring it passes. Is undeclared reading a separate requirement, or
accepted as outside what a document-level standard can assert?

MS-3 is the honest limit of this proposal and should be stated in the specification rather
than left for an assessor to discover: **SIGNET can test what an agent declares it read, not
what it actually read.** Claiming otherwise would be the same class of overclaim as
describing node attribution as federation.
