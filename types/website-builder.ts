/**
 * types/website-builder.ts
 *
 * Core TypeScript definitions, Zod validation schemas, design tokens,
 * and component registry types for the SalesmanPro AI-Powered Website Builder.
 */

import { z } from "zod";

/* =========================================================================
   1. DESIGN TOKENS & THEME
   ========================================================================= */

export const ThemeTokensSchema = z.object({
  // Colors
  primaryColor: z.string().default("#F43F5E"),
  secondaryColor: z.string().default("#FBBF24"),
  accentColor: z.string().default("#6366F1"),
  backgroundColor: z.string().default("#FFFFFF"),
  surfaceColor: z.string().default("#F8FAFC"),
  textColor: z.string().default("#0F172A"),
  mutedTextColor: z.string().default("#64748B"),
  borderColor: z.string().default("#E2E8F0"),

  // Typography
  headingFont: z.string().default("Inter, sans-serif"),
  bodyFont: z.string().default("Inter, sans-serif"),
  baseFontSize: z.enum(["sm", "md", "lg"]).default("md"),

  // Border Radii
  buttonRadius: z.enum(["none", "sm", "md", "lg", "full"]).default("lg"),
  cardRadius: z.enum(["none", "sm", "md", "lg", "xl", "2xl"]).default("xl"),
  inputRadius: z.enum(["none", "sm", "md", "lg", "full"]).default("lg"),

  // Layout & Spacing
  containerWidth: z.enum(["boxed", "standard", "wide", "full"]).default("standard"),
  sectionSpacing: z.enum(["compact", "comfortable", "spacious"]).default("comfortable"),
  cardSpacing: z.enum(["compact", "normal", "spacious"]).default("normal"),

  // Visual Effects
  glassmorphism: z.boolean().default(false),
  boxShadow: z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),
});

export type ThemeTokens = z.infer<typeof ThemeTokensSchema>;

/* =========================================================================
   2. NAVIGATION CONFIGURATION
   ========================================================================= */

export const NavItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
  isExternal: z.boolean().default(false),
  badge: z.string().optional(),
  children: z.array(z.lazy(() => NavItemSchema)).optional(),
});

export type NavItem = z.infer<typeof NavItemSchema>;

export const NavigationConfigSchema = z.object({
  headerItems: z.array(NavItemSchema).default([
    { id: "home", label: "Home", url: "/" },
    { id: "shop", label: "Shop", url: "/shop" },
    { id: "categories", label: "Categories", url: "/categories" },
    { id: "about", label: "About Us", url: "/about" },
    { id: "contact", label: "Contact", url: "/contact" },
  ]),
  footerColumns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    items: z.array(NavItemSchema),
  })).default([
    {
      id: "shop-col",
      title: "Quick Links",
      items: [
        { id: "f-shop", label: "All Products", url: "/shop" },
        { id: "f-featured", label: "Featured Deals", url: "/shop?filter=featured" },
        { id: "f-categories", label: "Categories", url: "/categories" },
      ],
    },
    {
      id: "company-col",
      title: "Company",
      items: [
        { id: "f-about", label: "Our Story", url: "/about" },
        { id: "f-contact", label: "Contact Us", url: "/contact" },
        { id: "f-faq", label: "Help & FAQ", url: "/faq" },
      ],
    },
    {
      id: "legal-col",
      title: "Customer Care",
      items: [
        { id: "f-privacy", label: "Privacy Policy", url: "/privacy" },
        { id: "f-terms", label: "Terms of Service", url: "/terms" },
        { id: "f-returns", label: "Shipping & Returns", url: "/returns" },
      ],
    },
  ]),
  headerSettings: z.object({
    sticky: z.boolean().default(true),
    showSearch: z.boolean().default(true),
    showCart: z.boolean().default(true),
    showUserAccount: z.boolean().default(true),
    showWhatsAppBtn: z.boolean().default(true),
    announcementBarText: z.string().optional().default("🔥 Free Delivery on orders over KES 3,000 | Same day dispatch"),
    showAnnouncementBar: z.boolean().default(true),
    logoHeight: z.number().default(44),
  }).default({}),
  footerSettings: z.object({
    showNewsletter: z.boolean().default(true),
    newsletterTitle: z.string().default("Stay in the Loop"),
    newsletterSubtitle: z.string().default("Subscribe for exclusive drops, offers and product launches."),
    showSocialLinks: z.boolean().default(true),
    showPaymentIcons: z.boolean().default(true),
    copyrightText: z.string().default("All rights reserved."),
  }).default({}),
});

export type NavigationConfig = z.infer<typeof NavigationConfigSchema>;

/* =========================================================================
   3. SECTION DEFINITIONS & COMMERCE DATA SOURCES
   ========================================================================= */

export const CommerceDataSourceSchema = z.object({
  type: z.enum(["products", "categories", "promotions", "testimonials", "manual"]),
  filter: z.enum(["featured", "on_offer", "trending", "latest", "best_selling", "category_id", "manual_ids"]).default("featured"),
  categoryId: z.string().optional(),
  manualIds: z.array(z.string()).optional(),
  limit: z.number().min(1).max(24).default(8),
});

export type CommerceDataSource = z.infer<typeof CommerceDataSourceSchema>;

export const SectionStyleSchema = z.object({
  paddingTop: z.enum(["none", "sm", "md", "lg", "xl"]).default("lg"),
  paddingBottom: z.enum(["none", "sm", "md", "lg", "xl"]).default("lg"),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  backgroundOverlayOpacity: z.number().min(0).max(100).default(0),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  containerWidth: z.enum(["boxed", "standard", "wide", "full"]).optional(),
});

export type SectionStyle = z.infer<typeof SectionStyleSchema>;

export const SectionResponsiveSchema = z.object({
  columnsMobile: z.number().min(1).max(3).default(1),
  columnsTablet: z.number().min(1).max(4).default(2),
  columnsDesktop: z.number().min(1).max(6).default(4),
  hideOnMobile: z.boolean().default(false),
  hideOnDesktop: z.boolean().default(false),
});

export type SectionResponsive = z.infer<typeof SectionResponsiveSchema>;

/* =========================================================================
   4. CONCRETE SECTION CONTENT SCHEMAS
   ========================================================================= */

// Hero Slide
export const HeroSlideItemSchema = z.object({
  id: z.string(),
  eyebrow: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  primaryButtonText: z.string().optional(),
  primaryButtonUrl: z.string().optional(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
  imageUrl: z.string(),
  badgeText: z.string().optional(),
});

export const HeroContentSchema = z.object({
  variant: z.enum(["slider", "split", "centered", "minimal", "banner"]).default("slider"),
  slides: z.array(HeroSlideItemSchema).default([]),
  autoplay: z.boolean().default(true),
  autoplayIntervalMs: z.number().default(5000),
});

// Product Showcase
export const ProductShowcaseContentSchema = z.object({
  title: z.string().default("Featured Collection"),
  subtitle: z.string().optional().default("Carefully curated top items for you"),
  viewAllUrl: z.string().optional().default("/shop"),
  viewAllText: z.string().optional().default("Explore All"),
  showRating: z.boolean().default(true),
  showAddToCart: z.boolean().default(true),
  showWishlist: z.boolean().default(true),
  showBadges: z.boolean().default(true),
  gridStyle: z.enum(["standard", "compact", "editorial"]).default("standard"),
});

// Category Showcase
export const CategoryShowcaseContentSchema = z.object({
  title: z.string().default("Shop by Category"),
  subtitle: z.string().optional().default("Browse our product categories"),
  layout: z.enum(["grid", "carousel", "pills"]).default("grid"),
  showProductCount: z.boolean().default(true),
});

// Image With Text / About
export const ImageWithTextContentSchema = z.object({
  title: z.string().default("Crafted with Passion & Precision"),
  subtitle: z.string().optional().default("Our Heritage"),
  description: z.string().default("We connect quality products with exceptional customer experiences across the region."),
  imageUrl: z.string().default("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"),
  imagePosition: z.enum(["left", "right"]).default("left"),
  buttonText: z.string().optional().default("Learn More"),
  buttonUrl: z.string().optional().default("/about"),
  founderQuote: z.string().optional(),
  founderName: z.string().optional(),
  stats: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
});

// Rich Text / Narrative
export const RichTextContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentHtml: z.string().default("<p>Welcome to our store. We provide top-tier products backed by reliable service.</p>"),
});

// Testimonials
export const TestimonialItemSchema = z.object({
  id: z.string(),
  author: z.string(),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  quote: z.string(),
});

export const TestimonialsContentSchema = z.object({
  title: z.string().default("What Our Customers Say"),
  subtitle: z.string().optional().default("Genuine feedback from verified shoppers"),
  testimonials: z.array(TestimonialItemSchema).default([]),
  layout: z.enum(["carousel", "grid"]).default("grid"),
});

// Trust / Features Badges
export const FeatureBadgeItemSchema = z.object({
  id: z.string(),
  icon: z.enum(["truck", "shield", "phone", "refresh", "heart", "sparkles", "currency", "tag"]).default("truck"),
  title: z.string(),
  description: z.string(),
});

export const FeaturesBadgesContentSchema = z.object({
  badges: z.array(FeatureBadgeItemSchema).default([
    { id: "1", icon: "truck", title: "Fast Delivery", description: "Countrywide shipping with real-time tracking" },
    { id: "2", icon: "shield", title: "Secure Checkout", description: "M-Pesa, Card & bank grade encrypted payments" },
    { id: "3", icon: "phone", title: "24/7 Support", description: "Instant assistance via WhatsApp & phone" },
    { id: "4", icon: "refresh", title: "Hassle-Free Returns", description: "Easy exchange & refund guarantees" },
  ]),
});

// Call To Action / Banner
export const CtaBannerContentSchema = z.object({
  title: z.string().default("Ready to elevate your shopping experience?"),
  description: z.string().optional().default("Join thousands of satisfied shoppers. Browse our full catalog today."),
  buttonText: z.string().default("Shop Now"),
  buttonUrl: z.string().default("/shop"),
  secondaryButtonText: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
  badgeText: z.string().optional().default("Limited Time Offer"),
  backgroundImageUrl: z.string().optional(),
});

// FAQ
export const FaqItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const FaqContentSchema = z.object({
  title: z.string().default("Frequently Asked Questions"),
  subtitle: z.string().optional().default("Everything you need to know about our products & deliveries"),
  faqs: z.array(FaqItemSchema).default([
    { id: "1", question: "How long does delivery take?", answer: "Orders within Nairobi arrive same day or within 24 hours. Countrywide deliveries take 1-2 business days." },
    { id: "2", question: "What payment methods do you accept?", answer: "We accept Lipa na M-Pesa, debit/credit cards, and cash on delivery where available." },
    { id: "3", question: "How can I track my order?", answer: "You will receive an instant SMS and email with tracking details as soon as your order is dispatched." },
  ]),
});

// Contact & Touchpoints
export const ContactContentSchema = z.object({
  title: z.string().default("Get in Touch"),
  subtitle: z.string().optional().default("We'd love to hear from you. Send us a message or visit our store."),
  showForm: z.boolean().default(true),
  showDirectWhatsApp: z.boolean().default(true),
  showOpeningHours: z.boolean().default(true),
  showLocations: z.boolean().default(true),
});

// Map
export const MapContentSchema = z.object({
  title: z.string().optional().default("Visit Our Store"),
  latitude: z.number().default(-1.286389),
  longitude: z.number().default(36.817223),
  zoom: z.number().default(14),
  locationName: z.string().default("Main Flagship Store"),
  address: z.string().default("Industrial Area, Nairobi, Kenya"),
});

// Newsletter
export const NewsletterContentSchema = z.object({
  title: z.string().default("Subscribe to Our VIP Club"),
  subtitle: z.string().default("Receive early access to seasonal sales, new arrivals and exclusive discount vouchers."),
  buttonText: z.string().default("Subscribe"),
  incentiveBadge: z.string().optional().default("Get 10% Off Your First Order"),
});

/* =========================================================================
   5. UNIFIED SECTION MODEL & VALIDATOR
   ========================================================================= */

export const SectionTypeEnum = z.enum([
  "hero",
  "productGrid",
  "productCarousel",
  "categoryGrid",
  "categoryPills",
  "imageWithText",
  "richText",
  "testimonials",
  "featuresBadges",
  "ctaBanner",
  "faq",
  "contact",
  "map",
  "newsletter",
]);

export type SectionType = z.infer<typeof SectionTypeEnum>;

export const WebsiteSectionSchema = z.object({
  id: z.string(),
  type: SectionTypeEnum,
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
  content: z.record(z.any()),
  styles: SectionStyleSchema.default({}),
  responsive: SectionResponsiveSchema.default({}),
  dataSource: CommerceDataSourceSchema.optional(),
});

export type WebsiteSectionConfig = z.infer<typeof WebsiteSectionSchema>;

/* =========================================================================
   6. PAGE MODEL
   ========================================================================= */

export const PageSeoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noIndex: z.boolean().default(false),
});

export type PageSeo = z.infer<typeof PageSeoSchema>;

export const WebsitePageSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  isHomepage: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  order: z.number().default(0),
  seo: PageSeoSchema.default({}),
  sections: z.array(WebsiteSectionSchema).default([]),
});

export type WebsitePageConfig = z.infer<typeof WebsitePageSchema>;

/* =========================================================================
   7. COMPLETE WEBSITE DRAFT / PUBLISHED COMPILED CONFIG
   ========================================================================= */

export const CompiledWebsiteConfigSchema = z.object({
  version: z.literal(1).default(1),
  templateKey: z.string().default("ecommerce"),
  storeName: z.string(),
  storeSlug: z.string(),
  theme: ThemeTokensSchema.default({}),
  navigation: NavigationConfigSchema.default({}),
  pages: z.array(WebsitePageSchema).default([]),
  componentOverrides: z.record(z.string(), z.any()).default({}),
  publishedAt: z.string().optional(),
});

export type CompiledWebsiteConfig = z.infer<typeof CompiledWebsiteConfigSchema>;

/* =========================================================================
   8. COMPONENT REGISTRY DEFINITIONS
   ========================================================================= */

export interface RegistryComponentItem {
  type: SectionType;
  title: string;
  description: string;
  category: "hero" | "commerce" | "content" | "social_proof" | "contact";
  icon: string;
  defaultContent: any;
  defaultStyles: SectionStyle;
  defaultResponsive: SectionResponsive;
  defaultDataSource?: CommerceDataSource;
}

export const SECTION_REGISTRY: Record<SectionType, RegistryComponentItem> = {
  hero: {
    type: "hero",
    title: "Hero Showcase",
    description: "High-impact visual banner with headline, CTA buttons, and slide controls.",
    category: "hero",
    icon: "SparklesIcon",
    defaultContent: {
      variant: "slider",
      autoplay: true,
      autoplayIntervalMs: 5000,
      slides: [
        {
          id: "slide-1",
          eyebrow: "New Collection 2026",
          title: "Modern Elegance & Quality Products",
          description: "Discover curated items made with premium materials, designed for everyday distinction.",
          primaryButtonText: "Explore Shop",
          primaryButtonUrl: "/shop",
          secondaryButtonText: "Our Story",
          secondaryButtonUrl: "/about",
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
          badgeText: "Best Seller Selection",
        },
      ],
    },
    defaultStyles: {
      paddingTop: "none",
      paddingBottom: "none",
      textAlign: "left",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  productGrid: {
    type: "productGrid",
    title: "Product Grid",
    description: "Showcase live catalog items in a responsive grid backed by authoritative inventory.",
    category: "commerce",
    icon: "Squares2X2Icon",
    defaultContent: {
      title: "Featured Products",
      subtitle: "Handpicked selections direct from our store catalog",
      viewAllUrl: "/shop",
      viewAllText: "View All Products",
      showRating: true,
      showAddToCart: true,
      showWishlist: true,
      showBadges: true,
      gridStyle: "standard",
    },
    defaultStyles: {
      paddingTop: "lg",
      paddingBottom: "lg",
      textAlign: "left",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 2,
      columnsDesktop: 4,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
    defaultDataSource: {
      type: "products",
      filter: "featured",
      limit: 8,
    },
  },

  productCarousel: {
    type: "productCarousel",
    title: "Product Carousel",
    description: "Horizontally scrollable product collection for special sales or trending items.",
    category: "commerce",
    icon: "ArrowTrendingUpIcon",
    defaultContent: {
      title: "Trending & Best Deals",
      subtitle: "Swipe to view this week's most popular items",
      viewAllUrl: "/shop?filter=trending",
      viewAllText: "View Collection",
      showRating: true,
      showAddToCart: true,
      showWishlist: true,
      showBadges: true,
      gridStyle: "standard",
    },
    defaultStyles: {
      paddingTop: "lg",
      paddingBottom: "lg",
      textAlign: "left",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 2,
      columnsDesktop: 4,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
    defaultDataSource: {
      type: "products",
      filter: "trending",
      limit: 10,
    },
  },

  categoryGrid: {
    type: "categoryGrid",
    title: "Category Showcase",
    description: "Visual category tiles with image cards and direct filtering links.",
    category: "commerce",
    icon: "FolderIcon",
    defaultContent: {
      title: "Shop by Category",
      subtitle: "Explore our diverse range of curated departments",
      layout: "grid",
      showProductCount: true,
    },
    defaultStyles: {
      paddingTop: "lg",
      paddingBottom: "lg",
      textAlign: "left",
    },
    defaultResponsive: {
      columnsMobile: 2,
      columnsTablet: 3,
      columnsDesktop: 6,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
    defaultDataSource: {
      type: "categories",
      filter: "featured",
      limit: 6,
    },
  },

  categoryPills: {
    type: "categoryPills",
    title: "Category Filter Ribbon",
    description: "Compact horizontal ribbon of clickable category pills.",
    category: "commerce",
    icon: "TagIcon",
    defaultContent: {
      title: "Popular Categories",
      subtitle: "Quick filter",
      layout: "pills",
      showProductCount: false,
    },
    defaultStyles: {
      paddingTop: "sm",
      paddingBottom: "sm",
      textAlign: "center",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
    defaultDataSource: {
      type: "categories",
      filter: "featured",
      limit: 12,
    },
  },

  imageWithText: {
    type: "imageWithText",
    title: "Story / Image with Text",
    description: "Editorial layout pairing brand photography with rich narrative copy and CTAs.",
    category: "content",
    icon: "PhotoIcon",
    defaultContent: {
      title: "Built on Trust, Delivered with Pride",
      subtitle: "Our Mission",
      description: "We are committed to providing genuine products, transparent pricing, and fast delivery across Kenya. Every order is inspected to ensure peak quality.",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=1200&auto=format&fit=crop",
      imagePosition: "left",
      buttonText: "Read Our Story",
      buttonUrl: "/about",
      stats: [
        { label: "Verified Orders", value: "10,000+" },
        { label: "Customer Satisfaction", value: "99.4%" },
        { label: "Delivery Speed", value: "< 24 Hrs" },
      ],
    },
    defaultStyles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "left",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 2,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  richText: {
    type: "richText",
    title: "Rich Text Section",
    description: "Flexible text section for announcements, descriptions, or policy highlights.",
    category: "content",
    icon: "DocumentTextIcon",
    defaultContent: {
      title: "Welcome to Our Flagship Digital Storefront",
      subtitle: "Official Retail Partner",
      contentHtml: "<p>Discover the finest selection of genuine goods. Enjoy convenient payments, instant dispatch, and 7-day customer satisfaction guarantee.</p>",
    },
    defaultStyles: {
      paddingTop: "lg",
      paddingBottom: "lg",
      textAlign: "center",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  testimonials: {
    type: "testimonials",
    title: "Customer Reviews",
    description: "Social proof cards showcasing real customer quotes, ratings, and avatars.",
    category: "social_proof",
    icon: "ChatBubbleLeftRightIcon",
    defaultContent: {
      title: "Loved by Over 10,000 Happy Shoppers",
      subtitle: "Real stories and verified customer reviews",
      layout: "grid",
      testimonials: [
        {
          id: "t1",
          author: "Grace Mwangi",
          role: "Verified Buyer, Nairobi",
          rating: 5,
          quote: "The delivery was lightning fast, ordered in the morning and arrived by 2 PM. Authentic quality!",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        },
        {
          id: "t2",
          author: "David Ochieng",
          role: "Verified Buyer, Kisumu",
          rating: 5,
          quote: "Super convenient M-Pesa payment and great customer service on WhatsApp. Highly recommended.",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        },
        {
          id: "t3",
          author: "Faith Wanjiku",
          role: "Verified Buyer, Mombasa",
          rating: 5,
          quote: "Packaged securely with tracking updates the entire way. I will definitely be ordering again.",
          avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
        },
      ],
    },
    defaultStyles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "center",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 2,
      columnsDesktop: 3,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  featuresBadges: {
    type: "featuresBadges",
    title: "Trust & Service Badges",
    description: "Highlight delivery speed, security, returns, and support guarantees.",
    category: "social_proof",
    icon: "ShieldCheckIcon",
    defaultContent: {
      badges: [
        { id: "b1", icon: "truck", title: "Countrywide Delivery", description: "Fast dispatch across Kenya" },
        { id: "b2", icon: "shield", title: "M-Pesa & Card Secure", description: "100% encrypted transactions" },
        { id: "b3", icon: "phone", title: "Dedicated Support", description: "Live human chat on WhatsApp" },
        { id: "b4", icon: "refresh", title: "Easy Returns", description: "Guaranteed satisfaction policy" },
      ],
    },
    defaultStyles: {
      paddingTop: "md",
      paddingBottom: "md",
      textAlign: "center",
    },
    defaultResponsive: {
      columnsMobile: 2,
      columnsTablet: 2,
      columnsDesktop: 4,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  ctaBanner: {
    type: "ctaBanner",
    title: "Call To Action Banner",
    description: "Attention-grabbing full-width banner driving shoppers to campaigns or product lines.",
    category: "content",
    icon: "MegaphoneIcon",
    defaultContent: {
      title: "Discover Today's Limited Time Exclusive Deals",
      description: "Shop our best-sellers before stock runs out. Free gift wrapping available upon request.",
      buttonText: "Shop Best Sellers",
      buttonUrl: "/shop?filter=featured",
      secondaryButtonText: "Contact Us",
      secondaryButtonUrl: "/contact",
      badgeText: "Flash Sale",
      backgroundImageUrl: "",
    },
    defaultStyles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "center",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  faq: {
    type: "faq",
    title: "FAQ Accordion",
    description: "Clean collapsible Q&A list addressing shopper questions.",
    category: "content",
    icon: "QuestionMarkCircleIcon",
    defaultContent: {
      title: "Frequently Asked Questions",
      subtitle: "Got questions? We're here to help.",
      faqs: [
        { id: "q1", question: "How long does delivery take?", answer: "Orders in Nairobi are delivered same day or within 24 hours. Countrywide parcels take 1-2 business days." },
        { id: "q2", question: "How do I pay with M-Pesa?", answer: "At checkout, choose Lipa na M-Pesa. You will receive an instant prompt on your phone to enter your PIN." },
        { id: "q3", question: "What if an item is out of stock?", answer: "You can click 'Notify Me' or message us on WhatsApp and our team will check warehouse reserves." },
      ],
    },
    defaultStyles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "center",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  contact: {
    type: "contact",
    title: "Contact & Touchpoints",
    description: "Full contact suite: direct message form, WhatsApp button, phone, and store address.",
    category: "contact",
    icon: "EnvelopeIcon",
    defaultContent: {
      title: "Contact Our Customer Support Team",
      subtitle: "We are available Monday to Saturday 8:00 AM - 6:00 PM",
      showForm: true,
      showDirectWhatsApp: true,
      showOpeningHours: true,
      showLocations: true,
    },
    defaultStyles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "left",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 2,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  map: {
    type: "map",
    title: "Store Map Location",
    description: "Interactive or visual map showing physical shop locations.",
    category: "contact",
    icon: "MapPinIcon",
    defaultContent: {
      title: "Visit Our Shop",
      latitude: -1.286389,
      longitude: 36.817223,
      zoom: 14,
      locationName: "Main Store",
      address: "Commercial Center, Nairobi, Kenya",
    },
    defaultStyles: {
      paddingTop: "lg",
      paddingBottom: "lg",
      textAlign: "center",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },

  newsletter: {
    type: "newsletter",
    title: "Newsletter Signup",
    description: "Email/Phone subscriber capture with discount incentive copy.",
    category: "content",
    icon: "PaperAirplaneIcon",
    defaultContent: {
      title: "Unlock 10% Off Your First Order",
      subtitle: "Sign up for exclusive drops, restock alerts and private promotional codes.",
      buttonText: "Join VIP Club",
      incentiveBadge: "Exclusive Perks",
    },
    defaultStyles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "center",
    },
    defaultResponsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  },
};

/* =========================================================================
   9. STRUCTURED AI ACTIONS & MUTATION TOOLSET
   ========================================================================= */

export type AIActionName =
  | "update_theme_tokens"
  | "update_section_content"
  | "update_section_style"
  | "add_section"
  | "remove_section"
  | "move_section"
  | "duplicate_section"
  | "create_page"
  | "delete_page"
  | "rename_page"
  | "update_seo"
  | "update_navigation"
  | "set_commerce_source";

export interface AIActionPayload {
  action: AIActionName;
  pageSlug?: string;
  sectionId?: string;
  sectionType?: SectionType;
  index?: number;
  direction?: "up" | "down";
  data?: any;
  summary: string;
}

export interface AIWebsiteEditResult {
  explanation: string;
  appliedActions: {
    action: string;
    summary: string;
  }[];
  updatedConfig: CompiledWebsiteConfig;
}

/* =========================================================================
   10. TEMPLATE ARCHITECTURE & REGISTRY TYPES
   ========================================================================= */

export type PageType =
  | "HOME"
  | "PRODUCT_LIST"
  | "PRODUCT_DETAIL"
  | "CATEGORY_LIST"
  | "ABOUT"
  | "CONTACT"
  | "CART"
  | "CHECKOUT"
  | "BOOKING"
  | "COURSE_LIST"
  | "COURSE_DETAIL"
  | "PROPERTY_LIST"
  | "SERVICE_LIST"
  | "CUSTOM";

export type TemplateCapability =
  | "products"
  | "categories"
  | "cart_checkout"
  | "courses"
  | "bookings"
  | "services"
  | "properties"
  | "restaurant_menu"
  | "vehicles"
  | "reviews"
  | "blog"
  | "donations";

export interface TemplatePageDefinition {
  id: string;
  slug: string;
  title: string;
  pageType: PageType;
  isHomepage?: boolean;
  nativeSubpath?: string; // e.g. "ecommerceshoes/products"
  description?: string;
}

export interface AuthenticSectionDefinition {
  id: string;
  name: string;
  component: string;
  type: SectionType | string;
  category: "hero" | "commerce" | "content" | "media" | "social" | "conversion";
  description?: string;
  editableProps?: string[];
  defaultContent: Record<string, any>;
  defaultStyles?: Record<string, any>;
  dataSource?: {
    type: "products" | "categories" | "testimonials" | "promotions" | "static";
    filter?: string;
    limit?: number;
  };
}

export interface TemplateShellDefinition {
  headerComponent: string;
  footerComponent: string;
  defaultNavItems: { id: string; label: string; url: string }[];
}

export interface TemplateDefinition {
  id: string; // e.g. "ecommerce-shoes@v1"
  version: string; // e.g. "1.0.0"
  name: string;
  category: string;
  variant: string;
  shellLayout: string;
  bodyComponent: string;
  shell?: TemplateShellDefinition;
  capabilities: TemplateCapability[];
  defaultTheme: Partial<ThemeTokens>;
  defaultPages: TemplatePageDefinition[];
  authenticSections: AuthenticSectionDefinition[];
}

