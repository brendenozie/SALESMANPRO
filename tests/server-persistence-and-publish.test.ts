/**
 * tests/server-persistence-and-publish.test.ts
 *
 * End-to-end server persistence and actual publication workflow verification:
 * 1. getOrCreateWebsite: Synthesizes initial website configuration in DB.
 * 2. saveWebsiteDraft: Persists draft with componentOverrides to authoritative backend database.
 * 3. Fresh Context Reopen: Verifies persisted draft configuration in a clean DB query.
 * 4. publishWebsite: Executes real atomic publish transaction ($transaction), creates revision, updates publishedConfig.
 * 5. Independent Public Storefront Resolution: Fetches publishedConfig via getPublishedWebsiteConfig and verifies storefront data transformation.
 * 6. Subdomain & Custom Domain Rendering Paths: Verifies tenant host resolution and URL sanitization.
 */

import prisma from "@/server/db/prismadb";
import {
  getOrCreateWebsite,
  saveWebsiteDraft,
  publishWebsite,
  getPublishedWebsiteConfig,
} from "@/lib/website-builder/website-service";
import { applyWebsiteConfigToStoreData } from "@/lib/website-builder/applyWebsiteConfigToStoreData";
import { classifyTenantHost, buildTenantUrl } from "@/lib/tenant/tenant-router";

async function runServerPersistenceAndPublishTest() {
  console.log("\n=======================================================");
  console.log("🗄️ REAL SERVER PERSISTENCE & AUTHORITATIVE PUBLISH TEST");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  const targetSlug = "test-shop";

  try {
    // 1. Initial State Inspection
    console.log("--- 1. Get or Create Tenant Website in Database ---");
    const { website, config, isNew } = await getOrCreateWebsite(targetSlug);
    assert(!!website?.id, "Website record created/loaded with valid DB ID");
    assert(!!config?.templateKey, `Config has canonical templateKey: ${config.templateKey}`);
    const sections = config?.pages?.[0]?.sections || (config as any)?.sections;
    assert(Array.isArray(sections), "Config sections array synthesized");

    const companyId = website.companyId;

    // 2. Draft Editing & Server Persistence
    console.log("\n--- 2. Save Draft Edits to Authoritative Backend Database ---");
    const testOverrideHeadline = "PRODUCTION VALIDATED: ULTRA PERFORMANCE CARS";
    const testHeaderBrand = "TEST MOTORS ELITE";

    const updatedDraft = JSON.parse(JSON.stringify(config));
    if (!updatedDraft.componentOverrides) {
      updatedDraft.componentOverrides = {};
    }
    updatedDraft.componentOverrides["HeroSection.slide0.headline"] = testOverrideHeadline;
    updatedDraft.componentOverrides["home.hero-slider.slides.0.headline"] = testOverrideHeadline;
    updatedDraft.componentOverrides["Header.storeName"] = testHeaderBrand;
    updatedDraft.componentOverrides["Header.brandName"] = testHeaderBrand;

    // Call actual backend persistence service
    const savedResult = await saveWebsiteDraft(companyId, updatedDraft);
    assert(
      savedResult.componentOverrides["Header.storeName"] === testHeaderBrand,
      "saveWebsiteDraft returns validated draft config with Header override"
    );

    // 3. Fresh Context Verification (Clean DB query bypassing memory caches)
    console.log("\n--- 3. Fresh Context Re-query from Database ---");
    const freshDbWebsite = await prisma.website.findUnique({
      where: { companyId },
      select: {
        id: true,
        draftConfig: true,
        publishedConfig: true,
        updatedAt: true,
      },
    });

    assert(!!freshDbWebsite, "Direct DB query retrieves persisted website record");
    const freshDraft = freshDbWebsite?.draftConfig as any;
    assert(
      freshDraft?.componentOverrides?.["Header.storeName"] === testHeaderBrand,
      "Fresh DB query confirms Header override saved in PostgreSQL/MongoDB draftConfig"
    );
    assert(
      freshDraft?.componentOverrides?.["HeroSection.slide0.headline"] === testOverrideHeadline,
      "Fresh DB query confirms Hero headline saved in draftConfig"
    );

    // 4. Actual Atomic Publication
    console.log("\n--- 4. Real Publication Workflow (publishWebsite) ---");
    const publishRes = await publishWebsite(
      companyId,
      "Automated End-to-End Publication Verification"
    );

    assert(!!publishRes?.publishedConfig, "publishWebsite returns publishedConfig");
    assert(publishRes?.versionNumber >= 1, `Publication assigned atomic version number (v${publishRes.versionNumber})`);

    // Verify revision record was created in database
    const latestRevision = await prisma.websiteRevision.findFirst({
      where: { websiteId: website.id },
      orderBy: { versionNumber: "desc" },
    });
    assert(!!latestRevision, "Authoritative websiteRevision record created in DB");
    assert(
      latestRevision?.versionNumber === publishRes.versionNumber,
      `websiteRevision version matches publication response (${latestRevision?.versionNumber})`
    );

    // 5. Independent Public Storefront Resolution
    console.log("\n--- 5. Public Storefront Data Resolution (getPublishedWebsiteConfig) ---");
    const publicPublishedConfig = await getPublishedWebsiteConfig(targetSlug);
    assert(!!publicPublishedConfig, "getPublishedWebsiteConfig returns published configuration for public storefront");
    assert(
      publicPublishedConfig?.componentOverrides?.["Header.storeName"] === testHeaderBrand,
      "Public storefront config contains published Header override"
    );
    assert(
      publicPublishedConfig?.componentOverrides?.["HeroSection.slide0.headline"] === testOverrideHeadline,
      "Public storefront config contains published Hero headline override"
    );

    // 6. Test Storefront Data Transformation
    console.log("\n--- 6. Public Storefront Layout Transformation ---");
    const mockStoreFormData: any = {
      id: "mock-1",
      slug: targetSlug,
      name: "Original Test Shop",
      description: "Original Description",
      websiteConfig: publicPublishedConfig,
      heroSlides: [
        { headline: "Original Default Headline", subline: "Original Subline" }
      ],
      sections: [],
    };

    const transformedStore = applyWebsiteConfigToStoreData(
      mockStoreFormData,
      publicPublishedConfig!,
      "home"
    );

    assert(
      transformedStore.name === testHeaderBrand,
      `applyWebsiteConfigToStoreData updated store name to '${transformedStore.name}'`
    );
    assert(
      transformedStore.heroSlides[0].headline === testOverrideHeadline,
      `applyWebsiteConfigToStoreData updated hero slide headline to '${transformedStore.heroSlides[0].headline}'`
    );

    // 7. Domain & Subdomain Routing Paths
    console.log("\n--- 7. Storefront Route & Domain Classification ---");
    const localHostClass = classifyTenantHost("localhost:3000");
    assert(localHostClass.isLocalhost, "classifyTenantHost correctly identifies localhost");
    const localUrl = buildTenantUrl({ tenantSlug: targetSlug, path: "/products", context: { host: "localhost:3000" } });
    assert(localUrl === `/site/${targetSlug}/products`, `Localhost URL correctly prefixes /site/[slug]: '${localUrl}'`);

    const subHostClass = classifyTenantHost(`${targetSlug}.salesmanpro.site`);
    assert(subHostClass.isTenantSubdomain, "classifyTenantHost correctly identifies tenant subdomain");
    const subUrl = buildTenantUrl({ tenantSlug: targetSlug, path: "/products", context: { host: `${targetSlug}.salesmanpro.site` } });
    assert(subUrl === "/products", `Subdomain URL cleanly omits /site/[slug]: '${subUrl}'`);

    const customHostClass = classifyTenantHost("testshop-custom.com");
    assert(customHostClass.isCustomDomain, "classifyTenantHost correctly identifies custom domain");
    const customUrl = buildTenantUrl({ tenantSlug: targetSlug, path: "/products", context: { host: "testshop-custom.com" } });
    assert(customUrl === "/products", `Custom domain URL cleanly omits /site/[slug]: '${customUrl}'`);

    // 8. Cleanup test data
    console.log("\n--- 8. Cleanup Database State ---");
    await prisma.websiteRevision.deleteMany({ where: { websiteId: website.id } });
    await prisma.website.delete({ where: { id: website.id } });
    console.log("  ✅ Cleaned up temporary test website and revisions");

  } catch (err: any) {
    console.error("Test execution failed with error:", err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n=======================================================");
  console.log(`📊 SERVER PERSISTENCE & PUBLISH RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) process.exit(1);
}

runServerPersistenceAndPublishTest();
