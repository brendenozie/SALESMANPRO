import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/sales-agents/[agentId]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { companyId } = await req.json();

  try {
    // Transaction: Reset all, then set one.
    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { companyId, isActive: true },
        data: { isActive: false },
      }),
      prisma.academicYear.update({
        where: { id: params.id },
        data: { isActive: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}