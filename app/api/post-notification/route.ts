// app/api/notifications/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function postHandler(request: Request) {
  try {
    
    const body = await request.json();
    const { title, message } = body;

    if (!title || !message) {
      return formatResponse(false, null, "Title and message are required", 400);
    }

    const newNotification = await prisma.notification.create({
      data: { title, message },
    });

    return formatResponse(true, newNotification, "Notification created", 201);
  } catch (err: any) {
    console.error("POST /api/notifications error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

export const POST = withApiHandler(postHandler);
