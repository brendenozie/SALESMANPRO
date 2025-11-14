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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

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

interface Plan {
  id: string;
  name: string;
  price?: string;
  priceMonthly?: number;
  priceAnnually?: number;
  currency: string;
  features: PlanFeatures;
  isPopular: boolean;
  tagline: string;
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

// import React, { useState } from 'react';

// Define the necessary type structures
// type Plan = {
//   id: string;
//   name: string;
//   price: string;
//   priceMonthly?: number;
//   priceAnnually?: number;
//   currency: string;
//   tagline: string;
//   features: { [key: string]: string[] };
//   isPopular: boolean;
// };

// Mock the framer-motion library's components as simple divs for compilation
// This ensures the component compiles without external imports.
// const motion = {
//   div: (props) => <div {...props} />,
// };

// --- START MOCK DATA (Data Structure is unchanged as requested) ---
const MOCK_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Ghuba Basic",
    price: "Ksh. 999",
    priceMonthly: 999,
    currency: "Ksh.",
    tagline: "Just the essentials to get you selling.",
    features: {
      website: ["Standard Ghuba subdomain", "SSL Certificate"],
      inventory: ["Unlimited Products"],
      sales: ["Unlimited Sales Records", "20 Invoices & Receipts"],
      payments: ["Online Payment Gateway (KES only)"],
      crm: ["25 Messaging credits", "Unlimited Customer Records"],
      operations: ["1 Staff user", "App dashboard"],
      integrations: ["Facebook Pixel (ShipBubble)"],
      support: ["Email & In-App Support"],
    },
    isPopular: false,
  },
  {
    id: "starter",
    name: "Ghuba Starter",
    price: "Ksh. 2,999",
    priceMonthly: 2999,
    currency: "Ksh.",
    tagline: "Scale your sales with powerful tools.",
    features: {
      website: ["Custom domain", "SSL Certificate", "Custom branding"],
      inventory: ["Unlimited Products", "Bulk Product Edit"],
      sales: ["Unlimited Sales Records", "50 Invoices & Receipts", "Coupon Codes"],
      payments: ["Online Payment Gateway (KES + USD settlements)"],
      crm: ["100 Messaging credits", "Unlimited Customer Records", "5 Custom Groups"],
      operations: ["3 Staff users", "App + trend reports"],
      integrations: ["Facebook Pixel, Google Analytics, Fez Delivery"],
      support: ["Priority Support"],
    },
    isPopular: true,
  },
  {
    id: "pro",
    name: "Ghuba Pro",
    price: "Ksh. 6,999",
    priceMonthly: 6999,
    currency: "Ksh.",
    tagline: "Automate and optimize for maximum growth.",
    features: {
      website: ["Custom domain + favicon", "SSL Certificate", "Advanced Theme Editor"],
      inventory: ["Unlimited Products", "Bulk Edit", "Variations", "Low Stock Alerts"],
      sales: ["Unlimited Sales & Receipts", "Limit Coupons", "POS"],
      payments: ["Full KES & USD support"],
      crm: ["200 Messaging credits", "Unlimited Records", "20 Custom Groups"],
      operations: ["5 Staff users", "App + email insights"],
      integrations: ["All carriers + automation"],
      support: ["Account Manager"],
    },
    isPopular: false,
  },
  {
    id: "growth",
    name: "Ghuba Growth",
    price: "Ksh. 14,999",
    priceMonthly: 14999,
    currency: "Ksh.",
    tagline: "Enterprise-grade power for your business.",
    features: {
      website: ["Fully branded domain", "SSL Certificate", "Dedicated Success Team"],
      inventory: ["Unlimited Products", "Bulk Edit", "Variations", "MOQ"],
      sales: ["Unlimited Sales & Receipts", "Coupons", "POS", "Advanced Analytics"],
      payments: ["KES, USD & EUR support"],
      crm: ["1000 Messaging credits", "Unlimited Records", "100 Custom Groups"],
      operations: ["Unlimited Staff", "Advanced analytics", "Multi-location"],
      integrations: ["Free-shipping rules engine", "Custom API Access"],
      support: ["Dedicated helpline"],
    },
    isPopular: false,
  },
];
// --- END MOCK DATA ---

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


function PricingSection({companyId, onSubscriptionSuccess}: {companyId: string, onSubscriptionSuccess: () => void}) {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(false);
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState<{ [key: string]: boolean }>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

       useEffect(() => {
      const fetchPlans = async () => {
        try {
        
          const res = await fetch(`/api/plans?companyId=${process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID}`);
          const data = await res.json();
          setPlans(data.plans);
        } catch (err) {
          console.error("Failed to fetch plans", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchPlans();
    }, []);
  
  // This is the new handler for the button
  const handlePlanSelect = async (plan: Plan) => {
    console.log(`Subscribing company ${companyId} to plan ${plan.id}`);
    
    // --- THIS IS WHERE YOU MAKE YOUR API CALL ---
    // try {
    //   const res = await fetch(`${apiBaseUrl}/subscriptions`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       companyId: companyId,
    //       planId: plan.id,
    //       // ... any other details, like payment tokens
    //     })
    //   });
    //   if (!res.ok) throw new Error('Subscription failed');
      
    //   // On success, call the handler to close modal & refresh data
    //   onSubscriptionSuccess();

    // } catch (err) {
    //   console.error("Failed to create subscription:", err);
    //   // TODO: Show an error message to the user
    // }

    // For demonstration, we just call success immediately
    onSubscriptionSuccess();
  };


  const getPriceDisplay = (plan: Plan) => {
    const priceValue = plan.priceMonthly ?? plan.priceAnnually;
    if (priceValue) {
      return `${plan.currency} ${priceValue.toLocaleString()}`;
    }
    return plan.price || `${plan.currency} N/A`;
  };

  const getCoreFeatures = (plan: Plan) => {
    const allFeatures = Object.values(plan.features).flat();
    return allFeatures.slice(0, 3);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-orange-500 border-gray-200 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading plans...</p>
      </section>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        /* Custom styling for the recommended card to ensure border glow */
        .popular-card-outer {
          padding: 2px;
          border-radius: 1.75rem; /* Matches rounded-3xl */
          background: linear-gradient(145deg, #FF7043 0%, #FFB74D 100%);
          transform: scale(1.02); /* Subtle emphasis */
          transition: transform 0.3s ease-out;
        }
        .popular-card-inner {
          background-color: white;
          border-radius: 1.6rem; /* Slightly smaller for padding effect */
          height: 100%;
          box-shadow: 0 10px 20px rgba(255, 112, 67, 0.2); /* Deep shadow */
        }
        .regular-card {
            transition: all 0.3s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
        }
        .regular-card:hover {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            transform: translateY(-4px); /* Lift effect on hover */
        }
      `}</style>

      {/* Subscription Status Message Box (Replaces alert/confirm) */}
      {subscriptionStatus && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-green-600 text-white rounded-xl shadow-2xl transition-all duration-300 transform animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {subscriptionStatus}
        </div>
      )}

      <section className="py-28 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Pricing Plans for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-500 to-red-400">
                Every Business Stage
              </span>
            </h2>
            <p className="mt-6 text-xl max-w-3xl mx-auto text-gray-600">
              Start small and grow with us. All plans include essential features to help you succeed, backed by dedicated support.
            </p>
          </motion.div>
          
          <div className="mt-16 overflow-x-auto py-6">
            <motion.div
              className="w-max mx-auto grid grid-flow-col auto-cols-[minmax(280px,_1fr)] md:grid-flow-row md:grid-cols-2 lg:grid-cols-4 gap-6 py-4"
              initial="hidden"
              animate="show"
              variants={containerVariants}
            >
              {plans.map((plan) => (
                <div key={plan.id} className={plan.isPopular ? "popular-card-outer" : "p-0"}>
                  <motion.div
                    className={`relative flex flex-col w-72 md:w-auto p-8 rounded-3xl ${plan.isPopular ? "popular-card-inner" : "regular-card bg-white border border-gray-100"}`}
                    variants={cardVariants}
                  >
                    
                    {/* Popular tag */}
                    {plan.isPopular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        ⭐ RECOMMENDED
                      </div>
                    )}
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                      <h3 className={`text-3xl font-extrabold ${plan.isPopular ? "text-orange-600" : "text-gray-900"}`}>
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 font-medium">{plan.tagline}</p>

                      <div className="mt-8 text-6xl font-black flex items-baseline justify-center">
                        <span className="text-gray-900">
                          {getPriceDisplay(plan)}
                        </span>
                        <span className="text-2xl font-semibold ml-2 text-gray-500">
                          / mo
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Billed Annually. Cancel Anytime.</p>
                    </div>
                    
                    {/* --- ACTIVATED BUTTON --- */}
                    <div className="mb-8">
                      <button
                        onClick={() => handlePlanSelect(plan)} 
                        className={`w-full py-4 px-6 rounded-xl font-extrabold text-lg shadow-lg transform transition-transform duration-300 active:scale-[0.98]
                          ${plan.isPopular
                            ? "bg-gradient-to-r from-orange-600 to-pink-500 text-white hover:opacity-95 shadow-orange-500/50"
                            : "bg-white text-orange-600 border-2 border-orange-600 hover:bg-orange-50"
                          } hover:scale-[1.01]`}
                      >
                        Start {plan.name}
                      </button>
                    </div>
                    
                    {/* Feature List */}
                    <div className="flex-grow space-y-3 text-left border-t border-gray-200 pt-6">
                      <p className="text-lg font-bold text-gray-800 mb-4">Core Benefits:</p>
                      <ul className="space-y-4">
                        {getCoreFeatures(plan).map((item, idx) => (
                          <li key={`core-${idx}`} className="flex items-start">
                            {React.cloneElement(CheckIcon, {
                              className: `flex-shrink-0 w-6 h-6 ${plan.isPopular ? "text-pink-500" : "text-orange-500"}`,
                            })}
                            <span className="ml-3 text-base text-gray-700 font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    
                      {/* Mobile-friendly Collapsible Detail Feature List */}
                      <div className="mt-8">
                        <button
                          onClick={() => setIsFeaturesExpanded(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                          className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center md:hidden transition-colors"
                        >
                          {isFeaturesExpanded[plan.id] ? "Hide Full Feature Set" : "Show All Detailed Features"}
                          <svg className={`ml-2 w-4 h-4 transition-transform ${isFeaturesExpanded[plan.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                      </div>
                      
                      {/* Detailed Feature List - Visible on Desktop, Collapsible on Mobile */}
                      <motion.div
                        initial={false}
                        animate={isFeaturesExpanded[plan.id] || window.innerWidth >= 768 ? "open" : "collapsed"}
                        variants={{
                          open: { height: "auto", opacity: 1 },
                          collapsed: { height: 0, opacity: 0.5 },
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden md:h-auto md:opacity-100"
                      >
                        <div className="pt-4 space-y-4">
                          {Object.entries(plan.features).map(([section, items]) => (
                            <div key={section} className="mt-6">
                              <p className="font-extrabold capitalize text-sm mb-3 text-gray-900 border-b-2 border-orange-500/20 inline-block pb-1">
                                {section.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <ul className="space-y-3">
                                {items.map((item, idx) => (
                                  <li key={idx} className="flex items-start">
                                    {React.cloneElement(CheckIcon, {
                                      className: `flex-shrink-0 w-5 h-5 ${plan.isPopular ? "text-pink-400" : "text-green-500"}`,
                                    })}
                                    <span className="ml-3 text-sm text-gray-600">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
// ```eof
// ------------------------------------------------------------------
// --- 4. PRICING MODAL (Hosts the Pricing Section) ---
// ------------------------------------------------------------------

const PricingModal = ({ isOpen, onClose, companyId, onSubscriptionSuccess }: { 
  isOpen: boolean, 
  onClose: () => void, 
  companyId: string | null,
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
        session?.user?.id ? `${apiBaseUrl}/stores?userId=${session.user.id}` : null,
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
    const handleManageSubscription = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setIsPricingModalOpen(true);
    };

    // New handler to be called on subscription success
    const handleSubscriptionSuccess = () => {
        setIsPricingModalOpen(false);
        // Re-fetch the stores data to get the new 'ACTIVE' status
        mutate(`${apiBaseUrl}/stores?userId=${session?.user?.id}`);
        // Optionally, show a success toast/notification
    };

    const confirmDelete = async () => {
        if (!storeToDelete) return;
        setIsDeleteModalOpen(false);
        setIsDeleting(true); // You can use this to show a spinner on the card
        try {
            await fetch(`${apiBaseUrl}/stores/${storeToDelete.id}`, { method: 'DELETE' });
            mutate(`${apiBaseUrl}/stores?userId=${session?.user?.id}`);
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
                        className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 mt-4 sm:mt-0"
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
                            const isActive = store.subscriptionStatus === 'ACTIVE';
                            
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
                                        onManageSubscription={!isActive ? () => handleManageSubscription(store.id) : undefined}
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
                onSubscriptionSuccess={handleSubscriptionSuccess}
            />
        </>
    );
}
// 'use client';

// import React, { useState, useMemo } from 'react';
// // 1. Import hooks for URL state management
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import {
//   BuildingStorefrontIcon,
//   ArrowLeftCircleIcon,
//   ArrowRightCircleIcon,
//   ExclamationTriangleIcon,
// } from "@heroicons/react/24/outline";
// import StoreCard from '@/components/stores/StoreCard';
// import useSWR, { mutate } from 'swr';

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// const fetcher = (url: string) => fetch(url, { credentials: 'include' })
// .then(async res => 
//     {
//         if (!res.ok) {
//             throw new Error('Network response was not ok');
//         }

//         let resJson = await res.json();

//         return resJson.data;
//     }   
// );

// interface Store {
//   id: string;
//   name: string;
//   slug: string;
//   description?: string;
//   bannerUrl?: string;
//   contactEmail?: string;
//   contactPhone?: string;
//   category?: string;
// }

// // A component for the custom confirmation dialog.
// const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; }) => {
//     if (!isOpen) return null;
//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
//             <div className="relative p-6 bg-white w-96 max-w-full m-4 shadow-xl rounded-lg text-center transform transition-all">
//                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
//                     <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
//                 </div>
//                 <h3 className="text-xl leading-6 font-bold text-gray-900">{title}</h3>
//                 <div className="mt-2">
//                     <p className="text-sm text-gray-500">{message}</p>
//                 </div>
//                 <div className="mt-5 flex justify-center space-x-4">
//                     <button type="button" onClick={onCancel} className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm">
//                         Cancel
//                     </button>
//                     <button type="button" onClick={onConfirm} className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm">
//                         Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // A component for the animated loading state.
// const SkeletonCard = () => (
//     <div className="relative flex flex-col justify-between bg-white rounded-lg shadow-md animate-pulse p-6">
//         <div className="w-full h-40 bg-gray-300 rounded-t-lg mb-4"></div>
//         <div className="space-y-2">
//             <div className="h-6 bg-gray-300 rounded-md w-3/4"></div>
//             <div className="h-4 bg-gray-300 rounded-md"></div>
//             <div className="h-4 bg-gray-300 rounded-md w-5/6"></div>
//         </div>
//         <div className="flex justify-end mt-4">
//             <div className="h-6 w-16 bg-gray-300 rounded-md mr-2"></div>
//             <div className="h-6 w-16 bg-gray-300 rounded-md"></div>
//         </div>
//     </div>
// );

// // A component for a visually engaging empty state.
// const EmptyState = ({ title, message, buttonText, onButtonClick }: { title: string; message: string; buttonText: string; onButtonClick: () => void; }) => (
//     <div className="text-center py-20 px-4 sm:px-6 lg:px-8">
//         <BuildingStorefrontIcon className="mx-auto h-20 w-20 text-gray-400" />
//         <h3 className="mt-4 text-2xl font-medium text-gray-900">{title}</h3>
//         <p className="mt-2 text-sm text-gray-500">{message}</p>
//         <div className="mt-6">
//             <button type="button" onClick={onButtonClick} className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
//                 <BuildingStorefrontIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
//                 {buttonText}
//             </button>
//         </div>
//     </div>
// );

// // A component for the pagination controls (Updated to be a controlled component).
    
// const PaginationControls = ({ page, totalPages, onPageChange } : {
//     page: number;
//     totalPages: number;
//     onPageChange: (newPage: number) => void;
// }) => (
//     <div className="mt-12 flex justify-center items-center space-x-6">
//         <button
//             onClick={() => onPageChange(page - 1)}
//             disabled={page <= 1}
//             className="p-3 flex items-center rounded-full text-indigo-600 hover:bg-indigo-50 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition duration-150 transform hover:scale-[1.05]"
//         >
//             <ArrowLeftCircleIcon className="h-7 w-7" />
//             <span className='ml-2 text-base font-semibold hidden sm:inline'>Previous</span>
//         </button>
//         <span className="text-lg font-semibold text-gray-700 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
//             Page {page} of {totalPages}
//         </span>
//         <button
//             onClick={() => onPageChange(page + 1)}
//             disabled={page >= totalPages}
//             className="p-3 flex items-center rounded-full text-indigo-600 hover:bg-indigo-50 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition duration-150 transform hover:scale-[1.05]"
//         >
//              <span className='mr-2 text-base font-semibold hidden sm:inline'>Next</span>
//             <ArrowRightCircleIcon className="h-7 w-7" />
//         </button>
//     </div>
// );


// export default function StoresPage() {
//     const [isDeleting, setIsDeleting] = useState(false);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const { data: session, status } = useSession();
//     const [store, setStore] = useState<Store | null>(null);
    
//     // 2. Initialize hooks to read from and write to the URL
//     const router = useRouter();
//     const pathname = usePathname();
//     const searchParams = useSearchParams();

//     // 3. Read page number from URL. The URL is now the single source of truth.
//     // We parse it and provide a fallback of '1'.
//     const page = parseInt(searchParams.get('page') || '1', 10);

//     const { data: stores = [], error, isLoading } = useSWR<Store[]>(
//         session?.user?.id ? `${apiBaseUrl}/stores?userId=${session.user.id}` : null,
//         fetcher
//     );

//     const pageSize = 12;
//     const totalPages = useMemo(() => Math.ceil(stores.length / pageSize), [stores, pageSize]);
//     const paginatedStores = useMemo(() => {
//         const start = (page - 1) * pageSize;
//         return stores.length > 0 && stores?.slice(start, start + pageSize);
//     }, [stores, page, pageSize]);

//     // 4. Create a handler that updates the URL when the page changes
//     const handlePageChange = (newPage: number) => {
//         const params = new URLSearchParams(searchParams.toString());
//         params.set('page', String(newPage));
//         router.push(`${pathname}?${params.toString()}`);
//     };

//     const handleEdit = (id: string) => router.push(`/stores/${id}/edit`);

//     const handleDeleteClick = (storeToDelete: Store) => {
//         setStore(storeToDelete);
//         setIsModalOpen(true);
//     };

//     const confirmDelete = async () => {
//         if (!store) return;
//         setIsModalOpen(false);
//         setIsDeleting(true);
//         try {
//             const res = await fetch(`${apiBaseUrl}/stores/${store.id}`, { method: 'DELETE' });
//             if (!res.ok) throw new Error('Delete failed');
//             mutate(`${apiBaseUrl}/stores?userId=${session?.user?.id}`);
//         } catch (err) {
//             console.error('Failed to delete store:', err);
//         } finally {
//             setIsDeleting(false);
//             setStore(null);
//         }
//     };

//     const handleCreate = () => router.push(`/stores/create`);
//     const isAuthLoading = status === 'loading';

//     return (
//         <>
//             <div className="min-h-screen bg-gray-50 p-8">
//                 <header className="flex items-center justify-between mb-8">
//                     <h1 className="text-4xl font-extrabold text-gray-800">Your Stores</h1>
//                     <button
//                         onClick={handleCreate}
//                         className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
//                     >
//                         <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
//                         Create New Store
//                     </button>
//                 </header>

//                 {isAuthLoading ? (
//                     <p className="p-8 text-center">Checking session…</p>
//                 ) : !session ? (
//                     <p className="p-8 text-center">Please sign in to manage your stores.</p>
//                 ) : error ? (
//                     <p className="p-8 text-center text-red-600">Failed to load stores.</p>
//                 ) : isLoading ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {[...Array(pageSize)].map((_, i) => <SkeletonCard key={i} />)}
//                     </div>
//                 ) : stores.length === 0 ? (
//                     <EmptyState
//                         title="No Stores Found"
//                         message="It looks like you haven't created any stores yet. Get started by creating one!"
//                         buttonText="Create Your First Store"
//                         onButtonClick={handleCreate}
//                     />
//                 ) : (
//                     <>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {paginatedStores && paginatedStores?.map(store => (
//                                 <StoreCard
//                                     key={store.id}
//                                     {...store}
//                                     onEdit={handleEdit}
//                                     // Pass a function that captures the specific store for deletion
//                                     onDelete={() => handleDeleteClick(store)}
//                                 />
//                             ))}
//                         </div>

//                         {totalPages > 1 && (
//                             <PaginationControls
//                                 page={page}
//                                 totalPages={totalPages}
//                                 onPageChange={handlePageChange}
//                             />
//                         )}
//                     </>
//                 )}
//             </div>
//             <ConfirmationModal
//                 isOpen={isModalOpen}
//                 title="Confirm Deletion"
//                 message="Are you sure you want to delete this store? This action cannot be undone."
//                 onConfirm={confirmDelete}
//                 onCancel={() => setIsModalOpen(false)}
//             />
//         </>
//     );
// }