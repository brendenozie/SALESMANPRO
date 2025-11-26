// app/payment-failed/page.tsx
import React from "react";
import Link from "next/link";

interface FailedPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function PaymentFailedPage({ searchParams }: FailedPageProps) {
  const { orderId } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Payment Failed</h1>
        <p className="text-gray-700 mb-6">
          Oops! Something went wrong{orderId ? ` with Order #${orderId}` : ""}. 
          Your card was not charged.
        </p>
        <Link href={`/checkout?orderId=${orderId}`}>
          <a className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition">
            Retry Payment
          </a>
        </Link>
      </div>
    </div>
  );
}
