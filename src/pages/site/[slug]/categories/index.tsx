import React from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';
import Section from '@/components/site/Section/Section';
import Link from 'next/link';
import Image from 'next/image';


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

interface FooterProps {
  store: Store;
}

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

interface CategoryCard {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  icon?: string;
}

interface Props {
  categories: CategoryCard[];
  storeSlug: string;
  store:Store;
}

const CategoriesPage: React.FC<Props> = ({ categories, storeSlug, store }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <Header store={store}/>
      <Section title="Shop by Category" background="none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/site/${storeSlug}/products?category=${cat.id}`}
                className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                <div className="relative h-48 w-full">
                  <Image
                    loader={loader}
                    src={cat.imageUrl}
                    alt={cat.name}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  {cat.icon && <div className="mb-2 text-3xl">{cat.icon}</div>}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
      <Footer store={store}/>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      StoreCategory: {
        orderBy: { sortOrder: 'asc' },
        include: { category: true }
      }
    }
  });
  if (!company) return { notFound: true };

  const categories = company.StoreCategory.map((sc) => ({
    id: sc.category.id,
    name: sc.displayName || sc.category.name,
    slug: sc.category.slug,
    imageUrl: sc.category.image || '/placeholder.png',
    icon: sc.icon || sc.category.icon || null,
  }));

  return {
    props: { categories, storeSlug: slug, store:company }
  };
};

export default CategoriesPage;
