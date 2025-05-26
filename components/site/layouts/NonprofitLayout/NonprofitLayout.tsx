"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface NonProfitLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function NonProfitHeaderLayout({ params, children }: NonProfitLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setPrograms(store.products.slice(0, 4)); // use products for programs
    setStats([
      { label: "Projects Completed", value: 120 },
      { label: "Volunteers", value: 350 },
      { label: "Communities Helped", value: 45 },
    ]);
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  return (
    <>
      <Header store={store} />

      {/* Hero Section */}
      <section className="relative bg-green-700 text-white h-[60vh]">
        <Image
          src={store.bannerUrl || '/images/nonprofit-hero.jpg'}
          alt="Nonprofit Hero"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name}</h1>
          <p className="text-xl text-center max-w-2xl mb-6">{store.description}</p>
          <Link href={`/${store.slug}/donate`}>
            <a className="inline-block bg-white text-green-700 py-3 px-8 rounded-full font-semibold hover:bg-gray-100 transition">
              Donate Now
n          </a>
          </Link>
        </div>
      </section>

      {/* Our Programs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Programs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="bg-gray-50 rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                onClick={() => router.push(`/${store.slug}/program/${prog.slug || prog.id}`)}
              >
                <div className="relative h-40">
                  <Image
                    src={prog.imageUrl}
                    alt={prog.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{prog.name}</h3>
                  <p className="mt-2 text-gray-600">{prog.subtitle || prog.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-green-100">
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <h3 className="text-4xl font-bold text-green-700">{stat.value}</h3>
              <p className="mt-2 text-gray-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Stories of Change</h2>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Help & FAQs</h2>
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

      {/* Child Content */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}