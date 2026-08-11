import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { convertKEStoUSD, getUserCountry } from '@/lib/hooks/useUserCountry';

// --- Types & Interfaces ---
interface SiteTypePricing {
  monthly: number;
  yearly: number;
}

interface Plan {
  id?: string;
  _id?: { $oid: string };
  name: string;
  tagline: string;
  price?: number;
  priceMonthly?: number;
  priceAnnually?: number;
  isPopular?: boolean;
  siteTypePrices?: Record<string, SiteTypePricing>;
  features: Record<string, string[]>;
}

interface PricingSectionProps {
  companyId: string;
  email: string;
  category: string;
  currentTier?: string;
  onSubscriptionSuccess: () => void;
}

const defaultCompanyId = process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || "6825c2c7969ab9f16f620f67"; 
const MPESA_TILL = "537214";

// --- Clean SVG Icons ---
const CheckIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0 text-emerald-500 dark:text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
  </svg>
);

export default function PricingSection({ companyId, email, category, currentTier, onSubscriptionSuccess }: PricingSectionProps) {
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_4ec65e0fe08ffa32b2708be2adb75b865d2517ce";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [mpesaPaymentLoading, setMpesaPaymentLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"MONTHLY" | "ANNUALLY">("MONTHLY");
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState<Record<string, boolean>>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [usdPrices, setUsdPrices] = useState<Record<string, number>>({});
  const [isOutsideKenya, setIsOutsideKenya] = useState<boolean>(false);

  const [paymentMethod, setPaymentMethod] = useState<"PAYSTACK" | "MPESA">("MPESA");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaRef, setMpesaRef] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Helper logic to cleanly structure structural plan arrays for mobile/desktop distribution priorities
  const sortPlansWithPriority = (unsortedPlans: Plan[]): Plan[] => {
    if (!unsortedPlans || unsortedPlans.length === 0) return [];
    const popularIndex = unsortedPlans.findIndex(p => p.isPopular);
    if (popularIndex <= 0) return unsortedPlans; // Already prioritized or not found

    const workingCopy = [...unsortedPlans];
    const [popularPlan] = workingCopy.splice(popularIndex, 1);
    return [popularPlan, ...workingCopy];
  };

  const getPlanPrice = (plan: Plan, period: "MONTHLY" | "ANNUALLY"): number => {
    let pricingNode: SiteTypePricing | undefined;
    if (plan.siteTypePrices) {
      pricingNode = plan.siteTypePrices[category] || plan.siteTypePrices["Default"];
    }
    if (pricingNode) {
      return period === "MONTHLY" ? pricingNode.monthly : pricingNode.yearly;
    }
    if (period === "MONTHLY") {
      return plan.priceMonthly ?? plan.price ?? 0;
    } else {
      return plan.priceAnnually ?? (plan.price ?? 0) * 12;
    }
  };

  const showStatusMessage = (message: string, type: "success" | "error" = "error") => {
    setSubscriptionStatus({ message, type });
    setTimeout(() => setSubscriptionStatus(null), 5000);
  };

  useEffect(() => {
    if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/plans?companyId=${defaultCompanyId}&category=${category}`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const structuredPlans = data.plans?.length ? data.plans : [];
        setPlans(sortPlansWithPriority(structuredPlans));
      } catch (err) {
        console.warn("Using mock plans due to fetch error");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [category]);

  useEffect(() => {
    const calcUsd = async () => {
      if (!isOutsideKenya) return;
      const prices: Record<string, number> = {};
      for (const plan of plans) {
        const cost = getPlanPrice(plan, billingPeriod);
        prices[plan.id || "unknown"] = await convertKEStoUSD(cost);
      }
      setUsdPrices(prices);
    };
    calcUsd();
  }, [isOutsideKenya, plans, billingPeriod]);

  const handlePlanSelect = async (plan: Plan) => {
    setLoading(true);
    try {
      const price = getPlanPrice(plan, billingPeriod);
      const planId = plan.id || plan._id?.$oid;
      if (!price || !planId) throw new Error("Invalid plan configuration");

      let chargeAmount = price;
      // if (isOutsideKenya) {
      //   chargeAmount = Math.round((await convertKEStoUSD(price)) * 100) / 100;
      // }
      const amountInKobo = Math.round(chargeAmount * 100);

      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          planId,
          currency: "KES", // isOutsideKenya ? "USD" : "KES",
          amount: amountInKobo,
          billingPeriod,
          monthsPaidFor: billingPeriod === "MONTHLY" ? 1 : 0,
          yearsPaidFor: billingPeriod === "ANNUALLY" ? 1 : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.data?.data?.authorization_url) {
        throw new Error(data.message || "Payment initialization failed");
      }

      // @ts-ignore
      const PaystackPop = window.PaystackPop;
      if (!PaystackPop) throw new Error("Paystack script not ready. Try again.");

      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: email,
        amount: amountInKobo,
        ref: data.data.data.reference,
        currency:  "KES",//isOutsideKenya ? "USD" : "KES",
        metadata: { companyId, planId },
        callback: (response: any) => {
          window.location.href = `/payments/paystack/verify?reference=${response.reference}`;
        },
        onClose: () => {
          showStatusMessage("Payment cancelled", "error");
          setLoading(false);
        },
      });
      handler.openIframe();
    } catch (err: any) {
      showStatusMessage(err.message, "error");
      setLoading(false);
    }
  };

  const handleMpesaSubmit = async (plan: Plan) => {
    if (!mpesaPhone || !mpesaRef) {
      showStatusMessage("Please fill in both the phone number and transaction reference.");
      return;
    }
    setMpesaPaymentLoading(true);
    try {
      const price = getPlanPrice(plan, billingPeriod);
      const planId = plan.id || plan._id?.$oid;

      const res = await fetch("/api/payments/mpesatill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          planId,
          phone: mpesaPhone,
          reference: mpesaRef,
          amount: price,
          billingPeriod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showStatusMessage("Payment submitted securely. Awaiting confirmation.", "success");
      setMpesaPhone("");
      setMpesaRef("");
      setSelectedPlan(null);
      onSubscriptionSuccess();
    } catch (err: any) {
      showStatusMessage(err.message);
    } finally {
      setMpesaPaymentLoading(false);
    }
  };

  const renderPrice = (plan: Plan) => {
    const rawPrice = getPlanPrice(plan, billingPeriod);
    const planId = plan.id || plan._id?.$oid || "unknown";

    if (isOutsideKenya && usdPrices[planId]) {
      return `$${usdPrices[planId].toFixed(2)}`;
    }
    return `KES ${rawPrice.toLocaleString()}`;
  };

  const renderSavingsBadge = (plan: Plan) => {
    const monthly = getPlanPrice(plan, "MONTHLY");
    const yearly = getPlanPrice(plan, "ANNUALLY");
    const savings = monthly * 12 - yearly;
    if (savings > 0) {
      const percent = Math.round((savings / (monthly * 12)) * 100);
      return (
        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-1 rounded-full ml-2">
          Save {percent}%
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      {/* Toast System */}
      <AnimatePresence>
        {subscriptionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl font-medium text-white flex items-center gap-2 backdrop-blur-md ${
              subscriptionStatus.type === "success" ? "bg-emerald-600/95" : "bg-rose-600/95"
            }`}
          >
            {subscriptionStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-full">
              Flexible Subscriptions
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-4 mb-4">
              Pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">SalesmanPro</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Select a scalable configuration calibrated to support your operations without complex contractual cycles.
            </p>
          </motion.div>
        </div>

        {/* Global Controls Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Term Toggle */}
          <div className="bg-slate-200/60 dark:bg-slate-900 p-1 rounded-full inline-flex relative border border-slate-300/30">
            <motion.div
              className="absolute top-1 bottom-1 bg-white dark:bg-slate-800 rounded-full shadow-sm z-0"
              initial={false}
              animate={{
                left: billingPeriod === "MONTHLY" ? "4px" : "50%",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
            <button
              onClick={() => setBillingPeriod("MONTHLY")}
              className={`relative z-10 px-8 py-2 text-xs md:text-sm font-semibold rounded-full transition-colors ${
                billingPeriod === "MONTHLY" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("ANNUALLY")}
              className={`relative z-10 px-8 py-2 text-xs md:text-sm font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
                billingPeriod === "ANNUALLY" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Annually
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-500 text-white font-bold">
                -20%
              </span>
            </button>
          </div>

          {/* Location/Currency Switcher */}
          <button
            onClick={() => {
              setIsOutsideKenya(!isOutsideKenya);
              // setPaymentMethod("PAYSTACK");
            }}
            className={`flex items-center text-xs font-semibold px-4 py-2.5 rounded-full border transition-all ${
              isOutsideKenya
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <GlobeIcon />
            {isOutsideKenya ? "Viewing Global Rates (USD)" : "Viewing East Africa Rates (KES)"}
          </button>
        </div>

        {/* Dynamic Card Architecture */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => {
            const planId = plan.id || plan._id?.$oid || `plan-${index}`;
            const isPopular = plan.isPopular;
            const isPlanSelected = selectedPlan === plan;

            // CSS Layout Order logic assignments:
            // Mobile (default): Recommended card is index 0 -> renders absolute 1st.
            // Desktop (md:): index 0 has `md:order-2` (moves it to middle display slot).
            // index 1 has `md:order-1`, index 2 (or any others) have `md:order-3`.
            let orderClass = "order-none";
            if (isPopular) {
              orderClass = "md:order-2"; 
            } else if (index === 1) {
              orderClass = "md:order-1"; 
            } else {
              orderClass = "md:order-3"; 
            }

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex flex-col p-6 md:p-8 rounded-3xl transition-all duration-300 ${orderClass} ${
                  isPopular
                    ? "bg-white dark:bg-slate-900 shadow-xl ring-2 ring-orange-500 md:scale-[1.03] z-10"
                    : "bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800/60 hover:shadow-lg"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 min-h-[32px]">
                    {plan.tagline}
                  </p>
                </div>

                <div className="mb-6 flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {renderPrice(plan)}
                  </span>
                  <span className="text-slate-400 font-medium text-sm ml-2">
                    /{billingPeriod === "MONTHLY" ? "mo" : "yr"}
                  </span>
                  {billingPeriod === "ANNUALLY" && renderSavingsBadge(plan)}
                </div>

                {/* Conditional Sub-Card Layout for Selection Context */}
                <AnimatePresence mode="wait">
                  {isPlanSelected ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-6 space-y-4"
                    >
                      {/* Interactive Checkout Engine */}
                      {(//!isOutsideKenya && 
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/20">
                          <button
                            onClick={() => setPaymentMethod("PAYSTACK")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                              paymentMethod === "PAYSTACK"
                                ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            Card / Bank 
                            
                          </button>
                          <button
                            onClick={() => setPaymentMethod("MPESA")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                              paymentMethod === "MPESA"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            M-Pesa Till
                          </button>
                        </div>
                      )}

                      {/* M-Pesa Interactive UI Segment  && !isOutsideKenya*/}
                      {paymentMethod === "MPESA" ? (
                        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-3 text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                            <span className="font-bold text-emerald-800 dark:text-emerald-400">
                              Lipa Na M-Pesa Instruction
                            </span>
                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                              Till: {MPESA_TILL}
                            </span>
                          </div>
                          <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                            <li>Access your M-Pesa SIM tool or app.</li>
                            <li>Execute <b>Buy Goods and Services</b>.</li>
                            <li>Input amount exact: <b className="text-slate-900 dark:text-slate-100">{renderPrice(plan)}</b></li>
                          </ol>

                          <div className="space-y-2 pt-2">
                            <input
                              type="tel"
                              placeholder="M-Pesa Registered Number (e.g., 0712345678)"
                              value={mpesaPhone}
                              onChange={(e) => setMpesaPhone(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Transaction Code (e.g., QWE45RT78X)"
                              value={mpesaRef}
                              onChange={(e) => setMpesaRef(e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono uppercase tracking-wider"
                            />
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setSelectedPlan(null)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMpesaSubmit(plan)}
                                disabled={mpesaPaymentLoading || loading}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold transition-all disabled:opacity-50 text-center"
                              >
                                {mpesaPaymentLoading ? "Validating Code..." : "Verify Settlement"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Paystack Inline Framework Call Button */
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPlan(null)}
                            className="px-3 py-3 border border-slate-300 dark:border-slate-800 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-sm"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePlanSelect(plan)}
                            disabled={loading}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white py-3 rounded-xl font-bold shadow-sm transition-all text-sm"
                          >
                            {loading ? "Launching Gateway..." : `Pay ${renderPrice(plan)} Now`}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    /* Entry Trigger Call To Action */
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan);
                        // setPaymentMethod("PAYSTACK");
                        // if (isOutsideKenya) 
                      }}
                      disabled={loading}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] mb-6 ${
                        isPopular
                          ? "bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-500/10"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Choose {plan.name}
                    </button>
                  )}
                </AnimatePresence>

                {/* Features Metadata Sub-block */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-3">
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Capabilities Included:
                  </p>

                  <div className="space-y-2.5">
                    {Object.entries(plan.features)
                      .slice(0, 3)
                      .map(([_, items]) =>
                        items.slice(0, 2).map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckIcon />
                            <span className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-normal">
                              {feature}
                            </span>
                          </div>
                        ))
                      )}
                  </div>

                  {/* Core Drawer Feature Extension */}
                  <button
                    type="button"
                    onClick={() => setIsFeaturesExpanded((prev) => ({ ...prev, [planId]: !prev[planId] }))}
                    className="text-orange-600 dark:text-orange-400 text-xs font-semibold hover:underline flex items-center pt-2"
                  >
                    {isFeaturesExpanded[planId] ? "Collapse feature list" : "View complete spec manifest →"}
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isFeaturesExpanded[planId] ? "auto" : 0,
                      opacity: isFeaturesExpanded[planId] ? 1 : 0,
                    }}
                    className="overflow-hidden space-y-4"
                  >
                    {Object.entries(plan.features).map(([catName, items]) => (
                      <div key={catName} className="pt-3 border-t border-slate-100 dark:border-slate-800/40">
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                          {catName}
                        </h4>
                        <div className="space-y-2">
                          {items.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <CheckIcon />
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}