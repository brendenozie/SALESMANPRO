'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
// Assuming you have react-icons installed, uncomment these if you prefer them over custom SVGs:
// import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useStoreContext } from '@/contexts/StoreContext';
import {
  FacebookIcon, // Placeholder/Custom SVG for social icons
  InstagramIcon,
  TwitterIcon,
  WhatsappIcon,
} from './SocialIcons'; // Assuming you'll create a SocialIcons.js file or similar for these SVGs

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    socialLinks, // Expecting an object like { facebook: 'url', twitter: 'url', ... }
    contactPhone,
    themeSettings,
  } = storeFormData || {}; // Added default empty object to prevent errors

  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Consistent primary color

  // Fallback social links for development/demonstration
  const defaultSocialLinks = {
    facebook: 'https://facebook.com/yourpage',
    instagram: 'https://instagram.com/yourpage',
    twitter: 'https://twitter.com/yourpage',
    whatsapp: `https://wa.me/${contactPhone || '254712345678'}`, // Use contactPhone if available
  };

  const getSocialLink = (platform: keyof typeof socialLinks) =>
    socialLinks?.[platform] || defaultSocialLinks[platform];

  return (
    <footer className="relative bg-gray-50 text-gray-800 pt-20 pb-10 px-6 overflow-hidden">
      {/* Subtle Background Pattern/Glow - Adjust as needed */}
      <div className="absolute inset-0 -z-10 opacity-5" style={{ backgroundImage: 'url(/images/footer-texture-light.svg)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />


      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-10 relative z-10"> {/* Adjusted gaps and added padding-bottom */}
        {/* Brand & Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h3 className="text-3xl font-extrabold" style={{ color: primaryColor }}>{name || 'Your Brand'}</h3>
          <p className="mt-4 text-gray-600 text-base leading-relaxed max-w-xs">
            {description ||
              "Your gateway to personalized, on-demand wellness experiences. Book your perfect session, anytime, anywhere."}
          </p>
          <div className="flex gap-4 mt-8 text-gray-500">
            {socialLinks?.facebook !== false && ( // Check if link is explicitly set to false to hide
              <a href={getSocialLink('facebook')} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-900 transition-colors transform hover:scale-110">
                <FacebookIcon className="w-7 h-7" /> {/* Replaced with custom SVG icon */}
              </a>
            )}
            {socialLinks?.instagram !== false && (
              <a href={getSocialLink('instagram')} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-900 transition-colors transform hover:scale-110">
                <InstagramIcon className="w-7 h-7" />
              </a>
            )}
            {socialLinks?.twitter !== false && (
              <a href={getSocialLink('twitter')} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-900 transition-colors transform hover:scale-110">
                <TwitterIcon className="w-7 h-7" />
              </a>
            )}
            {socialLinks?.whatsapp !== false && (
              <a href={getSocialLink('whatsapp')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-gray-900 transition-colors transform hover:scale-110">
                <WhatsappIcon className="w-7 h-7" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h4 className="text-xl font-bold mb-6 text-gray-900">Quick Links</h4>
          <ul className="space-y-4 text-gray-700 text-base"> {/* Adjusted font sizes and spacing */}
            <li><Link href="#services" className="hover:text-emerald-600 transition-colors">Services</Link></li>
            <li><Link href="#benefits" className="hover:text-emerald-600 transition-colors">Why Choose Us</Link></li> {/* Changed from pricing to benefits, adjust href */}
            <li><Link href="#testimonials" className="hover:text-emerald-600 transition-colors">Testimonials</Link></li>
            <li><Link href="#faq" className="hover:text-emerald-600 transition-colors">FAQs</Link></li>
          </ul>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h4 className="text-xl font-bold mb-6 text-gray-900">Support</h4>
          <ul className="space-y-4 text-gray-700 text-base"> {/* Adjusted font sizes and spacing */}
            <li><Link href="#contact" className="hover:text-emerald-600 transition-colors">Contact Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li> {/* Added meaningful href */}
            <li><Link href="/terms-of-service" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li> {/* Added meaningful href */}
            <li><Link href="#livechat" className="hover:text-emerald-600 transition-colors">Live Chat</Link></li>
          </ul>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h4 className="text-xl font-bold mb-6 text-gray-900">Stay Updated</h4>
          <p className="text-gray-600 text-base mb-6 leading-relaxed"> {/* Adjusted font size and margin */}
            Join our mailing list for exclusive offers, wellness tips, and important updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-3"> {/* Changed to flex-col for better mobile layout, gap-3 */}
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-5 py-3 rounded-full bg-white border border-gray-300 text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors shadow-sm"
              aria-label="Email for newsletter"
            />
            <motion.button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              whileHover={{ scale: 1.05, boxShadow: `0 8px 20px ${primaryColor}44` }} // Consistent hover effect
              whileTap={{ scale: 0.97 }}
            >
              Subscribe
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mt-16 pt-8 text-center text-sm text-gray-600 relative z-10"> {/* Adjusted margin and padding */}
        &copy; {year} {name || 'Your Brand'}. All rights reserved.
      </div>
    </footer>
  );
}

// --- Social Icons Component (You can place this in a separate file like SocialIcons.js) ---
// You can replace these with react-icons/fa if you prefer to install that library.
// For example, if using react-icons:
// import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa';
// then use <FaFacebookF className={className} /> directly in the footer.
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h3V2h-3c-3.402 0-4.673 2.144-4.673 4.587V9.5H7.75v4H10V22h4v-8.5z"/></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.29 2 5.09 3.05 5.09 3.05S2 6.29 2 10.05v3.9C2 17.71 3.05 20.91 3.05 20.91S6.29 22 10.05 22h3.9C17.71 22 20.91 20.95 20.91 20.95S22 17.71 22 13.95v-3.9C22 6.29 20.95 3.05 20.95 3.05S17.71 2 13.95 2H12zm0 2.25c.87 0 1.73.1 2.55.3l.5.15a6.5 6.5 0 014.2 4.2l.15.5c.2.82.3 1.68.3 2.55s-.1 1.73-.3 2.55l-.15.5a6.5 6.5 0 01-4.2 4.2l-.5.15c-.82.2-1.68.3-2.55.3s-1.73-.1-2.55-.3l-.5-.15a6.5 6.5 0 01-4.2-4.2l-.15-.5c-.2-.82-.3-1.68-.3-2.55s.1-1.73.3-2.55l.15-.5a6.5 6.5 0 014.2-4.2l.5-.15c.82-.2 1.68-.3 2.55-.3zM12 7.75a4.25 4.25 0 100 8.5 4.25 4.25 0 000-8.5zM12 9a3 3 0 110 6 3 3 0 010-6zm5.17-2.61a.92.92 0 100 1.84.92.92 0 000-1.84z"/></svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.34-1.6.58-2.47.69.89-.53 1.57-1.37 1.89-2.39-.83.49-1.75.84-2.73 1.04C18.46 3.98 17.15 3 15.63 3c-2.39 0-4.34 1.95-4.34 4.34 0 .34.04.67.12.98C8.58 8.1 5.42 6.47 3.32 3.86c-.35.6-.55 1.29-.55 2.04 0 1.5.76 2.82 1.92 3.6A4.322 4.322 0 013 9.44v.05c0 2.11 1.5 3.88 3.49 4.29-.37.1-.76.15-1.16.15-.29 0-.58-.03-.85-.09.55 1.73 2.16 2.99 4.07 3.03C10.22 18.06 8 18.73 8 18.73A12.29 12.29 0 0021.2 7.42c.04-.33.06-.67.06-1.02 0-.25 0-.49-.02-.74z"/></svg>
);
const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.77.46 3.45 1.35 4.95L2.08 22l5.25-1.38c1.47.8 3.16 1.22 4.71 1.22 5.46 0 9.9-4.44 9.9-9.9s-4.44-9.9-9.9-9.9zm0 1.73c4.54 0 8.17 3.73 8.17 8.17s-3.73 8.17-8.17 8.17c-1.44 0-2.8-.39-3.96-1.07l-.28-.16-2.92.77.79-2.83-.18-.29c-.7-1.15-1.1-2.47-1.1-3.86 0-4.54 3.73-8.17 8.17-8.17zm-.59 3.04c-.23 0-.45.06-.63.18-.32.22-1.07.97-1.39 1.34-.32.37-.62.45-.85.45-.23 0-.49-.07-.76-.15-.27-.08-1.43-.53-1.85-1.18-.42-.65-.01-1.15.2-1.36.19-.2.45-.49.67-.73.22-.24.28-.42.45-.7.18-.28.09-.53-.02-.76-.11-.23-.97-2.3-1.32-3.15-.35-.85-.71-.72-.97-.72-.25 0-.53.03-.82.03-.29 0-1.03.11-1.57.59-.54.49-2.09 2.05-2.09 5.02 0 2.97 2.14 5.8 2.45 6.22.31.42 4.1 6.54 9.98 6.54 1.43 0 2.69-.47 3.59-.85.9-.38 1.7-.82 2.37-1.22.67-.4.99-.71 1.18-.94.19-.23.23-.49.16-.61-.06-.12-.23-.2-1.22-.68-.99-.48-1.59-.78-1.84-.94-.25-.16-.54-.23-.8-.23z"/></svg>
);