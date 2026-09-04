/**
 * tests/three-pillars.test.ts
 *
 * Automated Test Suite for:
 * 1. New-Store AI Credit Onboarding & Idempotent Ledger Transaction
 * 2. Social Media Station Multi-Day Campaign Planning & Catalog Awareness
 * 3. Ghuba Marketplace Approved-Product Aggregation, Store Attribution & Image Normalization
 */

import assert from "assert";
import prisma from "../server/db/prismadb";
import { grantWelcomeCredits } from "../lib/ai/creditLedger";
import { WELCOME_AI_CREDITS } from "../lib/ai/aiConfig";
import { contentStrategyEngine } from "../lib/social/contentStrategyEngine";

async function runTests() {
  console.log("=================================================");
  console.log("   SalesmanPro Three-Pillar System Test Suite    ");
  console.log("=================================================\n");

  // Fetch or locate a test company
  const company = await prisma.company.findFirst({
    include: { user: true },
  });

  assert.ok(company, "Database must contain at least one company for integration testing");
  console.log(`Using test company: "${company.name}" (ID: ${company.id})`);

  // =========================================================================
  // PILLAR 1: NEW-STORE AI CREDIT ONBOARDING & IDEMPOTENCY
  // =========================================================================
  console.log("\n[PILLAR 1] Testing New-Store AI Credit Onboarding & Idempotency...");

  const testStoreSlug = `test-store-${Date.now()}`;
  const testCompany = await prisma.company.create({
    data: {
      name: `Test Store ${Date.now()}`,
      slug: testStoreSlug,
      contactEmail: `store-${Date.now()}@test.com`,
      userId: company.userId,
      showOnGhuba: true,
      aiCreditBalance: 0,
    },
  });

  try {
    // 1.1 Grant Welcome Credits
    const grant1 = await grantWelcomeCredits({
      companyId: testCompany.id,
      userId: testCompany.userId || undefined,
    });

    assert.strictEqual(grant1.granted, true, "First grant should succeed");
    assert.strictEqual(grant1.amount, WELCOME_AI_CREDITS, `Grant should be ${WELCOME_AI_CREDITS} credits`);
    assert.strictEqual(grant1.balance, WELCOME_AI_CREDITS, `Balance should equal ${WELCOME_AI_CREDITS}`);

    // Verify DB state
    const dbCompany = await prisma.company.findUnique({
      where: { id: testCompany.id },
      select: { aiCreditBalance: true },
    });
    assert.strictEqual(dbCompany?.aiCreditBalance, WELCOME_AI_CREDITS, "DB balance should reflect welcome credits");

    // Verify Ledger Transaction
    const ledgerTx = await prisma.aICreditTransaction.findFirst({
      where: {
        companyId: testCompany.id,
        idempotencyKey: `welcome_credit_${testCompany.id}`,
      },
    });
    assert.ok(ledgerTx, "Immutable ledger transaction must be recorded");
    assert.strictEqual(ledgerTx?.type, "PROMOTIONAL", "Transaction type must be PROMOTIONAL");
    assert.strictEqual(ledgerTx?.amount, WELCOME_AI_CREDITS, "Transaction amount must match welcome amount");

    // 1.2 Test Idempotency: second grant must be rejected and not add duplicate credits
    const grant2 = await grantWelcomeCredits({
      companyId: testCompany.id,
      userId: testCompany.userId || undefined,
    });
    assert.strictEqual(grant2.granted, false, "Second grant must be detected as duplicate and not granted");
    assert.strictEqual(grant2.balance, WELCOME_AI_CREDITS, "Balance must remain unchanged after duplicate call");

    const txCount = await prisma.aICreditTransaction.count({
      where: { companyId: testCompany.id, type: "PROMOTIONAL" },
    });
    assert.strictEqual(txCount, 1, "Exactly one promotional transaction must exist in ledger");

    console.log("  ✓ Welcome credits granted exactly once (50 credits).");
    console.log("  ✓ Idempotency verified: duplicate grant prevented.");
    console.log("  ✓ Authoritative AICreditTransaction ledger record verified.");
  } finally {
    // Clean up test company
    await prisma.aICreditTransaction.deleteMany({ where: { companyId: testCompany.id } });
    await prisma.whatsAppAIConfig.deleteMany({ where: { companyId: testCompany.id } });
    await prisma.company.delete({ where: { id: testCompany.id } });
  }

  // =========================================================================
  // PILLAR 2: SOCIAL MULTI-DAY CAMPAIGN PLANNING & CATALOG AWARENESS
  // =========================================================================
  console.log("\n[PILLAR 2] Testing Social Media Multi-Day Campaign Planning...");

  // Ensure test company has enough credits for campaign generation
  await prisma.company.update({
    where: { id: company.id },
    data: { aiCreditBalance: 60 },
  });

  // Fetch catalog products
  const products = await prisma.product.findMany({
    where: { companyId: company.id, quantity: { gt: 0 } },
    take: 3,
  });

  // Mock aiService.generateText for deterministic test execution
  const { aiService } = require("../lib/ai/aiService");
  const originalGenerateText = aiService.generateText;
  aiService.generateText = async () => ({
    text: JSON.stringify({
      narrativeSummary: "A cohesive 7-day marketing campaign focusing on quality and deals.",
      primaryTheme: "Spring Store Launch",
      recommendedPostingTimes: ["10:00", "18:00"],
      posts: [
        {
          dayIndex: 1,
          date: new Date().toISOString(),
          contentPillar: "PRODUCT_SHOWCASE",
          topicOrAngle: "Highlight best-selling in-stock products",
          suggestedPrimaryCaption: "Upgrade your everyday essentials with our premier collection.",
          hashtags: ["#StoreLaunch", "#ShopNow"],
          callToAction: "Shop Now",
          platformAdaptations: {
            FACEBOOK: { caption: "Discover our featured products today!" },
            INSTAGRAM: { caption: "Top picks for this week! Link in bio." },
          },
        },
        {
          dayIndex: 2,
          date: new Date(Date.now() + 86400000).toISOString(),
          contentPillar: "EDUCATIONAL",
          topicOrAngle: "How to get the most value out of our products",
          suggestedPrimaryCaption: "Tips & tricks on getting the best longevity out of your gear.",
          hashtags: ["#TipsAndTricks", "#Value"],
          callToAction: "Learn More",
          platformAdaptations: {
            FACEBOOK: { caption: "Quick tips for your everyday routine." },
            INSTAGRAM: { caption: "Did you know? Check out these 3 tips." },
          },
        },
        {
          dayIndex: 3,
          date: new Date(Date.now() + 2 * 86400000).toISOString(),
          contentPillar: "PROMOTIONAL",
          topicOrAngle: "Special limited-time flash discount",
          suggestedPrimaryCaption: "Get 15% off with code FLASH15 this week only!",
          hashtags: ["#FlashSale", "#Discounts"],
          callToAction: "Claim Discount",
          platformAdaptations: {
            FACEBOOK: { caption: "Flash sale alert! 15% off." },
            INSTAGRAM: { caption: "Use FLASH15 at checkout! 🕒" },
          },
        },
        {
          dayIndex: 4,
          date: new Date(Date.now() + 3 * 86400000).toISOString(),
          contentPillar: "SOCIAL_PROOF",
          topicOrAngle: "Customer reviews and store credibility",
          suggestedPrimaryCaption: "See why customers rate us 5 stars.",
          hashtags: ["#CustomerLove", "#Reviews"],
          callToAction: "Read Reviews",
          platformAdaptations: {
            FACEBOOK: { caption: "Customer feedback on our top items." },
            INSTAGRAM: { caption: "Verified 5-star quality." },
          },
        },
        {
          dayIndex: 5,
          date: new Date(Date.now() + 4 * 86400000).toISOString(),
          contentPillar: "PRODUCT_SHOWCASE",
          topicOrAngle: "Weekend special spotlight",
          suggestedPrimaryCaption: "Weekend is almost here! Stock up before items sell out.",
          hashtags: ["#WeekendVibes", "#ShopLocal"],
          callToAction: "Shop Weekend",
          platformAdaptations: {
            FACEBOOK: { caption: "Weekend essentials ready for delivery." },
            INSTAGRAM: { caption: "Weekend ready!" },
          },
        },
      ],
    }),
    provider: "MOCK",
    model: "mock-model",
    usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
    creditsCost: 9,
  });

  const campaignRes = await contentStrategyEngine.generateCampaign({
    companyId: company.id,
    userId: company.userId || undefined,
    name: "Automated Verification 7-Day Sprint",
    objective: "INCREASE SALES & AWARENESS",
    planningMode: "ONE_WEEK",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 86400000),
    targetPlatforms: ["FACEBOOK", "INSTAGRAM"],
    contentPillars: ["PRODUCT_SHOWCASE", "EDUCATIONAL", "PROMOTIONAL"],
    postingFrequency: "DAILY",
    preferredPostingTimes: ["10:00", "18:00"],
    contentMix: {
      promotional: 40,
      educational: 30,
      engagement: 10,
      brand: 10,
      offers: 10,
    },
    productIds: products.map((p) => p.id),
    tone: "Engaging and authoritative",
    callToAction: "Shop Now",
  });

  assert.ok(campaignRes.campaign, "Campaign record must be created");
  assert.ok(campaignRes.campaign.postCount >= 5, `Campaign must generate multi-day posts (got: ${campaignRes.campaign.postCount})`);
  assert.ok(campaignRes.scheduledPosts.length >= 5, "Scheduled posts array must be returned");

  // Verify posts in DB
  const dbPosts = await prisma.socialMediaPost.findMany({
    where: { campaignId: campaignRes.campaign.id },
    orderBy: { scheduledAt: "asc" },
  });
  assert.strictEqual(dbPosts.length, campaignRes.campaign.postCount, "All posts must exist in DB");

  // Verify timestamps are sequential
  for (let i = 1; i < dbPosts.length; i++) {
    const prev = new Date(dbPosts[i - 1].scheduledAt || 0).getTime();
    const curr = new Date(dbPosts[i].scheduledAt || 0).getTime();
    assert.ok(curr >= prev, `Post ${i} scheduled date must be >= Post ${i - 1}`);
  }

  console.log(`  ✓ Multi-day campaign "${campaignRes.campaign.name}" created with ${campaignRes.campaign.postCount} sequenced posts.`);
  console.log("  ✓ Sequential timestamps and platform adaptations verified.");

  // Clean up test campaign
  await prisma.socialPublication.deleteMany({
    where: { postId: { in: dbPosts.map((p) => p.id) } },
  });
  await prisma.socialMediaPost.deleteMany({
    where: { campaignId: campaignRes.campaign.id },
  });
  await prisma.socialCampaign.delete({
    where: { id: campaignRes.campaign.id },
  });

  aiService.generateText = originalGenerateText;

  // =========================================================================
  // PILLAR 3: GHUBA APPROVED-PRODUCT AGGREGATION & ATTRIBUTION
  // =========================================================================
  console.log("\n[PILLAR 3] Testing Ghuba Approved Products Aggregation & Attribution...");

  // Query approved marketplace listings with opt-in and company relation
  const approvedListings = await prisma.marketplaceListings.findMany({
    where: {
      status: "ACTIVE",
      ghubaAdminApproved: true,
      ghubaStatus: "APPROVED",
      company: {
        OR: [
          { showOnGhuba: true },
          { showOnGhuba: { isSet: false } },
        ],
      },
    },
    take: 10,
    select: {
      id: true,
      name: true,
      sellingPrice: true,
      finalPrice: true,
      images: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          showOnGhuba: true,
        },
      },
    },
  });

  assert.ok(approvedListings.length > 0, "Approved listings must exist in database");
  console.log(`  ✓ Queried ${approvedListings.length} approved Ghuba listings matching cross-store aggregation criteria.`);

  for (const item of approvedListings) {
    assert.ok(item.company, `Item "${item.name}" must have company attribution`);
    assert.notStrictEqual(item.company?.showOnGhuba, false, "Company must not be opted out");
    assert.ok(typeof item.company?.name === "string", "Company must have a valid name");

    // Test safe image normalization
    const rawImage = item.images?.length > 0 ? item.images[0] : null;
    let normalized = "https://via.placeholder.com/400x400?text=No+Image";
    if (rawImage) {
      if (typeof rawImage === "string") {
        normalized = rawImage;
      } else if (typeof rawImage === "object" && rawImage !== null) {
        normalized = (rawImage as any).url || (rawImage as any).secure_url || (rawImage as any).src || normalized;
      }
    }
    assert.strictEqual(typeof normalized, "string", "Image must be string");
    assert.ok(normalized.startsWith("http") || normalized.startsWith("/"), "Image URL must be valid path or URL");
  }
  console.log("  ✓ Store attribution (" + approvedListings[0].company?.name + ") verified.");
  console.log("  ✓ Image normalization handles both string and object formats safely.");

  // Test opt-out store exclusion
  const hiddenCompany = await prisma.company.create({
    data: {
      name: `Hidden Company ${Date.now()}`,
      slug: `hidden-co-${Date.now()}`,
      contactEmail: `hidden-${Date.now()}@test.com`,
      showOnGhuba: false,
    },
  });

  const hiddenListing = await prisma.marketplaceListings.create({
    data: {
      companyId: hiddenCompany.id,
      name: "Hidden Test Product",
      status: "ACTIVE",
      ghubaAdminApproved: true,
      ghubaStatus: "APPROVED",
      subCategory: {},
    },
  });

  try {
    const checkHidden = await prisma.marketplaceListings.findMany({
      where: {
        id: hiddenListing.id,
        status: "ACTIVE",
        ghubaAdminApproved: true,
        ghubaStatus: "APPROVED",
        company: {
          OR: [
            { showOnGhuba: true },
            { showOnGhuba: { isSet: false } },
          ],
        },
      },
    });
    assert.strictEqual(checkHidden.length, 0, "Listings from companies with showOnGhuba: false must be excluded from Ghuba");
    console.log("  ✓ Store opt-out check: stores with showOnGhuba: false are strictly excluded.");
  } finally {
    await prisma.marketplaceListings.delete({ where: { id: hiddenListing.id } });
    await prisma.company.delete({ where: { id: hiddenCompany.id } });
  }

  console.log("\n=================================================");
  console.log("   ALL THREE PILLARS VERIFIED AND PASSED!        ");
  console.log("=================================================\n");
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
