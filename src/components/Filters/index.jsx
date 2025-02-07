import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdjustmentsVerticalIcon, StarIcon, ChevronDoubleDownIcon, CheckCircleIcon, MagnifyingGlassIcon, ChevronDownIcon, XCircleIcon } from "@heroicons/react/24/outline";


const Filters = ({ filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/shop/categories?limit=30");
        if (!response.ok) throw new Error("Failed to fetch categories.");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, []);

  const filteredSubCategories = useMemo(() => {
    if (!selectedCategories.length) return [];
    return Array.from(
      new Set(selectedCategories.flatMap((category) => category?.subcategories || []))
    );
  }, [selectedCategories]);

  const filteredBrands = useMemo(() => {
    if (!selectedCategories.length) return [];
    return Array.from(
      new Set(selectedCategories.flatMap((category) => category?.allBrands || []))
    );
  }, [selectedCategories]);

  const handleFilterChange = useCallback(
    (key, value) => {
      setLocalFilters((prev) => {
        const updatedFilters = { ...prev, [key]: value };
        setFilters(updatedFilters);
        return updatedFilters;
      });
    },
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      brand: [],
      category: [],
      subCategory: [],
      priceRange: [0, 1000],
      rating: "",
      availability: "",
      sort: "popularity",
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
  }, [setFilters]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md sticky top-4 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
          <AdjustmentsVerticalIcon className="w-6 h-6 text-yellow-500" /> Filters
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-transform duration-200"
          aria-label="Toggle Filters"
          aria-expanded={isOpen}
        >
          <ChevronDoubleDownIcon
            className={`w-6 h-6 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-4 w-full max-w-full"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CategoryFilter
              selectedCategories={selectedCategories}
              setSelectedCategories={(value) => {
                setSelectedCategories(value);
                console.log("Category",value);
                handleFilterChange("category", value);
              }}
              categories={categories}
            />
            <SubCategoryFilter
              selectedSubCategory={selectedSubCategories}
              setSelectedSubCategory={(value) => {
                console.log("Subcategory",value);
                console.log("1111Subcategory",selectedSubCategories);
                setSelectedSubCategories(value);
                handleFilterChange("subCategory", value);
              }}
              categories={filteredSubCategories}
            />
            <BrandFilter
              selectedBrands={selectedBrands}
              setSelectedBrands={(value) => {
                setSelectedBrands(value);
                console.log("Subcategory",value);
                handleFilterChange("brand", value);
              }}
              brands={filteredBrands}
            />
            <RatingFilter
              selectedRating={localFilters.rating}
              setSelectedRating={(value) => handleFilterChange("rating", value)}
            />
            <PriceRangeFilter
              priceRange={localFilters.priceRange}
              setPriceRange={(value) => handleFilterChange("priceRange", value)}
            />
            <AvailabilityFilter
              availability={localFilters.availability}
              setAvailability={(value) => handleFilterChange("availability", value)}
            />
            <SortFilter
              sortOption={localFilters.sort}
              setSortOption={(value) => handleFilterChange("sort", value)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={clearFilters}
        className="mt-4 w-full py-2 bg-red-400 text-white rounded-xl hover:bg-red-500 transition-transform duration-200 hover:scale-105"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default Filters;

// const Filters = ({ filters, setFilters}) => {
  
//   const [localFilters, setLocalFilters] = useState(filters);
//   const [isOpen, setIsOpen] = useState(true);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [selectedSubCategories, setSelectedSubCategories] = useState([]);
//   const [selectedBrands, setSelectedBrands] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [error, setError] = useState(null);

  
//   // Memoized filtered subcategories & brands based on selected categories
//   const filteredSubCategories = useMemo(() => {
//     if (selectedCategories.length === 0) return [];

//     return Array.from(
//       new Set(selectedCategories.flatMap(category => category?.subcategories || []))
//     );
//   }, [selectedCategories]);

//   const filteredBrands = useMemo(() => {
//     if (selectedCategories.length === 0) return [];

//     return Array.from(
//       new Set(selectedCategories.flatMap(category => category?.allBrands || []))
//     );
//   }, [selectedCategories]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await fetch('/api/shop/categories?limit=30');
//         if (!response.ok) throw new Error("Failed to fetch categories.");
//         const data = await response.json();
//         setCategories(data.categories);
//       } catch (err) {
//         setError(err.message);
//       }
//     };

//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     setLocalFilters(filters);
//   }, [localFilters, setFilters]);

//   const handleFilterChange = useCallback((key, value) => {
//     setLocalFilters(prev => {
//       const updatedFilters = { ...prev, [key]: value };
//       setFilters(updatedFilters);
//       return updatedFilters;
//     });
//   }, [setFilters]);

//   const clearFilters = useCallback(() => {
//     const clearedFilters = { 
//       brand: [], 
//       category: [],
//       subCategory: [], 
//       priceRange: [0, 1000], 
//       rating: "", 
//       availability: "", 
//       sort: "popularity" 
//     };
//     setLocalFilters(clearedFilters);
//     setFilters(clearedFilters);
//   }, [setFilters]);



//   return (
//     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md sticky top-4 transition-all duration-300 ease-in-out">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
//           <AdjustmentsVerticalIcon className="w-6 h-6 text-yellow-500" /> Filters
//         </h3>
//         <button 
//           onClick={() => setIsOpen(!isOpen)} 
//           className="text-gray-600 hover:text-yellow-500 transition-transform duration-200"
//           aria-label="Toggle Filters"
//         >
//           <ChevronDoubleDownIcon className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
//         </button>
//       </div>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div 
//             initial={{ opacity: 0, height: 0 }} 
//             animate={{ opacity: 1, height: "auto" }} 
//             exit={{ opacity: 0, height: 0 }} 
//             className="flex flex-wrap gap-4 w-full max-w-full"
//             transition={{ duration: 0.3, ease: "easeInOut" }}
//           >
//             <CategoryFilter selectedCategories={selectedCategories} setSelectedCategories={(value) => {  setSelectedCategories(value);  handleFilterChange("category", value);  }}  categories={categories} />
//             <SubCategoryFilter selectedSubCategory={selectedSubCategories} setSelectedSubCategory={(value) => {setSelectedSubCategories(value); handleFilterChange("subCategory", value);  }} categories={filteredSubCategories} />
//             <BrandFilter selectedBrands={selectedBrands} setSelectedBrands={(value) => {  setSelectedBrands(value); handleFilterChange("brands", value); }} brands={filteredBrands} />
//             <RatingFilter selectedRating={localFilters.rating} setSelectedRating={value => handleFilterChange("rating", value)} />
//             <PriceRangeFilter priceRange={localFilters.priceRange} setPriceRange={value => handleFilterChange("priceRange", value)} />
//             <AvailabilityFilter availability={localFilters.availability} setAvailability={value => handleFilterChange("availability", value)} />
//             <SortFilter sortOption={localFilters.sort} setSortOption={value => handleFilterChange("sort", value)} />
//           </motion.div>

//         )}
//       </AnimatePresence>

//       <button 
//         onClick={clearFilters} 
//         className="mt-4 w-full py-2 bg-red-400 text-white rounded-xl hover:bg-red-500 transition-transform duration-200 hover:scale-105"
//       >
//         Clear All Filters
//       </button>
//     </div>
//   );
// };

// export default Filters;


const FilterButton = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between gap-2 p-3 rounded-xl border font-medium text-sm transition-all duration-200
      ${isSelected ? "bg-yellow-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} 
      hover:scale-105 active:scale-95`}
    aria-pressed={isSelected}
    aria-label={`Filter by ${label}`}
  >
    <span>{label}</span>
    {isSelected && <CheckCircleIcon className="w-5 h-5 text-white" />}
  </button>
);

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

const FilterContainer = ({ title, children, isOpen, toggleOpen, onReset }) => (
  <div className="bg-white rounded-xl p-4 shadow-md">
    {/* Header with title, reset button, and expand/collapse toggle */}
    <div className="flex justify-between items-center mb-2">
      <h4 className="text-gray-800 font-semibold text-lg">{title}</h4>
      <div className="flex items-center gap-2">
        <button 
          onClick={onReset} 
          className="text-red-500 text-sm flex items-center gap-1 hover:text-red-600 transition"
          aria-label={`Clear ${title.toLowerCase()} filters`}
        >
          <XCircleIcon className="w-5 h-5" /> Reset
        </button>
        <button 
          onClick={toggleOpen} 
          className="text-gray-600 hover:text-yellow-500 transition"
          aria-label={`Toggle ${title.toLowerCase()} filters`}
        >
          <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>

    {/* Animated expandable content */}
    <motion.div 
      initial={{ height: 0, opacity: 0 }} 
      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} 
      exit={{ height: 0, opacity: 0 }} 
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  </div>
);

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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto mt-3">
        {filteredcategories.length > 0 ? (
          filteredcategories.map((category) => (
            <FilterButton 
              key={category.id} 
              label={category.name} 
              isSelected={selectedSubCategory.includes(category)} 
              onClick={() => toggleSubCategory(category)} 
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm">No brands found</p>
        )}
      </div>
    </FilterContainer>
  );
};

const BrandFilter = ({ selectedBrands, setSelectedBrands, brands }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(brands > 0);
  const resetBrands = () => setSelectedBrands([]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredBrands = brands.filter((brand) =>
    brand.length > 0 && brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FilterContainer title="Brand" isOpen={isOpen} toggleOpen={() => setIsOpen(!isOpen)} onReset={resetBrands}>
      <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search brands..." />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto mt-3">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <FilterButton 
              key={brand} 
              label={brand} 
              isSelected={selectedBrands.includes(brand)} 
              onClick={() => toggleBrand(brand)} 
            />
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
  const [isOpen, setIsOpen] = useState(true);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c.name !== category.name) : [...prev, category]
    );
  };

  const resetCategories = () => setSelectedCategories([]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FilterContainer title="Category" isOpen={isOpen} toggleOpen={() => setIsOpen(!isOpen)} onReset={resetCategories}>
      <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search categories..." />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto mt-3">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <FilterButton 
              key={category.id} 
              label={category.name} 
              isSelected={selectedCategories.includes(category)} 
              onClick={() => toggleCategory(category)} 
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm">No categories found</p>
        )}
      </div>
    </FilterContainer>
  );
};

const PriceRangeFilter = ({ priceRange, setPriceRange }) => (
  <div>
    <label className="text-gray-700 font-semibold mb-2 block">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
    <div className="flex gap-4 items-center">
      <input
        type="number"
        value={priceRange[0]}
        min="0"
        max="1000"
        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
        className="w-20 p-2 border rounded-lg"
      />
      <span className="text-gray-500">-</span>
      <input
        type="number"
        value={priceRange[1]}
        min="0"
        max="1000"
        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
        className="w-20 p-2 border rounded-lg"
      />
    </div>
  </div>
);

const RatingFilter = ({ selectedRating, setSelectedRating }) => {
  return (
    <div className="space-y-2 w-full max-w-full">
      <label className="text-gray-700 dark:text-gray-300 font-semibold block">Minimum Rating</label>
      <div className="flex flex-wrap gap-2 justify-start">
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setSelectedRating(rating)}
            className={`flex items-center justify-center min-w-[40px] px-3 py-2 rounded-full border transition-transform duration-200 transform hover:scale-105 focus:ring-2 focus:ring-yellow-400
              ${selectedRating === rating ? 'bg-yellow-400 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}
            `}
            aria-pressed={selectedRating === rating}
            aria-label={`Filter by ${rating} star${rating > 1 ? 's' : ''}`}
          >
            {/* {'⭐'.repeat(rating)} */}
            {Array.from({ length: rating }).map((_, i) => <StarIcon key={i} className="w-4 h-4" />)}
          </button>
        ))}
      </div>
    </div>
  );
};

const AvailabilityFilter = ({ availability, setAvailability }) => (
  <div>
    <label className="text-gray-700 font-semibold mb-2 block">Availability</label>
    <div className="flex gap-4">
      {['in-stock', 'out-of-stock'].map((option) => (
        <button
          key={option}
          onClick={() => setAvailability(option)}
          className={`flex items-center gap-2 p-2 rounded-xl border ${availability === option ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700'} hover:shadow-md transition`}
        >
          <CheckCircleIcon className="w-5 h-5" /> {option.replace('-', ' ')}
        </button>
      ))}
    </div>
  </div>
);

const SortFilter = ({ sortOption, setSortOption }) => (
  <div>
    <label className="text-gray-700 font-semibold mb-2 block">Sort By</label>
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-yellow-400"
    >
      <option value="popularity">Popularity</option>
      <option value="price-asc">Price (Low to High)</option>
      <option value="price-desc">Price (High to Low)</option>
    </select>
  </div>
);


