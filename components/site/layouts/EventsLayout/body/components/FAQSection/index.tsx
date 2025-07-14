"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline'; // Importing specific icons
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function FAQSection({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12">
          Everything you need to know about using our platform.
        </p>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-200 dark:border-gray-800 pb-4"
            >
              <button
                onClick={() => toggle(index)}
                className="flex items-center justify-between w-full text-left text-lg font-medium text-gray-800 dark:text-white focus:outline-none"
              >
                {faq.question}
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="mt-3 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
