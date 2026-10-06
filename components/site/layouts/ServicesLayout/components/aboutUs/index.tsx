'use client';

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";
import { EditableElement } from "@/contexts/EditableContentContext";

// --- UTILS ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

// Helper to determine if a color is light or dark to adjust text color automatically
const getContrastYIQ = (hexcolor: string) => {
    // If no color, assume light background -> dark text
    if (!hexcolor || hexcolor === 'transparent') return 'dark';

    // Remove hash if present
    const hex = hexcolor.replace("#", "");
    
    // Make sure it's 6 digits
    if (hex.length !== 6) return 'dark';

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // YIQ equation
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Returns 'light' or 'dark' indicating the appropriate TEXT color
    return (yiq >= 128) ? 'dark' : 'light';
};


export default function AboutSectionEditorial() {
  const { storeFormData } = useStoreContext();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax for the image strip
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  // Opposite parallax for the text block strip
  const yText = useTransform(scrollYProgress, [0.2, 0.8], ["5%", "-5%"]);

  if (!storeFormData) return null;

  const { slug, bannerUrl, name, description, themeSettings, CoreValues } = storeFormData;
  const primaryColor = themeSettings?.primaryColor || "#222222";
  
  // Determine text color based on primary color brightness
  const contrastMode = getContrastYIQ(primaryColor);
  const overlayTextColor = contrastMode === 'light' ? 'text-white' : 'text-gray-900';
  const overlayOutlineColor = contrastMode === 'light' ? 'text-white/10' : 'text-gray-900/10';

  // A shorter punchy headline
  const headline = `We are ${name}.`;

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-white dark:bg-gray-950 font-sans">
      
      {/* --- THE SPLIT LAYOUT CONTAINER --- */}
      <div className="flex flex-col lg:flex-row min-h-[800px] lg:h-[90vh] max-h-[1080px]">

        {/* === LEFT SIDE: The Structural Color Block === */}
        <div 
          className="relative w-full lg:w-5/12 h-[500px] lg:h-auto flex flex-col justify-center p-8 md:p-16 lg:p-20 overflow-hidden"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Architectural Background Text (Outlined) */}
          <div 
            className={`absolute left-0 top-1/2 -translate-y-1/2 font-black text-[12rem] md:text-[20rem] lg:text-[25rem] leading-none uppercase ${overlayOutlineColor} select-none pointer-events-none whitespace-nowrap z-0`}
            style={{ WebkitTextStroke: `2px currentColor`, WebkitTextFillColor: 'transparent' }}
          >
            About
          </div>

          {/* Main Content (Foreground) */}
          <div className={`relative z-10 ${overlayTextColor}`}>
            <motion.div
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.2 }}
            >
                <EditableElement
                  targetId="services.home.aboutUs.AboutUs.main.badgeText"
                  componentKey="AboutUs"
                  elementKey="badgeText"
                  label="Badge Text"
                  defaultValue="The Story"
                  inline
                >
                  {(val) => (
                    <h5 className="uppercase tracking-[0.3em] text-sm font-bold mb-6 opacity-80">{val}</h5>
                  )}
                </EditableElement>

                <EditableElement
                  targetId="services.home.aboutUs.AboutUs.main.headline"
                  componentKey="AboutUs"
                  elementKey="headline"
                  label="Headline"
                  defaultValue={headline}
                >
                  {(val) => (
                    <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-8">
                      {val}
                    </h2>
                  )}
                </EditableElement>
                
                {/* Decorative Line */}
                <div className={`h-2 w-24 mb-12 ${contrastMode === 'light' ? 'bg-white' : 'bg-gray-900'}`}></div>

                {/* Scroll Hint located inside the color block */}
                <div className="hidden lg:flex items-center gap-4 opacity-60 mt-auto pt-20">
                    <ArrowDownIcon className="w-6 h-6 animate-bounce" />
                    <span className="text-sm uppercase tracking-widest">Scroll to discover</span>
                </div>
            </motion.div>
          </div>
        </div>

        {/* === RIGHT SIDE: Content & Imagery === */}
        <div className="w-full lg:w-7/12 relative flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
            
            {/* Text Content Area */}
            <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col justify-center relative z-20">
                 <motion.div 
                    className="bg-white dark:bg-gray-800 p-8 md:p-12 shadow-2xl lg:-ml-32 rounded-xl border-l-8"
                    style={{ borderLeftColor: primaryColor, y: yText }}
                 >
                     <EditableElement
                       targetId="services.home.aboutUs.AboutUs.main.title"
                       componentKey="AboutUs"
                       elementKey="title"
                       label="Story Title"
                       defaultValue="Redefining standards through dedication and design."
                     >
                       {(val) => (
                         <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                           {val}
                         </h3>
                       )}
                     </EditableElement>

                     <EditableElement
                       targetId="services.home.aboutUs.AboutUs.main.description"
                       componentKey="AboutUs"
                       elementKey="description"
                       label="Story Description"
                       defaultValue={description || "Our journey began with a singular vision: to create experiences that resonate deeper. We blend meticulous craftsmanship with innovative thinking to deliver results that don't just meet expectations, but shatter them."}
                     >
                       {(val) => (
                         <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-10">
                           {val}
                         </p>
                       )}
                     </EditableElement>

                    <Link href={`/service-provider/about`} className="group inline-flex items-center gap-4 font-bold text-gray-900 dark:text-white">
                        <EditableElement
                          targetId="services.home.aboutUs.AboutUs.main.ctaText"
                          componentKey="AboutUs"
                          elementKey="ctaText"
                          label="Action Text"
                          defaultValue="Read Full Story"
                          inline
                        >
                          {(val) => (
                            <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-in-out group-hover:after:origin-bottom-left group-hover:after:scale-x-100">
                                {val}
                            </span>
                          )}
                        </EditableElement>
                        <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" style={{ color: primaryColor }}/>
                    </Link>
                 </motion.div>
            </div>

            {/* Image Strip Area */}
            <div className="relative w-full lg:w-[40%] h-[400px] lg:h-auto overflow-hidden">
                 <motion.div 
                    style={{ y: yImage }}
                    className="absolute inset-0 w-full h-[120%] -top-[10%]"
                 >
                     <Image decoding="async" 
                        src={bannerUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"} 
                        alt={name}
                        fill
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                     />
                     <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
                 </motion.div>

                 {/* Vertical Core Values Stack overlaying the image strip */}
                 {CoreValues && CoreValues.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-t from-black/80 to-transparent z-20">
                        <ul className="flex lg:flex-col gap-4 lg:gap-2 flex-wrap justify-end lg:items-end text-white">
                            {CoreValues.slice(0,3).map((val: any, idx: number) => (
                                <li key={idx} className="flex items-center gap-3 text-right">
                                    <span className="font-bold uppercase tracking-wider text-sm md:text-base">{val.title}</span>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
            </div>
        </div>

      </div>
    </section>
  );
}