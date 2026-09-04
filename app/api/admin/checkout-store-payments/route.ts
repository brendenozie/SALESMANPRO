import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";
import { getStorePaymentTransactions } from "@/lib/payments/reportingService";

export type PaymentStatus = "INITIATED" | "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
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
  grossAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  channel?: string;
  provider?: string;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { success: false, message: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { success: false, message: "Missing required companyId" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, userId: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: auth.user.id },
      select: { companyId: true },
    });

    const isAuthorized =
      auth.user.role === "SUPER_ADMIN" ||
      canAccessCompanyAdmin({
        user: {
          id: auth.user.id,
          role: auth.user.role,
          companyId: auth.user.companyId,
          emailVerified: auth.user.emailVerified,
          isActive: auth.user.isActive,
        },
        company: { id: company.id, userId: company.userId },
        staffCompanyId: staff?.companyId,
      });

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Access denied to company payments" },
        { status: 403 }
      );
    }

    const status = searchParams.get("status") || undefined;
    const channel = searchParams.get("channel") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const search = searchParams.get("search") || undefined;
    const period = (searchParams.get("period") as any) || "all";

    const result = await getStorePaymentTransactions({
      companyId: company.id,
      status,
      channel,
      provider,
      search,
      period,
      page: 1,
      pageSize: 100,
    });

    const mappedPayments: OrderPayment[] = result.transactions.map((t) => ({
      id: t.id,
      trackingNumber: t.trackingNumber,
      customerName: t.customerName,
      companyId: t.companyId,
      totalFinalPrice: t.grossAmount,
      grossAmount: t.grossAmount,
      feeAmount: t.feeAmount,
      netAmount: t.netAmount,
      channel: t.channel,
      provider: t.provider,
      paymentOption: (t.provider.toLowerCase() as PaymentOption),
      paymentStatus: (t.status.toUpperCase() as PaymentStatus),
      date: t.date,
    }));

    return NextResponse.json({
      success: true,
      data: mappedPayments,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("[CHECKOUT_STORE_PAYMENTS_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
