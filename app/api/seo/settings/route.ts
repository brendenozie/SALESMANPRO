import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { evaluateTenantStoreSEO } from "@/lib/seo/seo-validation";
import { buildCanonicalUrl } from "@/lib/seo/canonical-builder";
import { notifySearchEnginesOfUpdate } from "@/lib/seo/update-notifier";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId parameter is required" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { SEO: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const seoRecord = company.SEO;
    const readinessReport = evaluateTenantStoreSEO({
      id: company.id,
      slug: company.slug || "",
      domain: company.domain,
      name: company.name,
      description: seoRecord?.description || company.description,
      tagline: company.tagline,
      logoUrl: company.logoUrl,
      contactPhone: company.contactPhone,
      contactEmail: company.contactEmail,
    });

    const canonicalPreview = buildCanonicalUrl({
      siteType: "TENANT_STORE",
      tenant: { slug: company.slug || "", domain: company.domain },
      path: "/",
    });

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        domain: company.domain,
        city: company.city,
        country: company.country,
        category: company.category,
      },
      seo: {
        title: seoRecord?.title || "",
        description: seoRecord?.description || "",
        keywords: Array.isArray(seoRecord?.keywords) ? seoRecord.keywords : [],
        canonicalPreview,
      },
      readinessReport,
    });
  } catch (error: any) {
    console.error("Failed to retrieve SEO settings:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, title, description, keywords } = body;

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions as any) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { SEO: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Clean and validate keywords
    const cleanedKeywords = Array.isArray(keywords)
      ? keywords.map((k: string) => String(k).trim()).filter(Boolean)
      : typeof keywords === "string"
      ? keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
      : [];

    let updatedSeo;
    if (company.sEOId) {
      updatedSeo = await prisma.sEO.update({
        where: { id: company.sEOId },
        data: {
          title: title ? String(title).trim() : null,
          description: description ? String(description).trim() : null,
          keywords: cleanedKeywords,
        },
      });
    } else {
      updatedSeo = await prisma.sEO.create({
        data: {
          title: title ? String(title).trim() : null,
          description: description ? String(description).trim() : null,
          keywords: cleanedKeywords,
        },
      });

      await prisma.company.update({
        where: { id: company.id },
        data: { sEOId: updatedSeo.id },
      });
    }

    // Notify search engines (IndexNow) in background
    const canonicalUrl = buildCanonicalUrl({
      siteType: "TENANT_STORE",
      tenant: { slug: company.slug || "", domain: company.domain },
      path: "/",
    });

    notifySearchEnginesOfUpdate({
      url: canonicalUrl,
      siteType: "TENANT_STORE",
    }).catch((err) => console.warn("IndexNow notification deferred:", err));

    const updatedReadiness = evaluateTenantStoreSEO({
      id: company.id,
      slug: company.slug || "",
      domain: company.domain,
      name: company.name,
      description: updatedSeo.description || company.description,
      tagline: company.tagline,
      logoUrl: company.logoUrl,
      contactPhone: company.contactPhone,
      contactEmail: company.contactEmail,
    });

    return NextResponse.json({
      success: true,
      seo: {
        title: updatedSeo.title,
        description: updatedSeo.description,
        keywords: updatedSeo.keywords,
        canonicalPreview: canonicalUrl,
      },
      readinessReport: updatedReadiness,
      message: "SEO Strategy successfully updated and submitted for search engine indexing.",
    });
  } catch (error: any) {
    console.error("Failed to update SEO settings:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
