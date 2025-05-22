
// 6. Returns (returns.tsx), Shipping (shipping.tsx), Track Order (track-order.tsx)
// Use a similar pattern: Hero Section, FAQs, form for tracking, etc.

// Example: Returns
// pages/site/[slug]/returns.tsx
import React from 'react';
import Header from '../../../../components/site/header/Header';
import Footer from '../../../../components/site/footer/Footer';
import Section from '../../../../components/site/Section/Section';
import { motion } from 'framer-motion';
import { useStore } from '../../../../contexts/StoreContext';

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

interface ShippingPageProps {
  store: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


const ShippingPage: React.FC<ShippingPageProps> = () => {
  const store = useStore();

  return(
  <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
    <Header store={ store }/>
    <Section title="Returns Policy" background="none">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6 }} className="max-w-3xl mx-auto space-y-4 text-sm">
        <p>Details on return window, conditions, and process.</p>
        {/* Steps or accordion for how to initiate a return */}
      </motion.div>
    </Section>
    <Footer store={ store }/>
  </div>
)};
export default ShippingPageProps;
