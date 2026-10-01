/**
 * app/api/notifications/unread-count/route.ts
 *
 * Ultra-lightweight endpoint for client navbar unread badges.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/notifications/authHelper";
import { NotificationService } from "@/lib/notifications/notificationService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
        { success: true, count: 0 },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || undefined;

    const count = await NotificationService.getUnreadCount(user.id, companyId);

    return NextResponse.json(
      { success: true, count },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[API_GET_UNREAD_COUNT_ERROR]", error);
    return NextResponse.json(
      { success: true, count: 0 },
      { headers: CORS_HEADERS }
    );
  }
}
