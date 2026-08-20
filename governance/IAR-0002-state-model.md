# IAR-0002 — Interim approval record: state model, surface authority, and the `Bid` correction

| Field | Value |
|---|---|
| **Record** | IAR-0002 |
| **Date** | 2026-08-20 |
| **Baseline** | v0.14.0 (`cb6c2cb`, clean tree, 5 commits ahead of tag) |
| **Authority** | Bootstrap clause. The Standards Committee is not constituted. |
| **Precedent** | CP-Extension-Composition landed ahead of ballot under the same clause at v0.13.0. |
| **Ratifies** | Nothing. Landing is not ratification; the Committee may amend or reverse in full. |
| **Numbering** | There is no IAR-0001. This is the first interim approval record in the repository; the number is retained as assigned rather than renumbered, and the gap is recorded here rather than left to be inferred. Interim decisions before this one were recorded as **interim resolutions** in the document each governs, indexed in [`governance/README.md`](README.md). |

## Tier classification of this change

| Item | Path | Tier | Route |
|---|---|---|---|
| Transition registry | `state-model/state-model.json` | 1 | New non-normative artifact |
| State model specification | `docs/state-model.md` | 1 | `docs/` is non-normative |
| New event codes (21) | `codelists/eventType.csv` | 1 | Open codelist values |
| CI check | `conformance/rules/check-state-model.js` | 1 | Tooling, not `conformance/suite/` |
| **`Bid.status` — remove `superseded`** | `schema/bid.schema.json` | **2** | **This record** |

Four of five items are Tier 1 and need no resolution. One is Tier 2 and is the subject of this
record.

## The Tier 2 item

`schema/bid.schema.json` `status` enum loses one value:

```diff
       "status": {
         "type": "string",
         "enum": [
           "active",
-          "superseded",
           "withdrawn",
           "winning",
           "rejected"
         ]
       }
```

Supersession is expressed instead as an appended event, `bid.superseded`, whose payload carries
`supersededBy`. This is consistent with GRT-1's treatment of withdrawal for grant-type objects:
the fact is appended, the object is not mutated to carry a relation it cannot express.

**Reasoning.** `superseded` is a relation to another `Bid`, not a state of this one. It is
unprojectable — no event can yield it, because deriving it requires knowing superseded *by
what*, which the state value does not carry. Under S-2 a stored value MUST equal the projection
of the event stream; for this value there is no projection to equal, so the rule would be
unsatisfiable wherever it appeared. The alternative — carving `superseded` out of S-2 — makes a
normative rule with a hole in it at precisely the value that caused the confusion.

**Breaking.** Yes, for any implementation storing `superseded` in `Bid.status`. `Bid` is an
extension object (auction), shipped at v0.8.0. No implementation is known to be affected; none
has been certified.

**Migration.** Per affected bid: append a `bid.superseded` event carrying `supersededBy`, and
resolve `status` to `active`. Where the historic supersession has no recorded actor, the
appended event records that its provenance is retrospective rather than fabricating one.

**Comment period.** Fourteen calendar days from the pull request being marked ready, per
GOVERNANCE.md Tier 2, recorded in the pull request. The comment period runs even though the
resolution is interim; the bootstrap clause substitutes for the Committee, not for the period.

## What is deliberately not included

- **No new field on any object.** The remedy for `Mandate`'s unrecordable lifecycle is the
  registry plus S-1 to S-3, not a `status` field. Adding one would reopen the rejected position
  on `Consent` status fields rather than closing the gap that rejection identified.
- **No `conformance/levels.md` change.** An `F-STATE` requirement is deferred; the change lands
  without it, so the Tier 2 surface stays as small as it can be.
- **No relying-party attestation for `Mandate`.** A party without stream access cannot verify a
  mandate's effectiveness; `E-MDT` exists and the identity profile already tests an authority
  credential's ceiling against a decided value, so the mechanism is available. Deferred
  deliberately: whether external verification is needed at the JV boundary, or whether stream
  access between parties makes it moot, is a question a live deployment answers better than
  argument does.

## Interests

The Standards Committee is not constituted and the interests and recusals register initiates on
constitution. Until then this is the disclosure, in plain terms and not by reference to any
filed record:

> This change originates from implementation questions raised by a deploying implementer whose
> platform lead also holds a role in the stewardship body.

The basis rule at `docs/state-model.md` §6 discharges this substantively rather than
procedurally. Every core entry must be justifiable without reference to the submitting
implementer, `basis` makes each justification auditable after the fact, and CI enforces it on
every push. That control does not depend on the disclosure being read.
