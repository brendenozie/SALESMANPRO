// File structure:
// /pages/index.tsx               - Home page (list of categories)
// /pages/categories/[slug].tsx   - Category page (list of stores)
// /pages/stores/[id].tsx         - Store detail page
// /components/Layout.tsx         - Shared layout
// /components/CategoryCard.tsx    - Displays category link
// /components/StoreCard.tsx       - Displays store summary
// /lib/api.ts                     - Fetch helper functions

/* /lib/api.ts */
export async function fetchCategories() {
  // In a real app, fetch from /api/categories or database
  return [
    "Tech Gadgets",
    "Vehicles",
    "Fashion",
    "Household",
    "Sports & Outdoors",
    "Beauty & Health",
    "Toys & Hobbies",
    "Other",
  ];
}

export async function fetchStoresByCategory(category: string) {
  const res = await fetch(`/api/stores?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
}

export async function fetchStoreById(id: string) {
  const res = await fetch(`/api/stores/${id}`);
  if (!res.ok) throw new Error("Failed to fetch store");
  return res.json();
}

/* /components/Layout.tsx */
import Link from 'next/link';
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between">
          <Link href="/">
            <a className="text-2xl font-bold">My Marketplace</a>
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500">
        &copy; 2025 My Marketplace
      </footer>
    </div>
  );
}

/* /components/CategoryCard.tsx */
import Link from 'next/link';
export default function CategoryCard({ name }) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  return (
    <Link href={`/categories/${slug}`}>
      <a className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
        <h3 className="text-lg font-semibold">{name}</h3>
      </a>
    </Link>
  );
}

/* /components/StoreCard.tsx */
import Link from 'next/link';
export default function StoreCard({ store }) {
  return (
    <Link href={`/stores/${store.id}`}>
      <a className="block bg-white rounded-lg shadow hover:shadow-md transition p-4">
        <img src={store.bannerUrl} alt={store.name} className="h-32 w-full object-cover rounded" />
        <h4 className="mt-2 font-bold text-xl">{store.name}</h4>
        <p className="text-gray-600 truncate">{store.description}</p>
      </a>
    </Link>
  );
}

/* /pages/index.tsx */
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import CategoryCard from '../components/CategoryCard';
import { fetchCategories } from '../lib/api';

export default function Home({ categories }) {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Browse by Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <CategoryCard key={cat} name={cat} />
        ))}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const categories = await fetchCategories();
  return { props: { categories } };
};

/* /pages/categories/[slug].tsx */
import { GetStaticPaths, GetStaticProps } from 'next';
import Layout from '../../components/Layout';
import StoreCard from '../../components/StoreCard';
import { fetchCategories, fetchStoresByCategory } from '../../lib/api';

export default function CategoryPage({ category, stores }) {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">{category}</h1>
      {stores.length === 0 ? (
        <p>No stores found under this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => <StoreCard key={store.id} store={store} />)}
        </div>
      )}
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = await fetchCategories();
  const paths = categories.map(cat => ({ params: { slug: cat.toLowerCase().replace(/[^a-z0-9]+/g,'-') } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params.slug as string;
  const category = slug.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase());
  const stores = await fetchStoresByCategory(category);
  return { props: { category, stores } };
};

/* /pages/stores/[id].tsx */
import { GetServerSideProps } from 'next';
import Layout from '../../components/Layout';
import { fetchStoreById } from '../../lib/api';

export default function StoreDetail({ store }) {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">{store.name}</h1>
      <img src={store.bannerUrl} alt={store.name} className="w-full h-64 object-cover rounded mb-6" />
      <p className="mb-4">{store.description}</p>
      <p><strong>Contact:</strong> {store.contactEmail} | {store.contactPhone}</p>
      <p><strong>Address:</strong> {store.address}</p>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const store = await fetchStoreById(params.id as string);
  return { props: { store } };
};
