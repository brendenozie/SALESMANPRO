import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const visitors = await prisma.hostelVisitor.findMany({
      where: { companyId },
      include: { student: { select: { name: true } } },
      orderBy: { checkIn: 'desc' }
    });

    return NextResponse.json({ data: visitors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    const visitor = await prisma.hostelVisitor.update({
      where: { id },
      data: { checkOut: new Date(), status: "CHECKED_OUT" }
    });
    return NextResponse.json({ data: visitor });
  } catch (error) {
    return NextResponse.json({ error: "Check-out failed" }, { status: 500 });
  }
}