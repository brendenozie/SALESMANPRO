'use client';

import React, { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  CheckCircleIcon, 
  AcademicCapIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  RocketLaunchIcon,
  EyeIcon,
  UserGroupIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutUsPage() {
  const { storeFormData } = useStoreContext();

  const {
    name = "Imevo",
    description = "Imevo Limited was founded on the principle of top-notch management and subordinate excellence. Our staff are more than employees; they are logistics architects dedicated to delivering on the client's every wish.",
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
    <div className="min-h-screen bg-slate-50 selection:bg-slate-900 selection:text-white">
      
      {/* --- HERO / STORY SECTION --- */}
      <section className="pt-32 pb-24 lg:pt-48 lg:pb-32 bg-white overflow-hidden relative">
        {/* Background Architectural Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/80 -skew-x-12 translate-x-1/3 -z-10" />
        <div 
          className="absolute top-40 left-10 w-96 h-96 rounded-full blur-[100px] -z-10 opacity-20" 
          style={{ backgroundColor: primaryColor }}
        />

        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Side: Masonry Images */}
            <div className="lg:col-span-6 relative">
              <div className="relative z-10 grid grid-cols-12 gap-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="col-span-8 relative group"
                >
                  <div 
                    className="absolute -inset-4 border-2 rounded-[2.5rem] -z-10 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" 
                    style={{ borderColor: `${primaryColor}33` }}
                  />
                  <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] relative border-8 border-white">
                    <Image 
                      src={images.main} 
                      alt={`${name} Operations Excellence`} 
                      fill
                      loader={loader}
                      className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                  </div>
                </motion.div>

                <div className="col-span-4 flex flex-col gap-4 self-center">
                  <motion.div 
                     initial={{ opacity: 0, x: 30 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3, duration: 0.6 }}
                     className="rounded-2xl overflow-hidden shadow-xl aspect-square relative border-4 border-white"
                  >
                    <Image src={images.sub1} alt="Reliable Fleet" fill loader={loader} className="object-cover" />
                  </motion.div>
                  <motion.div 
                     initial={{ opacity: 0, x: 30 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.5, duration: 0.6 }}
                     className="rounded-2xl overflow-hidden shadow-xl aspect-square relative border-4 border-white"
                  >
                    <Image src={images.sub2} alt="Global Logistics" fill loader={loader} className="object-cover" />
                  </motion.div>
                </div>
              </div>

              {/* Experience Badge */}
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                className="absolute -bottom-10 right-4 lg:right-12 z-30"
              >
                <div className="w-40 h-40 rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-white text-center shadow-2xl border-[12px] border-white rotate-3 hover:rotate-0 transition-transform duration-300">
                  <AcademicCapIcon className="mb-1 w-8 h-8" style={{ color: primaryColor }} />
                  <span className="text-4xl font-black italic leading-none">20+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Years of <br/> Mastery</span>
                </div>
              </motion.div>
            </div>

            {/* Right Side: The Editorial Content */}
            <div className="lg:col-span-6 space-y-10">
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-5 py-2 rounded-full"
                  style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }}></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    {sectionSubtitle || "Our Story"}
                  </span>
                </motion.div>

                {sectionTitle ? (
                  <h1 className="text-5xl md:text-7xl font-black text-slate-950 leading-[0.9] tracking-tighter uppercase italic">
                    {sectionTitle}
                  </h1>
                ) : (
                  <h1 className="text-5xl md:text-7xl font-black text-slate-950 leading-[0.9] tracking-tighter uppercase italic">
                    Beyond <br />
                    <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>Logistics</span>
                  </h1>
                )}

                <p className="text-slate-600 leading-relaxed text-xl font-medium italic border-l-4 pl-6" style={{ borderColor: primaryColor }}>
                  {sectionDescription || `"We leverage over two decades of expertise to deliver a competitive advantage that moves your business beyond boundaries."`}
                </p>

                <p className="text-slate-500 leading-relaxed text-base">
                  {description}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- MISSION & VISION SECTION --- */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Mission Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 lg:p-14 rounded-[2rem] hover:border-slate-700 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}22` }}>
                <RocketLaunchIcon className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Our Mission</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                To architect seamless supply chains and logistical pathways that empower businesses to scale globally without friction. We don't just move cargo; we propel commerce forward with precision and dedication.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 lg:p-14 rounded-[2rem] hover:border-slate-700 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}22` }}>
                <EyeIcon className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                To be the undisputed benchmark of excellence in global logistics. We envision a connected world where distance is no longer a barrier, driven by our innovative technology and unparalleled operational mastery.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- CORE VALUES GRID --- */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tight mb-6">
              The Pillars of Our <span style={{ color: primaryColor }}>Success</span>
            </h2>
            <p className="text-slate-500 text-lg">
              Everything we do is built upon a foundation of core principles that ensure we consistently over-deliver on our promises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheckIcon, title: "Uncompromising Security", desc: "Your assets are guarded by industry-leading security protocols at every single touchpoint." },
              { icon: ClockIcon, title: "Precision Timing", desc: "In our industry, seconds matter. We pride ourselves on clockwork execution and zero delays." },
              { icon: GlobeAltIcon, title: "Global Reach", desc: "A vast, interconnected network that bridges continents and eliminates geographic limitations." },
              { icon: CheckCircleIcon, title: "Absolute Reliability", desc: "We make promises, and we keep them. Period. No excuses, just seamless execution." },
              { icon: UserGroupIcon, title: "Client-Centric Approach", desc: "Your goals become our goals. We align our strategies entirely with your business objectives." },
              { icon: SparklesIcon, title: "Continuous Innovation", desc: "Always adopting the latest technologies to streamline processes and cut costs for our partners." },
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${primaryColor}1A` }}>
                  <value.icon className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}