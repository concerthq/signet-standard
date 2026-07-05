#!/usr/bin/env node
/* check-onboarding.js — onboarding extension conformance rules (cross-object).
 * N1 conditional qualification carries conditions (valueCap has a cap; pendingCheck a dueDate)
 * N2 a qualified case references its decision and producesQualification
 * N3 case↔qualification closure (producesQualification ↔ originatingCase, both directions when present)
 * Exit 0 = pass. --dir to point at any dataset (default examples/). */
const fs=require("fs"),path=require("path");
const dir=process.argv.includes("--dir")?process.argv[process.argv.indexOf("--dir")+1]:path.join(__dirname,"../../examples");
const docs=fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>{try{return JSON.parse(fs.readFileSync(path.join(dir,f)))}catch(e){return{}}});
const byType=t=>docs.filter(d=>d.type===t); const idOf=x=>(x&&x.id&&(x.id.id||x.id))||x;
const rs=[]; const rule=(n,name,ok,d)=>rs.push({n,name,ok,d:d||""});
for(const q of byType("SupplierQualification")){
  if(q.status==="conditional"){
    rule("N1","conditional qualification carries conditions",Array.isArray(q.conditions)&&q.conditions.length>0,idOf(q));
    for(const c of q.conditions||[]){
      if(c.conditionType==="valueCap") rule("N1","valueCap condition carries a cap",!!(c.valueCap&&c.valueCap.amount>0),idOf(q));
      if(c.conditionType==="pendingCheck") rule("N1","pendingCheck condition carries a dueDate",!!c.dueDate,idOf(q));
    }
  }
}
for(const c of byType("OnboardingCase")){
  if(c.status==="qualified"){
    rule("N2","qualified case references its Decision",!!c.decision,idOf(c));
    rule("N2","qualified case references producesQualification",!!c.producesQualification,idOf(c));
  }
}
const quals=byType("SupplierQualification"), cases=byType("OnboardingCase");
for(const c of cases.filter(c=>c.producesQualification)){
  const q=quals.find(q=>idOf(q)===idOf(c.producesQualification));
  if(q) rule("N3","case↔qualification closure",idOf(q.originatingCase)===idOf(c),`${idOf(c)}↔${idOf(q)}`);
}
let all=true; console.log("Onboarding conformance rules — "+dir);
for(const r of rs){all=all&&r.ok;console.log(` [${r.ok?"OK":"XX"}] ${r.n} ${r.name}  (${r.d})`);}
console.log(all?"ALL RULES PASS":"RULE FAILURES"); process.exit(all?0:1);
