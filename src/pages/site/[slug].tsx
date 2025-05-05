// pages/stores/[slug].tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassCircleIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';

// Sample promotions, categories, products
type Promo = { id: string; title: string; subtitle: string; imageUrl: string; };

const SAMPLE_PROMOS: Promo[] = [
  { id: 'promo1', title: 'Spring Sale', subtitle: 'Up to 50% off select items', imageUrl: 'https://via.placeholder.com/600x300?text=Spring+Sale' },
  { id: 'promo2', title: 'New Arrivals', subtitle: 'Just landed this week', imageUrl: 'https://via.placeholder.com/600x300?text=New+Arrivals' },
  { id: 'promo3', title: 'Best Sellers', subtitle: 'Our most popular picks', imageUrl: 'https://via.placeholder.com/600x300?text=Best+Sellers' },
];
// Theme per category
const CATEGORY_THEMES: Record<string, { gradient: string; accent: string }> = {
  'Tech Gadgets': { gradient: 'from-blue-600 to-blue-400', accent: 'text-blue-200' },
  'Vehicles': { gradient: 'from-gray-800 to-gray-600', accent: 'text-yellow-300' },
  'Fashion': { gradient: 'from-pink-500 to-purple-500', accent: 'text-white' },
  'Household': { gradient: 'from-green-600 to-green-400', accent: 'text-green-100' },
  'Sports & Outdoors': { gradient: 'from-orange-500 to-yellow-400', accent: 'text-white' },
  'Beauty & Health': { gradient: 'from-pink-700 to-pink-500', accent: 'text-white' },
  'Toys & Hobbies': { gradient: 'from-purple-600 to-pink-400', accent: 'text-white' },
  'Other': { gradient: 'from-gray-500 to-gray-300', accent: 'text-white' },
};


// Sample categories
type Category = { id: string; name: string; imageUrl: string; };
const SAMPLE_CATEGORIES: Category[] = [
  { id: 'tech', name: 'Tech Gadgets', imageUrl: 'https://via.placeholder.com/400x300?text=Tech' },
  { id: 'fashion', name: 'Fashion', imageUrl: 'https://via.placeholder.com/400x300?text=Fashion' },
  { id: 'sports', name: 'Sports & Outdoors', imageUrl: 'https://via.placeholder.com/400x300?text=Sports' },
  { id: 'beauty', name: 'Beauty & Health', imageUrl: 'https://via.placeholder.com/400x300?text=Beauty' },
];

// Sample products
// type Product = { id: string; name: string; price: number; imageUrl: string; slug: string; };
const SAMPLE_PRODUCTS: Product[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `${i + 1}`,
  name: `Sample Product ${i + 1}`,
  slug: `product-${i + 1}`,
  price: ((i + 1) * 10) + 0.99,
  imageUrl: 'https://via.placeholder.com/300',
}));

type LoaderProps = { src: string; width: number; quality?: number };
const loader = ({ src, width, quality }: LoaderProps) => `${src}?w=${width}&q=${quality || 75}`;

interface Product { id: string; name: string; price: number; imageUrl: string; slug: string; }
interface Store { name: string; logoUrl: string; bannerUrl: string; category: string; description: string; contactEmail: string; contactPhone: string; address: string; products: Product[]; }

export default function StorePage({ store }: { store: Store }) {
  if (!store) return <div className="min-h-screen flex items-center justify-center"><p>Store not found</p></div>;
  const theme = CATEGORY_THEMES[store.category] || CATEGORY_THEMES.Other;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header store={store} theme={theme} />
      <Hero />

        {/* Promotions Carousel */}
      <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Promotions</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {SAMPLE_PROMOS.map(promo => (
            <div key={promo.id} className="relative min-w-[300px] rounded-lg overflow-hidden shadow-lg">
              <Image src={promo.imageUrl} alt={promo.title} width={600} height={300} objectFit="cover" loader={loader} />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
                <h3 className="text-2xl font-bold text-white">{promo.title}</h3>
                <p className="text-white">{promo.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <main id="products" className="max-w-7xl mx-auto p-6">
        <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_CATEGORIES.map(cat => (
            <Link key={cat.id} href={`/stores/${cat.id}`} className="group block rounded-lg overflow-hidden shadow hover:shadow-lg transform hover:-translate-y-1 transition duration-200 bg-white dark:bg-gray-800">
                <div className="relative h-40 w-full">
                  <Image src={cat.imageUrl} alt={cat.name} layout="fill" objectFit="cover"  loader={loader}/>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition">{cat.name}</h3>
                </div>
              
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_PRODUCTS.map(p => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="relative h-56 w-full">
                  <Image src={p.imageUrl} alt={p.name} layout="fill" objectFit="cover" loader={loader}/>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition">{p.name}</h4>
                  <p className="mt-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${p.price.toFixed(2)}</p>
                  <button className="mt-3 w-full text-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition">
                    Add to Cart
                  </button>
                </div>
              
            </Link>
          ))}
        </div>
      </section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {store.products.map(p => (
            <Link key={p.id} href={`/products/${p.slug}`} 
               className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="relative h-52 w-full">
                  <Image src={p.imageUrl} alt={p.name} layout="fill" objectFit="cover" loader={loader} />
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition">{p.name}</h4>
                  <p className="mt-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${p.price.toFixed(2)}</p>
                  <button className="mt-3 w-full text-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition">Add to Cart</button>
                </div>
              
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const store = await prisma.company.findUnique({
    where: { slug },
    select: {
      name: true,
      logoUrl: true,
      bannerUrl: true,
      category: true,
      products: { take: 8, select: { id: true, name: true, finalPrice: true, images: true } },
    },
  });
  if (!store) return { notFound: true };
  return { props: { store } };
};

function Header({ store, theme }: { store: Store; theme: { gradient: string; accent: string } }) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
            <Image src={store.logoUrl} alt="logo" width={40} height={40} loader={loader} className="rounded" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{store.name}</span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="relative text-gray-500">
            <MagnifyingGlassCircleIcon className="absolute left-2 top-1/2 h-6 w-6 text-gray-400 transform -translate-y-1/2" />
            <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-1 rounded-full border focus:ring" />
          </div>
          <Link href="/cart" className="relative text-gray-700 dark:text-gray-300">
              <ShoppingBagIcon className="h-6 w-6" />
          </Link>
          <Link href="/account" className="text-gray-700 dark:text-gray-300">
              <UserIcon className="h-6 w-6" />
            
          </Link>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 py-2">
        <div className="max-w-7xl mx-auto px-6">
          <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${theme.gradient} ${theme.accent} text-sm font-semibold`}>
            {store.category}
          </span>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div className="relative h-80 w-full overflow-hidden">
      <Image
        src="https://via.placeholder.com/1600x400?text=Welcome+to+Our+Store"
        alt="Hero banner"
        layout="fill"
        objectFit="cover"
        loader={loader}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-start p-8">
        <h1 className="text-5xl font-bold text-white mb-4">Discover Amazing Products</h1>
        <p className="text-lg text-white mb-6 max-w-lg">Browse our curated collections and find what you love.</p>
        <Link href="#products" className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">Start Shopping</Link>
      </div>
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(p => (
        <Link key={p.id} href={`/products/${p.slug}`} className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="relative h-52 w-full">
              <Image src={p.imageUrl} alt={p.name} layout="fill" objectFit="cover" loader={loader} />
            </div>
            <div className="p-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition">{p.name}</h4>
              <p className="mt-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${p.price.toFixed(2)}</p>
              <button className="mt-3 w-full text-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition">
                Add to Cart
              </button>
            </div>
          
        </Link>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
      &copy; {new Date().getFullYear()} All Rights Reserved.
    </footer>
  );
}