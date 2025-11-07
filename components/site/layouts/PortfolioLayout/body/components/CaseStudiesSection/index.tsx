"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import Image from "next/image";
import { ICoreValue } from "@/types/typings";

// Framer Motion variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const imageLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

interface CoreValuesSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  CoreValues: ICoreValue[];
}

export default function CoreValuesSection({ themeSettings, CoreValues }: CoreValuesSectionProps) {

  const primaryColor = themeSettings?.primaryColor || "#00A880";
  const secondaryColor = themeSettings?.secondaryColor || "#10B981";
  const accentBg = `${primaryColor}20`;

  // Use CoreValues instead of caseStudies
  const coreValuesToRender: ICoreValue[] =
    CoreValues && CoreValues.length > 0
      ? CoreValues
      : [
          {
            id: "cv1",
            title: "Patient-Centered Care",
            description:
              "Your health and comfort are our primary focus. We tailor our services to meet your individual needs.",
            icon: "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80",
            // label: "Compassion",
          },
          {
            id: "cv2",
            title: "Trusted Expertise",
            description:
              "Our board-certified professionals and staff are committed to providing the highest quality care.",
            icon:
              "https://images.unsplash.com/photo-1621524231095-ded43b8b2d6f?q=80",
            // label: "Excellence",
          },
          {
            id: "cv3",
            title: "Community Wellness",
            description:
              "We are an integral part of the community, actively promoting public health and well-being.",
            icon:
              "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80",
            // label: "Well-being",
          },
          {
            id: "cv4",
            title: "Innovative Solutions",
            description:
              "Leveraging the latest medical technology to provide accurate diagnoses and effective treatments.",
            icon:
              "https://images.unsplash.com/photo-1580281658629-3f98bde5a1ad?q=80",
            // label: "Innovation",
          },
        ];

  return (
    <AnimatePresence>
      <section
        id="core-values"
        className="relative py-24 md:py-32 px-6 lg:px-16 overflow-hidden bg-gray-50 dark:bg-gray-950"
      >
        {/* Background animation */}
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
          <motion.div
            className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl"
            style={{ backgroundColor: primaryColor }}
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl"
            style={{ backgroundColor: secondaryColor }}
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Heading */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.h2
              className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight drop-shadow-sm"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Our <span style={{ color: primaryColor }}>Core</span>{" "}
              <span style={{ color: secondaryColor }}>Values</span>
            </motion.h2>
            <motion.p
              className="mt-4 text-gray-600 dark:text-gray-300 text-lg md:text-xl"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              The principles that guide our mission, inspire our people, and
              shape the care we deliver every day.
            </motion.p>
          </div>

          {/* Core Values Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {coreValuesToRender.map((item, idx) => (
              <motion.div
                key={item.id || `cv-${idx}`}
                className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl group"
                variants={cardVariants}
              >
                {/* If image exists */}
                {item.icon ? (
                  <div className="relative w-full h-64 md:h-72 lg:h-80 xl:h-96">
                    <Image
                      src={ "https://images.unsplash.com/photo-1621524231095-ded43b8b2d6f?q=80"}
                      loader={imageLoader}
                      alt={item.title}
                      fill
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                      {/* {item.label && ( */}
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium mb-2 w-fit">
                          {/* {item.label} */}
                          {"Excellence"}
                        </span>
                      {/* )} */}
                      <h3 className="text-xl font-bold text-white leading-snug">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-200 text-sm mt-1 opacity-90">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Text Card Fallback
                  <div
                    className="p-8 h-full flex flex-col justify-between"
                    style={{ backgroundColor: accentBg }}
                  >
                    <SparklesIcon className="w-12 h-12 text-gray-800 dark:text-gray-200 mb-6 opacity-60" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span
                      className="inline-flex items-center gap-2 font-semibold px-5 py-2 rounded-full transition-colors w-fit"
                      style={{ backgroundColor: primaryColor, color: "white" }}
                    >
                      Learn More
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}
