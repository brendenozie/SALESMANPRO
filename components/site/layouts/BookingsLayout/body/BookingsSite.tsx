import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import DatePicker from "react-datepicker";

// Sample store data
const store = {
name: "PrimeBookings Hub",
slug: "primebookings",
description: "Discover and book top-rated service providers in seconds!",
bannerUrl: "/images/booking-hero.jpg",
StoreCategory: [
{ id: 1, name: "Hair Stylists", slug: "hair-stylists", imageUrl: "/categories/hair.jpg" },
{ id: 2, name: "Fitness Trainers", slug: "fitness-trainers", imageUrl: "/categories/fitness.jpg" },
{ id: 3, name: "Massage Therapists", slug: "massage-therapists", imageUrl: "/categories/massage.jpg" },
{ id: 4, name: "Personal Chefs", slug: "personal-chefs", imageUrl: "/categories/chef.jpg" },
],
products: [
{ id: "p1", name: "Elegant Updo", price: 2500, imageUrl: "/services/updo.jpg" },
{ id: "p2", name: "HIIT Session", price: 1500, imageUrl: "/services/hiit.jpg" },
{ id: "p3", name: "Swedish Massage", price: 3000, imageUrl: "/services/massage.jpg" },
{ id: "p4", name: "Gourmet Dinner", price: 5000, imageUrl: "/services/dinner.jpg" },
],
testimonials: [
{ quote: "Booked my stylist in minutes—fantastic!", author: "Emily R." },
{ quote: "Trainer was amazing and motivating.", author: "Mark T." },
{ quote: "Best massage experience ever.", author: "Sarah L." },
],
faqs: [
{ question: "Can I reschedule?", answer: "Yes, modify your booking up to 24 hours before." },
{ question: "Are there cancellation fees?", answer: "No fees if canceled before 12 hours." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function BookingsSite() {
const [featured, setFeatured] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);
const [searchTerm, setSearchTerm] = useState("");
const [date, setDate] = useState<Date | null>(new Date());
const [time, setTime] = useState<Date | null>(new Date());

useEffect(() => {
setFeatured(store.products);
setFaqs(store.faqs);
}, []);

const handleSearch = () => {
// simulate search
alert(`Searching ${searchTerm} on ${date?.toLocaleDateString()} at ${time?.toLocaleTimeString()}`);
};

return ( <div className="space-y-20">
{/* {/\* Hero \*/}  
<section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 overflow-hidden">
   <Image
      loader={loader}
       src={store.bannerUrl}
       alt="Hero"
       fill
       className="object-cover opacity-30"
     />
     <div className="relative z-10 text-center px-6">

<motion.h1
initial={{ y: -50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.8 }}
className="text-5xl md\:text-7xl font-bold text-white tracking-wide"
>
{store.name}
</motion.h1>
<motion.p
initial={{ y: 50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.8, delay: 0.3 }}
className="mt-4 text-xl md\:text-2xl text-white max-w-xl mx-auto"
>
{store.description}
</motion.p>
<motion.div
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ duration: 0.8, delay: 0.6 }}
className="mt-8 flex flex-col sm\:flex-row gap-4 justify-center"
>
<input
type="text"
placeholder="Search providers..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="px-4 py-3 rounded-lg w-64 focus\:outline-none"
/>
<DatePicker
selected={date}
onChange={(d) => setDate(d)}
className="px-4 py-3 rounded-lg w-44"
dateFormat="MMM d, yyyy"
/>
<DatePicker
selected={time}
onChange={(t) => setTime(t)}
className="px-4 py-3 rounded-lg w-32"
showTimeSelect
showTimeSelectOnly
timeIntervals={30}
dateFormat="h\:mm aa"
/> <button
           onClick={handleSearch}
           className="bg-indigo-800 hover:bg-indigo-900 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
         >
Find Slots </button>
</motion.div> </div> </section>


  {/* Categories */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-12">Browse by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {store.StoreCategory.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            className="overflow-hidden rounded-xl shadow-lg"
          >
            <Link href={`#`}>
              <div className="relative h-40">
                <Image
                  loader={loader}
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
                {cat.name}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Featured Services */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-12">Top Providers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {featured.map((svc:any) => (
          <motion.div
            key={svc.id}
            whileHover={{ y: -10 }}
            className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
          >
            <div className="relative h-48">
              <Image
                loader={loader}
                src={svc.imageUrl}
                alt={svc.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{svc.name}</h3>
              <p className="text-indigo-600 font-bold">KES {svc.price.toLocaleString()}</p>
              <button
                onClick={() => alert("Book " + svc.name)}
                className="mt-4 block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Testimonials */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold mb-12">What Clients Are Saying</h2>
      <div className="space-y-8 max-w-2xl mx-auto">
        {store.testimonials.map((t, i) => (
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="italic text-gray-700 text-xl"
          >
            “{t.quote}”<br />
            <span className="font-semibold text-gray-900">— {t.author}</span>
          </motion.blockquote>
        ))}
      </div>
    </div>
  </section>

  {/* FAQs */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 max-w-2xl">
      <h2 className="text-4xl font-bold text-center mb-10">FAQs</h2>
      <div className="space-y-4">
        {faqs.map((q:any, i:any) => (
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
