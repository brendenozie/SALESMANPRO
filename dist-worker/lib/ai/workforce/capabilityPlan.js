"use strict";
/**
 * lib/ai/workforce/capabilityPlan.ts
 *
 * Authoritative Capability-Based Execution Plan for the SalesmanPro AI Agent Workforce.
 * Evaluates store category, enabled modules, external integrations (WhatsApp, Payments, Social),
 * user roles, and credit balances.
 *
 * Rule: Distinguishes agent existence, agent availability, agent health, and agent authorization.
 * Never activates agents indiscriminately across all stores.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkforceCapabilityPlanService = exports.AGENT_CAPABILITY_REQUIREMENTS = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const agentRegistry_1 = require("./agentRegistry");
const types_1 = require("./types");
// Map each Store Agent to its operational domain prerequisites
exports.AGENT_CAPABILITY_REQUIREMENTS = {
    STORE_MANAGER: {
        requiredModules: ["finance", "system"],
        supportedCategories: ["*"],
        minRole: "STAFF",
    },
    SALES_AGENT: {
        requiredModules: ["products", "orders"],
        supportedCategories: ["E-commerce", "Retail", "Automotive", "Supermarket", "Hardware", "Pharmacy", "Fashion"],
        prohibitedActions: ["delete_product", "bulk_price_adjustment", "refund_payment"],
    },
    SUPPORT_AGENT: {
        requiredModules: ["orders", "messaging"],
        supportedCategories: ["*"],
        prohibitedActions: ["delete_order", "unauthorized_refund"],
    },
    MARKETING_MANAGER: {
        requiredModules: ["marketing"],
        supportedCategories: ["*"],
        minRole: "MANAGER",
    },
    SOCIAL_MEDIA_MANAGER: {
        requiredModules: ["marketing"],
        supportedCategories: ["*"],
        requiredIntegrations: ["metaSocial"],
        minRole: "MANAGER",
    },
    INVENTORY_MANAGER: {
        requiredModules: ["inventory", "products"],
        supportedCategories: ["E-commerce", "Retail", "Automotive", "Supermarket", "Hardware", "Pharmacy", "Fashion"],
        prohibitedActions: ["delete_all_inventory"],
    },
    BUSINESS_ANALYST: {
        requiredModules: ["finance"],
        supportedCategories: ["*"],
        minRole: "MANAGER",
    },
    RETENTION_AGENT: {
        requiredModules: ["marketing", "messaging"],
        supportedCategories: ["*"],
        minRole: "MANAGER",
    },
    LEAD_CRM_AGENT: {
        requiredModules: ["messaging"],
        supportedCategories: ["*"],
    },
    STORE_MARKETPLACE_AGENT: {
        requiredModules: ["marketplace"],
        supportedCategories: ["E-commerce", "Retail", "Automotive", "Supermarket", "Hardware", "Fashion"],
    },
    FINANCE_ASSISTANT: {
        requiredModules: ["finance"],
        supportedCategories: ["*"],
        minRole: "MANAGER",
        prohibitedActions: ["initiate_payout", "change_bank_account", "transfer_funds"],
    },
    APPOINTMENT_AGENT: {
        requiredModules: ["service"],
        supportedCategories: ["Services", "Salon", "Fitness", "Healthcare", "Hospitality", "Clinic", "Consulting"],
        prohibitedActions: ["cancel_confirmed_booking_without_notice"],
    },
    STORE_ONBOARDING_AGENT: {
        requiredModules: ["system"],
        supportedCategories: ["*"],
        minRole: "ADMIN",
    },
};
class WorkforceCapabilityPlanService {
    /**
     * Builds an authoritative capability profile for a store tenant.
     */
    static async resolveStoreProfile(companyId, context) {
        const company = await prismadb_1.default.company.findUnique({
            where: { id: companyId },
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                aiCreditBalance: true,
                PaymentSettings: {
                    select: {
                        isMpesaEnabled: true,
                        mpesaShortcode: true,
                        mpesaConsumerKey: true,
                        isStripeEnabled: true,
                        stripePublishableKey: true,
                    },
                },
            },
        });
        if (!company) {
            throw new Error(`Store tenant with companyId '${companyId}' not found.`);
        }
        const category = company.category || "E-commerce";
        const enabledModules = this.deriveModulesForCategory(category);
        // Inspect real database connections for integrations
        const [whatsappAccount, socialAccounts] = await Promise.all([
            prismadb_1.default.whatsAppAccount.findFirst({
                where: { companyId, status: "CONNECTED" },
                select: { id: true },
            }).catch(() => null),
            prismadb_1.default.socialAccount.findFirst({
                where: { companyId, status: "CONNECTED" },
                select: { id: true },
            }).catch(() => null),
        ]);
        const hasMpesa = Boolean(company.PaymentSettings?.isMpesaEnabled ||
            (company.PaymentSettings?.mpesaShortcode && company.PaymentSettings?.mpesaConsumerKey));
        const hasStripe = Boolean(company.PaymentSettings?.isStripeEnabled ||
            company.PaymentSettings?.stripePublishableKey);
        return {
            companyId: company.id,
            storeSlug: company.slug,
            storeName: company.name,
            category,
            enabledModules,
            connectedIntegrations: {
                whatsapp: Boolean(whatsappAccount),
                mpesa: hasMpesa,
                stripe: hasStripe,
                metaSocial: Boolean(socialAccounts),
            },
            creditBalance: company.aiCreditBalance ?? 0,
            userRole: context?.userRole || "ADMIN",
            isSuperAdmin: Boolean(context?.isSuperAdmin),
        };
    }
    /**
     * Evaluates operational capability and readiness for a specific agent in a store.
     */
    static async evaluateAgent(agentKey, profile) {
        const agentDef = agentRegistry_1.WorkforceAgentRegistry.getAgent(agentKey);
        if (!agentDef) {
            return {
                agentKey,
                agentName: agentKey,
                level: types_1.AgentWorkforceLevel.STORE,
                state: "NOT_APPLICABLE",
                isExecutable: false,
                reason: `Agent '${agentKey}' is not registered in the agent catalog.`,
                missingDependencies: [],
                requiredModules: [],
                supportedCategories: [],
            };
        }
        // Platform and Marketplace agents are handled by SuperAdmin platform controls
        if (agentDef.level !== types_1.AgentWorkforceLevel.STORE) {
            const isSuper = profile.isSuperAdmin || profile.userRole === "SUPER_ADMIN";
            return {
                agentKey,
                agentName: agentDef.name,
                level: agentDef.level,
                state: isSuper ? "ACTIVE" : "UNAUTHORIZED",
                isExecutable: isSuper,
                reason: isSuper
                    ? `Platform Growth / Marketplace Liquidity agent available for system governance.`
                    : `Only Super Administrators can execute Platform / Marketplace agents.`,
                missingDependencies: [],
                requiredModules: [],
                supportedCategories: ["*"],
            };
        }
        const reqs = exports.AGENT_CAPABILITY_REQUIREMENTS[agentKey];
        if (!reqs) {
            // Unrestricted store agent
            return {
                agentKey,
                agentName: agentDef.name,
                level: agentDef.level,
                state: "ACTIVE",
                isExecutable: true,
                reason: "Agent ready for store operations.",
                missingDependencies: [],
                requiredModules: [],
                supportedCategories: ["*"],
            };
        }
        // 1. Check Store Category Support
        if (!reqs.supportedCategories.includes("*")) {
            const catLower = profile.category.toLowerCase();
            const isCatSupported = reqs.supportedCategories.some((sc) => sc.toLowerCase() === catLower || catLower.includes(sc.toLowerCase()));
            if (!isCatSupported) {
                return {
                    agentKey,
                    agentName: agentDef.name,
                    level: agentDef.level,
                    state: "NOT_APPLICABLE",
                    isExecutable: false,
                    reason: `Agent '${agentDef.name}' is designed for [${reqs.supportedCategories.join(", ")}]. Current store category is '${profile.category}'.`,
                    missingDependencies: [],
                    requiredModules: reqs.requiredModules,
                    supportedCategories: reqs.supportedCategories,
                };
            }
        }
        // 2. Check Required Store Modules
        const missingModules = reqs.requiredModules.filter((mod) => !profile.enabledModules.includes(mod));
        if (missingModules.length > 0) {
            return {
                agentKey,
                agentName: agentDef.name,
                level: agentDef.level,
                state: "NOT_APPLICABLE",
                isExecutable: false,
                reason: `Store does not have required module(s): [${missingModules.join(", ")}].`,
                missingDependencies: missingModules,
                requiredModules: reqs.requiredModules,
                supportedCategories: reqs.supportedCategories,
            };
        }
        // 3. Check Required Integrations (e.g. WhatsApp, Social Accounts)
        const missingIntegrations = [];
        let setupUrl = undefined;
        if (reqs.requiredIntegrations) {
            for (const integ of reqs.requiredIntegrations) {
                if (integ === "whatsapp" && !profile.connectedIntegrations.whatsapp) {
                    missingIntegrations.push("WhatsApp Cloud API");
                    setupUrl = `/admin/${profile.storeSlug}/integrations/whatsapp`;
                }
                if (integ === "metaSocial" && !profile.connectedIntegrations.metaSocial) {
                    missingIntegrations.push("Facebook / Instagram Connection");
                    setupUrl = `/admin/${profile.storeSlug}/integrations/social`;
                }
            }
        }
        if (missingIntegrations.length > 0) {
            return {
                agentKey,
                agentName: agentDef.name,
                level: agentDef.level,
                state: "MISSING_DEPENDENCY",
                isExecutable: false,
                reason: `Agent requires configured external integration: ${missingIntegrations.join(", ")}. Please connect your account to activate.`,
                setupUrl,
                missingDependencies: missingIntegrations,
                requiredModules: reqs.requiredModules,
                supportedCategories: reqs.supportedCategories,
            };
        }
        // 4. Check Role Permissions
        if (reqs.minRole && profile.userRole) {
            const roleHierarchy = {
                STAFF: 1,
                AGENT: 2,
                SALES_AGENT: 2,
                MANAGER: 3,
                ADMIN: 4,
                SUPER_ADMIN: 5,
            };
            const userLevel = roleHierarchy[profile.userRole.toUpperCase()] || 1;
            const minLevel = roleHierarchy[reqs.minRole.toUpperCase()] || 1;
            if (userLevel < minLevel) {
                return {
                    agentKey,
                    agentName: agentDef.name,
                    level: agentDef.level,
                    state: "UNAUTHORIZED",
                    isExecutable: false,
                    reason: `Requires minimum role of '${reqs.minRole}'. Your role is '${profile.userRole}'.`,
                    missingDependencies: [],
                    requiredModules: reqs.requiredModules,
                    supportedCategories: reqs.supportedCategories,
                };
            }
        }
        // 5. Check Credit Balance
        if (profile.creditBalance <= 0) {
            return {
                agentKey,
                agentName: agentDef.name,
                level: agentDef.level,
                state: "INSUFFICIENT_CREDITS",
                isExecutable: false,
                reason: `AI credit balance is exhausted (${profile.creditBalance} credits). Non-deterministic agent reasoning requires a credit balance. Top up credits in Settings.`,
                setupUrl: `/admin/${profile.storeSlug}/settings/ai`,
                missingDependencies: ["AI Credits"],
                requiredModules: reqs.requiredModules,
                supportedCategories: reqs.supportedCategories,
            };
        }
        // 6. Check if store explicitly disabled the agent in AIAgent DB table
        const agentRecord = await prismadb_1.default.aIAgent.findFirst({
            where: {
                agentKey,
                companyId: profile.companyId,
            },
            select: { enabled: true },
        });
        if (agentRecord && agentRecord.enabled === false) {
            return {
                agentKey,
                agentName: agentDef.name,
                level: agentDef.level,
                state: "DISABLED",
                isExecutable: false,
                reason: `Agent is paused or disabled by store administrator.`,
                setupUrl: `/admin/${profile.storeSlug}/ai-workforce`,
                missingDependencies: [],
                requiredModules: reqs.requiredModules,
                supportedCategories: reqs.supportedCategories,
            };
        }
        return {
            agentKey,
            agentName: agentDef.name,
            level: agentDef.level,
            state: "ACTIVE",
            isExecutable: true,
            reason: "Agent ready for authoritative store operations.",
            missingDependencies: [],
            requiredModules: reqs.requiredModules,
            supportedCategories: reqs.supportedCategories,
        };
    }
    /**
     * Generates a full execution plan for all store agents for a specific store.
     */
    static async generateStoreExecutionPlan(companyId, context) {
        const profile = await this.resolveStoreProfile(companyId, context);
        const storeAgents = agentRegistry_1.WorkforceAgentRegistry.listAgentsByLevel(types_1.AgentWorkforceLevel.STORE);
        const evaluations = {};
        let activeCount = 0;
        let missingDependencyCount = 0;
        let notApplicableCount = 0;
        for (const agent of storeAgents) {
            const evalResult = await this.evaluateAgent(agent.key, profile);
            evaluations[agent.key] = evalResult;
            if (evalResult.state === "ACTIVE")
                activeCount++;
            else if (evalResult.state === "MISSING_DEPENDENCY")
                missingDependencyCount++;
            else if (evalResult.state === "NOT_APPLICABLE")
                notApplicableCount++;
        }
        return {
            profile,
            agents: evaluations,
            activeCount,
            missingDependencyCount,
            notApplicableCount,
        };
    }
    static deriveModulesForCategory(category) {
        const c = (category || "").toLowerCase();
        const baseModules = ["products", "inventory", "orders", "pricing", "finance", "messaging", "marketing", "staff", "website", "system"];
        if (c.includes("school") || c.includes("education") || c.includes("tutor")) {
            return ["education", "finance", "messaging", "staff", "website", "system"];
        }
        if (c.includes("property") || c.includes("real estate")) {
            return ["property", "finance", "messaging", "marketing", "staff", "website", "system"];
        }
        if (c.includes("service") || c.includes("salon") || c.includes("clinic") || c.includes("fitness") || c.includes("hospitality")) {
            return ["service", "finance", "messaging", "marketing", "staff", "website", "system"];
        }
        return [...baseModules, "marketplace"];
    }
}
exports.WorkforceCapabilityPlanService = WorkforceCapabilityPlanService;
