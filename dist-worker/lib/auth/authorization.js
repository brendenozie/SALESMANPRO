"use strict";
/**
 * Account role (User.role) is not interchangeable with consumer records
 * or tenant membership. Dashboard access requires an explicit operator role
 * or a tenant relationship — never "is logged in" or "has a consumer row".
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConsumerOnlyAccount = exports.canAccessCompanyAdmin = exports.canAccessDashboard = exports.isAccountActive = exports.isEmailVerifiedForAccess = exports.hasDashboardRole = exports.normalizeRole = exports.CONSUMER_ACCOUNT_ROLES = exports.DASHBOARD_ROLES = void 0;
exports.DASHBOARD_ROLES = new Set([
    "ADMIN",
    "SUPER_ADMIN",
    "STAFF",
    "STAFF_MEMBER",
    "AGENT",
    "MODERATOR",
    "EDUCATOR",
    "TEACHER",
    "TUTOR",
    "LECTURER",
    "HEADTEACHER",
    "PRINCIPAL",
    "HEAD_OF_SCHOOL",
    "SCHOOL_HEAD",
    "SERVICE_PROVIDER",
]);
exports.CONSUMER_ACCOUNT_ROLES = new Set(["USER", "CONSUMER"]);
function normalizeRole(role) {
    return (role || "USER").toUpperCase();
}
exports.normalizeRole = normalizeRole;
function hasDashboardRole(role) {
    return exports.DASHBOARD_ROLES.has(normalizeRole(role));
}
exports.hasDashboardRole = hasDashboardRole;
/**
 * Legacy rows may have emailVerified = null. Those accounts keep access.
 * Only explicit `false` blocks protected operator surfaces.
 */
function isEmailVerifiedForAccess(emailVerified) {
    return emailVerified !== false;
}
exports.isEmailVerifiedForAccess = isEmailVerifiedForAccess;
function isAccountActive(isActive) {
    return isActive !== false;
}
exports.isAccountActive = isAccountActive;
function canAccessDashboard(user) {
    if (!user)
        return false;
    if (!isAccountActive(user.isActive))
        return false;
    if (!isEmailVerifiedForAccess(user.emailVerified))
        return false;
    if (hasDashboardRole(user.role))
        return true;
    if (user.companyId)
        return true;
    if (user.hasTenantAccess)
        return true;
    return false;
}
exports.canAccessDashboard = canAccessDashboard;
function canAccessCompanyAdmin(opts) {
    const { user, company, staffCompanyId } = opts;
    if (!isAccountActive(user.isActive))
        return false;
    if (!isEmailVerifiedForAccess(user.emailVerified))
        return false;
    if (user.id && company.userId && user.id === company.userId)
        return true;
    if (user.companyId && user.companyId === company.id)
        return true;
    if (staffCompanyId && staffCompanyId === company.id)
        return true;
    return false;
}
exports.canAccessCompanyAdmin = canAccessCompanyAdmin;
function isConsumerOnlyAccount(user) {
    const role = normalizeRole(user.role);
    if (hasDashboardRole(role))
        return false;
    if (user.companyId || user.hasTenantAccess)
        return false;
    return exports.CONSUMER_ACCOUNT_ROLES.has(role) || role === "USER";
}
exports.isConsumerOnlyAccount = isConsumerOnlyAccount;
