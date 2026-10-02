"use strict";
/**
 * lib/notifications/recipientResolver.ts
 *
 * Authoritatively resolves eligible user IDs for a given notification event
 * based on role, company tenancy, store assignment, staff profiles, and preferences.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipientResolver = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
class RecipientResolver {
    /**
     * Resolves list of eligible user IDs who should receive this notification.
     */
    static async resolveRecipients(event) {
        const { companyId, recipientPolicy, severity, eventType } = event;
        const resolvedUserIds = new Set();
        // If explicit userIds were provided on any policy, include them
        if (recipientPolicy?.userIds && recipientPolicy.userIds.length > 0) {
            recipientPolicy.userIds.forEach((id) => {
                if (/^[0-9a-fA-F]{24}$/.test(id)) {
                    resolvedUserIds.add(id);
                }
            });
        }
        if (recipientPolicy?.type) {
            switch (recipientPolicy.type) {
                case "SPECIFIC_USERS": {
                    // Already added above
                    break;
                }
                case "SUPER_ADMINS": {
                    const superAdmins = await prismadb_1.default.user.findMany({
                        where: { role: "SUPER_ADMIN", isActive: true },
                        select: { id: true },
                    });
                    superAdmins.forEach((u) => resolvedUserIds.add(u.id));
                    break;
                }
                case "COMPANY_ADMINS":
                case "STORE_ADMINS": {
                    if (companyId) {
                        // 1. Company owner
                        const company = await prismadb_1.default.company.findUnique({
                            where: { id: companyId },
                            select: { userId: true },
                        });
                        if (company?.userId) {
                            resolvedUserIds.add(company.userId);
                        }
                        // 2. Users belonging to company with ADMIN or SUPER_ADMIN role
                        const admins = await prismadb_1.default.user.findMany({
                            where: {
                                companyId,
                                role: { in: ["ADMIN", "SUPER_ADMIN"] },
                                isActive: true,
                            },
                            select: { id: true },
                        });
                        admins.forEach((u) => resolvedUserIds.add(u.id));
                        // 3. Staff profiles with posRole == 'MANAGER' or 'ADMIN'
                        const staffManagers = await prismadb_1.default.staffProfile.findMany({
                            where: {
                                companyId,
                                posRole: { in: ["MANAGER", "ADMIN", "SUPERVISOR"] },
                                employmentStatus: "ACTIVE",
                            },
                            select: { userId: true },
                        });
                        staffManagers.forEach((s) => {
                            if (s.userId)
                                resolvedUserIds.add(s.userId);
                        });
                    }
                    break;
                }
                case "STORE_ROLE": {
                    if (companyId && recipientPolicy.role) {
                        const matchingStaff = await prismadb_1.default.staffProfile.findMany({
                            where: {
                                companyId,
                                posRole: recipientPolicy.role.toUpperCase(),
                                employmentStatus: "ACTIVE",
                            },
                            select: { userId: true },
                        });
                        matchingStaff.forEach((s) => {
                            if (s.userId)
                                resolvedUserIds.add(s.userId);
                        });
                    }
                    break;
                }
                case "DEPARTMENT": {
                    if (companyId && recipientPolicy.department) {
                        const matchingDept = await prismadb_1.default.staffProfile.findMany({
                            where: {
                                companyId,
                                department: recipientPolicy.department,
                                employmentStatus: "ACTIVE",
                            },
                            select: { userId: true },
                        });
                        matchingDept.forEach((s) => {
                            if (s.userId)
                                resolvedUserIds.add(s.userId);
                        });
                    }
                    break;
                }
                case "STORE_STAFF": {
                    if (companyId) {
                        const allStaff = await prismadb_1.default.staffProfile.findMany({
                            where: { companyId, employmentStatus: "ACTIVE" },
                            select: { userId: true },
                        });
                        allStaff.forEach((s) => {
                            if (s.userId)
                                resolvedUserIds.add(s.userId);
                        });
                        // Also include company admins
                        const admins = await prismadb_1.default.user.findMany({
                            where: { companyId, role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true },
                            select: { id: true },
                        });
                        admins.forEach((u) => resolvedUserIds.add(u.id));
                    }
                    break;
                }
            }
        }
        // Apply explicit exclusions
        if (recipientPolicy?.excludeUserIds) {
            recipientPolicy.excludeUserIds.forEach((id) => resolvedUserIds.delete(id));
        }
        if (resolvedUserIds.size === 0) {
            return [];
        }
        const candidateIds = Array.from(resolvedUserIds);
        // Filter against user notification preferences (Unless severity is CRITICAL)
        if (severity !== "CRITICAL") {
            const preferences = await prismadb_1.default.notificationPreference.findMany({
                where: {
                    userId: { in: candidateIds },
                },
            });
            const mutedUserIds = new Set();
            preferences.forEach((pref) => {
                if (pref.inAppEnabled === false) {
                    mutedUserIds.add(pref.userId);
                }
                else if (pref.mutedEventTypes && pref.mutedEventTypes.includes(eventType)) {
                    mutedUserIds.add(pref.userId);
                }
            });
            return candidateIds.filter((id) => !mutedUserIds.has(id));
        }
        return candidateIds;
    }
}
exports.RecipientResolver = RecipientResolver;
