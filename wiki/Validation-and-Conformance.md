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

To run the **conformance harness** (new in v0.4.0 — see [Conformance Harness](Conformance-Harness)):

```bash
npm run conformance         # reference adapter must reach Core+ (exits 0)
npm run conformance:broken  # the broken adapter must be rejected (exits 1)
```

To run the **three demonstrations** (each ends with a conformance-clean check; see
[Agent Layer](Agent-Layer) and [Extensions](Extensions)):

```bash
npm run agent               # an agent awards a contract under a Mandate (governed, conformance-clean)
npm run onboarding          # a supplier onboarding case reaches a conditional qualification
npm run auction             # a reverse auction closes deterministically to a single winner
```

To run the **extension conformance rules** (cross-object checkers beyond schema validation):

```bash
npm run conformance:commodity-risk   # reconciliation arithmetic, scenario integrity, rule ordering
npm run conformance:extensions       # onboarding, auction, and identity cross-object rules
```

## What CI checks

`.github/workflows/validate.yml` runs on every push to `main`/`dev` and every PR to `main`.
It performs fifteen checks — a PR cannot merge while any fail:

1. **Schema validation.** `node validate.js` validates every example against the schemas.
2. **Codelist lint.** Every `codelists/*.csv` must start with the header
   `Code,Title,Description`.
3. **Codelist governance.** `node conformance/rules/check-codelists.js` — the open
   `eventType.csv` and the closed, normative `eventTypeCore.csv` must never intersect, no file
   may repeat a code, and no code may leave the closed subset. A closed codelist whose closure
   depends on a reviewer noticing is not closed, so the boundary is asserted here.
4. **Mark grammar lint.** `node tools/lint-mark-strings.js` — every worked form in
   `governance/mark-grammar.md` parses against the ABNF; every endorsement and role register
   entry renders a valid mark; and no superseded mark form or prohibited construction survives
   anywhere in published copy.
5. **JSON well-formedness.** Every file in `schema/*.json`, `examples/*.json`, and
   `schema/context.jsonld` must parse.
6. **Invoice projection + verification.** Projects `examples/invoice.json` to Peppol BIS
   Billing UBL and runs `tools/verify-ubl.py` to reconcile every EN 16931 Business Term and
   the monetary totals.
7. **Conformance — reference implementation.** Runs the [harness](Conformance-Harness); the
   bundled reference adapter must reach **Core+**.
8. **Conformance — broken implementation.** The deliberately broken adapter must be
   **rejected** (the step inverts its exit code), proving the suite discriminates.
9. **Endorsement checks — reference implementation.** Runs
   `node conformance/rules/check-endorsements.js`; the reference adapter must earn both `E-MDT`
   and `E-CNS`. These are draft and decide no conformance level.
10. **Endorsement checks — the cites-but-does-not-enforce adapter.** The broken adapter's agent
    surface passes F-SEM at step 8 and must **fail E-MDT** here. This step is the argument for
    the endorsement, run continuously rather than asserted.
11. **Agent demonstration.** Runs `node agent/run-agent.js`; the agent's governed action must
    be conformance-clean — every Decision, Evaluation, and Award validates, the event chain
    holds, and tampering is detected.
12. **Supplier-onboarding demonstration.** Runs `node onboarding/run-onboarding.js`; an
    onboarding case reaches a **conditional** qualification, conformance-clean.
13. **Reverse-auction demonstration.** Runs `node auction/run-auction.js`; the auction closes
    **deterministically** to a single winner, conformance-clean.
14. **Commodity-risk conformance rules.** Runs `node conformance/rules/check-commodity-risk.js`
    — the six [commodity-risk extension](Extensions#working-draft-the-commodity-risk-extension) rules,
    including the cross-object reconciliation, scenario-integrity, and rule-ordering checks.
15. **Extension conformance rules.** Runs `npm run conformance:extensions` — the cross-object
    checkers for the onboarding, auction, and identity extensions.

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

Since **v0.4.0** this is verified by the **machine-runnable conformance harness** shipped in
`conformance/` (Apache-2.0 licensed). It defines two levels — **Core** (C-DOC, C-EVT,
C-PROV) and **Full** (Core + F-MAP, F-SEM) — runs them against any implementation through a
small adapter, and emits a reproducible report. Certification of conformance, and the
**"SIGNET Certified"** mark, are administered by Concert under the IP & Licensing Policy on
identical terms to all implementers (neutrality rules CN-1…CN-4).

See the dedicated **[Conformance Harness](Conformance-Harness)** page for the levels, the
requirements, the adapter contract, and the certification process.

## Precedence

When sources disagree, this is the order of authority:

1. The **JSON Schema** (`schema/`) — the source of truth.
2. The **prose specification** (`docs/specification.md`).
3. This **wiki**.

## Where to go next

- [Conformance Harness](Conformance-Harness) — levels, requirements, and certification.
- [Worked Examples](Worked-Examples) — the instances CI validates.
- [Repository Structure](Repository-Structure) — where everything lives.
- [Governance & Versioning](Governance-and-Versioning) — how the normative artifacts change.
