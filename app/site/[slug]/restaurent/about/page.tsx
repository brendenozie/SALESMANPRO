"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  FireIcon, 
  SparklesIcon, 
  HandRaisedIcon,
  AcademicCapIcon,
  CloudIcon,
  SunIcon,
  ArrowRightIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/solid";

const stagger = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

export default function RestaurantAboutPage() {
  const [quizStep, setQuizStep] = useState(0);
  const [flavorProfile, setFlavorProfile] = useState<string[]>([]);

  const quizQuestions = [
    { q: "What's the current mood?", options: ["Intimate & Dim", "Loud & Social", "Fast & Focused"] },
    { q: "Choose your primary profile:", options: ["Smoky & Bold", "Fresh & Zesty", "Rich & Creamy"] },
    { q: "How adventurous are we?", options: ["The Classics", "Local Fusion", "Chef's Experiment"] }
  ];

  const handleQuiz = (opt: string) => {
    setFlavorProfile([...flavorProfile, opt]);
    if (quizStep < quizQuestions.length - 1) setQuizStep(quizStep + 1);
    else setQuizStep(99);
  };

  return (
    <main className="bg-stone-950 min-h-screen pt-32 pb-24 text-stone-100 overflow-hidden">
      
      {/* 1. CHEF'S SPECIAL (ABOUT US) */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <div className="flex items-center gap-3 mb-8">
              <FireIcon className="w-6 h-6 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500">Our Culinary DNA</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-12">
              The Art <br />
              <span className="text-transparent font-serif italic" style={{ WebkitTextStroke: '1px #f97316' }}>Of Heat.</span>
            </h1>
            
            <p className="text-xl text-stone-400 font-medium leading-relaxed max-w-lg mb-12">
              Founded in the heart of Nairobi, we don't just cook—we curate. Every dish is a dialogue between tradition and the modern palate.
            </p>

            <div className="grid grid-cols-2 gap-10">
               <div className="border-l-2 border-orange-500 pl-6">
                  <p className="text-3xl font-bold mb-1">100%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Farm-to-Fork</p>
               </div>
               <div className="border-l-2 border-orange-500 pl-6">
                  <p className="text-3xl font-bold mb-1">08</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Master Chefs</p>
               </div>
            </div>
          </motion.div>

          <div className="relative group">
             <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-stone-900 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1550966841-3ee7adac166e?auto=format&fit=crop&w=1200&q=80" 
                  alt="Chef in Action" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  loader={loader}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-60" />
             </div>
             {/* Floating Secret Ingredient Badge */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500 rounded-full flex items-center justify-center p-8 text-center shadow-2xl border-8 border-stone-950"
             >
                <span className="text-[10px] font-black uppercase tracking-widest text-white leading-tight">Secret <br /> Spices <br /> Inside</span>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FIND MY FLAVOR INTERACTIVE QUIZ */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-stone-900 rounded-[5rem] p-12 md:p-24 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5">
          
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
            <motion.div 
              className="h-full bg-orange-500 shadow-[0_0_20px_#f97316]" 
              initial={{ width: "0%" }}
              animate={{ width: `${(quizStep / quizQuestions.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full mb-8">
                 <AdjustmentsHorizontalIcon className="w-4 h-4 text-orange-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Taste Profile AI</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic">Define Your <br /> <span className="text-orange-500">Cravings.</span></h2>
              <p className="text-stone-400 text-lg leading-relaxed">Let us build your custom recommendation based on your sensory preferences.</p>
            </div>

            <div className="lg:col-span-7 bg-stone-950 p-10 md:p-16 rounded-[3.5rem] shadow-inner border border-white/5 min-h-[450px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {quizStep < quizQuestions.length ? (
                  <motion.div 
                    key={quizStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-600 mb-4 block">Question 0{quizStep + 1}</span>
                    <h3 className="text-3xl font-bold mb-10 tracking-tight">{quizQuestions[quizStep].q}</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {quizQuestions[quizStep].options.map((opt) => (
                        <button 
                          key={opt}
                          onClick={() => handleQuiz(opt)}
                          className="w-full py-6 px-8 rounded-2xl border-2 border-white/5 bg-white/5 text-left font-bold text-lg hover:border-orange-500 hover:bg-orange-500/10 transition-all flex justify-between items-center group"
                        >
                          {opt}
                          <ArrowRightIcon className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-10">
                       <SparklesIcon className="w-12 h-12 text-orange-500" />
                    </div>
                    <h3 className="text-5xl font-black italic mb-6">Menu Matched.</h3>
                    <p className="text-stone-500 mb-12">We've narrowed down the city's flavors to your perfect 3-course profile.</p>
                    
                    <button onClick={() => setQuizStep(0)} className="bg-orange-500 text-white px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-stone-950 transition-all shadow-2xl shadow-orange-900/40">
                      Show My Kitchen
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