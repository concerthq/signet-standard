# Agent Layer

This layer is **SIGNET's distinctive contribution**. No existing procurement standard
represents synthetic agents as first-class, governed, accountable participants. The agent
layer does — and it is always cleanly separable from third-party standards, so projecting a
SIGNET document down to OCDS simply omits it (see [Standards Mapping](Standards-Mapping)).

| Object | Purpose |
|--------|---------|
| [SyntheticAgent](#syntheticagent) | An AI agent operating as a first-class Party. |
| [AgentCapability](#agentcapability) | A declared, discoverable capability (A2A Agent Card aligned). |
| [Mandate](#mandate) | The bounded authority granted to an agent — what it may do, within what limits, and where human approval is required. |
| [Decision](#decision) | The accountability record: what was decided, by whom, under what authority, from what, why. |
| [Policy](#policy) | Machine-readable, human-auditable rules — "rules as code". |

## How the agent layer represents governance

The three structures that let a SIGNET network be *governed* rather than merely automated. Each is
a representation the model requires; each becomes a guarantee only where an implementation is
assessed against it:

1. **Bounded authority.** A [Mandate](#mandate) lists exactly which capabilities an agent
   may exercise, the hard `constraints` it must respect, and the `approvalThresholds` above
   which a human must approve. An implementation that permits an agent to act outside its mandate
   fails the `E-MDT` endorsement; the core conformance levels do not test enforcement.
2. **Accountable action.** Every material agent action produces a [Decision](#decision)
   recording the agent, the mandate relied on, the inputs considered, the policies applied,
   the rationale, the outcome, any human approval, and cryptographic provenance.
3. **Auditable rules.** Every [Policy](#policy) carries both an executable `expression`
   *and* a `humanReadable` statement of the same rule — so the rule that governs the agent
   is the rule a human can review.

> **See it run (v0.5.0).** The repository ships a runnable demonstration of exactly these three
> structures, in the reference implementation:
> the [`agent/` demonstration](https://github.com/concerthq/signet-standard/tree/main/agent)
> (`npm run agent`). A synthetic agent awards a €12M contract — bounded by a Mandate whose
> €10M autonomous-value ceiling forces **human approval**, applying the **published** MAT
> evaluation Policy — and the runner then **verifies the agent's output is conformance-clean**:
> every Decision, Evaluation, and Award validates, the five-event hash chain holds, and
> tampering is detected. See [Repository Structure → `agent/`](Repository-Structure#agent--the-agent-demonstration).

---

## SyntheticAgent

An AI agent operating within the network as a first-class
[Party](Foundation-Layer#party) (`partyType: agent`, role `syntheticAgent`).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Agent DID. |
| `name` | string | 1 | Agent name. |
| `operatedBy` | Identifier | 1 | The Party accountable for the agent. |
| `model` | string | 0..1 | The underlying model family (model-agnostic; for provenance only). |
| `capabilities` | AgentCapability[] | 1..* | Declared [capabilities](#agentcapability). |
| `mandate` | Identifier | 1 | The [Mandate](#mandate) governing the agent. |
| `agentCard` | string (URI) | 0..1 | [A2A Agent Card](Glossary#a2a) location (`/.well-known/agent.json`). |

`operatedBy` answers the most important governance question — *who is accountable for this
agent?* — and `model` is recorded for provenance, not for capability gating: the model is
deliberately model-agnostic.

---

## AgentCapability

A declared capability, aligned to the [A2A Agent Card](Glossary#a2a) model so capabilities
are discoverable across organisational boundaries.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `name` | string | 1 | Capability name, e.g. `evaluate.submission`, `negotiate.price`. |
| `description` | string | 0..1 | What it does. |
| `inputSchema` | object | 0..1 | Expected input. |
| `outputSchema` | object | 0..1 | Produced output. |

---

## Mandate

The authority granted to an agent — what it may do, within what limits, and where human
approval is required. **The record of an agent's remit — the representation enforcement is
tested against.** The Mandate states the bounds; whether an implementation applies them is a
property of that implementation, assessed by the `E-MDT` endorsement.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Mandate identifier. |
| `agent` | Identifier | 1 | The agent governed. |
| `grantedBy` | Identifier | 1 | The Party granting authority. |
| `permittedCapabilities` | string[] | 1..* | Capabilities the agent may exercise. |
| `constraints` | Policy[] | 0..* | Hard limits (e.g. max discount, value ceiling). |
| `approvalThresholds` | Policy[] | 0..* | Conditions requiring human-in-the-loop approval. |
| `scope` | object | 1 | Data/entity scope the agent may operate within (sandbox boundary). |
| `validity` | Period | 0..1 | Time bound on the mandate. |

The lifecycle of a mandate is itself event-sourced: `mandate.granted` and `mandate.revoked`
are recorded as [Events](Trust-Layer#event) (see [eventType codelist](Codelists#eventtype)).

---

## Decision

A record of a decision taken in the network, by a human or synthetic agent, with the inputs
and rationale that produced it. **The backbone of accountability.**

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Decision identifier. |
| `decisionType` | string | 1 | See [decisionType codelist](Codelists#decisiontype): `admissibility`, `evaluation`, `award`, `negotiationMove`, `qualification`. |
| `madeBy` | Identifier | 1 | The agent (human or synthetic) that decided. |
| `underMandate` | Identifier | 0..1 | The mandate relied on, where the decider is synthetic. |
| `inputs` | Identifier[] | 0..* | The objects considered (submissions, credentials, policies). |
| `policiesApplied` | Identifier[] | 0..* | The policies applied. |
| `rationale` | string | 1 | Human-readable rationale. |
| `outcome` | object | 1 | The decision outcome. |
| `humanApproval` | Identifier | 0..1 | Where a mandate threshold required it, a reference to the human approval record. Under the [identity profile](Extensions#working-draft-the-identity-profile) this SHOULD resolve to a verifiable `Approval` (pseudonymous approver, role, delegation-of-authority credential, provenance). |
| `provenance` | Provenance | 1 | Full [Provenance](Trust-Layer#provenance). |

A Decision record satisfies the "material decision" record-keeping that regulation
increasingly requires — including the assessment-summary and decision-record obligations of
the **UK Procurement Act 2023**, and the documentation expectations for AI-assisted
evaluation under the **EU AI Act**.

See the worked instance: [`examples/award-decision.json`](Worked-Examples#decision-award) —
a single object that records *what* was decided, *which* synthetic agent decided it, *under
which* mandate, from *which* inputs, under *which* policy, with *what* rationale, with *which*
human approval, and with cryptographic provenance.

---

## Policy

A machine-readable, human-auditable rule. Policies express eligibility criteria, evaluation
models, approval routing, agent constraints, and compliance rules. **"Rules as code" made
concrete.**

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Policy identifier. |
| `policyType` | string | 1 | See [policyType codelist](Codelists#policytype): `eligibility`, `evaluation`, `approval`, `constraint`, `compliance`. |
| `expressionLanguage` | string | 1 | The language the rule is written in, e.g. `rego`, `dmn`, `cel`. |
| `expression` | string | 1 | The executable rule. |
| `humanReadable` | string | 1 | A plain-language statement of the same rule. |
| `version` | string | 1 | Policy version. |
| `issuedBy` | Identifier | 1 | The governing Party. |

The **dual requirement is mandatory**: a Policy MUST carry both `expression` (machine-
executable) and `humanReadable` (auditable), so the *same* rule governs agents and is
reviewable by humans. Policies are referenced from the process layer as
`governingPolicies`, `eligibilityCriteria`, and `evaluationCriteria`.

See the worked instance: [`examples/policy-evaluation.json`](Worked-Examples#policy) — a
Most-Advantageous-Tender scoring model expressed in Rego with a plain-language equivalent.

## Where to go next

- [Trust Layer](Trust-Layer) — Provenance, Events, and Consent.
- [Process Layer](Process-Layer) — where Decisions and Policies attach to the lifecycle.
- [Worked Examples](Worked-Examples).
