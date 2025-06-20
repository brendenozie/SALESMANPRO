'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const {
    contactEmail,
    contactPhone,
    address,
    geoLocation,
    themeSettings = {},
    name,
  } = storeFormData;

  // Theme colors
  const primaryColor = themeSettings.primaryColor || '#14B8A6'; // fallback teal
  const focusRing = `${primaryColor}80`; // semi-transparent for focus

  // Build WhatsApp link if phone exists
  const sanitizedPhone = contactPhone ? contactPhone.replace(/\D/g, '') : '';
  const whatsappHref = sanitizedPhone
    ? `https://wa.me/${sanitizedPhone}`
    : '';

  // Map embed URL: use geoLocation if available, else encode address, else default Nairobi
  let mapSrc = '';
  if (geoLocation && typeof geoLocation.lat === 'number' && typeof geoLocation.lng === 'number') {
    mapSrc = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d0!2d${geoLocation.lng}!3d${geoLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1`;
  } else if (address) {
    const encoded = encodeURIComponent(address);
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encoded}`;
  } else {
    // default to Nairobi CBD
    mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1994.4!2d36.8219!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1`;
  }

  return (
    <section className="bg-white py-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-4"
          style={{ color: '#1f2937' }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Let’s Work Together
        </motion.h2>

        <motion.p
          className="text-center text-gray-600 text-lg max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Have a question, proposal, or just want to say hi? Send a message below or reach out directly.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-2xl shadow-md">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                  style={{
                    boxShadow: `0 0 0 3px transparent`,
                  }}
                  onFocus={e =>
                    (e.currentTarget.style.boxShadow = `0 0 0 3px ${focusRing}`)
                  }
                  onBlur={e => (e.currentTarget.style.boxShadow = '0 0 0 3px transparent')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                  style={{ boxShadow: `0 0 0 3px transparent` }}
                  onFocus={e =>
                    (e.currentTarget.style.boxShadow = `0 0 0 3px ${focusRing}`)
                  }
                  onBlur={e => (e.currentTarget.style.boxShadow = '0 0 0 3px transparent')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what’s on your mind"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                  style={{ boxShadow: `0 0 0 3px transparent` }}
                  onFocus={e =>
                    (e.currentTarget.style.boxShadow = `0 0 0 3px ${focusRing}`)
                  }
                  onBlur={e => (e.currentTarget.style.boxShadow = '0 0 0 3px transparent')}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full text-white font-semibold py-3 px-6 rounded-lg transition"
                style={{ backgroundColor: primaryColor }}
              >
                Send Message
              </button>
            </form>

            {/* Contact Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              {contactEmail && (
                <Link
                  href={`mailto:${contactEmail}`}
                  className="flex items-center justify-center gap-2 font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  <EnvelopeIcon className="w-5 h-5" /> {contactEmail}
                </Link>
              )}
              {whatsappHref && (
                <Link
                  href={whatsappHref}
                  target="_blank"
                  className="flex items-center justify-center gap-2 font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  <PhoneIcon className="w-5 h-5" /> WhatsApp Chat
                </Link>
              )}
              {address && (
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <MapPinIcon className="w-5 h-5" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Google Map Embed */}
          <div className="rounded-2xl overflow-hidden shadow-md h-[450px]">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              allowFullScreen
              loading="lazy"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
