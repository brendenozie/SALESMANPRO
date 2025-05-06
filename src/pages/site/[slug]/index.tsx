import React,{ useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDownIcon, HeartIcon, MagnifyingGlassCircleIcon, ShoppingBagIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, XMarkIcon, Bars3BottomLeftIcon, FaceSmileIcon, BookOpenIcon, TruckIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import banner from '@/assets/homebanner.png';
import { BuildingLibraryIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';


// Type definitions
interface Product { id: string; name: string; price: number; imageUrl: string; slug: string; }
interface Store { name: string; logoUrl: string; bannerUrl: string; category: string; description: string; contactEmail: string; contactPhone: string; address: string; products: Product[]; StoreCategory: StoreCategoryUI[]; }
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }

// Sample data (replace with real queries or props)
const SAMPLE_PROMOS: Promo[] = [
  { id: 'promo1', title: 'Spring Sale', subtitle: 'Up to 50% off select items', imageUrl: 'https://via.placeholder.com/600x300?text=Spring+Sale' },
  { id: 'promo2', title: 'New Arrivals', subtitle: 'Just landed this week', imageUrl: 'https://via.placeholder.com/600x300?text=New+Arrivals' },
  { id: 'promo3', title: 'Best Sellers', subtitle: 'Our most popular picks', imageUrl: 'https://via.placeholder.com/600x300?text=Best+Sellers' },
];

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

export default function StorePage({ store }: { store: Store }) {

  const storeCategories = store.StoreCategory
  .filter((sc:any) => sc.visible)
  // .sort(({a, b}:any) => a.sortOrder - b.sortOrder)
  .map((sc:any) => ({
    id: sc.category.id,
    name: sc.displayName || sc.category.name,
    imageUrl: sc.category.image,
    slug: sc.category.slug,
    icon: sc.icon || sc.category.icon
  }));

  if (!store) return <EmptyState />;
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header store={store} />
      <HeroSlider bannerUrl={store.bannerUrl} />
      <Section title="">
        <ServiceFeatures store={store} />
      </Section>
      <Section title="">
        <CategoryBanners categories={storeCategories} />
      </Section>
      <Section title="Trending Products">
        <ProductGrid products={store.products} />
      </Section> 
      <Section title="Top Selling">
        <ProductGrid products={store.products} />
      </Section> 
      <Section title="All Products">
        <ProductGrid products={store.products} />
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
      products: {
        take: 8,
        select: {
          id: true,
          name: true,
          finalPrice: true,
          images: true
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
              // omit createdAt/updatedAt if you don't need them
            }
          }
        }
      }
    }
  });

  if (!raw) {
    return { notFound: true };
  }

  // Build a clean, serializable DTO
  const store = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    category: raw.category,
    logoUrl: raw.logoUrl,
    bannerUrl: raw.bannerUrl,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone,
    address: raw.address,
    socialLinks: raw.socialLinks,
    policies: raw.policies,
    shippingZones: raw.shippingZones,
    domain: raw.domain,
    currency: raw.currency,
    locale: raw.locale,
    // convert dates to strings if you need them
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),

    // map categories into the shape your UI expects
    StoreCategory: raw.StoreCategory.map(sc => ({
      id: sc.id,
      sortOrder: sc.sortOrder,
      visible: sc.visible,
      displayName: sc.displayName,
      icon: sc.icon,
      category: {
        id: sc.category.id,
        name: sc.category.name,
        slug: sc.category.slug,
        imageUrl: sc.category.image,
        icon: sc.category.icon,
      }
    })),

    // map products into your ProductGrid shape
    products: raw.products.map(p => ({
      imageUrl: (p.images[0] as { url: string })?.url ?? '/placeholder.png',
      name: p.name,
      // slug: p.slug,
      price: p.finalPrice,
    }))
  };

  return {
    props: { store }
  };
};

function Header({ store }:any) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    // add more
  ];
  const [lang, setLang] = useState(languages[0]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Promo Bar */}
        <div className="flex items-center justify-between h-8 bg-green-50 text-green-800 text-sm font-medium">
          <div>Super Value Deals — Save more with coupons</div>
          <div className="flex items-center space-x-4">
            <select
              value={lang.code}
              // onChange={(e) => setLang(languages.find(l => l.code === e.target.value))}
              className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <Link href="/login" className="text-sm text-green-600 hover:underline">Login</Link>
            <Link href="/register" className="text-sm text-green-600 hover:underline">Register</Link>
            <Link href="/cart" className="text-sm text-green-600 hover:underline">Cart</Link>
            </div>
        </div>
        {/* Main Nav */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/">
              <img src="/logo.svg" alt="logo" className="h-8 w-auto" />
            </Link>
            <div className="hidden lg:flex lg:space-x-4">
              <Link href="/" className="hover:text-green-600">Home</Link>
              <Link href="/shop" className="hover:text-green-600">Shop</Link>
            </div>
          </div>

          <div className="flex-1 mx-8 hidden lg:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 focus:ring-green-500 focus:border-green-500"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <MagnifyingGlassCircleIcon className="h-5 w-5 text-gray-500 hover:text-green-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative hover:text-green-600">
              <HeartIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-2 bg-green-600 text-white rounded-full text-xs px-1">5</span>
            </button>
            <button className="relative hover:text-green-600">
              <UserIcon className="h-6 w-6" />
            </button>
            <button className="relative hover:text-green-600">
              <ShoppingBagIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-2 bg-green-600 text-white rounded-full text-xs px-1">{store.cartCount}</span>
            </button>
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomLeftIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link href="/" className="block">Home</Link>
            <Link href="/shop" className="block">Shop</Link>
            <Link href="/categories" className="block">Categories</Link>
          </div>
        </div>
      )}
    </header>
  );
}


function SearchBar() {
  return (
    <div className="relative">
      <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
      <input
        type="text"
        placeholder="Search products..."
        className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring focus:ring-blue-200 transition"
      />
    </div>
  );
}

function Hero({ bannerUrl }: { bannerUrl: string }) {
  return (
    <div className="relative h-[450px] w-full overflow-hidden">
      <Image loader={loader} src={banner} alt="Hero" layout="fill" objectFit="cover" className="brightness-75" />
      <div className="absolute inset-0 flex flex-col justify-center items-start p-8">
        <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl font-bold text-white">
          Discover Amazing Products
        </motion.h1>
        <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 text-lg text-white max-w-xl">
          Browse our curated collections and find what you love.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Link href="#products" className="mt-6 inline-block bg-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition text-white">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    </div>
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

function PromoCarousel({ promos }: { promos: Promo[] }) {
  return (
    <section className="mt-12">
      <h2 className="max-w-7xl mx-auto px-6 text-3xl font-semibold mb-4">Current Promotions</h2>
      <div className="relative overflow-x-auto snap-x snap-mandatory flex space-x-6 px-6 pb-4">
        {promos.map(promo => (
          <motion.div whileHover={{ scale: 1.05 }} key={promo.id} className="snap-start min-w-[300px] rounded-lg overflow-hidden shadow-lg">
            <Image loader={loader} src={promo.imageUrl} alt={promo.title} width={600} height={300} objectFit="cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
              <h3 className="text-2xl font-bold text-white">{promo.title}</h3>
              <p className="text-white">{promo.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }

function CategoryGrid({ categories }: { categories: StoreCategoryUI[] }) {
  return (
    <div  id="products" className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map(cat => (
        <Link key={cat.id} href={`/stores`}>
          {/* /${store.slug}/category/${cat.slug} */}
          <motion.div whileHover={{ y: -5 }} className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow transition transform">
            <div className="flex items-center justify-center text-3xl">
              {cat.icon}
            </div>
            <div className="relative h-40 w-full">
              <Image src={cat.imageUrl} loader={loader} alt={cat.name} layout="fill" objectFit="cover" />
            </div>
            <h3>{cat.name}</h3>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(p => (
        <Link key={p.id} href={`/products/${p.slug}`}>  
          <motion.div whileHover={{ scale: 1.03 }} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow transition transform">
            <div className="relative h-52 w-full">
              <Image loader={loader} src={p.imageUrl} alt={p.name} layout="fill" objectFit="cover" />
            </div>
            <div className="p-4">
              <h4 className="text-lg font-medium group-hover:text-blue-600 transition">{p.name}</h4>
              <p className="mt-2 text-xl font-semibold">${p.price.toFixed(2)}</p>
              <button className="mt-3 w-full px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition">
                Add to Cart
              </button>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="max-w-7xl mx-auto px-6 text-3xl font-semibold mb-6">{title}</h2>
      {children}
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

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-4 text-white">About Us</h3>
          <p className="text-sm">We’re the best marketplace for everything you need.</p>
        </div>
        <div>
          <h3 className="font-bold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
            <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4 text-white">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/help" className="hover:text-white">Help Center</a></li>
            <li><a href="/returns" className="hover:text-white">Returns</a></li>
            <li><a href="/shipping" className="hover:text-white">Shipping</a></li>
            <li><a href="/track" className="hover:text-white">Track Order</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4 text-white">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white"><FaceSmileIcon className="h-5 w-5" /></a>
            <a href="#" className="hover:text-white"><BuildingLibraryIcon className="h-5 w-5" /></a>
            <a href="#" className="hover:text-white"><BookOpenIcon className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Your Store. All rights reserved.
      </div>
    </footer>
  );
}

function NewsletterSection() {
  return (
    <section className="py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Newsletter</h2>
        <p className="text-gray-600 mb-6">Get the latest offers and updates straight to your inbox.</p>
        <form className="max-w-md mx-auto flex">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none"
          />
          <button className="px-6 bg-green-600 hover:bg-green-700 text-white rounded-r-lg">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

function ProductShowcase({ title, products }: { title: string; products: Product[] }) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(p => (
        <Link key={p.id} href={`/products/${p.slug}`}>  
          <motion.div whileHover={{ scale: 1.03 }} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow transition transform">
            <div className="relative h-52 w-full">
              <Image loader={loader} src={p.imageUrl} alt={p.name} layout="fill" objectFit="cover" />
            </div>
            <div className="p-4">
              <h4 className="text-lg font-medium group-hover:text-blue-600 transition">{p.name}</h4>
              <p className="mt-2 text-xl font-semibold">${p.price.toFixed(2)}</p>
              <button className="mt-3 w-full px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition">
                Add to Cart
              </button>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}


function CategoryBanners(   { categories }: { categories: StoreCategoryUI[] }) {
  return (
    <section className="py-12">
        <div className="container max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <a
              key={idx}
              // href={cat.link}
              className="relative block h-48 overflow-hidden rounded-lg group"
            >
              {/* icon */}
              <div className="absolute top-4 left-4 text-white text-3xl">
                {cat.icon}
              </div>
              {/* <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover transform group-hover:scale-110 transition"
                loader={loader}
              /> */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">{cat.name}</span>
              </div>
            </a>
          ))}
        </div>
    </section>
  );
}

const features = [
  { Icon: TruckIcon, title: 'Free Delivery', desc: 'On orders over $99' },
  { Icon: PhoneIcon, title: '24/7 Support', desc: 'We’re here to help' },
  { Icon: ShieldCheckIcon, title: 'Secure Payment', desc: '100% secure checkout' },
  { Icon: ArrowsUpDownIcon, title: 'Easy Returns', desc: '30-day return policy' },
];

function ServiceFeatures({ store }: { store: Store }) {
  return (
      <div className="py-12 bg-gray-50">
        <div className="container max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ Icon, title, desc }, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <Icon className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}

// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import Image from 'next/image';

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

function HeroSlider({ bannerUrl }: { bannerUrl: string }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // auto-advance
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
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`
            absolute inset-0 transition-opacity duration-1000
            ${i === current ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
             loader={loader}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-start px-8 md:px-16 text-white">
            <p className="text-lg md:text-xl mb-2">{slide.subtitle}</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h2>
            <a
              href={slide.ctaLink}
              className="inline-block bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium"
            >
              {slide.ctaText}
            </a>
          </div>
        </div>
      ))}

      {/* Prev/Next buttons */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full text-white"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full text-white"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`
              w-3 h-3 rounded-full
              ${idx === current ? 'bg-white' : 'bg-white bg-opacity-50'}
            `}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
