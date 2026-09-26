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
  customDomain: boolean;
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

export const AUTHORITATIVE_PLANS: AuthoritativePlan[] = [
  {
    id: "69179f5258ce6ab63d0b789a",
    name: "Ghuba Basic",
    displayName: "SalesmanPro Basic",
    tagline: "Essential storefront, manual sales logging, and basic stock management.",
    description: "Ideal for solo entrepreneurs, kiosks, and emerging shops launching their first online presence.",
    priceMonthly: 999,
    priceAnnually: 9990,
    currency: "KES",
    isPopular: false,
    trialDays: 14,
    tierWeight: 1,
    limits: {
      staffUsers: 1,
      salesAgents: 0,
      products: 100,
      customers: 250,
      monthlyAiCredits: 0,
      locations: 1,
      customDomain: false,
      multiCounterPos: false,
      whatsAppAi: false,
      industryModules: ["ecommerce", "retail"],
    },
    highlightFeatures: [
      "Subdomain Web Storefront",
      "Up to 100 Products & Basic Stock Tracking",
      "Manual Sales & Digital Receipts",
      "M-PESA Manual Payment Reconciliation",
      "1 Staff User Account",
      "Standard Web & Mobile Dashboard",
    ],
    featureGroups: [
      {
        category: "Commerce & POS",
        items: [
          "Subdomain Storefront (e.g. yourshop.salesmanpro.site)",
          "Single-Counter Basic POS",
          "Catalog & Product Management (up to 100 items)",
          "Manual Order & Sale Logging",
          "Digital Receipt Generation",
        ],
      },
      {
        category: "Operations & Admin",
        items: [
          "1 Staff Account",
          "Basic Inventory Levels",
          "Standard Daily Sales Summary",
          "Mobile-friendly Responsive Dashboard",
        ],
      },
      {
        category: "Payments & Integration",
        items: [
          "Manual M-PESA Code Entry & Tracking",
          "Cash Sales Logging",
        ],
      },
      {
        category: "Support",
        items: ["Standard Email Support", "Help Center Access"],
      },
    ],
  },
  {
    id: "69179f5258ce6ab63d0b889a",
    name: "Ghuba Starter",
    displayName: "SalesmanPro Starter",
    tagline: "Automate sales, physical POS counters, and instant M-PESA STK pushes.",
    description: "The complete operating kit for growing retail stores, service businesses, and booking providers.",
    priceMonthly: 2999,
    priceAnnually: 29990,
    currency: "KES",
    isPopular: true,
    trialDays: 14,
    tierWeight: 2,
    limits: {
      staffUsers: 5,
      salesAgents: 2,
      products: -1, // Unlimited
      customers: -1, // Unlimited
      monthlyAiCredits: 100,
      locations: 1,
      customDomain: true,
      multiCounterPos: false,
      whatsAppAi: false,
      industryModules: [
        "ecommerce",
        "retail",
        "services",
        "bookings",
        "restaurants",
      ],
    },
    highlightFeatures: [
      "Custom Domain Support & Free SSL",
      "Fast Counter POS with Barcode & Thermal Receipt Printing",
      "Automated M-PESA STK Push Checkout",
      "Unlimited Products & Real-time Stock Alerts",
      "100 Monthly AI Studio Credits",
      "5 Staff User Roles with Permission Controls",
    ],
    featureGroups: [
      {
        category: "Commerce & POS",
        items: [
          "Custom Domain Linking (yourstore.com)",
          "Full Counter POS with Barcode Scanning",
          "Unlimited Products, Categories & Variants",
          "Thermal & PDF Invoice / Receipt Printing",
          "Real-time Stock Depletion & Low-Stock Alerts",
        ],
      },
      {
        category: "Payments & Financials",
        items: [
          "Automated M-PESA STK Push Integration",
          "Instant Payment Verification Callbacks",
          "Customer Debt & Credit Tracking",
          "Daily Cash Float & Shift Reconciliation",
        ],
      },
      {
        category: "AI & Automation",
        items: [
          "100 Monthly AI Generation Credits",
          "AI Product Description Generator",
          "AI Marketing Copywriter",
        ],
      },
      {
        category: "Operations & Staff",
        items: [
          "Up to 5 Staff Users (Cashier, Manager, Inventory Clerk)",
          "Customer Order History & Profiles",
          "Real-time Profit & Margin Analytics",
          "Appointment & Booking Management",
        ],
      },
      {
        category: "Support",
        items: ["Priority Email & Ticket Support", "Onboarding Guide"],
      },
    ],
  },
  {
    id: "69179f5258ce6ab63d0b889b",
    name: "Ghuba Pro",
    displayName: "SalesmanPro Pro",
    tagline: "Autonomous WhatsApp AI agents, multi-counter POS, and media studio.",
    description: "Designed for established merchants, multi-branch retailers, and dynamic service networks.",
    priceMonthly: 5999,
    priceAnnually: 59990,
    currency: "KES",
    isPopular: false,
    trialDays: 14,
    tierWeight: 3,
    limits: {
      staffUsers: 15,
      salesAgents: 10,
      products: -1,
      customers: -1,
      monthlyAiCredits: 500,
      locations: 3,
      customDomain: true,
      multiCounterPos: true,
      whatsAppAi: true,
      industryModules: [
        "ecommerce",
        "retail",
        "services",
        "bookings",
        "restaurants",
        "events",
        "media",
        "travel",
        "realestate",
      ],
    },
    highlightFeatures: [
      "WhatsApp Commerce Live Inbox & Automated Broadcasts",
      "Autonomous WhatsApp AI Sales Agent (Instant Orders in Chat)",
      "Multi-Counter POS & Multi-Warehouse Inventory",
      "500 Monthly AI Credits for Image & Video Generation",
      "15 Staff Accounts & 10 Sales Commission Agents",
      "Advanced Profit Margins & Accounting Breakdown",
    ],
    featureGroups: [
      {
        category: "WhatsApp Commerce & AI",
        items: [
          "WhatsApp Live Team Inbox",
          "24/7 Autonomous WhatsApp AI Sales Agent",
          "Automated Product Catalog Sharing in WhatsApp",
          "In-Chat Checkout Links & STK Push Triggers",
          "WhatsApp Broadcast Campaigns & Templates",
        ],
      },
      {
        category: "AI Studio",
        items: [
          "500 Monthly AI Credits",
          "AI Image Studio (Product Photography & Banners)",
          "AI Video & Reel Generation Studio",
          "Dedicated Knowledge Base for Store Catalog",
        ],
      },
      {
        category: "Multi-Location POS & Operations",
        items: [
          "Multi-Counter Simultaneous POS Checkout",
          "Up to 3 Branches / Warehouses Synchronized",
          "Sales Agents & Tiered Commission Tracking",
          "15 Staff Accounts with Custom Role Matrix",
        ],
      },
      {
        category: "Industry Solutions",
        items: [
          "Event Ticketing & QR Attendee Check-in",
          "Media & Entertainment (Digital Content & Streaming)",
          "Real Estate Properties & Showing Inquiries",
          "Travel Destinations, Tours & Booking Calendars",
        ],
      },
      {
        category: "Support",
        items: ["Priority WhatsApp & Phone Support", "Dedicated Account Manager"],
      },
    ],
  },
  {
    id: "69179f5258ce6ab63d0b780a",
    name: "Ghuba Growth",
    displayName: "SalesmanPro Enterprise OS",
    tagline: "Unlimited multi-industry operations, custom integrations, and dedicated SLA.",
    description: "The complete enterprise suite powering schools, real estate conglomerates, logistics fleets, and multi-chain groups.",
    priceMonthly: 14999,
    priceAnnually: 149990,
    currency: "KES",
    isPopular: false,
    trialDays: 14,
    tierWeight: 4,
    limits: {
      staffUsers: -1, // Unlimited
      salesAgents: -1, // Unlimited
      products: -1,
      customers: -1,
      monthlyAiCredits: 2000,
      locations: -1, // Unlimited
      customDomain: true,
      multiCounterPos: true,
      whatsAppAi: true,
      industryModules: [
        "all",
        "ecommerce",
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
      "All Industry Operating Systems (Schools, Real Estate, Clinics, Logistics, Fitness)",
      "Unlimited Staff Users, Counters, Branches & Warehouses",
      "2,000 Monthly AI Credits & Custom Prompt Tuning",
      "Full School ERP (Students, Exams, Fees, Library, Transport)",
      "Fleet Dispatch, Driver Live Tracking & Logistics Lifecycle",
      "Dedicated 24/7 Account Executive & Custom API Integrations",
    ],
    featureGroups: [
      {
        category: "Complete Industry Operating Systems",
        items: [
          "Education OS: Students, Teachers, Exams, Fees, Library & Bus Routes",
          "Real Estate OS: Multi-property Portfolios, Showings, Offers & Contracts",
          "Logistics OS: Driver Dispatch, Fleet Vehicles, Waybills & Live Tracking",
          "Fitness OS: Memberships, Gym Turnstile/Check-ins & Class Scheduling",
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
        category: "Enterprise AI & WhatsApp",
        items: [
          "2,000 Monthly AI Generation Credits",
          "High-throughput WhatsApp Broadcast Engine",
          "Custom Fine-tuned Business Logic for AI Agents",
          "Full WhatsApp Webhook & API Access",
        ],
      },
      {
        category: "Custom Integrations & SLA",
        items: [
          "REST API & Webhook Export Pipeline",
          "24/7 Dedicated Support Engineer",
          "Hands-on Data Migration & On-premise Staff Training",
          "99.9% Uptime Service Level Agreement (SLA)",
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
  "ghuba growth": 4,

  // Display name aliases
  "basic": 1,
  "salesmanpro basic": 1,
  "standard": 1,
  "starter": 2,
  "salesmanpro starter": 2,
  "business os": 2,
  "pro": 3,
  "salesmanpro pro": 3,
  "salesmanpro scale": 3,
  "growth": 4,
  "ghuba enterprise": 4,
  "salesmanpro growth": 4,
  "enterprise os": 4,
  "enterprise": 4,

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
