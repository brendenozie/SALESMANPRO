// // app/api/sales-agents/[agentId]/route.ts
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { termId: string } }
) {
  try {
    const { companyId, academicYearId } = await req.json();

    const [deactivated, activated] = await prisma.$transaction([
      // 1. Deactivate all terms for this specific year and company
      prisma.term.updateMany({
        where: {
          academicYearId: academicYearId,
          companyId: companyId,
          isActive: true,
        },
        data: { isActive: false },
      }),
      // 2. Activate the target term
      prisma.term.update({
        where: { id: params.termId },
        data: { isActive: true },
      }),
    ]);

    return NextResponse.json({ success: true, data: activated });
  } catch (error) {
    console.error("TERM_ACTIVATE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}