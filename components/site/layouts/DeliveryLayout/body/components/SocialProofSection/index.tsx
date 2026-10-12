'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    StarIcon, 
    BriefcaseIcon, 
    AcademicCapIcon, 
    BoltIcon, 
    ChartBarIcon, 
    PaperAirplaneIcon, 
    ArrowRightIcon,
    CubeIcon,
    GlobeAltIcon,
    MapPinIcon,
    UsersIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/contexts/EditableContentContext';

// --- 🛠️ Utilities ---
const simpleHexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '247, 148, 29';
};

const getHeroIcon = (index: number) => {
    const icons = [GlobeAltIcon, MapPinIcon, UsersIcon, CheckBadgeIcon, ChartBarIcon];
    return icons[index % icons.length];
};

export default function SocialProofSection() {
    const { storeFormData } = useStoreContext();

    // --- 🧩 Fallback Data ---
    const sampleData = useMemo(() => ({
        stats: [
            { label: "Countrywide Clients", value: "15k", suffix: "+" },
            { label: "Local Distribution Centers", value: "189", suffix: "+" },
            { label: "Expert Personnel", value: "950", suffix: "+" },
            { label: "Delivered Cargo", value: "15k", suffix: "M" },
        ],
        themeSettings: { primary: '#f7941d' },
        sectionTitle: "Always On. Everywhere.",
        sectionSubtitle: "24/7 Global Operations",
        sectionDescription: "Experience the future of distribution with our round-the-clock support and real-time global monitoring systems."
    }), []);

    const {
        stats: rawStats,
        themeSettings,
        sectionSubtitle,
        sectionDescription,
        sectionTitle,
    }: any = storeFormData || sampleData;

    const primaryColor = themeSettings?.primary || '#f7941d';
    const primaryRgb = simpleHexToRgb(primaryColor);

    // Process stats to match the visual pod design
    const processedStats = useMemo(() => {
        const base = rawStats?.length >= 4 ? rawStats : sampleData.stats;
        return base.slice(0, 4);
    }, [rawStats, sampleData.stats]);

    return (
        <section className="relative w-full bg-slate-950 overflow-hidden font-sans">
            
            {/* --- UPPER CTA ZONE (Cinematic Background) --- */}
            <div className="relative min-h-[600px] w-full flex flex-col items-center justify-center text-center px-6 py-24">
                <motion.div 
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <EditableElement
                        targetId="delivery.home.social.bgImage"
                        componentKey="SocialProofSection"
                        elementKey="bgImage"
                        label="Background Image"
                        defaultValue="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        type="image"
                    >
                        {(val) => (
                            <Image decoding="async" 
                                src={val || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                                alt="Logistics Background" 
                                fill
                                className="object-cover opacity-40"
                                priority
                            />
                        )}
                    </EditableElement>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
                </motion.div>

                <div className="relative z-10 space-y-8 max-w-4xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 mb-4"
                        style={{ color: primaryColor }}
                    >
                        <CubeIcon className="w-5 h-5" />
                        <EditableElement
                            targetId="delivery.home.social.subtitle"
                            componentKey="SocialProofSection"
                            elementKey="subtitle"
                            label="Section Subtitle"
                            defaultValue={sectionSubtitle || '24/7 Global Operations'}
                            type="text"
                        >
                            {(val) => (
                                <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                                    {val || sectionSubtitle || '24/7 Global Operations'}
                                </span>
                            )}
                        </EditableElement>
                    </motion.div>

                    <EditableElement
                        targetId="delivery.home.social.title"
                        componentKey="SocialProofSection"
                        elementKey="title"
                        label="Section Title"
                        defaultValue={sectionTitle || "Always On. Everywhere."}
                        type="text"
                    >
                        {(val) => {
                            const rawTitle = val || sectionTitle || "Always On. Everywhere.";
                            const parts = rawTitle.split('.');
                            return (
                                <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] uppercase italic">
                                    {parts[0]}. <br />
                                    <span 
                                        className="text-transparent" 
                                        style={{ WebkitTextStroke: `1.2px white` }}
                                    >
                                        {parts[1] || 'Everywhere.'}
                                    </span>
                                </h2>
                            );
                        }}
                    </EditableElement>
                    
                    <EditableElement
                        targetId="delivery.home.social.description"
                        componentKey="SocialProofSection"
                        elementKey="description"
                        label="Narrative Description"
                        defaultValue={sectionDescription || "Experience the future of distribution with our round-the-clock support and real-time global monitoring systems."}
                        type="textarea"
                    >
                        {(val) => (
                            <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                                {val || sectionDescription}
                            </p>
                        )}
                    </EditableElement>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                        <EditableElement
                            targetId="delivery.home.social.cta1"
                            componentKey="SocialProofSection"
                            elementKey="cta1"
                            label="Primary CTA Text"
                            defaultValue="Get Started"
                            type="text"
                        >
                            {(val) => (
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group h-16 px-10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full flex items-center gap-4 transition-all"
                                    style={{ 
                                        backgroundColor: primaryColor,
                                        boxShadow: `0 0 30px rgba(${primaryRgb}, 0.4)`
                                    }}
                                >
                                    {val || "Get Started"} <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </motion.button>
                            )}
                        </EditableElement>
                        
                        <EditableElement
                            targetId="delivery.home.social.cta2"
                            componentKey="SocialProofSection"
                            elementKey="cta2"
                            label="Secondary CTA Text"
                            defaultValue="Live Support"
                            type="text"
                        >
                            {(val) => (
                                <button className="h-16 px-10 bg-white/5 backdrop-blur-md text-white border border-white/10 font-black text-xs uppercase tracking-[0.2em] rounded-full flex items-center gap-4 hover:bg-white hover:text-black transition-all">
                                    {val || "Live Support"} <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            )}
                        </EditableElement>
                    </div>
                </div>
            </div>

            {/* --- FLOATING STATS PODS --- */}
            <div className="relative z-20 pb-32 -mt-16">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {processedStats.map((stat: any, i: number) => {
                            const Icon = getHeroIcon(i);
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative bg-slate-900/80 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 hover:bg-slate-800"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white group-hover:rotate-[360deg] transition-all duration-700">
                                        <Icon className="w-8 h-8 transition-colors duration-500" style={{ color: primaryColor }} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-baseline justify-center gap-1">
                                            <EditableElement
                                                targetId={`delivery.home.social.stats.${i}.value`}
                                                componentKey="SocialProofSection"
                                                elementKey={`stats.${i}.value`}
                                                label={`Stat ${i + 1} Value`}
                                                defaultValue={stat.value}
                                                type="text"
                                            >
                                                {(val) => (
                                                    <h3 className="text-5xl font-black text-white italic tracking-tighter">
                                                        {val || stat.value}
                                                    </h3>
                                                )}
                                            </EditableElement>
                                            <EditableElement
                                                targetId={`delivery.home.social.stats.${i}.suffix`}
                                                componentKey="SocialProofSection"
                                                elementKey={`stats.${i}.suffix`}
                                                label={`Stat ${i + 1} Suffix`}
                                                defaultValue={stat.suffix || '+'}
                                                type="text"
                                            >
                                                {(val) => (
                                                    <span className="text-2xl font-black" style={{ color: primaryColor }}>
                                                        {val || stat.suffix || '+'}
                                                    </span>
                                                )}
                                            </EditableElement>
                                        </div>
                                        <EditableElement
                                            targetId={`delivery.home.social.stats.${i}.label`}
                                            componentKey="SocialProofSection"
                                            elementKey={`stats.${i}.label`}
                                            label={`Stat ${i + 1} Label`}
                                            defaultValue={stat.label}
                                            type="text"
                                        >
                                            {(val) => (
                                                <p className="text-[10px] font-black text-slate-400 group-hover:text-white/80 uppercase tracking-[0.2em]">
                                                    {val || stat.label}
                                                </p>
                                            )}
                                        </EditableElement>
                                    </div>

                                    {/* Decorative Bottom Glow */}
                                    <div 
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}