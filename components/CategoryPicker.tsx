'use client';

import { ProductCategory, StoreCategory } from "@/app/admin/[slug]/categories/page";
import React, { useState, useEffect, useRef } from "react";

// --- Type Definitions ---
// export interface CategoryItem {
//   id: string;
//   name: string;
//   slug: string;
// }

// export interface CategoryData {
//   companyId: string;
//   categoryId: string;
//   displayName: string;
//   icon: string;
//   sortOrder: number;
//   visible: boolean;
//   id: string;
//   items: CategoryItem[];
//   category?: {
//     subcategories?: CategoryItem[];
//   };
// }

type Brand = string;

interface Props {
  formData: {
    category: StoreCategory | null;
    subCategory: ProductCategory | null;
    brand: Brand | null;
  };
  categories: StoreCategory[];
  filteredBrands: Brand[];
  onCategoryChange: (category: StoreCategory | null) => void;
  onSubCategoryChange: (subcategory: ProductCategory | null) => void;
  onBrandChange: (brand: Brand | null) => void;
}

// --- Pill Component ---
const Pill: React.FC<{
  label: string;
  color: "orange" | "blue" | "green";
  onClear: () => void;
}> = ({ label, color, onClear }) => {
  const bg =
    color === "orange"
      ? "bg-orange-500"
      : color === "blue"
      ? "bg-blue-500"
      : "bg-green-500";
  return (
    <span
      className={`${bg} text-white px-3 py-1 rounded-md flex items-center space-x-1 text-sm`}
    >
      <span>{label}</span>
      <button onClick={onClear} className="opacity-80 hover:opacity-100">
        ×
      </button>
    </span>
  );
};

// --- Main Component ---
const CategoryPicker: React.FC<Props> = ({
  formData,
  categories,
  filteredBrands,
  onCategoryChange,
  onSubCategoryChange,
  onBrandChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Pull subcategories from either `items` or nested `category.subcategories`
  const rawItems =
    formData.category?.items?.length
      ? formData.category.items
      : formData.category?.category?.subcategories ?? [];
  const filteredSubCategories = rawItems.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Step Indicator */}
      <nav className="flex space-x-2 text-sm font-medium">
        <span className={`px-2 ${!formData.category ? "text-gray-400" : "text-orange-600"}`}>1. Category</span>
        <span className="text-gray-300">/</span>
        <span className={`px-2 ${!formData.subCategory ? "text-gray-400" : "text-orange-600"}`}>2. Subcategory</span>
        <span className="text-gray-300">/</span>
        <span className={`px-2 ${!formData.brand ? "text-gray-400" : "text-orange-600"}`}>3. Brand</span>
      </nav>

      {/* Pills */}
      {(formData.category || formData.subCategory || formData.brand) && (
        <div className="sticky top-0 flex flex-wrap items-center space-x-2 text-sm">
          {formData.category && (
            <Pill
              label={`${formData.category.icon} ${formData.category.displayName}`}
              color="orange"
              onClear={() => onCategoryChange(null)}
            />
          )}
          {formData.subCategory && (
            <Pill
              label={formData.subCategory.name}
              color="blue"
              onClear={() => onSubCategoryChange(null)}
            />
          )}
          {formData.brand && (
            <Pill
              label={formData.brand}
              color="green"
              onClear={() => onBrandChange(null)}
            />
          )}
        </div>
      )}

      {/* Category */}
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
          <button
            onClick={() => scrollContainer(-120)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full transition-opacity ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            ◀️
          </button>
          <div ref={categoryScrollRef} className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
            {categories && categories
              .filter((cat) =>
                cat.displayName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat)}
                  aria-pressed={formData.category?.id === cat.id}
                  className={`snap-start px-4 py-2 h-12 min-w-[120px] flex items-center justify-center rounded-lg border text-sm transition-transform duration-150 ${
                    formData.category?.id === cat.id
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 active:scale-95"
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.displayName}
                </button>
              ))}
          </div>
          <button
            onClick={() => scrollContainer(120)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full transition-opacity ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            ▶️
          </button>
        </div>
      </section>

      {/* Subcategory */}
      {formData.category && filteredSubCategories.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">2. Choose a Subcategory</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSubCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSubCategoryChange(sub)}
                aria-pressed={formData.subCategory?.id === sub.id}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-transform duration-150 ${
                  formData.subCategory?.id === sub.id
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 active:scale-95"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Brand */}
      {formData.subCategory && filteredBrands.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">3. Choose a Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => onBrandChange(brand)}
                aria-pressed={formData.brand === brand}
                className={`px-4 py-2 h-12 rounded-lg border text-sm transition-transform duration-150 ${
                  formData.brand === brand
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 active:scale-95"
                }`}
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
