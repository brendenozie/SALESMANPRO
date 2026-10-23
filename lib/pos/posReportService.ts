import prisma from "@/server/db/prismadb";

export interface PaymentMethodSummary {
  method: string;
  count: number;
  total: number;
}

export interface ShiftReportData {
  reportType: "X_REPORT" | "Z_REPORT";
  reportTitle: string;
  reportNumber: string;
  generatedAt: string;
  company: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    taxId?: string;
    currency: string;
  };
  session: {
    id: string;
    terminalId: string;
    openedAt: string;
    closedAt?: string | null;
    status: string;
  };
  operator: {
    id: string;
    name: string;
    role: string;
  };
  financials: {
    totalTransactions: number;
    grossSales: number;
    totalDiscounts: number;
    totalTax: number;
    netSales: number;
    averageTransactionValue: number;
  };
  paymentBreakdown: PaymentMethodSummary[];
  drawerReconciliation: {
    openingFloat: number;
    cashSales: number;
    cashRefunds: number;
    expectedCash: number;
    countedCash?: number | null;
    variance?: number | null;
    isBalanced: boolean;
  };
  notes?: string | null;
}

/**
 * Generate comprehensive financial data for an X-Report (interim reading) or Z-Report (end-of-day closure)
 */
export async function generateShiftReportData(
  sessionId: string,
  companyId: string,
  reportType: "X_REPORT" | "Z_REPORT",
  options?: {
    countedCash?: number;
    notes?: string;
  }
): Promise<ShiftReportData> {
  if (!sessionId || !companyId) {
    throw new Error("Session ID and Company context are required");
  }

  // 1. Fetch Session and Company context
  const [session, company] = await Promise.all([
    prisma.posSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        operator: true,
        staffProfile: true,
      },
    }),
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        address: true,
        contactPhone: true,
        currency: true,
      },
    }),
  ]);

  if (!session) {
    throw new Error("POS session not found");
  }

  // 2. Fetch all valid orders attached to this shift
  const orders = await prisma.customerOrder.findMany({
    where: {
      posSessionId: sessionId,
      status: { notIn: ["CANCELLED", "FAILED"] },
    },
    select: {
      id: true,
      totalPrice: true,
      totalTax: true,
      totalDiscount: true,
      totalFinalPrice: true,
      paymentOption: true,
      billingAddress: true,
    },
  });

  // 3. Aggregate financial totals
  let grossSales = 0;
  let totalDiscounts = 0;
  let totalTax = 0;
  let netSales = 0;

  const paymentMap: Record<string, { count: number; total: number }> = {};

  for (const ord of orders) {
    const finalPrice = ord.totalFinalPrice || 0;
    const discount = ord.totalDiscount || 0;
    const tax = ord.totalTax || 0;
    const subtotal = ord.totalPrice || finalPrice;

    grossSales += subtotal;
    totalDiscounts += discount;
    totalTax += tax;
    netSales += finalPrice;

    // Check payment option (e.g. CASH, MPESA, CARD, SPLIT, PENDING)
    const rawMethod = (ord.paymentOption || "CASH").toUpperCase();

    // Check if this was a split payment with breakdown
    const billing = ord.billingAddress as any;
    const splits = billing?.paymentBreakdown as { method: string; amount: number }[] | undefined;

    if (rawMethod === "SPLIT" && Array.isArray(splits) && splits.length > 0) {
      for (const s of splits) {
        const m = (s.method || "CASH").toUpperCase();
        if (!paymentMap[m]) paymentMap[m] = { count: 0, total: 0 };
        paymentMap[m].total += s.amount;
        paymentMap[m].count += 1;
      }
    } else {
      if (!paymentMap[rawMethod]) paymentMap[rawMethod] = { count: 0, total: 0 };
      paymentMap[rawMethod].total += finalPrice;
      paymentMap[rawMethod].count += 1;
    }
  }

  const totalTransactions = orders.length;
  const averageTransactionValue = totalTransactions > 0 ? netSales / totalTransactions : 0;

  const paymentBreakdown: PaymentMethodSummary[] = Object.entries(paymentMap).map(
    ([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
    })
  );

  // 4. Cash Drawer Reconciliation
  const openingFloat = session.openingBalance || 0;
  const cashSales = paymentMap["CASH"]?.total || 0;
  const cashRefunds = session.cashRefunds || 0;
  const expectedCash = openingFloat + cashSales - cashRefunds;

  const countedCash =
    options?.countedCash !== undefined
      ? options.countedCash
      : session.countedCash !== null
      ? session.countedCash
      : null;

  const variance = countedCash !== null ? countedCash - expectedCash : null;
  const isBalanced = variance !== null ? Math.abs(variance) < 0.01 : false;

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "").slice(0, 4);
  const reportNumber =
    reportType === "Z_REPORT"
      ? `Z-${session.terminalId || "T01"}-${dateStr}-${session.id.slice(-4).toUpperCase()}`
      : `X-${session.terminalId || "T01"}-${dateStr}-${timeStr}`;

  return {
    reportType,
    reportTitle:
      reportType === "Z_REPORT"
        ? "OFFICIAL Z-REPORT (DAILY CLOSING SETTLEMENT)"
        : "OFFICIAL X-REPORT (INTERIM SHIFT READING)",
    reportNumber,
    generatedAt: now.toISOString(),
    company: {
      id: company?.id || companyId,
      name: company?.name || "SalesmanPro Store",
      address: company?.address || undefined,
      phone: company?.contactPhone || undefined,
      currency: company?.currency || "KES",
    },
    session: {
      id: session.id,
      terminalId: session.terminalId || "T01",
      openedAt: session.openedAt.toISOString(),
      closedAt: session.closedAt ? session.closedAt.toISOString() : null,
      status: session.status,
    },
    operator: {
      id: session.operator.id,
      name: session.operator.name || "Cashier",
      role:
        session.staffProfile?.posRole ||
        session.staffProfile?.jobTitle ||
        session.operator.role ||
        "CASHIER",
    },
    financials: {
      totalTransactions,
      grossSales,
      totalDiscounts,
      totalTax,
      netSales,
      averageTransactionValue,
    },
    paymentBreakdown,
    drawerReconciliation: {
      openingFloat,
      cashSales,
      cashRefunds,
      expectedCash,
      countedCash,
      variance,
      isBalanced,
    },
    notes: options?.notes || session.notes || null,
  };
}
