/**
 * lib/seo/description-builder.ts
 *
 * Entity-Grounded Meta Description Generator.
 * Generates compelling 145-160 character descriptions without keyword stuffing.
 */

import { SEOContext } from "./seo-types";
import { cleanText } from "./title-builder";

export function truncateDescription(desc: string, maxLength: number = 158): string {
  const clean = cleanText(desc);
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > 100) {
    return `${sliced.slice(0, lastSpace)}…`;
  }
  return `${sliced}…`;
}

export function buildPageDescription(ctx: SEOContext): string {
  // 1. Explicit custom SEO description override
  if (ctx.customSEO?.description) {
    return truncateDescription(ctx.customSEO.description);
  }

  const { siteType, pageType, tenant, entity } = ctx;
  const storeName = cleanText(tenant?.name) || "Store";
  const entityDesc = cleanText(entity?.description || entity?.longDescription);
  const entityName = cleanText(entity?.name || (entity as any)?.title);
  const price = (entity as any)?.finalPrice || (entity as any)?.sellingPrice;
  const currency = (entity as any)?.currency || tenant?.currency || "KES";
  const brand = cleanText((entity as any)?.brand || (entity as any)?.make);
  const location = cleanText(tenant?.city || tenant?.address);

  // --------------------------------------------------------------------------
  // Surface 1: SALESMANPRO PLATFORM
  // --------------------------------------------------------------------------
  if (siteType === "SALESMANPRO") {
    switch (pageType) {
      case "HOME":
        return "SalesmanPro is the all-in-one commerce platform for modern businesses. Launch storefronts, manage multi-channel inventory, POS, and scale your sales effortlessly.";
      case "PRICING":
        return "Explore simple, transparent pricing plans for SalesmanPro. Choose the right tier for your store, POS, and digital commerce operations.";
      case "ABOUT":
        return "Learn how SalesmanPro is empowering local and global merchants with enterprise-grade retail technology, automated operations, and omnichannel tools.";
      case "CAREERS":
        return "Join the SalesmanPro team. We are building the future of African and global commerce infrastructure with passionate engineers and retail innovators.";
      case "CONTACT":
        return "Get in touch with the SalesmanPro team for sales inquiries, product onboarding, enterprise solutions, or technical support.";
      case "BLOG":
        return entityDesc
          ? truncateDescription(entityDesc)
          : "Read the latest updates, engineering deep dives, and retail growth strategies from the SalesmanPro team.";
      default:
        return entityDesc ? truncateDescription(entityDesc) : "SalesmanPro — Next-generation commerce platform.";
    }
  }

  // --------------------------------------------------------------------------
  // Surface 2: GHUBA MARKETPLACE
  // --------------------------------------------------------------------------
  if (siteType === "GHUBA") {
    switch (pageType) {
      case "HOME":
        return "Shop electronics, fashion, automotive, home goods, and real estate on Ghuba. Discover thousands of verified sellers, fast local delivery, and secure payments.";
      case "CATEGORY":
        return truncateDescription(
          entityName
            ? `Explore the best deals on ${entityName} on Ghuba Marketplace. Compare prices from verified sellers with fast delivery across Kenya.`
            : "Browse verified product categories and trending deals on Ghuba Marketplace."
        );
      case "VEHICLE": {
        const make = cleanText((entity as any)?.make);
        const model = cleanText((entity as any)?.model);
        const year = (entity as any)?.year || "";
        const priceStr = price ? ` for ${currency} ${Number(price).toLocaleString()}` : "";
        return truncateDescription(
          `Find this verified ${year ? `${year} ` : ""}${make} ${model}${priceStr} on Ghuba Autos. Inspect specs, mileage, condition, and contact the seller directly.`
        );
      }
      case "PROPERTY": {
        const area = cleanText((entity as any)?.area);
        const priceStr = price ? ` at ${currency} ${Number(price).toLocaleString()}` : "";
        return truncateDescription(
          `View details for ${entityName || "Property"}${area ? ` in ${area}` : ""}${priceStr} on Ghuba Real Estate. Browse photos, floor plans, and verified agent contacts.`
        );
      }
      case "PRODUCT":
      case "LISTING": {
        if (entityDesc && entityDesc.length > 40) {
          return truncateDescription(entityDesc);
        }
        const priceStr = price ? ` for ${currency} ${Number(price).toLocaleString()}` : "";
        const brandStr = brand ? ` by ${brand}` : "";
        return truncateDescription(
          `Buy ${entityName}${brandStr}${priceStr} on Ghuba Marketplace. Fast delivery and secure payment options available.`
        );
      }
      case "SELLER":
        return truncateDescription(
          `Discover verified products and customer reviews from ${entityName || "Seller"} on Ghuba Marketplace. Order directly with guaranteed merchant fulfillment.`
        );
      default:
        return entityDesc ? truncateDescription(entityDesc) : "Ghuba Marketplace — Verified shopping in Kenya.";
    }
  }

  // --------------------------------------------------------------------------
  // Surface 3: TENANT STORE
  // --------------------------------------------------------------------------
  if (pageType === "PRODUCT") {
    if (entityDesc && entityDesc.length > 40) {
      return truncateDescription(entityDesc);
    }
    const priceStr = price ? ` for ${currency} ${Number(price).toLocaleString()}` : "";
    return truncateDescription(
      `Order ${entityName || "this item"}${priceStr} from ${storeName}. High quality, fast fulfillment, and secure checkout.`
    );
  }

  if (pageType === "CATEGORY") {
    return truncateDescription(
      `Discover our ${entityName || "featured"} collection at ${storeName}. Handcrafted selection and best rates.`
    );
  }

  if (pageType === "SERVICE") {
    return truncateDescription(
      entityDesc || `Professional ${entityName || "services"} offered by ${storeName}. Schedule your appointment or get a quick quote today.`
    );
  }

  if (pageType === "HOME") {
    if (tenant?.description && tenant.description.length > 30) {
      return truncateDescription(tenant.description);
    }
    if (tenant?.tagline) {
      return truncateDescription(`${storeName} — ${tenant.tagline}. ${location ? `Located in ${location}.` : ""} Shop our curated catalog today.`);
    }
    return truncateDescription(`Welcome to ${storeName}. Discover our latest products, special offers, and reliable customer service.`);
  }

  return entityDesc ? truncateDescription(entityDesc) : `Visit ${storeName} for verified products and services.`;
}
