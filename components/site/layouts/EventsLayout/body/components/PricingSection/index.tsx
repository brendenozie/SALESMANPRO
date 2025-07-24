"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { PricingTier, StoreForm } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";

// Framer Motion variants for pricing cards
const priceCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

// Fallback plans if store.pricingTiers is empty or malformed
const fallbackPlans: (Omit<PricingTier, "features"> & { features: string[]; highlighted?: boolean; buttonText: string; })[] = [
  {
    name: "Starter",
    price: "Free",
    duration: undefined,
    description: "Perfect for new organizers testing the platform.",
    features: ["Host up to 1 event/month", "100 RSVPs", "Basic analytics", "Email support"],
    highlighted: false,
    buttonText: "Get Started Free",
  },
  {
    name: "Pro",
    price: "$29/mo",
    duration: undefined,
    description: "For active organizers hosting multiple events.",
    features: ["Unlimited events", "Up to 5,000 RSVPs/month", "Advanced analytics", "Priority support", "Custom branding"],
    highlighted: true,
    buttonText: "Go Pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    duration: undefined,
    description: "Tailored solutions for agencies or enterprises.",
    features: ["Unlimited everything", "Dedicated account manager", "API access", "White-label solution"],
    highlighted: false,
    buttonText: "Contact Us",
  },
];

export default function PricingSection() {


  const { storeFormData } = useStoreContext() as { storeFormData : StoreForm };
  
  const store = storeFormData;
  
  // Attempt to read dynamic tiers from the store
  const raw = Array.isArray(store.pricingTiers)
    ? (store.pricingTiers as PricingTier[])
    : [];

  // Map Prisma PricingTier to our UI shape, and allow a `highlighted` flag in themeSettings
  const dynamicPlans = raw.map((tier, idx) => ({
    name: tier.name,
    price: tier.price.toString() + (tier.duration ? `/${tier.duration}` : ""),
    duration: tier.duration,
    description: tier.description ?? "",
    features: tier.features,
    highlighted:
      !!(store.themeSettings?.highlightedPricingTier === tier.name) ||
      // Alternatively highlight the middle tier by default:
      idx === Math.floor(raw.length / 2),
    buttonText: store.themeSettings?.pricingButtonText?.[tier.name] ||
      tier.name === "Free"
      ? "Get Started Free"
      : tier.name === "Pro"
      ? "Go Pro"
      : "Contact Us",
  }));

  // Choose dynamic if valid, else fallback
  const plansToShow =
    dynamicPlans.length === raw.length && raw.length > 0
      ? dynamicPlans
      : fallbackPlans;

  return (
    <section className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          {store.themeSettings?.pricingHeadline ||
            "Flexible Plans for "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
            Every Organizer
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-lg text-gray-300 mb-20 max-w-2xl mx-auto"
        >
          {store.themeSettings?.pricingSubheadline ||
            "Whether you're just starting out or managing major festivals, our pricing is built to scale with you."}
        </motion.p>

        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {plansToShow.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={priceCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl p-8 shadow-xl flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.02] ${
                plan.highlighted
                  ? "bg-gradient-to-br from-indigo-700 to-purple-800 text-white border-2 border-indigo-500 shadow-indigo-500/20"
                  : "bg-gray-800 text-gray-200 border border-gray-700 hover:border-indigo-600"
              }`}
            >
              <div>
                <h3
                  className={`text-3xl font-bold mb-4 ${
                    plan.highlighted ? "text-white" : "text-white"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-5xl font-extrabold mb-4 ${
                    plan.highlighted ? "text-white" : "text-indigo-400"
                  }`}
                >
                  {plan.price}
                </p>
                {plan.description && (
                  <p
                    className={`text-md mb-8 ${
                      plan.highlighted ? "text-indigo-200" : "text-gray-400"
                    }`}
                  >
                    {plan.description}
                  </p>
                )}
                <ul className="space-y-4 mb-10 text-left">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-lg"
                    >
                      <CheckCircleIcon
                        className={`w-6 h-6 ${
                          plan.highlighted
                            ? "text-green-300"
                            : "text-indigo-400"
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={store.themeSettings?.pricingButtonLink?.[plan.name] || "#"}
                className={`inline-flex items-center justify-center w-full py-4 px-6 rounded-xl text-center text-lg font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  plan.highlighted
                    ? "bg-white text-indigo-700 hover:bg-gray-200 focus:ring-white focus:ring-offset-indigo-800"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-gray-900"
                }`}
              >
                {plan.buttonText}
                <ArrowRightIcon className="ml-3 w-5 h-5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
