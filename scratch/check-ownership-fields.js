const db = db.getSiblingDB("salesmanprodb");

const stats = {
  total: db.Company.countDocuments(),
  withUserId: db.Company.countDocuments({ userId: { $exists: true, $ne: null } }),
  withOwnerId: db.Company.countDocuments({ ownerId: { $exists: true, $ne: null } }),
  withCreatedBy: db.Company.countDocuments({ createdBy: { $exists: true, $ne: null } }),
  brendenByUserId: db.Company.countDocuments({ userId: ObjectId("67c5b0182e2372b5f2366dbe") }),
  brendenByOwnerId: db.Company.countDocuments({ ownerId: ObjectId("67c5b0182e2372b5f2366dbe") }),
  brendenByCreatedBy: db.Company.countDocuments({ createdBy: ObjectId("67c5b0182e2372b5f2366dbe") })
};

print(JSON.stringify(stats, null, 2));
