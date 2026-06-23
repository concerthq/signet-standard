# SIGNET Standard

**The open standard for governed procurement networks.**
Stewarded by [Concert Foundation](https://concert.foundation). Licensed [CC0 1.0](LICENSE).

SIGNET — *Secure Intelligent Governed Network for Exchange and Trade* — is the open specification for procurement networks in which human and synthetic agents operate under shared governance, decentralised identity, and cryptographic trust. This repository holds the **normative artifacts**: the Canonical Data Model (as JSON Schema), the JSON-LD context, the codelists, worked examples, and the conformance materials.

> **The schema is the source of truth.** Where the prose specification and the JSON Schema disagree, the JSON Schema takes precedence.

## What's here

```
schema/        JSON Schema (Draft-07) — the normative Canonical Data Model
  definitions.schema.json   Foundation blocks (Identifier, Party, Value, …)
                            incl. EN 16931 blocks (Unit, InvoiceLine, VatBreakdown)
  need / sourcing-event / submission / evaluation / award /
  contract / order / catalogue / obligation / invoice .schema.json   (process layer)
  synthetic-agent / mandate / decision / policy .schema.json          (agent layer)
  event / consent .schema.json                                        (trust layer)
  party .schema.json
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

This repository ships JSON Schema for all four layers, including the **complete process layer** (Need → SourcingEvent → Submission → Evaluation → Award → Contract → Order / Catalogue → Obligation → Invoice). The **Invoice** is mapped to 33 EN 16931 Business Terms and Groups (BT-1…BT-158, BG-4/7/23/25), making a SIGNET invoice convertible to Peppol BIS Billing / UBL Invoice / Factur-X — the structural basis for EU ViDA cross-border e-invoicing compliance. See `CHANGELOG.md`.

## Demonstrating ViDA compliance end to end

The repository ships a runnable proof that a SIGNET invoice is convertible to the
format EU e-invoicing mandates require:

```bash
npm run transform     # projects examples/invoice.json -> examples/invoice.ubl.xml
npm run verify-ubl    # parses the UBL and reconciles every EN 16931 value
```

`tools/signet-to-ubl.js` projects the canonical Invoice into **UBL 2.1 / Peppol
BIS Billing 3.0** (EN 16931 compliant), and `tools/verify-ubl.py` confirms the
projection is faithful — well-formed XML, every Business Term preserved, and the
monetary totals reconciling (€6,200 net + €1,302 VAT @ 21% = €7,502 payable).
Both run in CI on every push. This is the concrete basis for the ViDA
cross-border e-invoicing alignment: a SIGNET network can emit the exact artefact
a tax authority or Access Point expects.


## Built on, and convertible to, the standards you already use

SIGNET is a profile-and-bridge, not a fork. The Canonical Data Model maps **without loss** to and from OCDS (lifecycle), EN 16931 (invoicing), UBL / Peppol BIS (documents), W3C VC/DID (identity), and the EU eProcurement Ontology (semantics). The agent layer is SIGNET's original contribution — no existing procurement standard represents synthetic agents as first-class, governed, accountable participants.

## Validate locally

```bash
npm install        # ajv + ajv-formats
npm run validate   # validates every example against the schemas
```

CI runs the same validation on every push and pull request; examples cannot drift from the schema.

## Agent demonstration

The `agent/` demo is the proof of SIGNET's distinctive claim: a synthetic agent
taking a consequential action — awarding a contract — under governance.

```bash
npm run agent
```

An agent reads a SourcingEvent, is bounded by a **Mandate** (the €12M value exceeds
its €10M autonomous ceiling, so **human approval is required**), applies the
**published** evaluation Policy, and emits an Award **Decision** with rationale,
inputs, policies applied, human approval, and provenance — plus a hash-chained Event
trail. The runner then **verifies the output is conformance-clean**: every object
validates, the chain holds, and tampering is detected. The reasoning layer is
model-pluggable (deterministic by default; swap in a live model per
`agent/LIVE_MODEL_NOTE.md` with no change to the harness). Agent autonomy and
auditable governance are not in tension — the harness is what makes the autonomy
safe to grant.

## Versioning & governance

Semantic versioning. The **normative** core (`schema/`, closed codelists) changes only through the Concert Standards Committee revision process with a published comment period. **Non-normative** material (`docs/`, `examples/`, open codelist values) iterates freely. Every published version is permanently retrievable at a version-stable URL under `concert.foundation/signet/<version>/`.

## Contributing

Contributions are welcome under the Concert Contributor Licence Agreement — see [CONTRIBUTING.md](CONTRIBUTING.md). You keep ownership of your work; you grant Concert royalty-free copyright and patent licences so the standard stays open for everyone. No contributor, and no commercial operator (including Score Networks), gains a preferential position.

## Marks

"SIGNET", "Concert", and "SIGNET Certified" are marks administered by Concert Foundation under the [IP & Licensing Policy](https://concert.foundation/governance). The CC0 dedication covers copyright in the artifacts only; it grants no rights in the marks.
