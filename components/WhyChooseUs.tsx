"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowsRightLeftIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// --- Feature Data ---
const features = [
  {
    icon: <SparklesIcon className="h-10 w-10 text-indigo-500" />,
    title: "Effortless Setup",
    description: "Get your store up and running in minutes, not days. Our intuitive tools guide you every step of the way.",
  },
  {
    icon: <ShieldCheckIcon className="h-10 w-10 text-indigo-500" />,
    title: "Secure & Reliable",
    description: "Your business and customer data are protected by top-tier security protocols and constant monitoring.",
  },
  {
    icon: <ChatBubbleBottomCenterTextIcon className="h-10 w-10 text-indigo-500" />,
    title: "24/7 Support",
    description: "Our dedicated team is always on standby to help you with any questions or issues, day or night.",
  },
  {
    icon: <ArrowsRightLeftIcon className="h-10 w-10 text-indigo-500" />,
    title: "Seamless Integration",
    description: "Connect with your favorite marketing, analytics, and shipping tools effortlessly.",
  },
  {
    icon: <CloudArrowUpIcon className="h-10 w-10 text-indigo-500" />,
    title: "Scalable Infrastructure",
    description: "Our platform grows with your business, handling everything from a few sales to millions of transactions.",
  },
  {
    icon: <Cog6ToothIcon className="h-10 w-10 text-indigo-500" />,
    title: "Fully Customizable",
    description: "Tailor every aspect of your storefront to match your brand's unique identity and vision.",
  },
];

// --- Main Component ---
export default function WhyChooseUs() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <motion.p
            className="text-base font-bold uppercase text-indigo-600 tracking-widest"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Our Commitment to You
          </motion.p>
          <motion.h2
            className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Why Choose Our Platform?
          </motion.h2>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            We provide everything you need to launch, manage, and grow your online business with ease and confidence.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}