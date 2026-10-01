/**
 * lib/ai/mascot/taskNotificationService.ts
 *
 * Dispatches centralized, tenant-scoped notifications for Mascot Background AI Tasks.
 * Notifies authorized store owners/admins on approvals, task completions, failures, and escalations.
 */

import prisma from "@/server/db/prismadb";
import { MascotTaskRecord, MascotTaskState } from "./taskTypes";

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

    const taskTitle = task.title || task.taskType.replace(/_/g, " ");
    const dashboardLink = details?.actionUrl || (task.storeSlug ? `/admin/${task.storeSlug}/ai-tasks?taskId=${task.id}` : "#");

    switch (eventType) {
      case "TASK_ACCEPTED":
        title = `🤖 AI Task Queued: ${taskTitle}`;
        message = `The AI Mascot has queued background task #${task.id.slice(-6)}. Execution is proceeding automatically.`;
        break;

      case "APPROVAL_REQUESTED":
        title = `🚨 Action Required: Approval Needed for ${taskTitle}`;
        message = `High-risk action requires human authorization before execution. Affected items: ${details?.affectedCount ?? "Multiple"}. Click to review & approve.`;
        break;

      case "TASK_PAUSED":
        title = `⏸️ AI Task Paused: ${taskTitle}`;
        message = details?.reason
          ? `Task paused: ${details.reason}. User intervention may be required.`
          : `Task #${task.id.slice(-6)} has been paused.`;
        break;

      case "TASK_COMPLETED":
        title = `✅ AI Task Completed: ${taskTitle}`;
        message = `Background task finished successfully. All operations have been verified against store data.`;
        break;

      case "TASK_PARTIALLY_COMPLETED":
        title = `⚠️ AI Task Partially Completed: ${taskTitle}`;
        message = `Task finished with warnings. Some non-critical subtasks were skipped: ${details?.reason || "Check task center for details"}.`;
        break;

      case "TASK_FAILED":
        title = `❌ AI Task Failed: ${taskTitle}`;
        message = `Operation could not complete: ${details?.reason || "Unexpected execution error"}. Reserved credits have been refunded.`;
        break;

      case "TASK_CANCELLED":
        title = `🛑 AI Task Cancelled: ${taskTitle}`;
        message = `Task #${task.id.slice(-6)} was cancelled by user. Pending operations halted and credits refunded.`;
        break;

      case "INTERVENTION_NEEDED":
        title = `⚠️ User Intervention Needed: ${taskTitle}`;
        message = details?.reason || `The AI task requires manual review or additional configuration to proceed.`;
        break;
    }

    try {
      await prisma.notification.create({
        data: {
          title,
          message: `${message}\n\n[View Task Details](${dashboardLink})`,
          companyId: task.companyId,
          read: false,
        },
      });
    } catch (err: any) {
      console.error(`[MascotTaskNotification] Failed to create notification for task ${task.id}:`, err?.message || err);
    }
  }
}
