# CP-Credential-semantics

**Status:** Draft — not yet balloted. **Gates open** (§9): unlike the other proposals in this
directory, nothing here has been resolved under the bootstrap clause. The gates are recorded as
gates because they are genuine open questions, not because resolving them is deferred on principle.
**Affects:** `schema/definitions.schema.json` (`Credential`), `docs/specification.md` §4.7
**Target:** CDM v0.2
**Breaking:** No for documents already in circulation; semantically widening for consumers — see §7
**Depends on:** none
**Blocks:** [mark grammar](../mark-grammar.md) R4 (selective disclosure for person marks)

---

## 1. Problem statement

**P1 — The prose and the schema describe different objects.** The specification (§4.7) and the
schema `description` both say a `Credential` is *"a reference to a W3C Verifiable Credential"*. The
schema then **requires** `credentialSubject` and `proof` — which are the credential's *substance*,
not a pointer to it. A reader following the prose builds a pointer and fails validation; a reader
following the schema embeds the whole credential and is told by the prose that they did not.

**P2 — The required set forecloses the case the prose describes.** With `credentialSubject` and
`proof` both required, the reference form is unrepresentable. That is a decision the model has taken
by accident rather than on the record, and it is the more consequential of the two readings.

**P3 — The consequences are not confined to marks.** Every supplier submission carrying ISO
certificates, insurance cover, or an EcoVadis rating turns on this. Four properties differ between
the two readings, and none of them is cosmetic:

| | Reference | Embedding |
|---|---|---|
| **Freshness** | Resolves live; revocation and status are visible at read time | Frozen at the moment of copying; a revoked credential keeps validating |
| **Availability** | Depends on the issuer's endpoint being up and reachable | Self-contained; survives the issuer disappearing |
| **Disclosure** | The claims are not in the document | The claims travel with every copy of the document |
| **Size** | Small | Unbounded — BBS proofs and long claim sets are not small |

**P4 — It collides with a rule the identity extension already states.** That extension requires
person references in hash-anchored records to be pseudonymous, so the trail is both
integrity-preserving and erasable. An embedded credential can carry personal data in
`credentialSubject`, and once that is inside a hash-chained `Event` payload it is not erasable
without breaking the chain. The two rules have not been read against each other.

**P5 — It blocks a decision elsewhere.** Mark grammar R4 defers selective disclosure for person
marks until this is settled, because mark issuance cannot be built on a primitive whose semantics
are unsettled. That deferral is correct and should not be resolved by guessing.

**Consequence.** Two implementations can each be fully conformant, exchange objects both call
`Credential`, and mean different things by them — with different privacy, freshness, and
availability properties, and no field on the wire that says which.

---

## 2. Proposal — permit both, with a discriminator

Neither form is wrong. A reference is right for a live compliance check against an issuer that
publishes status; an embedding is right for a submission that must be evaluable years later, offline,
after the issuer has gone. Forcing one on both cases produces workarounds, and workarounds are how a
model acquires a de facto extension nobody governs.

The proposal is therefore that `Credential` admits **both forms**, distinguishes them **explicitly**,
and requires of each form only what that form can carry:

| Form | Required | Prohibited |
|------|----------|-----------|
| `reference` | `id` (resolvable URI), `type`, `issuer` | — |
| `embedded` | `id`, `type`, `issuer`, `issuanceDate`, `credentialSubject`, `proof` | — |

`credentialForm` is the discriminator. Its absence is read as `embedded`, which is what every
document shipped to date is, so nothing already written changes meaning.

### Schema sketch

```jsonc
{
  "credentialForm": { "type": "string", "enum": ["reference", "embedded"] },
  // required: id, type, issuer   (the intersection of both forms)
  "allOf": [
    { "if":   { "properties": { "credentialForm": { "const": "reference" } },
                "required": ["credentialForm"] },
      "then": { "required": ["id", "type", "issuer"] },
      "else": { "required": ["id", "type", "issuer", "issuanceDate", "credentialSubject", "proof"] } }
  ]
}
```

The `else` branch is what makes this non-breaking: a document with no `credentialForm` is held to
exactly the requirements it is held to today.

---

## 3. Specification change

§4.7 is rewritten to describe the primitive as *"a Verifiable Credential asserting a claim about a
Party, carried either by reference to the issuer's published credential or by embedding the
credential itself"*, with the table above, and a statement of the trade-off in §1, P3 so an
implementer chooses deliberately rather than by copying an example.

---

## 4. Conformance

| Rule | Requirement | Level |
|------|-------------|-------|
| **CRD-1** | A `Credential` with `credentialForm: reference` MUST carry an `id` that is a resolvable URI. | C-DOC (structural) |
| **CRD-2** | An implementation MUST NOT treat an embedded `Credential` as evidence of *current* status. Where currency matters, the reference form or a `credentialStatus` check is required. | Not testable by the suite — see below |

CRD-2 is stated and deliberately left untested, because no adapter surface can establish it. It is
recorded here as **modelled and specified, not certified**, per the discipline in
`conformance/levels.md` §5. Writing it as a testable requirement it is not would repeat the failure
this workstream exists to correct.

---

## 5. Interaction with the identity extension

The no-PII-in-hash-anchored-records rule and the embedding form are in tension, and this proposal
does not resolve it — it names it (§9, G3). The likely shape of an answer: an embedded credential
carrying personal data MUST NOT be placed in an `Event` payload, and MUST be referenced from one by
hash and pointer only. That preserves both the tamper-evidence and the erasability, at the cost of a
rule implementers must know. It needs the identity extension's authors to look at it.

---

## 6. Effect on the mark grammar

R4 defers selective disclosure for person marks until this ambiguity resolves. Under this proposal
the answer becomes available rather than automatic: a person mark could later be issued as an
embedded credential with a BBS proof, *in addition to* its registry entry, without any change to the
registry record that remains the source of truth. This proposal does not decide that; it unblocks it.

It does **not** reopen the declined question of issuing *implementation* marks as verifiable
credentials. That was refused for reasons that are about Concert's position rather than about the
`Credential` primitive (mark grammar §8), and none of them is touched here.

---

## 7. Backward compatibility

| Change | Breaking? | Notes |
|--------|-----------|-------|
| `credentialForm` field | No | Optional; absence means `embedded`, which is today's behaviour. |
| Conditional required set | No, on the wire | Every currently valid document remains valid. |
| Consumers | **Semantically widening** | An implementation that assumes `credentialSubject` is always present will meet documents where it is not. This is the real cost, and it is a reason to land the change before v1.0 rather than after. |
| Prose | No | Corrects a description that never matched the schema. |

---

## 8. Rejected alternatives

**A — Fix the prose to match the schema (embedding only).** The cheapest change, and it resolves the
contradiction. Rejected because it settles by accident the question P3 shows is substantive: it
would make every live compliance check unrepresentable, and force implementers into a copy-the-VC
pattern whose staleness is invisible on the wire.

**B — Fix the schema to match the prose (reference only).** Rejected symmetrically, and more
strongly: it breaks every shipped example carrying `credentialSubject`, including
`examples/approval.json`, and it makes the model depend on issuer endpoint availability for
evaluation that may happen years later.

**C — Two primitives, `CredentialReference` and `Credential`.** Rejected on core leanness. Two names
for one concept, with every referencing field then needing to accept either, is the concept sprawl
the core resists — and the discriminator carries the same information at a fraction of the cost.

**D — Infer the form from which fields are present, with no discriminator.** Tempting, and it needs
no new field. Rejected as a gate rather than outright (§9, G1): inference means a document that omits
`credentialSubject` by mistake silently becomes a different kind of object, and the failure is
exactly the sort that surfaces years later in an audit.

---

## 9. Open gates

**G1 — Explicit discriminator, or inferred from presence?** §2 proposes explicit; alternative D is
the inference. The question is whether the cost of a new field is worth removing a silent
mis-typing. *Recommendation: explicit.*

**G2 — Does the reference form need a status/freshness field?** W3C VC defines
`credentialStatus`; the CDM currently has nothing. Adding it makes revocation checkable; not adding
it leaves CRD-2 as advice.

**G3 — How does the embedding form interact with the identity extension's no-PII rule?** §5. This
one needs the identity extension's authors, and should not be resolved inside this proposal.
