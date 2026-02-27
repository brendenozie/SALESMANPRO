'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    EnvelopeIcon, 
    ChatBubbleBottomCenterTextIcon, 
    ClockIcon, 
    ArrowUpRightIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function ContactCTASection() {
    const { storeFormData } = useStoreContext();
    const companyId = storeFormData?.id;
    const { themeSettings, name } = storeFormData || {};
    const primaryColor = themeSettings?.primaryColor || '#059669';

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

        const formattedContent = `NEW GENERAL INQUIRY\n\nName: ${form.fullName}\nEmail: ${form.email}\n\nMessage:\n${form.message}`;

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
        <section id="contact" className="relative py-24 lg:py-40 bg-white overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]" style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    
                    {/* --- Left Column: Info & Links --- */}
                    <div className="lg:col-span-5 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-xs font-black uppercase tracking-[0.3em] mb-6 block" style={{ color: primaryColor }}>
                                Get In Touch
                            </span>
                            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                                Let's start <br />
                                <span className="italic font-serif font-light text-slate-400">the conversation.</span>
                            </h2>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed">
                                Have a question or a project in mind? Our team is here to help you navigate your journey with {name || 'SwiftServe'}.
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {[
                                { label: 'Support Hours', value: 'Mon–Sat, 8AM–8PM', icon: ClockIcon },
                                { label: 'WhatsApp', value: 'Chat with us live', icon: ChatBubbleBottomCenterTextIcon, link: 'https://wa.me/254712345678' },
                                { label: 'Email Us', value: 'support@wellness.com', icon: EnvelopeIcon },
                            ].map((item, i) => (
                                <motion.a
                                    key={i}
                                    href={item.link || '#'}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors" style={{ backgroundColor: `${primaryColor}10` }}>
                                            <item.icon className="w-6 h-6" style={{ color: primaryColor }} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-lg font-bold text-slate-900">{item.value}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRightIcon className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* --- Right Column: The Form --- */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-7 relative"
                    >
                        <div className="relative bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                            {/* Decorative Form Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 opacity-20" style={{ background: `radial-gradient(circle at top right, ${primaryColor}, transparent)` }} />

                            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                                            style={{ '--tw-ring-color': primaryColor } as any}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                                            style={{ '--tw-ring-color': primaryColor } as any}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                                        style={{ '--tw-ring-color': primaryColor } as any}
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-50"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {isSubmitting ? 'Processing...' : 'Send Message'}
                                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                </motion.button>

                                {/* AnimatePresence for status updates */}
                                <AnimatePresence>
                                    {submitStatus === 'success' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 justify-center text-emerald-400 font-bold"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Sent successfully!
                                        </motion.div>
                                    )}
                                    {submitStatus === 'error' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 justify-center text-rose-400 font-bold"
                                        >
                                            <ExclamationCircleIcon className="w-5 h-5" />
                                            Submission failed.
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}