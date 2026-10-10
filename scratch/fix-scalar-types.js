// fix-scalar-types.js
// Normalizes { high, low, unsigned } Long representations into native scalar integers for Prisma compatibility

const intFields = [
  "quantity",
  "discount",
  "horsepower",
  "torque",
  "previousOwners",
  "year",
  "minimumHours",
  "totalCapacity",
  "currentBookedCount"
];

function extractIntValue(val, fieldName) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Math.round(val);
  if (typeof val === "object") {
    if (val.low !== undefined) {
      return Number(val.low);
    }
    if (typeof val.toNumber === "function") {
      return val.toNumber();
    }
    if (typeof val.toString === "function") {
      const parsed = parseInt(val.toString(), 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  if (typeof val === "string") {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

print("=== STARTING SCALAR TYPE NORMALIZATION IN SALESMANDB ===");
print("Timestamp: " + new Date().toISOString());

// 1. Check invariants before
const preProductCount = db.Product.countDocuments();
const preListingCount = db.marketplaceListings.countDocuments();
const preOrdersCount = db.CustomerOrder.countDocuments();
const preOrderItemsCount = db.OrderItem.countDocuments();

print(`Pre-check: Product: ${preProductCount}, Listings: ${preListingCount}, CustomerOrder: ${preOrdersCount}, OrderItem: ${preOrderItemsCount}`);

// 2. Fix marketplaceListings
let fixedListingFieldsCount = 0;
let modifiedListingsCount = 0;

db.marketplaceListings.find({}).forEach(doc => {
  const updateFields = {};
  let needsUpdate = false;

  intFields.forEach(field => {
    if (doc[field] !== undefined && doc[field] !== null) {
      const val = doc[field];
      if (typeof val === "object" && val.low !== undefined) {
        const intVal = extractIntValue(val, field);
        updateFields[field] = NumberInt(intVal !== null ? intVal : 0);
        needsUpdate = true;
        fixedListingFieldsCount++;
      }
    }
  });

  if (needsUpdate) {
    db.marketplaceListings.updateOne(
      { _id: doc._id },
      { $set: updateFields }
    );
    modifiedListingsCount++;
  }
});

print(`Updated ${modifiedListingsCount} documents in marketplaceListings (${fixedListingFieldsCount} fields converted to NumberInt).`);

// 3. Fix Product
let fixedProductFieldsCount = 0;
let modifiedProductsCount = 0;

db.Product.find({}).forEach(doc => {
  const updateFields = {};
  let needsUpdate = false;

  intFields.forEach(field => {
    if (doc[field] !== undefined && doc[field] !== null) {
      const val = doc[field];
      if (typeof val === "object" && val.low !== undefined) {
        const intVal = extractIntValue(val, field);
        updateFields[field] = NumberInt(intVal !== null ? intVal : 0);
        needsUpdate = true;
        fixedProductFieldsCount++;
      }
    }
  });

  if (needsUpdate) {
    db.Product.updateOne(
      { _id: doc._id },
      { $set: updateFields }
    );
    modifiedProductsCount++;
  }
});

print(`Updated ${modifiedProductsCount} documents in Product (${fixedProductFieldsCount} fields converted to NumberInt).`);

// 4. Invariant assertion
const postProductCount = db.Product.countDocuments();
const postListingCount = db.marketplaceListings.countDocuments();
const postOrdersCount = db.CustomerOrder.countDocuments();
const postOrderItemsCount = db.OrderItem.countDocuments();

print(`Post-check: Product: ${postProductCount}, Listings: ${postListingCount}, CustomerOrder: ${postOrdersCount}, OrderItem: ${postOrderItemsCount}`);

if (preProductCount !== postProductCount || preListingCount !== postListingCount || preOrdersCount !== postOrdersCount || preOrderItemsCount !== postOrderItemsCount) {
  throw new Error("FATAL: Collection count invariant violated!");
}

print("=== SCALAR TYPE NORMALIZATION COMPLETED SUCCESSFULLY ===");
