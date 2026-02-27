'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    CheckCircleIcon,
    SparklesIcon,
    StarIcon,
    HandThumbUpIcon,
    TagIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const defaultBenefits = [
    {
        title: 'Effortless Booking',
        description: 'A seamless, intuitive process that gets you scheduled in just a few clicks.',
        Icon: CheckCircleIcon,
    },
    {
        title: 'Unmatched Quality',
        description: 'Our certified professionals are dedicated to delivering excellence every time.',
        Icon: HandThumbUpIcon, 
    },
    {
        title: 'Transparent Pricing',
        description: 'No hidden fees, no surprises. What you see is exactly what you pay.',
        Icon: TagIcon, 
    },
];

interface AboutAndBenefitsSectionProps {
    name?: string | undefined | null;
    description?: string | undefined | null;
    bannerUrl?: string | undefined | null;
    themeSettings?: {
        primaryColor?: string;
        secondaryColor?: string;
    } | null;
    promotions?: any[]; 
}

export default function AboutAndBenefitsSection({ name, description, bannerUrl, themeSettings, promotions }: AboutAndBenefitsSectionProps) {
    const primaryColor = themeSettings?.primaryColor || '#059669';
    const secondaryColor = themeSettings?.secondaryColor || '#FBBF24';
    
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
    
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const yLeft = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const yRight = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

    const brandBenefits = (promotions?.[0]?.perks?.length > 0
        ? promotions?.[0].perks.map((perk: any) => ({
              title: perk.label,
              description: perk.description || '',
              Icon: StarIcon,
          }))
        : defaultBenefits).slice(0, 3);

    return (
        <section ref={sectionRef} className="relative py-24 lg:py-40 overflow-hidden bg-white">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-24 mt-24 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-24 mb-24 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ backgroundColor: primaryColor + '20' }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* --- 1. Header Logic --- */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-24">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="max-w-2xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-px w-8" style={{ backgroundColor: primaryColor }} />
                            <span className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
                                Discover Our Essence
                            </span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.95]">
                            The <span className="italic font-serif font-light text-slate-400">new standard</span> in {name || 'SwiftServe'}.
                        </h2>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="lg:max-w-md"
                    >
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            {description || 'We are redefining the intersection of professional excellence and digital convenience.'}
                        </p>
                    </motion.div>
                </div>

                {/* --- 2. Interactive Split Visual --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">
                    
                    {/* Left: Image Canvas */}
                    <motion.div className="lg:col-span-7 relative" style={{ y: yLeft }}>
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
                            <Image
                                src={bannerUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"}
                                loader={loader}
                                alt="Redefining Service"
                                width={1200}
                                height={1600}
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                        </div>

                        {/* Floating Experience Card */}
                        <motion.div 
                            style={{ rotate }}
                            className="absolute -bottom-10 -right-6 md:right-12 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 hidden md:block"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                            <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" width={40} height={40} loader={loader}/>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Join over</p>
                                    <p className="text-xl font-black text-slate-900">12k+ Members</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Narrative & Trust Indicators */}
                    <motion.div className="lg:col-span-5 space-y-10" style={{ y: yRight }}>
                        <div className="space-y-6">
                            <h3 className="text-3xl font-black text-slate-900">
                                Built on <span className="underline decoration-4 underline-offset-4" style={{ textDecorationColor: secondaryColor }}>Integrity</span>.
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                We meticulously vet every professional and streamline every step of the booking process, ensuring your satisfaction is always our top priority. We're more than a service platform; we're your partner in efficiency.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: ShieldCheckIcon, label: 'Secure Payments' },
                                { icon: UserGroupIcon, label: 'Top 1% Talent' },
                                { icon: GlobeAltIcon, label: 'Global Standards' },
                                { icon: SparklesIcon, label: 'Elite Quality' },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <badge.icon className="w-5 h-5" style={{ color: primaryColor }} />
                                    <span className="text-sm font-bold text-slate-700">{badge.label}</span>
                                </div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ x: 10 }}
                            className="flex items-center gap-4 py-4 px-8 rounded-full font-black text-white shadow-xl transition-all"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Get Started Now
                            <ArrowRightIcon className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                </div>

                {/* --- 3. Benefits Bento Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {brandBenefits.map((benefit: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-white transition-all duration-500 border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50"
                        >
                            <div className="w-14 h-14 rounded-2xl mb-8 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12" style={{ backgroundColor: `${primaryColor}10` }}>
                                <benefit.Icon className="w-7 h-7" style={{ color: primaryColor }} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 mb-4">{benefit.title}</h4>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">{benefit.description}</p>
                            
                            <div className="mt-8 h-1 w-12 rounded-full bg-slate-200 group-hover:w-full transition-all duration-700" style={{ backgroundColor: `${primaryColor}40` }} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}