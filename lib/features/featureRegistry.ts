import rawFeatureMap from "@/docs/architecture/feature-map.json";

export type FeatureStatus = "active" | "read_only" | "inapplicable" | "planned";

export interface CategoryDefinition {
  id: string;
  name: string;
  aliases: string[];
  defaultPOS: "StorePOS" | "ServicePOS" | "FitnessPOS" | "RestaurantPOS" | "HealthPOS" | "CompanyPOS";
  posRoute: string;
  defaultAgentWorkspace: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  scope: "platform" | "tenant";
  isStaff: boolean;
  defaultLanding: string;
}

export interface FeatureDefinition {
  id: string;
  title: string;
  description: string;
  category: string[];
  adminRoute: string;
  agentRoute: string | null;
  allowedRoles: string[];
  capabilities: string[];
  allowedActions: string[];
  api: string;
  service: string;
  model: string;
  pos: string;
  adminOnly: boolean;
  status: FeatureStatus;
}

export interface FeatureRegistryData {
  version: string;
  lastUpdated: string;
  categories: CategoryDefinition[];
  roles: RoleDefinition[];
  features: FeatureDefinition[];
}

export const FEATURE_REGISTRY: FeatureRegistryData = rawFeatureMap as unknown as FeatureRegistryData;

/**
 * Normalizes any freeform company category string or variant into a canonical CategoryDefinition ID.
 */
export function normalizeCategory(category?: string | null, variant?: string | null): string {
  if (!category && !variant) return "ecommerce";

  const raw = `${category || ""} ${variant || ""}`.trim().toLowerCase();

  for (const cat of FEATURE_REGISTRY.categories) {
    if (cat.id === raw) return cat.id;
    for (const alias of cat.aliases) {
      if (raw.includes(alias.toLowerCase())) {
        return cat.id;
      }
    }
  }

  // Fallback pattern matching
  if (raw.includes("food") || raw.includes("cafe") || raw.includes("dine") || raw.includes("bake") || raw.includes("bar")) {
    return "restaurant";
  }
  if (raw.includes("gym") || raw.includes("fit") || raw.includes("wellness") || raw.includes("train")) {
    return "fitness";
  }
  if (raw.includes("service") || raw.includes("salon") || raw.includes("spa") || raw.includes("clean") || raw.includes("consult")) {
    return "services";
  }
  if (raw.includes("auto") || raw.includes("motor") || raw.includes("car") || raw.includes("vehicle")) {
    return "automotive";
  }
  if (raw.includes("health") || raw.includes("clinic") || raw.includes("doctor") || raw.includes("medic")) {
    return "healthcare";
  }
  if (raw.includes("school") || raw.includes("educat") || raw.includes("teach") || raw.includes("learn")) {
    return "education";
  }

  return "ecommerce";
}

/**
 * Normalizes staff identity and posRole into standard platform staff roles.
 */
export function normalizeStaffRole(opts: {
  userRole?: string | null;
  posRole?: string | null;
  jobTitle?: string | null;
  isSalesAgent?: boolean;
}): string {
  const { userRole, posRole, jobTitle, isSalesAgent } = opts;
  const userRoleUpper = (userRole || "").toUpperCase();
  const posRoleUpper = (posRole || "").toUpperCase();
  const titleUpper = (jobTitle || "").toUpperCase();

  if (userRoleUpper === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (userRoleUpper === "ADMIN" || titleUpper.includes("OWNER") || titleUpper.includes("DIRECTOR")) {
    return "ADMIN";
  }
  if (
    userRoleUpper === "MANAGER" ||
    posRoleUpper === "MANAGER" ||
    titleUpper.includes("MANAGER") ||
    titleUpper.includes("SUPERVISOR")
  ) {
    return "MANAGER";
  }
  if (posRoleUpper === "CASHIER" || titleUpper.includes("CASHIER") || titleUpper.includes("TELLER")) {
    return "CASHIER";
  }
  if (
    isSalesAgent ||
    userRoleUpper === "AGENT" ||
    posRoleUpper === "SALES_AGENT" ||
    titleUpper.includes("SALES") ||
    titleUpper.includes("AGENT")
  ) {
    return "SALES_AGENT";
  }
  if (
    posRoleUpper === "SERVICE_AGENT" ||
    titleUpper.includes("TECHNICIAN") ||
    titleUpper.includes("THERAPIST") ||
    titleUpper.includes("BARBER") ||
    titleUpper.includes("STYLIST") ||
    titleUpper.includes("SPECIALIST")
  ) {
    return "SERVICE_AGENT";
  }
  if (
    posRoleUpper === "FITNESS_STAFF" ||
    titleUpper.includes("TRAINER") ||
    titleUpper.includes("COACH") ||
    titleUpper.includes("INSTRUCTOR")
  ) {
    return "FITNESS_STAFF";
  }
  if (
    titleUpper.includes("INVENTORY") ||
    titleUpper.includes("WAREHOUSE") ||
    titleUpper.includes("STOREKEEPER") ||
    titleUpper.includes("STOCK")
  ) {
    return "INVENTORY_STAFF";
  }

  return "STAFF";
}

/**
 * Returns all active features available for a given company category, staff role, and permissions.
 */
export function getFeaturesFor(
  categoryId: string,
  roleId: string,
  userPermissions: string[] = []
): FeatureDefinition[] {
  const normCategory = normalizeCategory(categoryId);
  const normRole = roleId.toUpperCase();

  return FEATURE_REGISTRY.features.filter((f) => {
    // If admin-only, block from agent workspace unless admin
    if (f.adminOnly && normRole !== "ADMIN" && normRole !== "SUPER_ADMIN") {
      return false;
    }

    // Category check: supports "all" or specific category ID
    const supportsCategory = f.category.includes("all") || f.category.includes(normCategory);
    if (!supportsCategory) return false;

    // Role check: Admin and SuperAdmin have all features
    if (normRole === "ADMIN" || normRole === "SUPER_ADMIN") return true;

    // Check if role is explicitly in allowedRoles
    const hasRole = f.allowedRoles.includes(normRole);
    if (hasRole) return true;

    // Optional check: explicit capabilities permission grant
    if (userPermissions && userPermissions.length > 0) {
      const hasCap = f.capabilities.some((cap) => userPermissions.includes(cap));
      if (hasCap) return true;
    }

    return false;
  });
}

/**
 * Resolves the category's dedicated POS route.
 */
export function getPOSRouteForCategory(categoryId: string, slug: string): string {
  const normCategory = normalizeCategory(categoryId);
  const cat = FEATURE_REGISTRY.categories.find((c) => c.id === normCategory);
  const route = cat ? cat.posRoute : "/storepos";
  return `/admin/${slug}${route}`;
}

/**
 * Resolves the appropriate default landing page for a staff member.
 */
export function getDefaultLandingForRole(categoryId: string, roleId: string, slug: string): string {
  const normRole = roleId.toUpperCase();
  const normCategory = normalizeCategory(categoryId);

  if (normRole === "CASHIER") {
    // Cashier goes directly to Agent POS or dedicated POS
    return `/agents/${slug}/pos`;
  }
  if (normRole === "SALES_AGENT") {
    return `/agents/${slug}/sales`;
  }
  if (normRole === "SERVICE_AGENT") {
    return `/agents/${slug}/bookings`;
  }
  if (normRole === "FITNESS_STAFF") {
    return `/agents/${slug}/members`;
  }
  if (normRole === "INVENTORY_STAFF") {
    return `/agents/${slug}/inventory`;
  }

  // Category fallback
  const cat = FEATURE_REGISTRY.categories.find((c) => c.id === normCategory);
  if (cat && cat.defaultAgentWorkspace) {
    return `/agents/${slug}${cat.defaultAgentWorkspace}`;
  }

  return `/agents/${slug}/dashboard`;
}

/**
 * Verifies if an agent URL path is authorized for the given category, role, and permissions.
 */
export function isAgentPathAllowed(
  pathname: string,
  categoryId: string,
  roleId: string,
  userPermissions: string[] = []
): boolean {
  const normRole = roleId.toUpperCase();
  if (normRole === "ADMIN" || normRole === "SUPER_ADMIN") return true;

  // Clean pathname to extract the sub-action
  // e.g. /agents/my-store/orders -> orders
  const parts = pathname.split("/").filter(Boolean);
  // Expecting ['agents', 'slug', 'section', ...]
  const section = parts[2] || "dashboard";

  const allowedFeatures = getFeaturesFor(categoryId, normRole, userPermissions);

  return allowedFeatures.some((f) => {
    if (!f.agentRoute) return false;
    const fParts = f.agentRoute.split("/").filter(Boolean);
    const fSection = fParts[2] || "dashboard";
    return fSection === section;
  });
}
