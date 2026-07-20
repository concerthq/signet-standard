# Auction Certification

The **SIGNET Auction Conformance Profile** (`auction-platform`) is the standard's
**first product-certification path**: the bar an electronic-auction platform clears to
carry the **"SIGNET Certified — Auction Platform"** mark. It adds nothing normative — it
**composes** already-shipped artifacts (the [auction](Extensions) and identity
extensions plus the public conformance suite) and names the subset a *platform* must
demonstrate.

This page summarises the profile. The authoritative document is
[`docs/profiles/auction-platform.md`](https://github.com/concerthq/signet-standard/blob/main/docs/profiles/auction-platform.md).

## What the mark warrants — and doesn't

It warrants that a platform closes auctions **deterministically**, keeps a
**tamper-evident** record, and records **governed** awards — all re-runnable by anyone
with the public tooling. It does **not** warrant bidding UX, latency, or availability,
and — like the auction extension itself — it does **not** and **cannot** warrant against
collusion or shill bidding. The mark covers the **rules and the record**, not participant
behaviour.

## The five requirements

- **AP-1 · Valid objects** — every `Auction` and `Bid` validates against the published
  schemas; invalid objects are rejected.
- **AP-2 · Deterministic close** — the recorded winner *is* the deterministic function of
  the bids and published `rules`, verified by rule-check **and** by replay (re-running the
  bid sequence reproduces the identical award). This is the one property that must live in
  the platform itself.
- **AP-3 · Tamper-evident record** — bids and the close form an append-only, hash-chained
  `Event` trail; any alteration is detectable.
- **AP-4 · Governed awards** — the close is a `Decision` with rationale, the bids
  considered, the rules applied, and provenance, with verifiable human approval where the
  mandate threshold requires it.
- **AP-5 · No personal data in the chain** — person references are pseudonymous, per the
  identity profile.

AP-1/AP-2/AP-3 are exactly what the
[auction demonstration](https://github.com/concerthq/signet-standard/tree/main/auction)
exercises in the browser: run the auction, re-run it to the identical award, tamper with
a bid to watch verification fail. AP-2 (and AP-1) are machine-checked by
[`conformance/rules/check-auction.js`](https://github.com/concerthq/signet-standard/blob/main/conformance/rules/check-auction.js).

## The process

Identical for every implementer, with no discretionary gate:

**self-test** (run the public suite, produce a report) → **submit** (report + adapter +
versions) → **reproduce** (Concert re-runs the identical tooling) → **registry** (public
listing of the confirmed pass) → **challenge** (the suite is public, so anyone may re-run
the checks against a certified platform at any time — the mark is self-policing).

This is the general [certification process](Conformance-Harness) applied to the auction
profile; terms are published before any party certifies and are identical for all.
