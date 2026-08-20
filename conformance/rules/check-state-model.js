#!/usr/bin/env node
/**
 * check-state-model.js — registry consistency and the basis rule.
 *
 * Ten checks. The basis rule (C7) is the neutrality control: every core
 * transition must be justifiable from a source other than any single
 * implementer. It runs on every push; that is what makes it a control
 * rather than an intention.
 *
 * Usage: node conformance/rules/check-state-model.js [repoRoot]
 * Exit 0 = pass, 1 = fail.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : process.cwd();
const WRITE = process.argv.includes('--write');
const p = (...a) => path.join(ROOT, ...a);

const fail = [];
const warn = [];
const note = [];
const written = [];
const E = (code, msg) => fail.push(`[${code}] ${msg}`);
const W = (code, msg) => warn.push(`[${code}] ${msg}`);

// ---------------------------------------------------------------- load
let model;
try {
  model = JSON.parse(fs.readFileSync(p('state-model', 'state-model.json'), 'utf8'));
} catch (e) {
  console.error('cannot read state-model/state-model.json:', e.message);
  process.exit(1);
}

function readCodes(file) {
  const f = p('codelists', file);
  if (!fs.existsSync(f)) return null;
  return fs
    .readFileSync(f, 'utf8')
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((l) => l.split(',')[0].trim())
    .filter(Boolean);
}

const openCodes = readCodes('eventType.csv') || [];
const coreCodes = readCodes('eventTypeCore.csv') || [];
const allCodes = new Set([...openCodes, ...coreCodes]);

// Enum extraction: find the enum that is the object's declared state field.
function statesFromSchema(schemaRel, stateField) {
  const f = p(schemaRel);
  if (!fs.existsSync(f)) return null;
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  const prop = s.properties && s.properties[stateField];
  if (!prop || !Array.isArray(prop.enum)) return null;
  return prop.enum;
}

// Values that are relations or supersession markers, never states (§5).
const RELATION_VALUED = ['superseded', 'supersededBy', 'replaces', 'replacedBy', 'amends', 'amendedBy'];

const VALID_APPENDABLE = ['none', 'annotation', 'any'];
const VALID_CLASS = ['completion', 'abandonment', 'revocation'];

const basisSources = model.basisSources || {};
// A core entry may not rest on `inherited`; it is a review marker, not a justification.
const CORE_FORBIDDEN_BASIS = ['inherited'];

// ---------------------------------------------------------------- checks
let modelled = 0;
let lifecycleCount = 0;

for (const o of model.objects) {
  const tag = o.object;

  if (o.lifecycle === false) {
    if (!o.rationale) E('C0', `${tag}: declared non-lifecycle without a rationale`);
    note.push(`${tag}: declared non-lifecycle — ${(o.rationale || '').slice(0, 60)}…`);
    continue;
  }
  lifecycleCount++;

  if (o.modelled === false) {
    if (!o.rationale) E('C0', `${tag}: declared unmodelled without a rationale`);
    note.push(`${tag}: lifecycle-bearing, not yet modelled`);
    continue;
  }
  modelled++;

  const declared = Object.keys(o.states || {});
  const schemaEnum = statesFromSchema(o.schema, o.stateField);

  // C1 — R-1 lint, applied to the REGISTRY. The registry is the record, so a relation-valued
  // name must be caught where it is authored, not where it is generated.
  for (const st of declared)
    if (RELATION_VALUED.includes(st))
      E('C1', `${tag}.${st} is a relation, not a state — express as an annotation entry (§5 R-1)`);

  // C2 — GENERATION. schema enum ← registry states. Drift is a failure, not a negotiation.
  // Only where the registry actually declares states: an unmodelled object's vocabulary is
  // not ours to overwrite.
  if (schemaEnum === null) {
    W('C2', `${tag}: could not read ${o.stateField} from ${o.schema}`);
  } else {
    const same = schemaEnum.length === declared.length && schemaEnum.every((v, i) => v === declared[i]);
    if (!same) {
      if (WRITE) {
        const file = p(o.schema);
        const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
        doc.properties[o.stateField].enum = declared.slice();
        fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
        written.push(`${o.schema} /properties/${o.stateField} ← registry (${declared.length} states)`);
      } else {
        const missing = declared.filter((x) => !schemaEnum.includes(x));
        const extra = schemaEnum.filter((x) => !declared.includes(x));
        E('C2', `${tag}: ${o.schema} ${o.stateField} has drifted from the registry — missing [${missing}] extra [${extra}]${!missing.length && !extra.length ? ' (order differs)' : ''}`);
      }
    }
  }

  // C3 — state property hygiene.
  for (const [st, meta] of Object.entries(o.states || {})) {
    if (!VALID_APPENDABLE.includes(meta.appendable)) E('C3', `${tag}.${st}: appendable must be one of ${VALID_APPENDABLE.join('|')}`);
    if (meta.terminal && !VALID_CLASS.includes(meta.class)) E('C3', `${tag}.${st}: terminal state needs class ${VALID_CLASS.join('|')}`);
    if (!meta.terminal && meta.class) E('C3', `${tag}.${st}: non-terminal state must not carry a class`);
    if (meta.terminal && meta.appendable === 'any') W('C3', `${tag}.${st}: terminal but fully appendable — intended?`);
  }

  const entries = o.entries || [];
  const creations = entries.filter((e) => e.kind === 'creation');
  const transitions = entries.filter((e) => e.kind === 'transition');
  const annotations = entries.filter((e) => e.kind === 'annotation');

  // C4 — exactly one creation entry.
  if (creations.length !== 1) E('C4', `${tag}: expected exactly one creation entry, found ${creations.length}`);

  // C5 — from/to resolve; terminal states have no outgoing transition.
  for (const t of transitions) {
    if (!declared.includes(t.to)) E('C5', `${t.id}: to "${t.to}" is not a declared state`);
    for (const f of t.from || []) {
      if (!declared.includes(f)) E('C5', `${t.id}: from "${f}" is not a declared state`);
      else if (o.states[f].terminal) E('C5', `${t.id}: originates from terminal state "${f}"`);
    }
  }
  for (const a of annotations) {
    for (const s of a.permittedIn || []) {
      if (!declared.includes(s)) E('C5', `${a.id}: permittedIn "${s}" is not a declared state`);
      else if (o.states[s].appendable === 'none') E('C5', `${a.id}: permitted in "${s}" which accepts no appended events`);
    }
  }

  // C6 — determinism: entries sharing an eventType must have disjoint `from` sets.
  const byCode = {};
  for (const t of transitions) (byCode[t.eventType] = byCode[t.eventType] || []).push(t);
  for (const [code, ts] of Object.entries(byCode)) {
    if (ts.length < 2) continue;
    const seen = new Map();
    for (const t of ts)
      for (const f of t.from || []) {
        if (seen.has(f)) E('C6', `${tag}: "${code}" is ambiguous from "${f}" (${seen.get(f)} and ${t.id})`);
        seen.set(f, t.id);
      }
  }

  // C7 — THE BASIS RULE.
  for (const e of entries) {
    if (!e.basis) {
      E('C7', `${e.id}: no basis. Every entry must name an external justification, or move to a profile.`);
      continue;
    }
    if (!basisSources[e.basis]) E('C7', `${e.id}: basis "${e.basis}" is not a declared source in basisSources`);
    if (o.layer === 'core' && CORE_FORBIDDEN_BASIS.includes(e.basis))
      W('C7', `${e.id}: core entry resting on "${e.basis}" — needs a real source or moves to a profile`);
  }

  // C8 — every event code the registry names exists in a codelist.
  for (const e of entries) {
    if (!allCodes.has(e.eventType)) E('C8', `${e.id}: eventType "${e.eventType}" is in no codelist`);
  }

  // C11 — terminal reachability. Every lifecycle-bearing object must have at least one
  // terminal state, and every non-terminal state must be able to reach one. Distinct from
  // C9: C9 asks whether a state can be entered, C11 whether an object can end.
  const terminals = declared.filter((st) => o.states[st].terminal);
  if (terminals.length === 0) {
    E('C11', `${tag}: no terminal state — the object can never end`);
  } else {
    const canEnd = new Set(terminals);
    let g2 = true;
    while (g2) {
      g2 = false;
      for (const t of transitions)
        if (canEnd.has(t.to))
          for (const f of t.from || [])
            if (!canEnd.has(f)) { canEnd.add(f); g2 = true; }
    }
    for (const st of declared)
      if (!canEnd.has(st)) E('C11', `${tag}.${st} cannot reach any terminal state`);
  }

  // C13 — an edge requiring recorded authority must name how it is evidenced.
  for (const t of transitions)
    if (t.requiresAuthority && !t.decisionType)
      E('C13', `${t.id}: requiresAuthority with no decisionType — the authority is asserted, not recorded`);

  // C9 — reachability from creation.
  const reach = new Set([creations[0] && creations[0].to].filter(Boolean));
  let grew = true;
  while (grew) {
    grew = false;
    for (const t of transitions)
      if ((t.from || []).some((f) => reach.has(f)) && !reach.has(t.to)) {
        reach.add(t.to);
        grew = true;
      }
  }
  for (const st of declared) if (!reach.has(st)) E('C9', `${tag}.${st} is unreachable from creation`);
}

// C12 — REGISTRY COMPLETENESS. docs/state-model.md L-2: every object is declared
// lifecycle-bearing or not. Statelessness by omission is a defect; statelessness by
// declaration is a decision with a rationale.
try {
  const schemaDir = p('schema');
  const onDisk = fs.readdirSync(schemaDir).filter((f) => f.endsWith('.schema.json'));
  const inRegistry = new Set(model.objects.map((o) => path.basename(o.schema)));
  for (const f of onDisk)
    if (!inRegistry.has(f)) E('C12', `schema/${f} has no declaration in the registry`);
  for (const o of model.objects)
    if (!onDisk.includes(path.basename(o.schema))) W('C12', `${o.object}: declared against ${o.schema}, which is not present`);
} catch (e) {
  W('C12', `could not enumerate schema/: ${e.message}`);
}

// C14 — BASIS SCOPE (B-3). Externality is not generality. A jurisdictional or sector
// instrument justifies a profile entry; a core entry needs a source holding across the
// jurisdictions core claims to serve.
const SCOPE = model.basisScope || {};
for (const o of model.objects) {
  if (o.layer !== 'core') continue;
  for (const e of o.entries || []) {
    if (e.basisScope === 'jurisdictional' && !e.corroboratingBasis)
      W('C14', `${e.id}: core entry on a jurisdictional basis ("${e.basis}") with no corroborating general source`);
    if (e.basisScope === 'implementer')
      E('C14', `${e.id}: core entry on an implementer basis — must move to a profile`);
  }
}

// C15 — no schema location may be generated from two records. State vocabularies come from
// the registry; closed codelists come from their CSV. An overlap would reintroduce the very
// defect generation exists to remove.
try {
  const bindings = JSON.parse(fs.readFileSync(p('codelists', 'bindings.json'), 'utf8'));
  const csvTargets = new Set((bindings.closed || []).filter((b) => b.schema).map((b) => `${b.schema}${b.pointer}`));
  for (const o of model.objects) {
    if (!o.lifecycle || o.modelled === false || !o.stateField) continue;
    const t = `${o.schema}/properties/${o.stateField}`;
    if (csvTargets.has(t)) E('C15', `${t} is generated from both the registry and a closed codelist`);
  }
} catch (e) {
  W('C15', `could not read codelists/bindings.json: ${e.message}`);
}

// C10 — no orphan core event codes: every closed core code is registry-known or grant-lifecycle.
const registryCodes = new Set();
for (const o of model.objects) for (const e of o.entries || []) registryCodes.add(e.eventType);
const GRANT_LIFECYCLE = ['consent.granted', 'consent.revoked', 'mandate.granted', 'mandate.revoked'];
for (const c of coreCodes) {
  if (!registryCodes.has(c) && !GRANT_LIFECYCLE.includes(c))
    W('C10', `closed core code "${c}" maps to no registry entry`);
}

// ---------------------------------------------------------------- report
console.log(`\nSIGNET state-model check — ${modelled}/${lifecycleCount} lifecycle-bearing objects modelled\n`);
if (WRITE && written.length) { console.log('Generated:'); written.forEach((w) => console.log('  ✎', w)); console.log(''); }
for (const n of note) console.log('  ·', n);
if (warn.length) {
  console.log('\nWarnings:');
  for (const w of warn) console.log('  !', w);
}
if (fail.length) {
  console.log('\nFailures:');
  for (const f of fail) console.log('  ✗', f);
  console.log(`\n${fail.length} failure(s).\n`);
  process.exit(1);
}
console.log(`\nPass${warn.length ? ` (${warn.length} warning(s))` : ''}.\n`);
process.exit(0);
