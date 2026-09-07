'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Define the API Base URL
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function ContactCTASection() {
  const { storeFormData } = useStoreContext();
  
  // Logic Integration: Get Company ID and Theme
  const companyId = storeFormData?.id;
  const { themeSettings } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#00A880';

  // State Management
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    if (submitStatus !== 'idle') setSubmitStatus('idle'); // Clear errors on type
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!form.fullName || !form.email || !form.message) {
      alert("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);

    // Format Message for Admin
    const formattedContent = `
NEW GENERAL INQUIRY

Name: ${form.fullName}
Email: ${form.email}

Message:
${form.message}
    `;

    try {
      const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyId,
          content: formattedContent,
        }),
      });

      if (!res.ok) throw new Error("API Error");

      setSubmitStatus('success');
      setForm({ fullName: '', email: '', message: '' }); // Reset form

    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative bg-gray-50 py-24 px-6 lg:px-12 text-gray-900 overflow-hidden">
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left - Content + Form */}
        <div>
          {/* Badge */}
          <motion.span
            className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            Get In Touch
          </motion.span>

          {/* Title */}
          <motion.h2
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-6 text-gray-900 leading-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            We'd Love to <span style={{ color: primaryColor }}>Hear From You</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="mt-4 text-lg text-gray-700 max-w-xl leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Whether you're curious about our services, need support, or just want to say hello — we're always ready to connect!
          </motion.p>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-6 max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                id="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Type your message..."
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto inline-flex items-center justify-center text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: primaryColor }}
              whileHover={!isSubmitting ? { scale: 1.05, boxShadow: "0 10px 30px rgba(0, 168, 128, 0.4)" } : {}}
              whileTap={!isSubmitting ? { scale: 0.97 } : {}}
            >
              {isSubmitting ? 'Sending...' : 'Send Your Message'}
              {!isSubmitting && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </motion.button>

            {/* Status Feedback */}
            {submitStatus === 'success' && (
              <p className="text-green-600 font-medium text-center animate-pulse">
                Message sent successfully! We'll be in touch soon.
              </p>
            )}
            {submitStatus === 'error' && (
              <p className="text-red-500 font-medium text-center">
                Something went wrong. Please try again later.
              </p>
            )}
          </form>

          {/* Live Support Hours + WhatsApp */}
          <div className="mt-12 space-y-4 text-md text-gray-600">
            <p className="flex items-center gap-2">
              <span className="text-emerald-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
              <strong className="text-gray-800">Support Hours:</strong> Mon–Sat, 8:00 AM – 8:00 PM EAT
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-500"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.557-3.84-1.557-5.887C.187 5.572 5.882.001 12.164.001c3.181 0 6.167 1.24 8.413 3.488 2.246 2.248 3.481 5.232 3.48 8.416-.001 6.183-5.704 11.87-11.987 11.87-.847 0-1.659-.119-2.433-.357L.057 24zm6.593-4.706c1.037.34 2.144.517 3.256.518 4.673 0 8.473-3.803 8.473-8.475S16.527 3.258 11.854 3.258C7.181 3.258 3.382 7.062 3.382 11.735c0 1.542.487 2.956 1.341 4.195l-.946 3.457 3.142-.997z"/></svg></span>
              <a href="https://wa.me/254712345678" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 hover:underline font-medium">Chat with us on WhatsApp</a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 1.5-3.375 3-7.5 3S6 13.5 6 12s3.375-3 7.5-3 7.5 1.5 7.5 3z" /></svg></span>
              <a href="#livechat" className="text-emerald-600 hover:text-emerald-800 hover:underline font-medium">Start a Live Chat</a>
            </p>
          </div>
        </div>

        {/* Right - Map */}
        <motion.div
          className="w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Note: Ensure this is a valid Google Maps Embed URL for your actual location */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8164801198533!2d36.817223!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf1f25b2447990!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            className="border-none w-full h-full"
            title="Our Location on Map"
          />
        </motion.div>
      </div>
    </section>
  );
}