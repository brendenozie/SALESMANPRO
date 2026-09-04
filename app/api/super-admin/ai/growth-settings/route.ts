import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { AIPlatformError } from "@/lib/ai/types";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);

    const [serpRecord, googleRecord, metaRecord] = await Promise.all([
      prisma.platformAIProvider.findUnique({ where: { provider: "SERPAPI" } }),
      prisma.platformAIProvider.findUnique({ where: { provider: "GOOGLE_SEARCH" } }),
      prisma.platformAIProvider.findUnique({ where: { provider: "META_WHATSAPP" } }),
    ]);

    const hasEnvSerp = Boolean(process.env.SERPAPI_API_KEY);
    const hasEnvGoogle = Boolean(process.env.GOOGLE_SEARCH_API_KEY);
    const hasEnvGoogleCse = Boolean(process.env.GOOGLE_SEARCH_ENGINE_ID);
    const hasEnvWhatsApp = Boolean(process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WA_ACCESS_TOKEN);

    return NextResponse.json({
      success: true,
      settings: {
        serpApi: {
          configured: Boolean(serpRecord?.apiKeyEncrypted || hasEnvSerp),
          source: serpRecord?.apiKeyEncrypted ? "DATABASE" : hasEnvSerp ? "ENV" : "NONE",
          enabled: serpRecord?.enabled ?? true,
          maskedKey: serpRecord?.apiKeyEncrypted ? "••••••••" + (serpRecord.id.slice(-4)) : hasEnvSerp ? "••••••••(env)" : null,
          connectionStatus: serpRecord?.connectionStatus || (hasEnvSerp ? "ACTIVE" : "NOT_CONFIGURED"),
          lastVerifiedAt: serpRecord?.lastVerifiedAt || null,
        },
        googleSearch: {
          configured: Boolean((googleRecord?.apiKeyEncrypted || hasEnvGoogle) && ((googleRecord?.metadata as any)?.searchEngineId || hasEnvGoogleCse)),
          source: googleRecord?.apiKeyEncrypted ? "DATABASE" : hasEnvGoogle ? "ENV" : "NONE",
          enabled: googleRecord?.enabled ?? true,
          maskedKey: googleRecord?.apiKeyEncrypted ? "••••••••" + (googleRecord.id.slice(-4)) : hasEnvGoogle ? "••••••••(env)" : null,
          searchEngineId: (googleRecord?.metadata as any)?.searchEngineId || (hasEnvGoogleCse ? process.env.GOOGLE_SEARCH_ENGINE_ID : null),
          connectionStatus: googleRecord?.connectionStatus || (hasEnvGoogle ? "ACTIVE" : "NOT_CONFIGURED"),
          lastVerifiedAt: googleRecord?.lastVerifiedAt || null,
        },
        metaWhatsApp: {
          configured: Boolean(metaRecord?.apiKeyEncrypted || hasEnvWhatsApp),
          source: metaRecord?.apiKeyEncrypted ? "DATABASE" : hasEnvWhatsApp ? "ENV" : "NONE",
          enabled: metaRecord?.enabled ?? true,
          phoneNumberId: (metaRecord?.metadata as any)?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || null,
          wabaId: (metaRecord?.metadata as any)?.wabaId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null,
          templateName: (metaRecord?.metadata as any)?.templateName || "salesmanpro_merchant_outreach",
          templateStatus: (metaRecord?.metadata as any)?.templateStatus || "PENDING_REGISTRATION",
          connectionStatus: metaRecord?.connectionStatus || (hasEnvWhatsApp ? "ACTIVE" : "NOT_CONFIGURED"),
          lastVerifiedAt: metaRecord?.lastVerifiedAt || null,
        },
      },
    });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();
    const { target, apiKey, enabled, metadata } = body;

    if (!target || !["SERPAPI", "GOOGLE_SEARCH", "META_WHATSAPP"].includes(target)) {
      return NextResponse.json(
        { success: false, error: "Invalid target. Must be SERPAPI, GOOGLE_SEARCH, or META_WHATSAPP." },
        { status: 400 },
      );
    }

    const providerNameMap: Record<string, string> = {
      SERPAPI: "SerpApi Google Maps / Search",
      GOOGLE_SEARCH: "Google Custom Search Engine",
      META_WHATSAPP: "Meta WhatsApp Cloud Outreach",
    };

    const saved = await superAdminAIService.upsertProvider({
      provider: target,
      name: providerNameMap[target],
      apiKey: apiKey && apiKey.trim().length > 0 ? apiKey.trim() : undefined,
      enabled: enabled ?? true,
      metadata: metadata || undefined,
    });

    return NextResponse.json({ success: true, saved });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
