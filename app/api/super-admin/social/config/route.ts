/**
 * app/api/super-admin/social/config/route.ts
 *
 * Super Admin Social Platform App Credentials & Killswitch Management.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";
import { socialCrypto } from "@/lib/social/socialCrypto";
import { SocialPlatform } from "@/lib/social/types";

export const dynamic = "force-dynamic";

const ALL_PLATFORMS: SocialPlatform[] = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE"];

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);

    const configs = await prisma.platformSocialAppConfig.findMany();

    // Ensure all 4 platforms have representation in the response
    const platformsData = ALL_PLATFORMS.map((platform) => {
      const cfg = configs.find((c) => c.platform === platform);
      return {
        platform,
        enabled: cfg ? cfg.enabled : true,
        clientId: cfg?.clientId || null,
        hasSecret: Boolean(cfg?.clientSecretEncrypted),
        redirectUri: cfg?.redirectUri || null,
        requiredScopes: cfg?.requiredScopes || [],
        rateLimitPerMinute: cfg?.rateLimitPerMinute || 60,
        updatedAt: cfg?.updatedAt || null,
      };
    });

    return NextResponse.json({
      success: true,
      platforms: platformsData,
    });
  } catch (error: any) {
    console.error("[GET /api/super-admin/social/config] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireSuperAdmin(req);
    const body = await req.json();

    const { platform: rawPlatform, clientId, clientSecret, enabled, redirectUri, requiredScopes, rateLimitPerMinute } = body;
    const platform = (rawPlatform || "").toUpperCase() as SocialPlatform;

    if (!ALL_PLATFORMS.includes(platform)) {
      return NextResponse.json({ success: false, error: `Invalid platform: ${rawPlatform}` }, { status: 400 });
    }

    let secretBundle: any = undefined;
    if (clientSecret && clientSecret.trim()) {
      const enc = socialCrypto.encryptToken(clientSecret.trim());
      secretBundle = {
        clientSecretEncrypted: enc.encrypted,
        clientSecretIv: enc.iv,
        clientSecretTag: enc.tag,
      };
    }

    const updated = await prisma.platformSocialAppConfig.upsert({
      where: { platform },
      update: {
        enabled: enabled !== undefined ? enabled : undefined,
        clientId: clientId !== undefined ? clientId : undefined,
        redirectUri: redirectUri !== undefined ? redirectUri : undefined,
        requiredScopes: requiredScopes !== undefined ? requiredScopes : undefined,
        rateLimitPerMinute: rateLimitPerMinute !== undefined ? rateLimitPerMinute : undefined,
        ...(secretBundle || {}),
      },
      create: {
        platform,
        enabled: enabled !== undefined ? enabled : true,
        clientId: clientId || null,
        redirectUri: redirectUri || null,
        requiredScopes: requiredScopes || [],
        rateLimitPerMinute: rateLimitPerMinute || 60,
        ...(secretBundle || {}),
      },
    });

    // Record audit log
    await prisma.aIAuditLog.create({
      data: {
        action: `SOCIAL_PLATFORM_CONFIG_UPDATED_${platform}`,
        actorId: admin.id,
        actorEmail: admin.email,
        target: platform,
        details: {
          enabled: updated.enabled,
          hasClientId: Boolean(updated.clientId),
          hasSecret: Boolean(updated.clientSecretEncrypted),
        },
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        platform: updated.platform,
        enabled: updated.enabled,
        clientId: updated.clientId,
        hasSecret: Boolean(updated.clientSecretEncrypted),
        redirectUri: updated.redirectUri,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/super-admin/social/config] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status: error.statusCode || 500 }
    );
  }
}
