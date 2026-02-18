import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const visitor = await prisma.hostelVisitor.create({
      data: {
        name: body.name,
        relation: body.relation,
        studentId: body.studentId,
        educatorId: body.educatorId,
        idType: body.idType,
        companyId: body.companyId,
        status: "ACTIVE",
        checkIn: new Date(),
      },
      include: { student: { select: { firstName: true } }, educator: { include: { user: { select: { name: true } } } } }
    });
    
    try { await cacheDel(`admin:checkin:${companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ data: visitor }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}