import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { buildCanonicalUrl, PRIMARY_PLATFORM_DOMAIN, PRIMARY_GHUBA_DOMAIN } from "@/lib/seo/canonical-builder";
import { evaluateListingSEOReadiness } from "@/lib/seo/seo-validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalActiveStores, totalApprovedListings, sampleListing] = await Promise.all([
      prisma.company.count({
        where: { slug: { not: null } },
      }),
      prisma.marketplaceListings.count({
        where: {
          isAvailable: true,
          ghubaAdminApproved: true,
          ghubaStatus: "APPROVED",
        },
      }),
      prisma.marketplaceListings.findFirst({
        where: {
          isAvailable: true,
          ghubaAdminApproved: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          finalPrice: true,
          sellingPrice: true,
          images: true,
          brand: true,
          isAvailable: true,
        },
      }),
    ]);

    const sampleReadiness = sampleListing
      ? evaluateListingSEOReadiness(sampleListing as any)
      : null;

    const canonicalTests = {
      platform: buildCanonicalUrl({ siteType: "SALESMANPRO", path: "/" }),
      ghuba: buildCanonicalUrl({ siteType: "GHUBA", path: "/" }),
      tenantSubdomainSample: buildCanonicalUrl({
        siteType: "TENANT_STORE",
        tenant: { slug: "sample-store" },
        path: "/products/123",
      }),
      tenantCustomDomainSample: buildCanonicalUrl({
        siteType: "TENANT_STORE",
        tenant: { slug: "sample-store", domain: "examplebrand.co.ke" },
        path: "/products/123",
      }),
    };

    return NextResponse.json({
      status: "HEALTHY",
      timestamp: new Date().toISOString(),
      surfaces: {
        platform: {
          primaryDomain: PRIMARY_PLATFORM_DOMAIN,
          indexableStoresCount: totalActiveStores,
        },
        ghubaMarketplace: {
          primaryDomain: PRIMARY_GHUBA_DOMAIN,
          indexableApprovedListingsCount: totalApprovedListings,
        },
      },
      sampleAudit: {
        listingId: sampleListing?.id,
        seoReadiness: sampleReadiness,
      },
      canonicalVerification: canonicalTests,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "ERROR",
        message: error?.message || "Failed to query SEO diagnostics",
      },
      { status: 500 }
    );
  }
}
