"use strict";
// lib/subscriptions/subscription-plans.ts
/**
 * ============================================================================
 * SALESMANPRO AUTHORITATIVE SUBSCRIPTION & ENTITLEMENT SYSTEM
 * ============================================================================
 * Single source of truth for all subscription tiers, feature matrices,
 * resource limits, and industry solution entitlements.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpgradeMessage = exports.getAuthoritativePlanByName = exports.getAuthoritativePlanById = exports.isEntitled = exports.getTierWeight = exports.TIER_WEIGHTS = exports.AUTHORITATIVE_PLANS = void 0;
exports.AUTHORITATIVE_PLANS = [
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
            products: -1,
            customers: -1,
            monthlyAiCredits: 0,
            locations: 1,
            invoicesReceipts: 20,
            marketplaceListings: 0,
            services: 5,
            customDomain: false,
            sslCertificate: true,
            bulkProductEdit: false,
            multiCounterPos: false,
            whatsAppAi: false,
            industryModules: ["ecommerce", "retail"],
        },
        highlightFeatures: [
            "Standard Ghuba Subdomain",
            "SSL Certificate",
            "Unlimited Products",
            "Unlimited Sales Records",
            "20 Invoices & Receipts",
            "1 Staff User Account",
        ],
        featureGroups: [
            {
                category: "Commerce & POS",
                items: [
                    "Standard Ghuba Subdomain (e.g. yourshop.ghuba.site)",
                    "SSL Certificate",
                    "Single-Counter Basic POS",
                    "Unlimited Products & Basic Stock Tracking",
                    "Manual Order & Sale Logging",
                    "Digital Receipt Generation",
                ],
            },
            {
                category: "Operations & Admin",
                items: [
                    "1 Staff Account",
                    "Unlimited Sales Records",
                    "20 Invoices & Receipts",
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
            products: -1,
            customers: -1,
            monthlyAiCredits: 100,
            locations: 1,
            invoicesReceipts: 50,
            marketplaceListings: 25,
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
                "bookings",
                "restaurants",
            ],
        },
        highlightFeatures: [
            "Custom Domain",
            "SSL Certificate",
            "Unlimited Products",
            "Bulk Product Edit",
            "Unlimited Sales Records",
            "50 Invoices & Receipts",
        ],
        featureGroups: [
            {
                category: "Commerce & POS",
                items: [
                    "Custom Domain Linking (yourstore.com)",
                    "SSL Certificate",
                    "Full Counter POS with Barcode Scanning",
                    "Unlimited Products, Categories & Variants",
                    "Bulk Product Edit",
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
                    "2 Sales Agents",
                    "Unlimited Sales Records",
                    "50 Invoices & Receipts",
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
            invoicesReceipts: 200,
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
                "events",
                "media",
                "travel",
                "realestate",
            ],
        },
        highlightFeatures: [
            "Custom Domain",
            "SSL Certificate",
            "Unlimited Products",
            "Bulk Product Edit",
            "Unlimited Sales Records",
            "200 Invoices & Receipts",
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
            staffUsers: -1,
            salesAgents: -1,
            products: -1,
            customers: -1,
            monthlyAiCredits: 2000,
            locations: -1,
            invoicesReceipts: -1,
            marketplaceListings: -1,
            services: -1,
            customDomain: true,
            sslCertificate: true,
            bulkProductEdit: true,
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
            "Custom Domain",
            "SSL Certificate",
            "Unlimited Products",
            "Bulk Product Edit",
            "Unlimited Sales Records",
            "Unlimited Invoices & Receipts",
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
exports.TIER_WEIGHTS = {
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
function getTierWeight(tierName) {
    if (!tierName)
        return 0;
    const normalized = tierName.toLowerCase().trim();
    return exports.TIER_WEIGHTS[normalized] ?? 0;
}
exports.getTierWeight = getTierWeight;
/**
 * Check if the current plan meets or exceeds the required plan
 */
function isEntitled(currentTier, requiredTier, isSubscriptionActive = true) {
    if (!isSubscriptionActive)
        return false;
    if (!requiredTier)
        return true;
    const currentWeight = getTierWeight(currentTier);
    const requiredWeight = getTierWeight(requiredTier);
    // Unlimited pass for Trial / Free
    if (currentWeight >= 99)
        return true;
    return currentWeight >= requiredWeight;
}
exports.isEntitled = isEntitled;
/**
 * Find an authoritative plan by ID
 */
function getAuthoritativePlanById(id) {
    return exports.AUTHORITATIVE_PLANS.find((p) => p.id === id);
}
exports.getAuthoritativePlanById = getAuthoritativePlanById;
/**
 * Find an authoritative plan by name (case-insensitive)
 */
function getAuthoritativePlanByName(name) {
    const norm = name.toLowerCase().trim();
    return exports.AUTHORITATIVE_PLANS.find((p) => p.name.toLowerCase() === norm ||
        p.displayName.toLowerCase() === norm ||
        p.name.toLowerCase().includes(norm) ||
        norm.includes(p.name.toLowerCase()));
}
exports.getAuthoritativePlanByName = getAuthoritativePlanByName;
/**
 * Formatted upgrade message for locked features
 */
function getUpgradeMessage(featureLabel, requiredTier) {
    const plan = getAuthoritativePlanByName(requiredTier) || exports.AUTHORITATIVE_PLANS[1];
    return {
        title: `${featureLabel} requires ${plan.displayName}`,
        description: `Upgrade to ${plan.displayName} to unlock ${featureLabel}, expand your operational capacity, and accelerate your business growth.`,
        recommendedTier: plan.name,
    };
}
exports.getUpgradeMessage = getUpgradeMessage;
