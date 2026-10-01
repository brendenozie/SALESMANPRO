/**
 * app/api/notifications/preferences/route.ts
 *
 * User and Store Notification Preferences Management API.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthenticatedUser } from "@/lib/notifications/authHelper";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
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
        { success: false, message: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const pref = await (prisma as any).notificationPreference.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(
      {
        success: true,
        data: pref || {
          userId: user.id,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          quietHoursStart: null,
          quietHoursEnd: null,
          mutedEventTypes: [],
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[API_GET_PREFERENCES_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch preferences" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const { emailEnabled, pushEnabled, inAppEnabled, quietHoursStart, quietHoursEnd, mutedEventTypes } = body;

    const updated = await (prisma as any).notificationPreference.upsert({
      where: { userId: user.id },
      update: {
        emailEnabled: typeof emailEnabled === "boolean" ? emailEnabled : undefined,
        pushEnabled: typeof pushEnabled === "boolean" ? pushEnabled : undefined,
        inAppEnabled: typeof inAppEnabled === "boolean" ? inAppEnabled : undefined,
        quietHoursStart: quietHoursStart !== undefined ? quietHoursStart : undefined,
        quietHoursEnd: quietHoursEnd !== undefined ? quietHoursEnd : undefined,
        mutedEventTypes: Array.isArray(mutedEventTypes) ? mutedEventTypes : undefined,
      },
      create: {
        userId: user.id,
        emailEnabled: typeof emailEnabled === "boolean" ? emailEnabled : true,
        pushEnabled: typeof pushEnabled === "boolean" ? pushEnabled : true,
        inAppEnabled: typeof inAppEnabled === "boolean" ? inAppEnabled : true,
        quietHoursStart: quietHoursStart || null,
        quietHoursEnd: quietHoursEnd || null,
        mutedEventTypes: Array.isArray(mutedEventTypes) ? mutedEventTypes : [],
      },
    });

    return NextResponse.json(
      { success: true, message: "Preferences updated", data: updated },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[API_UPDATE_PREFERENCES_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update preferences" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
