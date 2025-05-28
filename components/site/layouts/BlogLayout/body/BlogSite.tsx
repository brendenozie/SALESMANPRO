import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dynamic loader for optimized images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Dummy posts (replace with real API data)
const samplePosts = [
  { id: "p1", title: "5 Ways to Boost Your Productivity", excerpt: "Tactical tips backed by science to maximize focus.", image: "/posts/productivity.jpg" },
  { id: "p2", title: "Design Thinking in Action", excerpt: "A deep dive into creative problem solving techniques.", image: "/posts/design.jpg" },
  { id: "p3", title: "Mastering Mindfulness", excerpt: "Simple practices to calm your mind and increase awareness.", image: "/posts/mindfulness.jpg" },
  { id: "p4", title: "The Art of Storytelling", excerpt: "Craft compelling narratives that resonate.", image: "/posts/storytelling.jpg" },
  { id: "p5", title: "Building Resilience", excerpt: "Strategies to bounce back stronger.", image: "/posts/resilience.jpg" },
  { id: "p6", title: "Leadership Essentials", excerpt: "Key attributes of impactful leaders.", image: "/posts/leadership.jpg" },
];

export default function BlogSite() {
  const router = useRouter();
  const [posts, setPosts] = useState(samplePosts);

  // Fetch real posts logic here

  return (
    <div className="font-sans text-gray-900">
      

      {/* Hero Carousel with Slide Controls */}
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/blog-hero.jpg"
            alt="Hero"
            loader={loader}
            fill
            className="object-cover brightness-75"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.h2
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight"
          >
            Unleash Your Potential
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-lg md:text-2xl text-white max-w-2xl"
          >
            Deep insights, actionable tips, and inspiration to elevate your journey.
          </motion.p>
          <motion.button
            onClick={() => router.push('/blog')}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition"
          >
            Explore Now
          </motion.button>
        </div>
      </section>

      {/* Search & Category Filter */}
      <section className="bg-gray-100 py-8">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-4 px-4">
          <input
            type="search"
            placeholder="Search articles..."
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none"
          />
          <select className="px-4 py-3 border rounded-lg focus:outline-none">
            <option>All Categories</option>
            <option>Productivity</option>
            <option>Design</option>
            <option>Mindfulness</option>
            <option>Leadership</option>
          </select>
        </div>
      </section>

      {/* Latest Insights Grid */}
      <section className="container mx-auto px-4 py-16">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Latest Insights
        </motion.h3>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, idx) => (
            <motion.article
              key={post.id}
              whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
              transition={{ type: 'spring', stiffness: 250 }}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => router.push(`/blog/${post.id}`)}
            >
              <div className="relative h-56">
                <Image src={post.image} alt={post.title} fill loader={loader} className="object-cover" />
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-semibold mb-2">{post.title}</h4>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Link href={`/blog/${post.id}`}  className="inline-block text-indigo-600 font-medium hover:underline">
                    Read More → 
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-indigo-600 py-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="container mx-auto text-center px-4 max-w-lg text-white"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Stay Informed</h3>
          <p className="mb-6">Subscribe for weekly tips, exclusive content, and more.</p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-2xl transition">
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>

    </div>
  );
}
