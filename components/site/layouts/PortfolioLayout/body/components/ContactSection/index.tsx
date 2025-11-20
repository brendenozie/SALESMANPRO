'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'; // Updated icons for better visual cues
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

// Type definitions for clarity
interface GeoLocation {
  lat: number;
  lng: number;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

interface StoreFormData {
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  geoLocation?: GeoLocation;
  themeSettings?: ThemeSettings;
  name?: string; // Company/Personal name for personalization
}

export default function ContactSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const {
    contactEmail,
    contactPhone,
    address,
    geoLocation,
    themeSettings = {},
    name,
  } = storeFormData;

  // Theme colors - using more robust defaults and new variables for consistency
  const primaryColor = themeSettings.primaryColor || '#007bff'; // Vibrant blue
  const secondaryColor = themeSettings.secondaryColor || '#6c757d'; // Complementary gray
  const sectionBgColor = themeSettings.backgroundColor || '#f0f4f8'; // Light blue-gray for the section background
  const formBgColor = '#ffffff'; // White for the form card
  const textColor = themeSettings.textColor || '#1a202c'; // Dark text for headings
  const placeholderColor = '#a0aec0'; // Tailwind gray-400 for input placeholders
  const focusRingColor = `${primaryColor}60`; // Primary color with 60% opacity for focus ring

  // State for form fields (for controlled inputs, though submission logic isn't here)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would handle form submission here (e.g., send to an API)
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ fullName: '', email: '', message: '' }); // Clear form
  };

  // Build WhatsApp link if phone exists
  const sanitizedPhone = contactPhone ? contactPhone.replace(/\D/g, '') : '';
  const whatsappHref = sanitizedPhone ? `https://wa.me/${sanitizedPhone}` : '';

  // Map embed URL: using a more robust and correct Google Maps embed structure
  let mapSrc = ""
  if (geoLocation && typeof geoLocation.lat === 'number' && typeof geoLocation.lng === 'number') {
    mapSrc = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15955.123456789012!2d" + geoLocation.lng + "!3d" + geoLocation.lat + "!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z" + geoLocation.lat + "N" + geoLocation.lng + "E!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"; 
  } else if (address) {
    const encodedAddress = encodeURIComponent(address);
    mapSrc = `https://www.google.com/maps/embed?q=${encodedAddress}&output=embed`;
  } else {
    mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8164801198533!2d36.817223!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf1f25b2447990!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske";
  }

  // Framer Motion variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <motion.section
      id="contact"
      className="relative py-24 md:py-32 px-6 lg:px-12 overflow-hidden"
      style={{ backgroundColor: sectionBgColor }} // Dynamic section background
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      {/* Subtle Background Elements */}
      <div
        className="absolute top-0 left-0 w-1/4 h-1/4 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        style={{ background: primaryColor }}
      />
      <div
        className="absolute bottom-0 right-0 w-1/4 h-1/4 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        style={{ background: secondaryColor }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-gray-900 drop-shadow-sm"
            style={{ color: textColor }}
            variants={itemVariants}
          >
            Let's Connect & <span style={{ color: primaryColor }}>Build Something Great</span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Have a question, an exciting project, or just want to say hello? Reach out to {name || 'us'} – we'd love to hear from you!
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"> {/* Align items at start */}
          {/* Contact Form */}
          <motion.div
            className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700" // Elevated form card
            style={{ backgroundColor: formBgColor }}
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Your full name"
                  className="mt-1 w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  // style={{ borderColor: borderColor, focusRingColor: focusRingColor }} // Explicit border for consistency
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  // style={{ borderColor: borderColor, focusRingColor: focusRingColor }}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5} // Slightly more rows for message
                  placeholder="Tell us about your project or inquiry..."
                  className="mt-1 w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-y" // Allow vertical resize
                  // style={{ borderColor: borderColor, focusRingColor: focusRingColor }}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <motion.button
                type="submit"
                className="w-full text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg focus:outline-none focus:ring-4"
                style={{ backgroundColor: primaryColor, boxShadow: `0 0 0 3px ${focusRingColor}` }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </motion.button>
            </form>
            </motion.div>

          {/* Contact Information & Map */}
          <div className="flex flex-col gap-12">
            {/* Contact Details Card */}
            <motion.div
              className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between" // Elevated card
              style={{ backgroundColor: formBgColor }}
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Direct Contact</h3>
              <div className="space-y-6 text-lg">
                {contactEmail && (
                  <Link
                    href={`mailto:${contactEmail}`}
                    className="flex items-start gap-4 text-gray-800 hover:text-gray-900 transition-colors group"
                  >
                    <EnvelopeIcon className="w-8 h-8 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
                    <div>
                      <span className="block font-medium">Email Us</span>
                      <span className="block text-base text-gray-600 group-hover:underline" style={{ color: primaryColor }}>{contactEmail}</span>
                    </div>
                  </Link>
                )}
                {contactPhone && (
                  <Link
                    href={`tel:${contactPhone}`}
                    className="flex items-start gap-4 text-gray-800 hover:text-gray-900 transition-colors group"
                  >
                    <PhoneIcon className="w-8 h-8 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
                    <div>
                      <span className="block font-medium">Call Us</span>
                      <span className="block text-base text-gray-600 group-hover:underline" style={{ color: primaryColor }}>{contactPhone}</span>
                    </div>
                  </Link>
                )}
                {whatsappHref && (
                  <Link
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 text-gray-800 hover:text-gray-900 transition-colors group"
                  >
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
                    <div>
                      <span className="block font-medium">WhatsApp</span>
                      <span className="block text-base text-gray-600 group-hover:underline" style={{ color: primaryColor }}>Start a chat</span>
                    </div>
                  </Link>
                )}
                {address && (
                  <Link
                    href={mapSrc} // Link directly to map if address exists
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 text-gray-800 hover:text-gray-900 transition-colors group"
                  >
                    <MapPinIcon className="w-8 h-8 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
                    <div>
                      <span className="block font-medium">Our Location</span>
                      <span className="block text-base text-gray-600 group-hover:underline">{address}</span>
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Google Map Embed */}
            <motion.div
              className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 h-[350px] md:h-[450px] lg:h-full" // Increased height and rounded borders
              variants={itemVariants}
            >
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }} // Remove default iframe border
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" // Recommended for embeds
                title="Our Location" // Accessible title for the iframe
              ></iframe>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}