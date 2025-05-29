import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { InboxIcon } from "@heroicons/react/24/outline";


// Sample Data
const store = {
  name: "Pulse Media",
  slug: "pulse-media",
  description: "Your hub for inspiring stories, videos, and insights.",
  heroSlides: [
    { imageUrl: "/images/media-hero.jpg", headline: "Stay Informed", subline: "Latest news & features" },
  ],
  categories: [
    { id: 1, name: "News", slug: "news" },
    { id: 2, name: "Entertainment", slug: "entertainment" },
    { id: 3, name: "Tech", slug: "tech" },
    { id: 4, name: "Lifestyle", slug: "lifestyle" },
  ],
  featuredArticles: [
    { id: "a1", name: "Future of AI", subtitle: "How AI is reshaping industries", imageUrl: "/articles/ai.jpg", slug: "future-of-ai" },
    { id: "a2", name: "Travel Trends 2025", subtitle: "Top destinations you must see", imageUrl: "/articles/travel.jpg", slug: "travel-trends-2025" },
  ],
  latestVideos: [
    { id: "v1", imageUrl: "/videos/video1.jpg", ctaLink: "/video/v1" },
    { id: "v2", imageUrl: "/videos/video2.jpg", ctaLink: "/video/v2" },
    { id: "v3", imageUrl: "/videos/video3.jpg", ctaLink: "/video/v3" },
    { id: "v4", imageUrl: "/videos/video4.jpg", ctaLink: "/video/v4" },
  ],
  faqs: [
    { question: "How do I submit content?", answer: "Use the contributor portal to pitch your article or video." },
    { question: "Is subscription required?", answer: "No, all content is free to access." },
  ],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MediaSite() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCategories(store.categories);
    setFeatured(store.featuredArticles);
    setVideos(store.latestVideos);
    setFaqs(store.faqs);
  }, []);

  return (
    <div className="space-y-20 font-sans">
      {/* Hero */}
      <MediaHeroSection
        store={store}
        loader={loader}
        onPlay={(slide: any) => router.push(`/${store.slug}/video/${slide.slug}`)}
      />

      {/* Top Picks Carousel */}
      <TopPicksCarousel
        picks={[
          { id: "p1", title: "Top Story of the Week", description: "An in-depth look at the biggest news story.", imageUrl: "/images/top-pick1.jpg", ctaLink: "/article/top-story" },
          { id: "p2", title: "Must-Watch Documentary", description: "Exploring the impact of climate change.", imageUrl: "/images/top-pick2.jpg", ctaLink: "/video/documentary" },
          { id: "p3", title: "Tech Innovations 2025", description: "The latest breakthroughs in technology.", imageUrl: "/images/top-pick3.jpg", ctaLink: "/article/tech-innovations" },
        ]}
        loader={loader}
      />
      
      {/* Categories */}
      <EnhancedCategoriesSection categories={store.categories} loader={loader} />

      {/* Latest Releases */}
      <LatestReleasesSection
        releases={[
          { id: "r1", title: "Breaking News", imageUrl: "/images/release1.jpg", releaseDate: "2025-01-01", ctaLink: "/news/breaking" },
          { id: "r2", title: "New Podcast Episode", imageUrl: "/images/release2.jpg", releaseDate: "2025-01-02", ctaLink: "/podcast/episode1" },
          { id: "r3", title: "Feature Article", imageUrl: "/images/release3.jpg", releaseDate: "2025-01-03", ctaLink: "/article/feature" },
        ]}
        loader={loader}
        onPlay={(item:any) => router.push(item.ctaLink)}
      />

      {/* Testimonials */}
      <TestimonialsSlider
        testimonials={[
          { avatarUrl: "/images/avatar1.jpg", quote: "Amazing service!", author: "John Doe" },
          { avatarUrl: "/images/avatar2.jpg", quote: "I love this platform!", author: "Jane Smith" },
          { avatarUrl: "/images/avatar3.jpg", quote: "Highly recommend to everyone.", author: "Alice Johnson" },
        ]}
        loader={loader}
      />

      {/* Featured Articles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-8 text-gray-800"
          >Featured Articles</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featured.map((art) => (
              <motion.div
                key={art.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                onClick={() => router.push(`/${store.slug}/article/${art.slug}`)}
              >
                <div className="relative h-64">
                  <Image src={art.imageUrl} alt={art.name} fill className="object-cover" loader={loader} />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{art.name}</h3>
                  <p className="text-gray-600">{art.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Videos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-8 text-gray-800"
          >Latest Videos</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {videos.map((vid) => (
              <motion.div
                key={vid.id}
                whileHover={{ scale: 1.05 }}
                className="relative pb-[56.25%] bg-black rounded-xl overflow-hidden cursor-pointer"
                onClick={() => router.push(vid.ctaLink)}
              >
                <Image src={vid.imageUrl} alt="Video" fill className="object-cover absolute inset-0" loader={loader} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white bg-opacity-80 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSignup />

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-10 text-gray-800"
          >FAQs</motion.h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-xl cursor-pointer"
              >
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


function MediaHeroSection({ store, loader, onPlay }:any) {
  const slide = store.heroSlides[0];

  return (
    <section
      className="relative h-screen bg-black text-white flex items-center justify-center overflow-hidden"
      role="region"
      aria-label="Featured Content Hero"
    >
      {/* Background Video/Image Layer */}
      {slide.videoUrl ? (
        <motion.video
          src={slide.videoUrl}
          autoPlay
          muted
          loop
          className="absolute inset-0 object-cover w-full h-full brightness-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      ) : (
        <Image
          src={slide.imageUrl}
          alt={slide.headline}
          fill
          className="absolute inset-0 object-cover w-full h-full brightness-50"
          loader={loader}
          priority
        />
      )}

      {/* Overlay Content */}
      <motion.div
        className="relative z-10 text-center px-6 md:px-12 max-w-3xl space-y-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-xl">
          {slide.headline}
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
          {slide.subline}
        </p>

        {/* Play Trailer Button */}
        <motion.button
          onClick={() => onPlay(slide)}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
          aria-label="Play Trailer"
        >
          <PlayIcon className="h-6 w-6" />
          Play Trailer
        </motion.button>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 flex flex-col items-center space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <ChevronDownIcon className="h-6 w-6 text-white/70 animate-bounce" />
        <span className="text-sm text-white/70">Scroll to Explore</span>
      </motion.div>
    </section>
  );
}

function TopPicksCarousel({ picks, loader }:any) {
  const [current, setCurrent] = React.useState(0);
  const length = picks.length;

  const prevSlide = () => setCurrent((current - 1 + length) % length);
  const nextSlide = () => setCurrent((current + 1) % length);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-8">
          Top Picks
        </h2>

        <div className="relative overflow-hidden">
          {/* Slides */}
          <AnimatePresence initial={false}>
            {picks.map((item :any, index :any) =>
              index === current && (
                <motion.div
                  key={item.id}
                  className="absolute inset-0 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                  {/* Image */}
                  <div className="w-full md:w-1/2 h-64 md:h-96 relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover rounded-2xl shadow-lg"
                      loader={loader}
                      priority
                    />
                  </div>

                  {/* Info */}
                  <div className="mt-6 md:mt-0 md:ml-10 max-w-md text-center md:text-left space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                    <motion.button
                      onClick={() => window.location.href = item.ctaLink}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-full shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
                      aria-label={`Watch ${item.title}`}
                    >
                      Watch Now
                      <ChevronRightIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* Controls */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </button>
        </div>
      </div>
    </section>
  );
}

function EnhancedCategoriesSection({ categories, loader }:any) {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Explore Categories
        </h2>

        {/* Categories Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat:any) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => window.location.href = `/site/${cat.slug}`}
            >
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover w-full h-full brightness-75"
                loader={loader}
                priority
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 flex items-center">
                <span className="text-lg md:text-xl font-semibold text-white">
                  {cat.name}
                </span>
                <ChevronRightIcon className="h-6 w-6 text-white ml-2" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestReleasesSection({ releases, loader, onPlay }:any) {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Latest Releases
        </h2>

        {/* Responsive Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {releases.map((item:any) => (
            <motion.div
              key={item.id}
              className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 250 }}
            >
              {/* Thumbnail */}
              <div className="w-full h-56 relative">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  loader={loader}
                  priority
                />
              </div>

              {/* Info Overlay */}
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.releaseDate}
                </p>

                {/* Play Button */}
                <motion.button
                  onClick={() => onPlay(item)}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  aria-label={`Play ${item.title}`}
                >
                  <PlayIcon className="h-5 w-5" />
                  Play
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSlider({ testimonials, loader }:any) {
  const [idx, setIdx] = React.useState(0);
  const len = testimonials.length;

  const prev = () => setIdx((idx - 1 + len) % len);
  const next = () => setIdx((idx + 1) % len);

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-8">
          What the Critics Say
        </h2>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {testimonials.map((t:any, i:any) =>
              i === idx && (
                <motion.div
                  key={i}
                  className="bg-gray-50 dark:bg-gray-800 p-8 rounded-3xl shadow-lg text-center"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  {t.avatarUrl && (
                    <div className="mx-auto w-20 h-20 rounded-full overflow-hidden mb-4">
                      <Image src={t.avatarUrl} alt={t.author} width={80} height={80} className="object-cover" loader={loader} />
                    </div>
                  )}
                  <p className="italic text-gray-700 dark:text-gray-200 mb-4">“{t.quote}”</p>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 block">— {t.author}</span>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* Controls */}
          <button
            onClick={prev}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
            aria-label="Previous review"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
            aria-label="Next review"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </button>
        </div>
      </div>
    </section>
  );
}

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    // Integrate with API or service
    setSubmitted(true);
  };

  return (
    <section className="py-16 bg-indigo-600 text-white">
      <div className="container mx-auto px-6 text-center max-w-xl">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Join Our Newsletter
        </motion.h2>
        <motion.p
          className="mb-8 text-indigo-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Get the latest updates on new releases, articles, and exclusive content.
        </motion.p>

        {submitted ? (
          <motion.div
            className="bg-indigo-700 rounded-full py-3 px-6 inline-block"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            Thank you for subscribing!
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative w-full sm:w-auto flex-1">
              <InboxIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Your email address"
                className="w-full sm:w-80 pl-10 pr-4 py-3 rounded-full bg-indigo-500 placeholder-indigo-200 text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
            >
              Subscribe
            </motion.button>
          </form>
        )}
      </div>
    </section>
  );
}
