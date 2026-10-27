// app/api/post-notification/route.ts
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { NotificationService } from "@/lib/notifications/notificationService";

async function postHandler(request: Request) {
  try {
    const body = await request.json();
    const { title, message, companyId, storeId, eventType, severity, recipientPolicy, actionUrl } = body;

    if (!title || !message) {
      return formatResponse(false, null, "Title and message are required", 400);
    }

    const result = await NotificationService.publishEvent({
      title,
      message,
      companyId: companyId || undefined,
      storeId: storeId || undefined,
      eventType: eventType || "STORE_ANNOUNCEMENT",
      severity: severity || "INFO",
      actionUrl: actionUrl || undefined,
      recipientPolicy: recipientPolicy || {
        type: companyId ? "STORE_STAFF" : "SUPER_ADMINS",
      },
      channels: ["IN_APP", "PUSH_ANDROID", "PUSH_DESKTOP"],
    });

    if (!result.success) {
      return formatResponse(false, null, result.error || "Failed to create notification", 500);
    }

    return formatResponse(true, { notificationId: result.notificationId, recipientCount: result.recipientCount }, "Notification created and queued", 201);
  } catch (err: any) {
    console.error("POST /api/post-notification error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

export const POST = withApiHandler(postHandler);
