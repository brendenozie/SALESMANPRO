import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Header from "../../../components/shop/header/Header";
import Footer from "../../../components/shop/footer/Footer";
import Cart from "../../../components/cart";
import debounce from "lodash.debounce";
import { ArrowPathIcon ,XCircleIcon, MagnifyingGlassCircleIcon, ChevronDoubleDownIcon, StarIcon, CheckCircleIcon, AdjustmentsVerticalIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import Filters from "../../../components/Filters";

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
        {/* <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Filters filters={filters} setFilters={setFilters} uniqueBrands={uniqueBrands} uniqueCategories={uniqueCategories} />
          <ProductGrid loading={loading} products={products} />
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
      <Footer />
      <Cart /> 
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
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(() => (
          <SkeletonCard className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition"/>
        ))}
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
  return (
    <motion.div
      onClick={() => router.push(`/shop/product/${product.id}`)}
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition"
    >
      <img src={product.image} alt={product.newName} className="h-40 w-full object-cover rounded-lg" />
      <h3 className="mt-2 text-lg font-semibold">{product.newName}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.newDescription}</p>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xl font-bold text-yellow-500">${product.sellingPrice.toFixed(2)}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="flex items-center bg-yellow-400 text-black px-4 py-2 rounded-full shadow-md hover:bg-yellow-500 transition"
        ><ShoppingCartIcon className="w-5 h-5 mr-1" /> Add</motion.button>
      </div>
    </motion.div>
  );
};

const ProductCardV1 = ({ product }) => {
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

