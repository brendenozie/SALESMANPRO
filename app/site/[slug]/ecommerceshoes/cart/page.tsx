import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStore } from '@/contexts/StoreContext';

const HERO_VIDEO = '/hero-loop.mp4';
const PLACEHOLDER = 'https://via.placeholder.com';

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



const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


const CartpageMockup: React.FC = () => {
  return (
    <div className="font-sans text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <span className="text-2xl font-black">StoreName</span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
              <input
                className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Search products..."
              />
            </div>
            <Link href="/cart"><ShoppingCartIcon className="h-6 w-6 hover:text-blue-500 transition" /></Link>
            <Link href="/account"><UserIcon className="h-6 w-6 hover:text-blue-500 transition" /></Link>
          </div>
        </div>
      </header>

      {/* Hero Video */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <video
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-start px-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-black text-white mb-4"
          >
            Welcome to StoreName
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-white max-w-xl"
          >
            Discover our exclusive collection of products tailored just for you.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Link href="#shop" className="mt-6 inline-block bg-blue-600 px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition text-white">
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Category Carousel */}
      <section id="shop" className="mt-12">
        <h2 className="max-w-7xl mx-auto px-6 text-3xl font-semibold mb-6">Shop by Category</h2>
        <div className="max-w-7xl mx-auto overflow-x-auto snap-x snap-mandatory flex space-x-6 px-6 pb-4">
          {['Tech', 'Fashion', 'Sports', 'Beauty'].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="snap-start min-w-[250px] h-[300px] rounded-2xl overflow-hidden shadow-lg relative"
            >
              <Image
                src={`${PLACEHOLDER}/400x300?text=${cat}`}
                layout="fill"
                objectFit="cover"
                loader={loader}
                alt={cat}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                <h3 className="text-2xl font-bold text-white">{cat}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mt-16">
        <h2 className="max-w-7xl mx-auto px-6 text-3xl font-semibold mb-6">Featured Products</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow transition transform"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={`${PLACEHOLDER}/300x300?text=Product+${idx+1}`}
                  layout="fill"
                  objectFit="cover"
                  alt={`Product ${idx+1}`}
                  loader={loader}
                />
              </div>
              <div className="p-4">
                <h4 className="text-lg font-medium mb-2">Product {idx+1}</h4>
                <p className="text-xl font-semibold mb-4">${(idx+1)*19.99}</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Deal */}
      <section className="mt-16 max-w-7xl mx-auto px-6">
        <motion.div whileHover={{ y: -3 }} className="p-6 bg-red-50 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <h4 className="text-2xl font-bold mb-2">Flash Deal: 25% off!</h4>
            <p className="font-medium">Ends in 02:15:30</p>
          </div>
          <button className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition">
            Shop Now
          </button>
        </motion.div>
      </section>

      {/* Newsletter */}
      <section className="mt-16 mb-12 glass mx-auto max-w-2xl p-8 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">Join Our Newsletter</h3>
        <p className="mb-6">Get updates on new products and upcoming sales.</p>
        <div className="flex justify-center space-x-2">
          <input
            type="email"
            placeholder="Your email address"
            className="w-3/4 p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-200 transition"
          />
          <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
            Subscribe
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-8 text-center text-gray-600 dark:text-gray-400">
        &copy; {new Date().getFullYear()} StoreName. All rights reserved.
      </footer>
    </div>
  );
};


export default CartpageMockup;
export const getStaticProps = async () => {
  return {
    props: {
      title: 'StoreName - Your One-Stop Shop',
      description: 'Discover our exclusive collection of products tailored just for you.',
    },
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};
export const config = {
  unstable_runtimeJS: false,
};
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