import React from "react";
import { cookies } from "next/headers";
import CompanyPaymentsDashboardClient from "./CompanyPaymentsDashboardClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  const { slug: companyId } = await params;
  let paymentsData: OrderPayment[] = [];
  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/admin/checkout-store-payments?companyId=${companyId}`, {
      next: { revalidate: 30 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    if (res.ok) {
      const rawData = await res.json();
      paymentsData = Array.isArray(rawData.data) ? rawData.data : [];
    } else {
      console.error(
        "[CompanyPaymentsPage] Failed to fetch payments →",
        res.status,
        res.statusText
      );
    }
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