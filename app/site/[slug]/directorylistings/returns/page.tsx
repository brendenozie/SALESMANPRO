"use client";

import React from 'react';
import { motion } from 'framer-motion';
// The following import caused an error due to an unresolvable path.
// It is likely a placeholder for a component that does not exist in this environment.
// For this self-contained component, we will remove this import and replace the
// Section component with a basic <div> to ensure the code runs.
// import Section from '@/components/site/Section/Section';
import { useStore } from '@/contexts/StoreContext';

// IMPORTANT: This file assumes you have the necessary components (Section) and context (StoreContext) in your project.
// The `useStore` hook is used here with mock data for demonstration purposes.

// --- Icon components for the steps ---
// Using inline SVG for simplicity and consistency.
const StartIcon = () => (
    <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
);

const LabelIcon = () => (
    <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13l3-3m0 0l3 3m-3-3v8m0 0l-3 3m3-3l3 3m-3-3v8" />
    </svg>
);

const PackageIcon = () => (
    <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const RefundIcon = () => (
    <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.1 0-5.7 1.8-7 4.5l7 7 7-7C17.7 9.8 15.1 8 12 8z" />
    </svg>
);


// Mock store data for demonstration
const mockStore = {
    policies: [
        { type: 'returns', title: '30-Day Window', content: 'You have 30 days from the date of purchase to return your item.' },
        { type: 'returns', title: 'Original Condition', content: 'Items must be unused, unwashed, and in their original packaging with tags.' },
        { type: 'returns', title: 'Full Refund', content: 'Receive a full refund to your original payment method.' },
    ],
    faqs: [
        { question: 'Do I have to pay for return shipping?', answer: 'We provide a free, prepaid shipping label for all eligible returns within the 30-day window.' },
        { question: 'How long does it take to get my refund?', answer: 'Once we receive your return, we\'ll inspect it and process the refund within 5-7 business days. The funds will then be credited to your original payment method.' },
        { question: 'What if my item is damaged or defective?', answer: 'Please contact our support team immediately. We\'ll be happy to arrange a replacement or refund and cover any associated shipping costs.' },
    ],
};

const returnsSteps = [
    { title: 'Start Your Return', description: 'Click the "Start a Return" button below and enter your order details to begin.', icon: <StartIcon /> },
    { title: 'Print Your Label', description: 'We will email you a prepaid shipping label. Simply print it and attach it to your package.', icon: <LabelIcon /> },
    { title: 'Pack & Ship', description: 'Package your item securely and drop it off at any designated carrier location.', icon: <PackageIcon /> },
    { title: 'Receive Refund', description: 'We\'ll process your refund within 5-7 business days of receiving the return.', icon: <RefundIcon /> },
];


const ReturnsPage: React.FC = () => {
    // In a real application, you would get this from your context.
    // const store = useStore();
    const store = mockStore;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
        >
            <div className="container mx-auto px-4 py-16 max-w-6xl">

                {/* Hero Section */}
                <header className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-blue-600 dark:text-blue-400">
                        Hassle-Free Returns
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Not quite right? No problem. We've made returning an item as easy as possible.
                    </p>
                    <div className="mt-8">
                        <motion.a 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="#start-return"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform duration-300"
                        >
                            Start a Return
                        </motion.a>
                    </div>
                </header>

                {/* Policy Section */}
                {/* Replaced <Section> with a basic <div> */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Our Simple Returns Policy</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {store?.policies?.filter(p => p.type === 'returns').map((policy, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                                <span className="text-4xl text-blue-500 mb-4 inline-block">
                                    {/* Using emojis for icons as a placeholder for simplicity */}
                                    {index === 0 && '⏳'}
                                    {index === 1 && '✅'}
                                    {index === 2 && '🔄'}
                                </span>
                                <h3 className="text-xl font-semibold mb-2">{policy.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {policy.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How it Works Section */}
                {/* Replaced <Section> with a basic <div> */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                    <div className="space-y-12 max-w-2xl mx-auto md:max-w-4xl">
                        {returnsSteps.map((step, index) => (
                            <div key={index} className="relative z-10 md:flex md:items-center md:space-x-8">
                                <div className="flex-shrink-0 icon-container bg-blue-500 mx-auto md:mx-0">
                                    {step.icon}
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-4 md:mt-0 md:flex-1 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                                    <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Step {index + 1}: {step.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <section id="start-return" className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
                        Click the button below to begin the quick and easy return process.
                    </p>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="#"
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform duration-300"
                    >
                        Start My Return
                    </motion.a>
                </section>

                {/* FAQ Section */}
                {/* Replaced <Section> with a basic <div> */}
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

export default ReturnsPage;
