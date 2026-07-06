# Repository Structure

The repository holds the **normative artifacts** of the SIGNET standard, plus the tooling
that validates and projects them.

```
schema/        JSON Schema (Draft-07) — the normative Canonical Data Model
  definitions.schema.json   Foundation blocks (Identifier, Party, Value, …)
                            incl. EN 16931 blocks (Unit, InvoiceLine, VatBreakdown)
  need / sourcing-event / submission / evaluation / award / contract /
  order / catalogue / obligation / invoice / auction / bid /
  onboarding-case / supplier-qualification .schema.json               (process layer)
  synthetic-agent / mandate / decision / policy / approval .schema.json   (agent layer)
  event / consent .schema.json                                        (trust layer)
  exposure-position / coverage-policy / price-mark / coverage-assessment /
  scenario / hedge-proposal .schema.json          (commodity-risk extension, in-tree)
  party.schema.json
  context.jsonld            JSON-LD @context (aligns to ePO, PROV, W3C VC)
codelists/     Controlled vocabularies (CSV: Code, Title, Description)
examples/      Worked instances, validated in CI (incl. examples/commodity-risk/)
conformance/   Machine-runnable conformance harness (levels, suite, adapters, runner)
               + rules/ — executable extension cross-object checkers
agent/         Runnable agent demonstration — a governed, conformance-verified award (v0.5.0)
onboarding/    Supplier-onboarding demonstration — a conditional qualification (v0.6.0)
auction/       Reverse-auction demonstration — a deterministic close (v0.8.0)
governance/    Standards Committee decision records (governance/reviews/)
docs/          The prose specification + docs/extensions/ (extension & profile specs)
tools/         Reference transforms + the Pages renderer
.github/       CI workflows, issue/PR templates, CODEOWNERS, Dependabot
LICENSE        CC0 1.0 public-domain dedication
CONTRIBUTING.md   How to contribute (and the CLA)
CHANGELOG.md   Semantic-versioned history
CITATION.cff   Citation metadata
```

## `schema/` — the normative model

One file per object, plus the shared `definitions.schema.json`. Each schema's `$id` is a
stable URI under `https://concert.foundation/signet/v0.1/`. Files map to the four layers:

| Layer | Schema files |
|-------|--------------|
| Foundation | `definitions.schema.json`, `party.schema.json` |
| Process | `need`, `sourcing-event`, `submission`, `evaluation`, `award`, `contract`, `order`, `catalogue`, `obligation`, `invoice`, `auction`, `bid`, `onboarding-case`, `supplier-qualification` |
| Agent | `synthetic-agent`, `mandate`, `decision`, `policy`, `approval` |
| Trust | `event`, `consent` |

The auction, onboarding, identity, and commodity-risk [extensions](Extensions) ship **in-tree**:
`auction`/`bid` and `onboarding-case`/`supplier-qualification` sit in the process layer,
`approval` (identity) in the agent layer, and the commodity-risk objects
(`exposure-position`, `coverage-policy`, `price-mark`, `coverage-assessment`, `scenario`,
`hedge-proposal`) are their own schema files under the core `v0.1` namespace.

`context.jsonld` is the JSON-LD context — see [Serialisation](Serialisation).

## `codelists/` — controlled vocabularies

CSV files with the header `Code,Title,Description`. See [Codelists](Codelists) for the full
content of each list and which fields they constrain.

## `examples/` — worked instances

CI-validated instances covering the lifecycle, plus the generated `invoice.ubl.xml`. See
[Worked Examples](Worked-Examples).

## `conformance/` — the conformance harness

Added in **v0.4.0**: the machine-runnable suite behind the "SIGNET Certified" mark.

| Path | Purpose |
|------|---------|
| `levels.md` | Conformance levels (Core / Full) + neutrality rules CN-1…CN-4 (**normative**). |
| `certification.md` | The identical-for-all certification process. |
| `report-schema.json` | Schema every conformance report conforms to (CN-4). |
| `suite/` | The test cases: `document-conformance.json` (C-DOC) and `implementation-conformance.json`. |
| `fixtures/invalid/` | Documents that MUST be rejected (one per rule). |
| `adapter/` | The adapter contract, a reference adapter (reaches Full), and a broken adapter (rejected). |
| `runner/` | `run-conformance.js` (the harness) + `lib.js` (schema loading, hashing, chain verification). |
| `rules/` | Executable **extension** cross-object checkers (`check-onboarding.js`, `check-auction.js`, `check-identity.js`, `check-commodity-risk.js`), run in CI. |
| `reports/` | Generated reports; two samples (pass + fail) are committed, the rest git-ignored. |

See the dedicated [Conformance Harness](Conformance-Harness) page.

## `agent/` — the agent demonstration

Added in **v0.5.0**: a runnable proof that a synthetic agent can take a **governed,
accountable, conformant** action — awarding a contract under a Mandate. Run it with
`npm run agent`.

| Path | Purpose |
|------|---------|
| `agent-card.json` | The agent's A2A Agent Card (declared capabilities). |
| `mandate.json` | The bounded authority — permitted capabilities and the €10M autonomous-value ceiling. |
| `submissions/`, `assessment-inputs.json` | Two `Submission` bids and the assessment inputs the agent evaluates. |
| `reasoner.js` | The pluggable "Model" — deterministic by default; a marked seam for a live frontier model (see `LIVE_MODEL_NOTE.md`). |
| `agent-runtime.js` | The "Harness" — mandate gate, policy application, provenance, and event-chaining. |
| `run-agent.js` | Runs the scenario, narrates it, and **verifies the output is conformance-clean** (every object validates; chain holds; tampering detected). |
| `LIVE_MODEL_NOTE.md` | How to swap in a real model for a live demo with no change to the harness. |
| `output/` | Generated at runtime (decision, award, evaluations, events) — git-ignored. |

The €12M event value exceeds the mandate's €10M ceiling, so the agent requires **human
approval** before awarding — the structural demonstration that agent autonomy and auditable
governance are not in tension. See the [Agent Layer](Agent-Layer).

## `onboarding/` and `auction/` — the extension demonstrations

Two further runnable demos, each ending with a conformance-clean check (both run in CI):

| Dir | Run | What it proves |
|-----|-----|----------------|
| `onboarding/` | `npm run onboarding` | A supplier [onboarding](Extensions#the-onboarding-extension) case reaches a **conditional** qualification (value cap + pending check), reusing Credential/Policy/Decision/Event. Added in **v0.6.0**. |
| `auction/` | `npm run auction` | A reverse [auction](Extensions#example-the-auction-extension) closes **deterministically** to a single winner over a hash-chained bid trail — the data-level statement of operator-independence. Added in **v0.8.0**. |

## `governance/` — Standards Committee records

`governance/reviews/` holds the public decision records that version alongside the standard —
e.g. `2026-07-commodity-risk.md` (accepted in principle) and `2026-07-commodity-risk-merge.md`
(merged as a Working Draft), the trail of the first **member-proposed**
[extension](Extensions#working-draft-the-commodity-risk-extension). See
[Governance & Versioning](Governance-and-Versioning#review-records).

## `docs/` — the prose specification

`docs/specification.md` is the human-readable specification (the normative text; the schema
still takes precedence). Extension specs live under **`docs/extensions/`**, each named for
its extension/profile id (see `docs/extensions/README.md` for the index): `onboarding.md` (the
normative spec for the [onboarding extension](Extensions#the-onboarding-extension) —
`OnboardingCase` and `SupplierQualification`, the supplier onboarding lifecycle), `auction.md` (the
normative spec for the [Auction extension](Extensions#example-the-auction-extension)),
`commodity-risk.md` (the
[commodity-risk extension](Extensions#working-draft-the-commodity-risk-extension), a Working
Draft spec), and `identity.md` (the
[identity profile](Extensions#working-draft-the-identity-profile), a Working Draft landed
in-tree — adds the `Approval` object and the `delegationOfAuthority` credential type).
`docs/WEBSITE_BUILD_NOTE.md` documents the Pages build. The spec is published to
GitHub Pages by `.github/workflows/pages.yml`.

## `tools/` — reference tooling

| Tool | Purpose |
|------|---------|
| `signet-to-ubl.js` | Dependency-free projection of a SIGNET Invoice → UBL 2.1 / Peppol BIS Billing 3.0. |
| `verify-ubl.py` | Reconciles every EN 16931 Business Term and the monetary totals in the generated UBL. |
| `build-pages.js` | Renders `docs/specification.md` to HTML for GitHub Pages. |

See [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).

## `.github/` — automation & governance

- `workflows/validate.yml` — eleven checks: validation, codelist lint, JSON well-formedness,
  invoice projection + verification, the **conformance harness** (reference + broken adapters),
  the **three demonstrations** (agent, onboarding, auction), and the **extension conformance
  rules** (commodity-risk + onboarding/auction/identity); see
  [Validation & Conformance](Validation-and-Conformance).
- `workflows/pages.yml` — publishes the specification to GitHub Pages.
- `ISSUE_TEMPLATE/` — `change-proposal.md` and `spec-defect.md` (plus `config.yml`).
- `PULL_REQUEST_TEMPLATE.md`, `CODEOWNERS`, `dependabot.yml`.

## Root files

| File | Purpose |
|------|---------|
| `package.json` | npm scripts (`validate`, `transform`, `verify-ubl`, `conformance`, `conformance:broken`, `conformance:commodity-risk`, `conformance:extensions`, `agent`, `onboarding`, `auction`) and dev dependencies. |
| `validate.js` | The example validator run by `npm run validate` and CI. |
| `LICENSE` | CC0 1.0 dedication. |
| `CONTRIBUTING.md` | Contribution process and CLA — see [Contributing](Contributing). |
| `CHANGELOG.md` | Semantic-versioned history. |
| `CITATION.cff` | Machine-readable citation metadata. |

## Where to go next

- [Validation & Conformance](Validation-and-Conformance) — run the tooling.
- [Contributing](Contributing) — how to propose changes.
