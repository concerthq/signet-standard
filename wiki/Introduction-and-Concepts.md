# Introduction & Concepts

## What SIGNET is

**SIGNET** — *Secure Intelligent Governed Network for Exchange and Trade* — is an open
specification for **procurement networks**: systems in which buyers, suppliers, and their
agents discover needs, run sourcing events, submit and evaluate bids, award and contract,
order, deliver, and invoice — across organisational boundaries.

What distinguishes a *SIGNET network* from a conventional procurement platform is that it
assumes three things from the start:

1. **Agents act, not just people.** Some participants are AI ("synthetic") agents. They
   must be governed, bounded, and accountable.
2. **Identity is decentralised.** Parties are identified by stable, resolvable identifiers
   (often [DIDs](Glossary#did)) and make verifiable claims about themselves with
   [Verifiable Credentials](Glossary#verifiable-credential) — no central registry required.
3. **Trust is cryptographic and auditable.** Every material change is an append-only,
   tamper-evident event with provenance.

The central normative artifact is the **Canonical Data Model (CDM)** — a common vocabulary
for representing everything that happens in such a network. This repository ships the CDM
as **JSON Schema**, plus a JSON-LD context, controlled codelists, worked examples, and
conformance materials.

> **The schema is the source of truth.** Where the prose specification and the JSON Schema
> disagree, the JSON Schema takes precedence.

## The problem it solves

Procurement data today is fragmented across mutually unintelligible standards (OCDS, EN
16931, UBL, eForms, Peppol BIS, ePO) and a long tail of proprietary platforms. That
fragmentation:

- prevents **interoperability** — data cannot move cleanly between systems; and
- blocks **agent deployment** — an AI agent cannot reason or act across organisational
  boundaries when every counterparty speaks a different dialect, with no shared notion of
  authority, provenance, or consent.

The CDM is the **Rosetta Stone**: a single coherent model that *bridges* the established
standards and *adds* the structures needed for agent-native, governed, decentralised
commerce. It does not replace OCDS or EN 16931 — it profiles them and fills the gaps they
leave.

## Who it is for

- **Procurement platforms & marketplaces** that want interoperability with public and
  private procurement standards out of the box.
- **Public bodies** that must publish OCDS releases, issue EN 16931 / Peppol-compliant
  invoices, and keep auditable decision records (e.g. UK Procurement Act 2023, EU AI Act).
- **Builders of procurement agents** who need a model where an agent's authority, actions,
  and rationale are first-class, governed data.
- **Auditors and regulators** who need provenance and event integrity as native features,
  not bolt-ons.

## Design principles

The model is governed by eight design principles (specification §1). They explain almost
every modelling decision in the CDM.

| # | Principle | What it means in practice |
|---|-----------|---------------------------|
| 1.1 | **Reuse before invention** | Where a concept is well defined by an open standard (OCDS, EN 16931, UBL, ePO), the CDM adopts and aligns to it rather than reinventing it. |
| 1.2 | **Standards as profiles, not forks** | A SIGNET document can always be projected *down* to a conforming OCDS release, Peppol BIS invoice, or eForms notice, and data in those formats can be *lifted* into the CDM. Mapping tables are normative. |
| 1.3 | **Agent-native by construction** | The model records not only *what* was decided but *which* agent decided it, under *what* authority, from *which* inputs, and with *what* rationale. |
| 1.4 | **Identity is decentralised** | Parties are identified by stable resolvable identifiers that may be DIDs; claims about them are W3C Verifiable Credentials, verifiable without a central registry. |
| 1.5 | **Data sovereignty is explicit** | The model separates an *assertion* from the *right to access* the data behind it. Consent and access grants are data (the Solid pattern). No central data warehouse is assumed. |
| 1.6 | **Policy is data** | Eligibility thresholds, evaluation weightings, approval routing, and agent mandates are machine-readable, human-auditable [Policy](Agent-Layer#policy) objects — "rules as code". |
| 1.7 | **Events are immutable** | Every material change is an append-only [Event](Trust-Layer#event) with provenance. Current state is a projection over event history. Audit is native; tampering is evident. |
| 1.8 | **Linked-data foundation** | The canonical serialisation is JSON-LD: every object and property has a global URI, while remaining ordinary JSON to consumers that ignore the semantics. See [Serialisation](Serialisation). |

## Key concepts in one paragraph each

- **Canonical Data Model (CDM).** The shared vocabulary. Four layers (Foundation, Process,
  Agent, Trust). Everything a SIGNET network reads or writes is expressible in, and
  losslessly mappable to, the CDM.
- **Profile-and-bridge.** SIGNET is a coherent *superset* that profiles existing standards
  and bridges between them. SIGNET-original structures (the whole Agent layer) are always
  cleanly separable from third-party standards.
- **Synthetic agent.** An AI agent operating as a first-class [Party](Foundation-Layer#party).
  It has declared [capabilities](Agent-Layer#agentcapability), is bound by a
  [Mandate](Agent-Layer#mandate), and its actions produce accountable
  [Decisions](Agent-Layer#decision).
- **Mandate.** The structure that bounds an agent's remit — what it may do, within what
  limits, and where human approval is required.
- **Decision.** The accountability backbone: a record of what was decided, by whom, under
  which mandate, from which inputs, under which policy, with what rationale, and with
  cryptographic provenance.
- **Event sourcing.** State is derived from an append-only, hash-chained stream of events,
  making the history tamper-evident.
- **Consent.** A data-sovereignty access grant — the right of a named party, for a stated
  purpose, for a bounded time, to access data held by another party.

## Where to go next

- [Architecture Overview](Architecture-Overview) — the four-layer model in detail.
- [Standards Mapping](Standards-Mapping) — exactly how SIGNET bridges OCDS, EN 16931,
  UBL/Peppol, VC/DID, and ePO.
- [Worked Examples](Worked-Examples) — see the model on real instances.
