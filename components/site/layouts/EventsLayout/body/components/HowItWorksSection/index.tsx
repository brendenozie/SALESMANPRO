"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { StoreForm } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";

// Define the shape we expect (or fallback to)  
type StepItem = {
  icon: "MagnifyingGlass" | "PencilSquare" | "Sparkles";
  title: string;
  description: string;
};

// Map string keys to Heroicons  
const iconMap: Record<StepItem["icon"], React.ReactNode> = {
  MagnifyingGlass: <MagnifyingGlassIcon className="w-8 h-8 text-purple-400" />,
  PencilSquare: <PencilSquareIcon className="w-8 h-8 text-pink-400" />,
  Sparkles: <SparklesIcon className="w-8 h-8 text-indigo-400" />,
};

// Your original static defaults  
const fallbackSteps: StepItem[] = [
  {
    icon: "MagnifyingGlass",
    title: "Find Your Next Event",
    description:
      "Use our powerful search and curated lists to discover trending, upcoming, and local events tailored to your interests.",
  },
  {
    icon: "PencilSquare",
    title: "Book or Create",
    description:
      "Easily book your spot in a few clicks or bring your own vision to life by creating an event with our intuitive organizer dashboard.",
  },
  {
    icon: "Sparkles",
    title: "Enjoy the Experience",
    description:
      "Attend, network, and celebrate. Our platform ensures every step of the event journey is seamless, secure, and unforgettable.",
  },
];

// Framer Motion variants  
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function HowItWorksSection() {

  const { storeFormData } = useStoreContext() as { storeFormData : StoreForm };
  
  const store = storeFormData;
  
  // Attempt to read dynamic steps from store.themeSettings
  let steps: StepItem[] = [];
  const raw = (store.themeSettings?.howItWorksSteps as any[]) ?? [];
  if (raw.length > 0 &&
    Array.isArray(raw) &&
    raw.every(
      (s) =>
        typeof s.icon === "string" &&
        typeof s.title === "string" &&
        typeof s.description === "string" &&
        iconMap[s.icon as StepItem["icon"]] !== undefined
    )
  ) {
    steps = raw as StepItem[];
  } else {
    steps = fallbackSteps;
  }

  return (
    <section className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-2xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-2xl opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            Getting Started is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Simple
            </span>
          </h2>
          <p className="text-lg text-gray-300 mb-20 max-w-2xl mx-auto">
            {store.themeSettings?.howItWorksIntro ||
              "Whether you're here to discover or to create, our process is designed to be effortless. Follow three easy steps to unlock a world of events."}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16"
        >
          {/* Dashed line on desktop */}
          <div className="hidden md:block absolute top-1/3 left-0 w-full h-px">
            <svg width="100%" height="100%">
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="0"
                strokeWidth="2"
                strokeDasharray="8 8"
                className="stroke-gray-700"
              />
            </svg>
          </div>

          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-gray-900 border-2 border-gray-700">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-800">
                  {iconMap[step.icon]}
                </div>
              </div>

              {/* Mobile connector */}
              {idx < steps.length - 1 && (
                <div className="md:hidden absolute top-24 left-1/2 -translate-x-1/2 h-16 w-px bg-gray-700" />
              )}

              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
