import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";

export type PaymentStatus = "INITIATED" | "PENDING" | "COMPLETED";
export type PaymentOption =
  | "cod"
  | "pickupatshop"
  | "mpesa"
  | "card"
  | "paystack"
  | "ghuba"
  | "stripe"
  | "paypal"
  | "cash"
  | "split"
  | "pending";

export interface OrderPayment {
  id: string;
  trackingNumber: string;
  customerName: string;
  companyId: string;
  totalFinalPrice: number;
  paymentOption: PaymentOption;
  paymentStatus: PaymentStatus;
  date: string;
}

const MOCK_PAYMENTS: OrderPayment[] = [
  // {
  //   id: "1",
  //   trackingNumber: "TRK-2605-A8F9B2",
  //   customerName: "Alice Kamau",
  //   companyId: "tulivuapps",
  //   totalFinalPrice: 4500,
  //   paymentOption: "mpesa",
  //   paymentStatus: "COMPLETED",
  //   date: "2026-08-06T10:30:00Z",
  // },
  // {
  //   id: "2",
  //   trackingNumber: "TRK-2605-B9C8D7",
  //   customerName: "John Doe",
  //   companyId: "tulivuapps",
  //   totalFinalPrice: 12500,
  //   paymentOption: "stripe",
  //   paymentStatus: "PENDING",
  //   date: "2026-08-06T11:15:00Z",
  // },
  // {
  //   id: "3",
  //   trackingNumber: "TRK-2605-E3F4G5",
  //   customerName: "Mercy Wanjiku",
  //   companyId: "salesmanpro",
  //   totalFinalPrice: 3200,
  //   paymentOption: "ghuba",
  //   paymentStatus: "COMPLETED",
  //   date: "2026-08-05T14:20:00Z",
  // },
  // {
  //   id: "4",
  //   trackingNumber: "TRK-2605-Z1X2C3",
  //   customerName: "Brenden",
  //   companyId: "tulivuapps",
  //   totalFinalPrice: 800,
  //   paymentOption: "cash",
  //   paymentStatus: "COMPLETED",
  //   date: "2026-08-05T09:00:00Z",
  // },
  // {
  //   id: "5",
  //   trackingNumber: "TRK-2605-Q7W8E9",
  //   customerName: "David Ochieng",
  //   companyId: "salesmanpro",
  //   totalFinalPrice: 5600,
  //   paymentOption: "paystack",
  //   paymentStatus: "PENDING",
  //   date: "2026-08-04T16:45:00Z",
  // },
  // {
  //   id: "6",
  //   trackingNumber: "TRK-2605-K3L4M5",
  //   customerName: "Grace Muthoni",
  //   companyId: "tulivuapps",
  //   totalFinalPrice: 9400,
  //   paymentOption: "mpesa",
  //   paymentStatus: "COMPLETED",
  //   date: "2026-08-03T08:12:00Z",
  // },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const status = searchParams.get("status");

    const cacheKey = `admin:payments:${companyId || "global"}:${status || "all"}`;

    // Attempt Cache Retrieval
    try {
      if (typeof cacheGet === "function") {
        const cached = await cacheGet(cacheKey);
        if (cached) {
          return NextResponse.json({
            success: true,
            data: cached,
            source: "cache",
          });
        }
      }
    } catch {
      // Continue if cache fails
    }

    let payments: OrderPayment[] = [];

    // Attempt Live Database Fetch
    try {
      if (prisma && (prisma as any).customerOrder) {
        const whereClause: any = {};
        if (companyId) whereClause.companyId = companyId;
        if (status) whereClause.paymentStatus = status;

        const dbOrders = await (prisma as any).customerOrder.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: 50,
        });

        if (dbOrders && dbOrders.length > 0) {
          payments = dbOrders.map((order: any) => ({
            id: order.id,
            trackingNumber: order.trackingNumber || order.id.slice(0, 8),
            customerName: order.customerName || "Guest",
            companyId: order.companyId,
            totalFinalPrice: Number(order.totalFinalPrice || order.total || 0),
            paymentOption: (
              order.paymentOption || "pending"
            ).toLowerCase() as PaymentOption,
            paymentStatus: (
              order.paymentStatus || "PENDING"
            ).toUpperCase() as PaymentStatus,
            date: order.createdAt
              ? new Date(order.createdAt).toISOString()
              : new Date().toISOString(),
          }));
        }
      }
    } catch {
      // Fall through to mock dataset if Prisma query fails or model is uninitialized
    }

    // Fallback Mock Dataset Filtering
    if (payments.length === 0) {
      payments = MOCK_PAYMENTS;
      if (companyId) {
        const filtered = payments.filter(
          (item) => item.companyId.toLowerCase() === companyId.toLowerCase(),
        );
        payments =
          filtered.length > 0
            ? filtered
            : MOCK_PAYMENTS.map((item) => ({ ...item, companyId }));
      }
      if (status && status !== "ALL") {
        payments = payments.filter((item) => item.paymentStatus === status);
      }
    }

    // Save to Cache
    try {
      if (typeof cacheSet === "function") {
        await cacheSet(cacheKey, payments, 60);
      }
    } catch {
      // Ignore cache write errors
    }

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error("[PAYMENTS_API_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment records." },
      { status: 500 },
    );
  }
}
