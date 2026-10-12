"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline'; // Using ChevronDown for a modern toggle icon
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/contexts/EditableContentContext';

export default function FAQSection() {
  const { storeFormData } = useStoreContext();

  const fallbackFaqs = [
    { question: "What is included in the standard service?", answer: "Our standard service covers all fundamental maintenance tasks, sanitization, and meticulous care tailored to your space." },
    { question: "How do I schedule or reschedule an appointment?", answer: "You can book directly through our online calendar or reach out to our concierge support team anytime." },
    { question: "Are your team members certified and insured?", answer: "Yes, every professional on our team is thoroughly vetted, verified, and backed by comprehensive insurance." },
  ];

  const faqs = storeFormData?.faqs?.length ? storeFormData.faqs : fallbackFaqs;
  const themeSettings = storeFormData?.themeSettings;

  const primaryColor = themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
  const secondaryColor = themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section id="faq" className="bg-white dark:bg-gray-950 py-16 lg:py-24 px-4 relative overflow-hidden">
      {/* Background blobs for visual interest */}
      <div
        className="absolute top-0 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-0"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-2000"
        style={{ backgroundColor: secondaryColor }}
      />

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <EditableElement
          targetId="services.home.faqs.title"
          componentKey="FAQSection"
          elementKey="title"
          label="Title"
          defaultValue="Frequently Asked Questions"
        >
          {(val) => {
            const text = typeof val === "string" ? val : "Frequently Asked Questions";
            return (
              <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 dark:text-gray-100" variants={itemVariants}>
                {text.includes("Questions") ? (
                  <>
                    {text.replace("Questions", "").trim()}{" "}
                    <span className="bg-clip-text text-transparent" style={{ backgroundColor: primaryColor }}>Questions</span>
                  </>
                ) : (
                  text
                )}
              </motion.h2>
            );
          }}
        </EditableElement>

        <EditableElement
          targetId="services.home.faqs.subtitle"
          componentKey="FAQSection"
          elementKey="subtitle"
          label="Subtitle"
          defaultValue="Find quick answers to the most common questions about our services."
        >
          {(val) => (
            <motion.p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto" variants={itemVariants}>
              {val}
            </motion.p>
          )}
        </EditableElement>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden" // Added overflow-hidden for AnimatePresence
              variants={itemVariants}
            >
              <button
                className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-900 dark:text-gray-100 group"
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index ? 'true' : 'false'}
              >
                <span>{faq.question}</span>
                <motion.span
                  className="flex-shrink-0 ml-4 transition-transform duration-300"
                  initial={false} // Prevent initial animation on render
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  style={{ color: primaryColor }} // Apply primary color to the icon
                >
                  <ChevronDownIcon className="w-7 h-7" /> {/* Larger, modern chevron icon */}
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto", marginTop: "16px" }, // mt-4 for spacing
                      collapsed: { opacity: 0, height: 0, marginTop: "0px" }
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }} // Smoother custom ease
                  >
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}