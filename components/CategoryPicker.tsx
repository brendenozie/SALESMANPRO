import React, { useState, useEffect, } from "react";

const CategoryPicker = ({
  formData,
  handleInputChange,
  categories,
  filteredSubCategories,
  filteredBrands
}: any) => {
  const [selectedCategory, setSelectedCategory] = useState(formData.category || null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(formData.subCategory || null);
  const [selectedBrand, setSelectedBrand] = useState(formData.brand || null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedSubcategory(null);
      setSelectedBrand(null);
    }
  }, [selectedCategory]);

  const handleSelection = (field: string, value: any) => {
    handleInputChange({ target: { name: field, value } });
    if (field === "category") {
      setSelectedCategory(value);
      setSelectedSubcategory(null);
      setSelectedBrand(null);
    }
    if (field === "subCategory") setSelectedSubcategory(value);
    if (field === "brand") setSelectedBrand(value);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 space-y-6">
      {(selectedCategory || selectedSubcategory || selectedBrand) && (
        <div className="flex flex-wrap items-center space-x-3 p-3 bg-gray-100 rounded-lg text-sm">
          {selectedCategory && selectedCategory.name && (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{selectedCategory.name}</span>
              <button onClick={() => setSelectedCategory(null)}>❌</button>
            </span>
          )}
          {selectedSubcategory && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{selectedSubcategory.name}</span>
              <button onClick={() => setSelectedSubcategory(null)}>❌</button>
            </span>
          )}
          {selectedBrand && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{selectedBrand}</span>
              <button onClick={() => setSelectedBrand(null)}>❌</button>
            </span>
          )}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-700 mb-3">Category</h3>
      <input
        type="text"
        placeholder="Search categories..."
        className="w-full px-4 py-2 mb-3 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="relative">
        <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex">
          ◀️
        </button>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {categories
            .filter((cat: any) => cat.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => handleSelection("category", cat.category)}
                className={`snap-start px-4 py-2 h-12 min-w-[120px] flex items-center justify-center rounded-lg border text-sm transition-all duration-200 ${
                  selectedCategory?.id === cat.id
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                }`}
              >
                {cat.category.name}
              </button>
            ))}
        </div>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex">
          ▶️
        </button>
      </div>

      {filteredSubCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Subcategory</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSubCategories.map((sub: any) => (
              <button
                key={sub.id}
                onClick={() => handleSelection("subCategory", sub)}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-all duration-200 ${
                  selectedSubcategory?.name === sub.name
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredBrands.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBrands.map((brand: any) => (
              <button
                key={brand}
                onClick={() => handleSelection("brand", brand)}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-all duration-200 ${
                  selectedBrand === brand
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPicker;
