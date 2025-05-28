import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample Data
const store = {
  name: "Pulse Media",
  slug: "pulse-media",
  description: "Your hub for inspiring stories, videos, and insights.",
  heroSlides: [
    { imageUrl: "/images/media-hero.jpg", headline: "Stay Informed", subline: "Latest news & features" },
  ],
  categories: [
    { id: 1, name: "News", slug: "news" },
    { id: 2, name: "Entertainment", slug: "entertainment" },
    { id: 3, name: "Tech", slug: "tech" },
    { id: 4, name: "Lifestyle", slug: "lifestyle" },
  ],
  featuredArticles: [
    { id: "a1", name: "Future of AI", subtitle: "How AI is reshaping industries", imageUrl: "/articles/ai.jpg", slug: "future-of-ai" },
    { id: "a2", name: "Travel Trends 2025", subtitle: "Top destinations you must see", imageUrl: "/articles/travel.jpg", slug: "travel-trends-2025" },
  ],
  latestVideos: [
    { id: "v1", imageUrl: "/videos/video1.jpg", ctaLink: "/video/v1" },
    { id: "v2", imageUrl: "/videos/video2.jpg", ctaLink: "/video/v2" },
    { id: "v3", imageUrl: "/videos/video3.jpg", ctaLink: "/video/v3" },
    { id: "v4", imageUrl: "/videos/video4.jpg", ctaLink: "/video/v4" },
  ],
  faqs: [
    { question: "How do I submit content?", answer: "Use the contributor portal to pitch your article or video." },
    { question: "Is subscription required?", answer: "No, all content is free to access." },
  ],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MediaSite() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCategories(store.categories);
    setFeatured(store.featuredArticles);
    setVideos(store.latestVideos);
    setFaqs(store.faqs);
  }, []);

  return (
    <div className="space-y-20 font-sans">
      {/* Hero */}
      <section className="relative h-[70vh] bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center overflow-hidden">
        <Image
          src={store.heroSlides[0].imageUrl}
          alt={store.heroSlides[0].headline}
          fill
          className="object-cover opacity-30"
          loader={loader}
        />
        <motion.div
          className="relative z-10 text-center px-6 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">{store.name}</h1>
          <p className="text-lg md:text-xl mb-6">{store.description}</p>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center mb-8 text-gray-800"
          >Explore Categories</motion.h2>
          <div className="flex justify-center flex-wrap gap-4">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.1 }}
                className="px-5 py-2 bg-gray-100 rounded-full font-medium hover:bg-gray-200 transition"
                onClick={() => router.push(`/${store.slug}/category/${cat.slug}`)}
              >{cat.name}</motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-8 text-gray-800"
          >Featured Articles</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featured.map((art) => (
              <motion.div
                key={art.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                onClick={() => router.push(`/${store.slug}/article/${art.slug}`)}
              >
                <div className="relative h-64">
                  <Image src={art.imageUrl} alt={art.name} fill className="object-cover" loader={loader} />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{art.name}</h3>
                  <p className="text-gray-600">{art.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Videos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-8 text-gray-800"
          >Latest Videos</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {videos.map((vid) => (
              <motion.div
                key={vid.id}
                whileHover={{ scale: 1.05 }}
                className="relative pb-[56.25%] bg-black rounded-xl overflow-hidden cursor-pointer"
                onClick={() => router.push(vid.ctaLink)}
              >
                <Image src={vid.imageUrl} alt="Video" fill className="object-cover absolute inset-0" loader={loader} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white bg-opacity-80 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-10 text-gray-800"
          >FAQs</motion.h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-xl cursor-pointer"
              >
                <summary className="font-semibold text-gray-800">{q.question}</summary>
                <p className="mt-2 text-gray-600">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}