# Trust Layer

Cross-cutting structures that wrap every object in the layers below with auditability,
provenance, and consent. These are what make a SIGNET network's history a tamper-evident
system of record rather than a mutable database.

| Object | Purpose | Aligns to |
|--------|---------|-----------|
| [Event](#event) | An append-only, hash-chained record of a material change. | event-sourcing |
| [Provenance](#provenance) | Who/what produced an assertion, when, from what. | W3C PROV-O |
| [Consent](#consent) | A data-sovereignty access grant. | Solid consent pattern |

---

## Event

An append-only record of a material change. **The current state of any object is the
projection of its ordered Event stream** (design principle 1.7). This makes audit native
and tampering evident.

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Event identifier. |
| `eventType` | string | 1 | See [eventType codelist](Codelists#eventtype), e.g. `submission.lodged`, `award.decided`, `mandate.granted`. |
| `subject` | Identifier | 1 | The object the event concerns. |
| `actor` | Identifier | 1 | The Party (human or synthetic) that caused the event. |
| `timestamp` | date-time | 1 | When it occurred. |
| `payload` | object | 0..1 | The change. |
| `previousEventHash` | string | 0..1 | Hash of the prior event, forming a tamper-evident chain. |
| `provenance` | Provenance | 1 | [Provenance](#provenance). |

`previousEventHash` chains each event to its predecessor: altering any historical event
breaks the chain and is therefore detectable. Replaying the ordered stream reconstructs the
current state of any object.

---

## Provenance

Who or what produced an assertion, when, and from what. Aligned to
[W3C PROV](Glossary#prov). Also defined in the [Foundation Layer](Foundation-Layer#provenance)
because it is embedded in [Decisions](Agent-Layer#decision) and [Events](#event).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `generatedBy` | Identifier | 1 | The agent or activity that produced the assertion. |
| `generatedAt` | date-time | 1 | When. |
| `derivedFrom` | Identifier[] | 0..* | Source objects. |
| `usedPolicies` | Identifier[] | 0..* | Policies applied. |
| `signature` | object | 0..1 | Cryptographic signature over the assertion. |

In the [JSON-LD context](Serialisation), `generatedBy` maps to `prov:wasGeneratedBy` and
`derivedFrom` to `prov:wasDerivedFrom`, so SIGNET provenance is interpretable by any PROV
toolchain.

---

## Consent

A data-sovereignty access grant — the right of a named party, for a stated purpose, for a
bounded time, to access data held by another party. Expresses the **Solid consent pattern**
as CDM data (design principle 1.5).

| Field | Type | Card. | Definition |
|-------|------|-------|------------|
| `id` | Identifier | 1 | Consent identifier. |
| `grantor` | Identifier | 1 | The party who owns the data. |
| `grantee` | Identifier | 1 | The party granted access. |
| `resource` | Identifier[] | 1..* | The data resources covered. |
| `purpose` | string | 1 | The permitted purpose. |
| `validity` | Period | 1 | Time bound. |
| `revocable` | boolean | 1 | Whether revocable before expiry. |
| `proof` | object | 0..1 | Signed grant. |

A [Document](Foundation-Layer#document) whose access is controlled references a Consent
object via its `accessGrant` field. This is how the model separates *an assertion* from *the
right to access the data behind it* — the CDM never assumes a central data warehouse.

## Putting it together

A typical award flow generates, across the layers:

1. A `need.raised` **Event** when a [Need](Process-Layer#need) is created.
2. A `sourcingEvent.published` **Event** for the [SourcingEvent](Process-Layer#sourcingevent).
3. A `submission.lodged` **Event** per [Submission](Process-Layer#submission).
4. An `evaluation.completed` **Event**, with the [Evaluation](Process-Layer#evaluation)
   linking to a [Decision](Agent-Layer#decision) that embeds **Provenance**.
5. An `award.decided` **Event** for the [Award](Process-Layer#award), again backed by a
   signed Decision.
6. A `contract.signed` **Event** for the [Contract](Process-Layer#contract).

Each event is hash-chained to the last; each decision is signed; each policy applied is
referenced. The audit trail *is* the system of record.

## Where to go next

- [Agent Layer](Agent-Layer) — the Decisions and Policies that Events reference.
- [Serialisation (JSON-LD)](Serialisation) — how provenance maps to W3C PROV terms.
- [Codelists → eventType](Codelists#eventtype).
