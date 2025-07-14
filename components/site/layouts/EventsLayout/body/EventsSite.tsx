"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TagIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";

//----------------------------------------------
// Image loader (same as elsewhere)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

//----------------------------------------------
// EventsSite component, using StoreContext
//----------------------------------------------
export default function EventsSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    bannerUrl,
    storeCategories: categories,
    marketplaceListings: upcoming,
    testimonials,
    faqs,
  } = storeFormData;

  return (
    <div className="font-sans">
      {/* Hero */}
      <HeroComponent name={name} bannerUrl={bannerUrl} />

      {/* About */}
      <AboutSection description={description} />

      {/* Features */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Live Events */}
      <LiveEventsSection upcoming={upcoming} slug={slug} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* Pricing (for event organizers) */}
      <PricingSection />

      {/* FAQ */}
      <FAQSection faqs={faqs} />

      {/* Call To Action */}
      <section className="bg-indigo-600 text-white py-16 text-center relative">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Host With Us</h3>
        <p className="text-lg mb-6">
          Planning an event? Let us help you make it extraordinary.
        </p>
        <Link
          href={`/${slug}/host`}
          className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-indigo-100 transition"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}

