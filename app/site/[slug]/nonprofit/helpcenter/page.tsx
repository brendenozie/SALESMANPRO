
// 5. Help Center (help-center.tsx)
import React from 'react';
import Section from '@/components/site/Section/Section';
import Link from 'next/link';
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
  themeSettings:any;
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface HelpCenterProps {
  store: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


const HelpCenter: React.FC<HelpCenterProps> = () => {

  const store = useStore();

  return (
        <Section title="Help Center" background="none">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Returns', href: '/returns' },
              { title: 'Shipping', href: '/shipping' },
              { title: 'Track Order', href: '/track-order' }
            ].map(link => (
              <Link key={link.href} href={link.href} className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-blue-600">{link.title}</h3>
                <p className="mt-2 text-sm text-gray-600">Learn more about {link.title.toLowerCase()}.</p>
              </Link>
            ))}
          </div>
        </Section>
    )
};
export default HelpCenter;