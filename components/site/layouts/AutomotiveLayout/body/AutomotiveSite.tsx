import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
  name: "Elite Auto Hub",
  slug: "elite-auto",
  bannerUrl: "/images/auto-banner.jpg",
  promotions: [
    { title: "Summer Service Special", description: "20% off on all maintenance services.", bannerUrl: "/promos/summer.jpg" },
    { title: "New Arrivals", description: "Check out the latest 2025 models.", bannerUrl: "/promos/arrivals.jpg" },
    { title: "Trade-In Bonus", description: "Up to $2000 trade-in bonus.", bannerUrl: "/promos/tradein.jpg" },
  ],
  products: [
    { id: "v1", name: "2025 Mustang GT", price: 4500000, imageUrl: "/cars/mustang.jpg", slug: "mustang-gt" },
    { id: "v2", name: "2025 Camaro ZL1", price: 5000000, imageUrl: "/cars/camaro.jpg", slug: "camaro-zl1" },
    { id: "v3", name: "2025 Tesla Model S", price: 7000000, imageUrl: "/cars/tesla.jpg", slug: "tesla-model-s" },
  ],
  testimonials: [
    { quote: "Best car-buying experience ever!", author: "Alex P.", avatarUrl: "/avatars/alex.jpg" },
    { quote: "Amazing service and great deals.", author: "Jamie L.", avatarUrl: "/avatars/jamie.jpg" },
  ],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AutomotiveSite() {
  const router = useRouter();
  const [promos, setPromos] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    setPromos(store.promotions);
    setFeatured(store.products);
    setTestimonials(store.testimonials);
  }, []);

  return (
    <div className="space-y-24 font-sans">
      {/* Hero */}
      <section className="relative h-[75vh] bg-black flex items-center justify-center overflow-hidden">
        <Image
          src={store.bannerUrl}
          alt="Automotive Banner"
          fill
          className="object-cover opacity-60"
          loader={loader}
        />
        <motion.div
          className="relative z-10 text-center text-white px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{store.name}</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 drop-shadow">Premium vehicles & unmatched service.</p>
          <motion.button
            onClick={() => router.push(`/${store.slug}/inventory`)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition"
            whileHover={{ scale: 1.05 }}
          >
            View Inventory
          </motion.button>
        </motion.div>
      </section>

      {/* Promotions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Current Promotions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {promos.map((promo, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
              >
                <div className="relative h-48">
                  <Image src={promo.bannerUrl} alt={promo.title} fill loader={loader} className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{promo.title}</h3>
                  <p className="text-gray-700">{promo.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Featured Vehicles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((car) => (
              <motion.div
                key={car.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => router.push(`/${store.slug}/vehicle/${car.slug}`)}
              >
                <div className="relative h-56">
                  <Image src={car.imageUrl} alt={car.name} fill loader={loader} className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-1 text-gray-900">{car.name}</h3>
                  <p className="text-red-600 font-bold">KES {car.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">What Our Customers Say</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * i }}
                className="italic text-gray-700 text-lg"
              >
                “{t.quote}”<br />
                <span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}