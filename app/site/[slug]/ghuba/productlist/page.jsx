'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import { useInView } from 'react-intersection-observer';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlassIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

import Filters from "@/components/Filters";
import { useStateContext } from '@/contexts/ContextProvider';
import { SkeletonGrid } from "@/components/site/layouts/GhubaLayout/body/components/SkeletonGrid/SkeletonGrid";

const DynamicBannerSlider = dynamic(() => import('@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard'), { 
  loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, 
  ssr: false,
});

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';
const STORAGE_KEY = 'ghuba_shop_scroll_state';

// ------------------------------------------------------------------
// --- 1. Custom Product Search Hook (With Memory Restoration) ---
// ------------------------------------------------------------------
function useProductSearch({ searchTerm, filters }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // Default true for initial mount
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const initialized = useRef(false);
  const isFetching = useRef(false);
  const isMounted = useRef(false);

  const fetchPage = useCallback(async (pageNum, force = false) => {
    // Prevent duplicate fetches unless forced (like on initial load)
    if ((isFetching.current || (!hasMore && pageNum > 1)) && !force) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "8",
        search: searchTerm || "",
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
  }, [searchTerm, filters, hasMore]);

  // Handle Initial Mount & Cache Restoration
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Ensure the cache belongs to the exact current search & filter state
        const isFilterMatch = JSON.stringify(parsed.filters) === JSON.stringify(filters) && parsed.searchTerm === searchTerm;
        
        if (isFilterMatch && parsed.products.length > 0) {
          setProducts(parsed.products);
          setPage(parsed.page);
          setTotalPages(parsed.totalPages);
          setHasMore(parsed.hasMore);
          setLoading(false);

          // Allow the DOM to render the list, then snap down to the saved scroll position
          requestAnimationFrame(() => {
            setTimeout(() => {
              window.scrollTo({ top: parsed.scrollY, behavior: 'instant' });
            }, 50);
          });
          return;
        }
      } catch (e) {
        console.error("Failed to parse scroll cache", e);
      }
    }
    
    // If no cache matched, fetch page 1
    fetchPage(1, true);
  }, [filters, searchTerm, fetchPage]); 

  // Reset and load page 1 when search/filters change (AFTER initial mount)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
  }, [searchTerm, filters, fetchPage]);

  // Load next pages when page state increments
  useEffect(() => {
    if (page > 1) {
      fetchPage(page);
    }
  }, [page, fetchPage]);

  // Persist Current State and Scroll Position continuously 
  useEffect(() => {
    if (products.length === 0) return;

    const saveState = debounce(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        searchTerm,
        filters,
        products,
        page,
        totalPages,
        hasMore,
        scrollY: window.scrollY
      }));
    }, 150);

    saveState(); // Save initial populated state
    window.addEventListener('scroll', saveState);
    
    return () => {
      window.removeEventListener('scroll', saveState);
      saveState.cancel();
    };
  }, [products, page, totalPages, hasMore, searchTerm, filters]);

  return { products, loading, error, hasMore, setPage, page };
}

// ------------------------------------------------------------------
// --- 2. Main Product List Component ---
// ------------------------------------------------------------------
const ProductList = () => {
  const { addToCart } = useStateContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Fixed: Read from searchParams instead of router.query
  
  const [likedItems, setLikedItems] = useState({});
  const toggleLike = (id) => {
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Extract Arrays Safely from URL params
  const getArrayParam = (key) => {
    const val = searchParams.getAll(key);
    return val.length ? val : [];
  };

  // Controlled search term with debounce
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSetSearch = useMemo(
    () => debounce(val => setSearchTerm(val), 300),
    []
  );

  // Filters state mapping directly from URL at mount
  const [filters, setFilters] = useState({
    brand: getArrayParam('brand'),
    category: getArrayParam('category'),
    subCategory: getArrayParam('subCategory'),
    priceRange: [
      Number(searchParams.get('minPrice')) || 0, 
      Number(searchParams.get('maxPrice')) || 1e7
    ],
    rating: searchParams.get('rating') || '',
    availability: searchParams.get('availability') || '',
    sort: searchParams.get('sort') || 'finalPrice',
  });

  // Sync state back to URL silently without causing full page reloads
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    filters.brand.forEach(b => params.append('brand', b));
    filters.category.forEach(c => params.append('category', c));
    filters.subCategory.forEach(s => params.append('subCategory', s));
    
    if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0]);
    if (filters.priceRange[1] < 1e7) params.set('maxPrice', filters.priceRange[1]);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.sort !== 'finalPrice') params.set('sort', filters.sort);

    // Use router.replace to prevent polluting the browser history with filter tweaks
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filters, searchTerm, pathname, router]);

  // Use the memory-enhanced custom hook
  const { products, loading, error, hasMore, setPage } = useProductSearch({ searchTerm, filters });

  // Infinite scroll intersection observer trigger
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '400px' });
  
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(p => p + 1);
    }
  }, [inView, hasMore, loading, setPage]);

  return (
    <div className="mx-auto p-4 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-8 text-gray-900 dark:text-white">
        Explore Our Collection
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar - Desktop Filters */}
        <aside className="md:sticky md:top-24 z-10 self-start">
          <Filters 
            filters={filters} 
            setFilters={setFilters} 
            onSearch={debouncedSetSearch} 
          />
        </aside>

        {/* Main Content - Product Grid */}
        <main className="md:col-span-3">
          
          {error && (
            <div className="flex items-center justify-center p-4 mb-6 text-red-800 bg-red-50 rounded-xl dark:bg-red-950/30 dark:text-red-400">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product._id || product.id} className="group transform transition-all duration-300 hover:-translate-y-1">
                  <DynamicBannerSlider 
                    product={product} 
                    toggleLike={toggleLike} 
                    likedItems={likedItems} 
                    addToCart={addToCart} 
                  />
                </div>
              ))
            ) : !loading && !error && (
              <div className="col-span-full flex flex-col items-center justify-center py-32 px-4 text-center">
                <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-full mb-6">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  We couldn't find anything matching your current filters. Try removing some filters or adjusting your search term.
                </p>
                <button
                  onClick={() => setFilters({ ...filters, brand: [], category: [], subCategory: [] })}
                  className="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div> 

          {/* Loading Indicator */}
          {loading && (
            <div className="col-span-full py-12">
              <SkeletonGrid count={products.length > 0 ? 4 : 8} />
            </div>
          )}

          {/* Invisible Element for Intersection Observer targeting */}
          <div ref={ref} className="h-16 w-full opacity-0" aria-hidden="true" />
        </main>
      </div>
    </div>
  );
};

export default ProductList;