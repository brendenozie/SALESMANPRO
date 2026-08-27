"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FAQ, StoreForm } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";

// Framer Motion variants
const faqItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const answerVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: "easeOut" } },
};

// Sample fallback FAQs
const fallbackFAQs: FAQ[] = [
  {
    id: "sample1",
    question: "How do I create an event?",
    answer:
      "Go to your dashboard, click ‘Create Event’, fill in the details, set your ticketing options, and publish. It's that simple!",
    order: 1,
  },
  {
    id: "sample2",
    question: "Can I manage RSVPs in real time?",
    answer:
      "Yes! Our platform updates attendee lists in real time, and you can export RSVP data at any time for your records or mailing lists.",
    order: 2,
  },
];

export default function FAQSection() {

  const { storeFormData } = useStoreContext() as { storeFormData : StoreForm };
  
  const store = storeFormData;

  // Sort live FAQs by their `order` field
  const liveFAQs = (store.faqs ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Decide whether to use live or fallback
  const faqsToShow = liveFAQs.length > 0 ? liveFAQs : fallbackFAQs;

  // Track which FAQ is open
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <section className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Frequently Asked{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
            Questions
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-lg text-gray-300 mb-20 max-w-2xl mx-auto"
        >
          Everything you need to know about using our platform, from event
          creation to attendee management.
        </motion.p>

        <div className="space-y-6 text-left">
          {faqsToShow.map((faq, idx) => (
            <motion.div
              key={faq.id ?? idx}
              variants={faqItemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-300 group"
            >
              <button
                onClick={() => toggle(idx)}
                className="flex items-center justify-between w-full text-left text-xl font-semibold p-6 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {faq.question}
                <motion.span
                  animate={{ rotate: openIndex === idx ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-7 h-7 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
                </motion.span>
              </button>
              <motion.div
                initial="hidden"
                animate={openIndex === idx ? "visible" : "hidden"}
                variants={answerVariants}
                className="px-6 pb-6 text-gray-300 leading-relaxed"
              >
                {faq.answer}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
