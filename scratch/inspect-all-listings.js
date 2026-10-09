const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

const ownedCompanies = db.Company.find({ userId: targetUserId }, { _id: 1, name: 1, slug: 1 }).toArray();
const ownedCompanyIds = new Set(ownedCompanies.map(c => c._id.toString()));
const companyMap = {};
ownedCompanies.forEach(c => { companyMap[c._id.toString()] = c; });

const listings = db.marketplaceListings.find({}).toArray();

const summaryByCompany = {};
let ownedCount = 0;
let externalCount = 0;
let nullCompanyCount = 0;
let activeCount = 0;

listings.forEach(l => {
  const cId = l.companyId ? l.companyId.toString() : "null";
  const isOwned = ownedCompanyIds.has(cId);
  if (!l.companyId) nullCompanyCount++;
  else if (isOwned) ownedCount++;
  else externalCount++;

  if (l.showOnGhuba && l.isAvailable) activeCount++;

  if (!summaryByCompany[cId]) {
    const comp = companyMap[cId] || { name: "External/Unknown (" + cId + ")" };
    summaryByCompany[cId] = {
      companyId: cId,
      name: comp.name,
      isOwned: isOwned,
      totalListings: 0,
      activeListings: 0,
      withProductId: 0,
      withoutProductId: 0,
      sampleNames: []
    };
  }
  summaryByCompany[cId].totalListings++;
  if (l.showOnGhuba && l.isAvailable) summaryByCompany[cId].activeListings++;
  if (l.productId) summaryByCompany[cId].withProductId++;
  else summaryByCompany[cId].withoutProductId++;
  if (summaryByCompany[cId].sampleNames.length < 3) {
    summaryByCompany[cId].sampleNames.push(l.name);
  }
});

print(JSON.stringify({
  totalListings: listings.length,
  ownedCount,
  externalCount,
  nullCompanyCount,
  activeCount,
  companies: Object.values(summaryByCompany)
}, null, 2));
