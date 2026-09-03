import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, name, email, position, source, score, notes } = body;

    const candidate = await prisma.candidate.create({
      data: {
        companyId,
        name,
        email,
        position,
        source: source || "Direct Referral",
        score: parseInt(score) || 0,
        notes,
        stage: "Applied", // Default starting stage
      },
    });

    
    try {
      await cacheDel(`tenant:${companyId}:create:*`);
      await cacheDel(`admin:create:*`);
    } catch (e) {}
    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    console.error("Candidate creation error:", error);
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}