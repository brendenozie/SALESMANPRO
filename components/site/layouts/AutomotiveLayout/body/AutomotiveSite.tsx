// components/layouts/AutomotiveLayout/bodyAutomotiveSite.tsx
"use client"

import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AutomotiveSite({ children, store, slug }:any) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-black text-white">
        <Image
          src={store.bannerUrl || "/images/auto-banner.jpg"}
          loader={loader}
          alt="Automotive Banner"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 opacity-60"
        />
        <div className="relative z-10 px-6 py-20 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">{store.name}</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200">{store.description}</p>
        </div>
      </section>

      {/* Promotions */}
      {store.promotions?.length > 0 && (
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Current Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {store.promotions.map((promo:any) => (
                <div key={promo.title} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <Image src={promo.bannerUrl || '/images/offer.jpg'} alt={promo.title} width={500} height={280} className="rounded" loader={loader}/>
                  <h3 className="mt-4 text-lg font-bold">{promo.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{promo.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Featured Vehicles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {store.products?.slice(0, 6).map((product:any) => (
              <Link href={`/${store.slug}/product/${product.slug || product.id}`} key={product.id}>
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-all">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    loader={loader}
                    width={500}
                    height={320}
                    className="object-cover w-full h-56"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">KES {product.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {store.testimonials?.length > 0 && (
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">What Our Customers Say</h2>
            <div className="space-y-6">
              {store.testimonials.slice(0, 3).map((t:any, idx:any) => (
                <div key={idx} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
                  <p className="italic text-gray-700 dark:text-gray-300">"{t.quote}"</p>
                  <div className="mt-4 flex items-center justify-center space-x-4">
                    {t.avatarUrl && <Image src={t.avatarUrl} alt={t.author} width={40} height={40} className="rounded-full" loader={loader}/>}
                    <span className="font-medium text-gray-900 dark:text-white">{t.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
