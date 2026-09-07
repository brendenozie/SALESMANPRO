/**
 * lib/website-builder/editable-adapters.ts
 *
 * Authoritative Component Adapter & Metadata System for the SalesmanPro Website Builder.
 *
 * Exposes real editable properties for authentic physical components without modifying
 * their underlying JSX source code or reducing them to generic sections.
 */

import { resolveCanonicalTemplate, getTemplateById } from "./template-registry";

export type EditablePropertyType =
  | "text"
  | "textarea"
  | "richText"
  | "image"
  | "link"
  | "color"
  | "font"
  | "number"
  | "boolean"
  | "select"
  | "products"
  | "categories";

export interface EditablePropertyOption {
  label: string;
  value: string;
}

export interface EditablePropertyDefinition {
  key: string;
  label: string;
  type: EditablePropertyType;
  group?: "content" | "media" | "link" | "style" | "visibility";
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  options?: EditablePropertyOption[];
}

export type ComponentCapability =
  | "content"
  | "presentation"
  | "structure"
  | "data-binding"
  | "media"
  | "links";

export type ComponentEditabilityStatus =
  | "FULLY_EDITABLE"
  | "PARTIALLY_EDITABLE"
  | "VIEW_ONLY";

export interface EditableComponentDefinition {
  componentKey: string;
  label: string;
  category: "hero" | "commerce" | "content" | "social_proof" | "contact" | "layout";
  description?: string;
  status?: ComponentEditabilityStatus;
  capabilities?: ComponentCapability[];
  properties: Record<string, EditablePropertyDefinition>;
  missingProperties?: string[];
}

// In-memory component adapter registry
const EDITABLE_COMPONENT_REGISTRY: Record<string, EditableComponentDefinition> = {};

export function registerEditableComponent(def: EditableComponentDefinition) {
  if (!def.status) {
    def.status = "FULLY_EDITABLE";
  }
  if (!def.capabilities) {
    def.capabilities = ["content", "presentation"];
  }
  EDITABLE_COMPONENT_REGISTRY[def.componentKey] = def;
}

export function buildUniversalComponentAdapter(componentKey: string): EditableComponentDefinition {
  const cleanKey = componentKey || "Component";
  const lower = cleanKey.toLowerCase();

  // Determine category and tailor default properties
  if (lower.includes("hero") || lower.includes("banner")) {
    return {
      componentKey: cleanKey,
      label: cleanKey.replace(/([A-Z])/g, " $1").trim(),
      category: "hero",
      status: "FULLY_EDITABLE",
      capabilities: ["content", "presentation", "media", "links"],
      properties: {
        headline: {
          key: "headline",
          label: "Headline / Main Title",
          type: "text",
          group: "content",
          defaultValue: "Experience Excellence",
          placeholder: "Enter hero headline...",
        },
        subline: {
          key: "subline",
          label: "Subtitle / Narrative Eyebrow",
          type: "textarea",
          group: "content",
          defaultValue: "Discover our premium offerings and curated collections.",
          placeholder: "Enter hero subline...",
        },
        badgeText: {
          key: "badgeText",
          label: "Highlight Badge / Pill",
          type: "text",
          group: "content",
          defaultValue: "Featured Collection",
          placeholder: "Special Announcement",
        },
        ctaText: {
          key: "ctaText",
          label: "Primary Button Text",
          type: "text",
          group: "link",
          defaultValue: "Explore Now",
          placeholder: "e.g. Shop Now, Book Table",
        },
        ctaLink: {
          key: "ctaLink",
          label: "Primary Button Destination",
          type: "link",
          group: "link",
          defaultValue: "/products",
          placeholder: "/products or /services",
        },
        imageUrl: {
          key: "imageUrl",
          label: "Hero Background / Media Image",
          type: "image",
          group: "media",
          defaultValue: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670",
          placeholder: "https://...",
        },
        accentColor: {
          key: "accentColor",
          label: "Accent / Glow Color",
          type: "color",
          group: "style",
          defaultValue: "#E11D48",
        },
      },
    };
  }

  if (
    lower.includes("product") ||
    lower.includes("dish") ||
    lower.includes("listing") ||
    lower.includes("vehicle") ||
    lower.includes("course") ||
    lower.includes("program") ||
    lower.includes("catalog") ||
    lower.includes("item") ||
    lower.includes("shop")
  ) {
    return {
      componentKey: cleanKey,
      label: cleanKey.replace(/([A-Z])/g, " $1").trim(),
      category: "commerce",
      status: "FULLY_EDITABLE",
      capabilities: ["content", "data-binding", "presentation", "links"],
      properties: {
        title: {
          key: "title",
          label: "Section Heading",
          type: "text",
          group: "content",
          defaultValue: "Featured Selections",
          placeholder: "Enter section title...",
        },
        subtitle: {
          key: "subtitle",
          label: "Subheading / Tagline",
          type: "text",
          group: "content",
          defaultValue: "Handpicked premium items tailored for you",
          placeholder: "Enter section subtitle...",
        },
        description: {
          key: "description",
          label: "Section Description",
          type: "textarea",
          group: "content",
          defaultValue: "Browse our curated catalog of authentic, high-quality offerings.",
        },
        buttonText: {
          key: "buttonText",
          label: "View All Button Text",
          type: "text",
          group: "link",
          defaultValue: "View All",
        },
        buttonUrl: {
          key: "buttonUrl",
          label: "View All Link Destination",
          type: "link",
          group: "link",
          defaultValue: "/products",
        },
        limit: {
          key: "limit",
          label: "Display Limit (Items)",
          type: "number",
          group: "presentation",
          defaultValue: 8,
        },
      },
    };
  }

  if (lower.includes("testimonial") || lower.includes("review") || lower.includes("feedback")) {
    return {
      componentKey: cleanKey,
      label: cleanKey.replace(/([A-Z])/g, " $1").trim(),
      category: "social_proof",
      status: "FULLY_EDITABLE",
      capabilities: ["content", "presentation"],
      properties: {
        title: {
          key: "title",
          label: "Testimonials Heading",
          type: "text",
          group: "content",
          defaultValue: "Loved by Customers",
          placeholder: "e.g. What Our Guests Say",
        },
        subtitle: {
          key: "subtitle",
          label: "Testimonials Subheading",
          type: "text",
          group: "content",
          defaultValue: "Authentic reviews from verified customers.",
        },
      },
    };
  }

  if (
    lower.includes("about") ||
    lower.includes("why") ||
    lower.includes("story") ||
    lower.includes("founder") ||
    lower.includes("philosophy") ||
    lower.includes("experience") ||
    lower.includes("work") ||
    lower.includes("mission")
  ) {
    return {
      componentKey: cleanKey,
      label: cleanKey.replace(/([A-Z])/g, " $1").trim(),
      category: "content",
      status: "FULLY_EDITABLE",
      capabilities: ["content", "media", "presentation"],
      properties: {
        title: {
          key: "title",
          label: "Section Heading",
          type: "text",
          group: "content",
          defaultValue: "Our Story & Values",
          placeholder: "Enter title...",
        },
        subtitle: {
          key: "subtitle",
          label: "Subtitle / Tagline",
          type: "text",
          group: "content",
          defaultValue: "Crafted with passion, driven by purpose",
        },
        story: {
          key: "story",
          label: "Story & Narrative Description",
          type: "textarea",
          group: "content",
          defaultValue: "Every creation tells a story — crafted with intention, passion, and respect for ingredients.",
        },
        founderName: {
          key: "founderName",
          label: "Founder / Leader Name",
          type: "text",
          group: "content",
          defaultValue: "Our Founder",
        },
        founderQuote: {
          key: "founderQuote",
          label: "Featured Quote / Statement",
          type: "textarea",
          group: "content",
          defaultValue: "Excellence begins with passion, integrity, and relentless attention to detail.",
        },
        aboutImageUrl: {
          key: "aboutImageUrl",
          label: "Featured Story / Portrait Image",
          type: "image",
          group: "media",
          defaultValue: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2670",
        },
        buttonText: {
          key: "buttonText",
          label: "Action Button Text",
          type: "text",
          group: "link",
          defaultValue: "Learn More",
        },
        buttonUrl: {
          key: "buttonUrl",
          label: "Action Destination Link",
          type: "link",
          group: "link",
          defaultValue: "/about",
        },
      },
    };
  }

  // Universal Default Fallback for any other component
  return {
    componentKey: cleanKey,
    label: cleanKey.replace(/([A-Z])/g, " $1").trim(),
    category: "content",
    status: "FULLY_EDITABLE",
    capabilities: ["content", "presentation", "media", "links"],
    properties: {
      title: {
        key: "title",
        label: "Title / Headline",
        type: "text",
        group: "content",
        defaultValue: cleanKey.replace(/([A-Z])/g, " $1").trim(),
        placeholder: "Enter title...",
      },
      subtitle: {
        key: "subtitle",
        label: "Subtitle / Eyebrow",
        type: "text",
        group: "content",
        defaultValue: "Quality craftsmanship & exceptional experience",
        placeholder: "Enter subtitle...",
      },
      description: {
        key: "description",
        label: "Description / Narrative Content",
        type: "textarea",
        group: "content",
        defaultValue: "Discover more about our authentic storefront offerings.",
      },
      buttonText: {
        key: "buttonText",
        label: "Action Button Text",
        type: "text",
        group: "link",
        defaultValue: "Explore",
      },
      buttonUrl: {
        key: "buttonUrl",
        label: "Action Destination Link",
        type: "link",
        group: "link",
        defaultValue: "/products",
      },
      imageUrl: {
        key: "imageUrl",
        label: "Featured Media / Image",
        type: "image",
        group: "media",
        defaultValue: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560",
      },
    },
  };
}

export function getEditableComponent(componentKey: string): EditableComponentDefinition | undefined {
  if (!componentKey) return undefined;
  let existing = EDITABLE_COMPONENT_REGISTRY[componentKey];
  if (!existing || Object.keys(existing.properties).length === 0) {
    existing = buildUniversalComponentAdapter(componentKey);
    EDITABLE_COMPONENT_REGISTRY[componentKey] = existing;
  }
  return existing;
}

export function getAllEditableComponents(): EditableComponentDefinition[] {
  return Object.values(EDITABLE_COMPONENT_REGISTRY);
}

/**
 * Parses a deterministic targetId string (e.g. "home.hero-slider.slides.0.headline" or "categories-section.title")
 * into its structural components.
 */
export function parseTargetId(targetId: string): {
  pageSlug: string;
  componentKey: string;
  sectionKey: string;
  fieldKey: string;
  subIndex?: number;
  itemIndex?: number;
} {
  const parts = targetId.split(".");
  if (parts.length <= 2) {
    const componentKey = parts[0] || "";
    const fieldKey = parts[1] || "";
    return {
      pageSlug: "home",
      componentKey,
      sectionKey: componentKey,
      fieldKey,
    };
  }

  const pageSlug = parts[0] || "home";
  const componentKey = parts[1] || "";
  const sectionKey = componentKey;
  const fieldKey = parts.slice(2).join(".");

  let itemIndex: number | undefined;
  for (let i = 2; i < parts.length; i++) {
    if (!isNaN(Number(parts[i]))) {
      itemIndex = Number(parts[i]);
      break;
    }
  }

  return {
    pageSlug,
    componentKey,
    sectionKey,
    fieldKey,
    itemIndex,
    subIndex: itemIndex,
  };
}

// ---------------------------------------------------------------------------
// 1. HERO SLIDER ADAPTER (Ecommerce Shoes & Universal)
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "HeroSlider",
  label: "Hero Slider",
  category: "hero",
  description: "High-impact visual showcase with rotating slides, headline, CTA button, and typography.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "media", "links"],
  properties: {
    headline: {
      key: "headline",
      label: "Main Headline",
      type: "text",
      group: "content",
      defaultValue: "STEP INTO NEXT-LEVEL COMFORT",
      placeholder: "Enter hero headline...",
    },
    subline: {
      key: "subline",
      label: "Eyebrow / Subline",
      type: "text",
      group: "content",
      defaultValue: "SNEAKERS",
      placeholder: "e.g. SNEAKERS or NEW COLLECTION",
    },
    badgeText: {
      key: "badgeText",
      label: "Description / Badge Text",
      type: "textarea",
      group: "content",
      defaultValue: "Ergonomic. Lightweight. Built for daily motion.",
      placeholder: "Brief narrative description...",
    },
    ctaText: {
      key: "ctaText",
      label: "Button Text",
      type: "text",
      group: "link",
      defaultValue: "Discover Collection",
      placeholder: "e.g. Shop Now",
    },
    ctaLink: {
      key: "ctaLink",
      label: "Button Destination",
      type: "link",
      group: "link",
      defaultValue: "/products?subcategory=personalized-gifts",
      placeholder: "e.g. /products",
    },
    imageUrl: {
      key: "imageUrl",
      label: "Hero Image URL",
      type: "image",
      group: "media",
      defaultValue: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    },
    "slides.0.headline": {
      key: "slides.0.headline",
      label: "Main Headline",
      type: "text",
      group: "content",
      defaultValue: "STEP INTO NEXT-LEVEL COMFORT",
      placeholder: "Enter hero headline...",
    },
    "slides.0.subline": {
      key: "slides.0.subline",
      label: "Eyebrow / Subline",
      type: "text",
      group: "content",
      defaultValue: "SNEAKERS",
      placeholder: "e.g. SNEAKERS or NEW COLLECTION",
    },
    "slides.0.badgeText": {
      key: "slides.0.badgeText",
      label: "Description / Badge Text",
      type: "textarea",
      group: "content",
      defaultValue: "Ergonomic. Lightweight. Built for daily motion.",
      placeholder: "Brief narrative description...",
    },
    "slides.0.ctaText": {
      key: "slides.0.ctaText",
      label: "Button Text",
      type: "text",
      group: "link",
      defaultValue: "Discover Collection",
      placeholder: "e.g. Shop Now",
    },
    "slides.0.ctaLink": {
      key: "slides.0.ctaLink",
      label: "Button Destination",
      type: "link",
      group: "link",
      defaultValue: "/products?subcategory=personalized-gifts",
      placeholder: "e.g. /products",
    },
    "slides.0.imageUrl": {
      key: "slides.0.imageUrl",
      label: "Hero Image URL",
      type: "image",
      group: "media",
      defaultValue: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    },
    "slides.0.backgroundColor": {
      key: "slides.0.backgroundColor",
      label: "Slide Background Color",
      type: "color",
      group: "style",
      defaultValue: "#FFF1F2",
    },
    "slides.0.textColor": {
      key: "slides.0.textColor",
      label: "Text Color",
      type: "color",
      group: "style",
      defaultValue: "#111827",
    },
    autoplay: {
      key: "autoplay",
      label: "Autoplay Slides",
      type: "boolean",
      group: "style",
      defaultValue: true,
    },
    visible: {
      key: "visible",
      label: "Show Hero Slider",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 2. CATEGORIES SECTION ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "CategoriesSection",
  label: "Categories Lineup",
  category: "commerce",
  description: "Interactive category showcase with explore links.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    eyebrow: {
      key: "eyebrow",
      label: "Section Eyebrow",
      type: "text",
      group: "content",
      defaultValue: "Browse By Category",
    },
    title: {
      key: "title",
      label: "Section Title",
      type: "text",
      group: "content",
      defaultValue: "Explore Collections",
    },
    subtitle: {
      key: "subtitle",
      label: "Section Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Curated lines engineered for performance and lifestyle.",
    },
    visible: {
      key: "visible",
      label: "Show Categories Section",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 3. PROMO SECTION & CATEGORY SECTION ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "PromoSection",
  label: "Special Offer Banner",
  category: "commerce",
  description: "Promotional banner with custom title, description, and action button.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links"],
  properties: {
    title: {
      key: "title",
      label: "Promotion Title",
      type: "text",
      group: "content",
      defaultValue: "Exclusive Seasonal Drop",
    },
    description: {
      key: "description",
      label: "Promotion Description",
      type: "textarea",
      group: "content",
      defaultValue: "Unlock premium footwear at wholesale prices during our limited-time seasonal event.",
    },
    ctaText: {
      key: "ctaText",
      label: "Button Label",
      type: "text",
      group: "link",
      defaultValue: "Explore Collection",
    },
    ctaLink: {
      key: "ctaLink",
      label: "Button Destination",
      type: "link",
      group: "link",
      defaultValue: "/products",
    },
    bannerUrl: {
      key: "bannerUrl",
      label: "Banner Image URL",
      type: "image",
      group: "media",
      defaultValue: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    },
    visible: {
      key: "visible",
      label: "Show Promo Section",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 4. POPULAR PRODUCTS ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "PopularProducts",
  label: "Popular Products Grid",
  category: "commerce",
  description: "Product showcase grid showing trending and featured products.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "data-binding"],
  properties: {
    title: {
      key: "title",
      label: "Grid Title",
      type: "text",
      group: "content",
      defaultValue: "Popular Drops",
    },
    subtitle: {
      key: "subtitle",
      label: "Grid Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Our most coveted arrivals this week.",
    },
    filter: {
      key: "filter",
      label: "Product Filter",
      type: "select",
      group: "content",
      defaultValue: "featured",
      options: [
        { label: "Featured Products", value: "featured" },
        { label: "Latest Arrivals", value: "latest" },
        { label: "Discounted Deals", value: "discounted" },
        { label: "Best Selling", value: "best_selling" },
      ],
    },
    limit: {
      key: "limit",
      label: "Number of Products",
      type: "number",
      group: "content",
      defaultValue: 8,
    },
    visible: {
      key: "visible",
      label: "Show Popular Products",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 5. NEWSLETTER SECTION ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "NewsletterSection",
  label: "Newsletter & Contact Form",
  category: "contact",
  description: "Customer inquiry form and email subscription section.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    title: {
      key: "title",
      label: "Section Title",
      type: "text",
      group: "content",
      defaultValue: "Get in Touch With Our Crew",
    },
    description: {
      key: "description",
      label: "Section Description",
      type: "textarea",
      group: "content",
      defaultValue: "Have questions about our store collections, orders, or custom partnerships? We answer 100% of messages in under 24 hours.",
    },
    buttonText: {
      key: "buttonText",
      label: "Submit Button Text",
      type: "text",
      group: "link",
      defaultValue: "Dispatch Message",
    },
    supportText: {
      key: "supportText",
      label: "Support Badge Text",
      type: "text",
      group: "content",
      defaultValue: "Support crew online — 24/7 Response",
    },
    visible: {
      key: "visible",
      label: "Show Contact & Newsletter",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 6. HEADER & NAVIGATION ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "Header",
  label: "Store Header & Navigation",
  category: "layout",
  description: "Top navigation bar, announcement banner, brand identity, and links.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "structure", "links"],
  properties: {
    storeName: {
      key: "storeName",
      label: "Store Name",
      type: "text",
      group: "content",
      defaultValue: "SneakerVault",
      placeholder: "Enter store name...",
    },
    logoUrl: {
      key: "logoUrl",
      label: "Store Logo Image",
      type: "image",
      group: "media",
      defaultValue: "",
    },
    announcementText: {
      key: "announcementText",
      label: "Announcement Bar Text",
      type: "text",
      group: "content",
      defaultValue: "🔥 Free Delivery on orders over KES 3,000 | Same day dispatch",
    },
    showAnnouncement: {
      key: "showAnnouncement",
      label: "Show Announcement Bar",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
    dropsLabel: {
      key: "dropsLabel",
      label: "Primary Nav Label (e.g. Drops)",
      type: "text",
      group: "link",
      defaultValue: "Drops",
    },
    vaultLabel: {
      key: "vaultLabel",
      label: "Secondary Nav Label (e.g. Vault)",
      type: "text",
      group: "link",
      defaultValue: "Vault",
    },
    storyLabel: {
      key: "storyLabel",
      label: "Tertiary Nav Label (e.g. Story)",
      type: "text",
      group: "link",
      defaultValue: "Story",
    },
  },
});

// ---------------------------------------------------------------------------
// 7. UNIVERSAL FALLBACK ADAPTER (For any unlisted or custom section)
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "UniversalSection",
  label: "Component Section",
  category: "content",
  description: "General section with customizable text, image, and visibility.",
  properties: {
    title: {
      key: "title",
      label: "Title / Headline",
      type: "text",
      group: "content",
      defaultValue: "Section Headline",
    },
    description: {
      key: "description",
      label: "Description / Content",
      type: "textarea",
      group: "content",
      defaultValue: "Custom section content and details.",
    },
    ctaText: {
      key: "ctaText",
      label: "Button Text",
      type: "text",
      group: "link",
      defaultValue: "Learn More",
    },
    ctaLink: {
      key: "ctaLink",
      label: "Button Destination",
      type: "link",
      group: "link",
      defaultValue: "/products",
    },
    imageUrl: {
      key: "imageUrl",
      label: "Image URL",
      type: "image",
      group: "media",
      defaultValue: "",
    },
    visible: {
      key: "visible",
      label: "Visible",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 8. FEATURES SECTION ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "FeaturesSection",
  label: "Features & Value Props",
  category: "content",
  description: "Value propositions highlighting rapid dispatch, guarantees, and wide catalog.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    "features.0.title": {
      key: "features.0.title",
      label: "Feature 1 Title",
      type: "text",
      group: "content",
      defaultValue: "10 minute now",
    },
    "features.0.description": {
      key: "features.0.description",
      label: "Feature 1 Description",
      type: "textarea",
      group: "content",
      defaultValue: "Get your order delivered to your doorstep at the near you.",
    },
    "features.1.title": {
      key: "features.1.title",
      label: "Feature 2 Title",
      type: "text",
      group: "content",
      defaultValue: "Best Prices & Offers",
    },
    "features.1.description": {
      key: "features.1.description",
      label: "Feature 2 Description",
      type: "textarea",
      group: "content",
      defaultValue: "Cheaper prices than your local supermarket, great cashback offers to top it off.",
    },
    "features.2.title": {
      key: "features.2.title",
      label: "Feature 3 Title",
      type: "text",
      group: "content",
      defaultValue: "Wide Assortment",
    },
    "features.2.description": {
      key: "features.2.description",
      label: "Feature 3 Description",
      type: "textarea",
      group: "content",
      defaultValue: "Choose from 5000+ products across footwear, accessories, and curated lines.",
    },
    "features.3.title": {
      key: "features.3.title",
      label: "Feature 4 Title",
      type: "text",
      group: "content",
      defaultValue: "Easy Returns",
    },
    "features.3.description": {
      key: "features.3.description",
      label: "Feature 4 Description",
      type: "textarea",
      group: "content",
      defaultValue: "Not satisfied with a product? Return it at the doorstep & get a refund within hours.",
    },
    visible: {
      key: "visible",
      label: "Show Features Section",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 9. CATEGORY SECTION (SPOTLIGHT) ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "CategorySection",
  label: "Category Spotlight",
  category: "commerce",
  description: "Featured single category spotlight with custom title, promotion, and CTA.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links", "media"],
  properties: {
    title: {
      key: "title",
      label: "Spotlight Title",
      type: "text",
      group: "content",
      defaultValue: "Featured Sport Line",
    },
    description: {
      key: "description",
      label: "Spotlight Description",
      type: "textarea",
      group: "content",
      defaultValue: "Engineered specifically for peak athletic output and everyday style.",
    },
    ctaText: {
      key: "ctaText",
      label: "Button Label",
      type: "text",
      group: "link",
      defaultValue: "View Spotlight",
    },
    ctaLink: {
      key: "ctaLink",
      label: "Destination URL",
      type: "link",
      group: "link",
      defaultValue: "/products",
    },
    bannerUrl: {
      key: "bannerUrl",
      label: "Banner Image",
      type: "image",
      group: "media",
      defaultValue: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    },
    visible: {
      key: "visible",
      label: "Show Category Spotlight",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 10. DAILY BEST SELLS ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "DailyBestSells",
  label: "Daily Best Sells",
  category: "commerce",
  description: "Flash deal showcase with countdown timer and high-converting products.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "data-binding"],
  properties: {
    title: {
      key: "title",
      label: "Section Title",
      type: "text",
      group: "content",
      defaultValue: "Daily Best Sells",
    },
    subtitle: {
      key: "subtitle",
      label: "Section Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Exclusive price drops ending soon.",
    },
    limit: {
      key: "limit",
      label: "Max Products",
      type: "number",
      group: "content",
      defaultValue: 6,
    },
    visible: {
      key: "visible",
      label: "Show Daily Best Sells",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 11. SLEEP TAPE AD (PROMOTIONAL CALLOUT) ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "SleepTapeAd",
  label: "Special Callout Banner",
  category: "commerce",
  description: "High-contrast promotional callout with badge, CTA button, and product imagery.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links", "media"],
  properties: {
    headline: {
      key: "headline",
      label: "Banner Headline",
      type: "text",
      group: "content",
      defaultValue: "ENGINEERED FOR SUPREME GRIP",
    },
    subline: {
      key: "subline",
      label: "Banner Subline",
      type: "text",
      group: "content",
      defaultValue: "PRO PERFORMANCE",
    },
    ctaText: {
      key: "ctaText",
      label: "Button Label",
      type: "text",
      group: "link",
      defaultValue: "Secure Yours",
    },
    ctaLink: {
      key: "ctaLink",
      label: "Button Destination",
      type: "link",
      group: "link",
      defaultValue: "/products",
    },
    imageUrl: {
      key: "imageUrl",
      label: "Product Image",
      type: "image",
      group: "media",
      defaultValue: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    },
    visible: {
      key: "visible",
      label: "Show Callout Banner",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 12. ALL PRODUCTS SECTION ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "AllProducts",
  label: "All Products Catalog",
  category: "commerce",
  description: "Complete catalog grid with category filter tabs and pagination.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "data-binding"],
  properties: {
    title: {
      key: "title",
      label: "Catalog Title",
      type: "text",
      group: "content",
      defaultValue: "Explore Our Full Vault",
    },
    subtitle: {
      key: "subtitle",
      label: "Catalog Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Authentic footwear curated from premier releases worldwide.",
    },
    limit: {
      key: "limit",
      label: "Products Per Page",
      type: "number",
      group: "content",
      defaultValue: 12,
    },
    visible: {
      key: "visible",
      label: "Show All Products",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 13. TRENDING PROMOTION ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "TrendingPromotion",
  label: "Trending Promotion",
  category: "commerce",
  description: "Dynamic promotional showcase with discount badge and quick action.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links", "media"],
  properties: {
    title: {
      key: "title",
      label: "Promotion Title",
      type: "text",
      group: "content",
      defaultValue: "Trending This Season",
    },
    description: {
      key: "description",
      label: "Promotion Details",
      type: "textarea",
      group: "content",
      defaultValue: "Save up to 40% on limited-run styles while inventory lasts.",
    },
    ctaText: {
      key: "ctaText",
      label: "Button Label",
      type: "text",
      group: "link",
      defaultValue: "Claim Offer",
    },
    ctaLink: {
      key: "ctaLink",
      label: "Destination URL",
      type: "link",
      group: "link",
      defaultValue: "/products",
    },
    visible: {
      key: "visible",
      label: "Show Trending Promotion",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 14. BANNER SECTION ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "BannerSection",
  label: "Mid-Page Banner",
  category: "content",
  description: "Wide mid-page promotional banner with headline and background.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links", "media"],
  properties: {
    headline: {
      key: "headline",
      label: "Banner Headline",
      type: "text",
      group: "content",
      defaultValue: "Elevate Your Routine",
    },
    subtitle: {
      key: "subtitle",
      label: "Banner Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Designed for those who never stop moving.",
    },
    ctaText: {
      key: "ctaText",
      label: "CTA Text",
      type: "text",
      group: "link",
      defaultValue: "Shop Collection",
    },
    ctaLink: {
      key: "ctaLink",
      label: "Destination URL",
      type: "link",
      group: "link",
      defaultValue: "/products",
    },
    bannerUrl: {
      key: "bannerUrl",
      label: "Background Image",
      type: "image",
      group: "media",
      defaultValue: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    },
    visible: {
      key: "visible",
      label: "Show Banner Section",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 15. METRICS SECTION ADAPTER (Partially Editable)
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "MetricsSection",
  label: "Store Metrics & Values",
  category: "social_proof",
  description: "Key trust metrics and brand core values.",
  status: "PARTIALLY_EDITABLE",
  capabilities: ["content", "presentation"],
  missingProperties: ["metricIcons", "dynamicCounters"],
  properties: {
    title: {
      key: "title",
      label: "Section Title",
      type: "text",
      group: "content",
      defaultValue: "Why Shoppers Trust Us",
    },
    subtitle: {
      key: "subtitle",
      label: "Section Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Real numbers powered by authentic customer satisfaction.",
    },
    visible: {
      key: "visible",
      label: "Show Metrics",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 16. AWARDS SECTION ADAPTER (Partially Editable)
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "AwardsSection",
  label: "Industry Awards & Badges",
  category: "social_proof",
  description: "Industry recognition, press honors, and badges.",
  status: "PARTIALLY_EDITABLE",
  capabilities: ["content", "presentation"],
  missingProperties: ["badgeSvgUpload", "verificationLinks"],
  properties: {
    title: {
      key: "title",
      label: "Awards Title",
      type: "text",
      group: "content",
      defaultValue: "Recognized by Industry Leaders",
    },
    subtitle: {
      key: "subtitle",
      label: "Awards Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Honored for innovation and customer excellence.",
    },
    visible: {
      key: "visible",
      label: "Show Awards",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 17. TESTIMONIALS SECTION ADAPTER (Partially Editable)
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "TestimonialsSection",
  label: "Customer Reviews",
  category: "social_proof",
  description: "Customer testimonials and verified buyer feedback.",
  status: "PARTIALLY_EDITABLE",
  capabilities: ["content", "presentation"],
  missingProperties: ["authorAvatars", "starRatingInput"],
  properties: {
    title: {
      key: "title",
      label: "Section Title",
      type: "text",
      group: "content",
      defaultValue: "What Our Customers Say",
    },
    subtitle: {
      key: "subtitle",
      label: "Section Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Thousands of verified 5-star reviews worldwide.",
    },
    visible: {
      key: "visible",
      label: "Show Testimonials",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
  },
});

// ---------------------------------------------------------------------------
// 18. FOOTER ADAPTER
// ---------------------------------------------------------------------------
registerEditableComponent({
  componentKey: "Footer",
  label: "Store Footer",
  category: "layout",
  description: "Bottom footer with store bio, copyright notice, and links.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links"],
  properties: {
    bioText: {
      key: "bioText",
      label: "Brand Bio Text",
      type: "textarea",
      group: "content",
      defaultValue: "Your premier destination for authentic, high-performance lifestyle footwear.",
    },
    copyrightText: {
      key: "copyrightText",
      label: "Copyright Notice",
      type: "text",
      group: "content",
      defaultValue: "All Rights Reserved. Powered by SalesmanPro.",
    },
    contactPhone: {
      key: "contactPhone",
      label: "Support Phone",
      type: "text",
      group: "content",
      defaultValue: "+254 700 000000",
    },
    contactEmail: {
      key: "contactEmail",
      label: "Support Email",
      type: "text",
      group: "content",
      defaultValue: "support@salesmanpro.site",
    },
  },
});

// ---------------------------------------------------------------------------

// ===========================================================================
// UNIVERSAL SHELL: HEADER & FOOTER ADAPTERS
// ===========================================================================

registerEditableComponent({
  componentKey: "Header",
  label: "Store Navigation & Header",
  category: "layout",
  description: "Global site header containing branding, main menu navigation links, announcement banner, and actions.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links", "media", "structure"],
  properties: {
    storeName: {
      key: "storeName",
      label: "Store / Brand Name",
      type: "text",
      group: "content",
      defaultValue: "Store",
      placeholder: "e.g. My Awesome Store",
    },
    brandName: {
      key: "brandName",
      label: "Brand Name",
      type: "text",
      group: "content",
      defaultValue: "Store",
      placeholder: "e.g. My Awesome Store",
    },
    logoUrl: {
      key: "logoUrl",
      label: "Brand Logo URL",
      type: "image",
      group: "media",
      placeholder: "https://example.com/logo.png",
    },
    announcementText: {
      key: "announcementText",
      label: "Announcement Bar Text",
      type: "text",
      group: "content",
      defaultValue: "🔥 Special Announcement | Free Shipping Available",
    },
    showAnnouncement: {
      key: "showAnnouncement",
      label: "Show Announcement Bar",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
    ctaButtonText: {
      key: "ctaButtonText",
      label: "Header Action Button Text",
      type: "text",
      group: "link",
      defaultValue: "Get Started",
    },
    ctaButtonUrl: {
      key: "ctaButtonUrl",
      label: "Header Action Button Link",
      type: "link",
      group: "link",
      defaultValue: "/contact",
    },
    sticky: {
      key: "sticky",
      label: "Sticky Header Navigation",
      type: "boolean",
      group: "style",
      defaultValue: true,
    },
    navItem1Label: { key: "navItem1Label", label: "Nav Item 1 Label", type: "text", group: "link", defaultValue: "Home" },
    navItem1Url: { key: "navItem1Url", label: "Nav Item 1 Link", type: "link", group: "link", defaultValue: "/" },
    navItem2Label: { key: "navItem2Label", label: "Nav Item 2 Label", type: "text", group: "link", defaultValue: "Shop" },
    navItem2Url: { key: "navItem2Url", label: "Nav Item 2 Link", type: "link", group: "link", defaultValue: "/products" },
    navItem3Label: { key: "navItem3Label", label: "Nav Item 3 Label", type: "text", group: "link", defaultValue: "Categories" },
    navItem3Url: { key: "navItem3Url", label: "Nav Item 3 Link", type: "link", group: "link", defaultValue: "/categories" },
    navItem4Label: { key: "navItem4Label", label: "Nav Item 4 Label", type: "text", group: "link", defaultValue: "About Us" },
    navItem4Url: { key: "navItem4Url", label: "Nav Item 4 Link", type: "link", group: "link", defaultValue: "/about" },
    navItem5Label: { key: "navItem5Label", label: "Nav Item 5 Label", type: "text", group: "link", defaultValue: "Contact" },
    navItem5Url: { key: "navItem5Url", label: "Nav Item 5 Link", type: "link", group: "link", defaultValue: "/contact" },
  },
});

registerEditableComponent({
  componentKey: "Footer",
  label: "Global Store Footer",
  category: "layout",
  description: "Global site footer containing company bio, contact info, newsletter subscription, and copyright.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links", "social_proof"],
  properties: {
    brandName: {
      key: "brandName",
      label: "Brand Name",
      type: "text",
      group: "content",
      defaultValue: "Store",
    },
    bio: {
      key: "bio",
      label: "About / Bio Description",
      type: "textarea",
      group: "content",
      defaultValue: "Providing top-quality products, verified services, and exceptional experiences.",
    },
    contactPhone: {
      key: "contactPhone",
      label: "Support Phone",
      type: "text",
      group: "content",
      defaultValue: "+254 700 000 000",
    },
    contactEmail: {
      key: "contactEmail",
      label: "Support Email",
      type: "text",
      group: "content",
      defaultValue: "support@salesmanpro.site",
    },
    address: {
      key: "address",
      label: "Physical Address",
      type: "text",
      group: "content",
      defaultValue: "Nairobi, Kenya",
    },
    copyrightText: {
      key: "copyrightText",
      label: "Copyright Notice",
      type: "text",
      group: "content",
      defaultValue: "© 2026 Store. All rights reserved.",
    },
    showNewsletter: {
      key: "showNewsletter",
      label: "Show Newsletter Section",
      type: "boolean",
      group: "visibility",
      defaultValue: true,
    },
    newsletterTitle: {
      key: "newsletterTitle",
      label: "Newsletter Headline",
      type: "text",
      group: "content",
      defaultValue: "Stay In The Loop",
    },
    newsletterSubtitle: {
      key: "newsletterSubtitle",
      label: "Newsletter Subtitle",
      type: "text",
      group: "content",
      defaultValue: "Subscribe for exclusive updates, drops, and community announcements.",
    },
  },
});

// ===========================================================================
// CATEGORY-SPECIFIC AUTHENTIC COMPONENT ADAPTERS
// ===========================================================================

// --- RESTAURANT & HOSPITALITY ---
registerEditableComponent({
  componentKey: "RestaurantHero",
  label: "Restaurant Hero Showcase",
  category: "hero",
  description: "Culinary hero with high-res dish photography, reservation CTA, and seasonal announcements.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "media", "links"],
  properties: {
    headline: { key: "headline", label: "Headline", type: "text", group: "content", defaultValue: "Artisanal Culinary Excellence" },
    subline: { key: "subline", label: "Subline", type: "text", group: "content", defaultValue: "Fresh local ingredients, wood-fired flavors & chef's specials" },
    buttonText: { key: "buttonText", label: "Button Text", type: "text", group: "link", defaultValue: "Explore Menu" },
    buttonLink: { key: "buttonLink", label: "Button Destination", type: "link", group: "link", defaultValue: "/menu" },
    bannerUrl: { key: "bannerUrl", label: "Hero Background Image", type: "image", group: "media" },
  },
});

registerEditableComponent({
  componentKey: "SignatureDishes",
  label: "Signature Dishes Grid",
  category: "commerce",
  description: "Featured food items, pricing, chef badges, and order actions.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "data-binding"],
  properties: {
    title: { key: "title", label: "Section Title", type: "text", group: "content", defaultValue: "Chef's Signature Selections" },
    subtitle: { key: "subtitle", label: "Section Subtitle", type: "text", group: "content", defaultValue: "Curated seasonal specials prepared daily" },
    limit: { key: "limit", label: "Dishes to Display", type: "number", group: "content", defaultValue: 6 },
  },
});

registerEditableComponent({
  componentKey: "WhyDineWithUs",
  label: "Dining Philosophy & Ambiance",
  category: "content",
  description: "Story section highlighting culinary philosophy, sustainable sourcing, and warm ambiance.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    title: { key: "title", label: "Heading", type: "text", group: "content", defaultValue: "Why Dine With Us" },
    subtitle: { key: "subtitle", label: "Subheading", type: "text", group: "content", defaultValue: "Farm-to-table ethics and warm hospitality" },
    description: { key: "description", label: "Story Narrative", type: "textarea", group: "content", defaultValue: "Every dish tells a story of sustainable farming, authentic tradition, and culinary passion." },
  },
});

registerEditableComponent({
  componentKey: "RestaurantGallery",
  label: "Atmosphere & Kitchen Gallery",
  category: "content",
  description: "Photo mosaic showcasing the dining room, private events, and plated dishes.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "media"],
  properties: {
    title: { key: "title", label: "Gallery Title", type: "text", group: "content", defaultValue: "Inside Our Dining Room" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Take a visual tour of our kitchen and ambiance" },
  },
});

registerEditableComponent({
  componentKey: "RestaurantFAQs",
  label: "Dining & Reservation FAQs",
  category: "content",
  description: "Frequently asked questions covering dietary requirements, parking, reservations, and dress code.",
  status: "FULLY_EDITABLE",
  capabilities: ["content"],
  properties: {
    title: { key: "title", label: "FAQ Title", type: "text", group: "content", defaultValue: "Frequently Asked Questions" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Answers regarding dining reservations and private events" },
  },
});

// --- REAL ESTATE & PROPERTY ---
registerEditableComponent({
  componentKey: "FeaturedListingsWrapper",
  label: "Featured Real Estate Listings",
  category: "commerce",
  description: "High-yield properties, architectural specs, square footage, and tour booking.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "data-binding"],
  properties: {
    title: { key: "title", label: "Heading", type: "text", group: "content", defaultValue: "Featured Luxury Properties" },
    subtitle: { key: "subtitle", label: "Subheading", type: "text", group: "content", defaultValue: "Handpicked premium homes, villas & modern apartments" },
    limit: { key: "limit", label: "Listings Limit", type: "number", group: "content", defaultValue: 6 },
  },
});

registerEditableComponent({
  componentKey: "TrendingLocations",
  label: "Prime Neighborhoods & Locations",
  category: "content",
  description: "Neighborhood guides, price trends, and community highlights.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "media", "links"],
  properties: {
    title: { key: "title", label: "Title", type: "text", group: "content", defaultValue: "Explore Prime Neighborhoods" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Find the perfect community tailored to your lifestyle" },
  },
});

registerEditableComponent({
  componentKey: "WhyChooseUs",
  label: "Value Proposition & Trust Signals",
  category: "content",
  description: "Highlights key competitive advantages, awards, and client satisfaction guarantees.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    title: { key: "title", label: "Title", type: "text", group: "content", defaultValue: "Why Partner With Our Agency" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Unrivaled market expertise and seamless escrow management" },
  },
});

registerEditableComponent({
  componentKey: "AgentsSection",
  label: "Certified Real Estate Agents",
  category: "social_proof",
  description: "Agent cards with direct WhatsApp contact, license numbers, and closing track records.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "social_proof"],
  properties: {
    title: { key: "title", label: "Section Title", type: "text", group: "content", defaultValue: "Meet Our Licensed Advisors" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Top-tier real estate professionals dedicated to your goals" },
  },
});

// --- AUTOMOTIVE & VEHICLES ---
registerEditableComponent({
  componentKey: "AutomotiveFeaturedListingsWrapper",
  label: "Featured Vehicles Inventory",
  category: "commerce",
  description: "Vehicles with mileage, transmission, horsepower, pricing, and test-drive requests.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "data-binding"],
  properties: {
    title: { key: "title", label: "Inventory Heading", type: "text", group: "content", defaultValue: "Featured Certified Pre-Owned & New Vehicles" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Inspected, verified, and ready for immediate delivery" },
  },
});

registerEditableComponent({
  componentKey: "HowItWorks",
  label: "Buying / Service Workflow Steps",
  category: "content",
  description: "Step-by-step breakdown of test drives, financing pre-approval, and vehicle trade-in.",
  status: "FULLY_EDITABLE",
  capabilities: ["content"],
  properties: {
    title: { key: "title", label: "Step Title", type: "text", group: "content", defaultValue: "How Simple Car Buying Should Be" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Browse, finance, and drive away in under 24 hours" },
  },
});

registerEditableComponent({
  componentKey: "BrowseByCategory",
  label: "Vehicle Body & Class Categories",
  category: "commerce",
  description: "Visual pills/tiles for SUVs, Sedans, Trucks, Electric, and Luxury classes.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "links"],
  properties: {
    title: { key: "title", label: "Category Title", type: "text", group: "content", defaultValue: "Browse By Body Style" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "From compact commuters to heavy-duty pickups" },
  },
});

registerEditableComponent({
  componentKey: "PopularVehiclesWrapper",
  label: "Top Selling Vehicles",
  category: "commerce",
  description: "High-volume consumer favorites with quick financing calculator links.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "data-binding"],
  properties: {
    title: { key: "title", label: "Title", type: "text", group: "content", defaultValue: "Most Popular Models This Month" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "High-demand vehicles with special lease incentives" },
  },
});

// --- EDUCATION & COURSES ---
registerEditableComponent({
  componentKey: "CoursesHero",
  label: "Academy & Courses Hero",
  category: "hero",
  description: "Educational academy hero with student enrollments, accredited certificates, and curriculum preview.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links", "media"],
  properties: {
    headline: { key: "headline", label: "Headline", type: "text", group: "content", defaultValue: "Master In-Demand Skills With World-Class Mentors" },
    subline: { key: "subline", label: "Subline", type: "text", group: "content", defaultValue: "Practical, project-based curriculums designed for modern careers" },
    buttonText: { key: "buttonText", label: "Button Text", type: "text", group: "link", defaultValue: "Browse All Courses" },
    buttonLink: { key: "buttonLink", label: "Button Destination", type: "link", group: "link", defaultValue: "/courses" },
  },
});

registerEditableComponent({
  componentKey: "GlassInfoCardsSection",
  label: "Learning Outcomes & Badges",
  category: "content",
  description: "Glassmorphism cards presenting accreditation, job placement rate, and flexible schedules.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    title: { key: "title", label: "Title", type: "text", group: "content", defaultValue: "Why Learn With SalesmanPro Academy" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Real-world projects, verified certifications, and career support" },
  },
});

registerEditableComponent({
  componentKey: "SchoolSection",
  label: "Learning Tracks & Disciplines",
  category: "content",
  description: "Discipline overview: Software Engineering, Data Science, Product Management, Design.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "links"],
  properties: {
    title: { key: "title", label: "School Title", type: "text", group: "content", defaultValue: "Explore Schools & Disciplines" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Comprehensive programs designed from beginner to mastery" },
  },
});

registerEditableComponent({
  componentKey: "MainCoursesSection",
  label: "Curated Course Catalog",
  category: "commerce",
  description: "Course cards with lesson counts, instructor avatars, pricing, and enroll actions.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "data-binding"],
  properties: {
    title: { key: "title", label: "Title", type: "text", group: "content", defaultValue: "Popular Programs & Masterclasses" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Enroll in industry-recognized certification tracks" },
  },
});

// --- HEALTHCARE & WELLNESS ---
registerEditableComponent({
  componentKey: "HealthcareHero",
  label: "Medical & Clinical Care Hero",
  category: "hero",
  description: "Healthcare banner with urgent appointment booking, emergency phone, and specialist finder.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links"],
  properties: {
    headline: { key: "headline", label: "Headline", type: "text", group: "content", defaultValue: "Compassionate, Patient-Centered Medical Care" },
    subline: { key: "subline", label: "Subline", type: "text", group: "content", defaultValue: "Board-certified specialists and advanced diagnostic treatments" },
    buttonText: { key: "buttonText", label: "Button Text", type: "text", group: "link", defaultValue: "Book Consultation" },
    buttonLink: { key: "buttonLink", label: "Button Destination", type: "link", group: "link", defaultValue: "/book" },
  },
});

registerEditableComponent({
  componentKey: "MedicalServicesSection",
  label: "Clinical Services & Specialties",
  category: "content",
  description: "Specialties overview: Cardiology, Pediatrics, Orthopedics, Family Medicine, Diagnostics.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "links"],
  properties: {
    title: { key: "title", label: "Specialties Title", type: "text", group: "content", defaultValue: "Our Medical Specialties" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Comprehensive outpatient and inpatient healthcare" },
  },
});

registerEditableComponent({
  componentKey: "DoctorsSection",
  label: "Physicians & Medical Staff",
  category: "social_proof",
  description: "Doctor profiles with board certifications, languages, and booking shortcuts.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "social_proof"],
  properties: {
    title: { key: "title", label: "Title", type: "text", group: "content", defaultValue: "Meet Our Senior Medical Practitioners" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Dedicated clinicians committed to your holistic wellness" },
  },
});

// --- SERVICES, BOOKINGS & LIFESTYLE ---
registerEditableComponent({
  componentKey: "ServicesSection",
  label: "Professional Services Overview",
  category: "content",
  description: "Detailed service tier cards with deliverables, turnaround times, and consultation requests.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "links"],
  properties: {
    title: { key: "title", label: "Heading", type: "text", group: "content", defaultValue: "Tailored Professional Solutions" },
    subtitle: { key: "subtitle", label: "Subheading", type: "text", group: "content", defaultValue: "Strategic consulting and turnkey execution" },
  },
});

registerEditableComponent({
  componentKey: "PricingSection",
  label: "Pricing & Retainer Packages",
  category: "commerce",
  description: "Tiered pricing table (Basic, Professional, Enterprise) with feature checkmarks.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    title: { key: "title", label: "Pricing Title", type: "text", group: "content", defaultValue: "Transparent, Value-Driven Investment Plans" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "No hidden fees. Scale smoothly as your organization expands" },
  },
});

registerEditableComponent({
  componentKey: "BarbershopHero",
  label: "Grooming & Barber Hero",
  category: "hero",
  description: "Atmospheric barber salon hero with appointment scheduler and master stylist highlights.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links"],
  properties: {
    headline: { key: "headline", label: "Headline", type: "text", group: "content", defaultValue: "Precision Haircuts & Artisanal Grooming" },
    subline: { key: "subline", label: "Subline", type: "text", group: "content", defaultValue: "Classic barber traditions meet contemporary styling" },
    buttonText: { key: "buttonText", label: "Button Text", type: "text", group: "link", defaultValue: "Book Chair Now" },
    buttonLink: { key: "buttonLink", label: "Button Destination", type: "link", group: "link", defaultValue: "/book" },
  },
});

registerEditableComponent({
  componentKey: "FitnessHero",
  label: "Fitness & Training Hero",
  category: "hero",
  description: "High-energy gym hero with membership pass CTA, class schedules, and trainer booking.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links"],
  properties: {
    headline: { key: "headline", label: "Headline", type: "text", group: "content", defaultValue: "Transform Your Body & Mind" },
    subline: { key: "subline", label: "Subline", type: "text", group: "content", defaultValue: "Elite trainers, state-of-the-art equipment & inspiring community" },
    buttonText: { key: "buttonText", label: "Button Text", type: "text", group: "link", defaultValue: "Start Free Trial" },
    buttonLink: { key: "buttonLink", label: "Button Destination", type: "link", group: "link", defaultValue: "/membership" },
  },
});

registerEditableComponent({
  componentKey: "TravelHero",
  label: "Travel & Tours Hero",
  category: "hero",
  description: "Scenic safari and vacation hero with destination search and booking calendar.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links"],
  properties: {
    headline: { key: "headline", label: "Headline", type: "text", group: "content", defaultValue: "Unforgettable Expeditions & Safari Escapes" },
    subline: { key: "subline", label: "Subline", type: "text", group: "content", defaultValue: "Curated wild journeys across Africa's greatest reserves" },
    buttonText: { key: "buttonText", label: "Button Text", type: "text", group: "link", defaultValue: "Explore Destinations" },
    buttonLink: { key: "buttonLink", label: "Button Destination", type: "link", group: "link", defaultValue: "/packages" },
  },
});

// --- COMMON AUTHENTIC CROSS-THEME COMPONENTS ---
registerEditableComponent({
  componentKey: "HeroSection",
  label: "Hero Section Showcase",
  category: "hero",
  description: "Primary visual banner with headline, subline, image, and call-to-action button.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links", "media"],
  properties: {
    headline: { key: "headline", label: "Headline", type: "text", group: "content", defaultValue: "Welcome to Our Showcase" },
    subline: { key: "subline", label: "Subline", type: "text", group: "content", defaultValue: "Discover exceptional quality and authentic service" },
    buttonText: { key: "buttonText", label: "Button Text", type: "text", group: "link", defaultValue: "Explore Now" },
    buttonLink: { key: "buttonLink", label: "Button Destination", type: "link", group: "link", defaultValue: "/products" },
    bannerUrl: { key: "bannerUrl", label: "Banner Image URL", type: "image", group: "media" },
  },
});

registerEditableComponent({
  componentKey: "AboutSection",
  label: "About & Brand Story",
  category: "content",
  description: "Story section presenting company heritage, mission, and founder vision.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "media"],
  properties: {
    title: { key: "title", label: "Heading", type: "text", group: "content", defaultValue: "Our Heritage & Philosophy" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Crafted with dedication and passion" },
    description: { key: "description", label: "Story Narrative", type: "textarea", group: "content", defaultValue: "We are committed to delivering the highest standards of excellence." },
    imageUrl: { key: "imageUrl", label: "Story Image URL", type: "image", group: "media" },
  },
});

registerEditableComponent({
  componentKey: "FAQSection",
  label: "Frequently Asked Questions",
  category: "content",
  description: "Accordion-style answers to common customer inquiries and guidelines.",
  status: "FULLY_EDITABLE",
  capabilities: ["content"],
  properties: {
    title: { key: "title", label: "FAQ Heading", type: "text", group: "content", defaultValue: "Frequently Asked Questions" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Find fast answers to common questions" },
  },
});

registerEditableComponent({
  componentKey: "ContactSection",
  label: "Contact & Location Details",
  category: "content",
  description: "Physical location, telephone, email, opening hours, and direct message form.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "links"],
  properties: {
    title: { key: "title", label: "Contact Heading", type: "text", group: "content", defaultValue: "Get in Touch With Us" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Our team is here to assist you anytime" },
    phoneNumber: { key: "phoneNumber", label: "Telephone Number", type: "text", group: "content", defaultValue: "+254 700 000000" },
    email: { key: "email", label: "Contact Email", type: "text", group: "content", defaultValue: "info@store.com" },
    address: { key: "address", label: "Physical Address", type: "text", group: "content", defaultValue: "Nairobi, Kenya" },
  },
});

registerEditableComponent({
  componentKey: "CtaSection",
  label: "Call to Action Banner",
  category: "cta",
  description: "High-impact conversion prompt directing visitors to contact or purchase.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "links", "presentation"],
  properties: {
    title: { key: "title", label: "Banner Heading", type: "text", group: "content", defaultValue: "Ready to Get Started?" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Connect with our team today for exclusive offers" },
    buttonText: { key: "buttonText", label: "Button Text", type: "text", group: "link", defaultValue: "Contact Us Today" },
    buttonLink: { key: "buttonLink", label: "Button Destination", type: "link", group: "link", defaultValue: "/contact" },
  },
});

registerEditableComponent({
  componentKey: "TestimonialsCarouselSection",
  label: "Client Reviews Carousel",
  category: "social_proof",
  description: "Animated slider of verified client feedback, ratings, and testimonials.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "social_proof"],
  properties: {
    title: { key: "title", label: "Reviews Heading", type: "text", group: "content", defaultValue: "Trusted by Discerning Clients" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Read genuine feedback from verified customers" },
  },
});

registerEditableComponent({
  componentKey: "VideoShowcaseSection",
  label: "Video Showcase & Virtual Tours",
  category: "media",
  description: "Embedded video reel showcasing virtual walkthroughs, interviews, and product tours.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "media"],
  properties: {
    title: { key: "title", label: "Showcase Title", type: "text", group: "content", defaultValue: "Featured Virtual Walkthroughs" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Experience our inventory and facilities in dynamic video" },
  },
});

registerEditableComponent({
  componentKey: "MarketInsightsSection",
  label: "Market Insights & Analysis",
  category: "content",
  description: "Industry news, trends, and market valuation reports.",
  status: "FULLY_EDITABLE",
  capabilities: ["content"],
  properties: {
    title: { key: "title", label: "Insights Title", type: "text", group: "content", defaultValue: "Latest Market Dynamics & Trends" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Expert analysis to empower confident decisions" },
  },
});

registerEditableComponent({
  componentKey: "ListingsSection",
  label: "Full Catalog Listings",
  category: "commerce",
  description: "Comprehensive grid of marketplace inventory, filters, and sorting controls.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "data-binding"],
  properties: {
    title: { key: "title", label: "Catalog Title", type: "text", group: "content", defaultValue: "Explore Full Inventory" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Browse all available models and configurations" },
  },
});

registerEditableComponent({
  componentKey: "BlogSection",
  label: "Articles & Editorial Posts",
  category: "content",
  description: "Recent news posts, industry updates, and expert articles.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "links"],
  properties: {
    title: { key: "title", label: "Blog Heading", type: "text", group: "content", defaultValue: "From Our Journal" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Stay updated with our newest stories and insights" },
  },
});

// DIAGNOSTIC COMPONENT AUDIT & DISCOVERY
// ---------------------------------------------------------------------------
export interface ComponentAuditReport {
  templateKey: string;
  components: {
    componentKey: string;
    label: string;
    status: ComponentEditabilityStatus;
    capabilities: ComponentCapability[];
    editablePropertiesCount: number;
    missingPropertiesCount: number;
    missingProperties: string[];
  }[];
  summary: {
    total: number;
    fullyEditable: number;
    partiallyEditable: number;
    viewOnly: number;
  };
}

/**
 * Diagnostic function scanning a template's authentic component surface area,
 * matching registered adapters, and outputting an authoritative editability report.
 */
export function auditTemplateComponents(templateKey: string): ComponentAuditReport {
  const canonicalId = resolveCanonicalTemplate(undefined, undefined, templateKey).id;
  const template = getTemplateById(canonicalId);
  
  const rawSections = template
    ? template.authenticSections
    : [
        "HeroSlider",
        "FeaturesSection",
        "CategoriesSection",
        "CategorySection",
        "PromoSection",
        "PopularProducts",
        "MetricsSection",
        "DailyBestSells",
        "SleepTapeAd",
        "AllProducts",
        "TrendingPromotion",
        "AwardsSection",
        "BannerSection",
        "TestimonialsSection",
        "NewsletterSection",
      ];

  const sectionKeys: string[] = rawSections
    .map((s: any) => {
      if (typeof s === "string") return s;
      return s.component || s.name || s.id || "";
    })
    .filter(Boolean);

  // Always include Header and Footer for complete shell audit
  const allAudited = Array.from(new Set([...sectionKeys, "Header", "Footer"]));

  const components = allAudited.map((rawKey) => {
    const key = String(rawKey);
    // Map kebab/slug to componentKey
    const normalizedKey = key
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");

    const adapter = getEditableComponent(normalizedKey) || getEditableComponent(key);
    if (!adapter) {
      return {
        componentKey: key,
        label: key,
        status: "VIEW_ONLY" as ComponentEditabilityStatus,
        capabilities: [] as ComponentCapability[],
        editablePropertiesCount: 0,
        missingPropertiesCount: 0,
        missingProperties: [],
      };
    }

    const propCount = Object.keys(adapter.properties || {}).length;
    const missing = adapter.missingProperties || [];
    const status = adapter.status || (missing.length > 0 ? "PARTIALLY_EDITABLE" : "FULLY_EDITABLE");

    return {
      componentKey: adapter.componentKey,
      label: adapter.label,
      status,
      capabilities: adapter.capabilities || ["content", "presentation"],
      editablePropertiesCount: propCount,
      missingPropertiesCount: missing.length,
      missingProperties: missing,
    };
  });

  const fullyEditable = components.filter((c) => c.status === "FULLY_EDITABLE").length;
  const partiallyEditable = components.filter((c) => c.status === "PARTIALLY_EDITABLE").length;
  const viewOnly = components.filter((c) => c.status === "VIEW_ONLY").length;

  return {
    templateKey: canonicalId,
    components,
    summary: {
      total: components.length,
      totalComponents: components.length,
      fullyEditable,
      fullyEditableCount: fullyEditable,
      partiallyEditable,
      partiallyEditableCount: partiallyEditable,
      viewOnly,
      viewOnlyCount: viewOnly,
      coveragePercentage: Math.round(
        ((fullyEditable + partiallyEditable) / Math.max(1, components.length)) * 100
      ),
    },
  };
}
