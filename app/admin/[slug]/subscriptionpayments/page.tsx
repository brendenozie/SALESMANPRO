// app/admin/[adminSlug]/subscriptions/page.tsx
import React from "react";
import SubscriptionPaymentsClient from "./SubscriptionPaymentsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type SubscriptionPayment = {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  gateway: string;
  meta: { phone?: string };
  createdAt: string;
  subscription: {
    user: { name: string; email: string };
    plan: { name: string };
  };
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubscriptionPaymentsPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  let paymentsData: SubscriptionPayment[] = [];

  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/admin/subscriptions-payments?companyId=${companyId}`, {
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      paymentsData = json.data || [];
    } else {
      console.error("[SubscriptionPaymentsPage] Fetch error:", res.statusText);
    }
  } catch (err: any) {
    console.error("[SubscriptionPaymentsPage] Error:", err.message);
  }

  return <SubscriptionPaymentsClient paymentsData={paymentsData} />;
}