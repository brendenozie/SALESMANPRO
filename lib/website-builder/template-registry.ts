/**
 * lib/website-builder/template-registry.ts
 *
 * Centralized, authoritative Template Registry for SalesmanPro.
 * Defines all 56 physically implemented templates with canonical versioned IDs,
 * explicit page mappings, capability declarations, authentic component trees,
 * and deterministic alias resolution.
 *
 * Guaranteed: Original designs are preserved in full fidelity as the authoritative asset.
 */

import {
  TemplateDefinition,
  TemplatePageDefinition,
  AuthenticSectionDefinition,
  TemplateCapability,
  ThemeTokens,
  TemplateShellDefinition,
} from "@/types/website-builder";

// ✅ Helper to build standard eCommerce subpages
function makeEcommercePages(subfolder: string): TemplatePageDefinition[] {
  return [
    { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
    { id: "p-products", slug: "products", title: "All Products", pageType: "PRODUCT_LIST", nativeSubpath: `${subfolder}/products` },
    { id: "p-categories", slug: "categories", title: "Categories", pageType: "CATEGORY_LIST", nativeSubpath: `${subfolder}/categories` },
    { id: "p-about", slug: "about", title: "About Us", pageType: "ABOUT", nativeSubpath: `${subfolder}/about` },
    { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: `${subfolder}/contact` },
    { id: "p-cart", slug: "cart", title: "Shopping Cart", pageType: "CART", nativeSubpath: `${subfolder}/cart` },
    { id: "p-checkout", slug: "checkout", title: "Checkout", pageType: "CHECKOUT", nativeSubpath: `${subfolder}/checkout` },
  ];
}

// ✅ Helper to build standard Service/Booking subpages
function makeBookingPages(subfolder: string): TemplatePageDefinition[] {
  return [
    { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
    { id: "p-services", slug: "services", title: "Services", pageType: "SERVICE_LIST", nativeSubpath: `${subfolder}/services` },
    { id: "p-booking", slug: "booking", title: "Book Appointment", pageType: "BOOKING", nativeSubpath: `${subfolder}/booking` },
    { id: "p-about", slug: "about", title: "About Us", pageType: "ABOUT", nativeSubpath: `${subfolder}/about` },
    { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: `${subfolder}/contact` },
  ];
}

// ✅ Helper to build standard Course subpages

// ✅ Helper to build standard template shell definition
export function makeShell(
  headerComponent: string = "Header",
  footerComponent: string = "Footer",
  defaultNavItems: { id: string; label: string; url: string }[] = []
): TemplateShellDefinition {
  return {
    headerComponent,
    footerComponent,
    defaultNavItems,
  };
}

function makeCoursePages(subfolder: string): TemplatePageDefinition[] {
  return [
    { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
    { id: "p-courses", slug: "courses", title: "Courses", pageType: "COURSE_LIST", nativeSubpath: `${subfolder}/courses` },
    { id: "p-about", slug: "about", title: "About", pageType: "ABOUT", nativeSubpath: `${subfolder}/about` },
    { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: `${subfolder}/contact` },
    { id: "p-cart", slug: "cart", title: "Cart", pageType: "CART", nativeSubpath: `${subfolder}/cart` },
    { id: "p-checkout", slug: "checkout", title: "Checkout", pageType: "CHECKOUT", nativeSubpath: `${subfolder}/checkout` },
  ];
}

/* =========================================================================
   AUTHENTIC SECTION DEFINITIONS PER SPECIALIZED TEMPLATE
   ========================================================================= */

const ECOMMERCE_SHOES_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "shoes-hero-slider",
    name: "Hero Slider Showcase",
    component: "HeroSlider",
    type: "hero",
    category: "hero",
    editableProps: ["slides", "autoplay", "headline", "subline", "buttonText", "buttonLink"],
    defaultContent: {
      headline: "Performance & Modern Style",
      subline: "Engineered for Comfort, Designed to Turn Heads",
      buttonText: "Shop Collection",
      buttonLink: "/products",
    },
    dataSource: { type: "promotions" },
  },
  {
    id: "shoes-features",
    name: "Features & Guarantees Strip",
    component: "FeaturesSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["features"],
    defaultContent: {
      title: "Why Choose Our Footwear",
      badges: [
        { title: "10-Minute Dispatch", description: "Prompt courier shipping to your doorstep." },
        { title: "Best Prices & Offers", description: "Direct factory pricing with authentic guarantee." },
        { title: "Curated Styles", description: "Wide selection of sizes, fits and limited drops." },
        { title: "Easy Exchanges", description: "Hassle-free size replacement policy." },
      ],
    },
  },
  {
    id: "shoes-categories",
    name: "Featured Shoe Categories",
    component: "CategoriesSection",
    type: "categoryGrid",
    category: "commerce",
    editableProps: ["title", "layout"],
    defaultContent: { title: "Explore Categories" },
    dataSource: { type: "categories" },
  },
  {
    id: "shoes-category-showcase",
    name: "Trending Silhouettes",
    component: "CategorySection",
    type: "categoryGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Trending Styles" },
    dataSource: { type: "categories" },
  },
  {
    id: "shoes-promo-banner",
    name: "First Promotional Banner",
    component: "PromoSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "subtitle", "buttonText", "buttonLink", "imageUrl"],
    defaultContent: {
      title: "Seasonal Drop: Limited Pairs",
      subtitle: "Claim your pair before stocks run out.",
      buttonText: "Claim Offer",
      buttonLink: "/products",
    },
    dataSource: { type: "promotions" },
  },
  {
    id: "shoes-popular-products",
    name: "Popular Shoes Grid",
    component: "PopularProducts",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle", "limit"],
    defaultContent: { title: "Popular This Week", subtitle: "Top customer favorites" },
    dataSource: { type: "products", filter: "featured", limit: 8 },
  },
  {
    id: "shoes-metrics",
    name: "Core Brand Values & Metrics",
    component: "MetricsSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "values"],
    defaultContent: { title: "Crafted Without Compromise" },
  },
  {
    id: "shoes-daily-best-sells",
    name: "Daily Best Sellers Carousel",
    component: "DailyBestSells",
    type: "productCarousel",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Daily Best Sellers" },
    dataSource: { type: "products", filter: "bestsellers", limit: 8 },
  },
  {
    id: "shoes-sleeptape-ad",
    name: "Special Editorial Spotlight",
    component: "SleepTapeAd",
    type: "ctaBanner",
    category: "media",
    editableProps: ["title", "description", "buttonText"],
    defaultContent: { title: "Step Into Pure Comfort", description: "Ergonomic arch support designed for active all-day wear." },
    dataSource: { type: "promotions" },
  },
  {
    id: "shoes-all-products",
    name: "All Footwear Collection",
    component: "AllProducts",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "columns"],
    defaultContent: { title: "Complete Catalog" },
    dataSource: { type: "products", limit: 12 },
  },
  {
    id: "shoes-trending-promotion",
    name: "Trending Promotion Split Banner",
    component: "TrendingPromotion",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "subtitle", "buttonText"],
    defaultContent: { title: "Flash Weekend Deal", subtitle: "Instant discounts applied at checkout" },
    dataSource: { type: "promotions" },
  },
  {
    id: "shoes-awards",
    name: "Awards & Quality Recognition",
    component: "AwardsSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Recognized for Quality & Craft" },
  },
  {
    id: "shoes-banner-section",
    name: "Full-Width Showcase Banner",
    component: "BannerSection",
    type: "ctaBanner",
    category: "media",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "New Release Vault", buttonText: "View Vault" },
    dataSource: { type: "promotions" },
  },
  {
    id: "shoes-testimonials",
    name: "Shopper Reviews & Testimonials",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Verified Customer Reviews", subtitle: "Real feedback from actual shoe lovers" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "shoes-newsletter",
    name: "VIP Drops Newsletter",
    component: "NewsletterSection",
    type: "newsletter",
    category: "conversion",
    editableProps: ["title", "subtitle", "buttonText"],
    defaultContent: { title: "Be the First on Drops", subtitle: "Exclusive restock notifications delivered straight to your inbox.", buttonText: "Get Access" },
  },
];


/* =========================================================================
   CATEGORY-SPECIFIC AUTHENTIC SECTION DEFINITIONS
   Matching actual physical component trees in components/site/layouts/{template}/body/
   ========================================================================= */

// RESTAURANT AUTHENTIC SECTIONS
export const RESTAURANT_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "restaurant-hero",
    name: "Restaurant Hero Showcase",
    component: "RestaurantHero",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText", "buttonLink"],
    defaultContent: {
      headline: "Artisanal Culinary Excellence",
      subline: "Fresh local ingredients, wood-fired flavors & chef's specials",
      buttonText: "Explore Menu",
      buttonLink: "/menu",
    },
    dataSource: { type: "promotions" },
  },
  {
    id: "signature-dishes",
    name: "Chef's Signature Dishes",
    component: "SignatureDishes",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle", "limit"],
    defaultContent: { title: "Chef's Signature Selections", subtitle: "Curated seasonal specials prepared daily", limit: 6 },
    dataSource: { type: "products", filter: "featured", limit: 6 },
  },
  {
    id: "why-dine-with-us",
    name: "Dining Philosophy & Experience",
    component: "WhyDineWithUs",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: {
      title: "Why Dine With Us",
      subtitle: "Farm-to-table ethics and warm hospitality",
      description: "Every dish tells a story of sustainable farming, authentic tradition, and culinary passion.",
    },
  },
  {
    id: "restaurant-testimonials",
    name: "Guest Experiences & Reviews",
    component: "Testimonials",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "What Our Guests Say" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "restaurant-gallery",
    name: "Atmosphere & Culinary Gallery",
    component: "RestaurantGallery",
    type: "imageWithText",
    category: "media",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Inside Our Dining Room", subtitle: "Take a visual tour of our kitchen and ambiance" },
  },
  {
    id: "restaurant-faqs",
    name: "Reservations & Dining FAQs",
    component: "RestaurantFAQs",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Frequently Asked Questions", subtitle: "Answers about dietary needs, valet parking, and private bookings." },
  },
];

// REAL ESTATE AUTHENTIC SECTIONS
export const REAL_ESTATE_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "realestate-hero",
    name: "Property Search & Hero Banner",
    component: "HeroSection",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText"],
    defaultContent: {
      headline: "Find Your Perfect Dream Property",
      subline: "Explore luxury apartments, estates and prime commercial listings.",
      buttonText: "Browse Properties",
    },
  },
  {
    id: "property-categories",
    name: "Property Types & Categories",
    component: "CategoriesSection",
    type: "categoryGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Browse by Property Type" },
    dataSource: { type: "categories" },
  },
  {
    id: "featured-listings",
    name: "Featured Premier Listings",
    component: "FeaturedListingsWrapper",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Exclusive Featured Listings", limit: 6 },
    dataSource: { type: "products", filter: "featured", limit: 6 },
  },
  {
    id: "trending-locations",
    name: "Top Neighborhoods & Locations",
    component: "TrendingLocations",
    type: "categoryGrid",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Trending Prime Locations" },
  },
  {
    id: "all-listings",
    name: "All Properties Directory",
    component: "ListingsSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "All Available Properties", limit: 12 },
    dataSource: { type: "products", limit: 12 },
  },
  {
    id: "why-choose-us",
    name: "Agency Credentials & Core Values",
    component: "WhyChooseUs",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Why Choose DreamNest Realty", subtitle: "Trusted real estate experts with proven closing track records." },
  },
  {
    id: "realestate-agents",
    name: "Expert Property Advisors",
    component: "AgentsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Meet Our Licensed Agents", subtitle: "Dedicated professionals ready to assist your journey." },
  },
  {
    id: "realestate-testimonials",
    name: "Client Success Stories",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Client Testimonials" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "realestate-faqs",
    name: "Homebuyer & Seller FAQs",
    component: "FAQSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Real Estate FAQs" },
  },
  {
    id: "realestate-blog",
    name: "Market Insights & Property Advice",
    component: "BlogSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Real Estate Market Trends" },
  },
  {
    id: "realestate-newsletter",
    name: "Exclusive Off-Market Alert",
    component: "NewsletterSection",
    type: "newsletter",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Get Off-Market Deal Alerts", buttonText: "Subscribe Now" },
  },
];

// AUTOMOTIVE AUTHENTIC SECTIONS
export const AUTOMOTIVE_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "automotive-hero",
    name: "Automotive Showroom Hero",
    component: "HeroSection",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline"],
    defaultContent: {
      headline: "Drive the Exceptional",
      subline: "Certified pre-owned and brand-new premium vehicles.",
    },
  },
  {
    id: "automotive-featured",
    name: "Featured Showroom Inventory",
    component: "AutomotiveFeaturedListingsWrapper",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Featured Vehicles", limit: 6 },
    dataSource: { type: "products", filter: "featured", limit: 6 },
  },
  {
    id: "how-it-works",
    name: "Buying & Trade-In Process",
    component: "HowItWorks",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "How Buying Works", subtitle: "Simple 3-step financing, inspection & delivery." },
  },
  {
    id: "browse-by-category",
    name: "Browse by Vehicle Body Style",
    component: "BrowseByCategory",
    type: "categoryGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Browse by Body Style" },
    dataSource: { type: "categories" },
  },
  {
    id: "automotive-locations",
    name: "Dealership Showroom Locations",
    component: "TrendingLocations",
    type: "categoryGrid",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Visit Our Showrooms" },
  },
  {
    id: "popular-vehicles",
    name: "Popular Vehicles & Deals",
    component: "PopularVehiclesWrapper",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Trending Vehicles This Week", limit: 8 },
    dataSource: { type: "products", limit: 8 },
  },
  {
    id: "video-showcase",
    name: "Vehicle Walkthrough Videos",
    component: "VideoShowcaseSection",
    type: "imageWithText",
    category: "media",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Virtual Video Walkthroughs", subtitle: "Detailed 4K tours of our top inventory." },
  },
  {
    id: "market-insights",
    name: "Automotive Insights & Valuation",
    component: "MarketInsightsSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Automotive Market Intelligence", subtitle: "Trade-in value guides and maintenance tips." },
  },
  {
    id: "automotive-testimonials",
    name: "Customer Reviews & Testimonials",
    component: "TestimonialsCarouselSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "What Car Buyers Say" },
    dataSource: { type: "testimonials" },
  },
];

// COURSES AUTHENTIC SECTIONS
export const COURSES_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "courses-hero",
    name: "Academy Hero Showcase",
    component: "HeroSection",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText"],
    defaultContent: {
      headline: "Master In-Demand Skills with Industry Leaders",
      subline: "Accredited online courses, masterclasses and live mentor workshops.",
      buttonText: "Explore Courses",
    },
  },
  {
    id: "glass-info-cards",
    name: "Learning Pillars & Value Props",
    component: "GlassInfoCardsSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Why Learn With Us", subtitle: "Flexible paced learning with recognized certifications" },
  },
  {
    id: "school-overview",
    name: "School & Faculty Overview",
    component: "SchoolSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: { title: "About Our Academy", subtitle: "Empowering learners across Africa with practical skills." },
  },
  {
    id: "main-courses",
    name: "Course Catalog & Programs",
    component: "MainCoursesSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Featured Certificate Courses", limit: 6 },
    dataSource: { type: "products", filter: "featured", limit: 6 },
  },
  {
    id: "courses-about",
    name: "Curriculum Methodology",
    component: "AboutSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "description"],
    defaultContent: { title: "Hands-on Project Based Curriculum", description: "Graduate with a job-ready portfolio of real client work." },
  },
  {
    id: "courses-testimonials",
    name: "Student & Alumni Reviews",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "What Our Alumni Say" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "popular-blogs",
    name: "Learning Resources & Articles",
    component: "PopularBlogsSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Latest Career & Tech Insights" },
  },
  {
    id: "courses-cta",
    name: "Enrollment Call to Action",
    component: "CtaSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText", "buttonLink"],
    defaultContent: { title: "Start Your Learning Journey Today", buttonText: "Enroll Now", buttonLink: "/courses" },
  },
  {
    id: "courses-faqs",
    name: "Admissions & Tuition FAQs",
    component: "FAQSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Frequently Asked Questions", subtitle: "Information on payments, certificates and schedules." },
  },
];

// HEALTHCARE AUTHENTIC SECTIONS
export const HEALTHCARE_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "healthcare-hero",
    name: "Clinic Hero Banner",
    component: "HealthcareHero",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText"],
    defaultContent: {
      headline: "Compassionate Care, Modern Medical Excellence",
      subline: "Experienced medical practitioners, fast consultations and family healthcare.",
      buttonText: "Book Consultation",
    },
  },
  {
    id: "healthcare-about",
    name: "Clinic Philosophy & Heritage",
    component: "AboutSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "description"],
    defaultContent: { title: "Dedicated to Your Long-Term Wellness", description: "Combining state-of-the-art diagnostic facilities with empathetic patient care." },
  },
  {
    id: "medical-services",
    name: "Medical Services & Specialties",
    component: "MedicalServicesSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Specialized Medical Services", subtitle: "Comprehensive outpatient and specialist clinics" },
    dataSource: { type: "products" },
  },
  {
    id: "health-tips",
    name: "Doctor's Wellness Tips",
    component: "HealthTipsSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Healthy Living Insights", subtitle: "Preventive health advice from our senior physicians" },
  },
  {
    id: "healthcare-doctors",
    name: "Medical Staff & Specialists",
    component: "DoctorsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Meet Our Specialists", subtitle: "Certified and compassionate healthcare professionals" },
  },
  {
    id: "patient-testimonials",
    name: "Patient Reviews & Recovery Stories",
    component: "PatientSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Patient Testimonials" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "healthcare-faqs",
    name: "Insurance & Appointment FAQs",
    component: "FAQsSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Patient FAQs", subtitle: "Insurance providers, opening hours and emergency protocols" },
  },
  {
    id: "healthcare-contact",
    name: "Clinic Location & Hours",
    component: "ContactSection",
    type: "contact",
    category: "content",
    editableProps: ["title", "phoneNumber", "email", "address"],
    defaultContent: { title: "Clinic Touchpoints & Hours", phoneNumber: "+254 700 000000", email: "info@clinic.com" },
  },
  {
    id: "healthcare-cta",
    name: "Urgent Consultation Booking",
    component: "CTASection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Need to See a Doctor Today?", buttonText: "Schedule Appointment" },
  },
];

// SERVICES AUTHENTIC SECTIONS
export const SERVICES_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "services-hero",
    name: "Service Agency Hero Banner",
    component: "HeroSection",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText"],
    defaultContent: {
      headline: "Professional Quality Services You Can Trust",
      subline: "Certified experts delivering prompt, reliable solutions.",
      buttonText: "Request Quote",
    },
  },
  {
    id: "services-about",
    name: "About Our Company",
    component: "AboutSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "description"],
    defaultContent: { title: "Experience & Commitment", description: "Delivering proven value and guaranteed satisfaction on every project." },
  },
  {
    id: "services-excellence",
    name: "Service Guarantees",
    component: "ExcellenceSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Our Quality Guarantee", subtitle: "Transparent pricing, insured work, and rapid turnaround." },
  },
  {
    id: "services-list",
    name: "Services Showcase",
    component: "ServicesSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Our Core Services", subtitle: "Tailored commercial and residential solutions" },
    dataSource: { type: "products" },
  },
  {
    id: "services-pricing",
    name: "Transparent Pricing Tiers",
    component: "PricingSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Package Pricing", subtitle: "Clear, upfront pricing with no hidden fees" },
  },
  {
    id: "services-testimonials",
    name: "Customer Reviews",
    component: "TestimonialSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Client Testimonials" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "services-faqs",
    name: "Frequently Asked Questions",
    component: "FAQSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Service FAQs" },
  },
  {
    id: "services-tips",
    name: "Expert Advice & Tips",
    component: "CleaningTipsSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Expert Maintenance Tips", subtitle: "Simple practices to prolong longevity." },
  },
  {
    id: "services-get-started",
    name: "Get Started Banner",
    component: "GetStartedSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Ready for a Free Assessment?", buttonText: "Get Started" },
  },
  {
    id: "services-booking-form",
    name: "Direct Booking Request Form",
    component: "BookingFormSection",
    type: "contact",
    category: "conversion",
    editableProps: ["title"],
    defaultContent: { title: "Book a Service Slot" },
  },
];

// BARBERSHOP & BOOKINGS AUTHENTIC SECTIONS
export const BARBERSHOP_BOOKINGS_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "barbershop-hero",
    name: "Barbershop Hero",
    component: "Hero",
    type: "hero",
    category: "hero",
    editableProps: ["name", "description"],
    defaultContent: { name: "Classic Grooming Lounge", description: "Master fades, beard sculpting & hot towel treatments." },
  },
  {
    id: "barbershop-features",
    name: "Experience & Atmosphere",
    component: "FeaturesSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "The Grooming Experience" },
  },
  {
    id: "style-gallery",
    name: "Signature Cuts & Styles Gallery",
    component: "StyleGallerySection",
    type: "imageWithText",
    category: "media",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Style Lookbook", subtitle: "Precision cuts crafted by master barbers" },
  },
  {
    id: "barbershop-benefits",
    name: "Member Benefits & Perks",
    component: "BenefitsSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Club Membership Perks" },
  },
  {
    id: "pricing-stats",
    name: "Services & Price List",
    component: "PricingAndStatsSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Menu of Services" },
    dataSource: { type: "products" },
  },
  {
    id: "massage-features",
    name: "Spa & Grooming Extras",
    component: "MassageFeatures",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Therapeutic Grooming" },
  },
  {
    id: "barbershop-testimonials",
    name: "Client Feedback",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Client Reviews" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "barbershop-cta",
    name: "Appointment Booking CTA",
    component: "CtaSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Look Sharp. Reserve Your Chair.", buttonText: "Book Appointment" },
  },
  {
    id: "barbershop-faqs",
    name: "Grooming FAQs",
    component: "FAQsSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Common Questions" },
  },
];

// COMPANY PORTFOLIO AUTHENTIC SECTIONS
export const COMPANY_PORTFOLIO_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "portfolio-hero",
    name: "Corporate Hero Banner",
    component: "HeroSection",
    type: "hero",
    category: "hero",
    editableProps: ["name", "headline", "subline"],
    defaultContent: { headline: "Driving Sustainable Impact & Innovation", subline: "Delivering world-class solutions across sectors." },
  },
  {
    id: "core-highlights",
    name: "Impact & Strategic Pillars",
    component: "CoreHighlightsSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Our Strategic Focus Areas" },
  },
  {
    id: "portfolio-services",
    name: "Capability & Practice Areas",
    component: "GreyServicesSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Key Practice Areas" },
    dataSource: { type: "products" },
  },
  {
    id: "about-spotlight",
    name: "Leadership & Mission Spotlight",
    component: "AboutUsSpotlight",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "description"],
    defaultContent: { title: "Our Mission & Vision" },
  },
  {
    id: "programs-causes",
    name: "Flagship Programs & Projects",
    component: "ProgramsCausesSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Current Initiatives" },
  },
  {
    id: "impact-stats",
    name: "Verified Impact Metrics",
    component: "ImpactStatsSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "By the Numbers" },
  },
  {
    id: "events-updates",
    name: "Announcements & Key Milestones",
    component: "EventsUpdatesSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "News & Milestones" },
  },
  {
    id: "news-section",
    name: "Press Releases & Thought Leadership",
    component: "NewsSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Media & Press" },
  },
  {
    id: "portfolio-testimonials",
    name: "Partner & Stakeholder Quotes",
    component: "TestimonialsNewsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Partner Endorsements" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "cta-bold",
    name: "Partnership Call to Action",
    component: "CtaBoldSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Partner With Us Today", buttonText: "Contact Leadership" },
  },
  {
    id: "portfolio-faqs",
    name: "Corporate FAQs",
    component: "FAQSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Corporate Inquiries" },
  },
  {
    id: "portfolio-cta",
    name: "Secondary Action",
    component: "CallToActionSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Connect with our advisory team", buttonText: "Get in Touch" },
  },
];

// FITNESS AUTHENTIC SECTIONS
export const FITNESS_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "fitness-hero",
    name: "Fitness Club Hero",
    component: "HeroSection",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText"],
    defaultContent: { headline: "Transform Your Mind, Body & Health", subline: "State of the art gym equipment, functional training & expert coaches.", buttonText: "Claim Day Pass" },
  },
  {
    id: "fitness-category",
    name: "Fitness Programs & Disciplines",
    component: "CategorySection",
    type: "categoryGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Training Programs" },
    dataSource: { type: "categories" },
  },
  {
    id: "classes-grid",
    name: "Group Classes Schedule",
    component: "ClassesGrid",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Weekly Class Schedule" },
    dataSource: { type: "products" },
  },
  {
    id: "fitness-listings",
    name: "Membership Packages",
    component: "ListingsGrid",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Membership Tiers" },
  },
  {
    id: "virtual-tours",
    name: "Virtual Gym Tour",
    component: "VirtualTours",
    type: "imageWithText",
    category: "media",
    editableProps: ["title"],
    defaultContent: { title: "Virtual Facility Tour" },
  },
  {
    id: "fitness-locations",
    name: "Club Locations",
    component: "LocationsSection",
    type: "categoryGrid",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Our Gym Locations" },
  },
  {
    id: "fitness-insights",
    name: "Workout & Nutrition Tips",
    component: "MarketInsights",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Fitness & Nutrition Tips" },
  },
  {
    id: "fitness-experts",
    name: "Certified Personal Trainers",
    component: "ExpertsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Certified Personal Trainers" },
  },
  {
    id: "fitness-gallery",
    name: "Gym Action Gallery",
    component: "GallerySection",
    type: "imageWithText",
    category: "media",
    editableProps: ["title"],
    defaultContent: { title: "Gym Floor & Equipment" },
  },
  {
    id: "fitness-testimonials",
    name: "Member Transformations",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Member Success Stories" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "app-promotion",
    name: "Mobile Workout App",
    component: "AppPromotionSection",
    type: "imageWithText",
    category: "conversion",
    editableProps: ["title"],
    defaultContent: { title: "Download Our Member App" },
  },
  {
    id: "fitness-faqs",
    name: "Membership FAQs",
    component: "FaqsSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Frequently Asked Questions" },
  },
  {
    id: "fitness-newsletter",
    name: "Free Workout Plan Signup",
    component: "NewsletterSection",
    type: "newsletter",
    category: "conversion",
    editableProps: ["title"],
    defaultContent: { title: "Get a Free 7-Day Workout Guide" },
  },
];

// TRAVEL AUTHENTIC SECTIONS
export const TRAVEL_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "travel-hero",
    name: "Travel Experience Hero",
    component: "Hero",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline"],
    defaultContent: { headline: "Explore Extraordinary Destinations", subline: "Curated safaris, coastal retreats and cultural adventures." },
  },
  {
    id: "travel-filter",
    name: "Destination Search & Filter",
    component: "FilterBar",
    type: "categoryGrid",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Filter by Destination or Style" },
  },
  {
    id: "travel-listings",
    name: "Curated Tour Packages",
    component: "Listings",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Popular Holiday Packages" },
    dataSource: { type: "products" },
  },
  {
    id: "travel-locations",
    name: "Top Destinations",
    component: "TrendingLocations",
    type: "categoryGrid",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Top Destinations This Month" },
  },
  {
    id: "travel-virtual-tours",
    name: "Destination Video Tours",
    component: "VirtualTours",
    type: "imageWithText",
    category: "media",
    editableProps: ["title"],
    defaultContent: { title: "360° Destination Tours" },
  },
  {
    id: "travel-insights",
    name: "Travel Guides & Packing Advice",
    component: "MarketInsights",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Safari & Coastal Guides" },
  },
  {
    id: "travel-agents",
    name: "Travel Specialists",
    component: "MeetAgents",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Our Travel Planners" },
  },
  {
    id: "travel-testimonials",
    name: "Traveler Reviews",
    component: "Testimonials",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "What Our Travelers Say" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "travel-mobile-app",
    name: "Travel Itinerary App",
    component: "MobileAppPromo",
    type: "imageWithText",
    category: "conversion",
    editableProps: ["title"],
    defaultContent: { title: "Carry Your Trip Itinerary Everywhere" },
  },
  {
    id: "travel-newsletter",
    name: "Early Bird Travel Deals",
    component: "NewsletterSignup",
    type: "newsletter",
    category: "conversion",
    editableProps: ["title"],
    defaultContent: { title: "Sign Up for Secret Flight & Resort Deals" },
  },
];

// ECOMMERCE GAMING AUTHENTIC SECTIONS
export const ECOMMERCE_GAMING_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "gaming-hero",
    name: "Gaming Command Center Hero",
    component: "HeroSlider",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText", "buttonLink"],
    defaultContent: { headline: "LEVEL UP YOUR ARSENAL", subline: "PRO ESPORTS GEAR", buttonText: "Shop Gear", buttonLink: "/products" },
  },
  {
    id: "gaming-categories",
    name: "Battlefield Categories",
    component: "CategorySection",
    type: "categoryGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Gear Categories" },
    dataSource: { type: "categories" },
  },
  {
    id: "gaming-popular",
    name: "Popular Hardware & Drops",
    component: "PopularProducts",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Popular Weapons of Choice", limit: 8 },
    dataSource: { type: "products", filter: "featured", limit: 8 },
  },
  {
    id: "gaming-daily-deals",
    name: "Flash Deals & Best Sellers",
    component: "DailyBestSells",
    type: "productCarousel",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Daily Loot Drops", limit: 6 },
    dataSource: { type: "products", filter: "bestsellers", limit: 6 },
  },
  {
    id: "gaming-trending",
    name: "Trending Rigs & Peripherals",
    component: "Trending",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Trending Streamer Gear" },
    dataSource: { type: "products", limit: 6 },
  },
  {
    id: "gaming-promo-1",
    name: "Pro Rig Promo Banner",
    component: "PromoSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Custom Gaming Rigs Built for High FPS", buttonText: "Configure Now" },
  },
  {
    id: "gaming-promo-2",
    name: "Accessories Special Spotlight",
    component: "SecondPromoSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Mechanical Keyboards & Ultra-Low Latency Mice", buttonText: "Explore Now" },
  },
  {
    id: "gaming-all-products",
    name: "Full Armory Catalog",
    component: "AllProducts",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Complete Hardware Vault" },
    dataSource: { type: "products", limit: 12 },
  },
  {
    id: "gaming-metrics",
    name: "Esports Benchmark Metrics",
    component: "MetricsSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Why Champions Choose Us" },
  },
  {
    id: "gaming-awards",
    name: "Gaming Industry Honors",
    component: "AwardsSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Official Tournament Partner" },
  },
  {
    id: "gaming-testimonials",
    name: "Streamer & Gamer Reviews",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Verified Gamer Feedback" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "gaming-newsletter",
    name: "Loot Drop Alerts",
    component: "NewsletterSection",
    type: "newsletter",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Get Secret Discount Codes & Early Drops", buttonText: "Join Squad" },
  },
];

const STANDARD_ECOMMERCE_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "hero-slider",
    name: "Hero Banner / Slider",
    component: "HeroSlider",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText", "buttonLink", "imageUrl"],
    defaultContent: {
      headline: "Quality Products for Modern Living",
      subline: "Discover our latest arrivals and exclusive deals",
      buttonText: "Shop Now",
      buttonLink: "/products",
    },
    dataSource: { type: "promotions" },
  },
  {
    id: "categories-grid",
    name: "Shop by Category",
    component: "CategoriesSection",
    type: "categoryGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Browse Categories" },
    dataSource: { type: "categories" },
  },
  {
    id: "popular-products",
    name: "Popular Products",
    component: "PopularProducts",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Popular Products", limit: 8 },
    dataSource: { type: "products", filter: "featured", limit: 8 },
  },
  {
    id: "promo-banner",
    name: "Mid-Page Promotional Banner",
    component: "PromoSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "subtitle", "buttonText", "buttonLink"],
    defaultContent: { title: "Special Limited Offer", subtitle: "Get yours before promotion ends", buttonText: "Claim Offer" },
    dataSource: { type: "promotions" },
  },
  {
    id: "daily-best-sells",
    name: "Daily Best Sellers",
    component: "DailyBestSells",
    type: "productCarousel",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Best Selling Items", limit: 8 },
    dataSource: { type: "products", filter: "bestsellers", limit: 8 },
  },
  {
    id: "all-products",
    name: "All Products Showcase",
    component: "AllProducts",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title"],
    defaultContent: { title: "Explore All Products" },
    dataSource: { type: "products", limit: 12 },
  },
  {
    id: "testimonials",
    name: "Customer Reviews",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "What Our Customers Say" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "newsletter",
    name: "VIP Newsletter Subscription",
    component: "NewsletterSection",
    type: "newsletter",
    category: "conversion",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Stay in the Loop", subtitle: "Subscribe for new arrivals and insider deals." },
  },
];

/* =========================================================================
   CANONICAL TEMPLATE REGISTRY (ALL 56 TEMPLATES)
   ========================================================================= */

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  // 1. ECOMMERCE - SHOES
  "ecommerce-shoes@v1": {
    id: "ecommerce-shoes@v1",
    version: "1.0.0",
    name: "Modern Shoes Store",
    category: "ecommerce",
    variant: "shoes",
    shellLayout: "EcommerceShoesLayout",
    bodyComponent: "EcommerceShoesSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#E11D48",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "none",
      cardRadius: "md",
    },
    defaultPages: makeEcommercePages("ecommerceshoes"),
    authenticSections: ECOMMERCE_SHOES_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-drops", label: "Drops", url: "/products" },
      { id: "nav-vault", label: "Vault", url: "/categories" },
      { id: "nav-story", label: "Story", url: "/about" },
    ]),
  },

  // 2. ECOMMERCE - GENERAL
  "ecommerce-default@v1": {
    id: "ecommerce-default@v1",
    version: "1.0.0",
    name: "General E-Commerce Storefront",
    category: "ecommerce",
    variant: "default",
    shellLayout: "EcommerceLayout",
    bodyComponent: "EcommerceSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#2563EB",
      secondaryColor: "#F59E0B",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("ecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 3. ECOMMERCE - GAMING
  "ecommerce-gaming@v1": {
    id: "ecommerce-gaming@v1",
    version: "1.0.0",
    name: "Gaming & Esports Store",
    category: "ecommerce",
    variant: "gaming",
    shellLayout: "EcommerceGamingLayout",
    bodyComponent: "EcommerceGamingSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#8B5CF6",
      secondaryColor: "#06B6D4",
      accentColor: "#EC4899",
      headingFont: "Orbitron, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("gamingecommerce"),
    authenticSections: ECOMMERCE_GAMING_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-products", label: "All Gear", url: "/products" },
      { id: "nav-categories", label: "Categories", url: "/categories" },
      { id: "nav-deals", label: "Loot Drops", url: "/deals" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 4. ECOMMERCE - AGROVET
  "ecommerce-agrovet@v1": {
    id: "ecommerce-agrovet@v1",
    version: "1.0.0",
    name: "Agrovet & Agricultural Supplies",
    category: "ecommerce",
    variant: "agrovet",
    shellLayout: "EcommerceAgrovetLayout",
    bodyComponent: "EcommerceAgrovetSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#15803D",
      secondaryColor: "#D97706",
      accentColor: "#65A30D",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "lg",
    },
    defaultPages: makeEcommercePages("agrovetecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 5. ECOMMERCE - MEAT & BUTCHERY
  "ecommerce-meat@v1": {
    id: "ecommerce-meat@v1",
    version: "1.0.0",
    name: "Modern Meat & Gourmet Butchery",
    category: "ecommerce",
    variant: "meat",
    shellLayout: "EcommerceMeatLayout",
    bodyComponent: "EcommerceMeatSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#DC2626",
      secondaryColor: "#78350F",
      accentColor: "#EA580C",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeEcommercePages("meatecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 6. ECOMMERCE - HARDWARE
  "ecommerce-hardware@v1": {
    id: "ecommerce-hardware@v1",
    version: "1.0.0",
    name: "Hardware & Tools Store",
    category: "ecommerce",
    variant: "hardware",
    shellLayout: "EcommerceHardwareLayout",
    bodyComponent: "EcommerceHardwareSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#EA580C",
      secondaryColor: "#1E293B",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "sm",
      cardRadius: "md",
    },
    defaultPages: makeEcommercePages("hardwareecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 7. ECOMMERCE - WATCHES
  "ecommerce-watch@v1": {
    id: "ecommerce-watch@v1",
    version: "1.0.0",
    name: "Luxury Timepieces & Watches",
    category: "ecommerce",
    variant: "watch",
    shellLayout: "EcommerceWatchLayout",
    bodyComponent: "EcommerceWatchSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#D97706",
      accentColor: "#38BDF8",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "none",
      cardRadius: "sm",
    },
    defaultPages: makeEcommercePages("watchecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 8. ECOMMERCE - FLOWERS
  "ecommerce-flowers@v1": {
    id: "ecommerce-flowers@v1",
    version: "1.0.0",
    name: "Boutique Florist & Flowers",
    category: "ecommerce",
    variant: "flowers",
    shellLayout: "EcommerceFlowersLayout",
    bodyComponent: "EcommerceFlowersSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#DB2777",
      secondaryColor: "#10B981",
      accentColor: "#F472B6",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "2xl",
    },
    defaultPages: makeEcommercePages("flowersecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 9. ECOMMERCE - GROCERIES
  "ecommerce-groceries@v1": {
    id: "ecommerce-groceries@v1",
    version: "1.0.0",
    name: "Supermarket & Fresh Groceries",
    category: "ecommerce",
    variant: "groceries",
    shellLayout: "EcommerceGroceriesLayout",
    bodyComponent: "EcommerceGroceriesSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#16A34A",
      secondaryColor: "#EAB308",
      accentColor: "#F97316",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "2xl",
    },
    defaultPages: makeEcommercePages("groceriesecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 10. ECOMMERCE - EARPHONES
  "ecommerce-earphones@v1": {
    id: "ecommerce-earphones@v1",
    version: "1.0.0",
    name: "Pro Audio & Earphones",
    category: "ecommerce",
    variant: "earphones",
    shellLayout: "EcommerceEarphonesLayout",
    bodyComponent: "EcommerceEarphonesSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#4F46E5",
      secondaryColor: "#06B6D4",
      accentColor: "#F43F5E",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("earphonesecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 11. ECOMMERCE - GLASSES
  "ecommerce-glasses@v1": {
    id: "ecommerce-glasses@v1",
    version: "1.0.0",
    name: "Eyewear & Optics Studio",
    category: "ecommerce",
    variant: "glasses",
    shellLayout: "EcommerceGlassesLayout",
    bodyComponent: "EcommerceGlassesSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#CA8A04",
      accentColor: "#64748B",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "none",
      cardRadius: "lg",
    },
    defaultPages: makeEcommercePages("glassesecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 12. ECOMMERCE - HONEY
  "ecommerce-honey@v1": {
    id: "ecommerce-honey@v1",
    version: "1.0.0",
    name: "Pure Honey & Organic Bee Products",
    category: "ecommerce",
    variant: "honey",
    shellLayout: "EcommerceHoneyLayout",
    bodyComponent: "EcommerceHoneySite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#D97706",
      secondaryColor: "#B45309",
      accentColor: "#F59E0B",
      headingFont: "Merriweather, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("honeyecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 13. ECOMMERCE - PEANUTS
  "ecommerce-peanuts@v1": {
    id: "ecommerce-peanuts@v1",
    version: "1.0.0",
    name: "Organic Nuts & Peanuts",
    category: "ecommerce",
    variant: "peanuts",
    shellLayout: "EcommercePeanutsLayout",
    bodyComponent: "EcommercePeanutsSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#92400E",
      secondaryColor: "#D97706",
      accentColor: "#15803D",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("peanutecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 14. ECOMMERCE - BABY
  "ecommerce-baby@v1": {
    id: "ecommerce-baby@v1",
    version: "1.0.0",
    name: "Baby & Toddler Boutique",
    category: "ecommerce",
    variant: "baby",
    shellLayout: "EcommerceBabyLayout",
    bodyComponent: "EcommerceBabySite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#F472B6",
      accentColor: "#FBBF24",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "2xl",
    },
    defaultPages: makeEcommercePages("babyecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 15. ECOMMERCE - CAKE
  "ecommerce-cake@v1": {
    id: "ecommerce-cake@v1",
    version: "1.0.0",
    name: "Bakery & Designer Cakes",
    category: "ecommerce",
    variant: "cake",
    shellLayout: "EcommerceCakeLayout",
    bodyComponent: "EcommerceCakeSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#EC4899",
      secondaryColor: "#F59E0B",
      accentColor: "#8B5CF6",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "2xl",
    },
    defaultPages: makeEcommercePages("cakeecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 16. ECOMMERCE - PETS
  "ecommerce-pets@v1": {
    id: "ecommerce-pets@v1",
    version: "1.0.0",
    name: "Pet Food & Supplies Store",
    category: "ecommerce",
    variant: "pets",
    shellLayout: "EcommercePetsLayout",
    bodyComponent: "EcommercePetsSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#059669",
      secondaryColor: "#F59E0B",
      accentColor: "#0284C7",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("petsecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 17. ECOMMERCE - BIKE
  "ecommerce-bike@v1": {
    id: "ecommerce-bike@v1",
    version: "1.0.0",
    name: "Bicycles & Cycling Pro Shop",
    category: "ecommerce",
    variant: "bike",
    shellLayout: "EcommerceBikeLayout",
    bodyComponent: "EcommerceBikeSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#E11D48",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeEcommercePages("bikeecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 18. ECOMMERCE - MOTORCYCLE
  "ecommerce-motorcycle@v1": {
    id: "ecommerce-motorcycle@v1",
    version: "1.0.0",
    name: "Motorcycles & Riding Gear",
    category: "ecommerce",
    variant: "motorcycle",
    shellLayout: "EcommerceMotorCycleLayout",
    bodyComponent: "EcommerceMotorCycleSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#E11D48",
      secondaryColor: "#0F172A",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "none",
      cardRadius: "md",
    },
    defaultPages: makeEcommercePages("motorcycleecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 19. ECOMMERCE - BOOK
  "ecommerce-book@v1": {
    id: "ecommerce-book@v1",
    version: "1.0.0",
    name: "Bookstore & Stationery",
    category: "ecommerce",
    variant: "book",
    shellLayout: "EcommerceBookLayout",
    bodyComponent: "EcommerceBookSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#78350F",
      secondaryColor: "#D97706",
      accentColor: "#15803D",
      headingFont: "Merriweather, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeEcommercePages("bookecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 20. ECOMMERCE - ACCESSORIES
  "ecommerce-accessories@v1": {
    id: "ecommerce-accessories@v1",
    version: "1.0.0",
    name: "Auto Accessories & Parts",
    category: "ecommerce",
    variant: "accessories",
    shellLayout: "EcommerceAccessoriesLayout",
    bodyComponent: "EcommerceAccessoriesSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#2563EB",
      secondaryColor: "#0F172A",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeEcommercePages("automotiveecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 21. FASHION
  "fashion@v1": {
    id: "fashion@v1",
    version: "1.0.0",
    name: "Modern Fashion & Apparel Boutique",
    category: "fashion",
    variant: "default",
    shellLayout: "FashionLayout",
    bodyComponent: "FashionSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#D97706",
      accentColor: "#F43F5E",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "none",
      cardRadius: "md",
    },
    defaultPages: makeEcommercePages("fashionecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 22. FURNITURE
  "furniture@v1": {
    id: "furniture@v1",
    version: "1.0.0",
    name: "Contemporary Furniture & Interior Design",
    category: "furniture",
    variant: "default",
    shellLayout: "FurnitureLayout",
    bodyComponent: "FurnitureSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#78350F",
      secondaryColor: "#D97706",
      accentColor: "#059669",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeEcommercePages("furnitureecommerce"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 23. COURSES - LAYOUT 1
  "courses@v1": {
    id: "courses@v1",
    version: "1.0.0",
    name: "Online Academy & Courses (Layout 1)",
    category: "courses",
    variant: "default",
    shellLayout: "CoursesLayout",
    bodyComponent: "CoursesSite",
    capabilities: ["courses", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#4F46E5",
      secondaryColor: "#0EA5E9",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeCoursePages("courses"),
    authenticSections: COURSES_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-courses", label: "Courses", url: "/courses" },
      { id: "nav-curriculum", label: "Programs", url: "/programs" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 24. COURSES - LAYOUT 2
  "courses-2@v1": {
    id: "courses-2@v1",
    version: "1.0.0",
    name: "Modern University & Courses (Layout 2)",
    category: "courses",
    variant: "layout-2",
    shellLayout: "CoursesLayout2",
    bodyComponent: "CoursesSite2",
    capabilities: ["courses", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#F59E0B",
      accentColor: "#10B981",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "2xl",
    },
    defaultPages: makeCoursePages("courses"),
    authenticSections: COURSES_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-courses", label: "Courses", url: "/courses" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 25. COURSES - LAYOUT 3
  "courses-3@v1": {
    id: "courses-3@v1",
    version: "1.0.0",
    name: "Executive Bootcamp (Layout 3)",
    category: "courses",
    variant: "layout-3",
    shellLayout: "CoursesLayout3",
    bodyComponent: "CoursesSite3",
    capabilities: ["courses", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#38BDF8",
      accentColor: "#F59E0B",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeCoursePages("courses"),
    authenticSections: COURSES_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-courses", label: "Courses", url: "/courses" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 26. AUTOMOTIVE - DEALERSHIP 1
  "automotive@v1": {
    id: "automotive@v1",
    version: "1.0.0",
    name: "Premier Car Dealership & Motors (Layout 1)",
    category: "automotive",
    variant: "dealership-1",
    shellLayout: "AutomotiveLayout",
    bodyComponent: "AutomotiveSite",
    capabilities: ["vehicles", "services", "bookings"],
    defaultTheme: {
      primaryColor: "#E11D48",
      secondaryColor: "#0F172A",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-inventory", slug: "inventory", title: "Vehicle Inventory", pageType: "PRODUCT_LIST", nativeSubpath: "automotive/products" },
      { id: "p-about", slug: "about", title: "About Us", pageType: "ABOUT", nativeSubpath: "automotive/about" },
      { id: "p-contact", slug: "contact", title: "Contact Dealership", pageType: "CONTACT", nativeSubpath: "automotive/contact" },
    ],
    authenticSections: AUTOMOTIVE_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-inventory", label: "Showroom", url: "/inventory" },
      { id: "nav-financing", label: "How It Works", url: "/#how-it-works" },
      { id: "nav-locations", label: "Dealerships", url: "/locations" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 27. AUTOMOTIVE - DEALERSHIP 2
  "automotive-2@v1": {
    id: "automotive-2@v1",
    version: "1.0.0",
    name: "Luxury Motors Dealership (Layout 2)",
    category: "automotive",
    variant: "dealership-2",
    shellLayout: "Automotive2Layout",
    bodyComponent: "Automotive2Site",
    capabilities: ["vehicles", "services", "bookings"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#D97706",
      accentColor: "#38BDF8",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "none",
      cardRadius: "md",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-inventory", slug: "inventory", title: "Showroom", pageType: "PRODUCT_LIST", nativeSubpath: "automotive/products" },
      { id: "p-about", slug: "about", title: "About", pageType: "ABOUT", nativeSubpath: "automotive/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "automotive/contact" },
    ],
    authenticSections: AUTOMOTIVE_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-inventory", label: "Showroom", url: "/inventory" },
      { id: "nav-financing", label: "How It Works", url: "/#how-it-works" },
      { id: "nav-locations", label: "Dealerships", url: "/locations" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 28. SECURITY
  "security@v1": {
    id: "security@v1",
    version: "1.0.0",
    name: "Security Guarding & Systems (Layout 1)",
    category: "security",
    variant: "services",
    shellLayout: "SecurityLayout",
    bodyComponent: "SecuritySite",
    capabilities: ["services", "bookings"],
    defaultTheme: {
      primaryColor: "#1E3A8A",
      secondaryColor: "#D97706",
      accentColor: "#10B981",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeBookingPages("security"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 29. SECURITY 2
  "security-2@v1": {
    id: "security-2@v1",
    version: "1.0.0",
    name: "Cyber & Security Consulting (Layout 2)",
    category: "security",
    variant: "consulting",
    shellLayout: "Security2Layout",
    bodyComponent: "Security2Site",
    capabilities: ["services", "bookings"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#06B6D4",
      accentColor: "#F59E0B",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "sm",
      cardRadius: "lg",
    },
    defaultPages: makeBookingPages("security2"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 30. CONSULTANCY
  "consultancy@v1": {
    id: "consultancy@v1",
    version: "1.0.0",
    name: "Executive Advisory & Business Coaching",
    category: "consultancy",
    variant: "default",
    shellLayout: "ConsultancyLayout",
    bodyComponent: "ConsultancySite",
    capabilities: ["services", "bookings", "reviews"],
    defaultTheme: {
      primaryColor: "#1E293B",
      secondaryColor: "#CA8A04",
      accentColor: "#0284C7",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeBookingPages("consultant"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 31. PUBLIC SPEAKING
  "public-speaking@v1": {
    id: "public-speaking@v1",
    version: "1.0.0",
    name: "Keynote Speaker & Author",
    category: "publicspeaking",
    variant: "default",
    shellLayout: "PublicSpeakingLayout",
    bodyComponent: "PublicSpeakingSite",
    capabilities: ["services", "bookings", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#E11D48",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "xl",
    },
    defaultPages: makeBookingPages("publicspeaking"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 32. SERVICES
  "services@v1": {
    id: "services@v1",
    version: "1.0.0",
    name: "Professional Agency & Service Provider",
    category: "services",
    variant: "default",
    shellLayout: "ServicesLayout",
    bodyComponent: "ServiceSite",
    capabilities: ["services", "bookings", "reviews"],
    defaultTheme: {
      primaryColor: "#4F46E5",
      secondaryColor: "#0EA5E9",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeBookingPages("service-provider"),
    authenticSections: SERVICES_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-services", label: "Services", url: "/services" },
      { id: "nav-pricing", label: "Pricing", url: "/pricing" },
      { id: "nav-about", label: "About Us", url: "/about" },
      { id: "nav-contact", label: "Book Slot", url: "/contact" },
    ]),
  },

  // 33. BOOKINGS
  "bookings@v1": {
    id: "bookings@v1",
    version: "1.0.0",
    name: "General Appointment & Booking Hub",
    category: "bookings",
    variant: "default",
    shellLayout: "BookingsLayout",
    bodyComponent: "BookingsSite",
    capabilities: ["services", "bookings", "reviews"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeBookingPages("bookings"),
    authenticSections: BARBERSHOP_BOOKINGS_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-services", label: "Services", url: "/services" },
      { id: "nav-booking", label: "Book Appointment", url: "/booking" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 34. BARBERSHOP
  "barbershop@v1": {
    id: "barbershop@v1",
    version: "1.0.0",
    name: "Classic Barbershop & Grooming",
    category: "bookings",
    variant: "barbershop",
    shellLayout: "BarbershopBookingsLayout",
    bodyComponent: "BarbershopBookingsSite",
    capabilities: ["services", "bookings", "reviews"],
    defaultTheme: {
      primaryColor: "#78350F",
      secondaryColor: "#D97706",
      accentColor: "#DC2626",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "none",
      cardRadius: "md",
    },
    defaultPages: makeBookingPages("bookings"),
    authenticSections: BARBERSHOP_BOOKINGS_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-services", label: "Services", url: "/services" },
      { id: "nav-gallery", label: "Style Gallery", url: "/gallery" },
      { id: "nav-booking", label: "Reserve Chair", url: "/booking" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 35. DRYCLEANING
  "drycleaning@v1": {
    id: "drycleaning@v1",
    version: "1.0.0",
    name: "Drycleaning & Laundry Express",
    category: "bookings",
    variant: "drycleaning",
    shellLayout: "DrycleaningBookingsLayout",
    bodyComponent: "DrycleaningBookingsSite",
    capabilities: ["services", "bookings", "reviews"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#0D9488",
      accentColor: "#F59E0B",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeBookingPages("bookings"),
    authenticSections: SERVICES_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-services", label: "Services", url: "/services" },
      { id: "nav-booking", label: "Schedule Pickup", url: "/booking" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 36. REAL ESTATE
  "real-estate@v1": {
    id: "real-estate@v1",
    version: "1.0.0",
    name: "Luxury Properties & Realty",
    category: "realestate",
    variant: "default",
    shellLayout: "RealEstateLayout",
    bodyComponent: "RealEstateSite",
    capabilities: ["properties", "services", "bookings"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#D97706",
      accentColor: "#059669",
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-properties", slug: "properties", title: "Properties", pageType: "PROPERTY_LIST", nativeSubpath: "realestate/products" },
      { id: "p-about", slug: "about", title: "About", pageType: "ABOUT", nativeSubpath: "realestate/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "realestate/contact" },
    ],
    authenticSections: REAL_ESTATE_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-properties", label: "Properties", url: "/listings" },
      { id: "nav-agents", label: "Agents", url: "/agents" },
      { id: "nav-locations", label: "Locations", url: "/locations" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 37. PROPERTY MANAGEMENT
  "property-management@v1": {
    id: "property-management@v1",
    version: "1.0.0",
    name: "Property Asset & Tenancy Management",
    category: "realestate",
    variant: "management",
    shellLayout: "PropertyManagementLayout",
    bodyComponent: "PropertyManagementSite",
    capabilities: ["properties", "services", "bookings"],
    defaultTheme: {
      primaryColor: "#1E293B",
      secondaryColor: "#0284C7",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-listings", slug: "listings", title: "Managed Listings", pageType: "PROPERTY_LIST", nativeSubpath: "propertymanagement/products" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "propertymanagement/contact" },
    ],
    authenticSections: REAL_ESTATE_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-properties", label: "Managed Properties", url: "/listings" },
      { id: "nav-services", label: "Management Services", url: "/services" },
      { id: "nav-contact", label: "Contact Us", url: "/contact" },
    ]),
  },

  // 38. RESTAURANT
  "restaurant@v1": {
    id: "restaurant@v1",
    version: "1.0.0",
    name: "Bistro, Restaurant & Food Delivery",
    category: "restaurant",
    variant: "default",
    shellLayout: "RestaurantLayout",
    bodyComponent: "RestaurentSite",
    capabilities: ["restaurant_menu", "cart_checkout", "bookings"],
    defaultTheme: {
      primaryColor: "#DC2626",
      secondaryColor: "#F59E0B",
      accentColor: "#16A34A",
      headingFont: "Merriweather, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-menu", slug: "menu", title: "Online Menu", pageType: "PRODUCT_LIST", nativeSubpath: "restaurent/products" },
      { id: "p-about", slug: "about", title: "Our Kitchen", pageType: "ABOUT", nativeSubpath: "restaurent/about" },
      { id: "p-contact", slug: "contact", title: "Find Us", pageType: "CONTACT", nativeSubpath: "restaurent/contact" },
    ],
    authenticSections: RESTAURANT_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-menu", label: "Menu", url: "/menu" },
      { id: "nav-about", label: "Our Story", url: "/about" },
      { id: "nav-gallery", label: "Gallery", url: "/gallery" },
      { id: "nav-contact", label: "Find Us", url: "/contact" },
    ]),
  },

  // 39. HEALTHCARE
  "healthcare@v1": {
    id: "healthcare@v1",
    version: "1.0.0",
    name: "Medical Clinic & Health Center",
    category: "healthcare",
    variant: "default",
    shellLayout: "HealthcareLayout",
    bodyComponent: "HealthCareSite",
    capabilities: ["services", "bookings"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#0D9488",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeBookingPages("healthcare"),
    authenticSections: HEALTHCARE_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-services", label: "Services", url: "/services" },
      { id: "nav-doctors", label: "Specialists", url: "/doctors" },
      { id: "nav-about", label: "About Clinic", url: "/about" },
      { id: "nav-contact", label: "Appointments", url: "/contact" },
    ]),
  },

  // 40. FITNESS
  "fitness@v1": {
    id: "fitness@v1",
    version: "1.0.0",
    name: "Gym, Fitness & Personal Training",
    category: "fitness",
    variant: "default",
    shellLayout: "FitnessLayout",
    bodyComponent: "FitnessSite",
    capabilities: ["services", "bookings", "cart_checkout"],
    defaultTheme: {
      primaryColor: "#E11D48",
      secondaryColor: "#0F172A",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "xl",
    },
    defaultPages: makeBookingPages("fitness"),
    authenticSections: FITNESS_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-classes", label: "Classes", url: "/classes" },
      { id: "nav-trainers", label: "Coaches", url: "/trainers" },
      { id: "nav-locations", label: "Locations", url: "/locations" },
      { id: "nav-contact", label: "Free Pass", url: "/contact" },
    ]),
  },

  // 41. FINANCE
  "finance@v1": {
    id: "finance@v1",
    version: "1.0.0",
    name: "Wealth Advisory & Financial Solutions",
    category: "finance",
    variant: "default",
    shellLayout: "FinanceLayout",
    bodyComponent: "FinanceSite",
    capabilities: ["services", "bookings"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#059669",
      accentColor: "#D97706",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeBookingPages("finance"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 42. TRAVEL
  "travel@v1": {
    id: "travel@v1",
    version: "1.0.0",
    name: "Safari Expeditions & Travel Agency",
    category: "travel",
    variant: "default",
    shellLayout: "TravelLayout",
    bodyComponent: "TravelSite",
    capabilities: ["services", "bookings", "cart_checkout"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#D97706",
      accentColor: "#15803D",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "2xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-packages", slug: "packages", title: "Tour Packages", pageType: "PRODUCT_LIST", nativeSubpath: "travel/products" },
      { id: "p-about", slug: "about", title: "About Us", pageType: "ABOUT", nativeSubpath: "travel/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "travel/contact" },
    ],
    authenticSections: TRAVEL_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-destinations", label: "Destinations", url: "/destinations" },
      { id: "nav-tours", label: "Tour Packages", url: "/tours" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Inquire", url: "/contact" },
    ]),
  },

  // 43. SAAS
  "saas@v1": {
    id: "saas@v1",
    version: "1.0.0",
    name: "Cloud Software & Tech Platform",
    category: "saas",
    variant: "default",
    shellLayout: "SaaSLayout",
    bodyComponent: "SaaSSite",
    capabilities: ["services", "reviews"],
    defaultTheme: {
      primaryColor: "#6366F1",
      secondaryColor: "#06B6D4",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-about", slug: "about", title: "About", pageType: "ABOUT", nativeSubpath: "saas/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "saas/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 44. MARKETPLACE
  "marketplace@v1": {
    id: "marketplace@v1",
    version: "1.0.0",
    name: "Multi-Vendor Marketplace",
    category: "marketplace",
    variant: "default",
    shellLayout: "MarketplaceLayout",
    bodyComponent: "MarketPlaceSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#F43F5E",
      secondaryColor: "#F59E0B",
      accentColor: "#6366F1",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("marketplace"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 45. PORTFOLIO
  "portfolio@v1": {
    id: "portfolio@v1",
    version: "1.0.0",
    name: "Creative Portfolio & CV",
    category: "portfolio",
    variant: "default",
    shellLayout: "PortfolioLayout",
    bodyComponent: "PortfolioSite",
    capabilities: ["services", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#6366F1",
      accentColor: "#F43F5E",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-about", slug: "about", title: "About Me", pageType: "ABOUT", nativeSubpath: "portfolio/about" },
      { id: "p-contact", slug: "contact", title: "Get in Touch", pageType: "CONTACT", nativeSubpath: "portfolio/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 46. COMPANY PORTFOLIO
  "company-portfolio@v1": {
    id: "company-portfolio@v1",
    version: "1.0.0",
    name: "Corporate Enterprise Portfolio (Dark)",
    category: "corporate",
    variant: "dark",
    shellLayout: "CompanyPortfolioLayout",
    bodyComponent: "CompanyPortfolioSite",
    capabilities: ["services", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#38BDF8",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "none",
      cardRadius: "md",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-about", slug: "about", title: "Company", pageType: "ABOUT", nativeSubpath: "companyprofile/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "companyprofile/contact" },
    ],
    authenticSections: COMPANY_PORTFOLIO_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-programs", label: "Programs", url: "/programs" },
      { id: "nav-impact", label: "Impact", url: "/impact" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 47. COMPANY PORTFOLIO LIGHT
  "company-portfolio-light@v1": {
    id: "company-portfolio-light@v1",
    version: "1.0.0",
    name: "Corporate Enterprise Portfolio (Light)",
    category: "corporate",
    variant: "light",
    shellLayout: "CompanyPortfolioLightLayout",
    bodyComponent: "CompanyPortfolioLightSite",
    capabilities: ["services", "reviews"],
    defaultTheme: {
      primaryColor: "#1E293B",
      secondaryColor: "#0284C7",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-about", slug: "about", title: "About Us", pageType: "ABOUT", nativeSubpath: "companyprofilelight/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "companyprofilelight/contact" },
    ],
    authenticSections: COMPANY_PORTFOLIO_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-programs", label: "Programs", url: "/programs" },
      { id: "nav-impact", label: "Impact", url: "/impact" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },

  // 48. BLOG
  "blog@v1": {
    id: "blog@v1",
    version: "1.0.0",
    name: "Digital Magazine & Editorial Blog",
    category: "blog",
    variant: "default",
    shellLayout: "BlogLayout",
    bodyComponent: "BlogSite",
    capabilities: ["blog", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#DC2626",
      accentColor: "#D97706",
      headingFont: "Merriweather, serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "sm",
      cardRadius: "md",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-about", slug: "about", title: "About", pageType: "ABOUT", nativeSubpath: "blog/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "blog/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 49. MEDIA
  "media@v1": {
    id: "media@v1",
    version: "1.0.0",
    name: "Film Studio & Media Entertainment",
    category: "media",
    variant: "default",
    shellLayout: "MediaLayout",
    bodyComponent: "MediaSite",
    capabilities: ["services", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#E11D48",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-about", slug: "about", title: "Studio", pageType: "ABOUT", nativeSubpath: "media/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "media/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 50. NONPROFIT
  "nonprofit@v1": {
    id: "nonprofit@v1",
    version: "1.0.0",
    name: "Charity, Foundation & NGO",
    category: "nonprofit",
    variant: "default",
    shellLayout: "NonprofitLayout",
    bodyComponent: "NonProfitSite",
    capabilities: ["donations", "services"],
    defaultTheme: {
      primaryColor: "#059669",
      secondaryColor: "#D97706",
      accentColor: "#0284C7",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-about", slug: "about", title: "Our Mission", pageType: "ABOUT", nativeSubpath: "nonprofit/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "nonprofit/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 51. DELIVERY & LOGISTICS
  "delivery@v1": {
    id: "delivery@v1",
    version: "1.0.0",
    name: "Courier & Express Logistics",
    category: "logistics",
    variant: "default",
    shellLayout: "DeliveryLayout",
    bodyComponent: "DeliverySite",
    capabilities: ["services"],
    defaultTheme: {
      primaryColor: "#EA580C",
      secondaryColor: "#1E293B",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-track", slug: "track", title: "Track Shipment", pageType: "CUSTOM", nativeSubpath: "logistics/track" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "logistics/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 52. DIRECTORY
  "directory@v1": {
    id: "directory@v1",
    version: "1.0.0",
    name: "Local Business Directory",
    category: "directory",
    variant: "default",
    shellLayout: "DirectoryLayout",
    bodyComponent: "DirectorySite",
    capabilities: ["services", "reviews"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#F59E0B",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-directory", slug: "directory", title: "Listings", pageType: "CUSTOM", nativeSubpath: "directory/listings" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "directory/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 53. EVENTS
  "events@v1": {
    id: "events@v1",
    version: "1.0.0",
    name: "Event Ticketing & Experiences",
    category: "events",
    variant: "default",
    shellLayout: "EventsLayout",
    bodyComponent: "EventsSite",
    capabilities: ["bookings", "cart_checkout"],
    defaultTheme: {
      primaryColor: "#7C3AED",
      secondaryColor: "#EC4899",
      accentColor: "#F59E0B",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "2xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-events", slug: "events", title: "Browse Events", pageType: "PRODUCT_LIST", nativeSubpath: "events/products" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "events/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 54. GHUBA SUPER APP
  "ghuba@v1": {
    id: "ghuba@v1",
    version: "1.0.0",
    name: "Ghuba Super App Ecosystem",
    category: "portal",
    variant: "default",
    shellLayout: "GhubaLayout",
    bodyComponent: "GhubaSite",
    capabilities: ["products", "services", "bookings"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: [
      { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
      { id: "p-about", slug: "about", title: "About Ghuba", pageType: "ABOUT", nativeSubpath: "ghuba/about" },
      { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: "ghuba/contact" },
    ],
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },

  // 55. DEFAULT SITE
  "default-site@v1": {
    id: "default-site@v1",
    version: "1.0.0",
    name: "Universal Clean Storefront",
    category: "general",
    variant: "default",
    shellLayout: "DefaultLayout",
    bodyComponent: "DefaultSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#F43F5E",
      secondaryColor: "#FBBF24",
      accentColor: "#6366F1",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("other"),
    authenticSections: STANDARD_ECOMMERCE_SECTIONS,
  },
};

/* =========================================================================
   ALIAS NORMALIZATION & DETERMINISTIC RESOLVER
   ========================================================================= */

// String normalizer
export function normalizeKey(value?: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Canonical alias map
const ALIAS_TO_CANONICAL_ID: Record<string, string> = {
  // Shoes
  "shoes-store": "ecommerce-shoes@v1",
  "shoes-store-classic": "ecommerce-shoes@v1",
  "shoes": "ecommerce-shoes@v1",
  "shoesstore": "ecommerce-shoes@v1",
  "ecommerceshoes": "ecommerce-shoes@v1",

  // Gaming
  "gaming-store": "ecommerce-gaming@v1",
  "gaming": "ecommerce-gaming@v1",
  "gamingecommerce": "ecommerce-gaming@v1",

  // Agrovet
  "agrovet-store": "ecommerce-agrovet@v1",
  "agrovet": "ecommerce-agrovet@v1",
  "agrovetecommerce": "ecommerce-agrovet@v1",

  // Meat
  "modern-meat-store": "ecommerce-meat@v1",
  "meat-store": "ecommerce-meat@v1",
  "meat": "ecommerce-meat@v1",
  "meatecommerce": "ecommerce-meat@v1",

  // Hardware
  "hardware-store": "ecommerce-hardware@v1",
  "hardware": "ecommerce-hardware@v1",
  "hardwareecommerce": "ecommerce-hardware@v1",

  // Watches
  "watch-store": "ecommerce-watch@v1",
  "watch": "ecommerce-watch@v1",
  "watchecommerce": "ecommerce-watch@v1",

  // Flowers
  "flowers-store": "ecommerce-flowers@v1",
  "flowers": "ecommerce-flowers@v1",
  "flowersecommerce": "ecommerce-flowers@v1",

  // Honey
  "honey-store": "ecommerce-honey@v1",
  "honey": "ecommerce-honey@v1",
  "honeyecommerce": "ecommerce-honey@v1",

  // Peanuts
  "peanuts-store": "ecommerce-peanuts@v1",
  "peanuts": "ecommerce-peanuts@v1",
  "peanutecommerce": "ecommerce-peanuts@v1",

  // Baby
  "baby-store": "ecommerce-baby@v1",
  "baby": "ecommerce-baby@v1",
  "babyecommerce": "ecommerce-baby@v1",

  // Cake
  "cake-store": "ecommerce-cake@v1",
  "cake": "ecommerce-cake@v1",
  "cakeecommerce": "ecommerce-cake@v1",

  // Pets
  "pets-store": "ecommerce-pets@v1",
  "pets": "ecommerce-pets@v1",
  "petsecommerce": "ecommerce-pets@v1",

  // Groceries
  "groceries-store": "ecommerce-groceries@v1",
  "groceries": "ecommerce-groceries@v1",
  "groceriesecommerce": "ecommerce-groceries@v1",

  // Bike
  "bike-store": "ecommerce-bike@v1",
  "bike": "ecommerce-bike@v1",
  "bikeecommerce": "ecommerce-bike@v1",

  // Motorcycle
  "motorcycle-store": "ecommerce-motorcycle@v1",
  "motorcycle": "ecommerce-motorcycle@v1",
  "motorcycleecommerce": "ecommerce-motorcycle@v1",

  // Book
  "book-store": "ecommerce-book@v1",
  "book": "ecommerce-book@v1",
  "bookecommerce": "ecommerce-book@v1",

  // Accessories
  "automotive-store": "ecommerce-accessories@v1",
  "accessories": "ecommerce-accessories@v1",

  // Earphones & Glasses
  "earphones-store": "ecommerce-earphones@v1",
  "earphones": "ecommerce-earphones@v1",
  "glasses-store": "ecommerce-glasses@v1",
  "glasses": "ecommerce-glasses@v1",

  // Fashion & Furniture
  "fashion": "fashion@v1",
  "modern-fashion-store": "fashion@v1",
  "furniture": "furniture@v1",
  "modern-furniture-store": "furniture@v1",

  // Courses
  "courses": "courses@v1",
  "educational": "courses@v1",
  "online-learning": "courses@v1",
  "courses-layout-2": "courses-2@v1",
  "courses-2": "courses-2@v1",
  "courses-layout-3": "courses-3@v1",
  "courses-3": "courses-3@v1",

  // Automotive
  "automotive": "automotive@v1",
  "car-dealership": "automotive@v1",
  "car-dealership-2": "automotive-2@v1",
  "automotive-2": "automotive-2@v1",

  // Security
  "security": "security@v1",
  "security-services": "security@v1",
  "security-consulting": "security-2@v1",
  "security-2": "security-2@v1",

  // Consultancy & Speaking
  "consultancy": "consultancy@v1",
  "consultant-coach": "consultancy@v1",
  "public-speaking": "public-speaking@v1",
  "standard-speaker-site": "public-speaking@v1",

  // Services & Bookings
  "services": "services@v1",
  "service-provider": "services@v1",
  "bookings": "bookings@v1",
  "booking-appointments": "bookings@v1",
  "barbershop-store": "barbershop@v1",
  "barbershop": "barbershop@v1",
  "drycleaning": "drycleaning@v1",

  // Real estate
  "real-estate": "real-estate@v1",
  "property-listings": "real-estate@v1",
  "property-management": "property-management@v1",
  "property-manager": "property-management@v1",

  // Others
  "restaurant": "restaurant@v1",
  "food-delivery": "restaurant@v1",
  "healthcare": "healthcare@v1",
  "clinic-pro": "healthcare@v1",
  "fitness": "fitness@v1",
  "gym-fitness": "fitness@v1",
  "finance": "finance@v1",
  "travel": "travel@v1",
  "saas": "saas@v1",
  "marketplace": "marketplace@v1",
  "portfolio": "portfolio@v1",
  "company-portfolio": "company-portfolio@v1",
  "company-portfolio-light": "company-portfolio-light@v1",
  "blog": "blog@v1",
  "media": "media@v1",
  "nonprofit": "nonprofit@v1",
  "delivery": "delivery@v1",
  "delivery-service": "delivery@v1",
  "directory": "directory@v1",
  "ghuba": "ghuba@v1",
  "ecommerce": "ecommerce-default@v1",
  "default": "default-site@v1",
};

// Auto-register direct canonical IDs, version-stripped IDs, and names into ALIAS_TO_CANONICAL_ID
for (const template of Object.values(TEMPLATE_REGISTRY)) {
  if (!template || !template.id) {
    console.error("TEMPLATE WITHOUT ID:", template);
    continue;
  }
  const normId = normalizeKey(template.id);
  ALIAS_TO_CANONICAL_ID[normId] = template.id;
  const strippedId = normalizeKey(template.id.replace(/@v\d+$/, ""));
  ALIAS_TO_CANONICAL_ID[strippedId] = template.id;
  if (template.name) {
    ALIAS_TO_CANONICAL_ID[normalizeKey(template.name)] = template.id;
  }
}

/**
 * Deterministically resolves a canonical TemplateDefinition from:
 * 1. Explicit tenant canonical template (direct match in registry, prioritizing specific template over generic defaults if a variant is given)
 * 2. Explicit tenant template variant
 * 3. Migrated legacy template identity
 * 4. Registry alias normalization
 * 5. Category + variant resolution
 * 6. Safe fallback to default-site@v1
 */
export function resolveCanonicalTemplate(
  category?: string,
  variant?: string,
  explicitTemplateId?: string,
): TemplateDefinition {
  // Stage 1: Explicit canonical template ID match (if specific)
  if (explicitTemplateId) {
    const directMatch = TEMPLATE_REGISTRY[explicitTemplateId];
    if (directMatch) {
      // If it's default-site@v1 placeholder BUT the tenant has an explicit business variant, let the variant resolve
      const isPlaceholder = directMatch.id === "default-site@v1";
      const hasSpecificVariant = variant && normalizeKey(variant) !== "default" && normalizeKey(variant) !== "other";
      if (!isPlaceholder || !hasSpecificVariant) {
        return directMatch;
      }
    }
  }

  // Stage 2: Explicit tenant template variant (most specific business intent)
  if (variant) {
    const normVariant = normalizeKey(variant);
    const resolvedId = ALIAS_TO_CANONICAL_ID[normVariant];
    if (resolvedId && TEMPLATE_REGISTRY[resolvedId]) {
      return TEMPLATE_REGISTRY[resolvedId];
    }
  }

  // Stage 3 & 4: Migrated legacy template identity & Registry alias normalization on explicitTemplateId
  if (explicitTemplateId) {
    const normExplicit = normalizeKey(explicitTemplateId);
    const resolvedId = ALIAS_TO_CANONICAL_ID[normExplicit];
    if (resolvedId && TEMPLATE_REGISTRY[resolvedId]) {
      return TEMPLATE_REGISTRY[resolvedId];
    }
  }

  // Stage 5: Category + variant combined resolution or category alone
  if (category && variant) {
    const combinedNorm = normalizeKey(`${category}-${variant}`);
    const resolvedId = ALIAS_TO_CANONICAL_ID[combinedNorm];
    if (resolvedId && TEMPLATE_REGISTRY[resolvedId]) {
      return TEMPLATE_REGISTRY[resolvedId];
    }
  }

  if (category) {
    const normCat = normalizeKey(category);
    const resolvedId = ALIAS_TO_CANONICAL_ID[normCat];
    if (resolvedId && TEMPLATE_REGISTRY[resolvedId]) {
      return TEMPLATE_REGISTRY[resolvedId];
    }
  }

  // If explicitTemplateId was a generic default but nothing more specific resolved, return it
  if (explicitTemplateId && TEMPLATE_REGISTRY[explicitTemplateId]) {
    return TEMPLATE_REGISTRY[explicitTemplateId];
  }

  // Stage 6: Safe fallback to default template with non-silent warning log
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[TemplateResolver] Unknown template identity (cat: '${category}', variant: '${variant}', id: '${explicitTemplateId}'). Falling back to 'default-site@v1'.`
    );
  }

  return TEMPLATE_REGISTRY["default-site@v1"];
}

/**
 * Gets a template definition directly by its canonical ID
 */
export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY[id];
}

/**
 * Returns all 56 registered templates for admin catalog and palette selection
 */
export function getAllTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATE_REGISTRY);
}

/**
 * Resolves a company's canonical template
 */
export function getTemplateForCompany(company: any): TemplateDefinition {
  const explicitId = company?.website?.templateKey || company?.website?.templateId;
  return resolveCanonicalTemplate(company?.category, company?.variant, explicitId);
}



/**
 * Returns all templates that match a business category
 */
export function getTemplatesForCategory(category: string): TemplateDefinition[] {
  const norm = normalizeKey(category);
  return getAllTemplates().filter((t) => {
    const tCat = normalizeKey(t.category);
    return (
      tCat === norm ||
      (norm === "ecommerce" && tCat.startsWith("ecommerce")) ||
      (norm === "real-estate" && (tCat === "realestate" || tCat === "propertymanagement")) ||
      (norm === "bookings" && tCat === "bookings")
    );
  });
}
