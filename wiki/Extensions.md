# Extensions

The CDM is **extensible without forking**, following the OCDS extension pattern. Extensions
let domains elaborate the model (e.g. defence procurement, construction) while keeping the
core lean.

## What an extension is

> An extension is a **published, versioned package** that adds object types, fields, or
> codelist values **under its own namespace** (specification §11.1).

## The rules

1. **Add, don't change.** Extensions **MUST NOT** redefine or remove core fields. They only
   add new structure under their own namespace.
2. **Promotion path.** Community extensions **MAY** be submitted to Concert for review and,
   if broadly useful, promoted into the core model through the
   [change-control process](Governance-and-Versioning). This keeps the core lean while
   allowing domain-specific elaboration.
3. **Separate conformance.** Core [conformance](Validation-and-Conformance) is assessed
   against the **core model only**; extensions are conformance-assessed separately. All four
   in-tree extensions below now carry executable cross-object checkers under
   `conformance/rules/` (run in CI), so each has **machine-backed conformance** beyond schema
   validation — see [Conformance Harness → Extension conformance](Conformance-Harness#extension-conformance-rules).

## Proposing an extension

Per [CONTRIBUTING.md](Contributing), extensions that *add* (rather than change) structure
should be proposed as packages under an `/extensions` path. The general flow:

1. Open an issue describing the gap the extension fills.
2. Define the new object types / fields / codelist values under a dedicated namespace.
3. Provide at least one example instance and the schema additions.
4. Submit a pull request; CI must pass.

See [Contributing](Contributing) and [Governance & Versioning](Governance-and-Versioning).

## Example: the Auction extension

The **[Auction extension](Process-Layer#auction)** (`docs/extensions/auction.md`)
is a worked example of the pattern. It adds two process-layer objects — `Auction` and `Bid` —
and one open codelist (`auctionType`), defining a standardised auction as a *profile of the
sourcing flow*. It **adds, does not change**: the close reuses the existing
[`Decision`](Agent-Layer#decision)/[`Award`](Process-Layer#award) objects, eligibility ties to
`SupplierQualification`, and the bid history is a hash-chained [`Event`](Trust-Layer#event)
trail — no core field is redefined.

Because it reuses the core objects and is broadly useful, it is shipped **in-tree** (under the
core `schema/`, `codelists/`, and `examples/` directories and the core `v0.1` namespace)
rather than as a separately-namespaced package — it is effectively a candidate already on the
[promotion path](Governance-and-Versioning). A domain extension that introduced genuinely new,
domain-specific structure would instead live under its own namespace per the rules above. Its
cross-object rules — the recorded winner equals the deterministic close, and every bid respects
the reserve — are machine-checked by `conformance/rules/check-auction.js`
(`npm run conformance:extensions`), and a runnable demonstration is at `npm run auction`.

## The onboarding extension

The **onboarding extension** (`docs/extensions/onboarding.md`) adds the supplier-onboarding
lifecycle: two process-layer objects — `OnboardingCase` (a buyer-internal workflow instance)
and `SupplierQualification` (a durable status with first-class `conditional` qualification,
value caps, and category restrictions) — plus the open `credentialType` codelist. The workflow
state machine is the normative conformance surface; the credential types it handles are an
open, evolvable set. It **adds, does not change**: facts are
[`Credential`](Foundation-Layer#credential)s with an upgradeable `proof`, the qualify/reject
decision reuses [`Decision`](Agent-Layer#decision) with the agent-governance pattern
(auto-qualify within mandate, human approval above it), and every state transition is a
hash-chained [`Event`](Trust-Layer#event).

Like the auction extension it ships **in-tree** (core `v0.1` namespace). **Status: schemas,
validated worked examples, and a runnable demonstration (`npm run onboarding`) are in-tree**;
the normative spec is at `docs/extensions/onboarding.md`. Its cross-object rules — conditional
qualifications carry their conditions, and case↔qualification closure holds both ways — are
machine-checked by `conformance/rules/check-onboarding.js` (`npm run conformance:extensions`).

## Working Draft: the commodity-risk extension

The **commodity-risk extension** (`docs/extensions/commodity-risk.md`)
is the first extension **proposed by a member organisation**, reviewed under the identical
process, terms, and bar that apply to any proposer (the Standards Committee's decision record
is in-repo at `governance/reviews/2026-07-commodity-risk.md`). It adds **portfolio-level
commodity risk governance** — positions, coverage corridors, price marks, coverage
assessments, price-shock scenarios, and hedge proposals — with electricity as the reference
commodity but a commodity-generic schema.

It is a good illustration of the **namespaced-additions** case (contrast the auction
extension, whose additions are all new core-namespace objects): its **additions to existing
core objects** (`Contract`, `Need`, `Award`, `Decision`) live under a dedicated
**`commodityRisk`** namespace key and MUST NOT alter any core object's `required` set or
`additionalProperties` semantics. It still **adds, does not change** — an approved
`HedgeProposal` instantiates a core [`Need`](Process-Layer#need); the coverage corridor is a
subtype of the Agent-layer [`Policy`](Agent-Layer#policy) so it bounds a synthetic agent's
`Mandate`; and every assessment is a hash-anchored [`Event`](Trust-Layer#event).

**Status: Working Draft, landed in-tree (v0.10.0).** The full technical package has shipped:
six schemas (`ExposurePosition`, `CoveragePolicy` as a `Policy` subtype, `PriceMark`,
`CoverageAssessment`, `Scenario`, `HedgeProposal`), ten codelists (`positionStatus` and
`policyEvaluationStatus` are **closed**), an eleven-file full-loop worked example under
`examples/commodity-risk/` (`belowMinimum` → proposal → `executed` → `withinCorridor`,
arithmetically reconciled), and the six conformance rules as an executable checker
(`conformance/rules/check-commodity-risk.js`, run by `npm run conformance:commodity-risk`) —
three of them cross-object checks beyond schema validation: reconciliation arithmetic,
scenario fixed-cost invariance, and escalation-first rule ordering. The new object schemas
ship in-tree under the core `v0.1` namespace; the additive fields on core objects use the
namespaced `commodityRisk` key. The Standards Committee has **merged it as a Working Draft**
(`governance/reviews/2026-07-commodity-risk-merge.md`).

## Working Draft: the identity profile

The **identity profile** (`docs/extensions/identity.md`) specifies how SIGNET represents
**natural persons** — the third identity plane alongside organisations
([`Party`](Foundation-Layer#party)) and synthetic agents
([`SyntheticAgent`](Agent-Layer#syntheticagent)) — and makes human authority symmetric with
agent authority. Like the auction extension it ships **in-tree** (core `v0.1` namespace): it
adds one object (`Approval`), one `credentialType` codelist value (`delegationOfAuthority`),
and three normative rules, with **no change to any core object**.

It leans entirely on primitives the core already has — it **adds, does not change**:

- **Humans act under Mandates too.** A corporate delegation-of-authority matrix ("the category
  director may approve to €10M; above that, the CFO") is a human [`Mandate`](Agent-Layer#mandate)
  — the core object is reused **unchanged**, because `Mandate.agent` is an `Identifier` that
  accepts any actor, person or synthetic agent. A threshold being exceeded is a verifiable
  handoff from one mandate to another.
- **Authority is a Credential.** A person's authority to approve is a `delegationOfAuthority`
  [`Credential`](Foundation-Layer#credential) issued by their organisation — the
  supplier-qualification pattern reapplied to people, upgradeable to a qualified eIDAS wallet
  attestation with no structural change (the object upgrades its `proof`; nothing structural
  moves).
- **`Approval` makes `humanApproval` resolvable.** Where a [`Decision`](Agent-Layer#decision)
  carries `humanApproval`, that reference SHOULD resolve to an `Approval` object — *who*
  (pseudonymous), in *what role*, under *what authority*, approved *which decision*, *when* — so
  a counterparty can verify *that an authorised person approved*, and that their authority
  ceiling covered the decision's value, without learning who they are.

**No personal data in hash-anchored records (normative).** Objects and
[`Event`](Trust-Layer#event)s that participate in hash chains MUST NOT carry personal data;
person references MUST be pseudonymous identifiers (e.g. `did:web:buyer.example#officer-7c2f`).
An append-only, tamper-evident record is irreconcilable with erasure obligations (e.g. the GDPR
right to erasure) if it carries PII; pseudonymisation preserves both chain integrity and
erasability, and the pseudonym→person mapping is the identifying organisation's own
access-controlled, erasable obligation. SIGNET records **who acted under what authority; it
never authenticates anyone** — authentication (SSO, passkeys, identity-proofing) is permanently
out of scope, as is any claim of identity assurance in the eIDAS/NIST sense.

**Status: Working Draft, landed in-tree (v0.9.0).** The `Approval` schema
(`schema/approval.schema.json`) and a validated worked example (`examples/approval.json` — the
approval behind the [agent demonstration](Agent-Layer)'s award) are in the repository, and the
agent demo emits the verifiable `Approval` at runtime and checks the approver's authority
ceiling covers the award value. Its cross-object rules are machine-checked at the **Full**
level by `conformance/rules/check-identity.js` (`npm run conformance:extensions`): approver
pseudonymity, that the authority credential is a `delegationOfAuthority` carrying a basis, that
a `Decision`'s `humanApproval` resolves to an `Approval` that points back at it, and that the
authority ceiling covers the decided value.

## Specified as Working Drafts (schemas to follow)

Five further extensions close the remaining purchasing (P2P) and supplier-management (SRM)
coverage gaps. Each has landed as a **prose spec only** under `docs/extensions/`, following the
spec-first sequence commodity-risk established — the Standards Committee reviews the spec, then
schemas, worked examples, and conformance rules follow **per-extension** as a later patch. None
is in-tree under `schema/` yet, and no tag has been cut for them.

| Extension | Adds | Fills |
|-----------|------|-------|
| **receipt** (`docs/extensions/receipt.md`) | `Receipt`, `MatchResult` | Receipt/acceptance and the governed **three-way match** — tolerances as a `matchTolerance` [`Policy`](Agent-Layer#policy), the match itself a mandate-bound [`Decision`](Agent-Layer#decision). Closes the `Order → … → Invoice` gap. |
| **performance** (`docs/extensions/performance.md`) | `ServiceLevelPolicy`, `PerformanceAssessment` | SLAs/KPIs as a `serviceLevel` [`Policy`](Agent-Layer#policy) and derived, event-anchored performance assessments (a sibling of commodity-risk's `CoverageAssessment`) that **feed the qualification lifecycle** — sustained breach drives `conditional`/`suspended`. |
| **amendments** (`docs/extensions/amendments.md`) | `Amendment` | Event-anchored **contract deltas** (variation / extension / renewal / novation / termination); current state is derived by replaying executed amendments in sequence, so history stays tamper-evident. |
| **frameworks** (`docs/extensions/frameworks.md`) | `FrameworkAgreement` (a `Contract` subtype), `CallOff` | **Framework agreements and call-offs** (direct award or mini-competition, the latter a [`SourcingEvent`](Process-Layer#sourcingevent) scoped to framework suppliers) with a conformance-checkable drawdown invariant (Σ call-offs ≤ ceiling). Supplies the objects behind commodity-risk's `callOffUnderFramework`. |
| **negotiation** (`docs/extensions/negotiation.md`) | `Negotiation`, `Offer` | A governed exchange of offers over **named terms under per-term [`Mandate`](Agent-Layer#mandate)s** — the auction floor mechanic generalised from price to many terms. The object model behind the existing [`decisionType: negotiationMove`](Codelists#decisiontype). |

Each **adds, does not change**: they reuse core `Policy`, `Decision`, `Event`, `Contract`,
`Mandate`, and `SupplierQualification`, and where they touch a core object they do so through a
namespaced additive field, never a redefinition. Priority order for the schema patches is
receipt → performance → amendments → frameworks → negotiation.

## Relationship to the agent layer

Note that the [Agent Layer](Agent-Layer) is **not** an extension — it is core, SIGNET's
original contribution. Extensions are for *additional* domain structure on top of the core
four-layer model.
