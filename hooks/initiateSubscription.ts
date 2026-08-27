export async function initiateSubscription(payload: {
  companyId: string;
  planId: string;
  amount: number;
  currency: string;
  billingPeriod: "MONTHLY" | "ANNUALLY";
  monthsPaidFor?: number;
  yearsPaidFor?: number;
}) {
  try {
    const res = await fetch("/api/payments/paystack/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw data;

    return data.data; // contains authorization_url
  } catch (e) {
    console.error("INIT ERROR:", e);
    throw e;
  }
}
