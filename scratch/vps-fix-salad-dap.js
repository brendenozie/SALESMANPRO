const db = db.getSiblingDB("salesmanprodb");

// 1. Fix Salad 2 image with genuine salad photo
const saladListing = db.marketplaceListings.findOne({ _id: ObjectId("6928480726d014ca98b8d7d4") });
if (saladListing) {
  const saladProd = db.Product.findOne({ _id: saladListing.productId });
  const realImg = (saladProd && saladProd.images && saladProd.images[0])
    ? (typeof saladProd.images[0] === 'string' ? saladProd.images[0] : saladProd.images[0].url)
    : "https://dozi4r4ug9739.cloudfront.net/images/1764249765667-anna-pelzer-IGfIGP5ONV0-unsplash.jpg";

  db.marketplaceListings.updateOne(
    { _id: saladListing._id },
    {
      $set: {
        images: [realImg],
        updatedAt: new Date()
      }
    }
  );
  print("Updated Salad 2 image to: " + realImg);
}

// 2. Check DAP listing and company
const dapListing = db.marketplaceListings.findOne({ _id: ObjectId("6a2be7f01642861cd4ad660d") });
print("DAP Listing details:");
printjson({
  name: dapListing.name,
  status: dapListing.status,
  isAvailable: dapListing.isAvailable,
  showOnGhuba: dapListing.showOnGhuba,
  ghubaAdminApproved: dapListing.ghubaAdminApproved,
  ghubaStatus: dapListing.ghubaStatus,
  companyId: dapListing.companyId
});

const agrovetComp = db.Company.findOne({ _id: dapListing.companyId });
print("Agrovet Company details:");
printjson({
  name: agrovetComp.name,
  isActive: agrovetComp.isActive,
  status: agrovetComp.status,
  isApproved: agrovetComp.isApproved,
  isLive: agrovetComp.isLive
});

// If ghubaAdminApproved or ghubaStatus or isAvailable need ensuring:
db.marketplaceListings.updateOne(
  { _id: dapListing._id },
  {
    $set: {
      status: "ACTIVE",
      isAvailable: true,
      showOnGhuba: true,
      ghubaAdminApproved: true,
      ghubaStatus: "APPROVED",
      updatedAt: new Date()
    }
  }
);
print("Ensured DAP Listing has status: ACTIVE, isAvailable: true, showOnGhuba: true, ghubaAdminApproved: true, ghubaStatus: APPROVED");
