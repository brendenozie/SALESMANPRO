"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import { useInView } from 'react-intersection-observer';
import Filters from "@/components/Filters";
import { useRouter } from "next/navigation";
import { useStateContext } from '@/contexts/ContextProvider';

import { SkeletonGrid } from "@/components/site/layouts/GhubaLayout/body/components/SkeletonGrid/SkeletonGrid";
const DynamicBannerSlider = dynamic(() => import('@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Custom product search hook
// Loader for next/image

// Updated useProductSearch Hook
function useProductSearch({ searchTerm, filters }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Use a ref to track loading internally to avoid dependency loops
  const isFetching = useRef(false);

  const fetchPage = useCallback(async (pageNum) => {
    // Silent guard using the ref
    if (isFetching.current || (pageNum > 1 && !hasMore)) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "8",
        search: searchTerm,
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString(),
        sort: filters.sort,
      });

      filters.brand.forEach(b => params.append('brand', b));
      filters.category.forEach(c => params.append('category', c));
      filters.subCategory.forEach(s => params.append('subCategory', s));

      const res = await fetch(`${apiBaseUrl}/shop/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const json = await res.json(); 
      const newProducts = json.data || [];
      const meta = json.meta;

      setProducts(prev => (pageNum === 1 ? newProducts : [...prev, ...newProducts]));
      
      if (meta) {
        setTotalPages(meta.totalPages);
        setHasMore(pageNum < meta.totalPages);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [searchTerm, filters]); // Removed loading/hasMore from here!

  // 1. Reset and load page 1 when search/filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPage(1);
  }, [searchTerm, filters, fetchPage]);

  // 2. Load next pages when page state increments (Infinite Scroll)
  useEffect(() => {
    if (page > 1) {
      fetchPage(page);
    }
  }, [page, fetchPage]);

  return { products, loading, error, hasMore, setPage, page, totalPages };
}

const ProductList = () => {
  
  const { addToCart } = useStateContext();
  const router = useRouter();
  const { query } = router;
  const [likedItems, setLikedItems] = useState({});
  
  const toggleLike = (id) => {
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
  const { products, loading, error, hasMore, setPage } = useProductSearch({ searchTerm, filters });

  // infinite scroll ref
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(p => p + 1);
    }
  }, [inView, hasMore, loading, setPage]);


    // inside ProductList.js
  return (
    <div className="mx-auto p-4 bg-white dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
        Explore Our Collection
      </h2>

      {/* Added items-start to allow sticky to work correctly */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        
        {/* Sidebar - Desktop Filters */}
        <aside className="md:sticky md:top-8 z-10">
          <Filters 
            filters={filters} 
            setFilters={setFilters} 
            onSearch={debouncedSetSearch} 
          />
        </aside>

        {/* Main Content - Product Grid */}
        <main className="md:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
            {products.length > 0 ? (
              products.map((product) => (
                <DynamicBannerSlider 
                  key={product._id || product.id}
                  product={product} 
                  toggleLike={toggleLike} 
                  likedItems={likedItems} 
                  addToCart={addToCart} 
                />
              ))
            ) : !loading && (
              <div className="col-span-full text-center py-20 text-gray-500">
                No products found matching your criteria.
              </div>
            )}
          </div> 

          {loading && <div className="text-center py-10 font-medium text-gray-500">Loading products...</div>}
          {error && <p className="text-red-500 text-center mt-4 bg-red-50 p-3 rounded-lg">{error}</p>}

          {/* Observer element */}
          <div ref={ref} className="h-10 w-full"></div>
        </main>
      </div>
    </div>
  );
};



export default ProductList;
