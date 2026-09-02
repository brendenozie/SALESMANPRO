/**
 * app/api/social/callback/[platform]/route.ts
 *
 * Official OAuth callback endpoint for social media platform integrations.
 * Exchanges authorization code for tokens, securely encrypts credentials,
 * saves social accounts, and redirects back to the store's social dashboard.
 */

import { NextResponse } from "next/server";
import { socialPlatformRegistry } from "@/lib/social/adapters";
import { SocialPlatform } from "@/lib/social/types";
import { socialService } from "@/lib/social/socialService";
import prisma from "@/server/db/prismadb";
import { socialCrypto } from "@/lib/social/socialCrypto";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ platform: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error_description") || url.searchParams.get("error");

  const { platform: rawPlatform } = await params;
  const platform = rawPlatform.toUpperCase() as SocialPlatform;

  let fallbackSlug = "dashboard";

  try {
    if (errorParam) {
      throw new Error(`Platform returned error: ${errorParam}`);
    }

    if (!code || !state) {
      throw new Error("Missing authorization code or state parameter in OAuth callback");
    }

    // 1. Decode & validate state parameter
    let stateData: { companyId: string; slug: string; platform: string; timestamp: number };
    try {
      const decodedJson = Buffer.from(state, "base64url").toString("utf-8");
      stateData = JSON.parse(decodedJson);
      fallbackSlug = stateData.slug || "dashboard";
    } catch {
      throw new Error("Invalid or tampered OAuth state parameter");
    }

    // Check state expiry (15 minute threshold)
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      throw new Error("OAuth session expired. Please retry connecting your account.");
    }

    const companyId = stateData.companyId;

    // 2. Fetch Super Admin platform config if customized
    const platformConfig = await prisma.platformSocialAppConfig.findUnique({
      where: { platform },
    });

    let decryptedSecret: string | undefined;
    if (platformConfig?.clientSecretEncrypted) {
      decryptedSecret = socialCrypto.decryptToken({
        encrypted: platformConfig.clientSecretEncrypted,
        iv: platformConfig.clientSecretIv,
        tag: platformConfig.clientSecretTag,
      });
    }

    // 3. Resolve redirect URI
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/social/callback/${platform.toLowerCase()}`;

    // 4. Exchange code for account tokens
    const adapter = socialPlatformRegistry.getAdapter(platform);
    const tokenResults = await adapter.exchangeCodeForToken(code, redirectUri, {
      clientId: platformConfig?.clientId,
      clientSecret: decryptedSecret,
    });

    // 5. Save all authorized accounts for this tenant
    for (const result of tokenResults) {
      await socialService.saveConnectedAccount({
        companyId,
        platform,
        platformAccountId: result.platformAccountId,
        accountName: result.accountName,
        username: result.username,
        profileImageUrl: result.profileImageUrl,
        accountType: result.accountType,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresInSeconds: result.expiresInSeconds,
        scopes: result.scopes,
        metadata: result.metadata,
      });
    }

    // Redirect to store social dashboard
    const destination = `/admin/${stateData.slug}/social?success=${platform.toLowerCase()}_connected`;
    return NextResponse.redirect(new URL(destination, `${protocol}://${host}`));
  } catch (err: any) {
    console.error(`[OAuth Callback ${platform}] Error:`, err);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const errorMsg = encodeURIComponent(err.message || "Failed to connect social account");
    const destination = `/admin/${fallbackSlug}/social?error=${errorMsg}`;
    return NextResponse.redirect(new URL(destination, `${protocol}://${host}`));
  }
}
