// typescript
// app/api/users/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getUsers(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  try {
    const skip = page > 0 ? page * limit : 0;

    const [count, users] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
      }),
    ]);

    return formatResponse(true, {
      info: {
        count,
        next: skip + limit < count ? page + 1 : null,
        prev: page > 0 ? page - 1 : null,
        pages: Math.ceil(count / limit),
      },
      results: users,
    }, "Users fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(getUsers);

