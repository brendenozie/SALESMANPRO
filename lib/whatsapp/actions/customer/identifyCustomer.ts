/**
 * lib/whatsapp/actions/customer/identifyCustomer.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  identifyCustomerActionSchema,
} from "../../types";
import { normalizePhoneNumber } from "../../normalizePhone";
import { z } from "zod";

type IdentifyCustomerArgs = z.infer<typeof identifyCustomerActionSchema>["arguments"];

export async function identifyCustomer(
  args: IdentifyCustomerArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const phone = normalizePhoneNumber(args.phone ?? context.phoneNumber);

  const contact = await prisma.whatsAppContact.findFirst({
    where: {
      companyId: context.companyId,
      phoneNumber: phone,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  const ordersCount = await prisma.customerOrder.count({
    where: {
      companyId: context.companyId,
      phone,
    },
  });

  const name = contact?.name ?? contact?.profileName ?? args.name ?? "Valued Customer";

  return {
    success: true,
    action: "identify_customer",
    message: `Welcome ${name}! You have ${ordersCount} past order${ordersCount === 1 ? "" : "s"} with us.`,
    data: {
      customer: {
        name,
        phone,
        email: contact?.email ?? args.email,
        totalOrders: ordersCount,
      },
    },
  };
}
