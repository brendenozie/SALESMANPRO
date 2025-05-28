import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";

// Sample store data
const store = {
name: "UrbanNest Realty",
slug: "urbannest",
description: "Find your perfect home with ease and style.",
bannerUrl: "/images/realestate-hero.jpg",
StoreCategory: [
{ id: 1, name: "Apartments", slug: "apartments", imageUrl: "/categories/apartment.jpg" },
{ id: 2, name: "Villas", slug: "villas", imageUrl: "/categories/villa.jpg" },
{ id: 3, name: "Offices", slug: "offices", imageUrl: "/categories/office.jpg" },
{ id: 4, name: "Land Plots", slug: "land-plots", imageUrl: "/categories/land.jpg" },
],
products: [
{ id: "h1", name: "Luxury City Apartment", price: 8500000, imageUrl: "/properties/apartment1.jpg" },
{ id: "h2", name: "Beachside Villa", price: 15000000, imageUrl: "/properties/villa1.jpg" },
{ id: "h3", name: "Downtown Office Space", price: 6000000, imageUrl: "/properties/office1.jpg" },
{ id: "h4", name: "Private Land Plot", price: 3000000, imageUrl: "/properties/land1.jpg" },
{ id: "h5", name: "Modern Loft", price: 9500000, imageUrl: "/properties/loft1.jpg" },
{ id: "h6", name: "Suburban Family Home", price: 7000000, imageUrl: "/properties/home1.jpg" },
],
testimonials: [
{ quote: "UrbanNest made finding our dream home a breeze!", author: "Alice K." },
{ quote: "Professional, transparent and efficient. Highly recommend!", author: "Brian M." },
{ quote: "Great selection of properties and friendly agents.", author: "Cindy L." },
],
faqs: [
{ question: "Can I schedule a viewing?", answer: "Yes, book a viewing directly through the listing page." },
{ question: "Do you offer mortgage assistance?", answer: "We partner with top banks for mortgage support." },
{ question: "Is there a buyer's guarantee?", answer: "Yes, we offer a money-back guarantee within 7 days." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function RealEstateSite() {
const router = useRouter();
const [properties, setProperties] = useState<any[]>([]);
const [categories, setCategories] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);
const [location, setLocation] = useState("");
const [minPrice, setMinPrice] = useState("");
const [maxPrice, setMaxPrice] = useState("");

useEffect(() => {
setCategories(store.StoreCategory);
setProperties(store.products);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

const handleSearch = () => {
alert(`Searching in ${location} between KES ${minPrice} and KES ${maxPrice}`);
};

return ( <div className="space-y-20 font-sans">
{/* {/ Hero + Search /}  */}
<section className="relative h-screen bg-gradient-to-br from-green-700 to-teal-500 text-white flex items-center justify-center"> <Image src={store.bannerUrl} alt="Hero" fill className="object-cover opacity-30" loader={loader} /> <div className="relative z-10 text-center px-6">
<motion.h1
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.8 }}
className="text-5xl md\:text-7xl font-bold mb-4"
>
{store.name}
</motion.h1>
<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.4 }}
className="text-lg md\:text-xl max-w-2xl mx-auto mb-8"
>
{store.description}
</motion.p>
<motion.div
initial={{ y: 50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ delay: 0.6 }}
className="grid grid-cols-1 sm\:grid-cols-3 gap-4 max-w-3xl mx-auto"
>
<input
type="text"
placeholder="Location"
value={location}
onChange={(e) => setLocation(e.target.value)}
className="px-4 py-3 rounded-lg text-gray-800 focus\:outline-none"
/>
<input
type="number"
placeholder="Min Price"
value={minPrice}
onChange={(e) => setMinPrice(e.target.value)}
className="px-4 py-3 rounded-lg text-gray-800 focus\:outline-none"
/>
<input
type="number"
placeholder="Max Price"
value={maxPrice}
onChange={(e) => setMaxPrice(e.target.value)}
className="px-4 py-3 rounded-lg text-gray-800 focus\:outline-none"
/> <button
           onClick={handleSearch}
           className="sm:col-span-3 bg-white text-green-700 font-semibold py-3 rounded-lg shadow hover:shadow-lg transition"
         >
Search Listings </button>
</motion.div> </div> </section>


  {/* Categories */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Property Types</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <motion.div key={cat.id} whileHover={{ scale: 1.05 }} className="overflow-hidden rounded-xl shadow-lg">
            <Link href="#">
              <div className="relative h-36">
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" loader={loader} />
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500 to-teal-400 text-white text-center font-semibold">
                {cat.name}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Featured Properties */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Featured Listings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((prop) => (
          <motion.div
            key={prop.id}
            whileHover={{ y: -10 }}
            className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
            onClick={() => router.push(`/${store.slug}/property/${prop.id}`)}
          >
            <div className="relative h-56">
              <Image src={prop.imageUrl} alt={prop.name} fill className="object-cover" loader={loader} />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">{prop.name}</h3>
              <p className="text-green-700 font-bold">KES {prop.price.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Testimonials */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold mb-12 text-gray-800">What Clients Say</h2>
      <div className="space-y-8 max-w-2xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="italic text-gray-700"
          >
            “{t.quote}”<br />
            <span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
          </motion.blockquote>
        ))}
      </div>
    </div>
  </section>

  {/* FAQs */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 max-w-3xl">
      <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">FAQs</h2>
      <div className="space-y-4">
        {faqs.map((q, i) => (
          <motion.details
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <summary className="cursor-pointer font-semibold text-gray-800">{q.question}</summary>
            <p className="mt-2 text-gray-600">{q.answer}</p>
          </motion.details>
        ))}
      </div>
    </div>
  </section>
</div>


);
}
