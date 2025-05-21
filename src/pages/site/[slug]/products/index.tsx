import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import { useRouter } from 'next/router';
import { useStateContext } from '../../../../contexts/ContextProvider';
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import { debounce } from 'lodash';
import Header from "../../../../components/site/header/Header";
import Footer from "../../../../components/site/footer/Footer";
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import Section from '@/components/site/Section/Section';

interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
// interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }
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

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  rating?: number;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  store: Store;
  products: Product[];
  categories: Category[];
  totalCount: number;
  page: number;
  pageSize: number;
  selectedCategory?: string;
  searchTerm?: string;
  sortBy?: string;
}

export default function ProductListPage({ store, products, categories, totalCount, page, pageSize, selectedCategory, searchTerm, sortBy }: Props) {
  const router = useRouter();
  const { slug } = router.query;

  const [term, setTerm] = useState(searchTerm || '');
  const [category, setCategory] = useState(selectedCategory || '');
  const [sort, setSort] = useState(sortBy || 'newest');

  // Debounce URL updates
  const updateQuery = debounce((q: any) => {
    router.push({
      pathname: `/site/${slug}/products`,
      query: { ...router.query, ...q, page: 1 }
    }, undefined, { shallow: true });
  }, 500);

  useEffect(() => {
    updateQuery({ search: term, category, sort });
  }, [term, category, sort]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const goToPage = (p: number) => {
    router.push({
      pathname: `/site/${slug}/products`,
      query: { ...router.query, page: p }
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header store={store}/>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters & Sorting */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <input
            type="text"
            placeholder="Search products..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2 w-full lg:w-1/3 focus:outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full lg:w-1/4"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full lg:w-1/4"
          >
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={products}
          // addToCart={() => {}}
          // decreaseQuantity={() => {}}
          // removeFromCart={() => {}}
        />

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >Previous</button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => goToPage(idx + 1)}
              className={`px-3 py-1 border rounded ${idx + 1 === page ? 'bg-gray-200' : ''}`}
            >{idx + 1}</button>
          ))}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >Next</button>
        </div>
      </div>
      <NewsletterSection />
      <Section title="">
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8 mb-8">
          <p className="text-lg">"Great products and fast shipping!"</p>
          <p className="text-sm text-gray-500">- Happy Customer</p>
        </div>
      </Section>
      <Footer store={store}/>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query, params }) => {
  const slug = params?.slug as string;
  const page = parseInt(query.page as string) || 1;
  const pageSize = 12;
  const search = (query.search as string) || '';
  const categoryId = (query.category as string) || null;
  const sort = (query.sort as string) || 'newest';

  // Base filter: by store slug
  const baseCompany = await prisma.company.findUnique({ where: { slug } });
  if (!baseCompany) return { notFound: true };

  const where: any = { companyId: baseCompany.id };
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (categoryId) where.categoryId = categoryId;

  // Determine order
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'priceAsc') orderBy = { finalPrice: 'asc' };
  if (sort === 'priceDesc') orderBy = { finalPrice: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  const [listings, totalCount, categories] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      // include: { images: true },
      orderBy,
    }),
    prisma.marketplaceListing.count({ where }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const products = listings.map((p) => ({
    id: p.id,
    name: p.title,
    // slug: p.slug,
    price: p.finalPrice,
    rating: 0,//p.rating,
    // imageUrl: p.images[0]?.url || '/placeholder.png',
    imageUrl: (typeof p.images[0] === 'object' && p.images[0] !== null && 'url' in p.images[0])
        ? (p.images[0] as { url: string }).url
        : '/placeholder.png',
  }));

  const cats = categories.map((c) => ({ id: c.id, name: c.name }));

  return {
    props: {
      store:baseCompany,
      products,
      categories: cats,
      totalCount,
      page,
      pageSize,
      selectedCategory: categoryId,
      searchTerm: search,
      sortBy: sort,
    },
  };
};

