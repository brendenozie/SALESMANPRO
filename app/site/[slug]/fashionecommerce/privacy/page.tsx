'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import { useStore } from '@/contexts/StoreContext';
import { ChevronDoubleDownIcon, HandRaisedIcon, KeyIcon, LinkIcon, ShieldExclamationIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Define the content for each privacy policy section
const privacySections = [
  {
    title: 'Our Commitment to Your Privacy',
    icon: <ShieldExclamationIcon className='w-8 h-8' />,
    id: 'commitment',
    content: (
      <>
        <p>Your privacy is our top priority. This policy outlines how we collect, use, and protect your personal information to provide a safe and transparent shopping experience. We believe in building trust, and that starts with clear communication about your data.</p>
        <p className="mt-2">This document is designed to be easy to understand. If you have any questions, please don't hesitate to <a href="/contact" className="text-blue-600 hover:underline">contact us</a>.</p>
      </>
    ),
  },
  {
    title: 'What Information We Collect',
    icon: <UserCircleIcon  className='w-8 h-8' />,
    id: 'data-collection',
    content: (
      <>
        <h4 className="font-semibold text-lg mb-2">Information you provide to us:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Contact Information:</strong> Your name, email address, phone number, and shipping address when you create an account or place an order.</li>
          <li><strong>Payment Information:</strong> We do not store your full credit card details. This information is securely processed by our payment partners (e.g., Stripe, PayPal).</li>
          <li><strong>Communication Data:</strong> Any information you provide when you contact our customer support team or participate in surveys.</li>
        </ul>
        <h4 className="font-semibold text-lg mt-4 mb-2">Information we collect automatically:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Usage Data:</strong> Information about how you interact with our website, such as pages viewed, products added to cart, and time spent on our site.</li>
          <li><strong>Technical Data:</strong> Your IP address, browser type, device type, and operating system to help us optimize your experience and for security purposes.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'How and Why We Use Your Information',
    icon: <HandRaisedIcon  className='w-8 h-8' />,
    id: 'data-usage',
    content: (
      <>
        <ul className="list-disc list-inside space-y-3">
          <li><strong>To Fulfill Your Orders:</strong> We use your contact and shipping information to process and deliver your purchases.</li>
          <li><strong>To Improve Our Services:</strong> We analyze usage data to understand what products are popular and how to make our website better and more user-friendly.</li>
          <li><strong>To Personalize Your Experience:</strong> We may use your browsing history to show you products and promotions that are most relevant to your interests.</li>
          <li><strong>For Communication:</strong> We'll use your email to send order confirmations, shipping updates, and, if you consent, marketing promotions.</li>
          <li><strong>For Security and Legal Compliance:</strong> We use your data to prevent fraud, protect our business, and comply with legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Sharing Your Information with Third Parties',
    icon: <LinkIcon  className='w-8 h-8' />,
    id: 'third-parties',
    content: (
      <>
        <p>We only share your information with trusted partners and service providers who help us operate our business. These third parties are legally bound to protect your data and are not allowed to use it for any other purpose.</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Payment Processors:</strong> To handle your transactions securely.</li>
          <li><strong>Shipping Carriers:</strong> To deliver your orders.</li>
          <li><strong>Analytics Providers:</strong> To understand how our website is used and to improve our services.</li>
          <li><strong>Marketing Platforms:</strong> To manage our advertising campaigns.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Our Use of Cookies',
    icon: <KeyIcon  className='w-8 h-8' />,
    id: 'cookies',
    content: (
      <>
        <p>We use cookies and similar tracking technologies to improve your browsing experience. Cookies are small data files stored on your device that help us remember your preferences, keep you logged in, and analyze site traffic.</p>
        <p className="mt-2">You can manage your cookie preferences through your browser settings. However, please note that disabling cookies may affect the functionality of our website.</p>
      </>
    ),
  },
];

const CollapsibleSection = ({ title, icon, content, isOpen, onClick }:any) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <motion.button
        onClick={onClick}
        className="flex justify-between items-center w-full py-4 text-left font-semibold text-lg hover:text-blue-600 transition-colors duration-200"
      >
        <span className="flex items-center space-x-3">
          <span className="text-xl text-blue-500">{icon}</span>
          <span>{title}</span>
        </span>
        <motion.span
          initial={{ rotate: 0 }}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDoubleDownIcon  className='w-8 h-8' />
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
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PrivacyPolicyPage() {
  const store = useStore();
  const [openSection, setOpenSection] = useState('commitment');

  const toggleSection = (id : string) => {
    setOpenSection(openSection === id ? '' : id);
  };

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-800 dark:text-gray-200">Store not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen py-16">
      <Section title="Privacy Policy">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <p className="text-center text-lg text-gray-600 dark:text-gray-400">
            This page explains how we handle your personal information. We've made it as simple as possible to understand.
          </p>

          {/* Quick links / Table of Contents */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {privacySections.map(section => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setOpenSection(section.id)}
                className={`py-2 px-4 rounded-full text-sm font-medium transition-colors duration-200 ${
                  openSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {section.title}
              </a>
            ))}
          </motion.div>

          {/* Collapsible Sections */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {privacySections.map(section => (
              <div key={section.id} id={section.id}>
                <CollapsibleSection
                  title={section.title}
                  icon={section.icon}
                  content={section.content}
                  isOpen={openSection === section.id}
                  onClick={() => toggleSection(section.id)}
                />
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-sm text-center text-gray-400 dark:text-gray-600 mt-8"
          >
            Last updated: August 27, 2025
          </motion.p>
        </motion.div>
      </Section>
    </div>
  );
}