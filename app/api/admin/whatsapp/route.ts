import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

// app/api/whatsapp/route.ts (Next.js App Router)
// import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { recipient, message, companyId } = await request.json();

  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipient, // e.g., "15551234567"
      type: "text",
      text: { body: message },
    }),
  });

  const data = await response.json();

  //update lead conversation in db
  // await prisma.leadConversation.create({
  //   data: {
  //     lead: {
  //       connect: { phone: recipient, companyId: companyId},
  //     },
  //     message: message,
  //     direction: "out",
  //   },
  // });

  const lead = await prisma.lead.upsert({
    where: { phone: recipient, companyId: companyId },
    update: {
      stage: "sent",
      lastMessageAt: new Date(),
    },
    create: {
      phone: recipient,
      stage: "sent",
      lastMessageAt: new Date(),
      companyId,
    },
  });

  return NextResponse.json(data);
}

// export async function POST(req: Request) {
//   const payload = await req.json();

//   const message = payload.message?.text;
//   const phone = payload.from;
//   const companyId = payload.companyId;

//   if (!phone || !message || !companyId) return NextResponse.json({ ok: true });

//   const lead = await prisma.lead.upsert({
//     where: { phone, companyId },
//     update: {
//       stage: "replied",
//       lastMessageAt: new Date(),
//     },
//     create: {
//       phone,
//       stage: "replied",
//       lastMessageAt: new Date(),
//         companyId,  
//     },
//   });

//   await prisma.leadConversation.create({
//     data: {
//       leadId: lead.id,
//       message,
//       direction: "in",
//     },
//   });

//   return NextResponse.json({ success: true });
// }
