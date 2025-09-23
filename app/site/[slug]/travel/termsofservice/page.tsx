
// 4. Terms of Service (terms-of-service.tsx)
import React from 'react';
import Section from '@/components/site/Section/Section';
import { motion } from 'framer-motion';
import { useStore } from '@/contexts/StoreContext';


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

interface TermsPageProps {
  store: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


const TermsPage: React.FC<TermsPageProps> = () => {
  const store = useStore();
  return (
      <Section title="Terms of Service" background="none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto space-y-4 text-sm">
          <h3 className="font-semibold text-lg">Acceptance of Terms</h3>
          <p>Users agree to comply with these terms.</p>
          {/* Add rest of clauses */}
        </motion.div>
      </Section>
  )
};

export default TermsPage;
