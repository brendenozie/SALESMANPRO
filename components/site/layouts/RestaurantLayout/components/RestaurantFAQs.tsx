"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusSmallIcon, MinusSmallIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid"; // Using solid icons for clarity
import Link from "next/link"; // For the "Contact Us" button

import { useStoreContext } from "../../../../../contexts/StoreContext"; // Adjust path as needed

// Define the FAQ type
type FAQ = {
  id: string;
  question: string;
  answer: string;
};

// Sample FAQs Data (replace with data fetched from your backend or storeFormData)
const sampleFaqs: FAQ[] = [
  {
    id: "faq1",
    question: "Do you offer vegetarian and vegan options?",
    answer: "Yes, we have a diverse menu that includes a wide range of delicious vegetarian and vegan dishes. Look for the green leaf icon on our menu for plant-based options!",
  },
  {
    id: "faq2",
    question: "Can I make a reservation online?",
    answer: "Absolutely! You can easily make a reservation through our 'Reserve' page on the website. We recommend booking in advance, especially for weekends.",
  },
  {
    id: "faq3",
    question: "Do you provide catering services for events?",
    answer: "Yes, we offer full-service catering for various events, from corporate lunches to private parties. Please visit our 'Catering' section or contact us directly for more details.",
  },
  {
    id: "faq4",
    question: "What are your opening hours?",
    answer: "We are open from 11:00 AM to 10:00 PM, Monday through Saturday. On Sundays, we operate from 12:00 PM to 9:00 PM. Please check our 'Contact' page for any holiday hour changes.",
  },
  {
    id: "faq5",
    question: "Do you have gluten-free options?",
    answer: "We strive to accommodate all dietary needs. Many of our dishes can be prepared gluten-free. Please inform your server about your dietary restrictions, and they will guide you through the menu.",
  },
];

// Animation variants for staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function RestaurantFAQs() {
  const { storeFormData } = useStoreContext();
  const { slug, themeSettings } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange

  // State to manage which FAQ is open
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // Use dynamic FAQs from storeFormData if available, otherwise use sample
  const faqsToDisplay = storeFormData.faqs && storeFormData.faqs.length > 0
    ? storeFormData.faqs.map((faq: any) => ({ id: faq.question.replace(/\s/g, ''), question: faq.question, answer: faq.answer })) // Map to local FAQ type
    : sampleFaqs;

  return (
    <section className="py-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.p className="text-sm uppercase tracking-widest font-semibold text-orange-600 dark:text-orange-400 mb-2" variants={itemVariants}>
            Got Questions?
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-md"
            variants={itemVariants}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Find quick answers to the most common questions about our restaurant, menu, and services.
          </motion.p>
        </motion.div>

        {/* FAQs Accordion */}
        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {faqsToDisplay.map((faq) => (
            <motion.div
              key={faq.id}
              variants={itemVariants}
              className={`bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 overflow-hidden
                ${openFAQ === faq.id ? 'border-l-4 border-orange-500' : 'border-l-4 border-transparent'}`}
            >
              <button
                className="flex justify-between items-center w-full p-6 text-left focus:outline-none group"
                onClick={() => toggleFAQ(faq.id)}
                aria-expanded={openFAQ === faq.id}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <span className="text-xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {faq.question}
                </span>
                <motion.span
                  initial={false}
                  animate={{ rotate: openFAQ === faq.id ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 flex-shrink-0 text-orange-500"
                >
                  {openFAQ === faq.id ? (
                    <MinusSmallIcon className="h-7 w-7" />
                  ) : (
                    <PlusSmallIcon className="h-7 w-7" />
                  )}
                </motion.span>
              </button>
              <AnimatePresence>
                {openFAQ === faq.id && (
                  <motion.div
                    id={`faq-answer-${faq.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="px-6 pb-6 pt-0 text-gray-700 dark:text-gray-300 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action for Unanswered Questions */}
        <motion.div
          className="text-center mt-16 p-8 bg-orange-50 dark:bg-gray-800 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <QuestionMarkCircleIcon className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Still Have Questions?
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            If you couldn&apos;t find the answer you were looking for, feel free to reach out to our friendly team. We&apos;re here to help!
          </p>
          <Link
            href={`/${slug}/contact`} // Link to your contact page
            className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg shadow-xl hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
