import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample store & post data
const store = {
  slug: "insightful-blog",
  heroSlides: [
    {
      imageUrl: "/images/blog-hero.jpg",
      headline: "Unleash Your Potential",
      subline: "Deep insights, actionable tips, and inspiration to elevate your journey.",
      ctaText: "Explore Now",
      ctaLink: "/blog",
    },
  ],
};

const samplePosts = [
  {
    id: "p1",
    headline: "5 Ways to Boost Your Productivity",
    subline: "Tactical tips backed by science to maximize focus.",
    imageUrl: "/posts/productivity.jpg",
  },
  {
    id: "p2",
    headline: "Design Thinking in Action",
    subline: "A deep dive into creative problem solving techniques.",
    imageUrl: "/posts/design.jpg",
  },
  {
    id: "p3",
    headline: "Mastering Mindfulness",
    subline: "Simple practices to calm your mind and increase awareness.",
    imageUrl: "/posts/mindfulness.jpg",
  },
  {
    id: "p4",
    headline: "The Art of Storytelling",
    subline: "Craft compelling narratives that resonate.",
    imageUrl: "/posts/storytelling.jpg",
  },
  {
    id: "p5",
    headline: "Building Resilience",
    subline: "Strategies to bounce back stronger.",
    imageUrl: "/posts/resilience.jpg",
  },
  {
    id: "p6",
    headline: "Leadership Essentials",
    subline: "Key attributes of impactful leaders.",
    imageUrl: "/posts/leadership.jpg",
  },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function BlogSite() {
  const router = useRouter();
  const [posts, setPosts] = useState(samplePosts);

  // Optional: fetch real posts here

  return (
    <div className="space-y-24 font-sans">
      {/* Hero Banner */}
      <section className="relative h-screen bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 flex items-center justify-center overflow-hidden">
        <Image
          src={store.heroSlides[0].imageUrl}
          alt={store.heroSlides[0].headline}
          fill
          className="object-cover opacity-40"
          loader={loader}
        />
        <div className="relative z-10 text-center px-6 max-w-xl">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight"
          >
            {store.heroSlides[0].headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-white mb-8"
          >
            {store.heroSlides[0].subline}
          </motion.p>
          <motion.button
            onClick={() => router.push(store.heroSlides[0].ctaLink)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white text-indigo-700 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl transition"
          >
            {store.heroSlides[0].ctaText}
          </motion.button>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center text-gray-800 mb-12"
          >
            Latest Insights
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => router.push(`/blog/${post.id}`)}
              >
                <div className="relative h-56">
                  <Image
                    src={post.imageUrl}
                    alt={post.headline}
                    fill
                    className="object-cover"
                    loader={loader}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {post.headline}
                  </h3>
                  <p className="text-gray-600 mb-4">{post.subline}</p>
                  <Link href={`/blog/${post.id}`}>
                    <a className="text-indigo-600 font-medium hover:underline">
                      Read More →
                    </a>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-white">
        <motion.div
          className="container mx-auto px-6 text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Stay Informed
          </h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for weekly tips and exclusive content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 border border-gray-300 rounded-lg w-full sm:w-auto flex-1 focus:outline-none"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition">
              Subscribe
            </button>
          </div>
        </motion.div>
      </section>

      { /* Additional children or footer */ }
    </div>
  );
}