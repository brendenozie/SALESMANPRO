"use strict";
/**
 * lib/ai/workforce/scheduler.ts
 *
 * Scheduled Cron Triggers for the SalesmanPro AI Workforce.
 * Runs daily at 07:00 EAT (04:00 UTC) to generate proactive, authoritative
 * business briefings for all active stores via the AI Store Manager.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWorkforceSchedulers = exports.triggerDailyStoreBriefings = exports.DAILY_BRIEFING_CRON_PATTERN = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const queue_1 = require("./queue");
const orchestrator_1 = require("./orchestrator");
const memoryManager_1 = require("./memoryManager");
const types_1 = require("./types");
const orchestrator = new orchestrator_1.WorkforceOrchestrator();
exports.DAILY_BRIEFING_CRON_PATTERN = "0 4 * * *"; // 04:00 UTC = 07:00 EAT (UTC+3)
/**
 * Executes the Store Manager Daily Briefing generation for all active stores.
 */
async function triggerDailyStoreBriefings() {
    const todayStr = new Date().toISOString().split("T")[0];
    console.log(`[WORKFORCE_CRON] Starting Daily Store Briefings for date: ${todayStr} (07:00 EAT)`);
    const activeCompanies = await prismadb_1.default.company.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, currency: true },
    });
    let generatedCount = 0;
    let skippedCount = 0;
    const errors = [];
    for (const company of activeCompanies) {
        try {
            // 1. Check if briefing already exists for today
            const existingBriefing = await prismadb_1.default.aIAgentMemory.findFirst({
                where: {
                    companyId: company.id,
                    scope: types_1.AgentMemoryScope.BUSINESS,
                    key: `DAILY_BRIEFING_${todayStr}`,
                },
            });
            if (existingBriefing) {
                skippedCount++;
                continue;
            }
            // 2. Execute STORE_MANAGER agent
            const result = await orchestrator.execute({
                agentKey: "STORE_MANAGER",
                prompt: "Generate my comprehensive store operational briefing for today. Include stock warnings, sales trends, pending customer inquiries, and 3 high-priority recommendations.",
                channel: "WEB",
            }, {
                companyId: company.id,
                companyName: company.name,
                level: types_1.AgentWorkforceLevel.STORE,
                traceId: `cron_briefing_${company.id}_${todayStr}`,
                channel: "WEB",
            });
            // 3. Persist into business memory
            await memoryManager_1.WorkforceMemoryManager.recordMemory({
                context: {
                    companyId: company.id,
                    companyName: company.name,
                    level: types_1.AgentWorkforceLevel.STORE,
                    traceId: `cron_briefing_${company.id}_${todayStr}`,
                    channel: "WEB",
                },
                scope: types_1.AgentMemoryScope.BUSINESS,
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
            await prismadb_1.default.notification.create({
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
        }
        catch (err) {
            console.error(`[WORKFORCE_CRON_STORE_ERROR: ${company.id}]`, err?.message || err);
            errors.push({ companyId: company.id, error: err?.message || "Unknown error" });
        }
    }
    console.log(`[WORKFORCE_CRON_COMPLETE] Briefings generated: ${generatedCount}, skipped: ${skippedCount}, errors: ${errors.length}`);
    return {
        totalStores: activeCompanies.length,
        briefingsGenerated: generatedCount,
        skipped: skippedCount,
        errors,
    };
}
exports.triggerDailyStoreBriefings = triggerDailyStoreBriefings;
/**
 * Registers repeatable cron jobs in BullMQ.
 */
async function registerWorkforceSchedulers() {
    try {
        if (typeof queue_1.workforceQueue.upsertJobScheduler === "function") {
            await queue_1.workforceQueue.upsertJobScheduler("daily-store-briefing-cron", { pattern: exports.DAILY_BRIEFING_CRON_PATTERN }, {
                name: "daily-store-briefing-cron",
                data: {
                    input: {
                        agentKey: "STORE_MANAGER",
                        prompt: "CRON_TRIGGER_DAILY_BRIEFINGS",
                        channel: "WEB",
                    },
                    context: {
                        level: types_1.AgentWorkforceLevel.STORE,
                        traceId: "cron_scheduler_register",
                        channel: "WEB",
                    },
                },
                opts: {
                    removeOnComplete: 10,
                    removeOnFail: 50,
                },
            });
        }
        else {
            await queue_1.workforceQueue.add("daily-store-briefing-cron", {
                input: {
                    agentKey: "STORE_MANAGER",
                    prompt: "CRON_TRIGGER_DAILY_BRIEFINGS",
                    channel: "WEB",
                },
                context: {
                    level: types_1.AgentWorkforceLevel.STORE,
                    traceId: "cron_scheduler_register",
                    channel: "WEB",
                },
            }, {
                repeat: {
                    pattern: exports.DAILY_BRIEFING_CRON_PATTERN,
                },
                removeOnComplete: 10,
                removeOnFail: 50,
            });
        }
        console.log(`✅ [WORKFORCE_SCHEDULER] Registered Daily Briefing Cron (${exports.DAILY_BRIEFING_CRON_PATTERN} = 07:00 EAT) in BullMQ.`);
    }
    catch (err) {
        console.warn("[WORKFORCE_SCHEDULER_WARNING] Could not register BullMQ repeatable cron:", err);
    }
}
exports.registerWorkforceSchedulers = registerWorkforceSchedulers;
