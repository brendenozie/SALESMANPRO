const p = db.Product.findOne({ _id: ObjectId("68dd3fc26bf18ce921f6f0f6") });
print(JSON.stringify(p, null, 2));
