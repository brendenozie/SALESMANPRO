/**
 * app/api/notifications/devices/route.ts
 *
 * Multi-Platform Device Registration API for Android, Windows Desktop, and Web.
 * Allows client applications to register, refresh, or revoke push tokens.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthenticatedUser } from "@/lib/notifications/authHelper";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-device-id, x-client-platform",
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

    const devices = await (prisma as any).notificationDevice.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        platform: true,
        deviceName: true,
        appVersion: true,
        isActive: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: devices }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error("[API_GET_DEVICES_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch devices" },
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
    const { platform, pushToken, deviceName, appVersion, companyId } = body;

    if (!platform || !pushToken) {
      return NextResponse.json(
        { success: false, message: "platform and pushToken are required." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const normalizedPlatform = platform.toUpperCase();
    if (!["ANDROID", "WINDOWS_DESKTOP", "WEB"].includes(normalizedPlatform)) {
      return NextResponse.json(
        { success: false, message: "Invalid platform. Must be ANDROID, WINDOWS_DESKTOP, or WEB." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const device = await (prisma as any).notificationDevice.upsert({
      where: {
        userId_platform_pushToken: {
          userId: user.id,
          platform: normalizedPlatform,
          pushToken,
        },
      },
      update: {
        deviceName: deviceName || undefined,
        appVersion: appVersion || undefined,
        companyId: companyId || user.companyId || undefined,
        isActive: true,
        lastSeenAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: normalizedPlatform,
        pushToken,
        deviceName: deviceName || undefined,
        appVersion: appVersion || undefined,
        companyId: companyId || user.companyId || undefined,
        isActive: true,
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json(
      { success: true, message: "Device registered successfully", deviceId: device.id },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[API_REGISTER_DEVICE_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register device" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const { deviceId, pushToken } = body;

    if (!deviceId && !pushToken) {
      return NextResponse.json(
        { success: false, message: "deviceId or pushToken required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    await (prisma as any).notificationDevice.updateMany({
      where: {
        userId: user.id,
        ...(deviceId ? { id: deviceId } : {}),
        ...(pushToken ? { pushToken } : {}),
      },
      data: { isActive: false },
    });

    return NextResponse.json(
      { success: true, message: "Device token revoked" },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[API_REVOKE_DEVICE_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to revoke device" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
