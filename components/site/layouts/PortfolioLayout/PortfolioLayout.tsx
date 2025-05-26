"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface PortfolioLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function PortfolioHeaderLayout({ params, children }: PortfolioLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Use products as projects
    setProjects(store.products.slice(0, 6));
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  return (
    <>
      <Header store={store} />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-[60vh]">
        <Image
          src={store.bannerUrl || '/images/portfolio-hero.jpg'}
          alt="Portfolio Hero"
          fill
          className="object-cover opacity-50"
        />
        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name}</h1>
          <p className="text-xl text-center max-w-2xl mb-6">{store.description}</p>
          {store.heroSlides[0]?.ctaText && (
            <Link href={store.heroSlides[0].ctaLink || '#'}>
              <a className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-full font-semibold transition">
                {store.heroSlides[0].ctaText}
              </a>
            </Link>
          )}
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/${store.slug}/project/${proj.slug || proj.id}`)}
              >
                <div className="relative h-64">
                  <Image
                    src={proj.imageUrl}
                    alt={proj.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{proj.name}</h3>
                  <p className="mt-2 text-gray-600">{proj.subtitle || proj.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Client Testimonials</h2>
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
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">FAQs</h2>
            <div className="space-y-6">
              {faqs.map((q, i) => (
                <details key={i} className="bg-gray-100 rounded-lg shadow p-4">
                  <summary className="cursor-pointer font-medium">{q.question}</summary>
                  <p className="mt-2 text-gray-600">{q.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Get In Touch</h2>
          <p className="text-gray-600 mb-8">Have a project in mind? Let's collaborate.</p>
          <Link href={`mailto:${store.contactEmail}`}>
            <a className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-full font-semibold transition">
              Contact Me
            </a>
          </Link>
        </div>
      </section>

      <Footer store={store} />
    </>
  );
}
