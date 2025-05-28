import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Sample data fallback
const store = {
  name: "Your Store",
  slug: "your-store",
  description: "No site set yet. Contact the admin to configure your site.",
  bannerUrl: "/images/default-hero.jpg",
  heroSlides: [],
  products: [],
  StoreCategory: [],
  testimonials: [
    { quote: "Great support from the admin!", author: "Admin User" },
  ],
  faqs: [
    { question: "How do I configure my site?", answer: "Reach out to admin@domain.com for setup assistance." },
    { question: "Why can’t I see content?", answer: "No category selected—please contact admin to enable your site." },
  ],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function DefaultSite() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Show a generic prompt card
    setItems([
      { id: 'c1', name: 'Contact Admin', subtitle: 'Click below to reach out', imageUrl: '/images/contact-admin.jpg', cta: () => router.push(`/contact`) }
    ]);
    setTestimonials(store.testimonials);
    setFaqs(store.faqs);
  }, []);

  return (
    <div className="space-y-16 font-sans">
      {/* Hero */}
      <motion.section
        className="relative h-[60vh] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
      >
        <Image src={store.bannerUrl} fill alt="Default Hero" className="object-cover opacity-30" loader={loader} />
        <div className="relative z-10 text-center px-6">
          <motion.h1 initial={{ y: -30 }} animate={{ y: 0 }} transition={{ delay: 0.5 }} className="text-5xl font-bold mb-4 drop-shadow-lg">
            {store.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-lg max-w-xl mx-auto mb-6">
            {store.description}
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/contact')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg transition"
          >
            Contact Admin
          </motion.button>
        </div>
      </motion.section>

      {/* Action Card */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}
          >
            <div className="relative h-64 md:h-auto md:w-1/2">
              <Image src={items[0]?.imageUrl ?? ""} fill alt={items[0]?.name ?? ""} className="object-cover" loader={loader} />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{items[0]?.name ?? "Awesome Name"}</h2>
              <p className="text-gray-600 mb-6">{items[0]?.subtitle  ?? "Awesome Subtitle"}</p>
              <button
                onClick={items[0]?.cta ?? "Awesome Name"}
                className="self-start bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-full font-semibold transition"
              >
                Contact Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Testimonials</h2>
          <div className="max-w-2xl mx-auto space-y-8">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 * i }}
                className="italic text-gray-700 text-lg"
              >
                “{t.quote}”<br /><span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <motion.details key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + 0.1 * i }} className="bg-gray-50 p-4 rounded-lg shadow">
                <summary className="cursor-pointer font-medium text-gray-800">{q.question}</summary>
                <p className="mt-2 text-gray-600">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}