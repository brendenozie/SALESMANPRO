"use client"

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Filters from "../@/components/Filters";
import load from "../../../assets/load.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Custom product search hook
function useProductSearch({ searchTerm, filters }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch logic: only depends on inputs
  const fetchPage = useCallback(async (pageNum) => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 8,
        search: searchTerm,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        sort: filters.sort,
      });
      filters.brand.forEach(b => params.append('brand', b));
      filters.category.forEach(c => params.append('category', c));
      filters.subCategory.forEach(s => params.append('subCategory', s));

      const res = await fetch(`/api/shop/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(prev => pageNum === 1 ? data.products : [...prev, ...data.products]);
      setTotalPages(data.totalPages);
      setHasMore(pageNum < data.totalPages && data.products.length > 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  // Reset when search or filters change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1);
  }, [searchTerm, filters, fetchPage]);

  // Load next page
  useEffect(() => {
    if (page > 1) fetchPage(page);
  }, [page, fetchPage]);

  return { products, loading, error, hasMore, setPage, page, totalPages };
}

// Loader for next/image
const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}?${params.join('&')}`;
};

const ProductList = () => {
  const router = useRouter();
  const { query } = router;

  // Controlled search term with debounce
  const [searchTerm, setSearchTerm] = useState(query?.search || '');
  const debouncedSetSearch = useMemo(
    () => debounce(val => setSearchTerm(val), 300),
    []
  );

  // Filters state
  const [filters, setFilters] = useState({
    brand: query?.brand ? [].concat(query?.brand) : [],
    category: query?.category ? [].concat(query?.category) : [],
    subCategory: query?.subCategory ? [].concat(query?.subCategory) : [],
    priceRange: [Number(query?.minPrice) || 0, Number(query?.maxPrice) || 1e7],
    rating: query?.rating || '',
    availability: query?.availability || '',
    sort: query?.sort || 'finalPrice',
  });

  // Sync URL without adding history entries
  useEffect(() => {
    const params = {
      ...(searchTerm && { search: searchTerm }),
      ...(filters.brand.length && { brand: filters.brand }),
      ...(filters.category.length && { category: filters.category }),
      ...(filters.subCategory.length && { subCategory: filters.subCategory }),
      ...(filters.priceRange[0] > 0 && { minPrice: filters.priceRange[0] }),
      ...(filters.priceRange[1] < 1e7 && { maxPrice: filters.priceRange[1] }),
      ...(filters.rating && { rating: filters.rating }),
      ...(filters.availability && { availability: filters.availability }),
      ...(filters.sort !== 'finalPrice' && { sort: filters.sort }),
    };
    router.replace({ pathname: router.pathname, query: params }, undefined, { shallow: true });
  }, [filters, searchTerm, router]);

  // Use custom hook
  const { products, loading, error, hasMore, setPage, page } = useProductSearch({ searchTerm, filters });

  // infinite scroll ref
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(p => p + 1);
    }
  }, [inView, hasMore, loading, setPage]);


  return (
    <>
      <div className="mx-auto p-4 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          Explore Our Collection
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="sticky top-4">
            <Filters filters={filters} setFilters={setFilters} onSearch={debouncedSetSearch} />
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))}
            </div>

            {loading && <div className="text-center py-6">Loading...</div>}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {/* Observer element */}
            <div ref={ref} className="h-1"></div>
          </div>
        </div>
      </div>
    </>
  );
};


const ProductCard = memo(({ product,addToCart }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      onClick={() => router.push(`/shop/product/${product.id}`)}
      whileHover={{ scale: 1.03 }}
      className="relative bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-xl transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400 mb-4 break-inside-avoid"
    >
      {/* Product Image */}
      <div className="relative w-full h-44 md:h-52 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 shadow-md">
        <Image
            width={300}
            height={300}
            loader = {loaderProp}
            src={imageError ? load.src : product.image}
            alt={`Product image of ${product.title}`}
            className="w-full h-56 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
      </div>

      {/* Product Info */}
      <div className="w-full mt-3 flex flex-col items-center">
        <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white text-center truncate w-full">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center truncate w-full">
          {product.description || "No description available"}
        </p>

        {/* Price & Add to Cart Button */}
        <div className="flex justify-between items-center w-full mt-2">
          <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs md:text-xl">
            ${product.finalPrice ? product.finalPrice.toFixed(2) : 0}
          </span>

           <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addToCart(product)}
              className="flex items-center bg-yellow-500 text-black p-3 rounded-xl shadow-lg hover:shadow-xl transition"
              aria-label="Add to Cart"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-1" /> Add
            </motion.button>
        </div>
      </div>
    </motion.div>
  );
});


export default ProductList;
