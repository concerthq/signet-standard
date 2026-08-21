# Contributing

Contributions are welcome. This repository is stewarded by **Concert Foundation** as a
neutral, open standard. This page summarises
[CONTRIBUTING.md](https://github.com/concerthq/signet-standard/blob/main/CONTRIBUTING.md) —
that file is authoritative.

## Before you contribute: the CLA

All contributions are accepted under the **Concert Contributor Licence Agreement (CLA)**.
The CLA lets Concert publish your contribution under the open licences in the
[IP & Licensing Policy](https://concert.foundation/governance) while ensuring no
contributor — and no commercial operator, including Score Networks — gains a preferential
position.

- **Individual contributors:** the CLA assistant asks you to accept on your first pull
  request.
- **Organisations:** execute the Corporate CLA (one signatory covers all staff).

You **keep ownership** of your contribution. You grant Concert a royalty-free copyright
licence and a royalty-free, non-exclusive patent licence to essential claims (the W3C
model). See https://concert.foundation/governance/cla.

## Normative vs non-normative

This determines how your change is reviewed (see
[Governance & Versioning](Governance-and-Versioning)):

- **Normative** (`schema/`, closed codelists): changes arrive **by pull request** under
  [`GOVERNANCE.md`](https://github.com/concerthq/signet-standard/blob/main/GOVERNANCE.md) — a recorded resolution, a stated comment
  period of at least fourteen calendar days, and an approving review. **No Standards Committee is
  constituted** — until one is, decisions that would fall to it are taken under the
  [bootstrap clause](https://github.com/concerthq/signet-standard/blob/main/governance/README.md#the-bootstrap-clause) and recorded as interim resolutions.
  **The schema takes precedence** over prose if they ever conflict.
- **Non-normative** (`docs/`, `examples/`, open codelist values): may be updated freely by
  pull request.

## How to propose a change

1. **Open an issue** describing the problem or gap. Use the templates:
   - [Change proposal](https://github.com/concerthq/signet-standard/blob/main/.github/ISSUE_TEMPLATE/change-proposal.md)
   - [Specification defect](https://github.com/concerthq/signet-standard/blob/main/.github/ISSUE_TEMPLATE/spec-defect.md)
2. **For schema changes,** include: the field/object affected, the backward-compatibility
   impact, and at least one example instance.
3. **Submit a pull request.** CI validates every example against the schema; **PRs cannot
   merge with failing validation** (see [Validation & Conformance](Validation-and-Conformance)).
4. **Extensions** that add (rather than change) structure should be proposed as a spec under
   `docs/extensions/<id>.md` (with schemas, codelists, and worked examples in-tree, or under
   the extension's own namespace) — see [Extensions](Extensions).

## Running validation locally

```bash
npm install
npm run validate    # validates every example against the schemas
```

To also exercise the e-invoicing pipeline:

```bash
npm run transform   # projects examples/invoice.json -> examples/invoice.ubl.xml
npm run verify-ubl  # reconciles every EN 16931 value
```

## Good first contributions

- Add or refine a **worked example** under `examples/` (CI will validate it).
- Add an **open codelist value** with a clear `Code,Title,Description` row.
- Improve a **mapping note** or the prose specification in `docs/`.
- Improve this **wiki** (non-normative).

## Where to go next

- [Governance & Versioning](Governance-and-Versioning) — change control and SemVer.
- [Repository Structure](Repository-Structure) — where everything lives.
