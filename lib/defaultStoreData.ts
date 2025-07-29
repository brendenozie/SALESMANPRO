
import { PolicyType, SectionType, SocialChannel, StoreForm } from "../types/typings";

const now = new Date();
const in3Days = new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString();
const in1Day  = new Date(now.getTime() +   1 * 24 * 3600 * 1000).toISOString();

// 1) Define your master baseData
const baseData: Partial<StoreForm> = {
  tagline: "",
  description: "",
  currency: "USD",
  locale: "en-US",
  companyCategoryId: undefined,
  socialLinks: [],
  policies: [],
  faqs: [],
  testimonials: [],
  heroSlides: [],
  promotions: [],
  pageSections: [],
  storeCategories: [],
  appPromos: [],
  collections: [],
  events: [],
  announcements: [],
  awards: [],
  metrics: [],
  stats: [],
  pricingTiers: [],
  themeSettings: {},
  seo: {},
  analyticsConfig: {},
  paymentSettings: {},
  shippingSettings: {},
};

// 2) Helper to merge category‑specific overrides
function withOverrides(overrides: Partial<StoreForm>): Partial<StoreForm> {
  return {
    ...baseData,
    ...overrides,
    // Ensure date fields in promotions are strings
    promotions: (overrides.promotions || []).map(promo => ({
      ...promo,
      startsAt: promo.startsAt || now.toISOString(),
      endsAt:   promo.endsAt   || in3Days,
    })),
  };
}

// 3) All your categories in one map:
export function getCategoryDefaultData(category: string): Partial<StoreForm> {
  const samples: Record<string, Partial<StoreForm>> = {
    "E-commerce": withOverrides({
      tagline: "Shop the Best Deals Online",
      description: "From gadgets to fashion, find everything you need in one place.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/shop" },
        { channel: SocialChannel.INSTAGRAM, url: "https://insta.com/shop" },
      ],
      policies: [
        { type: PolicyType.SHIPPING, content: "Free shipping over $50." },
        { type: PolicyType.RETURNS,  content: "30-day money-back guarantee." },
      ],
      faqs: [
        { question: "What payment methods?", answer: "Visa, Mastercard, PayPal.", order: 1 },
      ],
      testimonials: [
        { author: "Alex R.", quote: "Fast delivery!", rating: 5 },
      ],
      heroSlides: [
        { imageUrl: "/images/samples/ecom1.jpg", headline: "Summer Sale 70% Off", subline: "Limited time!", ctaText: "Buy Now", ctaLink: "/shop" },
      ],
      promotions: [
        { title: "Weekend Flash Sale", description: "Extra 10% off.", ctaText: "Shop", ctaLink: "/deals", bannerUrl: "/images/samples/deal.jpg" },
      ],
      pageSections: [
        {
          type: SectionType.FeatureGrid,
          order: 1,
          settings: { background: "light" },
          content: { headline: "Top Picks", blocks: [{ title: "Electronics", description: "Latest tech." }] },
        },
      ],
      collections: [{ name: "Best Sellers", description: "Our top selling products." } as any],
      events:       [{ title: "Live Q&A", date: in1Day } as any],
      announcements:[{ message: "Site maintenance Sunday." } as any],
      awards:       [{ name: "Top Shop 2025", iconUrl: "/icons/award.svg" }],
      metrics:      [{ label: "Products", value: 1200 }],
      stats:        [{ label: "Visits Today", value: "3000" }],
      pricingTiers: [{ name: "Basic", price: 0, duration: "monthly", features: ["Access to shop"] }],
    }),

    "Service Provider": withOverrides({
      tagline: "Services You Can Trust",
      description: "Connect with vetted professionals quickly.",
      socialLinks: [{ channel: SocialChannel.LINKEDIN, url: "https://linkedin.com/company/services" }],
      policies:    [{ type: PolicyType.TERMS, content: "Service terms apply." }],
      faqs:        [{ question: "Trusted providers?", answer: "All background-checked.", order: 1 }],
      testimonials:[{ author: "Mia K.", quote: "Excellent service!", rating: 5 }],
      heroSlides:  [{ imageUrl: "/images/samples/service1.jpg", headline: "Expert Pros", subline: "Book online", ctaText: "View", ctaLink: "/services" }],
      pageSections:[{ type: SectionType.Services, order: 1, settings: {}, content: { headline: "Our Services", blocks: [{ title: "Plumbing", description: "24/7 plumbing." }] } }],
      events:       [{ title: "Free Consultation", date: in1Day } as any],
      announcements:[{ message: "New service launched." } as any],
      awards:       [{ name: "Best Service 2024", iconUrl: "/icons/service-award.svg" }],
      metrics:      [{ label: "Clients Served", value: 500 }],
      stats:        [{ label: "5-Star Rating", value: "4.8/5" }],
      pricingTiers: [{ name: "Standard", price: 50, duration: "hourly", features: ["Quality guarantee"] }],
    }),

    "Booking & Appointments": withOverrides({
      tagline: "Book in Minutes",
      description: "Schedule appointments online seamlessly.",
      socialLinks: [{ channel: SocialChannel.FACEBOOK, url: "https://fb.com/booking" }],
      policies:    [{ type: PolicyType.PRIVACY, content: "Your data is safe." }],
      faqs:        [{ question: "Reschedule?", answer: "Up to 24h before.", order: 1 }],
      testimonials:[{ author: "John D.", quote: "Smooth booking experience.", rating: 4 }],
      heroSlides:  [{ imageUrl: "/images/samples/booking1.jpg", headline: "Schedule Now", subline: "Instant confirmation", ctaText: "Book", ctaLink: "/appointments" }],
      pageSections:[{ type: SectionType.HowItWorks, order: 1, settings: {}, content: { headline: "How It Works", steps: ["Select", "Confirm"] } }],
      metrics:      [{ label: "Bookings", value: 120 }],
      stats:        [{ label: "Confirmed", value: "95%" }],
      pricingTiers: [{ name: "Standard", price: 20, duration: "per appointment", features: ["Online support"] }],
    }),

    // …and finally stub every other category simply by spreading baseData:
    "Portfolio & Personal Branding": withOverrides({
      tagline: "Showcase Your Best Work",
      description: "Highlight your skills & achievements.",
      // add only what’s unique; everything else is guaranteed to exist
    }),
    "Blog & Content":                   withOverrides({ tagline: "Insights & Stories" }),
    "Directory & Listings":             withOverrides({ tagline: "Find What You Need" }),
    "Educational & Online Courses":     withOverrides({ tagline: "Learn New Skills" }),
    "Nonprofit & Community":            withOverrides({ tagline: "Making a Difference" }),
    "Restaurant & Food Delivery":       withOverrides({ tagline: "Delicious Food Delivered", heroSlides: [{ imageUrl: "/images/samples/restaurant1.jpg", headline: "Hot & Fresh Pizza", subline: "Order Now", ctaText: "Menu", ctaLink: "/menu" }] }),
    "Event & Ticketing":                withOverrides({ tagline: "Discover Events" }),
    "Real Estate":                      withOverrides({ tagline: "Your Key to a New Home" }),
    "Healthcare & Clinics":             withOverrides({ tagline: "Compassionate Care You Can Trust" }),
    "SaaS & Web Apps":                  withOverrides({ tagline: "Powerful Software Solutions" }),
    "Media & Entertainment":            withOverrides({ tagline: "Your Source of Entertainment" }),
    "Finance & Legal":                  withOverrides({ tagline: "Expert Financial & Legal Services" }),
    "Automotive":                       withOverrides({ tagline: "Drive Your Dream Car" }),
    "Travel & Tourism":                 withOverrides({ tagline: "Explore the World" }),
    "Fitness & Wellness":               withOverrides({ tagline: "Your Health, Our Priority" }),
    "Marketplace":                      withOverrides({ tagline: "Buy & Sell Locally" }),
    "Tutors":                           withOverrides({ tagline: "Expert Tutors, Anytime" }),
    "Lecturer":                         withOverrides({ tagline: "Inspiring Lectures Online" }),
    "Teacher":                          withOverrides({ tagline: "Empowering Educators" }),
    "Students":                         withOverrides({ tagline: "Your Learning Hub" }),
    "Pupils":                           withOverrides({ tagline: "Young Learners Welcome" }),
    "Principal":                        withOverrides({ tagline: "Leadership in Education" }),
    "School Head":                      withOverrides({ tagline: "Guiding Excellence" }),
    "Other":                            withOverrides({ tagline: "Tailored Solutions for You" }),
  };

  return samples[category] || baseData;
}
