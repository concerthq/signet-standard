# CP-Quantity-Unit

**Status:** Draft — not yet balloted. Registered under IAR-0006.
> *Registered pre-constitution under IAR-0006. Registration is not adoption and does not pre-empt the Committee's agenda.*

**Origin:** the steward's review of a shipped extension that the steward's implementer-advisory role proposed; the underlying gap was first found on the KTDDE crosswalk. **Recusal:** the steward is recused from adoption; recorded at interests register entry 4.
**Affects:** `schema/definitions.schema.json`, `schema/order.schema.json`, `schema/contract.schema.json`, `schema/exposure-position.schema.json`, `schema/hedge-proposal.schema.json`, `schema/price-mark.schema.json`, `schema/coverage-assessment.schema.json`, `examples/`, `conformance/rules/`, `docs/specification.md`, `docs/extensions/commodity-risk.md` §7, `wiki/Foundation-Layer.md`, `wiki/Process-Layer.md`
**Target:** the next v0.x minor after registration
**Breaking:** Core — no (optional additions). Extension — yes at the unit-string level: `MWh` becomes `MWH`; the extension is a Working Draft and the only instances on record are its own examples
**Depends on:** none. Independent of CP-Commodity-Risk-Linkage; the two touch different properties of the same extension schemas
**Blocks:** any energy-supply `Order` or `Contract` in core; `PriceMark` graduation (a graduated object must not carry a free-text unit)

---

## 1. Problem statement

- **D-50.** Unit of measure is written three ways — a dangling `Unit` definition, a Rec 20 string on `InvoiceLine`, and seven free strings in the extension — and `Item.quantity` has no unit at all. The core can express an invoice for 100 MWh and cannot express the order for it.
- **D-51.** Delivery period is written two ways — `Period` on `Order`, a `{year, basis, profile}` block copied into four extension schemas — and `Contract` has no delivery surface. Nothing names a delivery point.

Both were first seen on the KTDDE crosswalk as core gaps. The shipped extension is now a second, in-tree consumer that had to invent its own answer to each; the promotion test the extension's own `PriceMark` note sets ("when a second real consumer exists") is met by the extension itself.

## 2. Proposal

### 2.1 One unit convention (D-50)

`definitions.schema.json` gains `UnitCode`: `{"type": "string", "pattern": "^[A-Z0-9]{2,3}$", "$comment": "UN/ECE Recommendation 20 common code"}`. Then:

- `Item` gains optional `unitOfMeasure` → `#/definitions/UnitCode`. The field name mirrors `InvoiceLine.unitOfMeasure`, so an order line and its invoice line say the same thing the same way.
- `InvoiceLine.unitOfMeasure` is retyped from bare string to `#/definitions/UnitCode`. Every conforming instance already satisfies the pattern (the EN 16931 BT-130 value space is Rec 20); the worked invoice uses `MON` and `DAY`.
- The extension's seven `unit` sites (D-50 lists them) are retyped to `#/definitions/UnitCode`. Examples change `MWh` → `MWH`.
- `Unit` (the dangling definition) is **removed**. Zero references; nothing breaks; `Item.unitPrice` already carries the price. Removal of an unreferenced definition is not a breaking change to any instance. Recorded because deleting from `definitions` is otherwise a D-24-shaped act.

No unit *codelist* is shipped: Rec 20 has several hundred codes and is maintained by UN/CEFACT; a copy would be the D-1 pattern against an external authority. The pattern plus the `$comment` is the binding; a harness rule can check membership against a vendored Rec 20 list later if the Committee wants it.

### 2.2 Quantity on `Item` (D-50)

`Item.quantity` stays a number. With §2.1 it is now a quantity *of something*. The specification §Item row gains: "`unitOfMeasure` SHOULD be present whenever `quantity` is." Not MUST — the existing examples (100 × `MON`) would need it, and they are updated, but an implementer's services line with `quantity: 1` and no unit remains valid.

### 2.3 One delivery primitive (D-51)

`definitions.schema.json` gains:

```
DeliveryProfile {
  unit:          UnitCode                      (required)
  deliveryPoint: Identifier                    (optional — e.g. scheme "eic", see CP-Market-Identifiers)
  basis:         string                        (optional — codelist deliveryBasis)
  values[]:      { period: string, value: number }   (required, ≥1)
}
```

`period` is an ISO 8601 month (`YYYY-MM`) or a finer ISO interval, exactly as spec §7 already states normatively. Then:

- `Order` gains optional `deliveryProfile` → `DeliveryProfile`. `deliveryPeriod` (a `Period`) stays; the two are complementary — a window versus a shape.
- `Contract` gains optional `deliveryProfile` → `DeliveryProfile`. This is the smallest delivery surface that lets a supply contract state what it delivers and when without giving `Contract` an `items` array (which is a larger question this CP does not take).
- `ExposurePosition.deliveryPeriod.profile` becomes a `$ref` to `DeliveryProfile`; `year` and `basis` stay beside it as the extension's indexing keys. The three `{year, basis}`-only sites (`HedgeProposal`, `PriceMark`, `CoverageAssessment`) are unchanged — they index a period, they do not carry a profile.
- `codelists/deliveryBasis.csv` (extension, `open`) becomes the value space for `DeliveryProfile.basis` and moves to core status in `wiki/Codelists.md`; the file does not move.

`deliveryPoint` is the first place the standard can say *where*. It is an `Identifier` so any scheme works today (`did`, `gs1:gln`) and `eic` works once CP-Market-Identifiers lands.

## 3. Schema changes

Core, additive: `UnitCode`, `DeliveryProfile` in `definitions`; `Item.unitOfMeasure`; `Order.deliveryProfile`; `Contract.deliveryProfile`; `InvoiceLine.unitOfMeasure` retyped (non-breaking in practice; stated as a retype). Core, removal: `Unit` (unreferenced). Extension: seven `unit` retypes; one `profile` `$ref`. Whether `DeliveryProfile` carries the Part 1 pattern is gate E-1 material, as for `Criterion` and `Response` in CP-Requirement-Sockets §3; this CP follows whatever E-1 decides.

## 4. Conformance suite changes

`conformance/rules/check-quantity-unit.js`: **QU-1** every `unitOfMeasure` matches `UnitCode`; **QU-2** a `DeliveryProfile.values[]` `period` parses as ISO month or interval and the array is strictly ascending; **QU-3** where an `Order` carries both `deliveryPeriod` and `deliveryProfile`, every `period` lies within the `Period`; **QU-4** the extension's reconciliation (rule 1) compares volumes only where `unit` is equal — a check the checker currently does not make, so `100 MWH` and `100 GWH` reconcile today. Fixtures: `examples/order-delivery-profile.json` (a shaped monthly electricity order, `MWH`, twelve values, a `deliveryPoint`), `examples/contract-delivery-profile.json`, and an invalid fixture with mixed units in one assessment.

## 5. Backward compatibility

Non-breaking for every core instance on record. `InvoiceLine.unitOfMeasure` retype: any instance with a non-Rec-20 value was already non-conformant to EN 16931. Extension examples change `MWh` → `MWH`; the Working Draft has no other instances on record. No re-certification (none has been issued).

## 6. Rejected alternatives

**A — Bind `Item` to the existing `Unit` definition.** Declined: `Unit` carries `unitPrice`, which `Item` already has; binding would create two prices per line. And it diverges from `InvoiceLine`, which is the field the invoice projection reconciles.
**B — Ship a Rec 20 codelist.** Declined: several hundred rows copied from an external authority, the D-1 pattern; the pattern is the binding.
**C — Give `Contract` an `items[]` array.** Declined here: a larger modelling decision (contract lines versus order lines versus obligations) that the delivery question does not require; `deliveryProfile` is the smallest surface. Re-proposal welcome on its own merits.
**D — Promote the extension's full `{year, basis, profile}` block to core.** Declined: `year` and `basis` are portfolio indexing keys, not delivery facts; only the profile generalises.

## 7. Held — not defect-remedying, waits for constitution

Recorded so the crosswalk findings are not lost, and explicitly **not** part of this registration under IAR-0006 §1(a):

- `Order` has no order date (KTDDE crosswalk). Candidate: optional `issueDate` (`date-time`), the UBL 2.3 `IssueDate` name.
- `Classification.scheme` is unconstrained (`examples: cpv, unspsc, gsin`). Candidate: `codelists/classificationScheme.csv`, `open`, with `cpv`, `unspsc`, `gsin`, `hs`, `cn` — the last two for the customs crosswalk.
- `Contract.items[]` — see rejected alternative C.
