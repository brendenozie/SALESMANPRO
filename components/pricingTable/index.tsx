import React, { useEffect, useState, useMemo } from "react";
import { motion as Motion } from "framer-motion";

// --- Types (Simplified for clarity) ---
interface PlanFeatures {
  [key: string]: string[];
}

interface Plan {
  id: string;
  name: string;
  price?: string; // Original Price for fallback
  priceMonthly?: number;
  priceAnnually?: number;
  currency: string;
  features: PlanFeatures;
  isPopular: boolean;
  tagline: string; // Added for a short description
}

// Mock Data Structure (Using the original feature data, but adding required fields)
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
      website: ["Custom domain", "SSL Certificate", "Custom branding"], // Added Custom branding
      inventory: ["Unlimited Products", "Bulk Product Edit"],
      sales: ["Unlimited Sales Records", "50 Invoices & Receipts", "Coupon Codes"], // Changed from 50 invoices to clearer 'Coupon Codes'
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
      website: ["Custom domain + favicon", "SSL Certificate", "Advanced Theme Editor"], // Added Advanced Theme Editor
      inventory: ["Unlimited Products", "Bulk Edit", "Variations", "Low Stock Alerts"], // Added Low Stock Alerts
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
      website: ["Fully branded domain", "SSL Certificate", "Dedicated Success Team"], // Added Dedicated Success Team
      inventory: ["Unlimited Products", "Bulk Edit", "Variations", "MOQ"],
      sales: ["Unlimited Sales & Receipts", "Coupons", "POS", "Advanced Analytics"], // Added Advanced Analytics
      payments: ["KES, USD & EUR support"],
      crm: ["1000 Messaging credits", "Unlimited Records", "100 Custom Groups"],
      operations: ["Unlimited Staff", "Advanced analytics", "Multi-location"],
      integrations: ["Free-shipping rules engine", "Custom API Access"], // Added Custom API Access
      support: ["Dedicated helpline"],
    },
    isPopular: false,
  },
];

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

// --- Component Start ---

export default function PricingSectionRedesign() {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS); // Use mock data initially
  const [loading, setLoading] = useState(false); // Set to true to fetch, false for mock

  // State to manage the collapse/expand feature on mobile
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState<{ [key: string]: boolean }>({});

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

  // Improved Price Logic: Tries Monthly -> Annual -> Original String
  const getPriceDisplay = (plan: Plan) => {
    const priceValue = plan.priceMonthly ?? plan.priceAnnually;
    if (priceValue) {
      // Format number to currency string, e.g., 999 -> "999" (You'll likely want better formatting for production)
      return `${plan.currency} ${priceValue.toLocaleString()}`;
    }
    // Fallback to the original string price if no structured data is available
    return plan.price || `${plan.currency} N/A`;
  };

  // Determine Core Features for better visibility (First 3 unique features)
  const getCoreFeatures = (plan: Plan) => {
    const allFeatures = Object.values(plan.features).flat();
    return allFeatures.slice(0, 3); // Show the first 3 features as 'Core'
  };

  if (loading) {
    return (
      <section className="py-24 bg-gray-50 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-orange-500 border-gray-200 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading plans...</p>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <Motion.div
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
          <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-600">
            Start small and grow with us. All plans include essential features to help you succeed.
          </p>
        </Motion.div>

        {/* Desktop Layout - Grid | Mobile Layout - Horizontal Scroll (Overflow-x-auto) */}
        <div className="mt-16 overflow-x-auto">
          <Motion.div
            className="w-max mx-auto grid grid-flow-col md:grid-flow-row md:grid-cols-2 lg:grid-cols-4 gap-8 py-4" // w-max and grid-flow-col for horizontal scroll on mobile
            initial="hidden"
            whileInView="show"
            variants={containerVariants}
            viewport={{ once: true, amount: 0.2 }}
          >
            {plans.map((plan) => (
              <Motion.div
                key={plan.id}
                className={`relative flex flex-col w-72 md:w-auto p-8 rounded-3xl transition-all duration-500
                ${plan.isPopular
                    ? "bg-white ring-4 ring-orange-500 shadow-2xl scale-[1.03]"
                    : "bg-white border border-gray-200 shadow-lg hover:shadow-xl"
                  }
                `}
                variants={cardVariants}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md transform rotate-1">
                    Recommended
                  </div>
                )}
                
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className={`text-3xl font-bold ${plan.isPopular ? "text-orange-600" : "text-gray-800"}`}>
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>

                  <div className="mt-6 text-5xl font-extrabold flex items-baseline justify-center">
                    <span className={`${plan.isPopular ? "text-gray-900" : "text-gray-900"}`}>
                      {getPriceDisplay(plan)}
                    </span>
                    <span className="text-xl font-medium ml-2 text-gray-500">
                      / mo
                    </span>
                  </div>
                </div>


                {/* Button */}
                <div className="mb-8">
                  {/* <button
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-transform duration-300
                      ${plan.isPopular
                        ? "bg-orange-600 text-white hover:bg-orange-700 hover:scale-[1.02] shadow-orange-400/50"
                        : "bg-gray-100 text-orange-600 border-2 border-orange-600 hover:bg-orange-50 hover:scale-[1.02]"
                      }`}
                  >
                    Start {plan.name}
                  </button> */}
                </div>
                
                {/* Feature List */}
                <div className="flex-grow space-y-3 text-left border-t pt-6">
                  <p className="text-base font-semibold text-gray-700">Core Features:</p>
                  <ul className="space-y-3">
                    {getCoreFeatures(plan).map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        {React.cloneElement(CheckIcon, {
                          className: `flex-shrink-0 w-5 h-5 ${plan.isPopular ? "text-orange-500" : "text-green-500"}`,
                        })}
                        <span className="ml-3 text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Mobile-friendly Collapsible Detail Feature List */}
                  <div className="mt-6 md:hidden">
                    <button
                      onClick={() => setIsFeaturesExpanded(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center"
                    >
                      {isFeaturesExpanded[plan.id] ? "Hide Details" : "Show All Features"}
                      <svg className={`ml-2 w-4 h-4 transition-transform ${isFeaturesExpanded[plan.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                  
                  {/* Detailed Feature List - Visible on Desktop, Collapsible on Mobile */}
                  <Motion.div
                    initial={false}
                    animate={isFeaturesExpanded[plan.id] || window.innerWidth >= 768 ? "open" : "collapsed"} // Animate based on state or viewport width
                    variants={{
                      open: { height: "auto", opacity: 1 },
                      collapsed: { height: 0, opacity: 0.5 },
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden md:h-auto md:opacity-100" // Ensure desktop visibility
                  >
                    <div className="pt-4 space-y-4">
                      {Object.entries(plan.features).map(([section, items]) => (
                        <div key={section} className="mt-4">
                          <p className="font-bold capitalize text-sm mb-2 text-gray-800 border-b border-gray-100 pb-1">
                            {section.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <ul className="space-y-2">
                            {items.map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                {React.cloneElement(CheckIcon, {
                                  className: `flex-shrink-0 w-5 h-5 ${plan.isPopular ? "text-orange-500" : "text-green-500"}`,
                                })}
                                <span className="ml-3 text-sm text-gray-600">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </Motion.div>
                </div>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </div>
    </section>
  );
}