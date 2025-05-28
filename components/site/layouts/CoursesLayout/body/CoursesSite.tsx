import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
name: "SkillForge Academy",
slug: "skillforge",
bannerUrl: "/images/courses-hero.jpg",
categories: [
{ id: 1, name: "Development", slug: "development", imageUrl: "/categories/dev.jpg" },
{ id: 2, name: "Design", slug: "design", imageUrl: "/categories/design.jpg" },
{ id: 3, name: "Marketing", slug: "marketing", imageUrl: "/categories/marketing.jpg" },
{ id: 4, name: "Business", slug: "business", imageUrl: "/categories/business.jpg" },
],
featuredCourses: [
{ id: "c1", name: "React Mastery", price: 2500, imageUrl: "/courses/react.jpg", slug: "react-mastery" },
{ id: "c2", name: "UX/UI Essentials", price: 2000, imageUrl: "/courses/ux.jpg", slug: "ux-ui-essentials" },
{ id: "c3", name: "Digital Marketing 101", price: 1800, imageUrl: "/courses/marketing.jpg", slug: "digital-marketing-101" },
],
testimonials: [
{ quote: "SkillForge transformed my career!", author: "Emily R." },
{ quote: "Engaging content and top-notch instructors.", author: "Mark S." },
{ quote: "I landed a job thanks to these courses.", author: "Sara L." },
],
faqs: [
{ question: "Are courses self-paced?", answer: "Yes, learn at your own schedule with lifetime access." },
{ question: "Do you offer certificates?", answer: "All courses come with verifiable certificates." },
{ question: "Is there a refund policy?", answer: "30-day money-back guarantee if you’re not satisfied." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function CoursesSite() {
const router = useRouter();
const [categories, setCategories] = useState<any[]>([]);
const [featured, setFeatured] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setCategories(store.categories);
setFeatured(store.featuredCourses);
setFaqs(store.faqs);
}, []);

return ( <div className="space-y-24 font-sans">
 {/* Hero  */}
<section className="relative h-[70vh] bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-center justify-center text-white overflow-hidden"> <Image
       src={store.bannerUrl}
       alt="Courses Hero"
       fill
       className="object-cover opacity-30"
       loader={loader}
     /> <div className="relative z-10 text-center px-6 max-w-xl">
<motion.h1
initial={{ y: -40, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.8 }}
className="text-5xl md\:text-7xl font-bold mb-4 leading-tight"
>
Welcome to {store.name}
</motion.h1>
<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.4 }}
className="text-lg md\:text-xl mb-8"
>
Empower yourself with expertly crafted courses across in-demand skills.
</motion.p>
<motion.button
onClick={() => router.push(`/${store.slug}/courses`)}
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ delay: 0.6 }}
className="bg-white text-indigo-900 font-semibold py-3 px-8 rounded-full shadow-lg hover\:shadow-2xl transition"
>
Browse Courses
</motion.button> </div> </section>


  {/* Categories */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-center mb-12 text-gray-800"
      >
        Browse by Category
      </motion.h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="overflow-hidden rounded-2xl shadow-lg cursor-pointer"
            onClick={() => router.push(`/${store.slug}/category/${cat.slug}`)}
          >
            <div className="relative h-40">
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover"
                loader={loader}
              />
            </div>
            <div className="p-4 text-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">{cat.name}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Featured Courses */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-center mb-12 text-gray-800"
      >
        Featured Courses
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {featured.map((course, i) => (
          <motion.div
            key={course.id}
            whileHover={{ y: -10 }}
            transition={{ type: 'tween' }}
            className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
            onClick={() => router.push(`/${store.slug}/course/${course.slug}`)}
          >
            <div className="relative h-52">
              <Image
                src={course.imageUrl}
                alt={course.name}
                fill
                className="object-cover"
                loader={loader}
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">{course.name}</h3>
              <p className="text-indigo-600 font-bold">KES {course.price.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Testimonials */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold mb-12 text-gray-800"
      >
        Student Success Stories
      </motion.h2>
      <div className="max-w-3xl mx-auto space-y-8">
        {store.testimonials.map((t, i) => (
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

  {/* FAQs */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 max-w-3xl">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-center mb-10 text-gray-800"
      >
        Frequently Asked Questions
      </motion.h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <motion.details
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer"
          >
            <summary className="font-semibold text-gray-800">{faq.question}</summary>
            <p className="mt-2 text-gray-600">{faq.answer}</p>
          </motion.details>
        ))}
      </div>
    </div>
  </section>
</div>


);
}
