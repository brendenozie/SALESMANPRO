import React from "react";
import OrderTrackingView from "@/components/site/OrderTrackingView";
import { loadStore } from "@/lib/loadStore";

interface TrackOrderPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TrackOrderPageProps) {
  const { slug } = await params;
  const { raw } = await loadStore(slug);
  return {
    title: `Track Order | ${raw?.name || "Store"}`,
    description: `Real-time package and delivery tracking for orders from ${raw?.name || "our store"}.`,
  };
}

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { slug } = await params;
  const { raw } = await loadStore(slug);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <OrderTrackingView storeSlug={slug} storeName={raw?.name} />
    </div>
  );
}
