# SIGNET Auction Conformance Profile — `auction-platform` v0.1

**Status:** Working Draft · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Composes:** SIGNET CDM v0.1, the [auction extension](../extensions/auction.md), the
[identity extension](../extensions/identity.md), and the published conformance suite.
**Adds:** nothing normative of its own — this is a **profile**, not an extension. It
names a subset of already-shipped requirements as the bar an eAuction *platform* must
clear to be certified.

This is the **first product-certification path** under the standard. Where
[`conformance/certification.md`](../../conformance/certification.md) defines how *any*
implementation earns the "SIGNET Certified" mark, this profile defines what a
**certified eAuction platform** specifically must demonstrate. It introduces no new
tests: every requirement below is satisfied by an artifact already in the tree, and
every requirement is checkable with the same public tooling anyone can re-run.

---

## 1. What the profile warrants — and what it does not

A platform certified against this profile holds the ordinary implementation mark —
`SIGNET Certified: Core (CDM v0.1, suite v0.1)` or `Full` — and its registry entry records
that the `auction-platform` profile was assessed, in the
[certification register](../../conformance/certification-register.md), which is empty. The
[mark grammar](../../governance/mark-grammar.md) has no profile production, so there is no
such string as *"SIGNET Certified — Auction Platform"*: the profile names a subset of
requirements, and the registry records what was assessed against it. Adding a profile
production to the grammar is a question for the Standards Committee once constituted (mark
grammar §11).

Certification against this profile warrants that, against a stated CDM and suite version, the
platform closes auctions **deterministically**, keeps a **tamper-evident** canonical record,
and records **governed** awards — all demonstrable by re-running the public suite against the
platform's own outputs.

It deliberately does **not** warrant bidding UX, latency, or availability; and it does
**not** warrant against collusion or shill bidding, which no data standard can resolve
(auction extension §8). The mark covers **the rules and the record**, not the market
behaviour of participants. A platform MUST NOT represent the mark as a guarantee against
collusion.

## 2. The five requirements

Each requirement (`AP-n`) names the object(s) it constrains, the artifact that tests it,
and the conformance level it draws from. Requirements AP-1…AP-3 are the three the
[live auction demonstration](https://github.com/concerthq/signet-standard/tree/main/auction)
exercises in the browser.

| # | Requirement | What it means | Tested by |
|---|-------------|---------------|-----------|
| **AP-1** | **Valid objects** | Every `Auction` and `Bid` the platform emits validates against the published schemas, and invalid objects are rejected. | `schema/auction.schema.json`, `schema/bid.schema.json`, `codelists/auctionType.csv`; C-DOC document conformance. |
| **AP-2** | **Deterministic close** | The recorded winner **is** the deterministic function of the standing bids and the published `rules` — verified two ways: by rule-check, and by **replay** (re-running the recorded bid sequence reproduces the identical award). | `conformance/rules/check-auction.js` rules **A1** (exactly one winner) and **A2** (recorded winner equals the deterministic close); auction extension §5. |
| **AP-3** | **Tamper-evident record** | Every bid and the close live in an append-only, hash-chained `Event` trail; any alteration breaks the chain and is detectable. | C-EVT event & audit integrity (`previousEventHash` chaining); auction extension §6. |
| **AP-4** | **Governed awards** | The close is recorded as a `Decision` (`decisionType: award`) carrying rationale, the bids considered, the rules applied, and `provenance`; a verifiable human approval (`Approval`) is present where the mandate threshold requires it. Tested as *record completeness*, not as enforcement — see below. | C-PROV provenance presence; identity extension `Approval` / `humanApproval`; auction extension §5. |
| **AP-5** | **No personal data in the chain** | Person references in hash-anchored records are pseudonymous identifiers, so the trail is both integrity-preserving and erasable. | Identity extension no-PII rule (§ "No personal data in hash-anchored records"). |

`check-auction.js` additionally enforces **A3** (every bid respects the reserve and
references its `Auction`), which supports AP-1 and AP-2.

**AP-4 tests the record, not the enforcement.** C-PROV establishes that the `Decision` is
complete and provenance-bearing, and the identity extension establishes that an `Approval`
is verifiable where one is present. Nothing at Core or Full establishes that the platform
*refused* to award beyond its mandate's threshold without one — that is the proposed `E-MDT`
endorsement ([`conformance/levels.md`](../../conformance/levels.md) §2.4). A platform whose
awards are governed in fact and a platform whose awards merely *record* their governance are
currently indistinguishable to this profile, and a buyer relying on AP-4 should read it as
"the trail is complete", not "the ceiling held".

## 3. Core vs the full bar

The one property that must live **in the platform itself** is the deterministic close
(AP-2): it is where price formation happens and cannot be delegated to an adapter. The
remaining requirements (valid objects, hash-chained events, provenance, pseudonymity)
are reachable quickly through the conformance harness's adapter pattern, exactly as for
any Core-level certification. A platform therefore reaches the profile's core level by
adding a conformant close on top of the shipped harness behaviour.

## 4. Certification process

The process is the general one in
[`conformance/certification.md`](../../conformance/certification.md), applied to this
profile and **identical for every implementer**:

1. **Self-test** — run the public suite (including `check-auction.js`) against the
   platform's outputs, producing a report per `conformance/report-schema.json`.
2. **Submit** — send Concert the report, the adapter source, and the suite + CDM
   versions used.
3. **Reproduce** — Concert re-runs the identical tooling and confirms the report; the
   check is mechanical, with no discretionary gate.
4. **Registry** — on a confirmed pass, Concert records the certification and licenses
   the mark for that level and version.
5. **Challenge** — the suite is public, so anyone may re-run the checks against a
   certified platform at any time. The mark is self-policing; a platform that stops
   passing stops being certified.

Certification terms — including any fee — are published before any party certifies and
are identical for all, including any implementation associated with Concert's founders
(neutrality rules CN-1…CN-4 in [`conformance/levels.md`](../../conformance/levels.md)).

## 5. Scope boundary (normative)

Conformance means **the same outcome on the same bids and rules**, and a record that
cannot be altered undetectably. It does not mean identical UX, identical latency, or
immunity from participant collusion. The profile composes only shipped, machine-runnable
artifacts; it adds no requirement that is not already testable in the tree.
