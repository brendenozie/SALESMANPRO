import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/router';
import Header from "../../../components/shop/header/Header";
import Footer from "../../../components/shop/footer/Footer";
import debounce from "lodash.debounce";
import { ArrowPathIcon , StarIcon, CheckCircleIcon, AdjustmentsVerticalIcon } from "@heroicons/react/24/outline";

// import { useState, useMemo, useEffect, useCallback, useRef } from "react";
// import { motion } from "framer-motion";
// import { useRouter } from 'next/router';
// import Header from "../../../components/shop/header/Header";
// import Footer from "../../../components/shop/footer/Footer";
// import debounce from "lodash.debounce";
// import { ArrowPathIcon, StarIcon, CheckCircleIcon, AdjustmentsVerticalIcon } from "@heroicons/react/24/outline";

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    brand: "",
    category: "",
    rating: "",
    availability: "",
    sort: "popularity",
    priceRange: [0, 1000],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const observer = useRef();

  useEffect(() => {
    setProducts([]); 
    setPage(1);
    setHasMore(true);
  }, [searchTerm, filters]);

  const fetchProducts = async (pageNum) => {
    if (!hasMore || loading) return;
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum,
        limit: 8,
        search: searchTerm,
        brand: filters.brand,
        category: filters.category,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        sort: filters.sort,
      }).toString();

      const response = await fetch(`/api/shop/products?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch products.");
      const data = await response.json();

      setProducts((prev) => [...prev, ...data.products]);
      setTotalPages(data.totalPages);
      if (data.products.length === 0 || pageNum >= data.totalPages) setHasMore(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [searchTerm, filters]);

  
  const uniqueBrands = [...new Set(products.map((p) => p.inventoryItem.product.brand))];
  const uniqueCategories = [...new Set(products.map((p) => p.inventoryItem.product.category))];


  return (
    <>
      <Header CartItem={cartItems} />
      <div className="container mx-auto p-8 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Explore Our Collection
        </h2>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Filters filters={filters} setFilters={setFilters} uniqueBrands={uniqueBrands} uniqueCategories={uniqueCategories} />
          <ProductGrid loading={loading} products={products} />
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
      <Footer />
    </>
  );
};

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="flex flex-col sm:flex-row gap-6 mb-8 justify-center">
    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="flex-1 p-4 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
    />
    <button onClick={() => setSearchTerm("")} className="p-4 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md">
      Clear
    </button>
  </div>
);

const ProductGrid = ({ loading, products }) => (
  <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
    {loading && (
      <div>
        <SkeletonCard />
        <div className="col-span-full flex justify-center mt-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <ArrowPathIcon className="w-8 h-8 text-yellow-500 animate-spin" />
          </motion.div>
        </div>
      </div>
    )}
  </div>
);

const ProductCard = ({ product }) => {
const router = useRouter();

  const handleProductClick = () => {
    router.push(`/shop/product/${product.id}`);
  };

return (
  <motion.div
    onClick={handleProductClick}
    whileHover={{ scale: 1.05, boxShadow: "0px 15px 25px rgba(0, 0, 0, 0.15)" }}
    transition={{ duration: 0.3 }}
    className="relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-transform hover:-translate-y-1"
  >
    {/* Sale & New Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        {product.isNew && (
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            New
          </span>
        )}
        {product.isOnSale && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            Sale
          </span>
        )}
      </div>

      {/* Image Section */}
      <div className="w-full h-36 bg-gray-100 rounded-xl flex justify-center items-center overflow-hidden relative">
        <img
          src={product.image}
          alt={product.newName || "Product image"}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

    <h3 className="text-lg font-semibold line-clamp-1">{product.newName}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
      {product.newDescription}
    </p>
    {/* Star Rating */}
      <div className="flex items-center gap-1 mt-1">
        {[...Array(5)].map((_, index) => (
          <StarIcon
            key={index}
            size={6}
            className={`h-4 ${index < (product.rating || 0) ? "text-yellow-300" : "text-gray-300"}`}
            fill={index < (product.rating || 0) ? "currentColor" : "none"}
          />
        ))}
      </div>
    {/* Price & Button */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-xl font-bold text-yellow-300">
          ${product.sellingPrice.toFixed(2)}
        </span>

        <motion.button
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          // onClick={handleAddToCart}
          className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-yellow-800 transition shadow-md"
          aria-label={`Add ${product.newName} to cart`}
        >
          Add to Cart
        </motion.button>
      </div>
  </motion.div>
)};

export default ProductList;


const PaginationControls = ({ page, setPage, totalPages }) => {
  return (
    <div className="flex justify-center items-center mt-8 gap-4">
      <motion.button
        whileHover={{ scale: page > 1 ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className={`px-6 py-3 rounded-lg text-sm font-semibold transition shadow-md ${
          page === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-yellow-600 text-white hover:bg-yellow-400"
        }`}
      >
        Previous
      </motion.button>

      <span className="text-gray-700 text-lg">
        Page <span className="font-bold">{page}</span> of {totalPages}
      </span>

      <motion.button
        whileHover={{ scale: page < totalPages ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage(prev => (prev < totalPages ? prev + 1 : prev))}
        disabled={page === totalPages}
        className={`px-6 py-3 rounded-lg text-sm font-semibold transition shadow-md ${
          page === totalPages
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-yellow-300 text-white hover:bg-yellow-600"
        }`}
      >
        Next
      </motion.button>
    </div>
  );
};



const SkeletonCard = () => (
  <div className="bg-gray-200 h-80 w-full animate-pulse rounded-lg"></div>
);

const Filters = ({ filters, setFilters, uniqueBrands, uniqueCategories }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const applyFilters = () => {
    setFilters(localFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AdjustmentsVerticalIcon className="w-5 h-5" /> Filters
        </h3>
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-yellow-300 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          Apply Filters
        </button>
      </div>
      
      <div className="grid gap-4">
        <BrandFilter selectedBrand={localFilters.brand} setSelectedBrand={(brand) => setLocalFilters({ ...localFilters, brand })} brands={uniqueBrands} />
        <CategoryFilter selectedCategory={localFilters.category} setSelectedCategory={(category) => setLocalFilters({ ...localFilters, category })} categories={uniqueCategories} />
        <PriceRangeFilter priceRange={localFilters.priceRange} setPriceRange={(priceRange) => setLocalFilters({ ...localFilters, priceRange })} />
        <RatingFilter selectedRating={localFilters.rating} setSelectedRating={(rating) => setLocalFilters({ ...localFilters, rating })} />
        <AvailabilityFilter availability={localFilters.availability} setAvailability={(availability) => setLocalFilters({ ...localFilters, availability })} />
        <SortFilter sortOption={localFilters.sort} setSortOption={(sort) => setLocalFilters({ ...localFilters, sort })} />
      </div>
    </div>
  );
};

const BrandFilter = ({ selectedBrand, setSelectedBrand, brands }) => (
  <div>
    <label className="text-gray-700 font-medium">Brand</label>
    <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-300">
      <option value="">All Brands</option>
      {brands.map((brand, index) => (
        <option key={index} value={brand}>{brand}</option>
      ))}
    </select>
  </div>
);

const CategoryFilter = ({ selectedCategory, setSelectedCategory, categories }) => (
  <div>
    <label className="text-gray-700 font-medium">Category</label>
    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-300">
      <option value="">All Categories</option>
      {categories.map((category, index) => (
        <option key={index} value={category}>{category}</option>
      ))}
    </select>
  </div>
);

const PriceRangeFilter = ({ priceRange, setPriceRange }) => (
  <div>
    <label className="text-gray-700 font-medium">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
    <div className="flex gap-2">
      <input
        type="range" min="0" max="1000" value={priceRange[0]}
        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
        className="w-full  accent-yellow-300"
      />
      <input
        type="range" min="0" max="1000" value={priceRange[1]}
        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
        className="w-full accent-yellow-300"
      />
    </div>
  </div>
);

const RatingFilter = ({ selectedRating, setSelectedRating }) => (
  <div>
    <label className="text-gray-700 font-medium">Minimum Rating</label>
    <div className="flex gap-2">
      {[5, 4, 3, 2, 1].map((rating) => (
        <button
          key={rating}
          onClick={() => setSelectedRating(rating)}
          className={`p-2 rounded-full ${selectedRating === rating ? 'bg-yellow-300 text-white' : 'bg-gray-200'}`}
        >
          <StarIcon className="w-5 h-5" /> {rating}+
        </button>
      ))}
    </div>
  </div>
);

const AvailabilityFilter = ({ availability, setAvailability }) => (
  <div>
    <label className="text-gray-700 font-medium">Availability</label>
    <div className="flex gap-4">
      {['in-stock', 'out-of-stock'].map((option) => (
        <label key={option} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={availability === option}
            onChange={() => setAvailability(option)}
          />
          <CheckCircleIcon className="w-5 h-5" /> {option.replace('-', ' ')}
        </label>
      ))}
    </div>
  </div>
);

const SortFilter = ({ sortOption, setSortOption }) => (
  <div>
    <label className="text-gray-700 font-medium">Sort By</label>
    <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-300">
      <option value="popularity">Popularity</option>
      <option value="price-asc">Price (Low to High)</option>
      <option value="price-desc">Price (High to Low)</option>
    </select>
  </div>
);

