import { useState } from "react";
import { initiateSubscription } from "./initiateSubscription";

export function useSubscribe(companyId: string, plan: any) {
  const [loading, setLoading] = useState(false);

  async function startSubscription(billingPeriod: "MONTHLY" | "ANNUALLY") {
    try {
      setLoading(true);

      const monthsPaidFor = billingPeriod === "MONTHLY" ? 1 : 0;
      const yearsPaidFor = billingPeriod === "ANNUALLY" ? 1 : 0;

      const amount =
        billingPeriod === "MONTHLY"
          ? plan.priceMonthly * 100
          : plan.priceAnnually * 100;

      const response = await initiateSubscription({
        companyId,
        planId: plan.id,
        amount,
        currency: "KES",
        billingPeriod,
        monthsPaidFor,
        yearsPaidFor
      });

      if (!response.authorization_url) {
        throw new Error("Missing authorization url");
      }

      window.location.href = response.authorization_url;
    } catch (err) {
      console.error("SUBSCRIPTION ERROR:", err);
      const errorMessage = typeof err === "object" && err !== null && "error" in err ? (err as any).error : "Payment initiation failed";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return { startSubscription, loading };
}
