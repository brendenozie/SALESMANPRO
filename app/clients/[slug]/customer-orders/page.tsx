import React from "react";
import OrderSummaryClient from "./OrderSummaryClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function OrderSummaryPage() {
  let ordersData = [];

  try {
    const res = await fetch(`${apiBaseUrl}/orders`, { cache: "no-store" });
    if (res.ok) {
      ordersData = await res.json();
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  return <OrderSummaryClient ordersData={ordersData} />;
}
