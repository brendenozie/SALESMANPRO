'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ContactCTASection() {
  return (
    <section id="contact" className="relative bg-gray-950 py-24 px-6 text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 via-black to-gray-950" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left - Content + Form */}
        <div>
          {/* Badge */}
          <motion.span
            className="inline-block bg-rose-100 text-rose-600 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Contact Us
          </motion.span>

          {/* Title */}
          <motion.h2
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We’d Love to Hear From You
          </motion.h2>

          {/* Description */}
          <motion.p
            className="mt-4 text-lg text-gray-300 max-w-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Whether you're curious about our services, need support, or want to say hello — we're just a message away.
          </motion.p>

          {/* Contact Form */}
          <form className="mt-8 space-y-5 max-w-xl">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Message</label>
              <textarea
                rows={4}
                placeholder="Type your message..."
                className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <motion.button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 rounded-full transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Send Message
            </motion.button>
          </form>

          {/* Live Support Hours + WhatsApp */}
          <div className="mt-10 space-y-3 text-sm text-gray-400">
            <p>
              🕒 <strong className="text-white">Support Hours:</strong> Mon–Sat, 8:00 AM – 8:00 PM
            </p>
            <p>
              📱 <a href="https://wa.me/254712345678" target="_blank" className="text-rose-400 hover:underline">Chat with us on WhatsApp</a>
            </p>
            <p>
              💬 <a href="#livechat" className="text-rose-400 hover:underline">Start a Live Chat</a>
            </p>
          </div>
        </div>

        {/* Right - Map */}
        <motion.div
          className="w-full h-[450px] rounded-3xl overflow-hidden shadow-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.136086443943!2d36.8219463!3d-1.2920651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173d773a7c3f%3A0x83c13e9c3b9d046a!2sNairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            className="border-none w-full h-full"
          />
        </motion.div>
      </div>
    </section>
  );
}
