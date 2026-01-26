import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const { staffId, salary } = await request.json();

    if (!staffId || salary === undefined) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const updatedProfile = await prisma.staffProfile.update({
      where: { id: staffId },
      data: { salary: parseFloat(salary) },
    });

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update salary" }, { status: 500 });
  }
}