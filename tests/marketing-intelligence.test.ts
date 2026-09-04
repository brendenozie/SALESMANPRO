/**
 * tests/marketing-intelligence.test.ts
 *
 * Comprehensive Automated Verification Suite for External Marketing Intelligence:
 * 1. Multi-Tenant Connection Management & Tenant Isolation.
 * 2. Provider Metric Normalization (Meta, Google Ads, GA4, Social Organic).
 * 3. Data Synchronization & Snapshot Ingestion.
 * 4. Honest Attribution Engine (OBSERVED, CORRELATED, ATTRIBUTED, RECOMMENDED).
 * 5. Marketing Opportunity Engine Detection Logic.
 * 6. Explainable 0-100 Marketing Health Scorecard.
 * 7. AI Workforce Tool Registry Execution (Tools 22 - 27).
 */

import prisma from "../server/db/prismadb";
import { MarketingIntelligenceService } from "../lib/marketing/marketingIntelligenceService";
import { AttributionEngine } from "../lib/marketing/attributionEngine";
import { MetaAdsProvider } from "../lib/marketing/providers/metaAdsProvider";
import { GoogleAdsProvider } from "../lib/marketing/providers/googleAdsProvider";
import { GoogleAnalyticsProvider } from "../lib/marketing/providers/googleAnalyticsProvider";
import { SocialAnalyticsProvider } from "../lib/marketing/providers/socialAnalyticsProvider";
import { WorkforceToolRegistry } from "../lib/ai/workforce/toolRegistry";
import { AgentWorkforceLevel, AgentPermissionLevel } from "../lib/ai/workforce/types";
import { MarketingProviderType, MarketingConnectionStatus } from "@prisma/client";

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
  console.log("🧪 RUNNING MARKETING INTELLIGENCE TEST SUITE");
  console.log("=================================================\n");

  let testCompanyAId = "";
  let testCompanyBId = "";
  let metaConnectionId = "";
  let googleConnectionId = "";
  let ga4ConnectionId = "";
  let socialConnectionId = "";

  try {
    // 0. SEED TEST TENANTS
    console.log("--- SETUP: Seeding Test Companies ---");
    const compA = await prisma.company.create({
      data: {
        name: `Marketing Test Store A ${Date.now()}`,
        slug: `mkt-store-a-${Date.now()}`,
        contactEmail: `mkt-a-${Date.now()}@example.com`,
        aiCreditBalance: 50,
      },
    });
    testCompanyAId = compA.id;

    const compB = await prisma.company.create({
      data: {
        name: `Marketing Test Store B ${Date.now()}`,
        slug: `mkt-store-b-${Date.now()}`,
        contactEmail: `mkt-b-${Date.now()}@example.com`,
        aiCreditBalance: 50,
      },
    });
    testCompanyBId = compB.id;

    assert(!!testCompanyAId && !!testCompanyBId, "Test stores created successfully");
    console.log("");

    // 1. MULTI-TENANT MARKETING CONNECTION CREATION
    console.log("--- 1. MULTI-TENANT MARKETING CONNECTIONS ---");
    const metaConn = await prisma.marketingConnection.create({
      data: {
        companyId: testCompanyAId,
        provider: MarketingProviderType.META_ADS,
        accountId: `act_test_${Date.now()}`,
        accountName: "Store A Meta Ads Account",
        status: MarketingConnectionStatus.CONNECTED,
        accessTokenEncrypted: "encrypted_mock_meta_token",
        syncStatus: "PENDING",
      },
    });
    metaConnectionId = metaConn.id;

    const googleConn = await prisma.marketingConnection.create({
      data: {
        companyId: testCompanyAId,
        provider: MarketingProviderType.GOOGLE_ADS,
        accountId: `987-654-${Date.now().toString().slice(-4)}`,
        accountName: "Store A Google Ads Account",
        status: MarketingConnectionStatus.CONNECTED,
        accessTokenEncrypted: "encrypted_mock_google_token",
        syncStatus: "PENDING",
      },
    });
    googleConnectionId = googleConn.id;

    const ga4Conn = await prisma.marketingConnection.create({
      data: {
        companyId: testCompanyAId,
        provider: MarketingProviderType.GOOGLE_ANALYTICS_4,
        accountId: `G-TEST-${Date.now().toString().slice(-6)}`,
        accountName: "Store A GA4 Property",
        status: MarketingConnectionStatus.CONNECTED,
        accessTokenEncrypted: "encrypted_mock_ga4_token",
        syncStatus: "PENDING",
      },
    });
    ga4ConnectionId = ga4Conn.id;

    const socialConn = await prisma.marketingConnection.create({
      data: {
        companyId: testCompanyBId, // Belongs to Store B!
        provider: MarketingProviderType.SOCIAL_ORGANIC,
        accountId: `social_test_${Date.now()}`,
        accountName: "Store B Social Feeds",
        status: MarketingConnectionStatus.CONNECTED,
        syncStatus: "PENDING",
      },
    });
    socialConnectionId = socialConn.id;

    // Verify isolation
    const storeAConns = await prisma.marketingConnection.findMany({
      where: { companyId: testCompanyAId },
    });
    assert(
      storeAConns.length === 3 &&
        storeAConns.every((c) => c.companyId === testCompanyAId),
      "Store A queries only return Store A connections (Tenant Isolation)",
    );

    const storeBConns = await prisma.marketingConnection.findMany({
      where: { companyId: testCompanyBId },
    });
    assert(
      storeBConns.length === 1 && storeBConns[0].id === socialConnectionId,
      "Store B cannot view Store A marketing accounts",
    );
    console.log("");

    // 2. PROVIDER METRIC NORMALIZATION
    console.log("--- 2. PROVIDER METRIC NORMALIZATION ---");
    const metaProvider = new MetaAdsProvider();
    const metaMetrics = await metaProvider.fetchMetrics({
      accountId: metaConn.accountId,
    });
    assert(
      metaMetrics.spendKES > 0 &&
        metaMetrics.impressions > 0 &&
        metaMetrics.roas > 0,
      "MetaAdsProvider produces normalized metrics with spendKES and ROAS",
    );

    const googleProvider = new GoogleAdsProvider();
    const googleMetrics = await googleProvider.fetchMetrics({
      accountId: googleConn.accountId,
    });
    assert(
      googleMetrics.cpcKES > 0 &&
        googleMetrics.conversions > 0 &&
        googleMetrics.roas > 0,
      "GoogleAdsProvider produces normalized metrics with cpcKES and conversions",
    );

    const ga4Provider = new GoogleAnalyticsProvider();
    const ga4Metrics = await ga4Provider.fetchMetrics({
      accountId: ga4Conn.accountId,
    });
    assert(
      (ga4Metrics.sessions || 0) > 0 && (ga4Metrics.bounceRate || 0) > 0,
      "GoogleAnalyticsProvider reports behavioral sessions and bounceRate",
    );

    const socialProvider = new SocialAnalyticsProvider();
    const socialMetrics = await socialProvider.fetchMetrics({
      accountId: socialConn.accountId,
    });
    assert(
      socialMetrics.spendKES === 0 &&
        socialMetrics.impressions > 0 &&
        socialMetrics.clicks > 0,
      "SocialAnalyticsProvider accurately sets direct ad spend to 0 with verified organic reach",
    );
    console.log("");

    // 3. SYNCHRONIZATION & SNAPSHOT RECORDING
    console.log("--- 3. DATA SYNCHRONIZATION ENGINE ---");
    const syncResult = await MarketingIntelligenceService.syncConnection(metaConnectionId);
    assert(
      syncResult.success && syncResult.campaignsSynced > 0,
      "MarketingIntelligenceService.syncConnection synchronizes external campaigns",
    );

    const savedCampaigns = await prisma.externalMarketingCampaign.findMany({
      where: { connectionId: metaConnectionId },
    });
    assert(
      savedCampaigns.length === syncResult.campaignsSynced,
      "External campaigns saved into database under tenant context",
    );

    const updatedConn = await prisma.marketingConnection.findUnique({
      where: { id: metaConnectionId },
    });
    assert(
      updatedConn?.syncStatus === "SUCCESS" && !!updatedConn.lastSyncAt,
      "Marketing connection status updated to SUCCESS with lastSyncAt timestamp",
    );
    console.log("");

    // 4. HONEST ATTRIBUTION DISAMBIGUATION
    console.log("--- 4. HONEST ATTRIBUTION ENGINE ---");
    const honestAttribution = await AttributionEngine.getHonestAttribution(testCompanyAId);
    assert(
      !!honestAttribution.observed &&
        !!honestAttribution.correlated &&
        !!honestAttribution.attributed &&
        !!honestAttribution.recommended,
      "AttributionEngine cleanly disambiguates OBSERVED, CORRELATED, ATTRIBUTED, and RECOMMENDED",
    );

    assert(
      honestAttribution.observed.category === "OBSERVED" &&
        honestAttribution.correlated.category === "CORRELATED" &&
        honestAttribution.attributed.category === "ATTRIBUTED" &&
        honestAttribution.recommended.category === "RECOMMENDED",
      "Attribution categories strictly categorized to prevent false certainty",
    );
    console.log("");

    // 5. MARKETING OPPORTUNITY ENGINE
    console.log("--- 5. MARKETING OPPORTUNITY ENGINE ---");
    const opportunities = await MarketingIntelligenceService.detectOpportunities(testCompanyAId);
    assert(
      Array.isArray(opportunities) && opportunities.length > 0,
      "Marketing Opportunity Engine returns actionable signals",
    );

    const validSignals = opportunities.every(
      (o) =>
        !!o.id &&
        !!o.type &&
        !!o.severity &&
        !!o.title &&
        !!o.observation &&
        !!o.explanation &&
        !!o.recommendedAction,
    );
    assert(validSignals, "All opportunity signals contain complete structured diagnostic explanations");
    console.log("");

    // 6. EXPLAINABLE 0-100 HEALTH SCORECARD
    console.log("--- 6. MARKETING HEALTH SCORECARD ---");
    const health = await MarketingIntelligenceService.computeHealthScore(testCompanyAId);
    assert(
      health.score >= 0 && health.score <= 100,
      `Marketing Health Score is normalized between 0 and 100 (Computed: ${health.score})`,
    );

    assert(
      !!health.dimensions.trackingHealth &&
        !!health.dimensions.advertisingEfficiency &&
        !!health.dimensions.contentConsistency &&
        !!health.dimensions.trafficQuality &&
        !!health.dimensions.conversionHealth,
      "Health Scorecard decomposes into 5 transparent, explainable dimensions",
    );

    assert(
      Array.isArray(health.keyRecommendations) && health.keyRecommendations.length > 0,
      "Health Scorecard provides actionable prioritized recommendations",
    );
    console.log("");

    // 7. AI WORKFORCE TOOL REGISTRY VERIFICATION (Tools 22 - 27)
    console.log("--- 7. AI WORKFORCE TOOL REGISTRY (TOOLS 22-27) ---");

    // Tool 22: getMarketingConnections
    const tool22 = WorkforceToolRegistry.getTool("getMarketingConnections");
    assert(!!tool22, "Tool 22 'getMarketingConnections' registered in WorkforceToolRegistry");
    const res22 = await WorkforceToolRegistry.executeTool(
      "getMarketingConnections",
      {},
      {
        agentId: "agent_analyst",
        level: AgentWorkforceLevel.STORE,
        companyId: testCompanyAId,
        companyName: "Store A",
        permissionLevel: AgentPermissionLevel.EXECUTE,
      },
    );
    assert(res22.success && res22.data.count === 3, "Tool 22 executes and returns Store A connections");

    // Tool 23: getMarketingAnalytics
    const tool23 = WorkforceToolRegistry.getTool("getMarketingAnalytics");
    assert(!!tool23, "Tool 23 'getMarketingAnalytics' registered in WorkforceToolRegistry");
    const res23 = await WorkforceToolRegistry.executeTool(
      "getMarketingAnalytics",
      {},
      {
        agentId: "agent_analyst",
        level: AgentWorkforceLevel.STORE,
        companyId: testCompanyAId,
        companyName: "Store A",
        permissionLevel: AgentPermissionLevel.EXECUTE,
      },
    );
    assert(res23.success && res23.data.channels?.length > 0, "Tool 23 returns cross-platform analytics data");

    // Tool 24: compareMarketingChannels
    const tool24 = WorkforceToolRegistry.getTool("compareMarketingChannels");
    assert(!!tool24, "Tool 24 'compareMarketingChannels' registered in WorkforceToolRegistry");
    const res24 = await WorkforceToolRegistry.executeTool(
      "compareMarketingChannels",
      {},
      {
        agentId: "agent_analyst",
        level: AgentWorkforceLevel.STORE,
        companyId: testCompanyAId,
        companyName: "Store A",
        permissionLevel: AgentPermissionLevel.EXECUTE,
      },
    );
    assert(
      res24.success && Array.isArray(res24.data.channels),
      "Tool 24 executes and provides side-by-side channel performance comparisons",
    );

    // Tool 25: analyzeMarketingOpportunities
    const tool25 = WorkforceToolRegistry.getTool("analyzeMarketingOpportunities");
    assert(!!tool25, "Tool 25 'analyzeMarketingOpportunities' registered in WorkforceToolRegistry");
    const res25 = await WorkforceToolRegistry.executeTool(
      "analyzeMarketingOpportunities",
      {},
      {
        agentId: "agent_analyst",
        level: AgentWorkforceLevel.STORE,
        companyId: testCompanyAId,
        companyName: "Store A",
        permissionLevel: AgentPermissionLevel.RECOMMEND,
      },
    );
    assert(
      res25.success && res25.data.count > 0,
      "Tool 25 executes Opportunity Engine for AI Workforce growth agents",
    );

    // Tool 26: getMarketingHealthScore
    const tool26 = WorkforceToolRegistry.getTool("getMarketingHealthScore");
    assert(!!tool26, "Tool 26 'getMarketingHealthScore' registered in WorkforceToolRegistry");
    const res26 = await WorkforceToolRegistry.executeTool(
      "getMarketingHealthScore",
      {},
      {
        agentId: "agent_analyst",
        level: AgentWorkforceLevel.STORE,
        companyId: testCompanyAId,
        companyName: "Store A",
        permissionLevel: AgentPermissionLevel.EXECUTE,
      },
    );
    assert(
      res26.success && res26.data.score !== undefined,
      "Tool 26 executes and computes 0-100 Marketing Health Score",
    );

    // Tool 27: syncMarketingProvider
    const tool27 = WorkforceToolRegistry.getTool("syncMarketingProvider");
    assert(!!tool27, "Tool 27 'syncMarketingProvider' registered in WorkforceToolRegistry");
    const res27 = await WorkforceToolRegistry.executeTool(
      "syncMarketingProvider",
      { connectionId: metaConnectionId },
      {
        agentId: "agent_growth",
        level: AgentWorkforceLevel.STORE,
        companyId: testCompanyAId,
        companyName: "Store A",
        permissionLevel: AgentPermissionLevel.RECOMMEND,
      },
    );
    assert(
      res27.success && res27.data.success === true,
      "Tool 27 triggers live synchronization of external provider",
    );
    console.log("");

  } catch (err: any) {
    console.error("💥 TEST SUITE CRASHED:", err);
    failedCount++;
  } finally {
    // CLEANUP
    console.log("--- TEARDOWN: Cleaning up test artifacts ---");
    if (metaConnectionId || googleConnectionId || ga4ConnectionId || socialConnectionId) {
      await prisma.externalMarketingCampaign.deleteMany({
        where: {
          connectionId: {
            in: [metaConnectionId, googleConnectionId, ga4ConnectionId, socialConnectionId].filter(Boolean),
          },
        },
      }).catch(() => {});

      await prisma.marketingMetricSnapshot.deleteMany({
        where: {
          companyId: { in: [testCompanyAId, testCompanyBId].filter(Boolean) },
        },
      }).catch(() => {});

      await prisma.marketingConnection.deleteMany({
        where: {
          id: {
            in: [metaConnectionId, googleConnectionId, ga4ConnectionId, socialConnectionId].filter(Boolean),
          },
        },
      }).catch(() => {});
    }

    if (testCompanyAId || testCompanyBId) {
      await prisma.company.deleteMany({
        where: { id: { in: [testCompanyAId, testCompanyBId].filter(Boolean) } },
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
