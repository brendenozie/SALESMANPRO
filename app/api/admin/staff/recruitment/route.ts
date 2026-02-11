import { NextResponse } from "next/server";

import prisma from "@/server/db/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const stage = searchParams.get("stage");

  try {
    const candidates = await prisma.candidate.findMany({
      where: { 
        companyId,
        ...(stage !== "All" && { stage })
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate dynamic stats
    const stats = {
      activeVacancies: await prisma.vacancy.count({ where: { companyId, status: 'OPEN' } }),
      totalApplicants: await prisma.candidate.count({ where: { companyId } }),
      interviewsToday: await prisma.interview.count({ 
        where: { date: new Date(), candidate: { companyId } } 
      }),
    };

    return NextResponse.json({ data: candidates, stats });
  } catch (error) {
    return NextResponse.json({ error: "Pipeline fetch failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { candidateId, nextStage } = await request.json();
  try {
    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: { stage: nextStage }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Stage transition failed" }, { status: 500 });
  }
}