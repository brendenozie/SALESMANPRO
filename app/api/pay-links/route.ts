import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import {
  createDirectPayLink,
  listStoreDirectPayLinks,
} from "@/lib/pay-links/service";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
 * GET /api/pay-links?companyId=...&productId=...&status=...
 * Lists direct pay links for a store.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || searchParams.get("storeId");
    const productId = searchParams.get("productId") || undefined;
    const status = searchParams.get("status") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'companyId' query parameter." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const links = await listStoreDirectPayLinks(companyId, {
      productId,
      status,
      limit,
    });

    return NextResponse.json(
      {
        success: true,
        links,
        count: links.length,
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error: any) {
    console.error("[PayLinks GET Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch direct pay links." },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

/**
 * POST /api/pay-links
 * Creates a new Direct Pay Link for a product.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const body = await req.json();

    const targetCompanyId = body.companyId || (session?.user as any)?.companyId;

    if (!targetCompanyId) {
      return NextResponse.json(
        { success: false, error: "Target companyId is required." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      select: { id: true, slug: true, name: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://salesmanpro.store";

    const result = await createDirectPayLink(
      {
        ...body,
        companyId: targetCompanyId,
        subdomain: company.slug || undefined,
        creatorId: (session?.user as any)?.id || undefined,
      },
      baseUrl,
    );

    return NextResponse.json(
      {
        success: true,
        link: result.link,
        payUrl: result.payUrl,
        whatsAppUrl: result.whatsAppUrl,
        shareText: result.shareText,
      },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error: any) {
    console.error("[PayLinks POST Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create direct pay link." },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
