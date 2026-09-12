#!/usr/bin/env node
/**
 * check-release-version.js — package.json and the changelog must name the same version.
 *
 * v0.17.1 was tagged with a `## [0.17.1]` changelog heading and `"version": "0.17.0"` in
 * package.json, because the release step cut a tag without the release commit every previous
 * release had made. Nothing in this repository noticed. The failure surfaced two repositories
 * downstream, in the website's build gate — which exists because the site's version pill once
 * read v0.10.0 while the site rendered v0.12.0.
 *
 * That is the D-19 shape again: a rule every release had followed, enforced by nothing, so the
 * one release that skipped it published anyway. A standard that depends on a consumer to detect
 * its own release inconsistency has the control in the wrong repository.
 *
 * The check is deliberately narrow. It asserts agreement, not correctness: it cannot know which
 * of the two is right, only that a release naming two versions is not a release. Ordering,
 * dates and semver increments are the changelog's own business and are not checked here.
 *
 * Usage: node conformance/rules/check-release-version.js [repoRoot]
 * Exit 0 = pass, 1 = fail.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || process.cwd();
const p = (...a) => path.join(ROOT, ...a);

const fail = (msg) => { console.error(`\nSIGNET release version check\n\n  ✗ ${msg}\n`); process.exit(1); };

let pkg;
try { pkg = JSON.parse(fs.readFileSync(p('package.json'), 'utf8')); }
catch (e) { fail(`cannot read package.json: ${e.message}`); }

let changelog;
try { changelog = fs.readFileSync(p('CHANGELOG.md'), 'utf8'); }
catch (e) { fail(`cannot read CHANGELOG.md: ${e.message}`); }

// The newest released heading. An `[Unreleased]` section is skipped rather than compared:
// work in flight is not what package.json names.
const headings = [...changelog.matchAll(/^##[ \t]+\[([^\]]+)\]/gm)].map((m) => m[1]);
const newest = headings.find((h) => !/unreleased/i.test(h));

if (!newest) fail('CHANGELOG.md declares no released version heading, so the package version cannot be checked against it.');

if (!pkg.version) fail('package.json declares no version.');

if (pkg.version !== newest) {
  fail(
    `package.json says ${pkg.version}; the newest released changelog heading is [${newest}].\n`
    + '    A release names one version. Bump package.json and package-lock.json in the release\n'
    + '    commit, or add the changelog section the version claims — but do not tag until they agree.',
  );
}

// package-lock carries the version twice and both are published.
let lock;
try { lock = JSON.parse(fs.readFileSync(p('package-lock.json'), 'utf8')); } catch { lock = null; }
if (lock) {
  const lockVersions = [lock.version, lock.packages && lock.packages[''] && lock.packages[''].version]
    .filter((v) => v !== undefined);
  const wrong = lockVersions.filter((v) => v !== pkg.version);
  if (wrong.length) {
    fail(`package-lock.json names ${[...new Set(wrong)].join(', ')} where package.json names ${pkg.version}. \`npm install\` rewrites both; commit the result.`);
  }
}

console.log(`\nSIGNET release version check\n\n  · package.json ${pkg.version} = newest changelog heading [${newest}]${lock ? ', package-lock.json agrees' : ''}\n\nPass.\n`);
process.exit(0);
