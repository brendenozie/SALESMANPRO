/**
 * lib/website-builder/registry/default.ts
 * Template group: default (1 templates)
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

const DEFAULT_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "default-site-defaultsite",
    name: "Storefront Main Page",
    component: "DefaultSite",
    type: "custom",
    category: "content",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: {
    title: "Storefront Main Page",
    subtitle: "Built with passion and dedication to excellence.",
    description: "Discover how our Standard Storefront experience delivers the highest standards of quality.",
  },
  },
];

/* =========================================================================
   TEMPLATE DEFINITIONS
   ========================================================================= */

export const DEFAULT_TEMPLATES: Record<string, TemplateDefinition> = {
  // 55. DEFAULT SITE
  "default-site@v1": {
    id: "default-site@v1",
    version: "1.0.0",
    name: "Universal Clean Storefront",
    category: "general",
    variant: "default",
    shellLayout: "DefaultLayout",
    bodyComponent: "DefaultSite",
    capabilities: ["products", "categories", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#F43F5E",
      secondaryColor: "#FBBF24",
      accentColor: "#6366F1",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeEcommercePages("other"),
    authenticSections: DEFAULT_SECTIONS,
  },
};
