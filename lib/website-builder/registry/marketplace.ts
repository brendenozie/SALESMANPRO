/**
 * lib/website-builder/registry/marketplace.ts
 * Template group: marketplace (2 templates)
 */

import {
  TemplateDefinition,
  AuthenticSectionDefinition,
} from "@/types/website-builder";
import {
  makeEcommercePages,
  makeBookingPages,
  makeCoursePages,
  makeShell,
} from "./helpers";

/* =========================================================================
   AUTHENTIC SECTION DEFINITIONS
   ========================================================================= */

const MARKETPLACE_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "marketplace-herobanner",
    name: "Hero Banner",
    component: "HeroBanner",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText", "buttonLink", "imageUrl"],
    defaultContent: {
      headline: "Premium Multi-Vendor Marketplace",
      subline: "Authentic quality, curated selections, and reliable service tailored for you.",
      buttonText: "Explore Collection",
      buttonLink: "/products",
    },
  },
  {
    id: "marketplace-categorycarousel",
    name: "Categories Carousel",
    component: "CategoryCarousel",
    type: "categoryGrid",
    category: "commerce",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: {
      title: "Explore by Category",
      subtitle: "Browse our curated departments and collections",
    },
    dataSource: { type: "categories" },
  },
  {
    id: "marketplace-storepagesection",
    name: "Marketplace Store Directory",
    component: "StorePageSection",
    type: "custom",
    category: "content",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: {
    title: "Marketplace Store Directory",
    subtitle: "Built with passion and dedication to excellence.",
    description: "Discover how our Multi-Vendor Marketplace experience delivers the highest standards of quality.",
  },
  },
  {
    id: "marketplace-reviewssection",
    name: "Reviews",
    component: "ReviewsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title", "subtitle"],
    defaultContent: {
      title: "What Our Customers Say",
      subtitle: "Real stories from satisfied clients and verified buyers",
    },
    dataSource: { type: "testimonials" },
  },
];

const GHUBA_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "ghuba-bannerslider",
    name: "Banner Slider",
    component: "BannerSlider",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText", "buttonLink", "imageUrl"],
    defaultContent: {
      headline: "Premium Ghuba Multi-Store",
      subline: "Authentic quality, curated selections, and reliable service tailored for you.",
      buttonText: "Explore Collection",
      buttonLink: "/products",
    },
  },
  {
    id: "ghuba-flashdeals",
    name: "Flash Deals & Limited Drops",
    component: "FlashDeals",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle", "limit"],
    defaultContent: {
      title: "Flash Deals & Limited Drops",
      subtitle: "Discover our latest and most popular items in Ghuba Multi-Store",
      limit: 8,
    },
    dataSource: { type: "promotions" },
  },
  {
    id: "ghuba-topcate",
    name: "Top Categories",
    component: "TopCate",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: {
      title: "Explore by Category",
      subtitle: "Browse our curated departments and collections",
    },
    dataSource: { type: "categories" },
  },
  {
    id: "ghuba-newarrivals",
    name: "New Arrivals",
    component: "NewArrivals",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: {
      title: "New Arrivals",
      subtitle: "Discover our latest and most popular items in Ghuba Multi-Store",
      limit: 8,
    },
    dataSource: { type: "products", filter: "latest", limit: 8 },
  },
  {
    id: "ghuba-discount",
    name: "Exclusive Discount Offers",
    component: "Discount",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "subtitle", "buttonText", "buttonLink"],
    defaultContent: {
    title: "Exclusive Discount Offers",
    subtitle: "Built with passion and dedication to excellence.",
    description: "Discover how our Ghuba Multi-Store experience delivers the highest standards of quality.",
  },
    dataSource: { type: "promotions" },
  },
  {
    id: "ghuba-shop",
    name: "Full Catalog Showcase",
    component: "Shop",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle", "limit"],
    defaultContent: {
    title: "Full Catalog Showcase",
    subtitle: "Built with passion and dedication to excellence.",
    description: "Discover how our Ghuba Multi-Store experience delivers the highest standards of quality.",
  },
  },
  {
    id: "ghuba-annocument",
    name: "Important Announcements",
    component: "Annocument",
    type: "ctaBanner",
    category: "content",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: {
    title: "Important Announcements",
    subtitle: "Built with passion and dedication to excellence.",
    description: "Discover how our Ghuba Multi-Store experience delivers the highest standards of quality.",
  },
  },
  {
    id: "ghuba-wrapper",
    name: "Storefront Highlights",
    component: "Wrapper",
    type: "custom",
    category: "content",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: {
    title: "Storefront Highlights",
    subtitle: "Built with passion and dedication to excellence.",
    description: "Discover how our Ghuba Multi-Store experience delivers the highest standards of quality.",
  },
  },
];

/* =========================================================================
   TEMPLATE DEFINITIONS
   ========================================================================= */

export const MARKETPLACE_TEMPLATES: Record<string, TemplateDefinition> = {
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
    authenticSections: MARKETPLACE_SECTIONS,
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
    authenticSections: GHUBA_SECTIONS,
  },
};
