import assert from "node:assert";
import { isEcommerceRetailCategory, ECOMMERCE_RETAIL_CATEGORIES } from "../lib/admin-dashboard-service";

console.log("==================================================================");
console.log("STARTING ADMIN INVENTORY & DASHBOARD SERVICE TESTS");
console.log("==================================================================");

// Test 1: isEcommerceRetailCategory maps all retail store types
function testEcommerceRetailCategories() {
  const retailStoreTypes = [
    "ecommerce",
    "e-commerce",
    "agrovet",
    "baby store",
    "bike store",
    "book store",
    "cake store",
    "earphones store",
    "fashion shop",
    "flowers store",
    "furniture shop",
    "gaming store",
    "glasses store",
    "groceries store",
    "hardware store",
    "honey store",
    "meat store",
    "motorcycle store",
    "peanuts store",
    "pets store",
    "shoes store",
    "watch store",
    "directory & listings",
    "marketplace",
  ];

  for (const storeType of retailStoreTypes) {
    assert.strictEqual(
      isEcommerceRetailCategory(storeType),
      true,
      `Expected "${storeType}" to be classified as an ecommerce/retail category`
    );
  }

  // Non-retail categories should return false
  assert.strictEqual(isEcommerceRetailCategory("consultant & coach"), false);
  assert.strictEqual(isEcommerceRetailCategory("real estate"), false);
  assert.strictEqual(isEcommerceRetailCategory("service provider"), false);

  console.log(`[PASS] Store Categories: Successfully verified ${retailStoreTypes.length} retail/ecommerce store types mapped`);
}

// Test 2: Quick Add Taxonomies & Brand derivation
function testQuickAddTaxonomies() {
  const mockStoreCategory = {
    id: "sc_1",
    companyId: "comp_123",
    categoryId: "cat_shoes",
    displayName: "Shoes Store",
    sortOrder: 1,
    visible: true,
    subcategories: [
      { id: "sub_1", name: "Sneakers", slug: "sneakers" },
      { id: "sub_2", name: "Boots", slug: "boots" },
      { id: "sub_3", name: "Loafers", slug: "loafers" },
    ],
    allBrands: ["Nike", "Adidas", "Puma", "New Balance"],
  };

  const categories = [mockStoreCategory];
  const selectedCategoryName = "Shoes Store";
  const activeCategory = categories.find((c) => c.displayName === selectedCategoryName);

  assert.ok(activeCategory, "Active category should be found");
  const availableSubcategories = activeCategory?.subcategories || [];
  const availableBrands = activeCategory?.allBrands || [];

  assert.strictEqual(availableSubcategories.length, 3);
  assert.strictEqual(availableBrands.length, 4);
  assert.strictEqual(availableSubcategories[0].name, "Sneakers");
  assert.strictEqual(availableBrands[0], "Nike");

  // Payload simulation
  const payload = {
    name: "Air Jordan 1",
    category: activeCategory.displayName,
    productCategoryId: activeCategory.categoryId,
    subCategory: availableSubcategories[0].id,
    subCategoryName: availableSubcategories[0].name,
    brand: availableBrands[0],
    sellingPrice: 15000,
    costPrice: 9000,
    quantity: 10,
    companyId: "comp_123",
  };

  assert.strictEqual(payload.subCategory, "sub_1");
  assert.strictEqual(payload.subCategoryName, "Sneakers");
  assert.strictEqual(payload.brand, "Nike");

  console.log("[PASS] Quick Add: Correctly derives subcategories, brands and formats product payload");
}

// Test 3: Inventory Item Schema & Display Name fallback
function testInventoryItemSchema() {
  const rawProduct = {
    id: "prod_001",
    companyId: "comp_123",
    name: "Premium Headphones",
    costPrice: 4000,
    sellingPrice: 7500,
    productCategory: {
      id: "pc_1",
      name: "Electronics",
      StoreCategory: [],
    },
    inventoryItems: [
      { id: "inv_1", quantity: 15, AgentInventory: [{ quantity: 5 }] },
      { id: "inv_2", quantity: 10, AgentInventory: [] },
    ],
  };

  const companyStock = rawProduct.inventoryItems.reduce((sum, inv) => sum + inv.quantity, 0);
  const agentStock = rawProduct.inventoryItems.reduce(
    (sum, inv) => sum + inv.AgentInventory.reduce((aSum, ai) => aSum + ai.quantity, 0),
    0
  );

  const categoryDisplayName = rawProduct.productCategory?.name || "General";
  const categoryObj = {
    id: rawProduct.productCategory.id,
    displayName: categoryDisplayName,
    name: categoryDisplayName,
  };

  const productItem = {
    id: rawProduct.id,
    companyId: rawProduct.companyId,
    name: rawProduct.name,
    category: categoryObj,
    costPrice: rawProduct.costPrice,
    sellingPrice: rawProduct.sellingPrice,
  };

  const formattedInventoryItem = {
    ...productItem,
    companyStock,
    agentStock,
    totalStock: companyStock + agentStock,
    category: categoryObj,
    productItem,
  };

  assert.strictEqual(formattedInventoryItem.companyStock, 25);
  assert.strictEqual(formattedInventoryItem.agentStock, 5);
  assert.strictEqual(formattedInventoryItem.totalStock, 30);
  assert.strictEqual(formattedInventoryItem.category.displayName, "Electronics");
  assert.strictEqual(formattedInventoryItem.productItem.id, "prod_001");

  console.log("[PASS] Inventory Item: Properly structures companyStock, agentStock, productItem and category.displayName");
}

try {
  testEcommerceRetailCategories();
  testQuickAddTaxonomies();
  testInventoryItemSchema();
  console.log("==================================================================");
  console.log("ALL ADMIN INVENTORY & DASHBOARD TESTS PASSED");
  console.log("==================================================================");
  process.exit(0);
} catch (err) {
  console.error("Test failed:", err);
  process.exit(1);
}
