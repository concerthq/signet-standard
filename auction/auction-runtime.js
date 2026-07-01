// auction-runtime.js — the neutral SIGNET auction harness.
//
// Runs a reverse auction as a governed, multi-party process: two bidding agents (each
// bound by its own Mandate floor) undercut over rounds; the harness enforces that no
// agent can bid below its mandate; the auction closes deterministically on
// no-improvement; a neutral auctioneer picks the winner; and the whole sequence is a
// hash-chained Event trail closed by an Award Decision. Price formation lives here, in
// the standard layer — not in any operator.
const fs = require("fs");
const path = require("path");
const { eventHash } = require("../conformance/runner/lib.js");
const { short } = require("./reasoner.js");

const DIR = __dirname;
const rd = (p) => JSON.parse(fs.readFileSync(path.join(DIR, p), "utf8"));
const AUCTIONEER = { scheme: "did", id: "did:web:buyer.example#auctioneer" };
const TS = "2026-07-01T09:00:00Z";
const CUR = "EUR";
const AUTONOMOUS_AWARD_CEILING = 10000000; // awards above this need human approval
const prov = (derivedFrom = [], usedPolicies = []) => ({
  generatedBy: AUCTIONEER, generatedAt: TS,
  ...(derivedFrom.length ? { derivedFrom } : {}),
  ...(usedPolicies.length ? { usedPolicies } : {}),
});
const money = (a) => ({ amount: a, currency: CUR });
const fmt = (a) => `${a.toLocaleString("en-GB")} EUR`;

function runScenario({ biddingReasoner, auctioneer }) {
  const trace = [];
  const log = (s) => trace.push(s);
  const auction = rd("auction.json");
  const { bidders } = rd("bidders.json");
  const rules = auction.rules;
  const minStep = rules.minStep.amount;
  const startPrice = rules.startPrice.amount;
  const reserve = rules.reservePrice.amount;

  const events = [];
  const emit = (eventType, subject, payload) => {
    const e = { type: "Event", id: { scheme: "did", id: `did:web:buyer.example#aevt-${events.length + 1}` },
      eventType, subject: { scheme: "did", id: subject }, actor: AUCTIONEER, timestamp: TS, payload, provenance: prov() };
    if (events.length) e.previousEventHash = eventHash(events[events.length - 1]);
    events.push(e);
  };

  log(`Reverse auction ${short(auction.id.id)} opens. Start ${fmt(startPrice)}, reserve ${fmt(reserve)}, step ${fmt(minStep)}, close on no-improvement.`);
  log(`Bidders (each a governed agent, mandate floor sealed): ${bidders.map(b => short(b.party.id)).join(", ")}.`);
  emit("auction.opened", auction.id.id, { startPrice, reserve });

  // State: each bidder's standing bid amount + the order (for tie-break) + a Bid record.
  const state = bidders.map((b, i) => ({ b, me: b.party.id, floor: b.floor.amount, standing: null, order: i, lastRound: 0 }));
  const bidRecords = [];
  let bestOf = () => {
    const bids = state.filter(s => s.standing != null);
    if (!bids.length) return { amount: startPrice, bidder: null };
    return bids.reduce((m, s) => s.standing < m.amount ? { amount: s.standing, bidder: s.me } : m, { amount: Infinity, bidder: null });
  };

  // Round 1: opening bids (given), enforced against mandate floor + reserve.
  let round = 1;
  log(`— Round 1 (openings) —`);
  for (const s of state) {
    const open = s.b.opening.amount;
    if (open < s.floor) throw new Error("harness: opening below mandate floor rejected");
    s.standing = open; s.lastRound = 1;
    recordBid(s, 1);
    log(`   ${short(s.me)} opens at ${fmt(open)}.`);
  }

  // Subsequent rounds: agents undercut within mandate until a full round has no improvement.
  let improvedLastRound = true;
  while (improvedLastRound && round < rules.maxRounds) {
    round += 1;
    improvedLastRound = false;
    log(`— Round ${round} —`);
    for (const s of state) {
      const best = bestOf();
      const out = biddingReasoner.invoke("next.bid", {
        me: s.me, currentBestBidder: best.bidder, currentBest: best.amount, minStep, floor: s.floor,
      });
      if (out.action === "bid") {
        // Harness enforces mandate + reserve — an agent CANNOT bid below either.
        if (out.value < s.floor) { log(`   ${short(s.me)} blocked: bid below mandate floor.`); continue; }
        if (out.value < reserve) { log(`   ${short(s.me)} blocked: bid below reserve.`); continue; }
        s.standing = out.value; s.lastRound = round;
        recordBid(s, round);
        improvedLastRound = true;
        log(`   ${short(s.me)} bids ${fmt(out.value)}.`);
      } else {
        log(`   ${short(s.me)} passes (${out.reason}).`);
      }
    }
    if (!improvedLastRound) log(`   No improvement — auction closes.`);
  }

  function recordBid(s, r) {
    const bid = {
      "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
      type: "Bid",
      id: { scheme: "did", id: `did:web:buyer.example#bid-${short(auction.id.id)}-${short(s.me)}-r${r}` },
      auction: auction.id, bidder: s.b.party, qualification: s.b.qualification,
      round: r, value: money(s.standing), submittedAt: TS, status: "active",
    };
    bidRecords.push(bid);
    emit("bid.placed", auction.id.id, { bidder: s.me, round: r, value: s.standing });
  }

  emit("auction.closed", auction.id.id, { rounds: round });

  // The neutral close — deterministic winner from the standing bids.
  const standingBids = state.map(s => ({ bidder: s.me, amount: s.standing, order: s.order }));
  const close = auctioneer.invoke("close.auction", { auctionType: auction.auctionType, tieBreak: rules.tieBreak, standingBids });
  log(`Close: ${close.rationale}`);
  const winnerState = state.find(s => s.me === close.winner);
  const looser = state.find(s => s.me !== close.winner);
  log(`Note: the winning price ${fmt(close.winningAmount)} is set where the runner-up's mandate stopped — ${short(looser.me)} passed at floor ${fmt(looser.floor)}; the winner never revealed its own floor.`);

  // Governance gate on the award (reuse of the mandate-ceiling pattern).
  const requiresHuman = close.winningAmount > AUTONOMOUS_AWARD_CEILING;
  let humanApproval = null;
  if (requiresHuman) { humanApproval = { scheme: "did", id: "did:web:buyer.example#approval-auc-55" };
    log(`Award ${fmt(close.winningAmount)} exceeds the €10M autonomous ceiling → human approval ${short(humanApproval.id)} required.`); }

  // Mark the winning bid.
  const winningBid = [...bidRecords].reverse().find(b => b.bidder.id === close.winner);
  winningBid.status = "winning";

  const decision = {
    "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
    type: "Decision",
    id: { scheme: "did", id: "did:web:buyer.example#decision-auc-3310" },
    decisionType: "award",
    madeBy: AUCTIONEER,
    inputs: bidRecords.map(b => b.id),
    rationale: close.rationale,
    outcome: { awardedBid: winningBid.id, awardedParty: close.winner, value: money(close.winningAmount), ranking: close.ranking.map(r => ({ bidder: r.bidder, value: r.amount })) },
    provenance: prov(bidRecords.map(b => b.id)),
  };
  if (humanApproval) decision.humanApproval = humanApproval;
  emit("decision.made", decision.id.id, { awarded: close.winner, value: close.winningAmount });

  const award = {
    "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
    type: "Award",
    id: { scheme: "did", id: "did:web:buyer.example#award-auc-3310" },
    sourcingEvent: auction.sourcingEvent,
    awardedParty: winnerState.b.party,
    value: money(close.winningAmount),
    rationale: close.rationale,
    decision: decision.id,
    standstillPeriod: { startDate: "2026-07-02T00:00:00Z", endDate: "2026-07-12T00:00:00Z" },
  };
  emit("award.decided", award.id.id, { awardedParty: close.winner });
  log(`Award ${short(award.id.id)} → ${short(close.winner)} at ${fmt(close.winningAmount)}. Buyer saved ${fmt(startPrice - close.winningAmount)} off the start price.`);
  log(`Event stream: ${events.length} events, hash-chained.`);

  const closedAuction = { ...auction, status: "closed" };
  return { auction: closedAuction, bids: bidRecords, winningBid, decision, award, events, close, requiresHuman, trace };
}

module.exports = { runScenario };
