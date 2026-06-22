# Contributing to the SIGNET Standard

Thank you for helping build SIGNET. This repository is stewarded by
**Concert Foundation** as a neutral, open standard.

## Before you contribute: the CLA

All contributions are accepted under the **Concert Contributor Licence
Agreement (CLA)**. The CLA lets Concert publish your contribution under the open
licences in the [IP & Licensing Policy](https://concert.foundation/governance)
while ensuring no contributor — and no commercial operator, including Score
Networks — gains a preferential position.

- Individual contributors: the CLA assistant will ask you to accept on your
  first pull request.
- Organisations: execute the Corporate CLA (one signatory covers all staff).

You keep ownership of your contribution. You grant Concert a royalty-free
copyright licence and a royalty-free, non-exclusive patent licence to essential
claims (W3C model). See https://concert.foundation/governance/cla.

## What is normative vs non-normative

- **Normative** (`/schema`, `/codelists` closed lists): changes go through the
  Standards Committee revision process with a published comment period. The
  **schema takes precedence** over prose if they ever conflict.
- **Non-normative** (`/docs`, `/examples`, open codelist values): may be
  updated freely by pull request.

## How to propose a change

1. Open an issue describing the problem or gap.
2. For schema changes, include: the field/object affected, backward-compatibility
   impact, and at least one example instance.
3. Submit a pull request. CI validates every example against the schema; PRs
   cannot merge with failing validation.
4. Extensions that add (rather than change) structure should be proposed as
   packages under `/extensions` — see the extension mechanism in the spec.

## Running validation locally

```
npm run validate
```
