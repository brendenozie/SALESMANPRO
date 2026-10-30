// lib/subscriptions/subscription-plans.ts
/**
 * ============================================================================
 * SALESMANPRO AUTHORITATIVE SUBSCRIPTION & ENTITLEMENT SYSTEM
 * ============================================================================
 * Single source of truth for all subscription tiers, feature matrices,
 * resource limits, and industry solution entitlements.
 */

export type BillingCycle = "MONTHLY" | "ANNUALLY";

export interface PlanFeatureGroup {
  category: string;
  items: string[];
}

export interface PlanLimits {
  staffUsers: number; // -1 = unlimited
  salesAgents: number; // -1 = unlimited
  products: number; // -1 = unlimited
  customers: number; // -1 = unlimited
  monthlyAiCredits: number;
  locations: number; // -1 = unlimited
  invoicesReceipts: number; // -1 = unlimited, otherwise the monthly cap
  marketplaceListings: number; // -1 = unlimited, 0 = feature not available
  services: number; // -1 = unlimited
  customDomain: boolean;
  sslCertificate: boolean;
  bulkProductEdit: boolean;
  multiCounterPos: boolean;
  whatsAppAi: boolean;
  industryModules: string[]; // List of enabled industry keys
}

export interface AuthoritativePlan {
  id: string; // MongoDB ObjectId matching prisma.plan
  name: string; // Database plan name ("Ghuba Basic", "Ghuba Starter", etc.)
  displayName: string;
  tagline: string;
  description: string;
  priceMonthly: number; // in KES
  priceAnnually: number; // in KES
  currency: string;
  isPopular: boolean;
  trialDays: number;
  tierWeight: number; // 1 = Basic, 2 = Starter, 3 = Pro, 4 = Growth
  limits: PlanLimits;
  featureGroups: PlanFeatureGroup[];
  highlightFeatures: string[];
}

export interface LaunchPackage {
  id: string;
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  price: number; // in KES
  currency: string;
  type: "ONE_TIME";
  isPopular: boolean;
  includesSubscriptionMonths: number;
  includedPlan: string;
  deliverables: string[];
  highlightFeatures: string[];
}

export const LAUNCH_PACKAGES: LaunchPackage[] = [
  {
    id: "pkg_assisted_launch",
    name: "Assisted Business Launch",
    displayName: "Assisted Business Launch",
    tagline: "Turnkey store setup, professional branding, catalog upload, and M-PESA configuration.",
    description: "Ideal for retail and boutique owners who want a professional, ready-to-sell online store without doing the technical setup.",
    price: 10000,
    currency: "KES",
    type: "ONE_TIME",
    isPopular: true,
    includesSubscriptionMonths: 3,
    includedPlan: "Starter Store",
    deliverables: [
      "Full assisted store setup & publication",
      "Business branding configuration (logo, banner, theme colors)",
      "Initial catalog upload (up to 50 products with photos, descriptions & pricing)",
      "Safaricom M-PESA Till / Paybill & automated STK push integration",
      "Custom domain linking or branded subdomain setup",
      "1-on-1 merchant orientation & staff walkthrough",
      "Includes 3 Months of Starter Store Subscription (KSh 3,000 value)",
    ],
    highlightFeatures: [
      "3 Months Starter Store Included",
      "50 Products Uploaded For You",
      "M-PESA Integration Configured",
      "1-on-1 Merchant Orientation",
    ],
  },
  {
    id: "pkg_premium_launch",
    name: "Premium Business Launch",
    displayName: "Premium Business Launch",
    tagline: "White-glove custom storefront, multi-counter POS setup, and priority merchant training.",
    description: "Designed for established retailers, multi-branch merchants, and busy commercial enterprises.",
    price: 15000,
    currency: "KES",
    type: "ONE_TIME",
    isPopular: false,
    includesSubscriptionMonths: 6,
    includedPlan: "Starter Store",
    deliverables: [
      "Turnkey custom storefront configuration with custom layout & styling",
      "Advanced graphic design & premium branding assets",
      "Expanded catalog upload (up to 200 products with variants, sizes & barcodes)",
      "Multi-counter physical POS configuration & receipt printer pairing",
      "Staff role matrix setup & comprehensive team training",
      "Priority merchant onboarding & dedicated account manager",
      "Includes 6 Months of Starter Store Subscription (KSh 6,000 value)",
    ],
    highlightFeatures: [
      "6 Months Starter Store Included",
      "200 Products Uploaded For You",
      "Multi-Counter POS Configured",
      "Priority Concierge Support",
    ],
  },
];

/** Database id of the plan granted by launch packages ("Starter Store" / legacy "Ghuba Basic"). */
export const LAUNCH_INCLUDED_PLAN_ID = "69179f5258ce6ab63d0b789a";
export const LAUNCH_INCLUDED_PLAN_NAMES = ["Ghuba Basic", "Starter Store"];

/** Prefix stored in SubscriptionCompany.billingCycle when a launch package is purchased. */
export const LAUNCH_BILLING_PREFIX = "LAUNCH:";

export function getLaunchPackage(id?: string | null): LaunchPackage | undefined {
  if (!id) return undefined;
  return LAUNCH_PACKAGES.find((pkg) => pkg.id === id);
}

export function launchBillingCycle(pkg: LaunchPackage): string {
  return `${LAUNCH_BILLING_PREFIX}${pkg.id}`;
}

/**
 * Single source of truth for subscription renewal dates on payment confirmation.
 * - "ANNUALLY"          -> +1 year
 * - "LAUNCH:<pkgId>"    -> +includesSubscriptionMonths of that package
 * - anything else       -> +1 month
 */
export function computeRenewalDate(billingCycle?: string | null, from: Date = new Date()): Date {
  const renewal = new Date(from);
  if (billingCycle === "ANNUALLY") {
    renewal.setFullYear(renewal.getFullYear() + 1);
    return renewal;
  }
  if (billingCycle?.startsWith(LAUNCH_BILLING_PREFIX)) {
    const pkg = getLaunchPackage(billingCycle.slice(LAUNCH_BILLING_PREFIX.length));
    renewal.setMonth(renewal.getMonth() + (pkg?.includesSubscriptionMonths ?? 1));
    return renewal;
  }
  renewal.setMonth(renewal.getMonth() + 1);
  return renewal;
}

export const AUTHORITATIVE_PLANS: AuthoritativePlan[] = [
  {
    id: "69179f5258ce6ab63d0b789a",
    name: "Ghuba Basic",
    displayName: "Starter Store",
    tagline: "Complete online storefront, automated M-PESA checkout, and POS for your shop.",
    description: "Everything a fashion boutique, electronics store, beauty shop, or retailer needs to start selling online and managing physical sales.",
    priceMonthly: 1000,
    priceAnnually: 10000,
    currency: "KES",
    isPopular: true,
    trialDays: 14,
    tierWeight: 1,
    limits: {
      staffUsers: 3,
      salesAgents: 2,
      products: -1, // Unlimited
      customers: -1, // Unlimited
      monthlyAiCredits: 50,
      locations: 1,
      invoicesReceipts: -1, // Unlimited
      marketplaceListings: 50,
      services: 25,
      customDomain: true,
      sslCertificate: true,
      bulkProductEdit: true,
      multiCounterPos: false,
      whatsAppAi: false,
      industryModules: [
        "ecommerce",
        "retail",
        "services",
        "fashion",
        "electronics",
        "beauty",
        "furniture",
        "agrovet",
      ],
    },
    highlightFeatures: [
      "Hosted Online Storefront",
      "Automated M-PESA STK Push",
      "Barcode Scanning POS Counter",
      "Unlimited Products & Sales Records",
      "Unlimited Invoices & Receipts",
      "Up to 3 Staff Accounts",
      "50 Marketplace Listings",
      "50 Monthly AI Credits",
    ],
    featureGroups: [
      {
        category: "Commerce & Storefront",
        items: [
          "Professional Hosted Online Storefront (e.g. yourshop.salesmanpro.store)",
          "Custom Domain Linking (yourstore.com) with SSL Certificate",
          "Single-Counter Point of Sale (POS) with Barcode Scanner Support",
          "Unlimited Products, Categories & Product Variants",
          "Bulk Product Upload & CSV Editing",
          "Real-time Inventory Depletion & Low-Stock Alerts",
          "50 Product Listings on Ghuba Marketplace",
        ],
      },
      {
        category: "Payments & Financials",
        items: [
          "Automated M-PESA STK Push Checkout Integration",
          "Instant Payment Verification & Receipt Dispatch",
          "M-PESA Till / Paybill Manual Tracking",
          "Cash Sales Logging & Digital Receipt Generation",
          "Daily Cash Float & Shift Reconciliation",
        ],
      },
      {
        category: "Operations & Admin",
        items: [
          "Up to 3 Staff Accounts (Owner, Cashier, Inventory Clerk)",
          "2 Sales Agents with Basic Tracking",
          "Unlimited Sales Orders & Customer History",
          "Unlimited PDF & Thermal Receipts & Invoices",
          "Mobile-friendly Responsive Merchant Dashboard",
          "50 Monthly AI Generation Credits for Descriptions & Social Copy",
        ],
      },
      {
        category: "Support & Guidance",
        items: [
          "14-Day Free Trial on Signup",
          "Standard Email & WhatsApp Ticket Support",
          "Merchant Onboarding Step-by-Step Guide",
        ],
      },
    ],
  },
  {
    id: "69179f5258ce6ab63d0b889a",
    name: "Ghuba Starter",
    displayName: "Business Pro",
    tagline: "Autonomous WhatsApp AI sales agent, multi-counter POS, and expansion tools.",
    description: "The complete operating kit for growing retail stores, busy restaurants, service hubs, and multi-staff businesses.",
    priceMonthly: 3000,
    priceAnnually: 30000,
    currency: "KES",
    isPopular: false,
    trialDays: 14,
    tierWeight: 2,
    limits: {
      staffUsers: 10,
      salesAgents: 5,
      products: -1, // Unlimited
      customers: -1, // Unlimited
      monthlyAiCredits: 300,
      locations: 3,
      invoicesReceipts: -1, // Unlimited
      marketplaceListings: 200,
      services: 100,
      customDomain: true,
      sslCertificate: true,
      bulkProductEdit: true,
      multiCounterPos: true,
      whatsAppAi: true,
      industryModules: [
        "ecommerce",
        "retail",
        "services",
        "bookings",
        "restaurants",
        "fashion",
        "electronics",
        "beauty",
        "furniture",
        "events",
      ],
    },
    highlightFeatures: [
      "Everything in Starter Store",
      "Autonomous WhatsApp AI Sales Agent",
      "Multi-Counter POS Checkout",
      "Up to 3 Synchronized Branches",
      "Up to 10 Staff Accounts",
      "300 Monthly AI Credits",
      "200 Marketplace Listings",
      "Priority Support",
    ],
    featureGroups: [
      {
        category: "WhatsApp AI & Automation",
        items: [
          "24/7 Autonomous WhatsApp AI Sales Agent",
          "WhatsApp Live Team Inbox with Multi-agent Collaboration",
          "Automated Product Catalog Sharing via WhatsApp Chat",
          "In-Chat Checkout Links with Direct STK Push Triggers",
          "WhatsApp Broadcast Campaigns & Pre-approved Templates",
        ],
      },
      {
        category: "Multi-Counter POS & Multi-Branch",
        items: [
          "Simultaneous Multi-Counter POS Checkout",
          "Up to 3 Physical Store Locations or Warehouses Synchronized",
          "Up to 10 Staff User Accounts with Role Permissions",
          "5 Sales Agents with Tiered Commission Tracking",
          "Customer Debt & Credit Accounts Ledger",
        ],
      },
      {
        category: "AI Studio & Content",
        items: [
          "300 Monthly AI Generation Credits",
          "AI Product Photography & Banner Enhancer",
          "AI Social Media Marketing Campaign Generator",
          "Dedicated Catalog Knowledge Base for Instant AI Answers",
        ],
      },
      {
        category: "Support",
        items: ["Priority WhatsApp & Phone Support", "Dedicated Onboarding Guide"],
      },
    ],
  },
  {
    id: "69179f5258ce6ab63d0b889b",
    name: "Ghuba Pro",
    displayName: "Enterprise OS",
    tagline: "Unlimited multi-industry operations, custom integrations, and dedicated SLA.",
    description: "The complete enterprise suite powering multi-chain groups, educational institutions, real estate portfolios, and logistics fleets.",
    priceMonthly: 8999,
    priceAnnually: 89990,
    currency: "KES",
    isPopular: false,
    trialDays: 14,
    tierWeight: 3,
    limits: {
      staffUsers: -1, // Unlimited
      salesAgents: -1, // Unlimited
      products: -1, // Unlimited
      customers: -1, // Unlimited
      monthlyAiCredits: 2000,
      locations: -1, // Unlimited
      invoicesReceipts: -1, // Unlimited
      marketplaceListings: -1, // Unlimited
      services: -1, // Unlimited
      customDomain: true,
      sslCertificate: true,
      bulkProductEdit: true,
      multiCounterPos: true,
      whatsAppAi: true,
      industryModules: [
        "all",
        "ecommerce",
        "retail",
        "school",
        "realestate",
        "travel",
        "fitness",
        "delivery",
        "media",
        "services",
        "healthcare",
      ],
    },
    highlightFeatures: [
      "Everything in Business Pro",
      "Unlimited Staff & Locations",
      "Unlimited POS Counters",
      "Full Industry OS Modules (School, Real Estate, Logistics, Health)",
      "2,000 Monthly AI Credits",
      "Dedicated Account Engineer",
      "99.9% Uptime SLA",
    ],
    featureGroups: [
      {
        category: "Complete Industry Operating Systems",
        items: [
          "Education OS: Students, Teachers, Exams, Fees, Library & Bus Routes",
          "Real Estate OS: Multi-property Portfolios, Showings, Offers & Contracts",
          "Logistics OS: Driver Dispatch, Fleet Vehicles, Waybills & Live Tracking",
          "Fitness OS: Memberships, Turnstile/Check-ins & Class Scheduling",
          "Healthcare OS: Doctor Rosters, Appointments & Patient Invoices",
        ],
      },
      {
        category: "Enterprise Scale & Capacity",
        items: [
          "Unlimited Staff Accounts & Branch Locations",
          "Unlimited POS Counters with Centralized Ledger",
          "Multi-Paybill & Custom Bank/Till Direct Routing",
          "Comprehensive Multi-Currency & Consolidated Financials",
        ],
      },
      {
        category: "Enterprise AI & Integrations",
        items: [
          "2,000 Monthly AI Generation Credits",
          "High-throughput WhatsApp Broadcast Engine",
          "Full REST API & Webhook Export Pipeline",
          "24/7 Dedicated Support Engineer & 99.9% SLA",
        ],
      },
    ],
  },
];

/**
 * Normalized tier weights for comparison
 */
export const TIER_WEIGHTS: Record<string, number> = {
  // Database names
  "ghuba basic": 1,
  "ghuba starter": 2,
  "ghuba pro": 3,
  "ghuba growth": 3,

  // Display name aliases
  "starter store": 1,
  "salesmanpro starter store": 1,
  "starter": 1,
  "basic": 1,
  "salesmanpro basic": 1,
  "standard": 1,

  "business pro": 2,
  "pro": 2,
  "salesmanpro starter": 2,
  "business os": 2,
  "salesmanpro pro": 2,
  "growth": 2,

  "enterprise os": 3,
  "enterprise": 3,
  "salesmanpro enterprise": 3,
  "salesmanpro growth": 3,
  "salesmanpro enterprise os": 3,
  "ghuba enterprise": 3,

  // Free / Trial
  "ghuba free": 99,
  "ghuba trial": 99,
  "trial": 99,
  "free": 99,
};

/**
 * Retrieve the tier weight of a plan name (case-insensitive)
 */
export function getTierWeight(tierName?: string | null): number {
  if (!tierName) return 0;
  const normalized = tierName.toLowerCase().trim();
  return TIER_WEIGHTS[normalized] ?? 0;
}

/**
 * Check if the current plan meets or exceeds the required plan
 */
export function isEntitled(
  currentTier: string | null | undefined,
  requiredTier: string | null | undefined,
  isSubscriptionActive: boolean = true
): boolean {
  if (!isSubscriptionActive) return false;
  if (!requiredTier) return true;

  const currentWeight = getTierWeight(currentTier);
  const requiredWeight = getTierWeight(requiredTier);

  // Unlimited pass for Trial / Free
  if (currentWeight >= 99) return true;

  return currentWeight >= requiredWeight;
}

/**
 * Find an authoritative plan by ID
 */
export function getAuthoritativePlanById(id: string): AuthoritativePlan | undefined {
  return AUTHORITATIVE_PLANS.find((p) => p.id === id);
}

/**
 * Find an authoritative plan by name (case-insensitive)
 */
export function getAuthoritativePlanByName(name: string): AuthoritativePlan | undefined {
  const norm = name.toLowerCase().trim();
  return AUTHORITATIVE_PLANS.find(
    (p) =>
      p.name.toLowerCase() === norm ||
      p.displayName.toLowerCase() === norm ||
      p.name.toLowerCase().includes(norm) ||
      norm.includes(p.name.toLowerCase())
  );
}

/**
 * Formatted upgrade message for locked features
 */
export function getUpgradeMessage(featureLabel: string, requiredTier: string): {
  title: string;
  description: string;
  recommendedTier: string;
} {
  const plan = getAuthoritativePlanByName(requiredTier) || AUTHORITATIVE_PLANS[1];
  return {
    title: `${featureLabel} requires ${plan.displayName}`,
    description: `Upgrade to ${plan.displayName} to unlock ${featureLabel}, expand your operational capacity, and accelerate your business growth.`,
    recommendedTier: plan.name,
  };
}
