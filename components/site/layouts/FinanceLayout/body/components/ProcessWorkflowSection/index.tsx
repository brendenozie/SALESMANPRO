"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, ArrowLongRightIcon } from "@heroicons/react/24/solid";

// === Animation Variants ===
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

// === Palette ===
const theme = {
  bg: "#F8FAFC",
  primary: "#004085", // Deep Navy
  accent: "#2563EB", // Bright Blue
  textMain: "#1E293B",
  textMuted: "#64748B",
};

// === Data ===
const steps = [
  {
    id: 1,
    title: "Consultation",
    description: "We begin with a deep-dive discovery session to understand your unique goals and challenges.",
  },
  {
    id: 2,
    title: "Strategy",
    description: "Our team crafts a data-driven roadmap aligned perfectly with your financial objectives.",
  },
  {
    id: 3,
    title: "Execution",
    description: "We implement the plan with precision, transparency, and regular progress updates.",
  },
  {
    id: 4,
    title: "Support",
    description: "Continuous monitoring and optimization ensure your long-term success and peace of mind.",
  },
];

// === Single Card Component ===
const ProcessCard = ({ step, index, total }: { step: any; index: number; total: number }) => {
  const isLast = index === total - 1;

  return (
    <div className="relative flex flex-col items-center group">
      
      {/* CONNECTOR LINE (Desktop Only) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -z-10 transform translate-x-0" />
      )}

      <motion.div
        variants={itemVariants}
        className="relative flex flex-col items-center text-center w-full max-w-xs"
      >
        {/* --- ICON STAGE --- */}
        <div className="relative mb-6">
            {/* Pulsing Ring */}
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
            
            <div className="relative w-24 h-24 rounded-full bg-white border-4 border-blue-50 shadow-xl flex items-center justify-center z-10 group-hover:border-blue-200 transition-colors duration-300">
                <span className="text-3xl font-black text-blue-600/20 absolute">0{step.id}</span>
                <CheckCircleIcon className="w-8 h-8 text-blue-600 z-10 transform group-hover:scale-110 transition-transform duration-300" />
            </div>
        </div>

        {/* --- CARD BODY --- */}
        <div className="relative bg-white/60 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full">
            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-700 transition-colors">
                {step.title}
            </h3>
            
            <p className="text-sm text-slate-500 leading-relaxed">
                {step.description}
            </p>

            {/* Mobile Direction Arrow (Hidden on Desktop) */}
            {!isLast && (
                <div className="lg:hidden mt-6 flex justify-center text-blue-300">
                    <ArrowLongRightIcon className="h-6 w-6 rotate-90" />
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default function ProcessWorkflowSection() {
  return (
    <section
      id="our-process"
      className="py-24 sm:py-32 relative overflow-hidden font-sans"
      style={{ background: theme.bg }}
    >
      {/* --- Background Elements --- */}
      <div className="absolute inset-0 opacity-40" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[100px] mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm bg-blue-50 px-4 py-1 rounded-full mb-4 inline-block">
            How We Work
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900">
            A Simple, Streamlined <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Path to Success
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We’ve refined our process into four clear steps to ensure your journey with us is seamless, transparent, and effective.
          </p>
        </motion.div>

        {/* --- Workflow Grid --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4"
        >
          {steps.map((step, idx) => (
            <ProcessCard 
                key={step.id} 
                step={step} 
                index={idx} 
                total={steps.length} 
            />
          ))}
        </motion.div>

        {/* --- Bottom CTA --- */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 text-center"
        >
            <button className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 duration-300">
                Start Your Consultation
            </button>
        </motion.div>
      </div>
    </section>
  );
}