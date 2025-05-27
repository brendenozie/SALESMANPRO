// components/layouts/RealEstateLayout/body/RealEstateSite.tsx

import React, { ReactNode, useEffect, useState } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function RealEstateSite({ children, store, slug }:any) {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    setProperties(store.products.slice(0, 6));  // using products as properties
    setCategories(store.StoreCategory.slice(0, 4));
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set("location", searchLocation);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    router.push(`/${store.slug}/properties?${params.toString()}`);
  };
  
  return (
    <>
      

      {/* Hero + Search */}
      <section className="relative bg-gray-800 text-white h-[60vh]">
        {store.bannerUrl && (
          <Image
            src={store.bannerUrl}
            loader={loader}
            alt="Real Estate Hero"
            fill
            className="object-cover opacity-40"
          />
        )}
        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name} Properties</h1>
          <p className="text-lg max-w-2xl mx-auto mb-8">{store.description}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Enter location"
              className="px-4 py-3 rounded-lg w-full sm:w-1/4 focus:outline-none text-gray-800"
            />
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min Price"
              className="px-4 py-3 rounded-lg w-full sm:w-1/6 focus:outline-none text-gray-800"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max Price"
              className="px-4 py-3 rounded-lg w-full sm:w-1/6 focus:outline-none text-gray-800"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Property Types</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${store.slug}/category/${cat.slug}`}>
                <a className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="w-16 h-16 mb-2">
                    <img src={cat.icon || cat.imageUrl} alt={cat.name} className="object-cover w-full h-full rounded-full" />
                  </div>
                  <span className="text-gray-700 font-medium">{cat.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                onClick={() => router.push(`/${store.slug}/property/${prop.slug || prop.id}`)}
              >
                <div className="relative h-48">
                  <Image src={prop.imageUrl} alt={prop.name} fill className="object-cover" loader={loader}/>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">{prop.name}</h3>
                  <p className="mt-1 text-gray-600">KES {prop.price.toLocaleString()}</p>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8">What Our Clients Say</h2>
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
          <div className="container mx-auto px-6 max-w-3xl">
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
