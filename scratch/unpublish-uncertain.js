const db = db.getSiblingDB("salesmanprodb");

const targetUser = db.User.findOne({ email: "brendenozie@gmail.com" });
const targetUserId = targetUser._id.toString();

const unpublishIds = [
  ObjectId("6882938ca195c3ed50b3fdaf"), // Bata Premium (0 images, directory placeholder)
  ObjectId("68c29ab8c4264d75af2ad196"), // Corporate & Business Law (0 images, service placeholder)
  ObjectId("6a2be7f01642861cd4ad660d")  // DAP Fertilizer (KES 130 uncalibrated price, sample description)
];

print("=== SAFE UNPUBLISHING OF UNCERTAIN OFFERINGS ===");

unpublishIds.forEach(id => {
  const listing = db.marketplaceListings.findOne({ _id: id });
  if (!listing) {
    print("Listing not found: " + id);
    return;
  }

  // Strict ownership re-verification before write
  const company = db.Company.findOne({ _id: listing.companyId });
  const isOwned = company && (
    (company.userId && company.userId.toString() === targetUserId) ||
    (company.ownerId && company.ownerId.toString() === targetUserId) ||
    (company.createdBy && company.createdBy.toString() === targetUserId)
  );

  if (!isOwned) {
    throw new Error("ABORT: Attempted to touch unowned listing " + id);
  }

  db.marketplaceListings.updateOne(
    { _id: id },
    {
      $set: {
        showOnGhuba: false,
        isAvailable: false,
        updatedAt: new Date()
      }
    }
  );

  print("Unpublished listing: " + id + " (" + listing.name + ") in store " + company.name);
});

const remainingPublic = db.marketplaceListings.countDocuments({ showOnGhuba: true, isAvailable: true });
print("Remaining Public Verified Listings: " + remainingPublic);
print("=== COMPLETE ===");
