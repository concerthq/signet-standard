# EN 16931 & ViDA E-Invoicing

This is the one standards mapping in SIGNET that is not just asserted but **runnable and
continuously proven in CI**. The repository ships a reference transform that projects a
canonical SIGNET [Invoice](Process-Layer#invoice) into **UBL 2.1 / Peppol BIS Billing 3.0**
(EN 16931 compliant), and a verifier that reconciles the key Business Terms and the monetary
totals.

## Why this matters: EU ViDA

The EU **VAT in the Digital Age (ViDA)** package mandates structured, cross-border e-invoicing
based on the **EN 16931** semantic model (from July 2030), preceded by national B2B mandates.
A procurement network that cannot emit an EN 16931-conformant invoice cannot participate.

Because the SIGNET Invoice is mapped field-by-field to EN 16931, a SIGNET network can emit
**the exact artefact a tax authority or Peppol Access Point expects** — without a bespoke
integration per jurisdiction.

## The EN 16931 alignment

A SIGNET invoice carries **33 EN 16931 Business Terms / Groups** (BT-1…BT-158,
BG-4/7/23/25). The mapping lives in three places:

- [Invoice](Process-Layer#invoice) — header and totals (BT-1, BT-2, BT-3, BT-5, BG-4, BG-7,
  BT-106/109/110/112/115, BT-9, BT-20, …).
- [InvoiceLine](Foundation-Layer#invoiceline) — line detail (BG-25: BT-126, BT-129, BT-130,
  BT-131, BT-146, BT-151, BT-152, BT-153, BT-158).
- [VatBreakdown](Foundation-Layer#vatbreakdown) — VAT subtotals (BG-23: BT-116, BT-117,
  BT-118, BT-119).

Each schema field records its BT/BG reference in a `$comment`, so traceability is structural,
not documentary. (For why `$ref` fields are wrapped in `allOf`, see
[Foundation Layer → InvoiceLine](Foundation-Layer#invoiceline).)

## The runnable proof

Two npm scripts demonstrate convertibility end to end:

```bash
npm run transform     # projects examples/invoice.json -> examples/invoice.ubl.xml
npm run verify-ubl    # parses the UBL and reconciles every EN 16931 value
```

| Tool | Language | What it does |
|------|----------|--------------|
| `tools/signet-to-ubl.js` | Node (dependency-free) | Projects the canonical Invoice into UBL 2.1 / Peppol BIS Billing 3.0. Each mapping is annotated with its BT/BG reference. |
| `tools/verify-ubl.py` | Python | Parses the generated UBL and reconciles every key EN 16931 Business Term and the monetary totals against the source invoice; exits non-zero on mismatch. |
| `examples/invoice.ubl.xml` | — | The committed generated output, so the projection is visible without running it. |

Both run in **CI on every push** (see `.github/workflows/validate.yml`), so "convertible to
Peppol BIS" is a continuously-proven claim, not an assertion.

## The worked numbers

The worked invoice ([`examples/invoice.json`](Worked-Examples#invoice)) is arithmetically
self-consistent and reconciles end to end:

| Quantity | Value |
|----------|-------|
| Line 1 — Core router managed service, 100 × €50/MON | €5,000 net |
| Line 2 — Field engineering, 10 × €120/DAY | €1,200 net |
| **Line extension / tax-exclusive total** | **€6,200 net** |
| VAT @ 21% (category `S`) | €1,302 |
| **Tax-inclusive / payable amount** | **€7,502** |

`€6,200 net + €1,302 VAT @ 21% = €7,502 payable` — the verifier confirms each of these
survives the projection to UBL.

## Scope and limits

> The shipped transform is a **faithful reference projection, not a substitute for official
> Peppol validation.** Production use should additionally run the output through the official
> Peppol / EN 16931 **XSD + Schematron** validation artefacts.

See [CHANGELOG 0.3.0](https://github.com/concerthq/signet-standard/blob/main/CHANGELOG.md)
for the full description of the transform and verifier.

## Where to go next

- [Worked Examples → Invoice](Worked-Examples#invoice).
- [Standards Mapping](Standards-Mapping) — the full bridge table.
- [Validation & Conformance](Validation-and-Conformance) — how CI enforces all of this.
