import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const { companyId, startDate, endDate, label, departmentScope } = await request.json();

    const freeze = await prisma.leaveFreeze.create({
      data: {
        companyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        label, // e.g., "Final Exam Week"
        departmentScope, // "ALL" or specific department
      },
    });

    return NextResponse.json({ success: true, data: freeze });
  } catch (error) {
    return NextResponse.json({ error: "Failed to set freeze period" }, { status: 500 });
  }
}