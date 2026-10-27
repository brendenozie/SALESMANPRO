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
  assert(electronics.variant === "ecommerce", `Electronics & Gadgets -> variant: ${electronics.variant}`);
  assert(electronics.templateKey === "ecommerce-default@v1", `Electronics & Gadgets -> template: ${electronics.templateKey}`);

  const audio = resolveGhubaStoreVariant("Pro Audio & Earphones");
  assert(audio.variant === "earphones-store", `Pro Audio & Earphones -> variant: ${audio.variant}`);
  assert(audio.templateKey === "ecommerce-earphones@v1", `Pro Audio & Earphones -> template: ${audio.templateKey}`);

  const beauty = resolveGhubaStoreVariant("Beauty & Cosmetics");
  assert(beauty.variant === "ecommerce", `Beauty & Cosmetics -> variant: ${beauty.variant}`);
  assert(beauty.templateKey === "ecommerce-default@v1", `Beauty & Cosmetics -> template: ${beauty.templateKey}`);

  const auto = resolveGhubaStoreVariant("Automotive & Motor Accessories");
  assert(auto.variant === "automotive-store", `Automotive & Motor Accessories -> variant: ${auto.variant}`);
  assert(auto.templateKey === "ecommerce-accessories@v1", `Automotive & Motor Accessories -> template: ${auto.templateKey}`);

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

  const t5 = resolveCanonicalTemplate("E-commerce", "ecommerce");
  assert(t5.id === "ecommerce-default@v1", `E-commerce + ecommerce -> ${t5.id}`);

  const t6 = resolveCanonicalTemplate("E-commerce", "automotive-store");
  assert(t6.id === "ecommerce-accessories@v1", `E-commerce + automotive-store -> ${t6.id}`);
}

console.log("\n=== Test Suite 3: resolveCanonicalTemplate legacy fallback (missing variant) ===");
{
  const t1 = resolveCanonicalTemplate("Fashion & Apparel", null);
  assert(t1.id === "fashion@v1", `Fashion & Apparel without variant -> ${t1.id}`);

  const t2 = resolveCanonicalTemplate("Shoes & Footwear", null);
  assert(t2.id === "ecommerce-shoes@v1", `Shoes & Footwear without variant -> ${t2.id}`);

  const t3 = resolveCanonicalTemplate("Food, Snacks & Groceries", null);
  assert(t3.id === "ecommerce-groceries@v1", `Food, Snacks & Groceries without variant -> ${t3.id}`);

  const t4 = resolveCanonicalTemplate("Electronics & Gadgets", null);
  assert(t4.id === "ecommerce-default@v1", `Electronics & Gadgets without variant -> ${t4.id}`);
}

console.log("\n=== Test Suite 4: getComponentNameForCategory ===");
{
  const c1 = getComponentNameForCategory("E-commerce", "fashion");
  assert(c1 === "FashionSite", `E-commerce + fashion -> ${c1}`);

  const c2 = getComponentNameForCategory("Electronics & Gadgets", "ecommerce");
  assert(c2 === "EcommerceSite", `Electronics & Gadgets + ecommerce -> ${c2}`);

  const c3 = getComponentNameForCategory("Beauty & Cosmetics", "ecommerce");
  assert(c3 === "EcommerceSite", `Beauty & Cosmetics + ecommerce -> ${c3}`);

  const c4 = getComponentNameForCategory("Automotive & Motor Accessories", "automotive-store");
  assert(c4 === "EcommerceAccessoriesSite", `Automotive & Motor Accessories + automotive-store -> ${c4}`);

  const c5 = getComponentNameForCategory("Shoes & Footwear", "shoes-store");
  assert(c5 === "EcommerceShoesSite", `Shoes & Footwear + shoes-store -> ${c5}`);

  const c6 = getComponentNameForCategory("Food, Snacks & Groceries", "groceries-store");
  assert(c6 === "EcommerceGroceriesSite", `Food, Snacks & Groceries + groceries-store -> ${c6}`);
}

console.log("\n🎉 ALL GHUBA VARIANT RESOLUTION TESTS PASSED SUCCESSFULLY!\n");
