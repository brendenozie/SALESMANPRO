import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { DocumentType } from "@/lib/documents/types";
import { getDefaultTemplateId } from "@/lib/documents/registry";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return formatResponse(false, null, "Unauthorized access", 401);
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      include: {
        documentTemplateSettings: true,
      },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    // Build configuration map with fallbacks
    const documentTypes: DocumentType[] = [
      "INVOICE",
      "QUOTATION",
      "PURCHASE_ORDER",
      "SALES_RECEIPT",
      "PAYMENT_RECEIPT",
      "STUDENT_REPORT",
    ];

    const settingsMap: Record<string, any> = {};
    for (const dt of documentTypes) {
      const existing = company.documentTemplateSettings.find((s) => s.documentType === dt);
      settingsMap[dt] = {
        documentType: dt,
        templateId: existing?.templateId || getDefaultTemplateId(dt),
        pageSize: existing?.pageSize || (dt === "SALES_RECEIPT" ? "THERMAL_80MM" : "A4"),
        prefix: existing?.prefix || null,
        nextNumber: existing?.nextNumber || 1,
        showLogo: existing?.showLogo ?? true,
        showTaxNumber: existing?.showTaxNumber ?? true,
        headerText: existing?.headerText || null,
        footerText: existing?.footerText || null,
        termsAndConditions: existing?.termsAndConditions || null,
      };
    }

    return formatResponse(true, { companyId: targetCompanyId, settings: settingsMap }, "Settings retrieved", 200);
  } catch (error: any) {
    console.error("Document settings fetch error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch settings", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return formatResponse(false, null, "Unauthorized access", 401);
    }

    const body = await req.json();
    const {
      companyId,
      slug,
      documentType,
      templateId,
      pageSize = "A4",
      prefix,
      showLogo = true,
      showTaxNumber = true,
      headerText,
      footerText,
      termsAndConditions,
    } = body;

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId || !documentType || !templateId) {
      return formatResponse(false, null, "companyId, documentType, and templateId are required", 400);
    }

    const updated = await prisma.documentTemplateSetting.upsert({
      where: {
        companyId_documentType: {
          companyId: targetCompanyId,
          documentType: documentType as DocumentType,
        },
      },
      create: {
        companyId: targetCompanyId,
        documentType: documentType as DocumentType,
        templateId,
        pageSize,
        prefix: prefix || null,
        showLogo,
        showTaxNumber,
        headerText: headerText || null,
        footerText: footerText || null,
        termsAndConditions: termsAndConditions || null,
      },
      update: {
        templateId,
        pageSize,
        ...(prefix !== undefined && { prefix }),
        ...(showLogo !== undefined && { showLogo }),
        ...(showTaxNumber !== undefined && { showTaxNumber }),
        ...(headerText !== undefined && { headerText }),
        ...(footerText !== undefined && { footerText }),
        ...(termsAndConditions !== undefined && { termsAndConditions }),
      },
    });

    return formatResponse(true, updated, "Document template setting saved successfully", 200);
  } catch (error: any) {
    console.error("Document settings save error:", error);
    return formatResponse(false, null, error?.message || "Failed to save settings", 500);
  }
}
