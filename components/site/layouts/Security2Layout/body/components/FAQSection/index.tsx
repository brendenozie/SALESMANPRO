'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDownIcon, 
    ShieldCheckIcon, // New icon for Question (Security focused)
    LockClosedIcon,   // New icon for Answer (Security focused)
    ClockIcon,        // For response time questions
} from '@heroicons/react/24/solid'; // Using solid icons for punch
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; // Outline icon for general use
import { useStoreContext } from '@/contexts/StoreContext';

// Type definitions for clarity
interface FAQItem {
  question: string;
  answer: string;
  order?: number; // Optional order for sorting
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

// --- SECURITY-FOCUSED STATIC FALLBACK FAQs ---
const securityFaqs: FAQItem[] = [
  {
    question: "What is your typical incident response time?",
    answer: "Our globally distributed Security Operations Center (SOC) guarantees a triage and response time of **under 15 minutes** for critical severity incidents, 24/7/365. We prioritize speed and containment to minimize impact.",
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
    answer: "Our proprietary threat intelligence platform updates in **real-time** (every few seconds), aggregating data from global feeds, dark web monitoring, and our internal research team to ensure proactive defense against zero-day threats.",
    order: 5,
  },
];


export default function FAQsSectionSecurityLight({ faqs, themeSettings }: FAQsSectionProps) {

  // Robust theme color fallbacks (using security firm defaults)
  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Teal (Safety/Primary)
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6'; // Blue (Trust/Accent)
  const sectionBgColor = themeSettings?.sectionBgColor || '#FFFFFF'; // Pure white/light mode background
  const textColor = themeSettings?.textColor || '#1F2937'; // Dark text
  const answerTextColor = themeSettings?.answerTextColor || '#4B5563'; // Slightly lighter text
  const borderColor = '#E5E7EB'; // Tailwind: gray-200 for borders
  const accentLight = `${primaryColor}10`; // Primary color with 10% opacity for light accents

  // Determine FAQ data, prioritizing dynamic data
  const faqsData: FAQItem[] =
    Array.isArray(faqs) && faqs.length > 0
      ? [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0))
      : securityFaqs;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };
  
  // Icon mapping for visual variety based on question type
  const getQuestionIcon = (index: number) => {
      switch(index % 3) {
          case 0: return ShieldCheckIcon;
          case 1: return LockClosedIcon;
          case 2: return QuestionMarkCircleIcon;
          default: return ShieldCheckIcon;
      }
  }


  return (
    <section
      id="security-faqs"
      className="relative py-24 md:py-32 px-6 lg:px-12 overflow-hidden"
      style={{ backgroundColor: sectionBgColor }}
    >
      {/* Background radial gradient shapes for subtle tech feel */}
      <div
        className="absolute top-0 right-0 w-1/3 h-1/3 opacity-5"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${primaryColor}, transparent 50%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-1/3 h-1/3 opacity-5"
        style={{
          background: `radial-gradient(circle at 0% 100%, ${secondaryColor}, transparent 50%)`,
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-sm"
            style={{ color: textColor }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Your Concerns, Our <span style={{ color: primaryColor }}>Security Clarity</span>
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
            style={{ color: answerTextColor }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Immediate and authoritative answers to the most critical questions about our services and operational standards.
          </motion.p>
        </div>

        <div className="space-y-6 text-left">
          {faqsData.map((faq, i) => {
            const isOpen = openIndex === i;
            const QuestionIcon = getQuestionIcon(i);
            
            return (
              <motion.div
                key={i}
                className="rounded-xl shadow-xl border transition-all duration-300 overflow-hidden" // Slightly smaller border radius
                style={{
                  backgroundColor: isOpen ? accentLight : '#ffffff',
                  borderColor: isOpen ? primaryColor : borderColor,
                  // Toned down shadow for light mode focus
                  boxShadow: isOpen ? `0 10px 20px ${primaryColor}15` : '0 4px 6px rgba(0,0,0,0.05)',
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.5 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-5 md:px-8 md:py-6 text-left text-lg md:text-xl font-semibold focus:outline-none"
                  style={{ color: textColor }}
                >
                  <span className="flex items-center gap-4">
                    <QuestionIcon 
                        className={`w-7 h-7 transition-colors duration-300 ${isOpen ? 'text-white p-1 rounded-full' : ''}`} 
                        style={{ 
                            color: isOpen ? 'white' : primaryColor,
                            backgroundColor: isOpen ? primaryColor : 'transparent', // Icon filled with primary color when open
                            // Subtle shadow on the icon when open
                            boxShadow: isOpen ? `0 0 10px ${primaryColor}40` : 'none',
                        }} 
                    />
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDownIcon className="w-6 h-6 text-gray-500" />
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
                        open: { height: 'auto', opacity: 1, paddingTop: '0px', paddingBottom: '24px' },
                        collapsed: { height: 0, opacity: 0, paddingTop: '0px', paddingBottom: '0px' },
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className="px-6 md:px-8 text-base leading-relaxed border-t pt-6"
                        style={{ 
                            color: answerTextColor,
                            borderColor: borderColor // Use subtle border color for separation
                        }}
                      >
                        <span className="font-bold mr-2 inline-block" style={{ color: secondaryColor }}>
                            <ClockIcon className="w-5 h-5 inline-block mr-1 align-sub" style={{ color: secondaryColor }} />
                            Answer:
                        </span>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}