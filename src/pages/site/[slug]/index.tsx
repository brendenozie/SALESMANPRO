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

const tabs: Array<keyof typeof sampleProducts> = ['New Arrivals', 'Best Sellers', 'Trending'];

const sampleProducts = {
  'New Arrivals': [
    { id: 1, name: 'Wireless Earbuds', price: 'Ksh 3,500' },
    { id: 2, name: 'Smartwatch', price: 'Ksh 6,999' },
  ],
  'Best Sellers': [
    { id: 3, name: 'Bluetooth Speaker', price: 'Ksh 4,200' },
    { id: 4, name: 'Gaming Mouse', price: 'Ksh 2,800' },
  ],
  'Trending': [
    { id: 5, name: 'Phone Gimbal', price: 'Ksh 7,000' },
    { id: 6, name: 'Portable Projector', price: 'Ksh 12,000' },
  ],
};


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

const features = [
  { Icon: TruckIcon, title: 'Free Delivery', desc: 'On orders over $99' },
  { Icon: PhoneIcon, title: '24/7 Support', desc: 'We’re here to help' },
  { Icon: ShieldCheckIcon, title: 'Secure Payment', desc: '100% secure checkout' },
  { Icon: ArrowsUpDownIcon, title: 'Easy Returns', desc: '30-day return policy' },
];

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Type definitions
interface Product { id: string; name: string; price: number; imageUrl: string; slug: string; }
interface Store { name: string; logoUrl: string; bannerUrl: string; category: string; description: string; contactEmail: string; contactPhone: string; address: string; products: Product[]; StoreCategory: StoreCategoryUI[]; }
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }


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
      MarketplaceListing: {
        take: 8,
        select: {
          id: true,
          title: true,
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
    // socialLinks: raw.socialLinks,
    // policies: raw.policies,
    // shippingZones: raw.shippingZones,
    // domain: raw.domain,
    // currency: raw.currency,
    // locale: raw.locale,
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
    products: raw.MarketplaceListing.map(p => ({
      imageUrl: (p.images[0] as { url: string })?.url ?? '/placeholder.png',
      name: p.title,
      // slug: p.slug,
      price: p.finalPrice,
    }))
  };

  return {
    props: { store }
  };
};

function Header({ store }: any) {
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
            <button className="relative text-gray-600 hover:text-orange-600">
              <HeartIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-2 bg-orange-600 text-white rounded-full text-xs px-1">
                5
              </span>
            </button>
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

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((p) => (
        <Link key={p.id} href={`/products/${p.slug}`} className="focus:outline-none group">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                loader={loader}
                src={p.imageUrl}
                alt={p.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4 flex flex-col justify-between h-40">
              <div>
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 truncate">
                  {p.name}
                </h4>
                <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">${p.price.toFixed(2)}</p>
              </div>
              <button
                className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-full text-sm transition"
              >
                Add to Cart
              </button>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

function Section({ title, children, background = "none", }: { title: string; children: React.ReactNode; background?: "light" | "dark" | "none"; }) {

  const bgClass = clsx({
    "bg-gray-50": background === "light",
    "bg-gray-900 text-white": background === "dark",
    "": background === "none",
  });

  return (
    <section className={clsx("py-16", bgClass)}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={clsx(
            "text-3xl sm:text-4xl font-bold mb-4",
            background === "dark" ? "text-white" : "text-gray-800"
          )}
        >
          {title}
        </motion.h2>
        {title !== "" && (
          <>
            <div  className={clsx("w-16 h-1 rounded mb-8",  background === "dark" ? "bg-blue-400" : "bg-blue-600")} />
          </>
        )}        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-gray-600 mb-6"
        >
          {children}
        </motion.p>
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
          <button className="px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-r-lg">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

function CategoryBanners({ categories }: { categories: StoreCategoryUI[];}) {
  return (
    <section className="py-16 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.id ?? "#"}
              className="group relative block rounded-xl overflow-hidden shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-48"
              >
                <Image
                  src={cat.icon ?? cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loader={loader}
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />

                <div className="absolute inset-0 flex flex-col items-start justify-end p-4 z-10">
                  <div className="text-white text-3xl mb-1">{cat.icon}</div>
                  <span className="text-white text-lg font-semibold">
                    {cat.name}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceFeatures({ store }: { store: Store }) {
  return (
    <section className="py-16 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ Icon, title, desc }, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-start bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-center bg-orange-100 text-orange-600 rounded-full w-12 h-12 mb-4">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
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

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-12">
        
        {/* About Us */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
          <p className="text-sm leading-relaxed text-gray-400">
            We’re the best marketplace for everything you need. Join thousands of satisfied customers today.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="/returns" className="hover:text-white transition-colors">Returns</a></li>
            <li><a href="/shipping" className="hover:text-white transition-colors">Shipping</a></li>
            <li><a href="/track" className="hover:text-white transition-colors">Track Order</a></li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <FaceSmileIcon className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <BuildingLibraryIcon className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <BookOpenIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Your Store. All rights reserved.
      </div>
    </footer>
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
