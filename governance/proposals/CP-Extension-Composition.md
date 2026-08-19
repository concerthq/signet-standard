# CP-Extension-Composition

**Status:** Draft — not yet balloted. **Gates open** (§8); three gates resolved in §7.
**Affects:** the 18 root object schemas, `schema/obligation.schema.json`,
`schema/definitions.schema.json`, `conformance/runner/`, `conformance/fixtures/`,
`conformance/suite/document-conformance.json`, `conformance/levels.md`,
`wiki/Extensions.md`, `wiki/Validation-and-Conformance.md`
**Target:** Part 1 — the next v0.x minor; Part 2 — the v1.0 train
**Breaking:** Part 1 no; Part 2 yes
**Depends on:** none
**Blocks:** any implementer field that is not core

---

## 1. Problem statement

The Extensions page instructs implementers to add structure "under their own namespace." That
instruction is currently unexecutable against the published schemas.

All 18 root object schemas set `additionalProperties: false`. Under JSON Schema Draft-07,
`additionalProperties` is evaluated against `properties` and `patternProperties` **within the
same schema object only**. It does not see properties contributed by sibling `allOf` branches.
The OCDS-style extension pattern —

```json
{
  "allOf": [
    { "$ref": "https://concert.foundation/signet/v0.1/order.schema.json" },
    { "properties": { "vfCostCentre": { "type": "string" } } }
  ]
}
```

— therefore fails. The `$ref`'d branch evaluates `vfCostCentre` as an unknown property and
rejects the instance. There is no ordering, wrapping, or `$ref` arrangement that makes this
work in Draft-07.

Two consequences follow:

1. **`Extensions.md` makes a claim the schemas cannot honour.** No extension has been built
   against it, which is why the defect has not previously surfaced.
2. **No implementer can carry a local field and remain document-conformant.** Every private
   field — an ERP company code, a cost centre, an internal approval reference — currently
   forces a choice between conformance and utility.

### 1.1 Two needs, currently conflated

The word "extension" is being used for two things with different governance, different
authorship, and different conformance treatment. One mechanism cannot serve both.

| | **Published extension** | **Private local field** |
|---|---|---|
| Example | defence procurement package | `example-org:costCentre` |
| Author | a community, via change proposal | one implementer |
| Constrained by | its own published schema | nothing global |
| Conformance | separately assessed (`Extensions.md` §3) | out of scope |
| Promotion to core | via change proposal | never, without first becoming a published extension |
| Mechanism needed | composition + constraint | permission to exist |

Attempting to serve both with one mechanism is what produces unnamespaced `x-` fields that
become de facto standards without ever passing through change control.

---

## 2. Proposal

Adopt **two mechanisms**, delivered in two parts.

### Part 1 — Namespaced private fields (v0.x, non-breaking)

Add a namespace escape hatch to the affected schemas. Purely permissive: nothing that
validates today ceases to validate.

```json
"patternProperties": {
  "^[a-z][a-z0-9-]*:[A-Za-z][A-Za-z0-9]*$": {}
},
"additionalProperties": false
```

`example-org:costCentre` validates. `procurringParty` — a misspelling of a core field — is still
rejected, because it carries no prefix. The property that makes the wire contract worth
certifying is preserved.

Extension fields are validated as `{}` — the core schema permits them without constraining
them. This is consistent with `Extensions.md` §3, which already states that core conformance
is assessed against the core model only.

### Part 2 — Composed published extensions (v1.0, breaking)

Migrate the normative model to **JSON Schema 2020-12** and add `unevaluatedProperties: false`
alongside the namespace pattern. `unevaluatedProperties` considers properties evaluated by
**all** applicable subschemas, including `allOf` branches, so the composition pattern in §1
works as `Extensions.md` has always described.

Both mechanisms then coexist and carry different meanings:

- **prefixed field** — private, unconstrained by core, never certifiable, never promoted
  without first becoming a published extension;
- **composed field** — belongs to a published, versioned extension, constrained by that
  extension's own schema, separately conformance-assessed.

The harness can then report honestly: *"instance carries 3 private extension fields; core
conformance unaffected."*

### 2.1 Where the pattern applies

Not everywhere. The pattern is added to objects where a private field is plausible, and
withheld from atomic primitives where a prefixed field would be meaningless.

| Applies | Withheld |
|---|---|
| All 18 root objects | `Identifier` |
| `Obligation` (embedded) | `Value` |
| `Item` | `Period` |
| `InvoiceLine` | `Classification` |
| `Lot` (inline in `sourcing-event.schema.json`) | `Credential`, `Document`, `Provenance`, `Score`, `Unit`, `VatBreakdown` |
| | `Market`, `Tenancy` (see CP-Tenancy) |

Rationale for the withheld set: these are value objects with fixed, standards-derived shape
(EN 16931, W3C PROV, UN/ECE Rec 20). A private field on a `Value` has nowhere meaningful to
attach. `VatBreakdown` and `InvoiceLine` are treated differently because `InvoiceLine` is
where implementers demonstrably need local line-level attribution and `VatBreakdown` is a
computed subtotal.

### 2.2 Prefix rules

1. `signet:` and `concert:` are **reserved**. Implementer use is prohibited.
2. Bare `x-` is **forbidden** — unnamespaced, collision-prone, and carries OpenAPI-legacy
   expectations that do not apply here.
3. Prefixes are lowercase, so they read as JSON-LD compact IRIs.
4. Prefixes are **self-asserted, first-come**. Concert operates no prefix registry
   (see §7, D5c). Collisions are the implementers' problem.

Rules 1 and 2 are enforced in the **harness**, not the schema — see §2.3.

### 2.3 Why reservation is not enforced in the schema

A negative-lookahead pattern (`^(?!signet:|concert:)[a-z]...`) would work under Ajv, which
uses ECMA-262 regex. But Draft-07 only says regexes *should* be ECMA-262, and lookahead is
outside the portable subset that non-JavaScript validators reliably implement. Encoding a
governance rule in a construct that some conformant validators may not support would make
the rule silently unenforced on exactly the implementations least likely to be checked.

Reservation is therefore a harness check, consistent with the enforcement philosophy adopted
in CP-Codelist-Enforcement: **closed things are enforced by the suite, permissive shapes by
the schema.**

### 2.4 JSON-LD interaction

Objects carry `@context`. A prefixed field is a compact IRI, so the two mechanisms align
rather than merely coexist:

- A **published extension** ships a context fragment mapping its prefix. Its fields expand to
  proper IRIs and survive RDF round-trip.
- A **private field** has no context mapping and is therefore **dropped during JSON-LD
  expansion**.

The drop is semantically correct — private fields have no global meaning — but it must be
documented, because an implementer expecting lossless expansion of prefixed fields will be
surprised. The corollary is a useful forcing function: to make private data survive
expansion, publish a context; publishing a context is the first step toward becoming an
extension rather than a private field.

---

## 3. Schema changes

### Part 1 (v0.x)

For each schema in the "Applies" column of §2.1, insert `patternProperties` immediately
before the existing `additionalProperties: false`. No other change.

Example — `order.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://concert.foundation/signet/v0.1/order.schema.json",
  "title": "Order",
  "type": "object",
  "required": ["id", "buyer", "seller", "items", "value"],
  "patternProperties": {
    "^[a-z][a-z0-9-]*:[A-Za-z][A-Za-z0-9]*$": {}
  },
  "additionalProperties": false,
  "properties": { "...": "unchanged" }
}
```

### Part 2 (v1.0)

| Change | Detail |
|---|---|
| `$schema` | `http://json-schema.org/draft-07/schema#` → `https://json-schema.org/draft/2020-12/schema` in all 19 schema files |
| `definitions` → `$defs` | Rename the container in `definitions.schema.json` |
| `$ref` paths | `definitions.schema.json#/definitions/X` → `#/$defs/X` in every referencing schema |
| `unevaluatedProperties` | Add `"unevaluatedProperties": false` to each object carrying the namespace pattern; retain `additionalProperties: false` |
| `allOf`-wrapped `$ref` collapse | 2020-12 permits `$ref` siblings — see §3.1 |
| Validator | `ajv` → `ajv/dist/2020` in `validate.js` and `conformance/runner/lib.js` |
| `format` | Regression test for assertion-vs-annotation behaviour across dialects |

### 3.1 The `$ref` sibling collapse

`Validation-and-Conformance.md` records that EN 16931 BT annotations are preserved by
wrapping `$ref` in `allOf`, "because Draft-07 ignores keywords sitting beside a bare `$ref`."
2020-12 removes that constraint.

Before:

```json
"itemNetPrice": {
  "$comment": "EN 16931 BT-146 Item net price",
  "allOf": [ { "$ref": "definitions.schema.json#/definitions/Value" } ]
}
```

After:

```json
"itemNetPrice": {
  "$ref": "#/$defs/Value",
  "$comment": "EN 16931 BT-146 Item net price"
}
```

Affected fields: `InvoiceLine.itemNetPrice`, `InvoiceLine.netAmount`,
`InvoiceLine.classification`, `VatBreakdown.taxableAmount`, `VatBreakdown.taxAmount`.

This strengthens the F-MAP traceability story rather than risking it: the BT annotation moves
from a workaround into the natural position.

### 3.2 Tooling prerequisite

From v1.0, a **2020-12-capable validator is a precondition of conformance assessment**. This
is a stated requirement, recorded in `conformance/levels.md` and the v1.0 release notes — not
something an implementer discovers when their code generator fails.

Concert-side cost is a one-line import change (Ajv 8 ships 2020-12 natively). Implementer-side
cost lands on code generators and anything sitting on OpenAPI 3.0, which is Draft-05-shaped.
OpenAPI 3.1 aligns with 2020-12. Per D5b, this exposure is a **migration cost, not a veto** —
the decision was taken on the merits.

---

## 4. Conformance suite changes

The suite changes ship **in the same release as Part 1**. Without them, the suite silently
stops testing what it claims to test.

`conformance/fixtures/invalid/party-bad.json` currently targets two rules at once —
`partyType` enum and `additionalProperties`. Adding `patternProperties` changes the second.

| Fixture | Action | Targets | Must |
|---|---|---|---|
| `party-bad.json` | Narrow to the enum rule only | `partyType` enum | be rejected |
| `party-unknown-property.json` | **New** | unprefixed unknown property (e.g. `procurringParty`) | be rejected |
| `party-reserved-prefix.json` | **New** | `signet:` on a non-core object (harness check) | be rejected |
| `order-private-extension.json` | **New**, positive | `example-org:costCentre` on a conforming Order | **validate** |

The positive fixture is the load-bearing one. Without it, the escape hatch is asserted rather
than proven, and a future schema edit could close it unnoticed.

Suite version bumps with the release. Existing certifications remain valid at their recorded
CDM and suite versions; §5 applies.

---

## 5. Backward compatibility

**Part 1 — non-breaking.** Purely permissive. Every instance valid before remains valid.
Every instance invalid before, except one carrying a prefixed property, remains invalid. No
re-certification required.

**Part 2 — breaking, by design.** Per D4, v1.0 does not preserve backward compatibility.
A new CDM major version already requires re-certification under `certification.md`.

The decisive scheduling argument: **v1.0 opens exactly one break window.** CP-Tenancy already
spends it by making `tenancy` required. Spending it once on tenancy and dialect together is
strictly cheaper than breaking twice. Delivering the dialect migration in a v0.x minor would
produce the worst outcome — churn without the licence to break.

---

## 6. Rejected alternatives

**A — Drop `additionalProperties: false`.** Everything passes. A misspelled `procurringParty`
is silently dropped rather than caught. **Declined:** this guts the wire-contract property
that document conformance exists to assert, and with it the credibility of C-DOC. A standard
that cannot detect a typo cannot certify an implementation.

**B — Pattern only, no dialect migration.** Solves private fields permanently but leaves
published extensions unbuildable, so `Extensions.md` continues to describe a mechanism that
does not exist. **Declined:** the two needs in §1.1 are genuinely different and the community
extension path is core to the promotion model in `Governance-and-Versioning`.

**C — 2020-12 only, no pattern.** Correct for published extensions; forces every private
local field through the extension publication process. **Declined:** disproportionate. An ERP
company code should not require a published, versioned package. It also defers all relief to
v1.0, leaving current implementers blocked.

**D — Negative-lookahead pattern for reserved prefixes.** Rejected on portability grounds —
see §2.3.

**E — Concert-operated prefix registry.** **Declined (D5c).** The moment Concert maintains
the list of valid prefixes, Concert operates a directory rather than stewarding a vocabulary.
The same reasoning that keeps marketplace identifiers self-asserted applies here.

**F — `x-` prefix convention.** **Declined.** Unnamespaced, so two implementers collide on
`x-costCentre` with different semantics; and it carries OpenAPI expectations about vendor
extensions that do not hold in this model.

---

## 7. Resolved gates

| Gate | Resolution |
|---|---|
| D5a | Pattern at v0.x; 2020-12 at v1.0 |
| D5b | Not gated on implementer OpenAPI exposure; decided on the merits. Exposure is a migration cost, recorded as a tooling prerequisite (§3.2) |
| D5c | No prefix registry; self-asserted, first-come |
| D5d | Closed-codelist enforcement scoped separately — see CP-Codelist-Enforcement |

## 8. Open gates for Standards Committee resolution

⛔ **E-1 — Embedded-object scope.** §2.1 proposes the pattern on `Item`, `InvoiceLine`,
`Lot`, `Obligation` but not on the value primitives. Committee to ratify the split, or
narrow to root objects only.

⛔ **E-2 — Prefix syntax.** The proposed pattern permits `-` in prefixes
(`example-group:field`). Confirm, or restrict to `^[a-z][a-z0-9]*:`.

⛔ **E-3 — Reserved-prefix scope.** `signet:` and `concert:` are reserved. Should
`ocds:`, `ubl:`, `peppol:` also be reserved to prevent implementers minting conflicting
meanings for standards SIGNET maps to?

## 9. Documentation changes

- `Extensions.md` — replace the current mechanism description with the two-mechanism model;
  add the JSON-LD expansion corollary (§2.4).
- `Validation-and-Conformance.md` — update "Schema design notes"; the line "A migration to
  JSON Schema 2020-12 will be considered before v1.0" becomes a recorded decision.
- `conformance/levels.md` — add the v1.0 tooling prerequisite (§3.2).
