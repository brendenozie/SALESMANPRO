"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

// --- Light Theme Colors ---
const lightBackground = "#F9FAFB";
const cardBackground = "#FFFFFF";
const accentColor = "#2563EB"; // modern blue accent
const textPrimary = "#1F2937";
const textMuted = "#6B7280";

export default function ContactSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent successfully! (This is a placeholder action)");
  };

  return (
    <section
      id="contact"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: lightBackground }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Image
          src="/images/lines-pattern-light.svg"
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
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Let’s Connect & Collaborate
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Reach out to our team for tailored legal and financial guidance.
            We’re here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          {/* Contact Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg p-8 sm:p-10 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Send Us a Message
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you have a specific inquiry or just want to learn more,
              fill out the form below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.input
                  variants={itemVariants}
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-4 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200"
                  required
                />
                <motion.input
                  variants={itemVariants}
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-4 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200"
                  required
                />
              </div>

              <motion.input
                variants={itemVariants}
                type="text"
                placeholder="Subject"
                className="w-full p-4 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200"
                required
              />

              <motion.textarea
                variants={itemVariants}
                placeholder="Your Message"
                rows={5}
                className="w-full p-4 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 resize-y"
                required
              />

              <motion.button
                variants={itemVariants}
                type="submit"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto mt-4 px-8 py-4 rounded-full font-semibold text-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center"
              >
                Send Message
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300" />
              </motion.button>
            </form>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-12 pt-8 border-t border-gray-200 space-y-5"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Information
              </h3>

              <motion.div variants={itemVariants} className="flex items-center space-x-4">
                <PhoneIcon className="h-6 w-6 text-blue-600" />
                <a
                  href="tel:+1234567890"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 text-lg"
                >
                  +1 (234) 567-890
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-4">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                <a
                  href="mailto:info@yourcompany.com"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 text-lg"
                >
                  info@yourcompany.com
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start space-x-4">
                <MapPinIcon className="h-6 w-6 text-blue-600 mt-1" />
                <p className="text-gray-700 text-lg">
                  123 Lumina Tower, Suite 500
                  <br />
                  Strategic Avenue, Nairobi, Kenya
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-4">
                <ClockIcon className="h-6 w-6 text-blue-600" />
                <p className="text-gray-700 text-lg">Mon–Fri: 9:00 AM – 5:00 PM EAT</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="w-full h-[500px] lg:h-auto rounded-3xl overflow-hidden shadow-xl border border-gray-200 hover:border-blue-300 transition-colors duration-300"
          >
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1994.1234567890123!2d36.821946!3d-1.292066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10a4b8c5b6b7%3A0xabcdef1234567890!2sLumina%20Tower%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1616161616161!5m2!1sen!2sus`}
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
