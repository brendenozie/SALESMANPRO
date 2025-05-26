"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface MediaLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function MediaHeaderLayout({ params, children }: MediaLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [latestVideos, setLatestVideos] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setFeaturedArticles(store.products.slice(0, 4)); // using products as articles
    setCategories(store.StoreCategory);
    setLatestVideos(store.heroSlides.slice(0, 4));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  return (
    <>
      <Header store={store} />

      {/* Hero Carousel */}
      <section className="relative h-[60vh] bg-black text-white">
        {store.heroSlides.length > 0 && (
          <Image
            src={store.heroSlides[0].imageUrl}
            alt={store.heroSlides[0].headline || store.name}
            fill
            className="object-cover opacity-60"
          />
        )}
        <div className="relative z-10 container mx-auto px-6 py-24">
          <h1 className="text-5xl font-bold drop-shadow-lg">{store.name}</h1>
          <p className="mt-4 text-lg max-w-2xl">{store.description}</p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Explore Categories</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${store.slug}/category/${cat.slug}`}>
                <a className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                  {cat.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                onClick={() => router.push(`/${store.slug}/article/${art.slug || art.id}`)}
              >
                <div className="relative h-64">
                  <Image
                    src={art.imageUrl}
                    alt={art.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900">{art.name}</h3>
                  <p className="mt-2 text-gray-600">{art.subtitle || art.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Videos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Latest Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {latestVideos.map((vid, i) => (
              <div
                key={i}
                className="relative pb-[56.25%] bg-black rounded-lg overflow-hidden cursor-pointer"
                onClick={() => router.push(vid.ctaLink || `/${store.slug}/video/${vid.id}`)}
              >
                <Image
                  src={vid.imageUrl}
                  alt={vid.headline || 'Video'}
                  fill
                  className="object-cover absolute inset-0"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white bg-opacity-75 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Preview */}
      {faqs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">FAQs</h2>
            <div className="space-y-6">
              {faqs.map((q, i) => (
                <details key={i} className="bg-white rounded-lg shadow p-4">
                  <summary className="cursor-pointer font-medium">{q.question}</summary>
                  <p className="mt-2 text-gray-600">{q.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content Area */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}