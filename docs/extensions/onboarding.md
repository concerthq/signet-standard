# SIGNET Canonical Data Model — Supplier Onboarding Extension v0.1

**Status:** Working Draft · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Extends:** SIGNET CDM v0.1 (process layer), reusing the foundation and trust layers.

This extension adds the supplier-onboarding lifecycle to the SIGNET CDM. It defines
two new process-layer objects — `OnboardingCase` and `SupplierQualification` — and
specifies how they reuse the existing `Party`, `Credential`, `Policy`, `Decision`,
`Event`, `Consent`, and `Provenance` objects. It introduces no new layer and
redefines no core field.

---

## 1. Design principle (normative intent)

**The onboarding workflow is stable and normative; the credentials it handles are
extensible and will change.** The state machine in §3 is the durable core: the
sequence by which a supplier moves from invitation to qualification, and the rules
governing those transitions, do not change as practice evolves. What changes is the
*credential layer* — which facts are required, who issues them, and how they are
proved. Today a fact may be a manually attested document; tomorrow the same fact is
an issuer-signed Verifiable Credential. The `OnboardingCase` lifecycle is identical
in both worlds. Implementations MUST treat the workflow states as the conformance
surface and the credential types as an open, evolvable set (§6).

## 2. The two lifecycles (and why they are separate)

Onboarding involves two distinct objects with two distinct lifecycles, and they
MUST NOT be fused:

- **`OnboardingCase`** — a transactional *workflow instance*. It starts, runs, and
  ends. It is buyer-internal. It *produces or refreshes* a `SupplierQualification`.
- **`SupplierQualification`** — a *durable status* that persists across sourcing
  events and across re-validations. A re-validation is a **new `OnboardingCase`**
  run against an **existing `SupplierQualification`**, never a re-onboard.

This separation is the federation seam. The `OnboardingCase` remains buyer-internal
in all deployments. The `SupplierQualification` is the object that, in a federated
marketplace, a supplier could hold and present across buyers. Keeping them separate
now makes portability an extension rather than a re-model (§7).

## 3. `OnboardingCase` — workflow state model (normative)

States: `initiated`, `invited`, `submitted`, `under_verification`, `info_requested`,
`pending_approval`, `qualified`, `rejected`, `withdrawn`.

| From | To | Trigger |
|---|---|---|
| *(none)* | `initiated` | buyer creates the case |
| `initiated` | `invited` | buyer invites the supplier *(entryMode `invited`, primary path)* |
| `initiated` | `submitted` | supplier self-registers *(entryMode `submitted`, MUST be supported)* |
| `invited` | `submitted` | supplier provides required information |
| `invited` | `withdrawn` | supplier declines / buyer cancels |
| `submitted` | `under_verification` | verification begins (agent or human) |
| `under_verification` | `info_requested` | a gap or discrepancy is found |
| `info_requested` | `submitted` | supplier re-supplies |
| `under_verification` | `pending_approval` | checks complete; mandate threshold requires human sign-off |
| `under_verification` | `qualified` | checks pass within an agent's mandate (auto-qualify) |
| `under_verification` | `rejected` | checks fail |
| `pending_approval` | `qualified` | human approver confirms |
| `pending_approval` | `rejected` | human approver declines |
| *any non-terminal* | `withdrawn` | supplier or buyer abandons |

Terminal states: `qualified`, `rejected`, `withdrawn`. A `qualified` case MUST
reference the `SupplierQualification` it produces or refreshes (`producesQualification`).

**Entry modes.** `entryMode` MUST be one of `invited` (buyer-initiated; the primary
path) or `submitted` (supplier self-registration). Both MUST be supported by a
conformant implementation.

**Case types.** `caseType` is `onboarding`, `revalidation`, or `remediation`. A
`revalidation` or `remediation` case is opened against an existing
`SupplierQualification` (§5) and follows the same state model.

## 4. `SupplierQualification` — status state model (normative)

States: `active`, `conditional`, `suspended`, `expired`, `offboarded`.

| From | To | Trigger |
|---|---|---|
| *(none)* | `active` / `conditional` | a `qualified` `OnboardingCase` |
| `conditional` | `active` | conditions cleared |
| `active` / `conditional` | `suspended` | risk event, expired credential, or performance issue *(event-driven; no case required)* |
| `suspended` | `active` / `conditional` | issue resolved |
| `active` / `conditional` | `expired` | validity window lapses *(opens a revalidation case)* |
| `expired` | `active` / `conditional` | revalidation case succeeds |
| *any* | `offboarded` | relationship ends *(terminal)* |

**Conditional qualification (first-class).** `conditional` is a first-class status,
not a flag on `active`. A `conditional` qualification carries one or more
`conditions`, each of type `valueCap` (a maximum contract value the supplier is
qualified for), `categoryRestriction` (the classifications the supplier is limited
to), `pendingCheck` (a check that must resolve by a `dueDate`), or `other`. Buyers
and agents evaluating a supplier for a sourcing event MUST honour these conditions.

**Event-driven transitions.** Transitions to `suspended` and `expired` are driven by
`Event`s (a screening result, a performance signal, a credential expiry), not by a
running `OnboardingCase`. This is why the two objects are separate: the
qualification reacts to the world continuously; the case is how a buyer acts on it.

## 5. The three flows

1. **First onboarding** — an `OnboardingCase` runs `initiated → … → qualified`,
   creating a `SupplierQualification` in `active` or `conditional`.
2. **Re-validation** — a credential nears expiry; the qualification flags `expired`;
   a new `OnboardingCase` (`caseType: revalidation`) refreshes the credentials and
   resets `validity`. On failure the qualification moves to `suspended`.
3. **Risk event** — a screening or performance `Event` moves the qualification to
   `suspended` directly, optionally opening a `remediation` case.

## 6. Reuse of core objects

- **`Party`** — the supplier (`subjectParty` / `supplier`) and buyer
  (`initiatingParty` / `qualifiedBy`).
- **`Credential`** — every collected/durable fact. The `proof` member is the
  upgrade path: `manualAttestation` today, an issuer signature later, **same object**.
  `requiredCredentialTypes` on the case is an open list (see
  `codelists/credentialType.csv`); implementations MAY add types under the extension
  mechanism without a normative change.
- **`Policy`** — the buyer's qualification criteria, as an eligibility `Policy`
  (`policyType: eligibility`). An agent reads it and assesses collected credentials
  against it — the same pattern as event evaluation.
- **`Decision`** — the qualify/reject decision (`decisionType: qualification`),
  carrying rationale, the credentials considered, the policy applied, `provenance`,
  and `humanApproval` where the mandate threshold required it (the `pending_approval`
  state). This reuses the agent-governance pattern: routine cases auto-qualify within
  mandate; high-value/high-risk cases require named human approval.
- **`Event`** — each state transition is an append-only, hash-chained `Event` with
  `provenance`, giving a qualification an auditable history rather than a stale
  snapshot.
- **`Consent`** — the supplier's grant of specific attributes for a stated purpose,
  time-bounded and revocable. Near-inert in a buyer-internal deployment; modelled now
  because it is the exact primitive federation requires (§7).

## 7. The screening boundary (normative)

SIGNET **carries and verifies** screening attestations; it **does not perform** the
regulatory determination. A sanctions/AML/KYC outcome MUST be represented as a
`Credential` of type `sanctionsScreening` whose `issuer` is the screening provider
that made the determination and whose `credentialSubject` records the result and the
lists checked, with `provenance`. A conformant implementation MUST NOT represent
SIGNET itself as the issuer of a screening determination. This keeps the standard
neutral and out of regulated-determination territory.

## 8. Federated seams (informative)

This buyer-internal model becomes a federated, portable-credential model by
extension, not rebuild, because of three choices made here: (a) `OnboardingCase` and
`SupplierQualification` are separate objects; (b) facts are `Credential`s with an
upgradeable `proof`; (c) `Consent` is present. In federation, the supplier owns and
presents the `SupplierQualification` and its `Credential`s; the buyer's case becomes
"verify presented credentials against our eligibility `Policy`" and the
`under_verification` state **collapses** — from collecting documents over weeks to
verifying credential signatures in seconds. The state machine is unchanged.

## 9. Conformance

An implementation conforms to this extension if it: implements the `OnboardingCase`
state model (§3) including both entry modes; implements the `SupplierQualification`
state model (§4) including first-class `conditional` status and conditions; emits a
qualification `Decision` and a hash-chained `Event` per transition (§6); represents
screening outcomes per the boundary (§7); and validates `OnboardingCase` and
`SupplierQualification` instances against their schemas. Credential *types* are not
part of the conformance surface — the workflow is.

## 10. Schemas & examples

- `schema/onboarding-case.schema.json`, `schema/supplier-qualification.schema.json`
- `codelists/credentialType.csv` (open)
- `examples/onboarding-conditional.json` — an invited, agent-qualified case
- `examples/supplier-qualification-conditional.json` — a conditional qualification
  with a €5M value cap and a pending financial check
