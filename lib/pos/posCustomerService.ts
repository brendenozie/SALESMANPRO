import prisma from "@/server/db/prismadb";

import type { POSCustomerRecord, SearchPOSCustomersInput, CreatePOSCustomerInput } from "@/types/pos";

export type { POSCustomerRecord, SearchPOSCustomersInput, CreatePOSCustomerInput };

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchPOSCustomers(
  input: SearchPOSCustomersInput
): Promise<POSCustomerRecord[]> {
  const { companyId, query, limit = 20 } = input;
  if (!companyId) return [];

  const cleanQuery = (query || "").trim();
  const escapedQuery = escapeRegex(cleanQuery);
  const digitsOnly = cleanQuery.replace(/\D/g, "");

  // Find clients belonging to this company with matching user details
  const whereFilter: any = {
    companyId,
  };

  if (cleanQuery) {
    const userOr: any[] = [
      { name: { contains: escapedQuery, mode: "insensitive" } },
      { email: { contains: escapedQuery, mode: "insensitive" } },
    ];

    if (escapedQuery) {
      userOr.push({ phone: { contains: escapedQuery, mode: "insensitive" } });
    }
    if (digitsOnly && digitsOnly.length >= 4 && digitsOnly !== escapedQuery) {
      userOr.push({ phone: { contains: digitsOnly, mode: "insensitive" } });
    }

    whereFilter.user = {
      OR: userOr,
    };
  }

  const clients = await prisma.client.findMany({
    where: whereFilter,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
        },
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const userIds = clients.map((c) => c.user.id);

  // Aggregate orders for these customers within this company
  const stats = await prisma.customerOrder.groupBy({
    by: ["consumerId"],
    where: {
      companyId,
      consumerId: { in: userIds },
      status: { notIn: ["CANCELLED", "FAILED"] },
    },
    _sum: { totalFinalPrice: true },
    _count: { id: true },
    _max: { createdAt: true },
  });

  const statsMap = new Map(stats.map((s) => [s.consumerId, s]));

  // Also lookup Consumer profiles for customer numbers / loginCodes
  const consumers = await prisma.consumer.findMany({
    where: {
      companyId,
      userId: { in: userIds },
    },
    select: {
      userId: true,
      loginCode: true,
      notes: true,
    },
  });

  const consumerMap = new Map(consumers.map((c) => [c.userId, c]));

  return clients.map((c) => {
    const s = statsMap.get(c.user.id);
    const cons = consumerMap.get(c.user.id);

    return {
      id: c.user.id,
      clientId: c.id,
      name: c.user.name || "Customer",
      phone: c.user.phone || "",
      email: c.user.email || "",
      address: c.user.address || undefined,
      notes: c.notes || cons?.notes || undefined,
      customerNumber: cons?.loginCode || c.id.slice(-6).toUpperCase(),
      orderCount: s?._count.id || 0,
      totalSpent: s?._sum.totalFinalPrice || 0,
      lastPurchaseDate: s?._max.createdAt ? s._max.createdAt.toISOString() : null,
    };
  });
}


export interface CreatePOSCustomerResult {
  duplicate: boolean;
  message?: string;
  customer: POSCustomerRecord;
}

export async function createPOSCustomer(
  input: CreatePOSCustomerInput
): Promise<CreatePOSCustomerResult> {
  const { companyId, name, phone, email, address, notes } = input;

  if (!companyId) {
    throw new Error("Company ID is required to create a POS customer");
  }

  const cleanName = (name || "").trim();
  if (!cleanName) {
    throw new Error("Customer name is required");
  }

  const cleanPhone = (phone || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();

  // Deduplication Check:
  // 1. Look for existing User with phone or email in this company
  if (cleanPhone || cleanEmail) {
    const orConditions: any[] = [];
    if (cleanPhone) orConditions.push({ phone: cleanPhone });
    if (cleanEmail) orConditions.push({ email: cleanEmail });

    const existingUsers = await prisma.user.findMany({
      where: {
        OR: orConditions,
      },
      include: {
        clientProfile: {
          where: { companyId },
        },
        consumerProfile: {
          where: { companyId },
        },
      },
    });

    const matchedInCompany = existingUsers.find(
      (u) => (u.clientProfile && u.clientProfile.length > 0) || (u.consumerProfile && u.consumerProfile.length > 0)
    );

    if (matchedInCompany) {
      const cons = matchedInCompany.consumerProfile?.[0];
      const client = matchedInCompany.clientProfile?.[0];

      return {
        duplicate: true,
        message: `A customer with this ${cleanPhone && matchedInCompany.phone === cleanPhone ? "phone number" : "email"} already exists in your store.`,
        customer: {
          id: matchedInCompany.id,
          clientId: client?.id,
          name: matchedInCompany.name || cleanName,
          phone: matchedInCompany.phone || cleanPhone,
          email: matchedInCompany.email || cleanEmail,
          address: matchedInCompany.address || address,
          notes: client?.notes || cons?.notes || notes,
          customerNumber: cons?.loginCode || matchedInCompany.id.slice(-6).toUpperCase(),
        },
      };
    }
  }

  // Create User + Client + Consumer atomically
  const generatedEmail = cleanEmail || `${cleanPhone ? cleanPhone.replace(/[^0-9]/g, "") : Date.now()}@pos.customer.local`;
  const loginCode = Math.floor(100000 + Math.random() * 900000).toString();

  const result = await prisma.$transaction(async (tx) => {
    // Check if user exists globally by email
    let user = await tx.user.findUnique({
      where: { email: generatedEmail },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          name: cleanName,
          phone: cleanPhone || null,
          email: generatedEmail,
          address: address || null,
          role: "USER",
          companyId,
        },
      });
    } else {
      user = await tx.user.update({
        where: { id: user.id },
        data: {
          ...(cleanName ? { name: cleanName } : {}),
          ...(cleanPhone ? { phone: cleanPhone } : {}),
          ...(address ? { address } : {}),
        },
      });
    }

    // Ensure Client record
    let client = await tx.client.findFirst({
      where: { companyId, userId: user.id },
    });

    if (!client) {
      client = await tx.client.create({
        data: {
          companyId,
          userId: user.id,
          notes: notes || null,
        },
      });
    }

    // Ensure Consumer record
    let consumer = await tx.consumer.findFirst({
      where: { companyId, userId: user.id },
    });

    if (!consumer) {
      consumer = await tx.consumer.create({
        data: {
          companyId,
          userId: user.id,
          loginCode,
          notes: notes || null,
        },
      });
    }

    return { user, client, consumer };
  }, { maxWait: 10000, timeout: 20000 });

  return {
    duplicate: false,
    customer: {
      id: result.user.id,
      clientId: result.client.id,
      name: result.user.name || cleanName,
      phone: result.user.phone || cleanPhone,
      email: result.user.email,
      address: result.user.address || address,
      notes: result.client.notes || notes,
      customerNumber: result.consumer.loginCode,
      orderCount: 0,
      totalSpent: 0,
    },
  };
}
