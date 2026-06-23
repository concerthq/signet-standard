# SIGNET Agent Demonstration

The one thing no other procurement standard can show: **a synthetic agent taking a
consequential action — awarding a contract — in a way that is governed, accountable,
and provably conformant.**

Everything else in this repo demonstrates interoperability with the established
world (documents validate; invoices convert to Peppol BIS). This demonstrates the
*differentiator*: SIGNET is agent-native. An agent here does not act in a black box
— it acts under a **Mandate**, applies a **published Policy**, records a **Decision**
with its rationale and the inputs it used, and leaves a **hash-chained Event** trail
with full provenance. The action is then verified against the conformance harness:
the agent's output is Core/Full-clean.

## Run it

```bash
npm run agent     # or: node agent/run-agent.js
```

You'll see a narrated trace, then a verification block confirming every object the
agent produced validates and the event chain holds.

## The scenario (Agent = Model + Harness)

A €12M "Network managed services" sourcing event with two admissible bids:

1. **Read** — the agent reads the SourcingEvent and the evaluation Policy it
   references.
2. **Mandate gate** — its Mandate permits `evaluate.submission` and `award.decision`,
   but the event value (€12M) exceeds the agent's autonomous-value ceiling (€10M),
   so **human approval is required** before the award stands. The harness enforces
   this; the agent cannot self-authorise past its mandate.
3. **Evaluate** — the agent derives a price score from each bid and combines it with
   the quality/social assessment under the *published* MAT weights (price 0.4,
   quality 0.35, social 0.25 — parsed from the Policy's own executable expression,
   not hard-coded). Globex wins 0.8855 to 0.8689.
4. **Decide** — it emits an award **Decision** citing its inputs (both submissions),
   the policy it applied, a human-readable rationale, the attached **human approval**,
   and cryptographic **provenance**.
5. **Award + audit** — an **Award** with a regulatory standstill, and the whole
   sequence as five append-only, hash-chained **Events**.

## Why it matters

The verification block proves the claim rather than asserting it:

- the Decision, Evaluations, and Award all validate against the published schemas;
- the Decision is **mandate-bound** and carries **human approval** because the
  threshold was exceeded;
- the Event stream is an **unbroken hash chain**, and tampering with any event is
  **detected**;
- every assertion carries **provenance**.

So the agent's action is exactly the kind of action the SIGNET conformance harness
certifies. Agent autonomy and auditable governance are not in tension here — the
harness is what makes the autonomy safe to grant.

## Model-pluggable

`reasoner.js` is the seam. The default reasoner is **deterministic**, so the demo
runs offline, in CI, identically every time — which is what lets it be a *proof*
rather than a performance. A real frontier model drops in at the marked seam
(`invoke(tool, input)` calling the model via MCP tools / A2A), and **nothing in the
harness changes**: the mandate checks, policy application, provenance, and
event-chaining are identical whether the decision came from fixed logic or a model.
See `LIVE_MODEL_NOTE.md` for the live version to run in front of an audience.

## Files

```
agent/
├── agent-card.json        A2A Agent Card — the agent's discoverable capabilities
├── mandate.json           the Mandate bounding what the agent may do
├── submissions/           the two competing bids (schema-valid Submissions)
├── assessment-inputs.json non-price (quality/social) criterion scores
├── reasoner.js            the pluggable "Model" (deterministic default; model seam)
├── agent-runtime.js       the "Harness" — mandate gate, policy, provenance, events
├── run-agent.js           runs the scenario + verifies the output is conformant
├── output/                generated Decision, Award, Evaluations, Events
└── LIVE_MODEL_NOTE.md     how to run it against a real model for a live demo
```
