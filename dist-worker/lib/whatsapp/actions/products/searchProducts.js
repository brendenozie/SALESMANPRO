"use strict";
/**
 * lib/whatsapp/actions/products/searchProducts.ts
 *
 * Authoritative product search querying the company's active marketplace inventory.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function searchProducts(args, context) {
    const where = {
        companyId: context.companyId,
        status: "ACTIVE",
        isAvailable: true,
    };
    if (args.inStockOnly) {
        where.quantity = { gt: 0 };
    }
    if (args.query) {
        where.OR = [
            { name: { contains: args.query, mode: "insensitive" } },
            { description: { contains: args.query, mode: "insensitive" } },
            { brand: { contains: args.query, mode: "insensitive" } },
        ];
    }
    if (args.brand) {
        where.brand = { contains: args.brand, mode: "insensitive" };
    }
    if (args.minPrice !== undefined) {
        where.finalPrice = {
            ...(where.finalPrice ?? {}),
            gte: args.minPrice,
        };
    }
    if (args.maxPrice !== undefined) {
        where.finalPrice = {
            ...(where.finalPrice ?? {}),
            lte: args.maxPrice,
        };
    }
    const listings = await prismadb_1.default.marketplaceListings.findMany({
        where: where,
        select: {
            id: true,
            name: true,
            description: true,
            brand: true,
            sellingPrice: true,
            finalPrice: true,
            discount: true,
            quantity: true,
            isAvailable: true,
            images: true,
            currency: true,
        },
        orderBy: { createdAt: "desc" },
        take: args.limit ?? 5,
    });
    if (!listings.length) {
        return {
            success: true,
            action: "search_products",
            message: "I couldn't find any products matching your search in our store.",
            data: { products: [] },
        };
    }
    const currency = listings[0]?.currency ?? "KES";
    const productList = listings.map((p) => {
        const price = p.finalPrice ?? p.sellingPrice;
        return `🛍️ *${p.name}*\n   💰 Price: ${currency} ${price.toLocaleString()}\n   📦 Stock: ${p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock"}\n   🔖 ID: \`${p.id}\``;
    }).join("\n\n");
    return {
        success: true,
        action: "search_products",
        message: `Here are the products I found:\n\n${productList}\n\nLet me know which one you would like to order!`,
        data: {
            products: listings.map((l) => ({
                id: l.id,
                name: l.name,
                brand: l.brand,
                price: l.finalPrice ?? l.sellingPrice,
                originalPrice: l.sellingPrice,
                discount: l.discount,
                stock: l.quantity,
                available: l.isAvailable,
                images: l.images,
                currency: l.currency ?? "KES",
            })),
        },
    };
}
exports.searchProducts = searchProducts;
