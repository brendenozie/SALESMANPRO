/**
 * lib/website-builder/registry/property.ts
 * Template group: property (2 templates)
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

/* =========================================================================
   TEMPLATE DEFINITIONS
   ========================================================================= */

export const PROPERTY_TEMPLATES: Record<string, TemplateDefinition> = {
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
};
