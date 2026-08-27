"use strict";
/**
 * lib/whatsapp/actions/products/checkInventory.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInventory = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function checkInventory(args, context) {
    const listing = await prismadb_1.default.marketplaceListings.findFirst({
        where: {
            id: args.listingId,
            companyId: context.companyId,
        },
        select: {
            id: true,
            name: true,
            quantity: true,
            isAvailable: true,
            status: true,
        },
    });
    if (!listing) {
        return {
            success: false,
            action: "check_inventory",
            message: "I couldn't locate that item in our inventory.",
        };
    }
    const inStock = listing.isAvailable && listing.status === "ACTIVE" && listing.quantity >= args.quantity;
    return {
        success: true,
        action: "check_inventory",
        message: inStock
            ? `✅ Yes, *${listing.name}* is in stock! (${listing.quantity} units available)`
            : `⚠️ *${listing.name}* has only ${listing.quantity} units left.`,
        data: {
            listingId: listing.id,
            name: listing.name,
            availableQuantity: listing.quantity,
            requestedQuantity: args.quantity,
            isInStock: inStock,
        },
    };
}
exports.checkInventory = checkInventory;
