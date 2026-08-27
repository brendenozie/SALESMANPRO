"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from "@/contexts/StoreContext";
import { FAQ } from '@/types/typings';

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const faqItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const answerVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 24,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

const dummyFaqs: FAQ[] = [
  {
    id: 'faq1',
    question: "SYSTEM ONBOARDING PROTOCOL",
    answer: "Accessing our performance architecture is streamlined. Select your tier, initiate your profile, and synchronize your biometrics via the command center. Deployment takes less than 120 seconds.",
  },
  {
    id: 'faq2',
    question: "MODALITIES & WORKOUT ARCHITECTURE",
    answer: "We deploy a multi-disciplinary approach: HIIT, Metabolic Conditioning, Strength Cycles, and Neural Recovery. Every program is mathematically balanced for maximal adaptive response.",
  },
  {
    id: 'faq3',
    question: "ELITE TIER PERSONAL COACHING",
    answer: "Direct uplink to certified performance architects is available for Tier-3 members. This includes biometric auditing, custom protocol design, and weekly strategic reviews.",
  },
  {
    id: 'faq4',
    question: "MOBILE INTERFACE & TRACKING",
    answer: "Our native OS is available on both iOS and Android. It functions as a portable command center for real-time data visualization and community tactical updates.",
  },
];

export default function FaqsSection({ faqs = dummyFaqs }: { faqs?: FAQ[] }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <motion.section
      className="relative py-24 sm:py-32 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden border-t border-neutral-200/60 dark:border-neutral-900/40"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      {/* Tactical Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.15] dark:opacity-30 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Layout Stack */}
        <div className="text-center mb-16 sm:mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/50 rounded-full mb-6 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span className="font-black tracking-[0.35em] uppercase text-[10px]" style={{ color: primaryColor }}>
              Knowledge Base
            </span>
          </motion.div>
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase leading-[0.85] mb-4">
            Support <br /> <span className="text-neutral-200 dark:text-neutral-900 transition-colors">Protocols</span>
          </h2>
        </div>

        {/* Accordion List Shell */}
        <div className="divide-y divide-neutral-200/80 dark:divide-neutral-900 bg-white dark:bg-neutral-900/20 border border-neutral-200/80 dark:border-neutral-900/60 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm transition-colors">
          {faqs.map((faq, i) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                className="bg-transparent group cursor-pointer"
                variants={faqItemVariants}
                onClick={() => setOpenId(isOpen ? null : faq.id!)}
              >
                {/* Structural Label Container Row */}
                <div className="flex justify-between items-center p-6 sm:p-8 hover:bg-neutral-100/40 dark:hover:bg-neutral-900/40 transition-colors duration-300">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span 
                      className="font-black italic text-xs sm:text-sm tracking-tighter transition-all duration-300"
                      style={{ 
                        color: isOpen ? primaryColor : undefined,
                        opacity: isOpen ? 1 : 0.3
                      }}
                    >
                      0{i + 1}
                    </span>
                    <h3 
                      className="text-base sm:text-lg font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white transition-colors duration-300 group-hover:text-neutral-950 dark:group-hover:text-neutral-200"
                      style={isOpen ? { color: primaryColor } : {}}
                    >
                      {faq.question}
                    </h3>
                  </div>
                  
                  <motion.div
                    animate={{ 
                      rotate: isOpen ? 180 : 0, 
                    }}
                    style={{ color: isOpen ? primaryColor : 'currentColor' }}
                    className="text-neutral-400 dark:text-neutral-600 shrink-0 ml-2"
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                  </motion.div>
                </div>

                {/* Collapsible Content Wrapper */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      variants={answerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-8 sm:px-14 sm:pb-8">
                        <div className="h-[1px] w-8 mb-4 opacity-60" style={{ backgroundColor: primaryColor }} />
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm font-medium leading-relaxed uppercase tracking-wider max-w-2xl">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Technical Live Support Footer */}
        <motion.div
          className="mt-16 sm:mt-24 p-[1px] rounded-2xl bg-gradient-to-r from-transparent via-neutral-200/60 dark:via-neutral-800 to-transparent"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-white dark:bg-neutral-950 py-10 px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-900/50">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
              <div 
                className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl"
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter">Human Intelligence</h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-[0.15em] mt-0.5">Live operator support available 24/7</p>
              </div>
            </div>
            
            <a
              href="/contact"
              className="group flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.15em] text-[11px] px-8 py-4.5 rounded-xl transition-all duration-300 shadow-md hover:opacity-90 w-full md:w-auto"
              style={{ backgroundColor: primaryColor }}
            >
              Open Comms 
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
        
      </div>
    </motion.section>
  );
}