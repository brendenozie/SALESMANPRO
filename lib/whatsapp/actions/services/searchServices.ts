/**
 * lib/whatsapp/actions/services/searchServices.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  searchServicesActionSchema,
} from "../../types";
import { z } from "zod";

type SearchServicesArgs = z.infer<typeof searchServicesActionSchema>["arguments"];

export async function searchServices(
  args: SearchServicesArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const listings = await prisma.marketplaceListings.findMany({
    where: {
      companyId: context.companyId,
      status: "ACTIVE",
      isAvailable: true,
      OR: [
        { hourlyRate: { not: null } },
        { minimumHours: { not: null } },
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
      company: {
        select: { currency: true },
      },
    },
  });

  if (!listings.length) {
    // Fallback check in Service model
    const services = await prisma.service.findMany({
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
        message: "I couldn't find any services matching your search.",
        data: { services: [] },
      };
    }

    const serviceList = services
      .map(
        (s) =>
          `🗓️ *${s.name}*\n   💰 Price: KES ${(s.price ?? 0).toLocaleString()}\n   🔖 ID: \`${s.id}\``,
      )
      .join("\n\n");

    return {
      success: true,
      action: "search_services",
      message: `Here are our available services:\n\n${serviceList}\n\nLet me know which service and date you'd like to book!`,
      data: { services },
    };
  }

  const currency = listings[0]?.company?.currency ?? "KES";
  const serviceList = listings
    .map(
      (l) =>
        `🗓️ *${l.name}*\n   💰 Rate: ${currency} ${(l.hourlyRate ?? l.sellingPrice).toLocaleString()} ${l.duration ? `(${l.duration})` : ""}\n   🔖 ID: \`${l.id}\``,
    )
    .join("\n\n");

  return {
    success: true,
    action: "search_services",
    message: `Here are our available services:\n\n${serviceList}\n\nTell me which one you would like to schedule!`,
    data: { services: listings },
  };
}
