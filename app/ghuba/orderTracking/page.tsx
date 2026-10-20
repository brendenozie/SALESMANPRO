import { Suspense } from "react";
import { Metadata } from "next";
import GhubaOrderTrackingClient from "@/components/ghuba/tracking/GhubaOrderTrackingClient";

export const metadata: Metadata = {
  title: "Live Order Tracking & Escrow Release | Ghuba Marketplace",
  description:
    "Track your order live, contact your express dispatch rider, and release M-Pesa escrow safely upon delivery on Ghuba Marketplace.",
};

export default function GhubaOrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent mb-4" />
          <p className="text-sm font-bold">Loading Ghuba Order Tracking...</p>
        </div>
      }
    >
      <GhubaOrderTrackingClient />
    </Suspense>
  );
}
