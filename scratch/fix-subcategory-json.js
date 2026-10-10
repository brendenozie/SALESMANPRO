// fix-subcategory-json.js
const total = db.marketplaceListings.countDocuments();
const nullSubcat = db.marketplaceListings.countDocuments({
  $or: [
    { subCategory: null },
    { subCategory: { $exists: false } }
  ]
});

print(`Total listings: ${total}`);
print(`Listings with missing/null subCategory: ${nullSubcat}`);

if (nullSubcat > 0) {
  const res = db.marketplaceListings.updateMany(
    {
      $or: [
        { subCategory: null },
        { subCategory: { $exists: false } }
      ]
    },
    [
      {
        $set: {
          subCategory: {
            id: "gen",
            name: { $ifNull: ["$category", "General"] },
            slug: "general"
          },
          subCategoryName: { $ifNull: ["$category", "General"] }
        }
      }
    ]
  );
  print(`Updated ${res.modifiedCount} listings with valid subCategory object.`);
}

// Also check Product collection just to be clean
const nullProdSubcat = db.Product.countDocuments({
  $or: [
    { subCategory: null },
    { subCategory: { $exists: false } }
  ]
});
print(`Products with missing/null subCategory: ${nullProdSubcat}`);
if (nullProdSubcat > 0) {
  const resProd = db.Product.updateMany(
    {
      $or: [
        { subCategory: null },
        { subCategory: { $exists: false } }
      ]
    },
    [
      {
        $set: {
          subCategory: {
            id: "gen",
            name: { $ifNull: ["$category", "General"] },
            slug: "general"
          },
          subCategoryName: { $ifNull: ["$category", "General"] }
        }
      }
    ]
  );
  print(`Updated ${resProd.modifiedCount} products with valid subCategory object.`);
}

print("DONE");
