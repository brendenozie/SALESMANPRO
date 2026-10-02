"use client";

import React from "react";
import OrderTrackingView from "@/components/site/OrderTrackingView";

export default function EcommerceTrackPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <OrderTrackingView />
    </div>
  );
}
