"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface ServicesLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function ServicesHeaderLayout({ params, children }: ServicesLayoutProps) {
  const { store } = params;
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCategories(store.StoreCategory.slice(0, 6));
    setFeaturedServices(store.products.slice(0, 6));
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  const handleInquiry = (serviceId: string) => {
    router.push(`/${store.slug}/service/${serviceId}`);
  };

  return (
    <>
      <Header store={store} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-[60vh] flex items-center">
        {store.bannerUrl && (
          <Image src={store.bannerUrl} alt="Services Hero" fill className="object-cover opacity-30" />
        )}
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name}</h1>
          <p className="text-xl max-w-2xl mb-6">{store.description}</p>
          <Link href={`/${store.slug}/contact`}>
            <a className="inline-block bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition">
              Contact Us
            </a>
          </Link>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${store.slug}/service-category/${cat.slug}`}>              
                <a className="group bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-2">
                    <Image src={cat.icon || cat.imageUrl} alt={cat.name} width={64} height={64} className="object-cover rounded-full" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition">{cat.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((svc) => (
              <div key={svc.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="relative h-48">
                  <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{svc.name}</h3>
                  <p className="mt-2 text-gray-600">{svc.subtitle || svc.name}</p>
                  <button
                    onClick={() => handleInquiry(svc.id)}
                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Learn More
                  </button>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8">What Clients Say</h2>
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

      {/* Main Content Area */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}