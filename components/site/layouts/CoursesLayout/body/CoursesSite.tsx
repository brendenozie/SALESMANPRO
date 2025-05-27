// components/layouts/CoursesLayout/body/CoursesSite.tsx

import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function CoursesSite({ children, store, slug }:any) {
  return (
    <>
    
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-[60vh]">
        <Image
          src={store.bannerUrl || "/images/courses-hero.jpg"}
          alt="Courses Banner"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{store.name} Academy</h1>
          <p className="text-xl max-w-2xl text-center">Empower yourself with our expertly curated online courses.</p>
          <Link href={`/${store.slug}/courses`} className="mt-8 inline-block bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition">
              Browse All Courses
          </Link>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${store.slug}/category/${cat.slug}`} className="group block overflow-hidden rounded-lg shadow hover:shadow-lg transition">
                  <div className="relative h-48">
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

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/${store.slug}/course/${course.slug || course.id}`)}
              >
                <div className="relative h-48">
                  <Image
                    src={course.imageUrl}
                    loader={loader}
                    alt={course.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
                  <p className="mt-2 text-gray-600">KES {course.price.toLocaleString()}</p>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Student Success Stories</h2>
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
