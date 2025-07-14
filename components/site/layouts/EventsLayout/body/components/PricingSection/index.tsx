"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Using CheckCircleIcon and ArrowRightIcon

// Mocking the image loader since Next.js Image is not available (kept for context)
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const plans = [
  {
    title: "Starter",
    price: "Free",
    description: "Perfect for new organizers testing the platform.",
    features: [
      "Host up to 1 event/month",
      "100 RSVPs",
      "Basic analytics",
      "Email support",
    ],
    highlighted: false,
    buttonText: "Get Started Free",
  },
  {
    title: "Pro",
    price: "$29/mo",
    description: "For active organizers hosting multiple events.",
    features: [
      "Unlimited events",
      "Up to 5,000 RSVPs/month",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    highlighted: true,
    buttonText: "Go Pro",
  },
  {
    title: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for agencies or enterprises.",
    features: [
      "Unlimited everything",
      "Dedicated account manager",
      "API access",
      "White-label solution",
    ],
    highlighted: false,
    buttonText: "Contact Us",
  },
];

// Framer Motion variants for pricing cards
const priceCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function PricingSection() {
  return (
    <section className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative Background Elements - consistent with other sections */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Flexible Plans for <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Every Organizer</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-lg text-gray-300 mb-20 max-w-2xl mx-auto"
        >
          Whether you're just starting out or managing major festivals, our pricing is built to scale with you.
        </motion.p>

        <div className="grid gap-8 md:grid-cols-3 items-stretch"> {/* Use items-stretch to make cards same height */}
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={priceCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl p-8 shadow-xl flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.02] ${
                plan.highlighted
                  ? "bg-gradient-to-br from-indigo-700 to-purple-800 text-white border-2 border-indigo-500 shadow-indigo-500/20" // Highlighted style
                  : "bg-gray-800 text-gray-200 border border-gray-700 hover:border-indigo-600" // Default style
              }`}
            >
              <div>
                <h3 className={`text-3xl font-bold mb-4 ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                  {plan.title}
                </h3>
                <p className={`text-5xl font-extrabold mb-4 ${plan.highlighted ? 'text-white' : 'text-indigo-400'}`}>
                  {plan.price}
                </p>
                <p className={`text-md mb-8 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-4 mb-10 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-lg">
                      <CheckCircleIcon className={`w-6 h-6 ${plan.highlighted ? 'text-green-300' : 'text-indigo-400'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#"
                className={`inline-flex items-center justify-center w-full py-4 px-6 rounded-xl text-center text-lg font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  plan.highlighted
                    ? "bg-white text-indigo-700 hover:bg-gray-200 focus:ring-white focus:ring-offset-indigo-800" // Highlighted button
                    : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-gray-900" // Default button
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