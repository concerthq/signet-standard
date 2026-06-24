# SIGNET Supplier-Qualification Demonstration

The onboarding twin of the agent award demo — and proof that the governance harness
generalises. Here an agent doesn't award a contract; it **qualifies a supplier** —
and instead of a blunt pass/fail, it lands on the outcome enterprise onboarding
actually needs: a **conditional qualification**.

```bash
npm run onboarding     # or: node onboarding/run-onboarding.js
```

## The scenario (conditional is the hero)

A buyer invites a supplier to qualify for WAN services (a €12M value tier). The
supplier presents five credentials. The agent, under a published eligibility Policy
and a bounded Mandate:

1. **Reads** the policy and the presented credentials.
2. **Verifies** each required credential — identity, insurance, ISO 27001, and a
   sanctions screening (a *result* credential issued by the screening provider, not
   determined by SIGNET) all pass. Financial standing is valid but **covers only €5M
   of the €12M tier**.
3. **Decides** — a missing-but-non-blocking shortfall isn't a rejection. The agent
   qualifies the supplier **conditionally**: active up to €5M, with a value cap and a
   pending-check condition for an upgraded financial credential.
4. **Gates on its mandate** — attaching conditions is a judgement outside the agent's
   autonomous scope, so a **named human approval** is required and recorded. (Clean
   passes and outright rejections it may decide alone.)
5. **Produces and seals** — an `OnboardingCase` (the workflow record), a
   `SupplierQualification` (the durable status: `conditional`, cap €5M), a
   qualification `Decision` (rationale, credentials weighed, policy applied, human
   approval, provenance), and a hash-chained `Event` trail.

The runner then **verifies the output is conformance-clean**: the OnboardingCase,
SupplierQualification, and Decision all validate; the outcome is conditional with a
value cap; the decision is mandate-bound with human approval; the event chain holds;
tampering is detected.

## Why the conditional outcome matters

A yes/no pipeline rejects this supplier or waves them through. Neither is right. The
valuable, real-world outcome is "qualified, but capped pending a check" — and the
demo shows an agent *deriving* that from policy plus credentials, under governance,
with the limits recorded as machine-readable `conditions` a downstream sourcing
agent must honour. That judgement, governed and auditable, is the thing this model
does that ordinary onboarding tooling can't.

## "Credentials change, the flow doesn't"

The verification logic keys off credential *types* and *proofs*, not a fixed schema
of forms. The sanctions result is a provider attestation; the others are manual
attestations today. Swap any `proof` to an issuer-signed credential and the decision
is identical — the workflow is the stable, normative core; the credential layer is
what evolves. That's the federated future previewed without building it.

## Model-pluggable

`reasoner.js` is the seam — deterministic by default (so the demo runs offline and
in CI, identically), swappable for a live model via MCP/A2A with **no change to the
harness** (mandate gate, object production, provenance, event-chaining).

## Files

```
onboarding/
├── agent-card.json            A2A card — verify.credential, qualify.supplier
├── mandate.json               autonomous for clear/reject; human approval for conditional
├── policy-onboarding.json     the buyer's eligibility Policy
├── presented-credentials.json the supplier's five credentials
├── reasoner.js                the pluggable "Model" (deterministic; model seam)
├── onboarding-runtime.js      the "Harness" — mandate gate, case/qualification, events
├── run-onboarding.js          runs the scenario + verifies conformance-clean
└── output/                    generated OnboardingCase, SupplierQualification, Decision, Events
```

Depends on the onboarding extension schemas (`schema/onboarding-case.schema.json`,
`schema/supplier-qualification.schema.json`).
