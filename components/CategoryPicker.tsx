// CategoryPicker.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IProductCategory, IStoreCategory } from "@/types/typings";

/**
 * Toggle animations globally in this file
 * Set to `false` to disable motion wrappers while keeping the same DOM structure.
 */
const ENABLE_MOTION = true;

/* ----------------------------- Utility Types ----------------------------- */

type Brand = string | undefined | null;

interface Props {
  formData: {
    category: IStoreCategory | null | undefined;
    subCategory: IProductCategory | null;
    brand: Brand | null;
  };
  categories: IStoreCategory[];
  filteredBrands: Brand[];
  onCategoryChange: (category: IStoreCategory | null) => void;
  onSubCategoryChange: (subcategory: IProductCategory | null) => void;
  onBrandChange: (brand: Brand | null) => void;
}

/* ------------------------------- MotionWrapper ------------------------------- */

const MotionWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  if (!ENABLE_MOTION) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0.6, scale: 0.995 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

/* --------------------------------- Pill --------------------------------- */

const Pill: React.FC<{
  label: string;
  color: "orange" | "blue" | "green";
  onClear: () => void;
}> = ({ label, color, onClear }) => {
  const bg =
    color === "orange" ? "bg-orange-500" : color === "blue" ? "bg-blue-500" : "bg-green-500";
  return (
    <MotionWrapper className="inline-flex">
      <span
        className={`${bg} text-white px-3 py-1 rounded-md flex items-center space-x-2 text-sm shadow-sm`}
      >
        <span className="truncate max-w-[10rem]">{label}</span>
        <button
          onClick={onClear}
          type="button"
          aria-label={`Clear ${label}`}
          className="opacity-90 hover:opacity-100 ml-2 text-sm leading-none"
        >
          ×
        </button>
      </span>
    </MotionWrapper>
  );
};

/* --------------------------- SelectableButton --------------------------- */

interface SelectableButtonProps {
  id?: string | number;
  selected?: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  variant?: "orange" | "blue" | "green" | "neutral";
  className?: string;
  ariaLabel?: string;
}

const SelectableButton: React.FC<SelectableButtonProps> = React.memo(
  ({ selected, onSelect, children, variant = "neutral", className = "", ariaLabel, id }) => {
    const base =
      "px-4 py-3 h-14 min-w-[120px] rounded-lg border text-sm transition-all duration-200 ease-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95";
    const variants: Record<string, string> = {
      orange:
        "bg-gray-50 text-gray-800 hover:bg-orange-50 hover:border-orange-300 focus:ring-orange-500",
      blue:
        "bg-gray-50 text-gray-800 hover:bg-blue-50 hover:border-blue-300 focus:ring-blue-500",
      green:
        "bg-gray-50 text-gray-800 hover:bg-green-50 hover:border-green-300 focus:ring-green-500",
      neutral: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
    };

    const selectedStyles =
      variant === "orange"
        ? "bg-orange-500 text-white border-orange-500 shadow-md"
        : variant === "blue"
        ? "bg-blue-500 text-white border-blue-500 shadow-md"
        : variant === "green"
        ? "bg-green-500 text-white border-green-500 shadow-md"
        : "bg-gray-700 text-white border-gray-700 shadow-md";

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    };

    return (
      <MotionWrapper className="inline-block">
        <button
          id={id?.toString()}
          type="button"
          onClick={onSelect}
          onKeyDown={handleKeyDown}
          aria-pressed={selected}
          aria-label={ariaLabel}
          className={`${base} ${selected ? selectedStyles : variants[variant]} ${className} hover:scale-[1.02]`}
        >
          {children}
        </button>
      </MotionWrapper>
    );
  }
);

/* ------------------------------ StepHeader ------------------------------ */

const StepHeader: React.FC<{
  category?: boolean;
  subCategory?: boolean;
  brand?: boolean;
}> = ({ category, subCategory, brand }) => {
  const stepClass = (active?: boolean) =>
    `px-2 ${active ? "text-orange-600 font-semibold" : "text-gray-400"}`;

  return (
    <nav className="flex items-center space-x-2 text-sm font-medium">
      <span className={stepClass(category)}>1. Category</span>
      <span className="text-gray-300">/</span>
      <span className={stepClass(subCategory)}>2. Subcategory</span>
      <span className="text-gray-300">/</span>
      <span className={stepClass(brand)}>3. Brand</span>
    </nav>
  );
};

/* -------------------------------- PillsBar -------------------------------- */

const PillsBar: React.FC<{
  formData: Props["formData"];
  onCategoryChange: Props["onCategoryChange"];
  onSubCategoryChange: Props["onSubCategoryChange"];
  onBrandChange: Props["onBrandChange"];
}> = ({ formData, onCategoryChange, onSubCategoryChange, onBrandChange }) => {
  if (!formData.category && !formData.subCategory && !formData.brand) return null;
  return (
    <div className="sticky top-4 flex flex-wrap items-center gap-3 text-sm z-10">
      {formData.category && (
        <Pill
          label={`${formData.category.icon ?? ""} ${formData.category.displayName}`}
          color="orange"
          onClear={() => onCategoryChange(null)}
        />
      )}
      {formData.subCategory && (
        <Pill label={formData.subCategory.name} color="blue" onClear={() => onSubCategoryChange(null)} />
      )}
      {formData.brand && (
        <Pill label={formData.brand} color="green" onClear={() => onBrandChange(null)} />
      )}
    </div>
  );
};

/* ------------------------------ CategoryStep ------------------------------ */

const CategoryStep: React.FC<{
  categories: IStoreCategory[];
  selectedCategory?: IStoreCategory | null | undefined;
  onSelect: (cat: IStoreCategory) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}> = ({ categories, selectedCategory, onSelect, searchTerm, setSearchTerm }) => {
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollArrows = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    updateScrollArrows();
    el.addEventListener("scroll", updateScrollArrows, { passive: true });
    const resizeObs = new ResizeObserver(updateScrollArrows);
    resizeObs.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollArrows);
      resizeObs.disconnect();
    };
  }, [updateScrollArrows]);

  const scrollContainer = (distance: number) => {
    categoryScrollRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  const visibleCategories = categories.filter((cat) =>
    cat.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">1. Choose a Category</h3>

      <input
        type="text"
        placeholder="Search categories…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 mb-4 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
      />

      <div className="relative">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scrollContainer(-160)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-opacity ${
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!canScrollLeft}
        >
          ◀️
        </button>

        {/* Scrollable list */}
        <div
          ref={categoryScrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-3 snap-x px-2"
          role="list"
        >
          {visibleCategories.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No categories match your search.</div>
          )}

          {visibleCategories.map((cat) => (
            <div role="listitem" key={cat.id} className="snap-start">
              <SelectableButton
                id={cat.id}
                onSelect={() => onSelect(cat)}
                selected={selectedCategory?.id === cat.id}
                variant="orange"
                ariaLabel={`Select ${cat.displayName}`}
              >
                <span className="mr-2">{cat.icon}</span>
                <span className="truncate">{cat.displayName}</span>
              </SelectableButton>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollContainer(160)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-opacity ${
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!canScrollRight}
        >
          ▶️
        </button>
      </div>
    </section>
  );
};

/* --------------------------- SubcategoryStep --------------------------- */

const SubcategoryStep: React.FC<{
  subcategories: IProductCategory[];
  selected?: IProductCategory | null;
  onSelect: (s: IProductCategory) => void;
}> = ({ subcategories, selected, onSelect }) => {
  if (!subcategories || subcategories.length === 0) return null;
  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">2. Choose a Subcategory</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {subcategories.map((sub) => (
          <SelectableButton
            key={sub.id}
            id={sub.id}
            onSelect={() => onSelect(sub)}
            selected={selected?.id === sub.id}
            variant="blue"
            ariaLabel={`Choose subcategory ${sub.name}`}
          >
            {sub.name}
          </SelectableButton>
        ))}
      </div>
    </section>
  );
};

/* ------------------------------ BrandStep ------------------------------ */

const BrandStep: React.FC<{
  brands: Brand[];
  selected?: Brand | null;
  onSelect: (b: Brand) => void;
}> = ({ brands, selected, onSelect }) => {
  if (!brands || brands.length === 0) return null;
  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">3. Choose a Brand</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <SelectableButton
            key={String(brand)}
            id={String(brand)}
            onSelect={() => onSelect(brand)}
            selected={selected === brand}
            variant="green"
            ariaLabel={`Choose brand ${brand}`}
          >
            {brand}
          </SelectableButton>
        ))}
      </div>
    </section>
  );
};

/* ------------------------------ Main Component ------------------------------ */

const CategoryPicker: React.FC<Props> = ({
  formData,
  categories,
  filteredBrands,
  onCategoryChange,
  onSubCategoryChange,
  onBrandChange,
}) => {
  // searchTerm used primarily for Category step (less noisy UX)
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Extract subcategories from a couple of possible shapes
  const rawSubCategories = useMemo(() => {
    if (!formData.category) return [];
    if (Array.isArray(formData.category.subcategories) && formData.category.subcategories.length) {
      return formData.category.subcategories;
    }
    // fallback for nested shape category.category?.subcategories
    // @ts-ignore - defensive access since shape could vary
    return formData.category.category?.subcategories ?? [];
  }, [formData.category]);

  const filteredSubCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rawSubCategories;
    return rawSubCategories.filter((s: IProductCategory) => s.name.toLowerCase().includes(q));
  }, [rawSubCategories, searchTerm]);

  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-md p-6 space-y-6">
      <StepHeader
        category={!!formData.category}
        subCategory={!!formData.subCategory}
        brand={!!formData.brand}
      />

      <PillsBar
        formData={formData}
        onCategoryChange={onCategoryChange}
        onSubCategoryChange={onSubCategoryChange}
        onBrandChange={onBrandChange}
      />

      <MotionWrapper>
        <CategoryStep
          categories={categories}
          selectedCategory={formData.category}
          onSelect={(c) => {
            // reset dependent selections when category changes
            onCategoryChange(c);
            onSubCategoryChange(null);
            onBrandChange(null);
          }}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </MotionWrapper>

      {formData.category && filteredSubCategories.length > 0 && (
        <MotionWrapper>
          <SubcategoryStep
            subcategories={filteredSubCategories}
            selected={formData.subCategory}
            onSelect={(s) => {
              onSubCategoryChange(s);
              onBrandChange(null);
            }}
          />
        </MotionWrapper>
      )}

      {formData.subCategory && filteredBrands.length > 0 && (
        <MotionWrapper>
          <BrandStep
            brands={filteredBrands}
            selected={formData.brand}
            onSelect={(b) => onBrandChange(b)}
          />
        </MotionWrapper>
      )}
    </div>
  );
};

export default CategoryPicker;
