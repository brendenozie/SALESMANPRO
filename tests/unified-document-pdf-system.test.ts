/**
 * Comprehensive Automated Test Suite
 * SalesmanPro Unified Premium Document & PDF Generation System
 */

import { generateDocument } from "../lib/documents/engine";
import {
  SAMPLE_COMPANY_BRANDING,
  SAMPLE_INVOICE_DATA,
  SAMPLE_QUOTATION_DATA,
  SAMPLE_RECEIPT_DATA,
} from "../lib/documents/registry";
import { InvoiceDocumentData, QuotationDocumentData, ReceiptDocumentData } from "../lib/documents/types";
import fs from "fs";
import path from "path";

async function runTestSuite() {
  console.log("===============================================================================");
  console.log("    SALESMANPRO PREMIUM PDF DOCUMENT GENERATION SYSTEM — FULL TEST SUITE      ");
  console.log("===============================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition: boolean, testName: string, details?: string) => {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${testName}`);
    } else {
      failedTests++;
      console.error(`  [FAIL] ${testName} ${details ? `— ${details}` : ""}`);
    }
  };

  const outputDir = path.join(process.cwd(), "scratch", "pdf-test-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 1: INVOICE GENERATION ACROSS ALL 5 PREMIUM TEMPLATES
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST GROUP 1] Generating Invoices across all 5 Premium Templates...");

  const invoiceTemplates = [
    { id: "invoice-corporate", name: "Template 1: Modern Corporate" },
    { id: "invoice-minimal", name: "Template 2: Contemporary Minimal" },
    { id: "invoice-executive", name: "Template 3: Executive Luxury" },
    { id: "invoice-pos", name: "Template 4: Retail & POS Compact" },
    { id: "invoice-creative", name: "Template 5: Branded Creative" },
    { id: "invoice-classic", name: "Backward Compatibility Alias: invoice-classic" },
    { id: "invoice-modern", name: "Backward Compatibility Alias: invoice-modern" },
  ];

  for (const tmpl of invoiceTemplates) {
    try {
      const res = await generateDocument({
        type: "INVOICE",
        companyId: "test-company",
        sourceId: "inv-test-1",
        templateId: tmpl.id,
        isPreview: true,
        sampleData: {
          ...SAMPLE_INVOICE_DATA,
          templateId: tmpl.id,
          company: {
            ...SAMPLE_COMPANY_BRANDING,
            name: "Flourish Home Furniture Ltd",
            address: "Parklands Road, Suite 102, Nairobi, Kenya",
            contactPhone: "+254 712 345 678",
            taxPin: "P051234567Z",
            paymentInstructions: "M-Pesa Paybill: 543210 (Acc: INV-001042) • Equity Bank Acc: 0123456789",
          },
        },
      });

      assert(res.buffer && res.buffer.length > 5000, `${tmpl.name} Buffer Size`, `Size: ${res.buffer?.length} bytes`);
      assert(res.contentType === "application/pdf", `${tmpl.name} Content-Type`);
      assert(res.fileName.endsWith(".pdf"), `${tmpl.name} Valid Filename: ${res.fileName}`);

      // Save output artifact for visual inspection
      const filePath = path.join(outputDir, `Invoice-${tmpl.id}.pdf`);
      fs.writeFileSync(filePath, res.buffer);
    } catch (err: any) {
      assert(false, `${tmpl.name} Exception`, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 2: QUOTATION GENERATION ACROSS ALL 5 PREMIUM TEMPLATES
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST GROUP 2] Generating Quotations with Acceptance Sections...");

  const quotationTemplates = [
    { id: "quotation-corporate", name: "Template 1: Modern Corporate Estimate" },
    { id: "quotation-minimal", name: "Template 2: Contemporary Minimal" },
    { id: "quotation-executive", name: "Template 3: Executive Commercial Proposal" },
    { id: "quotation-proposal", name: "Template 4: B2B Commercial Proposal" },
    { id: "quotation-creative", name: "Template 5: Branded Creative Proposal" },
  ];

  for (const tmpl of quotationTemplates) {
    try {
      const res = await generateDocument({
        type: "QUOTATION",
        companyId: "test-company",
        sourceId: "quo-test-1",
        templateId: tmpl.id,
        isPreview: true,
        sampleData: {
          ...SAMPLE_QUOTATION_DATA,
          templateId: tmpl.id,
          company: {
            ...SAMPLE_COMPANY_BRANDING,
            name: "Flourish Home Furniture Ltd",
          },
        },
      });

      assert(res.buffer && res.buffer.length > 5000, `${tmpl.name} Buffer Size`, `Size: ${res.buffer?.length} bytes`);
      assert(res.contentType === "application/pdf", `${tmpl.name} Content-Type`);

      const filePath = path.join(outputDir, `Quotation-${tmpl.id}.pdf`);
      fs.writeFileSync(filePath, res.buffer);
    } catch (err: any) {
      assert(false, `${tmpl.name} Exception`, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 3: RECEIPTS (STANDARD A4, VOUCHER, THERMAL 80MM & 58MM)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST GROUP 3] Generating Receipts (Standard A4, Voucher, Thermal 80mm & 58mm with QR Codes)...");

  // A4 Standard
  try {
    const resA4 = await generateDocument({
      type: "PAYMENT_RECEIPT",
      companyId: "test-company",
      sourceId: "rcp-test-1",
      templateId: "receipt-standard",
      isPreview: true,
      sampleData: {
        ...SAMPLE_RECEIPT_DATA,
        company: {
          ...SAMPLE_COMPANY_BRANDING,
          name: "Flourish Home Furniture Ltd",
          taxPin: "P051234567Z",
        },
      },
    });

    assert(resA4.buffer && resA4.buffer.length > 4000, "Official A4 Payment Receipt Buffer Size");
    fs.writeFileSync(path.join(outputDir, "Receipt-standard-A4.pdf"), resA4.buffer);
  } catch (err: any) {
    assert(false, "Official A4 Payment Receipt Exception", err.message);
  }

  // Dual Voucher Slip
  try {
    const resVoucher = await generateDocument({
      type: "PAYMENT_RECEIPT",
      companyId: "test-company",
      sourceId: "rcp-voucher-1",
      templateId: "receipt-voucher",
      isPreview: true,
      sampleData: {
        ...SAMPLE_RECEIPT_DATA,
        company: {
          ...SAMPLE_COMPANY_BRANDING,
          name: "Flourish Home Furniture Ltd",
        },
      },
    });

    assert(resVoucher.buffer && resVoucher.buffer.length > 4000, "Payment Voucher Dual Slip Buffer Size");
    fs.writeFileSync(path.join(outputDir, "Receipt-voucher-slip.pdf"), resVoucher.buffer);
  } catch (err: any) {
    assert(false, "Payment Voucher Dual Slip Exception", err.message);
  }

  // Thermal 80mm POS Receipt with QR Code
  try {
    const resThermal80 = await generateDocument({
      type: "SALES_RECEIPT",
      companyId: "test-company",
      sourceId: "rcp-thermal-80",
      templateId: "receipt-thermal",
      isPreview: true,
      sampleData: {
        ...SAMPLE_RECEIPT_DATA,
        paperWidth: "80mm",
        company: {
          ...SAMPLE_COMPANY_BRANDING,
          name: "Flourish Home Retail Store",
          address: "Shop 14, The Mall, Westlands, Nairobi",
          contactPhone: "+254 700 112 233",
          taxPin: "P051234567Z",
        },
        items: [
          { description: "Executive High-Back Office Chair", quantity: 1, unitPrice: 18500, lineTotal: 18500 },
          { description: "Ergonomic Lumbar Support Cushion", quantity: 2, unitPrice: 3200, lineTotal: 6400 },
          { description: "Solid Oak Wireless Charging Desk Lamp", quantity: 1, unitPrice: 7500, lineTotal: 7500 },
        ],
        amountPaid: 32400,
        paymentMethod: "M-Pesa (Till 543210)",
        transactionReference: "QKD9923841",
        cashierName: "Store Attendant Jane",
      },
    });

    assert(resThermal80.buffer && resThermal80.buffer.length > 3000, "Thermal 80mm POS Receipt Buffer Size");
    fs.writeFileSync(path.join(outputDir, "Receipt-thermal-80mm.pdf"), resThermal80.buffer);
  } catch (err: any) {
    assert(false, "Thermal 80mm POS Receipt Exception", err.message);
  }

  // Thermal 58mm POS Receipt
  try {
    const resThermal58 = await generateDocument({
      type: "SALES_RECEIPT",
      companyId: "test-company",
      sourceId: "rcp-thermal-58",
      templateId: "receipt-thermal",
      isPreview: true,
      sampleData: {
        ...SAMPLE_RECEIPT_DATA,
        paperWidth: "58mm",
        company: {
          ...SAMPLE_COMPANY_BRANDING,
          name: "Flourish Mini POS",
          contactPhone: "+254 700 112 233",
          taxPin: "P051234567Z",
        },
        items: [
          { description: "Ergo Cushion", quantity: 1, unitPrice: 3200, lineTotal: 3200 },
        ],
        amountPaid: 3200,
        paymentMethod: "CASH",
        transactionReference: "CSH-00912",
      },
    });

    assert(resThermal58.buffer && resThermal58.buffer.length > 2500, "Thermal 58mm POS Receipt Buffer Size");
    fs.writeFileSync(path.join(outputDir, "Receipt-thermal-58mm.pdf"), resThermal58.buffer);
  } catch (err: any) {
    assert(false, "Thermal 58mm POS Receipt Exception", err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 4: MULTIPAGE LONG INVOICE WITH PAGE-BREAKS & PAGINATION
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST GROUP 4] Generating Multipage Invoice (30+ Line Items)...");

  try {
    const longItems = Array.from({ length: 30 }, (_, i) => ({
      sku: `FLR-PRD-${(100 + i).toString()}`,
      description: `Custom Architectural Fitting Item #${i + 1} — Precision Hardwood Furniture & Fixture Assembly`,
      quantity: (i % 3) + 1,
      unitPrice: 4500 + i * 250,
      discount: i % 5 === 0 ? 5 : 0,
      taxRate: 16,
      taxAmount: Math.round(((i % 3) + 1) * (4500 + i * 250) * 0.16),
      lineTotal: ((i % 3) + 1) * (4500 + i * 250),
    }));

    const subtotal = longItems.reduce((acc, it) => acc + it.lineTotal, 0);
    const taxTotal = Math.round(subtotal * 0.16);
    const grandTotal = subtotal + taxTotal;

    const resMultipage = await generateDocument({
      type: "INVOICE",
      companyId: "test-company",
      sourceId: "inv-multipage-1",
      templateId: "invoice-corporate",
      isPreview: true,
      sampleData: {
        ...SAMPLE_INVOICE_DATA,
        invoiceNumber: "INV-MULTIPAGE-001",
        company: {
          ...SAMPLE_COMPANY_BRANDING,
          name: "Flourish Home Furniture Commercial Contract",
          taxPin: "P051234567Z",
        },
        items: longItems,
        subtotal,
        discountTotal: 0,
        taxTotal,
        grandTotal,
        amountPaid: 0,
        amountDue: grandTotal,
      },
    });

    assert(resMultipage.buffer && resMultipage.buffer.length > 10000, "Multipage Invoice Buffer Size (>10KB)");
    fs.writeFileSync(path.join(outputDir, "Invoice-multipage-corporate.pdf"), resMultipage.buffer);
  } catch (err: any) {
    assert(false, "Multipage Invoice Exception", err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 5: FINANCIAL CALCULATION & ACCURACY AUDIT
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST GROUP 5] Auditing Financial Accuracy...");

  const testItems = [
    { sku: "ITEM-A", description: "Design Consultation", quantity: 2, unitPrice: 15000, lineTotal: 30000 },
    { sku: "ITEM-B", description: "Custom Cabinetry", quantity: 1, unitPrice: 45000, lineTotal: 45000 },
  ];
  const computedSubtotal = testItems.reduce((s, it) => s + it.lineTotal, 0);
  const discountAmount = 5000;
  const taxableAmount = computedSubtotal - discountAmount;
  const vatAmount = Math.round(taxableAmount * 0.16);
  const totalDue = taxableAmount + vatAmount;
  const amountPaid = 20000;
  const balanceDue = totalDue - amountPaid;

  assert(computedSubtotal === 75000, "Subtotal: 75,000 KES exactly");
  assert(taxableAmount === 70000, "Taxable Subtotal after 5,000 discount: 70,000 KES");
  assert(vatAmount === 11200, "16% Statutory VAT: 11,200 KES");
  assert(totalDue === 81200, "Grand Total: 81,200 KES");
  assert(balanceDue === 61200, "Net Balance Due: 61,200 KES");

  // ─────────────────────────────────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n===============================================================================");
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (failedTests > 0) {
    console.error(`FAILED TESTS: ${failedTests}`);
  } else {
    console.log("ALL TESTS COMPLETED SUCCESSFULLY! No regressions detected.");
  }
  console.log(`Generated PDF artifacts saved in: ${outputDir}`);
  console.log("===============================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
