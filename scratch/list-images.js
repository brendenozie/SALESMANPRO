const pImages = db.Product.distinct("images").flat();
const lImages = db.marketplaceListings.distinct("images").flat();

const allImages = [...new Set([...pImages, ...lImages])];
print(JSON.stringify(allImages, null, 2));
