# Repository inventory extractor

`inventory.js` states what the tracked working tree contains at a named commit, as
deterministic JSON. It records facts. It does not classify anything as correct,
stale, missing or recommended — where a fact needs deriving, it records the line
that decided, so the derivation is auditable.

It also verifies a `CLAIMS.json`: a pack that asserts something about repository
state names its evidence as a pointer into a fresh inventory, and every claim is
re-checked before the pack is applied.

Node built-ins only. It runs on a fresh clone before `npm install`.

## Usage

```
node tools/inventory/inventory.js [--out <path>] [--since <version>] [--grep <term>]... [--pretty|--no-pretty]
node tools/inventory/inventory.js --verify <claims.json> [--inventory <path>] [--allow-drift]
node tools/inventory/inventory.js --self-test
```

| Flag | Default | Meaning |
|---|---|---|
| `--out` | `signet-inventory.json` at the repository root | Output path; `-` writes to stdout |
| `--since` | none | Changelog entries from this version upward, plus `Unreleased` |
| `--grep` | terms from `inventory.config.json` | Additional literal terms; repeatable, merged and sorted |
| `--pretty` / `--no-pretty` | pretty | 2-space indent, or one line for CI artifact size |
| `--verify` | — | Verify a claims file; generates a fresh inventory unless `--inventory` names one |
| `--allow-drift` | off | With `--verify`, report baseline drift and continue instead of failing |
| `--self-test` | — | Run the acceptance checks against the current tree |

Exit codes: `0` success · `1` verification or self-test failure · `2` usage or
environment error. Failures print one line per finding, prefixed `✗`, to stderr.

```
npm run inventory
npm run inventory:verify -- tools/inventory/CLAIMS.example.json
```

## Scope

The inventory covers `git ls-files` and nothing else. Untracked and ignored paths
are never opened — that excludes `node_modules/`, build output, `_site/`, the
local delivery packs under `handoffs/`, and the gitignored plaintext term list
that the naming check reads. The self-test asserts that this tool's own source
names neither that list nor the environment variable holding its salt.

The output is **not committed**. It is generated on demand and attached to CI runs
as a workflow artifact; `.gitignore` covers `signet-inventory.json` and
`signet-inventory.*.json`. Committing it would create a second record of the
tree's state alongside the tree itself, and invite reading the copy instead of
regenerating.

## Determinism

Same tree, same output, byte for byte, except `generated.timestamp`. Object keys
built from a file scan are inserted in sorted order; file arrays sort by path;
term arrays sort. Two inventories at different commits diff cleanly with `diff`.

Files are read as UTF-8, a leading BOM is stripped and recorded. Output is UTF-8
without BOM, LF newlines, one trailing newline.

`sha256` and `blobRaw` are over the raw bytes on disk — BOM and CRLF included —
so `sha256` matches `sha256sum` and `blobRaw` matches `git hash-object
--no-filters`. `gitBlob` is what git has staged for the path, so it matches
`git hash-object` and cross-checks against git itself.

The two differ whenever line-ending normalisation is in force — `core.autocrlf`
on a Windows checkout, or a `text=` attribute — because git then stores different
bytes from those on disk. `normalised` says which paths those are, rather than
leaving a hash that silently disagrees with git. For a path listed in
`git.dirtyPaths`, `gitBlob` describes what is staged and `blobRaw` what is on disk.

## Output contract

`inventorySchemaVersion` is `2.0.0`. Every top-level key is always present; empty
sections are `[]` or `{}`, never absent.

| Key | What it holds |
|---|---|
| `generated` | Timestamp, tool version, Node version, the arguments as invoked, and the config |
| `git` | HEAD, branch, describe, tags, dirty state with the dirty paths, tracked file count |
| `manifest` | One entry per tracked file: bytes, `sha256`, `gitBlob`, `blobRaw`, `normalised`, kind, text/binary, BOM, EOL style, line count |
| `package` | `name`, `version`, `scripts`, `devDependencies` from `package.json` |
| `ci` | Per workflow, the `run:` lines verbatim, including `run: \|` block bodies, in file order |
| `changelog` | One entry per `##` heading: version, verbatim heading, section headings, body, body hash |
| `schemas` | Every tracked JSON with a top-level `$schema`: `$id`, title, required, properties, definitions, enums, refs, external `$id`s, and `propertyPaths` |
| `codelists` | Every tracked CSV under a `codelists` directory: header, codes, full rows, closure and the line that decided it |
| `stateModel` | Objects, states, terminal states, entries with their basis, and `unknownKeys` so nothing is dropped silently |
| `conformance` | Requirement lines from `levels.md`, rules/suite/runner/adapter/fixture files, and each checker's header comment and check IDs |
| `texts` | Full verbatim content of every tracked Markdown file in the configured directories and at the root, plus `textIndex` |
| `referencedFields` | Every backticked `Object.field` in those texts, split shipped / proposed / unresolved |
| `grep` | Case-sensitive literal hits for every configured term, with path, line and the line itself |

Two shapes worth naming:

**`schemas.files[].propertyPaths`** is the field universe: every property name
reachable at any depth, dotted. It follows `properties`, `items` and the
same-level combinators (`allOf`, `anyOf`, `oneOf`, `then`, `else`). It does not
follow `$ref` — a `$ref` target's fields belong to that target, and are reachable
through its own entry.

**`texts`** carries whole files, not extracted paragraphs. The questions that go
unanswered are always the ones nobody thought to extract, so the consumer greps.
`texts.files` is keyed by path; `texts.textIndex` holds the derived indexes
(`byDirectory`, `iars`, `proposals`, `reviews`, `registers`).

### `referencedFields`

For every backticked `` `Object.field` `` or `` `Object.field.subfield` ``,
`Object` is resolved to a schema by `title` (or to a `definitions` entry of that
name), and the dotted path is looked up in its `propertyPaths`:

- **`shipped`** — the path exists.
- **`proposed`** — it does not, and every file naming it is under
  `governance/proposals/` or carries a `Status:` other than accepted, merged or
  shipped.
- **`unresolved`** — it does not, and at least one non-proposal file names it.
- **`unresolvedObjects`** — no schema title or definition of that name.

A backticked filename (`` `CHANGELOG.md` ``) parses as `Object.field` but is not
one; a single dotted segment that is a file extension is skipped.

`unresolved` is a fact, not a verdict. This tool does not fail on it. Gating merges
on it is a separate change proposal, because it would fail builds on prose that is
already merged.

## `CLAIMS.json`

A pack that asserts anything about repository state ships one. `--verify`
re-derives the inventory and checks each claim against it.

```jsonc
{
  "claimsSchemaVersion": "1.0.0",
  "pack": "some-pack",
  "baseline": "<full sha the claims were written against>",
  "claims": [
    { "id": "C-1",
      "assertion": "Policy has no property appliesTo",
      "evidence": "/schemas/files/[path=schema/policy.schema.json]/propertyPaths",
      "expect": { "notContains": "appliesTo" } }
  ]
}
```

`evidence` is an RFC 6901 JSON Pointer with one extension: an array step may be
`[key=value]`, selecting the element whose `key` equals `value`. A `/` inside the
brackets is literal, so a file path needs no escaping.

`expect` operators: `exists`, `absent`, `equals`, `notEquals`, `contains`,
`notContains`, `count`, `countGte`, `matches` (regex, strings only). Several may
appear in one `expect`; all must hold.

If `baseline` is not the current HEAD, verification prints the drift and the
intervening log, and fails — `--allow-drift` reports and continues.

**A claim with no evidence fails.** It prints `UNVERIFIED` and counts against the
run. That is the point: an unverifiable claim in a pack is a defect to fix before
the pack is applied, not a caveat to read past. A pack that must carry one states
it in prose as an assumption, not in `CLAIMS.json` as a claim.

`CLAIMS.example.json` is a working reference and passes at the commit named in its
`baseline`.

## Self-test

`--self-test` checks determinism, that the manifest is exactly the tracked file
list, that no tracked JSON carrying a top-level `$schema` was missed, that this
tool names neither the ignored plaintext term list nor its salt, and that the
output encoding holds. CI runs it, so a directory rename fails on the renaming
change rather than three sessions later.
