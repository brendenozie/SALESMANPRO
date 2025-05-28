import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data for directory
const store = {
  name: "Local Nexus",
  slug: "local-nexus",
  description: "Your go-to guide for the best local businesses and services.",
  bannerUrl: "/images/directory-hero.jpg",
  StoreCategory: [
  { id: 1, name: "Restaurants", slug: "restaurants", imageUrl: "/categories/restaurants.jpg" },
  { id: 2, name: "Shops", slug: "shops", imageUrl: "/categories/shops.jpg" },
  { id: 3, name: "Health & Wellness", slug: "health-wellness", imageUrl: "/categories/wellness.jpg" },
  { id: 4, name: "Entertainment", slug: "entertainment", imageUrl: "/categories/entertainment.jpg" },
  { id: 5, name: "Services", slug: "services", imageUrl: "/categories/services.jpg" },
  { id: 6, name: "Education", slug: "education", imageUrl: "/categories/education.jpg" },
  ],
  listings: [
  { id: 'l1', name: "Bistro Bliss", subtitle: "Cozy French Bistro", imageUrl: "/listings/bistro.jpg", slug: "bistro-bliss" },
  { id: 'l2', name: "Tech Gadget Hub", subtitle: "Latest electronics and accessories", imageUrl: "/listings/tech.jpg", slug: "tech-gadget-hub" },
  { id: 'l3', name: "Yoga Harmony", subtitle: "Find your balance", imageUrl: "/listings/yoga.jpg", slug: "yoga-harmony" },
  { id: 'l4', name: "Cinema Palace", subtitle: "Blockbuster movies daily", imageUrl: "/listings/cinema.jpg", slug: "cinema-palace" },
  { id: 'l5', name: "Spa Serenity", subtitle: "Relax and recharge", imageUrl: "/listings/spa.jpg", slug: "spa-serenity" },
  { id: 'l6', name: "Tutors & Co.", subtitle: "Expert academic support", imageUrl: "/listings/tutors.jpg", slug: "tutors-co" },
  ],
  testimonials: [
  { quote: "Found the best local eats here!", author: "Chris P." },
  { quote: "Great way to explore my city.", author: "Alex R." },
  { quote: "Highly recommend for discovering hidden gems!", author: "Jordan S." },
  ],
  faqs: [
  { question: "How do I submit a listing?", answer: "Click the " + "Add Your Businesslink at the top and fill out the form." },
  { question: "Is it free to use?", answer: "Yes, browsing is completely free for users." },
  { question: "Can I claim my business?", answer: "Yes, contact us with proof of ownership to claim your listing." },
  ],
  };
  
  const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;
// Components
function Hero({ title, description, bannerUrl, onSearch, searchTerm, setSearchTerm } : any) {
  return (
    <section className="relative h-[60vh] bg-gradient-to-br from-green-600 to-teal-500 text-white flex items-center justify-center overflow-hidden">
      <Image
        src={bannerUrl}
        alt="Directory Hero"
        fill
        className="object-cover opacity-30"
        priority
        loader={loader}
      />
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.h1
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight"
        >
          Discover {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl mb-8"
        >
          {description}
        </motion.p>
        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex w-full max-w-xl mx-auto"
          role="search"
          aria-label="Search listings and categories"
        >
          <input
            type="search"
            placeholder="Search listings or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 rounded-l-full focus:outline-none text-gray-800"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-r-full font-semibold transition-all focus:ring-2 focus:ring-orange-400"
          >
            Search
          </button>
        </motion.form>
      </div>
    </section>
  );
}

function CategoryGrid({ categories, slug }: any) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
      {categories.map((cat: any) => (
        <motion.div
          key={cat.id}
          whileHover={{ scale: 1.05 }}
          className="text-center cursor-pointer"
          onClick={() => router.push(`/${slug}/category/${cat.slug}`)}
          role="button"
          aria-label={`View ${cat.name}`}
        >
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden shadow-md">
            <Image src={cat.imageUrl} alt={cat.name} width={96} height={96} className="object-cover" loader={loader}/>
          </div>
          <p className="mt-3 font-medium text-gray-800 hover:text-green-600 transition-colors">
            {cat.name}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function ListingGrid({ listings, slug }: any) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((item: any) => (
        <motion.article
          key={item.id}
          whileHover={{ y: -5 }}
          className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => router.push(`/${slug}/listing/${item.slug}`)}
          role="link"
          aria-label={`View ${item.name}`}
        >
          <div className="relative h-48">
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" loader={loader}/>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
            <p className="text-gray-600 truncate">{item.subtitle}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function Testimonials({ testimonials }: any) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {testimonials.map((t: any, i: any): any => (
        <motion.blockquote
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 * i }}
          className="italic text-gray-700 text-center"
        >
          “{t.quote}”
          <footer className="mt-2 font-semibold text-gray-900">— {t.author}</footer>
        </motion.blockquote>
      ))}
    </div>
  );
}

function FAQ({ faqs }: any) {
  return (
    <div className="space-y-4">
      {faqs.map((q: any, i: any) => (
        <details key={i} className="bg-white p-4 rounded-lg shadow-sm">
          <summary className="font-medium cursor-pointer">{q.question}</summary>
          <p className="mt-2 text-gray-600">{q.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default function DirectorySite() {
  const router = useRouter();
  const [categories, setCategories] = useState<any>([]);
  const [listings, setListings] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate fetching
  useEffect(() => {
    setCategories(store.StoreCategory);
    setListings(store.listings);
  }, []);

  const handleSearch = () => {
    router.push(`/${store.slug}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="font-sans space-y-24">
      <Hero
        title={store.name}
        description={store.description}
        bannerUrl={store.bannerUrl}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
      />
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
            Top Categories
          </h2>
          <CategoryGrid categories={categories} slug={store.slug} />
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
            Featured Listings
          </h2>
          <ListingGrid listings={listings} slug={store.slug} />
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
            What People Are Saying
          </h2>
          <Testimonials testimonials={store.testimonials} />
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
            Help & FAQs
          </h2>
          <FAQ faqs={store.faqs} />
        </div>
      </section>
    </div>
  );
}

// Note: "store" is imported or fetched server-side in real use

