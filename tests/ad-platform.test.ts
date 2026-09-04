/**
 * tests/ad-platform.test.ts
 *
 * Automated Verification Suite for the Unified Advertising Platform:
 * 1. Financial Ledger & Atomic Budget Control (KES Ad Budget vs. Compute AI Credits).
 * 2. Ad Serving & Contextual Placement Matching (Ghuba, Storefront, Platform).
 * 3. Tracking, Fraud Deduplication & Conversion Attribution (ROAS).
 * 4. Zero-Commercial-Hallucination AI Ad Manager.
 * 5. Workforce Tool Registry & Human-Approval Governance.
 * 6. Multi-Tenant Isolation.
 */

import { AdBudgetService } from "../lib/ads/adBudgetService";
import { AdServingEngine } from "../lib/ads/adServingEngine";
import { AdTrackingService } from "../lib/ads/adTrackingService";
import { AIAdManager } from "../lib/ads/aiAdManager";
import { WorkforceToolRegistry } from "../lib/ai/workforce/toolRegistry";
import { AgentWorkforceLevel, AgentPermissionLevel } from "../lib/ai/workforce/types";
import {
  AdCampaignStatus,
  AdvertiserType,
  AdBiddingStrategy,
  AdCreativeType,
  AdObjective,
} from "../lib/ads/types";
import prisma from "../server/db/prismadb";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING UNIFIED ADVERTISING PLATFORM TEST SUITE");
  console.log("=================================================\n");

  let testCompanyAId = "";
  let testCompanyBId = "";
  let testProductId = "";
  let testCampaignId = "";
  let testCreativeId = "";

  try {
    // 0. SEED TEST DATA
    console.log("--- SETUP: Seeding Test Companies and Products ---");
    const compA = await prisma.company.create({
      data: {
        name: `Ad Test Store A ${Date.now()}`,
        slug: `ad-test-store-a-${Date.now()}`,
        contactEmail: `store-a-${Date.now()}@example.com`,
        aiCreditBalance: 100,
      },
    });
    testCompanyAId = compA.id;

    const compB = await prisma.company.create({
      data: {
        name: `Ad Test Store B ${Date.now()}`,
        slug: `ad-test-store-b-${Date.now()}`,
        contactEmail: `store-b-${Date.now()}@example.com`,
      },
    });
    testCompanyBId = compB.id;

    const prod = await prisma.product.create({
      data: {
        name: "Premium Leather Chelsea Boots",
        sellingPrice: 4500,
        costPrice: 2800,
        quantity: 25,
        isAvailable: true,
        companyId: testCompanyAId,
        description: "Handcrafted genuine leather boots with durable soles.",
      },
    });
    testProductId = prod.id;
    console.log(`Setup complete: Store A (${testCompanyAId}), Product (${testProductId})\n`);

    // ========================================================================
    // SUITE 1: Financial Ledger & Ad Budget Engine
    // ========================================================================
    console.log("--- SUITE 1: Financial Ledger & Atomic Budget Control ---");

    const wallet = await AdBudgetService.getOrCreateWallet(testCompanyAId);
    assert(
      wallet !== null && wallet.companyId === testCompanyAId && wallet.balance === 0 && wallet.currency === "KES",
      "Initialize AdWallet with zero balance in KES for Store A",
    );

    const topUpResult = await AdBudgetService.topUpWallet({
      companyId: testCompanyAId,
      amountKES: 5000,
      paymentReference: `MPESA-TEST-${Date.now()}`,
      paymentGateway: "MPESA",
      description: "Test M-Pesa Top Up",
    });

    assert(
      topUpResult.success === true && topUpResult.newBalanceKES === 5000,
      "Atomically top up AdWallet with KES 5,000",
    );

    const reloadedWallet = await AdBudgetService.getOrCreateWallet(testCompanyAId);
    assert(
      reloadedWallet.balance === 5000 && reloadedWallet.transactions.length > 0,
      "Transaction ledger records immutable AD_BUDGET_ADDED entry",
    );

    const checkValid = await AdBudgetService.canFundCampaign(testCompanyAId, 3000);
    assert(
      checkValid.canFund === true && checkValid.missingAmountKES === 0,
      "canFundCampaign approves budget within available balance (KES 3,000 <= KES 5,000)",
    );

    const checkExceeds = await AdBudgetService.canFundCampaign(testCompanyAId, 10000);
    assert(
      checkExceeds.canFund === false && checkExceeds.missingAmountKES === 5000,
      "canFundCampaign rejects budget exceeding balance (KES 10,000 > KES 5,000)",
    );

    const checkB = await AdBudgetService.canFundCampaign(testCompanyBId, 500);
    assert(
      checkB.canFund === false,
      "Store B cannot access Store A's wallet funds (Tenant Isolation)",
    );
    console.log("");

    // ========================================================================
    // SUITE 2: Ad Serving & Contextual Targeting
    // ========================================================================
    console.log("--- SUITE 2: Ad Serving & Contextual Targeting ---");

    await AdServingEngine.ensureStandardPlacements();
    const standardHeroPlacement = await prisma.adPlacement.findUnique({
      where: { code: "GHUBA_HOMEPAGE_HERO" },
    });
    assert(
      standardHeroPlacement !== null && standardHeroPlacement.platform === "GHUBA",
      "Ensure standard ad placements seeded (GHUBA_HOMEPAGE_HERO, GHUBA_SEARCH_SPONSORED)",
    );

    const campaign = await prisma.adCampaign.create({
      data: {
        companyId: testCompanyAId,
        advertiserType: AdvertiserType.STORE_ADVERTISER,
        level: "STORE",
        name: "Leather Boots Autumn Showcase",
        status: AdCampaignStatus.ACTIVE,
        objective: AdObjective.PRODUCT_SALES,
        currency: "KES",
        totalBudgetKES: 100, // Small budget to test auto-completion
        dailyBudgetKES: 50,
        spentAmountKES: 0,
        biddingStrategy: AdBiddingStrategy.CPC,
        bidAmountKES: 25.0, // 25 KES per click -> 4 clicks will exhaust 100 KES
        targetingRules: {
          categories: ["Footwear", "Fashion"],
          locations: ["Nairobi"],
          keywords: ["boots", "leather", "chelsea"],
        },
        productId: testProductId,
        creatives: {
          create: [
            {
              type: AdCreativeType.IMAGE,
              title: "Handcrafted Leather Boots",
              headline: "Genuine Leather Chelsea Boots",
              body: "Only KES 4,500 with fast nationwide delivery in Kenya.",
              ctaText: "Order Now",
              ctaUrl: `/stores?product=${testProductId}`,
              variantTag: "A",
              status: "ACTIVE",
            },
          ],
        },
      },
      include: { creatives: true },
    });

    testCampaignId = campaign.id;
    testCreativeId = campaign.creatives[0].id;
    assert(
      Boolean(testCampaignId && testCreativeId),
      "Active AdCampaign created with AdCreative and CPC bid of KES 25",
    );

    const servedAds = await AdServingEngine.serveAds({
      placementCode: "GHUBA_SEARCH_SPONSORED",
      category: "Footwear",
      location: "Nairobi",
      searchQuery: "leather boots",
      limit: 5,
    });

    const matchedAd = servedAds.find((s) => s.campaignId === testCampaignId);
    assert(
      matchedAd !== undefined && matchedAd.isSponsored === true,
      "AdServingEngine matches contextual category and keywords to serve sponsored ad",
    );
    assert(
      matchedAd?.product?.sellingPrice === 4500,
      "Ad serving enriches product price directly from authoritative catalog (KES 4,500)",
    );
    console.log("");

    // ========================================================================
    // SUITE 3: Tracking, Anti-Fraud & Attribution
    // ========================================================================
    console.log("--- SUITE 3: Tracking, Anti-Fraud & Conversion Attribution ---");

    const impResult = await AdTrackingService.trackImpression({
      campaignId: testCampaignId,
      creativeId: testCreativeId,
      placementCode: "GHUBA_SEARCH_SPONSORED",
      viewerSessionId: "session_user_001",
    });

    assert(impResult.success === true, "Impression tracked successfully");

    const clickResult = await AdTrackingService.trackClick({
      campaignId: testCampaignId,
      creativeId: testCreativeId,
      placementCode: "GHUBA_SEARCH_SPONSORED",
      viewerSessionId: "session_user_001",
    });

    assert(
      clickResult.success === true && clickResult.recordedCostKES === 25.0,
      "Click tracked and KES 25.0 CPC debited from campaign spend",
    );

    const duplicateClick = await AdTrackingService.trackClick({
      campaignId: testCampaignId,
      creativeId: testCreativeId,
      placementCode: "GHUBA_SEARCH_SPONSORED",
      viewerSessionId: "session_user_001", // Exact duplicate session within 15 seconds
    });

    assert(
      duplicateClick.throttled === true,
      "Anti-Fraud: Duplicate rapid clicks from same session throttled to prevent click fraud",
    );

    // Spend 3 more clicks to exhaust 100 KES budget
    await AdTrackingService.trackClick({
      campaignId: testCampaignId,
      creativeId: testCreativeId,
      placementCode: "GHUBA_SEARCH_SPONSORED",
      viewerSessionId: "session_user_002",
    });
    await AdTrackingService.trackClick({
      campaignId: testCampaignId,
      creativeId: testCreativeId,
      placementCode: "GHUBA_SEARCH_SPONSORED",
      viewerSessionId: "session_user_003",
    });
    await AdTrackingService.trackClick({
      campaignId: testCampaignId,
      creativeId: testCreativeId,
      placementCode: "GHUBA_SEARCH_SPONSORED",
      viewerSessionId: "session_user_004",
    });

    const exhaustedCampaign = await prisma.adCampaign.findUnique({
      where: { id: testCampaignId },
    });

    assert(
      exhaustedCampaign?.spentAmountKES === 100 && exhaustedCampaign?.status === AdCampaignStatus.COMPLETED,
      "Atomic Budget Cap: Campaign automatically completes when spend reaches total authorized budget (KES 100)",
    );

    const overSpendAttempt = await AdTrackingService.trackClick({
      campaignId: testCampaignId,
      creativeId: testCreativeId,
      placementCode: "GHUBA_SEARCH_SPONSORED",
      viewerSessionId: "session_user_005",
    });

    assert(
      overSpendAttempt.success === false,
      "Overdraft Prevention: Additional click spend rejected after budget exhaustion",
    );

    const convResult = await AdTrackingService.trackConversion({
      campaignId: testCampaignId,
      creativeId: testCreativeId,
      placementCode: "GHUBA_SEARCH_SPONSORED",
      conversionValueKES: 9000, // 2 pairs of boots purchased
      orderId: "ORDER-TEST-001",
      viewerSessionId: "session_user_002",
    });

    assert(convResult.success === true, "Conversion tracked with attributed order value of KES 9,000");

    const attributedCampaign = await prisma.adCampaign.findUnique({
      where: { id: testCampaignId },
    });
    const metrics = (attributedCampaign?.metrics as any) || {};

    assert(
      metrics.conversions === 1 && metrics.attributedRevenueKES === 9000 && metrics.roas === 90,
      "Attribution Engine: Correctly calculates 90.0x ROAS (KES 9,000 revenue / KES 100 spend)",
    );
    console.log("");

    // ========================================================================
    // SUITE 4: Zero-Commercial-Hallucination AI Ad Manager
    // ========================================================================
    console.log("--- SUITE 4: AI Ad Manager & Zero-Hallucination Enforcement ---");

    const draftResult = await AIAdManager.generateCampaignFromProduct({
      companyId: testCompanyAId,
      productId: testProductId,
      totalBudgetKES: 2500,
      durationDays: 7,
    });

    assert(
      draftResult.success === true && draftResult.creativesCount === 3,
      "AI Ad Manager generates 3 creative variants (A, B, C) with zero price hallucination",
    );

    assert(
      draftResult.verificationNotice.includes("4,500"),
      "AI Ad Manager verifies actual price KES 4,500 against database catalog",
    );

    const savedDraft = await prisma.adCampaign.findUnique({
      where: { id: draftResult.campaignId },
    });
    assert(
      savedDraft?.status === AdCampaignStatus.DRAFT,
      "AI-drafted campaigns default to DRAFT status requiring human review",
    );

    // Clean up draft
    await prisma.adCreative.deleteMany({ where: { campaignId: draftResult.campaignId } });
    await prisma.adCampaign.delete({ where: { id: draftResult.campaignId } });
    console.log("");

    // ========================================================================
    // SUITE 5: Workforce Tool Registry & Governance
    // ========================================================================
    console.log("--- SUITE 5: Workforce Tool Registry & Governance ---");

    const adTools = [
      "recommendAdCampaign",
      "createAdCampaignDraft",
      "getAdPerformance",
      "boostMarketplaceListing",
      "optimizeAdCampaign",
    ];

    for (const tName of adTools) {
      const tool = WorkforceToolRegistry.getTool(tName);
      assert(tool !== undefined, `WorkforceToolRegistry registers '${tName}'`);
    }

    const draftTool = WorkforceToolRegistry.getTool("createAdCampaignDraft");
    assert(
      draftTool?.requiresApproval === true &&
        draftTool?.permissionRequired === AgentPermissionLevel.HUMAN_APPROVAL_REQUIRED,
      "createAdCampaignDraft strictly enforces HUMAN_APPROVAL_REQUIRED",
    );

    const execResult = await WorkforceToolRegistry.executeTool(
      "createAdCampaignDraft",
      {
        productId: testProductId,
        campaignName: "Governed Campaign Draft",
        totalBudgetKES: 3000,
      },
      {
        agentId: "test_store_marketing_agent",
        agentName: "Marketing Agent",
        level: AgentWorkforceLevel.STORE,
        permission: AgentPermissionLevel.HUMAN_APPROVAL_REQUIRED,
        companyId: testCompanyAId,
      },
    );

    assert(
      execResult.requiresApproval === true &&
        execResult.approvalPayload?.actionType === "createAdCampaignDraft",
      "WorkforceToolRegistry gates execution and produces approval payload for merchant inbox",
    );
    console.log("");

  } catch (err: any) {
    console.error("💥 TEST SUITE CRASHED:", err);
    failedCount++;
  } finally {
    // CLEANUP
    console.log("--- TEARDOWN: Cleaning up test artifacts ---");
    if (testCampaignId) {
      await prisma.adEvent.deleteMany({ where: { campaignId: testCampaignId } }).catch(() => {});
      await prisma.adCreative.deleteMany({ where: { campaignId: testCampaignId } }).catch(() => {});
      await prisma.adCampaign.deleteMany({ where: { id: testCampaignId } }).catch(() => {});
    }
    if (testProductId) {
      await prisma.product.delete({ where: { id: testProductId } }).catch(() => {});
    }
    if (testCompanyAId || testCompanyBId) {
      await prisma.adTransaction.deleteMany({
        where: { companyId: { in: [testCompanyAId, testCompanyBId] } },
      }).catch(() => {});
      await prisma.adWallet.deleteMany({
        where: { companyId: { in: [testCompanyAId, testCompanyBId] } },
      }).catch(() => {});
      await prisma.company.deleteMany({
        where: { id: { in: [testCompanyAId, testCompanyBId] } },
      }).catch(() => {});
    }
  }

  console.log("=================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=================================================");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
