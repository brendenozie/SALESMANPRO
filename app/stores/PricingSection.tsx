import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ArrowPathIcon, // Added for the renew state
} from "@heroicons/react/24/outline";
import { convertKEStoUSD } from "@/lib/hooks/useUserCountry";

import { AUTHORITATIVE_PLANS } from "@/lib/subscriptions/subscription-plans";

// --- Types & Interfaces ---
interface SiteTypePricing {
  monthly: number;
  yearly: number;
}

interface Plan {
  id?: string;
  _id?: { $oid: string };
  name: string;
  displayName?: string;
  tagline: string;
  description?: string;
  price?: number;
  priceMonthly?: number;
  priceAnnually?: number;
  currency?: string;
  isPopular?: boolean;
  tierWeight?: number;
  limits?: {
    staffUsers: number;
    salesAgents: number;
    products: number;
    customers: number;
    monthlyAiCredits: number;
    locations: number;
    customDomain: boolean;
    multiCounterPos: boolean;
    whatsAppAi: boolean;
    industryModules: string[];
  };
  siteTypePrices?: Record<string, SiteTypePricing>;
  features: Record<string, string[]>;
  highlightFeatures?: string[];
}

interface PricingSectionProps {
  companyId: string;
  email: string;
  category: string;
  currentTier?: string;
  requiredTier?: string;
  featureName?: string;
  onSubscriptionSuccess: () => void;
  isSubscriptionActive: boolean;
}

const defaultCompanyId = process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || "68a4420ea20efd318d51db70";
const MPESA_TILL = "537214";

const initialAuthoritativePlans: Plan[] = AUTHORITATIVE_PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  displayName: p.displayName,
  tagline: p.tagline,
  description: p.description,
  priceMonthly: p.priceMonthly,
  priceAnnually: p.priceAnnually,
  currency: p.currency,
  isPopular: p.isPopular,
  tierWeight: p.tierWeight,
  limits: p.limits,
  highlightFeatures: p.highlightFeatures,
  features: Object.fromEntries(p.featureGroups.map((fg) => [fg.category, fg.items])),
}));

export default function PricingSection({
  companyId,
  email,
  category,
  currentTier = "Ghuba Basic",
  requiredTier = "Premium Tier",
  featureName,
  onSubscriptionSuccess,
  isSubscriptionActive
}: PricingSectionProps) {
  const paystackPublicKey =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_4ec65e0fe08ffa32b2708be2adb75b865d2517ce";

  const [plans, setPlans] = useState<Plan[]>(initialAuthoritativePlans);
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
        const res = await fetch(`/api/plans?companyId=${defaultCompanyId}&category=${category}`, { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.plans?.length) {
          setPlans(data.plans);
        }
      } catch (err) {
        console.warn("Using authoritative default plans due to fetch issue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [category]);

  // --- Tier Filtering & Sorting Logic ---
  const displayedPlans = useMemo(() => {
    if (!plans || plans.length === 0) return initialAuthoritativePlans;

    // Sort plans sequentially by monthly price (Basic -> Starter -> Pro -> Growth)
    const sortedByPrice = [...plans].sort(
      (a, b) => getPlanPrice(a, "MONTHLY") - getPlanPrice(b, "MONTHLY")
    );

    return sortedByPrice;
  }, [plans, category]);

  useEffect(() => {
    const calcUsd = async () => {
      if (!isOutsideKenya) return;
      const prices: Record<string, number> = {};
      for (const plan of displayedPlans) {
        const cost = getPlanPrice(plan, billingPeriod);
        prices[plan.id || "unknown"] = await convertKEStoUSD(cost);
      }
      setUsdPrices(prices);
    };
    calcUsd();
  }, [isOutsideKenya, displayedPlans, billingPeriod]);

  const handlePlanSelect = async (plan: Plan) => {
    setLoading(true);
    try {
      const price = getPlanPrice(plan, billingPeriod);
      const planId = plan.id || plan._id?.$oid;
      if (!price || !planId) throw new Error("Invalid plan configuration");

      const amountInKobo = Math.round(price * 100);

      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          planId,
          currency: "KES",
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
        currency: "KES",
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

  const currentPlanObj = plans.find(
    (p) =>
      p.name.toLowerCase() === currentTier?.toLowerCase() ||
      p.id === currentTier ||
      p._id?.$oid === currentTier
  );
  const currentPlanMonthlyPrice = currentPlanObj ? getPlanPrice(currentPlanObj, "MONTHLY") : 0;

  return (
    <div className="w-full min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      {/* Toast Notification */}
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

      <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
        {/* --- Access Lock Banner --- */}
        {requiredTier && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-orange-950/40 to-slate-900 border border-orange-500/30 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
              <LockClosedIcon className="w-64 h-64 text-orange-500" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-wide uppercase">
                  <LockClosedIcon className="w-3.5 h-3.5" /> Access Upgrade Required
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {featureName ? `Unlock ${featureName?.includes("/") ? featureName.split("/").pop() : featureName}` : "Upgrade to access this section"}
                </h2>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  This feature requires higher plan capabilities than your current store tier. Select a plan below to gain instant access.
                </p>
              </div>

              {/* Status Pill Matrix */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Access</p>
                  <p className="text-xs font-bold text-slate-300">{currentTier}</p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-orange-400 hidden sm:block self-center" />
                <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
                  <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Required Plan</p>
                  <p className="text-xs font-bold text-orange-300">{requiredTier}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Controls Header */}
        <div className="text-center mb-10">
          <h3 className="text-3xl font-extrabold tracking-tight">
            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">SalesmanPro</span> Plan
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">
            Upgrade or switch plans instantly. Payments are securely processed via M-Pesa or Card.
          </p>
        </div>

        {/* Global Controls Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
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
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-500 text-white font-bold">-20%</span>
            </button>
          </div>

          {/* Location/Currency Switcher */}
          <button
            onClick={() => setIsOutsideKenya(!isOutsideKenya)}
            className={`flex items-center text-xs font-semibold px-4 py-2.5 rounded-full border transition-all ${
              isOutsideKenya
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <GlobeAltIcon className="w-4 h-4 mr-2" />
            {isOutsideKenya ? "Viewing Global Rates (USD)" : "Viewing East Africa Rates (KES)"}
          </button>
        </div>

        {/* Dynamic Card Architecture - 4 Tier Authoritative Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {displayedPlans.map((plan, index) => {
            const planId = plan.id || plan._id?.$oid || `plan-${index}`;
            const isRequiredTarget = plan.name.toLowerCase() === requiredTier.toLowerCase();
            const isPlanSelected = selectedPlan === plan;

            const isCurrentTier =
              plan.name.toLowerCase() === currentTier?.toLowerCase() ||
              plan.id === currentTier ||
              plan._id?.$oid === currentTier;
            
            // --- Subscription status calculations ---
            const isActiveTier = isCurrentTier && isSubscriptionActive;
            const isExpiredTier = isCurrentTier && !isSubscriptionActive;

            const planPriceMonthly = getPlanPrice(plan, "MONTHLY");
            const isUpgrade = Boolean(currentTier && !isCurrentTier && planPriceMonthly > currentPlanMonthlyPrice);

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex flex-col p-6 rounded-3xl transition-all duration-300 ${
                  isActiveTier
                    ? "bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-300 dark:border-slate-700 z-0 opacity-80"
                    : isRequiredTarget
                    ? "bg-white dark:bg-slate-900 shadow-2xl ring-2 ring-orange-500 xl:scale-[1.02] z-10"
                    : plan.isPopular
                    ? "bg-white dark:bg-slate-900 shadow-xl ring-2 ring-amber-500/80 dark:ring-amber-500/50 z-10"
                    : "bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800/60 hover:shadow-lg"
                }`}
              >
                {/* Badges */}
                {isActiveTier && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-700 text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap">
                    Current Active Plan
                  </div>
                )}
                {isExpiredTier && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap">
                    Subscription Expired
                  </div>
                )}

                {isRequiredTarget && !isActiveTier && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 whitespace-nowrap">
                    <SparklesIcon className="w-3.5 h-3.5" /> Required Upgrade
                  </div>
                )}

                {!isRequiredTarget && plan.isPopular && !isActiveTier && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 whitespace-nowrap">
                    <SparklesIcon className="w-3.5 h-3.5" /> Most Popular
                  </div>
                )}

                <div className="mb-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 min-h-[36px]">{plan.tagline}</p>
                </div>

                <div className="mb-4 flex items-baseline">
                  <span className="text-3xl font-extrabold tracking-tight">{renderPrice(plan)}</span>
                  <span className="text-slate-400 font-medium text-xs ml-1.5">/{billingPeriod === "MONTHLY" ? "mo" : "yr"}</span>
                  {billingPeriod === "ANNUALLY" && renderSavingsBadge(plan)}
                </div>

                {/* Resource Limits Breakdown */}
                {plan.limits && (
                  <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/70 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Staff Users</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.staffUsers === -1 ? "Unlimited" : `${plan.limits.staffUsers} Staff`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Sales Agents</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.salesAgents === -1 ? "Unlimited" : plan.limits.salesAgents === 0 ? "—" : `${plan.limits.salesAgents} Agents`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>AI Studio</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.monthlyAiCredits > 0 ? `${plan.limits.monthlyAiCredits} cr/mo` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>POS Counter</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.multiCounterPos ? "Multi-Counter" : "Single Counter"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>WhatsApp AI</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.whatsAppAi ? "Enabled" : "—"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Selection Checkout Interface */}
                <AnimatePresence mode="wait">
                  {isPlanSelected ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-6 space-y-4"
                    >
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
                            paymentMethod === "MPESA" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          M-Pesa Till
                        </button>
                      </div>

                      {/* M-Pesa Interactive UI Segment */}
                      {paymentMethod === "MPESA" ? (
                        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-3 text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                            <span className="font-bold text-emerald-800 dark:text-emerald-400">Lipa Na M-Pesa Instruction</span>
                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold">Till: {MPESA_TILL}</span>
                          </div>
                          <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                            <li>Access your M-Pesa SIM tool or app.</li>
                            <li>Execute <b>Buy Goods and Services</b>.</li>
                            <li>
                              Input amount exact: <b className="text-slate-900 dark:text-slate-100">{renderPrice(plan)}</b>
                            </li>
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
                                {mpesaPaymentLoading ? "Validating..." : "Verify Settlement"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
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
                    <button
                      type="button"
                      onClick={() => {
                        if (!isActiveTier) setSelectedPlan(plan);
                      }}
                      disabled={loading || isActiveTier}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] mb-6 flex items-center justify-center gap-2 ${
                        isActiveTier
                          ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                          : isExpiredTier
                          ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
                          : isRequiredTarget
                          ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 shadow-md shadow-orange-500/20"
                          : isUpgrade
                          ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-md"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {isActiveTier ? (
                        <>
                          <ShieldCheckIcon className="w-4 h-4" /> Active Plan
                        </>
                      ) : isExpiredTier ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4" /> Renew {plan.name}
                        </>
                      ) : isRequiredTarget ? (
                        <>
                          <SparklesIcon className="w-4 h-4" /> Upgrade to {plan.name}
                        </>
                      ) : isUpgrade ? (
                        `Upgrade to ${plan.name}`
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </button>
                  )}
                </AnimatePresence>

                {/* Capabilities Specs */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-3">
                  <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Capabilities Included:
                  </p>

                  <div className="space-y-2.5">
                    {Object.entries(plan.features)
                      .slice(0, 3)
                      .map(([_, items]) =>
                        items.slice(0, 2).map((feature, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-normal">
                              {feature}
                            </span>
                          </div>
                        ))
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFeaturesExpanded((prev) => ({ ...prev, [planId]: !prev[planId] }))}
                    className="text-orange-600 dark:text-orange-400 text-xs font-semibold hover:underline flex items-center gap-1 pt-2"
                  >
                    {isFeaturesExpanded[planId] ? (
                      <>
                        Collapse features <ChevronUpIcon className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        View full spec manifest <ChevronDownIcon className="w-3.5 h-3.5" />
                      </>
                    )}
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
                            <div key={i} className="flex items-start gap-2.5">
                              <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">{feature}</span>
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