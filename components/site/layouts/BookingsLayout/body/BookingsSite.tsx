// app/site/layouts/BookingsLayout/body/BookingsSite.tsx

import React, { ReactNode, useState, useEffect } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DatePicker from "react-datepicker";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function BookingsSite({ store }:any) {

  const router = useRouter();

  const [featured, setFeatured] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState<Date | null>(new Date());

  useEffect(() => {
    setFeatured(store.products.slice(0, 4));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  const handleSearch = () => {
    const query = new URLSearchParams();
    if (searchTerm) query.set("q", searchTerm);
    if (date) query.set("date", date.toISOString());
    if (time) query.set("time", time.toISOString());
    router.push(`/${store.slug}/search?${query.toString()}`);
  };

  return (
    <>
      
      {/* Hero + Booking Search */}
      <section className="relative bg-blue-600 text-white">
        <Image
          src={store.bannerUrl || "/images/booking-hero.jpg"}
          alt="Booking Hero"
          fill
          className="object-cover opacity-25"
          loader={loader}
        />
        <div className="relative z-10 container mx-auto py-24 text-center">
          <h1 className="text-5xl font-extrabold drop-shadow-lg">{store.name}</h1>
          <p className="mt-4 text-xl max-w-2xl mx-auto">{store.description}</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <input
              type="text"
              placeholder="Search services or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/3 px-4 py-3 rounded-lg focus:outline-none"
            />
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              className="w-full sm:w-1/4 px-4 py-3 rounded-lg"
              dateFormat="MMMM d, yyyy"
              placeholderText="Select Date"
            />
            <DatePicker
              selected={time}
              onChange={(t) => setTime(t)}
              className="w-full sm:w-1/6 px-4 py-3 rounded-lg"
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="h:mm aa"
              placeholderText="Select Time"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold"
            >
              Find Slots
            </button>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {store.StoreCategory.map((cat:any) => (
              <Link key={cat.id} href={`/${store.slug}/category/${cat.slug}`} className="group block rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                  <div className="relative h-32">
                    <Image
                      src={cat.imageUrl}
                      loader={loader}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <span className="text-lg font-medium text-gray-900">{cat.name}</span>
                  </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Top-Rated Providers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/${store.slug}/service/${svc.slug || svc.id}`)}
              >
                <div className="relative h-48">
                  <Image
                    src={svc.imageUrl}
                    loader={loader}
                    alt={svc.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{svc.name}</h3>
                  <p className="mt-2 text-gray-600">KES {svc.price.toLocaleString()}</p>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Happy Clients</h2>
            <div className="space-y-8">
              {store.testimonials.slice(0, 3).map((t:any, i:any) => (
                <div key={i} className="max-w-xl mx-auto">
                  <p className="italic text-gray-700">“{t.quote}”</p>
                  <p className="mt-4 font-semibold text-gray-900">— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs Preview */}
      {faqs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6 max-w-3xl mx-auto">
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
    </>
  )
}
