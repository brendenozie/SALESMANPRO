import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAvailableStorePaymentMethods } from "@/lib/payments/resolver";
import { classifyHost } from "@/lib/auth/domain";
import { getTrustedHost } from "@/lib/requestIdentity";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const host = getTrustedHost(req) || req.headers.get("x-requested-host") || "";
    const subdomain = req.headers.get("x-requested-subdomain") || "";
    const rewrittenSlug = req.headers.get("x-rewritten-slug") || "";

    const classified = classifyHost(host);
    const queryMarketplace = searchParams.get("isMarketplace") === "true";
    const isMarketplace = queryMarketplace || classified.kind === "ghuba";

    let resolvedStoreId = searchParams.get("storeId") || searchParams.get("companyId");

    // If storeId is not explicitly passed, attempt to resolve via subdomain or host slug
    if (!resolvedStoreId && !isMarketplace) {
      const targetSlug = subdomain || rewrittenSlug;
      if (targetSlug && targetSlug !== "www" && targetSlug !== "auth") {
        const company = await prisma.company.findFirst({
          where: {
            OR: [
              { slug: targetSlug },
              { customDomain: host.toLowerCase().replace(/^www\./, "") },
            ],
          },
          select: { id: true },
        });
        if (company) {
          resolvedStoreId = company.id;
        }
      }
    }

    const result = await getAvailableStorePaymentMethods({
      storeId: resolvedStoreId,
      isMarketplace,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  } catch (error: any) {
    console.error("[SHOP_PAYMENT_METHODS_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to resolve payment methods.",
        availableMethods: [],
        resolutionRule: "UNAVAILABLE",
      },
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
}
