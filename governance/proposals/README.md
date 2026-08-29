# Change proposals

A change proposal (CP) states a problem in the shipped artifacts, proposes the smallest change that
closes it, records what was rejected and why, and resolves its own open gates. A CP is a **draft
until balloted**. Nothing here has been balloted, because no Standards Committee is constituted
(see the [bootstrap clause](../README.md#the-bootstrap-clause)).

> **The seven proposals of the v1.0 train are parked, not rejected.** See
> [WITHDRAWAL-2026-08](../WITHDRAWAL-2026-08.md). Their **findings** are kept as a defect
> register; their **remedies** are parked. **No further proposals are registered until the
> Standards Committee is constituted**, with one carve-out: a defect actively causing harm
> may be corrected under the bootstrap clause, with an interim approval record, a stated
> comment period, and the smallest Tier 2 surface that fixes it.
>
> Registration is temporarily reopened under [IAR-0006](../IAR-0006-registration-window.md): defect-remedying or timing-dependent proposals only, adoption still parked, expires on constitution or 30 September 2026.

| CP | Problem it closes | Breaking | Gates v1.0? | Status |
|----|-------------------|----------|-------------|--------|
| [CP-Grant-lifecycle](CP-Grant-lifecycle.md) | Withdrawal of a grant has no interoperable representation | No | **Yes** | Draft; mechanism landed ahead of ballot |
| [CP-Mandate-enforcement](CP-Mandate-enforcement.md) | Mandate limits are cited, never enforced (`E-MDT`) | Agent adapter only | No | Draft; checks implemented, non-gating |
| [CP-Consent-revocation](CP-Consent-revocation.md) | Consent terms have no tested consequence (`E-CNS`) | Consent adapter only | No | Draft; checks implemented, non-gating |
| [CP-Credential-semantics](CP-Credential-semantics.md) | `Credential` is underdetermined: pointer or embedding | Likely no | No | Draft |
| [CP-Extension-Composition](CP-Extension-Composition.md) | `additionalProperties: false` makes the documented extension path unexecutable | Part 1 no; Part 2 yes | No | **Parked** — see [WITHDRAWAL-2026-08](../WITHDRAWAL-2026-08.md) |
| [CP-Tenancy](CP-Tenancy.md) | Tenant, market and marketplace are absent from the model and carried implicitly by identifiers | **Yes** | No — but v1.0 or never | **Parked** — see [WITHDRAWAL-2026-08](../WITHDRAWAL-2026-08.md) |
| [CP-Codelist-Enforcement](CP-Codelist-Enforcement.md) | Closed codelists are prose — no instance value is validated against one | For documents carrying a value outside a closed list | **If CP-Tenancy lands** | **Parked** — see [WITHDRAWAL-2026-08](../WITHDRAWAL-2026-08.md) |
| [CP-EventType-Closure](CP-EventType-Closure.md) | `eventType` has 8 values for 18 objects and stops at `contract.signed`; the gap is filled by implementations minting codes that pass conformance | **Yes** | No — v1.0 or never | **Parked** — see [WITHDRAWAL-2026-08](../WITHDRAWAL-2026-08.md) |
| [CP-Policy-Applicability](CP-Policy-Applicability.md) | Every gate is opt-in at instance level — a Policy that is never cited is never applied | Conformance only (`F-GATE`) | No | **Parked** — see [WITHDRAWAL-2026-08](../WITHDRAWAL-2026-08.md) |
| [CP-Mandate-Scope](CP-Mandate-Scope.md) | `Mandate.scope` is required and unconstrained: `{}` satisfies it | **Yes** | No — v1.0 or never | **Parked** — see [WITHDRAWAL-2026-08](../WITHDRAWAL-2026-08.md) |
| [CP-Process-Spine](CP-Process-Spine.md) | `SourcingEvent` has no link back to `Need` — the one break in the spine | No | No | **Parked** — see [WITHDRAWAL-2026-08](../WITHDRAWAL-2026-08.md) |
| [CP-Amendments-Round-2](CP-Amendments-Round-2.md) | Revises CP-Tenancy and CP-Codelist-Enforcement; two gates dissolved | Inherited | No | Draft; **applied** to both |

## Delivery and dependencies

| CP | Target release | Affects | Depends on | Blocks |
|----|----------------|---------|------------|--------|
| CP-Grant-lifecycle | CDM v0.2 | `codelists/eventType.csv`, `docs/specification.md`, `conformance/` | none | CP-Consent-revocation, CP-Mandate-enforcement |
| CP-Mandate-enforcement | suite v0.2 | `conformance/`, `codelists/eventTypeCore.csv` | CP-Grant-lifecycle | `E-MDT` becoming earnable |
| CP-Consent-revocation | CDM v0.2 / suite v0.2 | `schema/consent.schema.json` (description), `conformance/` | CP-Grant-lifecycle | `E-CNS` becoming earnable |
| CP-Credential-semantics | CDM v0.2 | `schema/definitions.schema.json`, `docs/specification.md` §4.7 | none | mark grammar R4 |
| CP-Extension-Composition | Part 1 — next v0.x minor; Part 2 — v1.0 train | the 18 root object schemas, `schema/obligation.schema.json`, `schema/definitions.schema.json`, `conformance/`, `wiki/Extensions.md` | none | any implementer field that is not core |
| CP-Tenancy | v1.0 train | `schema/definitions.schema.json`, the 18 root object schemas, `codelists/`, `examples/`, `conformance/` | CP-Codelist-Enforcement | multi-tenant, multi-market deployment |
| CP-Codelist-Enforcement | in or before the v1.0 train | `codelists/`, `conformance/` | none | CP-Tenancy, CP-EventType-Closure |
| CP-EventType-Closure | v1.0 train | `codelists/eventType.csv`, `codelists/codelists.json`, `conformance/`, `tools/` | CP-Codelist-Enforcement, CP-Extension-Composition Part 1 | CP-Policy-Applicability |
| CP-Policy-Applicability | v1.0 train | `schema/policy.schema.json`, `conformance/`, `docs/specification.md` | CP-EventType-Closure, CP-Tenancy | none |
| CP-Mandate-Scope | v1.0 train | `schema/mandate.schema.json`, `conformance/`, `agent/mandate.json` | CP-Tenancy | none |
| CP-Process-Spine | v1.0 train, or earlier | `schema/sourcing-event.schema.json`, `examples/` | none | none |
| CP-Amendments-Round-2 | with what it amends | CP-Tenancy §4.5, CP-Codelist-Enforcement §2.1/§3/§4/§6/§8 | none | drafting either of those two |

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

## The v1.0 train

Seven proposals ride the single break window, in this shape:

```
CP-Codelist-Enforcement
  └─▶ CP-EventType-Closure
        └─▶ CP-Policy-Applicability

CP-Tenancy
  └─▶ CP-Mandate-Scope

CP-Extension-Composition Part 2     (independent; supplies the prefix grammar to EventType Closure)
CP-Process-Spine                    (independent)
$id rebase v0.1 → v1.0              (independent; not yet scoped)
```

**Twenty-two gates are open across the seven** — down from twenty-four, because
CP-Amendments-Round-2 dissolved two rather than resolving them (event chain partitioning, and
`C-3` retirement semantics). Four decide the *shape* of the work rather than its detail and want
Committee attention ahead of the rest:

| Gate | Proposal | Why it comes first |
|---|---|---|
| `ET-2` | EventType Closure | Whether `Evaluation.result` is a lifecycle enum changes the derived list, and therefore the generator |
| `PA-2` | Policy Applicability | Transitions with no `Decision` may make `F-GATE` untestable for a whole class of events |
| `MS-3` | Mandate Scope | Declared-vs-actual reads is the honest limit of `F-SCOPE`; the answer decides what the specification may claim |
| `C-1` | Codelist Enforcement | Disposition of the seven existing codelists — `eventType` is answered by EventType Closure, the other six each need their own migration analysis |

**CP-Codelist-Enforcement is the critical path.** It gates EventType Closure, which gates Policy
Applicability. It is also the **only non-breaking proposal in the train**, so it could land early
in a v0.x minor to de-risk the sequence. That is worth putting to the Committee rather than
assuming the train.

**CP-Process-Spine is the other early candidate.** It is non-breaking, independently valuable, and
the only item in the set that delivers something on its own — one optional `realisesNeed` field
closing the single break in the process spine. If the train slips, it should not slip with it.

### Two couplings that decide scope rather than order

**EventType Closure must land with Policy Applicability, or Policy Applicability must be
downgraded.** `appliesTo.transitions` referencing an unenforced vocabulary means a mistyped
transition produces a gate that never fires — on a conformant system, with no error. If closure is
declined, Policy Applicability must be documented as best-effort and the `F-GATE` requirement
dropped.

**Codelist Enforcement must land with Tenancy, or Tenancy ships a false claim.** Recorded above.

### What the train must not become

The proposals yield a *required set*, not a workflow. No ordering between gates, no conditional
branching, no approval routing beyond `Mandate.approvalThresholds`. The moment the standard
sequences gates it specifies an execution engine rather than stewarding a vocabulary. This
boundary will be pushed against, and it is the one to hold.

Two further limits are stated in the proposals themselves rather than left for an assessor to
find: `eventType.csv` is **generated** from the lifecycle enums and CI-checked for drift, never
hand-edited; and `F-SCOPE` can test what an agent **declares** it read (`Decision.inputs`), not
what it actually read. Claiming otherwise would be the same class of overclaim as describing node
attribution as federation.

### Not yet scoped

- **The `$id` rebase** from `https://concert.foundation/signet/v0.1/` to `v1.0/`, touching every
  schema file and every `$ref`. Mechanical, but it collides with the stable-URI publication
  blocker and the DOI sequencing. It rides the same window and may warrant its own proposal.
- **Settlement.** The process spine ends at `Invoice` with no settlement or payment primitive.
  Recorded here rather than silently omitted: whether v1.0 ships without one is a decision, and it
  has not been taken.

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
- **A fourth `Status` column on codelist CSVs — declined.** CP-Amendments-Round-2 §A2.2. It breaks
  every codelist file and the header lint, for all lists, to solve a problem that exists only for
  closed ones. Underneath: retirement has no coherent meaning over an append-only stream. **Codes
  are never retired**; guidance lives in the non-normative sidecar and removal is a CDM major.
- **Tenant-partitioned or global event chains — declined.** CP-Amendments-Round-2 §A1. The chain is
  **per subject**; there are as many chains as there are subjects. Isolation becomes a conformance
  rule over the existing structure rather than a new partitioning. Note what this does not give
  you: **there is no total order within a tenant** — any tenant-level ordering is a projection an
  implementation constructs, not a guarantee the standard makes.
- **A `TransitionManifest` root object — declined.** CP-Policy-Applicability. There is no manifest
  to scope; the required set is derived from tenant-scoped policies.
- **Significance-based curation of `eventType` — declined.** CP-EventType-Closure. The vocabulary
  is **derived** from the existing lifecycle status enums and CI-checked for drift. A hand-curated
  list diverges from the model the first time anyone adds a status value, silently.

## Writing one

Follow the shape the four here share: problem statement with numbered problems, the proposed change,
schema impact (state "none" explicitly where none), conformance rules, backward compatibility,
rejected alternatives, and resolutions. Ground the problem in the schemas and the suite, not the
wiki — the wiki describes intended properties accurately and says nothing about whether they are
tested.
