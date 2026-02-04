import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { leadId, scriptVersion } = await req.json();

    // 1. Fetch Lead
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    // 2. Script Dictionary (Consider moving this to a separate config file)
    const scripts: Record<string, string> = {
      A: "Hi 👋 I work with small businesses to help them get more customers. Do you use a website?",
      B: "Hi 👋 Quick one — do you use a website for your business?",
      C: "Hi 👋 hope uko poa. Quick one — do you already have a website?",
      // ... include D through I
    };

    const message = scripts[scriptVersion] || scripts.A;

    // 3. Clean Phone Number (Removes +, spaces, and dashes)
    const cleanPhone = lead.phone.replace(/\D/g, "");

    // 4. Meta API Call
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Log the specific error from Meta (very helpful for debugging)
      console.error("Meta API Error:", result.error?.message || "Unknown error");
      return NextResponse.json({ 
        error: result.error?.message || "Meta API Failure" 
      }, { status: response.status });
    }

    // 5. Update Database
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        automationStatus: "sent",
        lastPingAt: new Date(),
        scriptVersion: scriptVersion,
        // metadata: result.messages[0].id // Optional: store the message ID
      },
    });

    return NextResponse.json({ success: true, messageId: result.messages[0].id });

  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}