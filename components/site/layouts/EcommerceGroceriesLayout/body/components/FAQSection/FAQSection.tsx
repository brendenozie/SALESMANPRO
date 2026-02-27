'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  PlusIcon, 
  MinusIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const faqs = [
  {
    question: "What makes your products different?",
    answer: "We source only the highest grade materials and partner with ethical manufacturers to ensure every piece meets our 10-point quality standard before it ever reaches your door."
  },
  {
    question: "How long does shipping usually take?",
    answer: "Standard shipping takes 3-5 business days. We also offer 'Flash Delivery' for select regions which guarantees arrival within 24-48 hours."
  },
  {
    question: "Do you offer a warranty on electronics?",
    answer: "Yes, all our electronic goods come with a comprehensive 2-year hardware warranty and a 30-day 'no-questions-asked' return policy."
  }
];

export default function FAQSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="bg-white">
      {/* --- FAQ SECTION --- */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-gray-50 text-gray-400">
              <QuestionMarkCircleIcon className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Commonly Asked</h2>
          <p className="text-gray-500 font-medium">Everything you need to know about our process and products.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              className={`border rounded-[2rem] transition-all duration-300 ${
                activeIndex === idx ? 'border-gray-900 bg-gray-50/50' : 'border-gray-100 bg-white'
              }`}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-8 text-left"
              >
                <span className={`text-lg font-bold transition-colors ${activeIndex === idx ? 'text-gray-900' : 'text-gray-500'}`}>
                  {faq.question}
                </span>
                <div className={`p-2 rounded-full transition-transform duration-300 ${activeIndex === idx ? 'bg-gray-900 text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                  {activeIndex === idx ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                </div>
              </button>
              
              <AnimatePresence>
                {activeIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 text-gray-600 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="px-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-7xl mx-auto relative rounded-[3.5rem] bg-gray-900 overflow-hidden py-24 px-8 md:px-16"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
            style={{ backgroundColor: primary }}
          />

          <div className="relative z-10 flex flex-col items-center text-center space-y-10">
            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <SparklesIcon className="w-5 h-5 text-amber-400" />
              <span className="text-white text-xs font-black uppercase tracking-[0.3em]">Join the community</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              Ready to elevate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-white to-gray-400 italic font-light">
                your lifestyle?
              </span>
            </h2>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Experience the perfect blend of style, quality, and innovation. 
              Start your journey today and get 15% off your first order.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 rounded-[2rem] text-lg font-black transition-all shadow-2xl hover:shadow-primary/20"
                style={{ backgroundColor: primary, color: '#fff' }}
              >
                Shop All Products
              </motion.button>
              
              <button className="flex items-center gap-2 text-white font-bold text-lg group">
                Learn our Story
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}