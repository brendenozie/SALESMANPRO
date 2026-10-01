/**
 * app/api/notifications/mark-all-read/route.ts
 *
 * Marks all unread notifications as read for the authenticated recipient.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/notifications/authHelper";
import { NotificationService } from "@/lib/notifications/notificationService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
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

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || undefined;

    const count = await NotificationService.markAllAsRead(user.id, companyId);

    return NextResponse.json(
      { success: true, count },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[API_MARK_ALL_READ_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to mark all as read" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
