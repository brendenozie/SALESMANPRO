import React from 'react';
import {FaceSmileIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Type definitions
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  // themeSettings
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface FooterProps {
  store: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const Footer :React.FC<FooterProps> = ({ store }) => {
  return (
    <>
    {/* Footer */}
    <footer className="bg-gray-900 text-gray-300 py-12">
    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h4 className="font-semibold text-xl mb-2">AceTech</h4>
        <p className="leading-relaxed">Empowering your business with modern technology and innovative solutions.</p>
      </div>
      <div>
        <h4 className="font-semibold text-xl mb-2">Quick Links</h4>
        <ul className="space-y-2">
          <li><Link href={`/${store.slug}/contact`} className="hover:text-white">Contact</Link></li>
          <li><a href="#services" className="hover:text-white">Services</a></li>
          <li><a href="#featured" className="hover:text-white">Featured</a></li>
          <li><a href="#faq" className="hover:text-white">FAQ</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-xl mb-2">Stay Updated</h4>
        <form className="flex flex-col sm:flex-row">
          <input type="email" placeholder="Email" className="flex-1 px-4 py-2 rounded-l-md focus:outline-none mb-4 sm:mb-0" />
          <button type="submit" className="bg-indigo-600 px-6 py-2 rounded-r-md hover:bg-indigo-700 transition">Subscribe</button>
        </form>
      </div>
    </div>
  </footer>
    </>
  );
};

export default Footer;



    // <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-12">

    //     {/* About Us */}
    //     <div>
    //       <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
    //       <p className="text-sm leading-relaxed text-gray-400">
    //       {store.description || "Discover everything you need from our trusted marketplace. Fast delivery, great deals, and top-notch service—trusted by thousands every day."}
    //       </p>
    //     </div>

    //     {/* Quick Links */}
    //     <div>
    //       <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
    //       <ul className="space-y-2 text-sm">
    //         <li><a href={`/site/${store.slug}/about`} className="hover:text-white transition-colors">About</a></li>
    //         <li><a href={`/site/${store.slug}/contact`} className="hover:text-white transition-colors">Contact</a></li>
    //         <li><a href={`/site/${store.slug}/privacy`} className="hover:text-white transition-colors">Privacy Policy</a></li>
    //         <li><a href={`/site/${store.slug}/terms`} className="hover:text-white transition-colors">Terms of Service</a></li>
    //       </ul>
    //     </div>

    //     {/* Customer Care */}
    //     <div>
    //       <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
    //       <ul className="space-y-2 text-sm">
    //         <li><a href={`/site/${store.slug}/help`} className="hover:text-white transition-colors">Help Center</a></li>
    //         <li><a href={`/site/${store.slug}/returns`} className="hover:text-white transition-colors">Returns</a></li>
    //         <li><a href={`/site/${store.slug}/shipping`} className="hover:text-white transition-colors">Shipping</a></li>
    //         <li><a href={`/site/${store.slug}/track`} className="hover:text-white transition-colors">Track Order</a></li>
    //       </ul>
    //     </div>

    //     {/* Follow Us */}
    //     <div>
    //       <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
    //       <div className="flex space-x-4">
    //       {/* {store.socialLinks.map((s) => (
    //         <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full">
    //           <FaceSmileIcon className="h-5 w-5" />
    //         </motion.a>
    //       ))} */}
    //       </div>
    //     </div>
    //   </div>

    //   <div className="mt-8 text-center text-sm text-gray-500">
    //     &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
    //   </div>
    // </footer>