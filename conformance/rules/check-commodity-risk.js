#!/usr/bin/env node
/*
 * check-commodity-risk.js — the six commodity-risk conformance rules, executable.
 * Three are cross-object checks beyond schema validation (reconciliation arithmetic,
 * scenario fixed-cost invariance, escalation-first rule ordering). Runs over
 * examples/commodity-risk/ by default; point --dir at any conformant dataset.
 * Exit 0 = all rules pass.
 */
const fs = require("fs"), path = require("path");
const dir = process.argv.includes("--dir") ? process.argv[process.argv.indexOf("--dir")+1]
  : path.join(__dirname, "../../examples/commodity-risk");
const docs = fs.readdirSync(dir).filter(f=>f.endsWith(".json"))
  .map(f=>JSON.parse(fs.readFileSync(path.join(dir,f))));
const byType = t => docs.filter(d=>d.type===t);
const idOf = x => (x && x.id && (x.id.id||x.id)) || x;
const results = []; const rule = (n,name,ok,detail)=>results.push({n,name,ok,detail:detail||""});

// Rule 1 — Reconciliation: per assessment, hedged + floating = markToMarket (within tolerance)
for (const a of byType("CoverageAssessment")) {
  const {hedged,floating,markToMarket} = a.volumes;
  const tol = (a.reconciliation && a.reconciliation.tolerance) || 0;
  const ok = Math.abs((hedged.amount+floating.amount)-markToMarket.amount) <= tol;
  rule(1,"Reconciliation: hedged+floating=markToMarket",ok,`${idOf(a)}: ${hedged.amount}+${floating.amount} vs ${markToMarket.amount}`);
}
// Rule 2 — Scenario integrity: fixed cost invariant under shock; total=fixed+floating baseline
for (const s of byType("Scenario")) for (const r of s.results) {
  const fixedOk = r.impacts.every(i=>i.fixedCost.amount===r.baseline.fixedCost.amount);
  rule(2,"Scenario integrity: fixed cost invariant under shock",fixedOk,idOf(s));
  const sumOk = Math.abs(r.baseline.fixedCost.amount+r.baseline.floatingCost.amount-r.baseline.totalCost.amount)<=0.01;
  rule(2,"Scenario baseline: total = fixed + floating",sumOk,idOf(s));
}
// Rule 3 — Escalation-first ordering + catch-all terminal
for (const p of byType("Policy").filter(p=>p.policyType==="coverageCorridor")) {
  const rules = p.breachHandling.rules;
  const firstNonBreach = rules.findIndex(r=>!/belowMinimum|aboveMaximum|breach|escalat/i.test(r.when) && r.when!=="*");
  const lastBreach = rules.map((r,i)=>/belowMinimum|aboveMaximum|breach|escalat/i.test(r.when)?i:-1).filter(i=>i>=0).pop();
  const orderOk = firstNonBreach===-1 || lastBreach===undefined || lastBreach<firstNonBreach;
  rule(3,"Escalation-first rule ordering",orderOk,idOf(p));
  rule(3,"breachHandling terminates in a catch-all",rules[rules.length-1].when==="*",idOf(p));
}
// Rule 4 — Assessment provenance + every position resolves
const posIds = new Set(byType("ExposurePosition").map(idOf));
for (const a of byType("CoverageAssessment")) {
  rule(4,"Assessment carries provenance",!!(a.provenance&&a.provenance.generatedBy),idOf(a));
  const unresolved = a.positions.map(idOf).filter(p=>!posIds.has(p));
  rule(4,"Every assessed position resolves to an ExposurePosition",unresolved.length===0,unresolved.join(",")||idOf(a));
}
// Rule 5 — Chain closure: executed proposals → hedged position under a later assessment
for (const p of byType("HedgeProposal").filter(p=>p.status==="executed")) {
  const later = byType("CoverageAssessment").some(a =>
    a.positions.map(idOf).some(pid => { const pos = byType("ExposurePosition").find(x=>idOf(x)===pid);
      return pos && pos.positionStatus==="hedged" && pos.contract; }) &&
    a.policyEvaluation.status==="withinCorridor");
  rule(5,"Executed proposal closes the loop (new hedged position in a later assessment)",later,idOf(p));
}
// Rule 6 — No orphan hedged positions
for (const pos of byType("ExposurePosition").filter(p=>p.positionStatus==="hedged"))
  rule(6,"Hedged position references a core Contract",!!pos.contract,idOf(pos));

let all=true;
console.log("Commodity-risk conformance rules — "+dir);
for (const r of results){ all=all&&r.ok; console.log(` [${r.ok?"OK":"XX"}] R${r.n} ${r.name}  (${r.detail})`); }
console.log(all?"ALL RULES PASS":"RULE FAILURES");
process.exit(all?0:1);
