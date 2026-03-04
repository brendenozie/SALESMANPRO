'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, PlusIcon, MinusIcon, LifebuoyIcon } from '@heroicons/react/24/outline';

const FAQItem = ({ faq, primaryColor, activeId, setActiveId }: any) => {
  const isOpen = activeId === faq.id;

  return (
    <motion.div
      layout
      className={`relative mb-4 transition-all duration-500 rounded-[2rem] overflow-hidden ${
        isOpen 
          ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]' 
          : 'bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100'
      }`}
    >
      <button
        onClick={() => setActiveId(isOpen ? null : faq.id)}
        className="w-full p-8 text-left flex items-center justify-between group"
      >
        <span className={`text-lg font-bold transition-colors duration-300 ${
          isOpen ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
        }`}>
          {faq.question}
        </span>
        
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
          isOpen ? 'bg-slate-900 rotate-180' : 'bg-white shadow-sm'
        }`}>
          {isOpen ? (
            <MinusIcon className="w-5 h-5 text-white" />
          ) : (
            <PlusIcon className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-8 pb-8">
              <div className="w-full h-px bg-slate-100 mb-6" />
              <p className="text-slate-600 leading-relaxed text-base max-w-2xl">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function MoriahFAQ({ storeFormData }: any) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';

  const faqs = storeFormData?.faqs?.length > 0 ? storeFormData.faqs : [
    { id: "1", question: "How do I enroll in a course?", answer: "Enrolling is simple! Browse our courses, select your desired program, and click 'Enroll Now'. You'll be guided through a quick registration and payment process." },
    { id: "2", question: "Are there any prerequisites?", answer: "Most introductory courses have no prerequisites. Advanced tracks may require specific certifications, clearly noted in descriptions." },
    { id: "3", question: "What payment methods are accepted?", answer: "We accept all major credit cards, PayPal, and regional bank transfers." },
    { id: "4", question: "Do you offer career placement?", answer: "While we don't guarantee jobs, our programs include career coaching, resume audits, and direct intros to our hiring partners." }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Context & Help Branding */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full mb-6">
                <LifebuoyIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Support Hub</span>
              </div>
              <h2 className="text-5xl font-light text-slate-900 tracking-tight leading-tight mb-8">
                Got questions? <br />
                <span className="font-semibold italic text-blue-600">We have answers.</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed max-w-sm mb-10">
                Can't find what you're looking for? Our dedicated support team is available 24/7 to help you navigate your journey.
              </p>
              
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative group">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                
                <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Still curious?</p>
                <p className="text-xl font-medium mb-6">Talk to a real human.</p>
                <button className="flex items-center gap-3 text-sm font-bold group">
                  <span className="border-b border-white/30 group-hover:border-white transition-all pb-1">Contact Support</span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                    <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: The Accordion Explorer */}
          <div className="lg:col-span-7">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
              {faqs.map((faq: any) => (
                <FAQItem 
                  key={faq.id} 
                  faq={faq} 
                  primaryColor={primaryColor} 
                  activeId={activeId}
                  setActiveId={setActiveId}
                />
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}