import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useMemo, useRef } from "react";

interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  status: string;
  brand: [];
  allBrands: [];
  tags: [];
  subcategories: [];
}

interface Categorylist{
  id: string;
  category:Category;
}

interface CategoryPickerProps {
  formData: {
    category: Category | null;
    subcategory: string | null;
    brand: string | null;
  };
  handleInputChange: (event: { target: { name: string; value: any } }) => void;
  categories: Categorylist[];
  subCategories: { id: string; name: string }[];
  brands: string[];
  filteredSubCategories: { id: string; name: string }[];
  filteredBrands: string[];
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  formData,
  handleInputChange,
  categories,
  filteredSubCategories,
  filteredBrands,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null); // Ref for scrollable container

  useEffect(() => {
    if (!formData.category) {
      handleInputChange({ target: { name: "subcategory", value: null } });
      handleInputChange({ target: { name: "brand", value: null } });
    }
  }, [formData.category, handleInputChange]);

  // Memoize filtered categories
  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.category.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [categories, searchTerm]
  );

  const handleSelection = (field: string, value: any) => {
    handleInputChange({ target: { name: field, value } });

    if (field === "category") {
      handleInputChange({ target: { name: "subcategory", value: null } });
      handleInputChange({ target: { name: "brand", value: null } });
    }
  };

  // Scroll function
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -150 : 150,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
      {/* Selected Filters Display */}
      {formData.category || formData.subcategory || formData.brand ? (
        <div className="flex flex-wrap items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
          {formData.category && (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{formData.category.name}</span>
              <button onClick={() => handleSelection("category", null)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </span>
          )}
          {formData.subcategory && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{formData.subcategory}</span>
              <button onClick={() => handleSelection("subcategory", null)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </span>
          )}
          {formData.brand && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center space-x-2">
              <span>{formData.brand}</span>
              <button onClick={() => handleSelection("brand", null)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </span>
          )}
        </div>
      ) : null}

      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">Category</h3>
        <input
          type="text"
          placeholder="Search categories..."
          className="w-full px-4 py-2 mb-3 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Scrollable category container with navigation */}
        <div className="relative">
          {filteredCategories.length > 3 && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 shadow-md p-2 rounded-full"
            >
              <ChevronLeftIcon />
            </button>
          )}
          <div
            ref={scrollRef}
            className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x"
          >
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelection("category", cat)}
                className={`snap-start px-4 py-2 h-12 min-w-[120px] flex items-center justify-center rounded-lg border text-sm transition-all duration-200
                  ${
                    formData.category?.id === cat.id
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-orange-100 dark:hover:bg-orange-500 hover:border-orange-300"
                  }`}
              >
                {cat.category.name}
              </button>
            ))}
          </div>
          {filteredCategories.length > 3 && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 shadow-md p-2 rounded-full"
            >
              <ChevronRightIcon />
            </button>
          )}
        </div>
      </div>

      {/* Subcategory Selection */}
      {filteredSubCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">Subcategory</h3>
          <div key={formData.category?.id || "all"} 
           className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSubCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSelection("subcategory", sub.name)}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-all duration-200
                  ${
                    formData.subcategory === sub.name
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-orange-100 dark:hover:bg-orange-500 hover:border-orange-300"
                  }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand Selection */}
      {filteredBrands.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleSelection("brand", brand)}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-all duration-200
                  ${
                    formData.brand === brand
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-orange-100 dark:hover:bg-orange-500 hover:border-orange-300"
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
