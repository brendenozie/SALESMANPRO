/**
 * app/api/notifications/route.ts
 *
 * Authenticated API endpoint for listing notifications and publishing authorized store/platform events.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/notifications/authHelper";
import { NotificationService } from "@/lib/notifications/notificationService";
import { NotificationEventContract, NotificationSeverity } from "@/lib/notifications/types";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please sign in." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const severity = (searchParams.get("severity") as NotificationSeverity) || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const companyId = searchParams.get("companyId") || undefined;
    const storeId = searchParams.get("storeId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await NotificationService.getUserNotifications({
      userId: user.id,
      companyId,
      storeId,
      unreadOnly,
      severity,
      eventType,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.items,
        total: result.total,
        unreadCount: result.unreadCount,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[API_GET_NOTIFICATIONS_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch notifications" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const { title, message, eventType, severity, companyId, storeId, recipientPolicy, actionUrl } = body;

    // Authorization: SuperAdmin or Company Admin
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const isCompanyAdmin =
      user.role === "ADMIN" && (user.companyId === companyId || !companyId);

    if (!isSuperAdmin && !isCompanyAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Administrative privileges required." },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const contract: NotificationEventContract = {
      title,
      message,
      eventType: eventType || "STORE_ANNOUNCEMENT",
      severity: severity || "INFO",
      companyId: isSuperAdmin ? companyId : user.companyId || companyId,
      storeId,
      actionUrl,
      actorId: user.id,
      actorRole: user.role,
      recipientPolicy: recipientPolicy || {
        type: isSuperAdmin && !companyId ? "SUPER_ADMINS" : "STORE_STAFF",
      },
    };

    const publishResult = await NotificationService.publishEvent(contract);

    return NextResponse.json(
      {
        success: publishResult.success,
        notificationId: publishResult.notificationId,
        recipientCount: publishResult.recipientCount,
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[API_POST_NOTIFICATION_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create notification" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
