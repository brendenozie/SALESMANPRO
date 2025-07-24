"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { StoreForm } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";


export default function CallToActionSection() {

  const { storeFormData } = useStoreContext() as { storeFormData : StoreForm };
  
  const store = storeFormData;

  // Pull dynamic CTA text from themeSettings, with sensible fallbacks
  const headline =
    store.themeSettings?.ctaHeadline ||
    "Ready to Host With Us?";
  const subtext =
    store.themeSettings?.ctaSubtext ||
    "Bring your vision to life and connect with your audience. We'll help you make every event extraordinary.";
  const buttonText =
    store.themeSettings?.ctaButtonText ||
    "Get Started Now";
  const path =
    store.themeSettings?.ctaPath ||
    `/${store.slug}/host`;

  return (
    <section className="relative bg-gray-900 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden text-center">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6"
        >
          {headline.split(/<span>|<\/span>/g).map((chunk:any, i:any) =>
            i % 2 === 1 ? (
              <span
                key={i}
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
              >
                {chunk}
              </span>
            ) : (
              <React.Fragment key={i}>{chunk}</React.Fragment>
            )
          )}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-xl text-gray-300 mb-12 max-w-xl mx-auto leading-relaxed"
        >
          {subtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <Link
            href={path}
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-indigo-600 text-white rounded-full
                       hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {buttonText}
            <ArrowRightIcon className="ml-3 w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
