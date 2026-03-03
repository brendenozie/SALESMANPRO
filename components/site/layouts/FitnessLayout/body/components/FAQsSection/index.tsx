"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRightIcon,
    ChevronDownIcon,
    LightBulbIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { FAQ } from '@/types/typings';

const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const faqItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
};

const answerVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: {
        opacity: 1,
        height: "auto",
        marginBottom: 20,
        transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.3, ease: "easeIn" },
    },
};

const dummyFaqs: FAQ[] = [
    {
        id: 'faq1',
        question: "SYSTEM ONBOARDING PROTOCOL",
        answer: "Accessing our performance architecture is streamlined. Select your tier, initiate your profile, and synchronize your biometrics via the command center. Deployment takes less than 120 seconds.",
    },
    {
        id: 'faq2',
        question: "MODALITIES & WORKOUT ARCHITECTURE",
        answer: "We deploy a multi-disciplinary approach: HIIT, Metabolic Conditioning, Strength Cycles, and Neural Recovery. Every program is mathematically balanced for maximal adaptive response.",
    },
    {
        id: 'faq3',
        question: "ELITE TIER PERSONAL COACHING",
        answer: "Direct uplink to certified performance architects is available for Tier-3 members. This includes biometric auditing, custom protocol design, and weekly strategic reviews.",
    },
    {
        id: 'faq4',
        question: "MOBILE INTERFACE & TRACKING",
        answer: "Our native OS is available on both iOS and Android. It functions as a portable command center for real-time data visualization and community tactical updates.",
    },
];

export default function FaqsSection({ faqs = dummyFaqs }: { faqs?: FAQ[] }) {
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <motion.section
            className="relative py-32 bg-[#050505] overflow-hidden border-t border-white/5"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
        >
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1 border border-orange-500/30 rounded-full mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-[10px]">Knowledge Base</span>
                    </motion.div>
                    <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-6">
                        Support <br /> <span className="text-white/10">Protocols</span>
                    </h2>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-px bg-white/10 border border-white/10">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={faq.id}
                            className="bg-[#050505] group cursor-pointer"
                            variants={faqItemVariants}
                            onClick={() => setOpenId(openId === faq.id ? null : faq.id!)}
                        >
                            <div className="flex justify-between items-center p-8 group-hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-6">
                                    <span className="text-orange-500 font-black italic text-sm tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                                        0{i + 1}
                                    </span>
                                    <h3 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter transition-colors group-hover:text-orange-500">
                                        {faq.question}
                                    </h3>
                                </div>
                                <motion.div
                                    animate={{ rotate: openId === faq.id ? 180 : 0, color: openId === faq.id ? "#f97316" : "#444" }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <ChevronDownIcon className="h-6 w-6" />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {openId === faq.id && (
                                    <motion.div
                                        variants={answerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="px-20 overflow-hidden"
                                    >
                                        <div className="h-[1px] w-12 bg-orange-500 mb-6" />
                                        <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed uppercase tracking-wider max-w-2xl">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Tactical Support Footer */}
                <motion.div
                    className="mt-24 p-1px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                >
                    <div className="bg-[#050505] py-12 px-8 flex flex-col md:flex-row items-center justify-between gap-8 border-x border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-orange-500/10 border border-orange-500/20">
                                <ChatBubbleLeftRightIcon className="h-8 w-8 text-orange-500" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Human Intelligence</h3>
                                <p className="text-xs text-gray-500 font-black uppercase tracking-[0.2em]">Live operator support available 24/7</p>
                            </div>
                        </div>
                        <a
                            href="/contact"
                            className="group flex items-center gap-4 bg-white text-black px-10 py-5 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-orange-500 transition-colors"
                        >
                            Open Comms <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}