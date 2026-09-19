/**
 * app/api/admin/[slug]/search-analytics/route.ts
 *
 * Tenant Administrator Analytics Endpoint for Store Search Intelligence.
 * Strictly scopes search query demand and zero-result queries to the merchant's store.
 */

import { NextResponse } from "next/server";
import { SearchAnalyticsService } from "@/lib/search/searchAnalyticsService";
import { findCompanyCached } from "@/lib/company-fetcher";
import { verifyAuth } from "@/lib/verifyAuth";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const company = await findCompanyCached(slug, "lean");
    if (!company) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Verify user is authorized for this company
    const tenantScope = await resolveAuthorizedCompany(authResult.user, company.id);
    if (!tenantScope.authorized) {
      return NextResponse.json({ error: "Forbidden: Access denied to this store" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const analytics = await SearchAnalyticsService.getSearchAnalytics({
      days,
      companyId: company.id,
    });

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error("[API/admin/[slug]/search-analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch store search analytics", details: error.message },
      { status: 500 }
    );
  }
}
