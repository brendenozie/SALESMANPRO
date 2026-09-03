import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if(!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "performance", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {

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

    return formatResponse(true, reviews, "Performance data fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch performance data", 500);
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

    
    try {
      await cacheDel(`tenant:${companyId}:performance:*`);
      await cacheDel(`admin:performance:*`);
    } catch (e) {}
    return formatResponse(true, review, "Appraisal submitted successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Appraisal submission failed", 500);
  }
}