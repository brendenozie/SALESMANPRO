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

import { EditableElement } from "@/contexts/EditableContentContext";

export interface ServicesSectionProps {
    storeFormData?: any;
    config?: any;
    sectionId?: string;
}

export default function ServicesGrid({ storeFormData, config, sectionId }: ServicesSectionProps) {
    
    const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f7941d";
    const sId = sectionId || "services";

    // --- Data Logic: Filtering Categories/Subcategories or Tenant Services ---
    const { StoreCategory = [] } = storeFormData || {};

    const defaultServices = [
        { title: "Transport", desc: "Efficient and reliable urban transport solutions tailored to your needs.", icon: TruckIcon, image: SERVICE_IMAGES[0], tag: "Ground" },
        { title: "Logistics", desc: "Comprehensive logistics services ensuring timely and secure delivery.", icon: GlobeAmericasIcon, image: SERVICE_IMAGES[1], tag: "Global" },
        { title: "Waste Management", desc: "Innovative solutions promoting sustainability and responsibility.", icon: ArrowPathRoundedSquareIcon, image: SERVICE_IMAGES[2], tag: "Eco" },
    ];

    let baseOfferings: any[] = [];
    if (Array.isArray(config?.services) && config.services.length > 0) {
        baseOfferings = config.services.map((svc: any, idx: number) => {
            const fallback = defaultServices[idx % defaultServices.length];
            return {
                title: svc.title ?? fallback.title,
                desc: svc.desc ?? svc.description ?? fallback.desc,
                icon: svc.icon ? (dynamicHeroIconMap[svc.title] || CubeIcon) : fallback.icon,
                image: svc.image || fallback.image,
                tag: svc.tag || fallback.tag,
            };
        });
    } else if (StoreCategory.length > 0) {
        baseOfferings = StoreCategory.flatMap((cat: any) => 
            (cat.subcategories || [{ name: cat.displayName, id: cat.id }]).map((sub: any) => ({
                title: sub.name,
                desc: `Specialized ${sub.name} solutions tailored for ${storeFormData?.name || 'your business'}.`,
                icon: dynamicHeroIconMap[sub.name] || CubeIcon,
                image: cat.image,
                tag: cat.displayName
            }))
        ).slice(0, 6);
    } else {
        baseOfferings = defaultServices;
    }

    const badgeText = config?.badge || "Core Competencies";
    const sectionTitle = config?.title || "Specialist Solutions";
    const sublineText = config?.subline || "Secure • Fast • Reliable";
    const descriptionText = config?.description || storeFormData?.description || "Tailored infrastructure designed to bypass traditional bottlenecks and deliver your vision on a set budget.";

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
                            <EditableElement
                                targetId={`delivery.home.${sId}.ServicesSection.badge`}
                                componentKey="ServicesSection"
                                elementKey="badge"
                                label="Badge Text"
                                defaultValue={badgeText}
                                type="text"
                            >
                                {(val) => (
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                                        {val !== undefined && val !== null ? val : badgeText}
                                    </span>
                                )}
                            </EditableElement>
                        </motion.div>
                        
                        <EditableElement
                            targetId={`delivery.home.${sId}.ServicesSection.title`}
                            componentKey="ServicesSection"
                            elementKey="title"
                            label="Section Title"
                            defaultValue={sectionTitle}
                            type="text"
                        >
                            {(val) => (
                                <h2 className="text-6xl md:text-8xl font-black text-slate-950 leading-[0.85] uppercase italic">
                                    {val !== undefined && val !== null ? val : (
                                        <>
                                            Specialist <br />
                                            <span className="text-transparent" style={{ WebkitTextStroke: '2px #0f172a' }}>Solutions</span>
                                        </>
                                    )}
                                </h2>
                            )}
                        </EditableElement>
                    </div>
                    
                    <div className="max-w-md space-y-4">
                        <EditableElement
                            targetId={`delivery.home.${sId}.ServicesSection.subline`}
                            componentKey="ServicesSection"
                            elementKey="subline"
                            label="Guarantees / Subline"
                            defaultValue={sublineText}
                            type="text"
                        >
                            {(val) => (
                                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest" style={{ color: primaryColor }}>
                                    <ShieldCheckIcon className="w-4 h-4" /> {val !== undefined && val !== null ? val : sublineText}
                                </div>
                            )}
                        </EditableElement>
                        <EditableElement
                            targetId={`delivery.home.${sId}.ServicesSection.description`}
                            componentKey="ServicesSection"
                            elementKey="description"
                            label="Narrative Description"
                            defaultValue={descriptionText}
                            type="textarea"
                        >
                            {(val) => (
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    {val !== undefined && val !== null ? val : descriptionText}
                                </p>
                            )}
                        </EditableElement>
                    </div>
                </div>

                {/* --- SERVICE CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
                    {baseOfferings.map((service, idx) => {
                        const Icon = service.icon || CubeIcon;
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
                                            <EditableElement
                                                targetId={`delivery.home.${sId}.ServicesSection.services-${idx}.tag`}
                                                componentKey="ServicesSection"
                                                elementKey={`services.${idx}.tag`}
                                                label={`Service ${idx + 1} Tag`}
                                                defaultValue={service.tag}
                                                type="text"
                                            >
                                                {(val) => (
                                                    <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                                                        {val !== undefined && val !== null ? val : service.tag}
                                                    </span>
                                                )}
                                            </EditableElement>
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
                                            <EditableElement
                                                targetId={`delivery.home.${sId}.ServicesSection.services-${idx}.title`}
                                                componentKey="ServicesSection"
                                                elementKey={`services.${idx}.title`}
                                                label={`Service ${idx + 1} Title`}
                                                defaultValue={service.title}
                                                type="text"
                                            >
                                                {(val) => (
                                                    <h3 className="text-3xl font-black text-slate-950 uppercase italic leading-none">
                                                        {val !== undefined && val !== null ? val : service.title}
                                                    </h3>
                                                )}
                                            </EditableElement>
                                            
                                            <EditableElement
                                                targetId={`delivery.home.${sId}.ServicesSection.services-${idx}.desc`}
                                                componentKey="ServicesSection"
                                                elementKey={`services.${idx}.desc`}
                                                label={`Service ${idx + 1} Description`}
                                                defaultValue={service.desc}
                                                type="textarea"
                                            >
                                                {(val) => (
                                                    <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-2">
                                                        {val !== undefined && val !== null ? val : service.desc}
                                                    </p>
                                                )}
                                            </EditableElement>

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

