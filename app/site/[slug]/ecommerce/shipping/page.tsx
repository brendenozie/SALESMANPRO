"use client";

import React from 'react';
import { motion } from 'framer-motion';
// This file assumes the `Section` component is not available, so
// standard <div> elements are used to maintain the layout.
import { useStore } from '@/contexts/StoreContext';

// Type definitions (provided by the user)
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  // themeSettings
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface ShippingPageProps {
  store: Store;
}

// --- Icon components for the shipping options ---
const StandardIcon = () => (
    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ExpressIcon = () => (
    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const InternationalIcon = () => (
    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h4a2 2 0 002-2v-1a2 2 0 012-2h2.945M19 8H5a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2z" />
    </svg>
);

// Mock store data for demonstration purposes
const mockStore = {
  policies: [], // Not used for this page
  faqs: [
    { question: 'When will my order ship?', answer: 'Orders are typically processed within 1-2 business days. You will receive a confirmation email once your order has shipped.' },
    { question: 'Can I change my shipping address after I\'ve placed an order?', answer: 'Please contact us as soon as possible. We can\'t guarantee a change after an order is placed, but we\'ll do our best to help before it ships.' },
    { question: 'What if my package is lost or damaged?', answer: 'We\'re sorry to hear that! Please reach out to our customer support team immediately with your order number, and we\'ll work with the carrier to resolve the issue.' },
  ],
  shippingOptions: [
    { title: 'Standard Shipping', description: 'Our most popular and cost-effective option.', icon: <StandardIcon />, details: ['Delivery Time: 5-7 Business Days', 'Cost: $5.99 or Free over $75'] },
    { title: 'Express Shipping', description: 'For when you need your order fast.', icon: <ExpressIcon />, details: ['Delivery Time: 2-3 Business Days', 'Cost: $15.99'] },
    { title: 'International Shipping', description: 'We ship to most countries worldwide.', icon: <InternationalIcon />, details: ['Delivery Time: 7-21 Business Days', 'Cost: Varies by location'] },
  ]
};

const ShippingPage: React.FC<ShippingPageProps> = () => {
  // In a real application, you would use your context.
  // const store = useStore();
  const store = mockStore;

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen"
    >
        <div className="container mx-auto px-4 py-16 max-w-6xl">
            {/* Hero Section */}
            <header className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-purple-600 dark:text-purple-400">
                    Fast & Reliable Shipping
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    We're committed to getting your order to you quickly and safely, wherever you are.
                </p>
                <div className="mt-8">
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="#shipping-options"
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform duration-300"
                    >
                        View Shipping Options
                    </motion.a>
                </div>
            </header>

            {/* Shipping Options Section */}
            <div id="shipping-options" className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Our Shipping Methods</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {store?.shippingOptions?.map((option, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="icon-container bg-purple-500">
                                    {option.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{option.description}</p>
                            <ul className="text-left space-y-2 text-gray-700 dark:text-gray-300">
                                {option.details.map((detail, detailIndex) => (
                                    <li key={detailIndex}>
                                        <strong>{detail.split(':')[0]}:</strong> {detail.split(':')[1]}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Track Your Order Section */}
            <section className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Track Your Order</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
                    Once your order has shipped, you will receive an email with a tracking number.
                </p>
                <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="#"
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform duration-300"
                >
                    Track My Order
                </motion.a>
            </section>

            {/* FAQ Section */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8">Common Questions</h2>
                <div className="space-y-4 max-w-3xl mx-auto">
                    {store?.faqs?.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4"
                        >
                            <h3 className="font-semibold text-lg mb-1">{faq.question}</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {faq.answer}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default ShippingPage;
