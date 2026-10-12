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
import { EditableElement } from "@/contexts/EditableContentContext";

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
          <EditableElement
            targetId="WhyDineWithUs.eyebrow"
            componentKey="WhyDineWithUs"
            elementKey="eyebrow"
            label="Section Eyebrow"
            defaultValue="Our Philosophy"
            inline
          >
            {(val) => (
              <motion.p
                variants={itemVariants}
                className="text-sm uppercase tracking-widest font-semibold mb-2"
                style={{ color: restaurant.theme.primary }}
              >
                {val ?? "Our Philosophy"}
              </motion.p>
            )}
          </EditableElement>

          <EditableElement
            targetId="WhyDineWithUs.title"
            componentKey="WhyDineWithUs"
            elementKey="title"
            label="Section Title"
            defaultValue={`Discover the ${restaurant.name} Difference`}
          >
            {(val) => (
              <motion.h2
                variants={itemVariants}
                className="text-4xl md:text-5xl font-extrabold"
              >
                {val ?? `Discover the ${restaurant.name} Difference`}
              </motion.h2>
            )}
          </EditableElement>
        </motion.div>

        {/* About + Founder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center mb-24">
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <EditableElement
              targetId="WhyDineWithUs.aboutImage"
              componentKey="WhyDineWithUs"
              elementKey="aboutImage"
              label="Kitchen / About Image"
              type="image"
              defaultValue={restaurant.aboutImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
            >
              {(val) => (
                <Image decoding="async"
                  src={val || restaurant.aboutImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                  alt={`${restaurant.name} kitchen`}
                  width={700}
                  height={500}
                  className="rounded-2xl shadow-xl"
                />
              )}
            </EditableElement>
          </motion.div>

          <motion.div
            initial={{ x: 80, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <EditableElement
              targetId="WhyDineWithUs.chefTitle"
              componentKey="WhyDineWithUs"
              elementKey="chefTitle"
              label="Chef Story Title"
              defaultValue="Our Culinary Journey"
            >
              {(val) => (
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  {val ?? "Our Culinary Journey"}
                </h3>
              )}
            </EditableElement>

            <EditableElement
              targetId="WhyDineWithUs.description"
              componentKey="WhyDineWithUs"
              elementKey="description"
              label="Restaurant Story"
              type="textarea"
              defaultValue={restaurant.description}
            >
              {(val) => (
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  {val ?? restaurant.description}
                </p>
              )}
            </EditableElement>

            {/* Founder / Head Chef */}
            <div className="flex items-center gap-4 mb-6">
              <EditableElement
                targetId="WhyDineWithUs.founderImage"
                componentKey="WhyDineWithUs"
                elementKey="founderImage"
                label="Founder Image"
                type="image"
                defaultValue={restaurant.founder.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
              >
                {(val) => (
                  <Image decoding="async"
                    src={val || restaurant.founder.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                    alt={restaurant.founder.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                )}
              </EditableElement>
              <div>
                <EditableElement
                  targetId="WhyDineWithUs.founderName"
                  componentKey="WhyDineWithUs"
                  elementKey="founderName"
                  label="Founder Name"
                  defaultValue={restaurant.founder.name}
                >
                  {(val) => (
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {val ?? restaurant.founder.name}
                    </p>
                  )}
                </EditableElement>
                <EditableElement
                  targetId="WhyDineWithUs.founderRole"
                  componentKey="WhyDineWithUs"
                  elementKey="founderRole"
                  label="Founder Role"
                  defaultValue={restaurant.founder.role}
                >
                  {(val) => (
                    <p
                      className="text-sm font-semibold"
                      style={{ color: restaurant.theme.primary }}
                    >
                      {val ?? restaurant.founder.role}
                    </p>
                  )}
                </EditableElement>
              </div>
            </div>

            <EditableElement
              targetId="WhyDineWithUs.founderQuote"
              componentKey="WhyDineWithUs"
              elementKey="founderQuote"
              label="Founder Quote"
              type="textarea"
              defaultValue={restaurant.founder.quote}
            >
              {(val) => (
                <p className="italic text-gray-600 dark:text-gray-400 mb-6">
                  “{val ?? restaurant.founder.quote}”
                </p>
              )}
            </EditableElement>

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
          {restaurant.coreValues.map((value, idx) => (
            <motion.div
              key={value.id ?? idx}
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

              <EditableElement
                targetId={`WhyDineWithUs.feature.${idx}.title`}
                componentKey="WhyDineWithUs"
                elementKey="title"
                label={`Value #${idx + 1} Title`}
                defaultValue={value.title}
              >
                {(val) => (
                  <h4 className="text-xl font-bold mb-3">
                    {val ?? value.title}
                  </h4>
                )}
              </EditableElement>

              <EditableElement
                targetId={`WhyDineWithUs.feature.${idx}.description`}
                componentKey="WhyDineWithUs"
                elementKey="description"
                label={`Value #${idx + 1} Description`}
                type="textarea"
                defaultValue={value.description}
              >
                {(val) => (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {val ?? value.description}
                  </p>
                )}
              </EditableElement>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}