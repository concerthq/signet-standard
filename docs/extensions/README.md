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
| `onboarding` | `OnboardingCase`, `SupplierQualification` (durable status with first-class `conditional` qualification, value caps, category restrictions); `credentialType` codelist | **Schemas + demo shipped** (in-tree, core `v0.1`) | [`onboarding.md`](onboarding.md) |
| `auction` | `Auction`, `Bid` (a profile of the sourcing flow — reverse / english / dutch / sealed-bid / multi-criteria; deterministic, operator-independent close); `auctionType` codelist | **Schemas + demo shipped** (in-tree, core `v0.1`) | [`auction.md`](auction.md) |
| `identity` | `Approval` (verifiable human approval); `delegationOfAuthority` credential type; normative no-PII rule for hash-anchored records | **Working Draft** — schema + worked example shipped; demo emits `Approval` | [`identity.md`](identity.md) |
| `commodity-risk` | Portfolio-level commodity risk governance (positions, coverage corridors as Policy subtypes, price marks, assessments, price-shock scenarios, hedge proposals bridging to core `Need`) | **Spec + schemas + conformance rules shipped** — six schemas, ten codelists, an eleven-file full-loop example, and the six rules as an executable checker (`conformance/rules/check-commodity-risk.js`); separately-namespaced | [`commodity-risk.md`](commodity-risk.md) |

## Status vocabulary

- **Working Draft spec** — the prose spec has landed; schemas/examples may still be to come.
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
