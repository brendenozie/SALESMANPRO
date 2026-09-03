"use strict";
/**
 * lib/ai/agents/domainTools.ts
 *
 * Safe Domain Tools for SalesmanPro AI Agents.
 * AI never executes raw DB queries. All tools run through bounded domain functions.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_AGENT_TOOLS = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
exports.DOMAIN_AGENT_TOOLS = {
    searchProducts: {
        name: "searchProducts",
        description: "Search for products in the store catalog by keyword or category",
        parameters: {
            query: "string (search query or product name)",
            category: "optional string",
            limit: "optional number (default 5)",
        },
        execute: async (args, context) => {
            const { query = "", category, limit = 5 } = args;
            const products = await prismadb_1.default.product.findMany({
                where: {
                    companyId: context.companyId,
                    status: "ACTIVE",
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
                take: Math.min(limit, 10),
                select: {
                    id: true,
                    name: true,
                    sellingPrice: true,
                    finalPrice: true,
                    quantity: true,
                    isAvailable: true,
                    description: true,
                    category: true,
                },
            });
            return { products };
        },
    },
    checkOrderStatus: {
        name: "checkOrderStatus",
        description: "Check the status and items of a customer order by order ID or phone number",
        parameters: {
            orderId: "optional string",
            phone: "optional string",
        },
        execute: async (args, context) => {
            const { orderId, phone } = args;
            if (!orderId && !phone)
                return { error: "orderId or phone is required" };
            const order = await prismadb_1.default.customerOrder.findFirst({
                where: {
                    companyId: context.companyId,
                    ...(orderId ? { id: orderId } : {}),
                    ...(phone ? { phone: { contains: phone } } : {}),
                },
                orderBy: { createdAt: "desc" },
                include: {
                    items: {
                        select: {
                            quantity: true,
                            price: true,
                            totalPrice: true,
                            productId: true,
                        },
                    },
                },
            });
            if (!order)
                return { found: false, message: "No matching order found" };
            return {
                found: true,
                order: {
                    id: order.id,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    totalPrice: order.totalFinalPrice || order.totalPrice,
                    deliveryStatus: order.deliveryStatus,
                    createdAt: order.createdAt,
                    itemCount: order.items.length,
                },
            };
        },
    },
    getStoreInfo: {
        name: "getStoreInfo",
        description: "Get general store contact, address, currency, and business hours",
        parameters: {},
        execute: async (_, context) => {
            const company = await prismadb_1.default.company.findUnique({
                where: { id: context.companyId },
                select: {
                    name: true,
                    tagline: true,
                    description: true,
                    currency: true,
                    contactEmail: true,
                    contactPhone: true,
                    address: true,
                    openingHours: true,
                },
            });
            return { store: company };
        },
    },
};
