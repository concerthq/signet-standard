#!/usr/bin/env node
/**
 * check-naming.js — no named individuals, no commercial implementers, in Concert's voice.
 *
 * The rule has existed since v0.13.0 and is enforced by nothing. IAR-0002 shipped in v0.15.0
 * naming a deploying implementer; it passed drafting, review and merge. A rule that depends on
 * a reader noticing is not a control.
 *
 * THE DENY-LIST PROBLEM. A published file listing the names that must not appear is itself the
 * disclosure it exists to prevent. So the repository stores SALTED HASHES, never terms:
 *
 *   conformance/rules/naming-denylist.json   committed — salted SHA-256 digests only
 *   .naming-denylist                          gitignored — plaintext, one term per line
 *   SIGNET_NAMING_SALT                        environment — required to compute digests
 *
 * Add a term without ever committing it:
 *   SIGNET_NAMING_SALT=… node conformance/rules/check-naming.js --add "<term>"
 *
 * VERBATIM DOCUMENTS ARE EXCLUDED. A third-party enquiry published unedited is not Concert's
 * voice, and de-naming a document its author signed would be concealment rather than policy.
 * Those paths are listed in the manifest with a reason, and the exclusion is itself auditable.
 *
 * Usage: node conformance/rules/check-naming.js [repoRoot] [--add TERM]
 * Exit 0 = pass, 1 = fail.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
const ROOT = args[0] && !args[0].startsWith('--') ? args[0] : process.cwd();
const p = (...a) => path.join(ROOT, ...a);
const MANIFEST = p('conformance', 'rules', 'naming-denylist.json');
const SALT = process.env.SIGNET_NAMING_SALT || '';

const digest = (term) =>
  crypto.createHash('sha256').update(SALT + '|' + term.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()).digest('hex').slice(0, 32);

// ------------------------------------------------------------------ --add
if (args.includes('--add')) {
  const term = args[args.indexOf('--add') + 1];
  if (!term) { console.error('--add needs a term'); process.exit(1); }
  if (!SALT) { console.error('SIGNET_NAMING_SALT is not set; refusing to write an unsalted digest'); process.exit(1); }
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const d = digest(term);
  if (!m.digests.includes(d)) { m.digests.push(d); m.digests.sort(); fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + '\n'); }
  console.log(`added digest ${d} (${m.digests.length} total). The term itself was not written anywhere.`);
  process.exit(0);
}

// ------------------------------------------------------------------ load
let manifest;
try { manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); }
catch (e) { console.error('cannot read naming-denylist.json:', e.message); process.exit(1); }

const denied = new Set(manifest.digests || []);
const allow = new Set((manifest.allow || []).map((t) => t.toLowerCase()));
const scan = manifest.scan || ['docs', 'governance', 'codelists', 'schema', 'conformance', 'state-model'];
const verbatim = manifest.verbatim || [];
const scanRoot = manifest.scanRootFiles || [];

// Plaintext fallback for local runs, never committed.
const localList = [];
const localFile = p('.naming-denylist');
if (fs.existsSync(localFile))
  for (const l of fs.readFileSync(localFile, 'utf8').split(/\r?\n/))
    if (l.trim() && !l.startsWith('#')) localList.push(l.trim().toLowerCase());

if (!SALT && !localList.length)
  console.log('note: no SIGNET_NAMING_SALT and no .naming-denylist — structural checks only.\n');

// ---------------------------------------------------------------- checks
const fail = [];
const warn = [];

// Structural patterns, safe to publish because they name no one.
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const CORPORATE = /\b[A-Z][A-Za-z&.\-]*\s+(Ltd|Limited|plc|PLC|GmbH|Inc\.?|LLC|S\.A\.|N\.V\.|AG|Pty|Group)\b/g;
const SIGNED_BY = /(?:^|\n)\s*(?:signed(?:\s+by)?|contact|from|prepared by|author)\s*[:\-–]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z'’-]+){1,2})/gi;

const emailAllow = new Set((manifest.allowEmails || []).map((e) => e.toLowerCase()));

const isVerbatim = (rel) => verbatim.some((v) => rel === v.path || rel.startsWith(v.path.replace(/\/?$/, '/')));

function tokensOf(text) {
  const words = text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(Boolean);
  const out = new Map(); // token -> first index
  words.forEach((w, i) => {
    if (!out.has(w)) out.set(w, i);
    if (i + 1 < words.length) {
      const bg = w + ' ' + words[i + 1];
      if (!out.has(bg)) out.set(bg, i);
    }
  });
  return out;
}

function checkFile(abs, rel) {
  const text = fs.readFileSync(abs, 'utf8');
  const lineOf = (idx) => text.slice(0, idx).split('\n').length;

  // 1 — deny-list, by digest or local plaintext.
  const toks = tokensOf(text);
  for (const [tok] of toks) {
    if (allow.has(tok)) continue;
    if ((SALT && denied.has(digest(tok))) || localList.includes(tok)) {
      const i = text.toLowerCase().indexOf(tok.split(' ')[0]);
      fail.push(`${rel}:${lineOf(i < 0 ? 0 : i)} — a deny-listed name appears in Concert's voice`);
      break; // one report per file; do not enumerate hits and re-disclose by counting
    }
  }

  // 2 — email addresses.
  for (const m of text.matchAll(EMAIL))
    if (!emailAllow.has(m[0].toLowerCase()))
      fail.push(`${rel}:${lineOf(m.index)} — email address <${m[0].split('@')[0].slice(0, 2)}…@${m[0].split('@')[1]}>`);

  // 3 — corporate suffixes.
  for (const m of text.matchAll(CORPORATE))
    fail.push(`${rel}:${lineOf(m.index)} — corporate entity named ("…${m[1]}")`);

  // 4 — attribution blocks. Heuristic, so a warning.
  for (const m of text.matchAll(SIGNED_BY))
    warn.push(`${rel}:${lineOf(m.index)} — looks like a personal attribution block`);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(ROOT, abs);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && !e.name.startsWith('.')) walk(abs); continue; }
    if (!/\.(md|json|js|csv|ya?ml)$/.test(e.name)) continue;
    if (abs === MANIFEST) continue;
    if (isVerbatim(rel)) continue;
    checkFile(abs, rel);
  }
}

for (const d of scan) walk(p(d));
for (const f of scanRoot) { const abs = p(f); if (fs.existsSync(abs)) checkFile(abs, f); }

// ---------------------------------------------------------------- report
console.log('\nSIGNET naming check\n');
for (const v of verbatim) console.log(`  · excluded (verbatim): ${v.path} — ${v.reason}`);
if (warn.length) { console.log('\nWarnings:'); warn.forEach((w) => console.log('  !', w)); }
if (fail.length) {
  console.log('\nFailures:');
  fail.forEach((f) => console.log('  ✗', f));
  console.log(`\n${fail.length} failure(s). Concert names no individual and no commercial implementer.\n`);
  process.exit(1);
}
console.log('\nPass.\n');
process.exit(0);
