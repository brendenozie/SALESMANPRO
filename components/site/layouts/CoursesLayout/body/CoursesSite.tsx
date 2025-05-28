import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

// Components
const Hero = ({ bannerUrl, name, slug }:any) => {
  const router = useRouter();
  return  (
  <section className="relative h-[80vh] flex items-center justify-center text-white overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 opacity-80" />
    <Image
      src={bannerUrl}
      alt="Courses Hero"
      fill
      className="object-cover opacity-30"
      priority
      loader={loader}
    />
    <div className="relative z-10 text-center px-6 max-w-2xl">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
      >
        Welcome to {name}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg md:text-xl mb-8"
      >
        Empower yourself with expertly crafted courses across in-demand skills.
      </motion.p>
      <motion.button
        onClick={() => router.push(`/${slug}/courses`)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-xl hover:scale-105 transition-transform"
      >
        Browse Courses
      </motion.button>
    </div>
  </section>
)};

const CategoryCard = ({ cat, slug }:any) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer group"
  >
    <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform" loader={loader} />
    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
    </div>
    <Link href={`/${slug}/category/${cat.slug}`} className="absolute inset-0" />
  </motion.div>
);

const CourseCard = ({ course, slug }:any) => (
  <motion.div
    whileHover={{ y: -10, boxShadow: '0px 15px 30px rgba(0,0,0,0.2)' }}
    transition={{ type: 'tween' }}
    className="bg-white rounded-3xl overflow-hidden shadow-lg cursor-pointer"
  >
    <Link href={`/${slug}/course/${course.slug}`}>      
      <div className="relative h-60">
        <Image src={course.imageUrl} alt={course.name} fill className="object-cover" loader={loader}/>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold mb-2 text-gray-900 hover:text-purple-600 transition-colors">
          {course.name}
        </h3>
        <p className="text-indigo-600 font-bold">KES {course.price.toLocaleString()}</p>
      </div>
    </Link>
  </motion.div>
);

const FAQItem = ({ faq }:any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="mb-4"
  >
    <details className="bg-white p-6 rounded-2xl shadow-lg">
      <summary className="font-semibold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors">
        {faq.question}
      </summary>
      <p className="mt-2 text-gray-600">{faq.answer}</p>
    </details>
  </motion.div>
);

export default function CoursesSite() {
  const router = useRouter();
  const [categories, setCategories] = useState<any>([]);
  const [featured, setFeatured] = useState<any>([]);
  const [faqs, setFaqs] = useState<any>([]);

  useEffect(() => {
    setCategories(store.categories);
    setFeatured(store.featuredCourses);
    setFaqs(store.faqs);
  }, []);

  return (
    <div className="space-y-32 font-sans">
      <Hero bannerUrl={store.bannerUrl} name={store.name} slug={store.slug} />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500"
          >
            Browse by Category
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {categories.map((cat:any) => <CategoryCard key={cat.id} cat={cat} slug={store.slug} />)}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500"
          >
            Featured Courses
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featured.map((course:any) => <CourseCard key={course.id} course={course} slug={store.slug} />)}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold mb-12"
          >
            Student Success Stories
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-3xl mx-auto"
          >
            {/* Could replace with a carousel library */}
            {store.testimonials.map((t:any, i:any) => (
              <blockquote key={i} className="italic text-gray-700 text-lg mb-6">
                “{t.quote}”
                <span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
              </blockquote>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-10"
          >
            Frequently Asked Questions
          </motion.h2>
          {faqs.map((faq:any, i :any) => <FAQItem key={i} faq={faq} />)}
        </div>
      </section>

      <footer className="py-12 bg-indigo-900 text-white text-center">
        <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
