#!/usr/bin/env node
/*
 * run-auction.js — run the SIGNET reverse-auction demonstration and verify it.
 *
 * A governed, multi-party reverse auction: two bidding agents (each bound by a private
 * Mandate floor) undercut over rounds; a neutral auctioneer closes deterministically;
 * the result is a conformance-clean Award over a hash-chained bid trail. The signature
 * auction check: RE-RUNNING the close reaches the identical Award — i.e. any conformant
 * operator closing the same bids under the same rules reaches the same result.
 * Exit 0 if conformant, 1 otherwise.
 */
const fs = require("fs");
const path = require("path");
const { loadSchemas, validateDoc, verifyChain, stableStringify } = require("../conformance/runner/lib.js");
const { runScenario } = require("./auction-runtime.js");
const { deterministicBiddingReasoner, deterministicAuctioneer } = require("./reasoner.js");

const OUT = path.join(__dirname, "output");
const reasoners = () => ({ biddingReasoner: deterministicBiddingReasoner, auctioneer: deterministicAuctioneer });

function main() {
  const r = runScenario(reasoners());

  console.log("\n" + "=".repeat(72));
  console.log("  SIGNET Reverse-Auction Demonstration — governed, multi-party close");
  console.log("  reasoners: deterministic (bidding agents + auctioneer, model-pluggable)");
  console.log("=".repeat(72));
  r.trace.forEach((line, i) => console.log(`  ${String(i + 1).padStart(2, " ")}. ${line}`));

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "auction.json"), JSON.stringify(r.auction, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "bids.json"), JSON.stringify(r.bids, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "decision.json"), JSON.stringify(r.decision, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "award.json"), JSON.stringify(r.award, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "events.json"), JSON.stringify(r.events, null, 2) + "\n");

  const { ajv, byFile } = loadSchemas();
  const checks = [];
  const check = (name, ok, detail) => checks.push({ name, ok, detail });

  const av = validateDoc(ajv, byFile, "auction.schema.json", r.auction);
  check("Auction validates (auction.schema.json)", av.ok, av.errors.slice(0, 2).join("; "));
  let bidOk = true, bidErr = "";
  for (const b of r.bids) { const v = validateDoc(ajv, byFile, "bid.schema.json", b); if (!v.ok) { bidOk = false; bidErr = v.errors[0]; } }
  check("Every Bid validates (bid.schema.json)", bidOk, bidErr);
  const wv = validateDoc(ajv, byFile, "award.schema.json", r.award);
  check("Award validates (award.schema.json)", wv.ok, wv.errors.slice(0, 2).join("; "));
  const dv = validateDoc(ajv, byFile, "decision.schema.json", r.decision);
  check("Award Decision validates (decision.schema.json)", dv.ok, dv.errors.slice(0, 2).join("; "));

  // The signature auction property: the close is DETERMINISTIC — re-run reaches the
  // identical award. This is "any conformant operator reaches the same result".
  const r2 = runScenario(reasoners());
  const same = stableStringify(r.award) === stableStringify(r2.award) &&
               stableStringify(r.decision.outcome) === stableStringify(r2.decision.outcome);
  check("Close is deterministic (re-run reaches the identical Award)", same, same ? "" : "award differed across runs");

  const chain = verifyChain(r.events);
  check("Bid+close Event stream is an unbroken hash chain", chain.ok, chain.ok ? `${r.events.length} events` : `broken at ${chain.brokenAt}`);
  check("Every event carries provenance", r.events.every(e => e.provenance && e.provenance.generatedBy), "");

  check("Exactly one winning Bid", r.bids.filter(b => b.status === "winning").length === 1, "");
  check("Award is governed (human approval where the ceiling is exceeded)", !r.requiresHuman || !!r.decision.humanApproval, "");

  const tampered = JSON.parse(JSON.stringify(r.events));
  const bp = tampered.find(e => e.eventType === "bid.placed");
  if (bp) bp.payload.value = 1;
  check("Tampering with a bid event is detected", !verifyChain(tampered).ok, "");

  console.log("\n  " + "-".repeat(68));
  console.log("  CONFORMANCE VERIFICATION OF THE AUCTION CLOSE");
  console.log("  " + "-".repeat(68));
  let allOk = true;
  for (const c of checks) { allOk = allOk && c.ok; console.log(`   [${c.ok ? "OK" : "XX"}] ${c.name}${c.detail ? "  (" + c.detail + ")" : ""}`); }
  console.log("  " + "-".repeat(68));
  console.log(`  RESULT: ${allOk ? "a GOVERNED, DETERMINISTIC, CONFORMANT auction close." : "NON-CONFORMANT."}`);
  console.log(`  Output written to auction/output/\n`);
  process.exit(allOk ? 0 : 1);
}
main();
