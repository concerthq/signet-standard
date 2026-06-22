# SIGNET Standard

**The open standard for governed procurement networks.**
Stewarded by [Concert Foundation](https://concert.foundation). Licensed [CC0 1.0](LICENSE).

SIGNET — *Secure Intelligent Governed Network for Exchange and Trade* — is the open specification for procurement networks in which human and synthetic agents operate under shared governance, decentralised identity, and cryptographic trust. This repository holds the **normative artifacts**: the Canonical Data Model (as JSON Schema), the JSON-LD context, the codelists, worked examples, and the conformance materials.

> **The schema is the source of truth.** Where the prose specification and the JSON Schema disagree, the JSON Schema takes precedence.

## What's here

```
schema/        JSON Schema (Draft-07) — the normative Canonical Data Model
  definitions.schema.json   Foundation building blocks (Identifier, Party, Value, …)
  party / sourcing-event / submission / policy / synthetic-agent /
  mandate / decision / event / consent .schema.json
  context.jsonld            JSON-LD @context (aligns to ePO, PROV, W3C VC)
codelists/     Controlled vocabularies (CSV: Code, Title, Description)
examples/      Worked instances, validated in CI
docs/          The prose specification (rendered on concert.foundation/standard)
.github/workflows/validate.yml   CI: validates every example on each push/PR
LICENSE        CC0 1.0 public-domain dedication
CONTRIBUTING.md   How to contribute (and the CLA)
CHANGELOG.md   Semantic-versioned history
```

## The model in one glance

Four layers (see the full specification in `docs/`):

| Layer | Objects |
|-------|---------|
| **Foundation** | Identifier · Party · Value · Period · Classification · Item · Credential · Document · Provenance |
| **Process** | Need · SourcingEvent · Lot · Submission · Evaluation · Award · Contract · Order · Catalogue · Invoice · Obligation |
| **Agent** | SyntheticAgent · AgentCapability · Mandate · Decision · Policy |
| **Trust** | Event · Provenance · Consent |

This v0.1 repository ships JSON Schema for the core objects across all four layers; the remaining process-layer objects land in subsequent drafts (see `CHANGELOG.md`).

## Built on, and convertible to, the standards you already use

SIGNET is a profile-and-bridge, not a fork. The Canonical Data Model maps **without loss** to and from OCDS (lifecycle), EN 16931 (invoicing), UBL / Peppol BIS (documents), W3C VC/DID (identity), and the EU eProcurement Ontology (semantics). The agent layer is SIGNET's original contribution — no existing procurement standard represents synthetic agents as first-class, governed, accountable participants.

## Validate locally

```bash
npm install        # ajv + ajv-formats
npm run validate   # validates every example against the schemas
```

CI runs the same validation on every push and pull request; examples cannot drift from the schema.

## Versioning & governance

Semantic versioning. The **normative** core (`schema/`, closed codelists) changes only through the Concert Standards Committee revision process with a published comment period. **Non-normative** material (`docs/`, `examples/`, open codelist values) iterates freely. Every published version is permanently retrievable at a version-stable URL under `concert.foundation/signet/<version>/`.

## Contributing

Contributions are welcome under the Concert Contributor Licence Agreement — see [CONTRIBUTING.md](CONTRIBUTING.md). You keep ownership of your work; you grant Concert royalty-free copyright and patent licences so the standard stays open for everyone. No contributor, and no commercial operator (including Score Networks), gains a preferential position.

## Marks

"SIGNET", "Concert", and "SIGNET Certified" are marks administered by Concert Foundation under the [IP & Licensing Policy](https://concert.foundation/governance). The CC0 dedication covers copyright in the artifacts only; it grants no rights in the marks.
