"use strict";
/**
 * types/website-builder.ts
 *
 * Core TypeScript definitions, Zod validation schemas, design tokens,
 * and component registry types for the SalesmanPro AI-Powered Website Builder.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECTION_REGISTRY = exports.CompiledWebsiteConfigSchema = exports.WebsitePageSchema = exports.PageSeoSchema = exports.WebsiteSectionSchema = exports.SectionTypeEnum = exports.NewsletterContentSchema = exports.MapContentSchema = exports.ContactContentSchema = exports.FaqContentSchema = exports.FaqItemSchema = exports.CtaBannerContentSchema = exports.FeaturesBadgesContentSchema = exports.FeatureBadgeItemSchema = exports.TestimonialsContentSchema = exports.TestimonialItemSchema = exports.RichTextContentSchema = exports.ImageWithTextContentSchema = exports.CategoryShowcaseContentSchema = exports.ProductShowcaseContentSchema = exports.HeroContentSchema = exports.HeroSlideItemSchema = exports.SectionResponsiveSchema = exports.SectionStyleSchema = exports.CommerceDataSourceSchema = exports.NavigationConfigSchema = exports.NavItemSchema = exports.ThemeTokensSchema = void 0;
const zod_1 = require("zod");
/* =========================================================================
   1. DESIGN TOKENS & THEME
   ========================================================================= */
exports.ThemeTokensSchema = zod_1.z.object({
    // Colors
    primaryColor: zod_1.z.string().default("#F43F5E"),
    secondaryColor: zod_1.z.string().default("#FBBF24"),
    accentColor: zod_1.z.string().default("#6366F1"),
    backgroundColor: zod_1.z.string().default("#FFFFFF"),
    surfaceColor: zod_1.z.string().default("#F8FAFC"),
    textColor: zod_1.z.string().default("#0F172A"),
    mutedTextColor: zod_1.z.string().default("#64748B"),
    borderColor: zod_1.z.string().default("#E2E8F0"),
    // Typography
    headingFont: zod_1.z.string().default("Inter, sans-serif"),
    bodyFont: zod_1.z.string().default("Inter, sans-serif"),
    baseFontSize: zod_1.z.enum(["sm", "md", "lg"]).default("md"),
    // Border Radii
    buttonRadius: zod_1.z.enum(["none", "sm", "md", "lg", "full"]).default("lg"),
    cardRadius: zod_1.z.enum(["none", "sm", "md", "lg", "xl", "2xl"]).default("xl"),
    inputRadius: zod_1.z.enum(["none", "sm", "md", "lg", "full"]).default("lg"),
    // Layout & Spacing
    containerWidth: zod_1.z.enum(["boxed", "standard", "wide", "full"]).default("standard"),
    sectionSpacing: zod_1.z.enum(["compact", "comfortable", "spacious"]).default("comfortable"),
    cardSpacing: zod_1.z.enum(["compact", "normal", "spacious"]).default("normal"),
    // Visual Effects
    glassmorphism: zod_1.z.boolean().default(false),
    boxShadow: zod_1.z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),
});
exports.NavItemSchema = zod_1.z.lazy(() => zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    url: zod_1.z.string(),
    isExternal: zod_1.z.boolean().default(false),
    badge: zod_1.z.string().optional(),
    children: zod_1.z.array(exports.NavItemSchema).optional(),
}));
exports.NavigationConfigSchema = zod_1.z.object({
    headerItems: zod_1.z.array(exports.NavItemSchema).default([
        { id: "home", label: "Home", url: "/" },
        { id: "shop", label: "Shop", url: "/shop" },
        { id: "categories", label: "Categories", url: "/categories" },
        { id: "about", label: "About Us", url: "/about" },
        { id: "contact", label: "Contact", url: "/contact" },
    ]),
    footerColumns: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        items: zod_1.z.array(exports.NavItemSchema),
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
    headerSettings: zod_1.z.object({
        sticky: zod_1.z.boolean().default(true),
        showSearch: zod_1.z.boolean().default(true),
        showCart: zod_1.z.boolean().default(true),
        showUserAccount: zod_1.z.boolean().default(true),
        showWhatsAppBtn: zod_1.z.boolean().default(true),
        announcementBarText: zod_1.z.string().optional().default("🔥 Free Delivery on orders over KES 3,000 | Same day dispatch"),
        showAnnouncementBar: zod_1.z.boolean().default(true),
        logoHeight: zod_1.z.number().default(44),
    }).default({}),
    footerSettings: zod_1.z.object({
        showNewsletter: zod_1.z.boolean().default(true),
        newsletterTitle: zod_1.z.string().default("Stay in the Loop"),
        newsletterSubtitle: zod_1.z.string().default("Subscribe for exclusive drops, offers and product launches."),
        showSocialLinks: zod_1.z.boolean().default(true),
        showPaymentIcons: zod_1.z.boolean().default(true),
        copyrightText: zod_1.z.string().default("All rights reserved."),
    }).default({}),
});
/* =========================================================================
   3. SECTION DEFINITIONS & COMMERCE DATA SOURCES
   ========================================================================= */
exports.CommerceDataSourceSchema = zod_1.z.object({
    type: zod_1.z.enum(["products", "categories", "promotions", "testimonials", "manual", "static"]),
    filter: zod_1.z.string().optional().default("featured"),
    categoryId: zod_1.z.string().optional(),
    manualIds: zod_1.z.array(zod_1.z.string()).optional(),
    limit: zod_1.z.number().min(1).max(24).default(8),
});
exports.SectionStyleSchema = zod_1.z.object({
    paddingTop: zod_1.z.enum(["none", "sm", "md", "lg", "xl"]).optional().default("lg"),
    paddingBottom: zod_1.z.enum(["none", "sm", "md", "lg", "xl"]).optional().default("lg"),
    backgroundColor: zod_1.z.string().optional(),
    textColor: zod_1.z.string().optional(),
    backgroundImageUrl: zod_1.z.string().optional(),
    backgroundOverlayOpacity: zod_1.z.number().min(0).max(100).optional().default(0),
    textAlign: zod_1.z.enum(["left", "center", "right"]).optional().default("left"),
    containerWidth: zod_1.z.enum(["boxed", "standard", "wide", "full"]).optional(),
}).passthrough();
exports.SectionResponsiveSchema = zod_1.z.object({
    columnsMobile: zod_1.z.number().min(1).max(3).optional().default(1),
    columnsTablet: zod_1.z.number().min(1).max(4).optional().default(2),
    columnsDesktop: zod_1.z.number().min(1).max(6).optional().default(4),
    hideOnMobile: zod_1.z.boolean().optional().default(false),
    hideOnDesktop: zod_1.z.boolean().optional().default(false),
}).passthrough();
/* =========================================================================
   4. CONCRETE SECTION CONTENT SCHEMAS
   ========================================================================= */
// Hero Slide
exports.HeroSlideItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    eyebrow: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    primaryButtonText: zod_1.z.string().optional(),
    primaryButtonUrl: zod_1.z.string().optional(),
    secondaryButtonText: zod_1.z.string().optional(),
    secondaryButtonUrl: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string(),
    badgeText: zod_1.z.string().optional(),
});
exports.HeroContentSchema = zod_1.z.object({
    variant: zod_1.z.enum(["slider", "split", "centered", "minimal", "banner"]).default("slider"),
    slides: zod_1.z.array(exports.HeroSlideItemSchema).default([]),
    autoplay: zod_1.z.boolean().default(true),
    autoplayIntervalMs: zod_1.z.number().default(5000),
});
// Product Showcase
exports.ProductShowcaseContentSchema = zod_1.z.object({
    title: zod_1.z.string().default("Featured Collection"),
    subtitle: zod_1.z.string().optional().default("Carefully curated top items for you"),
    viewAllUrl: zod_1.z.string().optional().default("/shop"),
    viewAllText: zod_1.z.string().optional().default("Explore All"),
    showRating: zod_1.z.boolean().default(true),
    showAddToCart: zod_1.z.boolean().default(true),
    showWishlist: zod_1.z.boolean().default(true),
    showBadges: zod_1.z.boolean().default(true),
    gridStyle: zod_1.z.enum(["standard", "compact", "editorial"]).default("standard"),
});
// Category Showcase
exports.CategoryShowcaseContentSchema = zod_1.z.object({
    title: zod_1.z.string().default("Shop by Category"),
    subtitle: zod_1.z.string().optional().default("Browse our product categories"),
    layout: zod_1.z.enum(["grid", "carousel", "pills"]).default("grid"),
    showProductCount: zod_1.z.boolean().default(true),
});
// Image With Text / About
exports.ImageWithTextContentSchema = zod_1.z.object({
    title: zod_1.z.string().default("Crafted with Passion & Precision"),
    subtitle: zod_1.z.string().optional().default("Our Heritage"),
    description: zod_1.z.string().default("We connect quality products with exceptional customer experiences across the region."),
    imageUrl: zod_1.z.string().default("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"),
    imagePosition: zod_1.z.enum(["left", "right"]).default("left"),
    buttonText: zod_1.z.string().optional().default("Learn More"),
    buttonUrl: zod_1.z.string().optional().default("/about"),
    founderQuote: zod_1.z.string().optional(),
    founderName: zod_1.z.string().optional(),
    stats: zod_1.z.array(zod_1.z.object({
        label: zod_1.z.string(),
        value: zod_1.z.string(),
    })).optional(),
});
// Rich Text / Narrative
exports.RichTextContentSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    subtitle: zod_1.z.string().optional(),
    contentHtml: zod_1.z.string().default("<p>Welcome to our store. We provide top-tier products backed by reliable service.</p>"),
});
// Testimonials
exports.TestimonialItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    author: zod_1.z.string(),
    role: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().optional(),
    rating: zod_1.z.number().min(1).max(5).default(5),
    quote: zod_1.z.string(),
});
exports.TestimonialsContentSchema = zod_1.z.object({
    title: zod_1.z.string().default("What Our Customers Say"),
    subtitle: zod_1.z.string().optional().default("Genuine feedback from verified shoppers"),
    testimonials: zod_1.z.array(exports.TestimonialItemSchema).default([]),
    layout: zod_1.z.enum(["carousel", "grid"]).default("grid"),
});
// Trust / Features Badges
exports.FeatureBadgeItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    icon: zod_1.z.enum(["truck", "shield", "phone", "refresh", "heart", "sparkles", "currency", "tag"]).default("truck"),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
});
exports.FeaturesBadgesContentSchema = zod_1.z.object({
    badges: zod_1.z.array(exports.FeatureBadgeItemSchema).default([
        { id: "1", icon: "truck", title: "Fast Delivery", description: "Countrywide shipping with real-time tracking" },
        { id: "2", icon: "shield", title: "Secure Checkout", description: "M-Pesa, Card & bank grade encrypted payments" },
        { id: "3", icon: "phone", title: "24/7 Support", description: "Instant assistance via WhatsApp & phone" },
        { id: "4", icon: "refresh", title: "Hassle-Free Returns", description: "Easy exchange & refund guarantees" },
    ]),
});
// Call To Action / Banner
exports.CtaBannerContentSchema = zod_1.z.object({
    title: zod_1.z.string().default("Ready to elevate your shopping experience?"),
    description: zod_1.z.string().optional().default("Join thousands of satisfied shoppers. Browse our full catalog today."),
    buttonText: zod_1.z.string().default("Shop Now"),
    buttonUrl: zod_1.z.string().default("/shop"),
    secondaryButtonText: zod_1.z.string().optional(),
    secondaryButtonUrl: zod_1.z.string().optional(),
    badgeText: zod_1.z.string().optional().default("Limited Time Offer"),
    backgroundImageUrl: zod_1.z.string().optional(),
});
// FAQ
exports.FaqItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    question: zod_1.z.string(),
    answer: zod_1.z.string(),
});
exports.FaqContentSchema = zod_1.z.object({
    title: zod_1.z.string().default("Frequently Asked Questions"),
    subtitle: zod_1.z.string().optional().default("Everything you need to know about our products & deliveries"),
    faqs: zod_1.z.array(exports.FaqItemSchema).default([
        { id: "1", question: "How long does delivery take?", answer: "Orders within Nairobi arrive same day or within 24 hours. Countrywide deliveries take 1-2 business days." },
        { id: "2", question: "What payment methods do you accept?", answer: "We accept Lipa na M-Pesa, debit/credit cards, and cash on delivery where available." },
        { id: "3", question: "How can I track my order?", answer: "You will receive an instant SMS and email with tracking details as soon as your order is dispatched." },
    ]),
});
// Contact & Touchpoints
exports.ContactContentSchema = zod_1.z.object({
    title: zod_1.z.string().default("Get in Touch"),
    subtitle: zod_1.z.string().optional().default("We'd love to hear from you. Send us a message or visit our store."),
    showForm: zod_1.z.boolean().default(true),
    showDirectWhatsApp: zod_1.z.boolean().default(true),
    showOpeningHours: zod_1.z.boolean().default(true),
    showLocations: zod_1.z.boolean().default(true),
});
// Map
exports.MapContentSchema = zod_1.z.object({
    title: zod_1.z.string().optional().default("Visit Our Store"),
    latitude: zod_1.z.number().default(-1.286389),
    longitude: zod_1.z.number().default(36.817223),
    zoom: zod_1.z.number().default(14),
    locationName: zod_1.z.string().default("Main Flagship Store"),
    address: zod_1.z.string().default("Industrial Area, Nairobi, Kenya"),
});
// Newsletter
exports.NewsletterContentSchema = zod_1.z.object({
    title: zod_1.z.string().default("Subscribe to Our VIP Club"),
    subtitle: zod_1.z.string().default("Receive early access to seasonal sales, new arrivals and exclusive discount vouchers."),
    buttonText: zod_1.z.string().default("Subscribe"),
    incentiveBadge: zod_1.z.string().optional().default("Get 10% Off Your First Order"),
});
/* =========================================================================
   5. UNIFIED SECTION MODEL & VALIDATOR
   ========================================================================= */
exports.SectionTypeEnum = zod_1.z.enum([
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
exports.WebsiteSectionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: exports.SectionTypeEnum,
    name: zod_1.z.string().optional(),
    component: zod_1.z.string().optional(),
    order: zod_1.z.number().default(0),
    isVisible: zod_1.z.boolean().default(true),
    content: zod_1.z.record(zod_1.z.any()),
    styles: exports.SectionStyleSchema.default({}),
    responsive: exports.SectionResponsiveSchema.default({}),
    dataSource: exports.CommerceDataSourceSchema.optional(),
});
/* =========================================================================
   6. PAGE MODEL
   ========================================================================= */
exports.PageSeoSchema = zod_1.z.object({
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    ogImage: zod_1.z.string().optional(),
    canonicalUrl: zod_1.z.string().optional(),
    noIndex: zod_1.z.boolean().default(false),
});
exports.WebsitePageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    slug: zod_1.z.string(),
    isHomepage: zod_1.z.boolean().default(false),
    isVisible: zod_1.z.boolean().default(true),
    order: zod_1.z.number().default(0),
    seo: exports.PageSeoSchema.default({}),
    sections: zod_1.z.array(exports.WebsiteSectionSchema).default([]),
});
/* =========================================================================
   7. COMPLETE WEBSITE DRAFT / PUBLISHED COMPILED CONFIG
   ========================================================================= */
exports.CompiledWebsiteConfigSchema = zod_1.z.object({
    version: zod_1.z.literal(1).default(1),
    templateKey: zod_1.z.string().default("ecommerce"),
    storeName: zod_1.z.string(),
    storeSlug: zod_1.z.string(),
    theme: exports.ThemeTokensSchema.default({}),
    navigation: exports.NavigationConfigSchema.default({}),
    pages: zod_1.z.array(exports.WebsitePageSchema).default([]),
    componentOverrides: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).default({}),
    publishedAt: zod_1.z.string().optional(),
});
exports.SECTION_REGISTRY = {
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
