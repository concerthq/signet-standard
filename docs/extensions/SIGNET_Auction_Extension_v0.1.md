# SIGNET Canonical Data Model — Auction Extension v0.1

**Status:** Working Draft · **Licence:** CC0 1.0 · **Steward:** Concert Foundation
**Extends:** SIGNET CDM v0.1 (process layer), reusing foundation and trust layers.

This extension adds a **standardised auction** to the SIGNET CDM as a *profile of the
sourcing flow*. It defines two new process-layer objects — `Auction` and `Bid` — and
specifies how the auction's rules and close reuse the existing `Policy`, `Decision`,
`Award`, `Event`, `SupplierQualification`, and `Provenance` objects. It introduces no
new layer.

It is modelled on the architecture that made Ukraine's Prozorro work: the auction —
the moment of price formation — lives in the **neutral, standardised layer**, while
operators provide the front-end. That single choice is simultaneously the elegant
auction design and the cleanest expression of the Concert/operator governance firewall.

---

## 1. Design principle (normative intent)

**The auction is a standardised process, not an operator feature.** The auction
*rules* (§3.2) and the canonical *bid record* are normative and operator-independent:
**any conformant operator running the same rules over the same bids MUST reach the same
close.** Bidding UX, notifications, and round mechanics are operator concerns; price
formation and the award are not. This removes auction-clearing from the set of things
any single operator could be accused of rigging — fairness becomes a conformance
property, verifiable with the open harness, rather than a matter of trust.

**One primitive, many profiles.** Reverse, English, Dutch, sealed-bid, and
multi-criteria auctions are all profiles of one `Auction` object, parameterised by
`auctionType` and `rules`. Implementations MUST NOT introduce per-type primitives —
this preserves the lean core (the "resist concept sprawl" discipline).

## 2. Why an auction is a profile of the sourcing flow

An auction is a specialised `SourcingEvent → Submission → Evaluation → Award` cycle in
which submissions (`Bid`s) are revised over rounds and the close is a deterministic
function of the bids and the published rules. It therefore reuses the sourcing
machinery rather than duplicating it: a `Bid` is the auction's submission; the close is
an `Evaluation` + `Award` `Decision`; eligibility is a `SupplierQualification` check;
the bid history and close are a hash-chained `Event` stream.

## 3. `Auction` (normative)

### 3.1 Object
Required: `id`, `procuringParty`, `auctionType`, `rules`, `status`. May reference the
`sourcingEvent` it realises and an `evaluationPolicy` (for multi-criteria). `auctionType`
is one of `reverse`, `english`, `dutch`, `sealed-bid`, `multi-criteria`
(`codelists/auctionType.csv`).

### 3.2 `rules` — the normative, deterministic parameters
`roundStructure` (`single-round` | `multi-round` | `continuous`), optional `maxRounds`,
`startPrice`, `reservePrice` (a floor for reverse / ceiling for forward; bids beyond it
are invalid), `minStep` (minimum decrement or increment between successive bids),
`closeCondition` (`fixed-time` | `no-improvement` | `max-rounds`), `tieBreak`
(`earliest-bid` | `random-seeded` | `split`), and `identityDisclosure`
(`sealed-until-close` | `anonymous-ranks` | `open`).

These parameters are the conformance surface. `tieBreak: random-seeded` MUST use a
published seed so the resolution is reproducible — determinism is the whole point.

### 3.3 Status state model
`scheduled → open → in_progress → closed`, with `cancelled` available from any
non-terminal state. The `Award` (§5) references a `closed` auction; it is not itself an
auction state.

### 3.4 Eligibility
`eligibility.requiresQualification` and `minStatus` tie bidding to
`SupplierQualification`. A conditionally-qualified supplier inherits its conditions —
e.g. a €5M `valueCap` structurally bars it from *winning* a €12M auction even if it may
*observe* or bid. The auction inherits the onboarding firewall for free.

## 4. `Bid` (normative)

Required: `id`, `auction`, `bidder`, `value`, `submittedAt`, `status`
(`active` | `superseded` | `withdrawn` | `winning` | `rejected`). May carry the bidder's
`qualification` (eligibility provenance) and the `round`. Each bid placement is also
emitted as a hash-chained `Event` (`bid.placed`); this object is the materialised
standing bid.

## 5. The close (reuse, not new machinery)

At `closeCondition`, the auction closes deterministically:
- **reverse** → the lowest valid bid wins; **english/dutch** → the highest;
  **sealed-bid** → the best at the single close; **multi-criteria** → the highest-scoring
  bid under `evaluationPolicy` (the MAT/MEAT pattern reused).
- The winner is recorded as an `Award` and a `Decision` (`decisionType: award`) carrying
  rationale, the bids considered, the rules/policy applied, `provenance`, and
  `humanApproval` where the mandate threshold requires it (the same governance gate as
  the agent award demo). The `Award` reuses the existing `award.schema.json`
  (`sourcingEvent` = the auction's sourcing event).

Because the close is a deterministic function of the bids and `rules`, two operators
MUST produce the same `Award` — the conformance test.

## 6. Transparency = the Event trail

The Prozorro motto "everyone sees everything" is realised cryptographically, not by
central storage. The ordered bid history, the rules applied, and the close are an
append-only, hash-chained `Event` stream with `provenance`. After close, this record is
disclosed per `identityDisclosure`. Altering any bid breaks the chain — so the auction
"cannot be held in secret, and the record cannot be lost or altered" by construction,
a stronger guarantee than central storage gives.

## 7. Agent participation (informative)

SIGNET's agent-native design lets bidding agents participate under `Mandate`: a
supplier's agent places and revises bids within its authorised limits; a buyer's (or a
neutral) agent runs the close under the rules; every action is provenance-stamped, with
human approval above threshold. The auction is thus the first multi-agent,
cross-organisational SIGNET interaction — reusing both the qualification and award
harnesses.

## 8. Scope boundary (normative)

The standard governs the **rules and the canonical record**, not the real-time
mechanics. Conformance means *same outcome on the same bids and rules* — not identical
UX or latency. SIGNET can defeat *some* manipulation structurally (sealed identities
until close, deterministic close and tie-break, the tamper-evident trail) but **does not
and cannot** resolve collusion or shill bidding by itself; those remain operator-policy
and regulatory concerns. Implementations MUST NOT represent SIGNET conformance as a
guarantee against collusion.

## 9. Conformance

An implementation conforms if it: implements the `Auction` status model (§3.3) and the
`rules` parameters (§3.2); records bids as `Bid`s and hash-chained `Event`s (§4, §6);
closes deterministically per `auctionType` (§5) emitting a valid `Award` + `Decision`;
enforces `eligibility` against `SupplierQualification` (§3.4); and validates `Auction`
and `Bid` instances against their schemas. Two conformant operators MUST close an
identical bid set identically.

## 10. Schemas & examples

- `schema/auction.schema.json`, `schema/bid.schema.json`
- `codelists/auctionType.csv`
- `examples/auction-reverse.json` — a closed multi-round reverse auction (start €12M,
  reserve €9M, no-improvement close)
- `examples/bid-reverse.json` — the winning €10.8M bid
