"use strict";
/**
 * lib/whatsapp/ai/context.ts
 *
 * Context builder for WhatsApp AI conversations.
 * Gathers store profile, customer identity, active cart, recent orders, and catalog preview.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleAIContext = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const repository_1 = require("../repository");
async function assembleAIContext(params) {
    const { account, contact, conversation, historyLimit = 12 } = params;
    const companyId = account.companyId;
    // 1. Fetch store profile, payment settings, and AI config in parallel
    const [company, paymentSettings, aiConfig, recentMessages, recentOrders, featuredListings] = await Promise.all([
        prismadb_1.default.company.findUnique({
            where: { id: companyId },
            select: {
                id: true,
                name: true,
                description: true,
                currency: true,
                contactPhone: true,
                contactEmail: true,
                address: true,
                domain: true,
            },
        }),
        prismadb_1.default.paymentSettings.findFirst({
            where: { company: { id: companyId } },
        }),
        prismadb_1.default.whatsAppAIConfig.findUnique({
            where: { companyId },
        }),
        repository_1.whatsappRepository.getRecentConversationHistory(conversation.id, historyLimit),
        prismadb_1.default.customerOrder.findMany({
            where: {
                companyId,
                phone: contact.phoneNumber,
            },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
                id: true,
                trackingNumber: true,
                status: true,
                totalFinalPrice: true,
            },
        }),
        prismadb_1.default.marketplaceListings.findMany({
            where: {
                companyId,
                status: "ACTIVE",
                isAvailable: true,
            },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                id: true,
                name: true,
                sellingPrice: true,
                finalPrice: true,
                quantity: true,
            },
        }),
    ]);
    if (!company) {
        throw new Error(`Company not found for companyId: ${companyId}`);
    }
    // Determine supported payment methods
    const supportedPaymentMethods = [];
    if (paymentSettings?.isMpesaEnabled)
        supportedPaymentMethods.push("M-Pesa");
    if (paymentSettings?.isPaystackEnabled)
        supportedPaymentMethods.push("Paystack / Card");
    if (paymentSettings?.isStripeEnabled)
        supportedPaymentMethods.push("Stripe / Card");
    if (paymentSettings?.isGhubaEnabled)
        supportedPaymentMethods.push("Ghuba");
    supportedPaymentMethods.push("Cash on Delivery (COD)");
    // Retrieve active cart from conversation state
    const activeCart = conversation.cart ?? null;
    return {
        storeContext: {
            companyId: company.id,
            name: company.name,
            description: company.description,
            currency: company.currency ?? "KES",
            phone: company.contactPhone,
            email: company.contactEmail,
            address: company.address,
            website: company.domain ? `https://${company.domain}` : undefined,
            policies: {
                shipping: "Standard delivery takes 1-2 business days across major locations.",
                returns: "Returns accepted within 7 days in original condition.",
                payment: `We accept ${supportedPaymentMethods.join(", ")}.`,
            },
            supportedPaymentMethods,
            systemInstructions: aiConfig?.systemPrompt,
        },
        customerContext: {
            name: contact.name ?? contact.profileName ?? "Customer",
            phoneNumber: contact.phoneNumber,
            totalOrders: recentOrders.length,
            activeCart,
            recentOrders: recentOrders.map((o) => ({
                id: o.id,
                trackingNumber: o.trackingNumber,
                status: o.status,
                total: o.totalFinalPrice,
            })),
        },
        conversationHistory: recentMessages.map((msg) => ({
            role: msg.direction === "INBOUND" ? "user" : "assistant",
            content: msg.body ?? "",
        })),
        catalogPreview: featuredListings.map((l) => ({
            id: l.id,
            name: l.name,
            price: l.finalPrice ?? l.sellingPrice,
            stock: l.quantity,
        })),
    };
}
exports.assembleAIContext = assembleAIContext;
