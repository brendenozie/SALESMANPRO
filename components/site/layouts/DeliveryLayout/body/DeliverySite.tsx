'use client';

import React from 'react';
import HeroSlider from './components/HeroSlider';
import { StoreForm } from '@/types/typings';

import TestimonialsCarouselSection from "./components/TestimonialsCarouselSection";
import SocialProofSection from "./components/SocialProofSection";
import ServicesSection from "./components/ServicesSection";

import AbSection from './components/AbSection';
import TeamSection from './components/TeamSection';
import { BookingSection } from './components/BookingSection';
import { WorkShowcase } from './components/WorkShowCase';
import { ProcessTimeline } from './components/ProcessTimeline';
import { NetworkMap } from './components/NetworkMap';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/CallToActionSection';

type EcommerceSiteProps = {
  pageData: StoreForm;
  companyId: string;
};

export default function EcommerceSite({ pageData, companyId }: EcommerceSiteProps) {
  const {
    heroSlides,
    themeSettings = {},
  } = pageData;
  const siteData = pageData;

  const getSectionKey = (sec: any): string => {
    if (sec.component) return sec.component;

    // Semantic normalization based on ID and type
    const sId = (sec.id || "").toLowerCase();
    if (sId.includes("heroslider") || sId.includes("hero")) return "HeroSlider";
    if (sId.includes("absection") || sId.includes("about")) return "AbSection";
    if (sId.includes("teamsection") || sId.includes("team")) return "TeamSection";
    if (sId.includes("servicessection") || sId.includes("service")) return "ServicesSection";
    if (sId.includes("bookingsection") || sId.includes("booking")) return "BookingSection";
    if (sId.includes("testimonialscarousel") || sId.includes("testimonials")) return "TestimonialsCarouselSection";
    if (sId.includes("workshowcase") || sId.includes("portfolio")) return "WorkShowcase";
    if (sId.includes("processtimeline") || sId.includes("timeline") || sId.includes("process")) return "ProcessTimeline";
    if (sId.includes("socialproof") || sId.includes("partners")) return "SocialProofSection";
    if (sId.includes("networkmap") || sId.includes("coverage") || sId.includes("map")) return "NetworkMap";
    if (sId.includes("blogsection") || sId.includes("articles") || sId.includes("blog")) return "BlogSection";
    if (sId.includes("contactsection") || sId.includes("contact")) return "ContactSection";

    if (sec.type === "hero") return "HeroSlider";
    if (sec.type === "contact") return "ContactSection";
    if (sec.type === "testimonials") return "TestimonialsCarouselSection";

    return "";
  };

  const renderSectionComponent = (sec: any, index: number) => {
    const compKey = getSectionKey(sec);
    const secId = sec.id || `sec-${index}`;
    const domId = secId.startsWith("section-") ? secId : `section-${secId}`;

    let childNode: React.ReactNode = null;

    switch (compKey) {
      case "HeroSlider":
        childNode = <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />;
        break;
      case "AbSection":
        childNode = <AbSection storeFormData={siteData} />;
        break;
      case "TeamSection":
        childNode = <TeamSection storeFormData={siteData} />;
        break;
      case "ServicesSection":
        childNode = (
          <ServicesSection
            storeFormData={siteData}
            config={sec.content}
            sectionId={sec.id}
          />
        );
        break;
      case "BookingSection":
        childNode = (
          <BookingSection
            storeFormData={siteData}
            config={sec.content}
            sectionId={sec.id}
          />
        );
        break;
      case "TestimonialsCarouselSection":
        childNode = <TestimonialsCarouselSection testimonials={pageData?.testimonials || []} />;
        break;
      case "WorkShowcase":
        childNode = <WorkShowcase />;
        break;
      case "ProcessTimeline":
        childNode = <ProcessTimeline />;
        break;
      case "SocialProofSection":
        childNode = <SocialProofSection />;
        break;
      case "NetworkMap":
        childNode = <NetworkMap />;
        break;
      case "BlogSection":
        childNode = <BlogSection />;
        break;
      case "ContactSection":
        childNode = <ContactSection companyId={siteData?.id || companyId || ''} />;
        break;
      default:
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[DeliverySite] Unresolved section component: "${compKey || sec.component || sec.type}" for section "${sec.id}"`
          );
        }
        childNode = (
          <div className="p-8 my-4 border-2 border-dashed border-amber-500 bg-amber-50/10 text-amber-600 dark:text-amber-400 text-center font-mono text-xs rounded-xl">
            <span className="font-bold">[Unresolved Section Component: {sec.name || sec.component || sec.type || sec.id}]</span>
            <div className="text-[10px] text-zinc-500 mt-1">Section ID: {sec.id} &bull; Type: {sec.type}</div>
          </div>
        );
        break;
    }

    if (!childNode) return null;

    return (
      <div
        key={sec.id || index}
        id={domId}
        data-editor-section={sec.id}
        data-editor-component={compKey}
      >
        {childNode}
      </div>
    );
  };

const DEFAULT_DELIVERY_SECTIONS = [
  { id: "delivery-hero", name: "Hero Banner Slider", component: "HeroSlider", type: "hero", visible: true },
  { id: "delivery-ab", name: "About Us Strip", component: "AbSection", type: "custom", visible: true },
  { id: "delivery-team", name: "Expert Team Showcase", component: "TeamSection", type: "custom", visible: true },
  { id: "delivery-services", name: "Delivery Services Grid", component: "ServicesSection", type: "services", visible: true },
  { id: "delivery-booking", name: "Schedule Dispatch", component: "BookingSection", type: "booking", visible: true },
  { id: "delivery-testimonials", name: "Client Reviews Carousel", component: "TestimonialsCarouselSection", type: "testimonials", visible: true },
  { id: "delivery-work", name: "Fleet & Operations Showcase", component: "WorkShowcase", type: "custom", visible: true },
  { id: "delivery-process", name: "Fulfillment Timeline", component: "ProcessTimeline", type: "custom", visible: true },
  { id: "delivery-social", name: "Network Stats & Proof", component: "SocialProofSection", type: "featuresBadges", visible: true },
  { id: "delivery-map", name: "Coverage Network Map", component: "NetworkMap", type: "custom", visible: true },
  { id: "delivery-blog", name: "Logistics Insights & News", component: "BlogSection", type: "custom", visible: true },
  { id: "delivery-contact", name: "Dispatch Center Contact", component: "ContactSection", type: "contact", visible: true },
];

  const rawSections = (pageData as any)?.sections;
  const activeSections = Array.isArray(rawSections) && rawSections.length > 0
    ? rawSections
    : DEFAULT_DELIVERY_SECTIONS;

  return (
    <div data-delivery-site="dynamic-root">
      {activeSections
        .filter((sec: any) => sec.visible !== false && sec.isVisible !== false)
        .map((sec: any, idx: number) => renderSectionComponent(sec, idx))}
    </div>
  );
}
