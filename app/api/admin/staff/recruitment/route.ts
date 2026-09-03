import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";

import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const stage = searchParams.get("stage");

  if(!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }
   
  const cacheKey = buildTenantCacheKey(companyId, "recruitment", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
   
  const candidates = await prisma.candidate.findMany({
      where: { 
        companyId,
        ...(stage !== "All" && { stage })
      },
      orderBy: { createdAt: 'desc' }
    });

  try {
    if (candidates) {
      await cacheSet(cacheKey, candidates, 60);
    }
  } catch (e) {}

    // Calculate dynamic stats
    const stats = {
      activeVacancies: await prisma.vacancy.count({ where: { companyId, status: 'OPEN' } }),
      totalApplicants: await prisma.candidate.count({ where: { companyId } }),
      interviewsToday: await prisma.interview.count({ 
        where: { date: new Date(), candidate: { companyId } } 
      }),
    };

    return formatResponse(true, { data: candidates, stats }, "Recruitment pipeline fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Pipeline fetch failed", 500);
  }
}

export async function PATCH(request: Request) {
  const { candidateId, nextStage } = await request.json();
  try {
    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: { stage: nextStage }
    });
    
    try {
      await cacheDel(`tenant:${updated.companyId}:recruitment:*`);
      await cacheDel(`admin:recruitment:*`);
    } catch (e) {}
    
    return formatResponse(true, updated, "Stage transitioned successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Stage transition failed", 500);
  }
}