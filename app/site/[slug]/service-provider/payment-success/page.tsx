// app/payment-success/page.tsx
import React from "react";
import Link from "next/link";

interface SuccessPageProps {
  searchParams: { orderId?: string };
}

export default function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thank you for your booking{orderId ? ` (Order #${orderId})` : ""}. 
          We’ve sent a confirmation email and will be in touch shortly.
        </p>
        <Link href="/my-orders">
          <a className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
            View My Orders
          </a>
        </Link>
      </div>
    </div>
  );
}
