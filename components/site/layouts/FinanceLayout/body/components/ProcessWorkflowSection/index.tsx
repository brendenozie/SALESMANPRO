"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

// === Animation Variants ===
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// === Light Mode Palette ===
const lightBackground = "#F8FAFC"; // off-white
const accentColor = "#2563EB"; // blue-600
const textPrimary = "#1E293B"; // slate-800
const textSecondary = "#475569"; // slate-600

// === Example Step Data ===
const steps = [
  {
    id: 1,
    title: "1. Consultation",
    description:
      "We begin by understanding your goals, challenges, and aspirations through a personalized consultation.",
  },
  {
    id: 2,
    title: "2. Strategy & Planning",
    description:
      "Our team crafts a data-driven, customized plan that aligns with your financial and legal objectives.",
  },
  {
    id: 3,
    title: "3. Implementation",
    description:
      "With precision and transparency, we put your tailored strategy into action while keeping you informed.",
  },
  {
    id: 4,
    title: "4. Ongoing Support",
    description:
      "We continuously monitor, optimize, and guide you to ensure lasting success and peace of mind.",
  },
];

// === Single Step Component ===
function ProcessStep({ step }: { step: (typeof steps)[0] }) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative flex flex-col items-center text-center px-6"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 shadow-md mb-6">
        <CheckCircleIcon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-semibold mb-3" style={{ color: textPrimary }}>
        {step.title}
      </h3>
      <p className="text-base leading-relaxed max-w-xs" style={{ color: textSecondary }}>
        {step.description}
      </p>
    </motion.div>
  );
}

export default function ProcessWorkflowSection() {
  // Subtle light grid background
  const customBackground = `
    radial-gradient(circle, rgba(37,99,235,0.08) 1px, transparent 1px) 0 0 / 24px 24px,
    linear-gradient(to bottom, ${lightBackground}, #FFFFFF)
  `;

  return (
    <section
      id="our-process"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden font-inter"
      style={{ background: customBackground }}
    >
      {/* Center Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(45deg, ${accentColor}, #60A5FA, #93C5FD)`,
            }}
          >
            Our Streamlined Process
          </h2>
          <p
            className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: textSecondary }}
          >
            We guide you through every step with{" "}
            <strong>clarity, expertise</strong>, and unwavering dedication.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative grid gap-y-16 lg:gap-y-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:justify-items-center"
        >
          {steps.map((step) => (
            <ProcessStep key={step.id} step={step} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
