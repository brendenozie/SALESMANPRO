'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, BriefcaseIcon, AcademicCapIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
// -------------------------------------------------------------------

// --- 🛠️ Assumed Utility (Used for dynamic styling) ---
const simpleHexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '234, 88, 12'; // Default to orange-600 RGB
};
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    src; // Placeholder for Image loader
// ----------------------------------------------------

// Utility function for the logo scroll animation
const Marquee = ({ children, primaryColor }: { children: React.ReactNode, primaryColor: string }) => (
    <div className="relative w-full overflow-hidden whitespace-nowrap py-4 sm:py-6 border-y border-gray-100 bg-white shadow-inner">
        <motion.div
            className="inline-flex w-fit"
            animate={{
                x: ['0%', '-100%'],
                transition: {
                    x: {
                        duration: 30, // Speed of the scroll
                        ease: 'linear',
                        repeat: Infinity,
                        repeatType: 'loop',
                    },
                },
            }}
        >
            {children}
            {children} {/* Duplicate children for seamless loop */}
        </motion.div>
        {/* Fade out edges for better visual effect */}
        <div className="absolute inset-y-0 left-0 w-1/6 sm:w-1/12 bg-gradient-to-r from-white/90 to-transparent pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-1/6 sm:w-1/12 bg-gradient-to-l from-white/90 to-transparent pointer-events-none"></div>
    </div>
);

// Map stats to an icon for visual aid
const getStatIcon = (index: number, primaryColor: string) => {
    const icons = [
        <StarIcon key="star" className="w-6 h-6" style={{ color: primaryColor }} />,
        <BriefcaseIcon key="briefcase" className="w-6 h-6" style={{ color: primaryColor }} />,
        <AcademicCapIcon key="cap" className="w-6 h-6" style={{ color: primaryColor }} />,
        <BoltIcon key="bolt" className="w-6 h-6" style={{ color: primaryColor }} />,
        <ChartBarIcon key="chart" className="w-6 h-6" style={{ color: primaryColor }} />,
    ];
    return icons[index % icons.length];
};

export default function App() { // Renamed to App for single file export
    const { storeFormData } = useStoreContext();

    // --- 🧩 Sample fallback data ---
    const sampleData = useMemo(
        () => ({
            partnerLogos: [
                { src: 'https://placehold.co/160x40/ffffff/000000?text=Logo+A', alt: 'Logo A' },
                { src: 'https://placehold.co/160x40/ffffff/000000?text=Logo+B', alt: 'Logo B' },
                { src: 'https://placehold.co/160x40/ffffff/000000?text=Logo+C', alt: 'Logo C' },
                { src: 'https://placehold.co/160x40/ffffff/000000?text=Logo+D', alt: 'Logo D' },
                { src: 'https://placehold.co/160x40/ffffff/000000?text=Logo+E', alt: 'Logo E' },
                { src: 'https://placehold.co/160x40/ffffff/000000?text=Logo+A', alt: 'Logo A' },
                { src: 'https://placehold.co/160x40/ffffff/000000?text=Logo+B', alt: 'Logo B' },
            ],
            stats: [
                { label: 'Clients Coached', value: 10000 },
                { label: 'Talks Delivered', value: 50 },
                { label: 'Years of Experience', value: 15 },
            ],
            themeSettings: {
                primary: '#EA580C', // orange-600
            },
        }),
        []
    );

    // --- ✅ Merge with real data ---
    const {
        partnerLogos = sampleData.partnerLogos,
        stats: rawStats = sampleData.stats,
        awards,
        metrics,
        themeSettings = sampleData.themeSettings,
        sectionSubtitle,
        sectionDescription,
        sectionTitle,
    }: any = storeFormData || sampleData;

    // --- 🧠 Ensure at least 3 stats logic ---
    const stats = useMemo(() => {
        let filledStats = (rawStats || []).map((stat: any, i: number) => ({
            label: stat.label ?? `Stat ${i + 1}`,
            value: typeof stat.value === 'number' ? stat.value : Number(stat.value) || 0,
        }));

        if (filledStats.length < 3) {
            const awardFallbacks = (awards || [])
                .slice(0, 3 - filledStats.length)
                .map((a: { title: string; year: number }, i: number) => ({
                    label: a.title || `Award ${i + 1}`,
                    value: 'year' in a && typeof a.year === 'number' ? a.year : new Date().getFullYear(),
                }));

            const metricFallbacks = (metrics || [])
                .slice(0, 3 - (filledStats.length + awardFallbacks.length))
                .map((m: { name: string; value: number }, i: number) => ({
                    label: typeof m === 'object' && 'name' in m && typeof m.name === 'string' ? m.name : `Metric ${i + 1}`,
                    value: typeof m.value === 'number' ? m.value : Number(m.value) || Math.floor(Math.random() * 1000),
                }));

            filledStats = [...filledStats, ...awardFallbacks, ...metricFallbacks];
        }

        if (filledStats.length < 3) {
            const placeholders = Array.from({ length: 3 - filledStats.length }).map((_, i) => ({
                label: `Sample Stat ${i + 1}`,
                value: Math.floor(Math.random() * 1000),
            }));
            filledStats = [...filledStats, ...placeholders];
        }

        return filledStats.slice(0, 3);
    }, [rawStats, awards, metrics]);


    const primaryColor = themeSettings?.primary || '#EA580C';
    const primaryRgb = simpleHexToRgb(primaryColor);

    // --- ✂️ Section Title Split Logic ---
    const titleWords = (sectionTitle || 'Empowering Success Through Proven Expertise').split(' ');
    const lastTwo = titleWords.slice(-2).join(' ');
    const firstPart = titleWords.slice(0, -2).join(' ');



    // --- 💎 UI ---
    return (
        <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 bg-gray-50 overflow-hidden font-sans">
            {/* Background Layer with Subtle Grain/Noise Effect */}
            <div className="absolute inset-0 bg-white/50 [mask-image:linear-gradient(to_bottom,transparent_0%,white_15%,white_85%,transparent_100%)]">
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
                {/* Main Heading and Intro */}
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
                    <span
                        className="inline-block uppercase font-bold tracking-widest text-xs mb-3"
                        style={{ color: primaryColor }}
                    >
                        {sectionSubtitle || 'Trusted Worldwide'}
                    </span>
                    <motion.h2
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        { 
                            <>
                                {firstPart}{" "} <span style={{ color: primaryColor }}>{lastTwo}</span>
                            </>
                        }
                    </motion.h2>

                    <motion.p
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        {sectionDescription || 'Join thousands of satisfied clients who have transformed their businesses and lives with our expert coaching and consulting services.'}
                    </motion.p>
                </div>

                {/* 2. Marquee / Marquess Section (Logos, always above metrics) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="w-full relative z-20"
                >
                    <p className="text-xs font-semibold text-gray-400 mb-3 text-center uppercase tracking-widest">Featured in & Trusted by</p>
                    <Marquee primaryColor={primaryColor}>
                        {partnerLogos.map((logo: { src: string; alt: string }, idx: number) => (
                            <div
                                key={idx}
                                className="inline-flex flex-shrink-0 items-center justify-center w-32 sm:w-40 mx-3 sm:mx-6" // Adjusted width and margin for mobile
                            >
                                <Image
                                    src={logo.src || "https://placehold.co/160x40/ffffff/000000?text=No+Logo"}
                                    alt={logo.alt}
                                    width={160}
                                    height={80}
                                    loader={loader}
                                    className="h-7 sm:h-9 w-auto opacity-30 hover:opacity-100 transition-opacity duration-500"
                                    style={{ filter: 'grayscale(100%) brightness(0.1)' }} // Darker grayscale for cleaner look
                                />
                            </div>
                        ))}
                    </Marquee>
                </motion.div>
            </div>
            
            {/* 3. Impact Metrics Grid (Always below Marquess) */}
            {/* CORRECTED: Removed negative margin and added positive margin (mt-10 sm:mt-16) for clear separation */}
            <div className="relative z-30 container mx-auto px-4 sm:px-6 max-w-7xl mt-10 sm:mt-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    transition={{ staggerChildren: 0.1 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    {stats.map((stat: { label: string; value: number }, i: number) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 50 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
                            }}
                            className="p-6 sm:p-8 rounded-2xl bg-white shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border-t-4" // Increased border size
                            style={{
                                // Dynamic background gradient based on primary color
                                background: `radial-gradient(circle at 10% 10%, rgba(${primaryRgb}, 0.05), rgba(255, 255, 255, 1) 50%)`,
                                borderColor: primaryColor, // Use border-t-2 with the primary color
                            }}
                        >
                            <div className="flex items-center mb-4">
                                <div className="p-2 mr-3 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor + '1A' }}> {/* Light tint of primary color */}
                                    {getStatIcon(i, primaryColor)}
                                </div>
                                <p className="text-gray-900 text-sm font-bold uppercase tracking-widest truncate">
                                    {stat.label}
                                </p>
                            </div>
                            <h4 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-none">
                                {Number(stat.value).toLocaleString()}
                                <span className="text-2xl sm:text-3xl ml-1 align-top" style={{ color: primaryColor }}>
                                    {/* Add appropriate suffix based on the stat */}
                                    {i === 0 ? '+' : i === 1 ? 'K+' : ''}
                                </span>
                            </h4>
                            <p className="mt-4 text-sm sm:text-base text-gray-600">
                                {i === 0 && 'Successfully guided teams and individuals to achieve their peak performance goals.'}
                                {i === 1 && 'Representing the global audience reached through keynotes, workshops, and viral content.'}
                                {i === 2 && 'Dedicated to providing high-level, transformative coaching and consulting services.'}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
