import React, { useState, useEffect, useRef } from "react";

// Parent category structure matching sample data
export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryData {
  companyId: string;
  categoryId: string;
  displayName: string;
  icon: string;
  sortOrder: number;
  visible: boolean;
  id: string; // unique identifier for the category object
  items: CategoryItem[]; // subcategories
}

type Brand = string;

interface Props {
  formData: {
    category: CategoryData | null;
    subCategory: CategoryItem | null;
    brand: Brand | null;
  };
  handleInputChange: (e: { target: { name: string; value: any } }) => void;
  categories: CategoryData[];
  filteredBrands: Brand[];
}

/** Reusable Pill/Chip component **/
const Pill: React.FC<{
  label: string;
  color: "orange" | "blue" | "green";
  onClear: () => void;
}> = ({ label, color, onClear }) => {
  const bg =
    color === "orange" ? "bg-orange-500" : color === "blue" ? "bg-blue-500" : "bg-green-500";
  return (
    <span className={`${bg} text-white px-3 py-1 rounded-md flex items-center space-x-1 text-sm`}>
      <span>{label}</span>
      <button onClick={onClear} className="opacity-80 hover:opacity-100">×</button>
    </span>
  );
};

const CategoryPicker: React.FC<Props> = ({
  formData,
  handleInputChange,
  categories,
  filteredBrands,
}) => {
  const [selection, setSelection] = useState<{
    category: CategoryData | null;
    subCategory: CategoryItem | null;
    brand: Brand | null;
  }>({
    category: formData.category,
    subCategory: formData.subCategory,
    brand: formData.brand,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  /** Whenever the user picks a field: **/
  const handleSelection = (field: "category" | "subCategory" | "brand", value: any) => {
    handleInputChange({ target: { name: field, value } });
    setSelection((prev) => {
      if (field === "category") {
        return { category: value, subCategory: null, brand: null };
      }
      if (field === "subCategory") {
        return { category: prev.category, subCategory: value, brand: null };
      }
      return { category: prev.category, subCategory: prev.subCategory, brand: value };
    });
  };

  // Reset sub fields when category clears
  useEffect(() => {
    if (!selection.category) {
      setSelection({ category: null, subCategory: null, brand: null });
    }
  }, [selection.category]);

  // Scroll arrow logic
  const updateScrollArrows = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    updateScrollArrows();
    el.addEventListener("scroll", updateScrollArrows);
    return () => el.removeEventListener("scroll", updateScrollArrows);
  }, []);

  const scrollContainer = (distance: number) => {
    categoryScrollRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  // Derive subcategories from selected category
  const filteredSubCategories = selection.category ? selection.category.items : [];

  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-md p-6 space-y-6">
      {/* Step indicator */}
      <nav className="flex space-x-2 text-sm font-medium">
        <span className={`px-2 ${!selection.category ? "text-gray-400" : "text-orange-600"}`}>1. Category</span>
        <span className="text-gray-300">/</span>
        <span className={`px-2 ${!selection.subCategory ? "text-gray-400" : "text-orange-600"}`}>2. Subcategory</span>
        <span className="text-gray-300">/</span>
        <span className={`px-2 ${!selection.brand ? "text-gray-400" : "text-orange-600"}`}>3. Brand</span>
      </nav>

      {/* Selected pills */}
      {(selection.category || selection.subCategory || selection.brand) && (
        <div className="sticky top-0  z-10 flex flex-wrap items-center space-x-2 text-sm">
          {selection.category && (
            <Pill label={`${selection.category.icon} ${selection.category.displayName}`} color="orange" onClear={() => handleSelection("category", null)} />
          )}
          {selection.subCategory && (
            <Pill label={selection.subCategory.name} color="blue" onClear={() => handleSelection("subCategory", null)} />
          )}
          {selection.brand && (
            <Pill label={selection.brand} color="green" onClear={() => handleSelection("brand", null)} />
          )}
        </div>
      )}

      {/* Step 1: Category */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">1. Choose a Category</h3>
        <input
          type="text"
          placeholder="Search categories…"
          className="w-full px-4 py-2 mb-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="relative">
          <button onClick={() => scrollContainer(-120)} className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full transition-opacity ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            ◀️
          </button>
          <div ref={categoryScrollRef} className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
            {categories
              .filter((cat) =>
                cat.displayName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelection("category", cat)}
                  aria-pressed={selection.category?.id === cat.id}
                  className={`snap-start px-4 py-2 h-12 min-w-[120px] flex items-center justify-center rounded-lg border text-sm transition-transform duration-150
                    ${selection.category?.id === cat.id
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 active:scale-95"}
                  `}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.displayName}
                </button>
              ))}
          </div>
          <button onClick={() => scrollContainer(120)} className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full transition-opacity ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}>▶️</button>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </section>

      {/* Step 2: Subcategory */}
      {selection.category && filteredSubCategories.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">2. Choose a Subcategory</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSubCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSelection("subCategory", sub)}
                aria-pressed={selection.subCategory?.id === sub.id}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-transform duration-150
                  ${selection.subCategory?.id === sub.id
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 active:scale-95"}
                `}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 3: Brand */}
      {selection.subCategory && filteredBrands.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">3. Choose a Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleSelection("brand", brand)}
                aria-pressed={selection.brand === brand}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-transform duration-150
                  ${selection.brand === brand
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 active:scale-95"}
                `}
              >
                {brand}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CategoryPicker;
