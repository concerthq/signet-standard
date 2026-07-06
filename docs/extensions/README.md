# SIGNET Extensions & Profiles

The SIGNET core stays lean; domain structure is added through **extensions and profiles**
that follow the OCDS extension pattern: they **add** object types, fields, or codelist
values, and **MUST NOT** redefine or remove core fields. Broadly-useful extensions may be
promoted toward the core through the Standards Committee
[change-control process](../../wiki/Governance-and-Versioning.md).

Each spec is named for its extension/profile **id** (unversioned — the version lives inside
the document; the URL stays stable).

| Id | What it adds | Status | Spec |
|----|--------------|--------|------|
| `onboarding` | `OnboardingCase`, `SupplierQualification` (durable status with first-class `conditional` qualification, value caps, category restrictions); `credentialType` codelist | **Schemas + demo shipped** (in-tree, core `v0.1`); conformance rules ship (`conformance/rules/check-onboarding.js`) | [`onboarding.md`](onboarding.md) |
| `auction` | `Auction`, `Bid` (a profile of the sourcing flow — reverse / english / dutch / sealed-bid / multi-criteria; deterministic, operator-independent close); `auctionType` codelist | **Schemas + demo shipped** (in-tree, core `v0.1`); conformance rules ship (`conformance/rules/check-auction.js`) | [`auction.md`](auction.md) |
| `identity` | `Approval` (verifiable human approval); `delegationOfAuthority` credential type; normative no-PII rule for hash-anchored records | **Working Draft** — schema + worked example shipped; demo emits `Approval`; conformance rules ship (`conformance/rules/check-identity.js`) | [`identity.md`](identity.md) |
| `commodity-risk` | Portfolio-level commodity risk governance (positions, coverage corridors as Policy subtypes, price marks, assessments, price-shock scenarios, hedge proposals bridging to core `Need`) | **Spec + schemas + conformance rules shipped** — six schemas, ten codelists, an eleven-file full-loop example, and the six rules as an executable checker (`conformance/rules/check-commodity-risk.js`); separately-namespaced | [`commodity-risk.md`](commodity-risk.md) |
| `receipt` | `Receipt`, `MatchResult` — receipt/acceptance and the governed **three-way match** (tolerances as a `matchTolerance` Policy; the match is a mandate-bound Decision) | **Working Draft (spec only; schemas to follow)** | [`receipt.md`](receipt.md) |
| `performance` | `ServiceLevelPolicy`, `PerformanceAssessment` — SLAs/KPIs as Policy and derived, event-anchored supplier performance assessments that feed the qualification lifecycle | **Working Draft (spec only; schemas to follow)** | [`performance.md`](performance.md) |
| `amendments` | `Amendment` — event-anchored contract deltas (variation / extension / renewal / novation / termination) with derived current state | **Working Draft (spec only; schemas to follow)** | [`amendments.md`](amendments.md) |
| `frameworks` | `FrameworkAgreement` (Contract subtype), `CallOff` (direct award / mini-competition) with a conformance-checkable drawdown invariant (Σ call-offs ≤ ceiling) | **Working Draft (spec only; schemas to follow)** | [`frameworks.md`](frameworks.md) |
| `negotiation` | `Negotiation`, `Offer` — a governed exchange of offers over named terms under **per-term Mandates**; the object model behind the existing `decisionType: negotiationMove` | **Working Draft (spec only; schemas to follow)** | [`negotiation.md`](negotiation.md) |

## Status vocabulary

- **Working Draft (spec only; schemas to follow)** — the prose spec has landed and is under
  review; schemas, worked examples, and conformance rules follow per-extension as a later
  patch (the spec-first sequence commodity-risk established).
- **Schemas + demo shipped** — schemas, a validated worked example, and (where applicable) a
  runnable demonstration are in-tree and CI-checked.

## Governance

Standards Committee decision records are published under [`../../governance/reviews/`](../../governance/reviews/).
The commodity-risk review is the first **member-proposed** extension, reviewed under the
identical process, terms, and bar as any proposer — no preferential path for any member.

## In-tree vs separately-namespaced

The auction, onboarding, and identity additions ship **in-tree** under the core `v0.1`
namespace, because they reuse core objects and are broadly useful — effectively candidates
already on the promotion path. An extension introducing genuinely domain-specific structure
(e.g. commodity-risk) instead lives under its **own namespace** and must not alter any core
object's `required` set or `additionalProperties` semantics.
