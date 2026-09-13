import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as {
      user?: { email?: string | null; name?: string | null; id?: string };
    } | null;

    if (!session?.user?.email) {
      return formatResponse(false, null, "Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true, companyId: true },
    });

    if (!user) {
      return formatResponse(false, null, "User account not found", 401);
    }

    const { searchParams } = new URL(req.url);
    const requestedCompanyId = searchParams.get("companyId") || user.companyId;
    const filter = searchParams.get("filter") || "ALL_CUSTOMERS"; // ALL_CUSTOMERS, REPEAT_BUYERS, RECENT_BUYERS, LEADS

    if (!requestedCompanyId) {
      return formatResponse(false, null, "Store companyId is required", 400);
    }

    // Verify user owns or belongs to this store, or is Super Admin
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.companyId !== requestedCompanyId) {
      const ownedCompany = await prisma.company.findFirst({
        where: { id: requestedCompanyId, userId: user.id },
      });
      if (!ownedCompany) {
        return formatResponse(false, null, "Unauthorized access to this store context", 403);
      }
    }

    // 1. Fetch store consumers
    const consumers = await prisma.consumer.findMany({
      where: { companyId: requestedCompanyId },
      select: {
        id: true,
        type: true,
        totalOrders: true,
        totalSpent: true,
        lastPurchaseAt: true,
        user: {
          select: { name: true, email: true },
        },
      },
      take: 2000,
    });

    // 2. Fetch customers from orders with this store
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const orderCustomers = await prisma.customerOrder.findMany({
      where: {
        companyId: requestedCompanyId,
        email: { not: null },
      },
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });

    // Map unique customers by email
    const customerMap = new Map<
      string,
      {
        name: string;
        email: string;
        totalOrders: number;
        lastPurchaseAt?: Date | null;
        isLead: boolean;
      }
    >();

    // Populate from consumers
    for (const c of consumers) {
      const email = (c.user?.email || "").trim().toLowerCase();
      if (email && email.includes("@")) {
        customerMap.set(email, {
          name: c.user?.name || email.split("@")[0],
          email,
          totalOrders: c.totalOrders || 0,
          lastPurchaseAt: c.lastPurchaseAt,
          isLead: c.type === "lead" || (c.totalOrders || 0) === 0,
        });
      }
    }

    // Populate / update from orders
    for (const o of orderCustomers) {
      const email = (o.email || "").trim().toLowerCase();
      if (email && email.includes("@")) {
        const existing = customerMap.get(email);
        if (existing) {
          existing.totalOrders = Math.max(existing.totalOrders, 1);
          if (!existing.lastPurchaseAt || (o.createdAt && o.createdAt > existing.lastPurchaseAt)) {
            existing.lastPurchaseAt = o.createdAt;
          }
          existing.isLead = false;
        } else {
          customerMap.set(email, {
            name: o.name || email.split("@")[0],
            email,
            totalOrders: 1,
            lastPurchaseAt: o.createdAt,
            isLead: false,
          });
        }
      }
    }

    const allCustomersList = Array.from(customerMap.values());

    // Calculate segments
    const repeatBuyers = allCustomersList.filter((c) => c.totalOrders >= 2);
    const recentBuyers = allCustomersList.filter(
      (c) => c.lastPurchaseAt && new Date(c.lastPurchaseAt) >= thirtyDaysAgo
    );
    const leads = allCustomersList.filter((c) => c.isLead);

    let matchingList = allCustomersList;
    if (filter === "REPEAT_BUYERS") {
      matchingList = repeatBuyers;
    } else if (filter === "RECENT_BUYERS") {
      matchingList = recentBuyers;
    } else if (filter === "LEADS") {
      matchingList = leads;
    }

    const sampleRecipients = matchingList.slice(0, 6).map((c) => ({
      name: c.name,
      email: c.email,
    }));

    return formatResponse(
      true,
      {
        matchingCount: matchingList.length,
        breakdown: {
          all: allCustomersList.length,
          repeat: repeatBuyers.length,
          recent: recentBuyers.length,
          leads: leads.length,
        },
        sampleRecipients,
      },
      "Store audience resolved successfully",
      200
    );
  } catch (err: any) {
    console.error("[Store Email Audience] GET error:", err);
    return formatResponse(false, null, err.message || "Failed to resolve store audience", 500);
  }
}
