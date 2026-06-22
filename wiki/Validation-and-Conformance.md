# Validation & Conformance

SIGNET ships its normative model as **JSON Schema (Draft-07)** and enforces it in CI, so
documents and examples can never silently drift from the standard.

## Validate locally

```bash
npm install        # ajv@8 + ajv-formats@3 (devDependencies)
npm run validate   # validates every example in examples/ against the schemas
```

`npm run validate` runs `node validate.js`, which compiles the schemas with **Ajv 8** (plus
`ajv-formats` for `date-time`, `uri`, etc.) and validates each instance in `examples/`.

To also prove the e-invoicing projection (requires Node and Python 3):

```bash
npm run transform   # node tools/signet-to-ubl.js > examples/invoice.ubl.xml
npm run verify-ubl  # python3 tools/verify-ubl.py
```

## What CI checks

`.github/workflows/validate.yml` runs on every push to `main`/`dev` and every PR to `main`.
It performs four checks — a PR cannot merge while any fail:

1. **Schema validation.** `node validate.js` validates every example against the schemas.
2. **Codelist lint.** Every `codelists/*.csv` must start with the header
   `Code,Title,Description`.
3. **JSON well-formedness.** Every file in `schema/*.json`, `examples/*.json`, and
   `schema/context.jsonld` must parse.
4. **Invoice projection + verification.** Projects `examples/invoice.json` to Peppol BIS
   Billing UBL and runs `tools/verify-ubl.py` to reconcile every EN 16931 Business Term and
   the monetary totals.

A separate workflow, `.github/workflows/pages.yml`, renders `docs/specification.md` to HTML
and publishes it to GitHub Pages (it runs `tools/build-pages.js` with `marked`).

## Schema design notes

- **Draft-07** is targeted for maximum implementer-tooling compatibility. A migration to
  JSON Schema 2020-12 will be considered before v1.0.
- Foundation blocks live in `schema/definitions.schema.json` and are referenced via `$ref`
  from the per-object schemas.
- **EN 16931 BT annotations** on `$ref` fields are preserved by wrapping the reference in
  `allOf`, because Draft-07 ignores keywords sitting beside a bare `$ref`. This keeps the
  BT/BG traceability structurally intact — see
  [Foundation Layer → InvoiceLine](Foundation-Layer#invoiceline).
- Most objects set `additionalProperties: false`, so unknown fields are rejected rather than
  silently ignored.

## Document conformance (specification §13)

> **A document conforms** to the CDM if it validates against the published SIGNET JSON
> Schema for its declared version and satisfies the structural rules in the specification.

That is exactly what `npm run validate` checks for the shipped examples.

## Implementation conformance

> **An implementation conforms** if it:
> 1. reads and writes conforming documents;
> 2. performs the normative [standards mappings](Standards-Mapping) without loss of mapped
>    fields; and
> 3. preserves provenance and event integrity for every material change it makes.

Conformance is verified against the **SIGNET conformance test suite** (a separate normative
artifact, Apache-2.0 licensed) and its synthetic test datasets (CDLA-Permissive).
Certification of conformance, and the **"SIGNET Certified"** mark, are administered by
Concert under the IP & Licensing Policy on identical terms to all implementers.

## Precedence

When sources disagree, this is the order of authority:

1. The **JSON Schema** (`schema/`) — the source of truth.
2. The **prose specification** (`docs/specification.md`).
3. This **wiki**.

## Where to go next

- [Worked Examples](Worked-Examples) — the instances CI validates.
- [Repository Structure](Repository-Structure) — where everything lives.
- [Governance & Versioning](Governance-and-Versioning) — how the normative artifacts change.
