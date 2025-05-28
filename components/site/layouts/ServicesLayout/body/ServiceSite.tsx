// components/layouts/ServicesLayout/body/ServiceSite.tsx

import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function ServiceSite({ children, store,  slug }:any) {
  const { setInquiryServiceId } = useStateContext();
  const router = useRouter();
  const handleInquiry = (serviceId: string) => {
    setInquiryServiceId(serviceId);
    router.push(`/${slug}/contact`);
  };
  if (!store) {
    return null;
  }

  return (
    <>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-[60vh] flex items-center">
        {store.bannerUrl && (
          <Image src={store.bannerUrl} alt="Services Hero" fill className="object-cover opacity-30" loader={loader}/>
        )}
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name}</h1>
          <p className="text-xl max-w-2xl mb-6">{store.description}</p>
          <Link href={`/${store.slug}/contact`}  className="inline-block bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition">
              Contact Us
          </Link>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {store.categories && store.categories.map((cat:any) => (
              <Link key={cat.id} href={`/${store.slug}/service-category/${cat.slug}`}  className="group bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-2">
                    <Image src={cat.icon || cat.imageUrl} alt={cat.name} width={64} height={64} className="object-cover rounded-full" loader={loader}/>
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition">{cat.name}</span>
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
            {store.featuredServices && store.featuredServices.map((svc:any) => (
              <div key={svc.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="relative h-48">
                  <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" loader={loader}/>
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
      {store.testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">What Clients Say</h2>
            <div className="space-y-8 max-w-2xl mx-auto">
              {store.testimonials.map((t:any, i:any) => (
                <blockquote key={i} className="italic text-gray-700">“{t.quote}”<br/><span className="font-semibold text-gray-900">— {t.author}</span></blockquote>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <div className="container mx-auto">{children}</div>

      {/* FAQs */}
      {store.faqs && store.faqs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">FAQs</h2>
            <div className="space-y-6">
              {store.faqs.map((q:any, i:any) => (
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
