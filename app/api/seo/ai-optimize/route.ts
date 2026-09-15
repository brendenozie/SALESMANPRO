import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productAI } from "@/lib/ai/productAI";
import { evaluateTenantStoreSEO } from "@/lib/seo/seo-validation";
import { buildCanonicalUrl } from "@/lib/seo/canonical-builder";
import { notifySearchEnginesOfUpdate } from "@/lib/seo/update-notifier";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, autoSave = false } = body;

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        SEO: true,
        marketplaceListings: {
          take: 10,
          where: { isAvailable: true, status: "ACTIVE", showOnGhuba: true },
          select: { name: true, category: true },
        },
        Product: {
          take: 5,
          where: { isAvailable: true, showOnGhuba: true },
          select: { name: true, category: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Prioritize customer-facing active marketplace listings for public store SEO grounding
    const topProducts = [
      ...(company.marketplaceListings?.map((l: any) => l.name) || []),
      ...(company.marketplaceListings?.length ? [] : company.Product?.map((p: any) => p.name) || []),
    ].filter(Boolean).slice(0, 8);

    // Call AI SEO Generator
    const generated = await productAI.generateStoreSEO(
      {
        storeName: company.name,
        category: company.category || "Retail Store",
        tagline: company.tagline || undefined,
        description: company.description || undefined,
        topProducts,
        city: company.city || undefined,
        country: company.country || "Kenya",
      },
      {
        companyId: company.id,
        userEmail: session.user.email,
        userId: session.user.id || "system",
      }
    );

    let savedSeo = null;
    let updatedReadiness = null;

    if (autoSave && generated) {
      if (company.sEOId) {
        savedSeo = await prisma.sEO.update({
          where: { id: company.sEOId },
          data: {
            title: generated.seoTitle,
            description: generated.seoDescription,
            keywords: generated.keywords,
          },
        });
      } else {
        savedSeo = await prisma.sEO.create({
          data: {
            title: generated.seoTitle,
            description: generated.seoDescription,
            keywords: generated.keywords,
          },
        });

        await prisma.company.update({
          where: { id: company.id },
          data: { sEOId: savedSeo.id },
        });
      }

      const canonicalUrl = buildCanonicalUrl({
        siteType: "TENANT_STORE",
        tenant: { slug: company.slug || "", domain: company.domain },
        path: "/",
      });

      notifySearchEnginesOfUpdate({
        url: canonicalUrl,
        siteType: "TENANT_STORE",
      }).catch((err) => console.warn("IndexNow ping deferred:", err));

      updatedReadiness = evaluateTenantStoreSEO({
        id: company.id,
        slug: company.slug || "",
        domain: company.domain,
        name: company.name,
        description: savedSeo.description || company.description,
        tagline: company.tagline,
        logoUrl: company.logoUrl,
        contactPhone: company.contactPhone,
        contactEmail: company.contactEmail,
      });
    }

    return NextResponse.json({
      success: true,
      generated,
      saved: Boolean(autoSave && savedSeo),
      seo: savedSeo,
      readinessReport: updatedReadiness,
      message: autoSave
        ? "AI SEO generated and applied to store automatically."
        : "AI SEO generated suggestions ready for review.",
    });
  } catch (error: any) {
    console.error("AI SEO Optimization error:", error);
    return NextResponse.json({ error: error?.message || "AI SEO generation failed" }, { status: 500 });
  }
}
