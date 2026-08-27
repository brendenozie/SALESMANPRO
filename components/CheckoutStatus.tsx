"use client";
import React, { useEffect } from "react";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useRouter } from "next/navigation";

export default function PaymentStatusPage({
  searchParams,
}: {
  searchParams: { reference?: string; checkoutRequestId?: string; provider?: string };
}) {
  const provider = (searchParams.provider as "paystack" | "mpesa") || "paystack";
  const identifier =
    provider === "paystack"
      ? (searchParams.reference ?? null)
      : (searchParams.checkoutRequestId ?? null);

  const router = useRouter();

  const { status, data, error } = usePaymentVerification(provider, identifier);

  useEffect(() => {
    if (status === "success") {
      // Navigate to success page or display order details
      router.push(`/orders/success?tracking=${data?.orderTracking}`);
    }
  }, [status, data, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      {status === "idle" || status === "checking" ? (
        <>
          <div className="loader mb-4" />
          <h2 className="text-xl font-semibold">Verifying your payment...</h2>
          <p className="text-gray-500 mt-2">Please wait, this may take a few seconds.</p>
        </>
      ) : status === "success" ? (
        <h2 className="text-green-600 text-2xl font-bold">✅ Payment Verified!</h2>
      ) : status === "failed" ? (
        <h2 className="text-red-600 text-2xl font-bold">❌ Payment Failed</h2>
      ) : status === "timeout" ? (
        <h2 className="text-yellow-600 text-2xl font-bold">⚠️ Verification Timeout</h2>
      ) : null}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
