/**
 * lib/website-builder/template-compiler.ts
 *
 * Compiles raw Company data into a high-fidelity, fully editable CompiledWebsiteConfig.
 * Preserves existing brand identity, catalog connections, and category defaults
 * so existing stores continue looking identical or better, while becoming 100% editable.
 */

import {
  CompiledWebsiteConfig,
  WebsitePageConfig,
  WebsiteSectionConfig,
  ThemeTokens,
  NavigationConfig,
  SECTION_REGISTRY,
} from "@/types/website-builder";
import { getTemplateForCompany } from "./template-registry";

// Category-based color schemes for instant premium branding
const CATEGORY_THEME_PALETTES: Record<string, Partial<ThemeTokens>> = {
  automotive: {
    primaryColor: "#E11D48",
    secondaryColor: "#0F172A",
    accentColor: "#F59E0B",
    headingFont: "Montserrat, sans-serif",
    buttonRadius: "md",
    cardRadius: "lg",
  },
  fashion: {
    primaryColor: "#0F172A",
    secondaryColor: "#D97706",
    accentColor: "#F43F5E",
    headingFont: "Playfair Display, serif",
    buttonRadius: "none",
    cardRadius: "md",
  },
  electronics: {
    primaryColor: "#2563EB",
    secondaryColor: "#0D9488",
    accentColor: "#6366F1",
    headingFont: "Inter, sans-serif",
    buttonRadius: "lg",
    cardRadius: "xl",
  },
  furniture: {
    primaryColor: "#78350F",
    secondaryColor: "#D97706",
    accentColor: "#059669",
    headingFont: "Playfair Display, serif",
    buttonRadius: "md",
    cardRadius: "lg",
  },
  groceries: {
    primaryColor: "#16A34A",
    secondaryColor: "#CA8A04",
    accentColor: "#EA580C",
    headingFont: "Inter, sans-serif",
    buttonRadius: "full",
    cardRadius: "2xl",
  },
  healthcare: {
    primaryColor: "#0284C7",
    secondaryColor: "#0D9488",
    accentColor: "#10B981",
    headingFont: "Inter, sans-serif",
    buttonRadius: "lg",
    cardRadius: "xl",
  },
  beauty: {
    primaryColor: "#DB2777",
    secondaryColor: "#F59E0B",
    accentColor: "#9333EA",
    headingFont: "Playfair Display, serif",
    buttonRadius: "full",
    cardRadius: "2xl",
  },
  services: {
    primaryColor: "#4F46E5",
    secondaryColor: "#0EA5E9",
    accentColor: "#10B981",
    headingFont: "Inter, sans-serif",
    buttonRadius: "lg",
    cardRadius: "xl",
  },
  restaurant: {
    primaryColor: "#DC2626",
    secondaryColor: "#F59E0B",
    accentColor: "#16A34A",
    headingFont: "Merriweather, serif",
    buttonRadius: "full",
    cardRadius: "xl",
  },
  default: {
    primaryColor: "#F43F5E",
    secondaryColor: "#FBBF24",
    accentColor: "#6366F1",
    headingFont: "Inter, sans-serif",
    buttonRadius: "lg",
    cardRadius: "xl",
  },
};

/**
 * Build initial theme tokens by blending template defaults with store's themeSettings
 */
export function compileThemeTokens(company: any): ThemeTokens {
  const canonicalTemplate = getTemplateForCompany(company);
  const matchedPalette = canonicalTemplate?.defaultTheme || CATEGORY_THEME_PALETTES.default;
  const userTheme = company.themeSettings || {};

  return {
    primaryColor: userTheme.primaryColor || matchedPalette.primaryColor || "#F43F5E",
    secondaryColor: userTheme.secondaryColor || matchedPalette.secondaryColor || "#FBBF24",
    accentColor: userTheme.accentColor || matchedPalette.accentColor || "#6366F1",
    backgroundColor: userTheme.backgroundColor || "#FFFFFF",
    surfaceColor: userTheme.surfaceColor || "#F8FAFC",
    textColor: userTheme.textColor || "#0F172A",
    mutedTextColor: userTheme.mutedTextColor || "#64748B",
    borderColor: userTheme.borderColor || "#E2E8F0",
    headingFont: userTheme.fontFamily || matchedPalette.headingFont || "Inter, sans-serif",
    bodyFont: userTheme.bodyFont || matchedPalette.bodyFont || "Inter, sans-serif",
    baseFontSize: "md",
    buttonRadius: (userTheme.buttonRadius as any) || (matchedPalette.buttonRadius as any) || "lg",
    cardRadius: (userTheme.cardRadius as any) || (matchedPalette.cardRadius as any) || "xl",
    inputRadius: "lg",
    containerWidth: "standard",
    sectionSpacing: "comfortable",
    cardSpacing: "normal",
    glassmorphism: false,
    boxShadow: "md",
  };
}

/**
 * Build initial navigation configuration from company metadata
 */
export function compileNavigation(company: any): NavigationConfig {
  const canonicalTemplate = getTemplateForCompany(company);
  const brandName = company.name || "Store";
  const primaryPhone = company.contactPhone || "";
  const primaryEmail = company.contactEmail || "";
  const address = company.address || company.addresses?.[0]?.address || "Nairobi, Kenya";

  // Use authentic template-specific navigation items if defined in its shell
  const templateNavItems = canonicalTemplate?.shell?.defaultNavItems;
  const headerItems =
    templateNavItems && templateNavItems.length > 0
      ? templateNavItems.map((item) => ({ ...item }))
      : [
          { id: "nav-home", label: "Home", url: "/" },
          { id: "nav-shop", label: "Shop", url: "/shop" },
          { id: "nav-categories", label: "Categories", url: "/categories" },
          { id: "nav-about", label: "Our Story", url: "/about" },
          { id: "nav-contact", label: "Contact", url: "/contact" },
        ];

  return {
    headerItems,
    footerColumns: [
      {
        id: "col-shop",
        title: "Shop & Explore",
        items: [
          { id: "f-all", label: "All Products", url: "/shop" },
          { id: "f-featured", label: "Featured Deals", url: "/shop?filter=featured" },
          { id: "f-categories", label: "Categories", url: "/categories" },
        ],
      },
      {
        id: "col-about",
        title: "Company",
        items: [
          { id: "f-story", label: "About Us", url: "/about" },
          { id: "f-contact", label: "Contact Us", url: "/contact" },
          { id: "f-faq", label: "Help & FAQ", url: "/faq" },
        ],
      },
      {
        id: "col-support",
        title: "Customer Support",
        items: [
          { id: "f-shipping", label: "Delivery Info", url: "/shipping" },
          { id: "f-returns", label: "Returns & Exchanges", url: "/returns" },
          { id: "f-terms", label: "Terms of Service", url: "/terms" },
          { id: "f-privacy", label: "Privacy Policy", url: "/privacy" },
        ],
      },
    ],
    headerSettings: {
      sticky: true,
      showSearch: true,
      showCart: true,
      showUserAccount: true,
      showWhatsAppBtn: !!primaryPhone,
      announcementBarText: company.tagline || "🔥 Free Delivery on qualifying orders | Fast dispatch across Kenya",
      showAnnouncementBar: true,
      logoHeight: 44,
    },
    footerSettings: {
      showNewsletter: true,
      newsletterTitle: `Join ${brandName} VIP Club`,
      newsletterSubtitle: "Subscribe for instant restock alerts, flash sales and special voucher drops.",
      showSocialLinks: true,
      showPaymentIcons: true,
      copyrightText: `© ${new Date().getFullYear()} ${brandName}. All rights reserved. Powered by SalesmanPro.`,
    },
  };
}

/**
 * Resolves authentic category seed slides for all theme families
 */
export function resolveCategorySeedSlides(company: any, canonicalTemplate: any): Array<any> {
  if (Array.isArray(company.heroSlides) && company.heroSlides.length > 0) {
    return company.heroSlides;
  }

  const cat = (company.category || "").toLowerCase();
  const variant = (company.variant || "").toLowerCase();
  const tId = (canonicalTemplate?.id || "").toLowerCase();
  const brandName = company.name || canonicalTemplate?.name || "Official Store";

  // 1. AUTOMOTIVE
  const isAutoVariant = variant === "car" || variant.startsWith("car-") || variant.endsWith("-car") || variant.includes("auto") || variant.includes("dealership");
  const isAutoCat = cat === "car" || cat.startsWith("car-") || cat.endsWith("-car") || cat.includes("auto");
  if (isAutoCat || isAutoVariant || tId.includes("automotive")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Find Your Dream Vehicle",
        title: company.name ? `Welcome to ${company.name}` : "Find Your Dream Vehicle",
        subline: "Browse our showroom of verified premium luxury, performance, and certified pre-owned vehicles.",
        eyebrow: "Browse our showroom of verified premium luxury, performance, and certified pre-owned vehicles.",
        badgeText: "Certified Pre-Owned & New",
        ctaText: "Browse Inventory",
        primaryButtonText: "Browse Inventory",
        ctaLink: "/inventory",
        primaryButtonUrl: "/inventory",
        secondaryButtonText: "Book Test Drive",
        secondaryButtonUrl: "/test-drive",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2670",
        headline: "Excellence in Motion",
        title: "Excellence in Motion",
        subline: "Uncompromising performance, transparent vehicle histories, and tailored competitive financing.",
        eyebrow: "Uncompromising performance, transparent vehicle histories, and tailored competitive financing.",
        badgeText: "Flexible Financing Available",
        ctaText: "View Featured Cars",
        primaryButtonText: "View Featured Cars",
        ctaLink: "/featured",
        primaryButtonUrl: "/featured",
        secondaryButtonText: "Trade-In Appraisal",
        secondaryButtonUrl: "/trade-in",
      },
    ];
  }

  // 2. REAL ESTATE & PROPERTY MANAGEMENT
  if (cat.includes("real") || cat.includes("property") || variant.includes("property") || variant.includes("real") || tId.includes("real-estate") || tId.includes("property")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Modern Living, Exceptional Spaces",
        title: company.name ? `Welcome to ${company.name}` : "Modern Living, Exceptional Spaces",
        subline: "Discover exclusive luxury residences, modern suburban estates, and high-yield commercial investments.",
        eyebrow: "Discover exclusive luxury residences, modern suburban estates, and high-yield commercial investments.",
        badgeText: "Verified Prime Listings",
        ctaText: "Explore Properties",
        primaryButtonText: "Explore Properties",
        ctaLink: "/properties",
        primaryButtonUrl: "/properties",
        secondaryButtonText: "Schedule a Tour",
        secondaryButtonUrl: "/schedule-tour",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2670",
        headline: "Your Gateway to Home",
        title: "Your Gateway to Home",
        subline: "Expert property advisors guiding your purchase, leasing, and residential portfolio management.",
        eyebrow: "Expert property advisors guiding your purchase, leasing, and residential portfolio management.",
        badgeText: "Premier Locations",
        ctaText: "Meet Our Agents",
        primaryButtonText: "Meet Our Agents",
        ctaLink: "/agents",
        primaryButtonUrl: "/agents",
        secondaryButtonText: "List Your Home",
        secondaryButtonUrl: "/list-property",
      },
    ];
  }

  // 3. COURSES & EDUCATION
  if (cat.includes("course") || cat.includes("edu") || variant.includes("course") || variant.includes("academy") || tId.includes("courses")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Master In-Demand Skills",
        title: company.name ? `Welcome to ${company.name}` : "Master In-Demand Skills",
        subline: "Learn from recognized industry experts with practical accredited courses and career-launching mentorship.",
        eyebrow: "Learn from recognized industry experts with practical accredited courses and career-launching mentorship.",
        badgeText: "Accredited Professional Training",
        ctaText: "Explore Courses",
        primaryButtonText: "Explore Courses",
        ctaLink: "/courses",
        primaryButtonUrl: "/courses",
        secondaryButtonText: "Free Trial Class",
        secondaryButtonUrl: "/free-trial",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2670",
        headline: "Learn at Your Own Pace",
        title: "Learn at Your Own Pace",
        subline: "Flexible, project-driven curriculums designed to elevate your career and unlock new opportunities.",
        eyebrow: "Flexible, project-driven curriculums designed to elevate your career and unlock new opportunities.",
        badgeText: "Certificate Included",
        ctaText: "Enroll Today",
        primaryButtonText: "Enroll Today",
        ctaLink: "/enroll",
        primaryButtonUrl: "/enroll",
        secondaryButtonText: "View Curriculum",
        secondaryButtonUrl: "/curriculum",
      },
    ];
  }

  // 4. HEALTHCARE & CLINIC
  if (cat.includes("health") || cat.includes("medic") || cat.includes("clinic") || variant.includes("clinic") || tId.includes("healthcare")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "World-Class Healthcare",
        title: company.name ? `Welcome to ${company.name}` : "World-Class Healthcare",
        subline: "Comprehensive diagnostic, therapeutic, and preventive care delivered by compassionate specialists.",
        eyebrow: "Comprehensive diagnostic, therapeutic, and preventive care delivered by compassionate specialists.",
        badgeText: "Trusted Medical Specialists",
        ctaText: "Book Appointment",
        primaryButtonText: "Book Appointment",
        ctaLink: "/appointments",
        primaryButtonUrl: "/appointments",
        secondaryButtonText: "Our Services",
        secondaryButtonUrl: "/services",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2670",
        headline: "Dedicated to Your Well-being",
        title: "Dedicated to Your Well-being",
        subline: "Modern clinical facilities, personalized wellness treatments, and rapid consultations.",
        eyebrow: "Modern clinical facilities, personalized wellness treatments, and rapid consultations.",
        badgeText: "Same-Day Consultations",
        ctaText: "Meet the Doctors",
        primaryButtonText: "Meet the Doctors",
        ctaLink: "/doctors",
        primaryButtonUrl: "/doctors",
        secondaryButtonText: "Emergency Info",
        secondaryButtonUrl: "/contact",
      },
    ];
  }

  // 5. FITNESS & GYM
  if (cat.includes("fit") || cat.includes("gym") || variant.includes("gym") || variant.includes("fitness") || tId.includes("fitness")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Unleash Your Strength",
        title: company.name ? `Welcome to ${company.name}` : "Unleash Your Strength",
        subline: "High-performance equipment, energizing group fitness classes, and dedicated personal coaches.",
        eyebrow: "High-performance equipment, energizing group fitness classes, and dedicated personal coaches.",
        badgeText: "Elite Performance Training",
        ctaText: "Claim Free Pass",
        primaryButtonText: "Claim Free Pass",
        ctaLink: "/free-pass",
        primaryButtonUrl: "/free-pass",
        secondaryButtonText: "View Class Schedule",
        secondaryButtonUrl: "/classes",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2670",
        headline: "Transform Body & Mind",
        title: "Transform Body & Mind",
        subline: "Custom workout regimens, body composition tracking, and nutrition guidance tailored to your goals.",
        eyebrow: "Custom workout regimens, body composition tracking, and nutrition guidance tailored to your goals.",
        badgeText: "All Levels Welcome",
        ctaText: "Membership Options",
        primaryButtonText: "Membership Options",
        ctaLink: "/membership",
        primaryButtonUrl: "/membership",
        secondaryButtonText: "Meet Coaches",
        secondaryButtonUrl: "/trainers",
      },
    ];
  }

  // 6. TRAVEL & SAFARI
  if (cat.includes("travel") || cat.includes("safari") || cat.includes("tour") || variant.includes("travel") || tId.includes("travel")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Extraordinary Journeys Await",
        title: company.name ? `Welcome to ${company.name}` : "Extraordinary Journeys Await",
        subline: "Immersive wildlife safaris, scenic wilderness escapes, and curated luxury adventure expeditions.",
        eyebrow: "Immersive wildlife safaris, scenic wilderness escapes, and curated luxury adventure expeditions.",
        badgeText: "Bespoke Travel Expeditions",
        ctaText: "Explore Destinations",
        primaryButtonText: "Explore Destinations",
        ctaLink: "/destinations",
        primaryButtonUrl: "/destinations",
        secondaryButtonText: "Custom Itinerary",
        secondaryButtonUrl: "/custom-safari",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2670",
        headline: "Pure Luxury in Nature",
        title: "Pure Luxury in Nature",
        subline: "Five-star eco lodges, knowledgeable naturalist guides, and seamless private transfer arrangements.",
        eyebrow: "Five-star eco lodges, knowledgeable naturalist guides, and seamless private transfer arrangements.",
        badgeText: "Handpicked Luxury Camps",
        ctaText: "Book Your Safari",
        primaryButtonText: "Book Your Safari",
        ctaLink: "/booking",
        primaryButtonUrl: "/booking",
        secondaryButtonText: "Seasonal Offers",
        secondaryButtonUrl: "/offers",
      },
    ];
  }

  // 7. RESTAURANT & DINING
  if (cat.includes("restaur") || cat.includes("dine") || cat.includes("cafe") || cat.includes("food") || variant.includes("restaur") || tId.includes("restaurant")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "The Art of Gourmet Dining",
        title: company.name ? `Welcome to ${company.name}` : "The Art of Gourmet Dining",
        subline: "Experience an explosion of flavors crafted by world-class chefs in the heart of the city.",
        eyebrow: "Experience an explosion of flavors crafted by world-class chefs in the heart of the city.",
        badgeText: "Experience Excellence",
        ctaText: "Reserve a Table",
        primaryButtonText: "Reserve a Table",
        ctaLink: "/restaurent/products",
        primaryButtonUrl: "/restaurent/products",
        secondaryButtonText: "Explore Menu",
        secondaryButtonUrl: "/restaurent/products",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2670",
        headline: "Savor Every Moment",
        title: "Savor Every Moment",
        subline: "From farm to fork, we bring you the freshest seasonal ingredients prepared with passion.",
        eyebrow: "From farm to fork, we bring you the freshest seasonal ingredients prepared with passion.",
        badgeText: "Seasonal Specials",
        ctaText: "Explore Menu",
        primaryButtonText: "Explore Menu",
        ctaLink: "/restaurent/products",
        primaryButtonUrl: "/restaurent/products",
        secondaryButtonText: "Private Events",
        secondaryButtonUrl: "/events",
      },
    ];
  }

  // 8. BARBERSHOP & SALON
  if (cat.includes("barber") || cat.includes("salon") || cat.includes("spa") || variant.includes("barber") || tId.includes("barbershop")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Classic Grooming Experience",
        title: company.name ? `Welcome to ${company.name}` : "Classic Grooming Experience",
        subline: "Precision haircuts, hot-towel straight-razor shaves, and modern gentleman grooming treatments.",
        eyebrow: "Precision haircuts, hot-towel straight-razor shaves, and modern gentleman grooming treatments.",
        badgeText: "Artisan Barber Experience",
        ctaText: "Book Appointment",
        primaryButtonText: "Book Appointment",
        ctaLink: "/booking",
        primaryButtonUrl: "/booking",
        secondaryButtonText: "View Services",
        secondaryButtonUrl: "/services",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2670",
        headline: "Crafted with Precision",
        title: "Crafted with Precision",
        subline: "Relax in vintage luxury while our master stylists deliver timeless cuts and signature beard grooming.",
        eyebrow: "Relax in vintage luxury while our master stylists deliver timeless cuts and signature beard grooming.",
        badgeText: "Walk-Ins & Appointments",
        ctaText: "Services & Pricing",
        primaryButtonText: "Services & Pricing",
        ctaLink: "/services",
        primaryButtonUrl: "/services",
        secondaryButtonText: "Our Team",
        secondaryButtonUrl: "/team",
      },
    ];
  }

  // 9. PROFESSIONAL SERVICES & CONSULTING
  if (cat.includes("service") || cat.includes("consult") || cat.includes("secur") || variant.includes("service") || variant.includes("consult") || tId.includes("services") || tId.includes("security")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Strategic Excellence",
        title: company.name ? `Welcome to ${company.name}` : "Strategic Excellence",
        subline: "Empowering modern enterprises with expert consulting, innovative execution, and digital transformation.",
        eyebrow: "Empowering modern enterprises with expert consulting, innovative execution, and digital transformation.",
        badgeText: "Trusted Strategic Advisors",
        ctaText: "Schedule Consultation",
        primaryButtonText: "Schedule Consultation",
        ctaLink: "/consultation",
        primaryButtonUrl: "/consultation",
        secondaryButtonText: "Our Capabilities",
        secondaryButtonUrl: "/services",
      },
      {
        id: "slide-2",
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2670",
        headline: "Accelerate Your Growth",
        title: "Accelerate Your Growth",
        subline: "Tailored enterprise solutions backed by deep domain expertise, proven methodologies, and measurable ROI.",
        eyebrow: "Tailored enterprise solutions backed by deep domain expertise, proven methodologies, and measurable ROI.",
        badgeText: "End-to-End Solutions",
        ctaText: "Explore Solutions",
        primaryButtonText: "Explore Solutions",
        ctaLink: "/services",
        primaryButtonUrl: "/services",
        secondaryButtonText: "Case Studies",
        secondaryButtonUrl: "/case-studies",
      },
    ];
  }

  // 10. FASHION
  if (cat.includes("fashion") || cat.includes("cloth") || cat.includes("apparel") || variant.includes("fashion") || tId.includes("fashion")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Refined Modern Elegance",
        title: company.name ? `Welcome to ${company.name}` : "Refined Modern Elegance",
        subline: "Discover modern seasonal collections tailored with premium fabrics, architectural silhouettes, and effortless style.",
        eyebrow: "Discover modern seasonal collections tailored with premium fabrics, architectural silhouettes, and effortless style.",
        badgeText: "New Season Arrivals",
        ctaText: "Shop Collection",
        primaryButtonText: "Shop Collection",
        ctaLink: "/shop",
        primaryButtonUrl: "/shop",
        secondaryButtonText: "Lookbook",
        secondaryButtonUrl: "/lookbook",
      },
    ];
  }

  // 11. ELECTRONICS & GADGETS
  if (cat.includes("electr") || cat.includes("gadget") || cat.includes("tech") || variant.includes("electron") || variant.includes("gaming") || tId.includes("electronic") || tId.includes("gaming")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Next-Generation Technology",
        title: company.name ? `Welcome to ${company.name}` : "Next-Generation Technology",
        subline: "Upgrade your lifestyle with cutting-edge smart devices, high-fidelity audio, and pro-grade performance hardware.",
        eyebrow: "Upgrade your lifestyle with cutting-edge smart devices, high-fidelity audio, and pro-grade performance hardware.",
        badgeText: "Official Warranty Guaranteed",
        ctaText: "Explore Tech Deals",
        primaryButtonText: "Explore Tech Deals",
        ctaLink: "/shop",
        primaryButtonUrl: "/shop",
        secondaryButtonText: "New Releases",
        secondaryButtonUrl: "/shop?filter=new",
      },
    ];
  }

  // 12. GROCERIES & FRESH FOOD
  if (cat.includes("groc") || cat.includes("fresh") || cat.includes("supermarket") || variant.includes("grocer") || tId.includes("groceries")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Farm-Fresh Organics Delivered",
        title: company.name ? `Welcome to ${company.name}` : "Farm-Fresh Organics Delivered",
        subline: "Locally sourced organic produce, daily bakery items, and household essentials dispatched directly to your kitchen.",
        eyebrow: "Locally sourced organic produce, daily bakery items, and household essentials dispatched directly to your kitchen.",
        badgeText: "100% Certified Organic",
        ctaText: "Shop Fresh Today",
        primaryButtonText: "Shop Fresh Today",
        ctaLink: "/shop",
        primaryButtonUrl: "/shop",
        secondaryButtonText: "Weekly Specials",
        secondaryButtonUrl: "/deals",
      },
    ];
  }

  // 13. FURNITURE & LIVING
  if (cat.includes("furnitur") || cat.includes("decor") || cat.includes("home") || variant.includes("furniture") || tId.includes("furniture")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Artisan Furniture for Living",
        title: company.name ? `Welcome to ${company.name}` : "Artisan Furniture for Living",
        subline: "Handcrafted hardwood furniture, comfortable minimalist sofas, and contemporary lighting made for beautiful living.",
        eyebrow: "Handcrafted hardwood furniture, comfortable minimalist sofas, and contemporary lighting made for beautiful living.",
        badgeText: "Sustainable Solid Wood",
        ctaText: "Explore Furniture",
        primaryButtonText: "Explore Furniture",
        ctaLink: "/shop",
        primaryButtonUrl: "/shop",
        secondaryButtonText: "Custom Design",
        secondaryButtonUrl: "/custom",
      },
    ];
  }

  // 14. BEAUTY & COSMETICS
  if (cat.includes("beauty") || cat.includes("skin") || cat.includes("cosmetic") || variant.includes("beauty") || tId.includes("beauty")) {
    return [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2670",
        headline: company.name ? `Welcome to ${company.name}` : "Radiant Natural Beauty",
        title: company.name ? `Welcome to ${company.name}` : "Radiant Natural Beauty",
        subline: "Pure botanical skincare, clean cosmetics, and dermatologically tested treatments crafted to enhance your natural glow.",
        eyebrow: "Pure botanical skincare, clean cosmetics, and dermatologically tested treatments crafted to enhance your natural glow.",
        badgeText: "Cruelty-Free & Pure",
        ctaText: "Shop Skincare",
        primaryButtonText: "Shop Skincare",
        ctaLink: "/shop",
        primaryButtonUrl: "/shop",
        secondaryButtonText: "Skin Quiz",
        secondaryButtonUrl: "/quiz",
      },
    ];
  }

  // 15. DEFAULT / GENERAL ECOMMERCE
  return [
    {
      id: "slide-1",
      imageUrl: company.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
      headline: company.name ? `Welcome to ${company.name}` : canonicalTemplate?.name || "Elevate Your Lifestyle",
      title: company.name ? `Welcome to ${company.name}` : canonicalTemplate?.name || "Elevate Your Lifestyle",
      subline: company.tagline || "Curated Quality, Exceptional Value & Reliable Customer Service",
      eyebrow: company.tagline || "Curated Quality, Exceptional Value & Reliable Customer Service",
      badgeText: "Official Collection",
      ctaText: "Explore Shop",
      primaryButtonText: "Explore Shop",
      ctaLink: "/products",
      primaryButtonUrl: "/products",
      secondaryButtonText: "About Us",
      secondaryButtonUrl: "/about",
    },
  ];
}

/**
 * Generate default homepage sections from company data and authentic template tree
 */
export function compileHomepageSections(company: any): WebsiteSectionConfig[] {
  const canonicalTemplate = getTemplateForCompany(company);
  const rawSlides = resolveCategorySeedSlides(company, canonicalTemplate);

  // If the template defines authentic sections, preserve its exact component hierarchy
  if (canonicalTemplate?.authenticSections && canonicalTemplate.authenticSections.length > 0) {
    return canonicalTemplate.authenticSections.map((sec, idx) => {
      const content = { ...(sec.defaultContent || {}) };

      if (sec.type === "hero") {
        content.variant = "slider";
        content.autoplay = true;
        content.autoplayIntervalMs = 5000;
        content.slides = rawSlides.map((s: any, sIdx: number) => ({
          id: s.id || `slide-${sIdx + 1}`,
          headline: s.headline || s.title || company.name || canonicalTemplate?.name || "Official Store",
          title: s.headline || s.title || company.name || canonicalTemplate?.name || "Official Store",
          subline: s.subline || s.eyebrow || "Experience exceptional quality and service.",
          eyebrow: s.subline || s.eyebrow || "Experience exceptional quality and service.",
          description: s.badgeText || s.description || company.description || "Discover verified selections.",
          badgeText: s.badgeText || "Official Collection",
          primaryButtonText: s.ctaText || s.primaryButtonText || "Explore",
          ctaText: s.ctaText || s.primaryButtonText || "Explore",
          primaryButtonUrl: s.ctaLink || s.primaryButtonUrl || "/products",
          ctaLink: s.ctaLink || s.primaryButtonUrl || "/products",
          secondaryButtonText: s.secondaryButtonText || "About Us",
          secondaryButtonUrl: s.secondaryButtonUrl || "/about",
          imageUrl: s.imageUrl || company.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        }));
      } else if (sec.type === "testimonials" && Array.isArray(company.testimonials) && company.testimonials.length > 0) {
        content.testimonials = company.testimonials.map((t: any) => ({
          id: t.id,
          author: t.author?.name || t.authorName || "Verified Customer",
          role: t.role || "Shopper",
          quote: t.content || t.quote,
          rating: t.rating || 5,
        }));
      } else if (sec.type === "ctaBanner" && Array.isArray(company.promotions) && company.promotions.length > 0) {
        const promo = company.promotions[0];
        content.title = promo.title || content.title;
        content.description = promo.description || content.description;
        content.buttonText = promo.ctaText || content.buttonText;
        content.buttonUrl = promo.ctaLink || content.buttonUrl;
      }

      return {
        id: sec.id.startsWith("sec-") ? sec.id : `sec-${sec.id}`,
        type: sec.type as any,
        name: sec.name,
        component: sec.component,
        order: idx,
        isVisible: true,
        content,
        styles: sec.defaultStyles || {
          paddingTop: "xl",
          paddingBottom: "xl",
          textAlign: "left",
        },
        responsive: {
          columnsMobile: 1,
          columnsTablet: 2,
          columnsDesktop: 4,
          hideOnMobile: false,
          hideOnDesktop: false,
        },
        dataSource: sec.dataSource ? (sec.dataSource as any) : undefined,
      };
    });
  }

  const sections: WebsiteSectionConfig[] = [];
  let order = 0;

  // 1. HERO SECTION

  sections.push({
    id: "sec-hero",
    type: "hero",
    order: order++,
    isVisible: true,
    content: {
      variant: "slider",
      autoplay: true,
      autoplayIntervalMs: 5000,
      slides: rawSlides.map((s: any, idx: number) => ({
        id: s.id || `slide-${idx + 1}`,
        headline: s.headline || s.title || company.name || "Official Store",
        title: s.headline || s.title || company.name || "Official Store",
        subline: s.subline || s.eyebrow || s.description || "Experience exceptional quality and service.",
        eyebrow: s.subline || s.eyebrow || s.description || "Experience exceptional quality and service.",
        description: s.badgeText || s.description || company.description || "Experience Excellence",
        badgeText: s.badgeText || "Official Collection",
        primaryButtonText: s.ctaText || s.primaryButtonText || "Explore",
        ctaText: s.ctaText || s.primaryButtonText || "Explore",
        primaryButtonUrl: s.ctaLink || s.primaryButtonUrl || "/products",
        ctaLink: s.ctaLink || s.primaryButtonUrl || "/products",
        secondaryButtonText: s.secondaryButtonText || "About Us",
        secondaryButtonUrl: s.secondaryButtonUrl || "/about",
        imageUrl: s.imageUrl || company.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
      })),
    },
    styles: {
      paddingTop: "none",
      paddingBottom: "none",
      textAlign: "left",
    },
    responsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  });

  // 2. TRUST / FEATURES BADGES
  const coreValues = Array.isArray(company.CoreValues) && company.CoreValues.length > 0
    ? company.CoreValues
    : null;

  sections.push({
    id: "sec-features",
    type: "featuresBadges",
    order: order++,
    isVisible: true,
    content: {
      badges: coreValues
        ? coreValues.slice(0, 4).map((cv: any, idx: number) => ({
            id: cv.id || `badge-${idx}`,
            icon: "shield",
            title: cv.title || "Guaranteed Quality",
            description: cv.description || "Inspected and certified before dispatch.",
          }))
        : SECTION_REGISTRY.featuresBadges.defaultContent.badges,
    },
    styles: {
      paddingTop: "md",
      paddingBottom: "md",
      textAlign: "center",
      backgroundColor: "#F8FAFC",
    },
    responsive: {
      columnsMobile: 2,
      columnsTablet: 2,
      columnsDesktop: 4,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  });

  // 3. CATEGORY SHOWCASE
  sections.push({
    id: "sec-categories",
    type: "categoryGrid",
    order: order++,
    isVisible: true,
    content: {
      title: "Explore Popular Categories",
      subtitle: "Find exactly what you're looking for",
      layout: "grid",
      showProductCount: true,
    },
    styles: {
      paddingTop: "xl",
      paddingBottom: "lg",
      textAlign: "left",
    },
    responsive: {
      columnsMobile: 2,
      columnsTablet: 3,
      columnsDesktop: 6,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
    dataSource: {
      type: "categories",
      filter: "featured",
      limit: 6,
    },
  });

  // 4. FEATURED PRODUCTS GRID
  sections.push({
    id: "sec-featured",
    type: "productGrid",
    order: order++,
    isVisible: true,
    content: {
      title: "Featured Products",
      subtitle: "Top rated selections directly from our warehouse",
      viewAllUrl: "/shop",
      viewAllText: "View All Products",
      showRating: true,
      showAddToCart: true,
      showWishlist: true,
      showBadges: true,
      gridStyle: "standard",
    },
    styles: {
      paddingTop: "lg",
      paddingBottom: "xl",
      textAlign: "left",
    },
    responsive: {
      columnsMobile: 1,
      columnsTablet: 2,
      columnsDesktop: 4,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
    dataSource: {
      type: "products",
      filter: "featured",
      limit: 8,
    },
  });

  // 5. STORY / ABOUT HIGHLIGHT
  sections.push({
    id: "sec-about",
    type: "imageWithText",
    order: order++,
    isVisible: true,
    content: {
      title: company.tagline || `About ${company.name || "Our Store"}`,
      subtitle: "Our Story",
      description: company.description || "We are dedicated to bringing you authentic, high quality products. Our priority is customer delight through fast delivery and honest service.",
      imageUrl: company.bannerUrl || company.logoUrl || "https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=1200&auto=format&fit=crop",
      imagePosition: "left",
      buttonText: "Learn More About Us",
      buttonUrl: "/about",
      founderName: company.founderName || undefined,
      founderQuote: company.founderQuote || undefined,
      stats: [
        { label: "Verified Orders", value: "5,000+" },
        { label: "Customer Rating", value: "4.9 / 5" },
        { label: "Fast Dispatch", value: "< 24 Hours" },
      ],
    },
    styles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "left",
      backgroundColor: "#F8FAFC",
    },
    responsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 2,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  });

  // 6. TRENDING CAROUSEL
  sections.push({
    id: "sec-trending",
    type: "productCarousel",
    order: order++,
    isVisible: true,
    content: {
      title: "Trending This Week",
      subtitle: "Most sought-after items loved by our customers",
      viewAllUrl: "/shop?filter=trending",
      viewAllText: "Explore Trending",
      showRating: true,
      showAddToCart: true,
      showWishlist: true,
      showBadges: true,
      gridStyle: "standard",
    },
    styles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "left",
    },
    responsive: {
      columnsMobile: 1,
      columnsTablet: 2,
      columnsDesktop: 4,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
    dataSource: {
      type: "products",
      filter: "trending",
      limit: 8,
    },
  });

  // 7. CALL TO ACTION BANNER (From Promotions if available)
  const firstPromo = Array.isArray(company.promotions) && company.promotions.length > 0
    ? company.promotions[0]
    : null;

  sections.push({
    id: "sec-cta",
    type: "ctaBanner",
    order: order++,
    isVisible: true,
    content: {
      title: firstPromo?.title || "Special Deals & Seasonal Discounts",
      description: firstPromo?.description || "Browse our catalog today and enjoy prompt countrywide delivery with safe M-Pesa payments.",
      buttonText: firstPromo?.ctaText || "Shop the Sale",
      buttonUrl: firstPromo?.link || "/shop?filter=featured",
      secondaryButtonText: "Talk on WhatsApp",
      secondaryButtonUrl: company.contactPhone ? `https://wa.me/${company.contactPhone.replace(/\D/g, '')}` : "/contact",
      badgeText: "Limited Time",
      backgroundImageUrl: firstPromo?.imageUrl || "",
    },
    styles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "center",
      backgroundColor: "#0F172A",
      textColor: "#FFFFFF",
    },
    responsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  });

  // 8. TESTIMONIALS SECTION
  const testimonials = Array.isArray(company.testimonials) && company.testimonials.length > 0
    ? company.testimonials
    : null;

  sections.push({
    id: "sec-testimonials",
    type: "testimonials",
    order: order++,
    isVisible: true,
    content: {
      title: "Real Reviews from Happy Shoppers",
      subtitle: "See why customers choose us time and again",
      layout: "grid",
      testimonials: testimonials
        ? testimonials.slice(0, 3).map((t: any, idx: number) => ({
            id: t.id || `t-${idx}`,
            author: t.author?.name || t.authorName || "Verified Buyer",
            role: "Customer",
            avatarUrl: t.author?.avatarUrl || t.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
            rating: t.rating || 5,
            quote: t.quote || t.content || "Fast delivery and exceptional item quality. Exceeded my expectations!",
          }))
        : SECTION_REGISTRY.testimonials.defaultContent.testimonials,
    },
    styles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "center",
    },
    responsive: {
      columnsMobile: 1,
      columnsTablet: 2,
      columnsDesktop: 3,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  });

  // 9. FAQ ACCORDION
  const faqs = Array.isArray(company.faqs) && company.faqs.length > 0
    ? company.faqs
    : null;

  sections.push({
    id: "sec-faq",
    type: "faq",
    order: order++,
    isVisible: true,
    content: {
      title: "Common Questions",
      subtitle: "Got queries? Find instant answers below",
      faqs: faqs
        ? faqs.slice(0, 5).map((f: any, idx: number) => ({
            id: f.id || `faq-${idx}`,
            question: f.question,
            answer: f.answer,
          }))
        : SECTION_REGISTRY.faq.defaultContent.faqs,
    },
    styles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "center",
      backgroundColor: "#F8FAFC",
    },
    responsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  });

  // 10. NEWSLETTER CAPTURE
  sections.push({
    id: "sec-newsletter",
    type: "newsletter",
    order: order++,
    isVisible: true,
    content: {
      title: `Stay in Touch with ${company.name || "Us"}`,
      subtitle: "Be the first to hear about new collections, seasonal discounts, and VIP-only voucher drops.",
      buttonText: "Subscribe",
      incentiveBadge: "10% First Order Voucher",
    },
    styles: {
      paddingTop: "xl",
      paddingBottom: "xl",
      textAlign: "center",
    },
    responsive: {
      columnsMobile: 1,
      columnsTablet: 1,
      columnsDesktop: 1,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  });

  return sections;
}

/**
 * Generate default subpages based on the canonical template's explicit page list
 */
export function compileDefaultPages(company: any, homepageSections: WebsiteSectionConfig[]): WebsitePageConfig[] {
  const canonicalTemplate = getTemplateForCompany(company);
  const templatePages = canonicalTemplate.defaultPages || [];

  return templatePages.map((tp, idx) => {
    if (tp.isHomepage || tp.slug === "home") {
      return {
        id: `page-${tp.slug}`,
        title: tp.title,
        slug: tp.slug,
        isHomepage: true,
        isVisible: true,
        order: idx,
        seo: {
          metaTitle: company.SEO?.title || `${company.name} | Official Storefront`,
          metaDescription: company.SEO?.description || company.description || "Browse our catalog of verified products.",
          noIndex: false,
        },
        sections: homepageSections,
      };
    }

    // Build specialized page section based on pageType
    let sections: WebsiteSectionConfig[] = [];
    if (tp.pageType === "PRODUCT_LIST" || tp.slug === "products" || tp.slug === "shop" || tp.slug === "inventory" || tp.slug === "menu") {
      sections = [
        {
          id: `sec-${tp.slug}-grid`,
          type: "productGrid",
          order: 0,
          isVisible: true,
          content: {
            title: tp.title,
            subtitle: `Browse our ${company.name || "catalog"} collection with live pricing and availability`,
            viewAllUrl: "",
            viewAllText: "",
            showRating: true,
            showAddToCart: true,
            showWishlist: true,
            showBadges: true,
            gridStyle: "standard",
          },
          styles: { paddingTop: "xl", paddingBottom: "xl", textAlign: "left" },
          responsive: { columnsMobile: 1, columnsTablet: 2, columnsDesktop: 4, hideOnMobile: false, hideOnDesktop: false },
          dataSource: { type: "products", filter: "latest", limit: 24 },
        },
      ];
    } else if (tp.pageType === "CATEGORY_LIST" || tp.slug === "categories") {
      sections = [
        {
          id: `sec-${tp.slug}-grid`,
          type: "categoryGrid",
          order: 0,
          isVisible: true,
          content: {
            title: "Explore by Department",
            subtitle: "Find exactly what you are looking for",
            layout: "grid",
            showProductCount: true,
          },
          styles: { paddingTop: "xl", paddingBottom: "xl", textAlign: "left" },
          responsive: { columnsMobile: 2, columnsTablet: 3, columnsDesktop: 6, hideOnMobile: false, hideOnDesktop: false },
          dataSource: { type: "categories", filter: "featured", limit: 6 },
        },
      ];
    } else if (tp.pageType === "ABOUT" || tp.slug === "about") {
      sections = [
        {
          id: `sec-${tp.slug}-story`,
          type: "imageWithText",
          order: 0,
          isVisible: true,
          content: {
            title: company.tagline || `About ${company.name || "Our Brand"}`,
            subtitle: "Our Story & Commitment",
            description: company.description || "Founded with a passion for excellence, we serve customers with integrity, speed, and premium craftsmanship.",
            imageUrl: company.bannerUrl || "https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=1200&auto=format&fit=crop",
            imagePosition: "left",
            buttonText: "Shop Collection",
            buttonUrl: "/products",
            founderName: company.founderName || undefined,
            founderQuote: company.founderQuote || undefined,
          },
          styles: { paddingTop: "xl", paddingBottom: "xl", textAlign: "left" },
          responsive: { columnsMobile: 1, columnsTablet: 1, columnsDesktop: 2, hideOnMobile: false, hideOnDesktop: false },
        },
        {
          id: `sec-${tp.slug}-features`,
          type: "featuresBadges",
          order: 1,
          isVisible: true,
          content: SECTION_REGISTRY.featuresBadges.defaultContent,
          styles: { paddingTop: "lg", paddingBottom: "lg", textAlign: "center", backgroundColor: "#F8FAFC" },
          responsive: { columnsMobile: 2, columnsTablet: 2, columnsDesktop: 4, hideOnMobile: false, hideOnDesktop: false },
        },
      ];
    } else if (tp.pageType === "CONTACT" || tp.slug === "contact") {
      sections = [
        {
          id: `sec-${tp.slug}-main`,
          type: "contact",
          order: 0,
          isVisible: true,
          content: {
            title: "We're Here to Help",
            subtitle: "Reach out via WhatsApp, phone, email, or visit our location.",
            showForm: true,
            showDirectWhatsApp: true,
            showOpeningHours: true,
            showLocations: true,
          },
          styles: { paddingTop: "xl", paddingBottom: "xl", textAlign: "left" },
          responsive: { columnsMobile: 1, columnsTablet: 1, columnsDesktop: 2, hideOnMobile: false, hideOnDesktop: false },
        },
      ];
    } else {
      sections = [
        {
          id: `sec-${tp.slug}-content`,
          type: "imageWithText",
          order: 0,
          isVisible: true,
          content: {
            title: tp.title,
            subtitle: company.name,
            description: `Welcome to the ${tp.title} page for ${company.name || "our store"}.`,
            imageUrl: company.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
            imagePosition: "left",
          },
          styles: { paddingTop: "xl", paddingBottom: "xl", textAlign: "left" },
          responsive: { columnsMobile: 1, columnsTablet: 1, columnsDesktop: 2, hideOnMobile: false, hideOnDesktop: false },
        },
      ];
    }

    return {
      id: `page-${tp.slug}`,
      title: tp.title,
      slug: tp.slug,
      isHomepage: false,
      isVisible: true,
      order: idx,
      seo: {
        metaTitle: `${tp.title} | ${company.name}`,
        metaDescription: `${tp.title} at ${company.name}.`,
        noIndex: false,
      },
      sections,
    };
  });
}

/**
 * Main migration compiler: Given any raw Company record from DB,
 * produces a validated CompiledWebsiteConfig.
 */
export function compileWebsiteFromCompany(company: any): CompiledWebsiteConfig {
  const canonicalTemplate = getTemplateForCompany(company);
  const theme = compileThemeTokens(company);
  const navigation = compileNavigation(company);
  const homepageSections = compileHomepageSections(company);
  const pages = compileDefaultPages(company, homepageSections);

  return {
    version: 1,
    templateKey: canonicalTemplate.id,
    storeName: company.name || "Store",
    storeSlug: company.slug || "store",
    theme,
    navigation,
    pages,
    componentOverrides: {},
    publishedAt: new Date().toISOString(),
  };
}
