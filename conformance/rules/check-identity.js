#!/usr/bin/env node
/* check-identity.js — identity profile conformance rules (SIGNET Full level).
 * I1 approver identifiers are pseudonymous (no PII markers)
 * I2 authorityCredential is a delegationOfAuthority carrying an authority basis
 * I3 resolvability: a Decision's humanApproval resolves to an Approval, and that
 *    Approval points back at the Decision (Full requires resolvable Approvals)
 * I4 authority sufficiency: where both a ceiling and a decided value are present,
 *    ceiling >= value
 * Exit 0 = pass. --dir to point at any dataset. */
const fs=require("fs"),path=require("path");
const dir=process.argv.includes("--dir")?process.argv[process.argv.indexOf("--dir")+1]:path.join(__dirname,"../../examples");
const docs=fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>{try{return JSON.parse(fs.readFileSync(path.join(dir,f)))}catch(e){return{}}});
const byType=t=>docs.filter(d=>d.type===t); const idOf=x=>(x&&x.id&&(x.id.id||x.id))||x;
const rs=[]; const rule=(n,name,ok,d)=>rs.push({n,name,ok,d:d||""});
const approvals=byType("Approval");
for(const ap of approvals){
  const aid=idOf(ap.approver);
  rule("I1","approver identifier is pseudonymous (no PII markers)",!/@|\s|name=|email/i.test(aid),aid);
  const cred=ap.authorityCredential||{};
  rule("I2","authorityCredential is delegationOfAuthority",(cred.type||[]).includes("delegationOfAuthority"),idOf(ap));
  const cs=cred.credentialSubject||{};
  rule("I2","authority basis present (band or ceiling)",!!(cs.authorityBand||cs.approvalCeiling),idOf(ap));
  const dec=byType("Decision").find(d=>idOf(d)===idOf(ap.decision));
  if(dec) rule("I3","Approval points at a Decision that points back",idOf(dec.humanApproval||{})===idOf(ap),idOf(ap));
}
for(const d of byType("Decision").filter(d=>d.humanApproval)){
  const ap=approvals.find(a=>idOf(a)===idOf(d.humanApproval));
  rule("I3","Decision.humanApproval resolves to an Approval (Full)",!!ap,idOf(d));
  if(ap){
    const ceil=ap.authorityCredential&&ap.authorityCredential.credentialSubject&&ap.authorityCredential.credentialSubject.approvalCeiling;
    const val=(d.outcome&&d.outcome.value&&d.outcome.value.amount);
    if(ceil&&val!=null) rule("I4","approver's ceiling covers the decided value",ceil.amount>=val,`${ceil.amount} >= ${val}`);
  }
}
let all=true; console.log("Identity (Full) conformance rules — "+dir);
for(const r of rs){all=all&&r.ok;console.log(` [${r.ok?"OK":"XX"}] ${r.n} ${r.name}  (${r.d})`);}
console.log(all?"ALL RULES PASS":"RULE FAILURES"); process.exit(all?0:1);
