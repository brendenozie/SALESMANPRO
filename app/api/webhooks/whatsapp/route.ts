import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json();

  const message = payload.message?.text;
  const phone = payload.from;
  const companyId = payload.companyId;

  if (!phone || !message || !companyId) return NextResponse.json({ ok: true });

  const lead = await prisma.lead.upsert({
    where: { phone, companyId },
    update: {
      stage: "replied",
      lastMessageAt: new Date(),
    },
    create: {
      phone,
      stage: "replied",
      lastMessageAt: new Date(),
        companyId,  
    },
  });

  await prisma.leadConversation.create({
    data: {
      leadId: lead.id,
      message,
      direction: "in",
    },
  });

  return NextResponse.json({ success: true });
}
