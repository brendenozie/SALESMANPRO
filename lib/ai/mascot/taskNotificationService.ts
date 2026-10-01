/**
 * lib/ai/mascot/taskNotificationService.ts
 *
 * Dispatches centralized, tenant-scoped, role-aware notifications for Mascot Background AI Tasks.
 * Notifies initiating users and authorized store owners/admins on approvals, completions, and errors.
 */

import { MascotTaskRecord } from "./taskTypes";
import { NotificationService } from "@/lib/notifications/notificationService";
import { NotificationEventType, NotificationSeverity, NotificationChannel } from "@/lib/notifications/types";

export class MascotTaskNotificationService {
  /**
   * Dispatches a notification for a task lifecycle event.
   */
  public static async notifyTaskEvent(
    task: MascotTaskRecord,
    eventType:
      | "TASK_ACCEPTED"
      | "APPROVAL_REQUESTED"
      | "TASK_PAUSED"
      | "TASK_COMPLETED"
      | "TASK_PARTIALLY_COMPLETED"
      | "TASK_FAILED"
      | "TASK_CANCELLED"
      | "INTERVENTION_NEEDED",
    details?: { reason?: string; actionUrl?: string; affectedCount?: number }
  ) {
    if (!task.companyId) return;

    let title = "";
    let message = "";
    let mappedEventType: NotificationEventType = "MASCOT_TASK_QUEUED";
    let severity: NotificationSeverity = "INFO";
    let channels: NotificationChannel[] = ["IN_APP", "PUSH_ANDROID", "PUSH_DESKTOP"];

    const taskTitle = task.title || task.taskType.replace(/_/g, " ");
    const dashboardLink =
      details?.actionUrl ||
      (task.storeSlug ? `/admin/${task.storeSlug}/ai-tasks?taskId=${task.id}` : `/admin/ai-tasks?taskId=${task.id}`);

    switch (eventType) {
      case "TASK_ACCEPTED":
        title = `🤖 AI Task Queued: ${taskTitle}`;
        message = `The AI Mascot has queued background task #${task.id.slice(-6)}. Execution is proceeding automatically.`;
        mappedEventType = "MASCOT_TASK_QUEUED";
        severity = "INFO";
        break;

      case "APPROVAL_REQUESTED":
        title = `🚨 Action Required: Approval Needed for ${taskTitle}`;
        message = `High-risk action requires human authorization before execution. Affected items: ${details?.affectedCount ?? "Multiple"}. Click to review & approve.`;
        mappedEventType = "MASCOT_APPROVAL_REQUESTED";
        severity = "CRITICAL";
        channels = ["IN_APP", "EMAIL", "PUSH_ANDROID", "PUSH_DESKTOP"];
        break;

      case "TASK_PAUSED":
        title = `⏸️ AI Task Paused: ${taskTitle}`;
        message = details?.reason
          ? `Task paused: ${details.reason}. User intervention may be required.`
          : `Task #${task.id.slice(-6)} has been paused.`;
        mappedEventType = "MASCOT_TASK_PAUSED";
        severity = "WARNING";
        break;

      case "TASK_COMPLETED":
        title = `✅ AI Task Completed: ${taskTitle}`;
        message = `Background task finished successfully. All operations have been verified against store data.`;
        mappedEventType = "MASCOT_TASK_COMPLETED";
        severity = "INFO";
        break;

      case "TASK_PARTIALLY_COMPLETED":
        title = `⚠️ AI Task Partially Completed: ${taskTitle}`;
        message = `Task finished with warnings. Some non-critical subtasks were skipped: ${details?.reason || "Check task center for details"}.`;
        mappedEventType = "MASCOT_TASK_PARTIALLY_COMPLETED";
        severity = "WARNING";
        break;

      case "TASK_FAILED":
        title = `❌ AI Task Failed: ${taskTitle}`;
        message = `Operation could not complete: ${details?.reason || "Unexpected execution error"}. Reserved credits have been refunded.`;
        mappedEventType = "MASCOT_TASK_FAILED";
        severity = "WARNING";
        channels = ["IN_APP", "EMAIL"];
        break;

      case "TASK_CANCELLED":
        title = `🛑 AI Task Cancelled: ${taskTitle}`;
        message = `Task #${task.id.slice(-6)} was cancelled by user. Pending operations halted and credits refunded.`;
        mappedEventType = "MASCOT_TASK_CANCELLED";
        severity = "INFO";
        break;

      case "INTERVENTION_NEEDED":
        title = `⚠️ User Intervention Needed: ${taskTitle}`;
        message = details?.reason || `The AI task requires manual review or additional configuration to proceed.`;
        mappedEventType = "MASCOT_INTERVENTION_NEEDED";
        severity = "WARNING";
        break;
    }

    try {
      // Direct notification to task owner + store admins
      const targetUserIds: string[] = [];
      if (task.userId && /^[0-9a-fA-F]{24}$/.test(task.userId)) {
        targetUserIds.push(task.userId);
      }

      await NotificationService.publishEvent({
        title,
        message,
        eventType: mappedEventType,
        severity,
        companyId: task.companyId,
        storeId: task.storeId || undefined,
        actionUrl: dashboardLink,
        resourceType: "mascot_task",
        resourceId: task.id,
        recipientPolicy:
          targetUserIds.length > 0 && severity !== "CRITICAL"
            ? {
                type: "SPECIFIC_USERS",
                userIds: targetUserIds,
              }
            : {
                type: "STORE_ADMINS",
                userIds: targetUserIds,
              },
        channels,
        idempotencyKey: `mascot_${task.id}_${eventType}`,
        metadata: {
          taskId: task.id,
          taskType: task.taskType,
          affectedCount: details?.affectedCount,
        },
      });
    } catch (err: any) {
      console.error(`[MascotTaskNotification] Failed to publish notification for task ${task.id}:`, err?.message || err);
    }
  }
}
