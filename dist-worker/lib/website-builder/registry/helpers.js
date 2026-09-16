"use strict";
/**
 * lib/website-builder/registry/helpers.ts
 * Shared builders and normalizer for template registry definitions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeKey = exports.makeShell = exports.makeCoursePages = exports.makeBookingPages = exports.makeEcommercePages = void 0;
function makeEcommercePages(subfolder) {
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
exports.makeEcommercePages = makeEcommercePages;
function makeBookingPages(subfolder) {
    return [
        { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
        { id: "p-services", slug: "services", title: "Services", pageType: "SERVICE_LIST", nativeSubpath: `${subfolder}/services` },
        { id: "p-booking", slug: "booking", title: "Book Appointment", pageType: "BOOKING", nativeSubpath: `${subfolder}/booking` },
        { id: "p-about", slug: "about", title: "About Us", pageType: "ABOUT", nativeSubpath: `${subfolder}/about` },
        { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: `${subfolder}/contact` },
    ];
}
exports.makeBookingPages = makeBookingPages;
function makeCoursePages(subfolder) {
    return [
        { id: "p-home", slug: "home", title: "Home", pageType: "HOME", isHomepage: true },
        { id: "p-courses", slug: "courses", title: "Courses", pageType: "COURSE_LIST", nativeSubpath: `${subfolder}/courses` },
        { id: "p-about", slug: "about", title: "About", pageType: "ABOUT", nativeSubpath: `${subfolder}/about` },
        { id: "p-contact", slug: "contact", title: "Contact", pageType: "CONTACT", nativeSubpath: `${subfolder}/contact` },
        { id: "p-cart", slug: "cart", title: "Cart", pageType: "CART", nativeSubpath: `${subfolder}/cart` },
        { id: "p-checkout", slug: "checkout", title: "Checkout", pageType: "CHECKOUT", nativeSubpath: `${subfolder}/checkout` },
    ];
}
exports.makeCoursePages = makeCoursePages;
function makeShell(headerComponent = "Header", footerComponent = "Footer", defaultNavItems = []) {
    return {
        headerComponent,
        footerComponent,
        defaultNavItems,
    };
}
exports.makeShell = makeShell;
function normalizeKey(value) {
    return (value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
exports.normalizeKey = normalizeKey;
