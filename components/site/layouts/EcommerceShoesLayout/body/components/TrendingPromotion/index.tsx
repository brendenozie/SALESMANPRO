import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TrendingProps {
  promotions?: any;
  themeSettings?: any;
}

// Dummy data for a trending shoe/product
const dummyTrendingProduct = {
    title: 'THE RUSH V.2',
    description: 'Engineered for speed and urban performance. Experience feather-light comfort and unparalleled energy return. Your new personal best starts now.',
    ctaText: 'Shop The Rush',
    ctaLink: '/trending/rush',
    bannerUrl: "https://images.unsplash.com/photo-1543163521-1bf537d8a1e8?auto=format&fit=crop&w=800&q=80", // A dynamic, fast-looking sneaker image
    bgColor: '#FF5733', // Vibrant Accent Color (e.g., Orange/Red)
    textColor: '#1f2937', // Dark contrast text
};

const defaultProduct = dummyTrendingProduct; // Using dummy data as the structure guide

// Custom animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
        staggerChildren: 0.1,
        when: "beforeChildren" 
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.17, 0.55, 0.55, 1] } }, // Custom ease for bounce/snap
};


export default function TrendingPromotion({ promotions, themeSettings }: TrendingProps) {
    
    // Use the third promotion item or fallback data
    const product = promotions?.[2] || defaultProduct;
    
    // Theme colors
    const bgColor = product.bgColor || themeSettings?.primaryColor || '#F7F7F7';
    const accentColor = product.themeSecondary || '#FF5733';
    const textColor = product.textColor || '#1f2937';


    return (
        <div className="min-h-[80vh] bg-white dark:bg-zinc-900 font-sans flex items-center justify-center p-4 lg:p-8">
            <motion.section 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between p-8 relative rounded-[2rem] shadow-4xl overflow-hidden border border-gray-100"
                // style={{ backgroundColor: bgColor }}
            >
                
                {/* --- Background Kinetic Title (Captivating & Engaging) --- */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-10 dark:opacity-5"
                    style={{ color: accentColor }}
                >
                    <motion.h2 
                        initial={{ scale: 1.1, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
                        className="text-[15vw] font-black uppercase leading-none transform -rotate-2"
                        style={{ WebkitTextStroke: `1px ${accentColor}` }}
                    >
                        {product.title.split(' ')[0]}
                    </motion.h2>
                </div>


                {/* --- Left side with the image (Visually Appealing) --- */}
                <motion.div
                    variants={itemVariants}
                    className="w-full lg:w-1/2 flex justify-center items-center mb-12 lg:mb-0 relative z-10"
                >
                    <img
                        src={product.bannerUrl}
                        alt={product.title}
                        // Aggressive positioning and hover for dynamic feel
                        className={`w-full max-w-lg transform -rotate-12 transition-all duration-700 ease-out hover:rotate-3 hover:scale-[1.3] drop-shadow-2xl`}
                        style={{ maxWidth: '400px' }}
                    />
                </motion.div>

                {/* --- Right side with text and CTA (Intuitive) --- */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left p-4 relative z-10">
                    
                    <motion.div variants={itemVariants} className="mb-4">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                            🔥 {product.title.split(' ')[0]}
                        </span>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-6">
                        <h1 className="text-5xl md:text-8xl font-black mb-4 leading-none tracking-tighter" style={{ color: textColor }}>
                            {product.title}
                        </h1>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="mb-8 max-w-md">
                        <p className="text-lg md:text-xl font-medium" style={{ color: textColor }}>
                            {product.description}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Link href={product.ctaLink} passHref>
                            <button
                                className="inline-flex items-center text-white font-bold text-lg md:text-xl py-4 px-10 rounded-full shadow-lg transition-all duration-300 transform hover:scale-[1.05] hover:shadow-xl"
                                style={{ backgroundColor: accentColor }}
                            >
                                {product.ctaText}
                                <svg className="w-6 h-6 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}