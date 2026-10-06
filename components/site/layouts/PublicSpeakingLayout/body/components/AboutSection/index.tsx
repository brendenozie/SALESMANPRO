'use client';
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRightIcon, AcademicCapIcon, HeartIcon, GlobeAltIcon, UserGroupIcon } from "@heroicons/react/24/outline"; // Added new icons
import { useStoreContext } from "@/contexts/StoreContext";

// --- 💡 Assumed Utility (Added for dynamic color logic) ---
const getLightTint = (hex: string) => {
    // Simple logic: If hex is e.g. #F97316, we return a very light version
    return hex + '1A'; // Adds 10% opacity, a simple way to get a tint
};
// ----------------------------------------------------


// Image Loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Auto-advance delay (Not needed in this static section, but kept for context)
const autoAdvanceDelay = 9000;

// Component for the Founder's Story (New visual element)
const CoachStoryCard = ({ name, founderName, founderQuote, primaryColor }: { name: string; founderName: string; founderQuote: string; primaryColor: string }) => {
    
    return (
        <motion.div
            className="p-6 md:p-8 bg-white rounded-3xl shadow-2xl relative z-20 w-full transform -translate-y-1/2 lg:translate-x-1/4"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{ borderTop: `6px solid ${primaryColor}` }}
        >
            <p className="text-xl italic text-gray-800 mb-4">
                {founderQuote || `“At ${name}, our vision is to ignite a global movement of flourishing souls. We believe that every individual has the potential to thrive when nurtured with love, purpose, and community. Join us on this transformative journey.”`}
            </p>
            <div className="flex items-center">
                <AcademicCapIcon className="w-6 h-6 mr-3" style={{ color: primaryColor }} />
                <p className="font-bold text-gray-900">
                    — {founderName} <span className="text-sm font-normal text-gray-500"> | Founder of {name}</span>
                </p>
            </div>
        </motion.div>
    );
};


const AboutSection: React.FC = () => {
  const { storeFormData } = useStoreContext();

  // --- Extract data from store context or fallback ---
  const {
    name = "FlourisHUb",
    tagline = "A Platform for All Beautiful Souls — Flourishing Together",
    description = `Founded by Coach Jackie Wegoki, FlourisHUb is a nurturing space for all beautiful souls committed to the art of human flourishing. Guided by compassion and purpose, Jackie envisions a world where every individual is nourished to grow and thrive in wholeness.`,
    themeSettings = { primaryColor: "#F97316", secondaryColor: "#FB923C" },
    heroSlides = [],
    bannerUrl,
    CoreValues,
    founderName,
    founderQuote,
  } : any = storeFormData || {}; // Added : any to resolve potential TS issues

  const imgSrc = useMemo(
    () => heroSlides?.[0]?.productImageUrl || heroSlides?.[0]?.imageUrl || bannerUrl || "/coach-about.jpg",
    [heroSlides, bannerUrl]
  );

  const primaryColor = themeSettings?.primaryColor || "#F97316";
  const secondaryColor = themeSettings?.secondaryColor || "#FB923C";

    // Values/Highlights data
    const highlights = useMemo(() => (
      [
        {
            icon: GlobeAltIcon,
            title: "Vision: Global Flourishing",
            description: "To create a hub that enables human flourishing across communities and nations.",
        },
        {
            icon: HeartIcon,
            title: "Mission: Nourish to Thrive",
            description: "Dedicated to nourishing the soul to help every individual find their authentic path.",
        },
        {
            icon: UserGroupIcon,
            title: "Community Focus",
            description: "Uplifting others through love and purpose to build a stronger, more connected world.",
        },
    ]), []);

    // NOTE: Removed `current` state and `useEffect` for auto-advance as this is a static About section.

  return (
    <section
      id="about"
      className="relative py-28 md:py-36 bg-gray-50 overflow-hidden"
    >
      {/* Background shape for visual appeal */}
      <div 
        className="absolute top-0 right-0 w-3/4 h-full bg-white transform skew-x-[-12deg] origin-top-right shadow-inner"
        style={{ backgroundColor: getLightTint(primaryColor), opacity: 0.1 }}
      ></div>

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        {/* Main Grid: Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-start">
            {/* Left: Image (Col Span 5) */}
            <motion.div
              className="lg:col-span-5 relative w-full pt-[120%] lg:pt-[100%]" // Ratio container
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
                {/* Decorative Accent Frame */}
                <div 
                    className="absolute top-0 left-0 w-[95%] h-full rounded-3xl transform translate-x-3 translate-y-3 -rotate-1"
                    style={{ backgroundColor: primaryColor, opacity: 0.1 }}
                ></div>

                <div className="absolute top-0 left-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white z-10">
                  <Image decoding="async"
                    src={imgSrc || 'https://via.placeholder.com/600x400?text=About+Us'}
                    alt={`${name} - inspiring human flourishing`}
                    layout="fill"
                    objectFit="cover"
                    className="object-cover"
                  />
                </div>
            </motion.div>

            {/* Right: Text & Highlights (Col Span 7) */}
            <motion.div
              className="lg:col-span-7 pt-12 text-center lg:text-left"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <span
                className="uppercase font-semibold tracking-wide text-sm mb-3 inline-block"
                style={{ color: primaryColor }}
              >
                About {name}
              </span>

              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {tagline?.split("—")[0]} —{" "}
                <span
                  className="bg-clip-text text-transparent bg-gradient-to-r"
                  style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                >
                  {tagline?.split("—")[1] || "Flourishing Together"}
                </span>
              </h2>

              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                { description || `Our mission is simple yet transformative — to create a global hub that uplifts individuals, families,
                and communities toward authentic growth, balance, and joy. We believe that when one soul flourishes,
                the ripple of transformation touches families, communities, and nations...`}
              </p>

              {/* Elevated Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                {highlights.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl shadow-md border-t-2" style={{ borderColor: primaryColor }}>
                    <item.icon className="w-6 h-6 mb-2" style={{ color: primaryColor }} />
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title.split(":")[0]}</h3>
                    <p className="text-gray-600 text-xs leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="#contact"
                className="inline-flex items-center px-8 py-3 font-semibold rounded-full shadow-lg transition-all duration-300 text-base border-2"
                style={{
                  backgroundColor: primaryColor,
                  color: "white",
                  borderColor: primaryColor
                }}
              >
                Join the {name} Movement
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </a>
            </motion.div>
        </div>
      </div>
        
        {/* Founder Story Card positioned to overlap the main layout  mt-[-100px] lg:mt-[-50px]*/}
        <div className="container relative z-30 mx-auto mt-16 px-6 max-w-7xl">
            <CoachStoryCard 
                name={name} 
                founderName={founderName || "Coach Jackie Wegoki"} 
                founderQuote={founderQuote || `“At ${name}, our vision is to ignite a global movement of flourishing souls. We believe that every individual has the potential to thrive when nurtured with love, purpose, and community. Join us on this transformative journey.”`}
                primaryColor={primaryColor} 
            />
        </div>
    </section>
  );
};

export default AboutSection;