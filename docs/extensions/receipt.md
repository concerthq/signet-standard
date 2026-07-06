# SIGNET CDM — Receipt & Three-Way Match Extension v0.1
**Extension id:** `receipt` · **Status:** Working Draft (spec; schemas to follow) · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Extends:** Process layer; reuses Policy, Decision, Event, Provenance.

## 1. Motivation
The P2P chain currently runs Order → *(nothing)* → Invoice: there is no receipt or
acceptance object, so the three-way match — the control every AP process is built on
— is unrepresentable. This extension closes the loop and makes the match a governed,
high-volume agent decision.

## 2. Design principles (normative intent)
- **D1 — Receipt is an attestation, not logistics.** SIGNET records that goods/
  services/milestones were received and accepted, by whom, against which Order lines.
  ASN/despatch detail belongs to Peppol/GS1 — map, don't replicate.
- **D2 — The match is a Decision.** A three-way match is a governed decision
  ("invoice reconciles against order and receipt within tolerance policy") emitting a
  Decision with inputs, policy, rationale, provenance — the standard harness pattern,
  auto-clearable within an agent's mandate, human-gated above thresholds/exceptions.
- **D3 — Tolerances are Policy.** Price/quantity tolerances are a machine-readable
  `Policy` (policyType: matchTolerance), not code.

## 3. New objects
**`Receipt`** — id; order (core Order ref); receivedBy (Party); receiptType
(goods|service|milestone — open); lines[] {orderLineRef, quantity {amount,unit},
condition?, rejectedQuantity?}; acceptance {status: accepted|partial|rejected|
pendingInspection (closed), acceptedBy, acceptedAt}; documents; provenance. Events:
`receipt.recorded`, `receipt.accepted`, `receipt.rejected`.
**`MatchResult`** — id; invoice, order, receipts[] (refs); policy (tolerance Policy);
lines[] {invoiceLineRef, matched: within|priceVariance|quantityVariance|noReceipt
(closed), variance?}; outcome {status: cleared|blocked|clearedWithVariance (closed)};
decision (Decision ref — mandate-bound; humanApproval where required); provenance.
Events: `match.evaluated`, `invoice.cleared`, `invoice.blocked`.

## 4. Boundaries (normative)
Not a logistics/WMS schema; not payment execution. A cleared match authorises
settlement of the Obligation; it does not perform it.

## 5. Conformance (sketch)
Cross-object rules: every MatchResult's invoice/order/receipt refs resolve; line
arithmetic (variance = invoice − order within policy tolerance) recomputes; `cleared`
requires all lines within tolerance or an explicit variance approval; blocked
invoices carry the failing lines. Deterministic: same inputs + policy ⇒ same outcome.

## 6. Mapping
Peppol Despatch/Receipt Advice; EN 16931 invoice lines (already in core); OCDS
implementation stage.
