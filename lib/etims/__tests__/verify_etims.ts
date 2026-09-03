/**
 * Verification Test Suite for SalesmanPro eTIMS & Dual Receipt System
 */

import { OSCUAdapter } from "../oscuAdapter";
import { VSCUAdapter } from "../vscuAdapter";
import { encryptCredential, decryptCredential } from "../crypto";
import { receiptRenderer } from "../../receipts/receiptRenderer";
import { UnifiedReceiptData } from "../../receipts/types";
import { ETIMS_TAX_RATES } from "../constants";

async function runVerification() {
  console.log("=================================================");
  console.log("🚀 STARTING SALESMANPRO eTIMS VERIFICATION SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test AES-256-GCM Encryption
  console.log("--- 1. Testing Credential Encryption (AES-256-GCM) ---");
  const testSecret = "SECURE_CMC_KEY_123456789_SECRET";
  const encrypted = encryptCredential(testSecret);
  const decrypted = decryptCredential(encrypted);
  assert(encrypted.includes(":"), "Encrypted ciphertext has IV and AuthTag segments");
  assert(decrypted === testSecret, "Decrypted text exactly matches original secret");

  // 2. Test OSCU Adapter Handshake
  console.log("\n--- 2. Testing OSCU Handshake & Signature Engine ---");
  const oscu = new OSCUAdapter();
  const mockConfig: any = {
    kraPin: "P051234567Z",
    deviceId: "OSCU123456",
    branchId: "00",
    environment: "sandbox",
  };

  const handshake = await oscu.initializeDevice(mockConfig);
  assert(handshake.success === true, "OSCU Handshake reports success");
  assert(Boolean(handshake.cmcKey), "OSCU Handshake returns valid communication key");
  assert(handshake.deviceId === "OSCU123456", "OSCU Handshake preserves device ID");

  // 3. Test OSCU Invoice Transmission
  console.log("\n--- 3. Testing Fiscal Invoice Calculation & Submission ---");
  const mockPayload: any = {
    invoiceNumber: "INV-2026-00001",
    kraPin: "P051234567Z",
    branchId: "00",
    deviceId: "OSCU123456",
    customerPin: "P099887766A",
    customerName: "Acme Supermarket",
    orderTrackingNumber: "SP-ORD-8877",
    currency: "KES",
    totalAmount: 1160,
    items: [
      {
        itemId: "item-1",
        itemCode: "ITM001",
        name: "Standard VAT Product",
        quantity: 10,
        unitPrice: 116,
        totalAmount: 1160,
        taxTypeCode: "A",
      },
    ],
  };

  const fiscalResult = await oscu.submitInvoice(mockConfig, mockPayload);
  assert(fiscalResult.status === "CONFIRMED", "Fiscal result confirmed by OSCU");
  assert(Boolean(fiscalResult.controlCode), "KRA Control Code generated");
  assert(fiscalResult.controlCode?.split("-").length === 4, "Control Code in XXXX-XXXX-XXXX-XXXX format");
  assert(Boolean(fiscalResult.qrCodeUrl), "KRA Verification QR Code URL generated");
  assert(fiscalResult.qrCodeUrl?.includes("https://etims.kra.go.ke"), "QR points to official KRA domain");

  // 4. Test Receipt Rendering Engine (Dual Modes)
  console.log("\n--- 4. Testing Dual Receipt Engine (Mode A eTIMS vs Mode B Standard) ---");
  const sampleReceiptData: UnifiedReceiptData = {
    storeName: "SalesmanPro Flagship Store",
    storeAddress: "Westlands, Nairobi",
    storePhone: "+254 700 000 000",
    trackingNumber: "TRK-99001",
    date: "2026-09-03",
    time: "14:30:00",
    cashierName: "John Doe",
    customerName: "Jane Doe",
    customerPin: "P051122334Z",
    currency: "KES",
    subtotal: 1000,
    totalDiscount: 0,
    totalTax: 160,
    finalTotal: 1160,
    paymentMethod: "M-PESA",
    items: [
      {
        id: "1",
        name: "Premium Coffee Beans 500g",
        quantity: 1,
        unitPrice: 1160,
        subtotal: 1160,
        taxTypeCode: "A",
      },
    ],
    isFiscal: true,
    kraPin: "P051234567Z",
    branchId: "00",
    branchName: "Head Office",
    deviceId: "OSCU123456",
    invoiceNumber: "ETIMS-2026-0001",
    controlCode: "A1B2-C3D4-E5F6-G7H8",
    scuId: "OSCU123456",
    qrCodeUrl: "https://etims.kra.go.ke/receipt?pin=P051234567Z",
    taxBreakdown: {
      A: { taxCode: "A", taxRate: 16, taxableAmount: 1000, taxAmount: 160 },
      B: { taxCode: "B", taxRate: 0, taxableAmount: 0, taxAmount: 0 },
      C: { taxCode: "C", taxRate: 0, taxableAmount: 0, taxAmount: 0 },
      D: { taxCode: "D", taxRate: 8, taxableAmount: 0, taxAmount: 0 },
      E: { taxCode: "E", taxRate: 0, taxableAmount: 0, taxAmount: 0 },
    },
  };

  // Mode A: eTIMS Fiscal Receipt
  const etimsHtml = receiptRenderer.renderHtml(sampleReceiptData, "ETIMS");
  assert(etimsHtml.includes("KENYA REVENUE AUTHORITY"), "eTIMS Receipt contains KRA Header");
  assert(etimsHtml.includes("eTIMS FISCAL TAX INVOICE"), "eTIMS Receipt labeled Tax Invoice");
  assert(etimsHtml.includes("A1B2-C3D4-E5F6-G7H8"), "eTIMS Receipt displays KRA Control Code");
  assert(etimsHtml.includes("P051234567Z"), "eTIMS Receipt displays Taxpayer PIN");
  assert(etimsHtml.includes("TAX RATE ANALYSIS"), "eTIMS Receipt contains Tax Analysis Table");

  // Mode B: Standard SalesmanPro Receipt
  const standardReceiptData = { ...sampleReceiptData, isFiscal: false };
  const standardHtml = receiptRenderer.renderHtml(standardReceiptData, "STANDARD");
  assert(standardHtml.includes("SALES RECEIPT"), "Standard Receipt clearly labeled SALES RECEIPT");
  assert(!standardHtml.includes("KENYA REVENUE AUTHORITY"), "Standard Receipt has NO fake KRA header");
  assert(!standardHtml.includes("A1B2-C3D4-E5F6-G7H8"), "Standard Receipt has NO fake control codes");

  // Reprint Watermark Verification
  const reprintData = { ...sampleReceiptData, isReprint: true, reprintedAt: "2026-09-03 15:00:00" };
  const reprintHtml = receiptRenderer.renderHtml(reprintData, "ETIMS");
  assert(reprintHtml.includes("*** DUPLICATE / REPRINT ***"), "Reprint receipt includes DUPLICATE watermark");

  // ESC/POS Payload Verification
  const escPosPayload = receiptRenderer.renderEscPos(sampleReceiptData, "ETIMS");
  assert(escPosPayload.type === "PRINT_ESC_POS", "ESC/POS payload has correct print type");
  assert(escPosPayload.mode === "ETIMS", "ESC/POS payload carries ETIMS mode");
  assert(escPosPayload.FiscalDetails?.ControlCode === "A1B2-C3D4-E5F6-G7H8", "ESC/POS payload contains ControlCode");

  // 5. Test VSCU Adapter
  console.log("\n--- 5. Testing VSCU Offline Queuing Adapter ---");
  const vscu = new VSCUAdapter();
  const vscuHandshake = await vscu.initializeDevice(mockConfig);
  assert(vscuHandshake.success === true, "VSCU handshake successful");
  const vscuResult = await vscu.submitInvoice(mockConfig, mockPayload);
  assert(vscuResult.status === "CONFIRMED", "VSCU generates signed fiscal result");

  console.log("\n=================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
