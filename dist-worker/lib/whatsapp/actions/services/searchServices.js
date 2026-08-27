"use strict";
/**
 * lib/whatsapp/actions/services/searchServices.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchServices = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function searchServices(args, context) {
    const listings = await prismadb_1.default.marketplaceListings.findMany({
        where: {
            companyId: context.companyId,
            status: "ACTIVE",
            isAvailable: true,
            OR: [
                { listingTransactionType: { contains: "SERVICE", mode: "insensitive" } },
                { listingTransactionType: { contains: "BOOK", mode: "insensitive" } },
                { duration: { not: null } },
            ],
            ...(args.query
                ? {
                    OR: [
                        { name: { contains: args.query, mode: "insensitive" } },
                        { description: { contains: args.query, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        take: args.limit ?? 5,
        select: {
            id: true,
            name: true,
            description: true,
            sellingPrice: true,
            hourlyRate: true,
            duration: true,
            currency: true,
        },
    });
    if (!listings.length) {
        // Fallback check in Service model
        const services = await prismadb_1.default.service.findMany({
            where: {
                companyId: context.companyId,
                ...(args.query
                    ? {
                        OR: [
                            { name: { contains: args.query, mode: "insensitive" } },
                            { description: { contains: args.query, mode: "insensitive" } },
                        ],
                    }
                    : {}),
            },
            take: args.limit ?? 5,
        });
        if (!services.length) {
            return {
                success: true,
                action: "search_services",
                message: "No specific booking services found matching your inquiry.",
                data: { services: [] },
            };
        }
        const serviceList = services
            .map((s) => `🗓️ *${s.name}*\n   💰 Price: KES ${s.price.toLocaleString()}\n   ⏱️ Duration: ${s.duration} mins`)
            .join("\n\n");
        return {
            success: true,
            action: "search_services",
            message: `Here are our available services:\n\n${serviceList}\n\nLet me know which service and date you'd like to book!`,
            data: { services },
        };
    }
    const currency = listings[0]?.currency ?? "KES";
    const serviceList = listings
        .map((l) => `🗓️ *${l.name}*\n   💰 Rate: ${currency} ${(l.hourlyRate ?? l.sellingPrice).toLocaleString()} ${l.duration ? `(${l.duration})` : ""}\n   🔖 ID: \`${l.id}\``)
        .join("\n\n");
    return {
        success: true,
        action: "search_services",
        message: `Here are our available services:\n\n${serviceList}\n\nTell me which one you would like to schedule!`,
        data: { services: listings },
    };
}
exports.searchServices = searchServices;
