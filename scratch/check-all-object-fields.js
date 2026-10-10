// check-all-object-fields.js

const allListings = db.marketplaceListings.find({}).toArray();
const allProducts = db.Product.find({}).toArray();

function findObjectFields(docs, modelName) {
  const fields = {};
  docs.forEach(doc => {
    Object.keys(doc).forEach(key => {
      const val = doc[key];
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date) && !(val instanceof ObjectId)) {
        if (val.high !== undefined && val.low !== undefined) {
          fields[key] = (fields[key] || 0) + 1;
        }
      }
    });
  });
  console.log(`=== ${modelName} Fields with { high, low } ===`);
  console.log(JSON.stringify(fields, null, 2));
}

findObjectFields(allListings, "marketplaceListings");
findObjectFields(allProducts, "Product");
