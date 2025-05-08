
// pages/products/index.tsx
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState, useMemo, useEffect } from "react";
import prisma from '@/server/db/prismadb';
import Head from "next/head";
import { FaceSmileIcon, BuildingLibraryIcon, BookOpenIcon, Bars3BottomLeftIcon, HeartIcon, MagnifyingGlassCircleIcon, ShoppingBagIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";

import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';


// Type definitions
interface Product { id: string; name: string; price: number; imageUrl: string; slug: string; }
interface Store { name: string; logoUrl: string; bannerUrl: string; category: string; description: string; contactEmail: string; contactPhone: string; address: string; products: Product[]; StoreCategory: StoreCategoryUI[]; }
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }


const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Rating: High to Low" },
  { value: "newest", label: "Newest" },
];

function FiltersSidebar({ 
  categories, searchTerm, setSearchTerm, 
  selectedCat, setSelectedCat, 
  minPrice, setMinPrice, 
  maxPrice, setMaxPrice, 
  resetFilters, applyPriceFilter 
} : any) {
  const [openFacet, setOpenFacet] = useState<string | null>(null);

  const toggle = (name: string) =>
    setOpenFacet(openFacet === name ? null : name);

  return (
    <aside className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      
      {/* Search */}
      <div>
        <input
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); }}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Category Facet */}
      <div>
        <button
          onClick={() => toggle("category")}
          className="flex justify-between w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <span className="font-medium">Category</span>
          <span className={`transform transition-transform ${openFacet==="category"? "rotate-180":""}`}>▾</span>
        </button>
        {openFacet === "category" && (
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <button
                onClick={() => setSelectedCat(null)}
                className={`block w-full text-left px-2 py-1 rounded ${
                  !selectedCat ? "bg-orange-100 text-orange-700" : "hover:bg-gray-50"
                }`}
              >
                All
              </button>
            </li>
            {categories.map((cat:any) => (
              <li key={cat.slug}>
                <button
                  onClick={() => setSelectedCat(cat.slug)}
                  className={`block w-full text-left px-2 py-1 rounded ${
                    selectedCat === cat.slug
                      ? "bg-orange-100 text-orange-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price Facet */}
      <div>
        <button
          onClick={() => toggle("price")}
          className="flex justify-between w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <span className="font-medium">Price</span>
          <span className={`transform transition-transform ${openFacet==="price"? "rotate-180":""}`}>▾</span>
        </button>
        {openFacet === "price" && (
          <div className="mt-2 space-y-2">
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-1/2 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-1/2 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm"
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-1 rounded-lg text-sm transition"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
      >
        Clear All
      </button>
    </aside>
  );
}

function ActiveFilters({ selectedCat, minPrice, maxPrice, clearFilter } : any) {
  const chips = [];
  if (selectedCat) chips.push({ label: selectedCat, key: "cat" });
  if (minPrice || maxPrice)
    chips.push({ label: `${minPrice || 0}–${maxPrice || "∞"}`, key: "price" });

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {chips.map(({ label, key }) => (
        <span
          key={key}
          className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
        >
          {label}
          <button
            onClick={() => clearFilter(key)}
            className="ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}


export default function StorePage({ store, products, categories }: { store: Store; products: Product[]; categories: StoreCategoryUI[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { slug } = router.query;
  const [filterProps, setFilterProps] = useState({
    categories,
    searchTerm,
    setSearchTerm,
    selectedCat,
    setSelectedCat,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
  });

  const [chipProps, setChipProps] = useState({
    selectedCat,
    minPrice,
    maxPrice,
    clearFilter: (key: string) => {
      if (key === "cat") setSelectedCat(null);
      if (key === "price") {
        setMinPrice("");
        setMaxPrice("");
      }
    },
  });

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await fetch(`/api/store/${slug}`);
  //       const data = await res.json();
  //       setStore(data.store);
  //       setProducts(data.products);
  //       setCategories(data.categories);
  //     } catch (error) {
  //       console.error("Error fetching store data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, [slug]);

  useEffect(() => {
    setFilterProps({
      categories,
      searchTerm,
      setSearchTerm,
      selectedCat,
      setSelectedCat,
      minPrice,
      setMinPrice,
      maxPrice,
      setMaxPrice,
    });
    setChipProps({
      selectedCat,
      minPrice,
      maxPrice,
      clearFilter: (key: string) => {
        if (key === "cat") setSelectedCat(null);
        if (key === "price") {
          setMinPrice("");
          setMaxPrice("");
        }
      },
    });
  }, [categories, searchTerm, selectedCat, minPrice, maxPrice]);

  const applyPriceFilter = () => {
    setCurrentPage(1);
    setFilterProps({
      ...filterProps,
      minPrice,
      maxPrice,
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCat(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("");
    setMinRating(0);
    setCurrentPage(1);
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="loader"></div>
  //     </div>
  //   );
  // }

  // if (!store) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <p className="text-gray-500">Store not found.</p>
  //     </div>
  //   );
  // }

  return (
    <>
      <Head>
        <title>{store?.name} - Products</title>
        <meta name="description" content={store?.description} />
        <link rel="icon" href={store?.logoUrl} />
      </Head>
      <Header store={store} />
      <main className="bg-white dark:bg-gray-900">
        <div className="bg-gray-100 dark:bg-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{store?.name}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{store?.description}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Mobile filter button */}
          <div className="lg:hidden flex justify-end my-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              Filters
            </button>
          </div>

          <div className="lg:flex lg:space-x-8">
            {/* Sidebar */}
            <div className={`${drawerOpen ? "fixed inset-0 z-50 bg-black bg-opacity-30" : "hidden lg:block"} lg:relative lg:w-1/4`}>
              {drawerOpen && (
                <div className="absolute right-0 w-3/4 h-full bg-white dark:bg-gray-800 p-4 shadow-lg">
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="mb-4 text-gray-600 dark:text-gray-300"
                  >
                    Close ×
                  </button>
                  <FiltersSidebar {...filterProps} />
                </div>
              )}
              {!drawerOpen && (
                <FiltersSidebar {...filterProps} />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 my-4">
              <ActiveFilters {...chipProps} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
              {products.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 my-16">
                  No products found.
                </p>
              )}

            </div>
          </div>
        </div>
    
      </main>
      <Footer />
    
    </>
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
    props: {  
      products: store.products,
      categories: store.StoreCategory.map((c : any) => ({
        id: c.category.id,
        name: c.category.name,
        imageUrl: c.category.imageUrl,
        slug: c.category.slug,
        icon: c.category.icon,
      })),
      store,
    },
    // revalidate: 60, // Revalidate every 60 seconds
    // notFound: !store.products.length, // Return 404 if no products found
      }
  };

function ProductCard({ p }: { p: Product }) {
  return (
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
            
  );
}

// Sample data for testing
const PLACEHOLDER = "https://via.placeholder.com";
const loader = ({ src }: { src: string }) => {
  return `${src}`;
};

const products: Product[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 100) + 1,
  imageUrl: `${PLACEHOLDER}/300x300?text=Product+${i + 1}`,
  slug: `product-${i + 1}`,
}));

const categories: StoreCategoryUI[] = [
  { id: "1", name: "Electronics", imageUrl: `${PLACEHOLDER}/300x300?text=Electronics`, slug: "electronics" },
  { id: "2", name: "Fashion", imageUrl: `${PLACEHOLDER}/300x300?text=Fashion`, slug: "fashion" },
  { id: "3", name: "Home & Kitchen", imageUrl: `${PLACEHOLDER}/300x300?text=Home+%26+Kitchen`, slug: "home-kitchen" },
  { id: "4", name: "Sports", imageUrl: `${PLACEHOLDER}/300x300?text=Sports`, slug: "sports" },
  { id: "5", name: "Beauty", imageUrl: `${PLACEHOLDER}/300x300?text=Beauty`, slug: "beauty" },
  { id: "6", name: "Toys", imageUrl: `${PLACEHOLDER}/300x300?text=Toys`, slug: "toys" },
  { id: "7", name: "Books", imageUrl: `${PLACEHOLDER}/300x300?text=Books`, slug: "books" },
  { id: "8", name: "Automotive", imageUrl: `${PLACEHOLDER}/300x300?text=Automotive`, slug: "automotive" },
  { id: "9", name: "Health", imageUrl: `${PLACEHOLDER}/300x300?text=Health`, slug: "health" },
  { id: "10", name: "Grocery", imageUrl: `${PLACEHOLDER}/300x300?text=Grocery`, slug: "grocery" },
  { id: "11", name: "Pet Supplies", imageUrl: `${PLACEHOLDER}/300x300?text=Pet+Supplies`, slug: "pet-supplies" },
  { id: "12", name: "Office Supplies", imageUrl: `${PLACEHOLDER}/300x300?text=Office+Supplies`, slug: "office-supplies" },
  { id: "13", name: "Garden", imageUrl: `${PLACEHOLDER}/300x300?text=Garden`, slug: "garden" },
  { id: "14", name: "Baby", imageUrl: `${PLACEHOLDER}/300x300?text=Baby`, slug: "baby" },
  { id: "15", name: "Jewelry", imageUrl: `${PLACEHOLDER}/300x300?text=Jewelry`, slug: "jewelry" },
  { id: "16", name: "Footwear", imageUrl: `${PLACEHOLDER}/300x300?text=Footwear`, slug: "footwear" },
  { id: "17", name: "Luggage", imageUrl: `${PLACEHOLDER}/300x300?text=Luggage`, slug: "luggage" },
];

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

function Header({ store }: any) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const languages = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
  ];
  const [lang, setLang] = useState(languages[0]);

  return (
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
  );
}
