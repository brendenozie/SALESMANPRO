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
    brand: [],
    category: [],
    subCategory: [],
    priceRange: [0, 10000000],
    rating: "",
    availability: "",
    sort: "popularity",
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

      console.log("filters", filters);

      const queryParams = new URLSearchParams({
        page: pageNum,
        limit: 8,
        search: searchTerm,
        brand: filters.brand,
        category: filters.category,
        subCategory: filters.subCategory,
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
        {/* <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8 items-start">
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

const ProductGrid = ({ loading, products }) => {
  return (
    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
      {loading
        ? [...Array(9)].map((_, index) => (
            <SkeletonCard
              key={index}
              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition"
            />
          ))
        : products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}

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
};

const ProductCard = ({ product, index }) => {
  const router = useRouter();

  // Apply a less aggressive stagger effect:
  // On mobile & medium screens, all items are the same height.
  // Only on xl screens do even-indexed items become taller.
  const rowSpan = index % 2 === 0 ? "row-span-1 xl:row-span-2" : "row-span-1";
  // Remove col-span logic to keep column widths consistent.
  // (If needed, you can reintroduce it responsively.)

  return (
    <motion.div
      onClick={() => router.push(`/shop/product/${product.id}`)}
      whileHover={{ scale: 1.03 }}
      className={`bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition flex flex-col ${rowSpan}`}
    >
      {/* Product Image */}
      <img
        src={product.image}
        alt={product.newName}
        className={`w-full object-cover rounded-md ${
          index % 2 === 0 ? "h-48 md:h-56" : "h-40"
        }`}
      />

      {/* Product Name & Description */}
      <div className="mt-2 text-center md:text-left">
        <h3 className="text-base md:text-lg font-semibold text-black dark:text-white">
          {product.newName}
        </h3>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {product.newDescription}
        </p>
      </div>

      <div className="mt-3 text-center md:text-left">
        <span className="text-lg font-bold text-yellow-500">
          ${product.sellingPrice.toFixed(2)}
        </span>
      </div>

      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="mt-3 w-full flex items-center justify-center bg-yellow-400 text-black px-3 py-2 rounded-md md:rounded-full shadow-md hover:bg-yellow-500 transition"
      >
        <ShoppingCartIcon className="w-5 h-5 mr-2" />
        Add to Cart
      </motion.button>
    </motion.div>
  );
};

// const ProductGrid = ({ loading, products }) => {
//   return (
//     <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 auto-rows-[minmax(100px,_auto)] md:auto-rows-[minmax(150px,_auto)]">
//       {loading
//         ? [...Array(9)].map((_, index) => (
//             <SkeletonCard
//               key={index}
//               className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition"
//             />
//           ))
//         : products.map((product, index) => (
//             <ProductCard key={product.id} product={product} index={index} />
//           ))}

//       {loading && (
//         <div className="col-span-full flex justify-center mt-6">
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//           >
//             <ArrowPathIcon className="w-8 h-8 text-yellow-500 animate-spin" />
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// };

// const ProductCard = ({ product, index }) => {
//   const router = useRouter();

//   // Use a responsive row span: on mobile use one row, on md+ use two rows for even-indexed items.
//   const rowSpan = index % 2 === 0 ? "row-span-1 md:row-span-2" : "row-span-1";

//   const colSpan = index % 5 === 0 ? "col-span-2" : "col-span-1";

//   return (
//     <motion.div
//       onClick={() => router.push(`/shop/product/${product.id}`)}
//       whileHover={{ scale: 1.03 }}
//       className={`bg-white dark:bg-gray-800 p-2 md:p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition flex flex-col ${rowSpan} ${colSpan}`}
//     >
//       {/* Product Image */}
//       <img
//         src={product.image}
//         alt={product.newName}
//         className={`w-full object-cover rounded-md ${
//           index % 2 === 0 ? "h-48 md:h-56" : "h-40"
//         }`}
//       />

//       {/* Product Name & Description */}
//       <div className="mt-2 text-center md:text-left">
//         <h3 className="text-base md:text-lg font-semibold text-black dark:text-white">
//           {product.newName}
//         </h3>
//         <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
//           {product.newDescription}
//         </p>
//       </div>

//       <div className="mt-3 text-center md:text-left">
//         <span className="text-lg font-bold text-yellow-500">
//           ${product.sellingPrice.toFixed(2)}
//         </span>
//       </div>

//       {/* Add to Cart Button */}
//       <motion.button
//         whileHover={{ scale: 1.05 }}
//         className="mt-3 w-full flex items-center justify-center bg-yellow-400 text-black px-2 text-xs md:px-4 py-2 rounded-md md:rounded-full shadow-md hover:bg-yellow-500 transition"
//       >
//         <ShoppingCartIcon className="w-4 h-4 mr-1 md:w-5 md:h-5" /> Add to Cart
//       </motion.button>
//     </motion.div>
//   );
// };



const ProductGridV2 = ({ loading, products }) => (
  <div className="lg:col-span-3 grid grid-cols-2 gap-1 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
    {loading
      ? [...Array(9)].map((_, index) => (
          <SkeletonCard
            key={index}
            className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition"
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

const ProductCardV2 = ({ product }) => {
  const router = useRouter();

  return (
    <motion.div
      onClick={() => router.push(`/shop/product/${product.id}`)}
      whileHover={{ scale: 1.03 }}
      className="bg-white dark:bg-gray-800 p-1 md:p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition flex flex-col"
    >
      {/* Product Image */}
      <img
        src={product.image}
        alt={product.newName}
        className="h-40 w-full object-cover rounded-md"
      />

      {/* Product Name & Description */}
      <div className="mt-3 text-center md:text-left">
        <h3 className="text-lg font-semibold text-black dark:text-white">{product.newName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {product.newDescription}
        </p>
      </div>

      <div className="mt-4 text-center md:text-left">
        <span className="text-xl font-bold text-yellow-500">
          ${product.sellingPrice.toFixed(2)}
        </span>
      </div>


      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="mt-3 w-full flex items-center justify-center bg-yellow-400 text-black px-1 text-sm md:px-4 py-2 rounded-md md:rounded-full shadow-md hover:bg-yellow-500 transition"
      >
        <ShoppingCartIcon className="w-5 h-5 mr-2" /> Add to Cart
      </motion.button>
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

