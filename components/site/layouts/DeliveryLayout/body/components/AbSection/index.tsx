'use client';

import React, { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  PaperAirplaneIcon, 
  CheckCircleIcon, 
  AcademicCapIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AbSection({storeFormData}: {storeFormData: any}) {

  const {
    name = "Imevo",
    tagline = "Innovative Logistics Solutions",
    description,
    themeSettings,
    heroSlides = [],
    bannerUrl,
    sectionSubtitle,
    sectionDescription,
    sectionTitle,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || "#f7941d";

  // Masonry Image Logic
  const images = useMemo(() => {
    const slideImgs = heroSlides.map((s: any) => s.imageUrl).filter(Boolean);
    return {
      main: bannerUrl || slideImgs[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      sub1: slideImgs[0] || slideImgs[1] || bannerUrl  || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      sub2: slideImgs[1] || slideImgs[2] || bannerUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    };
  }, [heroSlides, bannerUrl]);

  return (
    <section id="about" className="py-24 lg:py-40 bg-white overflow-hidden relative">
      {/* Background Architectural Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/80 -skew-x-12 translate-x-1/3 -z-10" />
      <div 
        className="absolute bottom-20 left-10 w-64 h-64 rounded-full blur-3xl -z-10 opacity-20" 
        style={{ backgroundColor: primaryColor }}
      />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* --- LEFT SIDE: THE IMAGE MASONRY --- */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 grid grid-cols-12 gap-4">
              
              {/* Main Hero Image */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="col-span-8 relative group"
              >
                <div 
                  className="absolute -inset-4 border-2 rounded-[2.5rem] -z-10 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" 
                  style={{ borderColor: `${primaryColor}33` }}
                />
                <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] relative border-8 border-white">
                  <Image decoding="async" 
                    src={images.main} 
                    alt="Operations Excellence" 
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                </div>
              </motion.div>

              {/* Stacked Side Images */}
              <div className="col-span-4 flex flex-col gap-4 self-center">
                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="rounded-2xl overflow-hidden shadow-xl aspect-square relative border-4 border-white"
                >
                  <Image decoding="async" src={images.sub1} alt="Reliable Fleet" fill className="object-cover" />
                </motion.div>
                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 }}
                   className="rounded-2xl overflow-hidden shadow-xl aspect-square relative border-4 border-white"
                >
                  <Image decoding="async" src={images.sub2} alt="Global Logistics" fill className="object-cover" />
                </motion.div>
              </div>
            </div>

            {/* Experience Badge */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              className="absolute -bottom-10 right-4 lg:right-12 z-30"
            >
              <div className="w-40 h-40 rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-white text-center shadow-2xl border-[12px] border-white rotate-3">
                <AcademicCapIcon className="mb-1 w-8 h-8" style={{ color: primaryColor }} />
                <span className="text-4xl font-black italic leading-none">20+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Years of <br/> Mastery</span>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT SIDE: THE EDITORIAL CONTENT --- */}
          <div className="lg:col-span-6 space-y-10">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full"
                style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }}></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {sectionSubtitle || "Established 2019"}
                </span>
              </motion.div>

              {sectionTitle ? (
                <h2 className="text-5xl md:text-7xl font-black text-slate-950 leading-[0.9] tracking-tighter uppercase italic">
                  {sectionTitle}
                </h2>
              ) : (
                <h2 className="text-5xl md:text-7xl font-black text-slate-950 leading-[0.9] tracking-tighter uppercase italic">
                  Beyond <br />
                  <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>Logistics</span>
                </h2>
              )}

              <p className="text-slate-600 leading-relaxed text-lg font-medium italic border-l-4 pl-6" style={{ borderColor: primaryColor }}>
                {sectionDescription || `"We leverage over two decades of expertise to deliver a competitive advantage that moves your business beyond boundaries."`}
              </p>

              <p className="text-slate-500 leading-relaxed text-sm">
                {description || "Imevo Limited was founded on the principle of top-notch management and subordinate excellence. Our staff are more than employees; they are logistics architects dedicated to delivering on the client's every wish."}
              </p>

              {/* Interactive Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: CheckCircleIcon, label: "Reliable Service" },
                  { icon: GlobeAltIcon, label: "Global Network" },
                  { icon: ShieldCheckIcon, label: "Secure Handling" },
                  { icon: ClockIcon, label: "24/7 Monitoring" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: primaryColor }} /> 
                    <span className="text-slate-900 font-bold text-xs uppercase tracking-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA & Trust Section */}
            <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-slate-100">
              <button 
                onClick={() => window.location.href = "/delivery/aboutus"}
                className="h-16 px-10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full transition-all flex items-center gap-4 shadow-xl hover:brightness-110"
                style={{ backgroundColor: "#0f172a" }} 
              >
                Read Our Story <PaperAirplaneIcon className="w-4 h-4" />
              </button>
              
              {/* <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-4" style={{ borderColor: `${primaryColor}33` }}>
                  <Image src={founderImage || "https://example.com/director-avatar.png"} alt="Director" width={56} height={56} className="object-cover" loader={loader} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase italic leading-none">{founderName || "John Doe"}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{founderQuote || "Founding Director"}</p>
                </div>
              </div> */}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}