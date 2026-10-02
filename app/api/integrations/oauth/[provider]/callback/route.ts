/**
 * app/api/integrations/oauth/[provider]/callback/route.ts
 *
 * Official OAuth callback endpoint for SalesmanPro integrations.
 * Validates cryptographic state, exchanges authorization code for tokens,
 * encrypts credentials at rest, and redirects back to the mascot dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { IntegrationOAuthService } from "@/lib/integrations/oauth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(req.url);

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.warn(`[OAUTH_PROVIDER_ERROR] ${provider}:`, error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/admin/store/mascot/integrations?error=${encodeURIComponent(
            errorDescription || error
          )}&provider=${provider}`,
          req.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          `/admin/store/mascot/integrations?error=Missing+code+or+state+parameter&provider=${provider}`,
          req.url
        )
      );
    }

    const origin = req.nextUrl.origin;
    const result = await IntegrationOAuthService.handleCallback({
      providerId: provider,
      code,
      state,
      origin,
    });

    const targetUrl = new URL(result.redirectPath, req.url);
    targetUrl.searchParams.set("connected", "true");
    targetUrl.searchParams.set("provider", provider);
    targetUrl.searchParams.set("account", encodeURIComponent(result.accountName));

    return NextResponse.redirect(targetUrl);
  } catch (err: any) {
    console.error("[OAUTH_CALLBACK_EXCEPTION]", err);
    return NextResponse.redirect(
      new URL(
        `/admin/store/mascot/integrations?error=${encodeURIComponent(
          err?.message || "Failed to complete account connection"
        )}`,
        req.url
      )
    );
  }
}
