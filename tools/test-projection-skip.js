#!/usr/bin/env node
/*
 * test-projection-skip.js — guard for the ViDA convertibility claim.
 *
 * Invoice.settles is SIGNET-original and carries no EN 16931 Business Term, so
 * it MUST NOT appear in the Peppol BIS / UBL projection. This proves it by
 * projecting the same invoice with and without `settles` and asserting the two
 * UBL outputs are byte-identical. A future mapping change that leaks `settles`
 * into UBL fails here loudly.
 *
 * Run: node tools/test-projection-skip.js   (or: npm run test:projection-skip)
 * Licensed CC0 1.0 by Concert Foundation.
 */
const fs = require("fs");
const path = require("path");
const { toUBL } = require("./signet-to-ubl.js");

const fixture = path.join(__dirname, "..", "examples", "invoice.settles.fixture.json");
const withSettles = JSON.parse(fs.readFileSync(fixture, "utf8"));

if (!Array.isArray(withSettles.settles) || withSettles.settles.length === 0) {
  console.error("FAIL  fixture must carry a non-empty `settles` array to be a meaningful guard");
  process.exit(1);
}

const without = JSON.parse(JSON.stringify(withSettles));
delete without.settles;

const a = toUBL(withSettles);
const b = toUBL(without);

if (a !== b) {
  console.error("FAIL  REGRESSION: `settles` leaked into the Peppol BIS / UBL projection.");
  console.error("      Invoice.settles is SIGNET-original (no EN 16931 BT) and must be projection-invisible.");
  process.exit(1);
}

console.log("PASS  settles is projection-invisible — ViDA convertibility preserved.");
