# Standards Mapping

SIGNET is a **profile-and-bridge, not a fork** (design principle 1.2). The Canonical Data
Model is a coherent superset that profiles existing standards: a SIGNET document can always
be projected *down* to a conforming OCDS release, a Peppol BIS invoice, or an eForms notice,
and data arriving in those formats can always be *lifted* into the CDM.

> **The mappings on this page are normative.** A conforming implementation MUST be able to
> transform between the CDM and these formats *without loss of the fields defined in the
> mapping* (specification §8).

## The normative mapping table

| CDM object | Maps to / from | Mapping basis |
|------------|----------------|---------------|
| [Need](Process-Layer#need) | OCDS `planning` | OCDS 1.1 release |
| [SourcingEvent](Process-Layer#sourcingevent), [Lot](Process-Layer#lot) | OCDS `tender`; eForms notice | OCDS 1.1; eForms |
| [Submission](Process-Layer#submission) | OCDS `bid` (bid extension); UBL Tender | OCDS bid extension |
| [Award](Process-Layer#award) | OCDS `award` | OCDS 1.1 |
| [Contract](Process-Layer#contract) | OCDS `contract` | OCDS 1.1 |
| [Order](Process-Layer#order) | UBL 2.3 Order; Peppol BIS Ordering | UBL 2.3 |
| [Catalogue](Process-Layer#catalogue) | UBL 2.3 Catalogue; Peppol BIS Catalogue | UBL 2.3 |
| [Invoice](Process-Layer#invoice) | EN 16931; Peppol BIS Billing; UBL Invoice; Factur-X | EN 16931 semantic model |
| [Party](Foundation-Layer#party) | OCDS `parties`; ePO Agent | OCDS org; ePO |
| [Credential](Foundation-Layer#credential) | W3C Verifiable Credentials 1.1 | VC data model |
| [Identifier](Foundation-Layer#identifier) (`did`) | W3C DID 1.0 | DID core |
| [Provenance](Trust-Layer#provenance) | W3C PROV-O | PROV |
| Semantic layer (all) | EU eProcurement Ontology (ePO) | ePO OWL/RDF |

## What "without loss" means

- **Down-projection (CDM → target).** Where a CDM object has *no* counterpart in the target
  standard — most importantly the **entire [Agent Layer](Agent-Layer)** when projecting to
  OCDS — the projection **omits it without error**. SIGNET-original structures are always
  cleanly separable from third-party standards.
- **Up-lift (target → CDM).** Lifting data from a target format leaves the SIGNET-only
  fields empty; nothing is fabricated.

This separability is also an IP property: the SIGNET-original contribution (agents,
mandates, decisions, policy-as-data, consent) never entangles the third-party standards it
bridges.

## The standards SIGNET bridges

### OCDS — Open Contracting Data Standard
Provides the **lifecycle** vocabulary. The process layer's phase model (planning → tender →
award → contract → implementation) is OCDS's. SIGNET adopts OCDS's successful low-friction,
plain-JSON consumption approach (see [Serialisation](Serialisation)).

### EN 16931 — European e-invoicing semantic model
Provides the **invoicing** semantics. The [Invoice](Process-Layer#invoice),
[InvoiceLine](Foundation-Layer#invoiceline), and [VatBreakdown](Foundation-Layer#vatbreakdown)
objects carry EN 16931 Business Term (BT) and Business Group (BG) references field-by-field.
This is the basis of the EU ViDA alignment — see
[EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).

### UBL / Peppol BIS — document syntax & business interoperability specs
Provide the **document** layer for Order, Catalogue, and Invoice. The repository ships a
working transform from a SIGNET Invoice to **UBL 2.1 / Peppol BIS Billing 3.0**.

### W3C VC & DID — verifiable credentials and decentralised identifiers
Provide **decentralised identity**. [Identifier](Foundation-Layer#identifier) supports the
`did` scheme; [Credential](Foundation-Layer#credential) is a W3C Verifiable Credential
reference, with optional selective disclosure.

### W3C PROV — provenance ontology
Provides the **provenance** vocabulary. [Provenance](Trust-Layer#provenance) maps to PROV-O
terms (`wasGeneratedBy`, `wasDerivedFrom`, `wasAttributedTo`) in the JSON-LD context.

### EU eProcurement Ontology (ePO)
Provides the **semantic** alignment across the whole model. The JSON-LD context maps SIGNET
terms to ePO where equivalents exist (e.g. `procuringParty` → `ePO:hasBuyer`,
`submittingParty` → `ePO:hasTenderer`).

### Solid — data sovereignty
Inspires the **consent** model. [Consent](Trust-Layer#consent) expresses Solid-style access
grants as CDM data.

### A2A — Agent-to-Agent / Agent Card
Inspires **capability discovery**. [SyntheticAgent](Agent-Layer#syntheticagent) and
[AgentCapability](Agent-Layer#agentcapability) align to the A2A Agent Card model
(`/.well-known/agent.json`).

## SIGNET's original contribution

The [Agent Layer](Agent-Layer) — synthetic agents, capabilities, mandates, decisions, and
policy-as-data — has **no equivalent** in any existing procurement standard. It is the part
of SIGNET that is genuinely new, and the reason the CDM exists rather than a thin wrapper
over OCDS.

## Where to go next

- [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing) — the one mapping that is
  runnable and CI-verified.
- [Serialisation (JSON-LD)](Serialisation) — the `@context` that carries the semantic
  alignment.
