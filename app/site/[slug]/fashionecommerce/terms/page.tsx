'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaFileContract, FaShoppingCart, FaUserLock, FaUndo, FaShippingFast, FaExclamationTriangle, FaGavel, FaLightbulb } from 'react-icons/fa';
import Section from '@/components/site/Section/Section';
import { useStore } from '@/contexts/StoreContext';
import { BackspaceIcon, ChevronDownIcon, ExclamationTriangleIcon, LightBulbIcon, ShieldCheckIcon, ShoppingBagIcon, TvIcon, UserIcon } from '@heroicons/react/24/outline';
import { CogIcon } from '@heroicons/react/20/solid';

// Define the content for each Terms and Conditions section
const termsSections = [
  {
    title: 'Welcome to Our Store!',
    icon: <TvIcon  className='h-5 w-5 text-gray-500'/>,
    id: 'welcome',
    content: (
      <>
        <p>These Terms and Conditions ("Terms") govern your use of the [Your Store Name] website ("Website") and your purchase of products from us. By accessing or using our Website and purchasing products, you agree to be bound by these Terms.</p>
        <p className="mt-2">Please read them carefully. If you do not agree with any part of these Terms, you should not use our Website or purchase our products.</p>
      </>
    ),
  },
  {
    title: 'Account Registration and Responsibilities',
    icon: <UserIcon  className='h-5 w-5 text-gray-500'/>,
    id: 'accounts',
    content: (
      <>
        <p>To access certain features of our Website, you may be required to register for an account. When you do, you agree to:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Provide accurate, current, and complete information during the registration process.</li>
          <li>Maintain the security of your password and identification.</li>
          <li>Promptly update your account information to keep it accurate and complete.</li>
          <li>Be responsible for all activities that occur under your account.</li>
        </ul>
        <p className="mt-2">We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete.</p>
      </>
    ),
  },
  {
    title: 'Product Information and Orders',
    icon: <ShoppingBagIcon  className='h-5 w-5 text-gray-500'/>,
    id: 'products-orders',
    content: (
      <>
        <h4 className="font-semibold text-lg mb-2">Product Descriptions:</h4>
        <p>We strive to be as accurate as possible in the description of our products on the Website. However, we do not warrant that product descriptions or other content of the Website is accurate, complete, reliable, current, or error-free.</p>
        <h4 className="font-semibold text-lg mt-4 mb-2">Pricing:</h4>
        <p>All prices are listed in KES (Kenyan Shillings) and are subject to change without notice. While we strive for accuracy, errors in pricing can occur. In such cases, we reserve the right to cancel any orders placed at the incorrect price, even if the order has been confirmed and your credit card charged. If your credit card has already been charged, we will issue a full refund.</p>
        <h4 className="font-semibold text-lg mt-4 mb-2">Order Acceptance:</h4>
        <p>Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order, nor does it constitute confirmation of our offer to sell. We reserve the right at any time after receipt of your order to accept or decline your order for any reason.</p>
      </>
    ),
  },
  {
    title: 'Payment, Shipping, and Delivery',
    icon: <ShieldCheckIcon  className='h-5 w-5 text-gray-500'/>,
    id: 'payment-shipping',
    content: (
      <>
        <h4 className="font-semibold text-lg mb-2">Payment:</h4>
        <p>We accept various payment methods, including M-Pesa, major credit cards, and other secure payment gateways. By providing payment information, you represent and warrant that you are authorized to use the designated payment method.</p>
        <h4 className="font-semibold text-lg mt-4 mb-2">Shipping:</h4>
        <p>We aim to process and ship orders promptly. Shipping costs and estimated delivery times will be calculated and displayed at checkout. Please note that delivery times may vary, especially for international orders or during peak seasons. We currently ship within Nairobi and to select locations across Kenya. Additional charges may apply for deliveries outside Nairobi County.</p>
        <h4 className="font-semibold text-lg mt-4 mb-2">Delivery:</h4>
        <p>Risk of loss and title for items purchased from our Website pass to you upon our delivery to the carrier. We are not responsible for any lost or stolen packages once they have been marked as delivered by the carrier.</p>
      </>
    ),
  },
  {
    title: 'Returns, Refunds, and Cancellations',
    icon: <BackspaceIcon className='h-5 w-5 text-gray-500' />,
    id: 'returns',
    content: (
      <>
        <p>Our goal is your complete satisfaction. Please review our dedicated <a href="/returns-policy" className="text-blue-600 hover:underline">Returns Policy page</a> for detailed information on how to return items, eligibility for refunds, and order cancellation procedures.</p>
        <p className="mt-2">Key points:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Items must be returned within [Number] days of receipt.</li>
          <li>Products must be in their original condition, unused, and with all tags attached.</li>
          <li>Some items, such as [mention specific non-returnable items, e.g., personalized goods, perishables], may not be eligible for return.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Intellectual Property Rights',
    icon: <LightBulbIcon  className='h-5 w-5 text-gray-500'/>,
    id: 'ip-rights',
    content: (
      <>
        <p>All content on this Website, including text, graphics, logos, images, audio clips, digital downloads, and data compilations, is the property of [Your Store Name] or its content suppliers and protected by international copyright laws.</p>
        <p className="mt-2">The trademarks, service marks, and trade dress of [Your Store Name] may not be used in connection with any product or service that is not [Your Store Name]'s, in any manner that is likely to cause confusion among customers, or in any manner that disparages or discredits [Your Store Name].</p>
      </>
    ),
  },
  {
    title: 'Disclaimer of Warranties and Limitation of Liability',
    icon: <ExclamationTriangleIcon  className='h-5 w-5 text-gray-500'/>,
    id: 'disclaimer',
    content: (
      <>
        <p>Our Website and all information, content, materials, products, and services included on or otherwise made available to you through this Website are provided by [Your Store Name] on an "as is" and "as available" basis, unless otherwise specified in writing.</p>
        <p className="mt-2">To the fullest extent permissible by applicable law, [Your Store Name] disclaims all warranties, express or implied, including, but not limited to, implied warranties of merchantability and fitness for a particular purpose.</p>
        <p className="mt-2">You expressly agree that your use of this Website is at your sole risk.</p>
      </>
    ),
  },
  {
    title: 'Governing Law and Jurisdiction',
    icon: <CogIcon  className='h-5 w-5 text-gray-500'/>,
    id: 'governing-law',
    content: (
      <>
        <p>These Terms and your use of the Website shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law principles.</p>
        <p className="mt-2">Any legal action or proceeding relating to your access to, or use of, the Website or our products shall be instituted in a state or federal court in Nairobi, Nairobi County, Kenya. You agree to submit to the jurisdiction of, and agree that venue</p>
      </>
    ),
  },
];

// Reusable CollapsibleSection component (can be shared with Privacy Policy)
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
          <ChevronDownIcon  className='h-5 w-5 text-gray-500'/>
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

export default function TermsPage() {
  const store = useStore();
  const [openSection, setOpenSection] = useState<string | null>('welcome'); // Open the first section by default

  interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
  }

  interface TermsSection {
    title: string;
    icon: React.ReactNode;
    id: string;
    content: React.ReactNode;
  }

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
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
      <Section title="Terms & Conditions">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <p className="text-center text-lg text-gray-600 dark:text-gray-400">
            Welcome to [Your Store Name]! Please read these terms carefully, as they govern your use of our services.
          </p>

          {/* Quick links / Table of Contents */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {termsSections.map(section => (
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
            {termsSections.map(section => (
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