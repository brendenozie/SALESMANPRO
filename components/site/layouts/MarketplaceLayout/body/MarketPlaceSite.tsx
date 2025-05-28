import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample store data
const store = {
  name: "Urban Shop Hub",
  slug: "urban-shop-hub",
  description: "Discover unique products from local artisans and top brands.",
  bannerUrl: "/images/marketplace-hero.jpg",
  categories: [
    { id: 1, name: "Home & Living", imageUrl: "/categories/home.jpg", slug: "home-and-living" },
    { id: 2, name: "Fashion", imageUrl: "/categories/fashion.jpg", slug: "fashion" },
    { id: 3, name: "Electronics", imageUrl: "/categories/electronics.jpg", slug: "electronics" },
    { id: 4, name: "Beauty", imageUrl: "/categories/beauty.jpg", slug: "beauty" },
    { id: 5, name: "Sports", imageUrl: "/categories/sports.jpg", slug: "sports" },
    { id: 6, name: "Toys", imageUrl: "/categories/toys.jpg", slug: "toys" },
  ],
  featured: [
    { id: "p1", name: "Handcrafted Ceramic Vase", price: 2500, imageUrl: "/products/vase.jpg", slug: "ceramic-vase" },
    { id: "p2", name: "Leather Weekend Bag", price: 4500, imageUrl: "/products/bag.jpg", slug: "weekend-bag" },
    { id: "p3", name: "Wireless Noise-Cancelling Headphones", price: 12000, imageUrl: "/products/headphones.jpg", slug: "headphones" },
    { id: "p4", name: "Organic Skincare Set", price: 3500, imageUrl: "/products/skincare.jpg", slug: "skincare-set" },
  ],
  promotions: [
    { title: "Summer Sale - Up to 50% Off", description: "Refresh your home with stylish decor.", bannerUrl: "/promos/summer-sale.jpg" },
    { title: "New Arrivals", description: "Check out the latest gadgets.", bannerUrl: "/promos/new-arrivals.jpg" },
  ],
  testimonials: [
    { quote: "Best marketplace with unique finds!", author: "Lisa M." },
    { quote: "Fast shipping and great quality.", author: "Carlos R." },
  ],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MarketplaceSite() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    setCategories(store.categories);
    setFeatured(store.featured);
    setPromotions(store.promotions);
    setTestimonials(store.testimonials);
  }, []);

  return (
    <div className="space-y-20 font-sans">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        className="relative h-screen bg-gradient-to-br from-gray-800 to-black flex items-center justify-center overflow-hidden"
      >
        <Image src={store.bannerUrl} alt={store.name} fill loader={loader} className="object-cover opacity-50" />
        <div className="relative z-10 text-center px-6 max-w-2xl text-white">
          <motion.h1 initial={{ y: -50 }} animate={{ y: 0 }} transition={{ delay: 0.4 }} className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">
            {store.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-lg md:text-xl mb-8">
            {store.description}
          </motion.p>
          <motion.button whileHover={{ scale: 1.05 }} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition" onClick={() => router.push(`/${store.slug}/shop`)}>
            Start Shopping
          </motion.button>
        </div>
      </motion.section>

      {/* Shop by Category */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
            Shop by Category
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <motion.div key={cat.id} whileHover={{ scale: 1.1 }} className="relative group cursor-pointer" onClick={() => router.push(`/${store.slug}/category/${cat.slug}`)}>
                <Image src={cat.imageUrl} alt={cat.name} width={200} height={200} loader={loader} className="object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white font-semibold">{cat.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
            Featured Products
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {featured.map((item, i) => (
              <motion.div key={item.id} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }} className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer" onClick={() => router.push(`/${store.slug}/product/${item.slug}`)}>
                <div className="relative h-56">
                  <Image src={item.imageUrl} alt={item.name} fill loader={loader} className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-green-600 font-bold">KES {item.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
            Special Offers
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {promotions.map((promo, i) => (
              <motion.div key={i} whileHover={{ scale: 1.03 }} className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image src={promo.bannerUrl} alt={promo.title} width={400} height={250} loader={loader} className="object-cover w-full h-48" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center p-4 text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">{promo.title}</h3>
                  <p className="text-white">{promo.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
            What Customers Say
          </motion.h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {testimonials.map((t, i) => (
              <motion.blockquote key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 * i }} className="italic text-gray-700 text-lg">
                “{t.quote}”<br /><span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}