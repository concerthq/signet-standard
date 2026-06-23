# Serialisation (JSON-LD)

## Canonical form

The canonical serialisation of the CDM is **JSON-LD 1.1**. Concert publishes the SIGNET
`@context` at a stable URI:

```
https://concert.foundation/signet/v0.1/context.jsonld
```

Every object type and property resolves to a URI in the SIGNET vocabulary namespace
(`https://concert.foundation/signet/v0.1/vocab#`), itself aligned to
[ePO](Glossary#epo) terms where equivalents exist. Every worked example begins with:

```json
{ "@context": "https://concert.foundation/signet/v0.1/context.jsonld", "type": "...", ... }
```

## Plain-JSON consumption

Consumers that do **not** process linked-data semantics MAY treat CDM documents as ordinary
JSON; the `@context` is ignorable without loss of the document's tree structure. This
preserves the low-friction adoption that made OCDS's plain-JSON approach successful (design
principle 1.8) — you can validate, read, and write SIGNET documents with nothing more than a
JSON parser and the [JSON Schema](Validation-and-Conformance).

## What the context aligns

The shipped `schema/context.jsonld` maps SIGNET terms onto external vocabularies:

| Namespace prefix | IRI |
|------------------|-----|
| `signet` | `https://concert.foundation/signet/v0.1/vocab#` |
| `ePO` | `http://data.europa.eu/a4g/ontology#` |
| `prov` | `http://www.w3.org/ns/prov#` |
| `vc` | `https://www.w3.org/2018/credentials#` |

Object types map to the SIGNET vocabulary:

`Party`, `SourcingEvent`, `Submission`, `Decision`, `Policy`, `SyntheticAgent`, `Mandate`,
`Event`, `Consent` → `signet:*`.

Selected properties map to external ontologies so SIGNET data is interpretable by existing
toolchains:

| SIGNET term | Maps to |
|-------------|---------|
| `id` | `@id` |
| `type` | `@type` |
| `madeBy` | `prov:wasAttributedTo` |
| `generatedBy` | `prov:wasGeneratedBy` |
| `derivedFrom` | `prov:wasDerivedFrom` |
| `procuringParty` | `ePO:hasBuyer` |
| `submittingParty` | `ePO:hasTenderer` |

This single context is what lets the CDM align simultaneously with OCDS (JSON), W3C VC/DID
(JSON-LD), ePO (RDF/OWL), and Solid (RDF) — see [Standards Mapping](Standards-Mapping).

## Cryptographic envelopes

Where confidentiality is required — sealed-bid submissions
([Submission.sealedProof](Process-Layer#submission)) or selective credential disclosure
([Credential.selectiveDisclosure](Foundation-Layer#credential)) — the relevant fields carry
a **cryptographic envelope** (zero-knowledge proof, homomorphic ciphertext, or BBS
selective-disclosure proof) in place of cleartext, with verification metadata.

The envelope formats are specified in the separate **SIGNET Cryptographic Profiles**
document (not in this repository).

## Identifiers and namespaces

- Every CDM object **MUST** carry a network-unique `id`.
- **DIDs are RECOMMENDED** for Parties and agents; URN/URI identifiers are acceptable for
  process objects.
- The SIGNET vocabulary namespace, the published `@context`, and the registry of identifier
  schemes and codelists are maintained by Concert at stable URIs under `concert.foundation`
  and **MUST NOT** be repurposed by implementers to publish non-conforming extensions under
  the SIGNET name.

## Where to go next

- [Validation & Conformance](Validation-and-Conformance) — validating the JSON.
- [Trust Layer → Provenance](Trust-Layer#provenance) — the PROV mapping in use.
