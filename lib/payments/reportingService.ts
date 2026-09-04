/**
 * lib/payments/reportingService.ts
 *
 * Authoritative Unified Payment Reporting & Financial Intelligence Service.
 * Provides high-performance database-aggregated reporting for:
 * 1. Store Administrators (Store-level tenant isolation)
 * 2. Ghuba Marketplace Administrators (Ghuba GMV, fees, store net payables)
 * 3. SalesmanPro Super Admins (Global platform-wide payment intelligence)
 */

import prisma from "@/server/db/prismadb";
import { PaymentStatus, PaymentMethodType, OrderChannel, Prisma } from "@prisma/client";
import { roundCurrency, attributeOrderFinancials, DEFAULT_GHUBA_COMMISSION_RATE } from "./attribution";

/* -------------------------------------------------------------------------- */
/* TIMEZONE & DATE FILTERING (KENYA TIME - EAT UTC+3)                         */
/* -------------------------------------------------------------------------- */

export type DatePeriod =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "thisMonth"
  | "lastMonth"
  | "custom"
  | "all";

export interface DateRangeFilter {
  period?: DatePeriod;
  startDate?: string | Date;
  endDate?: string | Date;
}

/**
 * Returns UTC Date boundaries for a given period in Kenya Time (UTC+3).
 */
export function resolveDateRange(filter: DateRangeFilter): { gte?: Date; lte?: Date } {
  const period = filter.period || "30days";
  if (period === "all") return {};

  // Current time in Kenya (UTC + 3)
  const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;
  const nowUtc = new Date();
  const nowEat = new Date(nowUtc.getTime() + EAT_OFFSET_MS);

  const getStartOfEatDay = (d: Date) => {
    const start = new Date(d);
    start.setUTCHours(0, 0, 0, 0);
    return new Date(start.getTime() - EAT_OFFSET_MS);
  };

  const getEndOfEatDay = (d: Date) => {
    const end = new Date(d);
    end.setUTCHours(23, 59, 59, 999);
    return new Date(end.getTime() - EAT_OFFSET_MS);
  };

  switch (period) {
    case "today": {
      return {
        gte: getStartOfEatDay(nowEat),
        lte: getEndOfEatDay(nowEat),
      };
    }
    case "yesterday": {
      const yEat = new Date(nowEat.getTime() - 24 * 60 * 60 * 1000);
      return {
        gte: getStartOfEatDay(yEat),
        lte: getEndOfEatDay(yEat),
      };
    }
    case "7days": {
      const past7 = new Date(nowEat.getTime() - 6 * 24 * 60 * 60 * 1000);
      return {
        gte: getStartOfEatDay(past7),
        lte: getEndOfEatDay(nowEat),
      };
    }
    case "30days": {
      const past30 = new Date(nowEat.getTime() - 29 * 24 * 60 * 60 * 1000);
      return {
        gte: getStartOfEatDay(past30),
        lte: getEndOfEatDay(nowEat),
      };
    }
    case "thisMonth": {
      const startOfMonth = new Date(Date.UTC(nowEat.getUTCFullYear(), nowEat.getUTCMonth(), 1));
      return {
        gte: new Date(startOfMonth.getTime() - EAT_OFFSET_MS),
        lte: getEndOfEatDay(nowEat),
      };
    }
    case "lastMonth": {
      const startOfLast = new Date(Date.UTC(nowEat.getUTCFullYear(), nowEat.getUTCMonth() - 1, 1));
      const endOfLast = new Date(Date.UTC(nowEat.getUTCFullYear(), nowEat.getUTCMonth(), 0, 23, 59, 59, 999));
      return {
        gte: new Date(startOfLast.getTime() - EAT_OFFSET_MS),
        lte: new Date(endOfLast.getTime() - EAT_OFFSET_MS),
      };
    }
    case "custom": {
      const gte = filter.startDate ? new Date(filter.startDate) : undefined;
      const lte = filter.endDate ? new Date(filter.endDate) : undefined;
      return { gte, lte };
    }
    default:
      return {};
  }
}

/* -------------------------------------------------------------------------- */
/* 1. STORE ADMIN PAYMENT INTELLIGENCE                                        */
/* -------------------------------------------------------------------------- */

export interface StorePaymentMetrics {
  currency: string;
  totalReceived: number; // Completed payments
  directPayments: number; // Storefront / WhatsApp / POS
  ghubaPayments: number; // Payments generated via Ghuba marketplace
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
  netReceived: number; // gross - fees - refunds
  counts: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
  };
  channels: Record<string, { gross: number; count: number }>;
  providers: Record<string, { gross: number; count: number }>;
  ghuba: {
    ordersCount: number;
    grossSales: number;
    ghubaFees: number;
    refunds: number;
    netStoreAmount: number;
    pendingSettlement: number;
    settled: number;
  };
}

export async function getStorePaymentMetrics(
  companyId: string,
  filter: DateRangeFilter = {}
): Promise<StorePaymentMetrics> {
  const dateRange = resolveDateRange(filter);
  const dateWhere: any = {};
  if (dateRange.gte || dateRange.lte) {
    dateWhere.createdAt = {
      ...(dateRange.gte ? { gte: dateRange.gte } : {}),
      ...(dateRange.lte ? { lte: dateRange.lte } : {}),
    };
  }

  // 1. Fetch store's authoritative payments
  // We query payments where companyId matches OR CustomerOrder companyId matches
  const payments = await prisma.payment.findMany({
    where: {
      OR: [
        { companyId },
        { order: { companyId } },
      ],
      ...dateWhere,
    },
    select: {
      id: true,
      amount: true,
      grossAmount: true,
      feeAmount: true,
      netAmount: true,
      refundAmount: true,
      status: true,
      channel: true,
      provider: true,
      currency: true,
      settlementStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5000, // Safe upper boundary for aggregates
  });

  // 2. Also check for multi-store Ghuba orders where items belong to this store
  // but the order.companyId was assigned to another store or marketplace
  const multiStoreItems = await prisma.orderItem.findMany({
    where: {
      marketplaceListing: { companyId },
      order: {
        companyId: { not: companyId },
        ...dateWhere,
      },
    },
    include: {
      order: {
        select: {
          id: true,
          paymentStatus: true,
          paymentMethod: true,
          channel: true,
          createdAt: true,
        },
      },
      Return: true,
    },
    take: 2000,
  });

  let totalReceived = 0;
  let directPayments = 0;
  let ghubaPayments = 0;
  let pendingAmount = 0;
  let failedAmount = 0;
  let refundedAmount = 0;
  let netReceived = 0;

  const counts = {
    total: payments.length,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
  };

  const channels: Record<string, { gross: number; count: number }> = {
    "Store Direct": { gross: 0, count: 0 },
    Ghuba: { gross: 0, count: 0 },
    WhatsApp: { gross: 0, count: 0 },
    POS: { gross: 0, count: 0 },
  };

  const providers: Record<string, { gross: number; count: number }> = {};

  const ghubaSummary = {
    ordersCount: 0,
    grossSales: 0,
    ghubaFees: 0,
    refunds: 0,
    netStoreAmount: 0,
    pendingSettlement: 0,
    settled: 0,
  };

  for (const p of payments) {
    const gross = roundCurrency(Number(p.grossAmount || p.amount || 0));
    const fee = roundCurrency(Number(p.feeAmount || 0));
    const refund = roundCurrency(Number(p.refundAmount || 0));
    const net = roundCurrency(Number(p.netAmount || gross - fee - refund));

    const statusStr = String(p.status).toUpperCase();
    const channelStr = String(p.channel || "WEBSITE").toUpperCase();
    const providerStr = String(p.provider || "OTHER").toUpperCase();

    // Provider stats
    if (!providers[providerStr]) {
      providers[providerStr] = { gross: 0, count: 0 };
    }
    providers[providerStr].count += 1;

    if (statusStr === "COMPLETED") {
      counts.completed += 1;
      totalReceived = roundCurrency(totalReceived + gross);
      netReceived = roundCurrency(netReceived + net);
      refundedAmount = roundCurrency(refundedAmount + refund);
      providers[providerStr].gross = roundCurrency(providers[providerStr].gross + gross);

      if (channelStr.includes("GHUBA")) {
        ghubaPayments = roundCurrency(ghubaPayments + gross);
        channels["Ghuba"].gross = roundCurrency(channels["Ghuba"].gross + gross);
        channels["Ghuba"].count += 1;

        ghubaSummary.ordersCount += 1;
        ghubaSummary.grossSales = roundCurrency(ghubaSummary.grossSales + gross);
        ghubaSummary.ghubaFees = roundCurrency(ghubaSummary.ghubaFees + fee);
        ghubaSummary.refunds = roundCurrency(ghubaSummary.refunds + refund);
        ghubaSummary.netStoreAmount = roundCurrency(ghubaSummary.netStoreAmount + net);

        if (p.settlementStatus === "SETTLED") {
          ghubaSummary.settled = roundCurrency(ghubaSummary.settled + net);
        } else {
          ghubaSummary.pendingSettlement = roundCurrency(ghubaSummary.pendingSettlement + net);
        }
      } else if (channelStr.includes("WHATSAPP")) {
        directPayments = roundCurrency(directPayments + gross);
        channels["WhatsApp"].gross = roundCurrency(channels["WhatsApp"].gross + gross);
        channels["WhatsApp"].count += 1;
      } else if (channelStr.includes("POS")) {
        directPayments = roundCurrency(directPayments + gross);
        channels["POS"].gross = roundCurrency(channels["POS"].gross + gross);
        channels["POS"].count += 1;
      } else {
        directPayments = roundCurrency(directPayments + gross);
        channels["Store Direct"].gross = roundCurrency(channels["Store Direct"].gross + gross);
        channels["Store Direct"].count += 1;
      }
    } else if (statusStr === "PENDING" || statusStr === "INITIATED" || statusStr === "PROCESSING") {
      counts.pending += 1;
      pendingAmount = roundCurrency(pendingAmount + gross);
    } else if (statusStr === "FAILED" || statusStr === "CANCELLED") {
      counts.failed += 1;
      failedAmount = roundCurrency(failedAmount + gross);
    } else if (statusStr === "REFUNDED" || statusStr === "PARTIALLY_REFUNDED") {
      counts.refunded += 1;
      refundedAmount = roundCurrency(refundedAmount + gross);
    }
  }

  // Factor in multi-store items from other orders
  for (const item of multiStoreItems) {
    const itemGross = roundCurrency(Number(item.totalPrice || item.price * item.quantity));
    const fee = roundCurrency(itemGross * DEFAULT_GHUBA_COMMISSION_RATE);
    const itemRefunds = (item.Return || [])
      .filter((r) => r.status === "APPROVED")
      .reduce((sum, r) => sum + Number(r.refundAmount || 0), 0);
    const net = roundCurrency(itemGross - fee - itemRefunds);

    if (item.order?.paymentStatus === "COMPLETED") {
      totalReceived = roundCurrency(totalReceived + itemGross);
      ghubaPayments = roundCurrency(ghubaPayments + itemGross);
      netReceived = roundCurrency(netReceived + net);
      refundedAmount = roundCurrency(refundedAmount + itemRefunds);

      ghubaSummary.ordersCount += 1;
      ghubaSummary.grossSales = roundCurrency(ghubaSummary.grossSales + itemGross);
      ghubaSummary.ghubaFees = roundCurrency(ghubaSummary.ghubaFees + fee);
      ghubaSummary.refunds = roundCurrency(ghubaSummary.refunds + itemRefunds);
      ghubaSummary.netStoreAmount = roundCurrency(ghubaSummary.netStoreAmount + net);
      ghubaSummary.pendingSettlement = roundCurrency(ghubaSummary.pendingSettlement + net);

      channels["Ghuba"].gross = roundCurrency(channels["Ghuba"].gross + itemGross);
      channels["Ghuba"].count += 1;
    }
  }

  return {
    currency: "KES",
    totalReceived,
    directPayments,
    ghubaPayments,
    pendingAmount,
    failedAmount,
    refundedAmount,
    netReceived,
    counts,
    channels,
    providers,
    ghuba: ghubaSummary,
  };
}

/* -------------------------------------------------------------------------- */
/* 2. STORE PAGINATED TRANSACTION LIST                                        */
/* -------------------------------------------------------------------------- */

export interface TransactionQueryOptions extends DateRangeFilter {
  companyId: string;
  search?: string;
  status?: string;
  channel?: string;
  provider?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentTransactionItem {
  id: string;
  orderId: string;
  trackingNumber: string;
  customerName: string;
  companyId: string;
  channel: string;
  provider: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  refundAmount: number;
  currency: string;
  status: string;
  settlementStatus: string;
  transactionId: string;
  providerTransactionId?: string | null;
  date: string;
  isMultiStoreGhuba?: boolean;
}

export async function getStorePaymentTransactions(opts: TransactionQueryOptions) {
  const {
    companyId,
    search,
    status,
    channel,
    provider,
    page = 1,
    pageSize = 25,
  } = opts;

  const dateRange = resolveDateRange(opts);
  const where: any = {
    OR: [
      { companyId },
      { order: { companyId } },
    ],
  };

  if (dateRange.gte || dateRange.lte) {
    where.createdAt = {
      ...(dateRange.gte ? { gte: dateRange.gte } : {}),
      ...(dateRange.lte ? { lte: dateRange.lte } : {}),
    };
  }

  if (status && status !== "ALL") {
    where.status = status.toUpperCase() as PaymentStatus;
  }

  if (channel && channel !== "ALL") {
    where.channel = channel.toUpperCase() as OrderChannel;
  }

  if (provider && provider !== "ALL") {
    where.provider = provider.toUpperCase() as PaymentMethodType;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.AND = [
      {
        OR: [
          { transactionId: { contains: q, mode: "insensitive" } },
          { providerTransactionId: { contains: q, mode: "insensitive" } },
          { internalReference: { contains: q, mode: "insensitive" } },
          { order: { trackingNumber: { contains: q, mode: "insensitive" } } },
          { order: { name: { contains: q, mode: "insensitive" } } },
          { order: { email: { contains: q, mode: "insensitive" } } },
        ],
      },
    ];
  }

  const [totalCount, records] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        order: {
          select: {
            id: true,
            trackingNumber: true,
            name: true,
            email: true,
            channel: true,
            paymentOption: true,
            totalFinalPrice: true,
            items: {
              select: {
                id: true,
                marketplaceListingId: true,
                quantity: true,
                price: true,
                totalPrice: true,
                marketplaceListing: { select: { companyId: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const transactions: PaymentTransactionItem[] = records.map((p) => {
    const order = p.order;
    const gross = roundCurrency(Number(p.grossAmount || p.amount || 0));
    const fee = roundCurrency(Number(p.feeAmount || 0));
    const refund = roundCurrency(Number(p.refundAmount || 0));
    const net = roundCurrency(Number(p.netAmount || gross - fee - refund));

    return {
      id: p.id,
      orderId: p.orderId,
      trackingNumber: order?.trackingNumber || p.internalReference || p.orderId.slice(0, 8),
      customerName: order?.name || "Guest Customer",
      companyId: p.companyId || companyId,
      channel: p.channel || order?.channel || "WEBSITE",
      provider: p.provider || order?.paymentOption?.toUpperCase() || "MPESA",
      grossAmount: gross,
      feeAmount: fee,
      netAmount: net,
      refundAmount: refund,
      currency: p.currency || "KES",
      status: p.status,
      settlementStatus: p.settlementStatus || "UNSETTLED",
      transactionId: p.transactionId,
      providerTransactionId: p.providerTransactionId,
      date: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    };
  });

  return {
    transactions,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 3. GHUBA MARKETPLACE ADMIN INTELLIGENCE                                    */
/* -------------------------------------------------------------------------- */

export interface GhubaAdminMetrics {
  totalGhubaGMV: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  totalRefunds: number;
  grossStoreSales: number;
  ghubaFeesEarned: number;
  netPayableToStores: number;
  pendingSettlement: number;
  settledAmount: number;
  averageOrderValue: number;
  topStores: Array<{ companyId: string; storeName: string; gross: number; orders: number }>;
}

export async function getGhubaAdminMetrics(filter: DateRangeFilter = {}): Promise<GhubaAdminMetrics> {
  const dateRange = resolveDateRange(filter);
  const dateWhere: any = {};
  if (dateRange.gte || dateRange.lte) {
    dateWhere.createdAt = {
      ...(dateRange.gte ? { gte: dateRange.gte } : {}),
      ...(dateRange.lte ? { lte: dateRange.lte } : {}),
    };
  }

  // Find all orders generated through Ghuba or having marketplace items
  const ghubaOrders = await prisma.customerOrder.findMany({
    where: {
      OR: [
        { channel: "WEBSITE", orderSource: "WEBSITE", items: { some: { marketplaceListingId: { not: null } } } },
        { paymentOption: "ghuba" },
        { paymentMethod: "GHUBA" },
      ],
      ...dateWhere,
    },
    include: {
      items: {
        include: {
          marketplaceListing: {
            include: {
              company: { select: { id: true, name: true } },
              CommissionRate: true,
            },
          },
          Return: true,
        },
      },
    },
    take: 5000,
  });

  let totalGMV = 0;
  let successfulCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  let totalRefunds = 0;
  let ghubaFees = 0;
  let pendingSettlement = 0;
  let settledAmount = 0;

  const storeMap: Record<string, { companyId: string; storeName: string; gross: number; orders: number }> = {};

  for (const o of ghubaOrders) {
    const summary = attributeOrderFinancials(o as any);
    const orderGross = summary.totalGross;
    const orderFees = summary.totalPlatformFees;
    const orderRefunds = summary.totalRefunds;

    if (o.paymentStatus === "COMPLETED") {
      successfulCount += 1;
      totalGMV = roundCurrency(totalGMV + orderGross);
      ghubaFees = roundCurrency(ghubaFees + orderFees);
      totalRefunds = roundCurrency(totalRefunds + orderRefunds);

      // Aggregate per store
      for (const [sCompanyId, attr] of Object.entries(summary.attributions)) {
        if (!storeMap[sCompanyId]) {
          storeMap[sCompanyId] = {
            companyId: sCompanyId,
            storeName: `Store #${sCompanyId.slice(0, 6)}`,
            gross: 0,
            orders: 0,
          };
        }
        storeMap[sCompanyId].gross = roundCurrency(storeMap[sCompanyId].gross + attr.grossAmount);
        storeMap[sCompanyId].orders += 1;
      }
    } else if (o.paymentStatus === "PENDING" || o.paymentStatus === "INITIATED") {
      pendingCount += 1;
    } else if (o.paymentStatus === "FAILED") {
      failedCount += 1;
    }
  }

  const grossStoreSales = totalGMV;
  const netPayableToStores = roundCurrency(grossStoreSales - ghubaFees - totalRefunds);
  const averageOrderValue = successfulCount > 0 ? roundCurrency(totalGMV / successfulCount) : 0;

  const topStores = Object.values(storeMap)
    .sort((a, b) => b.gross - a.gross)
    .slice(0, 10);

  return {
    totalGhubaGMV: totalGMV,
    successfulCount,
    pendingCount,
    failedCount,
    totalRefunds,
    grossStoreSales,
    ghubaFeesEarned: ghubaFees,
    netPayableToStores,
    pendingSettlement: netPayableToStores, // until paid out via settlement API
    settledAmount,
    averageOrderValue,
    topStores,
  };
}

/* -------------------------------------------------------------------------- */
/* 4. SALESMANPRO PLATFORM GLOBAL INTELLIGENCE                                 */
/* -------------------------------------------------------------------------- */

export interface PlatformGlobalMetrics {
  totalPaymentVolume: number;
  successfulPaymentsCount: number;
  failedPaymentsCount: number;
  pendingPaymentsCount: number;
  totalRefunds: number;
  ghubaPaymentVolume: number;
  directStorePaymentVolume: number;
  platformRevenue: number;
  ghubaFees: number;
  storeNetAmounts: number;
  providerBreakdown: Record<string, { volume: number; count: number }>;
  channelBreakdown: Record<string, { volume: number; count: number }>;
}

export async function getPlatformPaymentMetrics(filter: DateRangeFilter = {}): Promise<PlatformGlobalMetrics> {
  const dateRange = resolveDateRange(filter);
  const dateWhere: any = {};
  if (dateRange.gte || dateRange.lte) {
    dateWhere.createdAt = {
      ...(dateRange.gte ? { gte: dateRange.gte } : {}),
      ...(dateRange.lte ? { lte: dateRange.lte } : {}),
    };
  }

  // Database level aggregation on authoritative Payments
  const [aggregates, payments] = await Promise.all([
    prisma.payment.aggregate({
      where: dateWhere,
      _sum: {
        amount: true,
        grossAmount: true,
        feeAmount: true,
        netAmount: true,
        refundAmount: true,
      },
      _count: {
        id: true,
      },
    }),
    prisma.payment.findMany({
      where: dateWhere,
      select: {
        id: true,
        amount: true,
        grossAmount: true,
        feeAmount: true,
        netAmount: true,
        refundAmount: true,
        status: true,
        channel: true,
        provider: true,
      },
      take: 10000,
    }),
  ]);

  let totalVolume = 0;
  let successfulCount = 0;
  let failedCount = 0;
  let pendingCount = 0;
  let totalRefunds = 0;
  let ghubaVolume = 0;
  let directVolume = 0;
  let ghubaFees = 0;
  let platformRevenue = 0;
  let storeNet = 0;

  const providerBreakdown: Record<string, { volume: number; count: number }> = {};
  const channelBreakdown: Record<string, { volume: number; count: number }> = {
    DIRECT: { volume: 0, count: 0 },
    GHUBA: { volume: 0, count: 0 },
    WHATSAPP: { volume: 0, count: 0 },
    POS: { volume: 0, count: 0 },
  };

  for (const p of payments) {
    const gross = roundCurrency(Number(p.grossAmount || p.amount || 0));
    const fee = roundCurrency(Number(p.feeAmount || 0));
    const refund = roundCurrency(Number(p.refundAmount || 0));
    const net = roundCurrency(Number(p.netAmount || gross - fee - refund));

    const status = String(p.status).toUpperCase();
    const provider = String(p.provider || "OTHER").toUpperCase();
    const channel = String(p.channel || "WEBSITE").toUpperCase();

    if (!providerBreakdown[provider]) {
      providerBreakdown[provider] = { volume: 0, count: 0 };
    }
    providerBreakdown[provider].count += 1;

    if (status === "COMPLETED") {
      successfulCount += 1;
      totalVolume = roundCurrency(totalVolume + gross);
      totalRefunds = roundCurrency(totalRefunds + refund);
      storeNet = roundCurrency(storeNet + net);
      providerBreakdown[provider].volume = roundCurrency(providerBreakdown[provider].volume + gross);

      if (channel.includes("GHUBA")) {
        ghubaVolume = roundCurrency(ghubaVolume + gross);
        ghubaFees = roundCurrency(ghubaFees + fee);
        channelBreakdown.GHUBA.volume = roundCurrency(channelBreakdown.GHUBA.volume + gross);
        channelBreakdown.GHUBA.count += 1;
      } else if (channel.includes("WHATSAPP")) {
        directVolume = roundCurrency(directVolume + gross);
        channelBreakdown.WHATSAPP.volume = roundCurrency(channelBreakdown.WHATSAPP.volume + gross);
        channelBreakdown.WHATSAPP.count += 1;
      } else if (channel.includes("POS")) {
        directVolume = roundCurrency(directVolume + gross);
        channelBreakdown.POS.volume = roundCurrency(channelBreakdown.POS.volume + gross);
        channelBreakdown.POS.count += 1;
      } else {
        directVolume = roundCurrency(directVolume + gross);
        channelBreakdown.DIRECT.volume = roundCurrency(channelBreakdown.DIRECT.volume + gross);
        channelBreakdown.DIRECT.count += 1;
      }
    } else if (status === "FAILED" || status === "CANCELLED") {
      failedCount += 1;
    } else {
      pendingCount += 1;
    }
  }

  // Also query SaaS Subscription payments for Platform Revenue
  const subscriptionAggregates = await prisma.subscriptionPayment.aggregate({
    where: {
      status: "COMPLETED",
      ...(dateRange.gte || dateRange.lte ? { createdAt: dateWhere.createdAt } : {}),
    },
    _sum: {
      amount: true,
    },
  });
  platformRevenue = roundCurrency(Number(subscriptionAggregates._sum.amount || 0));

  return {
    totalPaymentVolume: totalVolume,
    successfulPaymentsCount: successfulCount,
    failedPaymentsCount: failedCount,
    pendingPaymentsCount: pendingCount,
    totalRefunds,
    ghubaPaymentVolume: ghubaVolume,
    directStorePaymentVolume: directVolume,
    platformRevenue,
    ghubaFees,
    storeNetAmounts: storeNet,
    providerBreakdown,
    channelBreakdown,
  };
}

/* -------------------------------------------------------------------------- */
/* 5. INDIVIDUAL PAYMENT TRANSACTION DETAILS                                  */
/* -------------------------------------------------------------------------- */

export async function getPaymentDetails(
  paymentId: string,
  userCompanyId?: string | null,
  isPlatformAdmin: boolean = false
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          items: {
            include: {
              marketplaceListing: {
                select: {
                  id: true,
                  name: true,
                  companyId: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  companyId: true,
                },
              },
              Return: true,
            },
          },
          Company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  // Multi-tenant Security Check
  if (!isPlatformAdmin) {
    if (!userCompanyId) {
      throw new Error("Unauthorized: Company context required");
    }
    const orderCompanyId = payment.companyId || payment.order?.companyId;
    const hasStoreItem = payment.order?.items?.some(
      (i) =>
        i.marketplaceListing?.companyId === userCompanyId ||
        i.product?.companyId === userCompanyId
    );

    if (orderCompanyId !== userCompanyId && !hasStoreItem) {
      throw new Error("Forbidden: You do not have access to this payment record.");
    }
  }

  const financialSummary = payment.order
    ? attributeOrderFinancials(payment.order as any)
    : null;

  return {
    payment: {
      id: payment.id,
      transactionId: payment.transactionId,
      providerTransactionId: payment.providerTransactionId,
      internalReference: payment.internalReference,
      status: payment.status,
      settlementStatus: payment.settlementStatus,
      amount: roundCurrency(Number(payment.amount || 0)),
      grossAmount: roundCurrency(Number(payment.grossAmount || payment.amount || 0)),
      feeAmount: roundCurrency(Number(payment.feeAmount || 0)),
      netAmount: roundCurrency(Number(payment.netAmount || 0)),
      refundAmount: roundCurrency(Number(payment.refundAmount || 0)),
      currency: payment.currency,
      channel: payment.channel,
      provider: payment.provider,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      metadata: payment.metadata,
    },
    order: payment.order
      ? {
          id: payment.order.id,
          trackingNumber: payment.order.trackingNumber,
          customerName: payment.order.name,
          email: payment.order.email,
          phone: payment.order.phone,
          deliveryStatus: payment.order.deliveryStatus,
          status: payment.order.status,
          company: payment.order.Company,
          items: payment.order.items
            .filter((item) => {
              if (isPlatformAdmin) return true;
              const itemStore =
                item.marketplaceListing?.companyId || item.product?.companyId;
              return itemStore === userCompanyId || payment.companyId === userCompanyId;
            })
            .map((item) => ({
              id: item.id,
              name: item.marketplaceListing?.name || item.product?.name || "Item",
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.totalPrice,
              companyId: item.marketplaceListing?.companyId || item.product?.companyId,
            })),
        }
      : null,
    attribution: financialSummary && userCompanyId && financialSummary.attributions[userCompanyId]
      ? financialSummary.attributions[userCompanyId]
      : null,
  };
}
