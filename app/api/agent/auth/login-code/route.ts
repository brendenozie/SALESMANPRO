import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import {
  normalizeCategory,
  normalizeStaffRole,
  getFeaturesFor,
  getPOSRouteForCategory,
  getDefaultLandingForRole,
} from "@/lib/features/featureRegistry";
import { hashPOSCode } from "@/lib/pos/posStaffService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { loginCode, companySlug } = body;

    const cleanCode = (loginCode || "").trim();
    if (!cleanCode) {
      return formatResponse(false, null, "Login code is required", 400);
    }

    const hashedCode = hashPOSCode(cleanCode);

    // Optional company scoping if companySlug provided
    let scopedCompanyId: string | undefined = undefined;
    if (companySlug) {
      const company = await prisma.company.findUnique({
        where: { slug: companySlug },
        select: { id: true },
      });
      if (company) {
        scopedCompanyId = company.id;
      }
    }

    // 1. Look up StaffProfile
    const staff = await prisma.staffProfile.findFirst({
      where: {
        ...(scopedCompanyId ? { companyId: scopedCompanyId } : {}),
        OR: [{ codeHash: hashedCode }, { loginCode: cleanCode }],
      },
      include: {
        user: true,
        company: true,
      },
    });

    let user: any = null;
    let company: any = null;
    let role = "STAFF";
    let jobTitle = "Staff Member";
    let permissions: string[] = [];
    let staffProfileId: string | undefined = undefined;
    let salesAgentId: string | undefined = undefined;

    if (staff) {
      if (staff.employmentStatus !== "ACTIVE") {
        return formatResponse(false, null, "Access denied: Staff profile is inactive or disabled", 403);
      }
      if (staff.codeExpiresAt && staff.codeExpiresAt < new Date()) {
        return formatResponse(false, null, "Access denied: Staff login code has expired", 403);
      }
      if (!staff.user || staff.user.isActive === false || staff.user.deletedAt !== null) {
        return formatResponse(false, null, "Access denied: User account is inactive or disabled", 403);
      }

      user = staff.user;
      company = staff.company;
      jobTitle = staff.jobTitle || "Staff Member";
      role = normalizeStaffRole({
        userRole: staff.user.role,
        posRole: staff.posRole,
        jobTitle: staff.jobTitle,
      });
      permissions = staff.posPermissions && staff.posPermissions.length > 0 ? staff.posPermissions : ["POS_ACCESS"];
      staffProfileId = staff.id;

      // Update last used timestamp
      await prisma.staffProfile.update({
        where: { id: staff.id },
        data: { codeLastUsedAt: new Date() },
      }).catch(() => null);
    } else {
      // 2. Look up SalesAgent
      const salesAgent = await prisma.salesAgent.findFirst({
        where: {
          loginCode: cleanCode,
          ...(scopedCompanyId ? { companyId: scopedCompanyId } : {}),
        },
        include: {
          user: true,
          company: true,
        },
      });

      if (salesAgent) {
        if (!salesAgent.isActive) {
          return formatResponse(false, null, "Access denied: Sales agent account is inactive", 403);
        }
        if (!salesAgent.user || salesAgent.user.isActive === false || salesAgent.user.deletedAt !== null) {
          return formatResponse(false, null, "Access denied: User account is inactive or disabled", 403);
        }

        user = salesAgent.user;
        company = salesAgent.company;
        jobTitle = "Sales Agent";
        role = "SALES_AGENT";
        salesAgentId = salesAgent.id;
      }
    }

    if (!user || !company) {
      return formatResponse(false, null, "Invalid staff login code", 401);
    }

    const category = normalizeCategory(company.category, company.variant);
    const features = getFeaturesFor(category, role, permissions);
    const posRoute = getPOSRouteForCategory(category, company.slug);
    const landingUrl = getDefaultLandingForRole(category, role, company.slug);
    const allowedPages = features
      .map((f) => (f.agentRoute ? f.agentRoute.replace("{slug}", company.slug) : null))
      .filter(Boolean) as string[];

    return formatResponse(
      true,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
          jobTitle,
        },
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          category,
          currency: company.currency || "KES",
          logoUrl: company.logoUrl,
        },
        role,
        jobTitle,
        category,
        landingUrl,
        posRoute,
        allowedPages,
        features: features.map((f) => ({
          id: f.id,
          title: f.title,
          route: f.agentRoute?.replace("{slug}", company.slug),
          capabilities: f.capabilities,
          pos: f.pos,
        })),
        staffProfileId,
        salesAgentId,
      },
      "Staff authenticated successfully",
      200
    );
  } catch (error: any) {
    console.error("[AGENT_LOGIN_CODE_ERROR]", error);
    return formatResponse(false, null, error.message || "Staff login failed", 500);
  }
}
