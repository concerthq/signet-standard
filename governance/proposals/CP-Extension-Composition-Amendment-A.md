# CP-Extension-Composition — Amendment A

**Status:** Draft — not yet balloted. Registered under IAR-0006.
> *Registered pre-constitution under IAR-0006. Registration is not adoption and does not pre-empt the Committee's agenda.*

**Origin:** the steward's implementer-advisory role. **Recusal:** the steward is recused from adoption; recorded at interests register entry 2.
**Amends:** CP-Extension-Composition §1.1, §2 Part 2, §6 alternative B, §7 D5a, §8 E-1/E-3; CP-Codelist-Enforcement §7 C-4
**Depends on:** Part 1 (landed, v0.16.0, 22 sites)
**Breaking:** No change to Part 1. Narrows Part 2.

## A1. Published-extension fields do not need `unevaluatedProperties`

§6 alternative B declines "pattern only" because it "leaves published extensions unbuildable". It does not. A published extension attaches a field as `<id>:<field>` under the Part 1 pattern and constrains it with its own field schema, resolved by path from the extension's declared id. The harness validates the value under the namespaced key against that schema; the core schema admits the key. This is composition, done by the harness rather than by `allOf`, and it is consistent with §2.3's own principle: closed things are enforced by the suite, permissive shapes by the schema.

What `unevaluatedProperties` would add is composition *inside the validator*: a single `allOf` document that rejects an extended instance carrying an unknown key. What it costs is ignorability. Under `allOf` + `unevaluatedProperties: false`, a core-only reader fails an extended instance unless it strips namespaced keys first or holds the composed schema; under the pattern, the same reader passes it, and Extensions §3 ("core conformance is assessed against the core model only") is true at validation time rather than by convention. Proven in the attached pack: an extended `SourcingEvent` passes the slot-only core schema and fails the pre-slot one.

**Amendment:** Part 2 drops `unevaluatedProperties`. The distinction in §1.1 between private and published fields is carried by whether the prefix resolves to a published extension (a context fragment and field schemas exist), not by which validation keyword admits it. §2.4's corollary is unchanged and becomes the whole mechanism: publishing a context and field schemas *is* becoming an extension.

## A2. What Part 2 still is

The 2020-12 migration stands on its remaining merit — `$ref` siblings (§3.1), removing the `allOf` workaround — and rides the v1.0 break window per D5a. It is no longer coupled to composition. Two non-normative tools are attached so the decision can be taken on a test rather than an argument: `tools/migrate-2020-12.js` (mechanical rewrite; T1 `$schema`, T2 `definitions`→`$defs` and refs, T3 `allOf` unwrap, T4 `format` report) and `conformance/rules/check-dialect-equivalence.js` (identical verdicts across the corpus under both dialects; report-only until the train, `--gate` after). §3.1's affected-field count is a verification candidate (C-2 in the defect additions).

## A3. Layout for published-extension field schemas (new gate E-4)

Resolution by path needs a path. Proposed: `schema/<id>/fields/<Scope>/<field>.schema.json`, where `<id>` is the extension id from `docs/extensions/README.md` and `<Scope>` is the schema title of the object the field attaches to, or `<ParentTitle>.<property>` for an anonymous embedded object (`SourcingEvent.lots`). The extension's `context.jsonld` declares `<id>` as a prefix. The generated inventory already indexes `schema/` and `docs/extensions/`; nothing new is registered. Alternative: field schemas beside the extension's object schemas, flat in `schema/`, named `<id>.<Scope>.<field>.schema.json`.

## A4. Inputs to open gates

**E-1 (embedded-object scope).** Two facts. (i) Eleven tracked schemas lack the pattern, including all nine in-tree extension roots (D-38) — the scope statement "18 root objects" did not consider extension roots, and there is no stated reason a `Bid` should refuse a private field an `Order` accepts. (ii) A selective list is a second hand-maintained record of "where private fields may attach"; a uniform rule ("every `additionalProperties: false` node, or every root object") is checkable as an invariant. Recommend: all root objects including extension roots; embedded objects per the existing four; the invariant checked in CI.

**E-2 (hyphen in prefix).** Keep. Extension ids already use it (`commodity-risk`).

**E-3 (reserved-prefix scope).** Add a rule rather than a list: every prefix that appears in a core codelist code is reserved (today `gleif`, `gs1`; D-37). `ocds`, `ubl`, `peppol` follow by listing; the rule catches the next one.

**C-4 (extension-defined codelists, CP-Codelist-Enforcement).** Resolve for the general case the way §2.4 of CP-EventType-Closure resolves it for `eventType`: a value is a core code verbatim, or `<id>:<code>` present in the extension's own codelist file for that list. The harness resolves; the schema admits via `anyOf: [{enum}, {pattern}]` rather than a bare `enum` — which is why D-39 is timely. Reference implementation attached (`check-codelist-values.js`, CV-1..CV-5).

## A5. Declined

**Untyped `extensions` object slot.** Declined: loses per-field provenance and the JSON-LD alignment.
**`x-` third tier for implementation-private values.** Declined: §2.2 rule 2 already forbids bare `x-`; private values are simply prefixed values whose prefix resolves to nothing.
