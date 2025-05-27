// components/layouts/BlogLayout/body/BlogSite.tsx
import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function BlogSite({ children, store, slug }:any) {
  return (
    <>
        {/* Hero Banner */}
        {store.heroSlides?.length > 0 && (
        <section className="relative bg-gray-800 text-white">
          <Image
            src={store.heroSlides[0].imageUrl}
            alt={`${store.heroSlides[0].headline || store.name}`}
            layout="fill"
            objectFit="cover"
            className="opacity-50"
            loader={loader}
          />
          <div className="relative container mx-auto px-6 py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
              {store.heroSlides[0].headline}
            </h1>
            <p className="mt-4 text-lg md:text-2xl">{store.heroSlides[0].subline}</p>
            {store.heroSlides[0].ctaText && (
              <Link href={store.heroSlides[0].ctaLink || "#"}  className="mt-6 inline-block bg-white text-gray-800 py-3 px-6 rounded-full font-semibold hover:bg-gray-200 transition">
                  {store.heroSlides[0].ctaText}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Latest Posts Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(0, 6).map((post :any, idx :any) => (
              <div key={idx} className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                <Image
                  src={post.imageUrl}
                  loader={loader}
                  alt={post.headline}
                  width={600}
                  height={360}
                  className="object-cover w-full h-48"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {post.headline}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{post.subline}</p>
                  <Link href={`/${store.slug}/blog/${post.id}`} className="mt-4 inline-block text-primary font-semibold hover:underline">
                      Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
