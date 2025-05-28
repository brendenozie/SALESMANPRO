import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
name: "Peak Performance Gym",
slug: "peak-performance",
bannerUrl: "/images/fitness-hero.jpg",
classes: [
{ id: "c1", name: "HIIT Blast", price: 1200, imageUrl: "/classes/hiit.jpg", slug: "hiit-blast" },
{ id: "c2", name: "Yoga Flow", price: 800, imageUrl: "/classes/yoga.jpg", slug: "yoga-flow" },
{ id: "c3", name: "Spin Session", price: 1000, imageUrl: "/classes/spin.jpg", slug: "spin-session" },
],
trainers: [
{ id: "t1", name: "Alex Carter", imageUrl: "/trainers/alex.jpg" },
{ id: "t2", name: "Mia Wong", imageUrl: "/trainers/mia.jpg" },
{ id: "t3", name: "Liam Patel", imageUrl: "/trainers/liam.jpg" },
{ id: "t4", name: "Sofia Lee", imageUrl: "/trainers/sofia.jpg" },
],
testimonials: [
{ quote: "I achieved my best shape ever!", author: "Jordan R." },
{ quote: "Trainers are super motivating.", author: "Taylor S." },
{ quote: "Love the community vibes here.", author: "Casey L." },
],
faqs: [
{ question: "Do you offer monthly memberships?", answer: "Yes, with flexible cancellation policy." },
{ question: "Can I try a class for free?", answer: "First class is complimentary for new members." },
{ question: "Are personal training sessions available?", answer: "Yes, book 1-on-1 sessions with top trainers." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function FitnessSite() {
const router = useRouter();
const [classes, setClasses] = useState<any[]>([]);
const [trainers, setTrainers] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setClasses(store.classes);
setTrainers(store.trainers);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

return ( <div className="space-y-24 font-sans">
 {/* Hero Banner  */}
<motion.section
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 1 }}
className="relative h-[75vh] bg-gradient-to-br from-black via-gray-800 to-black flex items-center justify-center overflow-hidden"
>
<Image
       src={store.bannerUrl}
       alt="Fitness Hero"
       fill
       loader={loader}
       className="object-cover opacity-40"
     /> <div className="relative z-10 text-center px-6 max-w-2xl text-white">
<motion.h1
initial={{ y: -40 }} animate={{ y: 0 }} transition={{ delay: 0.4 }}
className="text-5xl md\:text-7xl font-bold mb-4 drop-shadow-lg"
>
{store.name}
</motion.h1>
<motion.p
initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
className="text-lg md\:text-xl mb-8"
>
{ "Achieve your peak performance with our expert-led fitness classes."}
{/* store?.description || */}
</motion.p>
<motion.button
whileHover={{ scale: 1.05 }}
className="bg-green-500 hover\:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition"
onClick={() => router.push(`/${store.slug}/classes`)}
>
View Classes
</motion.button> </div>
</motion.section>


  {/* Popular Classes */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Popular Classes
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map((cls, i) => (
          <motion.div
            key={cls.id}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
            onClick={() => router.push(`/${store.slug}/class/${cls.slug}`)}
          >
            <div className="relative h-56">
              <Image src={cls.imageUrl} alt={cls.name} fill loader={loader} className="object-cover" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{cls.name}</h3>
              <p className="text-green-600 font-bold">KES {cls.price.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Meet Our Trainers */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Meet Our Trainers
      </motion.h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {trainers.map((tr, i) => (
          <motion.div key={tr.id} whileHover={{ scale: 1.05 }} className="text-center">
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg mb-4">
              <Image src={tr.imageUrl} alt={tr.name} fill loader={loader} className="object-cover" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{tr.name}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Success Stories */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
        Success Stories
      </motion.h2>
      <div className="max-w-3xl mx-auto space-y-8">
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
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 max-w-2xl">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
        FAQs
      </motion.h2>
      <div className="space-y-6">
        {faqs.map((q, i) => (
          <motion.details key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + 0.1 * i }} className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer">
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
