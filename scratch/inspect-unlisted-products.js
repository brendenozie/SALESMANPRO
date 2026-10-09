const pIds = [
  ObjectId("68dd3fc26bf18ce921f6f0f6"), // Panadol
  ObjectId("68e65c2ee210c308b58c69db"), // 2025 Toyota Probox
  ObjectId("692850af26d014ca98b8d7d5")  // Salad 2
];

const docs = db.Product.find({ _id: { $in: pIds } }).toArray();
print(JSON.stringify(docs, null, 2));
