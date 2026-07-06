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
  auction / bid .schema.json                                          (auction extension)
  onboarding-case / supplier-qualification .schema.json              (onboarding extension)
  synthetic-agent / mandate / decision / policy .schema.json          (agent layer)
  approval .schema.json                                               (identity profile)
  event / consent .schema.json                                        (trust layer)
  party .schema.json
  context.jsonld            JSON-LD @context (aligns to ePO, PROV, W3C VC)
codelists/     Controlled vocabularies (CSV: Code, Title, Description)
examples/      Worked instances, validated in CI
conformance/   The machine-runnable conformance harness (Core/Full levels, adapters)
agent/         Demonstration — a synthetic agent awards a contract under governance
onboarding/    Demonstration — an agent qualifies a supplier (conditional qualification)
auction/       Demonstration — a deterministic, multi-party reverse-auction close
docs/          The prose specification (rendered on concert.foundation/standard)
docs/extensions/   Extension & profile specs (auction, onboarding, identity, commodity-risk)
governance/    Standards Committee decision records (governance/reviews/)
tools/         Reference tooling (signet-to-ubl projection, UBL verifier, Pages build)
wiki/          Long-form documentation (mirrors the GitHub wiki)
.github/workflows/validate.yml   CI: validates examples, runs conformance + all three demos
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

The core is **extensible without forking**. Extensions and profiles add objects, codelist values, or normative rules **without changing** any core object:

| Extension / profile | Adds | Status |
|---------------------|------|--------|
| **Onboarding** | `OnboardingCase`, `SupplierQualification` (durable status with first-class `conditional` qualification) | Schemas + demo shipped |
| **Auction** | `Auction`, `Bid` (a profile of the sourcing flow; deterministic, operator-independent close) | Schemas + demo shipped |
| **Identity** | `Approval` (verifiable human approval); `delegationOfAuthority` credential type; normative no-PII rule | Working Draft; schema + example shipped |
| **Commodity-risk** | Portfolio-level commodity risk governance (positions, coverage corridors, price marks, hedge proposals) | Working Draft spec; schemas to follow |

Specs live in [`docs/extensions/`](docs/extensions/); see the [Extensions & profiles](#extensions--profiles) section below.

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

## Three demonstrations, one harness

SIGNET's distinctive claim is that human and synthetic agents can take consequential
actions under governance that is provable, not asserted. Three runnable demos show
the *same* harness — mandate gate, published policy, provenance, hash-chained Events,
conformance verification — carrying three different governed actions:

```bash
npm run agent        # a governed contract award
npm run onboarding   # a conditional supplier qualification
npm run auction      # a deterministic, multi-party reverse-auction close
```

- **`npm run agent` — governed award.** An agent reads a €12M SourcingEvent, is
  bounded by a **Mandate** (the €12M value exceeds its €10M autonomous ceiling, so
  **human approval is required**), and applies the **published** MAT evaluation Policy
  (weights parsed from the Policy's own expression: price 0.20 / quality 0.55 / social
  0.25). Under that weighting the dearer, higher-quality bid wins — **Acme scores
  0.859474, ahead of the cheaper bid at 0.8415** — a governed, justified price premium,
  not a low-bid pick. The human approval resolves to a verifiable **`Approval`**
  (identity profile): the runner checks the approver's band-4 authority ceiling (€25M)
  covers the €11.4M award.
- **`npm run onboarding` — conditional qualification.** An agent qualifies a supplier
  against a published eligibility Policy. Four credentials pass and sanctions screening
  is clear, but financial standing covers only **€5M of the €12M** tier — so instead of
  a blunt pass/fail the agent lands on the outcome enterprise onboarding actually needs:
  a **conditional** `SupplierQualification` with a €5M value cap. Attaching conditions is
  outside autonomous scope, so human approval is recorded.
- **`npm run auction` — deterministic close.** Two bidding agents (each holding a sealed
  **mandate floor**) undercut round by round under a neutral auctioneer. The runner-up
  reaches its €11.0M floor and passes; the winner takes it at **€11.0M** without ever
  revealing its own floor. The close is **deterministic** — re-running reaches the
  identical Award — which turns auction fairness into a conformance property.

Each runner **verifies its output is conformance-clean**: every object validates, the
Event chain holds, and tampering is detected. The reasoning layer is model-pluggable
(deterministic by default so the demos are *proofs* that run in CI; swap in a live model
per `agent/LIVE_MODEL_NOTE.md` with **no change to the harness**). The point of the set:
three governed actions, one identical harness — the architecture generalises. Agent
autonomy and auditable governance are not in tension; the harness is what makes the
autonomy safe to grant.

## Extensions & profiles

The core stays lean; domain structure is added through **extensions and profiles** that
add without changing (the [OCDS extension pattern](https://standard.open-contracting.org/latest/en/extensions/)).
Each spec lives under [`docs/extensions/`](docs/extensions/):

- **[Onboarding](docs/extensions/)** — `OnboardingCase` and `SupplierQualification`;
  schemas and the `npm run onboarding` demo are in-tree.
- **[Auction](docs/extensions/auction.md)** — `Auction` and `Bid`, a standardised,
  operator-independent close; schemas and the `npm run auction` demo are in-tree.
- **[Identity](docs/extensions/identity.md)** *(Working Draft)* — how SIGNET represents
  natural persons: the `Approval` object makes `humanApproval` resolvable and verifiable,
  a `delegationOfAuthority` credential carries a person's authority, and a normative no-PII
  rule keeps personal data out of hash-anchored records.
- **[Commodity-risk](docs/extensions/commodity-risk.md)** *(Working Draft spec)* —
  portfolio-level commodity risk governance; the first **member-proposed** extension,
  reviewed under the identical process as any proposer.

Five further extensions are specified as Working Drafts (receipt & three-way match, supplier
performance, contract amendments, framework agreements, negotiation) — see
[`docs/extensions/`](docs/extensions/); schemas and conformance rules follow per-extension
after review, per the process commodity-risk established.

Standards Committee decision records are public and versioned in-repo under
[`governance/reviews/`](governance/reviews/) — the first records the review of the first
member-proposed extension, confirming member proposals get no preferential path.

## Versioning & governance

Semantic versioning. The **normative** core (`schema/`, closed codelists) changes only through the Concert Standards Committee revision process with a published comment period. **Non-normative** material (`docs/`, `examples/`, open codelist values) iterates freely. Every published version is permanently retrievable at a version-stable URL under `concert.foundation/signet/<version>/`.

## Contributing

Contributions are welcome under the Concert Contributor Licence Agreement — see [CONTRIBUTING.md](CONTRIBUTING.md). You keep ownership of your work; you grant Concert royalty-free copyright and patent licences so the standard stays open for everyone. No contributor, and no commercial operator (including Score Networks), gains a preferential position.

## Marks

"SIGNET", "Concert", and "SIGNET Certified" are marks administered by Concert Foundation under the [IP & Licensing Policy](https://concert.foundation/governance). The CC0 dedication covers copyright in the artifacts only; it grants no rights in the marks.
