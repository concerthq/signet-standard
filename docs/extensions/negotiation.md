# SIGNET CDM — Negotiation Extension v0.1
**Extension id:** `negotiation` · **Status:** Working Draft (spec; schemas to follow) · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Extends:** Process/Agent layers; reuses Mandate, Decision, Event, Contract.

## 1. Motivation
`decisionType: negotiationMove` exists with no negotiation object behind it. Direct
negotiation, post-tender clarification, and framework call-off negotiation need
rounds, offers, and term positions — and agent-led negotiation under mandate is the
strongest unbuilt demonstration in the standard: the auction demo's sealed
mandate-floor mechanic generalises from one dimension (price) to many (price, terms,
liability), and this extension is its schema.

## 2. Design principles
- **D1 — A negotiation is a governed exchange of Offers over named terms.** Terms
  are declared up front (the negotiable surface); each Offer takes positions on them.
- **D2 — Mandates bound concessions per term.** A party's agent holds a Mandate with
  per-term limits (e.g. price floor, liability cap non-negotiable) — the harness
  enforces that no offer breaches them, exactly as auction floors are enforced.
- **D3 — The record is symmetric and tamper-evident.** Both parties' moves are
  hash-chained Events; the concluded position becomes Contract terms (or an
  Amendment).

## 3. New objects
**`Negotiation`** — id; parties[]; subject (SourcingEvent|Contract|CallOff ref);
terms[] {termId, name, type: price|duration|liability|sla|other, unit?}; status:
open|concluded|abandoned (closed); result? {contract|amendment ref}; provenance.
**`Offer`** — id; negotiation; offeredBy; round; positions[] {termId, value};
respondsTo? (prior Offer); offerStatus: open|countered|accepted|rejected|withdrawn
(closed); underMandate (the offering agent's/negotiator's Mandate); provenance.
Events: `negotiation.opened`, `offer.made`, `offer.accepted`,
`negotiation.concluded`. Acceptance emits a Decision (mandate-bound; concluded
terms above thresholds require human approval).

## 4. Boundaries
Not a drafting/redlining tool; not a claim to negotiation *strategy* — SIGNET
governs and records the exchange; what to offer remains the party's (or its
model's) judgement. Honest limit: mandates bound concessions; they do not guarantee
good outcomes.

## 5. Conformance (sketch)
Every Offer's positions cover only declared terms; no accepted Offer breaches the
accepting or offering party's Mandate limits (the cross-object check); rounds
monotonic; concluded negotiations resolve to a Contract/Amendment whose terms match
the accepted Offer (closure); the move sequence is an unbroken chain.
