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
    <div className="font-sans text-gray-800 text-gray-800 antialiased">    
      <main>
        {/* Hero Section */}
        <section id="home" className="relative h-screen flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0">
            <Image
                src={bannerUrl || "/hero-photo.jpg"} // Use dynamic banner or fallback
                alt="Children smiling and playing"
                fill
                className="object-cover brightness-[0.6]" // Slightly dim image for text readability
                loader={loader}
                priority
              />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
          <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 max-w-4xl mx-auto py-20 px-6 mt-20" 
                  >
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
          </motion.div>
        </section>

        {/* Core Highlights */}
        {/* ── Core Highlights / Impact Areas (Unified) ── */}
              <section id="services" className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                    Our Core Mission
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { icon: "/icons/medical.svg", label: "Medical Aid", description: "Providing essential healthcare and medical support to vulnerable children." },
                      { icon: "/icons/education.svg", label: "Education Support", description: "Ensuring access to quality education and learning resources for a brighter future." },
                      { icon: "/icons/funds.svg", label: "Community Development", description: "Investing in sustainable community projects that uplift families and children." },
                      { icon: "/icons/support.svg", label: "Emergency Relief", description: "Delivering urgent aid and support in times of crisis and natural disasters." }
                    ].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center flex flex-col items-center"
                      >
                        <div className="w-16 h-16 mb-6">
                          <Image src={item.icon} alt={item.label} width={64} height={64} loader={loader} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {item.label}
                        </h3>
                        <p className="text-gray-600 text-base">
                          {item.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── About Us Spotlight ── */}
                    <section id="about" className="py-20 bg-white">
                      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
                        <motion.div
                          initial={{ x: -100, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                          <Image
                            src="/about-child.jpg"
                            alt="Child giving thumbs up"
                            width={600}
                            height={450}
                            loader={loader}
                            className="rounded-xl shadow-xl object-cover w-full h-auto"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ x: 100, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                            A Trusted Non-Profit Charity Organization
                          </h2>
                          <p className="text-gray-700 mb-8 leading-relaxed">
                            We’ve been dedicated to improving lives through targeted support and
                            compassionate care. Our mission is to empower communities and
                            provide a brighter future for those most in need. Join us in our
                            endeavor to uplift lives and create lasting change.
                          </p>
                          <div className="flex flex-wrap gap-4 mb-8">
                            <button className="inline-flex items-center bg-orange-500 text-white px-7 py-3 rounded-full font-semibold hover:bg-orange-600 transition duration-300 shadow-md">
                              Be a Hero
                            </button>
                            <button
                              onClick={() => router.push(`/${slug}/donate`)}
                              className="inline-flex items-center border border-orange-500 text-orange-600 px-7 py-3 rounded-full font-semibold hover:bg-orange-50 transition duration-300 shadow-md"
                            >
                              Help Children with Donations
                            </button>
                          </div>
                          <div className="space-y-5">
                            {stats &&
                              stats.map((stat, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      whileInView={{ width: `${stat.value / 1500 * 100}%` }} // Adjusted max value for visual
                                      viewport={{ once: true, amount: 0.8 }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                      className="bg-orange-500 h-3 rounded-full"
                                    />
                                  </div>
                                  <span className="text-gray-800 font-medium text-lg min-w-[120px]">
                                    {stat.value}+ {stat.label}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </motion.div>
                      </div>
                    </section>

                     {/* ── Our Programs / Featured Causes (Unified & Dynamic) ── */}
                          <section id="causes" className="py-20 bg-gray-50">
                            <div className="max-w-7xl mx-auto px-6">
                              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                                Explore Our Impact Programs
                              </h2>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {marketplaceListings.length > 0 ? (
                                  marketplaceListings.map((listing, i) => {
                                    const progName = listing.product?.name ?? listing.title;
                                    const progSubtitle = listing.description ?? "";
                                    const imageUrl = listing.images?.[0] ?? `/images/placeholder-program.jpg`; // Fallback placeholder
                                    const progSlug = listing.id;
                    
                                    return (
                                      <motion.div
                                        key={listing.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.6, delay: i * 0.15 }}
                                        className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 cursor-pointer flex flex-col"
                                        onClick={() => router.push(`/${slug}/program/${progSlug}`)}
                                      >
                                        <div className="relative h-56">
                                          <Image
                                            src={imageUrl}
                                            alt={progName}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            loader={loader}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                          <div>
                                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                              {progName}
                                            </h3>
                                            <p className="text-gray-700 text-base leading-relaxed">
                                              {progSubtitle.substring(0, 100)}...
                                            </p>
                                          </div>
                                          <Link
                                            href={`/${slug}/program/${progSlug}`}
                                            className="mt-5 inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                          >
                                            Learn More <ArrowRightIcon className="ml-2 w-5 h-5" />
                                          </Link>
                                        </div>
                                      </motion.div>
                                    );
                                  })
                                ) : (
                                  // Fallback for when marketplaceListings is empty
                                  <>
                                    {['Treatment Support', 'Food Support', 'Education Access'].map((title, idx) => (
                                      <motion.div
                                        key={title}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.6, delay: idx * 0.15 }}
                                        className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300"
                                      >
                                        <Image src={`/causes/cause${idx + 1}.jpg`} alt={title} width={400} height={300} loader={loader} className="object-cover w-full h-56" />
                                        <div className="p-6">
                                          <h3 className="text-2xl font-semibold mb-3 text-gray-900">{title}</h3>
                                          <p className="text-gray-700">Short impact summary for {title.toLowerCase()}.</p>
                                          <Link
                                            href="/cause-detail" // Placeholder link
                                            className="mt-5 inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                          >
                                            View Cause <ArrowRightIcon className="w-5 h-5 ml-2" />
                                          </Link>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </>
                                )}
                              </div>
                              <div className="text-center mt-12">
                                <Link
                                  href={`/${slug}/programs`}
                                  className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition duration-300 shadow-lg transform hover:scale-105"
                                >
                                  View All Causes
                                </Link>
                              </div>
                            </div>
                          </section>

           {/* ── Impact Stats ── */}
              <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="max-w-6xl mx-auto px-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                    Our Impact in Numbers
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats && stats.length > 0 ? (
                      stats.map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ delay: 0.2 * i, duration: 0.6 }}
                          className="text-center bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center"
                        >
                          <h3 className="text-5xl md:text-6xl font-extrabold text-orange-600 animate-pulse">
                            {stat.value}
                          </h3>
                          <p className="mt-3 text-lg text-gray-700 font-semibold">
                            {stat.label}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      // Fallback stats if `stats` from context is empty
                      [
                        { value: "1,200+", label: "Children Fed" },
                        { value: "850+", label: "Lives Touched" },
                        { value: "300+", label: "Volunteers" },
                        { value: "500K+", label: "Funds Raised" },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ delay: 0.2 * i, duration: 0.6 }}
                          className="text-center bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center"
                        >
                          <h3 className="text-5xl md:text-6xl font-extrabold text-orange-600 animate-pulse">
                            {stat.value}
                          </h3>
                          <p className="mt-3 text-lg text-gray-700 font-semibold">
                            {stat.label}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </section>

               {/* ── Testimonials & News ── */}
                    <section id="testimonials" className="py-20 bg-white">
                      <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                          Voices Sharing Our Mission Success
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                          {testimonials && testimonials.length > 0 ? (
                            testimonials.map((test, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.4 }}
                                transition={{ delay: idx * 0.2, duration: 0.7, ease: "easeOut" }}
                                className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg border border-orange-100 relative group"
                              >
                                <svg
                                  className="absolute top-6 left-6 w-10 h-10 text-orange-200 opacity-75 group-hover:opacity-100 transition-opacity"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M7.17 6A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2h-4V6H7.17zM3 6a4.017 4.017 0 014.83-4A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2H3V6z" />
                                </svg>
                                <p className="italic text-gray-800 text-lg leading-relaxed mb-6 pl-12">
                                  “{test.quote}”
                                </p>
                                <div className="flex items-center space-x-4">
                                  <Image
                                    src={test.avatar || "/images/placeholder-avatar.jpg"}
                                    alt={test.author}
                                    width={60}
                                    height={60}
                                    className="rounded-full border-2 border-orange-300 shadow-md"
                                    loader={loader}
                                  />
                                  <h4 className="font-bold text-gray-900 text-xl">
                                    {test.author}
                                  </h4>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            // Fallback testimonials if `testimonials` from context is empty
                            [
                              { name: 'Alex Johnson', text: 'This organization truly changed the lives of many in my community. Their dedication is inspiring!', avatar: '/testimonials/1.jpg' },
                              { name: 'Emily Carter', text: 'The support provided by this non-profit has been invaluable to countless families in desperate need. Highly recommended.', avatar: '/testimonials/2.jpg' }
                            ].map((test, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.4 }}
                                transition={{ delay: idx * 0.2, duration: 0.7, ease: "easeOut" }}
                                className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg border border-orange-100 relative group"
                              >
                                <svg
                                  className="absolute top-6 left-6 w-10 h-10 text-orange-200 opacity-75 group-hover:opacity-100 transition-opacity"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M7.17 6A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2h-4V6H7.17zM3 6a4.017 4.017 0 014.83-4A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2H3V6z" />
                                </svg>
                                <p className="italic text-gray-800 text-lg leading-relaxed mb-6 pl-12">
                                  “{test.text}”
                                </p>
                                <div className="flex items-center space-x-4">
                                  <Image
                                    src={test.avatar}
                                    alt={test.name}
                                    width={60}
                                    height={60}
                                    className="rounded-full border-2 border-orange-300 shadow-md"
                                    loader={loader}
                                  />
                                  <h4 className="font-bold text-gray-900 text-xl">
                                    {test.name}
                                  </h4>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
              
                        {/* Donation CTA - Integrated into Testimonials Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ delay: 0.4, duration: 0.7 }}
                          className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-10 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between mt-16 text-center md:text-left"
                        >
                          <h3 className="text-3xl font-bold mb-6 md:mb-0 max-w-2xl leading-tight">
                            Your Donation Is A Gift To Them. Donate Today!
                          </h3>
                          <Link
                            href={`/${slug}/donate`}
                            className="inline-flex items-center bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-300 shadow-lg transform hover:scale-105"
                          >
                            Donate Now <ArrowRightIcon className="w-5 h-5 ml-2" />
                          </Link>
                        </motion.div>
                      </div>
                    </section>

                          {/* ── Events & Latest Updates ── */}
                          <section id="events" className="py-20 bg-gray-50">
                            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                              {/* Upcoming Events */}
                              <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                                  Join Our Latest Upcoming Events
                                </h2>
                                {[
                                  { date: 'May 30, 2025', title: 'Community Clean-Up Day', description: 'Join us for a day of community service, fostering cleanliness and civic responsibility in our neighborhoods.' },
                                  { date: 'June 15, 2025', title: 'Hope Gala Fundraiser Event', description: 'An elegant evening dedicated to raising crucial funds for children\'s education and welfare programs.' },
                                  { date: 'July 05, 2025', title: 'Children\'s Art Workshop', description: 'A creative session designed to encourage self-expression and artistic talent among young children.' }
                                ].map((evt, idx) => (
                                  <motion.div
                                    key={evt.title}
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ delay: idx * 0.15, duration: 0.6 }}
                                    className="flex items-start mb-6 bg-white rounded-xl shadow-md hover:shadow-lg p-6 transition-shadow duration-300"
                                  >
                                    <div className="flex-shrink-0 bg-orange-500 text-white p-4 rounded-lg mr-5 text-center font-bold">
                                      <div className="text-lg">{evt.date.split(' ')[0]}</div>
                                      <div className="text-xl">{evt.date.split(' ')[1].replace(',', '')}</div>
                                      <div className="text-sm">{evt.date.split(' ')[2]}</div>
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-xl mb-2 text-gray-900">
                                        {evt.title}
                                      </h3>
                                      <p className="text-gray-700 text-base leading-relaxed">
                                        {evt.description}
                                      </p>
                                      <Link
                                        href="/event-detail" // Placeholder link
                                        className="mt-3 inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                      >
                                        Read More <ArrowRightIcon className="w-4 h-4 ml-2" />
                                      </Link>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                              {/* Latest News & Blog */}
                              <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                                  Latest News & Stories
                                </h2>
                                {[
                                  { title: 'New Education Program Launched', excerpt: 'Our latest initiative aims to provide digital literacy to underserved rural communities.', image: '/news/news1.jpg' },
                                  { title: 'Success Story: How Maria Got Her Smile Back', excerpt: 'A heartwarming tale of how our medical aid program helped a young girl overcome her illness.', image: '/news/news2.jpg' },
                                  { title: 'Volunteers Spotlight: Meet Our Heroes', excerpt: 'We shine a light on the incredible individuals dedicating their time and effort to our cause.', image: '/news/news3.jpg' }
                                ].map((newsItem, idx) => (
                                  <motion.div
                                    key={newsItem.title}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ delay: idx * 0.15, duration: 0.6 }}
                                    className="flex items-center mb-6 bg-white rounded-xl shadow-md hover:shadow-lg p-5 transition-shadow duration-300"
                                  >
                                    <div className="flex-shrink-0 w-28 h-28 mr-5 rounded-lg overflow-hidden">
                                      <Image src={newsItem.image} alt={newsItem.title} width={112} height={112} loader={loader} className="object-cover w-full h-full" />
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-xl mb-1 text-gray-900">
                                        {newsItem.title}
                                      </h3>
                                      <p className="text-gray-700 text-base leading-relaxed mb-2">
                                        {newsItem.excerpt}
                                      </p>
                                      <Link
                                        href="/news-detail" // Placeholder link
                                        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                      >
                                        Read More <ArrowRightIcon className="w-4 h-4 ml-2" />
                                      </Link>
                                    </div>
                                  </motion.div>
                                ))}
                                <div className="text-center mt-8">
                                  <Link
                                    href="/blog" // Placeholder link to all news/blog
                                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-300 transition duration-300 shadow-md"
                                  >
                                    View All News
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </section>


                                {/* ── Call to Action - Bold ── */}
                                <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
                                  <div className="max-w-4xl mx-auto text-center text-white px-6">
                                    <motion.h2
                                      className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight drop-shadow-lg"
                                      initial={{ y: -50, opacity: 0 }}
                                      whileInView={{ y: 0, opacity: 1 }}
                                      viewport={{ once: true, amount: 0.5 }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                      Ready to Make a Lasting Impact?
                                    </motion.h2>
                                    <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
                                      Your support helps us build a future filled with hope and opportunities for children and communities worldwide.
                                    </p>
                                    <Link
                                      href={`/${slug}/join`} // Dynamic join link
                                      className="inline-flex items-center bg-white text-green-700 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition duration-300 shadow-xl transform hover:scale-105"
                                    >
                                      Join Us Today <ArrowRightIcon className="w-6 h-6 ml-3" />
                                    </Link>
                                  </div>
                                </section>
                          
                          
                                {/* ── FAQs ── */}
                                <section className="py-20 bg-gray-50">
                                  <div className="max-w-3xl mx-auto px-6">
                                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                                      Frequently Asked Questions
                                    </h2>
                                    <div className="space-y-4">
                                      {faqs && faqs.length > 0 ? (
                                        faqs.map((q, i) => (
                                          <motion.details
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.4 }}
                                            transition={{ delay: 0.1 * i, duration: 0.5 }}
                                            className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer transition-shadow duration-300"
                                          >
                                            <summary className="font-semibold text-lg text-gray-900 flex justify-between items-center py-2">
                                              {q.question}
                                              <span className="ml-4 text-orange-500 transform group-open:rotate-45 transition-transform duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                              </span>
                                            </summary>
                                            <p className="mt-3 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                                              {q.answer}
                                            </p>
                                          </motion.details>
                                        ))
                                      ) : (
                                        // Fallback FAQs if `faqs` from context is empty
                                        [
                                          { question: 'What is your organization\'s main mission?', answer: 'Our main mission is to provide support, education, and medical aid to underprivileged children and communities worldwide, fostering self-sufficiency and hope.' },
                                          { question: 'How can I donate?', answer: 'You can easily donate through our secure online portal, or by bank transfer. We also accept in-kind donations. Visit our "Donate" page for more details.' },
                                          { question: 'Are my donations tax-deductible?', answer: 'Yes, as a registered non-profit organization, all donations are tax-deductible to the fullest extent of the law. You will receive a receipt for your contribution.' },
                                          { question: 'How can I volunteer?', answer: 'We welcome volunteers! Please visit our "Volunteer" section to learn about current opportunities and how to apply. Your time and skills can make a significant difference.' }
                                        ].map((q, i) => (
                                          <motion.details
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.4 }}
                                            transition={{ delay: 0.1 * i, duration: 0.5 }}
                                            className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer transition-shadow duration-300"
                                          >
                                            <summary className="font-semibold text-lg text-gray-900 flex justify-between items-center py-2">
                                              {q.question}
                                              <span className="ml-4 text-orange-500 transform group-open:rotate-45 transition-transform duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                              </span>
                                            </summary>
                                            <p className="mt-3 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                                              {q.answer}
                                            </p>
                                          </motion.details>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </section>      
      </main>
    </div>
  );
}
