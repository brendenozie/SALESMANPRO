import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  try {
    const reviews = await prisma.performanceReview.findMany({
      where: { companyId },
      include: {
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { overallScore: 'desc' }
    });

    return NextResponse.json({ data: reviews });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staffId, companyId, studentFeedback, peerScore, score, growth } = body;

    const review = await prisma.performanceReview.create({
      data: {
        staffId,
        companyId,
        studentFeedback,
        peerScore,
        overallScore: score,
        annualGrowth: growth,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return NextResponse.json({ error: "Appraisal submission failed" }, { status: 500 });
  }
}