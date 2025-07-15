"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Essential contact icons

// Framer Motion variants (reusing for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

// Colors (matching the previous sections)
const darkBackground = "#0A192F"; // Main section background
const cardBackground = "#1B2A41"; // Used for form/info cards
const accentColor = "#66B2FF"; // Bright blue for highlights/CTA
const textColorLight = "#E0E7FF"; // Lighter blue for text on dark background
const textColorMuted = "#A7B8D6"; // Muted blue for secondary text

export default function ContactSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send data to an API)
    alert('Message sent successfully! (This is a placeholder action)');
  };

  return (
    <section
      id="contact-us"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: darkBackground }} // Consistent dark background
    >
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image
          src="/images/lines-pattern-dark.svg" // Subtle lines or grid pattern
          alt="background pattern"
          fill
          className="object-cover"
          style={{ mixBlendMode: "overlay" }}
          loader={({ src, width, quality }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Let's Connect & Collaborate
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Reach out to our team for tailored legal and financial guidance. We're here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          {/* Contact Information & Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col bg-gradient-to-br from-[#1B2A41] to-[#122033] rounded-3xl shadow-xl p-8 sm:p-10 border border-transparent hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
          >
            <h3 className="text-3xl font-bold text-white mb-6">Send Us a Message</h3>
            <p className="text-blue-100/80 mb-8 leading-relaxed">
              Whether you have a specific inquiry or just want to learn more, fill out the form below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.input
                  variants={itemVariants}
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-4 rounded-xl bg-[#0A192F] text-white placeholder-blue-300/60 border border-blue-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
                  required
                />
                <motion.input
                  variants={itemVariants}
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-4 rounded-xl bg-[#0A192F] text-white placeholder-blue-300/60 border border-blue-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
                  required
                />
              </div>
              <motion.input
                variants={itemVariants}
                type="text"
                placeholder="Subject"
                className="w-full p-4 rounded-xl bg-[#0A192F] text-white placeholder-blue-300/60 border border-blue-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
                required
              />
              <motion.textarea
                variants={itemVariants}
                placeholder="Your Message"
                rows={5}
                className="w-full p-4 rounded-xl bg-[#0A192F] text-white placeholder-blue-300/60 border border-blue-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200 resize-y"
                required
              />
              <motion.button
                variants={itemVariants}
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(96, 165, 250, 0.4)" }} // Blue glow on hover
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto mt-4 px-8 py-4 rounded-full font-semibold text-lg bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center"
              >
                Send Message
                <ArrowRightIcon className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </form>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-12 pt-8 border-t border-blue-700/50 space-y-5"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Contact Information</h3>
              <motion.div variants={itemVariants} className="flex items-center space-x-4">
                <PhoneIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-blue-100 hover:text-white transition-colors duration-200 text-lg">+1 (234) 567-890</a>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center space-x-4">
                <EnvelopeIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@yourcompany.com" className="text-blue-100 hover:text-white transition-colors duration-200 text-lg">info@yourcompany.com</a>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-start space-x-4">
                <MapPinIcon className="h-7 w-7 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-blue-100 text-lg">
                  123 Lumina Tower, Suite 500<br />
                  Strategic Avenue, Nairobi, Kenya
                </p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center space-x-4">
                <ClockIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                <p className="text-blue-100 text-lg">Mon-Fri: 9:00 AM - 5:00 PM EAT</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Embedded Map */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="w-full h-[500px] lg:h-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-800 hover:border-blue-500 transition-colors duration-300"
          >
            {/* IMPORTANT: Replace "YOUR_Maps_EMBED_API_KEY" with your actual API key */}
            {/* Get your embed code from Google Maps: https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=Your+Business+Address */}
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=YOUR_Maps_EMBED_API_KEY&q=Lumina+Tower+Strategic+Avenue+Nairobi+Kenya`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-none"
              title="Our Office Location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}