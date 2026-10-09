const db = db.getSiblingDB("salesmanprodb");

const categories = db.ProductCategory.find({}, {
  _id: 1,
  name: 1,
  slug: 1,
  subcategories: 1,
  brands: 1,
  isActive: 1
}).toArray();

const exportData = {
  totalCount: categories.length,
  timestamp: new Date().toISOString(),
  categories: categories.map(c => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    subcategoriesCount: c.subcategories ? c.subcategories.length : 0,
    subcategories: c.subcategories || [],
    brands: c.brands || [],
    isActive: c.isActive !== false
  }))
};

print(JSON.stringify(exportData, null, 2));
