"use client";

import { ArchiveBoxArrowDownIcon, ArrowRightIcon, ArrowRightStartOnRectangleIcon, ArrowsPointingOutIcon, TruckIcon, WrenchIcon } from "@heroicons/react/24/outline";
import { motion, useScroll, useSpring } from "framer-motion";
// import { MousePointer2, Box, Plane, Truck, Box as BoxIcon, ArrowRight, Settings2 } from "lucide-react";
import { useRef } from "react";

const STEPS = [
  { 
    icon: ArrowRightStartOnRectangleIcon, 
    title: "Online Quote", 
    desc: "Instant estimates tailored to your specific logistical dimensions and cargo requirements." 
  },
  { 
    icon: WrenchIcon, 
    title: "Optimization", 
    desc: "Precision route planning using AI-driven sorting to minimize transit latency." 
  },
  { 
    icon: ArchiveBoxArrowDownIcon, 
    title: "Secure Packing", 
    desc: "Industrial-grade protection designed to withstand transcontinental transit." 
  },
  { 
    icon: TruckIcon, 
    title: "Global Link", 
    desc: "Seamless delivery via our integrated air, sea, and land distribution channels." 
  }
];

export function ProcessTimeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} className="py-24 lg:py-40 bg-white relative overflow-hidden">
      {/* Structural Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col items-center text-center mb-32 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-2 bg-slate-100 border border-slate-200 rounded-full"
          >
            <ArchiveBoxArrowDownIcon className="text-[#f7941d] w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Execution Framework</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-8xl font-black text-slate-950 uppercase italic leading-[0.85] tracking-tighter">
            The <span className="text-transparent stroke-slate-950" style={{ WebkitTextStroke: '2px #0f172a' }}>Logistics</span> <br /> 
            Command Chain
          </h2>
        </div>

        {/* --- TIMELINE FLOW --- */}
        <div className="relative">
          
          {/* Progress Connector (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-[1px] bg-slate-200">
            <motion.div 
              style={{ scaleX }}
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-[#f7941d] origin-left h-[2px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
            {STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="relative group"
              >
                {/* Node & Icon */}
                <div className="relative mb-10 flex lg:justify-start justify-center">
                  <div className="relative z-10 w-24 h-24 rounded-[2rem] bg-white border-2 border-slate-100 flex items-center justify-center group-hover:border-[#f7941d] transition-all duration-500 shadow-xl group-hover:shadow-[#f7941d]/10 group-hover:-translate-y-2">
                    <step.icon className="text-slate-900 group-hover:text-[#f7941d] transition-colors w-8 h-8" />
                    
                    {/* Background Index (Ghost) */}
                    <span className="absolute -bottom-4 -right-2 text-6xl font-black text-slate-100 group-hover:text-orange-50 transition-colors -z-10 italic">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Desktop Step Indicator Dot */}
                  <div className="hidden lg:block absolute -top-[53px] left-11">
                     <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-300 group-hover:border-[#f7941d] transition-colors relative z-20" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4 lg:text-left text-center px-4">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight group-hover:text-orange-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {step.desc}
                  </p>
                  
                  {/* Decorative Link */}
                  <div className="flex items-center lg:justify-start justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] font-black uppercase text-[#f7941d]">View Metrics</span>
                    <ArrowRightIcon className="text-[#f7941d] w-3 h-3" />
                  </div>
                </div>

                {/* Mobile Connector Line */}
                {idx !== STEPS.length - 1 && (
                  <div className="lg:hidden absolute left-1/2 -bottom-10 w-[2px] h-8 bg-slate-100" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- BOTTOM ACTION --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 flex flex-col items-center"
        >
          <div className="w-[1px] h-20 bg-gradient-to-b from-slate-200 to-transparent mb-10" />
          <button className="group relative overflow-hidden px-16 py-6 bg-slate-950 rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl">
            <span className="relative z-10 text-white font-black uppercase text-xs tracking-[0.4em]">
              Initialize Network
            </span>
            <div className="absolute inset-0 bg-[#f7941d] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}