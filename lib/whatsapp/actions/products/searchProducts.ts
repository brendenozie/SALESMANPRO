/**
 * lib/whatsapp/actions/products/searchProducts.ts
 *
 * Authoritative product search querying the company's active marketplace inventory.
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  searchProductsActionSchema,
} from "../../types";
import { z } from "zod";

type SearchProductsArgs = z.infer<typeof searchProductsActionSchema>["arguments"];

export async function searchProducts(
  args: SearchProductsArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const where: Record<string, unknown> = {
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
      ...((where.finalPrice as object) ?? {}),
      gte: args.minPrice,
    };
  }

  if (args.maxPrice !== undefined) {
    where.finalPrice = {
      ...((where.finalPrice as object) ?? {}),
      lte: args.maxPrice,
    };
  }

  const listings = await prisma.marketplaceListings.findMany({
    where: where as any,
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
      company: {
        select: { currency: true },
      },
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

  const currency = listings[0]?.company?.currency ?? "KES";
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
        currency: l.company?.currency ?? "KES",
      })),
    },
  };
}
