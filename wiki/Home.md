# SIGNET Standard — Wiki

**The open standard for governed procurement networks.**

SIGNET — *Secure Intelligent Governed Network for Exchange and Trade* — is the open
specification for procurement networks in which **human and synthetic agents** operate
under shared governance, decentralised identity, and cryptographic trust. It is stewarded
by [Concert Foundation](https://concert.foundation) and dedicated to the public domain
under [CC0 1.0](https://github.com/concerthq/signet-standard/blob/main/LICENSE).

This wiki explains what SIGNET is, the model it defines, how it bridges the standards you
already use, and how to validate and contribute. It complements — and never overrides —
the normative artifacts in the repository.

> **The schema is the source of truth.** Where this wiki, the prose specification, and the
> JSON Schema disagree, **the JSON Schema takes precedence**, then the prose specification,
> then this wiki.

---

## Start here

| If you want to… | Read |
|-----------------|------|
| Understand *why* SIGNET exists and what it is | [Introduction & Concepts](Introduction-and-Concepts) |
| See how the model is structured | [Architecture Overview](Architecture-Overview) |
| Look up a specific object or field | [Foundation](Foundation-Layer) · [Process](Process-Layer) · [Agent](Agent-Layer) · [Trust](Trust-Layer) Layers |
| Map SIGNET to OCDS / EN 16931 / UBL / Peppol / VC-DID / ePO | [Standards Mapping](Standards-Mapping) |
| Understand the e-invoicing / EU ViDA story | [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing) |
| Run validation or check conformance | [Validation & Conformance](Validation-and-Conformance) |
| Understand certification & the test suite | [Conformance Harness](Conformance-Harness) |
| Find the controlled vocabularies | [Codelists](Codelists) |
| See complete worked instances | [Worked Examples](Worked-Examples) |
| Contribute, or understand governance | [Contributing](Contributing) · [Governance & Versioning](Governance-and-Versioning) |
| Look up a term | [Glossary](Glossary) · [FAQ](FAQ) |

---

## The model in one glance

SIGNET defines a **Canonical Data Model (CDM)** organised into four layers:

| Layer | Objects | Purpose |
|-------|---------|---------|
| **Foundation** | Identifier · Party · Value · Period · Classification · Item · Credential · Document · Provenance · Score · Unit · InvoiceLine · VatBreakdown | The primitive value types and reference objects used everywhere. |
| **Process** | Need · SourcingEvent · Lot · Submission · Evaluation · Award · Contract · Order · Catalogue · Obligation · Invoice · Auction · Bid | The procurement lifecycle, aligned to the OCDS stages. Auction · Bid are a standardised-auction profile of the sourcing flow. |
| **Agent** | SyntheticAgent · AgentCapability · Mandate · Decision · Policy | SIGNET's distinctive contribution: agents as first-class, governed participants. |
| **Trust** | Event · Provenance · Consent | Cross-cutting auditability, provenance, and data-sovereignty. |

```
┌─────────────────────────────────────────────────────────┐
│  Trust layer      Event · Provenance · Consent · Audit   │
├─────────────────────────────────────────────────────────┤
│  Agent layer      SyntheticAgent · Mandate · Capability ·│
│                   Decision · Policy                       │
├─────────────────────────────────────────────────────────┤
│  Process layer    Need · SourcingEvent · Lot · Submission│
│                   Evaluation · Award · Contract · Order · │
│                   Catalogue · Invoice · Obligation        │
├─────────────────────────────────────────────────────────┤
│  Foundation layer Identifier · Party · Credential ·      │
│                   Value · Period · Classification ·       │
│                   Document · Item · Provenance            │
└─────────────────────────────────────────────────────────┘
```

---

## What makes SIGNET different

- **A profile-and-bridge, not a fork.** The CDM maps *without loss* to and from OCDS
  (lifecycle), EN 16931 (invoicing), UBL / Peppol BIS (documents), W3C VC/DID (identity),
  and the EU eProcurement Ontology (semantics). See [Standards Mapping](Standards-Mapping).
- **Agent-native by construction.** Synthetic agents are first-class parties with declared
  capabilities, bounded mandates, and accountable decisions. No existing procurement
  standard does this. See [Agent Layer](Agent-Layer).
- **Provenance and audit are structural.** Every material change is an append-only,
  tamper-evident [Event](Trust-Layer#event); every assertion carries
  [Provenance](Trust-Layer#provenance).
- **Proven, not asserted.** The repository ships a runnable transform that projects a
  canonical Invoice into Peppol BIS Billing UBL and verifies it in CI on every push. See
  [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).
- **Conformance is machine-runnable.** A public test harness decides whether an
  implementation is SIGNET Certified — and at which level (Core / Full) — through the
  identical suite for everyone. See [Conformance Harness](Conformance-Harness).

---

## Status & licensing

- **Specification version:** v0.1 (Working Draft / Request for Comments)
- **Repository / artifact version:** v0.5.0
- **Licence:** [CC0 1.0](https://github.com/concerthq/signet-standard/blob/main/LICENSE)
  (public-domain dedication of the artifacts; the marks are administered separately).
- **Marks:** "SIGNET", "Concert", and "SIGNET Certified" are marks administered by Concert
  Foundation. CC0 covers copyright in the artifacts only; it grants no rights in the marks.

Comments are invited at **hello@concert.foundation** and through the
[issue templates](https://github.com/concerthq/signet-standard/tree/main/.github/ISSUE_TEMPLATE).
