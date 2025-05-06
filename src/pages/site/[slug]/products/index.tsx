
// pages/products/index.tsx
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState, useMemo, useEffect } from "react";
import prisma from '@/server/db/prismadb';
import Head from "next/head";
import { FaceSmileIcon, BuildingLibraryIcon, BookOpenIcon } from "@heroicons/react/24/outline";

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


export default function ProductsPage({
  products,
  categories,
}: {
  products: Product[];
  categories: StoreCategoryUI[];
}) {

const router = useRouter();
  const { query } = router;

  // State synced with URL
  const [searchTerm, setSearchTerm] = useState(query.search || "");
  const [selectedCat, setSelectedCat] = useState<string | null>(query.category as string || null);
  const [minPrice, setMinPrice] = useState(query.min || "");
  const [maxPrice, setMaxPrice] = useState(query.max || "");
  const [sort, setSort] = useState(query.sort as string || "");
  const [minRating, setMinRating] = useState(Number(query.rating) || 0);
  const [currentPage, setCurrentPage] = useState(Number(query.page) || 1);

  // Update URL when filters change
  useEffect(() => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCat) params.category = selectedCat;
    if (minPrice) params.min = minPrice;
    if (maxPrice) params.max = maxPrice;
    if (sort) params.sort = sort;
    if (minRating) params.rating = String(minRating);
    if (currentPage !== 1) params.page = String(currentPage);
    router.replace({ pathname: router.pathname, query: params }, undefined, { shallow: true });
  }, [searchTerm, selectedCat, minPrice, maxPrice, sort, minRating, currentPage]);

  // 1. Filter & sort logic
  const filtered = useMemo(() => {
    let arr = products
      .filter((p:any) => p.name.toLowerCase().includes((searchTerm as string).toLowerCase()))
      .filter((p:any) => selectedCat ? p.categorySlug === selectedCat : true)
      // .filter((p:any) => p.price >= parseFloat(minPrice || "0") && p.price <= parseFloat(maxPrice || String(Infinity)))
      .filter((p:any) => p.rating >= minRating);

    switch (sort) {
      case "price_asc":
        arr.sort(({a, b}:any) => a.price - b.price);
        break;
      case "price_desc":
        arr.sort(({a, b}:any) => b.price - a.price);
        break;
      case "rating_desc":
        arr.sort(({a, b}:any) => b.rating - a.rating);
        break;
      case "newest":
        arr.sort(({a, b}:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return arr;
  }, [products, searchTerm, selectedCat, minPrice, maxPrice, sort, minRating]);

  // 2. Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCat(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("");
    setMinRating(0);
    setCurrentPage(1);
  };

  // SEO metadata
  const categoryName = selectedCat ? categories.find(c => c.slug === selectedCat)?.name : "All Products";
  const metaTitle = `${categoryName}${searchTerm ? ` - "${searchTerm}"` : ''} | Page ${currentPage}`;
  // const metaDesc = `Browse our ${categoryName.toLowerCase()}${searchTerm ? ` matching "${searchTerm}"` : ''}. Page ${currentPage} of ${totalPages}.`;
  const metaDesc = `Browse our ${categoryName?.toLowerCase()}${searchTerm ? ` matching "${searchTerm}"` : ''}.`;
  const metaImage = products[0]?.imageUrl || "/placeholder.png";    
  const metaUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/site/${router.query.slug}/products`;
  const metaType = "website";
  const metaSiteName = "Your Store Name"; // Replace with your store name
  const metaTwitterCard = "summary_large_image";
  const metaTwitterSite = "@yourtwitterhandle"; // Replace with your Twitter handle
  const metaTwitterTitle = metaTitle;
  const metaTwitterDesc = metaDesc;
  const metaTwitterImage = metaImage;
  const metaTwitterImageAlt = "Product Image"; // Replace with a description of the image
  const metaTwitterCreator = "@yourtwitterhandle"; // Replace with your Twitter handle
  const metaTwitterImageWidth = 1200;
  const metaTwitterImageHeight = 630;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
      </Head>
      <main className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search + Filters */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 1. Search Bar */}
            <div className="lg:col-span-4">
              <input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 text-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* 2. Category Filter */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                Category
              </h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <button
                    onClick={() => {
                      setSelectedCat(null);
                      setCurrentPage(1);
                    }}
                    className={`block w-full text-left px-2 py-1 rounded ${
                      !selectedCat
                        ? "bg-green-100 dark:bg-green-800 text-green-700"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    All
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => {
                        setSelectedCat(cat.slug);
                        setCurrentPage(1);
                      }}
                      className={`block w-full text-left px-2 py-1 rounded ${
                        selectedCat === cat.slug
                          ? "bg-green-100 dark:bg-green-800 text-green-700"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Price Range */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                Price
              </h4>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-1/2 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-1/2 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            {/* 4. Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 text-sm transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No products found.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// get products from server


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
















// export async function getServerSideProps(context: any) {
//   const { slug } = context.query;
//   const res = await fetch(`https://api.example.com/stores/${slug}`);
//   const store: Store = await res.json();

//   // Fetch categories
//   const categoriesRes = await fetch("https://api.example.com/categories");
//   const categories: StoreCategoryUI[] = await categoriesRes.json();

//   return {
//     props: {
//       products: store.products,
//       categories,
//     },
//   };
// }






function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>
        <p className="text-green-600 font-bold mt-2">KSh {product.price}</p>
        <a
          href={`/product/${product.id}`}
          className="mt-3 inline-block text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          View Product
        </a>
      </div>
    </div>
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
