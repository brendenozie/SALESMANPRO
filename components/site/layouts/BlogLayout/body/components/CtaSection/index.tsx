"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStoreContext } from '@/contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function CtaSection() {
  const { storeFormData } = useStoreContext() || {};
  const {
    name = "News Updates",
    domain = "#",
    themeSettings: { primaryColor = "#ef4444" } = {},
  } = storeFormData || {};

  const title = `Stay Updated with ${name}`;
  const subtitle = `Subscribe to our newsletter and get the latest posts from ${name}`;
  const buttonLabel = "Subscribe Now";
  const actionHref = domain.endsWith('/') ? `${domain}subscribe` : `${domain}/subscribe`;

  return (
    <section className="bg-gray-800 text-white rounded-2xl p-8 text-center">
      {/* CTA Subscribe Section */}
      <motion.h2
        className="text-2xl font-semibold mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {title}
      </motion.h2>
      <motion.p
        className="mb-6 text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {subtitle}
      </motion.p>
      <div className="flex justify-center">
        <input
          type="email"
          placeholder="Enter your email..."
          className="w-full max-w-md p-3 rounded-l-xl text-gray-800 focus:outline-none"
        />
        <Link href={actionHref} passHref>
          <motion.a
            className="px-6 rounded-r-xl font-medium transition"
            style={{ backgroundColor: primaryColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {buttonLabel}
          </motion.a>
        </Link>
      </div>
    </section>
  );
}
