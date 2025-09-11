"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid"; // Added for scroll-to-top
import { useStoreContext } from "../../../../../contexts/StoreContext";

// Import your enhanced child components
import MediaHeroSection from "./components/HeroSection";
import EnhancedCategoriesSection from "./components/EnhancedCategoriesSection";
import LatestReleasesSection from "./components/LatestReleasesSection";
import TestimonialsSlider from "./components/TestimonialsSliderSection";
import FeaturedArticlesSection from "./components/FeaturedArticlesSection";
import LatestVideosSection from "./components/LatestVideosSection";
import NewsletterSignup from "./components/NewsletterSignupSection";
import FAQsSection from "./components/FAQsSection";
import TopPicksCarousel from "./components/TopPicksCarouselSection"; // Assuming this is also enhanced

// --- Mock Data for Demonstration (mimicking storeFormData structure) ---
const mockStoreData : any= {
  name: "Pulse Media",
  slug: "pulse-media",
  description: "Your hub for inspiring stories, videos, and insights.",
  heroSlides: [
    { id: "h1", imageUrl: "/images/media-hero.jpg", headline: "Unleash Your Story", subline: "Discover captivating content, tailored just for you.", slug: "intro-video" },
    { id: "h2", imageUrl: "/images/media-hero-2.jpg", headline: "Beyond the Headlines", subline: "Dive deep into exclusive features and interviews.", slug: "behind-scenes" },
    { id: "h3", imageUrl: "/images/media-hero-3.jpg", headline: "Future of Entertainment", subline: "Explore cutting-edge tech and emerging trends.", slug: "tech-future" },
  ],
  StoreCategory: [ // Renamed to match the context variable name
    { id: "cat1", name: "News & Current Events", slug: "news", icon: "AcademicCapIcon" },
    { id: "cat2", name: "Entertainment & Culture", slug: "entertainment", icon: "PlayCircleIcon" },
    { id: "cat3", name: "Technology & Innovation", slug: "tech", icon: "BanknotesIcon" },
    { id: "cat4", name: "Lifestyle & Wellness", slug: "lifestyle", icon: "HeartIcon" },
    { id: "cat5", name: "Sports & Gaming", slug: "sports", icon: "ClipboardDocumentListIcon" },
  ],
  latestReleases: [
    { id: "lr1", title: "The Silent Echo: A Sci-Fi Thriller", imageUrl: "/images/releases/release1.jpg", releaseDate: "July 1, 2025", slug: "silent-echo", videoSlug: "silent-echo-trailer", genre: "Sci-Fi Thriller" },
    { id: "lr2", title: "Code Breakers: Season 2 Premiere", imageUrl: "/images/releases/release2.jpg", releaseDate: "June 25, 2025", slug: "code-breakers-s2", videoSlug: "code-breakers-s2-ep1", genre: "Tech Drama" },
    { id: "lr3", title: "Eco Warriors: Documentary Series", imageUrl: "/images/releases/release3.jpg", releaseDate: "June 18, 2025", slug: "eco-warriors", videoSlug: "eco-warriors-ep3", genre: "Documentary" },
    { id: "lr4", title: "Galactic Frontier: Game Review", imageUrl: "/images/releases/release4.jpg", releaseDate: "June 10, 2025", slug: "galactic-frontier", videoSlug: "galactic-frontier-gameplay", genre: "Gaming" },
  ],
  testimonials: [
    { id: "t1", quote: "Pulse Media delivers unparalleled insights. A truly essential platform!", author: "Dr. Evelyn Reed", source: "Tech Insights Weekly", avatarUrl: "/images/avatars/critic1.jpg", rating: 5, mediaTitle: "Future of AI", mediaSlug: "future-of-ai" },
    { id: "t2", quote: "The video quality and depth of content are simply phenomenal.", author: "Marcus 'GameOn' Vance", source: "Gamer's Edge", avatarUrl: "/images/avatars/critic2.jpg", rating: 4, mediaTitle: "Gaming Marathon Highlights", mediaSlug: "gaming-highlights" },
    { id: "t3", quote: "Finally, a media hub that truly understands its audience.", author: "Sarah Jenkins", source: "Lifestyle Living Blog", avatarUrl: "/images/avatars/critic3.jpg", rating: 5, mediaTitle: "Travel Trends 2025", mediaSlug: "travel-trends-2025" },
  ],
  featuredArticles: [
    { id: "a1", name: "The AI Revolution: What's Next?", subtitle: "Explore the cutting-edge advancements in artificial intelligence.", imageUrl: "/images/articles/ai.jpg", slug: "future-of-ai", publishDate: "July 10, 2025", category: "Technology", author: "Dr. Anya Sharma" },
    { id: "a2", name: "2025 Travel Hotspots: Your Next Adventure Awaits", subtitle: "Discover the top destinations and unique experiences for your travels.", imageUrl: "/images/articles/travel.jpg", slug: "travel-trends-2025", publishDate: "July 5, 2025", category: "Lifestyle", author: "Mark Davison" },
    { id: "a3", name: "From Pixels to Profits: The Evolving World of Esports", subtitle: "A deep dive into the business and culture of competitive gaming.", imageUrl: "/images/articles/gaming.jpg", slug: "esports-evolution", publishDate: "June 28, 2025", category: "Gaming", author: "Chloe Park" },
  ],
  latestVideos: [
    { id: "v1", title: "Exclusive Interview: Director James Cameron on Avatar 3", imageUrl: "/images/videos/video1.jpg", ctaLink: "/video/director-interview", duration: "18:30", views: "1.5M", category: "Interview" },
    { id: "v2", title: "Behind the Scenes: Crafting the 'Cosmic Echo' Visuals", imageUrl: "/images/videos/video2.jpg", ctaLink: "/video/cosmic-echo-bts", duration: "10:15", views: "800K", category: "Behind the Scenes" },
    { id: "v3", title: "Top 5 Tech Innovations of the Decade", imageUrl: "/images/videos/video3.jpg", ctaLink: "/video/tech-innovations", duration: "07:45", views: "2.1M", category: "Technology" },
    { id: "v4", title: "Fitness Unlocked: The Home Workout Revolution", imageUrl: "/images/videos/video4.jpg", ctaLink: "/video/home-workout", duration: "05:20", views: "450K", category: "Lifestyle" },
  ],
  faqs: [
    { id: "faq1", question: "How do I submit content to Pulse Media?", answer: "We're always looking for fresh perspectives! Please visit our 'Contribute' page where you'll find detailed guidelines and a submission portal for articles, videos, and story pitches." },
    { id: "faq2", question: "Is a subscription required to access content on Pulse Media?", answer: "No, the majority of our content is free to access without any subscription. We aim to make quality media accessible to everyone. Premium tiers or exclusive content series may be introduced in the future." },
    { id: "faq3", question: "How often is new content released?", answer: "We strive to update our platform daily with new articles and release fresh video content several times a week. For real-time updates, we highly recommend subscribing to our newsletter!" },
    { id: "faq4", question: "Can I download videos for offline viewing?", answer: "Currently, our platform supports streaming only, and offline downloads are not available. However, we are actively exploring this feature and hope to offer it in a future update." },
    { id: "faq5", question: "How can I contact Pulse Media for partnerships or press inquiries?", answer: "For partnerships, advertising, or press-related inquiries, please use the contact form on our 'About Us' page, or email us directly at partnerships@pulsemedia.com." },
  ],
  topPicks: [
    { id: "tp1", title: "The Quantum Enigma", description: "Our most anticipated sci-fi series with mind-bending plots.", imageUrl: "/images/toppicks/pick1.jpg", ctaLink: "/series/quantum-enigma", type: "Series" },
    { id: "tp2", title: "The Art of Storytelling with Director Lena Khan", description: "An exclusive masterclass interview on cinematic narrative.", imageUrl: "/images/toppicks/pick2.jpg", ctaLink: "/interview/lena-khan", type: "Interview" },
    { id: "tp3", title: "Beyond the Algorithm: Human Creativity in the AI Age", description: "A thought-provoking article on the future of creative industries.", imageUrl: "/images/toppicks/pick3.jpg", ctaLink: "/article/human-creativity-ai", type: "Article" },
  ]
};
// --- End Mock Data ---


export default function MediaSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  // State to hold data, falling back to mockData if context data isn't ready
  const [dataReady, setDataReady] = useState(false);
  const [displayData, setDisplayData] = useState<typeof mockStoreData | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    // Simulate loading/fetching storeFormData if it's not immediately available
    // In a real app, storeFormData would likely come from an async fetch
    if (storeFormData && Object.keys(storeFormData).length > 0) {
      setDisplayData(storeFormData as unknown as typeof mockStoreData); // Cast if context type is less specific
    } else {
      // Use mock data if context isn't ready or empty, for consistent display
      setDisplayData(mockStoreData);
    }
    setDataReady(true);
  }, [storeFormData]); // Dependency array ensures effect runs when storeFormData changes

  // Scroll-to-top button logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) { // Show button after scrolling down 300px
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll animation
    });
  };

  if (!dataReady || !displayData) {
    // Visually appealing loading state
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black to-gray-950 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold flex items-center gap-4"
        >
          <motion.svg
            className="w-10 h-10 text-red-600 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </motion.svg>
          Loading Pulse Media...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-24 bg-black font-sans text-white relative"> {/* Increased space-y, set global background */}
      {/* Hero Section */}
      <MediaHeroSection
        store={displayData}
        onPlay={(slide: any) =>
          router.push(`/${displayData.slug}/video/${slide.slug}`)
        }
      />

      {/* Categories Section */}
      <EnhancedCategoriesSection
        categories={displayData.StoreCategory}
        slug={displayData.slug}
      />

      {/* Top Picks Carousel */}
      <TopPicksCarousel
        picks={displayData.topPicks}
        // Assuming TopPicksCarousel might also have an onPlay or onClick for navigation
        onSelect={(item: any) => router.push(item.ctaLink)}
      />

      {/* Latest Releases Section */}
      <LatestReleasesSection
        releases={displayData.latestReleases}
        onPlay={(item: any) => router.push(item.videoSlug ? `/${displayData.slug}/video/${item.videoSlug}` : `/${displayData.slug}/media/${item.slug}`)}
      />

      {/* Featured Articles Section */}
      <FeaturedArticlesSection
        featured={displayData.featuredArticles || displayData.blogs}
        storeSlug={displayData.slug}
      />

      {/* Latest Videos Section */}
      <LatestVideosSection
        videos={displayData.latestVideos}
      />

      {/* Testimonials Slider */}
      <TestimonialsSlider
        testimonials={displayData.testimonials}
      />

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* FAQs Section */}
      <FAQsSection
        faqs={displayData.faqs}
      />

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            className="fixed bottom-6 right-6 p-3 rounded-full bg-red-600 text-white shadow-lg z-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            aria-label="Scroll to top"
          >
            <ArrowUpCircleIcon className="h-8 w-8" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}