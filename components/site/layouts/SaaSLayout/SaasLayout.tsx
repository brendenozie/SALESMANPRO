"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface SaaSLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function SaaSHeaderLayout({ params, children }: SaaSLayoutProps) {
  const { store } = params;
  const router = useRouter();

  const [features, setFeatures] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // simulate features and plans using StoreCategory and products
    setFeatures(
      store.StoreCategory.map((c: any) => ({ title: c.name, description: c.displayName || c.name }))
    );
    setPlans([
      { name: "Basic", price: "\$19/mo", features: features.slice(0, 3) },
      { name: "Pro", price: "\$49/mo", features: features.slice(0, 5) },
      { name: "Enterprise", price: "Contact Us", features: features }
    ]);
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 4));
  }, [store, features]);

  const handleSignup = () => {
    router.push(`/${store.slug}/signup`);
  };

  return (
    <>
      <Header store={store} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white h-[60vh] flex items-center">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{store.name}</h1>
          <p className="text-xl mb-6 max-w-2xl">{store.description}</p>
          <button
            onClick={handleSignup}
            className="bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Pricing Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div key={i} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex flex-col">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <p className="text-3xl font-semibold mb-6">{plan.price}</p>
                <ul className="mb-6 space-y-2 flex-1">
                  {plan.features.map((f: any, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <span className="mr-2 text-green-500">✔️</span> {f.title}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleSignup}
                  className="mt-auto bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">What Our Users Say</h2>
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

      {/* Main Content Area */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}