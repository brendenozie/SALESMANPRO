/**
 * app/api/notifications/[id]/acknowledge/route.ts
 *
 * Acknowledges an action-required notification.
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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing notification ID" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const success = await NotificationService.acknowledgeNotification(id, user.id);

    return NextResponse.json({ success }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error("[API_ACKNOWLEDGE_NOTIFICATION_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to acknowledge notification" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
