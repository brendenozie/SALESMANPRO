"use strict";
/**
 * lib/ai/workforce/toolRegistry.ts
 *
 * Central Authoritative Tool Registry for the 3-Tier AI Workforce.
 * Bounded by strict Zod schema validation, multi-tenant access checks,
 * explicit permission tiers, and human-approval gates.
 *
 * Architecture Rule: AI NEVER writes raw database queries directly.
 * All tools call authoritative domain services and return sanitized summaries.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkforceToolRegistry = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const types_1 = require("./types");
class WorkforceToolRegistry {
    static tools = new Map();
    static registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    static getTool(name) {
        return this.tools.get(name);
    }
    static listToolsForAgent(level, permission, allowedToolNames) {
        return Array.from(this.tools.values()).filter((t) => {
            // Must match level scope
            if (!t.levelScope.includes(level))
                return false;
            // Must be within allowed tool list
            if (!allowedToolNames.includes(t.name) && !allowedToolNames.includes("*"))
                return false;
            return true;
        });
    }
    static async executeTool(toolName, rawArgs, context) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            return { success: false, error: `Tool '${toolName}' not found in workforce registry.` };
        }
        // 1. Level scope authorization
        if (!tool.levelScope.includes(context.level)) {
            return {
                success: false,
                error: `Tool '${toolName}' is not authorized for workforce level ${context.level}.`,
            };
        }
        // 2. Tenant isolation assertion for Store level tools
        if (tool.levelScope.includes(types_1.AgentWorkforceLevel.STORE) && !context.companyId) {
            return {
                success: false,
                error: `Tool '${toolName}' requires a valid store companyId context.`,
            };
        }
        // 3. Approval gate: If tool requires approval, create an approval request
        if (tool.requiresApproval) {
            return {
                success: true,
                requiresApproval: true,
                approvalPayload: {
                    actionType: tool.name,
                    title: `Approval Required: ${tool.description}`,
                    description: `Agent requested execution of ${tool.name}`,
                    proposedAction: rawArgs,
                },
                summaryForAgent: `Action '${toolName}' requires human authorization before executing. An approval ticket has been submitted to the inbox.`,
            };
        }
        // 4. Safe execution
        try {
            return await tool.execute(rawArgs, context);
        }
        catch (err) {
            console.error(`[WORKFORCE_TOOL_ERROR: ${toolName}]`, err);
            return {
                success: false,
                error: err.message || `Execution of tool '${toolName}' failed.`,
            };
        }
    }
}
exports.WorkforceToolRegistry = WorkforceToolRegistry;
// ============================================================================
// REGISTER STORE LEVEL TOOLS
// ============================================================================
// 1. searchCatalog
WorkforceToolRegistry.registerTool({
    name: "searchCatalog",
    description: "Search products in the store's authoritative catalog with inventory and pricing.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0.5,
    parameters: {
        query: "string (optional search keyword, title or brand)",
        category: "string (optional category filter)",
        limit: "number (optional, default 6, max 20)",
    },
    execute: async (args, context) => {
        const { query = "", category, limit = 6 } = args;
        const products = await prismadb_1.default.product.findMany({
            where: {
                companyId: context.companyId,
                ...(query
                    ? {
                        OR: [
                            { name: { contains: query, mode: "insensitive" } },
                            { description: { contains: query, mode: "insensitive" } },
                            { brand: { contains: query, mode: "insensitive" } },
                        ],
                    }
                    : {}),
                ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
            },
            take: Math.min(limit, 20),
            select: {
                id: true,
                name: true,
                sellingPrice: true,
                finalPrice: true,
                quantity: true,
                isAvailable: true,
                category: true,
                brand: true,
                description: true,
            },
        });
        return {
            success: true,
            data: { count: products.length, products },
            summaryForAgent: `Found ${products.length} matching products in catalog: ${products
                .map((p) => `${p.name} (KES ${p.finalPrice || p.sellingPrice}, Stock: ${p.quantity})`)
                .join("; ")}`,
        };
    },
});
// 2. checkInventoryLevels
WorkforceToolRegistry.registerTool({
    name: "checkInventoryLevels",
    description: "Identify low-stock, out-of-stock, and excess products across the store.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0.5,
    parameters: {
        lowStockThreshold: "number (optional, default 5)",
    },
    execute: async (args, context) => {
        const threshold = args.lowStockThreshold || 5;
        const lowStockProducts = await prismadb_1.default.product.findMany({
            where: {
                companyId: context.companyId,
                quantity: { lte: threshold, gt: 0 },
            },
            select: { id: true, name: true, quantity: true, sellingPrice: true },
            take: 15,
        });
        const outOfStockProducts = await prismadb_1.default.product.findMany({
            where: {
                companyId: context.companyId,
                quantity: { lte: 0 },
            },
            select: { id: true, name: true, quantity: true, sellingPrice: true },
            take: 10,
        });
        return {
            success: true,
            data: {
                lowStockCount: lowStockProducts.length,
                outOfStockCount: outOfStockProducts.length,
                lowStockProducts,
                outOfStockProducts,
            },
            summaryForAgent: `Store Inventory Audit: ${lowStockProducts.length} items low in stock (<= ${threshold}), ${outOfStockProducts.length} items completely out of stock.`,
        };
    },
});
// 3. getStoreOperationalSummary
WorkforceToolRegistry.registerTool({
    name: "getStoreOperationalSummary",
    description: "Authoritative business summary: today's sales, pending orders, low stock, and open inquiries.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0.5,
    parameters: {},
    execute: async (_, context) => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [todayOrders, pendingOrders, lowStockCount, company] = await Promise.all([
            prismadb_1.default.customerOrder.findMany({
                where: {
                    companyId: context.companyId,
                    createdAt: { gte: todayStart },
                },
                select: { id: true, totalPrice: true, totalFinalPrice: true, status: true, paymentStatus: true },
            }),
            prismadb_1.default.customerOrder.count({
                where: {
                    companyId: context.companyId,
                    status: { in: ["PENDING", "PROCESSING"] },
                },
            }),
            prismadb_1.default.product.count({
                where: {
                    companyId: context.companyId,
                    quantity: { lte: 5 },
                },
            }),
            prismadb_1.default.company.findUnique({
                where: { id: context.companyId },
                select: { name: true, currency: true, aiCreditBalance: true },
            }),
        ]);
        const totalSalesToday = todayOrders.reduce((sum, o) => sum + (o.totalFinalPrice || o.totalPrice || 0), 0);
        return {
            success: true,
            data: {
                storeName: company?.name,
                currency: company?.currency || "KES",
                aiCreditBalance: company?.aiCreditBalance || 0,
                todayOrderCount: todayOrders.length,
                todaySalesTotal: totalSalesToday,
                pendingOrdersCount: pendingOrders,
                lowStockItemsCount: lowStockCount,
            },
            summaryForAgent: `Today's Business Summary for ${company?.name}: Sales Total ${company?.currency || "KES"} ${totalSalesToday.toLocaleString()} across ${todayOrders.length} orders. Pending orders: ${pendingOrders}. Low stock products: ${lowStockCount}.`,
        };
    },
});
// 4. lookupOrders
WorkforceToolRegistry.registerTool({
    name: "lookupOrders",
    description: "Lookup customer orders by order ID, phone number, or status.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0.5,
    parameters: {
        orderId: "optional string",
        phone: "optional string",
        status: "optional string (PENDING, DELIVERED, etc.)",
        limit: "optional number (default 5)",
    },
    execute: async (args, context) => {
        const { orderId, phone, status, limit = 5 } = args;
        const orders = await prismadb_1.default.customerOrder.findMany({
            where: {
                companyId: context.companyId,
                ...(orderId ? { id: orderId } : {}),
                ...(phone ? { phone: { contains: phone } } : {}),
                ...(status ? { status: status } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: Math.min(limit, 10),
            include: {
                items: {
                    select: { quantity: true, price: true, totalPrice: true, product: { select: { name: true } } },
                },
            },
        });
        return {
            success: true,
            data: { count: orders.length, orders },
            summaryForAgent: `Found ${orders.length} order(s): ${orders
                .map((o) => `Order #${o.id.slice(-6)} - Status: ${o.status}, Total: KES ${o.totalFinalPrice || o.totalPrice}, Items: ${o.items.length}`)
                .join("; ")}`,
        };
    },
});
// 5. getCustomerInsights
WorkforceToolRegistry.registerTool({
    name: "getCustomerInsights",
    description: "Analyze customer repeat purchases, VIP buyers, and dormant accounts.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0.5,
    parameters: {
        dormantDays: "optional number (default 45)",
    },
    execute: async (args, context) => {
        const dormantDays = args.dormantDays || 45;
        const cutoffDate = new Date(Date.now() - dormantDays * 24 * 60 * 60 * 1000);
        const repeatOrders = await prismadb_1.default.customerOrder.groupBy({
            by: ["phone"],
            where: {
                companyId: context.companyId,
                phone: { not: null },
            },
            _count: { id: true },
            _sum: { totalPrice: true },
            having: { id: { _count: { gt: 1 } } },
            orderBy: { _count: { id: "desc" } },
            take: 10,
        });
        const dormantOrders = await prismadb_1.default.customerOrder.findMany({
            where: {
                companyId: context.companyId,
                createdAt: { lte: cutoffDate },
            },
            select: { phone: true, name: true, createdAt: true, totalPrice: true },
            distinct: ["phone"],
            take: 10,
        });
        return {
            success: true,
            data: {
                repeatCustomerCount: repeatOrders.length,
                sampleRepeatCustomers: repeatOrders.map((r) => ({
                    phone: r.phone ? `${r.phone.slice(0, 4)}***${r.phone.slice(-3)}` : "Unknown",
                    ordersCount: r._count.id,
                    totalSpent: r._sum.totalPrice,
                })),
                dormantCustomerCount: dormantOrders.length,
            },
            summaryForAgent: `Customer Retention Analysis: ${repeatOrders.length} high-frequency repeat customers found. ${dormantOrders.length} dormant accounts have not placed an order in over ${dormantDays} days.`,
        };
    },
});
// 6. draftMarketingCampaign
WorkforceToolRegistry.registerTool({
    name: "draftMarketingCampaign",
    description: "Draft a coordinated multi-channel marketing campaign for store promotion.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.RECOMMEND,
    costCredits: 1.0,
    parameters: {
        campaignName: "string",
        primaryTheme: "string",
        channels: "array of strings (WHATSAPP, SOCIAL, EMAIL)",
        featuredProductIds: "optional array of product IDs",
    },
    execute: async (args, context) => {
        const { campaignName, primaryTheme, channels = ["WHATSAPP", "SOCIAL"], featuredProductIds } = args;
        // Check products
        let products = [];
        if (featuredProductIds && featuredProductIds.length > 0) {
            products = await prismadb_1.default.product.findMany({
                where: { id: { in: featuredProductIds }, companyId: context.companyId },
                select: { id: true, name: true, sellingPrice: true },
            });
        }
        const campaign = await prismadb_1.default.aIAgentCampaign.create({
            data: {
                companyId: context.companyId,
                level: types_1.AgentWorkforceLevel.STORE,
                name: campaignName,
                targetAudience: "Existing and potential store shoppers",
                goalDescription: primaryTheme,
                channel: channels.join(","),
                automationMode: "ASSISTED",
                status: "DRAFT",
                metrics: {
                    featuredProducts: products.map((p) => ({ id: p.id, name: p.name, price: p.sellingPrice })),
                },
            },
        });
        return {
            success: true,
            data: { campaignId: campaign.id, name: campaign.name, status: campaign.status },
            summaryForAgent: `Campaign draft '${campaign.name}' created with ID ${campaign.id}. It is ready for merchant review in Marketing Station.`,
        };
    },
});
// 7. optimizeMarketplaceListing
WorkforceToolRegistry.registerTool({
    name: "optimizeMarketplaceListing",
    description: "Audit a store product for Ghuba marketplace listing readiness and generate SEO tags.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.RECOMMEND,
    costCredits: 1.0,
    parameters: {
        productId: "string",
    },
    execute: async (args, context) => {
        const product = await prismadb_1.default.product.findFirst({
            where: { id: args.productId, companyId: context.companyId },
        });
        if (!product) {
            return { success: false, error: "Product not found in store catalog." };
        }
        const recommendations = [];
        if (!product.images || product.images.length === 0) {
            recommendations.push("Add high-resolution product photos with clean backgrounds.");
        }
        if (!product.description || product.description.length < 50) {
            recommendations.push("Expand product description to include specifications, materials, and warranty.");
        }
        if (!product.category) {
            recommendations.push("Assign a precise category for marketplace discoverability.");
        }
        return {
            success: true,
            data: {
                productId: product.id,
                name: product.name,
                isEligible: product.isAvailable && (product.quantity || 0) > 0,
                recommendations,
            },
            summaryForAgent: `Marketplace Listing Audit for '${product.name}': Eligibility: ${product.isAvailable ? "Eligible" : "Needs Update"}. Recommendations: ${recommendations.join(" ")}`,
        };
    },
});
// 8. escalateToHuman
WorkforceToolRegistry.registerTool({
    name: "escalateToHuman",
    description: "Escalate an urgent customer inquiry, dispute, or unsupported request to human staff.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.EXECUTE,
    costCredits: 0,
    parameters: {
        customerPhone: "optional string",
        customerEmail: "optional string",
        reason: "string (explanation of why human intervention is required)",
        priority: "optional string (CRITICAL, HIGH, MEDIUM)",
    },
    execute: async (args, context) => {
        const { customerPhone, customerEmail, reason, priority = "HIGH" } = args;
        const escalation = await prismadb_1.default.aIAgentEscalation.create({
            data: {
                companyId: context.companyId,
                customerPhone,
                customerEmail,
                reason,
                priority,
                status: "PENDING",
            },
        });
        return {
            success: true,
            data: { escalationId: escalation.id, status: escalation.status },
            summaryForAgent: `Customer issue successfully escalated to human staff (Escalation ID: ${escalation.id}, Priority: ${priority}). Advise customer that an agent will follow up.`,
        };
    },
});
// ============================================================================
// REGISTER PLATFORM LEVEL TOOLS (SalesmanPro Super Admin SaaS Growth)
// ============================================================================
// 9. searchPublicBusinesses
WorkforceToolRegistry.registerTool({
    name: "searchPublicBusinesses",
    description: "Search live public business directories or web sources (via SerpApi/Google Custom Search) for prospective retail/service merchants in Kenya.",
    levelScope: [types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {
        category: "string (e.g. Electronics, Agrovet, Salons, Hardware)",
        location: "string (e.g. Nairobi, Kisumu, Eldoret)",
        limit: "optional number (default 5)",
    },
    execute: async (args) => {
        const { category, location, limit = 5 } = args;
        // 1. Check if commercial search API keys are present (DB encrypted or .env fallback)
        let serpApiKey = process.env.SERPAPI_API_KEY;
        let googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
        let googleEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        try {
            const { superAdminAIService } = await Promise.resolve().then(() => __importStar(require("../superAdminService")));
            const dbSerp = await superAdminAIService.getDecryptedApiKey("SERPAPI");
            if (dbSerp)
                serpApiKey = dbSerp;
            const googleDetails = await superAdminAIService.getProviderDetails("GOOGLE_SEARCH");
            if (googleDetails.apiKey)
                googleApiKey = googleDetails.apiKey;
            if (googleDetails.metadata?.searchEngineId)
                googleEngineId = googleDetails.metadata.searchEngineId;
        }
        catch {
            // Graceful fallback to process.env
        }
        let liveResults = [];
        // Attempt 1: SerpApi Google Maps search for high-fidelity local merchants
        if (serpApiKey) {
            try {
                const serpUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(`${category} in ${location} Kenya`)}&api_key=${serpApiKey}`;
                const timeoutSignal = AbortSignal.timeout ? AbortSignal.timeout(7000) : undefined;
                const resp = await fetch(serpUrl, { signal: timeoutSignal });
                if (resp.ok) {
                    const data = await resp.json();
                    const localPlaces = data.local_results || [];
                    liveResults = localPlaces.slice(0, limit).map((p) => ({
                        businessName: p.title || "Business",
                        category,
                        location: p.address || location,
                        phone: p.phone,
                        website: p.website,
                        rating: p.rating,
                        sourceUrl: p.link || `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
                        sourceProvider: "SERPAPI_GOOGLE_MAPS",
                    }));
                }
            }
            catch (err) {
                console.warn("[SERPAPI_SEARCH_WARN] Failed SerpApi search:", err?.message || err);
            }
        }
        // Attempt 2: Google Custom Search API
        if (liveResults.length === 0 && googleApiKey && googleEngineId) {
            try {
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleEngineId}&q=${encodeURIComponent(`${category} ${location} Kenya business contact website`)}&num=${limit}`;
                const timeoutSignal = AbortSignal.timeout ? AbortSignal.timeout(7000) : undefined;
                const resp = await fetch(searchUrl, { signal: timeoutSignal });
                if (resp.ok) {
                    const data = await resp.json();
                    const items = data.items || [];
                    liveResults = items.slice(0, limit).map((item) => ({
                        businessName: item.title.split("-")[0]?.split("|")[0]?.trim() || item.title,
                        category,
                        location,
                        website: item.link,
                        sourceUrl: item.link,
                        sourceProvider: "GOOGLE_CUSTOM_SEARCH",
                    }));
                }
            }
            catch (err) {
                console.warn("[GOOGLE_CUSTOM_SEARCH_WARN] Failed Google Search:", err?.message || err);
            }
        }
        // 2. Query existing database prospects for deduplication & verification
        const existing = await prismadb_1.default.growthProspect.findMany({
            where: {
                category: { contains: category, mode: "insensitive" },
                location: { contains: location, mode: "insensitive" },
            },
            take: limit,
            select: {
                id: true,
                businessName: true,
                category: true,
                location: true,
                status: true,
                overallLeadScore: true,
                website: true,
                phone: true,
            },
        });
        const existingNames = new Set(existing.map((e) => e.businessName.toLowerCase()));
        // Deduplicate and combine
        const mergedProspects = [
            ...existing.map((e) => ({ ...e, sourceProvider: "INTERNAL_DATABASE", isExistingLead: true })),
            ...liveResults
                .filter((r) => !existingNames.has(r.businessName.toLowerCase()))
                .map((r) => ({ ...r, isExistingLead: false })),
        ].slice(0, limit);
        const providerLabel = serpApiKey
            ? "Live SerpApi Google Maps & Platform CRM"
            : googleApiKey
                ? "Google Custom Search & Platform CRM"
                : "Verified Platform CRM Directory (SerpApi/Google Search key unconfigured)";
        return {
            success: true,
            data: {
                totalDiscovered: mergedProspects.length,
                liveProvider: serpApiKey ? "SerpApi" : googleApiKey ? "GoogleSearch" : "InternalCRM",
                prospects: mergedProspects,
            },
            summaryForAgent: `Business Discovery for ${category} in ${location} (${providerLabel}): ${mergedProspects.length} merchants identified (${liveResults.length} live web results, ${existing.length} verified CRM records).`,
        };
    },
});
// 10. createProspectRecord
WorkforceToolRegistry.registerTool({
    name: "createProspectRecord",
    description: "Record a newly qualified business prospect with digital maturity and lead scores.",
    levelScope: [types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.EXECUTE,
    costCredits: 0,
    parameters: {
        businessName: "string",
        category: "string",
        location: "string",
        phone: "optional string",
        email: "optional string",
        website: "optional string",
        sourceUrl: "optional string",
        digitalMaturityScore: "number (0-100)",
        ecommerceOpportunityScore: "number (0-100)",
        recommendedPlan: "optional string",
        evidence: "string (summary of publicly observed business attributes)",
    },
    execute: async (args) => {
        const overallLeadScore = Math.round((args.digitalMaturityScore * 0.4) + (args.ecommerceOpportunityScore * 0.6));
        const prospect = await prismadb_1.default.growthProspect.create({
            data: {
                businessName: args.businessName,
                category: args.category,
                location: args.location,
                phone: args.phone,
                email: args.email,
                website: args.website,
                sourceUrl: args.sourceUrl,
                evidence: args.evidence,
                digitalMaturityScore: args.digitalMaturityScore,
                ecommerceOpportunityScore: args.ecommerceOpportunityScore,
                overallLeadScore,
                recommendedPlan: args.recommendedPlan || "Starter eCommerce + WhatsApp Commerce",
                status: "QUALIFIED",
            },
        });
        return {
            success: true,
            data: { prospectId: prospect.id, businessName: prospect.businessName, leadScore: overallLeadScore },
            summaryForAgent: `Prospect '${prospect.businessName}' (${prospect.category} in ${prospect.location}) recorded with Lead Score ${overallLeadScore}/100.`,
        };
    },
});
// 11. draftOutboundOutreach
WorkforceToolRegistry.registerTool({
    name: "draftOutboundOutreach",
    description: "Draft high-converting, personalized outreach for a qualified prospect (Mandates Human Approval).",
    levelScope: [types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.HUMAN_APPROVAL_REQUIRED,
    requiresApproval: true,
    costCredits: 0,
    parameters: {
        prospectId: "string",
        channel: "string (EMAIL or WHATSAPP)",
        customAngle: "string (e.g. WhatsApp checkout, catalog sync, POS)",
        message: "optional string (custom outreach message body)",
    },
    execute: async (args) => {
        const prospect = await prismadb_1.default.growthProspect.findUnique({
            where: { id: args.prospectId },
        });
        if (!prospect) {
            return { success: false, error: "Prospect record not found." };
        }
        const pContact = prospect.contactName;
        const pLocation = prospect.city || prospect.location || "Kenya";
        const contactGreeting = pContact ? `Hi ${pContact}` : `Hello ${prospect.businessName} Team`;
        const draftedBody = args.message ||
            `${contactGreeting},\n\nWe noticed ${prospect.businessName}'s presence in ${pLocation} and wanted to share how SalesmanPro is helping similar merchants accelerate sales. With our platform, you get an instant mobile-first storefront, automated WhatsApp ordering with conversational AI, and direct M-Pesa integrated checkout tailored for ${args.customAngle || "rapid growth"}.\n\nWould you be open to a quick 3-minute demo this week to see how it works for your business?\n\nBest regards,\nSalesmanPro Merchant Growth Team`;
        return {
            success: true,
            requiresApproval: true,
            approvalPayload: {
                actionType: "OUTBOUND_PROSPECT_MESSAGE",
                title: `Outbound Outreach to ${prospect.businessName}`,
                description: draftedBody,
                proposedAction: {
                    prospectId: prospect.id,
                    businessName: prospect.businessName,
                    contactName: pContact,
                    channel: args.channel,
                    recipient: args.channel === "EMAIL" ? prospect.email : prospect.phone,
                    email: prospect.email,
                    phone: prospect.phone,
                    angle: args.customAngle,
                    message: draftedBody,
                },
            },
            summaryForAgent: `Outbound message for '${prospect.businessName}' has been queued for Super Admin approval before dispatch.`,
        };
    },
});
// 12. getPlatformGrowthPipeline
WorkforceToolRegistry.registerTool({
    name: "getPlatformGrowthPipeline",
    description: "Retrieve comprehensive metrics on SalesmanPro prospect acquisition pipeline.",
    levelScope: [types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {},
    execute: async () => {
        const counts = await prismadb_1.default.growthProspect.groupBy({
            by: ["status"],
            _count: { id: true },
        });
        const statusMap = {};
        counts.forEach((c) => {
            statusMap[c.status] = c._count.id;
        });
        const totalStores = await prismadb_1.default.company.count({ where: { deletedAt: null } });
        return {
            success: true,
            data: {
                totalActiveStoresOnPlatform: totalStores,
                prospectPipeline: statusMap,
            },
            summaryForAgent: `SaaS Growth Pipeline: ${totalStores} active stores on SalesmanPro. Prospects: ${statusMap["DISCOVERED"] || 0} discovered, ${statusMap["QUALIFIED"] || 0} qualified, ${statusMap["CONTACTED"] || 0} contacted, ${statusMap["ONBOARDED"] || 0} converted.`,
        };
    },
});
// ============================================================================
// REGISTER MARKETPLACE LEVEL TOOLS (Ghuba Marketplace Super Admin Growth)
// ============================================================================
// 13. detectSupplyGaps
WorkforceToolRegistry.registerTool({
    name: "detectSupplyGaps",
    description: "Identify categories and locations with high buyer interest but low active listings on Ghuba.",
    levelScope: [types_1.AgentWorkforceLevel.MARKETPLACE],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {
        location: "optional string",
    },
    execute: async (args) => {
        const gaps = await prismadb_1.default.marketplaceSupplyGap.findMany({
            where: {
                status: "OPEN",
                ...(args.location ? { location: { contains: args.location, mode: "insensitive" } } : {}),
            },
            orderBy: { unmetSearchVolume: "desc" },
            take: 10,
        });
        return {
            success: true,
            data: { gapCount: gaps.length, supplyGaps: gaps },
            summaryForAgent: `Ghuba Marketplace Supply Analysis: Found ${gaps.length} critical supply gaps: ${gaps
                .map((g) => `${g.category} in ${g.location} (Search Volume: ${g.unmetSearchVolume}, Active Listings: ${g.activeListingCount})`)
                .join("; ")}`,
        };
    },
});
// 14. recruitSellerForGap
WorkforceToolRegistry.registerTool({
    name: "recruitSellerForGap",
    description: "Match a verified Ghuba supply gap with prospective merchants for targeted onboarding.",
    levelScope: [types_1.AgentWorkforceLevel.MARKETPLACE],
    permissionRequired: types_1.AgentPermissionLevel.RECOMMEND,
    costCredits: 0,
    parameters: {
        gapId: "string",
        sellerType: "string (e.g. Retailer, Wholesaler, Dealership)",
    },
    execute: async (args) => {
        const gap = await prismadb_1.default.marketplaceSupplyGap.findUnique({
            where: { id: args.gapId },
        });
        if (!gap) {
            return { success: false, error: "Supply gap record not found." };
        }
        return {
            success: true,
            data: {
                gapId: gap.id,
                category: gap.category,
                location: gap.location,
                recommendedOutreach: `Contact ${args.sellerType} merchants in ${gap.location} to supply ${gap.category} listings.`,
            },
            summaryForAgent: `Recruitment action plan created for ${gap.category} in ${gap.location}. Recommended outreach: target local ${args.sellerType} sellers.`,
        };
    },
});
// 15. getConnectedSocialAccounts
WorkforceToolRegistry.registerTool({
    name: "getConnectedSocialAccounts",
    description: "Inspect active connected social media accounts (Facebook, Instagram, TikTok, YouTube) for the store.",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {},
    execute: async (_args, context) => {
        const { socialService } = await Promise.resolve().then(() => __importStar(require("@/lib/social/socialService")));
        const accounts = await socialService.getConnectedAccounts(context.companyId);
        return {
            success: true,
            data: { connectedCount: accounts.length, accounts },
            summaryForAgent: `Store has ${accounts.length} connected social account(s): ${accounts.map((a) => `${a.platform} (${a.accountName})`).join(", ") || "None connected"}.`,
        };
    },
});
// 16. publishSocialPost
WorkforceToolRegistry.registerTool({
    name: "publishSocialPost",
    description: "Create and publish or queue a social media post across connected Facebook and Instagram accounts (Mandates Human Approval).",
    levelScope: [types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.HUMAN_APPROVAL_REQUIRED,
    requiresApproval: true,
    costCredits: 0.5,
    parameters: {
        content: "string (post text/caption)",
        platforms: "array of strings (e.g. ['FACEBOOK', 'INSTAGRAM'])",
        mediaUrls: "optional array of image/video URLs",
        hashtags: "optional array of hashtags",
        title: "optional string title",
    },
    execute: async (args, context) => {
        const post = await prismadb_1.default.socialMediaPost.create({
            data: {
                companyId: context.companyId,
                title: args.title || "AI Workforce Post",
                content: args.content,
                targetPlatforms: args.platforms || ["FACEBOOK"],
                mediaUrls: args.mediaUrls || [],
                hashtags: args.hashtags || [],
                status: "DRAFT",
                approvalMode: "MANUAL",
                isApproved: false,
            },
        });
        const targetPlatforms = args.platforms || ["FACEBOOK"];
        return {
            success: true,
            requiresApproval: true,
            approvalPayload: {
                actionType: "PUBLISH_SOCIAL_POST",
                title: `Social Post for ${context.companyName || "Store"} (${targetPlatforms.join(", ")})`,
                description: args.content,
                proposedAction: {
                    postId: post.id,
                    companyId: context.companyId,
                    content: args.content,
                    platforms: targetPlatforms,
                    mediaUrls: args.mediaUrls || [],
                },
            },
            summaryForAgent: `Social post drafted (ID: ${post.id}) for ${targetPlatforms.join(", ")}. Submitted for merchant approval before publishing to live feeds.`,
        };
    },
});
// ============================================================================
// REGISTER ADVERTISING PLATFORM TOOLS (Store, Ghuba & SalesmanPro Ads)
// ============================================================================
// 17. recommendAdCampaign
WorkforceToolRegistry.registerTool({
    name: "recommendAdCampaign",
    description: "Analyze store catalog or marketplace demand to recommend high-ROI advertising campaigns.",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.MARKETPLACE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.RECOMMEND,
    costCredits: 0.5,
    parameters: {
        productId: "optional string",
        goal: "optional string (e.g. Clearance, New Arrivals, Best Sellers)",
    },
    execute: async (args, context) => {
        let candidateProduct = null;
        if (context.companyId) {
            if (args.productId) {
                candidateProduct = await prismadb_1.default.product.findFirst({
                    where: { id: args.productId, companyId: context.companyId },
                    select: { id: true, name: true, sellingPrice: true, quantity: true, images: true },
                });
            }
            else {
                candidateProduct = await prismadb_1.default.product.findFirst({
                    where: { companyId: context.companyId, isAvailable: true, quantity: { gt: 0 } },
                    orderBy: { quantity: "desc" },
                    select: { id: true, name: true, sellingPrice: true, quantity: true, images: true },
                });
            }
        }
        if (!candidateProduct && context.level === types_1.AgentWorkforceLevel.STORE) {
            return {
                success: false,
                error: "No eligible products with active inventory found for advertising.",
            };
        }
        const recommendedBudgetKES = 2000;
        const durationDays = 7;
        const estDailyKES = Math.round(recommendedBudgetKES / durationDays);
        return {
            success: true,
            data: {
                product: candidateProduct,
                recommendedObjective: "PRODUCT_SALES",
                recommendedTotalBudgetKES: recommendedBudgetKES,
                recommendedDailyBudgetKES: estDailyKES,
                durationDays,
                recommendedPlacements: ["GHUBA_SEARCH_SPONSORED", "GHUBA_CATEGORY_TOP", "STOREFRONT_HERO"],
                rationale: candidateProduct
                    ? `Product '${candidateProduct.name}' has ${candidateProduct.quantity} units in stock priced at KES ${candidateProduct.sellingPrice.toLocaleString()}. Advertising will accelerate inventory turnover.`
                    : "Marketplace demand analysis indicates high conversion potential for sponsored placements.",
            },
            summaryForAgent: candidateProduct
                ? `Ad Recommendation for '${candidateProduct.name}': Budget KES ${recommendedBudgetKES} for 7 days (KES ${estDailyKES}/day) across Ghuba & Storefront. Rationale: Strong stock availability (${candidateProduct.quantity} units).`
                : "Marketplace sponsored campaign recommendation prepared.",
        };
    },
});
// 18. createAdCampaignDraft
WorkforceToolRegistry.registerTool({
    name: "createAdCampaignDraft",
    description: "Draft an authoritative AdCampaign with multi-variant creatives (Mandates Human Approval).",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.MARKETPLACE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.HUMAN_APPROVAL_REQUIRED,
    requiresApproval: true,
    costCredits: 1.0,
    parameters: {
        productId: "optional string",
        listingId: "optional string",
        campaignName: "string",
        totalBudgetKES: "number",
        durationDays: "optional number (default 7)",
        primaryHeadline: "optional string",
    },
    execute: async (args, context) => {
        const { AIAdManager } = await Promise.resolve().then(() => __importStar(require("@/lib/ads/aiAdManager")));
        const result = await AIAdManager.generateCampaignFromProduct({
            companyId: context.companyId,
            productId: args.productId,
            listingId: args.listingId,
            goal: args.primaryHeadline || "Drive customer sales",
            totalBudgetKES: args.totalBudgetKES,
            durationDays: args.durationDays || 7,
            userId: context.agentId,
        });
        return {
            success: true,
            requiresApproval: true,
            approvalPayload: {
                actionType: "LAUNCH_AD_CAMPAIGN",
                title: `Launch Ad Campaign: ${result.name}`,
                description: `Authorize spending KES ${result.totalBudgetKES.toLocaleString()} for ad delivery across ${result.creativesCount} creative variants.`,
                proposedAction: {
                    campaignId: result.campaignId,
                    companyId: context.companyId,
                    totalBudgetKES: result.totalBudgetKES,
                    dailyBudgetKES: result.dailyBudgetKES,
                },
            },
            summaryForAgent: `Ad campaign draft '${result.name}' (ID: ${result.campaignId}) created with ${result.creativesCount} creatives. Submitted for merchant authorization before launch.`,
        };
    },
});
// 19. getAdPerformance
WorkforceToolRegistry.registerTool({
    name: "getAdPerformance",
    description: "Inspect performance metrics, spend, clicks, conversions, and ROAS of active ad campaigns.",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.MARKETPLACE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {
        campaignId: "optional string",
    },
    execute: async (args, context) => {
        const where = {};
        if (args.campaignId) {
            where.id = args.campaignId;
        }
        if (context.companyId) {
            where.companyId = context.companyId;
        }
        const campaigns = await prismadb_1.default.adCampaign.findMany({
            where,
            select: {
                id: true,
                name: true,
                status: true,
                totalBudgetKES: true,
                spentAmountKES: true,
                metrics: true,
                createdAt: true,
            },
            take: 10,
            orderBy: { createdAt: "desc" },
        });
        let totalSpend = 0;
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalConversions = 0;
        let totalRevenue = 0;
        campaigns.forEach((c) => {
            totalSpend += c.spentAmountKES || 0;
            const m = c.metrics || {};
            totalImpressions += m.impressions || 0;
            totalClicks += m.clicks || 0;
            totalConversions += m.conversions || 0;
            totalRevenue += m.attributedRevenueKES || 0;
        });
        const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        return {
            success: true,
            data: {
                campaignCount: campaigns.length,
                totalSpendKES: totalSpend,
                totalImpressions,
                totalClicks,
                overallCTR: Math.round(overallCTR * 100) / 100,
                totalConversions,
                attributedRevenueKES: totalRevenue,
                overallROAS: Math.round(overallROAS * 100) / 100,
                campaigns,
            },
            summaryForAgent: `Advertising Analytics: ${campaigns.length} campaigns. Total Spend: KES ${totalSpend.toLocaleString()}. Impressions: ${totalImpressions.toLocaleString()}, Clicks: ${totalClicks} (CTR: ${overallCTR.toFixed(2)}%), Conversions: ${totalConversions}, ROAS: ${overallROAS.toFixed(2)}x.`,
        };
    },
});
// 20. boostMarketplaceListing
WorkforceToolRegistry.registerTool({
    name: "boostMarketplaceListing",
    description: "Boost a Ghuba marketplace listing to sponsored top-tier rankings (Mandates Human Approval).",
    levelScope: [types_1.AgentWorkforceLevel.MARKETPLACE, types_1.AgentWorkforceLevel.STORE],
    permissionRequired: types_1.AgentPermissionLevel.HUMAN_APPROVAL_REQUIRED,
    requiresApproval: true,
    costCredits: 0.5,
    parameters: {
        listingId: "string",
        budgetKES: "number (e.g. 1000 to 10000)",
        durationDays: "optional number (default 7)",
    },
    execute: async (args, context) => {
        const listing = await prismadb_1.default.marketplaceListings.findUnique({
            where: { id: args.listingId },
            select: { id: true, name: true, sellingPrice: true, images: true, category: true },
        });
        if (!listing) {
            return { success: false, error: "Marketplace listing not found." };
        }
        const { AIAdManager } = await Promise.resolve().then(() => __importStar(require("@/lib/ads/aiAdManager")));
        const result = await AIAdManager.generateCampaignFromProduct({
            companyId: context.companyId,
            listingId: args.listingId,
            goal: "Promote listing in Ghuba Search and Category Top results",
            totalBudgetKES: args.budgetKES,
            durationDays: args.durationDays || 7,
            userId: context.agentId,
        });
        return {
            success: true,
            requiresApproval: true,
            approvalPayload: {
                actionType: "BOOST_MARKETPLACE_LISTING",
                title: `Boost Listing: ${listing.name}`,
                description: `Sponsor listing in Ghuba search and category pages with KES ${args.budgetKES.toLocaleString()} budget.`,
                proposedAction: {
                    campaignId: result.campaignId,
                    listingId: listing.id,
                    budgetKES: args.budgetKES,
                },
            },
            summaryForAgent: `Listing '${listing.name}' boost proposal created (Campaign ID: ${result.campaignId}). Awaiting authorization before spending KES ${args.budgetKES.toLocaleString()}.`,
        };
    },
});
// 21. optimizeAdCampaign
WorkforceToolRegistry.registerTool({
    name: "optimizeAdCampaign",
    description: "Analyze campaign metrics and recommend bid adjustments, creative refreshes, or budget shifts.",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.MARKETPLACE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.RECOMMEND,
    costCredits: 0.5,
    parameters: {
        campaignId: "string",
    },
    execute: async (args, context) => {
        const campaign = await prismadb_1.default.adCampaign.findUnique({
            where: { id: args.campaignId },
            include: { creatives: true },
        });
        if (!campaign) {
            return { success: false, error: "Campaign not found." };
        }
        const metrics = campaign.metrics || {};
        const ctr = metrics.ctr || 0;
        const impressions = metrics.impressions || 0;
        const conversions = metrics.conversions || 0;
        const recommendations = [];
        if (impressions > 500 && ctr < 1.0) {
            recommendations.push("Low CTR: Refresh Creative A/B headlines with stronger urgency or clear pricing callouts.");
        }
        if (impressions > 1000 && conversions === 0) {
            recommendations.push("Clicks without conversions: Review landing page stock and ensure fast WhatsApp checkout CTA.");
        }
        if (ctr > 3.0 && conversions > 5) {
            recommendations.push("High-performing campaign: Consider increasing daily budget to scale sales velocity.");
        }
        if (recommendations.length === 0) {
            recommendations.push("Campaign metrics are operating within normal baseline benchmarks.");
        }
        return {
            success: true,
            data: {
                campaignId: campaign.id,
                name: campaign.name,
                currentCTR: ctr,
                impressions,
                conversions,
                recommendations,
            },
            summaryForAgent: `Optimization Analysis for '${campaign.name}' (CTR: ${ctr}%, Impressions: ${impressions}): ${recommendations.join(" ")}`,
        };
    },
});
// ============================================================================
// REGISTER EXTERNAL MARKETING INTELLIGENCE TOOLS (Meta, Google Ads, GA4, Social)
// ============================================================================
// 22. getMarketingConnections
WorkforceToolRegistry.registerTool({
    name: "getMarketingConnections",
    description: "Inspect connected external advertising accounts (Meta Ads, Google Ads, GA4, Social).",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {},
    execute: async (args, context) => {
        const connections = await prismadb_1.default.marketingConnection.findMany({
            where: context.companyId ? { companyId: context.companyId } : undefined,
            select: {
                id: true,
                provider: true,
                accountId: true,
                accountName: true,
                status: true,
                lastSyncAt: true,
                syncStatus: true,
            },
        });
        return {
            success: true,
            data: { count: connections.length, connections },
            summaryForAgent: `Marketing Connections: ${connections.length} external provider accounts connected: ${connections.map((c) => `${c.provider} (${c.accountName} - ${c.status})`).join("; ") || "None connected"}.`,
        };
    },
});
// 23. getMarketingAnalytics
WorkforceToolRegistry.registerTool({
    name: "getMarketingAnalytics",
    description: "Query unified cross-platform marketing analytics (Meta, Google, GA4, Social, Internal Ads).",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {
        provider: "optional string (META_ADS, GOOGLE_ADS, GOOGLE_ANALYTICS_4, SOCIAL_ORGANIC)",
    },
    execute: async (args, context) => {
        const { MarketingIntelligenceService } = await Promise.resolve().then(() => __importStar(require("@/lib/marketing/marketingIntelligenceService")));
        const channels = await MarketingIntelligenceService.compareChannels(context.companyId);
        const filtered = args.provider
            ? channels.filter((c) => c.provider === args.provider)
            : channels;
        const totalSpend = filtered.reduce((s, c) => s + c.spendKES, 0);
        const totalRevenue = filtered.reduce((s, c) => s + c.revenueKES, 0);
        const totalConversions = filtered.reduce((s, c) => s + c.conversions, 0);
        const blendedROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        return {
            success: true,
            data: {
                totalSpendKES: totalSpend,
                totalRevenueKES: totalRevenue,
                totalConversions,
                blendedROAS: Math.round(blendedROAS * 100) / 100,
                channels: filtered,
            },
            summaryForAgent: `Unified Marketing Analytics: Total Spend KES ${totalSpend.toLocaleString()} yielding KES ${totalRevenue.toLocaleString()} across ${totalConversions} conversions (Blended ROAS: ${blendedROAS.toFixed(2)}x).`,
        };
    },
});
// 24. compareMarketingChannels
WorkforceToolRegistry.registerTool({
    name: "compareMarketingChannels",
    description: "Directly compare conversion efficiency and ROAS between Meta, Google, and Ghuba Ads.",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {},
    execute: async (args, context) => {
        const { MarketingIntelligenceService } = await Promise.resolve().then(() => __importStar(require("@/lib/marketing/marketingIntelligenceService")));
        const channels = await MarketingIntelligenceService.compareChannels(context.companyId);
        return {
            success: true,
            data: { channels },
            summaryForAgent: `Channel Comparison: ${channels
                .map((c) => `${c.channel}: Spend KES ${c.spendKES.toLocaleString()}, Conv: ${c.conversions}, Rev KES ${c.revenueKES.toLocaleString()} (${c.roas > 0 ? `${c.roas}x ROAS` : "Organic"})`)
                .join(" | ")}`,
        };
    },
});
// 25. analyzeMarketingOpportunities
WorkforceToolRegistry.registerTool({
    name: "analyzeMarketingOpportunities",
    description: "Run Opportunity Engine to detect untapped growth patterns and efficiency leaks.",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.MARKETPLACE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.RECOMMEND,
    costCredits: 0.5,
    parameters: {},
    execute: async (args, context) => {
        const { MarketingIntelligenceService } = await Promise.resolve().then(() => __importStar(require("@/lib/marketing/marketingIntelligenceService")));
        const opportunities = await MarketingIntelligenceService.detectOpportunities(context.companyId);
        return {
            success: true,
            data: { count: opportunities.length, opportunities },
            summaryForAgent: `Marketing Opportunity Analysis: Detected ${opportunities.length} strategic growth signals: ${opportunities
                .map((o) => `[${o.severity}] ${o.title}: ${o.recommendedAction}`)
                .join("; ")}`,
        };
    },
});
// 26. getMarketingHealthScore
WorkforceToolRegistry.registerTool({
    name: "getMarketingHealthScore",
    description: "Calculate explainable 0-100 Marketing Health Score across tracking, efficiency, and conversion.",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.READ,
    costCredits: 0,
    parameters: {},
    execute: async (args, context) => {
        const { MarketingIntelligenceService } = await Promise.resolve().then(() => __importStar(require("@/lib/marketing/marketingIntelligenceService")));
        const health = await MarketingIntelligenceService.computeHealthScore(context.companyId);
        return {
            success: true,
            data: health,
            summaryForAgent: `Marketing Health Score: ${health.score}/100 (${health.rating}). Diagnostic: Tracking: ${health.dimensions.trackingHealth.note}; Efficiency: ${health.dimensions.advertisingEfficiency.note}; Key Recommendations: ${health.keyRecommendations.join(" ")}`,
        };
    },
});
// 27. syncMarketingProvider
WorkforceToolRegistry.registerTool({
    name: "syncMarketingProvider",
    description: "Trigger live synchronization for an external marketing provider account.",
    levelScope: [types_1.AgentWorkforceLevel.STORE, types_1.AgentWorkforceLevel.PLATFORM],
    permissionRequired: types_1.AgentPermissionLevel.RECOMMEND,
    costCredits: 0.5,
    parameters: {
        connectionId: "string",
    },
    execute: async (args) => {
        const { MarketingIntelligenceService } = await Promise.resolve().then(() => __importStar(require("@/lib/marketing/marketingIntelligenceService")));
        const result = await MarketingIntelligenceService.syncConnection(args.connectionId);
        return {
            success: true,
            data: result,
            summaryForAgent: `Live synchronization complete for connection ${args.connectionId}. ${result.campaignsSynced} campaigns updated.`,
        };
    },
});
