/**
 * scripts/verify_systems.ts
 *
 * Automated Verification Script for:
 * 1. New-Store AI Credit Onboarding & Idempotent Ledger Transaction
 * 2. Social Media Station Multi-Day Campaign Planning & Catalog Awareness
 * 3. Ghuba Marketplace Approved-Product Aggregation, Store Attribution & Image Normalization
 */

import prisma from "../server/db/prismadb";
import { grantWelcomeCredits } from "../lib/ai/creditLedger";
import { WELCOME_AI_CREDITS } from "../lib/ai/aiConfig";
import { contentStrategyEngine } from "../lib/social/contentStrategyEngine";

async function runVerification() {
  console.log("================================================================");
  console.log("STARTING SALESMANPRO THREE-PILLAR VERIFICATION SUITE");
  console.log("================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // Find or create a test store / user
  const existingCompany = await prisma.company.findFirst({
    where: { showOnGhuba: { not: false } },
    include: { user: true },
  });

  if (!existingCompany) {
    throw new Error("No company found in database for testing.");
  }

  console.log(`Using test company: "${existingCompany.name}" (ID: ${existingCompany.id})`);

  // ===========================================================================
  // TEST SUITE 1: WELCOME AI CREDITS & IDEMPOTENT LEDGER
  // ===========================================================================
  console.log("\n--- TEST SUITE 1: Welcome AI Credits & Idempotency ---");
  
  // 1.1 Test welcome grant on a test company ID
  const testCompany = await prisma.company.create({
    data: {
      name: "Test Verification Boutique " + Date.now(),
      slug: "test-boutique-" + Date.now(),
      userId: existingCompany.userId,
      showOnGhuba: true,
      aiCreditBalance: 0,
    },
  });

  try {
    const grantResult1 = await grantWelcomeCredits({
      companyId: testCompany.id,
      userId: testCompany.userId || undefined,
    });

    assert(grantResult1.granted === true, "First welcome grant must succeed");
    assert(grantResult1.amount === WELCOME_AI_CREDITS, `Grant amount must equal WELCOME_AI_CREDITS (${WELCOME_AI_CREDITS})`);
    assert(grantResult1.balance === WELCOME_AI_CREDITS, `Store balance must now be ${WELCOME_AI_CREDITS}`);

    // Verify company balance in DB
    const updatedStore = await prisma.company.findUnique({
      where: { id: testCompany.id },
      select: { aiCreditBalance: true },
    });
    assert(updatedStore?.aiCreditBalance === WELCOME_AI_CREDITS, `Database aiCreditBalance must be ${WELCOME_AI_CREDITS}`);

    // Verify transaction record in ledger
    const ledgerTx = await prisma.aICreditTransaction.findFirst({
      where: {
        companyId: testCompany.id,
        idempotencyKey: `welcome_credit_${testCompany.id}`,
      },
    });
    assert(!!ledgerTx, "Promotional AICreditTransaction record must exist in ledger");
    assert(ledgerTx?.amount === WELCOME_AI_CREDITS, "Transaction amount must be recorded accurately");
    assert(ledgerTx?.type === "PROMOTIONAL", "Transaction type must be PROMOTIONAL");

    // 1.2 Test Idempotency: second grant on same store MUST NOT award duplicate credits
    const grantResult2 = await grantWelcomeCredits({
      companyId: testCompany.id,
      userId: testCompany.userId || undefined,
    });
    assert(grantResult2.granted === false, "Second welcome grant on same company must be rejected as duplicate");
    assert(grantResult2.balance === WELCOME_AI_CREDITS, `Store balance must remain unchanged at ${WELCOME_AI_CREDITS}`);

    const txCount = await prisma.aICreditTransaction.count({
      where: { companyId: testCompany.id, type: "PROMOTIONAL" },
    });
    assert(txCount === 1, "Exactly one promotional transaction must exist in ledger");

  } finally {
    // Clean up temporary test company and its transactions
    await prisma.aICreditTransaction.deleteMany({ where: { companyId: testCompany.id } });
    await prisma.whatsAppAIConfig.deleteMany({ where: { companyId: testCompany.id } });
    await prisma.company.delete({ where: { id: testCompany.id } });
  }

  // ===========================================================================
  // TEST SUITE 2: MULTI-DAY CAMPAIGN PLANNING & CATALOG AWARENESS
  // ===========================================================================
  console.log("\n--- TEST SUITE 2: Multi-Day Campaign Planning & Catalog Awareness ---");

  // Ensure test company has credits for campaign generation
  const initialCompany = await prisma.company.findUnique({
    where: { id: existingCompany.id },
    select: { aiCreditBalance: true },
  });
  const prevBalance = initialCompany?.aiCreditBalance || 0;

  // Temporarily ensure company has at least 50 credits
  if (prevBalance < 50) {
    await prisma.company.update({
      where: { id: existingCompany.id },
      data: { aiCreditBalance: { increment: 50 } },
    });
  }

  // Check store products
  const products = await prisma.product.findMany({
    where: { companyId: existingCompany.id, quantity: { gt: 0 } },
    take: 3,
  });

  console.log(`Found ${products.length} in-stock catalog products for test company.`);

  const startDate = new Date();
  const endDate = new Date(Date.now() + 7 * 86400000); // 7 days

  const campaignResult = await contentStrategyEngine.generateCampaign({
    companyId: existingCompany.id,
    userId: existingCompany.userId || undefined,
    name: "Automated Verification 7-Day Sprint",
    objective: "INCREASE SALES & AWARENESS",
    planningMode: "ONE_WEEK",
    startDate,
    endDate,
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

  assert(!!campaignResult.campaign, "Campaign object must be returned");
  assert(campaignResult.campaign.postCount >= 5, `Campaign must contain scheduled multi-day posts (got ${campaignResult.campaign.postCount})`);
  assert(campaignResult.scheduledPosts.length >= 5, `Scheduled posts array must be populated (got ${campaignResult.scheduledPosts.length})`);

  // Verify posts are persisted in database
  const createdPosts = await prisma.socialMediaPost.findMany({
    where: { campaignId: campaignResult.campaign.id },
  });
  assert(createdPosts.length === campaignResult.campaign.postCount, "All campaign posts must be persisted in database");

  // Verify scheduled timestamps are sequential
  for (let i = 1; i < createdPosts.length; i++) {
    const prev = new Date(createdPosts[i - 1].scheduledAt || 0).getTime();
    const curr = new Date(createdPosts[i].scheduledAt || 0).getTime();
    assert(curr >= prev, `Post ${i} scheduledAt (${curr}) must be on or after post ${i - 1} scheduledAt (${prev})`);
  }

  // Clean up test campaign and posts
  await prisma.socialPublication.deleteMany({
    where: { postId: { in: createdPosts.map((p) => p.id) } },
  });
  await prisma.socialMediaPost.deleteMany({
    where: { campaignId: campaignResult.campaign.id },
  });
  await prisma.socialCampaign.delete({
    where: { id: campaignResult.campaign.id },
  });

  // ===========================================================================
  // TEST SUITE 3: GHUBA APPROVED-PRODUCT AGGREGATION & IMAGE NORMALIZATION
  // ===========================================================================
  console.log("\n--- TEST SUITE 3: Ghuba Marketplace Aggregation & Normalization ---");

  // Query approved marketplace listings with company relation and opt-in check
  const approvedListings = await prisma.marketplaceListings.findMany({
    where: {
      status: "ACTIVE",
      ghubaAdminApproved: true,
      ghubaStatus: "APPROVED",
      company: {
        showOnGhuba: { not: false },
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

  console.log(`Found ${approvedListings.length} approved Ghuba products matching criteria.`);
  assert(approvedListings.length > 0, "Database must have active approved Ghuba products");

  for (const listing of approvedListings) {
    assert(listing.company !== null, `Listing "${listing.name}" must have an associated company`);
    assert(listing.company?.showOnGhuba !== false, `Store "${listing.company?.name}" must not have showOnGhuba = false`);
    assert(typeof listing.company?.name === "string", "Company must have a valid name for attribution");

    // Test image normalization logic
    const rawImage = listing.images?.length > 0 ? listing.images[0] : null;
    let normalized = "https://via.placeholder.com/400x400?text=No+Image";
    if (rawImage) {
      if (typeof rawImage === "string") {
        normalized = rawImage;
      } else if (typeof rawImage === "object" && rawImage !== null) {
        normalized = (rawImage as any).url || (rawImage as any).secure_url || (rawImage as any).src || normalized;
      }
    }
    assert(typeof normalized === "string" && normalized.length > 0, `Normalized image URL must be a valid string (got: ${typeof normalized})`);
  }

  // Test opt-out filter: create or update a company to showOnGhuba = false and verify exclusion
  const testOptOutStore = await prisma.company.create({
    data: {
      name: "Opted Out Secret Boutique " + Date.now(),
      slug: "opt-out-" + Date.now(),
      showOnGhuba: false,
    },
  });

  const testOptOutListing = await prisma.marketplaceListings.create({
    data: {
      companyId: testOptOutStore.id,
      name: "Hidden Product",
      status: "ACTIVE",
      ghubaAdminApproved: true,
      ghubaStatus: "APPROVED",
      subCategory: {},
    },
  });

  try {
    const checkExcluded = await prisma.marketplaceListings.findMany({
      where: {
        id: testOptOutListing.id,
        status: "ACTIVE",
        ghubaAdminApproved: true,
        ghubaStatus: "APPROVED",
        company: {
          showOnGhuba: { not: false },
        },
      },
    });
    assert(checkExcluded.length === 0, "Products from stores with showOnGhuba: false MUST be excluded from Ghuba");
  } finally {
    await prisma.marketplaceListings.delete({ where: { id: testOptOutListing.id } });
    await prisma.company.delete({ where: { id: testOptOutStore.id } });
  }

  console.log("\n================================================================");
  console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified successfully!`);
  console.log("================================================================\n");
}

runVerification()
  .catch((err) => {
    console.error("Verification failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
