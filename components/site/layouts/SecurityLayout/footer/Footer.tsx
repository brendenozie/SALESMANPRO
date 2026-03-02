'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion'; // Import motion for animations
import { useStoreContext } from '@/contexts/StoreContext';
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowRightIcon, // For the subscribe button
  // FacebookSquareFilled, // Assuming you have a custom icon for Facebook or use a generic social icon
  // TwitterIcon, // Assuming you have Twitter icon
  // LinkedinIcon, // Assuming you have LinkedIn icon
  // Or use generic:
  // SocialIcon, // If you have a generic social icon component
} from '@heroicons/react/24/outline'; // Using outline icons for a lighter feel, consistent with other sections.

// Assuming you have actual social media icons available or use placeholders/generic ones.
// For example, you might install 'react-icons' or have custom SVGs.
// For this example, I'll use placeholders or generic heroicons if suitable.
// Let's stick with generic placeholders for now if specific brand icons aren't available.

// Define a type for themeSettings for better type safety
interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  footerBgColor?: string; // Specific background color for footer
  footerTextColor?: string; // Specific text color for footer
  footerHeadingColor?: string; // Specific heading color for footer
}

// Define a type for storeFormData to ensure correct property access
interface StoreFormData {
  name?: string;
  slug?: string;
  logoUrl?: string;
  themeSettings?: ThemeSettings;
  contactEmail?: string; // Assuming contact info can come from storeFormData
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Footer() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const {
    name = 'Your Company Name', // Default name
    slug = '/', // Default slug for home
    logoUrl,
    themeSettings = {},
    contactEmail,
    contactPhone,
    address,
    socialLinks,
  } = storeFormData;

  // Theme colors with more robust fallbacks
  const primaryColor = themeSettings.primaryColor || '#007bff'; // Vibrant blue
  const secondaryColor = themeSettings.secondaryColor || '#6c757d'; // Complementary gray
  const footerBgColor = themeSettings.footerBgColor || '#1a202c'; // Dark charcoal for a deep, rich footer background
  const footerTextColor = themeSettings.footerTextColor || '#cbd5e0'; // Light gray for general text (slate-300)
  const footerHeadingColor = themeSettings.footerHeadingColor || '#ffffff'; // White for headings

  // Animation variants for staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.footer
      className="relative py-16 md:py-24 px-6 lg:px-12 z-10 overflow-hidden" // Added overflow-hidden for background elements
      style={{ backgroundColor: footerBgColor, color: footerTextColor }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      {/* Subtle Background Gradients/Shapes */}
      <div
        className="absolute top-0 left-0 w-1/3 h-full opacity-5"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, transparent)`,
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-1/3 h-full opacity-5"
        style={{
          background: `linear-gradient(to left, ${secondaryColor}, transparent)`,
          filter: 'blur(50px)',
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 relative z-20">
        {/* Company Logo & Description */}
        <motion.div className="space-y-4" variants={itemVariants}>
          <Link href={`/${slug}`} className="inline-block group">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={180} // Slightly larger logo
                height={45} // Maintain aspect ratio
                loader={loader}
                className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" // Subtle grayscale on hover
              />
            ) : (
              <span
                className="text-3xl font-extrabold bg-clip-text text-transparent group-hover:opacity-90 transition-opacity"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                {name}
              </span>
            )}
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            Empowering your journey with innovative solutions and a commitment to excellence. Discover the difference.
          </p>
          {socialLinks && (
            <div className="flex space-x-4 pt-2">
              {socialLinks.facebook && (
                <Link
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform"
                >
                  {/* Replace with actual Facebook icon if available, e.g., from react-icons */}
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.811c-3.27 0-3.589 2.508-3.589 4.332v2.668z"></path></svg>
                </Link>
              )}
              {socialLinks.twitter && (
                <Link
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform"
                >
                  {/* Replace with actual Twitter icon */}
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.447 0-6.227 2.78-6.227 6.228 0 .486.052.958.148 1.413-5.18-.259-9.754-2.744-12.898-6.518-.535.91-.843 1.961-.843 3.064 0 2.153 1.096 4.053 2.766 5.158-.808-.026-1.566-.247-2.229-.616v.081c0 3.016 2.144 5.534 4.99 6.09-.44.12-.91.182-1.394.182-.343 0-.676-.034-.999-.101.794 2.479 3.078 4.292 5.798 4.341-2.132 1.684-4.811 2.697-7.721 2.697-.502 0-.997-.03-1.48-.086 2.756 1.764 6.035 2.796 9.531 2.796 11.422 0 17.618-9.49 17.618-17.619 0-.267-.015-.534-.04-.795z"></path></svg>
                </Link>
              )}
              {socialLinks.linkedin && (
                <Link
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform"
                >
                  {/* Replace with actual LinkedIn icon */}
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38-.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.962v16h4.962v-8.399c0-4.67 6.021-4.237 6.021 0v8.399h4.938v-8.59c0-7.223-4.385-8.25-8.28-4.701z"></path></svg>
                </Link>
              )}
              {/* Add more social icons as needed, e.g., Instagram, YouTube */}
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants}>
          <h4 className="font-bold mb-5" style={{ color: footerHeadingColor }}>Quick Links</h4>
          <ul className="space-y-3">
            <li><Link href={`/${slug}`} className="hover:text-white transition">Home</Link></li>
            <li><Link href={`/${slug}/services`} className="hover:text-white transition">Services</Link></li>
            <li><Link href={`/${slug}/about`} className="hover:text-white transition">About Us</Link></li>
            <li><Link href={`/${slug}/blog`} className="hover:text-white transition">Blog</Link></li>
            <li><Link href={`/${slug}/#faqs`} className="hover:text-white transition">FAQs</Link></li>
            <li><Link href={`/${slug}/#contact`} className="hover:text-white transition">Contact</Link></li>
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div variants={itemVariants}>
          <h4 className="font-bold mb-5" style={{ color: footerHeadingColor }}>Get in Touch</h4>
          <ul className="space-y-3">
            {contactEmail && (
              <li>
                <Link href={`mailto:${contactEmail}`} className="flex items-start gap-3 hover:text-white transition">
                  <EnvelopeIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <span className="break-all">{contactEmail}</span>
                </Link>
              </li>
            )}
            {contactPhone && (
              <li>
                <Link href={`tel:${contactPhone}`} className="flex items-start gap-3 hover:text-white transition">
                  <PhoneIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <span>{contactPhone}</span>
                </Link>
              </li>
            )}
            {address && (
              <li>
                <Link
                  href={`https://www.google.com/maps/embed/v1/place?q=Nairobi+CBD,+Kenya&key=YOUR_Maps_API_KEY`} // Link to map for directions
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:text-white transition"
                >
                  <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <span>{address}</span>
                </Link>
              </li>
            )}
            {!contactEmail && !contactPhone && !address && (
              <li><p className="text-gray-500">No contact info provided.</p></li>
            )}
          </ul>
        </motion.div>

        {/* Newsletter Subscription */}
        <motion.div variants={itemVariants}>
          <h4 className="font-bold mb-5" style={{ color: footerHeadingColor }}>Stay Updated</h4>
          <p className="text-sm leading-relaxed text-gray-400 mb-4">
            Subscribe to our newsletter for exclusive insights, updates, and special offers.
          </p>
          <form className="flex rounded-lg overflow-hidden shadow-md">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2"
              // style={{ focusRingColor: primaryColor }}
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                // Revert to primary/secondary if gradient not desired, or use themeSettings.buttonColor
              }}
            >
              Subscribe <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>

      {/* Copyright */}
      <motion.div
        className="border-t border-white/10 mt-16 pt-8 text-center text-sm text-gray-500 relative z-20"
        variants={itemVariants}
      >
        © {new Date().getFullYear()} {name}. All rights reserved.
        <br />
      </motion.div>
      <div className="flex items-center gap-1.5 px-4 py-2 mt-4 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
    </div>

    </motion.footer>
  );
}