'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const defaultFaqs = [
  {
    question: 'How do I initiate a ritual?',
    answer: 'Our bespoke digital interface allows you to curate your experience. Select your desired practitioner and time, and our system will handle the logistics of your transformation.',
  },
  {
    question: 'How are practitioners vetted?',
    answer: 'We employ a rigorous 7-tier verification process. Only the top 2% of professionals who demonstrate technical mastery and emotional intelligence are invited to join our collective.',
  },
  {
    question: 'What is the cancellation protocol?',
    answer: 'Time is our most valuable asset. Rituals can be rescheduled through your private dashboard up to 24 hours prior to the appointment without incurring a preservation fee.',
  },
];

const FAQItem = ({ faq, isOpen, onClick, primaryColor }: any) => (
  <motion.div 
    layout
    className={`group relative border-b border-white/5 transition-all duration-700 ${isOpen ? 'bg-zinc-900/40' : 'hover:bg-zinc-900/20'}`}
  >
    <div 
      onClick={onClick}
      className="flex justify-between items-center py-10 px-8 cursor-pointer"
    >
      <div className="flex items-center gap-8">
        <span className={`text-[10px] font-bold tracking-widest transition-colors duration-500 ${isOpen ? 'text-[#C5A267]' : 'text-zinc-700'}`}>
          0{faq.index + 1}
        </span>
        <h3 className={`text-xl md:text-2xl font-light tracking-tight transition-all duration-500 ${isOpen ? 'text-white translate-x-4' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
          {faq.question}
        </h3>
      </div>

      <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`absolute inset-0 border rounded-full transition-colors duration-500 ${isOpen ? 'border-[#C5A267] bg-[#C5A267]' : 'border-zinc-800'}`}
        />
        {isOpen ? (
          <MinusIcon className="w-5 h-5 text-black relative z-10" />
        ) : (
          <PlusIcon className="w-5 h-5 text-zinc-500 relative z-10" />
        )}
      </div>
    </div>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="px-24 pb-12">
            <p className="text-lg text-zinc-500 leading-relaxed font-light max-w-2xl">
              {faq.answer}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default function FAQsSection({ faqs = defaultFaqs, themeSettings }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open for visual impact
  const primaryColor = themeSettings?.primaryColor || '#C5A267';

  return (
    <section id="faq" className="relative py-24 lg:py-48 bg-[#050505] overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-20">
          
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="sticky top-32"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#C5A267] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C5A267]">Information Suite</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter mb-10">
                OFTEN <br />
                <span className="font-serif italic font-light text-zinc-700 text-5xl md:text-6xl">Enquired.</span>
              </h2>
              
              <p className="text-lg text-zinc-500 font-light leading-relaxed mb-12">
                Clarity is the ultimate luxury. Explore the intricacies of our collective operations.
              </p>

              <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
                <SparklesIcon className="w-6 h-6 text-[#C5A267] mb-4" />
                <p className="text-sm font-bold text-white mb-2">Still curious?</p>
                <p className="text-xs text-zinc-500 mb-6">Our concierge is available for private consultation.</p>
                <button className="text-[10px] font-black uppercase tracking-widest text-[#C5A267] hover:tracking-[0.2em] transition-all">
                  Contact Support →
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            <div className="border-t border-white/5">
              {faqs.map((faq: any, index: number) => (
                <FAQItem 
                  key={index}
                  faq={{ ...faq, index }}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}