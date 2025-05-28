import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import DatePicker from "react-datepicker";
import { useInView } from "react-intersection-observer";
import "react-datepicker/dist/react-datepicker.css";

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
      <Hero
        store={store}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        handleSearch={handleSearch}
      />

      {/* Categories */}
      <section id="categories" className="py-32 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-20 text-slate-800 tracking-tight">
            Browse by Category
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {store.StoreCategory.map(cat => (
              <Reveal key={cat.id}>
                <Link href={`/${store.slug}/category/${cat.slug}`}>
                  <motion.div
                    whileHover={{ scale: 1.06, y: -4 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="group cursor-pointer bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/40 hover:shadow-2xl transition"
                  >
                    <div className="relative h-44 w-full">
                      <Image
                        loader={loader}
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-purple-600 transition">
                        {cat.name}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* Featured Providers Carousel */}
      <section id="featured" className="py-32 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-20 text-slate-800 tracking-tight">
            Top Providers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {featured.map((svc: any) => (
              <motion.div
                key={svc.id}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 150 }}
                className="group bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden shadow-xl transition-all hover:shadow-2xl"
              >
                <div className="relative h-52 w-full">
                  <Image
                    loader={loader}
                    src={svc.imageUrl}
                    alt={svc.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-slate-800 group-hover:text-purple-600 transition mb-1">
                    {svc.name}
                  </h3>
                  <p className="text-lg text-indigo-600 font-bold mb-4">
                    KES {svc.price.toLocaleString()}
                  </p>
                  <div className="flex justify-center items-center gap-1 text-yellow-400 text-sm mb-2">
                    {'⭐️'.repeat(Math.floor(svc.rating || 5))} {
                      svc.rating ? svc.rating.toFixed(1) : "5.0"
                    }
                  </div>

                  <button
                    onClick={() => alert("Book " + svc.name)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-full font-semibold shadow-md transition-all"
                  >
                    Book Now
                  </button>
                </div>
                <span className="absolute top-4 left-4 bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                  Best Value
                </span>

              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-16">
            What Clients Are Saying
          </h2>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {store.testimonials.map((t, i) => (
              <Reveal key={i}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-lg px-6 py-8 text-left transition-all hover:shadow-2xl"
                >
                  <div className="text-4xl text-purple-500 mb-4">“</div>
                  <p className="text-slate-700 text-lg leading-relaxed italic"> 
                    {t.quote}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                  {/* <Image src={t.avatarUrl} alt={t.author} width={40} height={40} className="rounded-full" /> */}
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {t.author.charAt(0)}
                    </div>
                    <span className="text-slate-900 font-semibold">{t.author}</span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* FAQs */}
      <section id="faq" className="py-32 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-slate-800 mb-16">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {faqs.map((q: any, i) => (
              <Reveal key={i}>
                <motion.details
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="group bg-white/60 backdrop-blur-lg border border-slate-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all"
                >
                  <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-slate-800">
                    {q?.question ?? ""}
                    <svg
                      className="w-5 h-5 ml-2 text-slate-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-slate-600 leading-relaxed">
                    {q?.answer ?? ""}
                  </p>
                </motion.details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}

function Hero({ store, searchTerm, setSearchTerm, date, setDate, time, setTime, handleSearch }:any) {
  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-teal-500 to-purple-500"
    >
      {/* Background Image Overlay */}
      <Image
        loader={loader}
        src={store.bannerUrl}
        alt="Hero"
        fill
        className="object-cover opacity-30"
      />

      {/* Soft Animated Light Orb */}
      <motion.div
        className="absolute w-96 h-96 bg-fuchsia-300 rounded-full opacity-20 blur-3xl top-1/3 left-1/4"
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full px-6 bg-white/5 backdrop-blur-md">
        {/* Left: Title and Description */}
        <div className="text-center md:text-left max-w-2xl space-y-6">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-white"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {store.name}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            {store.description}
          </motion.p>
        </div>

        {/* Right: Booking Form */}
        <motion.div
          className="mt-10 md:mt-0 md:ml-12 bg-white/20 backdrop-blur-xl p-6 rounded-2xl shadow-xl w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 outline-none"
            />
            <DatePicker
              selected={date}
              onChange={setDate}
              className="w-full px-4 py-3 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 outline-none"
              dateFormat="MMM d, yyyy"
              calendarClassName="rounded-lg p-2 shadow-lg bg-white"
            />
            <DatePicker
              selected={time}
              onChange={setTime}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              dateFormat="h:mm aa"
              className="w-full px-4 py-3 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 outline-none"
              calendarClassName="rounded-lg p-2 shadow-lg bg-white"
            />
            <button
              onClick={handleSearch}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md transition"
            >
              Find Available Slots
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
