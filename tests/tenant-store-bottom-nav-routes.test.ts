import assert from "assert";
import fs from "fs";
import path from "path";
import { getStoreNavConfig } from "../components/search/TenantStoreBottomNav";

console.log("==================================================================");
console.log("STARTING TENANT STORE BOTTOM NAV ROUTE MAPPING VERIFICATION");
console.log("==================================================================");

// 1. Verify all 51 physical route directories under app/site/[slug] map 100% to valid directories & pages
const base = path.join(process.cwd(), "app", "site", "[slug]");
const physicalDirs = fs
  .readdirSync(base)
  .filter(
    (d) =>
      fs.statSync(path.join(base, d)).isDirectory() &&
      !d.startsWith("[") &&
      !["checkout", "dashboard", "feed", "track", "trackorder"].includes(d)
  );

console.log(`Auditing ${physicalDirs.length} physical storefront directory modules...`);

for (const dir of physicalDirs) {
  const config = getStoreNavConfig(dir);
  assert.strictEqual(
    config.basePath,
    dir,
    `Direct directory mapping mismatch: directory "${dir}" resolved to "${config.basePath}"`
  );

  const shopSubPath = config.shopPath || "products";
  const targetSubPath = path.join(base, dir, shopSubPath);
  assert.ok(
    fs.existsSync(targetSubPath),
    `Directory ${dir} has shopPath "${shopSubPath}" but path does not exist on disk: ${targetSubPath}`
  );
  console.log(`[PASS] Directory "${dir}" -> basePath: "${config.basePath}", shopPath: "${shopSubPath}", hasCart: ${config.hasCart}`);
}

// 2. Verify business category, variant, and alias resolution
const businessIntentTests = [
  // Restaurant variants
  { input: "restaurant", expectedBasePath: "restaurent", expectedCart: true },
  { input: "Restaurant & Food Delivery", expectedBasePath: "restaurent", expectedCart: true },
  { input: "food delivery", expectedBasePath: "restaurent", expectedCart: true },

  // Bookings variants
  { input: "barbershop", expectedBasePath: "bookings", expectedCart: true },
  { input: "barbershop store", expectedBasePath: "bookings", expectedCart: true },
  { input: "salon bookings", expectedBasePath: "bookings", expectedCart: true },
  { input: "drycleaning", expectedBasePath: "bookings", expectedCart: true },
  { input: "booking & appointments", expectedBasePath: "bookings", expectedCart: true },

  // Courses variants
  { input: "educational & online courses", expectedBasePath: "courses", expectedCart: true },
  { input: "online learning", expectedBasePath: "courses", expectedCart: true },

  // Real estate & Property management
  { input: "real estate", expectedBasePath: "realestate", expectedCart: false },
  { input: "property listings", expectedBasePath: "realestate", expectedCart: false },
  { input: "property management", expectedBasePath: "propertymanagement", expectedCart: false },

  // Automotive
  { input: "car dealership", expectedBasePath: "automotive", expectedCart: true },
  { input: "automotive store", expectedBasePath: "automotiveecommerce", expectedCart: true },

  // Specialized Ecommerce
  { input: "shoes store", expectedBasePath: "ecommerceshoes", expectedCart: true },
  { input: "cake store", expectedBasePath: "cakeecommerce", expectedCart: true },
  { input: "baby store", expectedBasePath: "babyecommerce", expectedCart: true },
  { input: "book store", expectedBasePath: "bookecommerce", expectedCart: true },
  { input: "bike store", expectedBasePath: "bikeecommerce", expectedCart: true },
  { input: "motorcycle store", expectedBasePath: "motorcycleecommerce", expectedCart: true },
  { input: "hardware store", expectedBasePath: "hardwareecommerce", expectedCart: true },
  { input: "gaming store", expectedBasePath: "gamingecommerce", expectedCart: true },
  { input: "glasses store", expectedBasePath: "glassesecommerce", expectedCart: true },
  { input: "flowers store", expectedBasePath: "flowersecommerce", expectedCart: true },
  { input: "honey store", expectedBasePath: "honeyecommerce", expectedCart: true },
  { input: "peanuts store", expectedBasePath: "peanutecommerce", expectedCart: true },
  { input: "pets store", expectedBasePath: "petsecommerce", expectedCart: true },
  { input: "watch store", expectedBasePath: "watchecommerce", expectedCart: true },
  { input: "groceries store", expectedBasePath: "groceriesecommerce", expectedCart: true },
  { input: "electronics store", expectedBasePath: "earphonesecommerce", expectedCart: true },
  { input: "modern meat store", expectedBasePath: "meatecommerce", expectedCart: true },
  { input: "agrovet store", expectedBasePath: "agrovetecommerce", expectedCart: true },
  { input: "modern fashion store", expectedBasePath: "fashionecommerce", expectedCart: true },
  { input: "modern furniture store", expectedBasePath: "furnitureecommerce", expectedCart: true },

  // Professional Services & Portfolios
  { input: "service provider", expectedBasePath: "service-provider", expectedCart: true },
  { input: "company portfolio", expectedBasePath: "companyprofile", expectedCart: true },
  { input: "company portfolio light", expectedBasePath: "companyprofilelight", expectedCart: true },
  { input: "consultant & coach", expectedBasePath: "consultant", expectedCart: true },
  { input: "creative cv", expectedBasePath: "portfolio", expectedCart: false },
  { input: "standard speaker site", expectedBasePath: "publicspeaking", expectedCart: false },

  // Healthcare, Fitness, Logistics, Events, Travel, Media, Nonprofit, SaaS, Blog
  { input: "healthcare & clinics", expectedBasePath: "healthcare", expectedCart: true },
  { input: "fitness & wellness", expectedBasePath: "fitness", expectedCart: true },
  { input: "delivery & logistics", expectedBasePath: "logistics", expectedCart: true },
  { input: "event & ticketing", expectedBasePath: "events", expectedCart: true },
  { input: "travel & tourism", expectedBasePath: "travel", expectedCart: true },
  { input: "finance & legal", expectedBasePath: "finance", expectedCart: false },
  { input: "media & entertainment", expectedBasePath: "media", expectedCart: false },
  { input: "nonprofit & community", expectedBasePath: "nonprofit", expectedCart: false },
  { input: "saas & web apps", expectedBasePath: "saas", expectedCart: false },
  { input: "blog & content", expectedBasePath: "blog", expectedCart: false },
  { input: "security services", expectedBasePath: "security", expectedCart: true },
  { input: "security consulting", expectedBasePath: "security2", expectedCart: true },
  { input: "directory & listings", expectedBasePath: "directory", expectedCart: false },
  { input: "directory listings", expectedBasePath: "directorylistings", expectedCart: false },
];

console.log(`\nVerifying ${businessIntentTests.length} business intent variations & canonical aliases...`);
for (const test of businessIntentTests) {
  const result = getStoreNavConfig(test.input);
  assert.strictEqual(
    result.basePath,
    test.expectedBasePath,
    `Intent "${test.input}" resolved to "${result.basePath}", expected "${test.expectedBasePath}"`
  );
  assert.strictEqual(
    result.hasCart,
    test.expectedCart,
    `Intent "${test.input}" hasCart resolved to ${result.hasCart}, expected ${test.expectedCart}`
  );
  console.log(`[PASS] Intent "${test.input}" -> basePath: "${result.basePath}", hasCart: ${result.hasCart}`);
}

console.log("\n==================================================================");
console.log("ALL STOREFRONT ROUTE & NAVIGATION CHECKS PASSED WITH 100% SUCCESS!");
console.log("==================================================================");
