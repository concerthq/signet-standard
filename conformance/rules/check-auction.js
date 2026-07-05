#!/usr/bin/env node
/* check-auction.js — auction extension conformance rules (cross-object).
 * A1 exactly one winning Bid per closed Auction
 * A2 the recorded winner IS the deterministic close (reverse: lowest; forward: highest)
 *    — the data-level statement of "any conformant operator reaches the same result"
 * A3 every bid respects the reserve (reverse: >= reservePrice) and references its Auction
 * Exit 0 = pass. --dir to point at any dataset. */
const fs=require("fs"),path=require("path");
const dir=process.argv.includes("--dir")?process.argv[process.argv.indexOf("--dir")+1]:path.join(__dirname,"../../examples");
const docs=fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>{try{return JSON.parse(fs.readFileSync(path.join(dir,f)))}catch(e){return{}}});
const byType=t=>docs.filter(d=>d.type===t); const idOf=x=>(x&&x.id&&(x.id.id||x.id))||x;
const rs=[]; const rule=(n,name,ok,d)=>rs.push({n,name,ok,d:d||""});
for(const a of byType("Auction").filter(a=>a.status==="closed")){
  const bids=byType("Bid").filter(b=>idOf(b.auction)===idOf(a));
  if(!bids.length) continue;
  const winners=bids.filter(b=>b.status==="winning");
  rule("A1","exactly one winning Bid",winners.length===1,idOf(a));
  const lowerWins=a.auctionType==="reverse"||a.auctionType==="dutch";
  const standing=bids.filter(b=>["winning","active"].includes(b.status));
  const best=standing.reduce((m,b)=>!m||(lowerWins?b.value.amount<m.value.amount:b.value.amount>m.value.amount)?b:m,null);
  if(winners.length===1&&best) rule("A2","recorded winner equals the deterministic close",idOf(winners[0])===idOf(best),`${idOf(a)}: ${best.value.amount}`);
  const reserve=a.rules&&a.rules.reservePrice&&a.rules.reservePrice.amount;
  if(reserve!=null) for(const b of bids)
    rule("A3","bid respects the reserve",lowerWins?b.value.amount>=reserve:b.value.amount<=reserve,`${idOf(b)}: ${b.value.amount} vs ${reserve}`);
}
for(const b of byType("Bid"))
  rule("A3","bid references an Auction in the dataset",byType("Auction").some(a=>idOf(a)===idOf(b.auction)),idOf(b));
let all=true; console.log("Auction conformance rules — "+dir);
for(const r of rs){all=all&&r.ok;console.log(` [${r.ok?"OK":"XX"}] ${r.n} ${r.name}  (${r.d})`);}
console.log(all?"ALL RULES PASS":"RULE FAILURES"); process.exit(all?0:1);
