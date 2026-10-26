import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import {
  resolveDirectPayLink,
  revokeDirectPayLink,
  trackDirectPayLinkCheckoutStart,
} from "@/lib/pay-links/service";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/pay-links/[code]
 * Resolves the pay link for fast checkout with live product stock and store payment methods.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> | { code: string } },
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const code = resolvedParams.code;

    const { searchParams } = new URL(req.url);
    const trackVisit = searchParams.get("trackVisit") !== "false";

    const result = await resolveDirectPayLink(code, {
      incrementVisit: trackVisit,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error: any) {
    console.error("[PayLink Code GET Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve pay link." },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

/**
 * POST /api/pay-links/[code]
 * Track checkout start or telemetry event.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> | { code: string } },
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const code = resolvedParams.code;
    const body = await req.json().catch(() => ({}));

    if (body.action === "checkout_start") {
      await trackDirectPayLinkCheckoutStart(code);
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

/**
 * PATCH /api/pay-links/[code]
 * Revoke or update pay link state.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> | { code: string } },
) {
  try {
    const session = await getAuthSession();
    const resolvedParams = await Promise.resolve(params);
    const code = resolvedParams.code;
    const body = await req.json().catch(() => ({}));

    const companyId = body.companyId || (session?.user as any)?.companyId;
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing companyId." },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    if (body.action === "revoke") {
      const revoked = await revokeDirectPayLink(code, companyId);
      return NextResponse.json(
        { success: true, link: revoked },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      { success: false, error: "Unsupported patch action." },
      { status: 400, headers: CORS_HEADERS },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
