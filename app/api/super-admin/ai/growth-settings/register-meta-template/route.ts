import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { AIPlatformError } from "@/lib/ai/types";
import { MetaWhatsAppClient } from "@/lib/whatsapp/metaClient";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json().catch(() => ({}));

    const details = await superAdminAIService.getProviderDetails("META_WHATSAPP");
    const accessToken = body.accessToken || details.apiKey || process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WA_ACCESS_TOKEN;
    const phoneNumberId = body.phoneNumberId || details.metadata?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    const wabaId = body.wabaId || details.metadata?.wabaId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const templateName = body.templateName || "salesmanpro_merchant_outreach";

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: "Meta WhatsApp Access Token is missing. Configure it in WhatsApp settings.",
      }, { status: 400 });
    }

    if (!wabaId) {
      return NextResponse.json({
        success: false,
        error: "Meta WhatsApp Business Account ID (WABA ID) is required to register templates.",
      }, { status: 400 });
    }

    const client = new MetaWhatsAppClient({
      accessToken,
      phoneNumberId,
    });

    const response = await client.registerOutreachTemplate({
      wabaId,
      templateName,
    });

    // Update metadata in DB
    const existingMeta = await prisma.platformAIProvider.findUnique({ where: { provider: "META_WHATSAPP" } });
    const currentMeta = (existingMeta?.metadata as any) || {};

    await prisma.platformAIProvider.upsert({
      where: { provider: "META_WHATSAPP" },
      create: {
        provider: "META_WHATSAPP",
        name: "Meta WhatsApp Cloud Outreach",
        enabled: true,
        metadata: {
          ...currentMeta,
          phoneNumberId,
          wabaId,
          templateName,
          templateStatus: (response as any).status || "PENDING_REVIEW",
          templateId: (response as any).id,
          lastRegisteredAt: new Date(),
        },
      },
      update: {
        metadata: {
          ...currentMeta,
          phoneNumberId,
          wabaId,
          templateName,
          templateStatus: (response as any).status || "PENDING_REVIEW",
          templateId: (response as any).id,
          lastRegisteredAt: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      templateName,
      templateId: (response as any).id,
      status: (response as any).status || "PENDING_REVIEW",
      response,
    });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
