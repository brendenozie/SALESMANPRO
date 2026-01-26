import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const vendors = await prisma.hostelVendor.findMany({
      where: { companyId },
      include: {
        _count: { select: { items: true } } // Count items supplied by this vendor
      }
    });
    return NextResponse.json({ data: vendors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}