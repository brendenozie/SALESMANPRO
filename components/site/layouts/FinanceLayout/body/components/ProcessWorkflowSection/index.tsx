"use client";

import React from "react";
import { motion } from "framer-motion";

// --- SYSTEM LIGHTWEIGHT VECTOR ICONS ---
const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.6-5.84a14.954 14.954 0 015.84-2.581m0 0a14.954 14.954 0 012.581 5.84m-2.581-5.84m0 0a14.927 14.927 0 01-5.841 2.58m5.841-2.58zm-5.84 10.12a6 6 0 00-5.84-7.381v4.8m5.84 2.581a14.954 14.954 0 006.16 2.581m-6.16-2.581a14.928 14.928 0 01-5.841-2.58M12 12h.008v.008H12V12z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
  </svg>
);

const CompassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

// --- ANIMATION KINETICS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.12, delayChildren: 0.1 } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  },
};

const steps = [
  {
    id: "01",
    title: "Discovery & Blueprinting",
    description: "We orchestrate deep discovery frameworks to evaluate operational parameters, legal liabilities, and asset vulnerabilities.",
    icon: CompassIcon,
  },
  {
    id: "02",
    title: "Strategic Modeling",
    description: "Our engineering analysts model multi-scenario pathways built securely to hit specific asset performance outcomes.",
    icon: AnalyticsIcon,
  },
  {
    id: "03",
    title: "Precision Deployment",
    description: "We deploy the strategy systematically with continuous structural compliance transparency and active performance oversight.",
    icon: TargetIcon,
  },
  {
    id: "04",
    title: "Continuous Governance",
    description: "Real-time auditing ensures continuous alignment, asset optimization, and structural protection for your corporate peace of mind.",
    icon: ShieldIcon,
  },
];

export default function ProcessWorkflowSection() {
  return (
    <section id="our-process" className="py-24 lg:py-36 bg-slate-50 relative overflow-hidden selection:bg-blue-600/10">
      
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
          
          {/* --- LEFT SIDEBAR: STATIC HEADLINE TRACKER --- */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200/60 text-xs font-semibold tracking-wide text-blue-700 uppercase mb-5">
              Execution Architecture
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
              A Meticulous <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                Path to Certainty.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-md mb-10">
              We eliminate ambiguity through a rigorous execution standard designed to safeguard architecture and secure capital operations seamlessly.
            </p>
            
            <button className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20">
              Initiate Discovery Intake
            </button>
          </div>

          {/* --- RIGHT TRACK: INTERACTIVE PROCESS FLOW --- */}
          <div className="lg:col-span-7">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
              className="flex flex-col gap-6 w-full"
            >
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={step.id}
                    variants={itemVariants}
                    className="group relative bg-white border border-slate-200/70 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-slate-300/80 transition-all duration-300 flex flex-col sm:flex-row gap-6 sm:items-start items-center text-center sm:text-left"
                  >
                    {/* Top Accent Visual Highlight Anchor */}
                    <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Numeric Tracking Circle Badge */}
                    <div className="relative h-14 w-14 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 border border-slate-200/60 group-hover:border-blue-200/60 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                      <IconComponent />
                    </div>

                    {/* Meta Content Field */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                          {step.title}
                        </h3>
                        <span className="text-xs font-mono font-bold tracking-widest text-slate-300 group-hover:text-blue-200 transition-colors">
                          STAGE // {step.id}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}