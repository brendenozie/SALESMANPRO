"use client";

import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

export default function FAQSection() {
  const { storeFormData } = useStoreContext();
          
  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

const {
slug,
bannerUrl,
name,
description,
storeCategories,      // array of { id, name, icon, items, sortOrder, visible }
marketplaceListings,     // assume you added this field to Prisma/StoreForm
testimonials,
faqs,
stats,
themeSettings,
} = storeFormData;
    
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs.length) return null;

  return (
    <section className="bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600 mb-12">
          Everything you need to know about our services
        </p>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <button
                className="flex justify-between items-center w-full text-left text-lg font-medium"
                onClick={() => toggle(index)}
              >
                {faq.question}
                <span className="text-primary text-2xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="mt-4 text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
