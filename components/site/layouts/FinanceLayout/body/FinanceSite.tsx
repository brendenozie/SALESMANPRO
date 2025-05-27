// components/layouts/FinanceLayout/body/FinancSite.tsx

import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function FinancSite({ children, store, slug }:any) {
  return (
    <>
      
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white h-[60vh]">
        <Image
          src={store.bannerUrl || '/images/finance-hero.jpg'}
          alt="Finance Hero"
          fill
          className="object-cover opacity-30"
          loader={loader}
        />
        <div className="relative z-10 container mx-auto flex flex-col justify-center items-center h-full px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name}</h1>
          <p className="text-xl text-center max-w-2xl mb-6">{store.description}</p>
          <Link href={`/${store.slug}/services`}>
            <a className="inline-block bg-green-500 hover:bg-green-600 text-white py-3 px-8 rounded-full font-semibold transition">
              Explore Services
n        </a>
          </Link>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-800">500+</h3>
            <p className="text-gray-600">Clients Served</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">$10M+</h3>
            <p className="text-gray-600">Assets Managed</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">20+</h3>
            <p className="text-gray-600">Expert Advisors</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">98%</h3>
            <p className="text-gray-600">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* Services Offered */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Financial Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/${store.slug}/service/${svc.slug || svc.id}`)}
              >
                <div className="relative h-40">
                  <Image
                    src={svc.imageUrl}
                    alt={svc.name}
                    fill
                    className="object-cover rounded-t-lg"
                    loader={loader}
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{svc.name}</h3>
                  <p className="mt-2 text-gray-600">Explore Plan</p>
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
      <div className="container mx-auto">{children}</div>
      <footer className="mt-12 text-center">All about services for {slug}</footer>
    </>
  )
}
