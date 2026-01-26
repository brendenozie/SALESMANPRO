import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, relation, studentId, idType, companyId } = await req.json();

    const visitor = await prisma.hostelVisitor.create({
      data: {
        name,
        relation,
        studentId,
        idType,
        companyId,
        status: "ACTIVE",
        checkIn: new Date(),
      },
      include: {
        student: { select: { name: true } }
      }
    });

    return NextResponse.json({ data: visitor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}