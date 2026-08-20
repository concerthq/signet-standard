# IAR-0005 — Interim approval record: a retired codelist restored, because its URL is published

| Field | Value |
|---|---|
| **Record** | IAR-0005 · **Date** 2026-08-20 · **Baseline** v0.15.0 (`728629b`) |
| **Authority** | Bootstrap clause. No Standards Committee is constituted. |
| **Comment period** | 14 calendar days from the pull request being marked ready. **Not waived.** |
| **Reversal risk** | `low` — reversal reinstates a 404 on a published `$id` URL |
| **Closes** | D-24 |
| **Ratifies** | Nothing. Landing is not ratification. |

## The defect

`codelists/submissionStatus.csv` was deleted under IAR-0003, resolving D-13: the file duplicated the
vocabulary carried inline on `Submission.status`, was referenced by no schema, and was marked closed
nowhere. That reasoning stands and is not reopened here.

IAR-0003 also stated the file *"had no consumer"*. That was false. `concert-website` consumed it in
two places:

- `scripts/generate-standard.mjs` names `submissionStatus` in `CODELISTS` and in `CLOSED`, and
  fetches `codelists/submissionStatus.csv` from `main` on every build. The fetch falls back to a
  gitignored local cache, so CI and the deployment — which always start cold — fail outright.
- `next.config.mjs` rewrites `/signet/v0.1/codelists/:file(*.csv)` to the same ref, with no cache and
  no fallback, serving
  `concert.foundation/signet/v0.1/codelists/submissionStatus.csv` — a URL in the published `$id`
  namespace.

On merge, that URL began returning **404** to any implementer who had resolved it, and the site
build failed cold.

**No artifact in this repository recorded either consumer.** The claim was therefore not merely
wrong but **unfalsifiable from inside the repository at the time it was written**: no manifest
declares which paths are consumed, and no check tests whether a deletion is breaking. That is the
defect this record closes, and it is why the correction is a governance act rather than a revert.

## The change

`codelists/submissionStatus.csv` is restored **byte-identical** to its state at `72d8c4e^` — six
lines, five codes, nothing added, altered or removed.

It is restored **retired**. It is not a source of truth, it is bound to no schema, and it is not in
`closed` in `codelists/bindings.json`. The disposition is recorded on the `retired` entry in
`bindings.json`, which now carries `resolvable: true` and the reason.

`conformance/rules/check-codelist-binding.js` distinguishes the two kinds of retirement and fails in
opposite directions:

- `resolvable: true` — the file MUST be present. Its absence is a failure, because a published URL
  in the `$id` namespace stops answering.
- otherwise — unchanged: the file MUST be absent, because a file left behind after a deletion
  decision is the same defect the decision closed.

The retirement notice is not carried in the CSV. `codelists/*.csv` admits no comment line: the
workflow header lint and `readCodes()` both treat line 1 as the header, and a comment block shifts
every parse. Loosening that rule to carry one notice would trade a governance check for a
documentation convenience. The gap is recorded as D-28 rather than closed by exception.

**Retirement says nothing is maintained here. It does not say the URL may stop answering.**
Resolvability and maintenance are different obligations, and a published `$id` URL carries the first
whether or not it carries the second.

## Tier and route

**Tier 2** — `codelists/` is normative. This record is the route.

Landed under the bootstrap clause, under the carve-out in `governance/WITHDRAWAL-2026-08.md` for a
defect **actively causing harm**: a published URL returning 404 to implementers is that.

IAR-0003's pull request was never opened, so its comment period never started and there is no period
to ride. This record carries its own fourteen calendar days from its pull request being marked
ready, not waived.

**Breaking:** no. This restores a URL that resolved before 2026-08-20 and removes nothing.

## Comment period not observed — recorded departure

The period stated above did not run. This record was merged on the day it was opened.

**Why.** `codelists/submissionStatus.csv` was deleted at `72d8c4e`. The website proxies
`concert.foundation/signet/v0.1/codelists/:file(*.csv)` to `raw.githubusercontent.com` at `main`
with no cache and no fallback, so `concert.foundation/signet/v0.1/codelists/submissionStatus.csv`
— a published URL in the `$id` namespace — has returned 404 since that commit. Observing the
period would have extended the outage by fourteen days.

**What this is.** `GOVERNANCE.md` requires a stated comment period before merge for every Tier 2
change and names no exception for urgency. The carve-out in
`governance/WITHDRAWAL-2026-08.md` is an exception to the proposal moratorium and explicitly
requires a stated comment period; it does not reach this. So the rule applied and was not
observed. That is a departure, not an exemption, and `GOVERNANCE.md:67` names such a merge a
defect in this process.

It is recorded as **D-29** rather than characterised as an exemption. Describing it otherwise
would be more flattering and less accurate.

**What follows.** Comment remains open for 14 calendar days from merge. The change will be
reversed or amended on any sustained objection. No comments had been received at merge.

**What does not stand.** Any claim that this record followed the process in full.

## Not included

- **The file is not re-bound.** It is not added to `closed` in `bindings.json`, no schema enum is
  generated from it, and no conformance check reads it. D-13's reasoning is unchanged.
- **D-13 is not reopened.** Its row in `governance/defects.md` stands as recorded.
- **The pinning question is not addressed.** Both consumers follow `main` rather than a tag, and
  their comments still describe a pinned tag. That is a separate task and is not decided here.
- **D-27 and D-28 stand open.** The absent public-interface declaration and the codelist format's
  inability to record a disposition are recorded, not fixed.

## Interests

The Standards Committee is not constituted and the interests and recusals register initiates on
constitution. Until then this is the disclosure, in plain terms and not by reference to any filed
record: this correction arises from work by the same natural person who operates both stewardship
identities, and the consumer it restores service to is a site that person also operates.

The correction rests on facts verifiable without reference to that: the URL returned 404, the two
consumers are readable in `concert-website`, and the restored file is byte-identical to what was
deleted.
