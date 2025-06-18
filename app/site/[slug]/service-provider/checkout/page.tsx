// app/checkout/page.tsx
import CheckoutForm from "@/components/site/layouts/ServicesLayout/components/CheckoutForm";
import React from "react";
// import CheckoutForm from "@/components/CheckoutForm";

interface CheckoutPageProps {
  searchParams: {
    listingId?: string;
    date?: string;      // e.g. "2025-06-20"
    timeSlot?: string;  // e.g. "09:00"
  };
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { listingId, date, timeSlot } = searchParams;
  if (!listingId || !date || !timeSlot) {
    return <p className="p-6 text-red-600">Missing booking details.</p>;
  }

  // 1) Fetch the service info
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/marketplace-list?companyId=${""}&limit=1&offset=0&filterListingId=${listingId}`,
    { cache: "no-store" }
  );
  // Adjust your API to support filtering by a single listingId
  if (!res.ok) {
    return <p className="p-6 text-red-600">Failed to load service.</p>;
  }
  const { results } = await res.json();
  const service = results[0];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
        <p className="text-gray-600 mb-1">
          📅 {new Date(date).toLocaleDateString()} @ {timeSlot}
        </p>
        <p className="text-lg font-bold">${service.finalPrice.toFixed(2)}</p>
      </div>
      {/* Client‑side Stripe + order creation */}
      <CheckoutForm
        listingId={listingId}
        date={date}
        timeSlot={timeSlot}
        amount={service.finalPrice}
      />
    </div>
  );
}
