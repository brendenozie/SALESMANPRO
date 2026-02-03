import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { leadId, scriptVersion } = await req.json();

    // 1. Fetch Lead & Script
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const scripts: Record<string, string> = {
      A: `Hi 👋 hope you’re well. I work with small businesses to help them get more customers using simple websites. Quick question — do you currently use a website?`,
      B: `Hi 👋 Quick one — do you use a website for your business or side hustle?`,
      C: `Hi 👋 hope uko poa. Quick one — do you already have a website for your biashara?`,
      D: `Hi 👋 natumai uko poa. Je, tayari una tovuti kwa biashara yako?`,
      E: `Hello 👋 I help small businesses get more customers using simple websites. Do you currently have a website for your business?`,
      F: `Hello 👋 Do you have a website for your business? I help small businesses get more customers online with simple websites.`,
      G: `Hi 👋 I help small businesses get more customers using simple websites. Do you have a website for your business?`,
      H: `Hi 👋 Je, tayari una tovuti kwa biashara yako?`,
      I: `Hello 👋 Natumai uko poa. Je, tayari una tovuti kwa biashara yako?`,
    };

    const message = scripts[scriptVersion] || scripts.A;

    // 2. Call the WhatsApp Gateway (Evolution API Example)
    // Replace with your actual Gateway URL and API Key
    // const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL; 
    // const apiKey = process.env.WHATSAPP_API_KEY;

    // const response = await fetch(`${gatewayUrl}/message/sendText/${process.env.WHATSAPP_INSTANCE_NAME}`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "apikey": apiKey!,
    //   },
    //   body: JSON.stringify({
    //     number: lead.phone, // Ensure phone has country code (e.g., 254...)
    //     options: { delay: 1200, presence: "composing" }, // Mimic human typing
    //     textMessage: { text: message },
    //   }),
    // });
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: lead.phone, // e.g., "15551234567"
        type: "text",
        text: { body: message },
      }),
    });

    // const data = await response.json();

    const result = await response.json();

    if (response.ok) {
      // 3. Update Database on Success
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          automationStatus: "sent",
          lastPingAt: new Date(),
          scriptVersion: scriptVersion,
        },
      });
      return NextResponse.json({ success: true });
    } else {
      throw new Error(result.message || "Failed to send message");
    }

  } catch (error: any) {
    console.error("WhatsApp Send Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}