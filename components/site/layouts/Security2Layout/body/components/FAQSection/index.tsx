'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface FAQItem {
  question: string;
  answer: string;
  order?: number;
}

interface ThemeSettings {
  primaryColor?: string;
  sectionBgColor?: string;
}

interface FAQsSectionProps {
  faqs?: FAQItem[];
  themeSettings?: ThemeSettings | undefined | null;
}

const securityFaqs: FAQItem[] = [
  {
    question: "What is your typical incident response time?",
    answer: "Our globally distributed Security Operations Center (SOC) guarantees a triage and response time of under 15 minutes for critical severity incidents, 24/7/365. We prioritize speed and containment to minimize impact.",
    order: 1,
  },
  {
    question: "How do you ensure data confidentiality and compliance?",
    answer: "We adhere to strict data handling protocols (e.g., GDPR, HIPAA, ISO 27001). All client data is encrypted both in transit and at rest, utilizing certified secure cloud environments. We provide transparency in all compliance reports.",
    order: 2,
  },
  {
    question: "What is the scope of your penetration testing services?",
    answer: "Our scope is comprehensive, including network, application (OWASP Top 10), social engineering, and cloud infrastructure penetration tests. Every test is customized to your unique attack surface and operational requirements.",
    order: 3,
  },
  {
    question: "Do you offer solutions for small to medium-sized businesses (SMBs)?",
    answer: "Yes, our SecureStart and ProProtect packages are specifically designed to provide enterprise-grade protection, continuous monitoring, and analyst support at a transparent, scalable cost structure perfect for growing SMBs.",
    order: 4,
  },
  {
    question: "How often do you update your threat intelligence?",
    answer: "Our proprietary threat intelligence platform updates in real-time (every few seconds), aggregating data from global feeds, dark web monitoring, and our internal research team to ensure proactive defense against zero-day threats.",
    order: 5,
  },
];

export default function FAQsSectionSecurityLight({ faqs, themeSettings }: FAQsSectionProps) {
  const primaryColor = themeSettings?.primaryColor || '#00A880';
  
  const faqsData: FAQItem[] =
    Array.isArray(faqs) && faqs.length > 0
      ? [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0))
      : securityFaqs;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="security-faqs" className="relative py-28 md:py-36 bg-white text-gray-900 overflow-hidden border-b border-gray-100">
      
      {/* STRUCTURAL BACKGROUND TELEMETRY MESHGRID */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-gray-900 h-full" />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* HEADER BLOCK */}
        <div className="mb-20 text-left">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
              KNOWLEDGE_BASE // PROTOCOLS
            </p>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1] mb-6">
            YOUR CONCERNS, OUR SECURITY CLARITY
          </h2>

          <p className="text-xs font-mono text-gray-500 leading-relaxed uppercase max-w-2xl">
            Immediate and authoritative technical matrices regarding our core protective operations, architecture deployments, and threat containment mitigation parameters.
          </p>
        </div>

        {/* FLAT ACCORDION TERMINAL MATRIX */}
        <div className="border-t border-gray-200">
          {faqsData.map((faq, i) => {
            const isOpen = openIndex === i;
            const itemIndex = `FAQ_SYS_${`0${i + 1}`.slice(-2)}`;

            return (
              <div
                key={i}
                className="border-b border-gray-200 transition-colors duration-150"
                style={{ backgroundColor: isOpen ? 'rgba(249, 250, 251, 0.6)' : 'transparent' }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between py-6 text-left group focus:outline-none"
                >
                  <span className="flex items-start md:items-center gap-4 md:gap-8 pr-4">
                    <span 
                      className="text-[10px] font-mono font-bold tracking-tight mt-1 md:mt-0 transition-colors"
                      style={{ color: isOpen ? primaryColor : '#9CA3AF' }}
                    >
                      [{itemIndex}]
                    </span>
                    <span className="text-sm md:text-base font-black uppercase tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
                      {faq.question}
                    </span>
                  </span>
                  
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: 'linear' }}
                    className="flex-shrink-0"
                  >
                    <ChevronDownIcon 
                      className="w-4 h-4 transition-colors" 
                      style={{ color: isOpen ? primaryColor : '#6B7280' }}
                    />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { height: 'auto', opacity: 1, pb: 24 },
                        collapsed: { height: 0, opacity: 0 }
                      }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="pb-8 pl-0 md:pl-24 pr-4">
                        <div className="border-l-2 border-gray-200 pl-4">
                          <p className="text-xs font-mono text-gray-500 uppercase leading-relaxed">
                            <span className="font-bold block mb-1 text-[10px]" style={{ color: primaryColor }}>
                              &gt;&gt; OUTPUT_RESPONSE:
                            </span>
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* FOOTER MATRIX DIAGNOSTICS */}
        <div className="mt-6 flex items-center justify-between px-1 text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider">
          <span>[MATRIX_INDEX_LOADED // {faqsData.length}_ITEMS]</span>
          <span>SEC_DATA_STREAM_OK</span>
        </div>

      </div>
    </section>
  );
}