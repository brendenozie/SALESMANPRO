// app/api/settings/notifications/[userId]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET user notification settings
async function getUserSettings(req: NextRequest, { params }: { params: { userId: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { userId } = params;
  if (!userId) return formatResponse(false, null, "User ID is required", 400);

  try {
    const userSettings = await prisma.settings.findUnique({
      where: { userId },
    });

    return formatResponse(true, userSettings, "User settings fetched successfully", 200);
  } catch (error: any) {
    console.error("Failed to fetch user settings:", error);
    return formatResponse(false, null, "Failed to fetch user settings", 500);
  }
}

// PUT update or create user notification settings
async function updateUserSettings(req: NextRequest, { params }: { params: { userId: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

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

    return formatResponse(true, updatedSettings, "User settings updated successfully", 200);
  } catch (error: any) {
    console.error("Failed to update user settings:", error);
    return formatResponse(false, null, "Failed to update user settings", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getUserSettings);
export const PUT = withApiHandler(updateUserSettings);
