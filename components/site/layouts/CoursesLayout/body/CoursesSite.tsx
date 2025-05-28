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


const Hero = ({ bannerUrl, name, slug }: any) => {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 opacity-80 z-0" />
        <Image
          src={bannerUrl}
          alt={`${name} Hero Banner`}
          fill
          className="object-cover object-center opacity-40"
          priority
          loader={loader} 
        />

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.h1
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-bold mb-4 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300"
          >
            Unlock Your Potential at {name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-100 mb-6"
          >
            Explore expertly crafted courses designed to shape future leaders and innovators.
          </motion.p>

          <motion.button
            onClick={() => router.push(`/${slug}/courses`)}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            Explore Courses
          </motion.button>
        </div>

        {/* SVG Wave Divider */}
        {/* SVG Wave Divider */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none z-10">
          <svg
            className="relative block w-full h-[100px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,224L80,218.7C160,213,320,203,480,176C640,149,800,107,960,117.3C1120,128,1280,192,1360,224L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>

      </section>

      {/* Stats / Testimonials */}
      <section className="bg-white py-12 text-gray-800 text-center">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-4xl font-bold text-indigo-700">25K+</h3>
            <p className="mt-2 text-lg font-medium">Students Enrolled</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-indigo-700">1,200+</h3>
            <p className="mt-2 text-lg font-medium">Courses Available</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-indigo-700">98%</h3>
            <p className="mt-2 text-lg font-medium">Student Satisfaction</p>
          </div>
        </div>
        {/* Optional: Testimonials */}
        <div className="mt-12 max-w-3xl mx-auto text-gray-600 italic">
          <p>
            “This platform helped me land my dream job after completing the data science program.
            The instructors were world-class!”
          </p>
          <p className="mt-2 font-semibold text-indigo-600">— Amina K., Graduate</p>
        </div>
      </section>
    </div>
  );
};

const CategoryCard = ({ cat, slug }: any) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 220, damping: 18 }}
    className="relative rounded-xl overflow-hidden shadow-xl group cursor-pointer"
  >
    <Image
      src={cat.imageUrl}
      alt={cat.name}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-110"
      loader={loader}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex items-end justify-center p-4 transition-opacity duration-300 group-hover:bg-black/50">
      <h3 className="text-lg md:text-xl font-semibold text-white text-center drop-shadow-md">
        {cat.name}
      </h3>
    </div>
    <Link href={`/${slug}/category/${cat.slug}`} className="absolute inset-0 z-10" />
  </motion.div>
);

const CourseCard = ({ course, slug }: any) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 220, damping: 20 }}
    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
  >
    <Link href={`/${slug}/course/${course.slug}`}>
      <div className="relative h-56 w-full">
        <Image
          src={course.imageUrl}
          alt={course.name}
          fill
          className="object-cover"
          loader={loader}
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors duration-200">
          {course.name}
        </h3>
        <p className="text-sm text-gray-500 mb-1 truncate">{course.shortDescription}</p>
        <p className="text-indigo-600 font-bold mt-2">
          KES {course.price.toLocaleString()}
        </p>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"
          >
            Browse by Category
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {store.categories.map((cat: any) => (
              <CategoryCard key={cat.id} cat={cat} slug={store.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-100">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          >
            Featured Courses
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((course: any) => (
              <CourseCard key={course.id} course={course} slug={store.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
  <div className="container mx-auto px-6 text-center">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl md:text-5xl font-extrabold mb-14 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
    >
      Student Success Stories
    </motion.h2>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid gap-8 max-w-4xl mx-auto md:grid-cols-2"
    >
      {store.testimonials.map((t: any, i: number) => (
        <blockquote
          key={i}
          className="relative bg-white rounded-2xl shadow-md p-6 text-left border-l-4 border-indigo-500"
        >
          <p className="text-gray-700 italic mb-4">“{t.quote}”</p>
          <div className="text-sm font-semibold text-gray-900">— {t.author}</div>
        </blockquote>
      ))}
    </motion.div>
  </div>
</section>

<section className="relative py-20 bg-gradient-to-b from-white to-gray-50">
  <div className="container mx-auto px-6 text-center">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl md:text-5xl font-extrabold mb-14 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
    >
      Student Success Stories
    </motion.h2>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid gap-8 max-w-4xl mx-auto md:grid-cols-2"
    >
      {store.testimonials.map((t: any, i: number) => (
        <blockquote
          key={i}
          className="relative bg-white rounded-2xl shadow-md p-6 text-left border-l-4 border-indigo-500"
        >
          <p className="text-gray-700 italic mb-4">“{t.quote}”</p>
          <div className="text-sm font-semibold text-gray-900">— {t.author}</div>
        </blockquote>
      ))}
    </motion.div>
  </div>

  {/* CTA Divider */}
  <div className="mt-24 relative z-10">
    <svg
      className="absolute top-0 left-0 w-full -mt-1"
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
    >
      <path
        fill="#4f46e5"
        d="M0,64L80,69.3C160,75,320,85,480,85.3C640,85,800,75,960,64C1120,53,1280,43,1360,37.3L1440,32V100H0Z"
      ></path>
    </svg>

    {/* CTA Section */}
    <div className="bg-indigo-600 text-white py-16 px-6 text-center relative z-10">
      <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Write Your Own Success Story?</h3>
      <p className="text-lg mb-8 max-w-2xl mx-auto">
        Join thousands of learners transforming their careers through our expert-led courses.
      </p>
      <Link
        href="/courses"
        className="inline-block bg-white text-indigo-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-100 transition"
      >
        Browse Courses
      </Link>
    </div>
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
