'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BuildingStorefrontIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon, // For modal close
  PlusIcon,  // For create button
} from "@heroicons/react/24/outline";
import StoreCard from '@/components/stores/StoreCard'; // This component MUST be updated
import useSWR, { mutate } from 'swr';
import { convertKEStoUSD, getUserCountry } from '@/lib/hooks/useUserCountry';
import { set } from 'lodash';

const defaultCompanyId = process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || "6825c2c7969ab9f16f620f67"; // Mocking as env vars aren't here
        
const fetcher = (url: string) => fetch(url, { credentials: 'include' })
.then(async res => 
    {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        let resJson = await res.json();
        return resJson.data;
    }   
);

// 1. --- CRITICAL: UPDATED STORE INTERFACE ---
// Your API MUST return these fields for each store
interface Store {
  id: string;
  name: string;
  slug: string;
  domain: string;
  companyId: string; // <-- REQUIRED
  subscriptionStatus: string; // <-- REQUIRED (e.g., 'ACTIVE', 'INACTIVE')
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  category?: string;
}

// --- Plan & Pricing Interfaces (from your provided code) ---
interface PlanFeatures {
  [key: string]: string[];
}

// ------------------------------------------------------------------
// --- 2. REUSABLE SUB-COMPONENTS (with style tweaks) ---
// ------------------------------------------------------------------

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; }) => {
    // Unchanged, this component is fine
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-6 bg-white w-96 max-w-full m-4 shadow-xl rounded-lg text-center transform transition-all">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl leading-6 font-bold text-gray-900">{title}</h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                </div>
                <div className="mt-5 flex justify-center space-x-4">
                    <button type="button" onClick={onCancel} className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="relative flex flex-col justify-between bg-white rounded-2xl shadow-md p-6 overflow-hidden">
        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
        <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
            <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
    </div>
);

const EmptyState = ({ title, message, buttonText, onButtonClick }: { title: string; message: string; buttonText: string; onButtonClick: () => void; }) => (
    <div className="text-center py-20 px-4 sm:px-6 lg:px-8 col-span-1 sm:col-span-2 lg:col-span-3">
        <BuildingStorefrontIcon className="mx-auto h-24 w-24 text-gray-300" />
        <h3 className="mt-4 text-3xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-lg text-gray-500">{message}</p>
        <div className="mt-8">
            <button 
                type="button" 
                onClick={onButtonClick} 
                className="inline-flex items-center px-6 py-3 font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
            >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                {buttonText}
            </button>
        </div>
    </div>
);
    
const PaginationControls = ({ page, totalPages, onPageChange } : {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}) => (
    <div className="mt-16 flex justify-center items-center space-x-4">
        <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-3 flex items-center rounded-full text-indigo-600 hover:bg-indigo-100 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
        >
            <ArrowLeftCircleIcon className="h-8 w-8" />
        </button>
        <span className="text-lg font-semibold text-gray-700 px-5 py-2 bg-white rounded-full shadow-md border border-gray-200">
            Page {page} <span className="text-gray-400">of</span> {totalPages}
        </span>
        <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-3 flex items-center rounded-full text-indigo-600 hover:bg-indigo-100 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
        >
            <ArrowRightCircleIcon className="h-8 w-8" />
        </button>
    </div>
);

// ------------------------------------------------------------------
// --- 3. PRICING COMPONENT (Modified to accept props) ---
// ------------------------------------------------------------------

// Mock PaystackPop type on window
declare global {
    interface Window { 
        PaystackPop: any; 
    }
}

const CheckIcon = (
  <svg
    className="flex-shrink-0 w-5 h-5"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

// --- Types ---
interface SiteTypePricing {
  monthly: number;
  yearly: number;
}

interface Plan {
  id?: string;
  _id?: { $oid: string };
  name: string;
  tagline?: string;
  price?: number;
  priceMonthly?: number;
  priceAnnually?: number;
  isPopular?: boolean;
  features: { [key: string]: string[] };
  siteTypePrices?: { [key: string]: SiteTypePricing };
}

// --- MAIN PRICING SECTION COMPONENT ---
// It now receives companyId and email, but onSubscriptionSuccess is handled internally
function PricingSection({ companyId, email, category, onSubscriptionSuccess }: { companyId: string, email: string, category: string, onSubscriptionSuccess: () => void }) {
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_4ec65e0fe08ffa32b2708be2adb75b865d2517ce";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [mpesaPaymentLoading, setMpesaPaymentLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"MONTHLY" | "ANNUALLY">("ANNUALLY"); // Auto-select Annually
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState<{ [key: string]: boolean }>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [usdPrices, setUsdPrices] = useState<Record<string, number>>({});
  const [isOutsideKenya, setIsOutsideKenya] = useState<boolean>(false);

  const [paymentMethod, setPaymentMethod] = useState<"PAYSTACK" | "MPESA">("PAYSTACK");
    const [mpesaPhone, setMpesaPhone] = useState("");
    const [mpesaRef, setMpesaRef] = useState("");
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const MPESA_TILL = "537214"; // <-- your Safaricom Till Number

  // --- Logic: Determine Price based on Category ---
  const getPlanPrice = (plan: Plan, period: "MONTHLY" | "ANNUALLY"): number => {
    // 1. Check if specific category pricing exists
    let pricingNode: SiteTypePricing | undefined;
    
    if (plan.siteTypePrices) {
      // Try exact category match, otherwise fallback to 'Default'
      pricingNode = plan.siteTypePrices[category] || plan.siteTypePrices["Default"];
    }

    if (pricingNode) {
      return period === "MONTHLY" ? pricingNode.monthly : pricingNode.yearly;
    }

    // 2. Fallback to root level pricing
    if (period === "MONTHLY") {
      return plan.priceMonthly ?? plan.price ?? 0;
    } else {
      // If priceAnnually exists use it, otherwise calc 12 months
      return plan.priceAnnually ?? ((plan.price ?? 0) * 12);
    }
  };

  // --- Logic: Currency Conversion Mock ---
  const convertKEStoUSD = async (amount: number) => {
    // In production, fetch live rates. Using static rate 1 USD = 130 KES for demo
    return amount / 130;
  };

  const showStatusMessage = (message: string, type: 'success' | 'error' = 'error') => {
    setSubscriptionStatus({ message, type });
    setTimeout(() => setSubscriptionStatus(null), 5000);
  };

  // --- Effects ---
  useEffect(() => {
    // Load Paystack
    if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => console.log("Paystack loaded.");
      script.onerror = () => showStatusMessage("Payment script failed.", "error");
      document.body.appendChild(script);
    }

    // Fetch Plans
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/plans?companyId=${defaultCompanyId}&category=${category}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPlans(data.plans?.length ? data.plans : []); // Fallback logic
      } catch (err) {
        console.warn("Using mock plans due to fetch error");
        // For this demo, I'm parsing the single object you gave in prompt into an array
        // Replace this with your actual fetch logic or fallback
        setPlans([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [category]); // Re-fetch if category changes

  useEffect(() => {
    const calcUsd = async () => {
      if (!isOutsideKenya) return;
      const prices: Record<string, number> = {};
      for (const plan of plans) {
        const cost = getPlanPrice(plan, billingPeriod); // Recalculate based on period
        const usd = await convertKEStoUSD(cost);
        prices[plan.id || "unknown"] = usd;
      }
      setUsdPrices(prices);
    };
    calcUsd();
  }, [isOutsideKenya, plans, billingPeriod]);


  // --- Handlers ---
  const handlePlanSelect = async (plan: Plan) => {
    setLoading(true);
    try {
      const price = getPlanPrice(plan, billingPeriod);
      const planId = plan.id || plan._id?.$oid; // Handle Mongo ID

      if (!price || !planId) throw new Error("Invalid plan configuration");

      let chargeAmount = price;
      if (isOutsideKenya) {
        chargeAmount = Math.round(await convertKEStoUSD(price) * 100) / 100;
      }
      
      const amountInKobo = Math.round(chargeAmount * 100);

      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          planId: planId,
          currency: isOutsideKenya ? "USD" : "KES",
          amount: amountInKobo,
          billingPeriod,
          monthsPaidFor: billingPeriod === "MONTHLY" ? 1 : 0,
          yearsPaidFor: billingPeriod === "ANNUALLY" ? 1 : 0
        })
      });

      const data = await res.json();
      
      if (!res.ok || !data?.data?.data?.authorization_url) {
        throw new Error(data.message || "Payment initialization failed");

      }

      // @ts-ignore
      const PaystackPop = window.PaystackPop;
      if (!PaystackPop) throw new Error("Paystack not loaded");

      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: email,
        amount: amountInKobo,
        ref: data.data.data.reference,
        currency: isOutsideKenya ? "USD" : "KES",
        metadata: { companyId, planId },
        callback: (response: any) => {
           window.location.href = `/payments/paystack/verify?reference=${response.reference}`;
        },
        onClose: () => {
          showStatusMessage("Payment cancelled", "error");
          setLoading(false);
        //   onSubscriptionSuccess();
        },
      });
      handler.openIframe();

    } catch (err: any) {
      console.error(err);
      showStatusMessage(err.message, "error");
      setLoading(false);
    }
  };

  const handleMpesaSubmit = async (plan: Plan) => {
  if (!mpesaPhone || !mpesaRef) {
    showStatusMessage("Enter phone and reference");
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

    if (!res.ok){
        setMpesaPaymentLoading(false);        
         throw new Error(data.message);
    }

    showStatusMessage("Payment submitted. Awaiting confirmation.", "success");
    setMpesaPhone("");
    setMpesaRef("");
    setSelectedPlan(null);
    setLoading(false);
    setMpesaPaymentLoading(false);
    onSubscriptionSuccess();

  } catch (err: any) {
    showStatusMessage(err.message);
    setLoading(false);
    setMpesaPaymentLoading(false);
  }
};

  // --- Render Helpers ---
  const renderPrice = (plan: Plan) => {
    const rawPrice = getPlanPrice(plan, billingPeriod);
    const planId = plan.id || plan._id?.$oid || "unknown";

    if (isOutsideKenya && usdPrices[planId]) {
      return `$${usdPrices[planId].toFixed(2)} USD`;
    }
    return `KSh ${rawPrice.toLocaleString()}`;
  };

  const renderSavingsBadge = (plan: Plan) => {
      const monthly = getPlanPrice(plan, "MONTHLY");
      const yearly = getPlanPrice(plan, "ANNUALLY");
      // Calculate generic savings: (Monthly*12) - Yearly
      const savings = (monthly * 12) - yearly;
      if (savings > 0) {
          const percent = Math.round((savings / (monthly * 12)) * 100);
          return <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full ml-2">Save {percent}%</span>
      }
      return null;
  }

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50 text-gray-900">
      
      {/* Toast Notification */}
      {subscriptionStatus && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl font-medium text-white ${subscriptionStatus.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}
        >
          {subscriptionStatus.message}
        </motion.div>
      )}

      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-7xl mx-auto text-center">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              {/* {category} */}
              Pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">SalesmanPro</span> Businesses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
              Choose the plan that fits your growth stage. Upgrade anytime as you scale.
            </p>
          </motion.div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm inline-flex relative">
                
                {/* Background Slider Animation */}
                <motion.div 
                    className="absolute top-1 bottom-1 bg-gray-900 rounded-full shadow-md z-0"
                    initial={false}
                    animate={{ 
                        left: billingPeriod === "MONTHLY" ? "4px" : "50%", 
                        width: "calc(50% - 4px)" 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <button
                    onClick={() => setBillingPeriod("MONTHLY")}
                    className={`relative z-10 px-16 py-2.5 text-sm font-bold rounded-full transition-colors duration-200 ${billingPeriod === "MONTHLY" ? "text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setBillingPeriod("ANNUALLY")}
                    className={`relative z-10 px-8 py-2.5 text-sm font-bold rounded-full transition-colors duration-200 flex items-center gap-2 ${billingPeriod === "ANNUALLY" ? "text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                    Annually
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${billingPeriod === "ANNUALLY" ? "bg-amber-400 text-black" : "bg-green-100 text-green-700"}`}>
                        Save 20%
                    </span>
                </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {plans.map((plan, index) => {
              const planId = plan.id || plan._id?.$oid || `plan-${index}`;
              const isPopular = plan.isPopular;

              return (
                <motion.div
                  key={planId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col p-8 bg-white rounded-3xl transition-all duration-300 ${isPopular ? "shadow-2xl ring-2 ring-orange-500 scale-105 z-10" : "shadow-lg border border-gray-100 hover:shadow-xl"}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mt-2 min-h-[40px]">{ plan.tagline}</p>
                    {/* plan.description || */}
                  </div>

                  <div className="mb-6 flex items-baseline justify-center">
                    <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                        {renderPrice(plan)}
                    </span>
                    <span className="text-gray-400 font-medium ml-2">
                        /{billingPeriod === "MONTHLY" ? "mo" : "yr"}
                    </span>
                  </div>

                  {billingPeriod === "ANNUALLY" && renderSavingsBadge(plan) && (
                       <div className="mb-6 text-center">
                           <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-lg">
                               Paid {renderPrice(plan)} / year
                           </span>
                       </div>
                  )}

                  {selectedPlan === plan && (
                        <div className="mt-4 space-y-3">
                            <div className="flex gap-3">
                            <button
                                onClick={() => setPaymentMethod("PAYSTACK")}
                                className={`flex-1 py-2 rounded-lg font-semibold ${
                                paymentMethod === "PAYSTACK"
                                    ? "bg-black text-white"
                                    : "bg-gray-100"
                                }`}
                            >
                                Paystack
                            </button>

                            <button
                                onClick={() => setPaymentMethod("MPESA")}
                                className={`flex-1 py-2 rounded-lg font-semibold ${
                                paymentMethod === "MPESA"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100"
                                }`}
                            >
                                M-Pesa
                            </button>
                            </div>

                            {paymentMethod === "MPESA" && (
                            <div className="bg-green-50 p-4 rounded-lg text-sm space-y-3">
                                <p className="font-semibold">Pay via M-Pesa Buy Goods</p>

                                <ol className="list-decimal ml-5 space-y-1">
                                <li>Go to M-Pesa</li>
                                <li>Select <b>Buy Goods</b></li>
                                <li>Enter Till: <b>{MPESA_TILL}</b></li>
                                <li>Enter amount shown</li>
                                <li>Confirm payment</li>
                                </ol>

                                <input
                                placeholder="Phone Number"
                                value={mpesaPhone}
                                onChange={(e) => setMpesaPhone(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                />

                                <input
                                placeholder="M-Pesa Reference (e.g QWE45RT)"
                                value={mpesaRef}
                                onChange={(e) => setMpesaRef(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                />

                                <button
                                onClick={() => handleMpesaSubmit(plan)}
                                className={`w-full  text-white py-2 rounded-lg font-bold ${mpesaPaymentLoading || loading ? "opacity-50 cursor-not-allowed bg-gray-500" : "bg-green-600"}`}
                                disabled={mpesaPaymentLoading || loading}
                                >
                                {mpesaPaymentLoading || loading ? "PROCESSING PAYMENT..." : "Confirm Payment"}
                                </button>
                            </div>
                            )}

                             {paymentMethod === "PAYSTACK" && (
                                <button
                                    onClick={() => handlePlanSelect(plan)}
                                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold mb-2"
                                >
                                    Pay with Paystack
                                </button>
                                )}
                        </div>          
                    )}

                {
                    // hide when plan is selected show when changed
                        selectedPlan !== plan &&
                  <button
                    // onClick={() => handlePlanSelect(plan)}
                    onClick={() => setSelectedPlan(plan)}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 active:scale-95 flex items-center justify-center
                      ${isPopular 
                        ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl" 
                        : "bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
                      } ${loading ? "opacity-70 cursor-wait" : ""}`}
                  >
                    {loading ? (
                         <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        `Choose ${plan.name}`
                    )}
                  </button>

                }

                  <div className="mt-8 pt-8 border-t border-gray-100 text-left space-y-4">
                    <p className="font-semibold text-gray-900">What's included:</p>
                    
                    {/* Render specific features or a flat list */}
                    {Object.entries(plan.features).slice(0, 4).map(([category, items]) => (
                        <div key={category}>
                            {items.slice(0, 2).map((feature, i) => (
                                <div key={i} className="flex items-start mb-3">
                                    <div className={`mt-1 p-0.5 rounded-full ${isPopular ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                                        {React.cloneElement(CheckIcon, { className: "w-3 h-3" })}
                                    </div>
                                    <span className="ml-3 text-sm text-gray-600 leading-relaxed">{feature}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                    
                    {/* Expand/Collapse Button */}
                    <button 
                        onClick={() => setIsFeaturesExpanded(prev => ({ ...prev, [planId]: !prev[planId] }))}
                        className="text-orange-600 text-sm font-semibold hover:underline mt-2 flex items-center"
                    >
                        {isFeaturesExpanded[planId] ? "Hide Features" : "See All Features"}
                    </button>

                    {/* Collapsible Section */}
                    <motion.div 
                        initial={false}
                        animate={{ height: isFeaturesExpanded[planId] ? "auto" : 0, opacity: isFeaturesExpanded[planId] ? 1 : 0 }}
                        className="overflow-hidden"
                    >
                        {Object.entries(plan.features).map(([category, items]) => (
                            <div key={category} className="mt-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{category}</h4>
                                {items.map((feature, i) => (
                                    <div key={i} className="flex items-start mb-2">
                                        <div className="mt-1 p-0.5 rounded-full bg-gray-50 text-gray-400">
                                            {React.cloneElement(CheckIcon, { className: "w-3 h-3" })}
                                        </div>
                                        <span className="ml-3 text-sm text-gray-500">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="mt-12 text-sm text-gray-400">
            Prices are subject to change. VAT may apply based on your location. <br />
            Need help choosing? <a href="#" className="text-orange-600 hover:underline">Contact our sales team</a>.
          </p>

        </div>
      </section>
    </div>
  );
}


const PricingModal = ({ isOpen, onClose, companyId, email,category, onSubscriptionSuccess }: { 
  isOpen: boolean, 
  onClose: () => void, 
  companyId: string | null,
  email: string,
  category: string,
  onSubscriptionSuccess: () => void
}) => {
    
    return (
        <AnimatePresence>
            {isOpen && companyId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center z-40 p-4"
                >
                    <motion.div
                        initial={{ y: "100vh", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100vh", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-7xl my-8"
                    >
                         <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-50 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="h-8 w-8" />
                        </button>
                        <div className="overflow-y-auto h-full max-h-[calc(100vh-4rem)] rounded-2xl">
                            <PricingSection 
                              companyId={companyId} 
                              email={email}
                              category={category}
                              onSubscriptionSuccess={onSubscriptionSuccess}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// ------------------------------------------------------------------
// --- 5. MAIN STORES PAGE COMPONENT ---
// ------------------------------------------------------------------

export default function StoresPage() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { data: session, status } = useSession();
    const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
    
    // State for the new Pricing Modal
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);

    // --- SWR Data Fetching ---
    // This API endpoint MUST return `companyId` and `subscriptionStatus` for each store.
    const { 
        data: stores = [], 
        error: storesError, 
        isLoading: isStoresLoading 
    } = useSWR<Store[]>(
        session?.user?.id ? `/api/stores?userId=${session.user.id}` : null,
        fetcher
    );

    // --- REMOVED global subscription fetch ---

    // --- Pagination Logic ---
    const pageSize = 12;
    const totalPages = useMemo(() => Math.ceil(stores.length / pageSize), [stores, pageSize]);
    const paginatedStores = useMemo(() => {
        const start = (page - 1) * pageSize;
        return stores.length > 0 && stores?.slice(start, start + pageSize);
    }, [stores, page, pageSize]);

    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(newPage));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleEdit = (id: string) => router.push(`/stores/${id}/edit`);

    const handleDeleteClick = (store: Store) => {
        setStoreToDelete(store);
        setIsDeleteModalOpen(true);
    };

    // New handler to open the pricing modal for a specific company
    const handleManageSubscription = (companyId: string, category: string) => {
        setSelectedCompanyId(companyId);
        setSelectedCategory(category);
        setIsPricingModalOpen(true);
    };

    // New handler to be called on subscription success
    const handleSubscriptionSuccess = () => {
        setIsPricingModalOpen(false);
        // Re-fetch the stores data to get the new 'ACTIVE' status
        mutate(`/api/stores?userId=${session?.user?.id}`);
        // Optionally, show a success toast/notification
    };

    const confirmDelete = async () => {
        if (!storeToDelete) return;
        setIsDeleteModalOpen(false);
        setIsDeleting(true); // You can use this to show a spinner on the card
        try {
            await fetch(`/api/stores/${storeToDelete.id}`, { method: 'DELETE' });
            mutate(`/api/stores?userId=${session?.user?.id}`);
        } catch (err) {
            console.error('Failed to delete store:', err);
        } finally {
            setIsDeleting(false);
            setStoreToDelete(null);
        }
    };

    const handleCreate = () => router.push(`/stores/create`);
    
    // Combined loading states
    const isAuthLoading = status === 'loading';
    const isLoading = isAuthLoading || isStoresLoading;


    // --- Render Logic ---

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <header className="flex items-center justify-between mb-10 pb-4 border-b border-gray-200">
                    <h1 className="text-4xl font-bold text-gray-800">Your Stores</h1>
                    <div className="h-12 w-48 bg-gray-300 rounded-lg animate-pulse"></div>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(pageSize)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Your Stores</h1>
                <p className="text-lg text-gray-600">Please sign in to manage your stores.</p>
            </div>
        );
    }

    if (storesError) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 text-center">
                 <h1 className="text-4xl font-bold text-gray-800 mb-8">Your Stores</h1>
                <p className="text-lg text-red-600">
                    Failed to load your stores. Please refresh the page.
                </p>
            </div>
        );
    }

    // --- Main Render: Active & Inactive Stores ---
    return (
        <>
            <div className="min-h-screen bg-slate-50 p-8">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-4 border-b border-gray-200">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Your Stores</h1>
                        <p className="mt-1 text-lg text-gray-500">Manage, edit, or create new stores.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 mt-4 sm:mt-0"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Create New Store</span>
                    </button>
                </header>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } }
                    }}
                >
                    {stores.length === 0 ? (
                        <EmptyState
                            title="No Stores Found"
                            message="It looks like you haven't created any stores yet. Get started!"
                            buttonText="Create Your First Store"
                            onButtonClick={handleCreate}
                        />
                    ) : (
                        paginatedStores && paginatedStores.map(store => {
                            const isActive = store.subscriptionStatus === 'ACTIVE' || store.subscriptionStatus === 'AWAITING_CONFIRMATION';
                            
                            return (
                                <motion.div
                                    key={store.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <StoreCard
                                        {...store}
                                        
                                        // --- Props for your StoreCard component ---
                                        // You MUST update StoreCard to use these props
                                        
                                        isActive={isActive}
                                        
                                        // Pass handlers only if active
                                        onEdit={isActive ? handleEdit : undefined}
                                        onDelete={isActive ? () => handleDeleteClick(store) : undefined}
                                        
                                        // Pass this handler to show a "Subscribe" button if !isActive
                                        onManageSubscription={!isActive ? () => handleManageSubscription(store.id, store.category || '') : undefined}
                                    />
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>

                {totalPages > 1 && (
                    <PaginationControls
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
            
            {/* Deletion Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${storeToDelete?.name}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />

            {/* Pricing Modal */}
            <PricingModal
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                companyId={selectedCompanyId}
                email={session.user?.email || ''}
                category={selectedCategory}
                onSubscriptionSuccess={handleSubscriptionSuccess}
            />
        </>
    );
}
