import React from "react";
import OrderSummaryClient from "./OrderSummaryClient";

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function OrderSummaryPage() {
  let ordersData = [];

  try {
    const res = await fetch(`${apiBaserUrl}/orders`, { cache: "no-store" });
    if (res.ok) {
      ordersData = await res.json();
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  return <OrderSummaryClient ordersData={ordersData} />;
}
