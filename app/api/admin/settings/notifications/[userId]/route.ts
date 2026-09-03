import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/settings/notifications/[userId]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET user notification settings
async function getUserSettings(req: Request, { params }: { params: { userId: string } }) {
  

  const { userId } = params;
  if (!userId) return formatResponse(false, null, "User ID is required", 400);

  
    const cacheKey = buildTenantCacheKey(userId, "notifications", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    
  const userSettings = await prisma.settings.findUnique({
      where: { userId },
    });

  try {
    if (userSettings) {
      await cacheSet(cacheKey, userSettings, 60);
    }
  } catch (e) {}

    return formatResponse(true, userSettings, "User settings fetched successfully", 200);
  } catch (error: any) {
    console.error("Failed to fetch user settings:", error);
    return formatResponse(false, null, "Failed to fetch user settings", 500);
  }
}

// PUT update or create user notification settings
async function updateUserSettings(req: Request, { params }: { params: { userId: string } }) {
  

  const { userId } = params;
  if (!userId) return formatResponse(false, null, "User ID is required", 400);

  try {
    const body = await req.json();
    const { newClientNotify, invoicePaidNotify } = body;

    const updatedSettings = await prisma.settings.upsert({
      where: { userId },
      update: { newClientNotify, invoicePaidNotify },
      create: { userId, newClientNotify, invoicePaidNotify },
    });

    
    try {
      await cacheDel(`tenant:${userId}:notifications:*`);
      await cacheDel(`admin:notifications:*`);
    } catch (e) {}
    return formatResponse(true, updatedSettings, "User settings updated successfully", 200);
  } catch (error: any) {
    console.error("Failed to update user settings:", error);
    return formatResponse(false, null, "Failed to update user settings", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getUserSettings);
export const PUT = withApiHandler(updateUserSettings);
