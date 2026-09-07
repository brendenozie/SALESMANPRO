import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import {
  getOrCreateWebsite,
  saveWebsiteDraft,
  publishWebsite,
  getWebsiteRevisions,
  rollbackWebsiteRevision,
} from "@/lib/website-builder/website-service";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return formatResponse(false, null, "Authentication required", 401);
    }

    // Verify tenant access
    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true, userId: true, name: true, logoUrl: true, contactPhone: true, contactEmail: true },
    });

    if (!company) {
      return formatResponse(false, null, "Store not found", 404);
    }

    const { website, config, isNew } = await getOrCreateWebsite(slug);
    const revisions = await getWebsiteRevisions(company.id);

    return NextResponse.json({
      success: true,
      data: {
        websiteId: website.id,
        companyId: company.id,
        storeName: company.name,
        logoUrl: company.logoUrl,
        contactPhone: company.contactPhone,
        contactEmail: company.contactEmail,
        status: website.status,
        publishedAt: website.publishedAt,
        config,
        revisions,
        isNew,
      },
    });
  } catch (error: any) {
    console.error("Error in website-builder GET:", error);
    return formatResponse(false, null, error.message || "Failed to load website configuration", 500);
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return formatResponse(false, null, "Authentication required", 401);
    }

    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });

    if (!company) {
      return formatResponse(false, null, "Store not found", 404);
    }

    const body = await req.json();
    const { action, draftConfig, revisionId, changeSummary } = body;

    if (action === "SAVE_DRAFT") {
      if (!draftConfig) {
        return formatResponse(false, null, "draftConfig is required", 400);
      }
      const savedConfig = await saveWebsiteDraft(company.id, draftConfig, (session.user as any)?.id);
      return NextResponse.json({
        success: true,
        message: "Draft saved successfully",
        data: savedConfig,
      });
    }

    if (action === "PUBLISH") {
      const publishResult = await publishWebsite(
        company.id,
        changeSummary || "Published updates from Website Builder",
        (session.user as any)?.id
      );
      const revisions = await getWebsiteRevisions(company.id);
      return NextResponse.json({
        success: true,
        message: `Website published successfully (v${publishResult.versionNumber})`,
        data: {
          config: publishResult.publishedConfig,
          versionNumber: publishResult.versionNumber,
          revisions,
        },
      });
    }

    if (action === "ROLLBACK") {
      if (!revisionId) {
        return formatResponse(false, null, "revisionId is required for rollback", 400);
      }
      const restoredConfig = await rollbackWebsiteRevision(company.id, revisionId, (session.user as any)?.id);
      const revisions = await getWebsiteRevisions(company.id);
      return NextResponse.json({
        success: true,
        message: "Restored revision into draft",
        data: {
          config: restoredConfig,
          revisions,
        },
      });
    }

    return formatResponse(false, null, `Invalid action: ${action}`, 400);
  } catch (error: any) {
    console.error("Error in website-builder POST:", error);
    return formatResponse(false, null, error.message || "Failed to process website builder request", 500);
  }
}
