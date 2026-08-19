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
  first pull request — read [`CLA.md`](CLA.md) and post the one-line agreement
  the bot requests.
- Organisations: execute the Corporate CLA (one signatory covers all staff).

You keep ownership of your contribution. You grant Concert a royalty-free
copyright licence and a royalty-free, non-exclusive patent licence to essential
claims (W3C model). See [`CLA.md`](CLA.md) and
https://concert.foundation/governance/cla.

## What is normative vs non-normative

- **Normative** (`/schema`, `/codelists` closed lists, `/conformance` levels,
  suite and report schema): changes require a recorded resolution and a stated
  comment period of at least 14 calendar days. The **schema takes precedence**
  over prose if they ever conflict.
- **Normative for licensees** (`governance/mark-grammar.md` and the two closed
  registers): not CDM artifacts, but they decide what may be claimed, so they
  follow the same rule.
- **Non-normative** (`/docs`, `/wiki`, `/examples`, open codelist values, and
  the rest of `/governance`): one approving review, no comment period.

Both tiers arrive by pull request; direct commits to `main` are not a permitted
route. The full rule, including the interim arrangement standing in for a
Standards Committee that is **not yet constituted**, is in
[`GOVERNANCE.md`](GOVERNANCE.md).

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
