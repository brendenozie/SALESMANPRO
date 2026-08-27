"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  CheckIcon, // Used for perks checkmarks
  WrenchScrewdriverIcon, // For custom/enterprise plan
  CurrencyDollarIcon, // For pricing related
} from "@heroicons/react/24/solid";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

// --- Dummy Data for Plans (Replace with your actual data) ---
const dummyPlans = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for individuals and small teams.",
    price: "$29",
    perks: [
      "5 Users",
      "10 GB Storage",
      "Basic Analytics",
      "Email Support",
      "Standard Features",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Ideal for growing businesses and advanced teams.",
    price: "$99",
    perks: [
      "Unlimited Users",
      "100 GB Storage",
      "Advanced Analytics",
      "Priority Email & Chat Support",
      "All Core Features",
      "Custom Integrations (Limited)",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    tagline: "For large enterprises needing robust solutions.",
    price: "$249",
    perks: [
      "Unlimited Users & Teams",
      "Unlimited Storage",
      "Premium Analytics & Reporting",
      "Dedicated Account Manager",
      "All Pro Features",
      "Advanced Security & Compliance",
      "SLA Support",
    ],
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Tailored solutions for unique enterprise needs.",
    price: "Custom",
    perks: [
      "Custom User Management",
      "Bespoke Integrations",
      "On-Premise Deployment",
      "24/7 Premium Support",
      "Dedicated Infrastructure",
      "Strategic Partnership",
    ],
    popular: false,
    contact: true, // Mark this plan as requiring contact
  },
];

//──────────────────────────────────────────────────────────────────────────────
// EnhancedPricingSection
//──────────────────────────────────────────────────────────────────────────────
export default function EnhancedPricingSection({
  plans = [],
  handleSignup,
}: {
  plans?: any[];
  handleSignup: (planId: string) => void;
}) {
  const displayPlans = plans.length > 0 ? plans : dummyPlans;
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' or 'annually'

  // Function to adjust prices for annual billing (example logic)
  const getDisplayPrice = (price: string) => {
    if (price === "Custom") return price;
    const value = parseInt(price.replace('$', ''));
    if (billingCycle === "annually" && value) {
      return `$${Math.round(value * 0.8)}`; // Example: 20% discount for annual
    }
    return price;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-indigo-700 dark:text-indigo-400 drop-shadow-sm"
            variants={itemVariants}
          >
            Flexible Pricing, Powerful Results
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8"
            variants={itemVariants}
          >
            Choose the plan that best fits your needs. Scale up or down as your business grows.
          </motion.p>

          {/* Billing Cycle Toggle (Optional, can be integrated if you have annual pricing) */}
          <motion.div
            className="inline-flex rounded-full bg-gray-200 dark:bg-gray-700 p-1 shadow-inner"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`py-2 px-6 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-white text-indigo-700 shadow"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className={`py-2 px-6 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingCycle === "annually"
                  ? "bg-white text-indigo-700 shadow"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              Annually <span className="ml-1 text-green-600 dark:text-green-400 font-bold">(Save 20%)</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {displayPlans.map((plan, i) => {
            const isPopular = plan.popular;
            const isContactPlan = plan.contact;

            return (
              <motion.div
                key={i}
                className={`relative flex flex-col p-8 rounded-3xl shadow-xl transition-all duration-300 cursor-pointer h-full
                  ${isPopular
                    ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white transform scale-[1.03] shadow-2xl ring-4 ring-indigo-300/50 dark:ring-indigo-700/50"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                  }
                  hover:${isPopular ? "scale-[1.05]" : "translate-y-[-8px] shadow-2xl"}
                `}
                variants={itemVariants}
                whileHover={isPopular ? { translateY: -10 } : { translateY: -8 }} // More pronounced hover for popular
                transition={{ type: "spring", stiffness: 150, damping: 10 }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 right-6 bg-white text-indigo-600 px-4 py-2 rounded-full flex items-center space-x-1 shadow-lg font-bold text-sm z-10">
                    <StarIcon className="h-4 w-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                )}

                {/* Plan Header */}
                <h3 className={`text-3xl font-extrabold mb-2 ${isPopular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${isPopular ? "text-indigo-200" : "text-gray-600 dark:text-gray-300"}`}>
                  {plan.tagline}
                </p>

                {/* Price */}
                <p className={`text-5xl font-extrabold mb-6 ${isPopular ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`}>
                  {getDisplayPrice(plan.price)}
                  {!isContactPlan && (
                    <span className={`text-xl font-medium ${isPopular ? "text-indigo-200" : "text-gray-600 dark:text-gray-400"}`}>
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  )}
                </p>

                {/* Perks List */}
                <ul className="flex-1 space-y-4 mb-8">
                  {plan.perks.map((perk: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon className={`h-6 w-6 mr-3 flex-shrink-0 ${isPopular ? "text-indigo-200" : "text-indigo-600 dark:text-indigo-400"}`} />
                      <span className={`${isPopular ? "text-white/90" : "text-gray-700 dark:text-gray-300"}`}>
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Call to Action */}
                <motion.button
                  onClick={() => isContactPlan ? window.location.href = '/contact' : handleSignup(plan.id)} // Direct to contact page for enterprise
                  className={`mt-auto inline-flex items-center justify-center gap-2 font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                    ${isPopular
                      ? "bg-white text-indigo-700 hover:bg-indigo-100 focus-visible:ring-white"
                      : "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 focus-visible:ring-indigo-400"
                    }
                  `}
                  whileTap={{ scale: 0.98 }}
                >
                  {isContactPlan ? (
                    <>
                      <EnvelopeIcon className="h-5 w-5" />
                      Contact Sales
                    </>
                  ) : (
                    <>
                      <CurrencyDollarIcon className="h-5 w-5" />
                      Get Started
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Optional: Trust Section / FAQ Teaser */}
        <motion.div
          className="text-center mt-24 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h3
            className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            variants={itemVariants}
          >
            Still Have Questions?
          </motion.h3>
          <motion.p
            className="text-lg text-gray-700 dark:text-gray-300 mb-6"
            variants={itemVariants}
          >
            We're here to help! Explore our comprehensive FAQ or get in touch with our team.
          </motion.p>
          <motion.div
            className="flex justify-center gap-4"
            variants={itemVariants}
          >
            <Link href="/faq" passHref>
              <motion.button
                className="inline-flex items-center gap-2 px-6 py-3 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View FAQ
              </motion.button>
            </Link>
            <Link href="/contact" passHref>
              <motion.button
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneIcon className="h-5 w-5" />
                Contact Us
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}