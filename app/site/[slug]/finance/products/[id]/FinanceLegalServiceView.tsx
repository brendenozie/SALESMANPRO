"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ScaleIcon, 
  DocumentTextIcon, 
  LockClosedIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';

export default function FinanceLegalServiceView({ service, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0f172a'; // Deep Navy/Professional
  const [isAgreed, setIsAgreed] = useState(false);

  // Mock Service Data
  const inclusions = [
    'Comprehensive Risk Assessment',
    'Regulatory Compliance Audit',
    'Quarterly Strategy Reviews',
    'Direct Access to Senior Partners',
    'Secure Digital Document Vault'
  ];

  const milestones = [
    { title: 'Discovery & Intake', desc: 'Deep dive into your financial or legal standing and objectives.' },
    { title: 'Strategy Framework', desc: 'Development of a customized execution plan and risk mitigation.' },
    { title: 'Active Management', desc: 'Implementation and ongoing optimization of the agreed strategy.' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] selection:bg-slate-200 font-sans">
      
      {/* --- TOP HEADER: AUTHORITY & IDENTITY --- */}
      <section className="pt-20 lg:pt-32 px-6 lg:px-20 border-b border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-12"
          >
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <span className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-md flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4" /> Secure Advisory
                </span>
                <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ref: {service?.id || 'FIN-2026-089'}</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-slate-900 dark:text-white leading-[1.1] mb-10">
                {service?.name || "Corporate Wealth & Asset Structuring"}
              </h1>

              <p className="text-xl text-slate-500 dark:text-zinc-400 font-light leading-relaxed max-w-2xl">
                {service?.description || "Bespoke legal and financial frameworks designed for high-net-worth individuals and scaling enterprises across the East African region."}
              </p>
            </div>

            <div className="lg:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Retainer Starts From</p>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
                KSh {service?.price?.toLocaleString() || '150,000'}
                <span className="text-sm font-medium text-slate-400"> / mo</span>
              </h2>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CONTENT GRID --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-24 grid lg:grid-cols-12 gap-20">
        
        {/* LEFT COLUMN: THE FRAMEWORK */}
        <div className="lg:col-span-8">
          <section className="mb-24">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12 flex items-center gap-3">
              <PresentationChartBarIcon className="w-5 h-5" /> Strategic Scope
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inclusions.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 transition-colors hover:bg-white dark:hover:bg-zinc-900 group">
                  <CheckBadgeIcon className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span className="text-sm font-semibold dark:text-zinc-200">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-24">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12 flex items-center gap-3">
              <BriefcaseIcon className="w-5 h-5" /> Service Execution Roadmap
            </h3>
            
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center text-xs font-black dark:text-white group-hover:border-slate-900 dark:group-hover:border-white transition-colors">
                      {i + 1}
                    </div>
                    {i !== milestones.length - 1 && <div className="w-px h-full bg-slate-100 dark:bg-zinc-900 mt-4" />}
                  </div>
                  <div className="pb-8">
                    <h4 className="text-lg font-bold dark:text-white mb-2">{m.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-lg">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DOCUMENT PREVIEW AREA */}
          <section className="p-10 rounded-[3rem] bg-slate-900 text-white overflow-hidden relative group">
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                   <h4 className="text-2xl font-serif font-bold italic mb-2">Service Terms & Conditions</h4>
                   <p className="text-sm text-slate-400">Review the standard engagement protocols and legal safeguards.</p>
                </div>
                <button className="px-8 py-4 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-100 transition-all">
                  <ArrowDownTrayIcon className="w-4 h-4" /> Download Draft
                </button>
             </div>
             <DocumentTextIcon className="w-64 h-64 absolute -right-20 -bottom-20 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
          </section>
        </div>

        {/* RIGHT COLUMN: ACTION & SECURITY */}
        <aside className="lg:col-span-4 h-fit lg:sticky lg:top-32">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-10">Consultation Request</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                <span className="text-xs font-bold dark:text-zinc-400">Available Date</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">Earliest: Today</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                <span className="text-xs font-bold dark:text-zinc-400">Communication</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">Encrypted Portal</span>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-8">
              <input 
                type="checkbox" 
                id="agree" 
                className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" 
                onChange={(e) => setIsAgreed(e.target.checked)}
              />
              <label htmlFor="agree" className="text-[10px] text-slate-500 font-medium leading-relaxed">
                I understand that this request is subject to a conflict of interest check and does not establish an immediate attorney-client or advisor relationship.
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isAgreed}
              className={`w-full h-16 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all ${
                isAgreed 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <LockClosedIcon className="w-5 h-5" /> Initiate Onboarding
            </motion.button>

            <button className="w-full py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-2 transition-colors">
              <ChatBubbleLeftRightIcon className="w-4 h-4" /> Request Call Back
            </button>
          </div>

          {/* Expert Card */}
          <div className="mt-8 p-8 rounded-[3rem] bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200" alt="Consultant" className="w-full h-full object-cover" />
                </div>
                <div>
                   <h5 className="font-bold dark:text-white">C. Otieno, LLM</h5>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Managing Partner</p>
                </div>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed italic">"Our goal is to create airtight frameworks that allow you to focus on growth without the weight of regulatory uncertainty."</p>
          </div>
        </aside>
      </main>
    </div>
  );
}