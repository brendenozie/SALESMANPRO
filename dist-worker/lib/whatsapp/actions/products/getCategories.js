"use strict";
/**
 * lib/whatsapp/actions/products/getCategories.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function getCategories(args, context) {
    const categories = await prismadb_1.default.productCategory.findMany({
        where: {
            companyId: context.companyId,
            visible: true,
        },
        select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            productCount: true,
        },
        take: args.limit ?? 10,
        orderBy: { sortOrder: "asc" },
    });
    if (!categories.length) {
        return {
            success: true,
            action: "get_categories",
            message: "We have a wide range of products. What specific item are you looking for?",
            data: { categories: [] },
        };
    }
    const categoryList = categories
        .map((c) => `📂 *${c.name}*${c.description ? ` - _${c.description}_` : ""}`)
        .join("\n");
    return {
        success: true,
        action: "get_categories",
        message: `Here are our main product categories:\n\n${categoryList}\n\nTell me which category you'd like to browse!`,
        data: { categories },
    };
}
exports.getCategories = getCategories;
