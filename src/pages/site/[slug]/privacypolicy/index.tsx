
// 3. Privacy Policy (privacy-policy.tsx)
import React from 'react';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';
import Section from '@/components/site/Section/Section';
import { motion } from 'framer-motion';


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

interface PrivacyPolicyProps {
  store: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const PrivacyPolicyPage: React.FC<PrivacyPolicyProps> = ({ store }) => (
  <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
    <Header store={store}/>
    <Section title="Privacy Policy" background="none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto space-y-4 text-sm"
      >
        <h3 className="font-semibold text-lg">Introduction</h3>
        <p>Explain how user data is collected and used.</p>
        <h3 className="font-semibold text-lg">Information We Collect</h3>
        <p>Details on personal and browsing data.</p>
        {/* Add all policy sections here */}
      </motion.div>
    </Section>
    <Footer store={store}/>
  </div>
);
export default PrivacyPolicyPage;
