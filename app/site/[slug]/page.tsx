import React from 'react';
import { GetServerSideProps } from 'next';
import prisma from '../../../server/db/prismadb';
import Header from "../../../components/site/header/Header";
import Footer from "../../../components/site/footer/Footer";
import Cart from "../../../components/shop/cart";
import SignInModal from "../../../components/SignInModal";
import { useStateContext } from '../../../contexts/ContextProvider';
import LocationModal from "../../../components/locationManager";
import ProductGrid from '../../../components/site/productGrid/ProductGrid';
import NewsletterSection from '../../../components/site/NewsletterSection/NewsletterSection';
import CategoryBanners from '../../../components/site/CategoryBanners/CategoryBanners';
import ServiceFeatures from '../../../components/site/ServiceFeatures/ServiceFeatures';
import Section from '../../../components/site/Section/Section';
import HeroSlider from '../../../components/HeroSlider';
import { useStore } from '../../../contexts/StoreContext';
import StoreLayout from './layout';


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
interface ThemeSettings { primaryColor?: string; secondaryColor?: number }

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
  themeSettings: any;
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}


export default function StorePage({ store }: { store: Store }) {
  
  if (!store) return <EmptyState />;

  return (
    <StoreLayout>
      <HeroSlider store={store} />
      <Section title="">
        <ServiceFeatures store={store} />
      </Section>
      <Section title="">
        <CategoryBanners categories={store.StoreCategory} />
      </Section>
      <Section title="Trending Products">
        <ProductGrid products={store.products} /> 
      </Section> 
      <Section title="Top Selling">
        <ProductGrid products={store.products} />
      </Section> 
      <Section title="All Products">
        <ProductGrid products={store.products}/>
      </Section> 
      <NewsletterSection />
      <Section title="">
        {store.testimonials && 
          store.testimonials.map((t) => (
            <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8 mb-8">
            <p className="text-lg">{t.quote}</p>
            <p className="text-sm text-gray-500">- {t.author}</p>
          </div>
          ))}
      </Section>
    </StoreLayout>
  );
}

// Server-side fetch
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const raw = await prisma.company.findUnique({
    where: { slug: String(params?.slug) },
    include: {
      MarketplaceListing: {
        take: 8,
        select: {
          id: true,
          title: true,
          finalPrice: true,
          images: true,
          // slug: true
        }
      },
      StoreCategory: {
        orderBy: { sortOrder: 'asc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              icon: true,
            }
          }
        }
      },
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: true,
      heroSlides: true,
      promotions: true
    }
  });
  
  if (!raw) return { notFound: true };

  const store: Store = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? undefined,
    category: raw.category,
    logoUrl: raw.logoUrl ?? undefined,
    bannerUrl: raw.bannerUrl ?? undefined,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone ?? undefined,
    address: raw.address ?? undefined,
    themeSettings:raw.themeSettings,
    StoreCategory: raw.StoreCategory?.map(sc => ({
      id: sc.category.id,
      name: sc.displayName || sc.category.name,
      imageUrl: sc.category.image ?? '/placeholder.png',
      slug: sc.category.slug,
      icon: sc.icon ?? sc.category.icon ?? undefined
    })),
    socialLinks: raw.socialLinks.map(s => ({ channel: s.channel, url: s.url })),
    policies: raw.policies.map(p => ({ type: p.type, 
                                        title: "p.title",// ?? undefined, 
                                        content: p.content })),
    // socialLinks: raw.socialLinks,
  //   // policies: raw.policies,
  //   // shippingZones: raw.shippingZones,
  //   // domain: raw.domain,
  //   // currency: raw.currency,
  //   // locale: raw.locale,
    faqs: raw.faqs.map(f => ({ question: f.question, answer: f.answer })),
    testimonials: raw.testimonials.map(t => ({
      author: t.author,
      quote: t.quote,
      avatarUrl: "t.avatarUrl",// ?? undefined,
      rating: 0,//t.rating ?? undefined
    })),
    heroSlides: raw.heroSlides.map(b => ({
      imageUrl: b.imageUrl,
      headline: b.headline ?? undefined,
      subline: b.subline ?? undefined,
      ctaText: b.ctaText ?? undefined,
      ctaLink: b.ctaLink ?? undefined
    })),
    promotions: raw.promotions.map(p => ({
      code: "0",//p.code ?? undefined,
      title: p.title,
      description: p.description ?? undefined,
      startsAt: "1/1/2001",//p.startsAt?.toISOString(),
      endsAt: "1/1/2001",//p.endsAt?.toISOString(),
      bannerUrl: "p.bannerUrl",// ?? undefined
    })),
    products: raw.MarketplaceListing.map(p => ({
      id: p.id,
      name: p.title,
      price: p.finalPrice ?? 0,
      imageUrl: (typeof p.images[0] === 'object' && p.images[0] !== null && 'url' in p.images[0])
        ? (p.images[0] as { url: string }).url
        : '/placeholder.png',
      // slug: p.slug
    })),
  };
  
  return {
    props: { store }
  };
};

function EmptyState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Store not found</p>
    </div>
  );
}

export const metadata = {
  title: 'StoreName - Your One-Stop Shop',
  description: 'Discover our exclusive collection of products tailored just for you.',
  openGraph: {
    title: 'StoreName - Your One-Stop Shop',
    description: 'Discover our exclusive collection of products tailored just for you.',
    url: 'https://yourstore.com',
    siteName: 'StoreName',
    images: [
      {
        url: 'https://via.placeholder.com/1200x630?text=StoreName',
        width: 1200,
        height: 630,
        alt: 'StoreName',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StoreName - Your One-Stop Shop',
    description: 'Discover our exclusive collection of products tailored just for you.',
    images: ['https://via.placeholder.com/1200x630?text=StoreName'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
  viewport: 'width=device-width, initial-scale=1.0',
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    noimageindex: false,
    nosnippet: false,
    noydir: false,
    notranslate: false,
    nofollow: false,
    noindex: false,
  },
  alternates: {
    canonical: 'https://yourstore.com',
    languages: {
      'en-US': 'https://yourstore.com/en',
      'es-ES': 'https://yourstore.com/es',
    },
  },
}
