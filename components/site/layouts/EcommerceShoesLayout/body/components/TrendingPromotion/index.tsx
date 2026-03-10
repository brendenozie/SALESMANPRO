'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon, BoltIcon } from '@heroicons/react/24/solid';

interface TrendingProps {
  promotions?: any;
  themeSettings?: any;
}

const dummyTrendingProduct = {
    title: 'THE RUSH V.2',
    description: 'Engineered for speed and urban performance. Experience feather-light comfort and unparalleled energy return. Your new personal best starts now.',
    ctaText: 'Shop The Rush',
    ctaLink: '/products',
    bannerUrl: "https://images.unsplash.com/photo-1543163521-1bf537d8a1e8?auto=format&fit=crop&w=800&q=80",
    accentColor: '#FF5733', 
};

export default function TrendingPromotion({ promotions, themeSettings }: TrendingProps) {
    const product = promotions?.[2] || dummyTrendingProduct;
    const primaryColor = themeSettings?.primaryColor || product.accentColor || '#ef4444';
    
    // Parallax effect for the background text
    const { scrollYProgress } = useScroll();
    const xMove = useTransform(scrollYProgress, [0, 1], [0, -200]);

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-black py-20">
            {/* --- Kinetic Background Text --- */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden whitespace-nowrap flex items-center">
                <motion.h2 
                    style={{ x: xMove, WebkitTextStroke: `2px ${primaryColor}20` }}
                    className="text-[25vw] font-black uppercase leading-none opacity-10 dark:opacity-20 text-transparent"
                >
                    {product.title.split(' ')[0]} {product.title.split(' ')[0]}
                </motion.h2>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
                {/* --- Left side: Image with dynamic hover --- */}
                <motion.div
                    variants={itemVariants}
                    className="relative order-2 lg:order-1 flex justify-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-transparent group-hover:from-primary/10 transition-all duration-500 rounded-full blur-3xl" />
                    <motion.img
                        src={product.bannerUrl}
                        alt={product.title}
                        whileHover={{ rotate: 0, scale: 1.1, y: -20 }}
                        initial={{ rotate: -12 }}
                        className="w-full max-w-[500px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_35px_35px_rgba(255,255,255,0.05)] cursor-crosshair transition-all duration-700 ease-out"
                    />
                </motion.div>

                {/* --- Right side: Content --- */}
                <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
                        <span 
                            className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2"
                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        >
                            <BoltIcon className="w-4 h-4 animate-pulse" />
                            Trending Now
                        </span>
                    </motion.div>

                    <motion.h1 
                        variants={itemVariants}
                        className="text-6xl md:text-9xl font-black mb-8 leading-[0.85] tracking-tighter text-gray-900 dark:text-white uppercase italic"
                    >
                        {product.title.split(' ').map((word: string, i: number) => (
                            <span key={i} className="block last:text-transparent last:stroke-current" style={{ WebkitTextStroke: i === 1 ? `2px currentColor` : 'none' }}>
                                {word}
                            </span>
                        ))}
                    </motion.h1>
                    
                    <motion.p 
                        variants={itemVariants}
                        className="text-lg md:text-xl text-gray-500 dark:text-zinc-400 max-w-md mb-10 font-medium leading-relaxed"
                    >
                        {product.description}
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <Link href={product.ctaLink}>
                            <button
                                className="group relative inline-flex items-center justify-center text-white font-black text-lg py-5 px-12 rounded-2xl transition-all duration-500 hover:shadow-[0_0_40px_-10px] overflow-hidden"
                                style={{ 
                                  backgroundColor: primaryColor,
                                  boxShadow: `0 20px 40px -15px ${primaryColor}60`
                                }}
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {product.ctaText}
                                    <ArrowRightIcon className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
                                </span>
                                {/* Hover Gloss Effect */}
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}