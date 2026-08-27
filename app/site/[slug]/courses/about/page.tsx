"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  AcademicCapIcon, 
  SparklesIcon, 
  UserPlusIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  MapIcon,
  ArrowRightIcon,
  FunnelIcon
} from "@heroicons/react/24/solid";

const slideIn = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } }
};

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


export default function EducationAboutPage() {
  const [matchStep, setMatchStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);

  const matchQuestions = [
    { q: "What's your primary learning goal?", options: ["Exam Prep (KCSE/IGCSE)", "Skill Mastery", "Homework Help"] },
    { q: "Preferred learning environment?", options: ["1-on-1 Private", "Small Group", "Self-Paced Video"] },
    { q: "Your ideal tutor's vibe?", options: ["Strict & Results-Driven", "Creative & Engaging", "Patient & Steady"] }
  ];

  const timeline = [
    { year: "Phase 01", title: "Diagnostic", desc: "We identify cognitive gaps using AI-driven assessment tools." },
    { year: "Phase 02", title: "Mentor Pairing", desc: "Matching with a tutor who speaks your learning language." },
    { year: "Phase 03", title: "Skill Sprint", desc: "Intensive, modular learning cycles with weekly milestones." },
    { year: "Phase 04", title: "Mastery", desc: "Final certification and real-world project application." },
  ];

  const handleMatch = (opt: string) => {
    setSelections([...selections, opt]);
    if (matchStep < matchQuestions.length - 1) setMatchStep(matchStep + 1);
    else setMatchStep(99);
  };

  return (
    <main className="bg-[#fcfdfd] min-h-screen pt-32 pb-24 text-slate-900 overflow-hidden">
      
      {/* 1. CURRICULUM TIMELINE (ABOUT US) */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideIn}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <MapIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">The Student Journey</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-12">
              Architecting <br />
              <span className="text-blue-600 italic">Potential.</span>
            </h1>
            
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-12">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative pl-12 group">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:bg-blue-600 transition-colors" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">{item.year}</p>
                  <h4 className="text-2xl font-bold mb-2">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
             <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-[16px] border-white rotate-3 group hover:rotate-0 transition-transform duration-700">
                <Image 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" 
                  alt="Students in Nairobi" fill className="object-cover"
                  loader={loader}
                />
             </div>
             {/* Floating Achievement Card */}
             <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 5, repeat: Infinity }}
               className="absolute -top-10 -right-10 bg-white p-8 rounded-3xl shadow-xl border border-slate-50"
             >
                <CheckBadgeIcon className="w-10 h-10 text-emerald-500 mb-4" />
                <p className="text-xl font-bold leading-tight">98% Exam <br /> Success Rate</p>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TUTOR MATCHING INTERACTIVE TOOL */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-blue-600 rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(37,99,235,0.3)]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full mb-8">
                 <FunnelIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Smart Match AI</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-6">Find Your <br /> Perfect <span className="text-blue-200">Mentor.</span></h2>
              <p className="text-blue-100 text-lg opacity-80 max-w-md mx-auto lg:mx-0">Stop searching. Start matching. Our algorithm pairs you with educators who match your learning DNA.</p>
            </div>

            <div className="w-full lg:w-[500px] bg-white rounded-[3rem] p-10 text-slate-900 shadow-2xl">
               <AnimatePresence mode="wait">
                  {matchStep < matchQuestions.length ? (
                    <motion.div 
                      key={matchStep}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="space-y-8"
                    >
                      <div className="flex justify-between items-center mb-10">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 0{matchStep + 1}</span>
                         <div className="flex gap-1">
                            {[0, 1, 2].map(i => <div key={i} className={`w-8 h-1 rounded-full ${i <= matchStep ? 'bg-blue-600' : 'bg-slate-100'}`} />)}
                         </div>
                      </div>

                      <h3 className="text-2xl font-bold mb-8 leading-tight">{matchQuestions[matchStep].q}</h3>
                      
                      <div className="space-y-3">
                        {matchQuestions[matchStep].options.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => handleMatch(opt)}
                            className="w-full p-6 text-left rounded-2xl border-2 border-slate-50 bg-slate-50 hover:border-blue-600 hover:bg-blue-50 transition-all font-bold group flex justify-between items-center"
                          >
                            {opt}
                            <ArrowRightIcon className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10"
                    >
                       <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                          <UserPlusIcon className="w-10 h-10 text-blue-600" />
                       </div>
                       <h3 className="text-3xl font-bold mb-4">Pairing Complete!</h3>
                       <p className="text-slate-500 mb-10">We found 4 tutors in Nairobi matching your profile.</p>
                       <button onClick={() => setMatchStep(0)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all">
                          View My Faculty Match
                       </button>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}