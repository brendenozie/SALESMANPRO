import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  try {
    const staffMembers = await prisma.user.findMany({
      where: {
        companyId: companyId,
        staffProfile: { isNot: null }, // Only get users with a staff profile
      },
      include: {
        staffProfile: true, // Get jobTitle, department, etc.
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: staffMembers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}