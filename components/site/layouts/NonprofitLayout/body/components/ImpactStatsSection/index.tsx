'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  CurrencyDollarIcon, 
  GlobeAltIcon, 
  HeartIcon, 
  UsersIcon,
  ArrowUpRightIcon 
} from '@heroicons/react/24/outline';

// --- MOCK DATA & CONFIGURATION ---
const sectionTitle = "Our Community Impact";
const organizationName = "Global Change Collective"; 

const mockMetrics = [
  { id: 'fb-metric-1', value: "1,500+", label: "Lives Impacted", order: 1, Icon: UsersIcon },
  { id: 'fb-metric-2', value: "80+", label: "Projects Completed", order: 2, Icon: HeartIcon },
  { id: 'fb-metric-3', value: "$500K+", label: "Funds Raised", order: 3, Icon: CurrencyDollarIcon },
  { id: 'fb-metric-4', value: "20+", label: "Communities Served", order: 4, Icon: GlobeAltIcon },
];

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } 
  },
};

// --- STAT CARD COMPONENT ---
const StatCard = ({ stat }: { stat: typeof mockMetrics[0] }) => {
  const IconComponent = stat.Icon;
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between items-start text-left group transition-colors hover:border-slate-300"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mb-6 transition-colors group-hover:bg-slate-100">
        <IconComponent className="w-5 h-5" strokeWidth={2} />
      </div>
      <div>
        <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight block處理 block leading-none">
          {stat.value}
        </span>
        <span className="text-xs font-semibold text-slate-500 block mt-2 whitespace-nowrap">
          {stat.label}
        </span>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION COMPONENT ---
export default function CommunityImpactSection({storeFormData}: {storeFormData: any}) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const metricsToRender = [...mockMetrics].sort((a, b) => a.order - b.order);

  const handleReportRedirect = () => {
    console.log("Redirecting to full impact report dashboard...");
  };

  return (
    <section id="impact" className="py-24 md:py-32 bg-white border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asynchronous Layout Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-16 md:mb-20">
          
          {/* Left Frame Header Text */}
          <div className="lg:col-span-7 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-3">
              Our Proven Track Record
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              {sectionTitle}.
            </h2>
          </div>

          {/* Right Frame Descriptive Subtext */}
          <div className="lg:col-span-5">
            <p className="text-sm text-slate-600 leading-relaxed">
              These metrics reflect the tangible, lasting change we've driven together, fueled by the dedication of our supporters and the ongoing grassroots field programming of **{organizationName}**.
            </p>
          </div>

        </div>

        {/* Integrated Grid Metrics Wrapper */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-12"
        >
          {metricsToRender.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </motion.div>

        {/* Action Anchor Row for Continuity */}
        <div className="flex justify-center md:justify-start">
          <button
            onClick={handleReportRedirect}
            className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-slate-900 group transition-colors hover:text-slate-700"
          >
            <span>Read Our Full Impact Report</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </section>
  );
}