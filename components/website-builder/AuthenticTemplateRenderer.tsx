"use client";

import React, { useMemo, useEffect } from "react";
import {
  TemplateDefinition,
  resolveCanonicalTemplate,
} from "@/lib/website-builder/template-registry";
import { CompiledWebsiteConfig, SectionType } from "@/types/website-builder";
import { StoreForm } from "@/types/typings";
import { StoreContextProvider, StoreDataSync } from "@/contexts/StoreContext";
import { EditableContentProvider, SelectedElementInfo } from "@/contexts/EditableContentContext";
import { BodyComponentMap } from "@/components/site/BodyComponentMap";
import { categoryHeaderFooterLayoutMap } from "@/components/site/layouts/categoryHeaderFooterLayoutMap";
import { SectionErrorBoundary } from "./sections/SectionErrorBoundary";
import HeroSection from "./sections/HeroSection";
import ProductGridSection from "./sections/ProductGridSection";
import CategoryGridSection from "./sections/CategoryGridSection";
import ImageWithTextSection from "./sections/ImageWithTextSection";
import FeaturesBadgesSection from "./sections/FeaturesBadgesSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import CtaBannerSection from "./sections/CtaBannerSection";
import FaqSection from "./sections/FaqSection";
import ContactSection from "./sections/ContactSection";
import NewsletterSection from "./sections/NewsletterSection";

export interface AuthenticTemplateRendererProps {
  config: CompiledWebsiteConfig;
  category?: string;
  variant?: string;
  storeFormData?: StoreForm | any;
  companyId?: string;
  paymentMethods?: any[];
  ghubaData?: any;
  pageSlug?: string;
  isEditorPreview?: boolean;
  isPreviewMode?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onNavigatePage?: (slug: string) => void;
  storeLogoUrl?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  socialLinks?: any[];
  // Element-level editing props
  selectedTargetId?: string | null;
  selectedElement?: SelectedElementInfo | null;
  onSelectElement?: (info: SelectedElementInfo | null) => void;
  onUpdateOverride?: (targetId: string, value: any) => void;
}

/**
 * Creates a default synthetic StoreForm when storeFormData is not provided
 */
function createSyntheticStoreForm(
  config: CompiledWebsiteConfig,
  template: TemplateDefinition,
  companyId?: string
): StoreForm {
  return {
    id: companyId || "synthetic-store-id",
    name: config.storeName || "Authentic Storefront",
    slug: config.storeSlug || "store",
    category: template.category || "ecommerce",
    variant: template.variant || "shoes-store",
    description: "Welcome to our authentic store experience.",
    logoUrl: "",
    bannerUrl: "",
    themeSettings: {
      primaryColor: config.theme?.primaryColor || template.defaultTheme.primaryColor,
      secondaryColor: config.theme?.secondaryColor || template.defaultTheme.secondaryColor,
      fontFamily: config.theme?.headingFont || template.defaultTheme.headingFont,
    },
    products: [
      {
        id: "sample-p1",
        title: "Signature Premium Product",
        name: "Signature Premium Product",
        price: 99.99,
        originalPrice: 129.99,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        category: "Featured",
        inStock: true,
      },
      {
        id: "sample-p2",
        title: "Classic Everyday Edition",
        name: "Classic Everyday Edition",
        price: 79.99,
        originalPrice: 99.99,
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80"],
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
        category: "Featured",
        inStock: true,
      },
      {
        id: "sample-p3",
        title: "Pro Performance Series",
        name: "Pro Performance Series",
        price: 149.99,
        originalPrice: 189.99,
        images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80"],
        imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
        category: "New Arrivals",
        inStock: true,
      },
      {
        id: "sample-p4",
        title: "Minimalist Urban Edition",
        name: "Minimalist Urban Edition",
        price: 89.99,
        originalPrice: 119.99,
        images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80"],
        imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
        category: "Popular",
        inStock: true,
      },
    ],
    categories: [
      { id: "c1", name: "Featured", slug: "featured" },
      { id: "c2", name: "New Arrivals", slug: "new-arrivals" },
      { id: "c3", name: "Trending", slug: "trending" },
    ],
    heroSlides: [
      {
        id: "slide-1",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        headline: config.storeName || "Official Authentic Collection",
        subline: "Curated Quality & Exceptional Value",
        badgeText: "Handpicked Deals",
        ctaText: "Shop Now",
        ctaLink: "/products",
      },
    ],
    reviews: [
      {
        id: "r1",
        authorName: "Sarah M.",
        content: "Incredible quality and lightning-fast customer support. Will order again!",
        rating: 5,
      },
      {
        id: "r2",
        authorName: "David K.",
        content: "Authentic craftsmanship and seamless ordering experience.",
        rating: 5,
      },
    ],
    addresses: [],
    socialLinks: [],
    policies: [],
    faqs: [],
    services: [],
    promotions: [],
  } as any;
}

export default function AuthenticTemplateRenderer({
  config,
  category,
  variant,
  storeFormData,
  companyId,
  paymentMethods = [],
  ghubaData,
  pageSlug = "home",
  isEditorPreview = false,
  isPreviewMode = false,
  selectedSectionId = null,
  onSelectSection,
  onNavigatePage,
  storeLogoUrl,
  contactPhone,
  contactEmail,
  address,
  socialLinks,
  selectedTargetId = null,
  selectedElement = null,
  onSelectElement,
  onUpdateOverride,
}: AuthenticTemplateRendererProps) {
  // 1. Resolve canonical template deterministically
  const canonicalTemplate = useMemo(() => {
    return resolveCanonicalTemplate(
      category || storeFormData?.category,
      variant || storeFormData?.variant,
      config.templateKey
    );
  }, [category, variant, storeFormData?.category, storeFormData?.variant, config.templateKey]);

  // 2. Resolve LayoutComponent
  const LayoutComponent = useMemo(() => {
    return (
      categoryHeaderFooterLayoutMap[canonicalTemplate.shellLayout] ||
      categoryHeaderFooterLayoutMap[canonicalTemplate.variant] ||
      categoryHeaderFooterLayoutMap[canonicalTemplate.category] ||
      categoryHeaderFooterLayoutMap["default"]
    );
  }, [canonicalTemplate]);

  // 3. Resolve BodyComponent
  const BodyComponent = useMemo(() => {
    return (
      BodyComponentMap[canonicalTemplate.bodyComponent] ||
      BodyComponentMap["DefaultSite"]
    );
  }, [canonicalTemplate]);

  // 4. Merge live config and overrides into storeFormData
  const mergedStoreData = useMemo(() => {
    const base: StoreForm = storeFormData
      ? {
          ...storeFormData,
          themeSettings: { ...(storeFormData.themeSettings || {}) },
          heroSlides: storeFormData.heroSlides
            ? storeFormData.heroSlides.map((s) => ({ ...s }))
            : [],
        }
      : createSyntheticStoreForm(config, canonicalTemplate, companyId);

    // Apply live theme overrides
    if (config.theme) {
      base.themeSettings = {
        ...(base.themeSettings || {}),
        primaryColor: config.theme.primaryColor || base.themeSettings?.primaryColor,
        secondaryColor: config.theme.secondaryColor || base.themeSettings?.secondaryColor,
        fontFamily: config.theme.headingFont || base.themeSettings?.fontFamily,
      };
    }

    // Apply store info overrides from props
    if (storeLogoUrl) base.logoUrl = storeLogoUrl;
    if (contactPhone) (base as any).contactPhone = contactPhone;
    if (contactEmail) (base as any).contactEmail = contactEmail;
    if (address) (base as any).address = address;
    if (socialLinks && socialLinks.length > 0) base.socialLinks = socialLinks;

    // Apply live Header & Footer component overrides
    const ov = config.componentOverrides || {};
    const headerBrand =
      ov["Header.brandName"] ||
      ov["Header.storeName"] ||
      ov["header.brandName"] ||
      ov["header.storeName"] ||
      ov["header.title"];
    if (headerBrand) base.name = headerBrand;

    const headerLogo = ov["Header.logoUrl"] || ov["header.logoUrl"];
    if (headerLogo) base.logoUrl = headerLogo;

    const footerBio = ov["Footer.bio"] || ov["footer.bio"] || ov["footer.description"];
    if (footerBio) base.description = footerBio;

    const footerPhone = ov["Footer.contactPhone"] || ov["footer.contactPhone"] || ov["footer.phone"];
    if (footerPhone) (base as any).contactPhone = footerPhone;

    const footerEmail = ov["Footer.contactEmail"] || ov["footer.contactEmail"] || ov["footer.email"];
    if (footerEmail) (base as any).contactEmail = footerEmail;

    const footerAddr = ov["Footer.address"] || ov["footer.address"];
    if (footerAddr) (base as any).address = footerAddr;

    const announcement = ov["Header.announcementText"] || ov["header.announcementText"];
    if (announcement) (base as any).tagline = announcement;

    // 1. Ensure base.heroSlides has at least 1 slide
    if (!base.heroSlides || base.heroSlides.length === 0) {
      base.heroSlides = [
        {
          id: "slide-1",
          imageUrl: base.bannerUrl || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670",
          headline: base.name ? `Welcome to ${base.name}` : "Experience Excellence",
          subline: base.description || "Discover premium products and exceptional service.",
          type: null,
          companyId: companyId || "",
          productImageUrl: null,
          ctaText: "Explore Now",
          ctaLink: "/products",
          videoLink: null,
          badgeText: "Featured",
          price: null,
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          stats: null,
        },
      ];
    } else {
      // Shallow-clone heroSlides to avoid mutating external references
      base.heroSlides = base.heroSlides.map((s) => ({ ...s }));
    }

    // 2. Apply hero slide overrides from config sections if edited
    const activePage = (config.pages || []).find(
      (p) => (p.isHomepage && (pageSlug === "home" || pageSlug === "")) || p.slug === pageSlug
    );
    const heroSec = (activePage?.sections || []).find(
      (s: any) => s.type === "hero" || s.id?.includes("hero")
    );
    if (heroSec?.content) {
      (base as any).heroConfig = heroSec.content;
      if (heroSec.content.slides?.length) {
        base.heroSlides = heroSec.content.slides.map((s: any) => ({
          id: s.id,
          imageUrl: s.imageUrl,
          headline: s.headline || s.title,
          subline: s.subline || s.eyebrow || s.description,
          badgeText: s.badgeText || s.description,
          ctaText: s.ctaText || s.primaryButtonText || "Shop Now",
          ctaLink: s.ctaLink || s.primaryButtonUrl || "/products",
        }));
      }
    }
    (base as any).sections = activePage?.sections || [];
    (base as any).websiteConfig = config;

    // 3. Expose componentOverrides on base so any StoreContext consumer can access them
    // NOTE: Physical components that use EditableElement read overrides directly via
    // getOverride() from EditableContentContext — NOT from mergedStoreData properties.
    // The deterministic header/footer overrides above (lines 233-259) handle the
    // StoreContext path for components that read storeFormData fields (e.g. base.name).
    // No fuzzy guessing is needed or desired here.
    (base as any).componentOverrides = ov;

    return base;
  }, [
    storeFormData,
    config,
    canonicalTemplate,
    companyId,
    storeLogoUrl,
    contactPhone,
    contactEmail,
    address,
    socialLinks,
    pageSlug,
  ]);

  // 5. Load dynamic Google Fonts
  useEffect(() => {
    const fontsToLoad = [config.theme?.headingFont, config.theme?.bodyFont].filter(Boolean);
    fontsToLoad.forEach((font) => {
      if (!font) return;
      const cleanFont = font.replace(/, (sans-serif|serif)/, "").replace(/['"]+/g, "").trim();
      if (!cleanFont) return;
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFont)}:wght@400;500;600;700;900&display=swap`;
      const id = `dynamic-font-${cleanFont.replace(/\s+/g, "-")}`;
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    });
  }, [config.theme?.headingFont, config.theme?.bodyFont]);

  // 6. Section renderer for custom subpages
  const renderCustomSection = (section: any) => {
    const isSelected = isEditorPreview && selectedSectionId === section.id;
    let component: React.ReactNode = null;

    switch (section.type as SectionType) {
      case "hero":
        component = (
          <HeroSection
            content={section.content}
            styles={section.styles}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "productGrid":
      case "productCarousel":
        component = (
          <ProductGridSection
            content={section.content}
            dataSource={section.dataSource}
            theme={config.theme}
            companyId={companyId}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "categoryGrid":
        component = (
          <CategoryGridSection
            content={section.content}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "imageWithText":
        component = (
          <ImageWithTextSection
            content={section.content}
            styles={section.styles}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "featuresBadges":
        component = (
          <FeaturesBadgesSection
            content={section.content}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "testimonials":
        component = (
          <TestimonialsSection
            content={section.content}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "ctaBanner":
        component = (
          <CtaBannerSection
            content={section.content}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "faq":
        component = (
          <FaqSection
            content={section.content}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "contactForm":
        component = (
          <ContactSection
            content={section.content}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      case "newsletter":
        component = (
          <NewsletterSection
            content={section.content}
            theme={config.theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;
      default:
        component = (
          <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-sm text-zinc-500 rounded-xl my-4">
            Custom Section ({section.type})
          </div>
        );
    }

    if (isEditorPreview && !isPreviewMode) {
      return (
        <div
          key={section.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelectSection?.(section.id);
          }}
          className={`relative cursor-pointer transition-all duration-200 group ${
            isSelected
              ? "ring-4 ring-rose-500 ring-offset-2 z-20"
              : "hover:outline-dashed hover:outline-2 hover:outline-rose-400/70"
          }`}
        >
          {isSelected && (
            <div className="absolute top-2 left-2 z-30 px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 pointer-events-none">
              <span>Selected:</span>
              <span className="capitalize">{section.type}</span>
            </div>
          )}
          {component}
        </div>
      );
    }

    return <React.Fragment key={section.id}>{component}</React.Fragment>;
  };

  const isHomepage = pageSlug === "home" || pageSlug === "" || pageSlug === "/";
  const activePage = (config.pages || []).find(
    (p) => (p.isHomepage && isHomepage) || p.slug === pageSlug
  );

  return (
    <EditableContentProvider
      componentOverrides={config.componentOverrides || {}}
      tenantSlug={mergedStoreData.slug || config.storeSlug || "store"}
      isEditorMode={isEditorPreview}
      isPreviewMode={isPreviewMode}
      selectedTargetId={selectedTargetId}
      selectedElement={selectedElement}
      onSelectElement={onSelectElement}
      onUpdateOverride={onUpdateOverride}
      onNavigatePage={onNavigatePage}
    >
      <StoreContextProvider
        initialStore={mergedStoreData}
        userRole="ADMIN"
        userId={companyId || "admin-preview"}
        componentOverrides={config.componentOverrides || {}}
      >
        <StoreDataSync data={mergedStoreData} />
        <div
          className="w-full min-h-screen text-zinc-900 dark:text-zinc-100 selection:bg-rose-500 selection:text-white"
          style={
            {
              fontFamily: config.theme?.bodyFont,
              "--primary-color": config.theme?.primaryColor || canonicalTemplate.defaultTheme.primaryColor,
              "--secondary-color": config.theme?.secondaryColor || canonicalTemplate.defaultTheme.secondaryColor,
            } as React.CSSProperties
          }
        >
          <LayoutComponent params={{ storeFormData: mergedStoreData }}>
            {isHomepage ? (
              <div className="relative">
                <BodyComponent
                  pageData={mergedStoreData}
                  companyId={companyId}
                  paymentMethods={paymentMethods}
                  ghubaData={ghubaData}
                />

                {/* In Editor mode (non-preview), show active template HUD badge */}
                {isEditorPreview && !isPreviewMode && (
                  <div className="fixed bottom-4 right-4 z-40 bg-zinc-950/90 backdrop-blur border border-rose-500/40 text-white rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3 pointer-events-auto">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="text-xs">
                      <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                        <span>{canonicalTemplate.name}</span>
                        <span className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800/60 px-1.5 py-0.5 rounded font-mono">
                          {canonicalTemplate.id}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Shell: {canonicalTemplate.shellLayout} &bull; Body: {canonicalTemplate.bodyComponent}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {(activePage?.sections || []).filter((s) => s.isVisible !== false).map((sec) => (
                  <SectionErrorBoundary
                    key={sec.id}
                    sectionId={sec.id}
                    sectionType={sec.type}
                  >
                    {renderCustomSection(sec)}
                  </SectionErrorBoundary>
                ))}

                {(!activePage?.sections || activePage.sections.length === 0) && (
                  <div className="py-24 text-center text-zinc-500 space-y-3">
                    <h3 className="text-xl font-bold">This page has no sections yet.</h3>
                    <p className="text-sm">Add sections in the website builder to populate this subpage.</p>
                  </div>
                )}
              </div>
            )}
          </LayoutComponent>
        </div>
      </StoreContextProvider>
    </EditableContentProvider>
  );
}
