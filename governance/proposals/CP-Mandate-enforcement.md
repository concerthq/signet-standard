# CP-Mandate-enforcement

**Status:** Draft — not yet balloted. Gates resolved as interim resolutions (§9).
**Implemented ahead of ballot, non-gating:** the seven checks run in
`conformance/rules/check-endorsements.js` and the agent adapter surface is documented in
`conformance/adapter/endorsement-adapters.md`. They decide no level and issue no mark: `E-MDT`
becomes earnable only when this proposal carries and the
[endorsement register](../endorsement-register.md) entry moves to `active`. The implementation
exists so the gap in §1 is demonstrable rather than argumentative (§4, broken adapter).
**Affects:** `conformance/levels.md`, `conformance/adapter/`, `conformance/rules/`,
`conformance/report-schema.json`, `codelists/eventTypeCore.csv`
**Target:** suite v0.2
**Breaking:** Yes, for the agent adapter contract (new; base contract unchanged)
**Depends on:** CP-Grant-lifecycle (check E-MDT-5)

---

## 1. Problem statement

**P1 — The suite tests citation, not application.** F-SEM requires that Policies carry both
executable and human-readable rules, and that Decisions cite their inputs and policies. Nothing
requires that the limits expressed in the cited policies were **respected**.

**P2 — The failure is conformant and invisible.** An implementation whose agent awards a €12M
contract with no human involvement, while writing `underMandate: [id]` and `policiesApplied:
[threshold-policy-id]` into the Decision, passes F-SEM and reaches Full. The record is
well-formed, carries required provenance, and hash-chains correctly. It is also false.

**P3 — The trust machinery amplifies the false claim.** A signed, chained, provenance-bearing
record carries more weight with a downstream auditor than an unsigned one. Where enforcement is
untested, the apparatus that exists to make records trustworthy instead lends authority to an
unverified assertion. This is worse than an absent guarantee, because the artifact the standard
directs people to rely on is the artifact that misleads them.

**P4 — Every constraint field in `Mandate` is inert.** `permittedCapabilities`, `scope`,
`constraints`, `approvalThresholds`, and `validity` have no tested consequence. The distinction
between `constraints` (hard limits) and `approvalThresholds` (human-in-the-loop conditions) exists
only in the schema's `description` strings; nothing establishes that an implementation treats them
differently, and that difference is the substance of bounded autonomy.

**P5 — The demonstration is not the suite.** `agent/` proves the mandate gate works and CI runs it
on every commit, but it exercises the reference implementation only. No certified implementation is
bound by it. The claim that agent autonomy and auditable governance are not in tension is currently
demonstrated once, by Concert, about Concert's own code.

---

## 2. Schema additions

**None.** This is deliberate and is the core of the design.

The harness supplies the Mandate and the Policies, so it already knows the expected outcome of each
scenario. The Policy carries an executable `expression`, so an assessor can re-evaluate it
independently. Enforcement is therefore observable from the implementation's **behaviour**, and no
new field is needed to record it.

Adding a field asserting that enforcement occurred is explicitly rejected — see §8, R1.

---

## 3. The `E-MDT` endorsement

One requirement, seven checks. The endorsement is earned only if all checks pass; per-check results
are reported for diagnostics.

| Check | Requirement |
|-------|-------------|
| **E-MDT-1** | An action exceeding an `approvalThresholds` policy MUST be refused, or MUST produce a Decision with `humanApproval` populated. |
| **E-MDT-2** | An action within all thresholds MUST proceed **without** requiring `humanApproval`. |
| **E-MDT-3** | An action invoking a capability absent from `permittedCapabilities` MUST be refused. |
| **E-MDT-4** | An action on a subject outside the mandate's `scope` MUST be refused. |
| **E-MDT-5** | An action under a mandate that is not effective, per CP-Grant-lifecycle §4, MUST be refused. |
| **E-MDT-6** | An action violating a `constraints` policy MUST be refused, and MUST NOT be curable by `humanApproval`. |
| **E-MDT-7** | Every refusal under checks 1 and 3–6 MUST emit an event of type `mandate.refused`. |

Four of these carry most of the weight.

**E-MDT-2 is the non-triviality guard.** Without it, an implementation demanding human approval for
everything passes the whole set while proving nothing about bounded autonomy. A mandate that never
permits is as broken as one that never refuses; the requirement is that the *boundary* sits where
the mandate says it does.

**E-MDT-6 paired with E-MDT-1 makes the constraint/threshold distinction normative.** A hard limit
an approval can override is not a hard limit. This pair is the first thing in the suite giving the
two fields different observable meanings.

**E-MDT-5 depends on CP-Grant-lifecycle**, which supplies the effective/revoked projection for all
grant-type objects. Without it the check narrows to `validity` only and mandate revocation stays
untested.

**E-MDT-7 closes the probing hole.** Without an evented refusal, *refused* and *never attempted*
are indistinguishable in the record, so an agent can probe its ceiling repeatedly and invisibly.
That is precisely the behaviour the endorsement exists to make auditable. `mandate.refused` is
proposed for admission to the closed core subset of `eventType` under CP-Grant-lifecycle §3.

Endorsement admission is subject to the three-part test in Mark Grammar R2. Mandate enforcement
satisfies it: orthogonal to the level axis, not universally applicable, machine-testable under CN-1.

---

## 4. Adapter contract

The four existing methods are all productive — create, change, read, project. None has a refusal
surface for *not permitted* as distinct from *structurally invalid*.

**A separate agent adapter is added**, implemented only by implementations seeking the endorsement.
The base contract is unchanged, so no existing or prospective implementation outside the
endorsement is affected. The agent adapter versions with the suite, not independently.

### `Refusal`

```json
{
  "rule": "E-MDT-1",
  "mandate": "<Identifier>",
  "policy": "<Identifier>",
  "reason": "string"
}
```

`policy` is **optional**. Refusals under checks 3, 4, and 5 derive from the `Mandate` itself —
capability, scope, effectiveness — not from a Policy. Only checks 1 and 6 cite one.

A bare boolean refusal would satisfy a naive suite while telling a downstream auditor nothing;
naming the rule and the instrument that produced the refusal is what makes the record useful.

### Broken adapter

A third planted defect is required: an adapter populating `underMandate` and `policiesApplied`
correctly, and not enforcing the threshold. It must **pass F-SEM and fail E-MDT-1**.

This is the demonstration that the suite discriminates, and it makes the gap concrete rather than
argumentative. It is worth building even if the endorsement is declined.

---

## 5. Registry

No separate declared-capability field is added, and **failed attempts are not published**. Under
the endorsement axis there is no `not-applicable` to declare: an implementation either holds the
endorsement or does not, and absence is legible in the mark itself. Publishing failures would deter
attempts, and an implementation that tries, fails, fixes, and retries is behaviour worth
encouraging.

One addition is required, or absence becomes misleading:

> The registry entry MUST record the **endorsement register version in force at issuance**.

The register is append-only. Without this, every certification issued before a later endorsement
was admitted would appear deficient against a register that grew after the fact — an unfairness the
append-only design creates automatically unless entries are dated against it.

---

## 6. Backward compatibility and sequencing

| Change | Breaking? |
|--------|-----------|
| `E-MDT` endorsement | No — changes neither Core nor Full |
| Agent adapter contract | Yes, but only for implementations seeking the endorsement |
| Base adapter contract | Unchanged |
| `mandate.refused` codelist entry | No — additive, admitted under CP-Grant-lifecycle |
| Registry register-version field | No — additive |
| Schemas and documents | Unchanged |

**v1.0 publication need not wait on this proposal.** Under the endorsement axis it alters neither
Core nor Full, so it does not change what v1.0 means. Its dependency, CP-Grant-lifecycle, does
touch the standard and must land first.

**It must land before the first certification.** That is a separate and later constraint, and it is
already covered by Mark Grammar R6: no certification issues before the mark grammar and the
endorsement register are both in force.

---

## 7. Positioning consequence, independent of the outcome

The Architecture Overview states that whether an implementation meets the specification's MUST
requirements "is decided mechanically by the Conformance Harness." As written this is general and
is not true of the mandate MUSTs. A reader treating certification as evidence of human oversight
would be relying on something the suite does not establish.

This wants correcting whichever way the proposal goes, and does not need to wait for it. It belongs
with the three-tier claim discipline applied to standard relationships: **modelled**, **tested**,
and **certified** are three different statements, and the published copy currently blurs them.

---

## 8. Rejected alternatives

**R1 — Add a `Decision.mandateCheck` field asserting that enforcement occurred.** Rejected, and the
most important rejection here. A self-asserted flag reproduces the exact failure mode being fixed:
an implementation willing to record `policiesApplied` for policies it ignored will record
`mandateCheck: true` for a check it did not perform. Attestation cannot fix a problem caused by
unverified attestation, and the field would make the gap *harder* to detect by looking like
evidence.

**R2 — Cover enforcement through auditor attestation rather than the suite.** Rejected: contradicts
CN-1, and would require Concert to stand up an audit function it does not have and should not
build.

**R3 — Document as a scope limitation and make no change.** Honest, and the correct fallback if the
committee declines. It costs the standard's distinguishing claim: bounded agent authority is what
SIGNET offers that adjacent standards do not, and leaving it uncertified means the claim rests on a
demonstration of Concert's own reference code. If chosen, published positioning must be corrected
per §7.

**R4 — Place the requirement in Core.** Rejected: Core must remain universally applicable. An
implementation with no agents would fail on a requirement irrelevant to it.

**R5 — Require refusal only, with no approval path.** Rejected: would forbid the human-in-the-loop
pattern `approvalThresholds` exists to express, collapsing bounded autonomy into prohibition.

**R6 — Extend `createObject` with an acting-agent context (E1), or add `actAsAgent` to the base
contract (E2).** Rejected in favour of a separate agent adapter. E1 overloads a method whose
contract is document construction and makes every existing adapter signature ambiguous; E2 obliges
every implementation to implement a method most will never use.

---

## 9. Resolutions

Five gates, resolved as interim resolutions under the bootstrap clause. Ratifiable, amendable, or
reversible once the Standards Committee is constituted.

**R-G1 — Requirement ID and level placement.** *Endorsement axis.* Prefix **`E-`**, denoting
endorsement — structural rather than topical, since a topical `G-` for governance would misfit the
first endorsement that is not a governance property, and the register is append-only. One
requirement, seven checks; the endorsement is the atomic unit for the mark.

*Consequence:* the `levels.md` `not-applicable` ambiguity is **not** a blocker for this proposal.
Under the endorsement axis no N/A arises on the level axis for `E-MDT`. The clarification remains
worth shipping — F-MAP raises the same question for an implementation that never handles invoices —
but it is not on this critical path.

**R-G2 — Adapter contract.** *Separate agent adapter*, versioned with the suite. `Refusal` shape as
§4, with `policy` optional. Seventh check added requiring refusals to be evented.

**R-G3 — Registry capability profile.** *Not required.* The endorsement axis removes the
self-declaration loophole it was designed to close. Failed attempts are not published. The registry
entry records the endorsement register version in force at issuance.

**R-G4 — Sequencing.** *v1.0 need not wait; first certification must.* See §6.

**R-G5 — Dependency handling.** *Hoisted.* The shared projection rule moved to CP-Grant-lifecycle,
which both this proposal and CP-Consent-revocation cite. The cross-proposal dependency between the
two dependents is removed rather than managed; each can now ballot independently once
CP-Grant-lifecycle carries.
