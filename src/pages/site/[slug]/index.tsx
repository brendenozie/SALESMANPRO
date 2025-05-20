import React,{ useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDownIcon, HeartIcon, MagnifyingGlassCircleIcon, ShoppingBagIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, XMarkIcon, Bars3BottomLeftIcon, FaceSmileIcon, BookOpenIcon, TruckIcon, ArrowsUpDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import banner from '@/assets/homebanner.png';
import { BuildingLibraryIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../../components/site/header/Header";
import Footer from "../../../components/site/footer/Footer";
import Cart from "../../../components/cart";
import SignInModal from "../../../components/SignInModal";
import { useStateContext } from '../../../contexts/ContextProvider';
import LocationModal from "../../../components/locationManager";
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import CategoryBanners from '@/components/site/CategoryBanners/CategoryBanners';
import ServiceFeatures from '@/components/site/ServiceFeatures/ServiceFeatures';
import Section from '@/components/site/Section/Section';

const slides = [
  {
    image: '/images/slider-1.jpg',
    subtitle: 'Super Value Deals',
    title: 'On all products',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },
  {
    image: '/images/slider-2.jpg',
    subtitle: 'Hot Deals',
    title: 'Up to 50% off',
    ctaText: 'Explore',
    ctaLink: '/deals',
  },
];

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

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
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header />
      <HeroSlider bannerUrl={store.bannerUrl ?? ""} />
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
        {/* addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} */}
      </Section> 
      <NewsletterSection />
      <Section title="">
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8 mb-8">
          <p className="text-lg">"Great products and fast shipping!"</p>
          <p className="text-sm text-gray-500">- Happy Customer</p>
        </div>
      </Section>
      <Footer />
    </div>
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

function Headerv1({ store }: any) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const languages = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
  ];
  const [lang, setLang] = useState(languages[0]);

  return (
    <>
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-orange-50 text-orange-800 text-sm font-medium py-2 px-4 flex justify-between items-center">
        <span>🎉 Super Value Deals — Save more with coupons</span>
        <div className="flex items-center gap-4 text-sm">
          <select
            value={lang.code}
            onChange={(e) =>
              setLang(languages.find((l) => l.code === e.target.value)!)
            }
            className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-orange-500 focus:border-orange-500"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <Link href="/login" className="text-orange-600 hover:underline">Login</Link>
          <Link href="/register" className="text-orange-600 hover:underline">Register</Link>
          <Link href="/cart" className="text-orange-600 hover:underline">Cart</Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <img src="/logo.svg" alt="logo" className="h-8 w-auto" />
            </Link>
            <nav className="hidden lg:flex items-center gap-6 font-medium text-gray-700">
              <Link href="/" className="hover:text-orange-600 transition">Home</Link>
              <Link href="/shop" className="hover:text-orange-600 transition">Shop</Link>
              <Link href="/categories" className="hover:text-orange-600 transition">Categories</Link>
            </nav>
          </div>

          {/* Center Search */}
          <div className="flex-1 mx-6 hidden lg:block">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <MagnifyingGlassCircleIcon className="h-5 w-5 text-gray-500 hover:text-orange-600" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* <button className="relative text-gray-600 hover:text-orange-600">
              <HeartIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-2 bg-orange-600 text-white rounded-full text-xs px-1">
                5
              </span>
            </button> */}
            <button className="relative text-gray-600 hover:text-orange-600">
              <UserIcon className="h-6 w-6" />
            </button>
            <button className="relative text-gray-600 hover:text-orange-600">
              <ShoppingBagIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-2 bg-orange-600 text-white rounded-full text-xs px-1">
                {store?.cartCount ?? 0}
              </span>
            </button>
            <button
              className="lg:hidden text-gray-600 hover:text-orange-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3BottomLeftIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-4 py-4 space-y-2 text-sm font-medium text-gray-700">
            <Link href="/" className="block hover:text-orange-600">Home</Link>
            <Link href="/shop" className="block hover:text-orange-600">Shop</Link>
            <Link href="/categories" className="block hover:text-orange-600">Categories</Link>
          </div>
        </div>
      )}
    </header>
    </>
  );
}

function StoreInfo({ store }: { store: Store }) {
  return (
    <section className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">About {store.name}</h2>
      <p className="mb-6 leading-relaxed">{store.description}</p>
      <div className="flex flex-col sm:flex-row sm:space-x-10 space-y-4 sm:space-y-0">
        <div className="flex items-center gap-2"><PhoneIcon className="h-5 w-5" /><span>{store.contactPhone}</span></div>
        <div className="flex items-center gap-2"><EnvelopeIcon className="h-5 w-5" /><span>{store.contactEmail}</span></div>
        <div className="flex items-center gap-2"><MapPinIcon className="h-5 w-5" /><span>{store.address}</span></div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Store not found</p>
    </div>
  );
}

function HeroSlider({ bannerUrl }: { bannerUrl: string }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const goTo = (idx: number) => {
    clearTimeout(timeoutRef.current);
    setCurrent(idx);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  return (
    <section className="relative h-[500px] overflow-hidden">
      <AnimatePresence>
        {slides.map((slide, i) =>
          i === current ? (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                loader={loader}
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start px-6 md:px-16 text-white">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl mb-2"
                >
                  {slide.subtitle}
                </motion.p>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl md:text-5xl font-bold mb-4"
                >
                  {slide.title}
                </motion.h2>
                <motion.a
                  href={slide.ctaLink}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="inline-block bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg text-white font-medium"
                >
                  {slide.ctaText}
                </motion.a>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
        aria-label="Previous slide"
      >
        <ArrowLeftIcon />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
        aria-label="Next slide"
      >
        <ArrowRightIcon />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-3 h-3 rounded-full transition ${
              idx === current ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
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
