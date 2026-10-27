/**
 * scratch/test-ghuba-variant-mapping.ts
 *
 * Unit tests verifying that Ghuba seller categories deterministically map
 * to SalesmanPro E-commerce variants, templates, and site layouts.
 */

import { resolveGhubaStoreVariant } from "../lib/ghuba-store-mapper";
import { resolveCanonicalTemplate } from "../lib/website-builder/template-registry";
import { getComponentNameForCategory } from "../components/site/layouts/siteBodyComponentMap";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log("\n=== Test Suite 1: resolveGhubaStoreVariant ===");
{
  const fashion = resolveGhubaStoreVariant("Fashion & Apparel");
  assert(fashion.variant === "fashion", `Fashion & Apparel -> variant: ${fashion.variant}`);
  assert(fashion.templateKey === "fashion@v1", `Fashion & Apparel -> template: ${fashion.templateKey}`);

  const shoes = resolveGhubaStoreVariant("Shoes & Footwear");
  assert(shoes.variant === "shoes-store", `Shoes & Footwear -> variant: ${shoes.variant}`);
  assert(shoes.templateKey === "ecommerce-shoes@v1", `Shoes & Footwear -> template: ${shoes.templateKey}`);

  const electronics = resolveGhubaStoreVariant("Electronics & Gadgets");
  assert(electronics.variant === "earphones-store", `Electronics & Gadgets -> variant: ${electronics.variant}`);

  const groceries = resolveGhubaStoreVariant("Food, Snacks & Groceries");
  assert(groceries.variant === "groceries-store", `Food, Snacks & Groceries -> variant: ${groceries.variant}`);

  const furniture = resolveGhubaStoreVariant("Home Decor & Furniture");
  assert(furniture.variant === "furniture-store", `Home Decor & Furniture -> variant: ${furniture.variant}`);

  const general = resolveGhubaStoreVariant("General Merchandise");
  assert(general.variant === "ecommerce", `General Merchandise -> variant: ${general.variant}`);
}

console.log("\n=== Test Suite 2: resolveCanonicalTemplate with Variant ===");
{
  const t1 = resolveCanonicalTemplate("E-commerce", "fashion");
  assert(t1.id === "fashion@v1", `E-commerce + fashion -> ${t1.id}`);

  const t2 = resolveCanonicalTemplate("E-commerce", "shoes-store");
  assert(t2.id === "ecommerce-shoes@v1", `E-commerce + shoes-store -> ${t2.id}`);

  const t3 = resolveCanonicalTemplate("E-commerce", "groceries-store");
  assert(t3.id === "ecommerce-groceries@v1", `E-commerce + groceries-store -> ${t3.id}`);

  const t4 = resolveCanonicalTemplate("E-commerce", "furniture-store");
  assert(t4.id === "furniture@v1", `E-commerce + furniture-store -> ${t4.id}`);
}

console.log("\n=== Test Suite 3: resolveCanonicalTemplate legacy fallback (missing variant) ===");
{
  const t1 = resolveCanonicalTemplate("Fashion & Apparel", null);
  assert(t1.id === "fashion@v1", `Fashion & Apparel without variant -> ${t1.id}`);

  const t2 = resolveCanonicalTemplate("Shoes & Footwear", null);
  assert(t2.id === "ecommerce-shoes@v1", `Shoes & Footwear without variant -> ${t2.id}`);

  const t3 = resolveCanonicalTemplate("Food, Snacks & Groceries", null);
  assert(t3.id === "ecommerce-groceries@v1", `Food, Snacks & Groceries without variant -> ${t3.id}`);
}

console.log("\n=== Test Suite 4: getComponentNameForCategory ===");
{
  const c1 = getComponentNameForCategory("E-commerce", "fashion");
  assert(c1 === "FashionSite", `E-commerce + fashion -> ${c1}`);

  const c2 = getComponentNameForCategory("Fashion & Apparel", "fashion");
  assert(c2 === "FashionSite", `Fashion & Apparel + fashion -> ${c2}`);

  const c3 = getComponentNameForCategory("Fashion & Apparel", undefined);
  assert(c3 === "FashionSite", `Fashion & Apparel + undefined -> ${c3}`);

  const c4 = getComponentNameForCategory("Shoes & Footwear", "shoes-store");
  assert(c4 === "EcommerceShoesSite", `Shoes & Footwear + shoes-store -> ${c4}`);

  const c5 = getComponentNameForCategory("Food, Snacks & Groceries", "groceries-store");
  assert(c5 === "EcommerceGroceriesSite", `Food, Snacks & Groceries + groceries-store -> ${c5}`);
}

console.log("\n🎉 ALL GHUBA VARIANT RESOLUTION TESTS PASSED SUCCESSFULLY!\n");
