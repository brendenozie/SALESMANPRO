typescript
// app/api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getTask(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id },
      // orderBy: { dueTime: "asc" }, // Optional ordering
    });

    if (!task) {
      return formatResponse(false, null, "Task not found", 404);
    }

    return formatResponse(true, task, "Task fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(getTask);

