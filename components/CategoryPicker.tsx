"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { IProductCategory, IStoreCategory } from "@/types/typings";

const ENABLE_MOTION = true;

/* ----------------------------- Utility Types & Helpers ----------------------------- */

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

// Safely compare objects that might be missing `id` fields
const isCategorySelected = (cat: IStoreCategory, selected?: IStoreCategory | null) => {
  if (!selected) return false;
  if (cat.id && selected.id) return cat.id === selected.id;
  if (cat.displayName && selected.displayName) return cat.displayName === selected.displayName;
  return false;
};

const isSubcategorySelected = (sub: IProductCategory, selected?: IProductCategory | null) => {
  if (!selected) return false;
  if (sub.id && selected.id) return sub.id === selected.id;
  if (sub.name && selected.name) return sub.name === selected.name;
  return false;
};

/* ------------------------------- MotionWrapper ------------------------------- */

const MotionWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  if (!ENABLE_MOTION) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
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
    color === "orange"
      ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
      : color === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex"
    >
      <span className={`${bg} border px-3 py-1.5 rounded-full flex items-center space-x-2 text-sm font-medium shadow-sm transition-colors`}>
        <span className="truncate max-w-[12rem]">{label}</span>
        <button
          onClick={onClear}
          type="button"
          aria-label={`Clear ${label}`}
          className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded-full bg-white/50"
        >
          <XMarkIcon className="w-4 h-4 stroke-2" />
        </button>
      </span>
    </motion.div>
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
      "relative px-4 py-3 h-14 min-w-[140px] rounded-xl border text-sm transition-all duration-300 ease-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 group overflow-hidden w-full";
    
    const variants: Record<string, string> = {
      orange: "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-md focus:ring-orange-500",
      blue: "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md focus:ring-blue-500",
      green: "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50/50 hover:shadow-md focus:ring-green-500",
      neutral: "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md focus:ring-gray-400",
    };

    const selectedStyles =
      variant === "orange"
        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30 scale-[1.02]"
        : variant === "blue"
        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/30 scale-[1.02]"
        : variant === "green"
        ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-transparent shadow-lg shadow-green-500/30 scale-[1.02]"
        : "bg-gray-800 text-white border-transparent shadow-lg scale-[1.02]";

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    };

    return (
      <button
        id={id?.toString()}
        type="button"
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        aria-pressed={selected}
        aria-label={ariaLabel}
        className={`${base} ${selected ? selectedStyles : variants[variant]} ${className}`}
      >
        <div className="flex items-center gap-2 z-10 font-medium whitespace-nowrap">
          {children}
          {selected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <CheckCircleIcon className="w-5 h-5 text-white/90 stroke-2" />
            </motion.div>
          )}
        </div>
      </button>
    );
  }
);

/* ------------------------------ StepHeader ------------------------------ */

const StepHeader: React.FC<{
  category?: boolean;
  subCategory?: boolean;
  brand?: boolean;
}> = ({ category, subCategory, brand }) => {
  const stepClass = (active?: boolean, completed?: boolean) =>
    `flex items-center space-x-1.5 px-2 transition-colors duration-300 ${
      active
        ? "text-gray-900 font-bold"
        : completed
        ? "text-gray-500 font-medium"
        : "text-gray-300"
    }`;

  return (
    <nav className="flex items-center space-x-2 text-sm bg-gray-50/80 backdrop-blur-sm p-3.5 rounded-2xl border border-gray-100 shadow-inner">
      <span className={stepClass(true, category)}>
        <span className="bg-white shadow-sm border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-[11px]">1</span>
        <span>Category</span>
      </span>
      <span className="text-gray-300">/</span>
      <span className={stepClass(!!category, subCategory)}>
        <span className={`${category ? 'bg-white shadow-sm border-gray-200' : 'bg-transparent border-gray-200 opacity-50'} border rounded-full w-6 h-6 flex items-center justify-center text-[11px]`}>2</span>
        <span>Subcategory</span>
      </span>
      <span className="text-gray-300">/</span>
      <span className={stepClass(!!subCategory, brand)}>
        <span className={`${subCategory ? 'bg-white shadow-sm border-gray-200' : 'bg-transparent border-gray-200 opacity-50'} border rounded-full w-6 h-6 flex items-center justify-center text-[11px]`}>3</span>
        <span>Brand</span>
      </span>
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
    <div className="sticky top-4 flex flex-wrap items-center gap-2 text-sm z-10 py-1 min-h-[44px]">
      <AnimatePresence mode="popLayout">
        {formData.category && (
          <Pill
            key="cat"
            label={`${formData.category.icon ?? ""} ${formData.category.displayName}`}
            color="orange"
            onClear={() => onCategoryChange(null)}
          />
        )}
        {formData.subCategory && (
          <Pill 
            key="subcat" 
            label={formData.subCategory.name} 
            color="blue" 
            onClear={() => onSubCategoryChange(null)} 
          />
        )}
        {formData.brand && (
          <Pill 
            key="brand" 
            label={formData.brand} 
            color="green" 
            onClear={() => onBrandChange(null)} 
          />
        )}
      </AnimatePresence>
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
    setCanScrollRight(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth);
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    updateScrollArrows();
    el.addEventListener("scroll", updateScrollArrows, { passive: true });
    const resizeObs = new ResizeObserver(updateScrollArrows);
    resizeObs.observe(el);
    const timeout = setTimeout(updateScrollArrows, 100); // Wait for paint
    return () => {
      clearTimeout(timeout);
      el.removeEventListener("scroll", updateScrollArrows);
      resizeObs.disconnect();
    };
  }, [updateScrollArrows, categories]);

  const scrollContainer = (distance: number) => {
    categoryScrollRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  const visibleCategories = categories.filter((cat) =>
    cat.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
      {/* <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 rounded-l-3xl opacity-80" /> */}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4 ">
        <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">Select Category</h3>
        
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search categories…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all text-sm outline-none shadow-inner"
          />
        </div>
      </div>

      <div className="relative group">
        {/* Glassmorphic Left Fade & Arrow */}
        <div className={`absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? "opacity-100" : "opacity-0"}`} />
        <button
          type="button"
          onClick={() => scrollContainer(-200)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 backdrop-blur-md p-2.5 rounded-full border border-gray-200 shadow-lg text-gray-600 hover:text-orange-600 hover:scale-110 transition-all duration-200 ${
            canScrollLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
          }`}
          aria-hidden={!canScrollLeft}
        >
          <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Scroll Container */}
        <div
          ref={categoryScrollRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide pb-4 pt-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          role="list"
        >
          {visibleCategories.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 w-full flex flex-col items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-300 mb-2" />
              <p>No categories found for "{searchTerm}"</p>
            </div>
          )}

          <AnimatePresence>
            {visibleCategories.map((cat) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                role="listitem" 
                key={cat.id || cat.displayName || Math.random().toString()} 
                className="snap-start shrink-0"
              >
                <SelectableButton
                  id={cat.id || cat.categoryId || cat.category?.id}
                  onSelect={() => onSelect(cat)}
                  selected={isCategorySelected(cat, selectedCategory)}
                  variant="orange"
                  ariaLabel={`Select ${cat.displayName}`}
                >
                  {cat.icon && <span className="text-xl">{cat.icon}</span>}
                  <span className="truncate">{cat.displayName}</span>
                </SelectableButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Glassmorphic Right Fade & Arrow */}
        <div className={`absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? "opacity-100" : "opacity-0"}`} />
        <button
          type="button"
          onClick={() => scrollContainer(200)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 backdrop-blur-md p-2.5 rounded-full border border-gray-200 shadow-lg text-gray-600 hover:text-orange-600 hover:scale-110 transition-all duration-200 ${
            canScrollRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
          }`}
          aria-hidden={!canScrollRight}
        >
          <ChevronRightIcon className="w-5 h-5 stroke-[2.5]" />
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
    <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-6 relative overflow-hidden">
      {/* <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-3xl opacity-80" /> */}
      <h3 className="text-xl font-extrabold text-gray-800 tracking-tight mb-5 ">Select Subcategory</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ">
        <AnimatePresence>
          {subcategories.map((sub, index) => (
            <motion.div
              key={sub.id || sub.name || Math.random().toString()}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <SelectableButton
                id={sub.id || sub.name}
                onSelect={() => onSelect(sub)}
                selected={isSubcategorySelected(sub, selected)}
                variant="blue"
                ariaLabel={`Choose subcategory ${sub.name}`}
              >
                {sub.name}
              </SelectableButton>
            </motion.div>
          ))}
        </AnimatePresence>
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
    <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-6 relative overflow-hidden">
      {/* <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 rounded-l-3xl opacity-80" /> */}
      <h3 className="text-xl font-extrabold text-gray-800 tracking-tight mb-5 ">Select Brand</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ">
        <AnimatePresence>
          {brands.map((brand, index) => (
            <motion.div
              key={String(brand)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <SelectableButton
                id={String(brand)}
                onSelect={() => onSelect(brand)}
                selected={selected === brand}
                variant="green"
                ariaLabel={`Choose brand ${brand}`}
              >
                {brand}
              </SelectableButton>
            </motion.div>
          ))}
        </AnimatePresence>
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
  const [searchTerm, setSearchTerm] = useState<string>("");

  const rawSubCategories = useMemo(() => {
    if (!formData.category) return [];
    if (Array.isArray(formData.category.subcategories) && formData.category.subcategories.length) {
      return formData.category.subcategories;
    }
    // @ts-ignore - defensive access
    return formData.category.category?.subcategories ?? [];
  }, [formData.category]);

  const filteredSubCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rawSubCategories;
    return rawSubCategories.filter((s: IProductCategory) => s.name.toLowerCase().includes(q));
  }, [rawSubCategories, searchTerm]);

  return (
    <div className="w-full mx-auto">
      <div className="bg-white/80 backdrop-blur-xl  shadow-gray-200/50">
        
        <StepHeader
          category={!!formData.category}
          subCategory={!!formData.subCategory}
          brand={!!formData.brand}
        />

        <div className="mt-4 mb-2">
          <PillsBar
            formData={formData}
            onCategoryChange={onCategoryChange}
            onSubCategoryChange={onSubCategoryChange}
            onBrandChange={onBrandChange}
          />
        </div>

        <MotionWrapper>
          <CategoryStep
            categories={categories}
            selectedCategory={formData.category}
            onSelect={(c) => {
              if (!isCategorySelected(c, formData.category)) {
                onCategoryChange(c);
                onSubCategoryChange(null);
                onBrandChange(null);
                setSearchTerm(""); 
              }
            }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </MotionWrapper>

        <AnimatePresence mode="popLayout">
          {formData.category && filteredSubCategories.length > 0 && (
            <MotionWrapper key="subcat-step">
              <SubcategoryStep
                subcategories={filteredSubCategories}
                selected={formData.subCategory}
                onSelect={(s) => {
                  if (!isSubcategorySelected(s, formData.subCategory)) {
                    onSubCategoryChange(s);
                    onBrandChange(null);
                  }
                }}
              />
            </MotionWrapper>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {formData.subCategory && filteredBrands && filteredBrands.length > 0 && (
            <MotionWrapper key="brand-step">
              <BrandStep
                brands={filteredBrands}
                selected={formData.brand}
                onSelect={(b) => onBrandChange(b)}
              />
            </MotionWrapper>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default CategoryPicker;