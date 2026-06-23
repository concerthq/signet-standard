# Live-Model Demonstration — Build Note

The committed demo uses the **deterministic** reasoner so it runs offline, in CI,
and identically every time — which is what makes it a *proof of governance*. For a
live audience (e.g. Ignacio, Massimo, the Google relationship), you can swap in a
real frontier model **without changing the harness**. This note describes that swap.
It is intentionally not wired into the repo: it needs network and an API key, so it
can't run in CI and shouldn't gate the build.

## The seam

`reasoner.js` exposes `invoke(tool, input) -> output` for two tools:
`evaluate.submission` and `award.decision`. The harness (`agent-runtime.js`) only
ever calls those two methods. So a live reasoner is any object with the same
contract whose handlers call a model.

## What changes (only this)

```js
// agent/live-reasoner.js  (illustrative)
const liveModelReasoner = {
  kind: "live-model",
  async invoke(tool, input) {
    // Build a prompt from `input` (weights + scores, or evaluations + weights),
    // call the model, and constrain the response to the SAME output shape the
    // deterministic reasoner returns:
    //   evaluate.submission -> { scores:[{criterion,value,weight}], total }
    //   award.decision      -> { winner, ranking:[{submission,total}], rationale }
    // Use structured output / tool-calling so the shape is guaranteed.
  },
};
```

Then run with the live reasoner instead of the deterministic one (make `runScenario`
`await` the reasoner if you go async). **Everything else is unchanged** — the mandate
gate, policy weights parsed from the Policy, provenance, the Event chain, and the
conformance verification at the end all operate identically.

## Wiring it as a real agent (MCP / A2A)

To make it a genuine agent rather than a function call:

- **A2A.** Publish `agent-card.json` at the agent's `/.well-known/agent.json`. The
  two skills (`evaluate.submission`, `award.decision`) are already declared there.
  A calling system discovers the agent and invokes a skill over A2A; the skill
  handler is the `invoke` above.
- **MCP.** Expose the SIGNET objects the agent needs (the SourcingEvent, Policy,
  Submissions) and the actions it takes (emit Evaluation/Decision/Award/Event) as
  **MCP tools**. The model then *reads* via MCP resources and *acts* via MCP tools,
  and the harness wraps each action with mandate checks, provenance, and chaining.
- **Provenance of the model.** Record the model identity on the SyntheticAgent
  (`model` field) and in each Event's provenance, so the audit trail shows which
  model produced which decision — SIGNET is model-agnostic, but model-accountable.

## The point to make on stage

Run the deterministic version and the live-model version back to back. The decision
*reasoning* differs (fixed logic vs a model); the **governance is identical** — same
mandate ceiling forcing human approval, same provenance, same tamper-evident chain,
same conformance pass. That is the entire thesis: the value isn't that an agent can
decide, it's that SIGNET makes the agent's decision *governable and certifiable*
regardless of what's doing the reasoning.

## Caveat

A live model is non-deterministic and may, for some inputs, disagree with the MAT
arithmetic or return an ill-formed shape. Constrain it with structured output, and
keep the deterministic reasoner as the CI gate and the fallback. The live version is
for demonstration; the deterministic version is the proof.
