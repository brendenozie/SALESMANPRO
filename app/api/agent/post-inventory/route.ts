ts
// app/api/post/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function POST(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  const body = await req.json();
  const { wiDate, wiAmount, userId } = body;

  if (!wiAmount || !wiDate || !userId) {
    return NextResponse.json(
      { message: "Please provide wiDate, wiAmount, and userId" },
      { status: 400 }
    );
  }

  if (typeof wiDate !== "string") {
    return NextResponse.json(
      { message: "wiDate must be a string" },
      { status: 400 }
    );
  }

  const tarehe = new Date(wiDate);
  const wi_amount = parseFloat(wiAmount);

  if (isNaN(tarehe.getTime())) {
    return NextResponse.json(
      { message: "Invalid date format provided" },
      { status: 400 }
    );
  }

  if (isNaN(wi_amount)) {
    return NextResponse.json(
      { message: "wiAmount must be a valid number" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.waterIntakeProgress.create({
      data: {
        date: tarehe,
        dailyIntake: wi_amount,
        userId,
      },
    });

    return formatResponse(true, result, "Water intake record created successfully", 201);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}

export const POSTHandler = withApiHandler(POST);
export { POSTHandler as POST };

