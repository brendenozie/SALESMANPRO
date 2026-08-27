/**
 * lib/whatsapp/actions/products/getProduct.ts
 *
 * Fetches full details, images, and configurable options for a single product listing.
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  getProductActionSchema,
} from "../../types";
import { z } from "zod";

type GetProductArgs = z.infer<typeof getProductActionSchema>["arguments"];

export async function getProduct(
  args: GetProductArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const listingId = args.listingId ?? args.productId;

  if (!listingId && !args.slug) {
    return {
      success: false,
      action: "get_product",
      message: "Please specify the product you are looking for.",
    };
  }

  const listing = await prisma.marketplaceListings.findFirst({
    where: {
      companyId: context.companyId,
      ...(listingId ? { id: listingId } : { slug: args.slug }),
    },
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
      option: true,
      pricingTiers: true,
    },
  });

  if (!listing) {
    return {
      success: false,
      action: "get_product",
      message: "I couldn't find that product in our store.",
    };
  }

  const currency = listing.currency ?? "KES";
  const price = listing.finalPrice ?? listing.sellingPrice;
  const options = Array.isArray(listing.option) ? (listing.option as any[]) : [];
  
  let optionsText = "";
  if (options.length > 0) {
    optionsText = "\n\n*Available Options:*\n" + options.map((opt) => {
      const extra = opt.extraPrice ? ` (+${currency} ${opt.extraPrice})` : "";
      return `• ${opt.category}: ${opt.name}${extra}`;
    }).join("\n");
  }

  const message = `🛍️ *${listing.name}*\n${listing.description ? `_${listing.description}_\n\n` : "\n"}💰 *Price:* ${currency} ${price.toLocaleString()}\n📦 *Stock:* ${listing.quantity > 0 ? `${listing.quantity} available` : "Out of Stock"}${optionsText}\n\nWould you like to add this to your order? Just reply with your desired quantity and options!`;

  return {
    success: true,
    action: "get_product",
    message,
    data: {
      product: {
        id: listing.id,
        name: listing.name,
        description: listing.description,
        brand: listing.brand,
        price,
        originalPrice: listing.sellingPrice,
        stock: listing.quantity,
        available: listing.isAvailable,
        images: listing.images,
        options,
        currency,
      },
    },
  };
}
