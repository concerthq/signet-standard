// reasoner.js — the pluggable reasoning for the reverse-auction demo.
//
// Two roles, both deterministic by default (so the demo runs offline and identically
// in CI), both swappable for a live model at the invoke() seam with no change to the
// harness:
//   • biddingReasoner  — each supplier's agent decides its next bid within its mandate.
//   • auctioneer       — the neutral close: rank standing bids per the auction rules.
//
// All arithmetic is on integer minor-unit amounts, so the close is exactly reproducible.

const deterministicBiddingReasoner = {
  kind: "deterministic",
  // Tool: next.bid — undercut the current best by one step, unless winning or floored.
  // input: { me, currentBestBidder, currentBest(amount), minStep(amount), floor(amount) }
  // output: { action: "bid"|"pass", value?, reason }
  invoke(tool, input) {
    if (tool !== "next.bid") throw new Error(`unknown tool ${tool}`);
    const { me, currentBestBidder, currentBest, minStep, floor } = input;
    if (currentBestBidder === me) return { action: "pass", reason: "currently winning" };
    const target = currentBest - minStep;               // reverse auction: go lower
    if (target >= floor) return { action: "bid", value: target, reason: `undercut to ${target}` };
    return { action: "pass", reason: "mandate floor reached" };
  },
};

const deterministicAuctioneer = {
  kind: "deterministic",
  // Tool: close.auction — rank standing bids and pick the winner per auctionType.
  // input: { auctionType, tieBreak, standingBids:[{bidder, amount, order}] }
  // output: { winner, winningAmount, ranking, rationale }
  invoke(tool, input) {
    if (tool !== "close.auction") throw new Error(`unknown tool ${tool}`);
    const { auctionType, tieBreak, standingBids } = input;
    const lowerWins = auctionType === "reverse" || auctionType === "dutch";
    const cmp = (a, b) => (a.amount !== b.amount)
      ? (lowerWins ? a.amount - b.amount : b.amount - a.amount)
      : (tieBreak === "earliest-bid" ? a.order - b.order : 0);   // deterministic tie-break
    const ranking = [...standingBids].sort(cmp);
    const win = ranking[0];
    const rationale =
      `Reverse auction closed on no-improvement. Lowest standing bid wins: ` +
      `${short(win.bidder)} at ${win.amount.toLocaleString("en-GB")} EUR. ` +
      `Runner-up ${ranking[1] ? short(ranking[1].bidder) + " at " + ranking[1].amount.toLocaleString("en-GB") : "none"}.`;
    return { winner: win.bidder, winningAmount: win.amount, ranking, rationale };
  },
};

// ---- MODEL SEAM ---------------------------------------------------------------
// A live bidding agent (or auctioneer) implements the same invoke(tool,input) contract
// calling a model via MCP/A2A, constrained to these output shapes. The harness — round
// loop, mandate-floor enforcement, event-chaining, provenance, the deterministic close
// and its verification — is unchanged.
// -------------------------------------------------------------------------------

function short(did) { return (did || "").split("#").pop(); }

module.exports = { deterministicBiddingReasoner, deterministicAuctioneer, short };
