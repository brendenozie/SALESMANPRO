"use client";

import React from "react";
import OrderTrackingView from "@/components/site/OrderTrackingView";

export default function GhubaOrderTrackingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <OrderTrackingView storeName="Ghuba Marketplace" />
    </div>
  );
}
