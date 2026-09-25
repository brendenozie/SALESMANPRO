'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid"; // Added for scroll-to-top
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

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

// Default empty data structure matching storeFormData
const defaultStoreData: any = {
  name: "Media & Entertainment",
  slug: "",
  description: "Explore our latest video releases, photo galleries, and editorial features.",
  heroSlides: [],
  StoreCategory: [],
  latestReleases: [],
  testimonials: [],
  featuredArticles: [],
  latestVideos: [],
  faqs: [],
  topPicks: []
};

export default function MediaSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  const [displayData, setDisplayData] = useState<any>(() => {
    return (pageData && Object.keys(pageData).length > 0) ? pageData : defaultStoreData;
  });
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    if (pageData && Object.keys(pageData).length > 0) {
      setDisplayData((prev: any) => ({
        ...prev,
        ...pageData,
      }));
    }

    // Fetch live media content for this tenant if not already present
    const cid = companyId || pageData?.id || (pageData as any)?.companyId;
    if (cid) {
      fetch(`/api/admin/content?companyId=${cid}&limit=12`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            const liveContent = data.data;
            setDisplayData((prev: any) => ({
              ...prev,
              latestVideos: prev.latestVideos?.length > 0 ? prev.latestVideos : liveContent.filter((c: any) => c.type === 'VIDEO').map((v: any) => ({
                id: v.id,
                title: v.title,
                imageUrl: v.mediaAsset?.thumbnailUrl || v.mediaAsset?.url || '/images/default-video.jpg',
                ctaLink: `/site/${pageData?.slug || ''}/media/products/${v.id}`,
                duration: v.duration || 'Feature',
                category: v.type || 'Video'
              })),
              latestReleases: prev.latestReleases?.length > 0 ? prev.latestReleases : liveContent.map((c: any) => ({
                id: c.id,
                title: c.title,
                imageUrl: c.mediaAsset?.thumbnailUrl || c.mediaAsset?.url || '/images/default-media.jpg',
                releaseDate: new Date(c.createdAt).toLocaleDateString(),
                slug: `products/${c.id}`,
                genre: c.type || 'Media'
              })),
              topPicks: prev.topPicks?.length > 0 ? prev.topPicks : liveContent.filter((c: any) => c.isFeature).map((f: any) => ({
                id: f.id,
                title: f.title,
                description: f.description || '',
                imageUrl: f.mediaAsset?.thumbnailUrl || f.mediaAsset?.url || '/images/default-media.jpg',
                ctaLink: `/site/${pageData?.slug || ''}/media/products/${f.id}`,
                type: f.type || 'Featured'
              }))
            }));
          }
        })
        .catch(() => {});
    }
  }, [pageData, companyId]);

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

  const activeData = displayData || defaultStoreData;

  const sectionMap: Record<string, React.ReactNode> = {
    'media-hero': (
      <MediaHeroSection
        slideData={activeData.heroSlides}
        onPlay={(slide: any) =>
          router.push(`/${activeData.slug}/video/${slide.slug}`)
        }
      />
    ),
    'hero': (
      <MediaHeroSection
        slideData={activeData.heroSlides}
        onPlay={(slide: any) =>
          router.push(`/${activeData.slug}/video/${slide.slug}`)
        }
      />
    ),
    'enhanced-categories': (
      <EnhancedCategoriesSection
        categories={activeData.StoreCategory}
        slug={activeData.slug}
      />
    ),
    'categories': (
      <EnhancedCategoriesSection
        categories={activeData.StoreCategory}
        slug={activeData.slug}
      />
    ),
    'top-picks': (
      <TopPicksCarousel
        picks={activeData.topPicks}
        onSelect={(item: any) => router.push(item.ctaLink)}
      />
    ),
    'latest-releases': (
      <LatestReleasesSection
        releases={activeData.latestReleases}
        onPlay={(item: any) => router.push(item.videoSlug ? `/${activeData.slug}/video/${item.videoSlug}` : `/${activeData.slug}/media/${item.slug}`)}
      />
    ),
    'featured-articles': (
      <FeaturedArticlesSection
        featured={activeData.featuredArticles || activeData.blogs}
        storeSlug={activeData.slug}
      />
    ),
    'latest-videos': (
      <LatestVideosSection
        videos={activeData.latestVideos}
      />
    ),
    'testimonials': (
      <TestimonialsSlider
        testimonials={activeData.testimonials}
      />
    ),
    'newsletter-signup': <NewsletterSignup />,
    'newsletter': <NewsletterSignup />,
    'faqs': (
      <FAQsSection
        faqs={activeData.faqs}
      />
    ),
  };

  const staticFallback = (
    <>
      <div id="section-media-hero" data-editor-section="media-hero" data-editor-component="MediaHeroSection">
        <MediaHeroSection
          slideData={activeData.heroSlides}
          onPlay={(slide: any) =>
            router.push(`/${activeData.slug}/video/${slide.slug}`)
          }
        />
      </div>
      <div id="section-enhanced-categories" data-editor-section="enhanced-categories" data-editor-component="EnhancedCategoriesSection">
        <EnhancedCategoriesSection
          categories={activeData.StoreCategory}
          slug={activeData.slug}
        />
      </div>
      <div id="section-top-picks" data-editor-section="top-picks" data-editor-component="TopPicksCarousel">
        <TopPicksCarousel
          picks={activeData.topPicks}
          onSelect={(item: any) => router.push(item.ctaLink)}
        />
      </div>
      <div id="section-latest-releases" data-editor-section="latest-releases" data-editor-component="LatestReleasesSection">
        <LatestReleasesSection
          releases={activeData.latestReleases}
          onPlay={(item: any) => router.push(item.videoSlug ? `/${activeData.slug}/video/${item.videoSlug}` : `/${activeData.slug}/media/${item.slug}`)}
        />
      </div>
      <div id="section-featured-articles" data-editor-section="featured-articles" data-editor-component="FeaturedArticlesSection">
        <FeaturedArticlesSection
          featured={activeData.featuredArticles || activeData.blogs}
          storeSlug={activeData.slug}
        />
      </div>
      <div id="section-latest-videos" data-editor-section="latest-videos" data-editor-component="LatestVideosSection">
        <LatestVideosSection
          videos={activeData.latestVideos}
        />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSlider">
        <TestimonialsSlider
          testimonials={activeData.testimonials}
        />
      </div>
      <div id="section-newsletter-signup" data-editor-section="newsletter-signup" data-editor-component="NewsletterSignup">
        <NewsletterSignup />
      </div>
      <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
        <FAQsSection
          faqs={activeData.faqs}
        />
      </div>
    </>
  );

  return (
    <div className="font-sans relative">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
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