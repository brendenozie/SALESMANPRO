'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    EnvelopeIcon, 
    ChatBubbleLeftRightIcon, 
    ClockIcon, 
    ArrowUpRightIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function ContactCTASection() {
    const { storeFormData } = useStoreContext();
    const companyId = storeFormData?.id;
    const { themeSettings, name } = storeFormData || {};
    const primaryColor = themeSettings?.primaryColor || '#C5A267';

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
        const formattedContent = `NEW INQUIRY\n\nName: ${form.fullName}\nEmail: ${form.email}\n\nMessage:\n${form.message}`;

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
        <section id="contact" className="relative py-24 lg:py-48 bg-[#050505] overflow-hidden">
            {/* Background Kinetic Energy */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C5A267]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-12 gap-20 items-center">
                    
                    {/* --- Left Column: Minimalist Content --- */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <SparklesIcon className="w-5 h-5 text-[#C5A267]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C5A267]">Initiate Protocol</span>
                            </div>
                            <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-8">
                                READY TO <br />
                                <span className="font-serif italic font-light text-zinc-600">Ascend?</span>
                            </h2>
                            <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-md">
                                Whether you're seeking a specific ritual or have a bespoke request, our concierge team is standing by.
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {[
                                { label: 'Concierge Hours', value: 'Mon–Sat, 8AM–8PM', icon: ClockIcon },
                                { label: 'Direct Line', value: 'WhatsApp Live Chat', icon: ChatBubbleLeftRightIcon, link: 'https://wa.me/254712345678' },
                                { label: 'Correspondence', value: 'support@ritual.com', icon: EnvelopeIcon },
                            ].map((item, i) => (
                                <motion.a
                                    key={i}
                                    href={item.link || '#'}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 group hover:bg-zinc-800/60 transition-all duration-500"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800 group-hover:bg-[#C5A267] transition-colors duration-500">
                                            <item.icon className="w-6 h-6 text-zinc-400 group-hover:text-black" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-lg font-bold text-white tracking-tight">{item.value}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRightIcon className="w-5 h-5 text-zinc-700 group-hover:text-[#C5A267] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* --- Right Column: The Obsidian Form --- */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="lg:col-span-7"
                    >
                        <div className="relative p-[1px] rounded-[3.5rem] bg-gradient-to-b from-white/10 to-transparent">
                            <div className="bg-[#0A0A0A] rounded-[3.5rem] p-10 md:p-16 relative overflow-hidden">
                                {/* Inner Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A267]/5 blur-[80px]" />
                                
                                <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                id="fullName"
                                                value={form.fullName}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-transparent border-b border-zinc-800 py-4 text-white text-lg placeholder:text-zinc-700 focus:outline-none focus:border-[#C5A267] transition-colors peer"
                                                placeholder=" "
                                            />
                                            <label className="absolute left-0 top-4 text-zinc-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#C5A267] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Your Name</label>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                id="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-transparent border-b border-zinc-800 py-4 text-white text-lg placeholder:text-zinc-700 focus:outline-none focus:border-[#C5A267] transition-colors peer"
                                                placeholder=" "
                                            />
                                            <label className="absolute left-0 top-4 text-zinc-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#C5A267] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Email Address</label>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            id="message"
                                            rows={3}
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent border-b border-zinc-800 py-4 text-white text-lg placeholder:text-zinc-700 focus:outline-none focus:border-[#C5A267] transition-colors peer resize-none"
                                            placeholder=" "
                                        />
                                        <label className="absolute left-0 top-4 text-zinc-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#C5A267] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">How can we elevate your journey?</label>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full py-6 rounded-2xl font-black text-black bg-[#C5A267] flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(197,162,103,0.4)] hover:shadow-[#C5A267]/60 transition-all disabled:opacity-50"
                                    >
                                        <span className="uppercase tracking-widest text-xs">
                                            {isSubmitting ? 'Transmitting...' : 'Send Inquiry'}
                                        </span>
                                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                    </motion.button>

                                    <AnimatePresence>
                                        {submitStatus === 'success' && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute inset-0 bg-[#0A0A0A] z-20 flex flex-col items-center justify-center text-center p-6 rounded-[3.5rem]"
                                            >
                                                <div className="w-20 h-20 bg-[#C5A267]/20 rounded-full flex items-center justify-center mb-6">
                                                    <CheckCircleIcon className="w-10 h-10 text-[#C5A267]" />
                                                </div>
                                                <h3 className="text-3xl font-black text-white mb-2">Received.</h3>
                                                <p className="text-zinc-500">Expect a response within 2 business hours.</p>
                                                <button onClick={() => setSubmitStatus('idle')} className="mt-8 text-[10px] uppercase tracking-widest text-[#C5A267] font-bold">Send another message</button>
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