// components/layouts/DirectoryLayout/body/DirectorySite.tsx

import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function DirectorySite({ children, store, slug }:any) {
  return (
    <>
      
      {/* Hero + Search */}
      <section className="relative bg-green-600 text-white h-[50vh]">
        <Image
          src={store.bannerUrl || "/images/directory-hero.jpg"}
          loader={loader}
          alt="Directory Hero"
          fill
          className="object-cover opacity-30"
        />
        <div className="relative z-10 container mx-auto py-20 text-center px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg">Discover {store.name}</h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto">{store.description}</p>
          <div className="mt-8 flex justify-center">
            <input
              type="text"
              placeholder="Search listings or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-xl px-4 py-3 rounded-l-lg focus:outline-none text-gray-800"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-r-lg font-semibold"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Top Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${store.slug}/category/${cat.slug}`}>
                <a className="group block text-center">
                  <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                    <Image
                      src={cat.imageUrl}
                      loader={loader}
                      alt={cat.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <span className="mt-2 block text-lg font-medium text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/${store.slug}/listing/${item.slug || item.id}`)}
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
                  <p className="mt-2 text-gray-600">{item.subtitle || item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {store.testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">What People Are Saying</h2>
            <div className="space-y-6 max-w-2xl mx-auto">
              {store.testimonials.slice(0, 3).map((t :any, i :any) => (
                <blockquote key={i} className="italic text-gray-700">“{t.quote}” — <span className="font-semibold">{t.author}</span></blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {store.faqs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Help & FAQs</h2>
            <div className="space-y-6">
              {store.faqs.slice(0, 3).map((q :any, i :any) => (
                <details key={i} className="bg-white rounded-lg shadow p-4">
                  <summary className="cursor-pointer font-medium">{q.question}</summary>
                  <p className="mt-2 text-gray-600">{q.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

    </>
  )
}
