"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface EventsLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function EventsHeaderLayout({ params, children }: EventsLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Using products as events for demo
    setUpcoming(store.products.slice(0, 6));
    setCategories(store.StoreCategory.slice(0, 4));
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  return (
    <>
      <Header store={store} />

      {/* Hero Section with Slider */}
      <section className="relative h-[60vh] bg-gray-800 text-white">
        <Image
          src={store.bannerUrl || '/images/events-hero.jpg'}
          alt="Events Hero"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto flex flex-col justify-center items-center h-full px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name} Events</h1>
          <p className="text-xl text-center max-w-2xl mb-6">{store.description}</p>
          <Link href={`/${store.slug}/events`}>
            <a className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-full font-semibold transition">
              Explore Events
n          </a>
          </Link>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Event Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${store.slug}/category/${cat.slug}`}>
                <a className="flex flex-col items-center bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
                  {cat.icon && <Image src={cat.icon} alt={cat.name} width={48} height={48} className="mb-2" />}
                  <span className="text-lg font-medium text-gray-700">{cat.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Upcoming Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/${store.slug}/event/${ev.slug || ev.id}`)}
              >
                <div className="relative h-48">
                  <Image
                    src={ev.imageUrl}
                    alt={ev.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">{ev.name}</h3>
                  <p className="mt-1 text-gray-600">Date: {new Date(ev.price).toLocaleDateString()}</p>
                  <p className="mt-2 text-gray-700">{ev.subtitle || ev.name}</p>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Attendee Reviews</h2>
            <div className="space-y-8 max-w-2xl mx-auto">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="italic text-gray-700">“{t.quote}”<br/><span className="font-semibold">— {t.author}</span></blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
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

      {/* Child Content / Event Details */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}
