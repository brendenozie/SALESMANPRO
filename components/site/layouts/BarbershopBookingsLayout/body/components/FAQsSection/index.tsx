'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const defaultFaqs = [
  {
    question: 'How do I book a session?',
    answer: 'Our intuitive booking system allows you to easily browse available services and professionals, select your preferred time, and confirm your appointment in just a few clicks.',
  },
  {
    question: 'Are the professionals on your platform certified?',
    answer: 'Absolutely. We rigorously vet all professionals on our platform to ensure they are fully licensed, highly experienced, and adhere to the highest industry standards.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'You can easily manage your bookings directly from your user dashboard. Please refer to our policy page for specific timeframes to avoid any charges.',
  },
];

// Helper Component defined outside to prevent re-render errors
const FAQItem = ({ faq, isOpen, onClick, primaryColor, isAnyOpen }: any) => (
  <motion.div 
    onClick={onClick}
    layout
    className={`cursor-pointer overflow-hidden rounded-[2rem] transition-all duration-500 ${
      isOpen 
        ? 'bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-200' 
        : isAnyOpen 
          ? 'bg-slate-50/40 opacity-50 scale-[0.98]' 
          : 'bg-slate-50 hover:bg-white hover:shadow-xl'
    }`}
  >
    <div className="p-8 md:p-10">
      <div className="flex justify-between items-center gap-6">
        <h3 className={`text-xl font-bold transition-colors duration-300 ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>
          {faq.question}
        </h3>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
          style={{ 
            backgroundColor: isOpen ? primaryColor : 'transparent',
            border: isOpen ? 'none' : '2px solid #e2e8f0'
          }}
        >
          {isOpen ? (
            <MinusIcon className="w-5 h-5 text-white" />
          ) : (
            <PlusIcon className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="pt-6 border-t border-slate-100 mt-6">
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

export default function FAQsSection({ faqs = defaultFaqs, name, themeSettings }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const primaryColor = themeSettings?.primaryColor || '#059669';
  const storeName = name || 'our platform';

  return (
    <section id="faq" className="relative py-24 lg:py-40 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="sticky top-24">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100" style={{ backgroundColor: `${primaryColor}10` }}>
                <QuestionMarkCircleIcon className="w-7 h-7" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                Common <br />
                <span className="italic font-serif font-light text-slate-400">Curiosities.</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-sm">
                Everything you need to know about navigating {storeName}.
              </p>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {faqs.map((faq: any, index: number) => (
              <FAQItem 
                key={index}
                faq={faq}
                isOpen={openIndex === index}
                isAnyOpen={openIndex !== null}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                primaryColor={primaryColor}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}