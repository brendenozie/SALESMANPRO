"use client";

import React, { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CheckIcon,
  ChevronDownIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { AUTHORITATIVE_PLANS, AuthoritativePlan } from "@/lib/subscriptions/subscription-plans";

// --- Types ---
interface PlanFeatures {
  [key: string]: string[];
}

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price?: string;
  priceMonthly?: number;
  priceAnnually?: number;
  currency: string;
  features: PlanFeatures;
  isPopular: boolean;
  tagline: string;
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
  highlightFeatures: string[];
}

const AUTHORITATIVE_HOMEPAGE_PLANS: Plan[] = AUTHORITATIVE_PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  displayName: p.displayName,
  priceMonthly: p.priceMonthly,
  priceAnnually: p.priceAnnually,
  currency: "KES",
  tagline: p.tagline,
  isPopular: p.isPopular,
  limits: p.limits,
  highlightFeatures: p.highlightFeatures,
  features: Object.fromEntries(p.featureGroups.map((fg) => [fg.category, fg.items])),
}));

const handleSignIn = () => {
  const authUrl = new URL("https://auth.salesmanpro.site/signin");
  authUrl.searchParams.set("callbackUrl", window.location.origin);
  window.location.href = authUrl.toString();
};

export default function PricingSectionRedesign() {
  const [plans, setPlans] = useState<Plan[]>(AUTHORITATIVE_HOMEPAGE_PLANS);
  const [loading, setLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const defaultCompanyId = process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || "68a4420ea20efd318d51db70";
        const res = await fetch(`/api/plans?companyId=${defaultCompanyId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.plans?.length) {
            setPlans(data.plans);
          }
        }
      } catch (err) {
        console.warn("Utilizing authoritative default plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPriceDisplay = (plan: Plan) => {
    const value = isAnnual ? plan.priceAnnually : plan.priceMonthly;
    if (value !== undefined) {
      return `${plan.currency} ${value.toLocaleString()}`;
    }
    return plan.price || `${plan.currency} 0`;
  };

  const getCoreFeatures = (plan: Plan) => {
    return Object.values(plan.features).flat().slice(0, 4);
  };

  if (loading) {
    return (
      <section className="py-24 bg-slate-50 dark:bg-slate-950 text-center flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-orange-600 border-slate-300 dark:border-slate-800" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading pricing plans...</p>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
      {/* Background Decorative Blur Highlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/10 dark:bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-4"
        >
          <span className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-4 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/40 inline-block shadow-sm">
            Flexible Growth Plans
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Predictable Pricing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500">
              Built For Every Growth Stage.
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Start with essential inventory and POS tools, then activate WhatsApp AI and automated M-PESA STK pushes as you scale[cite: 1].
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3 text-xs sm:text-sm font-bold">
            <span className={!isAnnual ? "text-slate-900 dark:text-white" : "text-slate-400"}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-colors relative focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Toggle Billing Cycle"
            >
              <div
                className={`w-6 h-6 rounded-full bg-orange-600 transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={isAnnual ? "text-slate-900 dark:text-white" : "text-slate-400"}>
              Annual <span className="ml-1 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Save 20%</span>
            </span>
          </div>
        </Motion.div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => (
            <Motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className={`relative flex flex-col justify-between p-7 rounded-3xl transition-all duration-300 ${
                plan.isPopular
                  ? "bg-slate-900 text-white dark:bg-slate-900 border-2 border-orange-500 shadow-2xl scale-[1.02] z-10"
                  : "bg-white dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              <div>
                {/* Header */}
                <div className="text-center pb-5 border-b border-slate-100 dark:border-slate-800/80">
                  <h3 className={`text-lg font-extrabold ${plan.isPopular ? "text-orange-400" : "text-slate-900 dark:text-white"}`}>
                    {plan.displayName || plan.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                    {plan.tagline}
                  </p>
                  
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-black">{getPriceDisplay(plan)}</span>
                    <span className="text-xs text-slate-400 font-normal">/ mo</span>
                  </div>
                </div>

                {/* Resource Limits Breakdown */}
                {plan.limits && (
                  <div className="mt-4 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Staff Accounts</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.staffUsers === -1 ? "Unlimited" : `${plan.limits.staffUsers} Staff`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>AI Studio Credits</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.monthlyAiCredits > 0 ? `${plan.limits.monthlyAiCredits} / mo` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>POS Checkout</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.multiCounterPos ? "Multi-Counter" : "Single Counter"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>WhatsApp AI</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {plan.limits.whatsAppAi ? "Autonomous Agent" : "—"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Core Features */}
                <div className="py-5 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Included Capabilities:
                  </p>
                  <ul className="space-y-2 text-left">
                    {(plan.highlightFeatures?.length ? plan.highlightFeatures.slice(0, 4) : getCoreFeatures(plan)).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <CheckIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.isPopular ? "text-orange-400" : "text-emerald-500"}`} />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Feature Breakdown Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 focus:outline-none"
                    >
                      <span>{expandedPlanId === plan.id ? "Hide details" : "View full specs"}</span>
                      <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expandedPlanId === plan.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* Expandable Feature List */}
                  <AnimatePresence>
                    {expandedPlanId === plan.id && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pt-2 text-left space-y-3"
                      >
                        {Object.entries(plan.features).map(([section, items]) => (
                          <div key={section} className="text-[11px]">
                            <span className="font-bold text-slate-400 uppercase text-[9px] block mb-1">
                              {section}
                            </span>
                            <ul className="space-y-1">
                              {items.map((item, idx) => (
                                <li key={idx} className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-auto">
                {!session ? (
                  <button
                    onClick={handleSignIn}
                    className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-orange-500/20"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Start 14-Day Free Trial
                  </button>
                ) : (
                  <Link
                    href={`/stores?plan=${plan.id}`}
                    className={`block text-center w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-orange-500/20"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Select Plan
                  </Link>
                )}
              </div>
            </Motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}