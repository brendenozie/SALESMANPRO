// File: components/site/layouts/ServicesLayout/ServiceSite.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { useStoreContext } from "../../../../../contexts/StoreContext";
import bannerFallback from "../../../../../assets/homebanner.png";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/aboutUs";
import ExcellenceSection from "../components/ExcellenceSection";
import ServicesSection from "../components/ServicesSection";
import PricingSection from "../components/PricingSection";
import TestimonialSection from "../components/TestimonialSection";
import FAQSection from "../components/FAQSection";
import CleaningTipsSection from "../components/CleaningTipsSection";
import GetStartedSection from "../components/GetStartedSection";


const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

/**
 * ServiceSite now reads everything from StoreContext instead of using a
 * hard-coded `store` object. The hook `useStoreContext()` must return
 * your Prisma → StoreForm data (i.e. exactly what you passed as `initialStore` in
 * `StoreLayout`).
 */
export default function ServiceSite() {
  
  const { storeFormData } = useStoreContext();
  // storeFormData should be the same shape you constructed in StoreLayout

  // If there's any chance `storeFormData` is not yet loaded, guard early:
  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      <AboutSection />

      <ExcellenceSection />

      <ServicesSection />

      <PricingSection />

      <TestimonialSection />

      <FAQSection />

      <CleaningTipsSection />
     
      <BookingForm />

      <GetStartedSection />
     
    </>
  );
}







function BookingForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
    alert('Thank you! We will contact you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="booking" className="bg-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-4">Book Your Cleaning Service</h2>
        <p className="text-gray-600 mb-8">Fill in your details and we’ll get in touch with you.</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Your Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            placeholder="Describe your service needs..."
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </section>
  );
}
