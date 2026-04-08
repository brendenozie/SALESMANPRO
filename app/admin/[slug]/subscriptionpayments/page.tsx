// app/admin/[adminSlug]/subscriptions/page.tsx
import React from "react";
import SubscriptionPaymentsClient from "./SubscriptionPaymentsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function SubscriptionPaymentsPage() {
  let paymentsData = [];
  const cookieHeader = (await cookies()).toString();

  try {
    // Fetch all subscriptions globally for the admin
    const res = await fetch(`${apiBaseUrl}/admin/subscriptions-payments`, {
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      // console.log("[SubscriptionPaymentsPage] Fetched data:", json);
      paymentsData = json.data || [];
    }
  } catch (err: any) {
    console.error("[SubscriptionPaymentsPage] Error:", err.message);
  }

  return <SubscriptionPaymentsClient paymentsData={paymentsData} />;
}