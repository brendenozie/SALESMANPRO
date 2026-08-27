"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRightIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    GlobeAltIcon,
    SparklesIcon,
    ScissorsIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const defaultBenefits = [
    {
        title: 'Master Artistry',
        description: 'Every barber in our chair has been vetted through a rigorous 50-point technical assessment.',
        Icon: ScissorsIcon,
    },
    {
        title: 'Premium Privacy',
        description: 'Our studio is designed for discretion, offering a sanctuary away from the city noise.',
        Icon: ShieldCheckIcon,
    },
    {
        title: 'Global Influence',
        description: 'Blending traditional London techniques with modern West Coast street style.',
        Icon: GlobeAltIcon,
    },
];

export default function AboutAndBenefitsSection({ name, description, bannerUrl }: any) {
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#C5A267';
    const sectionRef = useRef(null);
    
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
    const textY = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <section ref={sectionRef} className="relative py-24 lg:py-48 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden text-zinc-900 dark:text-white">
            
            {/* Background Texture - Adapts to Theme */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none grayscale">
                <div className="grid grid-cols-6 gap-20 transform -rotate-12 scale-150">
                    {[...Array(24)].map((_, i) => (
                        <ScissorsIcon key={i} className="w-20 h-20" />
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32">
                    <div className="max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <div className="h-px w-12" style={{ backgroundColor: primaryColor }} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: primaryColor }}>The Origin Story</span>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
                        >
                            MORE THAN A <br />
                            <span className="font-serif italic font-light text-zinc-300 dark:text-zinc-700">Service.</span>
                        </motion.h2>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="lg:max-w-md pb-2"
                    >
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium leading-relaxed">
                            {description || `At ${name || 'The Studio'}, we believe grooming is a ritual, not a chore. We’ve spent a decade refining the balance between heritage techniques and modern comfort.`}
                        </p>
                    </motion.div>
                </div>

                {/* --- INTERACTIVE VISUAL CANVAS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-40">
                    
                    <div className="lg:col-span-7 relative group">
                        <div className="relative aspect-[4/5] md:aspect-video rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-2xl">
                            <motion.div style={{ scale: imgScale }} className="h-full w-full">
                                <Image
                                    src={bannerUrl || "https://images.unsplash.com/photo-1593702275677-f916c8c7c342?q=80&w=2070"}
                                    loader={loader}
                                    alt="The Craft"
                                    fill
                                    className="object-cover opacity-90 dark:opacity-70 grayscale group-hover:grayscale-0 transition-all duration-1000"
                                />
                            </motion.div>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 dark:from-black via-transparent to-black/10 dark:to-black/20" />
                            
                            {/* Floating "Established" Badge */}
                            <div className="absolute top-10 left-10 p-6 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl">
                                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: primaryColor }}>Established</p>
                                <p className="text-2xl font-black text-zinc-900 dark:text-white">MMXXII</p>
                            </div>
                        </div>

                        {/* Floating Experience Card */}
                        <motion.div 
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            className="absolute -bottom-12 -right-4 md:right-12 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hidden md:block border border-zinc-100 dark:border-zinc-800"
                        >
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                            <Image src={`https://i.pravatar.cc/100?img=${i+20}`} alt="client" width={48} height={48} loader={loader}/>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => <SparklesIcon key={i} className="w-3 h-3" style={{ color: primaryColor }} />)}
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">The standard for</p>
                                    <p className="text-xl font-black text-zinc-900 dark:text-white leading-tight">5,000+ Gentlemen</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: The Commitment */}
                    <motion.div className="lg:col-span-5 space-y-12" style={{ y: textY }}>
                        <div className="space-y-6">
                            <h3 className="text-4xl font-black tracking-tighter uppercase">
                                BUILT ON <br />
                                <span style={{ color: primaryColor }}>UNCOMPROMISING</span> QUALITY.
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-lg font-light">
                                We meticulously vet every artisan and curate every product. Whether it’s our house-label beard oils or our scythe-sharp straight razors, we never settle for "good enough."
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: ShieldCheckIcon, label: 'Secure Booking Vault' },
                                { icon: UserGroupIcon, label: 'Top 1% Master Barbers' },
                                { icon: SparklesIcon, label: 'Bespoke Consultations' },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 flex items-center justify-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors" style={{ '--hover-color': primaryColor } as any}>
                                        <badge.icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">{badge.label}</span>
                                </div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ x: 10 }}
                            className="group flex items-center gap-6 py-6 px-10 rounded-full font-black text-white dark:text-black shadow-2xl transition-all"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Experience The Ritual
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </motion.button>
                    </motion.div>
                </div>

                {/* --- BENEFITS BENTO --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {defaultBenefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-12 rounded-[3rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 hover:shadow-xl dark:hover:border-white/20 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: primaryColor }} />
                            
                            <div className="w-16 h-16 rounded-2xl mb-10 flex items-center justify-center bg-white dark:bg-black border border-zinc-200 dark:border-white/10 group-hover:text-white transition-all duration-500" style={{ '--hover-bg': primaryColor } as any}>
                                <style jsx>{`
                                    .group:hover .icon-box { background-color: ${primaryColor}; border-color: ${primaryColor}; }
                                `}</style>
                                <benefit.Icon className="w-8 h-8 icon-box-svg transition-colors duration-500" style={{ color: primaryColor }} />
                                <style jsx>{`
                                    .group:hover .icon-box-svg { color: #fff; }
                                    :global(.dark) .group:hover .icon-box-svg { color: #000; }
                                `}</style>
                            </div>
                            
                            <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                {benefit.title}
                            </h4>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm leading-relaxed group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                                {benefit.description}
                            </p>
                            
                            <div className="mt-10 h-px w-12 bg-zinc-200 dark:bg-zinc-800 group-hover:w-full transition-all duration-700" style={{ backgroundColor: i % 2 === 0 ? primaryColor : undefined }} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}