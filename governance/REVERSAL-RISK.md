# Reversal risk on the bootstrap register

**Status:** Tier 1 governance record · **Answers:** implementer question G2

Twenty interim resolutions are in force under the bootstrap clause. Each is ratifiable, amendable
or **reversible** once a Standards Committee exists. An implementer building today is building on
decisions that may not survive, and is entitled to know which ones.

## The annotation

Every interim approval record gains a `reversalRisk` field, with reasoning. Not a prediction — a
statement of what a Committee would have to disturb to reverse it, and what an implementer would
have to redo.

| Band | Meaning | What an implementer should do |
|---|---|---|
| `low` | Corrects a defect verifiable against the artifacts. Reversal would reinstate a known fault. | Build on it. |
| `medium` | A design choice among defensible alternatives, with the losing options recorded. Reversal is possible on new argument. | Build on it, isolate the seam. |
| `high` | Breaking, or resting on a position the register records as contested, or without a corroborating source. | Build a local answer; treat convergence as a migration. |

A record whose reasoning cannot distinguish itself from `high` is `high`. The band is assigned by
the same route as the decision and is itself revisable.

## Why this rather than a prose answer

An implementer asked which of twenty resolutions carry the most reversal risk. Answering in
correspondence produces an answer one party holds. Annotating the register produces one every
implementer can read, and one that stays attached to the decision when the correspondence is
forgotten.

## Initial assignment

| Record | Band | Reasoning |
|---|---|---|
| IAR-0002 — `Bid.superseded` removed | `low` | Removes an unprojectable value. Reversal reinstates a state no event can produce. |
| IAR-0003 — closed codelist enum generation | `low` | Makes the schema enforce what the codelist already declared. Reversal reinstates a suite that accepts invalid documents. |
| IAR-0004 — registry normative for state vocabularies | `medium` | Generation is a design choice among defensible alternatives and the losing option is recorded. Reversal would return to asserted agreement between two hand-maintained records — recoverable, but it changes where a lifecycle vocabulary is authored, so an implementer generating from the registry would need to re-source. |

The remaining seventeen are unassigned pending review, which is itself the honest state: an
unassigned record should be read as unassessed, not as low.
