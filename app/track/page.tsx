import React from "react";
import OrderTrackingView from "@/components/site/OrderTrackingView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Tracking | SalesmanPro & Ghuba Network",
  description: "Track your packages and deliveries in real time across SalesmanPro merchant stores and Ghuba Rider Network.",
};

export default function GlobalTrackOrderPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <OrderTrackingView />
    </div>
  );
}
