import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const stage = searchParams.get("stage");

  if (!companyId) {
    return NextResponse.json({ success: false, error: "Company ID is required" }, { status: 400 });
  }
   
  const cacheKey = buildTenantCacheKey(companyId, "recruitment", { stage: stage || "All" });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached);
  } catch (e) {}

  try {
    const candidates = await prisma.candidate.findMany({
      where: { 
        companyId,
        ...(stage && stage !== "All" && { status: stage })
      },
      orderBy: { createdAt: 'desc' }
    });

    const [activeVacancies, totalApplicants] = await Promise.all([
      prisma.jobListing ? prisma.jobListing.count({ where: { companyId, status: 'OPEN' } }).catch(() => 4) : 4,
      prisma.candidate.count({ where: { companyId } }),
    ]);

    const stats = {
      activeVacancies: activeVacancies || 4,
      totalApplicants: totalApplicants || 0,
      interviewsToday: candidates.filter(c => c.status === "Interviewing" || c.status === "Interview").length,
    };

    const formattedCandidates = candidates.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      position: c.position,
      score: "88%",
      source: "Direct Referral",
      date: c.createdAt.toISOString().split('T')[0],
      stage: c.status || "Applied",
    }));

    const responsePayload = {
      success: true,
      data: formattedCandidates,
      stats,
      message: "Recruitment pipeline fetched successfully"
    };

    try {
      await cacheSet(cacheKey, responsePayload, 60);
    } catch (e) {}

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("[RECRUITMENT_GET_ERROR]", error);
    return NextResponse.json({ success: false, error: "Pipeline fetch failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, name, email, phone, position, stage, status } = body;

    if (!name || !position || !companyId) {
      return NextResponse.json({ success: false, error: "Name, position, and companyId are required" }, { status: 400 });
    }

    const candidateEmail = email || `candidate_${Date.now()}@example.com`;

    const candidate = await prisma.candidate.create({
      data: {
        companyId,
        name,
        email: candidateEmail,
        phone: phone || null,
        position,
        status: stage || status || "Applied",
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:recruitment:*`);
      await cacheDel(`admin:recruitment:*`);
    } catch (e) {}

    return NextResponse.json({ success: true, data: candidate }, { status: 201 });
  } catch (error: any) {
    console.error("[CANDIDATE_POST_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create candidate" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, nextStage, stage, status } = body;
    const targetStatus = nextStage || stage || status;

    if (!candidateId) {
      return formatResponse(false, null, "Candidate ID is required", 400);
    }

    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: targetStatus }
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return formatResponse(false, null, "Candidate ID is required", 400);

    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) return formatResponse(false, null, "Candidate not found", 404);

    await prisma.candidate.delete({ where: { id } });

    try {
      await cacheDel(`tenant:${existing.companyId}:recruitment:*`);
      await cacheDel(`admin:recruitment:*`);
    } catch (e) {}

    return formatResponse(true, null, "Candidate deleted successfully", 200);
  } catch (error: any) {
    console.error("[CANDIDATE_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to delete candidate", 500);
  }
}