"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline'; // Importing specific icons
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the image loader since Next.js Image is not available
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
  },
];

export default function PricingSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          Flexible Plans for Every Organizer
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-14 max-w-2xl mx-auto">
          Whether you're just starting out or managing major festivals, our
          pricing is built to scale with you.
        </p>

        <div className="grid gap-10 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`rounded-2xl p-8 shadow-lg border ${
                plan.highlighted
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-white dark:bg-gray-900 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
              <p className="text-3xl font-semibold mb-4">{plan.price}</p>
              <p className="text-sm mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`inline-block w-full py-2 px-4 rounded-md text-center font-medium transition ${
                  plan.highlighted
                    ? "bg-white text-indigo-600 hover:bg-gray-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {plan.title === "Enterprise" ? "Contact Us" : "Get Started"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}