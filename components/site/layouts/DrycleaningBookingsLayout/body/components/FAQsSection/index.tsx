"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const defaultFaqs = [
  {
    question: 'How do I schedule a collection?',
    answer: 'Our seamless digital concierge allows you to book a pickup in seconds. Simply select your preferred window, and our uniformed couriers will handle the transition of your garments.',
  },
  {
    question: 'What is the "Atelier" cleaning process?',
    answer: 'We treat every garment as a masterpiece. Our process combines eco-friendly, biodegradable solvents with hand-finishing techniques that preserve fiber integrity and color vibrancy.',
  },
  {
    question: 'Can I track my garments in real-time?',
    answer: 'Transparency is our standard. You will receive live updates from the moment of collection, through the expert cleaning phase, to the final inspection and delivery.',
  },
  {
    question: 'What is your turnaround commitment?',
    answer: 'Our standard ritual is completed within 24 to 48 hours. For those in need of immediate restoration, our Express Tier offers same-day service for orders placed before 10 AM.',
  },
];

const FAQItem = ({ faq, isOpen, onClick }: any) => (
  <motion.div 
    layout
    className={`group border-b border-slate-100 dark:border-white/5 transition-all duration-500 ${isOpen ? 'bg-teal-50/30 dark:bg-teal-500/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
  >
    <div 
      onClick={onClick}
      className="flex justify-between items-center py-12 px-8 md:px-12 cursor-pointer"
    >
      <div className="flex items-center gap-10">
        <span className={`text-[10px] font-black tracking-[0.3em] transition-colors duration-500 ${isOpen ? 'text-teal-600' : 'text-slate-300'}`}>
          {faq.index < 9 ? `0${faq.index + 1}` : faq.index + 1}
        </span>
        <h3 className={`text-xl md:text-3xl font-bold tracking-tighter transition-all duration-500 ${isOpen ? 'text-slate-900 dark:text-white translate-x-2' : 'text-slate-500 dark:text-slate-400'}`}>
          {faq.question}
        </h3>
      </div>

      <div className="relative w-14 h-14 flex items-center justify-center">
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${isOpen ? 'border-teal-600 bg-teal-600 shadow-lg shadow-teal-600/20' : 'border-slate-200 dark:border-slate-800'}`}
        />
        {isOpen ? (
          <MinusIcon className="w-5 h-5 text-white relative z-10 stroke-[3]" />
        ) : (
          <PlusIcon className="w-5 h-5 text-slate-400 relative z-10 stroke-[3]" />
        )}
      </div>
    </div>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="pl-28 md:pl-36 pr-12 pb-14">
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-3xl">
              {faq.answer}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default function FAQsSection({ faqs = defaultFaqs }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 lg:py-48 bg-white dark:bg-[#080a0c] overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-24">
          
          {/* Header Side */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="sticky top-32"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-10 bg-teal-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">Common Queries</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[0.85] tracking-tighter mb-10">
                CLARITY ON <br />
                <span className="font-serif italic font-light text-slate-300 dark:text-slate-700">The Ritual.</span>
              </h2>
              
              <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-12">
                Luxury is as much about peace of mind as it is about the finish. Explore how we redefine care.
              </p>

              <div className="p-10 rounded-[3rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 backdrop-blur-xl">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-600/20">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unanswered?</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Our concierge is standing by for a bespoke consultation.</p>
                <button className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 transition-all">
                  Connect with us 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* FAQ Accordion Side */}
          <div className="lg:col-span-8">
            <div className="border-t border-slate-100 dark:border-white/5">
              {faqs.map((faq: any, index: number) => (
                <FAQItem 
                  key={index}
                  faq={{ ...faq, index }}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}