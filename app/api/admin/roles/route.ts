import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  try {
    // Group users by role to get the counts for the left sidebar
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      where: { companyId },
      _count: { _all: true },
    });

    // Fetch one example profile for each role to get the permission structure
    const profiles = await prisma.staffProfile.findMany({
      where: { companyId },
      distinct: ['jobTitle'], // Using jobTitle or role as the grouping factor
      select: {
        jobTitle: true,
        permissions: true,
      }
    });

    return NextResponse.json({ roleCounts, profiles });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}