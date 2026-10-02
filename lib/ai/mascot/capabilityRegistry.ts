/**
 * lib/ai/mascot/capabilityRegistry.ts
 *
 * Authoritative Machine-Readable Capability Registry for SalesmanPro AI Mascot.
 * Derived from CATEGORY_MENUS and SalesmanPro business domain models.
 *
 * Core Principle: The mascot can never perform an action outside of registered capabilities,
 * authorized roles, store categories, or server-side tenant boundaries.
 */

import { MascotCapability, MascotModule } from "./types";

export const MASCOT_CAPABILITY_REGISTRY: MascotCapability[] = [
  // =========================================================================
  // 1. PRODUCTS & CATALOG
  // =========================================================================
  {
    id: "products:view_catalog",
    module: "products",
    capability: "view_catalog",
    name: "Search & View Products",
    description: "Search products in store catalog, view pricing, categories, and availability.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "AGENT", "STAFF", "STAFF_MEMBER", "MODERATOR"],
    storeCategories: ["*"],
    requiredPermissions: ["products:read"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Show me our top selling products",
      "Search for Samsung phones in catalog",
      "Which products have no images or descriptions?",
    ],
    canonicalEndpoint: "/api/products",
  },
  {
    id: "products:create_product",
    module: "products",
    capability: "create_product",
    name: "Create Product",
    description: "Prepare and create a new product in the store's authoritative catalog.",
    actionType: "EXECUTE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["products:create"],
    requiresApproval: false,
    creditCost: 1.0,
    sensitive: false,
    suggestedPrompts: [
      "Add a new product called Nike Air Max for KES 8,500",
      "Create a new item in Electronics category",
    ],
    canonicalEndpoint: "/api/products",
  },
  {
    id: "products:update_product",
    module: "products",
    capability: "update_product",
    name: "Update Product Details",
    description: "Update product title, description, tags, category, or specifications.",
    actionType: "EXECUTE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["products:update"],
    requiresApproval: false,
    creditCost: 0.8,
    sensitive: false,
    suggestedPrompts: [
      "Update description for iPhone 15 Pro",
      "Change category of Leather Jacket to Outerwear",
    ],
    canonicalEndpoint: "/api/products",
  },
  {
    id: "products:delete_product",
    module: "products",
    capability: "delete_product",
    name: "Delete Product",
    description: "Remove or archive a product from the catalog (Destructive operation).",
    actionType: "EXECUTE",
    riskLevel: "DESTRUCTIVE",
    roles: ["ADMIN", "SUPER_ADMIN"],
    storeCategories: ["*"],
    requiredPermissions: ["products:delete"],
    requiresApproval: true,
    creditCost: 1.0,
    sensitive: true,
    suggestedPrompts: [
      "Archive discontinued product with SKU 4021",
    ],
    canonicalEndpoint: "/api/products",
  },

  // =========================================================================
  // 2. PRICING (Financial/Sensitive)
  // =========================================================================
  {
    id: "pricing:update_single_price",
    module: "pricing",
    capability: "update_single_price",
    name: "Change Product Price",
    description: "Update selling price or discount for an individual product.",
    actionType: "EXECUTE",
    riskLevel: "SENSITIVE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["pricing:update"],
    requiresApproval: true,
    creditCost: 1.0,
    sensitive: true,
    suggestedPrompts: [
      "Change price of Blue Leather Handbag to KES 4,500",
      "Set 10% discount on Nike running shoes",
    ],
    canonicalEndpoint: "/api/products",
  },
  {
    id: "pricing:bulk_price_adjustment",
    module: "pricing",
    capability: "bulk_price_adjustment",
    name: "Bulk Price Adjustment",
    description: "Adjust prices across a category or tag by fixed percentage or amount (Requires strict Human Approval).",
    actionType: "EXECUTE",
    riskLevel: "FINANCIAL",
    roles: ["ADMIN", "SUPER_ADMIN"],
    storeCategories: ["*"],
    requiredPermissions: ["pricing:bulk_update"],
    requiresApproval: true,
    creditCost: 2.0,
    sensitive: true,
    suggestedPrompts: [
      "Increase price of all products in electronics category by 5%",
      "Apply 15% holiday discount across all footwear items",
    ],
    canonicalEndpoint: "/api/products/bulk-price",
  },

  // =========================================================================
  // 3. INVENTORY & STOCK
  // =========================================================================
  {
    id: "inventory:check_stock_levels",
    module: "inventory",
    capability: "check_stock_levels",
    name: "Check Stock & Low Stock Items",
    description: "Inspect inventory quantities, reorder thresholds, and depleted stock items.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "AGENT", "STAFF", "STAFF_MEMBER"],
    storeCategories: ["*"],
    requiredPermissions: ["inventory:read"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Which products are low in stock?",
      "What items need restocking this week?",
      "Show me out of stock items in store",
    ],
    canonicalEndpoint: "/api/inventory",
  },
  {
    id: "inventory:adjust_stock_quantity",
    module: "inventory",
    capability: "adjust_stock_quantity",
    name: "Adjust Stock Quantity",
    description: "Update physical on-hand quantity or record stock arrival/replenishment.",
    actionType: "EXECUTE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF"],
    storeCategories: ["*"],
    requiredPermissions: ["inventory:update"],
    requiresApproval: false,
    creditCost: 0.8,
    sensitive: false,
    suggestedPrompts: [
      "Add 20 units of Blue Nike Shoes",
      "Restock 50 units of Organic Milk",
    ],
    canonicalEndpoint: "/api/inventory",
  },
  {
    id: "inventory:prepare_restock_order",
    module: "inventory",
    capability: "prepare_restock_order",
    name: "Prepare Supplier Purchase Order",
    description: "Draft purchase order for low-stock products to dispatch to suppliers.",
    actionType: "PREPARE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["inventory:reorder"],
    requiresApproval: false,
    creditCost: 1.0,
    sensitive: false,
    suggestedPrompts: [
      "Prepare restock purchase order for all low stock items",
      "Draft supplier order for electronics supplier",
    ],
    canonicalEndpoint: "/api/inventory/purchase-orders",
  },

  // =========================================================================
  // 4. ORDERS & SALES
  // =========================================================================
  {
    id: "orders:view_orders",
    module: "orders",
    capability: "view_orders",
    name: "View Orders & Sales Velocity",
    description: "Inspect customer orders, order fulfillment status, payment status, and dispatch tracking.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "AGENT", "STAFF", "STAFF_MEMBER"],
    storeCategories: ["*"],
    requiredPermissions: ["orders:read"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Show me today's orders and their status",
      "Are there any delayed or unfulfilled orders?",
      "Find order #ORD-1082",
    ],
    canonicalEndpoint: "/api/customerorders",
  },
  {
    id: "orders:update_order_status",
    module: "orders",
    capability: "update_order_status",
    name: "Update Order Fulfillment Status",
    description: "Mark order as Confirmed, Processing, Shipped, Delivered, or Cancelled.",
    actionType: "EXECUTE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF"],
    storeCategories: ["*"],
    requiredPermissions: ["orders:update"],
    requiresApproval: false,
    creditCost: 0.8,
    sensitive: false,
    suggestedPrompts: [
      "Mark order #ORD-1082 as Dispatched",
      "Update order status to Delivered",
    ],
    canonicalEndpoint: "/api/customerorders",
  },

  // =========================================================================
  // 5. FINANCE, INVOICES & REPORTS
  // =========================================================================
  {
    id: "finance:view_business_report",
    module: "finance",
    capability: "view_business_report",
    name: "Analyze Business & Financial Performance",
    description: "Explain store sales, revenue, gross profit, expenses, average order value, and period trends.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["reports:read"],
    requiresApproval: false,
    creditCost: 1.0,
    sensitive: false,
    suggestedPrompts: [
      "How did our store perform this month?",
      "Compare this week's revenue to last week",
      "Show me total sales and profit breakdown",
    ],
    canonicalEndpoint: "/api/analytics",
  },
  {
    id: "finance:prepare_invoice",
    module: "finance",
    capability: "prepare_invoice",
    name: "Prepare Customer Invoice",
    description: "Draft a formal commercial invoice with line items, tax, and payment instructions.",
    actionType: "PREPARE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "AGENT"],
    storeCategories: ["*"],
    requiredPermissions: ["invoices:create"],
    requiresApproval: false,
    creditCost: 1.0,
    sensitive: false,
    suggestedPrompts: [
      "Prepare an invoice for James Kimani for 5 Nike Shoes",
      "Draft invoice for recent bulk order",
    ],
    canonicalEndpoint: "/api/documents/invoice",
  },
  {
    id: "finance:record_expense",
    module: "finance",
    capability: "record_expense",
    name: "Record Business Expense",
    description: "Log operational expenditures, utility bills, inventory freight, or supplies into accounting.",
    actionType: "EXECUTE",
    riskLevel: "FINANCIAL",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["finance:create"],
    requiresApproval: true,
    creditCost: 1.0,
    sensitive: true,
    suggestedPrompts: [
      "Record an expense of KES 12,000 for shop electricity bill",
      "Log KES 5,500 delivery motorbike fuel expense",
    ],
    canonicalEndpoint: "/api/finance/expense",
  },

  // =========================================================================
  // 6. MESSAGING & EXTERNAL COMMUNICATION (Approval Mandatory)
  // =========================================================================
  {
    id: "messaging:draft_whatsapp_message",
    module: "messaging",
    capability: "draft_whatsapp_message",
    name: "Draft WhatsApp Customer Message",
    description: "Prepare personalized WhatsApp message for order confirmation, arrival notice, or follow up.",
    actionType: "PREPARE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "AGENT"],
    storeCategories: ["*"],
    requiredPermissions: ["whatsapp:draft"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Draft a WhatsApp message to customer telling them their order is ready for pickup",
      "Prepare a message for abandoned cart follow-up",
    ],
    canonicalEndpoint: "/api/whatsapp/templates",
  },
  {
    id: "messaging:send_whatsapp_message",
    module: "messaging",
    capability: "send_whatsapp_message",
    name: "Send WhatsApp Customer Message",
    description: "Dispatch WhatsApp communication to customer (Requires Human Approval before dispatch).",
    actionType: "EXECUTE",
    riskLevel: "EXTERNAL_COMMUNICATION",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["whatsapp:send"],
    requiresApproval: true,
    creditCost: 1.5,
    sensitive: true,
    suggestedPrompts: [
      "Send WhatsApp notification to James that his package is with the courier",
    ],
    canonicalEndpoint: "/api/whatsapp/messages",
  },
  {
    id: "messaging:send_email_broadcast",
    module: "messaging",
    capability: "send_email_broadcast",
    name: "Send Email Customer Broadcast",
    description: "Broadcast an announcement or promotional email to registered store customers.",
    actionType: "EXECUTE",
    riskLevel: "EXTERNAL_COMMUNICATION",
    roles: ["ADMIN", "SUPER_ADMIN"],
    storeCategories: ["*"],
    requiredPermissions: ["email:broadcast"],
    requiresApproval: true,
    creditCost: 2.0,
    sensitive: true,
    suggestedPrompts: [
      "Send promotional email broadcast about our 20% weekend sale",
    ],
    canonicalEndpoint: "/api/marketing/email-broadcast",
  },

  // =========================================================================
  // 7. MARKETING & ADVERTISING (Financial/Budget Impact)
  // =========================================================================
  {
    id: "marketing:plan_ad_campaign",
    module: "marketing",
    capability: "plan_ad_campaign",
    name: "Plan Ad Campaign",
    description: "Draft digital ad campaign objectives, target audience, ad copy, and suggested channels.",
    actionType: "PREPARE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["marketing:plan"],
    requiresApproval: false,
    creditCost: 1.0,
    sensitive: false,
    suggestedPrompts: [
      "Create a marketing campaign for our new shoes collection",
      "Plan a Facebook and Instagram promotion for Valentine's week",
    ],
    canonicalEndpoint: "/api/ads/campaigns",
  },
  {
    id: "marketing:launch_ad_campaign",
    module: "marketing",
    capability: "launch_ad_campaign",
    name: "Launch Ad Campaign with Budget",
    description: "Authorize and launch an ad campaign committing real marketing spend (Requires Human Approval).",
    actionType: "EXECUTE",
    riskLevel: "MARKETING",
    roles: ["ADMIN", "SUPER_ADMIN"],
    storeCategories: ["*"],
    requiredPermissions: ["marketing:spend"],
    requiresApproval: true,
    creditCost: 2.5,
    sensitive: true,
    suggestedPrompts: [
      "Launch the prepared shoe campaign with KES 10,000 budget",
    ],
    canonicalEndpoint: "/api/ads/campaigns/launch",
  },
  {
    id: "marketing:create_social_post",
    module: "marketing",
    capability: "create_social_post",
    name: "Draft Social Media Content",
    description: "Draft engaging posts and captions for connected Instagram, Facebook, and TikTok pages.",
    actionType: "PREPARE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["social:draft"],
    requiresApproval: false,
    creditCost: 0.8,
    sensitive: false,
    suggestedPrompts: [
      "Create a Facebook post promoting our weekend special offer",
      "Write 3 Instagram captions for our new luxury watch lineup",
    ],
    canonicalEndpoint: "/api/social/posts",
  },

  // =========================================================================
  // 8. MARKETPLACE & GHUBA INTEGRATION
  // =========================================================================
  {
    id: "marketplace:view_ghuba_sync_status",
    module: "marketplace",
    capability: "view_ghuba_sync_status",
    name: "View Ghuba Marketplace Listings",
    description: "Inspect products currently published to Ghuba marketplace vs store catalog.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["Retail", "E-commerce", "Fashion Shop", "Electronics", "Groceries", "Automotive", "*"],
    requiredPermissions: ["marketplace:read"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Which store products are not yet listed on Ghuba?",
      "Show me our active Ghuba marketplace listings",
    ],
    canonicalEndpoint: "/api/marketplace",
  },
  {
    id: "marketplace:publish_listings",
    module: "marketplace",
    capability: "publish_listings",
    name: "Publish Products to Ghuba Marketplace",
    description: "Sync and publish store products to public Ghuba marketplace (Requires Human Approval).",
    actionType: "EXECUTE",
    riskLevel: "SENSITIVE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN"],
    storeCategories: ["Retail", "E-commerce", "Fashion Shop", "Electronics", "Groceries", "Automotive", "*"],
    requiredPermissions: ["marketplace:publish"],
    requiresApproval: true,
    creditCost: 1.5,
    sensitive: true,
    suggestedPrompts: [
      "Publish all in-stock electronics products to Ghuba marketplace",
      "List Samsung Galaxy A56 on Ghuba",
    ],
    canonicalEndpoint: "/api/marketplace/publish",
  },

  // =========================================================================
  // 9. EDUCATION & SCHOOL MODULE (Strict School Category Isolation)
  // =========================================================================
  {
    id: "education:view_student_records",
    module: "education",
    capability: "view_student_records",
    name: "View Student Roster & Academic Records",
    description: "Inspect students, enrolled classes, attendance logs, and academic standing.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "HEADTEACHER", "PRINCIPAL", "SCHOOL_HEAD", "EDUCATOR", "TEACHER"],
    storeCategories: ["School", "Schools", "Educational & Online Courses", "Tutors", "Students"],
    requiredPermissions: ["school:read"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Show me students in Grade 7 needing academic attention",
      "List all registered students in Class 4 East",
      "Check student attendance summary for this week",
    ],
    canonicalEndpoint: "/api/student",
  },
  {
    id: "education:generate_student_report",
    module: "education",
    capability: "generate_student_report",
    name: "Generate Student Performance Report",
    description: "Compile academic report cards, grading metrics, teacher comments, and GPA trends.",
    actionType: "PREPARE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "HEADTEACHER", "PRINCIPAL", "SCHOOL_HEAD", "EDUCATOR", "TEACHER"],
    storeCategories: ["School", "Schools", "Educational & Online Courses", "Tutors", "Students"],
    requiredPermissions: ["school:reports"],
    requiresApproval: false,
    creditCost: 1.0,
    sensitive: false,
    suggestedPrompts: [
      "Prepare end of term performance report for Form 3 Blue",
      "Generate academic report card for student David Mutua",
    ],
    canonicalEndpoint: "/api/student/reports",
  },
  {
    id: "education:send_parent_report",
    module: "education",
    capability: "send_parent_report",
    name: "Dispatch Parent Academic Communication",
    description: "Send approved exam results or term report card to parents via WhatsApp or Email (Requires Approval).",
    actionType: "EXECUTE",
    riskLevel: "EXTERNAL_COMMUNICATION",
    roles: ["ADMIN", "SUPER_ADMIN", "HEADTEACHER", "PRINCIPAL", "SCHOOL_HEAD"],
    storeCategories: ["School", "Schools", "Educational & Online Courses"],
    requiredPermissions: ["school:send_reports"],
    requiresApproval: true,
    creditCost: 2.0,
    sensitive: true,
    suggestedPrompts: [
      "Send approved term reports to Form 3 parents",
      "Send parent notification regarding tomorrow's academic clinic",
    ],
    canonicalEndpoint: "/api/parent/send-reports",
  },

  // =========================================================================
  // 10. RESTAURANT & HOSPITALITY MODULE
  // =========================================================================
  {
    id: "restaurant:view_menu_and_kitchen",
    module: "restaurant",
    capability: "view_menu_and_kitchen",
    name: "Restaurant Menu & Kitchen Status",
    description: "Inspect dining menu availability, table orders, active kitchen tickets, and recipe food costs.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF"],
    storeCategories: ["Restaurant & Food Delivery", "Cake Store", "Hospitality"],
    requiredPermissions: ["restaurant:read"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "What dishes are currently 86'd or out of ingredients?",
      "Show active table orders in the dining room",
    ],
    canonicalEndpoint: "/api/restaurant/menu",
  },

  // =========================================================================
  // 11. PROPERTY & REAL ESTATE MODULE
  // =========================================================================
  {
    id: "property:view_property_listings",
    module: "property",
    capability: "view_property_listings",
    name: "Inspect Properties & Tenant Leases",
    description: "View real estate listings, occupancy rates, tenant maintenance requests, and rental arrears.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "AGENT"],
    storeCategories: ["Property", "Real Estate", "Property Management"],
    requiredPermissions: ["property:read"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Which rental units are vacant this month?",
      "Show outstanding tenant rent payments",
    ],
    canonicalEndpoint: "/api/properties",
  },

  // =========================================================================
  // 12. STAFF & WORKFORCE MANAGEMENT
  // =========================================================================
  {
    id: "staff:view_staff_roster",
    module: "staff",
    capability: "view_staff_roster",
    name: "View Staff Attendance & Roster",
    description: "Check working staff members, attendance clock-ins, shift assignments, and performance logs.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["staff:read"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Who is on duty today?",
      "Show me staff attendance records for this week",
    ],
    canonicalEndpoint: "/api/staff-attendance",
  },

  // =========================================================================
  // 13. PLATFORM SUPER-ADMIN MODE (Strict SuperAdmin Only)
  // =========================================================================
  {
    id: "system:view_platform_health",
    module: "system",
    capability: "view_platform_health",
    name: "SuperAdmin Platform Operations",
    description: "Inspect platform health, global AI credit consumption, active stores, and system queues.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["SUPER_ADMIN"],
    storeCategories: ["*"],
    requiredPermissions: ["platform:superadmin"],
    requiresApproval: false,
    creditCost: 0,
    sensitive: true,
    suggestedPrompts: [
      "Show platform-wide AI usage summary across tenants",
      "Inspect background worker queue status",
    ],
    canonicalEndpoint: "/api/super-admin/metrics",
  },

  // =========================================================================
  // 15. WEBSITE BUILDER & STOREFRONT MANAGEMENT
  // =========================================================================
  {
    id: "website:view_config",
    module: "website",
    capability: "view_config",
    name: "View Website Status & Theme",
    description: "Inspect active storefront theme, pages, sections, and draft status.",
    actionType: "READ",
    riskLevel: "SAFE_READ",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "AGENT", "STAFF"],
    storeCategories: ["*"],
    requiredPermissions: ["website:read"],
    requiresApproval: false,
    creditCost: 0.2,
    sensitive: false,
    suggestedPrompts: [
      "What theme is currently active on my store?",
      "Show my website pages and sections",
      "Do I have unpublished draft changes?",
    ],
    canonicalEndpoint: "/api/website-builder",
  },
  {
    id: "website:update_theme",
    module: "website",
    capability: "update_theme",
    name: "Update Theme Colors & Fonts",
    description: "Modify primary/secondary colors or typography across the storefront theme draft.",
    actionType: "EXECUTE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["website:update"],
    requiresApproval: false,
    creditCost: 0.8,
    sensitive: false,
    suggestedPrompts: [
      "Change my theme primary color to emerald green",
      "Update heading font to Playfair Display",
    ],
    canonicalEndpoint: "/api/website-builder",
  },
  {
    id: "website:update_section",
    module: "website",
    capability: "update_section",
    name: "Update Website Section Content",
    description: "Update text, banner headline, eyebrow, CTA, or content for a homepage or subpage section in the draft.",
    actionType: "EXECUTE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["website:update"],
    requiresApproval: false,
    creditCost: 1.0,
    sensitive: false,
    suggestedPrompts: [
      "Update my homepage hero headline to 'Spring Collection 2026'",
      "Change the call to action button to 'Shop Now'",
    ],
    canonicalEndpoint: "/api/website-builder",
  },
  {
    id: "website:reorder_sections",
    module: "website",
    capability: "reorder_sections",
    name: "Reorder & Toggle Sections",
    description: "Change section ordering or visibility on a website page.",
    actionType: "EXECUTE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["website:update"],
    requiresApproval: false,
    creditCost: 0.5,
    sensitive: false,
    suggestedPrompts: [
      "Move testimonials section below product grid",
      "Hide the promotional countdown section",
    ],
    canonicalEndpoint: "/api/website-builder",
  },
  {
    id: "website:generate_content",
    module: "website",
    capability: "generate_content",
    name: "Generate Storefront Copy & SEO",
    description: "Generate AI-tailored marketing headlines, about-us stories, or SEO metadata.",
    actionType: "PREPARE",
    riskLevel: "SAFE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    storeCategories: ["*"],
    requiredPermissions: ["website:update"],
    requiresApproval: false,
    creditCost: 1.0,
    sensitive: false,
    suggestedPrompts: [
      "Generate an engaging About Us story for my boutique",
      "Suggest SEO title and meta description for my homepage",
    ],
    canonicalEndpoint: "/api/website-builder/ai",
  },
  {
    id: "website:publish_website",
    module: "website",
    capability: "publish_website",
    name: "Publish Website Live",
    description: "Atomically publish draft changes to the public storefront and invalidate cache.",
    actionType: "EXECUTE",
    riskLevel: "SENSITIVE_WRITE",
    roles: ["ADMIN", "SUPER_ADMIN"],
    storeCategories: ["*"],
    requiredPermissions: ["website:publish"],
    requiresApproval: true,
    creditCost: 1.5,
    sensitive: true,
    suggestedPrompts: [
      "Publish all my website builder changes live",
    ],
    canonicalEndpoint: "/api/website-builder/publish",
  },
];

export class MascotCapabilityRegistry {
  public static getAllCapabilities(): MascotCapability[] {
    return MASCOT_CAPABILITY_REGISTRY;
  }

  public static getCapability(id: string): MascotCapability | undefined {
    return MASCOT_CAPABILITY_REGISTRY.find((c) => c.id === id);
  }

  /**
   * Filters capabilities permitted for a given user, role, category, and enabled modules.
   */
  public static getAuthorizedCapabilities(params: {
    userRole: string;
    storeCategory: string;
    enabledModules: string[];
    isSuperAdmin?: boolean;
    moduleToggles?: Record<MascotModule, boolean>;
    roleRestrictions?: Record<string, string[]>;
  }): MascotCapability[] {
    const {
      userRole,
      storeCategory,
      enabledModules,
      isSuperAdmin,
      moduleToggles,
      roleRestrictions,
    } = params;

    const normRole = (userRole || "USER").toUpperCase();
    const normCategory = (storeCategory || "E-commerce").toLowerCase();

    return MASCOT_CAPABILITY_REGISTRY.filter((cap) => {
      // 1. Super Admin bypasses normal role restriction only if capability allows SUPER_ADMIN
      if (isSuperAdmin) {
        return true;
      }

      // 2. Role Check: Capability must support the user's role
      const roleAllowed = cap.roles.includes(normRole) || cap.roles.includes("*");
      if (!roleAllowed) return false;

      // 3. Module Toggle Check: If admin disabled the entire module for mascot, block it
      if (moduleToggles && moduleToggles[cap.module] === false) {
        return false;
      }

      // 4. Role Restriction Override Check: If admin placed custom restriction on this role
      if (roleRestrictions && roleRestrictions[normRole]?.includes(cap.id)) {
        return false;
      }

      // 5. Category Relevance Check:
      // If capability requires specific store categories, verify match
      if (!cap.storeCategories.includes("*")) {
        const categoryMatches = cap.storeCategories.some((cat) => {
          const c = cat.toLowerCase();
          return normCategory.includes(c) || c.includes(normCategory);
        });
        if (!categoryMatches) return false;
      }

      // 6. Enabled Modules Check from store navigation / CATEGORY_MENUS
      if (enabledModules && enabledModules.length > 0) {
        const isModuleEnabled =
          enabledModules.includes(cap.module) ||
          enabledModules.includes("*") ||
          cap.module === "system";
        if (!isModuleEnabled) return false;
      }

      return true;
    });
  }
}
