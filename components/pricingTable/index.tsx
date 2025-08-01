import React from "react";
import { motion as Motion } from "framer-motion";

const plans = [
  {
    name: "Ghuba Basic",
    price: "Ksh. 999",
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
    name: "Ghuba Starter",
    price: "Ksh. 2,999",
    features: {
      website: ["Custom domain", "SSL Certificate"],
      inventory: ["Unlimited Products", "Bulk Product Edit"],
      sales: ["Unlimited Sales Records", "50 Invoices & Receipts"],
      payments: ["Online Payment Gateway (KES + USD settlements)"],
      crm: ["100 Messaging credits", "Unlimited Customer Records", "5 Custom Groups"],
      operations: ["3 Staff users", "App + trend reports"],
      integrations: ["Facebook Pixel, Google Analytics, Fez Delivery"],
      support: ["Priority Support"],
    },
    isPopular: true,
  },
  {
    name: "Ghuba Pro",
    price: "Ksh. 6,999",
    features: {
      website: ["Custom domain + favicon", "SSL Certificate"],
      inventory: ["Unlimited Products", "Bulk Edit", "Variations"],
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
    name: "Ghuba Growth",
    price: "Ksh. 14,999",
    features: {
      website: ["Fully branded domain", "SSL Certificate"],
      inventory: ["Unlimited Products", "Bulk Edit", "Variations", "MOQ"],
      sales: ["Unlimited Sales & Receipts", "Coupons", "POS"],
      payments: ["KES, USD & EUR support"],
      crm: ["1000 Messaging credits", "Unlimited Records", "100 Custom Groups"],
      operations: ["Unlimited Staff", "Advanced analytics", "Multi-location"],
      integrations: ["Free-shipping rules engine"],
      support: ["Dedicated helpline"],
    },
    isPopular: false,
  },
];

const checkmarkIcon = (
  <svg
    className="flex-shrink-0 w-5 h-5 text-purple-500"
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

export default function PricingSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

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
            Choose a plan that fits your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400">
              business needs
            </span>
          </h2>
          <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-600">
            Start small and grow with us. All plans include essential features to help you succeed.
          </p>
        </Motion.div>

        <Motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="show"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.3 }}
        >
          {plans.map((plan) => (
            <Motion.div
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-3xl shadow-xl transition-all duration-500
              ${plan.isPopular ? 'bg-gradient-to-br from-pink-600 via-red-500 to-yellow-400 text-white transform scale-105 shadow-2xl' : 'bg-white border border-gray-200 text-gray-900 hover:scale-105'}`}
              variants={cardVariants}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md">
                  Most Popular
                </div>
              )}
              <h3 className={`text-2xl font-bold ${plan.isPopular ? 'text-white' : 'text-gray-800'}`}>
                {plan.name}
              </h3>
              <div className="mt-4 text-4xl font-extrabold flex items-center justify-center">
                <span className={`${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                <span className={`text-xl font-medium ml-2 ${plan.isPopular ? 'text-gray-200' : 'text-gray-500'}`}>
                  / month
                </span>
              </div>
              <p className={`mt-2 text-sm ${plan.isPopular ? 'text-gray-200' : 'text-gray-500'}`}>
                Perfect for growing businesses.
              </p>

              <ul className="mt-8 flex-grow space-y-4 text-left">
                {Object.entries(plan.features).map(([section, items]) => (
                  <div key={section}>
                    <p className={`font-semibold capitalize text-sm mb-2 ${plan.isPopular ? 'text-purple-200' : 'text-gray-700'}`}>
                      {section.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    {items.map((item: any, idx: any) => (
                      <li key={idx} className="flex items-start">
                        <div className="mt-1 mr-2">
                          {React.cloneElement(checkmarkIcon, {
                            className: `flex-shrink-0 w-5 h-5 ${plan.isPopular ? 'text-yellow-300' : 'text-purple-500'}`
                          })}
                        </div>
                        <span className={`text-sm ${plan.isPopular ? 'text-gray-100' : 'text-gray-600'}`}>{item}</span>
                      </li>
                    ))}
                  </div>
                ))}
              </ul>

              <div className="mt-8">
                <button
                  className={`w-full py-3 px-6 rounded-full font-bold text-lg shadow-lg transform transition-transform duration-300
                  ${plan.isPopular
                    ? 'bg-white text-red-600 hover:scale-105 hover:shadow-xl'
                    : 'bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 text-white hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </Motion.div>
          ))}
        </Motion.div>
      </div>
    </section>
  );
}

// const plans = [
//   {
//     name: 'Ghuba Basic',
//     features: {
//       website: ['Standard Ghuba subdomain', 'SSL Certificate'],
//       inventory: ['Unlimited Products'],
//       sales: ['Unlimited Sales Records', '20 Invoices & Receipts'],
//       payments: ['Online Payment Gateway (KES only)'],
//       crm: ['25 Messaging credits', 'Unlimited Customer Records', 'Default Groups'],
//       operations: ['1 Staff user', 'App dashboard'],
//       integrations: ['Facebook Pixel (ShipBubble)'],
//       support: ['Email & In-App Support'],
//     },
//   },
//   {
//     name: 'Ghuba Starter',
//     features: {
//       website: ['Custom domain', 'SSL Certificate'],
//       inventory: ['Unlimited Products', 'Bulk Product Edit'],
//       sales: ['Unlimited Sales Records', '50 Invoices & Receipts', 'Unlimited Coupons'],
//       payments: ['Online Payment Gateway (KES + USD settlements)'],
//       crm: ['100 Messaging credits', 'Unlimited Customer Records', '5 Custom Groups'],
//       operations: ['3 Staff users', 'App + trend reports', 'Expense Records'],
//       integrations: ['Facebook Pixel, Google Analytics, Fez Delivery'],
//       support: ['Priority Support'],
//     },
//   },
//   {
//     name: 'Ghuba Pro',
//     features: {
//       website: ['Custom domain + favicon', 'SSL Certificate'],
//       inventory: ['Unlimited Products', 'Bulk Edit', 'Variations'],
//       sales: ['Unlimited Sales & Receipts', 'Limit Coupons', 'POS'],
//       payments: ['Full KES & USD support'],
//       crm: ['200 Messaging credits', 'Unlimited Records', '20 Custom Groups'],
//       operations: ['5 Staff users', 'App + email insights', 'Reconciliation'],
//       integrations: ['All carriers + automation'],
//       support: ['Account Manager'],
//     },
//   },
//   {
//     name: 'Ghuba Growth',
//     features: {
//       website: ['Fully branded domain', 'SSL Certificate'],
//       inventory: ['Unlimited Products', 'Bulk Edit', 'Variations', 'MOQ'],
//       sales: ['Unlimited Sales & Receipts', 'Coupons', 'POS'],
//       payments: ['KES, USD & EUR support'],
//       crm: ['1000 Messaging credits', 'Unlimited Records', '100 Custom Groups'],
//       operations: ['Unlimited Staff', 'Advanced analytics', 'Multi-location'],
//       integrations: ['Free-shipping rules engine'],
//       support: ['Dedicated helpline'],
//     },
//   },
// ];