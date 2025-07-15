// app/admin/[adminSlug]/faqs/page.tsx
"use client";

import { motion } from 'framer-motion';
import { QuestionMarkCircleIcon, PlusCircleIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useState } from 'react'; // For accordion functionality

const faqsData = [
  { id: 1, question: "What types of legal services do you offer?", answer: "We offer a comprehensive range of legal services including corporate law, intellectual property, real estate, litigation, and dispute resolution. Our experts are equipped to handle complex cases across various sectors." },
  { id: 2, question: "How do your financial advisory services work?", answer: "Our financial advisory services cover wealth management, investment planning, tax strategy, and estate planning. We work closely with you to understand your financial goals and create tailored strategies for sustainable growth." },
  { id: 3, question: "What is your typical client engagement process?", answer: "Our process begins with an initial consultation to understand your needs, followed by strategic planning, meticulous execution of the agreed-upon strategy, and continuous support with regular reviews to ensure long-term success." },
  { id: 4, question: "Are your consultations confidential?", answer: "Absolutely. All consultations and client interactions are treated with the utmost confidentiality and discretion, adhering to the highest standards of professional ethics and legal privacy regulations." },
];

export default function FAQsPage() {
  const [openFAQId, setOpenFAQId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenFAQId(openFAQId === id ? null : id);
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-400">FAQ List</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New FAQ
          </button>
        </div>

        <div className="space-y-4">
          {faqsData.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-[#0A192F] rounded-lg shadow-md border border-blue-800"
            >
              <div
                className="flex justify-between items-center p-5 cursor-pointer"
                onClick={() => toggleFAQ(faq.id)}
              >
                <h4 className="text-xl font-semibold text-white flex-1 pr-4">{faq.question}</h4>
                <div className="flex space-x-3">
                  <button className="text-blue-400 hover:text-blue-600" title="Edit">
                    <PencilIcon className="h-6 w-6" />
                  </button>
                  <button className="text-red-400 hover:text-red-600" title="Delete">
                    <TrashIcon className="h-6 w-6" />
                  </button>
                  {openFAQId === faq.id ? (
                    <ChevronUpIcon className="h-6 w-6 text-blue-400" />
                  ) : (
                    <ChevronDownIcon className="h-6 w-6 text-blue-400" />
                  )}
                </div>
              </div>
              {openFAQId === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-5 pb-5 text-blue-200 border-t border-blue-700/50"
                >
                  <p>{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}