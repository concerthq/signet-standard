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

`purpose` is a **human-readable statement**, not a machine-evaluable term: the string
interoperates, and its evaluation is not defined by the standard. A profile may define a
`purposeCode` extension with a codelist appropriate to its jurisdiction or sector — purpose and
lawful-basis vocabularies differ enough that a single core list would be wrong for most adopters.

`revocable` records whether a grant *may* be withdrawn. It does not record whether one *has*
been — see below.

### Withdrawal is an event

`Consent` and `Mandate` are **grant-type objects**: they confer authority for a bounded period,
and that authority may cease before the period ends. An implementation MUST NOT mutate the
object to record withdrawal. It appends an `Event` — `consent.revoked`, `mandate.revoked`, both
in the closed core of [eventType](Codelists#eventtype) — and a grant is **effective** at time
*T* only if it was granted before *T*, not revoked before *T*, and *T* falls inside its
`validity`.

The determination must be reproducible by a third party from the published event stream alone.
This is design principle 1.7 applied where it matters most: a status field on the object would
be a second source of truth with no rule for which governs when the two disagree.

There is no `*.expired` event. Expiry happens by the clock rather than by any party's act, so
such an event would have no honest `actor` — and `Event` requires one. The projection tests
`validity` directly. See specification §7.4.

**What is tested, and what is not.** All of the above is *modelled*. No conformance requirement
at Core or Full currently tests that access is actually gated by a live grant, that revocation
takes effect, or that `accessGrant` is honoured — `Consent` is validated structurally by C-DOC
and nothing more. The proposed `E-CNS` endorsement would test it. See
[Conformance Harness](Conformance-Harness).

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
7. An `obligation.discharged` **Event** when an [Obligation](Process-Layer#obligation) flips to
   `met` — the [Invoice](Process-Layer#invoice) that settles it is recorded via `settles`, and
   the obligation back-references it via `dischargedBy`. This is the step that **closes the
   loop**: the commitment made at `contract.signed` is now discharged, traversably, as data.

Each event is hash-chained to the last; each decision is signed; each policy applied is
referenced. The audit trail *is* the system of record.

## Where to go next

- [Agent Layer](Agent-Layer) — the Decisions and Policies that Events reference.
- [Serialisation (JSON-LD)](Serialisation) — how provenance maps to W3C PROV terms.
- [Codelists → eventType](Codelists#eventtype).
