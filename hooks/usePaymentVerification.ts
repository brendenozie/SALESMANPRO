import { useEffect, useState, useCallback } from "react";

/**
 * Hook: usePaymentVerification
 * Automatically polls payment verification endpoint until success or timeout.
 *
 * @param provider - "paystack" | "mpesa"
 * @param identifier - Paystack reference or M-Pesa checkoutRequestId
 * @param intervalMs - Polling interval (default: 5000 ms)
 * @param maxAttempts - Maximum polling attempts (default: 12 → 1 min)
 */

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000/api";

export function usePaymentVerification(
  provider: "paystack" | "mpesa",
  identifier: string | null,
  intervalMs = 5000,
  maxAttempts = 12
) {
  const [status, setStatus] = useState<
    "idle" | "checking" | "success" | "failed" | "timeout"
  >("idle");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyPayment = useCallback(async () => {
    if (!identifier) return;

    setStatus("checking");
    try {
      const param =
        provider === "paystack"
          ? `reference=${identifier}`
          : `checkoutRequestId=${identifier}`;
      const res = await fetch(`${apiBaseUrl}/payments/verify?provider=${provider}&${param}`);
      const json = await res.json();

      if (json.success) {
        const paymentStatus =
          json.data?.status?.toLowerCase?.() || json.data?.status;
        if (paymentStatus === "success" || paymentStatus === "paid") {
          setStatus("success");
          setData(json.data);
          return true;
        } else if (paymentStatus === "failed" || paymentStatus === "declined") {
          setStatus("failed");
          setError("Payment failed or was declined.");
          return false;
        }
      } else {
        setError(json.message || "Verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    }
    return false;
  }, [provider, identifier]);

  useEffect(() => {
    if (!identifier) return;

    let attempt = 0;
    let timer: NodeJS.Timeout;

    const poll = async () => {
      attempt++;
      const success = await verifyPayment();
      if (success) return; // stop polling if verified

      if (attempt >= maxAttempts) {
        setStatus("timeout");
        return;
      }
      timer = setTimeout(poll, intervalMs);
    };

    poll(); // start polling
    return () => clearTimeout(timer);
  }, [verifyPayment, identifier, intervalMs, maxAttempts]);

  return { status, data, error, verifyPayment };
}
