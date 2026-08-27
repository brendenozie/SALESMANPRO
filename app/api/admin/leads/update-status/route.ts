import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { leadId, scriptVersion } = await req.json();

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        automationStatus: "sent",
        lastPingAt: new Date(),
        scriptVersion: scriptVersion,
      },
    });

    
    try { await cacheDel(`admin:update-status:${updatedLead.companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}