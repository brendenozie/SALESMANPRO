'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
// Assuming you have react-icons installed, uncomment these if you prefer them over custom SVGs:
// import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useStoreContext } from '@/contexts/StoreContext';
// import {
//   FacebookIcon, // Placeholder/Custom SVG for social icons
//   InstagramIcon,
//   TwitterIcon,
//   WhatsappIcon,
// } from './SocialIcons'; // Assuming you'll create a SocialIcons.js file or similar for these SVGs

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    socialLinks, // Expecting an object like { facebook: 'url', twitter: 'url', ... } or an array of { platform, url }
    contactPhone,
    themeSettings,
  } = storeFormData || {}; // Added default empty object to prevent errors

  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Consistent primary color

  // normalize socialLinks to a map if it's an array (some APIs return SocialLink[])
  const socialLinksMap: Record<string, string | false> = Array.isArray(socialLinks)
    ? (socialLinks as any[]).reduce((acc: Record<string, string | false>, item: any) => {
        if (item?.platform) acc[item.platform] = item.url ?? false;
        return acc;
      }, {})
    : (socialLinks || {}); // if already an object, use as-is

  // Fallback social links for development/demonstration
  const defaultSocialLinks = {
    facebook: 'https://facebook.com/yourpage',
    instagram: 'https://instagram.com/yourpage',
    twitter: 'https://twitter.com/yourpage',
    whatsapp: `https://wa.me/${contactPhone || '254712345678'}`, // Use contactPhone if available
  };

  const getSocialLink = (platform: keyof typeof defaultSocialLinks) =>
    (socialLinksMap as any)?.[platform] || defaultSocialLinks[platform];

  return (
    <footer className="relative bg-gray-50 text-gray-800 pt-20 pb-10 px-6 overflow-hidden">
      {/* Subtle Background Pattern/Glow - Adjust as needed */}
      <div className="absolute inset-0 -z-10 opacity-5" style={{ backgroundImage: 'url(/images/footer-texture-light.svg)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />


      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-10 relative z-10"> {/* Adjusted gaps and added padding-bottom */}
        {/* Brand & Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="flex gap-4 mt-8 text-gray-500">
            {socialLinksMap?.facebook !== false && ( // Check if link is explicitly set to false to hide
              <a href={getSocialLink('facebook')} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-900 transition-colors transform hover:scale-110">
                <FacebookIcon className="w-7 h-7" /> {/* Replaced with custom SVG icon */}
              </a>
            )}
            {socialLinksMap?.instagram !== false && (
              <a href={getSocialLink('instagram')} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-900 transition-colors transform hover:scale-110">
                <InstagramIcon className="w-7 h-7" />
              </a>
            )}
            {socialLinksMap?.twitter !== false && (
              <a href={getSocialLink('twitter')} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-900 transition-colors transform hover:scale-110">
                <TwitterIcon className="w-7 h-7" />
              </a>
            )}
            {socialLinksMap?.whatsapp !== false && (
              <a href={getSocialLink('whatsapp')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-gray-900 transition-colors transform hover:scale-110">
                <WhatsappIcon className="w-7 h-7" />
              </a>
            )}
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
      <div className="text-center text-sm text-orange-600 font-semibold mt-4" >
        powered by <a href='https://salesmanpro.site'>salesmanpro</a>.site
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
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.52 3.48A11.88 11.88 0 0012.04.02C6.06.02 1.02 5.06 1.02 11.04c0 1.94.5 3.83 1.45 5.5L.02 23l6.6-1.73a11 11 0 005.42 1.43h.01c5.98 0 10.99-4.84 11-10.82a11.9 11.9 0 00-2.53-7.2zM12.04 20.1h-.01a9.15 9.15 0 01-4.66-1.28l-.33-.2-3.92 1.03 1.05-3.82-.22-.35a9.04 9.04 0 01-1.4-4.7c0-5 4.07-9.07 9.08-9.07 2.43 0 4.72.95 6.43 2.67a9.06 9.06 0 012.66 6.4c-.01 5-4.08 9.07-9.09 9.07zm5.02-7.16c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2 .22-.52.48-.45 .65-.46h.55c,.18,0,.48,.07,.73,.34s1,.99,1,.99c,.18,.18,.3,.27,.48,.43,.18,.16,.3,.12,.41,.09.12-.03,.34-.14,.52-.21.18-.07,.55-.22,.84-.33.27-.11,.52-.05,."/>
    </svg>
);