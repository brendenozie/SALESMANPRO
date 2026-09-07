"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    EnvelopeIcon, 
    ChatBubbleLeftRightIcon, 
    ClockIcon, 
    ArrowUpRightIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    SparklesIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function ContactCTASection() {
    const { storeFormData } = useStoreContext();
    const companyId = storeFormData?.id;
    const { themeSettings } = storeFormData || {};
    
    // Using the Teal palette from our updated design
    const tealPrimary = "#0D9488"; 

    const [form, setForm] = useState({ fullName: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.id]: e.target.value });
        if (submitStatus !== 'idle') setSubmitStatus('idle');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formattedContent = `NEW SERVICE INQUIRY\n\nName: ${form.fullName}\nEmail: ${form.email}\n\nMessage:\n${form.message}`;

        try {
            const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyId, content: formattedContent }),
            });
            if (!res.ok) throw new Error("API Error");
            setSubmitStatus('success');
            setForm({ fullName: '', email: '', message: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="relative py-24 lg:py-48 bg-white dark:bg-[#080a0c] overflow-hidden">
            {/* Soft Ambient Orbs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-12 gap-24 items-start">
                    
                    {/* --- Left Column: Editorial Info --- */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-20"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px w-12 bg-teal-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">The Concierge Desk</span>
                            </div>
                            <h2 className="text-6xl md:text-8xl font-bold text-slate-900 dark:text-white leading-[0.85] tracking-tighter mb-10">
                                REACH OUT TO <br />
                                <span className="font-serif italic font-light text-slate-300 dark:text-slate-700">The Atelier.</span>
                            </h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-md">
                                From bespoke fiber care to scheduled collection, our team ensures your wardrobe remains in a state of perpetual perfection.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { label: 'Service Hours', value: 'Mon–Sat, 7AM–9PM', icon: ClockIcon },
                                { label: 'Direct Messenger', value: 'WhatsApp Concierge', icon: ChatBubbleLeftRightIcon, link: '#' },
                                { label: 'Our Atelier', value: 'Nairobi, Central District', icon: MapPinIcon },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-8 p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-700"
                                >
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm group-hover:bg-teal-600 transition-colors duration-500">
                                        <item.icon className="w-6 h-6 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* --- Right Column: The Glass Form --- */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="lg:col-span-7"
                    >
                        <div className="relative p-[1px] rounded-[4rem] bg-gradient-to-b from-teal-500/20 to-transparent">
                            <div className="bg-white/80 dark:bg-[#0c0f12]/80 backdrop-blur-3xl rounded-[4rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
                                
                                <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                id="fullName"
                                                value={form.fullName}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 py-4 text-slate-900 dark:text-white text-xl placeholder:text-transparent focus:outline-none focus:border-teal-600 transition-colors peer"
                                                placeholder="Your Name"
                                            />
                                            <label className="absolute left-0 top-4 text-slate-400 transition-all pointer-events-none peer-focus:-top-6 peer-focus:text-[10px] peer-focus:uppercase peer-focus:font-black peer-focus:tracking-widest peer-focus:text-teal-600 peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px]">Full Identity</label>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                id="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 py-4 text-slate-900 dark:text-white text-xl placeholder:text-transparent focus:outline-none focus:border-teal-600 transition-colors peer"
                                                placeholder="Email"
                                            />
                                            <label className="absolute left-0 top-4 text-slate-400 transition-all pointer-events-none peer-focus:-top-6 peer-focus:text-[10px] peer-focus:uppercase peer-focus:font-black peer-focus:tracking-widest peer-focus:text-teal-600 peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px]">Email Address</label>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            id="message"
                                            rows={4}
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 py-4 text-slate-900 dark:text-white text-xl placeholder:text-transparent focus:outline-none focus:border-teal-600 transition-colors peer resize-none"
                                            placeholder="Message"
                                        />
                                        <label className="absolute left-0 top-4 text-slate-400 transition-all pointer-events-none peer-focus:-top-6 peer-focus:text-[10px] peer-focus:uppercase peer-focus:font-black peer-focus:tracking-widest peer-focus:text-teal-600 peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px]">How can we assist you?</label>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-8 rounded-3xl font-black text-white bg-teal-600 flex items-center justify-center gap-6 shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition-all disabled:opacity-50"
                                    >
                                        <span className="uppercase tracking-[0.3em] text-xs">
                                            {isSubmitting ? 'Transmitting Request...' : 'Send Inquiry'}
                                        </span>
                                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                    </motion.button>

                                    <AnimatePresence>
                                        {submitStatus === 'success' && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute inset-0 bg-white dark:bg-[#0c0f12] z-20 flex flex-col items-center justify-center text-center p-12 rounded-[4rem]"
                                            >
                                                <div className="w-24 h-24 bg-teal-50 dark:bg-teal-500/10 rounded-full flex items-center justify-center mb-8">
                                                    <CheckCircleIcon className="w-12 h-12 text-teal-600" />
                                                </div>
                                                <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Request Logged.</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-lg">Our concierge will contact you shortly.</p>
                                                <button 
                                                    onClick={() => setSubmitStatus('idle')} 
                                                    className="mt-12 text-[10px] uppercase tracking-[0.4em] text-teal-600 font-black border-b-2 border-teal-600 pb-1"
                                                >
                                                    New Inquiry
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}