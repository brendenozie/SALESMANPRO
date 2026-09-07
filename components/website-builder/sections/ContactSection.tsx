"use client";

import React, { useState } from "react";
import { ThemeTokens, SectionStyle } from "@/types/website-builder";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

interface ContactProps {
  content: {
    title?: string;
    subtitle?: string;
    showForm?: boolean;
    showDirectWhatsApp?: boolean;
    showOpeningHours?: boolean;
    showLocations?: boolean;
  };
  styles?: SectionStyle;
  theme: ThemeTokens;
  storeName?: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
}

export default function ContactSection({
  content,
  styles = {},
  theme,
  storeName = "Store",
  contactPhone,
  contactEmail,
  address,
}: ContactProps) {
  const {
    title = "Get in Touch",
    subtitle = "We're here to assist you with orders, inquiries, or support.",
    showForm = true,
    showDirectWhatsApp = true,
  } = content;

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    toast.success("Thank you! Your message has been received.");
  };

  const whatsappNumber = contactPhone ? contactPhone.replace(/\D/g, "") : "";

  return (
    <section
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      style={{
        backgroundColor: styles.backgroundColor || undefined,
        color: styles.textColor || undefined,
      }}
    >
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Touchpoints Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6 shadow-xs">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white">
              Direct Channels
            </h3>

            {contactPhone && (
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-xl shrink-0"
                  style={{ backgroundColor: `${theme.primaryColor}14`, color: theme.primaryColor }}
                >
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone Support</h4>
                  <a href={`tel:${contactPhone}`} className="text-base font-bold text-zinc-900 dark:text-white hover:underline">
                    {contactPhone}
                  </a>
                </div>
              </div>
            )}

            {contactEmail && (
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-xl shrink-0"
                  style={{ backgroundColor: `${theme.primaryColor}14`, color: theme.primaryColor }}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Inquiry</h4>
                  <a href={`mailto:${contactEmail}`} className="text-base font-bold text-zinc-900 dark:text-white hover:underline">
                    {contactEmail}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-xl shrink-0"
                style={{ backgroundColor: `${theme.primaryColor}14`, color: theme.primaryColor }}
              >
                <MapPinIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Physical Store</h4>
                <p className="text-base font-bold text-zinc-900 dark:text-white">
                  {address || "Nairobi Commercial District, Kenya"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-xl shrink-0"
                style={{ backgroundColor: `${theme.primaryColor}14`, color: theme.primaryColor }}
              >
                <ClockIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Business Hours</h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Mon – Sat: 8:00 AM – 6:00 PM<br />Sunday: Closed
                </p>
              </div>
            </div>

            {showDirectWhatsApp && whatsappNumber && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hello%20${encodeURIComponent(storeName)}%2C%20I%20have%20an%20inquiry.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-md"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  <span>Start Instant WhatsApp Chat</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Contact Inquiry Form */}
        {showForm && (
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              {formSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                    Message Sent Successfully
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 max-w-md mx-auto text-sm">
                    Our team will review your inquiry and get back to you shortly via email or phone.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">
                    Send Us a Direct Message
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                      placeholder="0712 345 678"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                      placeholder="How can we assist you today?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-98"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
