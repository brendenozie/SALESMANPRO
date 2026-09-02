/**
 * app/api/social/connect/[platform]/route.ts
 *
 * Initiates the official OAuth authorization flow for a social media platform.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialPlatformRegistry } from "@/lib/social/adapters";
import { SocialPlatform } from "@/lib/social/types";
import prisma from "@/server/db/prismadb";
import { socialCrypto } from "@/lib/social/socialCrypto";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ platform: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { platform: rawPlatform } = await params;
    const platform = rawPlatform.toUpperCase() as SocialPlatform;

    if (!socialPlatformRegistry.hasAdapter(platform)) {
      return NextResponse.json(
        { success: false, error: `Platform '${rawPlatform}' is not supported` },
        { status: 400 }
      );
    }

    const auth = await resolveAIAuth(req);

    // Fetch store slug for post-auth redirect
    const company = await prisma.company.findUnique({
      where: { id: auth.companyId },
      select: { slug: true },
    });

    // Check if platform is enabled by Super Admin
    const platformConfig = await prisma.platformSocialAppConfig.findUnique({
      where: { platform },
    });

    if (platformConfig && !platformConfig.enabled) {
      return NextResponse.json(
        { success: false, error: `${platform} connection is currently disabled by system administration.` },
        { status: 403 }
      );
    }

    // Build secure state parameter containing tenant identity
    const statePayload = JSON.stringify({
      companyId: auth.companyId,
      slug: company?.slug || "dashboard",
      platform,
      nonce: Math.random().toString(36).substring(2),
      timestamp: Date.now(),
    });

    const encryptedState = Buffer.from(statePayload).toString("base64url");

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/social/callback/${platform.toLowerCase()}`;

    const adapter = socialPlatformRegistry.getAdapter(platform);
    const oauthUrl = adapter.getOAuthUrl(
      {
        state: encryptedState,
        redirectUri,
      },
      {
        clientId: platformConfig?.clientId,
      }
    );

    return NextResponse.redirect(oauthUrl);
  } catch (error: any) {
    console.error("[GET /api/social/connect/[platform]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate OAuth connection" },
      { status: error.statusCode || 500 }
    );
  }
}
