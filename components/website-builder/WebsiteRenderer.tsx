"use client";

import React, { useEffect } from "react";
import { CompiledWebsiteConfig, SectionType } from "@/types/website-builder";
import { SectionErrorBoundary } from "./sections/SectionErrorBoundary";
import HeaderSection from "./sections/HeaderSection";
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
import FooterSection from "./sections/FooterSection";

interface WebsiteRendererProps {
  config: CompiledWebsiteConfig;
  pageSlug?: string;
  companyId?: string;
  storeLogoUrl?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  socialLinks?: any[];
  // Editor mode props
  isEditorPreview?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onNavigatePage?: (slug: string) => void;
}

export default function WebsiteRenderer({
  config,
  pageSlug = "home",
  companyId,
  storeLogoUrl,
  contactPhone,
  contactEmail,
  address,
  socialLinks,
  isEditorPreview = false,
  selectedSectionId = null,
  onSelectSection,
  onNavigatePage,
}: WebsiteRendererProps) {
  const { theme, navigation, pages, storeName, storeSlug } = config;

  // 1. Resolve active page
  const activePage =
    pages.find((p) => (p.isHomepage && (pageSlug === "home" || pageSlug === "" || pageSlug === "/")) || p.slug === pageSlug) ||
    pages[0];

  // 2. Load Google Fonts dynamically
  useEffect(() => {
    const fontsToLoad = [theme.headingFont, theme.bodyFont].filter(Boolean);
    fontsToLoad.forEach((font) => {
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
  }, [theme.headingFont, theme.bodyFont]);

  // Section component resolver
  const renderSection = (section: any) => {
    const isSelected = isEditorPreview && selectedSectionId === section.id;

    let component: React.ReactNode = null;

    switch (section.type as SectionType) {
      case "hero":
        component = (
          <HeroSection
            content={section.content}
            styles={section.styles}
            theme={theme}
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
            theme={theme}
            companyId={companyId}
            isEditorPreview={isEditorPreview}
          />
        );
        break;

      case "categoryGrid":
      case "categoryPills":
        component = (
          <CategoryGridSection
            content={section.content}
            dataSource={section.dataSource}
            theme={theme}
            isEditorPreview={isEditorPreview}
          />
        );
        break;

      case "imageWithText":
        component = (
          <ImageWithTextSection
            content={section.content}
            styles={section.styles}
            theme={theme}
          />
        );
        break;

      case "featuresBadges":
        component = (
          <FeaturesBadgesSection
            content={section.content}
            styles={section.styles}
            theme={theme}
          />
        );
        break;

      case "testimonials":
        component = (
          <TestimonialsSection
            content={section.content}
            styles={section.styles}
            theme={theme}
          />
        );
        break;

      case "ctaBanner":
        component = (
          <CtaBannerSection
            content={section.content}
            styles={section.styles}
            theme={theme}
          />
        );
        break;

      case "faq":
        component = (
          <FaqSection
            content={section.content}
            styles={section.styles}
            theme={theme}
          />
        );
        break;

      case "contact":
        component = (
          <ContactSection
            content={section.content}
            styles={section.styles}
            theme={theme}
            storeName={storeName}
            contactPhone={contactPhone}
            contactEmail={contactEmail}
            address={address}
          />
        );
        break;

      case "newsletter":
        component = (
          <NewsletterSection
            content={section.content}
            styles={section.styles}
            theme={theme}
          />
        );
        break;

      default:
        component = (
          <div className="py-8 text-center text-xs text-zinc-400">
            Custom Section ({section.type})
          </div>
        );
    }

    if (isEditorPreview) {
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
          {/* Editor selection badge */}
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

  const sectionsToRender = (activePage?.sections || []).filter((s) => s.isVisible !== false);

  return (
    <div
      className="min-h-screen flex flex-col w-full text-zinc-900 dark:text-zinc-100 selection:bg-rose-500 selection:text-white"
      style={
        {
          fontFamily: theme.bodyFont,
          "--primary-color": theme.primaryColor,
          "--secondary-color": theme.secondaryColor,
        } as React.CSSProperties
      }
    >
      {/* Dynamic Header */}
      <HeaderSection
        navigation={navigation}
        theme={theme}
        storeName={storeName}
        storeSlug={storeSlug}
        logoUrl={storeLogoUrl}
        contactPhone={contactPhone}
        currentPath={pageSlug === "home" ? "/" : `/${pageSlug}`}
        onNavigate={onNavigatePage}
        isEditorPreview={isEditorPreview}
      />

      {/* Main Page Content */}
      <main className="grow">
        {sectionsToRender.map((section) => (
          <SectionErrorBoundary
            key={section.id}
            sectionId={section.id}
            sectionType={section.type}
          >
            {renderSection(section)}
          </SectionErrorBoundary>
        ))}

        {sectionsToRender.length === 0 && (
          <div className="py-24 text-center text-zinc-500 space-y-3">
            <h3 className="text-xl font-bold">This page is currently empty.</h3>
            <p className="text-sm">Add sections in the website builder to bring your storefront to life.</p>
          </div>
        )}
      </main>

      {/* Dynamic Footer */}
      <FooterSection
        navigation={navigation}
        theme={theme}
        storeName={storeName}
        storeSlug={storeSlug}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        address={address}
        socialLinks={socialLinks}
        onNavigate={onNavigatePage}
        isEditorPreview={isEditorPreview}
      />
    </div>
  );
}
