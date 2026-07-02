# Extensions

The CDM is **extensible without forking**, following the OCDS extension pattern. Extensions
let domains elaborate the model (e.g. defence procurement, construction) while keeping the
core lean.

## What an extension is

> An extension is a **published, versioned package** that adds object types, fields, or
> codelist values **under its own namespace** (specification §11.1).

## The rules

1. **Add, don't change.** Extensions **MUST NOT** redefine or remove core fields. They only
   add new structure under their own namespace.
2. **Promotion path.** Community extensions **MAY** be submitted to Concert for review and,
   if broadly useful, promoted into the core model through the
   [change-control process](Governance-and-Versioning). This keeps the core lean while
   allowing domain-specific elaboration.
3. **Separate conformance.** Core [conformance](Validation-and-Conformance) is assessed
   against the **core model only**; extensions are conformance-assessed separately.

## Proposing an extension

Per [CONTRIBUTING.md](Contributing), extensions that *add* (rather than change) structure
should be proposed as packages under an `/extensions` path. The general flow:

1. Open an issue describing the gap the extension fills.
2. Define the new object types / fields / codelist values under a dedicated namespace.
3. Provide at least one example instance and the schema additions.
4. Submit a pull request; CI must pass.

See [Contributing](Contributing) and [Governance & Versioning](Governance-and-Versioning).

## Example: the Auction extension

The **[Auction extension](Process-Layer#auction)** (`docs/extensions/SIGNET_Auction_Extension_v0.1.md`)
is a worked example of the pattern. It adds two process-layer objects — `Auction` and `Bid` —
and one open codelist (`auctionType`), defining a standardised auction as a *profile of the
sourcing flow*. It **adds, does not change**: the close reuses the existing
[`Decision`](Agent-Layer#decision)/[`Award`](Process-Layer#award) objects, eligibility ties to
`SupplierQualification`, and the bid history is a hash-chained [`Event`](Trust-Layer#event)
trail — no core field is redefined.

Because it reuses the core objects and is broadly useful, it is shipped **in-tree** (under the
core `schema/`, `codelists/`, and `examples/` directories and the core `v0.1` namespace)
rather than as a separately-namespaced package — it is effectively a candidate already on the
[promotion path](Governance-and-Versioning). A domain extension that introduced genuinely new,
domain-specific structure would instead live under its own namespace per the rules above.

## Working Draft: the commodity-risk extension

The **commodity-risk extension** (`docs/extensions/SIGNET_Commodity_Risk_Extension_v0.1.md`)
is the first extension **proposed by a member organisation**, reviewed under the identical
process, terms, and bar that apply to any proposer (the Standards Committee's decision record
is in-repo at `governance/reviews/2026-07-commodity-risk.md`). It adds **portfolio-level
commodity risk governance** — positions, coverage corridors, price marks, coverage
assessments, price-shock scenarios, and hedge proposals — with electricity as the reference
commodity but a commodity-generic schema.

It is a good illustration of the **separately-namespaced** case above (contrast the in-tree
auction extension): its additions to core objects live under a dedicated **`commodityRisk`**
namespace and MUST NOT alter any core object's `required` set or `additionalProperties`
semantics. It still **adds, does not change** — an approved `HedgeProposal` instantiates a
core [`Need`](Process-Layer#need); the coverage corridor is a subtype of the Agent-layer
[`Policy`](Agent-Layer#policy) so it bounds a synthetic agent's `Mandate`; and every
assessment is a hash-anchored [`Event`](Trust-Layer#event).

**Status: Working Draft spec, accepted in principle.** Only the prose spec has landed so far;
schemas (in the `concert.foundation/signet` namespace), codelists, a validated worked example,
and the six conformance rules are a **separate change still to come**, so the extension is not
yet in-tree under `schema/`, `codelists/`, or `examples/`, and no tag has been cut for it.

## Relationship to the agent layer

Note that the [Agent Layer](Agent-Layer) is **not** an extension — it is core, SIGNET's
original contribution. Extensions are for *additional* domain structure on top of the core
four-layer model.
