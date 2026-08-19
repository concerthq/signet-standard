# CP-Tenancy

**Status:** Draft — not yet balloted. **Gates open** (§9); `T-4` resolved (§10).
**Affects:** `schema/definitions.schema.json`, the 18 root object schemas,
`schema/sourcing-event.schema.json` (inline `Lot`), `codelists/partyRole.csv`,
`codelists/regulatoryRegime.csv` (new), `examples/`, `conformance/`
**Target:** the v1.0 train
**Breaking:** Yes — `tenancy` is required at v1.0 (§7)
**Depends on:** CP-Codelist-Enforcement (must land in or before the same release; see §8)
**Independent of:** CP-Extension-Composition — `tenancy` is core, so it sits inside
`properties` and satisfies `additionalProperties: false` by construction

---

## 1. Problem statement

Tenant, market and marketplace are three independent concepts. None of them exists in the CDM.

Checked against the normative artifacts rather than the prose: across all 18 root schemas and
`definitions.schema.json`, there is no `tenant`, `market`, `marketplace`, `jurisdiction`,
`country`, `region`, or `namespace` field. Not on any object; not in any shared definition.

Two structures currently absorb the work implicitly:

1. **`Party.memberOf`** — a single `Identifier` expressing "this party belongs to that party."
   It can express that a buyer group’s German subsidiary sits under its parent. It cannot express that an
   Order belongs to a tenant.
2. **The identifier namespace.** Every worked example carries tenancy in the DID authority:
   `did:web:buyer.example#need-0420`. Identity is silently doing tenancy work in the
   reference examples themselves.

The second is the more serious. Identifier-encoded tenancy is unpatchable once instances
exist, and it collapses all three axes into one string.

### 1.1 The three axes

| | Question it answers | Nature | Changes when |
|---|---|---|---|
| **Tenant** | Whose data is this, and who authorises its deletion? | Governance / control | The legal entity boundary moves |
| **Market** | Which law and procurement rules validate this object? | Regulatory | The jurisdiction of the procurement act changes |
| **Marketplace** | Which venue or node published or received this object? | Topological | The discovery or exchange route changes |

### 1.2 Why each collapse fails

Each of these is a live case, not a hypothetical.

**Tenant ≡ Market fails** on a group-level framework agreement spanning DE, UK and IT. One
tenant, three markets, one contract. Collapse them and the framework cannot be represented.

**Market ≡ Marketplace fails** on a supplier discovered via an external venue but contracted
under German law — one market, two marketplaces. It fails in reverse too: one marketplace
serving several markets is the normal case for any shared catalogue.

**Tenant ≡ Marketplace fails on the joint venture.** A shared venue serving two tenants with
separate data control is the origin case for SIGNET. If those two collapse, the thing the
standard was built for is unmodellable.

**Tenant ≡ `procuringParty` fails** the moment one tenant hosts multiple buying entities, or
one supplier Party appears across several tenants. This is the collapse implementers reach
for first, because `procuringParty` is already required and looks close enough.

### 1.3 The asymmetry a naive design misses

A tender can legitimately sit in several markets. An invoice cannot be issued in two tax
jurisdictions. Cardinality must therefore vary by object class rather than being uniform
across the model. §4 specifies it per object.

---

## 2. Schema additions

Two new definitions in `definitions.schema.json`.

### 2.1 `Tenancy`

```json
"Tenancy": {
  "type": "object",
  "title": "Tenancy",
  "description": "Where an object sits: who controls it, which regulatory market it acts in, and which venue it was exchanged through. The three vary independently.",
  "required": ["tenant"],
  "additionalProperties": false,
  "properties": {
    "tenant": {
      "$ref": "#/definitions/Identifier",
      "description": "The Party controlling this record. MUST reference a Party carrying the 'tenant' role. Exactly one."
    },
    "markets": {
      "type": "array",
      "items": { "$ref": "#/definitions/Market" },
      "description": "Regulatory markets this object acts in. Cardinality is constrained per object class — see the specification."
    },
    "marketplaces": {
      "type": "array",
      "items": { "$ref": "#/definitions/Identifier" },
      "description": "Venues or network nodes this object was published to or received from. Self-asserted identifiers; Concert operates no marketplace registry."
    }
  }
}
```

### 2.2 `Market`

```json
"Market": {
  "type": "object",
  "title": "Market",
  "description": "A regulatory market: a jurisdiction, optionally narrowed to a subdivision, optionally qualified by the procurement regime in force.",
  "required": ["jurisdiction"],
  "additionalProperties": false,
  "properties": {
    "jurisdiction": {
      "type": "string",
      "pattern": "^[A-Z]{2}$",
      "description": "ISO 3166-1 alpha-2 country code. Open codelist."
    },
    "subdivision": {
      "type": "string",
      "pattern": "^[A-Z]{2}-[A-Z0-9]{1,3}$",
      "description": "ISO 3166-2 subdivision code, where the market is sub-national."
    },
    "regulatoryRegime": {
      "type": "string",
      "description": "See codelists/regulatoryRegime.csv. Closed codelist — membership enforced by the conformance suite."
    }
  }
}
```

`regulatoryRegime` is the field that earns `Market` its existence. A country code alone does
not identify the binding regime: Norway is EEA not EU, the UK is post-Procurement Act 2023,
and a great deal of large-buyer procurement is private-sector commercial rather than regulated public
procurement at all. Without it, `market` degenerates into `Party.address.country` and gets
collapsed by the first implementer who notices the duplication.

**`regulatoryRegime` covers the procurement regime only.** Tax and e-invoicing treatment
derive from `jurisdiction` plus date plus the EN 16931 / ViDA mapping, and must not be
duplicated here — see §6, rejected alternative D.

### 2.3 Placement

`tenancy` is added to all **18 root objects** as a required property.

`Obligation` is embedded-only (no `@context`) and inherits from its containing `Contract`.
`Item`, `InvoiceLine` and `VatBreakdown` likewise inherit from their container.

**One exception:** `Lot` — inline in `sourcing-event.schema.json` — gains an optional
`market` override:

```json
"market": {
  "$ref": "definitions.schema.json#/definitions/Market",
  "description": "Overrides the containing SourcingEvent's market for this lot. Present when a single event spans markets with different regimes."
}
```

Multi-market events decompose by lot in practice. A DE lot and a GB lot under one event
differ on both tax and procurement regime, and the Contracts descending from them must inherit
market from the **lot**, not the event.

### 2.4 Per-object narrowing

Cardinality cannot live in the shared definition. Each root schema narrows locally:

```json
"tenancy": {
  "allOf": [
    { "$ref": "definitions.schema.json#/definitions/Tenancy" },
    { "properties": { "markets": { "minItems": 1, "maxItems": 1 } } }
  ]
}
```

This works in Draft-07 because the narrowing branch sets no `additionalProperties` of its
own, and it survives the 2020-12 migration in CP-Extension-Composition unchanged. Eighteen
small local narrowings, one shared shape.

---

## 3. Codelists

### 3.1 `partyRole.csv` — addition

| Code | Title | Description |
|---|---|---|
| `tenant` | Tenant | A party that controls a data boundary within a deployment. Referenced by `Tenancy.tenant`. |

### 3.2 `regulatoryRegime.csv` — new, closed

| Code | Title | Description |
|---|---|---|
| `private-commercial` | Private commercial | Procurement not subject to a public procurement regime. |
| `eu-ppd-2014-24` | EU Public Procurement Directive | Directive 2014/24/EU, as transposed. |
| `eu-ppd-2014-25` | EU Utilities Directive | Directive 2014/25/EU, as transposed. |
| `uk-pa-2023` | UK Procurement Act 2023 | The regime in force in the United Kingdom from 2025. |
| `uk-ucr-2016` | UK Utilities Contracts Regulations 2016 | Utilities procurement in the United Kingdom. |
| `no-loa-2016` | Norway — Lov om offentlige anskaffelser | The Norwegian public procurement regime. |

`private-commercial` is load-bearing. Without an explicit value for unregulated procurement,
the field is left blank in the majority of real instances and the closed codelist becomes
decorative. An explicit "no regime applies" is an assertion; an absent field is an unknown.

Additions to this codelist require a change proposal. The closed property is meaningless
until CP-Codelist-Enforcement lands — see §8.

---

## 4. Cardinality by object class

Normative. Each row is a per-object narrowing per §2.4. `tenant` is exactly 1 everywhere.

| Object | `markets` | `marketplaces` | Note |
|---|---|---|---|
| `Need` | 1..* | 0..* | Demand may span markets before decomposition |
| `SourcingEvent` | 1..* | 0..* | Publishable to several venues; lot-level override applies |
| `Submission` | 1..1 | 1..1 | Arrived by exactly one route |
| `Evaluation` | 1..1 | 0..1 | |
| `Decision` | 1..1 | 0..1 | Legal effect is jurisdictional (challenge, standstill) |
| `Award` | 1..1 | 0..1 | |
| `Contract` | 1..1 | 0..1 | Singular legal effect |
| `Order` | 1..1 | 0..1 | Singular legal effect |
| `Invoice` | 1..1 | 0..1 | Cannot be issued in two tax jurisdictions |
| `Catalogue` | 1..* | 0..* | One catalogue commonly serves several markets |
| `Party` | 0..* | 0..* | See §4.1 |
| `Policy` | 0..* | 0..1 | A policy may be market-specific or market-agnostic |
| `Mandate` | 0..* | 0..1 | See §4.2 |
| `SyntheticAgent` | 0..* | 0..1 | |
| `Consent` | 0..1 | 0..1 | See §4.3 |
| `Event` | 0..1 | 0..1 | See §4.4 |
| `OnboardingCase` | 0..* | 0..* | |
| `SupplierQualification` | 0..* | 0..* | Qualification may be market-limited |

### 4.1 `Party` and the cross-tenant case

A `Party` record is owned by the tenant that holds it. The same legal entity appears as
distinct `Party` records in distinct tenants — this is correct and intended, and it is what
`SupplierQualification` was separated from `OnboardingCase` to eventually make portable.

`Tenancy.tenant` on a `Party` is therefore the tenant of the **record**, not a claim about
the entity. This must be stated normatively or implementers will read it as an ownership
claim over the supplier.

### 4.2 `Mandate` — overlap with `scope`

`Mandate` already carries `scope` and `constraints`. `tenancy.markets` on a Mandate is
**descriptive placement only**. Enforcement of a market limit on an agent's authority belongs
in `constraints` and must not be inferred from `tenancy`. Without this rule, two mechanisms
appear to bound the same agent and implementations will diverge on which one binds.

### 4.3 `Consent` — the boundary-crossing object

`Consent` is the object that crosses tenant boundaries by design: grantor and grantee may sit
in different tenants. `tenancy.tenant` is the tenant of the **grantor** — the controller whose
authority the grant rests on. `markets` at 0..1 because data-protection jurisdiction is
singular where it applies at all.

### 4.4 `Event` and node attribution

`Event` carries `tenant` at 1..1, which makes the audit stream isolable per tenant — the
property a multi-tenant deployment most needs and currently cannot assert.

`marketplaces` at 0..1 records which node emitted the event. That is attribution and nothing
more. **It does not confer cross-node chain integrity, and none is claimed.**
`previousEventHash` assumes a single chain; a chain crossing node boundaries would need a
chain identifier and a defined merge semantic, and neither exists. This is a stated limitation
of the design, not a question left open: multi-node operation is deferred as a roadmap item
under the resolution recorded in §10, T-4.

---

## 5. Worked examples

### 5.1 Single-market event

A buyer group’s German subsidiary; German law; an internal venue.

```json
{
  "@context": "https://concert.foundation/signet/v1.0/context.jsonld",
  "type": "SourcingEvent",
  "id": { "scheme": "did", "id": "did:web:buyer.example#event-4401" },
  "tenancy": {
    "tenant": { "scheme": "did", "id": "did:web:buyer.example#tenant-buyer-de" },
    "markets": [
      { "jurisdiction": "DE", "regulatoryRegime": "private-commercial" }
    ],
    "marketplaces": [
      { "scheme": "did", "id": "did:web:buyer.example#mkt-buyer-eu" }
    ]
  },
  "title": "Regional transport refresh — DE",
  "procuringParty": { "scheme": "did", "id": "did:web:buyer.example#buyer-de" },
  "procedure": "open",
  "status": "active"
}
```

`tenant` and `procuringParty` are deliberately different identifiers here, where they could
plausibly have been the same. Making them distinct in the reference example is what stops
implementers folding one into the other on first read.

### 5.2 Multi-market event, market attribution at lot level

One joint-venture tender, three markets, three regimes.

```json
{
  "@context": "https://concert.foundation/signet/v1.0/context.jsonld",
  "type": "SourcingEvent",
  "id": { "scheme": "did", "id": "did:web:jv.example#event-7702" },
  "tenancy": {
    "tenant": { "scheme": "did", "id": "did:web:jv.example#tenant-jv" },
    "markets": [
      { "jurisdiction": "DE", "regulatoryRegime": "private-commercial" },
      { "jurisdiction": "NO", "regulatoryRegime": "no-loa-2016" },
      { "jurisdiction": "GB", "regulatoryRegime": "uk-pa-2023" }
    ],
    "marketplaces": [
      { "scheme": "did", "id": "did:web:jv.example#mkt-jv-core" }
    ]
  },
  "title": "Core transport — multi-market framework",
  "procuringParty": { "scheme": "did", "id": "did:web:jv.example#jv-procurement" },
  "procedure": "competitiveFlexible",
  "status": "active",
  "lots": [
    {
      "id": "lot-de",
      "title": "Transport — DE",
      "market": { "jurisdiction": "DE", "regulatoryRegime": "private-commercial" }
    },
    {
      "id": "lot-no",
      "title": "Transport — NO",
      "market": { "jurisdiction": "NO", "regulatoryRegime": "no-loa-2016" }
    },
    {
      "id": "lot-gb",
      "title": "Transport — GB",
      "market": { "jurisdiction": "GB", "regulatoryRegime": "uk-pa-2023" }
    }
  ]
}
```

The joint venture is a **single Party** with a single tenant (D2). Contracts descending from
this event each carry exactly one market, inherited from the lot they descend from — not from
the event.

### 5.3 One market, two marketplaces

German market; the event is published to two venues; the submission arrives via one.

```json
{
  "type": "SourcingEvent",
  "id": { "scheme": "did", "id": "did:web:buyer.example#event-4402" },
  "tenancy": {
    "tenant": { "scheme": "did", "id": "did:web:buyer.example#tenant-buyer-de" },
    "markets": [
      { "jurisdiction": "DE", "regulatoryRegime": "private-commercial" }
    ],
    "marketplaces": [
      { "scheme": "did", "id": "did:web:buyer.example#mkt-buyer-eu" },
      { "scheme": "did", "id": "did:web:partner.example#mkt-partner-de" }
    ]
  },
  "title": "Access network materials — DE",
  "procuringParty": { "scheme": "did", "id": "did:web:buyer.example#buyer-de" },
  "procedure": "open",
  "status": "active"
}
```

```json
{
  "type": "Submission",
  "id": { "scheme": "did", "id": "did:web:buyer.example#submission-9910" },
  "tenancy": {
    "tenant": { "scheme": "did", "id": "did:web:buyer.example#tenant-buyer-de" },
    "markets": [
      { "jurisdiction": "DE", "regulatoryRegime": "private-commercial" }
    ],
    "marketplaces": [
      { "scheme": "did", "id": "did:web:partner.example#mkt-partner-de" }
    ]
  },
  "sourcingEvent": { "scheme": "did", "id": "did:web:buyer.example#event-4402" },
  "submittingParty": { "scheme": "did", "id": "did:web:acme.example#acme" },
  "status": "submitted"
}
```

Tenant constant, market constant, marketplace varies. The submission's single marketplace is
the provenance of the route — which an identifier-encoded model cannot express. It records
where the submission arrived; it says nothing about any second node and implies no capability
to chain across one.

---

## 6. Rejected alternatives

**A — Tenant as a new root object with its own registry.** **Declined (D1).** A tenant is a
Party that controls a boundary. Adding a root object duplicates identity, address and
credential handling, and introduces a second entity graph. `partyRole: tenant` plus the
existing `memberOf` carries hierarchy at no structural cost.

**B — `tenant` cardinality 1..\* for joint controllership.** **Declined (D2).** A joint venture
or consortium is modelled as a single Party. This is a gate that dissolves rather than
resolves: with 1..1 there is no joint-controller branch to model, and every deletion, consent
and retention path has exactly one answer. Multi-controller fidelity is given up deliberately;
the ambiguity it would introduce on every governance path costs more.

**C — Encode market and marketplace in the identifier namespace.** **Declined.** This is the
current de facto behaviour and the reason the CP exists. Identifier-encoded attributes are
unpatchable once instances exist, unqueryable without string parsing, and structurally invite
the collapses in §1.2.

**D — A single combined regime code covering procurement, tax and e-invoicing.** **Declined.**
These are different axes on different timelines — ViDA phases in independently of any
procurement regime. One code covering both would need reissuing every time either changes,
and would duplicate information the EN 16931 mapping already derives.

**E — `market` as a bare ISO 3166 country code.** **Declined.** Fails to distinguish Norway
(EEA) from EU members, and post-2023 UK from pre-2023 UK. It also duplicates
`Party.address.country`, which is what invites the collapse into it.

**F — Uniform cardinality across all objects.** **Declined.** §1.3. Uniform `0..*` cannot
prevent a two-jurisdiction Invoice; uniform `1..1` cannot express a multi-market tender.

**G — Alternative block names.** `scope` — collides semantically with `Mandate.scope`.
`context` — collides with JSON-LD `@context`. `placement`, `situs` — obscure. **`tenancy` is
adopted**, acknowledging it slightly over-indexes on the tenant axis while carrying three.
The name is unbreakable after v1.0; the alternatives are recorded here so they cannot be
re-proposed without new argument.

**H — Concert-operated marketplace registry.** **Declined.** `marketplaces` entries are
self-asserted identifiers. The moment Concert maintains a list of valid marketplaces, Concert
operates a directory rather than stewarding a vocabulary — the governance firewall fails at
exactly the point the standard becomes useful. This constraint is written normatively into the
specification, not left as an implementation note.

---

## 7. Backward compatibility

**Breaking, by design.** Per D4, `tenancy` is required at v1.0 and backward compatibility is
not preserved. Every existing instance and all shipped examples become non-conforming until
updated. A new CDM major version already requires re-certification under `certification.md`.

All files in `examples/` are updated in this CP so CI cannot pass with a partial migration.

The break window is shared with CP-Extension-Composition Part 2. One break, not two.

---

## 8. Dependency on CP-Codelist-Enforcement

Separately scoped, **jointly scheduled**.

`regulatoryRegime` is declared closed. Under the current design, closed codelists are prose:
`codelists/*.csv` are lint-checked for header format only, and no instance value is validated
against them. `procedure`, `eventType`, `documentType` and `partyRole` are all
`"type": "string"` with a description pointing at a CSV — so `"procedure": "banana"` passes
C-DOC today.

If CP-Tenancy lands at v1.0 and CP-Codelist-Enforcement does not, v1.0 ships a codelist that
is **modelled as closed and not tested as closed** — inside the release carrying the first
certifications. That is the claim-triad failure the standard exists to prevent.

CP-Codelist-Enforcement MUST land in or before the v1.0 train. This is a hard dependency, not
a scheduling preference.

---

## 9. Open gates for Standards Committee resolution

⛔ **T-1 — `Party.tenancy.markets` semantics.** §4.1 states the tenant is the tenant of the
record. Confirm that `markets` on a Party means "markets this record is maintained for" and
not "markets this entity operates in," or drop the field from Party entirely.

⛔ **T-2 — Lot-level override depth.** `Lot.market` is singular. Confirm a lot cannot itself
span markets, or the override recurses without a floor.

⛔ **T-3 — Inheritance normativity.** Embedded objects inherit tenancy from their container.
Is this a stated rule in the specification, a harness-enforced check, or both?

⛔ **T-5 — `regulatoryRegime` initial membership.** §3.2 proposes six values. Confirm the
starting set and the transposition question: does `eu-ppd-2014-24` cover national
transpositions, or does each member state need its own code?

---

## 10. Resolved gates

**T-4 — Cross-node event chaining. Resolved: deferred.** A network of SIGNETs is a roadmap
item, not a v1.0 capability. `Event.tenancy.marketplaces` records the emitting node as
attribution only. `previousEventHash` assumes a single chain and no cross-node merge
semantic is defined. No federation capability may be claimed at v1.0. Revisiting this
requires a new CP.

