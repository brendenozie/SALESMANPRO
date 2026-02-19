import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

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
    
    try { await cacheDel(`admin:checkin:${body.companyId || 'global'}:*`); } catch (e) {}
    
    return formatResponse(true, visitor, "Visitor checked in successfully", 201);
  } catch (err) {
    return formatResponse(false, null, "Check-in failed", 500);
  }
}