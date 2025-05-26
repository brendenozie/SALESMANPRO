"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface RestaurantLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function RestaurantHeaderLayout({ params, children }: RestaurantLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredDishes, setFeaturedDishes] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    setCategories(store.StoreCategory.slice(0, 4));
    setFeaturedDishes(store.products.slice(0, 6));
    setFaqs(store.faqs.slice(0, 3));
    setTestimonials(store.testimonials.slice(0, 3));
  }, [store]);

  const handleReserve = () => {
    router.push(`/${store.slug}/reserve`);
  };

  return (
    <>
      <Header store={store} />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-[60vh]">
        <Image
          src={store.bannerUrl || '/images/restaurant-hero.jpg'}
          alt="Restaurant Hero"
          fill
          className="object-cover opacity-50"
        />
        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name}</h1>
          <p className="text-lg text-center max-w-2xl mb-6">{store.description}</p>
          <button
            onClick={handleReserve}
            className="inline-block bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-full font-semibold transition"
          >
            Reserve a Table
          </button>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Menu Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${store.slug}/menu/${cat.slug}`}>
                <a className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-48"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">{cat.name}</span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Chef's Specials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                onClick={() => router.push(`/${store.slug}/dish/${dish.slug || dish.id}`)}
              >
                <div className="relative h-48">
                  <Image src={dish.imageUrl} alt={dish.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">{dish.name}</h3>
                  <p className="mt-2 text-gray-600">KES {dish.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">What Our Guests Say</h2>
            <div className="space-y-8 max-w-2xl mx-auto">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="italic text-gray-700">“{t.quote}”<br/><span className="font-semibold text-gray-900">— {t.author}</span></blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
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

      {/* Main Content Area */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}