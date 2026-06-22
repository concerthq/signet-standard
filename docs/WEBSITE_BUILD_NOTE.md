# Website Integration — Build Note for Claude Code

How `concert.foundation/standard` should present this repository. The governing
principle: **render from the schema; never re-type it.** The JSON Schema in
`/schema` is the single source of truth, so the website's field reference must be
generated from it at build time and can therefore never drift from the normative
artifacts.

## Source of truth

- Normative model: `schema/*.schema.json` (Draft-07).
- Semantics: `schema/context.jsonld`.
- Controlled vocabularies: `codelists/*.csv`.
- Prose narrative: `docs/specification.md` (MDX-ready).
- Examples: `examples/*.json` (already CI-validated).

Pull this repo into the Next.js site as a git submodule, an npm workspace
package, or a build-time fetch from a pinned release tag. Pin to a **version tag**
(e.g. `v0.1.0`) so the site renders a specific, stable version.

## What to generate at build time

1. **Field reference tables.** For each `schema/*.schema.json`, generate a
   reference table (Field · Type · Cardinality · Definition) from the schema's
   `properties`, `required`, and `$ref`s. Recommended: `json-schema-for-humans`,
   `@stoplight/elements`, or a small custom transformer. Cardinality derives from
   `required` + `type: array` + `minItems`. Do **not** hand-author these tables —
   generate them so they stay in lockstep with the schema.

2. **Codelist tables.** Render each `codelists/*.csv` as a table. Mark closed vs
   open lists (closed: partyRole, procedure, policyType, submissionStatus,
   decisionType, identifierScheme; open: eventType, documentType).

3. **Examples.** Render `examples/*.json` with syntax highlighting. Optionally add
   a client-side "validate your own" box using ajv in the browser against the
   published schema.

4. **The narrative.** Render `docs/specification.md` as the prose spec via MDX.

## Page structure (suggested) at /standard

- Overview + design principles  ← from `docs/specification.md`
- Architecture (the four layers) ← from `docs/specification.md`
- **Object reference** (auto-generated) ← from `schema/*.schema.json`
- **Codelists** (auto-generated) ← from `codelists/*.csv`
- **Examples** (rendered + validatable) ← from `examples/*.json`
- Standards mapping ← from `docs/specification.md`
- Conformance ← from `docs/specification.md`
- Download bar: raw JSON Schema, JSON-LD context, CSV codelists

## Version switcher

Serve each tagged version at `/standard/v0.1` (alias `/standard/latest`). Expose
the version-stable schema URLs (`concert.foundation/signet/v0.1/...`) used in the
`$id` of each schema and the `@context`, so implementers can `$ref` them directly.

## Download endpoints (parity with OCDS)

Expose, from the page, the raw artifacts for implementers:
- `…/signet/v0.1/<object>.schema.json` (each schema, by `$id`)
- `…/signet/v0.1/context.jsonld`
- `…/signet/v0.1/codelists/<name>.csv`

## Do not

- Do not author field tables by hand in MDX — generate them from the schema.
- Do not let the prose contradict the schema; the schema is normative.
- Do not inline-edit examples on the site — they live in the repo and are
  CI-validated.
