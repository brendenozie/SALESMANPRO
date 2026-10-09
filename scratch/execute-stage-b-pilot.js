
const db = db.getSiblingDB("salesmanprodb");

print("=================================================");
print("STAGE B PILOT EXECUTION: CATALOG CORRECTION & ACTIVATION");
print("Timestamp: " + new Date().toISOString());
print("=================================================\n");

// 1. Enforce strict ownership boundary
const targetUser = db.User.findOne({ email: "brendenozie@gmail.com" });
if (!targetUser) {
  throw new Error("ABORT: Target user brendenozie@gmail.com not found!");
}
const targetUserId = targetUser._id.toString();

const ownedCompanies = db.Company.find({
  $or: [
    { userId: targetUser._id },
    { ownerId: targetUser._id },
    { createdBy: targetUser._id }
  ]
}).toArray();

const ownedCompIdSet = new Set(ownedCompanies.map(c => c._id.toString()));
print("Verified owned companies for brendenozie@gmail.com: " + ownedCompIdSet.size);

function assertOwned(companyId, recordDesc) {
  if (!companyId || !ownedCompIdSet.has(companyId.toString())) {
    throw new Error("SECURITY VIOLATION: Attempted mutation on non-owned store " + companyId + " for " + recordDesc);
  }
}

const auditLog = [];

function logAction(action, target, id, before, after) {
  auditLog.push({
    timestamp: new Date().toISOString(),
    action,
    target,
    id: id.toString(),
    before,
    after
  });
  print("OK: [" + action + "] " + target + " " + id + " -> updated successfully.");
}

// -------------------------------------------------------------
// BATCH 1: Fix Known Brand & Metadata Errors (Section 8)
// -------------------------------------------------------------
print("\n--- BATCH 1: BRAND & METADATA CORRECTIONS ---");

// 1.1 Tronic Cable: fix Asus brand, fix Wearables subcat, link canonical category
const tronicListing = db.marketplaceListings.findOne({ _id: ObjectId("6a2a7518b03b6fad88aa5e42") });
if (tronicListing) {
  assertOwned(tronicListing.companyId, "Tronic Cable listing");
  const before = {
    brand: tronicListing.brand,
    subCategoryName: tronicListing.subCategoryName,
    productCategoryId: tronicListing.productCategoryId ? tronicListing.productCategoryId.toString() : null
  };
  
  db.marketplaceListings.updateOne(
    { _id: tronicListing._id },
    {
      $set: {
        brand: "Tronic",
        subCategoryName: "Electricals & Wiring",
        productCategoryId: ObjectId("63f7c9e2d91b1b2a5e80b005"), // Electronics
        category: "Electronics",
        updatedAt: new Date()
      }
    }
  );
  logAction("CORRECT_BRAND_METADATA", "marketplaceListings", tronicListing._id, before, {
    brand: "Tronic",
    subCategoryName: "Electricals & Wiring",
    productCategoryId: "63f7c9e2d91b1b2a5e80b005",
    category: "Electronics"
  });

  // Also update parent Product
  if (tronicListing.productId) {
    const tronicProd = db.Product.findOne({ _id: tronicListing.productId });
    if (tronicProd) {
      assertOwned(tronicProd.companyId, "Tronic Cable product");
      db.Product.updateOne(
        { _id: tronicProd._id },
        {
          $set: {
            brand: "Tronic",
            subCategoryName: "Electricals & Wiring",
            productCategoryId: ObjectId("63f7c9e2d91b1b2a5e80b005"),
            category: "Electronics",
            updatedAt: new Date()
          }
        }
      );
      logAction("CORRECT_BRAND_METADATA", "Product", tronicProd._id, { brand: tronicProd.brand }, { brand: "Tronic" });
    }
  }
}

// 1.2 Life Skills Course in Public Speaking: remove "Apple" brand, set canonical Digital Goods
const lifeSkillsListing = db.marketplaceListings.findOne({ _id: ObjectId("690084dca2172b890cd8f61b") });
if (lifeSkillsListing) {
  assertOwned(lifeSkillsListing.companyId, "Life Skills Course listing");
  const before = {
    brand: lifeSkillsListing.brand,
    productCategoryId: lifeSkillsListing.productCategoryId ? lifeSkillsListing.productCategoryId.toString() : null
  };
  
  db.marketplaceListings.updateOne(
    { _id: lifeSkillsListing._id },
    {
      $set: {
        brand: null,
        subCategoryName: "Personal Development & Coaching",
        productCategoryId: ObjectId("d1f2e3c4b5a6978877665544"), // Digital Goods & Subscriptions
        category: "Digital Goods & Subscriptions",
        updatedAt: new Date()
      }
    }
  );
  logAction("CORRECT_BRAND_METADATA", "marketplaceListings", lifeSkillsListing._id, before, {
    brand: null,
    subCategoryName: "Personal Development & Coaching",
    productCategoryId: "d1f2e3c4b5a6978877665544"
  });
}

// 1.3 Sample Programs book in Executive Coach: remove "Sample", remove Coursera brand
const sampleBookListing = db.marketplaceListings.findOne({ _id: ObjectId("68fbf52b584c118332856acf") });
if (sampleBookListing) {
  assertOwned(sampleBookListing.companyId, "Sample book listing");
  const before = {
    name: sampleBookListing.name,
    brand: sampleBookListing.brand,
    productCategoryId: sampleBookListing.productCategoryId ? sampleBookListing.productCategoryId.toString() : null
  };
  
  db.marketplaceListings.updateOne(
    { _id: sampleBookListing._id },
    {
      $set: {
        name: "Executive Coaching & Life Skills Program Guide",
        brand: null,
        subCategoryName: "E-books & Guides",
        productCategoryId: ObjectId("d1f2e3c4b5a6978877665544"), // Digital Goods & Subscriptions
        category: "Digital Goods & Subscriptions",
        updatedAt: new Date()
      }
    }
  );
  logAction("CORRECT_METADATA", "marketplaceListings", sampleBookListing._id, before, {
    name: "Executive Coaching & Life Skills Program Guide",
    brand: null,
    subCategoryName: "E-books & Guides"
  });
}

// -------------------------------------------------------------
// BATCH 2: Correct Mismatched Imagery in Duka Yangu (Section 5)
// -------------------------------------------------------------
print("\n--- BATCH 2: IMAGERY CORRECTIONS & UNPUBLISHING IN DUKA YANGU ---");

// 2.1 Leather Tent (687ae1d3990c2854fe8bcdd2): Replace chair image with genuine tent images from Product
const tentListing = db.marketplaceListings.findOne({ _id: ObjectId("687ae1d3990c2854fe8bcdd2") });
if (tentListing) {
  assertOwned(tentListing.companyId, "Leather tent listing");
  const tentProd = db.Product.findOne({ _id: tentListing.productId });
  if (tentProd && tentProd.images && tentProd.images.length > 0) {
    const realImages = tentProd.images.map(img => typeof img === 'string' ? img : img.url);
    const beforeImages = tentListing.images;
    db.marketplaceListings.updateOne(
      { _id: tentListing._id },
      {
        $set: {
          images: realImages,
          productCategoryId: ObjectId("676bb5ed0de34d386c10d928"), // Toys
          category: "Toys",
          subCategoryName: "Outdoor & Camping Toys",
          updatedAt: new Date()
        }
      }
    );
    logAction("REPLACE_PRODUCT_IMAGES", "marketplaceListings", tentListing._id, { count: beforeImages.length }, { count: realImages.length, sample: realImages[0] });
  }
}

// 2.2 Biscuit (68e17a8016ac60978dc272ed): Replace chair image with genuine biscuit images from Product
const biscuitListing = db.marketplaceListings.findOne({ _id: ObjectId("68e17a8016ac60978dc272ed") });
if (biscuitListing) {
  assertOwned(biscuitListing.companyId, "Biscuit listing");
  const biscuitProd = db.Product.findOne({ _id: biscuitListing.productId });
  if (biscuitProd && biscuitProd.images && biscuitProd.images.length > 0) {
    const realImages = biscuitProd.images.map(img => typeof img === 'string' ? img : img.url);
    const beforeImages = biscuitListing.images;
    db.marketplaceListings.updateOne(
      { _id: biscuitListing._id },
      {
        $set: {
          images: realImages,
          productCategoryId: ObjectId("69a28ae60a4cb4fcefbabc69"), // Groceries Store
          category: "Groceries",
          subCategoryName: "Biscuits & Confectionery",
          updatedAt: new Date()
        }
      }
    );
    logAction("REPLACE_PRODUCT_IMAGES", "marketplaceListings", biscuitListing._id, { count: beforeImages.length }, { count: realImages.length, sample: realImages[0] });
  }
}

// 2.3 Fake Teeth (68dbfaccead1b2af584e8cda): Replace chair image with genuine teeth image from Product
const teethListing = db.marketplaceListings.findOne({ _id: ObjectId("68dbfaccead1b2af584e8cda") });
if (teethListing) {
  assertOwned(teethListing.companyId, "Fake teeth listing");
  const teethProd = db.Product.findOne({ _id: teethListing.productId });
  if (teethProd && teethProd.images && teethProd.images.length > 0) {
    const realImages = teethProd.images.map(img => typeof img === 'string' ? img : img.url);
    const beforeImages = teethListing.images;
    db.marketplaceListings.updateOne(
      { _id: teethListing._id },
      {
        $set: {
          images: realImages,
          productCategoryId: ObjectId("78887de958a4a3296990add4"), // Baby Toys
          category: "Baby Toys",
          subCategoryName: "Novelty & Gag Toys",
          updatedAt: new Date()
        }
      }
    );
    logAction("REPLACE_PRODUCT_IMAGES", "marketplaceListings", teethListing._id, { count: beforeImages.length }, { count: realImages.length, sample: realImages[0] });
  }
}

// 2.4 Arm Chair (68e17a9116ac60978dc272ee): Chair image is valid. Populate canonical categories and link product.
const chairListing = db.marketplaceListings.findOne({ _id: ObjectId("68e17a9116ac60978dc272ee") });
if (chairListing) {
  assertOwned(chairListing.companyId, "Arm Chair listing");
  db.marketplaceListings.updateOne(
    { _id: chairListing._id },
    {
      $set: {
        productCategoryId: ObjectId("93e002c712ad248bb0ade334"), // Furniture
        category: "Furniture",
        subCategoryName: "Chairs & Seating",
        updatedAt: new Date()
      }
    }
  );
  logAction("VALIDATE_CATEGORY", "marketplaceListings", chairListing._id, {}, { category: "Furniture", subCategoryName: "Chairs & Seating" });
}

// 2.5 Unpublish / Hide remaining listings sharing chair image without product imagery
const unpublishIds = [
  ObjectId("68e17abb16ac60978dc272ef"), // Bose By Design
  ObjectId("68e17ae416ac60978dc272f0"), // Bata 1
  ObjectId("68e17af116ac60978dc272f1"), // Jambotron Toy
  ObjectId("68e17afe16ac60978dc272f2"), // Savannah Space
  ObjectId("68e17b2f16ac60978dc272f3"), // Bose and Bass
  ObjectId("68ef880790cac14a0f2897a9")  // Duplicate Biscuit
];

unpublishIds.forEach(uid => {
  const item = db.marketplaceListings.findOne({ _id: uid });
  if (item) {
    assertOwned(item.companyId, "Unpublishing item " + uid);
    const before = { showOnGhuba: item.showOnGhuba, isAvailable: item.isAvailable };
    db.marketplaceListings.updateOne(
      { _id: item._id },
      {
        $set: {
          showOnGhuba: false,
          isAvailable: false,
          updatedAt: new Date()
        }
      }
    );
    logAction("UNPUBLISH_PENDING_MERCHANT_IMAGES", "marketplaceListings", item._id, before, { showOnGhuba: false, isAvailable: false });
  }
});

// -------------------------------------------------------------
// BATCH 3: Store Activations & Relationship Verifications
// -------------------------------------------------------------
print("\n--- BATCH 3: STORE ACTIVATIONS (Shoes Store, Agrovet, Duka Yangu Salad) ---");

// 3.1 Nike Shoes in Shoes Store (68b597b7de9bdd2ba7479f34)
const nikeListing = db.marketplaceListings.findOne({ _id: ObjectId("6903c66bf62463ff473b34c6") });
if (nikeListing) {
  assertOwned(nikeListing.companyId, "Nike shoes listing");
  db.marketplaceListings.updateOne(
    { _id: nikeListing._id },
    {
      $set: {
        productCategoryId: ObjectId("93e002c712ad248bb0ade319"), // Fashion
        category: "Fashion",
        subCategoryName: "Shoes",
        brand: "Nike",
        updatedAt: new Date()
      }
    }
  );
  if (nikeListing.productId) {
    db.Product.updateOne(
      { _id: nikeListing.productId },
      {
        $set: {
          productCategoryId: ObjectId("93e002c712ad248bb0ade319"),
          category: "Fashion",
          subCategoryName: "Shoes",
          brand: "Nike",
          updatedAt: new Date()
        }
      }
    );
  }
  logAction("ACTIVATE_RELATIONSHIPS", "marketplaceListings", nikeListing._id, {}, { category: "Fashion", brand: "Nike", subCategoryName: "Shoes" });
}

// 3.2 DAP Fertilizer in Agrovet (699c7f464d23c222dcedfa12)
const dapListing = db.marketplaceListings.findOne({ _id: ObjectId("6a2be7f01642861cd4ad660d") });
if (dapListing) {
  assertOwned(dapListing.companyId, "DAP Fertilizer listing");
  const dapProd = db.Product.findOne({ _id: dapListing.productId });
  const dapImages = (dapProd && dapProd.images && dapProd.images.length > 0)
    ? dapProd.images.map(img => typeof img === 'string' ? img : img.url)
    : dapListing.images;
    
  db.marketplaceListings.updateOne(
    { _id: dapListing._id },
    {
      $set: {
        name: "DAP Fertilizer 50kg",
        productCategoryId: ObjectId("64a8c9e2d91b1b2a5e80c101"), // Agrovet
        category: "Agrovet",
        subCategoryName: "Fertilizers",
        images: dapImages,
        showOnGhuba: true,
        isAvailable: true,
        updatedAt: new Date()
      }
    }
  );
  logAction("ACTIVATE_LISTING", "marketplaceListings", dapListing._id, {}, {
    name: "DAP Fertilizer 50kg",
    category: "Agrovet",
    showOnGhuba: true,
    isAvailable: true
  });
}

// 3.3 Salad 2 in Duka Yangu (6825c2c7969ab9f16f620f67)
const saladListing = db.marketplaceListings.findOne({ _id: ObjectId("6928480726d014ca98b8d7d4") });
if (saladListing) {
  assertOwned(saladListing.companyId, "Salad 2 listing");
  db.marketplaceListings.updateOne(
    { _id: saladListing._id },
    {
      $set: {
        productCategoryId: ObjectId("69a28ae60a4cb4fcefbabc69"), // Groceries Store
        category: "Groceries",
        subCategoryName: "Fresh Produce & Salads",
        showOnGhuba: true,
        isAvailable: true,
        updatedAt: new Date()
      }
    }
  );
  logAction("ACTIVATE_LISTING", "marketplaceListings", saladListing._id, {}, {
    category: "Groceries",
    subCategoryName: "Fresh Produce & Salads",
    showOnGhuba: true,
    isAvailable: true
  });
}

// 3.4 Fish Fry in Restaurant & Food Delivery (683581bba1bdf6ca3624b532)
const fishListing = db.marketplaceListings.findOne({ _id: ObjectId("6884b2b6eb9bffc4afd0a22f") });
if (fishListing) {
  assertOwned(fishListing.companyId, "Fish Fry listing");
  db.marketplaceListings.updateOne(
    { _id: fishListing._id },
    {
      $set: {
        productCategoryId: ObjectId("000000000000000000070001"), // Restaurant & Food Delivery
        category: "Restaurant & Food Delivery",
        subCategoryName: "Mains & Seafood",
        updatedAt: new Date()
      }
    }
  );
  logAction("CORRECT_RESTAURANT_CATEGORY", "marketplaceListings", fishListing._id, {}, {
    category: "Restaurant & Food Delivery",
    subCategoryName: "Mains & Seafood"
  });
}

// 3.5 Awesome Apartments in Real Estate (683581bba1bdf6ca3624b534)
const aptListing = db.marketplaceListings.findOne({ _id: ObjectId("6889c23b24f9f89a608b48fb") });
if (aptListing) {
  assertOwned(aptListing.companyId, "Awesome Apartments listing");
  db.marketplaceListings.updateOne(
    { _id: aptListing._id },
    {
      $set: {
        productCategoryId: ObjectId("93e002c712ad248bb0ade320"), // Property
        category: "Property",
        subCategoryName: "Apartments",
        updatedAt: new Date()
      }
    }
  );
  logAction("VALIDATE_PROPERTY_CATEGORY", "marketplaceListings", aptListing._id, {}, {
    category: "Property",
    subCategoryName: "Apartments"
  });
}

print("\n--- AUDIT SUMMARY ---");
print("Total logged pilot actions: " + auditLog.length);
print("Writing audit log to /var/www/salesmanpro/population_execution_audit.json...");

// Output audit log for host capture
print("--- BEGIN PILOT AUDIT LOG ---");
print(JSON.stringify(auditLog));
print("--- END PILOT AUDIT LOG ---");
