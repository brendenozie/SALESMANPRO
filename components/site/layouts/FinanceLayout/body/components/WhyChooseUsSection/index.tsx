"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ICoreValue } from "@/types/typings";

// --- MOCK DATA ---
const storeFormDatas = {
  name: "A-B Consulting",
  CoreValues: [
    {
      id: "feat-1",
      title: "Trusted Expertise",
      description: "Benefit from over two decades of combined legal and financial mastery, ensuring your matters are handled with precision.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 10 2s10 4.477 10 10z" />
        </svg>
      ),
      color: "#2563EB", // Blue
      order: 1,
    },
    {
      id: "feat-2",
      title: "Tailored Strategies",
      description: "Receive personalized solutions meticulously crafted to align with your unique objectives and intricate requirements.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      color: "#D97706", // Amber
      order: 2,
    },
    {
      id: "feat-3",
      title: "Proactive Communication",
      description: "Experience prompt responses and transparent updates, keeping you informed and confident at every stage.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      color: "#059669", // Emerald
      order: 3,
    },
    {
      id: "feat-4",
      title: "Client-Centric Approach",
      description: "Your success is our priority. We are dedicated to delivering exceptional service and building lasting relationships.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      ),
      color: "#DC2626", // Red
      order: 4,
    },
  ],
};

// --- COMPONENT FOR INTERSECTION DETECTION ---
// This invisible wrapper tells the parent when a specific card is "Active" in the viewport
const TriggerItem = ({ id, children, onActive }:{id: string; children: React.ReactNode; onActive: (id: string) => void}) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onActive(id);
        }
      },
      { threshold: 0.6, rootMargin: "-10% 0px -10% 0px" } // Trigger when 60% visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [id, onActive]);

  return <div ref={ref} className="min-h-[80vh] flex items-center">{children}</div>;
};

interface WhyChooseUsSectionProps {
  themeSettings: {
    primaryColor?: string;
    accentColor?: string;
  } | undefined | null;
  CoreValues: ICoreValue[];
}

// --- MAIN EXPORT ---
export default function WhyChooseUsSection({ themeSettings, CoreValues }: WhyChooseUsSectionProps) {
  const primary = themeSettings?.primaryColor || "#004085";
  const accent = themeSettings?.accentColor || "#2563EB";
  const [activeId, setActiveId] = useState(CoreValues[0].id || storeFormDatas.CoreValues[0].id);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]); // Rotate ring based on scroll

  const activeValue = (CoreValues.length > 0 ? CoreValues.find((v) => v.id === activeId) : storeFormDatas.CoreValues.find((v) => v.id === activeId)) || CoreValues[0] || storeFormDatas.CoreValues[0];
  const activeIndex = (CoreValues.length > 0 ? CoreValues.findIndex((v) => v.id === activeId) : storeFormDatas.CoreValues.findIndex((v) => v.id === activeId));
  const order = activeIndex >= 0 ? activeIndex + 1 : 1;
  // ensure we have a typed color (ICoreValue may not include color)
  const activeColor = (activeValue as unknown as { color?: string }).color || accent;

  return (
    <section ref={containerRef} className="relative bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row">
          
          {/* --- LEFT COLUMN: FIXED ANCHOR --- */}
          {/* This stays pinned while the right side scrolls */}
          <div className="lg:w-5/12 lg:h-screen lg:sticky lg:top-0 flex flex-col justify-center py-12 lg:py-0 z-10">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="mb-12 relative"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Why Our Clients <br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${primary}, ${accent})` }}>
                  Trust Us
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-md leading-relaxed">
                 We don't just offer services; we offer a partnership built on four non-negotiable pillars of excellence.
              </p>
            </motion.div>

            {/* --- DYNAMIC VISUAL STAGE --- */}
            <div className="relative w-full max-w-xs hidden lg:block">
              {/* Animated Ring */}
              <motion.div 
                style={{ rotate, borderColor: activeColor }}
                className="absolute inset-0 rounded-full border-2 border-dashed opacity-30 w-64 h-64 -z-10 transition-colors duration-700"
              />
              
              {/* Content Swap */}
              <div className="w-64 h-64 rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500">
                 {/* Background color splash */}
                 <motion.div 
                   layoutId="bg-splash"
                   className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
                   style={{ color: activeColor }}
                 />
                 
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={activeId}
                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.8, y: -20 }}
                     transition={{ duration: 0.4, ease: "backOut" }}
                     className="flex flex-col items-center"
                   >
                      <div className="p-4 rounded-2xl mb-4 text-white shadow-lg" style={{ backgroundColor: activeColor }}>
                        {React.isValidElement(activeValue.icon)
                          ? React.cloneElement(activeValue.icon as React.ReactElement, { className: "h-10 w-10" })
                          : activeValue.icon}
                      </div>
                      <span className="text-6xl font-black text-slate-800 tracking-tighter">
                        0{order}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest mt-2 text-slate-400">
                        Core Principle
                      </span>
                   </motion.div>
                 </AnimatePresence>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SCROLLABLE STREAM --- */}
          <div className="lg:w-7/12 lg:pl-20 pb-24">
             {storeFormDatas.CoreValues.map((val, index) => (
               <TriggerItem key={val.id} id={val.id} onActive={setActiveId}>
                 <motion.div 
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ duration: 0.6 }}
                   className="w-full p-8 sm:p-12 rounded-[2rem] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                 >
                    {/* Mobile Icon (Visible only on small screens where fixed col is hidden) */}
                    <div className="lg:hidden mb-6 p-3 w-fit rounded-xl text-white shadow-md" style={{ backgroundColor: val.color }}>
                      {React.cloneElement(val.icon as React.ReactElement, { className: "h-8 w-8" })}
                    </div>

                    <div className="flex items-baseline justify-between mb-4">
                      <h3 className="text-3xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {val.title}
                      </h3>
                      <span className="text-6xl font-bold opacity-5 select-none" style={{ color: val.color }}>
                        0{val.order}
                      </span>
                    </div>
                    
                    <p className="text-xl text-slate-600 leading-relaxed">
                      {val.description}
                    </p>
                    
                    {/* Decorative Line */}
                    <div className="w-12 h-1 mt-8 rounded-full transition-all duration-500 group-hover:w-full" style={{ backgroundColor: val.color }} />
                 </motion.div>
               </TriggerItem>
             ))}
          </div>

        </div>
      </div>
    </section>
  );
}