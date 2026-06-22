# Repository Structure

The repository holds the **normative artifacts** of the SIGNET standard, plus the tooling
that validates and projects them.

```
schema/        JSON Schema (Draft-07) — the normative Canonical Data Model
  definitions.schema.json   Foundation blocks (Identifier, Party, Value, …)
                            incl. EN 16931 blocks (Unit, InvoiceLine, VatBreakdown)
  need / sourcing-event / submission / evaluation / award /
  contract / order / catalogue / obligation / invoice .schema.json   (process layer)
  synthetic-agent / mandate / decision / policy .schema.json          (agent layer)
  event / consent .schema.json                                        (trust layer)
  party.schema.json
  context.jsonld            JSON-LD @context (aligns to ePO, PROV, W3C VC)
codelists/     Controlled vocabularies (CSV: Code, Title, Description)
examples/      Worked instances, validated in CI
docs/          The prose specification (rendered on concert.foundation/standard)
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
| Process | `need`, `sourcing-event`, `submission`, `evaluation`, `award`, `contract`, `order`, `catalogue`, `obligation`, `invoice` |
| Agent | `synthetic-agent`, `mandate`, `decision`, `policy` |
| Trust | `event`, `consent` |

`context.jsonld` is the JSON-LD context — see [Serialisation](Serialisation).

## `codelists/` — controlled vocabularies

CSV files with the header `Code,Title,Description`. See [Codelists](Codelists) for the full
content of each list and which fields they constrain.

## `examples/` — worked instances

CI-validated instances covering the lifecycle, plus the generated `invoice.ubl.xml`. See
[Worked Examples](Worked-Examples).

## `docs/` — the prose specification

`docs/specification.md` is the human-readable specification (the normative text; the schema
still takes precedence). `docs/WEBSITE_BUILD_NOTE.md` documents the Pages build. The spec is
published to GitHub Pages by `.github/workflows/pages.yml`.

## `tools/` — reference tooling

| Tool | Purpose |
|------|---------|
| `signet-to-ubl.js` | Dependency-free projection of a SIGNET Invoice → UBL 2.1 / Peppol BIS Billing 3.0. |
| `verify-ubl.py` | Reconciles every EN 16931 Business Term and the monetary totals in the generated UBL. |
| `build-pages.js` | Renders `docs/specification.md` to HTML for GitHub Pages. |

See [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).

## `.github/` — automation & governance

- `workflows/validate.yml` — validation, codelist lint, JSON well-formedness, invoice
  projection + verification (see [Validation & Conformance](Validation-and-Conformance)).
- `workflows/pages.yml` — publishes the specification to GitHub Pages.
- `ISSUE_TEMPLATE/` — `change-proposal.md` and `spec-defect.md` (plus `config.yml`).
- `PULL_REQUEST_TEMPLATE.md`, `CODEOWNERS`, `dependabot.yml`.

## Root files

| File | Purpose |
|------|---------|
| `package.json` | npm scripts (`validate`, `transform`, `verify-ubl`) and dev dependencies. |
| `validate.js` | The example validator run by `npm run validate` and CI. |
| `LICENSE` | CC0 1.0 dedication. |
| `CONTRIBUTING.md` | Contribution process and CLA — see [Contributing](Contributing). |
| `CHANGELOG.md` | Semantic-versioned history. |
| `CITATION.cff` | Machine-readable citation metadata. |

## Where to go next

- [Validation & Conformance](Validation-and-Conformance) — run the tooling.
- [Contributing](Contributing) — how to propose changes.
