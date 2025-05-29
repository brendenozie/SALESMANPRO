"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality||75}`;


export default function HealthcareHeader({store}:any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  
  const links = [
    { label: 'Home', href: `/${store.slug}` },
    { label: 'Services', href: `/${store.slug}/services` },
    { label: 'Doctors', href: `/${store.slug}/doctors` },
    { label: 'Testimonials', href: `/${store.slug}/testimonials` },
    { label: 'FAQs', href: `/${store.slug}/faqs` },
    { label: 'Contact', href: `/${store.slug}/contact` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => router.push(`/${store.slug}`)}
        >
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              width={120}
              height={40}
              loader={loader}
              className="object-contain"
            />
          ) : (
            <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-300">
              {store.name}
            </span>
          )}
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex space-x-8">
          {links.map(({ label, href }) => (
            <motion.div key={label} whileHover={{ y: -2 }}>
              <Link href={href} className="text-gray-700 dark:text-gray-200 font-medium hover:text-teal-600 transition">
                {label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push(`/${store.slug}/book`)}
            className="flex items-center bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Book Appointment"
          >
            <HeartIcon className="w-5 h-5 mr-1" />
            Book Appointment
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push(`/${store.slug}/services`)}
            className="flex items-center border border-teal-600 text-teal-600 font-medium px-4 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="View Services"
          >
            <ClipboardDocumentListIcon className="w-5 h-5 mr-1" />
            Services
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-gray-700 dark:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3BottomLeftIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white dark:bg-gray-800 overflow-hidden shadow-inner"
          >
            <nav className="flex flex-col px-6 py-4 space-y-4">
              {links.map(({ label, href }) => (
                <Link key={label} href={href} className="text-gray-700 dark:text-gray-200 font-medium hover:text-teal-600 transition">
                  {label}
                </Link>
              ))}
              <button
                onClick={() => { setOpen(false); router.push(`/${store.slug}/book`); }}
                className="mt-2 flex items-center bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Book Appointment"
              >
                <HeartIcon className="w-5 h-5 mr-1" />
                Book Appointment
              </button>
              <button
                onClick={() => { setOpen(false); router.push(`/${store.slug}/services`); }}
                className="mt-2 flex items-center border border-teal-600 text-teal-600 font-medium px-4 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="View Services"
              >
                <ClipboardDocumentListIcon className="w-5 h-5 mr-1" />
                Services
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}