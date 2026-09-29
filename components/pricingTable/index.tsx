"use client";

import React, { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CheckIcon,
  ChevronDownIcon,
  SparklesIcon,
  UserGroupIcon,
  CpuChipIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

import { AUTHORITATIVE_PLANS } from "@/lib/subscriptions/subscription-plans";

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
    invoicesReceipts: number;
    customDomain: boolean;
    sslCertificate: boolean;
    bulkProductEdit: boolean;
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
      <section className="py-24 bg-slate-50 dark:bg-[#07090E] text-center flex flex-col items-center justify-center min-h-[600px]">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 animate-spin" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">Loading pricing models...</p>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Technical Grid and Ambient Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <SparklesIcon className="w-3.5 h-3.5 text-orange-500" />
            <span>Transparent Subscription Plans</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.12]">
            Predictable Pricing. <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Engineered For Every Growth Stage.
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Start with essential inventory and POS tools, then activate WhatsApp AI and automated M-PESA STK push workflows as your store grows.
          </p>

          {/* Billing Cycle Toggle Pill */}
          <div className="pt-6 flex items-center justify-center">
            <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  !isAnnual
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              
              <button
                onClick={() => setIsAnnual(true)}
                className={`relative px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 ${
                  isAnnual
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                  isAnnual 
                    ? "bg-slate-950/20 text-slate-950" 
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </Motion.div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 items-stretch">
          {plans.map((plan) => {
            const isPopular = plan.isPopular;

            return (
              <Motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className={`relative flex flex-col justify-between p-7 rounded-3xl transition-all duration-300 ${
                  isPopular
                    ? "bg-slate-900 dark:bg-[#0E131F] text-white border-2 border-orange-500 shadow-2xl scale-[1.02] z-10"
                    : "bg-white/90 dark:bg-[#0E131F]/90 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl backdrop-blur-xl"
                }`}
              >
                {/* Popular Tier Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <SparklesIcon className="w-3.5 h-3.5 text-slate-950" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="text-left pb-5 border-b border-slate-100 dark:border-slate-800/80">
                    <h3 className={`text-xl font-black ${isPopular ? "text-orange-400" : "text-slate-900 dark:text-white"}`}>
                      {plan.displayName || plan.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                      {plan.tagline}
                    </p>
                    
                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight">{getPriceDisplay(plan)}</span>
                      <span className="text-xs text-slate-400 font-mono">/ mo</span>
                    </div>
                  </div>

                  {/* Resource Limits Micro Matrix */}
                  {plan.limits && (
                    <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080B12] border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <UserGroupIcon className="w-3.5 h-3.5 text-slate-400" /> Staff Users
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {plan.limits.staffUsers === -1 ? "Unlimited" : `${plan.limits.staffUsers} Staff`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <UserGroupIcon className="w-3.5 h-3.5 text-slate-400" /> Sales Agents
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {plan.limits.salesAgents === -1 ? "Unlimited" : plan.limits.salesAgents === 0 ? "—" : `${plan.limits.salesAgents} Agents`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <CpuChipIcon className="w-3.5 h-3.5 text-slate-400" /> AI Studio
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {plan.limits.monthlyAiCredits > 0 ? `${plan.limits.monthlyAiCredits.toLocaleString()} cr/mo` : "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <BuildingStorefrontIcon className="w-3.5 h-3.5 text-slate-400" /> POS Counter
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {plan.limits.multiCounterPos ? "Multi-Counter" : "Single Counter"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-slate-400" /> WhatsApp AI
                        </span>
                        <span className={`font-bold ${plan.limits.whatsAppAi ? "text-emerald-500" : "text-slate-400"}`}>
                          {plan.limits.whatsAppAi ? "Enabled" : "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <BuildingStorefrontIcon className="w-3.5 h-3.5 text-slate-400" /> Invoices & Receipts
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {plan.limits.invoicesReceipts === -1 ? "Unlimited" : plan.limits.invoicesReceipts}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Core Highlight Features */}
                  <div className="py-5 space-y-3">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      KEY INCLUDED FEATURES:
                    </p>
                    <ul className="space-y-2.5 text-left">
                      {(plan.highlightFeatures?.length ? plan.highlightFeatures.slice(0, 4) : getCoreFeatures(plan)).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <CheckCircleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isPopular ? "text-orange-400" : "text-emerald-500"}`} />
                          <span className="text-slate-700 dark:text-slate-300 font-medium leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Expand Details Trigger */}
                    <div className="pt-2">
                      <button
                        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                        className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center gap-1 focus:outline-none group"
                      >
                        <span>{expandedPlanId === plan.id ? "Hide full specs" : "View full specs"}</span>
                        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedPlanId === plan.id ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    {/* Expandable Feature List Accordion */}
                    <AnimatePresence>
                      {expandedPlanId === plan.id && (
                        <Motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden pt-2 text-left space-y-3"
                        >
                          {Object.entries(plan.features).map(([section, items]) => (
                            <div key={section} className="text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span className="font-bold font-mono text-slate-400 uppercase text-[9px] block mb-1.5">
                                {section}
                              </span>
                              <ul className="space-y-1.5">
                                {items.map((item, idx) => (
                                  <li key={idx} className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-orange-500 flex-shrink-0" />
                                    <span>{item}</span>
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

                {/* Call To Action Buttons */}
                <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800/80">
                  {!session ? (
                    <button
                      onClick={handleSignIn}
                      className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                        isPopular
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-orange-500/20"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <span>Launch Your Workspace</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      href={`/stores?plan=${plan.id}`}
                      className={`block text-center w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        isPopular
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-orange-500/20"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Select Plan
                    </Link>
                  )}
                </div>
              </Motion.div>
            );
          })}
        </div>

        {/* Enterprise Bottom Banner */}
        <Motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-[#0E131F] border border-slate-800 text-white text-left flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl"
        >
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">
              <BoltIcon className="w-4 h-4 text-orange-400" />
              <span>Multi-Store Enterprise Custom Tier</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">Need custom ERP integrations or dedicated database clusters?</h3>
            <p className="text-slate-400 text-xs sm:text-sm font-normal">
              We offer specialized deployment setups, high-volume M-PESA paybill routing, and custom SLAs for large retail franchises.
            </p>
          </div>
          <a
            href="https://wa.me/254706448146?text=Hi,%20I%20am%20interested%20in%20an%20Enterprise%20SalesmanPro%20Custom%20Plan"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-slate-100 transition-all duration-200 whitespace-nowrap shadow-md flex-shrink-0"
          >
            Contact Enterprise Team
          </a>
        </Motion.div>

      </div>
    </section>
  );
}