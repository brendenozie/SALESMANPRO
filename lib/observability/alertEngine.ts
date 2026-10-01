/**
 * lib/observability/alertEngine.ts
 *
 * Rules-Based Alerting Engine with Cooldown, Deduplication, and Recovery Tracking.
 */

import prisma from "@/server/db/prismadb";
import { AlertRuleSummary, ServerResourceMetrics, DatabaseHealthSummary, RedisHealthSummary, QueueStatusSummary } from "./types";
import { NotificationService } from "@/lib/notifications/notificationService";

interface DefaultAlertRule {
  name: string;
  description: string;
  metric: string;
  condition: "gt" | "gte" | "lt" | "lte" | "eq";
  threshold: number;
  durationSeconds: number;
  severity: "INFO" | "WARNING" | "CRITICAL";
  cooldownMinutes: number;
}

const DEFAULT_ALERT_RULES: DefaultAlertRule[] = [
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
export async function ensureDefaultAlertRules(): Promise<void> {
  try {
    const count = await prisma.monitoringAlert.count();
    if (count === 0) {
      for (const rule of DEFAULT_ALERT_RULES) {
        await prisma.monitoringAlert.create({
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
  } catch (err: any) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Observability] Ensure alert rules error:", err.message);
    }
  }
}

export interface MetricSnapshotForAlerts {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  error_rate: number;
  p95_latency: number;
  db_latency: number;
  queue_backlog: number;
}

/**
 * Evaluates all active alerts against the current snapshot
 */
export async function evaluateAlertRules(snapshot: MetricSnapshotForAlerts): Promise<AlertRuleSummary[]> {
  await ensureDefaultAlertRules();

  const rules = await prisma.monitoringAlert.findMany();
  const now = new Date();
  const updatedSummaries: AlertRuleSummary[] = [];

  for (const rule of rules) {
    if (!rule.enabled) {
      updatedSummaries.push(formatAlertSummary(rule));
      continue;
    }

    const metricValue = (snapshot as any)[rule.metric] ?? 0;
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
        await prisma.monitoringAlert.update({
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

        // Dispatch platform alert notification
        try {
          const cooldownWindow = Math.floor(now.getTime() / (rule.cooldownMinutes * 60 * 1000));
          await NotificationService.publishEvent({
            title: `🚨 [Platform Alert] ${rule.name}`,
            message: `${rule.description || rule.name}. Current value: ${metricValue} (Threshold: ${rule.threshold}). Immediate inspection advised.`,
            eventType: "OBSERVABILITY_ALERT",
            severity: rule.severity === "CRITICAL" ? "CRITICAL" : "WARNING",
            actionUrl: `/admin/observability/alerts?alertId=${rule.id}`,
            resourceType: "alert",
            resourceId: rule.id,
            recipientPolicy: {
              type: "SUPER_ADMINS",
            },
            channels: ["IN_APP", "EMAIL"],
            idempotencyKey: `alert_${rule.id}_${cooldownWindow}`,
          });
        } catch (notifErr) {
          console.warn("[alertEngine] Failed to dispatch alert notification:", notifErr);
        }
      }
    } else {
      // Metric has returned to normal range
      if (rule.state === "TRIGGERED" || rule.state === "ACKNOWLEDGED") {
        await prisma.monitoringAlert.update({
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

function formatAlertSummary(rule: any): AlertRuleSummary {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description || undefined,
    metric: rule.metric,
    condition: rule.condition as any,
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
