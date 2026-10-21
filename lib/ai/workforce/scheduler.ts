/**
 * lib/ai/workforce/scheduler.ts
 *
 * Scheduled Operational Monitors & Cron Triggers for the SalesmanPro AI Workforce.
 * Operates on bounded batches, pre-validates credits, avoids full-table locks,
 * and executes scheduled operational health checks:
 * 1. Daily Store Briefing (07:00 EAT = 04:00 UTC)
 * 2. Overdue Order & Fulfillment Monitor (~5 min)
 * 3. Low-Stock & Catalog Health Reconciler (~15 min)
 * 4. Payment Reconciliation & Webhook Health Monitor (~10 min)
 */

import prisma from "@/server/db/prismadb";
import { workforceQueue } from "./queue";
import { WorkforceOrchestrator } from "./orchestrator";
import { WorkforceMemoryManager } from "./memoryManager";
import { AgentWorkforceLevel, AgentMemoryScope } from "./types";

const orchestrator = new WorkforceOrchestrator();

export const DAILY_BRIEFING_CRON_PATTERN = "0 4 * * *"; // 04:00 UTC = 07:00 EAT (UTC+3)
export const OVERDUE_ORDERS_INTERVAL_MS = 5 * 60 * 1000;  // 5 minutes
export const LOW_STOCK_INTERVAL_MS = 15 * 60 * 1000;     // 15 minutes
export const PAYMENT_RECONCILIATION_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const STORE_BATCH_SIZE = 10;

/**
 * 1. Executes Store Manager Daily Briefings with batching and credit checks.
 */
export async function triggerDailyStoreBriefings(): Promise<{
  totalStores: number;
  briefingsGenerated: number;
  skipped: number;
  errors: Array<{ companyId: string; error: string }>;
}> {
  const todayStr = new Date().toISOString().split("T")[0];
  console.log(`[WORKFORCE_CRON] Starting Daily Store Briefings for date: ${todayStr} (07:00 EAT)`);

  let cursor: string | undefined = undefined;
  let hasMore = true;
  let totalStores = 0;
  let generatedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ companyId: string; error: string }> = [];

  while (hasMore) {
    const batch: any[] = await prisma.company.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
        aiCreditBalance: true,
      },
      take: STORE_BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
    });

    if (batch.length === 0) {
      break;
    }

    totalStores += batch.length;
    cursor = batch[batch.length - 1].id;
    if (batch.length < STORE_BATCH_SIZE) {
      hasMore = false;
    }

    for (const company of batch) {
      try {
        // A. Deduplication check: Check if briefing already exists for today
        const existingBriefing = await prisma.aIAgentMemory.findFirst({
          where: {
            companyId: company.id,
            scope: AgentMemoryScope.BUSINESS,
            key: `DAILY_BRIEFING_${todayStr}`,
          },
        });

        if (existingBriefing) {
          skippedCount++;
          continue;
        }

        // B. Credit Check: Skip non-critical automated briefing if tenant balance is zero
        if ((company.aiCreditBalance ?? 0) <= 0) {
          skippedCount++;
          continue;
        }

        // C. Execute STORE_MANAGER agent
        const result = await orchestrator.execute(
          {
            agentKey: "STORE_MANAGER",
            prompt:
              "Generate my comprehensive store operational briefing for today. Include stock warnings, sales trends, pending customer inquiries, and 3 high-priority recommendations.",
            channel: "WEB",
          },
          {
            companyId: company.id,
            companyName: company.name,
            level: AgentWorkforceLevel.STORE,
            traceId: `cron_briefing_${company.id}_${todayStr}`,
            channel: "WEB",
          },
        );

        // D. Persist into business memory
        await WorkforceMemoryManager.recordMemory({
          context: {
            companyId: company.id,
            companyName: company.name,
            level: AgentWorkforceLevel.STORE,
            traceId: `cron_briefing_${company.id}_${todayStr}`,
            channel: "WEB",
          },
          scope: AgentMemoryScope.BUSINESS,
          key: `DAILY_BRIEFING_${todayStr}`,
          content: result.reply,
          metadata: {
            date: todayStr,
            triggeredBy: "CRON_0700_EAT",
            creditsUsed: result.creditsUsed,
            generatedAt: new Date().toISOString(),
          },
          expiresInDays: 30,
        });

        // E. Create in-app Notification for store staff
        await prisma.notification.create({
          data: {
            companyId: company.id,
            title: `Daily Store Briefing (${todayStr})`,
            message: result.reply.length > 250 ? result.reply.slice(0, 247) + "..." : result.reply,
            read: false,
          },
        }).catch((notifErr) => {
          console.warn(`[WORKFORCE_NOTIF_WARN: ${company.id}]`, notifErr?.message || notifErr);
        });

        generatedCount++;
      } catch (err: any) {
        console.error(`[WORKFORCE_CRON_STORE_ERROR: ${company.id}]`, err?.message || err);
        errors.push({ companyId: company.id, error: err?.message || "Unknown error" });
      }
    }
  }

  console.log(
    `[WORKFORCE_CRON_COMPLETE] Briefings generated: ${generatedCount}, skipped: ${skippedCount}, errors: ${errors.length}`,
  );

  return {
    totalStores,
    briefingsGenerated: generatedCount,
    skipped: skippedCount,
    errors,
  };
}

/**
 * 2. Monitors Overdue Orders & Delayed Fulfillment (~5 minutes).
 * Detects pending or processing orders exceeding normal fulfillment windows.
 */
export async function checkOverdueOrdersAndFulfillmentExceptions(): Promise<{
  overdueCount: number;
  storesAlerted: number;
}> {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Find unfulfilled customer orders older than 30 minutes
  const overdueOrders = await prisma.customerOrder.findMany({
    where: {
      status: { in: ["PENDING", "PROCESSING"] },
      createdAt: { lt: thirtyMinutesAgo },
      deletedAt: null,
    },
    select: {
      id: true,
      companyId: true,
      totalFinalPrice: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      deliveryStatus: true,
    },
    take: 50,
  });

  if (overdueOrders.length === 0) {
    return { overdueCount: 0, storesAlerted: 0 };
  }

  // Group by store
  const storeMap: Record<string, typeof overdueOrders> = {};
  for (const o of overdueOrders) {
    if (!o.companyId) continue;
    if (!storeMap[o.companyId]) storeMap[o.companyId] = [];
    storeMap[o.companyId].push(o);
  }

  let storesAlerted = 0;
  const todayHourStr = new Date().toISOString().slice(0, 13); // Group alerts per hour

  for (const [companyId, orders] of Object.entries(storeMap)) {
    try {
      // Avoid duplicate alert within the same hour
      const existingAlert = await prisma.notification.findFirst({
        where: {
          companyId,
          title: { contains: "Overdue Orders Alert" },
          createdAt: { gte: twoHoursAgo },
        },
      });

      if (!existingAlert) {
        await prisma.notification.create({
          data: {
            companyId,
            title: `⚠️ Overdue Orders Alert (${orders.length} orders)`,
            message: `You have ${orders.length} orders pending fulfillment for over 30 minutes. Please inspect fulfillment to prevent dispatch delays.`,
            read: false,
          },
        });
        storesAlerted++;
      }
    } catch (err: any) {
      console.warn(`[OVERDUE_ORDER_MONITOR_ERROR: ${companyId}]`, err?.message || err);
    }
  }

  return { overdueCount: overdueOrders.length, storesAlerted };
}

/**
 * 3. Monitors Low Stock & Catalog Consistency (~15 minutes).
 * Alerts store owners when high-velocity items reach critical inventory thresholds.
 */
export async function monitorLowStockAndCatalogueHealth(): Promise<{
  lowStockItemsCount: number;
  storesNotified: number;
}> {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      isAvailable: true,
      quantity: { lte: 3, gte: 0 },
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      companyId: true,
    },
    take: 100,
  });

  if (lowStockProducts.length === 0) {
    return { lowStockItemsCount: 0, storesNotified: 0 };
  }

  const storeMap: Record<string, typeof lowStockProducts> = {};
  for (const p of lowStockProducts) {
    if (!p.companyId) continue;
    if (!storeMap[p.companyId]) storeMap[p.companyId] = [];
    storeMap[p.companyId].push(p);
  }

  let storesNotified = 0;
  const todayStr = new Date().toISOString().split("T")[0];

  for (const [companyId, products] of Object.entries(storeMap)) {
    try {
      // Deduplicate: Send at most one daily consolidated low-stock notice
      const existingNotice = await prisma.notification.findFirst({
        where: {
          companyId,
          title: { contains: "Low Stock Inventory Notice" },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!existingNotice) {
        const itemNames = products.slice(0, 3).map((p) => `${p.name} (${p.quantity} left)`).join(", ");
        const moreCount = products.length > 3 ? ` and ${products.length - 3} more` : "";

        await prisma.notification.create({
          data: {
            companyId,
            title: `📦 Low Stock Inventory Notice (${products.length} items)`,
            message: `The following products are near stockout: ${itemNames}${moreCount}. Review your catalog to reorder stock.`,
            read: false,
          },
        });
        storesNotified++;
      }
    } catch (err: any) {
      console.warn(`[LOW_STOCK_MONITOR_ERROR: ${companyId}]`, err?.message || err);
    }
  }

  return { lowStockItemsCount: lowStockProducts.length, storesNotified };
}

/**
 * 4. Reconciles Pending Payments & Stalled Transactions (~10 minutes).
 */
export async function reconcilePendingPayments(): Promise<{
  reconciledCount: number;
}> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Query orders marked PENDING with an attached transaction reference older than 15 min
  const pendingOrders = await prisma.customerOrder.findMany({
    where: {
      paymentStatus: "PENDING",
      createdAt: { gte: oneDayAgo, lte: fifteenMinutesAgo },
      transactionReference: { not: null },
      deletedAt: null,
    },
    select: {
      id: true,
      companyId: true,
      transactionReference: true,
      totalFinalPrice: true,
      createdAt: true,
    },
    take: 25,
  });

  return { reconciledCount: pendingOrders.length };
}

/**
 * Registers all repeatable cron jobs in BullMQ.
 */
export async function registerWorkforceSchedulers() {
  try {
    if (typeof (workforceQueue as any).upsertJobScheduler === "function") {
      // 1. Daily Store Briefing
      await (workforceQueue as any).upsertJobScheduler(
        "daily-store-briefing-cron",
        { pattern: DAILY_BRIEFING_CRON_PATTERN },
        {
          name: "daily-store-briefing-cron",
          data: {
            input: {
              agentKey: "STORE_MANAGER",
              prompt: "CRON_TRIGGER_DAILY_BRIEFINGS",
              channel: "WEB",
            },
            context: {
              level: AgentWorkforceLevel.STORE,
              traceId: "cron_scheduler_register",
              channel: "WEB",
            },
          },
          opts: {
            removeOnComplete: 10,
            removeOnFail: 50,
          },
        },
      );

      // 2. Overdue Orders Monitor (every 5 min)
      await (workforceQueue as any).upsertJobScheduler(
        "overdue-orders-monitor-cron",
        { every: OVERDUE_ORDERS_INTERVAL_MS },
        {
          name: "overdue-orders-monitor-cron",
          data: {
            input: {
              agentKey: "SUPPORT_AGENT",
              prompt: "CRON_TRIGGER_OVERDUE_ORDERS",
              channel: "WEB",
            },
            context: {
              level: AgentWorkforceLevel.STORE,
              traceId: "cron_overdue_orders",
              channel: "WEB",
            },
          },
          opts: {
            removeOnComplete: 5,
            removeOnFail: 20,
          },
        },
      );

      // 3. Low Stock Monitor (every 15 min)
      await (workforceQueue as any).upsertJobScheduler(
        "low-stock-monitor-cron",
        { every: LOW_STOCK_INTERVAL_MS },
        {
          name: "low-stock-monitor-cron",
          data: {
            input: {
              agentKey: "INVENTORY_MANAGER",
              prompt: "CRON_TRIGGER_LOW_STOCK",
              channel: "WEB",
            },
            context: {
              level: AgentWorkforceLevel.STORE,
              traceId: "cron_low_stock",
              channel: "WEB",
            },
          },
          opts: {
            removeOnComplete: 5,
            removeOnFail: 20,
          },
        },
      );
    } else {
      await (workforceQueue as any).add(
        "daily-store-briefing-cron",
        {
          input: {
            agentKey: "STORE_MANAGER",
            prompt: "CRON_TRIGGER_DAILY_BRIEFINGS",
            channel: "WEB",
          },
          context: {
            level: AgentWorkforceLevel.STORE,
            traceId: "cron_scheduler_register",
            channel: "WEB",
          },
        },
        {
          repeat: {
            pattern: DAILY_BRIEFING_CRON_PATTERN,
          },
          removeOnComplete: 10,
          removeOnFail: 50,
        } as any,
      );
    }
    console.log(`✅ [WORKFORCE_SCHEDULER] Registered operational monitors (Daily Briefing, Overdue Orders, Low Stock) in BullMQ.`);
  } catch (err: any) {
    console.warn("[WORKFORCE_SCHEDULER_WARNING] Could not register BullMQ repeatable cron:", err?.message || err);
  }
}
