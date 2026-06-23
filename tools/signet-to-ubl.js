#!/usr/bin/env node
/*
 * signet-to-ubl.js
 * Projects a SIGNET Canonical Data Model Invoice into a UBL 2.1 Invoice
 * conforming to Peppol BIS Billing 3.0 (EN 16931 compliant).
 *
 * Usage:  node tools/signet-to-ubl.js [path/to/invoice.json] > out.xml
 * Default input: examples/invoice.json
 *
 * This is a reference projection, not a validator. It demonstrates that a
 * SIGNET invoice carries exactly the EN 16931 Business Terms that UBL / Peppol
 * BIS Billing require. Each mapping is annotated with its BT/BG reference.
 *
 * Licensed CC0 1.0 by Concert Foundation.
 */
const fs = require("fs");
const path = require("path");

/**
 * Pure transform: SIGNET canonical Invoice -> Peppol BIS Billing 3.0 UBL string.
 * No I/O; safe to import in Node or the browser.
 */
function toUBL(inv) {
  // --- helpers ---
const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const date = (dt) => (dt ? String(dt).slice(0, 10) : undefined);   // ISO date-time -> date (UBL)
const money = (v) => (v == null ? undefined : Number(v.amount).toFixed(2));
const cur = (v) => (v && v.currency) || inv.currency;

// Map a SIGNET Identifier to a UBL party scheme.
// Peppol/ICD: LEI = 0199. DIDs have no ICD code; emit as plain ID (demonstration).
const PARTY_SCHEME = { "gleif:lei": "0199" };
function companyId(idObj) {
  const scheme = PARTY_SCHEME[idObj.scheme];
  return scheme
    ? `<cbc:CompanyID schemeID="${scheme}">${esc(idObj.id)}</cbc:CompanyID>`
    : `<cbc:CompanyID>${esc(idObj.id)}</cbc:CompanyID>`;
}

const L = [];                       // line buffer
const w = (s) => L.push(s);

// --- document header ---
w(`<?xml version="1.0" encoding="UTF-8"?>`);
w(`<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"`);
w(`         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"`);
w(`         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">`);
// Peppol BIS Billing 3.0 customization + profile
w(`  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>`);
w(`  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>`);
w(`  <cbc:ID>${esc(inv.id.id)}</cbc:ID>`);                                   // BT-1
w(`  <cbc:IssueDate>${date(inv.issueDate)}</cbc:IssueDate>`);               // BT-2
if (inv.paymentDueDate) w(`  <cbc:DueDate>${date(inv.paymentDueDate)}</cbc:DueDate>`); // BT-9
w(`  <cbc:InvoiceTypeCode>${esc(inv.invoiceTypeCode || "380")}</cbc:InvoiceTypeCode>`); // BT-3
w(`  <cbc:DocumentCurrencyCode>${esc(inv.currency)}</cbc:DocumentCurrencyCode>`);       // BT-5

// references
if (inv.order) {                                                            // BT-13
  w(`  <cac:OrderReference><cbc:ID>${esc(inv.order.id)}</cbc:ID></cac:OrderReference>`);
}
if (inv.contract) {                                                         // BT-12
  w(`  <cac:ContractDocumentReference><cbc:ID>${esc(inv.contract.id)}</cbc:ID></cac:ContractDocumentReference>`);
}

// seller (BG-4)
w(`  <cac:AccountingSupplierParty><cac:Party><cac:PartyLegalEntity>`);
w(`    ${companyId(inv.seller)}`);                                          // BT-27/BT-30
w(`  </cac:PartyLegalEntity></cac:Party></cac:AccountingSupplierParty>`);
// buyer (BG-7)
w(`  <cac:AccountingCustomerParty><cac:Party><cac:PartyLegalEntity>`);
w(`    ${companyId(inv.buyer)}`);                                           // BT-44/BT-47
w(`  </cac:PartyLegalEntity></cac:Party></cac:AccountingCustomerParty>`);

// payment terms (BT-20)
if (inv.paymentTerms) {
  w(`  <cac:PaymentTerms><cbc:Note>${esc(inv.paymentTerms)}</cbc:Note></cac:PaymentTerms>`);
}

// tax total (BG-22 / BT-110) with VAT breakdown (BG-23)
const taxTotal = money(inv.taxTotal);
w(`  <cac:TaxTotal>`);
w(`    <cbc:TaxAmount currencyID="${cur(inv.taxTotal)}">${taxTotal}</cbc:TaxAmount>`); // BT-110
for (const vb of (inv.vatBreakdown || [])) {
  w(`    <cac:TaxSubtotal>`);
  w(`      <cbc:TaxableAmount currencyID="${cur(vb.taxableAmount)}">${money(vb.taxableAmount)}</cbc:TaxableAmount>`); // BT-116
  w(`      <cbc:TaxAmount currencyID="${cur(vb.taxAmount)}">${money(vb.taxAmount)}</cbc:TaxAmount>`);                 // BT-117
  w(`      <cac:TaxCategory>`);
  w(`        <cbc:ID>${esc(vb.categoryCode)}</cbc:ID>`);                    // BT-118
  w(`        <cbc:Percent>${vb.rate}</cbc:Percent>`);                       // BT-119
  w(`        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>`);
  w(`      </cac:TaxCategory>`);
  w(`    </cac:TaxSubtotal>`);
}
w(`  </cac:TaxTotal>`);

// legal monetary total (BG-22)
w(`  <cac:LegalMonetaryTotal>`);
w(`    <cbc:LineExtensionAmount currencyID="${cur(inv.lineExtensionTotal)}">${money(inv.lineExtensionTotal)}</cbc:LineExtensionAmount>`); // BT-106
w(`    <cbc:TaxExclusiveAmount currencyID="${cur(inv.taxExclusiveTotal)}">${money(inv.taxExclusiveTotal)}</cbc:TaxExclusiveAmount>`);     // BT-109
w(`    <cbc:TaxInclusiveAmount currencyID="${cur(inv.taxInclusiveTotal)}">${money(inv.taxInclusiveTotal)}</cbc:TaxInclusiveAmount>`);     // BT-112
w(`    <cbc:PayableAmount currencyID="${cur(inv.payableAmount)}">${money(inv.payableAmount)}</cbc:PayableAmount>`);                       // BT-115
w(`  </cac:LegalMonetaryTotal>`);

// invoice lines (BG-25)
for (const ln of inv.lines) {
  w(`  <cac:InvoiceLine>`);
  w(`    <cbc:ID>${esc(ln.id)}</cbc:ID>`);                                  // BT-126
  if (ln.note) w(`    <cbc:Note>${esc(ln.note)}</cbc:Note>`);              // BT-127
  const uom = ln.unitOfMeasure || "C62";
  w(`    <cbc:InvoicedQuantity unitCode="${esc(uom)}">${ln.quantity}</cbc:InvoicedQuantity>`); // BT-129/130
  w(`    <cbc:LineExtensionAmount currencyID="${cur(ln.netAmount)}">${money(ln.netAmount)}</cbc:LineExtensionAmount>`); // BT-131
  w(`    <cac:Item>`);
  w(`      <cbc:Name>${esc(ln.itemName)}</cbc:Name>`);                     // BT-153
  if (ln.vatCategoryCode) {
    w(`      <cac:ClassifiedTaxCategory>`);
    w(`        <cbc:ID>${esc(ln.vatCategoryCode)}</cbc:ID>`);             // BT-151
    if (ln.vatRate != null) w(`        <cbc:Percent>${ln.vatRate}</cbc:Percent>`);
    w(`        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>`);
    w(`      </cac:ClassifiedTaxCategory>`);
  }
  if (ln.classification) {                                                 // BT-158
    const listId = (ln.classification.scheme || "").toUpperCase();
    w(`      <cac:CommodityClassification>`);
    w(`        <cbc:ItemClassificationCode listID="${esc(listId)}">${esc(ln.classification.id)}</cbc:ItemClassificationCode>`);
    w(`      </cac:CommodityClassification>`);
  }
  w(`    </cac:Item>`);
  if (ln.itemNetPrice) {
    w(`    <cac:Price><cbc:PriceAmount currencyID="${cur(ln.itemNetPrice)}">${money(ln.itemNetPrice)}</cbc:PriceAmount></cac:Price>`); // BT-146
  }
  w(`  </cac:InvoiceLine>`);
}

w(`</Invoice>`);
  return L.join("\n") + "\n";
}

// --- CLI wrapper ---
if (require.main === module) {
  const inPath = process.argv[2] || path.join(__dirname, "..", "examples", "invoice.json");
  const inv = JSON.parse(fs.readFileSync(inPath, "utf8"));
  process.stdout.write(toUBL(inv));
}

module.exports = { toUBL };
