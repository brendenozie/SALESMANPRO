import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import DatePicker from "react-datepicker";
import { useInView } from "react-intersection-observer";
// import useScrollSpy from "react-use-scrollspy";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";

const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

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

// Reveal-on-scroll wrapper
function Reveal({ children }:any) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="w-full"
    >{children}</motion.div>
  );
}

export default function BookingsSite() {
  const [featured, setFeatured] = useState<{ id: string; name: string; price: number; imageUrl: string; }[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setFeatured(store?.products ?? []);
    setFaqs(store.faqs ?? []) ;
  }, []);

  const handleSearch = () => {
    // Implement real search flow
    alert(`Searching ${searchTerm} on ${date?.toLocaleDateString()} at ${time?.toLocaleTimeString()}`);
  };

  return (
    <>

      {/* Hero */}
      <section id="hero" className="relative h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-500 overflow-hidden">
        <Image loader={loader} src={store.bannerUrl} alt="Hero" fill className="object-cover opacity-40" />
        {/* Animated petals */}
        <motion.div className="absolute w-64 h-64 bg-pink-400 rounded-full opacity-20 filter blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        <div className="relative z-10 text-center px-6">
          <motion.h1
            className="text-6xl md:text-8xl font-extrabold text-white"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}
          >{store.name}</motion.h1>
          <motion.p className="mt-4 text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
          >{store.description}</motion.p>
          <motion.div className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}
          >
            <input
              type="text" placeholder="Search providers..."
              className="px-4 py-3 rounded-lg w-64 focus:outline-none"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
            <DatePicker selected={date} className="px-4 py-3 rounded-lg w-44" dateFormat="MMM d, yyyy"/>
            <DatePicker selected={time} className="px-4 py-3 rounded-lg w-32"
              showTimeSelect showTimeSelectOnly timeIntervals={30} dateFormat="h:mm aa"
            />
            <button onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-xl transition"
            >Find Slots</button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {store.StoreCategory.map(cat => (
              <Reveal key={cat.id}>
                <Link href={`/${store.slug}/category/${cat.slug}`}>
                  <motion.div whileHover={{ scale: 1.05 }} className="overflow-hidden rounded-xl shadow-lg">
                    <div className="relative h-40">
                      <Image loader={loader} src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center font-semibold">
                      {cat.name}
                    </div>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers Carousel */}
      <section id="featured" className="py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Top Providers</h2>
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
      <section id="testimonials" className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">What Clients Are Saying</h2>
          <div className="space-y-12 max-w-3xl mx-auto">
            {store.testimonials.map((t, i) => (
              <Reveal key={i}>
                <blockquote className="italic text-gray-700 text-xl">
                  “{t.quote}”
                  <div className="mt-2 font-semibold text-gray-900">— {t.author}</div>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-32 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">FAQs</h2>
          <div className="space-y-8">
            {faqs.map((q:any, i) => (
              <Reveal key={i}>
                <motion.details initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i*0.1 }} className="bg-white p-6 rounded-2xl shadow-lg">
                  <summary className="cursor-pointer font-semibold text-gray-800 text-lg">{q?.question ?? ""}</summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">{q?.answer ?? ""}</p>
                </motion.details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
