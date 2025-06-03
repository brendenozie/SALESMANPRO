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
  storeFormData: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const Footer :React.FC<FooterProps> = ({ storeFormData }) => {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6 text-center">
    <p className="text-lg">123 Culinary Street, Flavor Town</p>
    <p className="mt-2">Open: Mon–Sun, 12pm – 10pm</p>
    <div className="mt-4 flex justify-center space-x-6">
      <Link href="#">Facebook</Link>
      <Link href="#">Instagram</Link>
      <Link href="#">Contact</Link>
    </div>
    <p className="mt-4 text-sm text-gray-400">© 2025 La Tavola Italiana</p>
  </footer>
  );
};

export default Footer;
