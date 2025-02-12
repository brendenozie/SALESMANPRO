import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Header from "../../../components/shop/header/Header";
import Footer from "../../../components/shop/footer/Footer";
import Cart from "../../../components/cart";
import debounce from "lodash.debounce";
import { ArrowPathIcon, PlusIcon ,XCircleIcon, MagnifyingGlassCircleIcon, ChevronDoubleDownIcon, StarIcon, CheckCircleIcon, AdjustmentsVerticalIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import Filters from "../../../components/Filters";
import LocationModal from "../../../components/locationManager";

const ProductList = () => {
  const router = useRouter();
  const { query } = router;

  const [searchTerm, setSearchTerm] = useState(query.search || "");
  
  const [filters, setFilters] = useState({
    brand: query.brand ? (Array.isArray(query.brand) ? query.brand : [query.brand]) : [],
    category: query.category ? (Array.isArray(query.category) ? query.category : [query.category]) : [],
    subCategory: query.subCategory ? (Array.isArray(query.subCategory) ? query.subCategory : [query.subCategory]) : [],
    priceRange: [
      Number(query.minPrice) || 0,
      Number(query.maxPrice) || 10000000,
    ],
    rating: query.rating || "",
    availability: query.availability || "",
    sort: query.sort || "popularity",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const observer = useRef();

  // Sync filters with URL when filters change
  useEffect(() => {
    const queryParams = {
      ...(searchTerm && { search: searchTerm }),
      ...(filters.brand.length && { brand: filters.brand }),
      ...(filters.category.length && { category: filters.category }),
      ...(filters.subCategory.length && { subCategory: filters.subCategory }),
      ...(filters.priceRange[0] !== 0 && { minPrice: filters.priceRange[0] }),
      ...(filters.priceRange[1] !== 10000000 && { maxPrice: filters.priceRange[1] }),
      ...(filters.rating && { rating: filters.rating }),
      ...(filters.availability && { availability: filters.availability }),
      ...(filters.sort !== "popularity" && { sort: filters.sort }),
    };

    router.push({ pathname: router.pathname, query: queryParams }, undefined, { shallow: true });
  }, [filters, searchTerm]);

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
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        sort: filters.sort,
      });

      filters.brand.forEach((b) => queryParams.append("brand", b));
      filters.category.forEach((c) => queryParams.append("category", c));
      filters.subCategory.forEach((s) => queryParams.append("subCategory", s));

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

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };

    const handleObserver = (entities) => {
      const target = entities[0];
      if (target.isIntersecting) {
        setPage((prev) => prev + 1);
      }
    };

    observer.current = new IntersectionObserver(handleObserver, options);
  }, []);

  useEffect(() => {
    if (page > 1) {
      observer.current.observe(document.getElementById("observer"));
    }
    fetchProducts(page);
  }, [page]);

  return (
    <>
      <Header CartItem={cartItems} />
      <div className="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Explore Our Collection
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8 items-start">
          <Filters filters={filters} setFilters={setFilters} uniqueBrands={uniqueBrands} uniqueCategories={uniqueCategories} />
          <ProductGrid loading={loading} products={products} />
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
      <Footer />
      <Cart />
      <LocationModal/>
    </>
  );
};

// const ProductList = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filters, setFilters] = useState({
//     brand: [],
//     category: [],
//     subCategory: [],
//     priceRange: [0, 10000000],
//     rating: "",
//     availability: "",
//     sort: "popularity",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [products, setProducts] = useState([]);
//   const [hasMore, setHasMore] = useState(true);
//   const [cartItems, setCartItems] = useState([]);
//   const observer = useRef();

//   useEffect(() => {
//     setProducts([]); 
//     setPage(1);
//     setHasMore(true);
//   }, [searchTerm, filters]);

//   const fetchProducts = async (pageNum) => {
//     if (!hasMore || loading) return;
//     setLoading(true);
//     setError(null);
//     try {

//       console.log("filters", filters);

//       const queryParams = new URLSearchParams({
//         page: pageNum,
//         limit: 8,
//         search: searchTerm,
//         brand: filters.brand,
//         category: filters.category,
//         subCategory: filters.subCategory,
//         minPrice: filters.priceRange[0],
//         maxPrice: filters.priceRange[1],
//         sort: filters.sort,
//       }).toString();

//       const response = await fetch(`/api/shop/products?${queryParams}`);
//       if (!response.ok) throw new Error("Failed to fetch products.");
//       const data = await response.json();

//       setProducts((prev) => [...prev, ...data.products]);
//       setTotalPages(data.totalPages);
//       if (data.products.length === 0 || pageNum >= data.totalPages) setHasMore(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts(1);
//   }, [searchTerm, filters]);

  
//   const uniqueBrands = [...new Set(products.map((p) => p.inventoryItem.product.brand))];
//   const uniqueCategories = [...new Set(products.map((p) => p.inventoryItem.product.category))];

//   useEffect(() => {
//     const options = {
//       root: null,
//       rootMargin: "20px",
//       threshold: 0,
//     };

//     const handleObserver = (entities) => {
//       const target = entities[0];
//       if (target.isIntersecting) {
//         setPage((prev) => prev + 1);
//       }
//     };

//     observer.current = new IntersectionObserver(handleObserver, options);
//   }, []);

//   useEffect(() => {
//     if (page > 1) {
//       observer.current.observe(document.getElementById("observer"));
//     }
//     fetchProducts(page);
//   }, [page]);



//   return (
//     <>
//       <Header CartItem={cartItems} />
//       <div className="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-900">
//         <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
//           Explore Our Collection
//         </h2>
//         {/* <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8 items-start">
//           <Filters filters={filters} setFilters={setFilters} uniqueBrands={uniqueBrands} uniqueCategories={uniqueCategories} />
//           <ProductGrid loading={loading} products={products} />
//         </div>
//         {error && <p className="text-red-500 text-center mt-4">{error}</p>}
//       </div>
//       <Footer />
//       <Cart /> 
//     </>
//   );
// };

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
  <div className="lg:col-span-3 columns-2 sm:columns-3 md:columns-4 p-2 md:p-4 gap-3">
    {loading
      ? [...Array(9)].map((_, index) => (
          <SkeletonCard
            key={index}
            className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg hover:shadow-xl transition mb-4 break-inside-avoid"
          />
        ))
      : products.map((product) => <ProductCard key={product.id} product={product} />)}

    {loading && (
      <div className="col-span-full flex justify-center mt-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <ArrowPathIcon className="w-8 h-8 text-yellow-500 animate-spin" />
        </motion.div>
      </div>
    )}
  </div>
);

const ProductCard = ({ product }) => {
  const router = useRouter();

  return (
    <motion.div
      onClick={() => router.push(`/shop/product/${product.id}`)}
      whileHover={{ scale: 1.03 }}
      className="relative bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-xl transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400 mb-4 break-inside-avoid"
    >
      {/* Product Image */}
      <div className="relative w-full h-44 md:h-52 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 shadow-md">
        <motion.img
          src={product.image}
          alt={product.newName}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
          whileHover={{ rotate: 2 }}
        />
      </div>

      {/* Product Info */}
      <div className="w-full mt-3 flex flex-col items-center">
        <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white text-center truncate w-full">
          {product.newName}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center truncate w-full">
          {product.newDescription || "No description available"}
        </p>

        {/* Price & Add to Cart Button */}
        <div className="flex justify-between items-center w-full mt-2">
          <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg md:text-xl">
            ${product.sellingPrice.toFixed(2)}
          </span>

           <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addToCart(product)}
              className="flex items-center bg-yellow-500 text-black p-3 rounded-full shadow-lg hover:shadow-xl transition"
              aria-label="Add to Cart"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-1" /> Add
            </motion.button>
        </div>
      </div>
    </motion.div>
  );
};



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

