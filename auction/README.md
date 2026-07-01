# SIGNET Reverse-Auction Demonstration

The third and most multi-party of the SIGNET demos. Where the award demo has one
agent evaluate bids and the onboarding demo has one agent qualify a supplier, this has
**three parties' agents transacting under one governed, standardised process**: two
bidding agents (each bound by its own private Mandate) and a neutral auctioneer that
closes the auction deterministically.

```bash
npm run auction     # or: node auction/run-auction.js
```

## The scenario (what makes it compelling)

A €12M reverse auction, close-on-no-improvement, €100k steps. Two suppliers bid via
governed agents, each holding a **sealed mandate floor** — the lowest price it is
authorised to bid.

The agents undercut each other round by round. Then the governance beat: **acme's agent
reaches its €11.0M mandate floor and passes** — it will not bid below its authority.
Globex, already winning, has no reason to go lower, so it passes too. The round closes
with no improvement. **Globex wins at €11.0M** — the price set exactly where the
*runner-up's* mandate stopped, while Globex never reveals that its own floor was lower.
The award exceeds the €10M autonomous ceiling, so **human approval is required**, and the
whole sequence — every bid, the close, the decision, the award — is a hash-chained,
tamper-evident record.

This is price formation in the neutral standard layer (the Prozorro insight): the
auctioneer and the rules are SIGNET-governed, not operator-owned, so no operator is in a
position to rig the close.

## Why it matters — the verification block

The runner proves the claim rather than asserting it. Beyond the usual (Auction, Bids,
Decision, Award all validate; the event chain holds; tampering is detected; the award is
mandate-governed), it checks the property that is *the whole point* of a standardised
auction:

> **The close is deterministic — re-running reaches the identical Award.**

That is the machine statement of "any conformant operator closing the same bids under the
same rules reaches the same result." It's what removes auction-clearing from the set of
things an operator could be accused of rigging, and turns auction fairness into a
conformance property.

## Model-pluggable, multi-party

`reasoner.js` has two seams — the **bidding agent** (`next.bid`) and the **auctioneer**
(`close.auction`) — deterministic by default, each swappable for a live model via MCP/A2A
with no change to the harness. The harness itself enforces the governance: an agent
**cannot** bid below its mandate floor or the reserve; the auctioneer's close is a pure
function of the standing bids and the published rules.

## Files

```
auction/
├── auction.json           the reverse auction and its deterministic rules
├── bidders.json           two bidders, each an agent with a sealed mandate floor
├── reasoner.js            the pluggable "Models": bidding agent + auctioneer (deterministic)
├── auction-runtime.js     the neutral "Harness": round loop, mandate enforcement, close, events
├── run-auction.js         runs the scenario, narrates it, verifies conformance + determinism
└── output/                generated Auction, Bids, Decision, Award, Events
```

Depends on the auction extension schemas (`schema/auction.schema.json`,
`schema/bid.schema.json`).
