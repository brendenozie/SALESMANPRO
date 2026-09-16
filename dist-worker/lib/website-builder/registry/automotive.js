"use strict";
/**
 * lib/website-builder/registry/automotive.ts
 * Template group: automotive (2 templates)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTOMOTIVE_TEMPLATES = exports.AUTOMOTIVE_SECTIONS = void 0;
const helpers_1 = require("./helpers");
/* =========================================================================
   AUTHENTIC SECTION DEFINITIONS
   ========================================================================= */
exports.AUTOMOTIVE_SECTIONS = [
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
/* =========================================================================
   TEMPLATE DEFINITIONS
   ========================================================================= */
exports.AUTOMOTIVE_TEMPLATES = {
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
        authenticSections: exports.AUTOMOTIVE_SECTIONS,
        shell: (0, helpers_1.makeShell)("Header", "Footer", [
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
        authenticSections: exports.AUTOMOTIVE_SECTIONS,
        shell: (0, helpers_1.makeShell)("Header", "Footer", [
            { id: "nav-inventory", label: "Showroom", url: "/inventory" },
            { id: "nav-financing", label: "How It Works", url: "/#how-it-works" },
            { id: "nav-locations", label: "Dealerships", url: "/locations" },
            { id: "nav-contact", label: "Contact", url: "/contact" },
        ]),
    },
};
