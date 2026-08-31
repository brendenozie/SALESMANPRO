/**
 * Account role (User.role) is not interchangeable with consumer records
 * or tenant membership. Dashboard access requires an explicit operator role
 * or a tenant relationship — never "is logged in" or "has a consumer row".
 */

export const DASHBOARD_ROLES = new Set([
  "ADMIN",
  "STAFF",
  "STAFF_MEMBER",
  "AGENT",
  "MODERATOR",
  "EDUCATOR",
  "HEADTEACHER",
  "SERVICE_PROVIDER",
]);

export const CONSUMER_ACCOUNT_ROLES = new Set(["USER", "CONSUMER"]);

export type AccessUser = {
  id?: string | null;
  role?: string | null;
  companyId?: string | null;
  emailVerified?: boolean | null;
  isActive?: boolean | null;
  hasTenantAccess?: boolean | null;
};

export function normalizeRole(role?: string | null): string {
  return (role || "USER").toUpperCase();
}

export function hasDashboardRole(role?: string | null): boolean {
  return DASHBOARD_ROLES.has(normalizeRole(role));
}

/**
 * Legacy rows may have emailVerified = null. Those accounts keep access.
 * Only explicit `false` blocks protected operator surfaces.
 */
export function isEmailVerifiedForAccess(emailVerified?: boolean | null): boolean {
  return emailVerified !== false;
}

export function isAccountActive(isActive?: boolean | null): boolean {
  return isActive !== false;
}

export function canAccessDashboard(user: AccessUser | null | undefined): boolean {
  if (!user) return false;
  if (!isAccountActive(user.isActive)) return false;
  if (!isEmailVerifiedForAccess(user.emailVerified)) return false;
  if (hasDashboardRole(user.role)) return true;
  if (user.companyId) return true;
  if (user.hasTenantAccess) return true;
  return false;
}

export function canAccessCompanyAdmin(opts: {
  user: AccessUser;
  company: { id: string; userId?: string | null };
  staffCompanyId?: string | null;
}): boolean {
  const { user, company, staffCompanyId } = opts;
  if (!isAccountActive(user.isActive)) return false;
  if (!isEmailVerifiedForAccess(user.emailVerified)) return false;
  if (user.id && company.userId && user.id === company.userId) return true;
  if (user.companyId && user.companyId === company.id) return true;
  if (staffCompanyId && staffCompanyId === company.id) return true;
  return false;
}

export function isConsumerOnlyAccount(user: AccessUser): boolean {
  const role = normalizeRole(user.role);
  if (hasDashboardRole(role)) return false;
  if (user.companyId || user.hasTenantAccess) return false;
  return CONSUMER_ACCOUNT_ROLES.has(role) || role === "USER";
}
