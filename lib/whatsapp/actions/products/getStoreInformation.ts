/**
 * lib/whatsapp/actions/products/getStoreInformation.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  getStoreInformationActionSchema,
} from "../../types";
import { z } from "zod";

type GetStoreInformationArgs = z.infer<typeof getStoreInformationActionSchema>["arguments"];

export async function getStoreInformation(
  args: GetStoreInformationArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const company = await prisma.company.findUnique({
    where: { id: context.companyId },
    select: {
      name: true,
      description: true,
      contactEmail: true,
      contactPhone: true,
      address: true,
      openingHours: true,
      domain: true,
    },
  });

  if (!company) {
    return {
      success: false,
      action: "get_store_information",
      message: "Store information is currently unavailable.",
    };
  }

  let message = "";
  switch (args.topic) {
    case "hours":
      message = `🕒 *Opening Hours for ${company.name}:*\n${company.openingHours ? JSON.stringify(company.openingHours) : "Monday - Saturday: 8:00 AM - 6:00 PM\nSunday: Closed"}`;
      break;
    case "location":
      message = `📍 *Store Location for ${company.name}:*\n${company.address ?? "Please contact support for our physical pickup location."}`;
      break;
    case "contact":
      message = `📞 *Contact ${company.name}:*\n• Phone: ${company.contactPhone ?? "N/A"}\n• Email: ${company.contactEmail ?? "N/A"}${company.domain ? `\n• Website: https://${company.domain}` : ""}`;
      break;
    case "payment_methods":
      message = `💳 *Payment Options at ${company.name}:*\n• M-Pesa (STK Push or Paybill)\n• Cash on Delivery (COD)\n• Credit/Debit Card\n• Store Pickup`;
      break;
    case "general":
    default:
      message = `🏢 *${company.name}*\n_${company.description ?? "Welcome to our store!"}_\n\n📍 Address: ${company.address ?? "Available on request"}\n📞 Phone: ${company.contactPhone ?? "N/A"}\n✉️ Email: ${company.contactEmail ?? "N/A"}`;
      break;
  }

  return {
    success: true,
    action: "get_store_information",
    message,
    data: { company },
  };
}
