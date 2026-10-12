// File: components/site/layouts/HealthcareLayout/body/components/CTASection/index.tsx

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon, 
  CalendarDaysIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/solid';
import { EditableElement } from '@/contexts/EditableContentContext';

interface OpeningHours {
  mon: { open: string; close: string } | string;
  tue: { open: string; close: string } | string;
  wed: { open: string; close: string } | string;
  thu: { open: string; close: string } | string;
  fri: { open: string; close: string } | string;
  sat: { open: string; close: string } | string;
  sun: { open: string; close: string } | string;
}

interface ContactSectionProps {
  storeSlug: string;
  phoneNumber: string;
  email: string;
  address: string;
  openingHours: OpeningHours;
  mapLink?: string;
}

export default function ContactSection({ 
  storeSlug, 
  phoneNumber, 
  email, 
  address, 
  openingHours, 
  mapLink 
}: ContactSectionProps) {
  const router = useRouter();

  // Unified animation definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const formatOpeningHours = () => {
    if (!openingHours || Object.keys(openingHours).length === 0) {
      return (
        <li className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">
          Hours currently unavailable.
        </li>
      );
    }

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    return days.map(dayKey => {
      const day = openingHours[dayKey as keyof OpeningHours];
      const dayName = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);

      if (typeof day === 'string' && day.length === 0) {
        return (
          <li key={dayKey} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
            <span className="font-medium text-gray-600 dark:text-gray-400">{dayName}</span>
            <span className="text-red-500 dark:text-red-400 font-semibold text-xs bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">Closed</span>
          </li>
        );
      } else if (typeof day === 'object' && day?.open && day?.close) {
        return (
          <li key={dayKey} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
            <span className="font-medium text-gray-700 dark:text-gray-300">{dayName}</span>
            <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">{day.open} - {day.close}</span>
          </li>
        );
      }
      return null;
    });
  };

  return (
    <section id="contact" className="bg-gradient-to-b from-white via-slate-50 to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 py-24 lg:py-32 relative overflow-hidden">
      {/* Immersive Organic Glow Backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-20">
        <div className="absolute w-[500px] h-[500px] bg-teal-200 dark:bg-teal-900/30 rounded-full blur-[120px] -top-40 -left-20 mix-blend-multiply" />
        <div className="absolute w-[600px] h-[600px] bg-blue-200 dark:bg-blue-900/30 rounded-full blur-[140px] -bottom-60 -right-20 mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <EditableElement
            targetId="healthcare.home.contact.badge"
            componentKey="ContactSection"
            elementKey="badge"
            label="Contact Badge"
            defaultValue="Contact Center"
            inline
          >
            {(val) => (
              <motion.span 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/40 uppercase mb-4"
              >
                {val || "Contact Center"}
              </motion.span>
            )}
          </EditableElement>
          
          <EditableElement
            targetId="healthcare.home.contact.title"
            componentKey="ContactSection"
            elementKey="title"
            label="Contact Title"
            defaultValue="Connect With Our Caring Team"
          >
            {(val) => (
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white"
              >
                {val || (
                  <>
                    Connect With Our <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-blue-400">Caring Team</span>
                  </>
                )}
              </motion.h2>
            )}
          </EditableElement>
          
          <EditableElement
            targetId="healthcare.home.contact.description"
            componentKey="ContactSection"
            elementKey="description"
            label="Contact Description"
            defaultValue="We are accessible through multiple channels to support you or provide specialized guidance exactly when you need it."
          >
            {(val) => (
              <motion.p 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-gray-600 dark:text-gray-400 mt-4 leading-relaxed"
              >
                {val || "We are accessible through multiple channels to support you or provide specialized guidance exactly when you need it."}
              </motion.p>
            )}
          </EditableElement>
        </div>

        {/* 3x2 Grid Matrix */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
        >
          {/* Phone Card */}
          <motion.a
            href={`tel:${phoneNumber}`}
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex flex-col p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-md shadow-gray-100/50 dark:shadow-none group transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <PhoneIcon className="w-6 h-6" />
            </div>
            <EditableElement
              targetId="healthcare.home.contact.phoneTitle"
              componentKey="ContactSection"
              elementKey="phoneTitle"
              label="Phone Title"
              defaultValue="Call Direct"
            >
              {(val) => <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{val || "Call Direct"}</h3>}
            </EditableElement>
            <EditableElement
              targetId="healthcare.home.contact.phoneDesc"
              componentKey="ContactSection"
              elementKey="phoneDesc"
              label="Phone Description"
              defaultValue="Speak directly with our front desk team for urgent inquiries."
            >
              {(val) => <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">{val || "Speak directly with our front desk team for urgent inquiries."}</p>}
            </EditableElement>
            <EditableElement
              targetId="healthcare.home.contact.phoneNumber"
              componentKey="ContactSection"
              elementKey="phoneNumber"
              label="Phone Number"
              defaultValue={phoneNumber}
              inline
            >
              {(val) => <span className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-auto break-all">{val || phoneNumber}</span>}
            </EditableElement>
          </motion.a>

          {/* Email Card */}
          <motion.a
            href={`mailto:${email}`}
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex flex-col p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-md shadow-gray-100/50 dark:shadow-none group transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <EnvelopeIcon className="w-6 h-6" />
            </div>
            <EditableElement
              targetId="healthcare.home.contact.emailTitle"
              componentKey="ContactSection"
              elementKey="emailTitle"
              label="Email Title"
              defaultValue="Email Desk"
            >
              {(val) => <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{val || "Email Desk"}</h3>}
            </EditableElement>
            <EditableElement
              targetId="healthcare.home.contact.emailDesc"
              componentKey="ContactSection"
              elementKey="emailDesc"
              label="Email Description"
              defaultValue="For corporate inquiries, records, or detailed medical consultation follow-ups."
            >
              {(val) => <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">{val || "For corporate inquiries, records, or detailed medical consultation follow-ups."}</p>}
            </EditableElement>
            <EditableElement
              targetId="healthcare.home.contact.emailAddress"
              componentKey="ContactSection"
              elementKey="emailAddress"
              label="Email Address"
              defaultValue={email}
              inline
            >
              {(val) => <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-auto break-all">{val || email}</span>}
            </EditableElement>
          </motion.a>

          {/* Address Card */}
          <motion.a
            href={mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex flex-col p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-md shadow-gray-100/50 dark:shadow-none group transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mb-6 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
              <MapPinIcon className="w-6 h-6" />
            </div>
            <EditableElement
              targetId="healthcare.home.contact.addressTitle"
              componentKey="ContactSection"
              elementKey="addressTitle"
              label="Location Title"
              defaultValue="Our Location"
            >
              {(val) => <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{val || "Our Location"}</h3>}
            </EditableElement>
            <EditableElement
              targetId="healthcare.home.contact.addressDesc"
              componentKey="ContactSection"
              elementKey="addressDesc"
              label="Location Description"
              defaultValue="Find your way easily using pinned GPS navigators."
            >
              {(val) => <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">{val || "Find your way easily using pinned GPS navigators."}</p>}
            </EditableElement>
            <EditableElement
              targetId="healthcare.home.contact.addressLocation"
              componentKey="ContactSection"
              elementKey="addressLocation"
              label="Physical Address"
              defaultValue={address}
              inline
            >
              {(val) => <span className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-auto line-clamp-2">{val || address}</span>}
            </EditableElement>
          </motion.a>

          {/* Schedule Card */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-md shadow-gray-100/50 dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <ClockIcon className="w-5 h-5" />
              </div>
              <EditableElement
                targetId="healthcare.home.contact.hoursTitle"
                componentKey="ContactSection"
                elementKey="hoursTitle"
                label="Hours Title"
                defaultValue="Opening Hours"
                inline
              >
                {(val) => <h3 className="text-xl font-bold text-gray-900 dark:text-white">{val || "Opening Hours"}</h3>}
              </EditableElement>
            </div>
            <ul className="space-y-2 flex-grow flex flex-col justify-center">
              {formatOpeningHours()}
            </ul>
          </motion.div>

          {/* Action Card: Appointments */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex flex-col p-8 bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-700 dark:from-teal-900/60 dark:via-teal-950/40 dark:to-cyan-950/50 rounded-2xl border border-teal-500/10 shadow-lg shadow-teal-600/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
            <EditableElement
              targetId="healthcare.home.contact.bookingTitle"
              componentKey="ContactSection"
              elementKey="bookingTitle"
              label="Booking Card Title"
              defaultValue="Book Appointment"
            >
              {(val) => <h3 className="text-xl font-bold text-white mb-2">{val || "Book Appointment"}</h3>}
            </EditableElement>
            <EditableElement
              targetId="healthcare.home.contact.bookingDesc"
              componentKey="ContactSection"
              elementKey="bookingDesc"
              label="Booking Card Description"
              defaultValue="Skip lines entirely. Select your diagnostic path and reserve premium time windows directly online."
              type="textarea"
            >
              {(val) => (
                <p className="text-sm text-teal-50 dark:text-teal-200/70 mb-6 flex-grow">
                  {val || "Skip lines entirely. Select your diagnostic path and reserve premium time windows directly online."}
                </p>
              )}
            </EditableElement>
            <button
              onClick={() => router.push(`/${storeSlug}/book`)}
              className="w-full py-3 px-4 bg-white text-teal-700 dark:bg-teal-500 dark:text-white text-sm font-bold rounded-xl shadow-md hover:bg-teal-50 dark:hover:bg-teal-400 transition-all text-center mt-auto"
            >
              <EditableElement
                targetId="healthcare.home.contact.bookingButton"
                componentKey="ContactSection"
                elementKey="bookingButton"
                label="Booking Button Text"
                defaultValue="Secure a Slot"
                inline
              >
                {(val) => <span>{val || "Secure a Slot"}</span>}
              </EditableElement>
            </button>
          </motion.div>

          {/* Action Card: Messaging Form */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex flex-col p-8 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 dark:from-indigo-900/60 dark:via-indigo-950/40 dark:to-purple-950/50 rounded-2xl border border-indigo-500/10 shadow-lg shadow-indigo-600/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </div>
            <EditableElement
              targetId="healthcare.home.contact.messageTitle"
              componentKey="ContactSection"
              elementKey="messageTitle"
              label="Message Card Title"
              defaultValue="Send Instant Message"
            >
              {(val) => <h3 className="text-xl font-bold text-white mb-2">{val || "Send Instant Message"}</h3>}
            </EditableElement>
            <EditableElement
              targetId="healthcare.home.contact.messageDesc"
              componentKey="ContactSection"
              elementKey="messageDesc"
              label="Message Card Description"
              defaultValue="Have non-emergency concerns or custom inquiries? Leave a digital message and our admins will reply within 2 hours."
              type="textarea"
            >
              {(val) => (
                <p className="text-sm text-indigo-50 dark:text-indigo-200/70 mb-6 flex-grow">
                  {val || "Have non-emergency concerns or custom inquiries? Leave a digital message and our admins will reply within 2 hours."}
                </p>
              )}
            </EditableElement>
            <button
              onClick={() => router.push(`/${storeSlug}/contact-form`)}
              className="w-full py-3 px-4 bg-white text-indigo-700 dark:bg-indigo-500 dark:text-white text-sm font-bold rounded-xl shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-400 transition-all text-center mt-auto"
            >
              <EditableElement
                targetId="healthcare.home.contact.messageButton"
                componentKey="ContactSection"
                elementKey="messageButton"
                label="Message Button Text"
                defaultValue="Open Digital Form"
                inline
              >
                {(val) => <span>{val || "Open Digital Form"}</span>}
              </EditableElement>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}