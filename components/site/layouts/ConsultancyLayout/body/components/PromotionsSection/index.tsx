"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PlusIcon,
  MinusIcon, // Using MinusIcon for the 'X' to look more like a collapse
  QuestionMarkCircleIcon, // New icon for FAQ section
  EnvelopeIcon, // For contact us
} from "@heroicons/react/24/outline";
import Link from "next/link"; // For the CTA link

import Image from "next/image";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger for clarity
      delayChildren: 0.1, // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120, // Slightly more stiff
      damping: 12, // More damping
    },
  },
};

// --- Dummy Data for FAQs (Replace with your actual data) ---
const dummyFaqs = [
  {
    question: "What exactly is your platform and who is it for?",
    answer: "Our platform is a comprehensive SaaS solution designed to streamline [mention your core function, e.g., project management, customer relations, data analytics] for businesses of all sizes, from startups to large enterprises. It helps teams collaborate, automate workflows, and gain valuable insights.",
  },
  {
    question: "How difficult is it to set up and integrate with existing tools?",
    answer: "We've designed our platform for ease of use. Most users can get started within minutes. We offer robust integration options with popular tools through our API and pre-built connectors. Our support team is also available to assist with complex setups.",
  },
  {
    question: "What kind of support can I expect?",
    answer: "We offer multi-channel support including comprehensive documentation, email support, and live chat. Priority support and dedicated account management are available with our higher-tier plans. Our goal is to ensure your success.",
  },
  {
    question: "Is my data secure with your platform?",
    answer: "Absolutely. Data security is our top priority. We employ industry-leading encryption, regular security audits, and adhere to strict data protection regulations (e.g., GDPR, SOC 2 Type II compliant). Your data is always safe with us.",
  },
  {
    question: "Can I try the platform before committing to a plan?",
    answer: "Yes, we offer a [mention duration, e.g., 14-day free trial] that gives you full access to most features, allowing you to explore the platform's capabilities and see how it fits your needs without any commitment. No credit card required to start!",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, including Visa, MasterCard, American Express, and Discover. For annual subscriptions or enterprise plans, we also offer invoicing and bank transfers.",
  },
];

//──────────────────────────────────────────────────────────────────────────────
// EnhancedFAQsSection
//──────────────────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  bannerUrl: string;
}

export default function  PromotionsSection({ bannerUrl }:HeroSectionProps) {
  const [isBuy, setIsBuy] = useState(true);

  return     (
            <section className="py-16 bg-white dark:bg-gray-800">
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">
                  Current Promotions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
    {
      id: "v1",
      name: "2025 Mustang GT",
      price: 4500000,
      imageUrl: "/cars/mustang.jpg",
      slug: "mustang-gt",
    },
    {
      id: "v2",
      name: "2025 Camaro ZL1",
      price: 5000000,
      imageUrl: "/cars/camaro.jpg",
      slug: "camaro-zl1",
    },
    {
      id: "v3",
      name: "2025 Tesla Model S",
      price: 7000000,
      imageUrl: "/cars/tesla.jpg",
      slug: "tesla-model-s",
    },
  ].map((promo, i) => (
                    <motion.div
                      key={i}
                      whileHover={{
                        y: -8,
                        boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                      }}
                      className="bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden cursor-pointer transition"
                    >
                      <div className="relative h-52">
                        {/* <Image
                          src={promo.bannerUrl}
                          alt={promo.title}
                          fill
                          loader={loader}
                          className="object-cover"
                        /> */}
                      </div>
                      <div className="p-6">
                        {/* <h3 className="text-xl font-semibold mb-2">
                          {promo.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {promo.description}
                        </p> */}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )
        };
    
