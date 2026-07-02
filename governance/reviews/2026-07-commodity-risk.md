# Concert Foundation — Standards Committee Review Memo

**Subject:** Extension proposal `energy-hedging` v0.1 (submitted) → accepted in
principle as **`commodity-risk`**
**Status:** Accepted in principle, subject to required changes · Working Draft track
**Date:** 2 July 2026
**Process note:** This is the first domain extension proposed by a member
organisation. It is reviewed under the identical process, terms, and bar that apply
to any proposer. No preferential path exists for any member, founding or otherwise.

---

## 1. Decision

The Committee accepts the proposal in principle. The extension addresses a genuine
gap in the core standard — portfolio-level commodity risk governance, the dominant
procurement pattern for energy and other traded commodities — and does so without
forking the core process chain. Acceptance is subject to the required changes in §3
and the resolutions in §4. On completion, the extension enters the standard as a
Working Draft under the extension mechanism, licensed CC0 like the core.

## 2. What the Committee found strong

- **The process chain is not forked (proposal D1).** An approved `HedgeProposal`
  instantiates a core `Need`; everything downstream — SourcingEvent, Award, Contract —
  is unmodified core. This is the correct relationship between a domain extension and
  the core, and the decision most submissions get wrong.
- **Positions derive from Contracts (D2).** No parallel contract register.
- **Risk policy is an Agent-layer `Policy` subtype (D3).** The same corridor that
  constrains a human decision bounds a synthetic agent's `Mandate`, making the
  extension agent-native rather than a reporting schema. This is the property that
  makes it a SIGNET extension.
- **Assessments are hash-anchored Events (D4).** The Trust layer is reused correctly;
  `snapshot.published` with a content hash provides immutable, comparable,
  time-stamped portfolio states.
- **Reconciliation is conformance, not convention (D5).** Hedged + floating =
  mark-to-market, enforced by the suite.
- **The system-of-record boundary.** Execution systems (ETRM/treasury) remain systems
  of record; the extension is their governed network representation. This is the
  correct scope line, consistent with the onboarding extension's screening boundary.

## 3. Required changes before merge

1. **Vendor neutrality (blocking).** The published extension and all examples MUST be
   vendor-neutral. All party identifiers, names, and organisation-specific terms in
   examples are replaced with neutral parties (e.g. `party-buyer-de`). Internal model
   names are replaced with generic descriptions (a corridor/coverage matrix). The
   proposing organisation may be acknowledged in the submission record; it MUST NOT
   appear in the merged artifact, its schemas, examples, or documentation.
2. **Normative scope boundaries.** Two boundary clauses are promoted to normative
   text: (a) the extension is not a trading-system schema (no order books, execution,
   margining, exchange connectivity); (b) the extension is **not a regulatory
   reporting mechanism** — its records do not constitute and MUST NOT be represented
   as market-abuse or trade-reporting submissions under any regulatory regime.
   Implementations MUST NOT claim otherwise. (Same "no overclaim" discipline as the
   auction extension's collusion clause and the onboarding extension's screening
   boundary.)
3. **Extension-field namespacing.** All additions to core objects live under the
   extension's namespace key (`commodityRisk`) and MUST NOT alter any core object's
   `required` set or `additionalProperties` semantics, per the CDM extension
   mechanism.
4. **Layout.** Restructure to the standard's extension conventions (per the auction
   extension): spec document, Draft-07 schemas with `$id`s in the
   `concert.foundation/signet` namespace, codelists as CSV, validated worked example,
   conformance rules.

## 4. Resolutions of the proposer's open questions

1. **`CoveragePolicy` is a subtype of the Agent-layer `Policy`** (as proposed).
   Rationale: mandate enforcement is the extension's distinctive property; a
   standalone object would decouple risk policy from agent governance and reduce this
   to reporting. Corridor-specific fields live in the extension subtype; the base
   `Policy` is unchanged.
2. **Extension id is `commodity-risk`** (commodity-generic), not `energy-hedging`.
   The pattern and schema are commodity-generic by the proposer's own analysis;
   electricity is the reference commodity in examples. The general vocabulary is the
   one worth standardising.
3. **Volume profiles are an array of `{period, value}`** with a defined period-key
   convention, not a fixed twelve-key object. A fixed monthly, April-start shape is a
   production convenience, not a normative structure; the array admits sub-monthly
   granularity and any fiscal calendar. Profiles MAY constrain to fixed-12 locally.
4. **`PriceMark` remains in the extension for v0.1**, designed self-contained and
   commodity-generic, and is flagged as a **core graduation candidate**: promotion to
   core occurs when a second real consumer exists (e.g. auction reference pricing or
   indexed contracts), not on speculation. The auction extension's price handling and
   `PriceMark` are to be designed to compose.

## 5. Contribution terms

The proposing organisation executes the **Corporate CLA** covering the contribution
(copyright licence + W3C-model patent licence to essential claims; contributor
retains ownership; no contributor or operator gains a preferential position). The
extension is published CC0, matching the core. Certification against the extension's
conformance rules, when available, is offered on identical terms to all
implementers.

## 6. Next steps

1. Proposer resubmits the restructured, vendor-neutral spec (§3, §4) —
   `commodity-risk` v0.1.
2. Technical track: schemas, codelists, validated worked example, and the six
   conformance rules delivered as a patch to `signet-standard`.
3. Committee review of the resubmission; on pass, merge as Working Draft and record
   in the changelog.
4. Optional follow-on (not gating): a runnable hedging-agent demonstration in the
   pattern of the existing demo set.

*Recorded for the Standards Committee. This memo is the governance record of first
review; the resubmitted spec is the technical artifact.*
