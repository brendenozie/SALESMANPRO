import React from "react";
import { cookies } from "next/headers";
import CompanyPaymentsDashboardClient from "./CompanyPaymentsDashboardClient";
import { findCompanyCached } from "@/lib/company-fetcher";
import { getStorePaymentTransactions } from "@/lib/payments/reportingService";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompanyPaymentsPage({ params }: PageProps) {
  const { slug } = await params;
  let paymentsData: OrderPayment[] = [];
  const cookieHeader = (await cookies()).toString();

    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  try {
    const result = await getStorePaymentTransactions({
      companyId: companyId,
      page: 1,
      pageSize: 100,
      period: "all",
    });

    paymentsData = (result.transactions || []).map((t: any) => ({
      id: t.id,
      trackingNumber: t.trackingNumber || `TRK-${t.id.slice(-6).toUpperCase()}`,
      customerName: t.customerName || "Customer",
      companyId: t.companyId || companyId,
      totalFinalPrice: t.grossAmount ?? t.netAmount ?? 0,
      paymentOption: (t.provider?.toLowerCase() as PaymentOption) || "pending",
      paymentStatus: (t.status?.toUpperCase() as PaymentStatus) || "PENDING",
      date: t.date || new Date().toISOString(),
    }));
  } catch (err: any) {
    console.error("[CompanyPaymentsPage] Error fetching payments →", err.message);
  }

  return (
    <CompanyPaymentsDashboardClient 
      companyId={companyId} 
      initialPayments={paymentsData} 
    />
  );
}