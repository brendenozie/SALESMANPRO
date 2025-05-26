"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface FitnessLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function FitnessHeaderLayout({ params, children }: FitnessLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Use products for classes, categories for trainers
    setClasses(store.products.slice(0, 6));
    setTrainers(store.StoreCategory.slice(0, 4));
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 4));
  }, [store]);

  return (
    <>
      <Header store={store} />

      {/* Hero Banner */}
      <section className="relative bg-black text-white h-[60vh]">
        <Image
          src={store.bannerUrl || '/images/fitness-hero.jpg'}
          alt="Fitness Hero"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name} Fitness</h1>
          <p className="text-xl text-center max-w-2xl mb-6">{store.description}</p>
          <Link href={`/${store.slug}/classes`}>
            <a className="inline-block bg-green-500 hover:bg-green-600 text-white py-3 px-8 rounded-full font-semibold transition">
              View Classes
n          </a>
          </Link>
        </div>
      </section>

      {/* Popular Classes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Popular Classes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-gray-50 rounded-lg shadow hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/${store.slug}/class/${cls.slug || cls.id}`)}>
                <div className="relative h-48">
                  <Image src={cls.imageUrl} alt={cls.name} fill className="object-cover rounded-t-lg" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{cls.name}</h3>
                  <p className="mt-2 text-gray-600">KES {cls.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Trainers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Meet Our Trainers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {trainers.map((tr) => (
              <div key={tr.id} className="text-center">
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg">
                  <Image src={tr.imageUrl} alt={tr.name} fill className="object-cover" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{tr.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Success Stories</h2>
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

      {/* Child Content */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}