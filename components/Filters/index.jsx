import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AdjustmentsVerticalIcon, 
  StarIcon, 
  ChevronDoubleDownIcon, 
  CheckCircleIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  XCircleIcon, 
  AdjustmentsHorizontalIcon, 
  XMarkIcon, 
  CheckIcon, 
  MagnifyingGlassCircleIcon 
} from "@heroicons/react/24/outline";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const FiltersV1 = ({ filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/shop/categories?limit=30`);
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Filter fetch error:", err);
      }
    };
    fetchCategories();
  }, []);

  const filteredSubCategories = useMemo(() => {
    if (!selectedCategories.length) return [];
    return Array.from(new Set(selectedCategories.flatMap((c) => c?.subcategories || [])));
  }, [selectedCategories]);

  const filteredBrands = useMemo(() => {
    if (!selectedCategories.length) return [];
    return Array.from(new Set(selectedCategories.flatMap((c) => c?.allBrands || [])));
  }, [selectedCategories]);

  const handleFilterChange = useCallback((key, value) => {
    setLocalFilters((prev) => {
      const updatedFilters = { ...prev, [key]: value };
      if (JSON.stringify(updatedFilters) !== JSON.stringify(prev)) {
        setFilters(updatedFilters);
      }
      return updatedFilters;
    });
  }, [setFilters]);

  useEffect(() => {
    if (!isFirstRender.current) {
      handleFilterChange("category", selectedCategories.map((c) => c.name));
    }
  }, [selectedCategories, handleFilterChange]);

  useEffect(() => {
    if (!isFirstRender.current) {
      handleFilterChange("subCategory", selectedSubCategories.map((c) => c.name));
    }
  }, [selectedSubCategories, handleFilterChange]);

  useEffect(() => {
    if (!isFirstRender.current) {
      handleFilterChange("brand", selectedBrands);
    }
  }, [selectedBrands, handleFilterChange]);

  useEffect(() => { isFirstRender.current = false; }, []);

  const clearFilters = useCallback(() => {
    const cleared = {
      brand: [],
      category: [],
      subCategory: [],
      priceRange: [0, 1000000000],
      rating: "",
      availability: "",
      sort: "desc",
    };
    setLocalFilters(cleared);
    setFilters(cleared);
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
  }, [setFilters]);

  // Common Filter UI to be used in both Desktop and Mobile
  const SharedFilterContent = () => (
    <div className="space-y-4">
      <CategoryFilter selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} categories={categories} />
      <SubCategoryFilter selectedSubCategory={selectedSubCategories} setSelectedSubCategory={setSelectedSubCategories} categories={filteredSubCategories} />
      <BrandFilter selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands} brands={filteredBrands} />
      <RatingFilter selectedRating={localFilters.rating} setSelectedRating={(val) => handleFilterChange("rating", val)} />
      <PriceRangeFilter priceRange={localFilters.priceRange} setPriceRange={(val) => handleFilterChange("priceRange", val)} />
      <AvailabilityFilter availability={localFilters.availability} setAvailability={(val) => handleFilterChange("availability", val)} />
      <SortFilter sortOption={localFilters.sort} setSortOption={(val) => handleFilterChange("sort", val)} />
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
              <AdjustmentsVerticalIcon className="w-6 h-6 text-yellow-500" /> Filters
            </h3>
            <button onClick={() => setIsOpen(!isOpen)}>
              <ChevronDoubleDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <SharedFilterContent />
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={clearFilters} className="mt-4 w-full py-2 bg-red-400 text-white rounded-xl hover:bg-red-500 transition-all">
            Clear All
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <button
          className="fixed bottom-24 left-6 bg-amber-500 text-white p-4 rounded-full shadow-2xl z-[60] flex items-center gap-2 font-bold"
          onClick={() => setIsMobileOpen(true)}
        >
          <AdjustmentsHorizontalIcon className="h-6 w-6" />
          <span>Filters</span>
        </button>

        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
              />
              {/* Drawer */}
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 w-full h-[85vh] bg-zinc-50 dark:bg-zinc-900 z-[80] rounded-t-[2.5rem] shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-black uppercase dark:text-white">Refine Search</h2>
                  <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow pb-32">
                   <SharedFilterContent />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-4">
                  <button onClick={clearFilters} className="flex-1 py-4 font-bold text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-widest">
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="flex-[2] py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 uppercase text-xs tracking-widest"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// 1. (Optional) Define Shared UI outside if you want to keep it a component
// Or just inline it as shown below to avoid prop-drilling.

const Filters = ({ filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const isFirstRender = useRef(true);

  // Sync props to local state
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Fetch logic...
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/shop/categories?limit=30`);
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) { console.error(err); }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setLocalFilters((prev) => {
      const updatedFilters = { ...prev, [key]: value };
      if (JSON.stringify(updatedFilters) !== JSON.stringify(prev)) {
        setFilters(updatedFilters);
      }
      return updatedFilters;
    });
  }, [setFilters]);

  // CATEGORY/BRAND SYNC: 
  // To stop flickering, we ensure these only fire when the values actually change
  useEffect(() => {
    if (isFirstRender.current) return;
    handleFilterChange("category", selectedCategories.map((c) => c.name));
  }, [selectedCategories, handleFilterChange]);

  useEffect(() => {
    if (isFirstRender.current) return;
    handleFilterChange("subCategory", selectedSubCategories.map((c) => c.name));
  }, [selectedSubCategories, handleFilterChange]);

  useEffect(() => {
    if (isFirstRender.current) { 
        isFirstRender.current = false; 
        return; 
    }
    handleFilterChange("brand", selectedBrands);
  }, [selectedBrands, handleFilterChange]);

  // Memos for derived data
  const filteredSubCategories = useMemo(() => 
    selectedCategories.flatMap((c) => c?.subcategories || []), 
  [selectedCategories]);

  const filteredBrands = useMemo(() => 
    selectedCategories.flatMap((c) => c?.allBrands || []), 
  [selectedCategories]);

    const clearFilters = useCallback(() => {
      const cleared = {
        brand: [],
        category: [],
        subCategory: [],
        priceRange: [0, 1000000000],
        rating: "",
        availability: "",
        sort: "desc",
      };
      setLocalFilters(cleared);
      setFilters(cleared);
      setSelectedCategories([]);
      setSelectedSubCategories([]);
      setSelectedBrands([]);
    }, [setFilters]);

  // Helper for the JSX to avoid the "Inner Component" bug
  const renderFilterList = () => (
    <div className="space-y-4">
      <CategoryFilter selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} categories={categories} />
      <SubCategoryFilter selectedSubCategory={selectedSubCategories} setSelectedSubCategory={setSelectedSubCategories} categories={filteredSubCategories} />
      <BrandFilter selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands} brands={filteredBrands} />
      <RatingFilter selectedRating={localFilters.rating} setSelectedRating={(val) => handleFilterChange("rating", val)} />
      <PriceRangeFilter priceRange={localFilters.priceRange} setPriceRange={(val) => handleFilterChange("priceRange", val)} />
      <AvailabilityFilter availability={localFilters.availability} setAvailability={(val) => handleFilterChange("availability", val)} />
      <SortFilter sortOption={localFilters.sort} setSortOption={(val) => handleFilterChange("sort", val)} />
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md sticky top-4">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
               <AdjustmentsVerticalIcon className="w-6 h-6 text-yellow-500" /> Filters
             </h3>
             <button onClick={() => setIsOpen(!isOpen)}>
               <ChevronDoubleDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
             </button>
          </div>
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div 
                key="filter-content" // Key helps Framer Motion track the element
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                {renderFilterList()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile View */}
      {/* Mobile View */}
      <div className="block md:hidden">
        <button
          className="fixed bottom-24 left-6 bg-amber-500 text-white p-4 rounded-full shadow-2xl z-[60] flex items-center gap-2 font-bold"
          onClick={() => setIsMobileOpen(true)}
        >
          <AdjustmentsHorizontalIcon className="h-6 w-6" />
          <span>Filters</span>
        </button>

        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
              />
              {/* Drawer */}
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 w-full h-[85vh] bg-zinc-50 dark:bg-zinc-900 z-[80] rounded-t-[2.5rem] shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-black uppercase dark:text-white">Refine Search</h2>
                  <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                
                {isMobileOpen && (
                    <motion.div
                      initial={{ y: "100%" }} 
                      animate={{ y: 0 }} 
                      exit={{ y: "100%" }}
                      className="fixed bottom-0 left-0 w-full h-[85vh] bg-zinc-50 dark:bg-zinc-900 z-[80] rounded-t-[2.5rem]"
                    >
                      <div className="p-6 overflow-y-auto h-full pb-32">
                        {renderFilterList()}
                      </div>
                    </motion.div>
                  )}

                <div className="absolute bottom-0 left-0 w-full p-6 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-4">
                  <button onClick={clearFilters} className="flex-1 py-4 font-bold text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-widest">
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="flex-[2] py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 uppercase text-xs tracking-widest"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* <div className="block md:hidden">
        <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
               <AdjustmentsVerticalIcon className="w-6 h-6 text-yellow-500" /> Filters
             </h3>
             <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
               <ChevronDoubleDownIcon className={`w-6 h-6 transform transition-transform ${isMobileOpen ? "rotate-180" : ""}`} />
             </button>
          </div>
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-zinc-50 dark:bg-zinc-900 z-[80] rounded-t-[2.5rem]"
            >
               <div className="p-6 overflow-y-auto h-full pb-32">
                 {renderFilterList()}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div> */}
    </>
  );
};

export default Filters;


const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400"
      aria-label={placeholder}
    />
    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
  </div>
);

const FilterContainer = ({ title, children, isOpen, toggleOpen, onReset }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-md dark:shadow-lg transition w-full">
      {/* Header with title, reset button, and expand/collapse toggle */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-gray-800 dark:text-gray-200 font-semibold text-lg">{title}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-red-500 text-sm flex items-center gap-1 hover:text-red-600 dark:hover:text-red-400 transition"
            aria-label={`Clear ${title.toLowerCase()} filters`}
          >
            <XCircleIcon className="w-5 h-5" /> Reset
          </button>
          <button
            onClick={toggleOpen}
            className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition"
            aria-label={`Toggle ${title.toLowerCase()} filters`}
          >
            <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Smooth Collapsible Animation */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="pt-2">{children}</div>
      </motion.div>
    </div>
  );
};

const BrandFilter = ({ selectedBrands, setSelectedBrands, brands = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(brands.length > 0);

  const resetBrands = useCallback(() => setSelectedBrands([]), [setSelectedBrands]);

  const toggleBrand = useCallback(
    (brand) => {
      setSelectedBrands((prev) =>
        prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
      );
    },
    [setSelectedBrands]
  );

  const filteredBrands = brands.filter((brand) =>
    brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FilterContainer title="Brand" isOpen={isOpen} toggleOpen={() => setIsOpen(!isOpen)} onReset={resetBrands}>

      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search brands..."
        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400"
      />

      {/* Brand List */}
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto mt-4">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <motion.button
              key={brand}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleBrand(brand)}
              aria-pressed={selectedBrands.includes(brand)}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 dark:border-gray-700 
                ${selectedBrands.includes(brand) ? "bg-yellow-500 text-white dark:bg-yellow-400" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"}`}
            >
              {brand}
            </motion.button>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No brands found</p>
        )}
      </div>
    </FilterContainer>
  );
};

const SubCategoryFilter = ({ selectedSubCategory, setSelectedSubCategory, categories }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(categories > 0);

  const toggleSubCategory = (category) => {
    setSelectedSubCategory((prev) =>
      prev.includes(category) ? prev.filter((b) => b.name !== category.name) : [...prev, category]
    );
  };

  const resetSubCategorys = () => setSelectedSubCategory([]);

  const filteredcategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())  
  );

  return (
    <FilterContainer title="Sub Category" isOpen={isOpen} toggleOpen={() => setIsOpen(!isOpen)} onReset={resetSubCategorys}>
      <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search categories..." />
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto mt-4">
        {filteredcategories.length > 0 ? (
          filteredcategories.map((category) => (
            <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSubCategory(category)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 dark:border-gray-700 
                ${selectedSubCategory.includes(category) ? "bg-yellow-500 text-white dark:bg-yellow-400" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"}`}
              >
                {category.name}
              </motion.button>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No brands found</p>
        )}
      </div>
    </FilterContainer>
  );
};

const CategoryFilter = ({ selectedCategories, setSelectedCategories, categories }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = useCallback(
    (category) => {
      setSelectedCategories((prev) =>
        prev.some((c) => c.id === category.id)
          ? prev.filter((c) => c.id !== category.id)
          : [...prev, category]
      );
    },
    [setSelectedCategories]
  );

  const resetCategories = () => setSelectedCategories([]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-900 dark:text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Category</h2>
        </div>
        <button
          onClick={resetCategories}
          className="text-yellow-500 dark:text-yellow-400 text-sm hover:underline flex items-center gap-1"
        >
          <XMarkIcon className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassCircleIcon className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          aria-label="Search categories"
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-700 rounded-md pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category List */}
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto mt-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const isSelected = selectedCategories.some((c) => c.id === category.id);
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCategory(category)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 dark:border-gray-700 
                ${isSelected ? "bg-yellow-500 text-white dark:bg-yellow-400" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"}`}
              >
                {category.name}
              </motion.button>
            );
          })
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No categories found</p>
        )}
      </div>
    </motion.div>
  );
};

const PriceRangeFilter = ({ priceRange, setPriceRange }) => {
  const [localRange, setLocalRange] = useState(priceRange);

  // Update parent state with a delay to prevent excessive re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      setPriceRange(localRange);
    }, 500); // Debounce by 500ms

    return () => clearTimeout(handler);
  }, [localRange, setPriceRange]);

  const handleChange = (index, value) => {
    const newRange = [...localRange];
    newRange[index] = value === "" ? 0 : Math.max(0, Math.min(100000000, Number(value)));
    setLocalRange(newRange);
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 w-full">
      <label className="text-gray-900 dark:text-gray-200 font-semibold mb-2 block">
        Price Range: ${localRange[0]} - ${localRange[1]}
      </label>
      <div className="flex gap-4 items-center w-full">
        <input
          type="number"
          value={localRange[0]}
          min="0"
          max="1000000000"
          onChange={(e) => handleChange(0, e.target.value)}
          className=" p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 w-1/2"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number"
          value={localRange[1]}
          min="0"
          max="1000000000"
          onChange={(e) => handleChange(1, e.target.value)}
          className=" p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 w-1/2"
        />
      </div>
    </div>
  );
};

const RatingFilter = ({ selectedRating, setSelectedRating }) => (
  <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-4">
    <label className="text-gray-900 dark:text-gray-200 font-semibold block">Minimum Rating</label>
    <div className="flex flex-wrap gap-2 justify-start mt-2">
      {[5, 4, 3, 2, 1].map((rating) => (
        <button
          key={rating}
          onClick={() => setSelectedRating(rating)}
          className={`flex items-center justify-center min-w-[40px] px-3 py-2 rounded-full border transition-transform duration-200 transform hover:scale-105 focus:ring-2 focus:ring-yellow-400
            ${selectedRating === rating ? 'bg-yellow-400 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
        >
          {Array.from({ length: rating }).map((_, i) => <StarIcon key={i} className="w-4 h-4" />)}
        </button>
      ))}
    </div>
  </div>
);

const AvailabilityFilter = ({ availability, setAvailability }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 w-full"
  >
    <label className="text-gray-900 dark:text-gray-200 font-semibold mb-2 block">Availability</label>
    <div className="flex gap-4">
      {["in-stock", "out-of-stock"].map((option) => (
        <motion.button
          key={option}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAvailability(option)}
          className={`flex items-center gap-2 p-2 rounded-xl border transition-all 
            ${availability === option ? "bg-yellow-400 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"} 
            hover:shadow-md`}
        >
          <CheckCircleIcon className="w-5 h-5" /> {option.replace("-", " ")}
        </motion.button>
      ))}
    </div>
  </motion.div>
);

const SortFilter = ({ sortOption, setSortOption }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 w-full"
  >
    <label className="text-gray-900 dark:text-gray-200 font-semibold mb-2 block">Sort By</label>
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400"
    >
      <option value="popularity">Popularity</option>
      <option value="asc">Price (Low to High)</option>
      <option value="desc">Price (High to Low)</option>
    </select>
  </motion.div>
);
