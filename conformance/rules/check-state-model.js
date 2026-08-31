#!/usr/bin/env node
/**
 * check-state-model.js — registry consistency and the basis rule.
 *
 * Fourteen checks. The basis rule (C7) is the neutrality control: every core
 * transition must be justifiable from a source other than any single
 * implementer. It runs on every push; that is what makes it a control
 * rather than an intention.
 *
 * C11 (terminal reachability), C12 (registry completeness), C13 (authority
 * evidence) and C14 (basis scope) were cited by CHANGELOG v0.16.0 and by the
 * D-15 and D-16 closures before they were written; see D-53.
 *
 * Usage: node conformance/rules/check-state-model.js [repoRoot]
 * Exit 0 = pass, 1 = fail.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || process.cwd();
const p = (...a) => path.join(ROOT, ...a);

const fail = [];
const warn = [];
const note = [];
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

  // C1 — every registry state exists in the schema enum.
  if (schemaEnum) {
    for (const st of declared) {
      if (!schemaEnum.includes(st)) E('C1', `${tag}.${st} is not in ${o.schema} ${o.stateField} enum`);
    }
    // C2 — every schema enum value is either a registry state or a known relation value.
    for (const st of schemaEnum) {
      if (declared.includes(st)) continue;
      if (RELATION_VALUED.includes(st)) {
        E('C2', `${tag}.${st} is a relation, not a state — remove from the schema enum and express as an annotation entry (§5)`);
      } else {
        E('C2', `${tag}.${st} is in the schema enum but absent from the registry`);
      }
    }
  } else {
    W('C1', `${tag}: could not read ${o.stateField} enum from ${o.schema}`);
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

  // C11 — terminal reachability (contributed; see CHANGELOG v0.16.0). Every lifecycle-bearing
  // object must have at least one terminal state, and every non-terminal state must be able to
  // reach one. Distinct from C9: C9 asks whether a state can be entered, C11 whether an object
  // can end. Objects with no declared states are skipped — statelessness is C0's business.
  if (declared.length) {
    const terminals = declared.filter((st) => o.states[st].terminal);
    if (terminals.length === 0) {
      E('C11', `${tag}: no terminal state — the object can never end`);
    } else {
      const canEnd = new Set(terminals);
      let growEnd = true;
      while (growEnd) {
        growEnd = false;
        for (const t of transitions)
          if (canEnd.has(t.to))
            for (const f of t.from || [])
              if (!canEnd.has(f)) { canEnd.add(f); growEnd = true; }
      }
      for (const st of declared)
        if (!canEnd.has(st)) E('C11', `${tag}.${st} cannot reach any terminal state`);
    }
  }

  // C13 — an edge requiring recorded authority must name how it is evidenced
  // (docs/state-model.md §5a).
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

// C12 — registry completeness (docs/state-model.md L-2): every schema file has a declaration,
// lifecycle-bearing or not. Statelessness by omission is a defect; by declaration it is a decision.
try {
  const onDisk = fs.readdirSync(p('schema')).filter((f) => f.endsWith('.schema.json'));
  const inRegistry = new Set(model.objects.map((x) => path.basename(x.schema)));
  for (const f of onDisk)
    if (!inRegistry.has(f)) E('C12', `schema/${f} has no declaration in the registry`);
  for (const x of model.objects)
    if (!onDisk.includes(path.basename(x.schema))) W('C12', `${x.object}: declared against ${x.schema}, which is not present`);
} catch (e) { W('C12', `could not enumerate schema/: ${e.message}`); }

// C14 — basis scope (docs/state-model.md §6 B-3). Externality is not generality: a core entry
// on a jurisdictional basis needs a corroborating general source; one on an implementer basis
// must move to a profile.
for (const x of model.objects) {
  if (x.layer !== 'core') continue;
  for (const e of x.entries || x.transitions || []) {
    if (e.basisScope === 'jurisdictional' && !e.corroboratingBasis)
      W('C14', `${e.id}: core entry on a jurisdictional basis ("${e.basis}") with no corroborating general source`);
    if (e.basisScope === 'implementer')
      E('C14', `${e.id}: core entry on an implementer basis — must move to a profile`);
  }
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
