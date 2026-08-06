# Architecture Overview

The SIGNET Canonical Data Model (CDM) is organised into **four layers**. Each layer builds
on the one below. This page explains the layering, the lifecycle, the identifier model, and
how the pieces fit together. For field-level detail, follow the links into each layer page.

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

## The four layers

### Foundation layer
The primitive value types and reference objects used everywhere: identifiers, parties,
values, periods, classifications, items, credentials, documents, provenance — plus the EN
16931 building blocks (Unit, InvoiceLine, VatBreakdown). These are defined once in
`schema/definitions.schema.json` and referenced by every other schema.
→ [Foundation Layer](Foundation-Layer)

### Process layer
The procurement lifecycle objects, aligned to the five OCDS stages — **planning, tender,
award, contract, implementation**. This includes the *complete* lifecycle:
Need → SourcingEvent (with Lots) → Submission → Evaluation → Award → Contract →
Order / Catalogue → Obligation → Invoice.
→ [Process Layer](Process-Layer)

### Agent layer
SIGNET's distinctive contribution. Structures that make the network agent-native:
SyntheticAgent, AgentCapability, Mandate, Decision, and the Policy objects that govern
them. No existing procurement standard represents synthetic agents as first-class,
governed, accountable participants.
→ [Agent Layer](Agent-Layer)

### Trust layer
Cross-cutting governance structures that wrap every object above: Event (append-only,
hash-chained change records), Provenance (W3C PROV-aligned), and Consent (data-sovereignty
access grants).
→ [Trust Layer](Trust-Layer)

## The procurement lifecycle

The process layer follows the OCDS lifecycle so any SIGNET process can be projected to a
conforming OCDS release. The canonical phase model:

```
 planning        tender                      award        contract     implementation
 ────────   ───────────────────────────   ─────────   ───────────   ──────────────────
  Need  →  SourcingEvent  →  Submission  →  Evaluation → Award → Contract →  Order
           (+ Lots)          (supplier)     (scoring)            (+Obligations)  Catalogue
                                                                                  Invoice
```

| Stage | OCDS stage | Primary object(s) |
|-------|-----------|-------------------|
| Planning | `planning` | [Need](Process-Layer#need) |
| Tender | `tender` | [SourcingEvent](Process-Layer#sourcingevent), [Lot](Process-Layer#lot), [Submission](Process-Layer#submission), [Evaluation](Process-Layer#evaluation) |
| Award | `award` | [Award](Process-Layer#award) |
| Contract | `contract` | [Contract](Process-Layer#contract), [Obligation](Process-Layer#obligation) |
| Implementation | `implementation` | [Order](Process-Layer#order), [Catalogue](Process-Layer#catalogue), [Invoice](Process-Layer#invoice) |

Every transition between these is also recorded as an immutable [Event](Trust-Layer#event)
in the trust layer (e.g. `need.raised`, `submission.lodged`, `award.decided`,
`contract.signed`).

## How the layers interlock

A few cross-layer relationships are worth highlighting, because they are what make SIGNET
*governed* rather than merely *interoperable*:

- **Policies govern process.** A [Need](Process-Layer#need) and a
  [SourcingEvent](Process-Layer#sourcingevent) reference [Policy](Agent-Layer#policy)
  objects as `governingPolicies`, `eligibilityCriteria`, and `evaluationCriteria`. The same
  policy object that a human reads is the one a synthetic agent executes.
- **Agents make decisions, decisions justify process.** An
  [Evaluation](Process-Layer#evaluation) and an [Award](Process-Layer#award) link to a
  [Decision](Agent-Layer#decision) record. The Decision records *who* (human or synthetic)
  decided, *under which mandate*, from *which inputs*, applying *which policies*, with *what
  rationale*, and with *what human approval*.
- **Mandates bound agents.** A [SyntheticAgent](Agent-Layer#syntheticagent) points to a
  [Mandate](Agent-Layer#mandate) that constrains the capabilities it may exercise, the
  hard limits it must respect, and the thresholds above which a human must approve.
- **Everything carries provenance; everything emits events.** Decisions and Events embed
  [Provenance](Trust-Layer#provenance). The current state of any object is the projection
  of its ordered Event stream (principle 1.7), so the audit trail *is* the system of
  record.
- **Access is consented.** A [Document](Foundation-Layer#document) whose access is
  controlled references a [Consent](Trust-Layer#consent) grant, separating the assertion
  that a document exists from the right to read it (principle 1.5).

## Identifiers and namespaces

- Every CDM object **MUST** carry a network-unique `id`.
- **DIDs are RECOMMENDED** for Parties and agents (making them self-sovereign and resolvable
  without a central registry); URN or URI identifiers are acceptable for process objects.
- The SIGNET vocabulary namespace, the published `@context`, and the registry of identifier
  schemes and codelists are maintained by Concert at stable URIs under `concert.foundation`
  and must not be repurposed to publish non-conforming extensions under the SIGNET name.

See [Foundation Layer → Identifier](Foundation-Layer#identifier) and
[Codelists → identifierScheme](Codelists#identifierscheme).

## Conformance keywords

The specification uses RFC 2119 / RFC 8174 keywords (**MUST, MUST NOT, REQUIRED, SHALL,
SHOULD, RECOMMENDED, MAY, OPTIONAL**). Field cardinality is written as `1` (exactly one,
required), `0..1` (optional single), `1..*` (one or more, required), `0..*` (zero or more).
These same conventions are used throughout this wiki's layer pages.

Whether an implementation meets **the requirements the suite tests** is decided mechanically by
the [Conformance Harness](Conformance-Harness) — with no interview, committee, or discretionary
gate. That is narrower than "every MUST in the specification", and the difference matters:

- **Modelled** — the CDM represents it. Says nothing about whether anyone does it.
- **Tested** — the public suite exercises it against an implementation's own behaviour.
- **Certified** — a passing, reproducible report is on the registry against a named version.

Two governance properties are currently modelled but not tested, and therefore not certified:
that consent terms have consequence, and that mandate limits are respected rather than merely
cited. A **Full** certification is not evidence that human oversight was enforced.
[`conformance/levels.md` §5](https://github.com/concerthq/signet-standard/blob/main/conformance/levels.md)
states which requirements the suite decides, and the two proposed endorsements that would close
the gap.

## Where to go next

- Drill into a layer: [Foundation](Foundation-Layer) · [Process](Process-Layer) ·
  [Agent](Agent-Layer) · [Trust](Trust-Layer).
- See the bridges: [Standards Mapping](Standards-Mapping).
- Understand the serialisation: [Serialisation (JSON-LD)](Serialisation).
- Check conformance: [Conformance Harness](Conformance-Harness).
