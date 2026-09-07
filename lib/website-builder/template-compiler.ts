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
 * Build initial theme tokens by blending category defaults with store's themeSettings
 */
export function compileThemeTokens(company: any): ThemeTokens {
  const categoryKey = (company.category || "default").toLowerCase();
  const matchedPalette = Object.entries(CATEGORY_THEME_PALETTES).find(([k]) =>
    categoryKey.includes(k)
  )?.[1] || CATEGORY_THEME_PALETTES.default;

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
    bodyFont: userTheme.bodyFont || "Inter, sans-serif",
    baseFontSize: "md",
    buttonRadius: (matchedPalette.buttonRadius as any) || "lg",
    cardRadius: (matchedPalette.cardRadius as any) || "xl",
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
  const brandName = company.name || "Store";
  const primaryPhone = company.contactPhone || "";
  const primaryEmail = company.contactEmail || "";
  const address = company.address || company.addresses?.[0]?.address || "Nairobi, Kenya";

  return {
    headerItems: [
      { id: "nav-home", label: "Home", url: "/" },
      { id: "nav-shop", label: "Shop", url: "/shop" },
      { id: "nav-categories", label: "Categories", url: "/categories" },
      { id: "nav-about", label: "Our Story", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ],
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
 * Generate default homepage sections from company data
 */
export function compileHomepageSections(company: any): WebsiteSectionConfig[] {
  const sections: WebsiteSectionConfig[] = [];
  let order = 0;

  // 1. HERO SECTION
  const rawSlides = Array.isArray(company.heroSlides) && company.heroSlides.length > 0
    ? company.heroSlides
    : [
        {
          id: "slide-1",
          imageUrl: company.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
          headline: company.name ? `Welcome to ${company.name}` : "Elevate Your Lifestyle",
          subline: company.tagline || "Curated Quality & Exceptional Value",
          badgeText: "Exclusive Collection",
          ctaText: "Explore Shop",
          ctaLink: "/shop",
        },
      ];

  sections.push({
    id: `sec-hero-${Date.now()}`,
    type: "hero",
    order: order++,
    isVisible: true,
    content: {
      variant: "slider",
      autoplay: true,
      autoplayIntervalMs: 5000,
      slides: rawSlides.map((s: any, idx: number) => ({
        id: s.id || `slide-${idx}`,
        eyebrow: s.subline || "Official Store Collection",
        title: s.headline || company.name || "Modern Quality Goods",
        description: s.badgeText || company.description || "Discover verified products backed by exceptional customer service.",
        primaryButtonText: s.ctaText || "Shop Now",
        primaryButtonUrl: s.ctaLink || "/shop",
        secondaryButtonText: "About Us",
        secondaryButtonUrl: "/about",
        imageUrl: s.imageUrl || company.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        badgeText: "Handpicked Deals",
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
    id: `sec-features-${Date.now() + 1}`,
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
    id: `sec-categories-${Date.now() + 2}`,
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
    id: `sec-featured-${Date.now() + 3}`,
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
    id: `sec-about-${Date.now() + 4}`,
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
    id: `sec-trending-${Date.now() + 5}`,
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
    id: `sec-cta-${Date.now() + 6}`,
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
    id: `sec-testimonials-${Date.now() + 7}`,
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
    id: `sec-faq-${Date.now() + 8}`,
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
    id: `sec-newsletter-${Date.now() + 9}`,
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
 * Generate default subpages (Shop, About, Contact, FAQ)
 */
export function compileDefaultPages(company: any, homepageSections: WebsiteSectionConfig[]): WebsitePageConfig[] {
  return [
    {
      id: "page-home",
      title: "Home",
      slug: "home",
      isHomepage: true,
      isVisible: true,
      order: 0,
      seo: {
        metaTitle: company.SEO?.title || `${company.name} | Official Storefront`,
        metaDescription: company.SEO?.description || company.description || "Browse our catalog of verified products.",
      },
      sections: homepageSections,
    },
    {
      id: "page-shop",
      title: "Shop",
      slug: "shop",
      isHomepage: false,
      isVisible: true,
      order: 1,
      seo: {
        metaTitle: `Shop Products | ${company.name}`,
        metaDescription: `Discover the full catalog at ${company.name}.`,
      },
      sections: [
        {
          id: `sec-shop-grid-${Date.now()}`,
          type: "productGrid",
          order: 0,
          isVisible: true,
          content: {
            title: "All Products",
            subtitle: "Browse our complete catalog with live availability and pricing",
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
      ],
    },
    {
      id: "page-about",
      title: "About Us",
      slug: "about",
      isHomepage: false,
      isVisible: true,
      order: 2,
      seo: {
        metaTitle: `About Us | ${company.name}`,
        metaDescription: `Learn about our heritage and values at ${company.name}.`,
      },
      sections: [
        {
          id: `sec-about-story-${Date.now()}`,
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
            buttonUrl: "/shop",
            founderName: company.founderName || undefined,
            founderQuote: company.founderQuote || undefined,
          },
          styles: { paddingTop: "xl", paddingBottom: "xl", textAlign: "left" },
          responsive: { columnsMobile: 1, columnsTablet: 1, columnsDesktop: 2, hideOnMobile: false, hideOnDesktop: false },
        },
        {
          id: `sec-about-features-${Date.now()}`,
          type: "featuresBadges",
          order: 1,
          isVisible: true,
          content: SECTION_REGISTRY.featuresBadges.defaultContent,
          styles: { paddingTop: "lg", paddingBottom: "lg", textAlign: "center", backgroundColor: "#F8FAFC" },
          responsive: { columnsMobile: 2, columnsTablet: 2, columnsDesktop: 4, hideOnMobile: false, hideOnDesktop: false },
        },
      ],
    },
    {
      id: "page-contact",
      title: "Contact",
      slug: "contact",
      isHomepage: false,
      isVisible: true,
      order: 3,
      seo: {
        metaTitle: `Contact Us | ${company.name}`,
        metaDescription: `Reach out to our customer support team at ${company.name}.`,
      },
      sections: [
        {
          id: `sec-contact-main-${Date.now()}`,
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
      ],
    },
  ];
}

/**
 * Main migration compiler: Given any raw Company record from DB,
 * produces a validated CompiledWebsiteConfig.
 */
export function compileWebsiteFromCompany(company: any): CompiledWebsiteConfig {
  const theme = compileThemeTokens(company);
  const navigation = compileNavigation(company);
  const homepageSections = compileHomepageSections(company);
  const pages = compileDefaultPages(company, homepageSections);

  return {
    version: 1,
    templateKey: company.variant || company.category || "ecommerce",
    storeName: company.name || "Store",
    storeSlug: company.slug || "store",
    theme,
    navigation,
    pages,
    publishedAt: new Date().toISOString(),
  };
}
