/**
 * lib/website-builder/registry/helpers.ts
 * Shared builders and normalizer for template registry definitions.
 */

import {
  TemplatePageDefinition,
  TemplateShellDefinition,
} from "@/types/website-builder";

export function makeEcommercePages(subfolder: string): TemplatePageDefinition[] {
  return [
    { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
    { id: "p-products", slug: "products", title: "All Products", pageType: "PRODUCT_LIST", nativeSubpath: `${subfolder}/products` },
    { id: "p-categories", slug: "categories", title: "Categories", pageType: "CATEGORY_LIST", nativeSubpath: `${subfolder}/categories` },
    { id: "p-about", slug: "about", title: "About Us", pageType: "ABOUT", nativeSubpath: `${subfolder}/about` },
    { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: `${subfolder}/contact` },
    { id: "p-cart", slug: "cart", title: "Shopping Cart", pageType: "CART", nativeSubpath: `${subfolder}/cart` },
    { id: "p-checkout", slug: "checkout", title: "Checkout", pageType: "CHECKOUT", nativeSubpath: `${subfolder}/checkout` },
  ];
}

export function makeBookingPages(subfolder: string): TemplatePageDefinition[] {
  return [
    { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
    { id: "p-services", slug: "services", title: "Services", pageType: "SERVICE_LIST", nativeSubpath: `${subfolder}/services` },
    { id: "p-booking", slug: "booking", title: "Book Appointment", pageType: "BOOKING", nativeSubpath: `${subfolder}/booking` },
    { id: "p-about", slug: "about", title: "About Us", pageType: "ABOUT", nativeSubpath: `${subfolder}/about` },
    { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: `${subfolder}/contact` },
  ];
}

export function makeCoursePages(subfolder: string): TemplatePageDefinition[] {
  return [
    { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
    { id: "p-courses", slug: "courses", title: "Courses", pageType: "COURSE_LIST", nativeSubpath: `${subfolder}/courses` },
    { id: "p-about", slug: "about", title: "About", pageType: "ABOUT", nativeSubpath: `${subfolder}/about` },
    { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: `${subfolder}/contact` },
    { id: "p-cart", slug: "cart", title: "Cart", pageType: "CART", nativeSubpath: `${subfolder}/cart` },
    { id: "p-checkout", slug: "checkout", title: "Checkout", pageType: "CHECKOUT", nativeSubpath: `${subfolder}/checkout` },
  ];
}

export function makeShell(
  headerComponent: string = "Header",
  footerComponent: string = "Footer",
  defaultNavItems: { id: string; label: string; url: string }[] = []
): TemplateShellDefinition {
  return {
    headerComponent,
    footerComponent,
    defaultNavItems,
  };
}

export function normalizeKey(value?: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
