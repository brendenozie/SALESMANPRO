import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { findCompanyCached } from "@/lib/company-fetcher";
import {
  normalizeCategory,
  normalizeStaffRole,
  getFeaturesFor,
  isAgentPathAllowed,
  getPOSRouteForCategory,
  getDefaultLandingForRole,
  FeatureDefinition,
} from "@/lib/features/featureRegistry";
import { redirect } from "next/navigation";

export interface ResolvedAgentContext {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    image?: string | null;
  };
  company: {
    id: string;
    name: string;
    slug: string;
    category: string;
    variant?: string | null;
    logoUrl?: string | null;
    currency: string;
  };
  category: string;
  role: string;
  jobTitle: string;
  loginCode?: string | null;
  permissions: string[];
  features: FeatureDefinition[];
  posRoute: string;
  defaultLanding: string;
  isOwnerOrAdmin: boolean;
  staffProfileId?: string;
  salesAgentId?: string;
}

/**
 * Server-side resolver for agent/staff authentication and tenancy.
 * Enforces company boundary, active employment status, and resolves permissions.
 */
export async function resolveAgentContext(slug: string): Promise<ResolvedAgentContext | null> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const user = session.user as any;

  if (user.isActive === false) {
    return null;
  }

  const company = await findCompanyCached(slug, "page");
  if (!company) {
    return null;
  }

  const isOwner = company.userId === userId;
  const isTenantAdmin = user.role === "ADMIN" && user.companyId === company.id;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  // Check StaffProfile
  const staff = await prisma.staffProfile.findFirst({
    where: {
      userId,
      companyId: company.id,
    },
  });

  // Check SalesAgent
  const salesAgent = await prisma.salesAgent.findFirst({
    where: {
      userId,
      companyId: company.id,
    },
  });

  // If not owner, admin, active staff, or active sales agent, deny access
  if (!isOwner && !isTenantAdmin && !isSuperAdmin) {
    if (!staff && !salesAgent) {
      return null;
    }
    if (staff && staff.employmentStatus !== "ACTIVE") {
      return null;
    }
    if (salesAgent && !salesAgent.isActive) {
      return null;
    }
  }

  const category = normalizeCategory(company.category, company.variant);

  const role = normalizeStaffRole({
    userRole: isOwner || isTenantAdmin ? "ADMIN" : user.role,
    posRole: staff?.posRole,
    jobTitle: staff?.jobTitle,
    isSalesAgent: Boolean(salesAgent),
  });

  const permissions: string[] = [];
  if (staff?.posPermissions && Array.isArray(staff.posPermissions)) {
    permissions.push(...staff.posPermissions);
  }
  if (isOwner || isTenantAdmin || isSuperAdmin) {
    permissions.push("all");
  }

  const features = getFeaturesFor(category, role, permissions);
  const posRoute = getPOSRouteForCategory(category, company.slug);
  const defaultLanding = getDefaultLandingForRole(category, role, company.slug);

  return {
    user: {
      id: userId,
      email: user.email,
      name: user.name || staff?.jobTitle || "Agent Operator",
      role: user.role,
      image: user.image,
    },
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      category: company.category || "E-commerce",
      variant: company.variant,
      logoUrl: company.logoUrl,
      currency: company.currency || "KES",
    },
    category,
    role,
    jobTitle: staff?.jobTitle || (salesAgent ? "Sales Agent" : isOwner ? "Store Owner" : "Staff Member"),
    loginCode: staff?.loginCode || salesAgent?.loginCode || null,
    permissions,
    features,
    posRoute,
    defaultLanding,
    isOwnerOrAdmin: isOwner || isTenantAdmin || isSuperAdmin,
    staffProfileId: staff?.id,
    salesAgentId: salesAgent?.id,
  };
}

/**
 * Server Component Route Guard:
 * Asserts that the authenticated staff/agent is authorized to view the requested section.
 * Redirects to unauthorized or login if not permitted.
 */
export async function assertAgentRouteAccess(
  slug: string,
  section: string = "dashboard"
): Promise<ResolvedAgentContext> {
  const context = await resolveAgentContext(slug);

  if (!context) {
    redirect(
      `https://auth.salesmanpro.site/signin?callbackUrl=${encodeURIComponent(
        `https://salesmanpro.site/agents/${slug}/${section}`
      )}`
    );
  }

  // Check section access
  const isAllowed = isAgentPathAllowed(
    `/agents/${slug}/${section}`,
    context.category,
    context.role,
    context.permissions
  );

  if (!isAllowed) {
    redirect(`/unauthorized?reason=insufficient_agent_permissions&feature=${encodeURIComponent(section)}`);
  }

  return context;
}

/**
 * API Route Guard:
 * Asserts that the request comes from an authorized agent/staff member for the company.
 */
export async function assertAgentApiAccess(
  req: Request,
  opts: {
    slug?: string | null;
    companyId?: string | null;
    requiredCapability?: string;
  }
): Promise<
  | { success: true; context: ResolvedAgentContext }
  | { success: false; status: number; error: string }
> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { success: false, status: 401, error: "Authentication required" };
  }

  let targetSlug = opts.slug;
  if (!targetSlug && opts.companyId) {
    const comp = await prisma.company.findUnique({
      where: { id: opts.companyId },
      select: { slug: true },
    });
    targetSlug = comp?.slug;
  }

  if (!targetSlug) {
    return { success: false, status: 400, error: "Company context (slug or companyId) is required" };
  }

  const context = await resolveAgentContext(targetSlug);
  if (!context) {
    return { success: false, status: 403, error: "Access denied: Unauthorized agent or company mismatch" };
  }

  if (opts.requiredCapability) {
    const hasCapability =
      context.isOwnerOrAdmin ||
      context.permissions.includes("all") ||
      context.permissions.includes(opts.requiredCapability) ||
      context.features.some((f) => f.capabilities.includes(opts.requiredCapability!));

    if (!hasCapability) {
      return {
        success: false,
        status: 403,
        error: `Access denied: Missing required capability '${opts.requiredCapability}'`,
      };
    }
  }

  return { success: true, context };
}
