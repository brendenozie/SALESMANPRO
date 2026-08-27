/**
 * lib/whatsapp/actions/customer/getCustomerProfile.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
} from "../../types";

export async function getCustomerProfile(
  _args: Record<string, unknown>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const contact = await prisma.whatsAppContact.findFirst({
    where: {
      companyId: context.companyId,
      phoneNumber: context.phoneNumber,
    },
  });

  const ordersCount = await prisma.customerOrder.count({
    where: {
      companyId: context.companyId,
      phone: context.phoneNumber,
    },
  });

  const name = contact?.name ?? contact?.profileName ?? "Valued Customer";

  return {
    success: true,
    action: "get_customer_profile",
    message: `Customer Profile:\n• Name: ${name}\n• Phone: ${context.phoneNumber}\n• Email: ${contact?.email ?? "Not set"}\n• Total Orders: ${ordersCount}`,
    data: {
      profile: {
        name,
        phone: context.phoneNumber,
        email: contact?.email,
        totalOrders: ordersCount,
      },
    },
  };
}

export async function updateCustomer(
  args: { name?: string; email?: string; deliveryAddress?: Record<string, unknown> },
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  await prisma.whatsAppContact.updateMany({
    where: {
      companyId: context.companyId,
      phoneNumber: context.phoneNumber,
    },
    data: {
      name: args.name ?? undefined,
      email: args.email ?? undefined,
    },
  });

  return {
    success: true,
    action: "update_customer",
    message: "Your customer profile details have been updated successfully.",
    data: { updated: true },
  };
}
