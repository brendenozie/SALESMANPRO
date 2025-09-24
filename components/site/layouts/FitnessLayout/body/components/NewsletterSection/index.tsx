"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, InboxArrowDownIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const sectionVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.9,
            ease: "easeOut",
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut",
        },
    },
};

export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e : any) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: integrate real subscription API here
        console.log(`Subscribing email: ${email}`);

        setSubscribed(true);
        setLoading(false);
        setEmail("");
    };

    return (
        <motion.section
            id="contact"
            className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[3rem] mx-4 md:mx-8 lg:mx-16 my-20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            {/* Background elements for visual interest */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply blur-[120px] animate-blob"
                    initial={{ scale: 0.8, rotate: 0 }}
                    animate={{ scale: 1.2, rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 w-80 h-80 bg-slate-700 rounded-full mix-blend-multiply blur-[100px] animate-blob animation-delay-2000"
                    initial={{ scale: 1.2, rotate: 360 }}
                    animate={{ scale: 0.8, rotate: 0 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                />
            </div>

            <div className="max-w-xl mx-auto text-center relative z-10">
                <motion.div variants={itemVariants}>
                    <InboxArrowDownIcon className="h-20 w-20 mx-auto mb-6 text-white drop-shadow-lg" />
                </motion.div>

                <motion.h2
                    className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-md font-sans"
                    variants={itemVariants}
                >
                    Unlock Your Potential: <span className="text-cyan-300">Subscribe for Exclusive Content</span>
                </motion.h2>

                <motion.p
                    className="text-lg md:text-xl text-white/80 mb-8 max-w-md mx-auto font-light"
                    variants={itemVariants}
                >
                    Join our community and get exclusive content, special offers, and early access to new programs delivered right to your inbox.
                </motion.p>

                <AnimatePresence mode="wait">
                    {subscribed ? (
                        <motion.div
                            key="success"
                            className="bg-slate-800 text-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <CheckCircleIcon className="h-12 w-12 text-green-500 animate-pulse" />
                            <p className="text-2xl font-semibold">Awesome! You're in! 🎉</p>
                            <p className="text-gray-300">Check your inbox for a welcome email. We can't wait to share with you.</p>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <input
                                type="email"
                                required
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 p-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-70 transition-all duration-300 shadow-md"
                                disabled={loading}
                            />
                            <motion.button
                                type="submit"
                                className="px-8 py-4 bg-cyan-500 text-slate-900 rounded-full font-bold hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        Subscribe <RocketLaunchIcon className="h-5 w-5" />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>
                <motion.div
                    className="text-sm mt-6 text-white/60 font-light"
                    variants={itemVariants}
                >
                    We respect your privacy. No spam, ever.
                </motion.div>
            </div>
        </motion.section>
    );
}
