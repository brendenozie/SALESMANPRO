"use client";

import React from "react";
import { motion } from "framer-motion";
import { Expert } from "@/types/typings";

// --- SYSTEM LIGHTWEIGHT VECTOR ICONS ---
const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// --- DESIGN SYSTEM THEME GENERATOR ---
const getDynamicBrandColors = (name: string) => {
  const variations = [
    { from: "from-blue-600", to: "to-indigo-600", text: "text-blue-600", bg: "bg-blue-50/70" },
    { from: "from-indigo-600", to: "to-violet-600", text: "text-indigo-600", bg: "bg-indigo-50/70" },
    { from: "from-blue-600", to: "to-sky-600", text: "text-sky-700", bg: "bg-sky-50/70" },
    { from: "from-emerald-600", to: "to-teal-600", text: "text-emerald-700", bg: "bg-emerald-50/70" },
  ];
  const index = name.length % variations.length;
  return variations[index];
};

// --- ANIMATION CONFIGURATION ---
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

const sampleExperts = [
  {
    id: 'exp1',
    name: 'Dr. Evelyn Reed',
    role: 'Chief Legal Officer',
    initials: 'ER',
    bio: '25+ years navigating complex corporate law, venture structuring, and regulatory architectural protections.',
    linkedin: '#',
    email: 'evelyn@example.com'
  },
  {
    id: 'exp2',
    name: 'Benjamin Carter',
    role: 'Lead Financial Strategist',
    initials: 'BC',
    bio: 'Ex-institutional private wealth manager specializing in corporate M&A design and cross-border deployment models.',
    linkedin: '#',
    email: 'benjamin@example.com'
  },
  {
    id: 'exp3',
    name: 'Olivia Hayes',
    role: 'Senior Tax Advisor',
    initials: 'OH',
    bio: 'Architecting complex multinational asset shielding frameworks with deep operational policy alignment.',
    linkedin: '#',
    email: 'olivia@example.com'
  },
  {
    id: 'exp4',
    name: 'Alex Thorne',
    role: 'Real Estate Counsel',
    initials: 'AT',
    bio: 'Advising institutional portfolios on massive capital real estate transactions, protection, and alternative vehicles.',
    linkedin: '#',
    email: 'alex@example.com'
  },
] as unknown as Expert[];

interface MeetOurExpertsProps {
  experts?: any[] | undefined;
}

export default function MeetOurExperts({ experts }: MeetOurExpertsProps) {
  const expertsToDisplay = experts && experts.length > 0 ? experts : sampleExperts;

  return (
    <section id="our-experts" className="py-24 lg:py-36 bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-600/10">
      
      {/* Dynamic Structural Grid Mesh & Blurs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- HEADLINE SECTION --- */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200/60 text-xs font-semibold tracking-wide text-blue-700 uppercase mb-4">
            Leadership Elite
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5 leading-tight">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">Visionary Directors.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A cohesive matrix of strategic professionals providing top-tier guidance and absolute execution metrics.
          </p>
        </div>

        {/* --- DYNAMIC ADVISOR GRID --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {expertsToDisplay.map((expert: any) => {
            const config = getDynamicBrandColors(expert.name);

            return (
              <motion.div
                key={expert.id}
                variants={cardVariants}
                className="group relative bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/80 transition-all duration-500 ease-out flex flex-col overflow-hidden"
              >
                {/* Visual Canvas Banner Block */}
                <div className={`h-28 w-full bg-gradient-to-tr ${config.from} ${config.to} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-slate-950/10 group-hover:opacity-0 transition-opacity duration-500" />
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-700" />
                </div>

                {/* Floating Initials Avatar Frame */}
                <div className="px-6 relative -mt-12 mb-5 flex justify-start">
                   <div className="w-20 h-20 rounded-2xl p-1 bg-white shadow-md ring-4 ring-slate-50 group-hover:scale-105 transition-transform duration-500">
                      <div className={`w-full h-full rounded-xl bg-gradient-to-tr ${config.from} ${config.to} flex items-center justify-center text-xl font-black text-white shadow-inner tracking-wider`}>
                        {expert.initials}
                      </div>
                   </div>
                </div>

                {/* Core Meta Details Canvas */}
                <div className="px-6 pb-6 flex-grow flex flex-col items-start text-left">
                  <h3 className="text-lg font-bold text-slate-900 mb-0.5 group-hover:text-blue-600 transition-colors duration-200">
                    {expert.name}
                  </h3>
                  
                  <span className={`text-xs font-bold tracking-wide uppercase ${config.text} mb-4`}>
                    {expert.role}
                  </span>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-4 font-normal">
                    {expert.bio}
                  </p>

                  {/* Operational Connect Channels */}
                  <div className="mt-auto flex items-center gap-2 w-full pt-4 border-t border-slate-100">
                     {expert.linkedin && (
                        <a 
                          href={expert.linkedin} 
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/50 text-slate-500 hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white transition-all duration-300"
                          aria-label={`${expert.name} LinkedIn Profile`}
                        >
                          <LinkedInIcon className="h-4 w-4" />
                        </a>
                     )}
                     {expert.email && (
                        <a 
                          href={`mailto:${expert.email}`} 
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/50 text-slate-500 hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all duration-300 flex-grow flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
                          aria-label={`Secure Email Intake for ${expert.name}`}
                        >
                          <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-[10px] tracking-widest text-slate-600 group-hover:text-slate-100 transition-colors">Contact Expert</span>
                        </a>
                     )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}