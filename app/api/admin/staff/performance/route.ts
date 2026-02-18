import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  try {
    
    const cacheKey = `admin:performance:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const reviews = await prisma.staffPerformanceReview.findMany({
      where: { companyId },
      include: {
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { overallScore: 'desc' }
    });

  try {
    if (reviews) {
      await cacheSet(cacheKey, reviews, 60);
    }
  } catch (e) {}

    return NextResponse.json({ data: reviews });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staffId, companyId, studentFeedback, peerScore, score, growth } = body;

    const review = await prisma.staffPerformanceReview.create({
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

    
    try { await cacheDel(`admin:performance:${companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return NextResponse.json({ error: "Appraisal submission failed" }, { status: 500 });
  }
}