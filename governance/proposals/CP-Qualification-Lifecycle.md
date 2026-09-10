# CP-Qualification-Lifecycle

**Status:** Draft — not yet balloted. Registered under IAR-0006.
> *Registered pre-constitution under IAR-0006. Registration is not adoption and does not pre-empt the Committee's agenda.*

**Origin:** EAE-0001 #2 and #3a — an external analyst enquiry received 9 September 2026 (`governance/EAE-0001.md`). **Recusal:** the originator is a candidate for appointment to the Standards Committee; on appointment the originator is recused from the adoption vote on this proposal, which is then decided by the other member. Recorded at intake in `governance/EAE-0001.md`; it enters the interests register through the members' declarations at execution (register row 3), not before, because a pre-constitution entry would identify a candidate ahead of the appointments register.
**Affects:** `schema/supplier-qualification.schema.json`, `state-model/state-model.json` (`SupplierQualification` is declared `modelled: false`), `docs/extensions/onboarding.md`, `onboarding/`
**Target:** undecided — the gates below decide the shape before a release can be named
**Breaking:** undecided by design. QL-1 and QL-2 have both a non-breaking additive form and a breaking restructuring form; choosing between them is the Committee's, and naming one here would pre-empt it
**Depends on:** D-57's resolution (QL-2 must resolve consistently with it — same question, second surface); the D-39 extension-space pattern (stage vocabularies are org-specific at the edges)
**Blocks:** nothing shipped. It blocks any state-model declaration for `SupplierQualification`, which is `modelled: false` today with the rationale that `conditional` "interacts with the conditions array and needs the extension maintainer's basis" — QL-3 is that basis question

---

## Registration basis under IAR-0006 §1(a)

The defect recorded in `governance/defects.md` that this proposal remedies is **D-57** — a
governed category has no artifact home — on its second surface. D-57 records the problem in
`Policy`; QL-2 records the same problem in `SupplierQualification`, and one design decision has
to answer both. D-57 was recorded before this branch (merged at `cd44cb6`), so the basis is not
circular.

QL-1 and QL-3 are carried in the same proposal because they are the same record's lifecycle and
cannot sensibly be separated from QL-2 — a per-category determination and a staged determination
are two facets of one restructuring. Neither is separately grounded in a recorded defect, and this
paragraph exists so that is on the record rather than inferred.

## Problem

`SupplierQualification` models qualification as one record with one `status`
(`active | conditional | suspended | expired | offboarded`) plus a flat `classifications` array,
under `additionalProperties: false`. Practice reported by EAE-0001, consistently across enterprise
and public buyers:

1. **Qualification is staged.** Pre-qualification ("should we talk to them"), qualification to
   bid, selection into a sourcing event, and post-bid or post-award qualification are different
   determinations with different criteria, different evaluators, and different consequences. Stage
   *names* vary by organisation; the stage *distinctions* do not.
2. **Qualification is category-scoped.** "Approved for construction equipment, not construction
   services" cannot be said: `classifications` lists the categories, and `status` speaks once for
   all of them. This is D-57's question on a second surface — the category a determination governs
   needs a home in the artifact, whether that artifact is a `Policy` or a `SupplierQualification`.
3. **Post-bid qualification inverts the assumed order.** The model implies qualify → bid → award;
   practice includes bid → win → qualify. Any state-model coupling between `SourcingEvent`,
   `Submission`, `Award` and `SupplierQualification` must not hard-code the first ordering.

## Gates (named now, argued later)

⛔ **QL-1 — Stage representation.** Typed stages on one record, per-stage records linked by
lineage, or stage-as-classification-of-determination? Interacts with the D-39 extension pattern:
stage vocabularies are org-specific at the edges.

⛔ **QL-2 — Category-scoped status.** Status per classification, or a determination-per-category
record? Must resolve consistently with D-57's answer for `Policy`.

⛔ **QL-3 — Ordering.** Which transitions, if any, does the state model constrain between
qualification stage and sourcing-event participation? Post-bid qualification must remain
expressible. This is the basis `state-model/state-model.json` says it is waiting for.

## Explicitly not proposed here

**A stage vocabulary.** Naming varies by organisation (EAE-0001 #2); freezing names before the
extension-composition question resolves would repeat the D-39 mistake on a new field.

**A remedy for D-61.** Per-criterion evaluators are the neighbouring defect, not this one. They
meet at QL-1: if stages carry their own evaluators, the two remedies must agree on what an
evaluator reference points at — which SE-0002 Q2 has to answer first.

## Cross-references

D-57 (governed category has no artifact home — the registration basis), D-61 (`Evaluation` admits
one evaluator; `Score` forecloses more), CP-Extension-Composition (org-specific stage names are
extension pressure in miniature), SE-0002 Q2 (organisational-unit granularity).
