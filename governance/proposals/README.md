# Change proposals

A change proposal (CP) states a problem in the shipped artifacts, proposes the smallest change that
closes it, records what was rejected and why, and resolves its own open gates. A CP is a **draft
until balloted**. Nothing here has been balloted, because no Standards Committee is constituted
(see the [bootstrap clause](../README.md#the-bootstrap-clause)).

| CP | Problem it closes | Breaking | Gates v1.0? | Status |
|----|-------------------|----------|-------------|--------|
| [CP-Grant-lifecycle](CP-Grant-lifecycle.md) | Withdrawal of a grant has no interoperable representation | No | **Yes** | Draft; mechanism landed ahead of ballot |
| [CP-Mandate-enforcement](CP-Mandate-enforcement.md) | Mandate limits are cited, never enforced (`E-MDT`) | Agent adapter only | No | Draft; checks implemented, non-gating |
| [CP-Consent-revocation](CP-Consent-revocation.md) | Consent terms have no tested consequence (`E-CNS`) | Consent adapter only | No | Draft; checks implemented, non-gating |
| [CP-Credential-semantics](CP-Credential-semantics.md) | `Credential` is underdetermined: pointer or embedding | Likely no | No | Draft |
| [CP-Extension-Composition](CP-Extension-Composition.md) | `additionalProperties: false` makes the documented extension path unexecutable | Part 1 no; Part 2 yes | No | Draft; Part 1 proposed for the next v0.x minor |
| [CP-Tenancy](CP-Tenancy.md) | Tenant, market and marketplace are absent from the model and carried implicitly by identifiers | **Yes** | No — but v1.0 or never | Draft; gates open |
| [CP-Codelist-Enforcement](CP-Codelist-Enforcement.md) | Closed codelists are prose — no instance value is validated against one | For documents carrying a value outside a closed list | **If CP-Tenancy lands** | Draft; gates open |

## Delivery and dependencies

| CP | Target release | Affects | Depends on | Blocks |
|----|----------------|---------|------------|--------|
| CP-Grant-lifecycle | CDM v0.2 | `codelists/eventType.csv`, `docs/specification.md`, `conformance/` | none | CP-Consent-revocation, CP-Mandate-enforcement |
| CP-Mandate-enforcement | suite v0.2 | `conformance/`, `codelists/eventTypeCore.csv` | CP-Grant-lifecycle | `E-MDT` becoming earnable |
| CP-Consent-revocation | CDM v0.2 / suite v0.2 | `schema/consent.schema.json` (description), `conformance/` | CP-Grant-lifecycle | `E-CNS` becoming earnable |
| CP-Credential-semantics | CDM v0.2 | `schema/definitions.schema.json`, `docs/specification.md` §4.7 | none | mark grammar R4 |
| CP-Extension-Composition | Part 1 — next v0.x minor; Part 2 — v1.0 train | the 18 root object schemas, `schema/obligation.schema.json`, `schema/definitions.schema.json`, `conformance/`, `wiki/Extensions.md` | none | any implementer field that is not core |
| CP-Tenancy | v1.0 train | `schema/definitions.schema.json`, the 18 root object schemas, `codelists/`, `examples/`, `conformance/` | CP-Codelist-Enforcement | multi-tenant, multi-market deployment |
| CP-Codelist-Enforcement | in or before the v1.0 train | `codelists/`, `conformance/` | none | CP-Tenancy |

**The one hard dependency in this set: CP-Codelist-Enforcement MUST land in or before the v1.0
train.** CP-Tenancy introduces `regulatoryRegime` and declares it closed. Without codelist
enforcement, v1.0 ships a codelist that is *modelled as closed and tested as open* — inside the
release carrying the first certifications. That is a claim-triad failure of exactly the kind the
conformance suite exists to prevent. It is a dependency, not a scheduling preference.

## Sequencing

```
CP-Grant-lifecycle  ── touches the standard ──> MUST land before v1.0
   |
   +---> CP-Consent-revocation  (E-CNS endorsement)  ─┐
   |                                                  ├─> endorsement register
   +---> CP-Mandate-enforcement (E-MDT endorsement)  ─┘         |
                                                                v
                                        mark grammar R6 ──> first certification
```

**CP-Grant-lifecycle must clear before v1.0 unconditionally.** Closing a subset of `eventType`
is a governance change, materially cheaper before publication under a stable URI and DOI than
afterwards. It is non-breaking and requires no `schema/` change — `Event.subject` already carries
the grant identifier. It is the only item that gates v1.0 on its own account: CP-Codelist-Enforcement
gates v1.0 conditionally — only if CP-Tenancy rides the same train — and CP-Tenancy gates nothing,
being breaking and therefore v1.0 or never.

**Neither endorsement CP gates v1.0.** Both create endorsements rather than altering Core or Full,
so neither changes what v1.0 means. Both must land before the **first certification**, which is a
separate and later constraint under mark grammar R6.

**The two endorsement CPs are independent of each other.** The shared projection rule was hoisted to
CP-Grant-lifecycle, which both cite; they can ballot in either order.

**CP-Credential-semantics blocks mark grammar R4** (selective disclosure for person marks) and
nothing else. It is a prerequisite, not a dependency of the endorsements.

**The v1.0 train opens exactly one break window, and three items must ride it.** CP-Tenancy spends
the window by making `tenancy` required; CP-Extension-Composition Part 2 (the 2020-12 migration)
and the `$id` rebase from `v0.1/` to `v1.0/` have to ride the same one. Delivering any of them in
a v0.x minor produces churn without the licence to break. **CP-Extension-Composition Part 1 is the
exception**: it is purely permissive, breaks nothing, and is deliberately scoped to a v0.x minor
ahead of the train, because until it lands an implementer cannot carry a local field at all
without failing document conformance.

**Part 1 is not a partial delivery of tenancy.** A namespaced private field is permitted by the
core schema and constrained by nothing — not modelled, not assessed by core conformance, and never
promoted to core except through a proposal of its own.

## The two findings behind this set

Both are gaps between what is claimed and what is tested, and both were found by reading the JSON
schemas against `conformance/levels.md` rather than the prose.

- **F1 — `Consent` has no conformance requirement.** C-DOC validates a `Consent` structurally.
  Nothing tests that access is gated, that revocation takes effect, or that `Document.accessGrant`
  is honoured. Underneath sits a modelling gap: there is no representation of revoked state.
- **F2 — Mandate enforcement is demonstrated, not certified.** F-SEM requires Decisions to cite
  `policiesApplied`; nothing requires the limits in those policies to have been respected. An
  implementation that awards beyond an `approvalThresholds` policy with no `humanApproval`, while
  recording `underMandate` and `policiesApplied` correctly, passes F-SEM and reaches Full. The
  record is well-formed, hash-chained, provenance-bearing, and false.

Both are being closed by endorsement rather than by widening Core or Full: endorsements are additive
and optional, so nobody is blocked from certifying and an unearned endorsement is inert.

*If scope must be reduced, defer F1 rather than F2.* `E-MDT` is the differentiating claim and is
fully testable; `E-CNS` is thinner and more easily walked back in copy.

## Positions that are closed, not open

Recorded because they are attractive ideas that will be re-proposed in good faith:

- **Marks as CDM `Credential` objects / W3C VCs — declined.** Six reasons in
  [mark grammar §8](../mark-grammar.md). The category objection is load-bearing: it moves Concert
  from steward to operator. Should not be reopened without new argument.
- **A `Decision.mandateCheck` field asserting enforcement occurred — rejected.**
  CP-Mandate-enforcement §8 R1. A self-asserted flag reproduces the exact failure being fixed, and
  makes it harder to detect by looking like evidence.
- **Status fields on `Consent` — rejected.** CP-Grant-lifecycle §8 A. Duplicates state that design
  principle 1.7 defines as an event projection, with no rule for which governs on disagreement.

## Writing one

Follow the shape the four here share: problem statement with numbered problems, the proposed change,
schema impact (state "none" explicitly where none), conformance rules, backward compatibility,
rejected alternatives, and resolutions. Ground the problem in the schemas and the suite, not the
wiki — the wiki describes intended properties accurately and says nothing about whether they are
tested.
