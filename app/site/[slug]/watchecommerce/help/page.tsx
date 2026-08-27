'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import { useStore } from '@/contexts/StoreContext';
import { ArchiveBoxIcon, BackspaceIcon, ChevronDoubleDownIcon, CogIcon, CreditCardIcon, MagnifyingGlassCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const helpCategories = [
  {
    title: 'Orders & Shipping',
    icon: <CogIcon className='text-blue-500 w-8 h-8' />,
    description: 'Track your order, check delivery times, and more.',
    slug: 'orders-shipping',
  },
  {
    title: 'Payments & Billing',
    icon: <CreditCardIcon  className='text-blue-500 w-8 h-8' />,
    description: 'Information on payment methods, invoices, and refunds.',
    slug: 'payments-billing',
  },
  {
    title: 'Returns & Refunds',
    icon: <BackspaceIcon  className='text-blue-500 w-8 h-8' />,
    description: 'How to return an item or request a refund.',
    slug: 'returns-refunds',
  },
  {
    title: 'My Account',
    icon: <UserCircleIcon  className='text-blue-500 w-8 h-8' />,
    description: 'Manage your profile, password, and account settings.',
    slug: 'my-account',
  },
  {
    title: 'Product Information',
    icon: <ArchiveBoxIcon  className='text-blue-500 w-8 h-8' />,
    description: 'Find details about products, materials, and care.',
    slug: 'product-info',
  },
];

const faqs = [
  {
    question: 'How do I track my order?',
    answer: 'Once your order has shipped, you will receive an email with a tracking number and a link to the carrier’s website. You can also find your tracking information in your account under "Order History". Please allow 24 hours for the tracking information to update.',
    slug: 'track-order',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept a variety of payment methods, including major credit cards (Visa, MasterCard, American Express), M-Pesa, and PayPal for secure transactions. All payments are processed through a secure gateway.',
    slug: 'payment-methods',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy on most items. Products must be in their original, unused condition with all tags attached. Some exclusions may apply. Please visit our dedicated Returns page for full details.',
    slug: 'return-policy',
  },
  {
    question: 'How do I reset my password?',
    answer: 'To reset your password, click on the "Forgot Password" link on the login page. Enter the email address associated with your account, and we will send you a link to create a new password.',
    slug: 'reset-password',
  },
  {
    question: 'Can I change or cancel my order?',
    answer: 'Orders are processed quickly to ensure fast delivery. If you need to change or cancel your order, please contact our support team immediately. We will do our best to accommodate your request, but cannot guarantee changes after an order has been submitted.',
    slug: 'cancel-order',
  },
];

const CollapsibleFAQ = ({ question, answer, isOpen, onClick }:any) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <motion.button
        onClick={onClick}
        className="flex justify-between items-center w-full py-4 text-left font-semibold text-lg hover:text-blue-600 transition-colors duration-200"
      >
        <span className="flex items-center space-x-3">
          <span>{question}</span>
        </span>
        <motion.span
          initial={{ rotate: 0 }}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDoubleDownIcon  className='text-blue-500 w-8 h-8' />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pb-4"
          >
            <p className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function HelpCenterPage() {
  const store = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-800 dark:text-gray-200">Store not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen py-16">
      <Section title="How Can We Help?">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          {/* Search Bar */}
          <div className="text-center">
            <div className="relative max-w-2xl mx-auto">
              <MagnifyingGlassCircleIcon className="absolute w-8 h-8 left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl" />
              <input
                type="text"
                placeholder="Search for an answer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <motion.a
                key={category.slug}
                href={`#${category.slug}`}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-center"
              >
                <div className="text-4xl text-blue-500 mx-auto w-12 h-12 flex items-center justify-center mb-4">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {category.description}
                </p>
              </motion.a>
            ))}
          </div>

          {/* FAQs Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Frequently Asked Questions
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <CollapsibleFAQ
                    key={faq.slug}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === faq.slug}
                    onClick={() => setOpenFAQ(openFAQ === faq.slug ? null : faq.slug)}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No FAQs found for your search.
                </p>
              )}
            </div>
          </div>

          {/* Contact Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-4"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our friendly support team is ready to assist you.
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300"
            >
              Contact Support
            </motion.a>
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
}