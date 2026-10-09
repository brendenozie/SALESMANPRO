const db = db.getSiblingDB("salesmanprodb");

const listings = db.marketplaceListings.find({ showOnGhuba: true, isAvailable: true }).toArray();

const result = listings.map(l => {
  const comp = db.Company.findOne({ _id: l.companyId }, { name: 1, slug: 1, userId: 1 });
  const prod = l.productId ? db.Product.findOne({ _id: l.productId }, { name: 1, stock: 1, price: 1, costPrice: 1 }) : null;
  return {
    listingId: l._id.toString(),
    productId: l.productId ? l.productId.toString() : null,
    name: l.name,
    store: {
      id: l.companyId ? l.companyId.toString() : null,
      name: comp ? comp.name : "UNKNOWN",
      slug: comp ? comp.slug : "UNKNOWN"
    },
    category: {
      id: l.productCategoryId ? l.productCategoryId.toString() : null,
      name: l.category,
      subCategory: l.subCategoryName
    },
    brand: l.brand || null,
    pricing: {
      sellingPrice: l.sellingPrice,
      finalPrice: l.finalPrice,
      basePrice: l.basePrice,
      costPrice: l.costPrice,
      price: l.price,
      currency: "KES"
    },
    inventory: {
      listingStock: l.stock,
      productStock: prod ? prod.stock : null,
      quantity: l.quantity
    },
    imagery: {
      count: l.images ? l.images.length : 0,
      images: l.images || []
    },
    description: (l.description || "").trim(),
    status: {
      listingStatus: l.status,
      ghubaStatus: l.ghubaStatus,
      ghubaAdminApproved: l.ghubaAdminApproved,
      isAvailable: l.isAvailable,
      showOnGhuba: l.showOnGhuba
    }
  };
});

print(JSON.stringify(result, null, 2));
