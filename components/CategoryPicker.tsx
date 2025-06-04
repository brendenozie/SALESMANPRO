import React, { useState, useEffect, useRef } from "react";

interface Category { id: string; name: string; }
interface Subcategory { id: string; name: string; }
type Brand = string;

interface Props {
  formData: { category: Category | null; subCategory: Subcategory | null; brand: Brand | null };
  handleInputChange: (e: { target: { name: string; value: any } }) => void;
  categories: Array<{ id: string; category: Category }>;
  filteredSubCategories: Subcategory[];
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
  filteredSubCategories,
  filteredBrands,
}) => {
  const [selection, setSelection] = useState<{
    category: Category | null;
    subCategory: Subcategory | null;
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

  /** Reset sub fields if category changes **/
  useEffect(() => {
    if (!selection.category) {
      setSelection((prev) => ({ category: null, subCategory: null, brand: null }));
    }
  }, [selection.category]);

  /** Check if horizontal scroll arrows should show/hide **/
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

  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-md p-6 space-y-6">
      {/* ── Step Indicator / Breadcrumb ── */}
      <nav className="flex space-x-2 text-sm font-medium">
        <span
          className={`px-2 ${
            !selection.category ? "text-gray-400" : "text-orange-600"
          }`}
        >
          1. Category
        </span>
        <span className="text-gray-300">/</span>
        <span
          className={`px-2 ${
            !selection.subCategory ? "text-gray-400" : "text-orange-600"
          }`}
        >
          2. Subcategory
        </span>
        <span className="text-gray-300">/</span>
        <span
          className={`px-2 ${
            !selection.brand ? "text-gray-400" : "text-orange-600"
          }`}
        >
          3. Brand
        </span>
      </nav>

      {/* ── Selected “Chips” (Sticky) ── */}
      {(selection.category || selection.subCategory || selection.brand) && (
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-2 flex flex-wrap items-center space-x-2 text-sm">
          {selection.category && (
            <Pill
              label={selection.category.name}
              color="orange"
              onClear={() => handleSelection("category", null)}
            />
          )}
          {selection.subCategory && (
            <Pill
              label={selection.subCategory.name}
              color="blue"
              onClear={() => handleSelection("subCategory", null)}
            />
          )}
          {selection.brand && (
            <Pill
              label={selection.brand}
              color="green"
              onClear={() => handleSelection("brand", null)}
            />
          )}
        </div>
      )}

      {/* ── Step 1: Category Search & Horizontal Scroll ── */}
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
          {/* Left arrow */}
          <button
            onClick={() => scrollContainer(-120)}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full transition-opacity
              ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            ◀️
          </button>

          <div
            ref={categoryScrollRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 snap-x"
          >
            {categories
              .filter((catObj) =>
                catObj.category.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((catObj) => (
                <button
                  key={catObj.id}
                  onClick={() => handleSelection("category", catObj.category)}
                  aria-pressed={selection.category?.id === catObj.id}
                  className={`
                    snap-start px-4 py-2 h-12 min-w-[120px] flex items-center justify-center
                    rounded-lg border text-sm transition-transform duration-150
                    ${
                      selection.category?.id === catObj.id
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 active:scale-95"
                    }
                  `}
                >
                  {catObj.category.name}
                </button>
              ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollContainer(+120)}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full transition-opacity
              ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            ▶️
          </button>

          {/* Gradient hint: shows there’s more to scroll */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </section>

      {/* ── Step 2: Subcategory (only once Category is chosen) ── */}
      {selection.category && filteredSubCategories.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">2. Choose a Subcategory</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSubCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSelection("subCategory", sub)}
                aria-pressed={selection.subCategory?.id === sub.id}
                className={`
                  px-4 py-2 h-12 rounded-lg border text-sm transition-transform duration-150
                  ${
                    selection.subCategory?.id === sub.id
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 active:scale-95"
                  }
                `}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Step 3: Brand (only once Subcategory is chosen) ── */}
      {selection.subCategory && filteredBrands.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">3. Choose a Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleSelection("brand", brand)}
                aria-pressed={selection.brand === brand}
                className={`
                  px-4 py-2 h-12 rounded-lg border text-sm transition-transform duration-150
                  ${
                    selection.brand === brand
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 active:scale-95"
                  }
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
