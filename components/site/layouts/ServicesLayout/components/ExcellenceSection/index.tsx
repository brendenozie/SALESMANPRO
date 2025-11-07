'use client';

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext"; // Assuming this is needed/used
import { IPromotion } from "@/types/typings"; // Assuming your types
import { resolveIcon } from "@/components/site/resolveIcon"; // Assuming this utility is functional

// --- Utility Functions ---

const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// --- Component Definition ---

interface ExcellenceSectionProps {
  slug: string;
  themeSettings: any;
  promotions: IPromotion[];
}

export default function ExcellenceSection({ slug, themeSettings, promotions }: ExcellenceSectionProps) {
  // Data extraction (Kept similar to your original for simplicity)
  const promotion: IPromotion | null =
    promotions && promotions.length > 0 ? promotions[0] : null;

  // Colors - Defined once for consistent use
  const primaryColor = themeSettings?.primaryColor || "#43A047"; // Use theme setting if available
  const secondaryColor = themeSettings?.secondaryColor || "#FFB300"; // Use theme setting if available

  // Feature Image
  const featureImage = promotion?.bannerUrl ?? promotion?.featureImage1 ?? themeSettings?.aboutImage ?? "https://via.placeholder.com/600x400";

  // Fallback perks (Made the titles punchier)
  const defaultPerks = [
    {
      id: "1",
      title: "Unrivaled Quality",
      icon: 'SparklesIcon',
      description: "Our pursuit of perfection means every service meets the highest standards, without compromise.",
    },
    {
      id: "2",
      title: "Bespoke Solutions",
      icon: 'PuzzlePieceIcon',
      description: "Tailored to your exact requirements, ensuring a perfect fit for your unique needs and goals.",
    },
    {
      id: "3",
      title: "Swift Reliability",
      icon: 'CheckCircleIcon',
      description: "Dependable service delivered quickly and effectively, so you can count on us every time.",
    },
    {
      id: "4",
      title: "Forward-Thinking",
      icon: 'RocketLaunchIcon',
      description: "Leveraging the latest innovations and techniques for a truly modern service experience.",
    },
  ];

  const perks =
    promotion?.perks?.length && promotion?.perks.length > 0
      ? promotion.perks.map((p) => ({
          id: p.id,
          title: p.label,
          icon: 'SparklesIcon', // TODO: Map promotion.icon string -> actual icon component
          description: "", // Keep default empty if type doesn't support it
        }))
      : defaultPerks;

  // --- Animation Variants (Refined for more impact) ---
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }, // Slightly faster stagger
    },
  };

  const textReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 18 }, // A bit more snappy
    },
    hover: {
        scale: 1.03,
        y: -5,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
        transition: { type: "spring", stiffness: 300, damping: 10 },
    }
  };


  return (
    <section className="relative bg-white dark:bg-gray-950 py-20 lg:py-32 overflow-hidden text-gray-900 dark:text-gray-50">
      
      {/* Dynamic Swirling Background Blobs (Captivating) */}
      <div className="absolute inset-0 z-0 opacity-15 blur-3xl pointer-events-none">
        <motion.div
          className="absolute rounded-full -top-40 -left-40 w-[20rem] h-[20rem]"
          style={{ backgroundColor: primaryColor }}
          animate={{
            x: [0, 80, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute rounded-full -bottom-40 -right-40 w-[25rem] h-[25rem]"
          style={{ backgroundColor: secondaryColor }}
          animate={{
            x: [0, -60, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror",
            delay: 5,
          }}
        />
      </div>

      {/* Subtle Dot Pattern (Visual Appeal) */}
      <div
        className="absolute inset-0 z-0 opacity-10 dark:opacity-[0.03] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Excellence Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Image (Captivating) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-5 relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group shadow-2xl transition-shadow duration-500 hover:shadow-primary/50"
          >
            <div
              className="absolute inset-0 rounded-3xl -z-10 transition-all duration-700 transform translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0"
              style={{ background: secondaryColor }}
            />
            <Image
              src={featureImage || 'https://via.placeholder.com/600x400'}
              alt={promotion?.title || "Our commitment to excellence"}
              layout="fill"
              objectFit="cover"
              className="rounded-3xl transition-all duration-700 ease-in-out group-hover:scale-[1.03] saturate-[0.8] hover:saturate-100"
              loader={loader}
            />
            {/* Gradient Overlay for Polish */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </motion.div>

          {/* Right Content (Engaging & Intuitive) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-7 space-y-10 text-center lg:text-left flex flex-col justify-center"
          >
            {/* Highlighted Title */}
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter"
              variants={textReveal}
            >
              {(() => {
                const fullText = promotion?.title || "Driven by **Unwavering** Excellence";
                const words = fullText.trim().split(" ");
                const lastWord = words.pop();
                const rest = words.join(" ");

                return (
                  <>
                    {rest.replace(/\*\*(.*?)\*\*/g, (match, p1) => `<span class="italic">${p1}</span>`)}{" "}
                    <span
                      className="bg-clip-text text-transparent inline-block transition-all duration-500"
                      style={{ backgroundImage: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} 100%)` }}
                      dangerouslySetInnerHTML={{ __html: lastWord || '' }}
                    />
                  </>
                );
              })()}
            </motion.h2>

            {/* Sub-Description */}
            <motion.p
              className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 opacity-80"
              variants={textReveal}
            >
              {promotion?.description ||
                "We don't just deliver a service; we **engineer a premium experience**. Our commitment is to precision, care, and results that genuinely exceed your expectations."}
            </motion.p>

            {/* Perks Grid (Intuitive & Interactive) */}
            <motion.ul
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 pt-4"
              variants={staggerContainer}
            >
              {perks.map((item, index) => {
                const Icon = resolveIcon(item.icon); // Resolves the string icon name to a component

                return (
                  <motion.li
                    key={item.id || index}
                    variants={cardVariants}
                    whileHover="hover" // Apply hover variant
                    className="flex items-start space-x-4 p-5 rounded-2xl transition-all duration-500 transform bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 shadow-md hover:shadow-lg relative cursor-default"
                  >
                    <div
                      className="flex-shrink-0 p-3 rounded-full text-white ring-2 ring-offset-2 dark:ring-offset-gray-900"
                      style={
                        {
                          backgroundColor: primaryColor,
                          "--tw-ring-color": primaryColor,
                        } as React.CSSProperties
                      }
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-extrabold leading-snug">{item.title}</h3>
                      {(item.description || defaultPerks[index]?.description) && (
                        <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
                          {item.description || defaultPerks[index]?.description}
                        </p>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* CTA */}
            {(promotion?.ctaText || promotion?.ctaLink) && (
              <motion.div
                className="pt-8 flex flex-wrap justify-center lg:justify-start gap-4"
                variants={textReveal}
              >
                <Link
                  href={promotion.ctaLink || `/${slug}/services`}
                  className="inline-block px-10 py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-gray-950 focus:ring-opacity-75"
                  style={
                    {
                      backgroundColor: primaryColor,
                      "--tw-ring-color": primaryColor,
                    } as React.CSSProperties
                  }
                >
                  {promotion.ctaText || "Discover Our Difference →"}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}