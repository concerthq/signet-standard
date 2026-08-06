# Endorsement Adapter Contracts — agent and consent

**Status:** Draft, pending ballot of [CP-Mandate-enforcement](../../governance/proposals/CP-Mandate-enforcement.md)
and [CP-Consent-revocation](../../governance/proposals/CP-Consent-revocation.md).
**Versioned with the suite**, not independently.
**Licence:** Apache-2.0

The [base adapter contract](adapter-contract.md) is unchanged and remains the whole of what an
implementation must expose to be certified at Core or Full. The two surfaces below are **additional
and optional**, implemented only by an implementation seeking the corresponding endorsement. An
implementation that exposes neither is unaffected by anything in this document.

## Why a separate adapter at all

The four base methods — `createObject`, `applyChange`, `getEvents`, `projectInvoiceToUBL` — are all
**productive**. None has a refusal surface for *not permitted*, as distinct from *structurally
invalid*. Two alternatives were rejected:

- **Extending `createObject` with an acting-agent context** overloads a method whose contract is
  document construction, and makes every existing adapter signature ambiguous.
- **Adding `actAsAgent` to the base contract** obliges every implementation to implement a method
  most will never use.

A separate adapter costs nothing to an implementation that does not seek the endorsement.

---

## 1. Agent adapter — `E-MDT`

```js
module.exports = { createAdapter, createAgentAdapter };

function createAgentAdapter() {
  return {
    // Attempt a governed action under a mandate. Returns EITHER a Decision (the
    // action proceeded) OR a Refusal (it did not). Never both, never neither.
    attemptAction(request) -> { decision } | { refusal },

    // The event stream for a subject, oldest first — the same contract as the base
    // adapter's getEvents. Refusals MUST be visible here (E-MDT-7).
    getEvents(subjectId) -> [event, ...]
  };
}
```

### `request`

The harness supplies the whole world for each attempt. Nothing is read from the implementation's own
storage or from the system clock, so every scenario is deterministic and reproducible under CN-4.

| Field | Type | Meaning |
|-------|------|---------|
| `mandate` | `Mandate` | The mandate relied on. |
| `policies` | `{ [id]: Policy }` | Every policy the mandate's `constraints` and `approvalThresholds` reference. |
| `grantEvents` | `Event[]` | The ordered event stream for the mandate — `mandate.granted`, `mandate.revoked` (CDM §7.4). |
| `capability` | `string` | The capability being exercised, e.g. `award.decision`. |
| `subject` | `Identifier` | The object acted upon. |
| `action` | `object` | The proposed action. The suite's scenarios carry `{ value: { amount, currency } }`. |
| `humanApproval` | `Identifier?` | An approval offered *with* the attempt, by the harness. Present only where the scenario is testing whether an approval cures a refusal — it does not, for a `constraints` policy (E-MDT-6). An adapter MUST NOT invent one: see below. |
| `atTime` | `date-time` | Evaluation time, supplied by the harness rather than read from the clock. |

### `Refusal`

```json
{
  "rule": "E-MDT-1",
  "mandate": { "scheme": "did", "id": "did:web:buyer.example#mandate-eval-3" },
  "policy":  { "scheme": "did", "id": "did:web:buyer.example#policy-approval-10m" },
  "reason":  "Award value 12000000 EUR exceeds the autonomous ceiling of 10000000 EUR."
}
```

`policy` is **optional**. Refusals under E-MDT-3, E-MDT-4, and E-MDT-5 derive from the `Mandate`
itself — capability, scope, effectiveness — not from a Policy. Only E-MDT-1 and E-MDT-6 cite one.

### An adapter never invents an approval

E-MDT-1 has **no approval branch**: an action above an `approvalThresholds` policy must return a
`Refusal`, not a `Decision` carrying `humanApproval`.

A conformance run is unattended. No person approves anything during one, so an adapter that
satisfied the check by populating `humanApproval` would be writing an identifier for an event that
did not occur — which is the behaviour the endorsement exists to detect. Tightening what the field
must resolve to does not help: an implementation willing to fabricate an approval will fabricate a
well-formed one, resolvable authority credential and all. A richer artifact buys a richer fiction.

An unattended agent meeting a human-approval threshold should **stop**, not approve on the human's
behalf. Real flows resume — a human approves and the action is re-attempted carrying the approval —
and the suite does not test that resumption, because it cannot observe it honestly. What the check
claims is exactly what it can see: the agent did not proceed on its own authority.

A bare boolean refusal would satisfy a naive suite while telling a downstream auditor nothing.
Naming the rule and the instrument that produced the refusal is what makes the record useful.

### Refusals are evented (E-MDT-7)

Every refusal MUST emit an `Event` of type `mandate.refused` whose `subject` is the mandate, carrying
`actor`, `timestamp`, and `provenance` like any other event, and retrievable through `getEvents`.

Without this, *refused* and *never attempted* are indistinguishable in the record, so an agent can
probe its ceiling repeatedly and invisibly — precisely the behaviour the endorsement exists to make
auditable.

### Policy evaluation in the suite's fixtures

The harness must know the expected outcome of each scenario independently of the implementation, so
the suite re-evaluates every policy itself. `Policy.expression` is free-form by design — `rego`,
`dmn`, `cel` — and the suite cannot host an engine for each. The suite's own fixtures therefore use
a **restricted comparison subset** (`expressionLanguage: "cel"`), of the form:

```
action.value.amount <= 10000000
```

The evaluator is in `conformance/rules/check-endorsements.js` and is perhaps thirty lines. An
implementation is free to evaluate policies however it likes; what is tested is whether its
*behaviour* matches the policy's meaning, not how it computed it. This is why no schema field is
added: the harness supplies the mandate and the policies, so enforcement is observable from
behaviour, and a self-asserted "I checked" flag would reproduce the very failure being fixed.

### Known limit — `Mandate.scope` is untyped

`Mandate.scope` is `type: object` in CDM v0.1 with no defined structure, so E-MDT-4 cannot be tested
against the model alone. The suite's fixtures fix a convention for their own use:

```json
"scope": { "entities": ["did:web:buyer.example#event-1207"], "maxAutonomousValue": { "amount": 10000000, "currency": "EUR" } }
```

E-MDT-4 checks membership of `subject` in `scope.entities`. That is a property of the fixtures, not
of the standard, and it is recorded here rather than left implicit: typing `scope` is a candidate for
its own change proposal, and until one carries, this check binds only against the published
convention.

---

## 2. Consent adapter — `E-CNS`

```js
module.exports = { createAdapter, createConsentAdapter };

function createConsentAdapter() {
  return {
    // Seed the world for a scenario: the grants, the documents, and the event stream.
    load({ consents, documents, events }) -> void,

    // Decide whether `requestingParty` may access `documentId` at `atTime`.
    authoriseAccess(documentId, requestingParty, atTime) -> { authorisation } | { refusal },

    // Offer an event for recording. Returns a Refusal where the event is inadmissible —
    // a consent.revoked against an irrevocable grant (E-CNS-3).
    recordEvent(event) -> { accepted: true } | { refusal }
  };
}
```

`atTime` is supplied by the harness rather than read from the system clock, so effectiveness and
validity checks are deterministic and reproducible under CN-4.

### `Refusal`

The same shape as the agent adapter's, with `rule` carrying the `E-CNS-*` identifier and `policy`
**omitted** — consent refusals derive from the `Consent` object, not from a Policy. A `consent`
field carries the identifier of the grant that was evaluated, or is absent where no grant was found.

```json
{
  "rule": "E-CNS-1",
  "consent": { "scheme": "did", "id": "did:web:supplier.example#consent-4471" },
  "reason": "Grant was revoked at 2026-03-01T00:00:00Z; access requested at 2026-04-01T00:00:00Z."
}
```

### `Authorisation`

```json
{
  "document": "urn:doc:financials-2025",
  "consent": { "scheme": "did", "id": "did:web:supplier.example#consent-4471" },
  "grantedTo": { "scheme": "did", "id": "did:web:buyer.example#buyer" },
  "atTime": "2026-02-01T00:00:00Z"
}
```

`consent` is `null` where the document carries no `accessGrant` — the document was never gated, and
saying so explicitly is what E-CNS-4 tests in one of its two directions.

### Refusals are not evented here

Deliberately asymmetric with `mandate.refused`. A refused *read* discloses nothing and changes no
state; a refused *agent action* reveals the position of a ceiling the agent is testing. Whether read
attempts should nonetheless be evented for audit purposes is left to implementations and profiles.

---

## 3. What these adapters do not do

They do not make the implementation certified, and they do not currently make it endorsed. Both
proposals are drafts; `conformance/rules/check-endorsements.js` runs the checks and reports, but no
endorsement may appear in a mark until the corresponding proposal carries and its
[register entry](../../governance/endorsement-register.md) moves to `active`.

They also do not establish security posture. `E-CNS` certifies that grants are represented
interoperably and that the implementation's **own authorisation decisions** honour their terms.
Whether a production system physically refuses a read is assessed under ISO 27001 and SOC 2 regimes,
and Concert does not claim to certify it.

See `reference-adapter.js` for conformant implementations of both surfaces, and `broken-adapter.js`
for the third planted defect — an adapter that cites its mandate and policies correctly and does not
enforce them, which passes F-SEM and fails E-MDT-1.
