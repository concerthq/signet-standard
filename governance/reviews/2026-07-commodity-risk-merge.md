# Concert Foundation — Standards Committee Record of Resubmission Review

> **Note added 20 August 2026.** No Standards Committee was constituted when this decision was
> taken, and none is constituted now. The review was carried out under the bootstrap clause in
> [`governance/README.md`](../README.md#the-bootstrap-clause), and its outcome has the standing
> of an **interim resolution**: in force, reasoned in writing, and ratifiable, amendable or
> reversible by the Committee once it exists. The closing line "Recorded for the Standards
> Committee" is accurate — it was recorded *for* the Committee to consider, not *by* it. This
> note is added because the title reads as though a constituted body performed the review. The
> title is left as written rather than changed after the fact.

> **Note added 31 August 2026.** §1.3 ("Extension-field namespacing … satisfied") and §1.4
> ("`CoveragePolicy` as an Agent-layer `Policy` subtype … satisfied") describe the specification
> as submitted, not the schemas as merged. On `main` at v0.16.1 no core schema carries the
> namespaced additions, `CoveragePolicy` shares no schema with `Policy`, and the event types of
> spec §6 were not minted. Recorded as D-45..D-49 in `governance/defects.md`; remedies registered
> as `CP-Commodity-Risk-Linkage`. The finding does not disturb the merge outcome — the artifacts
> that landed pass CI and the checker — it corrects what this record claims about them.

**Subject:** `commodity-risk` extension v0.1 — resubmission review and merge
**Reference:** first review, `governance/reviews/2026-07-commodity-risk.md`
**Date:** 5 July 2026 · **Outcome:** **Merged as Working Draft**

## 1. Finding

The resubmitted extension satisfies the required changes and resolutions recorded at
first review. The Committee confirms:

1. **Vendor neutrality (§3.1, blocking)** — satisfied. All parties in the spec,
   schemas, and examples are neutral (`buyer.example`, `example-energy.example`);
   internal model names are replaced with generic descriptions; the automated vendor
   sweep over the merged artifacts returns no matches. The proposing organisation is
   acknowledged only in the submission record.
2. **Normative scope boundaries (§3.2)** — satisfied. The spec carries both clauses:
   not a trading-system schema, and not a regulatory-reporting mechanism.
3. **Extension-field namespacing (§3.3)** — satisfied. Core-object additions live
   under the `commodityRisk` key; no core `required` set or `additionalProperties`
   semantics altered.
4. **Layout and resolutions (§3.4, §4)** — satisfied. Extension id `commodity-risk`;
   `CoveragePolicy` as an Agent-layer `Policy` subtype; `{period, value}` array
   profiles; `PriceMark` retained in the extension and flagged as a core graduation
   candidate.

## 2. Technical artifacts

Landed at tag **v0.10.0**: six schemas, ten codelists (two closed), an eleven-file
full-loop worked example (belowMinimum → proposal → executed → withinCorridor,
arithmetically reconciled), and six conformance rules as an executable checker
(`conformance/rules/check-commodity-risk.js`) run in CI on every commit — three of
the rules are cross-object checks beyond schema validation. The checker was
negative-tested: a dataset violating reconciliation is rejected.

## 3. Status and terms

The extension is merged as a **Working Draft** under the CDM extension mechanism,
licensed **CC0 1.0** like the core. The contribution is covered by the proposing
organisation's executed **Corporate CLA**. Certification against the extension's
conformance rules, when offered, is available to all implementers on identical
terms; no contributor or operator, including the proposer, gains a preferential
position.

## 4. Process note

This closes the review opened at first submission: the first member-proposed
extension has now passed the full Concert process — submission, review with required
changes, resubmission, technical verification, merge — under the identical bar that
applies to any proposer.

*Recorded for the Standards Committee.*
