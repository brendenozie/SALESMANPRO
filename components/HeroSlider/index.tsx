import React,{ useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import homeBanner from '../../assets/asset3.png'
import Image from "next/image";




// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


// Type definitions
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  themeSettings: any;
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface HeroSliderProps {
  store: Store;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ store }) => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % store.heroSlides.length);
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const goTo = (idx: number) => {
    clearTimeout(timeoutRef.current);
    setCurrent(idx);
  };

  const prev = () => goTo((current - 1 + store.heroSlides.length) % store.heroSlides.length);
  const next = () => goTo((current + 1) % store.heroSlides.length);

  return (
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence>
        {store.heroSlides.map((slide, i) =>
          i === current ? (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={slide.imageUrl ?? homeBanner.src}
                alt={slide.headline ?? "banner image"}
                fill
                className="object-cover"
                loader={loader}
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start px-6 md:px-16 text-white">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl mb-2"
                >
                  {slide.subline}
                </motion.p>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl md:text-5xl font-bold mb-4"
                >
                  {slide.headline}
                </motion.h2>
                <motion.a
                  href={slide.ctaLink}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="inline-block bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg text-white font-medium"
                >
                  {slide.ctaText}
                </motion.a>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
        aria-label="Previous slide"
      >
        <ArrowLeftIcon />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
        aria-label="Next slide"
      >
        <ArrowRightIcon />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {store.heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-3 h-3 rounded-full transition ${
              idx === current ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSlider;
