"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// --- SYSTEM LIGHTWEIGHT VECTOR ICONS ---
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096a.405.405 0 00-.236-.236L2.85 14.85l5.096-.813a.405.405 0 00.236-.236L9 8.71l.813 5.096c.02.11.107.197.218.218l5.096.813-5.096.813a.405.405 0 00-.236.236zm0 0V3m0 0L6 6m3-3l3 3" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// --- ANIMATION KINETICS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

interface ConsultationPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  frequency: string;
  features: string[];
  featured?: boolean;
  buttonText: string;
}

const samplePackages: ConsultationPlan[] = [
  {
    id: "starter",
    title: "Discovery Analysis",
    description: "Perfect for specific regulatory questions or a preliminary fiscal assessment review.",
    price: "$299",
    frequency: "single diagnostic session",
    features: [
      "60-minute absolute deep-dive review",
      "Actionable deployment roadmap blueprint",
      "Structural alignment document audit",
      "Full encrypted recording & transcript summary",
    ],
    buttonText: "Book Diagnostic Session",
  },
  {
    id: "growth",
    title: "Strategic Advisory",
    description: "Continuous enterprise partnership optimized for active growth and scaling support.",
    price: "$999",
    frequency: "recurrent monthly retainer",
    features: [
      "Priority advisory channel communication",
      "Dedicated senior structural strategist",
      "Custom alternative financial modeling",
      "Bi-weekly alignment performance calls",
      "Direct encrypted Slack / desktop communication",
      "Quarterly architecture health audits",
    ],
    featured: true,
    buttonText: "Deploy Partnership Protocol",
  },
  {
    id: "enterprise",
    title: "Institutional Scale",
    description: "Full-spectrum governance structural integration for macro operations.",
    price: "Custom",
    frequency: "tailored allocation scale",
    features: [
      "Unrestricted organizational tier access",
      "On-site deployment workshop operations",
      "End-to-end risk & liability mitigation auditing",
      "White-label corporate framework structures",
      "24/7 dedicated crisis mitigation advisory",
    ],
    buttonText: "Initiate Intake Consult",
  },
];

interface ConsultationPackagesProps {
  packages?: ConsultationPlan[];
}

export default function ConsultationPackagesSection({ packages }: ConsultationPackagesProps) {
  const list = packages && packages.length > 0 ? packages : samplePackages;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="pricing" className="py-24 lg:py-36 bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-600/10">
      
      {/* Decorative Grid Mesh & Ambient Blur Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 left-1/4 w-[40rem] h-[40rem] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[40rem] h-[40rem] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col items-center text-center mb-24">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200/60 text-xs font-semibold tracking-wide text-blue-700 uppercase mb-4">
            Allocation Models
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5 leading-tight">
            Transparent Pricing. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">Predictable Scale.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Select a specialized strategic plan tailored to your operational milestones. Secure precision support with zero hidden processing layers.
          </p>
        </div>

        {/* --- PACKAGES FLEXGRID MATRIX --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
        >
          {list.map((plan) => {
            const isFeatured = plan.featured;
            
            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                onMouseEnter={() => setHoveredId(plan.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl transition-all duration-500 bg-white ${
                  isFeatured 
                    ? "border-2 border-blue-600 shadow-xl lg:scale-[1.04] z-10" 
                    : "border border-slate-200/80 shadow-sm z-0 hover:border-slate-300"
                }`}
              >
                {/* Micro High-End Promotion Tag */}
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Recommended Architecture
                  </div>
                )}

                {/* Card Context Heading */}
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {plan.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-normal mb-8 min-h-[48px]">
                    {plan.description}
                  </p>

                  {/* Pricing Matrix Layout */}
                  <div className="pb-8 mb-8 border-b border-slate-100 flex items-baseline gap-1.5">
                    <span className="text-5xl font-black tracking-tight text-slate-900">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">/ {plan.frequency}</span>
                    )}
                  </div>

                  {/* Feature Checklist Framework */}
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-normal">
                        <div className={`mt-0.5 p-0.5 rounded-md flex-shrink-0 ${isFeatured ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"}`}>
                          <CheckIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Action Submission Controller */}
                <button
                  className={`w-full py-4 px-6 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
                    isFeatured
                      ? "bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRightIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${hoveredId === plan.id ? "translate-x-1" : ""}`} />
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* --- SUPPLEMENTARY COMPLIANCE NOTE --- */}
        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400 tracking-wide font-normal">
            All transactional frameworks operate under strict corporate NDA guidelines. Require custom architecture?{" "}
            <a href="#" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors ml-0.5">
              Initiate Corporate Inquiries.
            </a>
          </p>
        </div>
        
      </div>
    </section>
  );
}