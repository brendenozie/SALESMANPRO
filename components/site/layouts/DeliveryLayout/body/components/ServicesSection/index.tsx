'use client';

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  CubeIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon,
  TruckIcon,
  GlobeAmericasIcon,
  ArrowPathRoundedSquareIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
  BoltIcon,
  LightBulbIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- Dynamic Icon Map for Heroicons ---
const dynamicHeroIconMap: Record<string, React.ElementType> = {
    // Logistics / Industrial
    'Transport': TruckIcon,
    'Logistics': GlobeAmericasIcon,
    'Waste Management': ArrowPathRoundedSquareIcon,
    // Consulting / Coaching
    'Executive Coaching': BriefcaseIcon,
    'Professional Speakers Course': AcademicCapIcon,
    'Corporate Package': UserGroupIcon,
    'Leadership Development Program': BoltIcon,
    'Foundational Speakers Course': LightBulbIcon,
    'Service': SparklesIcon,
};

const iconAccents = [
    'bg-orange-500',
    'bg-blue-600',
    'bg-slate-950',
    'bg-emerald-600',
    'bg-purple-600',
    'bg-rose-600',
];

const SERVICE_IMAGES = [
    "/pexels-aboodi-29584217.jpg",
    "/pexels-shantumsingh-29057942.jpg",
    "/pexels-messina-12492225.jpg",
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

export default function ServicesGrid({storeFormData}: {storeFormData: any}) {
    
    const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f7941d";

    // --- Data Logic: Filtering Categories/Subcategories ---
    const { StoreCategory = [], category = "" } = storeFormData || {};
    const categoryText = category.toLowerCase().trim();
    const consultingKeywords = ['consultant', 'consulting', 'coach', 'coaching', 'speaker', 'training'];
    const isConsultingRelated = consultingKeywords.some(kw => categoryText.includes(kw));

    let offeringsToShow = [];
    if (StoreCategory.length > 0) {
        // Dynamic mapping based on context logic provided in original section
        offeringsToShow = StoreCategory.flatMap(cat => 
            (cat.subcategories || [{ name: cat.displayName, id: cat.id }]).map(sub => ({
                title: sub.name,
                desc: `Specialized ${sub.name} solutions tailored for ${storeFormData?.name || 'your business'}.`,
                icon: dynamicHeroIconMap[sub.name] || CubeIcon,
                image: cat.image,
                tag: cat.displayName
            }))
        ).slice(0, 6);
    } else {
        // Fallback for Logistics/Default
        offeringsToShow = [
            { title: "Transport", desc: "Efficient and reliable urban transport solutions tailored to your needs.", icon: TruckIcon, image: SERVICE_IMAGES[0], tag: "Ground" },
            { title: "Logistics", desc: "Comprehensive logistics services ensuring timely and secure delivery.", icon: GlobeAmericasIcon, image: SERVICE_IMAGES[1], tag: "Global" },
            { title: "Waste Management", desc: "Innovative solutions promoting sustainability and responsibility.", icon: ArrowPathRoundedSquareIcon, image: SERVICE_IMAGES[2], tag: "Eco" },
        ];
    }

    return (
        <section id="services" className="py-24 lg:py-40 bg-white relative overflow-hidden">
            {/* Background Architectural Grid */}
            <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />
            
            <div className="container mx-auto px-6 relative z-10">
                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-10">
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-full"
                        >
                            <CubeIcon className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Core Competencies</span>
                        </motion.div>
                        
                        <h2 className="text-6xl md:text-8xl font-black text-slate-950 leading-[0.85] uppercase italic">
                            Specialist <br />
                            <span className="text-transparent" style={{ WebkitTextStroke: '2px #0f172a' }}>Solutions</span>
                        </h2>
                    </div>
                    
                    <div className="max-w-md space-y-4">
                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest" style={{ color: primaryColor }}>
                            <ShieldCheckIcon className="w-4 h-4" /> Secure • Fast • Reliable
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {storeFormData?.description || "Tailored infrastructure designed to bypass traditional bottlenecks and deliver your vision on a set budget."}
                        </p>
                    </div>
                </div>

                {/* --- SERVICE CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
                    {offeringsToShow.map((service, idx) => {
                        const Icon = service.icon;
                        return (
                            <Link href={`/logistics/products?category=${service.title.toLowerCase().replace(/\s+/g, '-')}`} className="group" key={idx}>
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.15, duration: 0.8 }}
                                    className="group relative"
                                >
                                    {/* Image Frame */}
                                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-2xl">
                                        <Image
                                            src={service.image || SERVICE_IMAGES[idx % SERVICE_IMAGES.length]}
                                            alt={service.title}
                                            loader={loader}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                                        
                                        {/* Floating Service Tag */}
                                        <div className="absolute top-8 left-8">
                                            <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                                                {service.tag}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Card Overlay */}
                                    <div className="absolute -bottom-12 left-6 right-6 p-8 bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-50 transition-all duration-500 group-hover:-translate-y-4">
                                        {/* Dynamic Icon Badge */}
                                        <div 
                                            className={`absolute -top-10 right-10 w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transform rotate-6 group-hover:rotate-0 transition-all duration-500 ${iconAccents[idx % iconAccents.length]}`}
                                        >
                                            <Icon className="w-10 h-10" />
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-3xl font-black text-slate-950 uppercase italic leading-none">
                                                {service.title}
                                            </h3>
                                            
                                            <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-2">
                                                {service.desc}
                                            </p>

                                            <div className="pt-4 flex items-center justify-between group/btn cursor-pointer">
                                                <span 
                                                    className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 transition-colors"
                                                    style={{ color: primaryColor }}
                                                >
                                                    Configure Route
                                                </span>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover/btn:bg-slate-950 group-hover/btn:text-white transition-all">
                                                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Ghost Numbering */}
                                    <span className="absolute -top-10 -right-4 text-9xl font-black text-slate-950/[0.03] select-none pointer-events-none uppercase italic">
                                        0{idx + 1}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* --- BOTTOM CTA --- */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-40 text-center"
                >
                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.5em] mb-6">Need a custom enterprise solution?</p>
                    <button 
                        onClick={() => window.location.href = '#booking'} // Assuming there's a contact section with this ID
                        className="px-12 py-6 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-slate-950 transition-all shadow-xl"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Request Custom Quote
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

