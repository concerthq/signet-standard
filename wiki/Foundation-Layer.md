# Foundation Layer

The foundation layer defines the primitive value types and reference objects used by every
other layer. Most live in a single schema file, `schema/definitions.schema.json`, and are
referenced everywhere via JSON Schema `$ref`; [Party](#party) is large enough to warrant its
own file, `schema/party.schema.json`.

> **Cardinality notation:** `1` = required single · `0..1` = optional single ·
> `1..*` = one or more required · `0..*` = zero or more. See
> [Architecture Overview → Conformance keywords](Architecture-Overview#conformance-keywords).

| Object | Purpose | Aligns to |
|--------|---------|-----------|
| [Identifier](#identifier) | A typed, scheme-qualified identifier | W3C DID, LEI, GLN, VAT, Peppol |
| [Party](#party) | Any actor in the network | OCDS `parties`, ePO Agent |
| [Value](#value) | A monetary amount | EN 16931 monetary model |
| [Period](#period) | A span of time | — |
| [Classification](#classification) | A coded classification | CPV, UNSPSC, GSIN |
| [Item](#item) | A line item | UBL/OCDS item |
| [Credential](#credential) | A W3C Verifiable Credential reference | W3C VC 1.1 |
| [Document](#document) | A document/attachment reference | — |
| [Provenance](#provenance) | Who/what produced an assertion | W3C PROV-O |
| [Score](#score) | A per-criterion evaluation score | — |
| [Unit](#unit) | Unit of measure + unit price | UN/ECE Rec 20 |
| [InvoiceLine](#invoiceline) | A single invoice line | EN 16931 BG-25 |
| [VatBreakdown](#vatbreakdown) | A VAT category subtotal | EN 16931 BG-23 |

---

## Identifier

A typed, scheme-qualified identifier. Every Party, document, and major object carries at
least one. `additionalProperties: false`.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `scheme` | string | 1 | The identifier scheme. See [identifierScheme codelist](Codelists#identifierscheme). E.g. `did`, `gleif:lei`, `gs1:gln`, `vat`, `companies-house`, `peppol`. |
| `id` | string | 1 | The identifier value within the scheme. |
| `uri` | string (URI) | 0..1 | A resolvable URI for the identified entity, where one exists. |

A `did`-scheme identifier (e.g. `did:web:supplier.example.com`) makes the Party
self-sovereign and resolvable without a central registry (principle 1.4).

```json
{ "scheme": "did", "id": "did:web:buyer.example#buyer" }
{ "scheme": "gleif:lei", "id": "5299000ACME00NETWRK1" }
```

---

## Party

Any actor in the network — the single most important foundation object. Subtyped by role.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Primary identifier (DID RECOMMENDED). |
| `identifiers` | Identifier[] | 0..* | Additional identifiers (LEI, VAT, GLN, …). |
| `name` | string | 1 | Legal or display name. |
| `roles` | string[] | 1..* | One or more of `buyer`, `supplier`, `procuringEntity`, `payer`, `payee`, `humanAgent`, `syntheticAgent`, `certifier`, `observer`. See [partyRole codelist](Codelists#partyrole). |
| `partyType` | string | 1 | `organization`, `person`, or `agent`. |
| `address` | Address | 0..1 | Postal/registered address. |
| `contactPoint` | ContactPoint | 0..1 | Contact details. |
| `credentials` | Credential[] | 0..* | Verifiable Credentials held by the Party. |
| `memberOf` | Identifier | 0..1 | The organisation a person or agent acts for. |

A Party with `partyType: agent` is further described by the [Agent Layer](Agent-Layer).

---

## Value

A monetary amount, aligned to EN 16931 monetary representation. `additionalProperties: false`.

| Field | Type | Card. | Constraint | Definition |
|-------|------|-------|-----------|------------|
| `amount` | number | 1 | | The numeric amount. |
| `currency` | string | 1 | `^[A-Z]{3}$` | ISO 4217 three-letter code. |
| `taxIncluded` | boolean | 0..1 | | Whether the amount is tax-inclusive. |

```json
{ "amount": 12000000, "currency": "EUR" }
```

---

## Period

A span of time.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `startDate` | date-time | 0..1 | Inclusive start. |
| `endDate` | date-time | 0..1 | Inclusive end. |
| `durationInDays` | integer | 0..1 | Convenience duration where dates are indicative. |

---

## Classification

A coded classification against a controlled scheme.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `scheme` | string | 1 | e.g. `cpv`, `unspsc`, `gsin`. |
| `id` | string | 1 | Code value. |
| `description` | string | 0..1 | Human-readable label. |

```json
{ "scheme": "cpv", "id": "72720000", "description": "Wide area network services" }
```

---

## Item

A line item — a unit of what is being bought, offered, ordered, or invoiced.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string | 1 | Item identifier, unique within its containing object. |
| `description` | string | 1 | What the item is. |
| `classification` | Classification | 0..1 | Primary classification. |
| `additionalClassifications` | Classification[] | 0..* | Further classifications. |
| `quantity` | number | 0..1 | Quantity. |
| `unitPrice` | Value | 0..1 | Price per unit. |

> Note: the prose specification describes `unit` (a [Unit](#unit) object) and
> `deliveryLocation` on Item; the shipped schema models price as `unitPrice` directly.
> **The schema is authoritative** — see [validate against it](Validation-and-Conformance).

---

## Credential

A [W3C Verifiable Credential](Glossary#verifiable-credential) asserting a claim about a Party
(e.g. ISO 27001 certification, EcoVadis rating, insurance cover).

> **Open question — pointer or embedding?** The prose has described this as a *reference to* a
> credential, while the schema **requires** `credentialSubject` and `proof`, which are the
> credential's substance. The two readings differ in freshness (a reference resolves live and
> shows revocation; an embedding freezes at the moment of copying), availability, disclosure,
> and size — so the difference is not cosmetic. Today the schema governs, and the embedding form
> is what validates. `governance/proposals/CP-Credential-semantics.md` proposes admitting both
> with an explicit discriminator; it is a draft with open gates, and it blocks the deferred
> decision on selective disclosure for person marks.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string (URI) | 1 | Credential identifier. |
| `type` | string[] | 1..* | VC types, e.g. `VerifiableCredential`, `ISO27001Certificate`. |
| `issuer` | Identifier | 1 | DID/identifier of the issuing authority. |
| `issuanceDate` | date-time | 1 | When issued. |
| `expirationDate` | date-time | 0..1 | When it expires. |
| `credentialSubject` | object | 1 | The claims, per the VC data model. |
| `proof` | object | 1 | Cryptographic proof (may be a BBS proof enabling selective disclosure). |
| `selectiveDisclosure` | boolean | 0..1 | Whether the credential supports zero-knowledge selective disclosure. |

Selective disclosure lets a supplier prove "I hold ISO 27001" without revealing the entire
certificate — important for sealed/selective-disclosure bidding (see
[Submission](Process-Layer#submission) and [Serialisation §9.3](Serialisation#cryptographic-envelopes)).

---

## Document

A reference to a document or attachment.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | string | 1 | Document identifier. |
| `documentType` | string | 1 | Coded type. See [documentType codelist](Codelists#documenttype). |
| `title` | string | 0..1 | Title. |
| `url` | string (URI) | 0..1 | Resolvable location. |
| `hash` | string | 0..1 | Content hash (integrity). |
| `accessGrant` | Identifier | 0..1 | Reference to a [Consent](Trust-Layer#consent) object where access is controlled. |

The `accessGrant` field is how the model separates *"a document exists"* from *"you may
read it"* — the data-sovereignty principle (1.5) made concrete.

---

## Provenance

Who or what produced an assertion, when, and from what. Aligned to
[W3C PROV](Glossary#prov). Embedded in [Decision](Agent-Layer#decision) and
[Event](Trust-Layer#event).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `generatedBy` | Identifier | 1 | The agent or activity that produced the assertion. |
| `generatedAt` | date-time | 1 | When. |
| `derivedFrom` | Identifier[] | 0..* | Source objects. |
| `usedPolicies` | Identifier[] | 0..* | Policies applied. |
| `signature` | object | 0..1 | Cryptographic signature over the assertion. |

---

## Score

A per-criterion evaluation score (used by [Evaluation](Process-Layer#evaluation)).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `criterion` | string | 1 | The criterion scored. |
| `value` | number | 1 | The score. |
| `weight` | number | 0..1 | Criterion weight, where applicable. |
| `rationale` | string | 0..1 | Why this score. |

---

## Unit

Unit of measure and unit price. Aligned to UN/ECE Recommendation 20.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `code` | string | 0..1 | UN/ECE Rec 20 unit-of-measure code (e.g. `C62`, `DAY`, `MTR`). |
| `name` | string | 0..1 | Human-readable unit name. |
| `unitPrice` | Value | 0..1 | Price per unit. |

---

## InvoiceLine

A single invoice line, aligned to **EN 16931 BG-25 (INVOICE LINE)**. Each field carries its
EN 16931 Business Term (BT) reference in a `$comment`, so traceability is structural.

| Field | Type | Card. | EN 16931 | Definition |
|-------|------|-------|----------|------------|
| `id` | string | 1 | BT-126 | Invoice line identifier. |
| `note` | string | 0..1 | BT-127 | Invoice line note. |
| `quantity` | number | 1 | BT-129 | Invoiced quantity. |
| `unitOfMeasure` | string | 0..1 | BT-130 | Quantity unit-of-measure code (UN/ECE Rec 20). |
| `itemName` | string | 1 | BT-153 | Item name. |
| `itemNetPrice` | Value | 0..1 | BT-146 | Item net price. |
| `netAmount` | Value | 1 | BT-131 | Invoice line net amount. |
| `classification` | Classification | 0..1 | BT-158 | Item classification identifier. |
| `vatCategoryCode` | string | 0..1 | BT-151 | Invoiced item VAT category code. See [vatCategory codelist](Codelists#vatcategory). |
| `vatRate` | number | 0..1 | BT-152 | Invoiced item VAT rate. |

> **Implementation note (Draft-07).** BT annotations on `$ref` fields are preserved by
> wrapping the reference in `allOf`, because JSON Schema Draft-07 ignores keywords that sit
> beside a bare `$ref`. See [CHANGELOG 0.2.0](https://github.com/concerthq/signet-standard/blob/main/CHANGELOG.md).

---

## VatBreakdown

A VAT category subtotal, aligned to **EN 16931 BG-23 (VAT BREAKDOWN)**.

| Field | Type | Card. | EN 16931 | Definition |
|-------|------|-------|----------|------------|
| `taxableAmount` | Value | 1 | BT-116 | VAT category taxable amount. |
| `taxAmount` | Value | 1 | BT-117 | VAT category tax amount. |
| `categoryCode` | string | 1 | BT-118 | VAT category code (e.g. `S`, `Z`, `E`, `AE`). |
| `rate` | number | 0..1 | BT-119 | VAT category rate. |

See [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing) for how these blocks roll
up into a compliant invoice and project to UBL / Peppol BIS.

## Where to go next

- [Process Layer](Process-Layer) — the objects that use these blocks.
- [Codelists](Codelists) — the controlled vocabularies referenced above.
