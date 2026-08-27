'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline'; // Minimal structural fine line icon

interface FAQItem {
  question: string;
  answer: string;
  order?: number;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  answerTextColor?: string;
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
    <section
      id="security-faqs"
      className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16 lg:gap-24 relative z-10">
        
        {/* CONTROL STICKY SIDEBAR AREA */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24 text-left">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
              Technical Documentation
            </p>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
            System Specifications & Protocols
          </h2>
          
          <p className="mt-6 text-xs text-gray-500 leading-relaxed max-w-sm">
            Review detailed operational guidelines, compliance parameters, SLA response frameworks, and deployment mechanics.
          </p>
        </div>

        {/* TELEMETRY ACCORDION MATRIX */}
        <div className="w-full lg:w-2/3 divide-y divide-gray-100 border-t border-b border-gray-100">
          {faqsData.map((faq, i) => {
            const isOpen = openIndex === i;
            
            return (
              <div
                key={i}
                className="group py-6 transition-colors duration-200"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-start justify-between text-left focus:outline-none gap-6"
                >
                  <span className="flex items-start gap-4 text-base md:text-lg font-bold tracking-tight text-gray-900 group-hover:text-black">
                    {/* ENHANCED DATA INDEX BADGE */}
                    <span 
                      className="text-[10px] font-mono font-bold tracking-wider mt-1.5 transition-colors duration-200"
                      style={{ color: isOpen ? primaryColor : '#9CA3AF' }}
                    >
                      [{i + 1 < 10 ? `0${i + 1}` : i + 1}]
                    </span>
                    {faq.question}
                  </span>

                  {/* MINIMAL ROTATION INDICATOR CROSS */}
                  <motion.div
                    className="mt-1.5 flex-shrink-0"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <PlusIcon 
                      className="w-4 h-4 text-gray-400 group-hover:text-gray-900 stroke-[2.5]" 
                      style={{ color: isOpen ? primaryColor : undefined }}
                    />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 pr-6 text-xs text-gray-500 leading-relaxed max-w-3xl">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}