"use client"
import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Header from "./header/Header";
import Footer from "./footer/Footer";

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
  themeSettings: any;
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface BlogLayoutProps {
  params: { store: Store };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const BlogLayout: React.FC<BlogLayoutProps> = (
  {
    params,
    children,
  }: {
    params: { store: Store };
    children: ReactNode;
  }
) => {

  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  const primary = params.store?.themeSettings?.primaryColor || "#f97316";    // fallback: orange
  const secondary = params.store?.themeSettings?.secondaryColor || "#3b82f6"; // fallback: blue

  return (
    <>
      <Header store={params.store} />
         {/* Hero Banner */}
      {params.store.heroSlides?.length > 0 && (
        <section className="relative bg-gray-800 text-white">
          <Image
            src={params.store.heroSlides[0].imageUrl}
            alt={params.store.heroSlides[0].headline || params.store.name}
            layout="fill"
            objectFit="cover"
            className="opacity-50"
          />
          <div className="relative container mx-auto px-6 py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
              {params.store.heroSlides[0].headline}
            </h1>
            <p className="mt-4 text-lg md:text-2xl">{params.store.heroSlides[0].subline}</p>
            {params.store.heroSlides[0].ctaText && (
              <Link href={params.store.heroSlides[0].ctaLink || "#"}>
                <a className="mt-6 inline-block bg-white text-gray-800 py-3 px-6 rounded-full font-semibold hover:bg-gray-200 transition">
                  {params.store.heroSlides[0].ctaText}
                </a>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Latest Posts Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(0, 6).map((post, idx) => (
              <div key={idx} className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                <Image
                  src={post.imageUrl}
                  alt={post.headline}
                  width={600}
                  height={360}
                  className="object-cover w-full h-48"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {post.headline}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{post.subline}</p>
                  <Link href={`/${store.slug}/blog/${post.id}`}>
                    <a className="mt-4 inline-block text-primary font-semibold hover:underline">
                      Read More →
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Child Content (post detail) */}
      <section className="container mx-auto px-6 py-12">
        {children}
      </section>

      <Footer store={params.store} />
    </>
  );
};

export default BlogLayout;
