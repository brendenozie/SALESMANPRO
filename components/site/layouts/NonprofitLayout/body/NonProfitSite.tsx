"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";

//----------------------------------------------
// Image loader (same as in Header/Footer/CoursesSite)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;


//----------------------------------------------
// NonProfitSite component (driven from StoreContext)
//----------------------------------------------
export default function NonProfitSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    bannerUrl,
    logoUrl,
    description,
    marketplaceListings,
    stats,
    testimonials,
    faqs,
  } = storeFormData;

  return (
    <div className="font-sans text-gray-800">    
      <main>
        {/* Hero Section */}
        <section id="home" className="relative">
          <div className="absolute inset-0">
            <Image
              src="/hero-photo.jpg"
              alt="Smiling children"
              layout="fill"
              objectFit="cover"
              loader={loader}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
          <div className="relative max-w-4xl mx-auto py-32 px-6 text-white">
            <h1 className="text-4xl md:text-6xl font-bold">
              Lend Your Heart To{' '}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >Change A Child's Story</motion.span>
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl">
              Join us in providing hope and support to children in need around the world.
            </p>
            <div className="mt-8 flex space-x-4">
              <Link href="#causes" className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-md font-semibold transition">
                  Learn More
              </Link>
              <a
                onClick={() => router.push('/donate')}
                className="border border-white hover:bg-white hover:text-black px-6 py-3 rounded-md font-semibold transition cursor-pointer"
              >
                Make a Donation
              </a>
            </div>
          </div>
        </section>

        {/* Core Highlights */}
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '/icons/medical.svg', label: 'Medical Aid' },
              { icon: '/icons/trust.svg', label: 'Trust Funds' },
              { icon: '/icons/funds.svg', label: 'Funds Raised' }
            ].map((item) => (
              <motion.div key={item.label} whileHover={{ y: -5 }} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="w-12 h-12 mb-4">
                  <Image src={item.icon} alt={item.label} width={48} height={48} loader={loader}/>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
                <p className="text-gray-600">Learn about how we support this cause.</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Causes Teaser */}
        <section id="featured-causes" className="py-20 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Featured Causes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Two causes */}
            {['Treatment Support', 'Food Support'].map((title, idx) => (
              <motion.div key={title} whileHover={{ scale: 1.02 }} className="relative bg-white rounded-lg overflow-hidden shadow-lg">
                <Image src={`/causes/cause${idx + 1}.jpg`} alt={title} width={400} height={300} loader={loader} className="object-cover w-full h-48" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600">Short impact summary for {title.toLowerCase()}.</p>
                </div>
              </motion.div>
            ))}
            {/* CTA Panel */}
            <motion.div whileHover={{ y: -5 }} className="bg-orange-500 text-white p-8 rounded-lg flex flex-col justify-center items-start">
              <h3 className="text-2xl font-bold mb-4">Contribute Today To Make A Difference</h3>
              <Link href="/donate"  className="inline-flex items-center font-semibold hover:underline">
                  Donate Now <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* About Us Spotlight */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
            <motion.div initial={{ x: -100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
              <Image src="/about-child.jpg" alt="Child giving thumbs up" width={500} height={400} loader={loader} className="rounded-lg object-cover" />
            </motion.div>
            <motion.div initial={{ x: 100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-bold mb-4">A Trusted Non-Profit Charity Organization</h2>
              <p className="text-gray-700 mb-6">
                We’ve been dedicated to improving lives through targeted support and compassionate care. Join us in our mission to uplift communities.
              </p>
              <div className="space-y-4 mb-6">
                <button className="inline-flex items-center bg-orange-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition">
                  Be a Hero
                </button>
                <button className="inline-flex items-center border border-orange-500 text-orange-500 px-6 py-2 rounded-md font-semibold hover:bg-orange-50 transition">
                  Help Children with Donations
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Children Fed', value: 1200 },
                  { label: 'Lives Touched', value: 850 },
                  { label: 'Volunteers', value: 300 }
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center space-x-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(stat.value / 1200) * 100}%` }} />
                    </div>
                    <span className="text-gray-800 font-medium">{stat.value}+ {stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Impact Areas */}
        <section id="impact" className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { icon: '/icons/funding.svg', label: 'Funding' },
              { icon: '/icons/medical2.svg', label: 'Medical' },
              { icon: '/icons/education.svg', label: 'Education' },
              { icon: '/icons/support.svg', label: 'Support' }
            ].map((item) => (
              <motion.div whileHover={{ scale: 1.05 }} key={item.label} className="bg-white p-6 rounded-lg shadow-md transition">
                <div className="w-10 h-10 mb-4">
                  <Image src={item.icon} alt={item.label} width={40} height={40} loader={loader}/>
                </div>
                <h4 className="font-semibold mb-2">{item.label}</h4>
                <p className="text-gray-600 text-sm">Detailed overview of our {item.label.toLowerCase()} efforts.</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Popular Causes Gallery */}
        <section id="causes" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">Find Popular Causes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <Image src={`/causes/popular${i}.jpg`} alt="Popular Cause" width={400} height={300} className="object-cover w-full h-48" loader={loader}/>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Cause Title #{i}</h3>
                    <p className="text-gray-600 text-sm mb-4">Brief description of this cause impact.</p>
                    <Link href="/cause"  className="inline-flex items-center text-orange-500 font-semibold hover:underline">
                        View Cause <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition">
                Load More Causes
              </button>
            </div>
          </div>
        </section>

        {/* Events & Latest Updates */}
        <section id="events" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Join Our Latest Upcoming Events</h2>
              {[
                { date: 'May 30, 2025', title: 'Community Clean-Up Day' },
                { date: 'June 15, 2025', title: 'Hope Gala Fundraiser Event' }
              ].map((evt) => (
                <motion.div key={evt.title} whileHover={{ scale: 1.02 }} className="flex items-start mb-6 bg-white rounded-lg shadow p-4">
                  <div className="flex-shrink-0 bg-orange-500 text-white p-3 rounded-lg mr-4">
                    <div className="text-sm font-bold">{evt.date.split(' ')[0]}</div>
                    <div className="text-xs">{evt.date.split(' ')[1]}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{evt.title}</h3>
                    <p className="text-gray-600 text-sm">Join us for a day of community service and fun.</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Donation CTA */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-lg shadow p-6 flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4">Your Donation Is A Gift To Them</h3>
              <p className="text-gray-600 mb-6">Donate what you can offer and bring hope to children today.</p>
              <Link href="/donate"  className="inline-flex items-center bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition">
                  Donate Now <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Core Highlights */}
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '/icons/medical.svg', label: 'Medical Aid' },
              { icon: '/icons/trust.svg', label: 'Trust Funds' },
              { icon: '/icons/funds.svg', label: 'Funds Raised' }
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="w-12 h-12 mb-4">
                  <Image src={item.icon} alt={item.label} width={48} height={48} loader={loader}/>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
                <p className="text-gray-600">Learn about how we support this cause.</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bold CTA */}
        <section className="py-16 bg-orange-500">
          <div className="max-w-4xl mx-auto text-center text-white px-6">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              Help Us Build A Future Filled With Hope And Opportunities
            </motion.h2>
            <Link href="/join" className="inline-flex items-center bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                Join Us Today <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>

         {/* Testimonials & News */}
         <section id="testimonials" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">Voices Sharing Our Mission Success</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {[
                { name: 'Alex Johnson', text: 'This organization really changed the lives of my community.', avatar: '/testimonials/1.jpg' },
                { name: 'Emily Carter', text: 'Their support has been invaluable to families in need.', avatar: '/testimonials/2.jpg' }
              ].map((test, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.3 }} className="bg-gray-50 p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4 space-x-4">
                    <Image src={test.avatar} alt={test.name} width={50} height={50} className="rounded-full"  loader={loader}/>
                    <h4 className="font-semibold">{test.name}</h4>
                  </div>
                  <p className="italic text-gray-700">“{test.text}”</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      
      </main>









































      {/* ── Hero ── */}
      <section className="relative h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <Image
            src={bannerUrl}
            alt="Hero"
            fill
            className="object-cover brightness-75"
            loader={loader}
            priority
          />
        </div>
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center px-6 max-w-2xl space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            {name}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-white/90">{description}</p>
          )}
          <button
            onClick={() => router.push(`/${slug}/donate`)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-xl rounded-full px-8 py-3 text-lg font-semibold transition-colors flex items-center justify-center"
          >
            Donate Now <ArrowRightIcon className="ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* ── Programs (mapped from marketplaceListings) ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Our Programs
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {marketplaceListings.map((listing, i) => {
              // Use listing.title as program name, listing.description as subtitle
              const progName = listing.product?.name ?? listing.title;
              const progSubtitle = listing.description ?? "";
              // For image, take first URL or fallback placeholder
              const imageUrl = listing.images?.[0] ?? "/images/placeholder-program.jpg";
              // Use listing.id as slug (or, if you have a slug field, swap in)
              const progSlug = listing.id;

              return (
                <motion.div
                  key={listing.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer flex flex-col"
                  onClick={() => router.push(`/${slug}/program/${progSlug}`)}
                >
                  <div className="relative h-48">
                    <Image
                      src={imageUrl}
                      alt={progName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loader={loader}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {progName}
                      </h3>
                      <p className="text-gray-600">{progSubtitle}</p>
                    </div>
                    <Link
                      href={`/${slug}/program/${progSlug}`}
                      className="mt-4 inline-flex items-center text-green-600 hover:underline font-medium"
                    >
                      Learn More <ArrowRightIcon className="ml-1 w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-green-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-around items-center space-y-8 sm:space-y-0">
          {stats && stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * i }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-green-700">
                {stat.value}
              </h3>
              <p className="mt-2 text-lg text-gray-700">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stories of Change ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12"
          >
            Stories of Change
          </motion.h2>

          <div className="space-y-12">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 * i }}
                className="relative bg-green-50 p-8 rounded-2xl shadow-lg italic"
              >
                <svg
                  className="absolute top-4 left-4 w-8 h-8 text-green-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.17 6A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2h-4V6H7.17zM3 6a4.017 4.017 0 014.83-4A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2H3V6z" />
                </svg>
                <p className="text-lg text-gray-800">“{t.quote}”</p>
                <footer className="mt-4 text-right font-semibold text-gray-900">
                  {t.author}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Help & FAQs
          </motion.h2>

          <div className="space-y-4">
            {faqs.map((q, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * i }}
                className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg"
              >
                <summary className="font-medium cursor-pointer flex justify-between items-center">
                  {q.question}
                  <span className="ml-2 text-green-600 transform group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-gray-700">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
