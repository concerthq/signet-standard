#!/usr/bin/env python3
"""
verify-ubl.py — proves the SIGNET -> Peppol BIS Billing 3.0 UBL projection is faithful.

Parses the generated UBL invoice (well-formedness check), then reconciles the key
EN 16931 Business Terms and the monetary totals against the source SIGNET invoice.
Exits non-zero on any mismatch, so it can run as a CI gate.

Usage:  python3 tools/verify-ubl.py [examples/invoice.ubl.xml] [examples/invoice.json]
"""
import sys, json
import xml.etree.ElementTree as ET

ubl_path = sys.argv[1] if len(sys.argv) > 1 else "examples/invoice.ubl.xml"
src_path = sys.argv[2] if len(sys.argv) > 2 else "examples/invoice.json"

ns = {
    "cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    "cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
}

root = ET.parse(ubl_path).getroot()           # raises on malformed XML
src = json.load(open(src_path))

def t(p):
    e = root.find(p, ns)
    return e.text if e is not None else None

checks = [
    ("BT-1  Invoice number", t("cbc:ID"), src["id"]["id"]),
    ("BT-2  Issue date", t("cbc:IssueDate"), src["issueDate"][:10]),
    ("BT-5  Currency", t("cbc:DocumentCurrencyCode"), src["currency"]),
    ("BT-3  Invoice type", t("cbc:InvoiceTypeCode"), src.get("invoiceTypeCode", "380")),
    ("BT-106 LineExtension", t("cac:LegalMonetaryTotal/cbc:LineExtensionAmount"), f'{src["lineExtensionTotal"]["amount"]:.2f}'),
    ("BT-109 TaxExclusive", t("cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount"), f'{src["taxExclusiveTotal"]["amount"]:.2f}'),
    ("BT-110 TaxTotal", t("cac:TaxTotal/cbc:TaxAmount"), f'{src["taxTotal"]["amount"]:.2f}'),
    ("BT-112 TaxInclusive", t("cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount"), f'{src["taxInclusiveTotal"]["amount"]:.2f}'),
    ("BT-115 Payable", t("cac:LegalMonetaryTotal/cbc:PayableAmount"), f'{src["payableAmount"]["amount"]:.2f}'),
]

lines = root.findall("cac:InvoiceLine", ns)
checks.append(("BG-25 line count", str(len(lines)), str(len(src["lines"]))))

# Arithmetic reconciliation independent of the source totals.
line_sum = sum(float(l.find("cbc:LineExtensionAmount", ns).text) for l in lines)
te = float(t("cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount"))
tt = float(t("cac:TaxTotal/cbc:TaxAmount"))
ti = float(t("cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount"))
checks.append(("Sum(line nets) == BT-106", f"{line_sum:.2f}", f'{src["lineExtensionTotal"]["amount"]:.2f}'))
checks.append(("BT-109 + BT-110 == BT-112", f"{te + tt:.2f}", f"{ti:.2f}"))

print("UBL is well-formed.\n")
ok = True
for name, got, exp in checks:
    p = (got == exp)
    ok = ok and p
    print(f"  [{'OK' if p else 'XX'}] {name}: {got}" + ("" if p else f"  (expected {exp})"))

if not ok:
    print("\nMISMATCH DETECTED.")
    sys.exit(1)
print("\nAll checks passed — SIGNET -> Peppol BIS Billing projection is faithful.")
