"use strict";
/**
 * lib/ai/mascot/contextResolver.ts
 *
 * Context & Scope Resolver for the SalesmanPro AI Mascot.
 * Enforces strict multi-tenant boundaries, prevents unauthorized scope crossing,
 * derives enabled modules from CATEGORY_MENUS, and computes real-time credits.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MascotContextResolver = void 0;
const next_auth_1 = require("next-auth");
const auth_1 = require("@/lib/auth");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const capabilityRegistry_1 = require("./capabilityRegistry");
const settingsService_1 = require("./settingsService");
const creditLedger_1 = require("@/lib/ai/creditLedger");
const authorization_1 = require("@/lib/auth/authorization");
class MascotContextResolver {
    /**
     * Authoritatively resolves the full MascotContext for an active session.
     * Throws if unauthenticated, tenant-isolated, or consumer-only.
     */
    static async resolveContext(params) {
        const session = (await (0, next_auth_1.getServerSession)(auth_1.authOptions));
        if (!session?.user?.id || !session?.user?.email) {
            throw new Error("Authentication required to access SalesmanPro AI Mascot.");
        }
        // 1. Fetch user record with company relations
        const user = await prismadb_1.default.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                companyId: true,
                isActive: true,
                emailVerified: true,
            },
        });
        if (!user || user.isActive === false) {
            throw new Error("User account is inactive or disabled.");
        }
        const normUserRole = (0, authorization_1.normalizeRole)(user.role);
        // 2. Strict isolation: Consumer-only / marketplace public users are NEVER granted mascot access!
        if ((0, authorization_1.isConsumerOnlyAccount)({ id: user.id, role: user.role, companyId: user.companyId })) {
            throw new Error("Marketplace consumers and public buyers are not authorized to use the SalesmanPro business mascot.");
        }
        const isSuperAdmin = normUserRole === "SUPER_ADMIN";
        // 3. Resolve Company / Store Tenant Scope
        let targetCompanyId = params.companyId || user.companyId;
        // If companyId was explicitly requested via params or query, verify authorization
        if (params.companyId && params.companyId !== user.companyId && !isSuperAdmin) {
            const staff = await prismadb_1.default.staffProfile.findUnique({
                where: { userId: user.id },
                select: { companyId: true },
            });
            const company = await prismadb_1.default.company.findUnique({
                where: { id: params.companyId },
                select: { id: true, userId: true },
            });
            const hasAccess = company && (0, authorization_1.canAccessCompanyAdmin)({
                user: {
                    id: user.id,
                    role: user.role,
                    companyId: user.companyId,
                    emailVerified: user.emailVerified,
                    isActive: user.isActive,
                },
                company: { id: company.id, userId: company.userId },
                staffCompanyId: staff?.companyId,
            });
            if (!hasAccess) {
                throw new Error("Access denied: You do not have permission to access the requested store's AI assistant.");
            }
            targetCompanyId = params.companyId;
        }
        // If still no companyId, find any company owned by user
        if (!targetCompanyId) {
            const ownedCompany = await prismadb_1.default.company.findFirst({
                where: { userId: user.id, deletedAt: null },
                select: { id: true },
            });
            if (ownedCompany) {
                targetCompanyId = ownedCompany.id;
            }
        }
        if (!targetCompanyId && !isSuperAdmin) {
            throw new Error("No active store tenant found for this account. Please select or initialize your store.");
        }
        // 4. Load Company Details & Category
        let company = null;
        if (targetCompanyId) {
            company = await prismadb_1.default.company.findUnique({
                where: { id: targetCompanyId },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    category: true,
                    variant: true,
                },
            });
        }
        const storeCategory = company?.category || "E-commerce";
        const storeVariant = company?.variant || "Standard";
        const storeName = company?.name || (isSuperAdmin ? "SalesmanPro Platform" : "Store");
        const storeSlug = company?.slug || (isSuperAdmin ? "platform" : "store");
        // 5. Query Real-Time Credit Balance
        const aiCreditBalance = targetCompanyId ? await creditLedger_1.creditLedger.getBalance(targetCompanyId) : 0;
        // 6. Fetch Mascot Store Settings
        const settings = targetCompanyId
            ? await settingsService_1.MascotSettingsService.getSettings(targetCompanyId)
            : { enabled: true, moduleToggles: {}, roleRestrictions: {} };
        // 7. Derive Enabled Modules
        const enabledModules = this.deriveEnabledModules(storeCategory);
        // 8. Build Authoritative MascotContext
        const context = {
            userId: user.id,
            userEmail: user.email,
            userName: user.name || "Authorized User",
            userRole: normUserRole,
            companyId: targetCompanyId || "platform",
            companyName: storeName,
            storeSlug,
            storeCategory,
            storeVariant,
            currentPath: params.currentPath || `/admin/${storeSlug}`,
            enabledModules,
            aiCreditBalance,
            mascotEnabled: settings.enabled,
            isSuperAdmin,
            isPlatformScope: isSuperAdmin && !targetCompanyId,
        };
        // 9. Compute Authorized Capabilities for this user, category, and role
        const authorizedCapabilities = capabilityRegistry_1.MascotCapabilityRegistry.getAuthorizedCapabilities({
            userRole: normUserRole,
            storeCategory,
            enabledModules,
            isSuperAdmin,
            moduleToggles: settings.moduleToggles,
            roleRestrictions: settings.roleRestrictions,
        });
        // 10. Generate Context-Aware Suggested Actions
        const suggestedActions = this.computeSuggestedActions(context.currentPath, storeCategory, authorizedCapabilities);
        return {
            context,
            authorizedCapabilities,
            suggestedActions,
        };
    }
    /**
     * Maps store category to enabled business modules.
     */
    static deriveEnabledModules(category) {
        const c = (category || "").toLowerCase();
        const baseModules = [
            "products",
            "inventory",
            "orders",
            "pricing",
            "finance",
            "messaging",
            "marketing",
            "staff",
            "system",
        ];
        if (c.includes("school") || c.includes("tutor") || c.includes("education") || c.includes("student")) {
            return ["education", "finance", "messaging", "staff", "system"];
        }
        if (c.includes("restaurant") || c.includes("food") || c.includes("cake")) {
            return [...baseModules, "restaurant"];
        }
        if (c.includes("property") || c.includes("real estate")) {
            return ["property", "finance", "messaging", "marketing", "staff", "system"];
        }
        if (c.includes("service") || c.includes("booking") || c.includes("appointment")) {
            return ["service", "finance", "messaging", "marketing", "staff", "system"];
        }
        // Default retail/e-commerce
        return [...baseModules, "marketplace"];
    }
    /**
     * Computes contextual suggested prompt cards based on user's current dashboard route.
     */
    static computeSuggestedActions(currentPath, category, authorizedCaps) {
        const path = (currentPath || "").toLowerCase();
        const suggestions = [];
        // Filter helper
        const hasCap = (id) => authorizedCaps.some((c) => c.id === id || c.capability === id);
        if (path.includes("inventory") || path.includes("stock")) {
            if (hasCap("inventory:check_stock_levels")) {
                suggestions.push("Which products are low in stock?");
                suggestions.push("What items should I reorder today?");
            }
            if (hasCap("products:create_product")) {
                suggestions.push("Add a new product to inventory");
            }
        }
        else if (path.includes("product") || path.includes("catalog")) {
            if (hasCap("pricing:bulk_price_adjustment")) {
                suggestions.push("Adjust pricing for this category");
            }
            if (hasCap("marketplace:publish_listings")) {
                suggestions.push("Check products not yet listed on Ghuba");
            }
            if (hasCap("products:create_product")) {
                suggestions.push("Add new product with specifications");
            }
        }
        else if (path.includes("order") || path.includes("sales") || path.includes("pos")) {
            if (hasCap("orders:view_orders")) {
                suggestions.push("Show today's sales and order count");
                suggestions.push("Find unfulfilled or delayed orders");
            }
            if (hasCap("finance:prepare_invoice")) {
                suggestions.push("Prepare customer invoice");
            }
        }
        else if (path.includes("finance") || path.includes("revenue") || path.includes("report")) {
            if (hasCap("finance:view_business_report")) {
                suggestions.push("Explain this month's revenue performance");
                suggestions.push("Compare sales to previous period");
            }
            if (hasCap("finance:record_expense")) {
                suggestions.push("Log store operating expense");
            }
        }
        else if (path.includes("student") || path.includes("school") || path.includes("class")) {
            if (hasCap("education:view_student_records")) {
                suggestions.push("Show students needing academic follow up");
                suggestions.push("Check class attendance report");
            }
            if (hasCap("education:generate_student_report")) {
                suggestions.push("Generate term report cards for class");
            }
        }
        else if (path.includes("marketing") || path.includes("campaign") || path.includes("ad")) {
            if (hasCap("marketing:plan_ad_campaign")) {
                suggestions.push("Plan marketing campaign for new products");
            }
            if (hasCap("marketing:create_social_post")) {
                suggestions.push("Draft Facebook & Instagram posts");
            }
        }
        else {
            // General Dashboard Home suggestions
            if (hasCap("finance:view_business_report")) {
                suggestions.push("How did our store perform this month?");
            }
            if (hasCap("inventory:check_stock_levels")) {
                suggestions.push("Check low stock alerts");
            }
            if (hasCap("orders:view_orders")) {
                suggestions.push("Show today's order summary");
            }
            if (hasCap("marketing:create_social_post")) {
                suggestions.push("Draft today's promotional social post");
            }
        }
        return suggestions.slice(0, 4);
    }
}
exports.MascotContextResolver = MascotContextResolver;
