'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, QuestionMarkCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

const defaultFaqs = [
    {
        question: 'How do I book a session?',
        answer: 'Our intuitive booking system allows you to easily browse available services and professionals, select your preferred time, and confirm your appointment in just a few clicks. It’s designed for your convenience!',
    },
    {
        question: 'Are the professionals on your platform certified?',
        answer: 'Absolutely. We rigorously vet all professionals on our platform to ensure they are fully licensed, highly experienced, and adhere to the highest industry standards. Your safety and satisfaction are our top priorities.',
    },
    {
        question: 'What is your cancellation or rescheduling policy?',
        answer: 'We understand plans can change. You can easily manage your bookings directly from your user dashboard, including rescheduling or canceling sessions. Please refer to our detailed policy page for specific timeframes and conditions to avoid any charges.',
    },
    {
        question: 'How secure are my payments?',
        answer: 'We prioritize your financial security. All transactions on our platform are processed through industry-leading, encrypted payment gateways. Your personal and payment information is always protected with the latest security protocols.',
    },
    {
        question: 'Do you offer gift cards?',
        answer: 'Yes! Give the gift of wellness with our customizable digital gift cards. They are perfect for friends, family, or colleagues and can be purchased directly through our website.',
    },
];

interface FAQProps {
    faqs?: { question: string; answer: string }[];
    name?: string | null;
    themeSettings?: {
        primaryColor?: string;
    } | null;
}

// Helper to safely convert hex to rgba for dynamic glassmorphism aesthetics
const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function FAQsSection({ faqs, name, themeSettings }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const items = faqs?.length ? faqs : defaultFaqs;
    const storeName = name || 'our platform';
    const primaryColor = themeSettings?.primaryColor || '#00A880';

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="relative bg-[#0b1329] py-28 lg:py-40 px-6 lg:px-8 text-white overflow-hidden">
            
            {/* 🪐 Deep Space Ambient Spotlights */}
            <div 
                className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.08] pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
            <div 
                className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] opacity-[0.07] pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Modern Asymmetric Split Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left Sticky Context Panel */}
                    <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
                        >
                            <SparklesIcon className="w-4 h-4 animate-spin-slow" style={{ color: primaryColor }} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Support Center</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.1]"
                        >
                            Got questions? <br />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, #ffffff, ${primaryColor})`, WebkitTextFillColor: 'transparent' }}>
                                We have answers.
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="text-gray-400 text-lg font-light leading-relaxed"
                        >
                            Can't find what you are looking for? Everything you need to safely navigate your premium journey inside <span className="text-white font-semibold">{storeName}</span> is mapped out right here.
                        </motion.p>

                        {/* Interactive Help Card Badge */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-md flex items-start gap-4"
                        >
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10" style={{ color: primaryColor }}>
                                <QuestionMarkCircleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Still need assistance?</h4>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Our dedicated assistance operators remain online 24/7 to manage individual custom service escalations.</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Interactive Accordion Panel Stack */}
                    <div className="lg:col-span-7 space-y-4 w-full">
                        {items.map((faq, index) => {
                            const isOpen = openIndex === index;
                            
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.05 * index }}
                                    viewport={{ once: true }}
                                    className="overflow-hidden rounded-2xl transition-all duration-300 border"
                                    style={{
                                        backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                                        borderColor: isOpen ? hexToRgba(primaryColor, 0.3) : 'rgba(255, 255, 255, 0.06)',
                                        boxShadow: isOpen ? `0 20px 40px -15px ${hexToRgba(primaryColor, 0.15)}` : 'none'
                                    }}
                                >
                                    {/* Accordion Trigger Header Bar */}
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full text-left px-6 py-5 sm:px-8 sm:py-6 flex justify-between items-center gap-4 focus:outline-none select-none group"
                                        aria-expanded={isOpen}
                                    >
                                        <h3 className="text-lg font-bold text-white tracking-tight transition-colors duration-300 group-hover:text-white/90">
                                            {faq.question}
                                        </h3>
                                        
                                        {/* Premium Encapsulated Visual Morph Indicator */}
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0"
                                            style={{
                                                backgroundColor: isOpen ? primaryColor : 'rgba(255, 255, 255, 0.03)',
                                                borderColor: isOpen ? primaryColor : 'rgba(255, 255, 255, 0.1)',
                                                color: isOpen ? '#ffffff' : '#9ca3af'
                                            }}
                                        >
                                            <motion.div
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <ChevronDownIcon className="w-4 h-4" strokeWidth={2.5} />
                                            </motion.div>
                                        </div>
                                    </button>

                                    {/* Smooth Height Reveal Implementation Container */}
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div className="px-6 pb-6 sm:px-8 sm:pb-7 border-t border-white/5 pt-4 text-gray-400 font-light text-base leading-relaxed antialiased">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </section>
    );
}