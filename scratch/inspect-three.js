const db = db.getSiblingDB("salesmanprodb");

const names = ["Bata Premium", "Corporate & Business Law", "DAP Fertilizer 50kg"];
const listings = db.marketplaceListings.find({ name: { $in: names } }).toArray();

listings.forEach(l => {
  print("==================================");
  print("ID: " + l._id.toString());
  print("Name: " + l.name);
  print("Company ID: " + l.companyId);
  print("Price: " + l.price);
  print("Stock: " + l.stock);
  print("isAvailable: " + l.isAvailable);
  print("showOnGhuba: " + l.showOnGhuba);
  print("Images count: " + (l.images ? l.images.length : 0));
  print("Images: " + JSON.stringify(l.images));
  print("Description: " + l.description);
  print("Status: " + l.status + " / GhubaStatus: " + l.ghubaStatus);
});
