/**
 * tests/deterministic-engine-and-billing.test.ts
 *
 * Dedicated verification suite for:
 * 1. Typed Deterministic Task Handlers across Commerce, Documents, WhatsApp, School, and Marketing
 * 2. Honest reporting on insufficient input (zero fabricated invoices or prices)
 * 3. Decoupling of external provider fiat expenditure ($0.00) from tenant AI credit consumption
 * 4. Zero-credit fix verification (no || 1 coercion to 1 credit)
 * 5. Credit reservation and settlement / refund logic for honest task failures
 */

import { deterministicProvider } from "../lib/ai/providers/deterministicProvider";
import { DeterministicTaskRegistry } from "../lib/ai/providers/deterministicTaskRegistry";
import { aiModelRegistry } from "../lib/ai/modelRegistry";
import { aiService } from "../lib/ai/aiService";
import { creditLedger } from "../lib/ai/creditLedger";
import { ProviderPricingCalculator } from "../lib/ai/routing/providerPricing";

async function runDeterministicAndBillingTests() {
  console.log("================================================================================");
  console.log("  SALESMANPRO DETERMINISTIC ENGINE & CONFIGURABLE CREDIT BILLING SUITE");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ [PASS] ${testName}`);
    } else {
      console.error(`  ✗ [FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. COMMERCE DOMAIN DETERMINISTIC HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("--- 1. Testing Commerce Domain Deterministic Handlers ---");

  // 1.1 Product Description
  const prodDescRes = await deterministicProvider.generateText({
    prompt: "Wireless Noise Canceling Headphones with 40-hour battery life and Bluetooth 5.3",
    context: { actionId: "COMMERCE_PRODUCT_DESCRIPTION" },
  });
  assert(prodDescRes.isSuccessful === true, "COMMERCE_PRODUCT_DESCRIPTION succeeds with valid input");
  assert(Boolean(prodDescRes.json?.title), "Product title generated");
  assert(Array.isArray(prodDescRes.json?.bulletPoints) && prodDescRes.json.bulletPoints.length >= 3, "Product bullet points generated");
  assert(prodDescRes.provider === "CUSTOM", "Provider attributed to CUSTOM");
  assert(prodDescRes.model === "salesmanpro-deterministic-v1", "Model is salesmanpro-deterministic-v1");

  // 1.2 Product SEO
  const prodSeoRes = await deterministicProvider.generateText({
    prompt: "Organic Ethiopian Yirgacheffe Single-Origin Whole Bean Coffee 500g",
    context: { actionId: "COMMERCE_PRODUCT_SEO" },
  });
  assert(prodSeoRes.isSuccessful === true, "COMMERCE_PRODUCT_SEO succeeds with valid input");
  assert(typeof prodSeoRes.json?.metaTitle === "string" && prodSeoRes.json.metaTitle.length <= 70, "SEO Meta title is optimized and within length boundary");
  assert(typeof prodSeoRes.json?.metaDescription === "string" && prodSeoRes.json.metaDescription.length <= 165, "SEO Meta description within standard search snippet boundary");
  assert(Array.isArray(prodSeoRes.json?.keywords) && prodSeoRes.json.keywords.length > 0, "Keywords generated");

  // 1.3 Product Attributes
  const prodAttrRes = await deterministicProvider.generateText({
    prompt: "Specs: RAM: 16GB, Storage: 512GB SSD, Weight: 1.4kg, Color: Space Gray, Display: 14-inch OLED",
    context: { actionId: "COMMERCE_PRODUCT_ATTRIBUTES" },
  });
  assert(prodAttrRes.isSuccessful === true, "COMMERCE_PRODUCT_ATTRIBUTES succeeds with specs");
  const attributes = prodAttrRes.json?.attributes as Record<string, string>;
  assert(Boolean(attributes && attributes["ram"]), "Extracted RAM attribute");
  assert(Boolean(attributes && attributes["storage"]), "Extracted Storage attribute");

  // 1.4 Marketplace Copy
  const marketplaceRes = await deterministicProvider.generateText({
    prompt: "Premium Ergonomic Office Chair with Lumbar Support and Breathable Mesh",
    context: { actionId: "COMMERCE_MARKETPLACE_COPY" },
  });
  assert(marketplaceRes.isSuccessful === true, "COMMERCE_MARKETPLACE_COPY succeeds");
  assert(Boolean(marketplaceRes.json?.headline), "Marketplace headline generated");
  assert(Boolean(marketplaceRes.json?.callToAction), "Call to action included");

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DOCUMENTS & INVOICING (HONEST REPORTING & ZERO FABRICATION)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n--- 2. Testing Documents & Invoicing (Strict Non-Fabrication) ---");

  // 2.1 Genuine Line Items Parsing
  const validInvoicePrompt = "Invoice for Client ABC: 3x Ergonomic Office Chair at KES 15000 each, and 1x Desk Mat at KES 2500";
  const validInvoiceRes = await deterministicProvider.generateText({
    prompt: validInvoicePrompt,
    context: { actionId: "DOCUMENT_POPULATE" },
  });
  assert(validInvoiceRes.isSuccessful === true, "DOCUMENT_POPULATE succeeds with verified line items");
  const invoiceData = validInvoiceRes.json as any;
  assert(Array.isArray(invoiceData.items) && invoiceData.items.length === 2, "Parsed exact 2 line items");
  assert(invoiceData.items[0].quantity === 3 && invoiceData.items[0].unitPrice === 15000, "Item 1 price and quantity exact");
  assert(invoiceData.items[0].total === 45000, "Item 1 total computed correctly (3 * 15000 = 45000)");
  assert(invoiceData.items[1].quantity === 1 && invoiceData.items[1].unitPrice === 2500, "Item 2 price and quantity exact");
  assert(invoiceData.subtotal === 47500, "Subtotal is arithmetic sum (45000 + 2500 = 47500)");
  assert(invoiceData.currency === "KES", "Currency correctly identified as KES");

  // 2.2 Honest Failure on Empty/Vague Input (ZERO FABRICATED LINE ITEMS)
  const vagueInvoicePrompt = "Create an invoice for services rendered last week";
  const vagueInvoiceRes = await deterministicProvider.generateText({
    prompt: vagueInvoicePrompt,
    context: { actionId: "DOCUMENT_POPULATE" },
  });
  assert(vagueInvoiceRes.isSuccessful === false, "DOCUMENT_POPULATE rejects vague prompt without fabrication");
  assert(vagueInvoiceRes.error === "INSUFFICIENT_DOCUMENT_DATA", "Error code is INSUFFICIENT_DOCUMENT_DATA");
  const vagueJson = vagueInvoiceRes.json as any;
  assert(Array.isArray(vagueJson.missingFields) && vagueJson.missingFields.includes("items"), "Missing fields explicitly lists 'items'");
  assert(!vagueInvoiceRes.text.includes("Commercial Supply & Service Item 1"), "Did NOT fabricate placeholder items or fake amounts");

  // 2.3 Mascot Document Extractor
  const receiptPrompt = "RECEIPT\nNAIVAS SUPERMARKET\nBread 100.00\nMilk 120.00\nTOTAL KES 220.00";
  const mascotRes = await deterministicProvider.generateText({
    prompt: receiptPrompt,
    context: { actionId: "MASCOT_DOCUMENT_EXTRACT" },
  });
  assert(mascotRes.isSuccessful === true, "MASCOT_DOCUMENT_EXTRACT parsed receipt text");
  assert(mascotRes.json?.documentType === "EXPENSE_RECEIPT" || (mascotRes.json?.documentType as string)?.includes("RECEIPT"), "Identified documentType as RECEIPT");

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. WHATSAPP CONCIERGE & SCHOOL MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n--- 3. Testing WhatsApp Concierge & School Domain Handlers ---");

  // 3.1 WhatsApp Order Tracking Intent
  const waTrackRes = await deterministicProvider.generateText({
    prompt: "Hello, where is my order #SMP-9821? When will it arrive?",
    context: { actionId: "WHATSAPP_CONCIERGE" },
  });
  assert(waTrackRes.isSuccessful === true, "WhatsApp order inquiry processed");
  assert(waTrackRes.json?.intent === "order_tracking", "Intent classified as 'order_tracking'");
  assert((waTrackRes.json?.action as any)?.type === "LOOKUP_ORDER", "Action mapped to LOOKUP_ORDER");
  assert((waTrackRes.json?.action as any)?.orderNumber === "SMP-9821", "Extracted order number SMP-9821");

  // 3.2 WhatsApp Human Escalation Intent
  const waEscalateRes = await deterministicProvider.generateText({
    prompt: "I want to speak to an agent or representative right now, this is urgent!",
    context: { actionId: "WHATSAPP_CONCIERGE" },
  });
  assert(waEscalateRes.json?.intent === "escalate_to_human", "Intent classified as 'escalate_to_human'");
  assert((waEscalateRes.json?.action as any)?.type === "ESCALATE_HUMAN", "Action mapped to ESCALATE_HUMAN");

  // 3.3 School Lesson Plan with Proportional Timing
  const lessonPlanRes = await deterministicProvider.generateText({
    prompt: "Subject: Mathematics, Grade: Grade 7, Topic: Fractions and Decimals, Duration: 60 minutes",
    context: { actionId: "SCHOOL_LESSON_PLAN" },
  });
  assert(lessonPlanRes.isSuccessful === true, "School lesson plan created");
  const planData = lessonPlanRes.json as any;
  assert(planData.subject === "Mathematics", "Subject set to Mathematics");
  assert(planData.topic === "Fractions and Decimals", "Topic set correctly");
  assert(planData.durationMinutes === 60, "Duration is 60 minutes");
  const totalPhaseMinutes = (planData.structure as any[]).reduce((sum, phase) => sum + phase.durationMinutes, 0);
  assert(totalPhaseMinutes === 60, `Lesson plan phase durations sum exactly to total duration (${totalPhaseMinutes} mins)`);

  // 3.4 School Report Comment
  const reportRes = await deterministicProvider.generateText({
    prompt: "Student: Jane Doe, Subject: Physics, Score: 88, Grade: A",
    context: { actionId: "SCHOOL_REPORT_COMMENT" },
  });
  assert(reportRes.isSuccessful === true, "School report comment generated");
  assert(reportRes.json?.studentName === "Jane Doe", "Student name matches input");
  assert(reportRes.json?.grade === "A", "Grade threshold honored");
  assert(typeof reportRes.json?.teacherComment === "string", "Teacher comment generated");

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. MARKETING EMAIL & SOCIAL MEDIA
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n--- 4. Testing Marketing Domain Handlers ---");

  // 4.1 Marketing Email
  const emailRes = await deterministicProvider.generateText({
    prompt: "Product: Organic Skin Serum, Goal: Summer Flash Sale, Discount: 25% off",
    context: { actionId: "MARKETING_EMAIL" },
  });
  assert(emailRes.isSuccessful === true, "Marketing email generated");
  assert(Array.isArray(emailRes.json?.subjectLines) && emailRes.json.subjectLines.length >= 2, "Provided subject line variants");
  assert(Boolean(emailRes.json?.callToAction), "Provided call to action");

  // 4.2 Marketing Social Post
  const socialRes = await deterministicProvider.generateText({
    prompt: "Launch of new Eco-friendly Canvas Tote Bags in Nairobi",
    context: { actionId: "MARKETING_SOCIAL_POST" },
  });
  assert(socialRes.isSuccessful === true, "Social post generated");
  const platforms = (socialRes.json as any)?.platforms;
  assert(Boolean(platforms?.instagram && platforms?.linkedin && platforms?.twitter), "Generated multi-platform copy (Instagram, LinkedIn, Twitter)");
  assert(Array.isArray(socialRes.json?.hashtags) && socialRes.json.hashtags.length > 0, "Generated relevant hashtags");

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. HONEST HANDLING OF UNSUPPORTED / OUT-OF-SCOPE TASKS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n--- 5. Testing Honest Reporting for Out-of-Scope Prompts ---");

  const unsupportedRes = await deterministicProvider.generateText({
    prompt: "Write a 5000-word fictional fantasy screenplay about dragons in space",
    context: { actionId: "UNSUPPORTED_RANDOM_ACTION" },
  });
  assert(unsupportedRes.isSuccessful === false, "Out-of-scope task reports isSuccessful === false");
  assert(unsupportedRes.error === "UNSUPPORTED_TASK_OR_REQUIRES_LLM", "Identifies requirement for generative LLM");
  assert(unsupportedRes.json?.success === false, "JSON payload explicitly conveys success: false");

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. DECOUPLED BILLING: ZERO PROVIDER COST VS TENANT CREDIT CONSUMPTION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n--- 6. Testing Decoupled Billing & Configurable Credit Accounting ---");

  // 6.1 Provider fiat expenditure is strictly $0.00
  const fiatCost = ProviderPricingCalculator.calculateCostUsd("salesmanpro-deterministic-v1", 2000, 1000);
  assert(fiatCost === 0, "External fiat provider cost for salesmanpro-deterministic-v1 is strictly $0.00 USD");

  // 6.2 Zero-Credit bug fix: model.minimumCredits = 0 does not coerce to 1
  const detModel = aiModelRegistry.getModel("salesmanpro-deterministic-v1");
  assert(detModel.minimumCredits === 0, "salesmanpro-deterministic-v1 minimumCredits configured as 0");
  const calcZeroCredit = aiModelRegistry.calculateActualCreditCost(detModel, { promptTokens: 500, completionTokens: 500 });
  assert(calcZeroCredit === 0, "calculateActualCreditCost returns 0 when input/output cost is 0 (no coercion to 1)");

  // 6.3 Configured Super Admin Action Credit Policy
  const resolvedDescCredits = await aiService.resolveTenantCreditCost("COMMERCE_PRODUCT_DESCRIPTION", detModel, { promptTokens: 500, completionTokens: 500 });
  assert(resolvedDescCredits === 2, `COMMERCE_PRODUCT_DESCRIPTION consumes 2 credits per action policy (received: ${resolvedDescCredits})`);

  const resolvedSeoCredits = await aiService.resolveTenantCreditCost("COMMERCE_PRODUCT_SEO", detModel, { promptTokens: 300, completionTokens: 200 });
  assert(resolvedSeoCredits === 1, `COMMERCE_PRODUCT_SEO consumes 1 credit per action policy (received: ${resolvedSeoCredits})`);

  // 6.4 Reservation and Settlement on Honest Failure (0 credits charged, refund issued)
  let reservedAmountRecorded = -1;
  let actualAmountRecorded = -1;
  let refundAmountRecorded = -1;

  creditLedger.reserveCredits = async (params: any) => {
    reservedAmountRecorded = params.amount;
    return { transactionId: "mock-res-1", reservationId: "mock-res-1", balanceAfter: 1000 };
  };

  creditLedger.finalizeCharge = async (params: any) => {
    actualAmountRecorded = params.actualAmount;
    return { transactionId: "mock-fin-1", balanceAfter: 1000 };
  };

  creditLedger.refundCredits = async (params: any) => {
    refundAmountRecorded = params.amount;
    return { transactionId: "mock-ref-1", balanceAfter: 1000 };
  };

  // Run vague invoice through CentralAIService
  const failedExecutionRes = await aiService.generateText(
    {
      prompt: "Make invoice for yesterday",
      context: { actionId: "DOCUMENT_POPULATE" },
    },
    {
      companyId: "test-company-1",
      userId: "test-user-1",
      actionId: "DOCUMENT_POPULATE",
      idempotencyKey: "test-failed-doc-1",
    }
  );

  assert(failedExecutionRes.isSuccessful === false, "CentralAIService preserved honest failure flag");
  assert(reservedAmountRecorded > 0, `Credits were initially reserved upfront (${reservedAmountRecorded} credits)`);
  assert(actualAmountRecorded === 0, "Actual charge settled to 0 credits because task failed honestly");
  assert(failedExecutionRes.creditsConsumed === 0, "Tenant output creditsConsumed reports 0");
  assert(failedExecutionRes.providerCostUsd === 0, "Tenant output providerCostUsd is $0.00");

  console.log("\n================================================================================");
  console.log(`  VERIFICATION RESULT: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("================================================================================\n");

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runDeterministicAndBillingTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
