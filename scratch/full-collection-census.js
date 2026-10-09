const db = db.getSiblingDB("salesmanprodb");

const collections = db.getCollectionNames().sort();

const inventory = [];
let totalDocs = 0;

collections.forEach(colName => {
  const count = db.getCollection(colName).countDocuments();
  totalDocs += count;
  inventory.push({ collection: colName, count: count });
});

print("=== COMPLETE SALESMANPRODB COLLECTION INVENTORY ===");
print("Total Collections: " + collections.length);
print("Total Documents:   " + totalDocs);
print("");
print(JSON.stringify(inventory, null, 2));
