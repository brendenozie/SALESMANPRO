/**
 * lib/whatsapp/actions/products/getCategories.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  getCategoriesActionSchema,
} from "../../types";
import { z } from "zod";

type GetCategoriesArgs = z.infer<typeof getCategoriesActionSchema>["arguments"];

export async function getCategories(
  args: GetCategoriesArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const categories = await prisma.productCategory.findMany({
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
