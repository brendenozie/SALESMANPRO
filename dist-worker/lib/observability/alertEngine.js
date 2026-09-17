"use strict";
/**
 * lib/observability/alertEngine.ts
 *
 * Rules-Based Alerting Engine with Cooldown, Deduplication, and Recovery Tracking.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateAlertRules = exports.ensureDefaultAlertRules = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const DEFAULT_ALERT_RULES = [
    {
        name: "High CPU Utilization",
        description: "Server CPU utilization exceeded 85%",
        metric: "cpu_percent",
        condition: "gte",
        threshold: 85,
        durationSeconds: 60,
        severity: "CRITICAL",
        cooldownMinutes: 15,
    },
    {
        name: "High Memory Utilization",
        description: "Server RAM utilization exceeded 90%",
        metric: "memory_percent",
        condition: "gte",
        threshold: 90,
        durationSeconds: 60,
        severity: "CRITICAL",
        cooldownMinutes: 15,
    },
    {
        name: "Disk Volume Running Low",
        description: "Disk storage usage exceeded 88%",
        metric: "disk_percent",
        condition: "gte",
        threshold: 88,
        durationSeconds: 120,
        severity: "WARNING",
        cooldownMinutes: 60,
    },
    {
        name: "High Application Error Rate",
        description: "Error rate exceeded 5% over the rolling window",
        metric: "error_rate",
        condition: "gte",
        threshold: 5,
        durationSeconds: 60,
        severity: "CRITICAL",
        cooldownMinutes: 10,
    },
    {
        name: "Elevated P95 Latency",
        description: "P95 request response time exceeded 2000ms",
        metric: "p95_latency",
        condition: "gte",
        threshold: 2000,
        durationSeconds: 60,
        severity: "WARNING",
        cooldownMinutes: 15,
    },
    {
        name: "MongoDB Unavailable",
        description: "Database ping failed or latency exceeded 1000ms",
        metric: "db_latency",
        condition: "gte",
        threshold: 1000,
        durationSeconds: 30,
        severity: "CRITICAL",
        cooldownMinutes: 5,
    },
    {
        name: "Background Queue Backlog",
        description: "Total waiting jobs in queues exceeded 150",
        metric: "queue_backlog",
        condition: "gte",
        threshold: 150,
        durationSeconds: 120,
        severity: "WARNING",
        cooldownMinutes: 30,
    },
];
/**
 * Seeds default alert definitions if table is empty
 */
async function ensureDefaultAlertRules() {
    try {
        const count = await prismadb_1.default.monitoringAlert.count();
        if (count === 0) {
            for (const rule of DEFAULT_ALERT_RULES) {
                await prismadb_1.default.monitoringAlert.create({
                    data: {
                        name: rule.name,
                        description: rule.description,
                        metric: rule.metric,
                        condition: rule.condition,
                        threshold: rule.threshold,
                        durationSeconds: rule.durationSeconds,
                        severity: rule.severity,
                        cooldownMinutes: rule.cooldownMinutes,
                        enabled: true,
                        state: "OK",
                    },
                });
            }
        }
    }
    catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[Observability] Ensure alert rules error:", err.message);
        }
    }
}
exports.ensureDefaultAlertRules = ensureDefaultAlertRules;
/**
 * Evaluates all active alerts against the current snapshot
 */
async function evaluateAlertRules(snapshot) {
    await ensureDefaultAlertRules();
    const rules = await prismadb_1.default.monitoringAlert.findMany();
    const now = new Date();
    const updatedSummaries = [];
    for (const rule of rules) {
        if (!rule.enabled) {
            updatedSummaries.push(formatAlertSummary(rule));
            continue;
        }
        const metricValue = snapshot[rule.metric] ?? 0;
        let isBreached = false;
        switch (rule.condition) {
            case "gt":
                isBreached = metricValue > rule.threshold;
                break;
            case "gte":
                isBreached = metricValue >= rule.threshold;
                break;
            case "lt":
                isBreached = metricValue < rule.threshold;
                break;
            case "lte":
                isBreached = metricValue <= rule.threshold;
                break;
            case "eq":
                isBreached = metricValue === rule.threshold;
                break;
        }
        if (isBreached) {
            if (rule.state !== "TRIGGERED") {
                await prismadb_1.default.monitoringAlert.update({
                    where: { id: rule.id },
                    data: {
                        state: "TRIGGERED",
                        lastTriggeredAt: now,
                        lastValue: metricValue,
                    },
                });
                rule.state = "TRIGGERED";
                rule.lastTriggeredAt = now;
                rule.lastValue = metricValue;
            }
        }
        else {
            // Metric has returned to normal range
            if (rule.state === "TRIGGERED" || rule.state === "ACKNOWLEDGED") {
                await prismadb_1.default.monitoringAlert.update({
                    where: { id: rule.id },
                    data: {
                        state: "RESOLVED",
                        lastResolvedAt: now,
                        lastValue: metricValue,
                    },
                });
                rule.state = "RESOLVED";
                rule.lastResolvedAt = now;
                rule.lastValue = metricValue;
            }
        }
        updatedSummaries.push(formatAlertSummary(rule));
    }
    return updatedSummaries;
}
exports.evaluateAlertRules = evaluateAlertRules;
function formatAlertSummary(rule) {
    return {
        id: rule.id,
        name: rule.name,
        description: rule.description || undefined,
        metric: rule.metric,
        condition: rule.condition,
        threshold: rule.threshold,
        durationSeconds: rule.durationSeconds,
        severity: rule.severity,
        enabled: rule.enabled,
        cooldownMinutes: rule.cooldownMinutes,
        state: rule.state,
        lastTriggeredAt: rule.lastTriggeredAt ? rule.lastTriggeredAt.toISOString() : undefined,
        lastResolvedAt: rule.lastResolvedAt ? rule.lastResolvedAt.toISOString() : undefined,
        lastValue: rule.lastValue ?? undefined,
    };
}
