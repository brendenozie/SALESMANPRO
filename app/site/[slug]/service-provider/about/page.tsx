"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  LockClosedIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowRightCircleIcon
} from "@heroicons/react/24/solid";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


export default function ServiceTrustPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const quizSteps = [
    { q: "What is the nature of your request?", options: ["Home Maintenance", "Business/Legal", "Personal Wellness"] },
    { q: "How urgent is the service?", options: ["Emergency (Within 2hrs)", "Standard (24-48hrs)", "Planned Project"] },
    { q: "What is your primary goal?", options: ["Lowest Price", "Highest Expertise", "Quickest Turnaround"] }
  ];

  const handleChoice = (choice: string) => {
    setAnswers([...answers, choice]);
    if (step < quizSteps.length - 1) setStep(step + 1);
    else setStep(99); // Results state
  };

  return (
    <main className="bg-slate-50 min-h-screen pt-32 pb-24 text-slate-900 overflow-hidden">
      
      {/* 1. TRUST & SAFETY (ABOUT US) */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600">The Gold Standard</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-[0.85] mb-10">
              Reliability <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic font-serif font-light">By Design.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
              Every professional on our platform undergoes a rigorous 5-step vetting process, including criminal background checks and on-site skill assessments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <TrustMetric icon={<LockClosedIcon/>} title="Secure Payments" desc="Funds are only released once you sign off on the work." />
               <TrustMetric icon={<CheckBadgeIcon/>} title="Verified IDs" desc="100% of pros are verified with government-issued IDs." />
            </div>
          </motion.div>

          <div className="relative">
             <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl border-[12px] border-white">
                <Image 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80" 
                  alt="Vetted Professional" fill className="object-cover"
                  loader={loader}
                />
             </div>
             {/* Floating Trust Badge */}
             <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                   <ShieldCheckIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Security Rating</p>
                   <p className="text-2xl font-bold">AAA+ <span className="text-sm font-medium text-emerald-500">Verified</span></p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. PRO-MATCHING INTERACTIVE QUIZ */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-2 bg-slate-100 w-full">
            <motion.div 
              className="h-full bg-indigo-600" 
              initial={{ width: "0%" }}
              animate={{ width: `${(step / quizSteps.length) * 100}%` }}
            />
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <AnimatePresence mode="wait">
              {step < quizSteps.length ? (
                <motion.div 
                  key={step}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 block">Question {step + 1} of {quizSteps.length}</span>
                  <h2 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">{quizSteps[step].q}</h2>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {quizSteps[step].options.map((opt) => (
                      <button 
                        key={opt}
                        onClick={() => handleChoice(opt)}
                        className="w-full py-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-lg"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10"
                >
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8">
                     <SparklesIcon className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h2 className="text-5xl font-bold mb-6 italic font-serif">We found your match.</h2>
                  <p className="text-slate-500 mb-12">Based on your needs, we have shortlisted 3 professionals in Nairobi ready to start.</p>
                  
                  <button onClick={() => setStep(0)} className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-full mx-auto font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all group">
                    See My Experts <ArrowRightCircleIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustMetric({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm group hover:border-indigo-100 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}