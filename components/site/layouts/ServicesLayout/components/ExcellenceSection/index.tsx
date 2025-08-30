"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import { IPromotion } from "@/types/typings";
import { resolveIcon } from "@/components/site/resolveIcon";


const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function ExcellenceSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">
          Crafting excellence...
        </p>
      </div>
    );
  }

  const { slug, themeSettings, promotions } = storeFormData;

  // Take first promotion if available
  const promotion: IPromotion | null =
    promotions && promotions.length > 0 ? promotions[0] : null;

  // Colors
  const primaryColor =
    promotion?.themePrimary ?? themeSettings?.primaryColor ?? "#43A047";
  const secondaryColor =
    promotion?.themeSecondary ?? themeSettings?.secondaryColor ?? "#FFB300";

  // Feature Image
  const featureImage =
    promotion?.featureImage1 ??
    storeFormData?.themeSettings?.aboutImage ??
    "/images/placeholders/feature-main.jpg";

  // Fallback perks if no promotion data
  const defaultPerks = [
    {
      id: "1",
      title: "Uncompromising Quality",
      icon: 'SparklesIcon',//<SparklesIcon className="w-8 h-8" />,
      description:
        "Our commitment to excellence ensures every service is performed to the highest standards.",
    },
    {
      id: "2",
      title: "Tailored Solutions",
      icon: 'SparklesIcon',//<PuzzlePieceIcon className="w-8 h-8" />,
      description:
        "We offer customized services designed to meet your unique needs and preferences.",
    },
    {
      id: "3",
      title: "Reliable & Efficient",
      icon: 'SparklesIcon',//<CheckCircleIcon className="w-8 h-8" />,
      description:
        "You can count on us for dependable service that is both fast and effective.",
    },
    {
      id: "4",
      title: "Innovative Approach",
      icon: 'SparklesIcon',//<RocketLaunchIcon className="w-8 h-8" />,
      description:
        "We utilize modern techniques and tools to provide a cutting-edge service experience.",
    },
  ];

  
  const perks =
    promotion?.perks?.length && promotion?.perks.length > 0
      ? promotion.perks.map((p) => ({
          id: p.id,
          title: p.label,
          icon: 'SparklesIcon',//<SparklesIcon className="w-8 h-8" />, // TODO: Map promotion.icon string -> actual icon component
          description: "", // IPromotion perks don’t have description, could extend type if needed
        }))
      : defaultPerks;

  // Trust Logos (fallback sample logos)
  const trustLogos =
    promotion?.trustLogos && promotion.trustLogos.length > 0
      ? promotion.trustLogos.map((t) => t.url)
      : [
          "/images/logos/google.svg",
          "/images/logos/microsoft.svg",
          "/images/logos/shopify.svg",
          "/images/logos/stripe.svg",
          "/images/logos/netflix.svg",
        ];

  // Animations
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const textReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="relative bg-gray-50 dark:bg-gray-950 py-16 lg:py-24 overflow-hidden text-gray-900 dark:text-gray-50">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 opacity-10 blur-3xl">
        <motion.div
          className="absolute rounded-full -top-20 -left-20 w-80 h-80"
          style={{ backgroundColor: primaryColor }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute rounded-full -bottom-20 -right-20 w-96 h-96"
          style={{ backgroundColor: secondaryColor }}
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "mirror",
            delay: 5,
          }}
        />
      </div>

      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          background: `radial-gradient(circle, ${primaryColor}20 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Trust Logos */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h3
            className="text-gray-600 dark:text-gray-400 text-lg font-semibold uppercase tracking-wider mb-8"
            variants={textReveal}
          >
            Trusted by
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundColor: `${primaryColor}` }}
            >
              {" "}
              Industry Leaders
            </span>
          </motion.h3>
          <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-8">
            {trustLogos.map((logoUrl, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                transition={{ delay: idx * 0.1 }}
              >
                <Image
                  loader={loader}
                  src={logoUrl}
                  alt={`Partner logo ${idx + 1}`}
                  width={120}
                  height={50}
                  className="object-contain h-12 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Excellence Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            viewport={{ once: true, amount: 0.3 }}
            className="relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group shadow-2xl"
          >
            <div
              className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 transform translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0"
              style={{ background: secondaryColor }}
            />
            <Image
              src={featureImage}
              alt={promotion?.title || "Our commitment to excellence"}
              layout="fill"
              objectFit="cover"
              className="rounded-3xl transition-all duration-500 ease-in-out group-hover:scale-105"
              loader={loader}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20" />
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-8 text-center lg:text-left flex flex-col justify-center"
          >
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
              variants={textReveal}
            >
              {(() => {
                const fullText = promotion?.title || "We’re Driven by Excellence";
                const words = fullText.trim().split(" ");
                const lastWord = words.pop(); // removes + returns last word
                const rest = words.join(" ");

                return (
                  <>
                    {rest}{" "}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${primaryColor})` }}
                    >
                      {lastWord}
                    </span>
                  </>
                );
              })()}
            </motion.h2>


            <motion.p
              className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 opacity-90"
              variants={textReveal}
            >
              {promotion?.description ||
                "We go beyond just providing a service. We're dedicated to crafting a seamless and exceptional experience, ensuring every detail is handled with precision and care."}
            </motion.p>

            {/* Perks */}
            <motion.ul
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 pt-4"
              variants={staggerContainer}
            >
              {perks.map((item, index) => {
                const Icon = resolveIcon(item.icon);

                return (
                  <motion.li
                    key={item.id || index}
                    variants={cardVariants}
                    className="flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 transform bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 group relative"
                  >
                    <div
                      className="flex-shrink-0 p-2 rounded-full text-white"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.description}
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
                  className="inline-block px-8 py-4 rounded-full text-white font-bold shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50"
                  style={
                    {
                      backgroundColor: primaryColor,
                      "--tw-ring-color": primaryColor,
                    } as React.CSSProperties
                  }
                >
                  {promotion.ctaText || "Explore Services"}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
