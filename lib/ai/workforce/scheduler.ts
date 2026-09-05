/**
 * lib/ai/workforce/scheduler.ts
 *
 * Scheduled Cron Triggers for the SalesmanPro AI Workforce.
 * Runs daily at 07:00 EAT (04:00 UTC) to generate proactive, authoritative
 * business briefings for all active stores via the AI Store Manager.
 */

import prisma from "@/server/db/prismadb";
import { workforceQueue } from "./queue";
import { WorkforceOrchestrator } from "./orchestrator";
import { WorkforceMemoryManager } from "./memoryManager";
import { AgentWorkforceLevel, AgentMemoryScope } from "./types";

const orchestrator = new WorkforceOrchestrator();

export const DAILY_BRIEFING_CRON_PATTERN = "0 4 * * *"; // 04:00 UTC = 07:00 EAT (UTC+3)

/**
 * Executes the Store Manager Daily Briefing generation for all active stores.
 */
export async function triggerDailyStoreBriefings(): Promise<{
  totalStores: number;
  briefingsGenerated: number;
  skipped: number;
  errors: Array<{ companyId: string; error: string }>;
}> {
  const todayStr = new Date().toISOString().split("T")[0];
  console.log(`[WORKFORCE_CRON] Starting Daily Store Briefings for date: ${todayStr} (07:00 EAT)`);

  const activeCompanies = await prisma.company.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, currency: true },
  });

  let generatedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ companyId: string; error: string }> = [];

  for (const company of activeCompanies) {
    try {
      // 1. Check if briefing already exists for today
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

      // 2. Execute STORE_MANAGER agent
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

      // 3. Persist into business memory
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

      // 4. Create in-app Notification for store staff
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

  console.log(
    `[WORKFORCE_CRON_COMPLETE] Briefings generated: ${generatedCount}, skipped: ${skippedCount}, errors: ${errors.length}`,
  );

  return {
    totalStores: activeCompanies.length,
    briefingsGenerated: generatedCount,
    skipped: skippedCount,
    errors,
  };
}

/**
 * Registers repeatable cron jobs in BullMQ.
 */
export async function registerWorkforceSchedulers() {
  try {
    if (typeof (workforceQueue as any).upsertJobScheduler === "function") {
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
    console.log(`✅ [WORKFORCE_SCHEDULER] Registered Daily Briefing Cron (${DAILY_BRIEFING_CRON_PATTERN} = 07:00 EAT) in BullMQ.`);
  } catch (err) {
    console.warn("[WORKFORCE_SCHEDULER_WARNING] Could not register BullMQ repeatable cron:", err);
  }
}
