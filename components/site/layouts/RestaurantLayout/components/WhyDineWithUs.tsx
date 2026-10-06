"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { ICoreValue } from "@/types/typings";

/* ---------------------------------------------
   Image Loader
--------------------------------------------- */
const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

/* ---------------------------------------------
   Animation Variants
--------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 14 },
  },
};

/* ---------------------------------------------
   Fallback Core Values
--------------------------------------------- */
const fallbackValues: ICoreValue[] = [
  {
    id: "fresh",
    title: "Fresh & Local Ingredients",
    description:
      "We source quality ingredients locally to guarantee freshness and support our community.",
  },
  {
    id: "chefs",
    title: "Chef-Driven Cuisine",
    description:
      "Our kitchen is led by passion, precision, and creativity.",
  },
  {
    id: "ambience",
    title: "Warm & Inviting Ambience",
    description:
      "A cozy atmosphere perfect for intimate dinners and lively gatherings.",
  },
  {
    id: "service",
    title: "Exceptional Service",
    description:
      "Every guest is treated with care from arrival to dessert.",
  },
];

export default function WhyDineWithUs({ storeFormData }: { storeFormData: any }) {

  /* ---------------------------------------------
     Normalize Restaurant + Founder Data
  --------------------------------------------- */
  const restaurant = useMemo(() => {
    const founderName =
      storeFormData?.founderName ??
      storeFormData?.ownerName ??
      "Our Founder";

    const isChef = storeFormData?.founderIsHeadChef ?? true;

    return {
      name: storeFormData?.name ?? "Unbite",
      slug: storeFormData?.slug ?? "unbite",
      description:
        storeFormData?.description ??
        "Every dish tells a story — crafted with intention, passion, and respect for ingredients.",
      aboutImage:
        storeFormData?.aboutImageUrl ??
        storeFormData?.bannerUrl ??
        "/images/about-chef-story.jpg",
      founder: {
        name: founderName,
        role: isChef ? "Founder & Head Chef" : "Founder",
        image:
          storeFormData?.founderImage ??
          "/images/founder-placeholder.jpg",
        quote:
          storeFormData?.founderQuote ??
          "Great food begins with respect — for ingredients, people, and culture.",
      },
      coreValues:
        Array.isArray(storeFormData?.CoreValues) &&
        storeFormData.CoreValues.length > 0
          ? storeFormData.CoreValues
          : fallbackValues,
      theme: {
        primary: storeFormData?.themeSettings?.primaryColor ?? "#FF5722",
        secondary:
          storeFormData?.themeSettings?.secondaryColor ?? "#3F51B5",
      },
    };
  }, [storeFormData]);

  /* ---------------------------------------------
     Render
  --------------------------------------------- */
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest font-semibold mb-2"
            style={{ color: restaurant.theme.primary }}
          >
            Our Philosophy
          </motion.p>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Discover the {restaurant.name} Difference
          </motion.h2>
        </motion.div>

        {/* About + Founder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center mb-24">
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Image decoding="async"
              src={restaurant.aboutImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
              alt={`${restaurant.name} kitchen`}
              width={700}
              height={500}
              className="rounded-2xl shadow-xl"
            />
          </motion.div>

          <motion.div
            initial={{ x: 80, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Our Culinary Journey
            </h3>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {restaurant.description}
            </p>

            {/* Founder / Head Chef */}
            <div className="flex items-center gap-4 mb-6">
              <Image decoding="async"
                src={restaurant.founder.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                alt={restaurant.founder.name}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {restaurant.founder.name}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: restaurant.theme.primary }}
                >
                  {restaurant.founder.role}
                </p>
              </div>
            </div>

            <p className="italic text-gray-600 dark:text-gray-400 mb-6">
              “{restaurant.founder.quote}”
            </p>

            <Link
              href={`/restaurents/about`}
              className="inline-flex items-center px-6 py-3 rounded-full text-white font-semibold"
              style={{ backgroundColor: restaurant.theme.primary }}
            >
              Meet Our Chef
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {restaurant.coreValues.map((value) => (
            <motion.div
              key={value.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg"
            >
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${restaurant.theme.primary}20` }}
              >
                <SparklesIcon
                  className="w-8 h-8"
                  style={{ color: restaurant.theme.primary }}
                />
              </div>

              <h4 className="text-xl font-bold mb-3">
                {value.title}
              </h4>

              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}