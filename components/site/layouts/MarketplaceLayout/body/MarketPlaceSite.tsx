// components/layouts/MarketplaceLayout/body/MarketplaceSite.tsx

import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MarketplaceSite({ children,store, slug }:any) {
  return (
    <>
      

      {/* Hero Slider */}
      <section className="relative h-[60vh] overflow-hidden">
        {store.heroSlides?.length ? (
          <div className="absolute inset-0">
            <Image
              src={store.heroSlides[0].imageUrl}
              alt={store.heroSlides[0].headline || store.name}
              fill
              className="object-cover opacity-60"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">{store.name}</h1>
          <p className="mt-4 text-xl text-white max-w-3xl mx-auto">{store.description}</p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${store.slug}/category/${cat.slug}`}>
                <a className="group relative block overflow-hidden rounded-lg shadow hover:shadow-lg transition">
                  <Image
                    src={cat.imageUrl}
                    loader={loader}
                    alt={cat.name}
                    width={200}
                    height={200}
                    className="object-cover w-full h-32 group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white py-1 px-3 rounded">{cat.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {featured.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/${store.slug}/product/${item.slug || item.id}`)}
              >
                <div className="relative h-48">
                  <Image
                    src={item.imageUrl}
                    loader={loader}
                    alt={item.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="mt-2 text-gray-600">KES {item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      {promotions.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Special Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotions.map((promo) => (
                <div key={promo.code || promo.title} className="relative overflow-hidden rounded-lg">
                  <Image
                    src={promo.bannerUrl || '/images/promo.jpg'}
                    loader={loader}
                    alt={promo.title}
                    width={400}
                    height={200}
                    className="object-cover w-full h-48"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-4">
                    <h3 className="text-xl font-bold">{promo.title}</h3>
                    <p className="mt-2">{promo.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">What Customers Say</h2>
            <div className="space-y-8 max-w-2xl mx-auto">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="italic text-gray-700">“{t.quote}”<br/><span className="font-semibold text-gray-900">— {t.author}</span></blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {store.faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {store.faqs.slice(0, 5).map((q, i) => (
                <details key={i} className="bg-gray-50 rounded-lg shadow p-4">
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
