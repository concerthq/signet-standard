#!/usr/bin/env node
'use strict';

/**
 * Repository inventory extractor and claims verifier.
 *
 * Produces a deterministic, machine-readable statement of what the tracked
 * working tree contains at a named commit (facts only, no verdicts), and
 * verifies a CLAIMS.json whose every claim names its evidence as a pointer
 * into that inventory.
 *
 * Scope is `git ls-files`. Untracked and ignored paths are never opened.
 * Node built-ins only; runs on a fresh clone before `npm install`.
 *
 *   node tools/inventory/inventory.js [--out <path>] [--since <version>]
 *                                     [--grep <term>]... [--pretty|--no-pretty]
 *   node tools/inventory/inventory.js --verify <claims.json> [--inventory <path>] [--allow-drift]
 *   node tools/inventory/inventory.js --self-test
 *
 * Exit: 0 success - 1 verification/self-test failure - 2 usage or environment error.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const TOOL_VERSION = '2.0.0';
const INVENTORY_SCHEMA_VERSION = '2.0.0';
const TEXTS_SIZE_WARN = 5 * 1024 * 1024;

/* ------------------------------------------------------------------ *
 * small utilities
 * ------------------------------------------------------------------ */

function die(msg) { process.stderr.write('✗ ' + msg + '\n'); process.exit(2); }
function warn(msg) { process.stderr.write(msg + '\n'); }

function findRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    die('not a git repository (git rev-parse --show-toplevel failed)');
  }
}

const ROOT = findRoot();
const CONFIG_PATH = path.join(__dirname, 'inventory.config.json');

function git(args, opts) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', (opts && opts.quiet) ? 'ignore' : 'pipe'],
    });
  } catch (e) {
    if (opts && opts.soft) return null;
    throw e;
  }
}

/** An object with keys inserted in sorted order, so JSON.stringify is stable. */
function sortedMap(pairs) {
  const out = {};
  for (const pair of pairs.slice().sort((a, b) => cmp(a[0], b[0]))) out[pair[0]] = pair[1];
  return out;
}
function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function uniqSorted(arr) { return Array.from(new Set(arr)).sort(cmp); }

function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

/** The hash git would store for this content: sha1("blob <len>\0" + bytes). */
function gitBlobHash(buf) {
  const h = crypto.createHash('sha1');
  h.update(Buffer.from('blob ' + buf.length + '\0', 'utf8'));
  h.update(buf);
  return h.digest('hex');
}

const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
function hasBom(buf) { return buf.length >= 3 && buf.slice(0, 3).equals(BOM); }
function decode(buf) {
  const s = buf.toString('utf8');
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}
function isBinary(buf) {
  const n = Math.min(buf.length, 8192);
  for (let i = 0; i < n; i++) if (buf[i] === 0) return true;
  return false;
}
function eolStyle(buf) {
  const s = buf.toString('latin1');
  const crlf = (s.match(/\r\n/g) || []).length;
  const lf = (s.match(/\n/g) || []).length - crlf;
  if (crlf && lf) return 'mixed';
  if (crlf) return 'crlf';
  if (lf) return 'lf';
  return 'none';
}
function countLines(text) {
  if (text === '') return 0;
  const n = (text.match(/\n/g) || []).length;
  return text.endsWith('\n') ? n : n + 1;
}
function splitLines(text) { return text.split(/\r\n|\n/); }
function kindOf(p) {
  const e = path.extname(p).toLowerCase().replace(/^\./, '');
  if (e === 'yaml') return 'yml';
  return ['json', 'csv', 'md', 'js', 'yml'].indexOf(e) !== -1 ? e : 'other';
}

/** Escape a JSON Pointer token per RFC 6901. */
function ptrToken(s) { return String(s).replace(/~/g, '~0').replace(/\//g, '~1'); }

/* ------------------------------------------------------------------ *
 * repository state
 * ------------------------------------------------------------------ */

function trackedFiles() {
  const out = git(['ls-files', '-z']);
  return out.split('\0').filter(Boolean).sort(cmp);
}

const _fileCache = new Map();
function readTracked(rel) {
  if (_fileCache.has(rel)) return _fileCache.get(rel);
  let buf = null;
  try { buf = fs.readFileSync(path.join(ROOT, rel)); } catch (e) { buf = null; }
  _fileCache.set(rel, buf);
  return buf;
}
function textOf(rel) {
  const buf = readTracked(rel);
  if (!buf || isBinary(buf)) return null;
  return decode(buf);
}

/* ------------------------------------------------------------------ *
 * 3.1 generated - 3.2 git - 3.3 manifest
 * ------------------------------------------------------------------ */

function sectionGenerated(args, config) {
  return {
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    toolVersion: TOOL_VERSION,
    node: process.version,
    args: args.slice(),
    config: config,
  };
}

function sectionGit(files) {
  const head = git(['rev-parse', 'HEAD']).trim();
  const porcelain = git(['status', '--porcelain']).trim();
  const dirtyPaths = porcelain
    ? porcelain.split(/\r?\n/).map((l) => l.slice(3).trim()).filter(Boolean).sort(cmp)
    : [];
  const tagsRaw = git(['tag', '--sort=-v:refname'], { soft: true }) || '';
  const tags = tagsRaw.split(/\r?\n/).filter(Boolean);
  const describe = (git(['describe', '--tags', '--always'], { soft: true, quiet: true }) || '').trim();
  const latestTag = (git(['describe', '--tags', '--abbrev=0'], { soft: true, quiet: true }) || '').trim() || null;
  let commitsSinceLatestTag = null;
  let headIsTagged = false;
  if (latestTag) {
    const n = (git(['rev-list', '--count', latestTag + '..HEAD'], { soft: true, quiet: true }) || '').trim();
    commitsSinceLatestTag = n === '' ? null : Number(n);
    headIsTagged = commitsSinceLatestTag === 0;
  }
  let branch = (git(['rev-parse', '--abbrev-ref', 'HEAD'], { soft: true, quiet: true }) || '').trim();
  if (branch === 'HEAD') branch = null;

  return {
    head: head,
    headShort: head.slice(0, 7),
    branch: branch,
    describe: describe,
    dirty: dirtyPaths.length > 0,
    dirtyPaths: dirtyPaths,
    latestTag: latestTag,
    headIsTagged: headIsTagged,
    commitsSinceLatestTag: commitsSinceLatestTag,
    tags: tags,
    trackedFileCount: files.length,
  };
}

function sectionManifest(files) {
  return files.map(function (rel) {
    const buf = readTracked(rel);
    if (!buf) die('tracked file is unreadable: ' + rel);
    const bin = isBinary(buf);
    return {
      path: rel,
      bytes: buf.length,
      sha256: sha256(buf),
      gitBlob: gitBlobHash(buf),
      kind: kindOf(rel),
      text: !bin,
      bom: hasBom(buf),
      eol: bin ? null : eolStyle(buf),
      lines: bin ? null : countLines(decode(buf)),
    };
  });
}

/* ------------------------------------------------------------------ *
 * 3.4 package - 3.5 ci
 * ------------------------------------------------------------------ */

function sectionPackage(files) {
  if (files.indexOf('package.json') === -1) return {};
  let pkg;
  try { pkg = JSON.parse(textOf('package.json')); } catch (e) { return { parseError: e.message }; }
  return {
    name: pkg.name || null,
    version: pkg.version || null,
    scripts: pkg.scripts || {},
    devDependencies: pkg.devDependencies || {},
  };
}

/** Collect `run:` values, including the bodies of `run: |` block scalars. */
function runLines(text) {
  const lines = splitLines(text);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^(\s*)-?\s*run:\s*(.*)$/.exec(lines[i]);
    if (!m) continue;
    const indent = m[1].length;
    const rest = m[2];
    if (/^[|>][-+]?\d*\s*$/.test(rest.trim())) {
      for (let j = i + 1; j <= lines.length; j++) {
        if (j === lines.length) { i = j - 1; break; }
        const l = lines[j];
        if (l.trim() === '') { out.push(''); continue; }
        const ind = l.length - l.replace(/^\s*/, '').length;
        if (ind <= indent) { i = j - 1; break; }
        out.push(l.trim());
      }
      while (out.length && out[out.length - 1] === '') out.pop();
    } else if (rest !== '') {
      out.push(rest);
    }
  }
  return out;
}

function sectionCi(files) {
  const wf = files.filter((f) => /^\.github\/workflows\/.+\.ya?ml$/.test(f)).sort(cmp);
  return {
    workflowCount: wf.length,
    workflows: wf.map((p) => ({ path: p, runLines: runLines(textOf(p) || '') })),
  };
}

/* ------------------------------------------------------------------ *
 * 3.6 changelog
 * ------------------------------------------------------------------ */

function semverParts(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(v).replace(/^v/, ''));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function semverGte(a, b) {
  const x = semverParts(a), y = semverParts(b);
  if (!x || !y) return true;
  for (let i = 0; i < 3; i++) { if (x[i] > y[i]) return true; if (x[i] < y[i]) return false; }
  return true;
}

function sectionChangelog(files, since) {
  if (files.indexOf('CHANGELOG.md') === -1) return [];
  const lines = splitLines(textOf('CHANGELOG.md'));
  const heads = [];
  lines.forEach(function (l, i) { if (/^##\s+/.test(l)) heads.push(i); });

  const entries = [];
  for (let h = 0; h < heads.length; h++) {
    const start = heads[h];
    const end = h + 1 < heads.length ? heads[h + 1] : lines.length;
    const heading = lines[start];
    const bodyLines = lines.slice(start + 1, end);
    const body = bodyLines.join('\n').replace(/^\n+|\n+$/g, '');
    const after = heading.replace(/^##\s+/, '');
    const vm = /^\[?([^\]\s]+)\]?\s*(.*)$/.exec(after);
    entries.push({
      version: vm ? vm[1] : after,
      heading: heading,
      headingSuffix: vm ? vm[2].trim() : '',
      sectionHeadings: bodyLines.filter((l) => /^###\s+/.test(l)).map((l) => l.replace(/^###\s+/, '').trim()),
      body: body,
      sha256: sha256(Buffer.from(body, 'utf8')),
    });
  }
  if (!since) return entries;
  return entries.filter((e) => /unreleased/i.test(e.version) || semverGte(e.version, since));
}

/* ------------------------------------------------------------------ *
 * 3.7 schemas
 * ------------------------------------------------------------------ */

/** Walk a parsed JSON document, calling fn(node, pointer) for every object. */
function walkJson(node, pointer, fn) {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkJson(v, pointer + '/' + i, fn));
    return;
  }
  fn(node, pointer);
  for (const k of Object.keys(node)) walkJson(node[k], pointer + '/' + ptrToken(k), fn);
}

const COMBINATORS = ['allOf', 'anyOf', 'oneOf', 'then', 'else'];

/**
 * Every property name reachable at any depth, dotted. Follows `properties`,
 * `items`, and the same-level combinators; does not follow `$ref`.
 */
function propertyPaths(schema) {
  const out = [];
  const seen = new Set();
  (function descend(node, prefix, depth) {
    if (!node || typeof node !== 'object' || depth > 24) return;
    if (Array.isArray(node)) { node.forEach((n) => descend(n, prefix, depth + 1)); return; }
    if (node.properties && typeof node.properties === 'object') {
      for (const name of Object.keys(node.properties)) {
        const p = prefix ? prefix + '.' + name : name;
        if (!seen.has(p)) { seen.add(p); out.push(p); }
        descend(node.properties[name], p, depth + 1);
      }
    }
    if (node.items) descend(node.items, prefix, depth + 1);
    for (const c of COMBINATORS) if (node[c]) descend(node[c], prefix, depth + 1);
  })(schema, '', 0);
  return out;
}

function definitionsOf(doc) {
  const d = doc.definitions || doc.$defs;
  return d && typeof d === 'object' ? d : null;
}

function sectionSchemas(files) {
  const found = [];
  for (const rel of files) {
    if (!/\.json$/.test(rel)) continue;
    const t = textOf(rel);
    if (t === null || t.indexOf('"$schema"') === -1) continue;
    let doc;
    try { doc = JSON.parse(t); } catch (e) { continue; }
    if (!doc || typeof doc !== 'object' || Array.isArray(doc) || !doc.$schema) continue;

    const enums = [];
    const refs = [];
    walkJson(doc, '', function (node, ptr) {
      if (Array.isArray(node.enum)) enums.push({ pointer: ptr, values: node.enum.slice() });
      if (typeof node.$ref === 'string') refs.push({ pointer: ptr, ref: node.$ref });
    });

    const base = typeof doc.$id === 'string' ? doc.$id : null;
    const externalIds = uniqSorted(refs
      .map((r) => r.ref)
      .filter((r) => r.charAt(0) !== '#')
      .map(function (r) {
        const noFrag = r.split('#')[0];
        if (!noFrag) return null;
        try { return base ? new URL(noFrag, base).toString() : noFrag; } catch (e) { return noFrag; }
      })
      .filter(Boolean));

    const defs = definitionsOf(doc);

    found.push({
      path: rel,
      $id: base,
      $schema: doc.$schema,
      title: typeof doc.title === 'string' ? doc.title : null,
      type: doc.type !== undefined ? doc.type : null,
      required: Array.isArray(doc.required) ? doc.required.slice() : [],
      properties: doc.properties && typeof doc.properties === 'object' ? Object.keys(doc.properties) : [],
      additionalProperties: doc.additionalProperties !== undefined ? doc.additionalProperties : null,
      patternProperties: doc.patternProperties && typeof doc.patternProperties === 'object'
        ? Object.keys(doc.patternProperties) : [],
      definitions: defs ? Object.keys(defs) : [],
      enums: enums,
      refs: refs,
      externalIds: externalIds,
      propertyPaths: propertyPaths(doc),
    });
  }
  found.sort((a, b) => cmp(a.path, b.path));

  const dialectCounts = {};
  for (const f of found) dialectCounts[f.$schema] = (dialectCounts[f.$schema] || 0) + 1;

  return {
    fileCount: found.length,
    directories: uniqSorted(found.map((f) => path.posix.dirname(f.path))),
    dialects: sortedMap(Object.keys(dialectCounts).map((k) => [k, dialectCounts[k]])),
    files: found,
  };
}

/* ------------------------------------------------------------------ *
 * 3.8 codelists
 * ------------------------------------------------------------------ */

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(cell); cell = ''; continue; }
    if (c === '\r') { if (text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/**
 * Closure is read from the register that check-codelist-binding.js reads
 * (codelists/bindings.json), not guessed. The deciding line is recorded.
 */
function buildClosureRegister(files) {
  const reg = new Map();
  const registerPath = files.filter((f) => /(^|\/)codelists\/bindings\.json$/.test(f))[0] || null;
  if (!registerPath) return { reg: reg, registerPath: null };
  const text = textOf(registerPath);
  let doc;
  try { doc = JSON.parse(text); } catch (e) { return { reg: reg, registerPath: registerPath }; }
  const lines = splitLines(text);
  const dir = path.posix.dirname(registerPath);
  const statusFor = { closed: 'closed', open: 'open', deferred: 'unknown', retired: 'unknown' };
  for (const group of Object.keys(statusFor)) {
    if (!Array.isArray(doc[group])) continue;
    for (const item of doc[group]) {
      if (!item || typeof item.codelist !== 'string') continue;
      const rel = dir + '/' + item.codelist;
      const needle = '"codelist": "' + item.codelist + '"';
      let lineNo = null, lineText = null;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(needle) !== -1) { lineNo = i + 1; lineText = lines[i].trim(); break; }
      }
      reg.set(rel, {
        closure: statusFor[group],
        group: group,
        marker: { source: registerPath + (lineNo ? ':' + lineNo : ''), line: lineText },
      });
    }
  }
  return { reg: reg, registerPath: registerPath };
}

function sectionCodelists(files) {
  const csvs = files.filter((f) => /\.csv$/.test(f) && /(^|\/)codelists\//.test(f)).sort(cmp);
  const built = buildClosureRegister(files);

  const out = csvs.map(function (rel) {
    const rows = parseCsv(textOf(rel) || '');
    const body = rows.slice(1);
    const hit = built.reg.get(rel);
    return {
      path: rel,
      header: rows.length ? rows[0] : [],
      rowCount: body.length,
      codes: body.map((r) => r[0]),
      rows: body,
      closure: hit ? hit.closure : 'unknown',
      closureGroup: hit ? hit.group : null,
      closureMarker: hit ? hit.marker : { source: null, line: null },
    };
  });

  return {
    fileCount: out.length,
    directories: uniqSorted(out.map((f) => path.posix.dirname(f.path))),
    registerPath: built.registerPath,
    files: out,
  };
}

/* ------------------------------------------------------------------ *
 * 3.9 stateModel
 * ------------------------------------------------------------------ */

const STATE_MODEL_MODELLED = ['$comment', 'version', 'objects', 'basisSources', 'basisScope'];
const STATE_OBJECT_MODELLED = ['object', 'schema', 'layer', 'extension', 'lifecycle', 'stateField', 'states', 'entries'];

function emptyStateModel(rel, extra) {
  const base = { path: rel, comment: null, version: null, objectCount: 0, objects: [],
    basisSources: null, basisScope: null, transitionsWithoutBasis: 0, unknownKeys: [] };
  return Object.assign(base, extra || {});
}

function sectionStateModel(files) {
  const rel = files.filter((f) => /(^|\/)state-model\.json$/.test(f))[0] || null;
  if (!rel) return emptyStateModel(null);
  let doc;
  try { doc = JSON.parse(textOf(rel)); } catch (e) { return emptyStateModel(rel, { parseError: e.message }); }

  let withoutBasis = 0;
  const objects = (Array.isArray(doc.objects) ? doc.objects : []).map(function (o) {
    const states = o.states && typeof o.states === 'object' ? o.states : {};
    const stateNames = Object.keys(states);
    const entries = Array.isArray(o.entries) ? o.entries : [];
    const transitions = entries.map(function (e) {
      const basis = (e && e.basis !== undefined && e.basis !== null && e.basis !== '') ? e.basis : null;
      if (basis === null) withoutBasis++;
      return {
        id: e.id !== undefined ? e.id : null,
        kind: e.kind !== undefined ? e.kind : null,
        from: Array.isArray(e.from) ? e.from.slice() : (e.from !== undefined ? [e.from] : []),
        to: e.to !== undefined ? e.to : null,
        eventType: e.eventType !== undefined ? e.eventType : null,
        basis: basis,
        basisScope: e.basisScope !== undefined ? e.basisScope : null,
      };
    });
    return {
      name: o.object !== undefined ? o.object : null,
      schema: o.schema !== undefined ? o.schema : null,
      layer: o.layer !== undefined ? o.layer : null,
      extension: o.extension !== undefined ? o.extension : null,
      lifecycle: o.lifecycle !== undefined ? o.lifecycle : null,
      stateField: o.stateField !== undefined ? o.stateField : null,
      states: stateNames,
      stateDetail: states,
      initial: uniqSorted(transitions.filter((t) => t.kind === 'creation' && t.to).map((t) => t.to)),
      terminal: stateNames.filter((s) => states[s] && states[s].terminal === true),
      transitionCount: transitions.length,
      transitions: transitions,
      unknownKeys: Object.keys(o).filter((k) => STATE_OBJECT_MODELLED.indexOf(k) === -1),
    };
  });

  return {
    path: rel,
    comment: typeof doc.$comment === 'string' ? doc.$comment : null,
    version: doc.version !== undefined ? doc.version : null,
    objectCount: objects.length,
    objects: objects,
    basisSources: doc.basisSources !== undefined ? doc.basisSources : null,
    basisScope: doc.basisScope !== undefined ? doc.basisScope : null,
    transitionsWithoutBasis: withoutBasis,
    unknownKeys: Object.keys(doc).filter((k) => STATE_MODEL_MODELLED.indexOf(k) === -1),
  };
}

/* ------------------------------------------------------------------ *
 * 3.10 conformance
 * ------------------------------------------------------------------ */

const REQ_ID = /^[A-Z]+(?:-[A-Z0-9]+)+\b/;
const CHECK_ID = /\b[A-Z]+-\d+\b/g;

function sectionConformance(files) {
  const levelsPath = files.filter((f) => /(^|\/)conformance\/levels\.md$/.test(f))[0] || null;
  const requirementLines = [];
  if (levelsPath) {
    splitLines(textOf(levelsPath) || '').forEach(function (l, i) {
      // At line start, or at the start of any table cell.
      const segments = [l].concat(l.indexOf('|') !== -1 ? l.split('|') : []);
      const ids = [];
      for (const seg of segments) {
        const stripped = seg.replace(/^\s+/, '').replace(/^[*_`]+/, '');
        const m = REQ_ID.exec(stripped);
        if (m && ids.indexOf(m[0]) === -1) ids.push(m[0]);
      }
      for (const id of ids) requirementLines.push({ id: id, line: i + 1, text: l });
    });
  }

  const rulesFiles = files.filter((f) => /^conformance\/rules\/.*\.js$/.test(f)).sort(cmp);
  const checkers = rulesFiles.map(function (p) {
    const t = textOf(p) || '';
    const hm = /^\s*\/\*\*[\s\S]*?\*\//.exec(t);
    return { path: p, headerComment: hm ? hm[0] : null, checkIds: uniqSorted(t.match(CHECK_ID) || []) };
  });

  return {
    levelsPath: levelsPath,
    requirementLines: requirementLines,
    rulesFiles: rulesFiles,
    suiteFiles: files.filter((f) => /^conformance\/suite\//.test(f)).sort(cmp),
    runnerFiles: files.filter((f) => /^conformance\/runner\//.test(f)).sort(cmp),
    adapterFiles: files.filter((f) => /^conformance\/adapter\//.test(f)).sort(cmp),
    fixtureFiles: {
      valid: files.filter((f) => /^conformance\/fixtures\/valid\//.test(f)).sort(cmp),
      invalid: files.filter((f) => /^conformance\/fixtures\/invalid\//.test(f)).sort(cmp),
      other: files.filter((f) => /^conformance\/fixtures\//.test(f)
        && !/^conformance\/fixtures\/(valid|invalid)\//.test(f)).sort(cmp),
    },
    checkers: checkers,
  };
}

/* ------------------------------------------------------------------ *
 * 3.11 texts
 * ------------------------------------------------------------------ */

const STATUS_RE = /^[ \t]*(?:\*\*|__)?Status(?:\*\*|__)?[ \t]*:[ \t]*(.+?)[ \t]*$/m;

function sectionTexts(files, config) {
  const dirs = config.textDirectories || [];
  const wanted = files.filter(function (f) {
    if (!/\.md$/.test(f)) return false;
    if (config.rootMarkdown !== false && f.indexOf('/') === -1) return true;
    return dirs.some((d) => f.indexOf(d + '/') === 0);
  }).sort(cmp);

  let total = 0;
  const entries = wanted.map(function (rel) {
    const buf = readTracked(rel);
    const content = decode(buf);
    total += buf.length;
    return [rel, { sha256: sha256(buf), bytes: buf.length, lines: countLines(content), content: content }];
  });
  if (total > TEXTS_SIZE_WARN) {
    warn('⚠ texts section is ' + (total / 1048576).toFixed(1) + ' MB (over 5 MB); emitting in full, not truncating');
  }

  const byDirectory = {};
  for (const rel of wanted) {
    const d = rel.indexOf('/') === -1 ? '.' : path.posix.dirname(rel);
    if (!byDirectory[d]) byDirectory[d] = [];
    byDirectory[d].push(rel);
  }

  function firstH1(text) {
    const lines = splitLines(text);
    for (const l of lines) { const m = /^#\s+(.+?)\s*$/.exec(l); if (m) return m[1]; }
    return null;
  }
  const metaCache = new Map();
  function meta(rel) {
    if (metaCache.has(rel)) return metaCache.get(rel);
    const text = decode(readTracked(rel));
    const sm = STATUS_RE.exec(text);
    const m = { title: firstH1(text), status: sm ? sm[1].replace(/[*_`]/g, '').trim() : null };
    metaCache.set(rel, m);
    return m;
  }

  const iars = wanted.filter((f) => /(^|\/)IAR-\d+/.test(f)).map(function (f) {
    const m = /IAR-\d+/.exec(f);
    return { path: f, id: m ? m[0] : null, title: meta(f).title };
  });
  const proposals = wanted.filter((f) => /(^|\/)governance\/proposals\//.test(f)).map(function (f) {
    const m = /(CP-[A-Za-z0-9-]+)/.exec(path.posix.basename(f));
    const mm = meta(f);
    return { path: f, id: m ? m[1] : path.posix.basename(f, '.md'), title: mm.title, status: mm.status };
  });
  const reviews = wanted.filter((f) => /(^|\/)governance\/reviews\//.test(f)).map(function (f) {
    const mm = meta(f);
    return { path: f, id: path.posix.basename(f, '.md'), title: mm.title, status: mm.status };
  });
  const registers = wanted.filter(function (f) {
    const t = meta(f).title;
    return t !== null && /register/i.test(t);
  }).map((f) => ({ path: f, title: meta(f).title }));

  return {
    fileCount: wanted.length,
    totalBytes: total,
    files: sortedMap(entries),
    textIndex: {
      byDirectory: sortedMap(Object.keys(byDirectory).map((k) => [k, byDirectory[k].slice().sort(cmp)])),
      iars: iars,
      proposals: proposals,
      reviews: reviews,
      registers: registers,
    },
  };
}

/* ------------------------------------------------------------------ *
 * 4 referencedFields
 * ------------------------------------------------------------------ */

const FIELD_TOKEN = /`([A-Z][A-Za-z0-9]*)((?:\.[a-z][A-Za-z0-9]*)+)`/g;
const ACCEPTED_STATUS = /^(accepted|merged|shipped)\b/i;

// `CHANGELOG.md` and `CITATION.cff` are filenames in backticks, not Object.field
// references. A single dotted segment that is a file extension is not a field.
const FILE_EXTENSIONS = ['md', 'json', 'jsonld', 'csv', 'js', 'py', 'yml', 'yaml',
  'xml', 'html', 'txt', 'cff', 'lock', 'log', 'sh', 'ts', 'toml', 'ini', 'cfg', 'svg', 'png'];
function looksLikeFilename(field) {
  return field.indexOf('.') === -1 && FILE_EXTENSIONS.indexOf(field) !== -1;
}

function sectionReferencedFields(texts, schemas) {
  const byTitle = new Map();
  for (const s of schemas.files) if (s.title && !byTitle.has(s.title)) byTitle.set(s.title, s);

  // Definition-level property universes, so `Document.documentType` resolves too.
  const defPaths = new Map();
  for (const s of schemas.files) {
    let doc;
    try { doc = JSON.parse(textOf(s.path)); } catch (e) { continue; }
    const defs = definitionsOf(doc);
    if (!defs) continue;
    for (const name of Object.keys(defs)) {
      if (!defPaths.has(name)) defPaths.set(name, propertyPaths(defs[name]));
    }
  }

  const occurrences = new Map(); // "Object.field" -> [{path, line}]
  for (const rel of Object.keys(texts.files)) {
    splitLines(texts.files[rel].content).forEach(function (line, i) {
      FIELD_TOKEN.lastIndex = 0;
      let m;
      while ((m = FIELD_TOKEN.exec(line)) !== null) {
        if (looksLikeFilename(m[2].slice(1))) continue;
        const token = m[1] + m[2];
        if (!occurrences.has(token)) occurrences.set(token, []);
        occurrences.get(token).push({ path: rel, line: i + 1 });
      }
    });
  }

  const statusOf = new Map();
  for (const p of texts.textIndex.proposals) statusOf.set(p.path, p.status);
  for (const r of texts.textIndex.reviews) statusOf.set(r.path, r.status);

  function isProposalContext(rel) {
    if (/(^|\/)governance\/proposals\//.test(rel)) return true;
    const st = statusOf.get(rel);
    return st !== undefined && st !== null && !ACCEPTED_STATUS.test(st);
  }

  const shipped = [], proposed = [], unresolved = [];
  const unresolvedObjects = new Map();

  for (const token of Array.from(occurrences.keys()).sort(cmp)) {
    const dot = token.indexOf('.');
    const objName = token.slice(0, dot);
    const fieldPath = token.slice(dot + 1);
    const occ = occurrences.get(token);
    const locs = uniqSorted(occ.map((o) => o.path + ':' + o.line));

    const schema = byTitle.get(objName);
    const defUniverse = defPaths.get(objName);
    if (!schema && !defUniverse) {
      if (!unresolvedObjects.has(objName)) unresolvedObjects.set(objName, []);
      unresolvedObjects.get(objName).push.apply(unresolvedObjects.get(objName), locs);
      continue;
    }
    const universe = schema ? schema.propertyPaths : defUniverse;
    const alsoDef = schema ? (defPaths.get(objName) || []) : [];
    if (universe.indexOf(fieldPath) !== -1 || alsoDef.indexOf(fieldPath) !== -1) {
      shipped.push([token, locs]);
    } else if (occ.every((o) => isProposalContext(o.path))) {
      proposed.push([token, locs]);
    } else {
      unresolved.push([token, locs]);
    }
  }

  return {
    shipped: sortedMap(shipped),
    proposed: sortedMap(proposed),
    unresolved: sortedMap(unresolved),
    unresolvedObjects: sortedMap(Array.from(unresolvedObjects.keys()).map((k) => [k, uniqSorted(unresolvedObjects.get(k))])),
  };
}

/* ------------------------------------------------------------------ *
 * 3.12 grep
 * ------------------------------------------------------------------ */

function sectionGrep(files, terms) {
  const pairs = terms.map((t) => [t, []]);
  const index = new Map(pairs);
  for (const rel of files) {
    const t = textOf(rel);
    if (t === null) continue;
    const lines = splitLines(t);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const term of terms) {
        if (line.indexOf(term) !== -1) index.get(term).push({ path: rel, line: i + 1, text: line });
      }
    }
  }
  return { terms: terms.slice(), scope: 'all tracked text files', hits: sortedMap(pairs) };
}

/* ------------------------------------------------------------------ *
 * build
 * ------------------------------------------------------------------ */

function loadConfig() {
  try { return JSON.parse(decode(fs.readFileSync(CONFIG_PATH))); }
  catch (e) { die('cannot read ' + CONFIG_PATH + ': ' + e.message); }
}

function build(opts) {
  const config = loadConfig();
  const files = trackedFiles();
  const terms = uniqSorted((config.grepTerms || []).concat(opts.grep || []));

  const gitInfo = sectionGit(files);
  if (gitInfo.dirty && !opts.quiet) warn('⚠ working tree dirty');

  const schemas = sectionSchemas(files);
  const texts = sectionTexts(files, config);

  return {
    inventorySchemaVersion: INVENTORY_SCHEMA_VERSION,
    generated: sectionGenerated(opts.rawArgs || [], config),
    git: gitInfo,
    manifest: sectionManifest(files),
    'package': sectionPackage(files),
    ci: sectionCi(files),
    changelog: sectionChangelog(files, opts.since),
    schemas: schemas,
    codelists: sectionCodelists(files),
    stateModel: sectionStateModel(files),
    conformance: sectionConformance(files),
    texts: texts,
    referencedFields: sectionReferencedFields(texts, schemas),
    grep: sectionGrep(files, terms),
  };
}

function serialise(inv, pretty) {
  return JSON.stringify(inv, null, pretty ? 2 : 0) + '\n';
}

function writeOut(inv, outPath, pretty) {
  const body = serialise(inv, pretty);
  if (outPath === '-') { process.stdout.write(body); return; }
  const abs = path.resolve(outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, Buffer.from(body, 'utf8'));
}

/* ------------------------------------------------------------------ *
 * 5 CLAIMS.json verification
 * ------------------------------------------------------------------ */

/**
 * Split a pointer into steps. `/` inside a `[key=value]` selector is literal, so
 * a claim can name a path without escaping every separator as ~1.
 */
function pointerSteps(pointer) {
  const parts = [];
  let cur = '';
  let depth = 0;
  for (let i = 1; i < pointer.length; i++) {
    const c = pointer[i];
    if (c === '[') depth++;
    else if (c === ']') depth--;
    if (c === '/' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

/** RFC 6901 with one extension: an array step may be [key=value]. */
function resolvePointer(doc, pointer) {
  if (pointer === '' || pointer === '/') return { ok: true, value: doc };
  if (pointer.charAt(0) !== '/') return { ok: false, at: pointer, reason: 'pointer must start with /' };
  let node = doc;
  const parts = pointerSteps(pointer);
  for (let i = 0; i < parts.length; i++) {
    const raw = parts[i].replace(/~1/g, '/').replace(/~0/g, '~');
    const here = '/' + parts.slice(0, i + 1).join('/');
    const sel = /^\[([^=\]]+)=(.*)\]$/.exec(raw);
    if (sel) {
      if (!Array.isArray(node)) return { ok: false, at: here, reason: 'selector used on a non-array' };
      const found = node.filter((el) => el && typeof el === 'object' && String(el[sel[1]]) === sel[2])[0];
      if (found === undefined) return { ok: false, at: here, reason: 'no element where ' + sel[1] + ' = ' + sel[2] };
      node = found;
      continue;
    }
    if (node === null || typeof node !== 'object') return { ok: false, at: here, reason: 'path does not exist' };
    if (Array.isArray(node)) {
      const idx = Number(raw);
      if (!Number.isInteger(idx) || idx < 0 || idx >= node.length) return { ok: false, at: here, reason: 'array index out of range' };
      node = node[idx];
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(node, raw)) return { ok: false, at: here, reason: 'key not present' };
    node = node[raw];
  }
  return { ok: true, value: node };
}

function describeValue(v) {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'an array of ' + v.length;
  if (typeof v === 'object') return 'an object with keys ' + Object.keys(v).slice(0, 6).join(', ');
  const s = JSON.stringify(v);
  return s.length > 120 ? JSON.stringify(String(v).slice(0, 110)) + '…' : s;
}

function sizeOf(v) {
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'string') return v.length;
  if (v && typeof v === 'object') return Object.keys(v).length;
  return null;
}

function applyExpect(value, expect) {
  const ops = Object.keys(expect);
  if (!ops.length) return { pass: false, why: 'expect object is empty' };
  for (const op of ops) {
    const want = expect[op];
    if (op === 'exists') {
      if ((value !== undefined && value !== null) !== !!want) return { pass: false, why: 'found ' + describeValue(value) };
    } else if (op === 'absent') {
      if ((value === undefined || value === null) !== !!want) return { pass: false, why: 'found ' + describeValue(value) };
    } else if (op === 'equals') {
      if (JSON.stringify(value) !== JSON.stringify(want)) return { pass: false, why: 'found ' + describeValue(value) + ', expected ' + describeValue(want) };
    } else if (op === 'notEquals') {
      if (JSON.stringify(value) === JSON.stringify(want)) return { pass: false, why: 'found ' + describeValue(value) };
    } else if (op === 'contains') {
      if (Array.isArray(value)) {
        if (!value.some((x) => JSON.stringify(x) === JSON.stringify(want))) return { pass: false, why: describeValue(value) + ' does not contain ' + describeValue(want) };
      } else if (typeof value === 'string') {
        if (value.indexOf(String(want)) === -1) return { pass: false, why: describeValue(value) + ' does not contain ' + describeValue(want) };
      } else return { pass: false, why: 'target is ' + describeValue(value) + ', not an array or string' };
    } else if (op === 'notContains') {
      if (Array.isArray(value)) {
        if (value.some((x) => JSON.stringify(x) === JSON.stringify(want))) return { pass: false, why: describeValue(value) + ' contains ' + describeValue(want) };
      } else if (typeof value === 'string') {
        if (value.indexOf(String(want)) !== -1) return { pass: false, why: describeValue(value) + ' contains ' + describeValue(want) };
      } else return { pass: false, why: 'target is ' + describeValue(value) + ', not an array or string' };
    } else if (op === 'count') {
      const n = sizeOf(value);
      if (n !== want) return { pass: false, why: 'count is ' + n + ', expected ' + want };
    } else if (op === 'countGte') {
      const n = sizeOf(value);
      if (!(n >= want)) return { pass: false, why: 'count is ' + n + ', expected at least ' + want };
    } else if (op === 'matches') {
      if (typeof value !== 'string') return { pass: false, why: 'target is ' + describeValue(value) + ', not a string' };
      if (!new RegExp(want).test(value)) return { pass: false, why: describeValue(value) + ' does not match /' + want + '/' };
    } else {
      return { pass: false, why: 'unknown expect operator: ' + op };
    }
  }
  return { pass: true };
}

function verify(opts) {
  let claims;
  try { claims = JSON.parse(decode(fs.readFileSync(opts.verify))); }
  catch (e) { die('cannot read claims file ' + opts.verify + ': ' + e.message); }
  if (!Array.isArray(claims.claims)) die('claims file has no "claims" array');

  const head = git(['rev-parse', 'HEAD']).trim();
  if (claims.baseline && claims.baseline !== head) {
    process.stderr.write('✗ baseline drift: claims at ' + claims.baseline + ', HEAD at ' + head + '\n');
    const log = git(['log', '--oneline', claims.baseline + '..HEAD'], { soft: true, quiet: true });
    if (log !== null && log.trim() !== '') process.stderr.write(log.trimEnd() + '\n');
    else if (log === null) process.stderr.write('  (cannot compute ' + claims.baseline + '..HEAD from this repository)\n');
    if (!opts.allowDrift) return 1;
    process.stderr.write('  continuing under --allow-drift\n');
  }

  let inv;
  if (opts.inventory) {
    try { inv = JSON.parse(decode(fs.readFileSync(opts.inventory))); }
    catch (e) { die('cannot read inventory ' + opts.inventory + ': ' + e.message); }
  } else {
    inv = build(opts);
  }

  let verified = 0, unverified = 0, failed = 0;
  for (const c of claims.claims) {
    const id = c.id || '(no id)';
    if (!c.evidence || !c.expect) {
      process.stderr.write('✗ ' + id + ' UNVERIFIED — ' + (c.assertion || '') + '\n');
      unverified++;
      continue;
    }
    const r = resolvePointer(inv, c.evidence);
    if (!r.ok) {
      process.stderr.write('✗ ' + id + ' ' + (c.assertion || '') + ' — evidence ' + c.evidence
        + ' did not resolve at ' + r.at + ': ' + r.reason + '\n');
      failed++;
      continue;
    }
    const v = applyExpect(r.value, c.expect);
    if (v.pass) { process.stdout.write('✓ ' + id + '\n'); verified++; }
    else { process.stderr.write('✗ ' + id + ' ' + (c.assertion || '') + ' — ' + v.why + '\n'); failed++; }
  }

  process.stdout.write(claims.claims.length + ' claims, ' + verified + ' verified, '
    + failed + ' failed, ' + unverified + ' unverified\n');
  return (failed + unverified) ? 1 : 0;
}

/* ------------------------------------------------------------------ *
 * 7.3 self-test — acceptance checks 2, 3, 6, 7 and 8
 * ------------------------------------------------------------------ */

function selfTest(opts) {
  const problems = [];
  const pass = [];
  const quiet = Object.assign({}, opts, { quiet: true });

  // 2 — determinism: two builds differ only in generated.timestamp.
  const a = build(quiet), b = build(quiet);
  a.generated.timestamp = 'X';
  b.generated.timestamp = 'X';
  if (serialise(a, true) === serialise(b, true)) pass.push('determinism: two builds are byte-identical apart from the timestamp');
  else problems.push('determinism: two builds of the same tree differ');

  // 3 — the manifest is exactly the tracked file list.
  const tracked = trackedFiles();
  const listed = a.manifest.map((m) => m.path);
  const missing = tracked.filter((f) => listed.indexOf(f) === -1);
  const extra = listed.filter((f) => tracked.indexOf(f) === -1);
  if (!missing.length && !extra.length) pass.push('manifest: ' + listed.length + ' entries, exactly the tracked file list');
  else problems.push('manifest: ' + missing.length + ' tracked file(s) missing, ' + extra.length + ' untracked entr(ies) present'
    + (missing.length ? ' — first missing: ' + missing[0] : '')
    + (extra.length ? ' — first extra: ' + extra[0] : ''));

  // 6 — every tracked JSON carrying a top-level $schema is discovered.
  const mentions = tracked.filter(function (f) {
    if (!/\.json$/.test(f)) return false;
    const t = textOf(f);
    return t !== null && t.indexOf('"$schema"') !== -1;
  });
  const discovered = {};
  for (const f of a.schemas.files) discovered[f.path] = true;
  const missed = mentions.filter(function (f) {
    if (discovered[f]) return false;
    let d;
    try { d = JSON.parse(textOf(f)); } catch (e) { return false; }
    return !!(d && typeof d === 'object' && !Array.isArray(d) && d.$schema);
  });
  if (!missed.length) {
    const nested = mentions.length - a.schemas.fileCount;
    pass.push('schemas: ' + a.schemas.fileCount + ' discovered; ' + mentions.length
      + ' tracked JSON file(s) mention "$schema"'
      + (nested > 0 ? ' (' + nested + ' only below the top level)' : ''));
  } else {
    problems.push('schemas: ' + missed.length + ' file(s) carry a top-level $schema but were not discovered — first: ' + missed[0]);
  }

  // 7 — the ignored plaintext deny-list and the salt are never named by this tool.
  const ownSource = fs.readFileSync(__filename, 'utf8') + fs.readFileSync(CONFIG_PATH, 'utf8');
  const forbidden = ['naming' + '-deny' + 'list', 'SIGNET_NAMING' + '_SALT'];
  const named = forbidden.filter((t) => ownSource.indexOf(t) !== -1);
  if (!named.length) pass.push('scope: the tool names neither the gitignored plaintext deny-list nor the salt');
  else problems.push('scope: the tool source names ' + named.length + ' forbidden identifier(s)');

  // 8 — output is BOM-free UTF-8, LF only, one trailing newline.
  const body = serialise(a, true);
  if (hasBom(Buffer.from(body, 'utf8'))) problems.push('encoding: output starts with a UTF-8 BOM');
  else if (body.indexOf('\r') !== -1) problems.push('encoding: output contains CR');
  else if (!/[^\n]\n$/.test(body)) problems.push('encoding: output does not end with exactly one newline');
  else pass.push('encoding: BOM-free UTF-8, LF only, single trailing newline');

  for (const p of pass) process.stdout.write('✓ ' + p + '\n');
  for (const p of problems) process.stderr.write('✗ ' + p + '\n');
  process.stdout.write((pass.length + problems.length) + ' checks, ' + pass.length + ' passed, '
    + problems.length + ' failed\n');
  return problems.length ? 1 : 0;
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const USAGE = [
  'Usage:',
  '  inventory.js [--out <path>] [--since <version>] [--grep <term>]... [--pretty|--no-pretty]',
  '  inventory.js --verify <claims.json> [--inventory <path>] [--allow-drift]',
  '  inventory.js --self-test',
].join('\n');

function parseArgs(argv) {
  const o = {
    out: path.join(ROOT, 'signet-inventory.json'), since: null, grep: [], pretty: true,
    verify: null, inventory: null, allowDrift: false, selfTest: false, help: false,
    rawArgs: argv.slice(),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const need = function () { if (i + 1 >= argv.length) die('missing value for ' + a); return argv[++i]; };
    if (a === '--out') o.out = need();
    else if (a === '--since') o.since = need();
    else if (a === '--grep') o.grep.push(need());
    else if (a === '--pretty') o.pretty = true;
    else if (a === '--no-pretty') o.pretty = false;
    else if (a === '--verify') o.verify = need();
    else if (a === '--inventory') o.inventory = need();
    else if (a === '--allow-drift') o.allowDrift = true;
    else if (a === '--self-test') o.selfTest = true;
    else if (a === '-h' || a === '--help') o.help = true;
    else die('unknown argument: ' + a);
  }
  return o;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { process.stdout.write(USAGE + '\n'); return 0; }
  if (opts.selfTest) return selfTest(opts);
  if (opts.verify) return verify(opts);
  const inv = build(opts);
  writeOut(inv, opts.out, opts.pretty);
  if (opts.out !== '-') {
    process.stdout.write('wrote ' + opts.out + ' — ' + inv.manifest.length + ' tracked files at '
      + inv.git.headShort + (inv.git.dirty ? ' (dirty)' : '') + '\n');
  }
  return 0;
}

process.exit(main());
