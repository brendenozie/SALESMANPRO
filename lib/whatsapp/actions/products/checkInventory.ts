/**
 * lib/whatsapp/actions/products/checkInventory.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  checkInventoryActionSchema,
} from "../../types";
import { z } from "zod";

type CheckInventoryArgs = z.infer<typeof checkInventoryActionSchema>["arguments"];

export async function checkInventory(
  args: CheckInventoryArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const listing = await prisma.marketplaceListings.findFirst({
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
