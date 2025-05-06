import React from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassCircleIcon, ShoppingBagIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
      <Hero bannerUrl={store.bannerUrl} />
      <StoreInfo store={store} />
      <PromoCarousel promos={SAMPLE_PROMOS} />
      <Section title="Shop by Category">
        <CategoryGrid categories={storeCategories} />
      </Section>
      <Section title="Featured Products">
        <ProductGrid products={store.products} />
      </Section>
      <Section title="All Products">
        <ProductGrid products={store.products} />
      </Section>
      <Section title="Customer Reviews">
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8">
          <p className="text-lg">"Great products and fast shipping!"</p>
          <p className="text-sm text-gray-500">- Happy Customer</p>
        </div>
      </Section>
      <Footer />
    </div>
  );
}

// Server-side fetch


// pages/site/[slug].tsx (or stores/[slug].tsx)
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
          // slug: true,
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
      id: p.id,
      name: p.name,
      // slug: p.slug,
      price: p.finalPrice,
      imageUrl: p.images[0] ?? '/placeholder.png'
    }))
  };

  return {
    props: { store }
  };
};





// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const store = await prisma.company.findUnique({
//     where: { slug: String(params?.slug) },
//     include: {
//       products: {
//         take: 8,
//         select: {
//           id: true,
//           name: true,
//           finalPrice: true,
//           images: true
//         }
//       },
//       StoreCategory: {
//         orderBy: { sortOrder: 'asc' },
//         include: { category: true }
//       }
//     }
//   });
//   // ...
//   return {
//     props: {
//       store: {
//         ...store,
//         products: store?.products?.map(p => ({
//           id: p.id,
//           name: p.name,
//           price: p.finalPrice,
//           imageUrl: p.images[0] ?? '/placeholder.png'
//         }))
//       }
//     }
//   };
// };

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const slug = params?.slug as string;
//   const store = await prisma.company.findUnique({
//     where: { slug },
//     select: {
//       name: true,
//       logoUrl: true,
//       bannerUrl: true,
//       category: true,
//       products: { take: 8, select: { id: true, name: true, finalPrice: true, images: true } },
//     },
//   });
//   if (!store) return { notFound: true };
//   return { props: { store } };
// };

// Components
function Header({ store }: { store: Store }) {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image loader={loader} src={store.logoUrl} alt="logo" width={50} height={50} className="rounded-full" />
            <span className="text-2xl font-extrabold">{store.name}</span>
          </div>
        </Link>
        <div className="flex items-center space-x-5">
          <SearchBar />
          <Link href="/cart"><ShoppingBagIcon className="h-6 w-6 hover:text-blue-500 transition" /></Link>
          <Link href="/account"><UserIcon className="h-6 w-6 hover:text-blue-500 transition" /></Link>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-2">
        <span className="px-4 py-1 bg-white bg-opacity-30 rounded-full font-medium">{store.category}</span>
      </div>
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
    <div className="relative h-96 w-full overflow-hidden">
      <Image loader={loader} src={bannerUrl} alt="Hero" layout="fill" objectFit="cover" className="brightness-75" />
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
    <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-12 text-center text-gray-600 dark:text-gray-400">
      &copy; {new Date().getFullYear()} All Rights Reserved.
    </footer>
  );
}
