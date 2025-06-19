'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ContactSection({ email, phoneNumber }: { email: string; phoneNumber: string }) {
  return (
    <section className="bg-white py-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4"
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
          Have a question, proposal, or just want to say hi? Send a message below or reach out via WhatsApp.
        </motion.p>

        {/* Layout: Form + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-2xl shadow-md">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what’s on your mind"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Send Message
              </button>
            </form>

            {/* Contact Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              <Link
                href={`mailto:${email}`}
                className="flex items-center justify-center gap-2 text-teal-700 font-medium hover:underline"
              >
                <EnvelopeIcon className="w-5 h-5" /> {email}
              </Link>
              <Link
                href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
                target="_blank"
                className="flex items-center justify-center gap-2 text-green-600 font-medium hover:underline"
              >
                <PhoneIcon className="w-5 h-5" /> WhatsApp Chat
              </Link>
            </div>
          </div>

          {/* Google Map Embed */}
          <div className="rounded-2xl overflow-hidden shadow-md h-[450px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1994.401648!2d36.821946!3d-1.292066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f116c1b2d4f23%3A0x7ddda7f267f4edc!2sNairobi%20CBD%2C%20Kenya!5e0!3m2!1sen!2ske!4v1687056934524"
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
