import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { Prisma } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            User: true, // Total members/users
            Product: true,
            subscriptionCompanies: true,
          },
        },
        subscriptionCompanies: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { status: true, renewalDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: companies });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
