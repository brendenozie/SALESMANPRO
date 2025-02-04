import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/router';
import Header from "../../../components/shop/header/Header";
import Footer from "../../../components/shop/footer/Footer";

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortOption, setSortOption] = useState("popularity");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [availability, setAvailability] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [CartItem, setCartItem] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/shop/products?page=${page}&limit=6`);
        if (!response.ok) throw new Error("Failed to fetch products.");
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  // const filteredProducts = useMemo(() => {
  //   return products
  //     .filter(
  //       (product) =>
  //         product.inventoryItem.product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
  //         (selectedBrand === "" || product.inventoryItem.product.brand === selectedBrand) &&
  //         (selectedCategory === "" || product.inventoryItem.product.category === selectedCategory) &&
  //         (selectedRating === "" || product.inventoryItem.product.rating >= selectedRating) &&
  //         (availability === "" || (availability === "in-stock" && product.inventoryItem.quantity > 0) || (availability === "out-of-stock" && product.inventoryItem.quantity === 0)) &&
  //         product.inventoryItem.sellingPrice >= priceRange[0] &&
  //         product.inventoryItem.sellingPrice <= priceRange[1]
  //     )
  //     .sort((a, b) => {
  //       if (sortOption === "price-asc") return a.inventoryItem.sellingPrice - b.inventoryItem.sellingPrice;
  //       if (sortOption === "price-desc") return b.inventoryItem.sellingPrice - a.inventoryItem.sellingPrice;
  //       return a.inventoryItem.popularity - b.inventoryItem.popularity;
  //     });
  // }, [searchTerm, selectedBrand, selectedCategory, selectedRating, availability, priceRange, sortOption, products]);
  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.inventoryItem.product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedBrand === "" || product.inventoryItem.product.brand === selectedBrand)
      )
      .sort((a, b) => {
        if (sortOption === "price-asc") return a.inventoryItem.sellingPrice - b.inventoryItem.sellingPrice;
        if (sortOption === "price-desc") return b.inventoryItem.sellingPrice - a.inventoryItem.sellingPrice;
        return a.inventoryItem.popularity - b.inventoryItem.popularity;
      });
  }, [searchTerm, selectedBrand, sortOption, products]);
  
  const uniqueBrands = [...new Set(products.map((p) => p.inventoryItem.product.brand))];
  const uniqueCategories = [...new Set(products.map((p) => p.inventoryItem.product.category))];

  return (
    <>
      <Header CartItem={CartItem}/>
      <div className="mx-auto my-4 px-8 py-12 bg-white rounded-xl shadow-2xl grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Section */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Filters</h2>
          <div className="flex flex-col gap-4">
            <BrandFilter selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} brands={uniqueBrands} />
            <CategoryFilter selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={uniqueCategories} />
            <PriceRangeFilter priceRange={priceRange} setPriceRange={setPriceRange} />
            <RatingFilter selectedRating={selectedRating} setSelectedRating={setSelectedRating} />
            <AvailabilityFilter availability={availability} setAvailability={setAvailability} />
            <SortFilter sortOption={sortOption} setSortOption={setSortOption} />
          </div>
        </div>

        {/* Products Section */}
        <div className="lg:col-span-3">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Discover
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-6 mb-8 justify-center">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <p className="text-gray-600 text-center col-span-full">No products available.</p>
            )}
          </div>

          <PaginationControls page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
      <Footer/>
    </>
  );
};

const ProductCard = ({ product }) => {
  const router = useRouter();

  const handleProductClick = () => {
    router.push(`/shop/product/${product.id}`);
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}
      onClick={handleProductClick}
      className="bg-white shadow-xl p-6 rounded-2xl border border-gray-300 transition hover:shadow-2xl cursor-pointer">
      <div className="w-full h-56 bg-gray-100 rounded-xl flex justify-center items-center overflow-hidden">
        <img src={product.image} alt={product.newName} className="h-full w-auto object-cover" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mt-5">{product.newName}</h3>
      <p className="text-gray-600 text-sm">{product.newDescription}</p>
      <div className="flex justify-between items-center mt-5">
        <span className="text-lg font-bold text-blue-600">${product.sellingPrice.toFixed(2)}</span>
        <motion.button whileHover={{ scale: 1.1 }} className="px-5 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition shadow-lg">
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-gray-200 h-80 w-full animate-pulse rounded-lg"></div>
);

const BrandFilter = ({ selectedBrand, setSelectedBrand, brands }) => (
  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
    className="p-4 border border-gray-300 rounded-lg shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">All Brands</option>
    {brands.map((brand, index) => (
      <option key={index} value={brand}>{brand}</option>
    ))}
  </select>
);

const CategoryFilter = ({ selectedCategory, setSelectedCategory, categories }) => (
  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
    className="p-4 border border-gray-300 rounded-lg shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">All Categories</option>
    {categories.map((category, index) => (
      <option key={index} value={category}>{category}</option>
    ))}
  </select>
);

const PriceRangeFilter = ({ priceRange, setPriceRange }) => (
  <div className="flex flex-col">
    <label className="text-gray-700">Price Range</label>
    <input
      type="range"
      min="0"
      max="1000"
      value={priceRange[0]}
      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
      className="mb-2"
    />
    <input
      type="range"
      min="0"
      max="1000"
      value={priceRange[1]}
      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
    />
    <div className="flex justify-between text-gray-700">
      <span>${priceRange[0]}</span>
      <span>${priceRange[1]}</span>
    </div>
  </div>
);

const RatingFilter = ({ selectedRating, setSelectedRating }) => (
  <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}
    className="p-4 border border-gray-300 rounded-lg shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">All Ratings</option>
    {[5, 4, 3, 2, 1].map((rating) => (
      <option key={rating} value={rating}>{rating} Stars & Up</option>
    ))}
  </select>
);

const AvailabilityFilter = ({ availability, setAvailability }) => (
  <select value={availability} onChange={(e) => setAvailability(e.target.value)}
    className="p-4 border border-gray-300 rounded-lg shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">All</option>
    <option value="in-stock">In Stock</option>
    <option value="out-of-stock">Out of Stock</option>
  </select>
);

const SortFilter = ({ sortOption, setSortOption }) => (
  <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
    className="p-4 border border-gray-300 rounded-lg shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="popularity">Sort by Popularity</option>
    <option value="price-asc">Sort by Price (Low to High)</option>
    <option value="price-desc">Sort by Price (High to Low)</option>
  </select>
);

const PaginationControls = ({ page, setPage, totalPages }) => (
  <div className="flex justify-center items-center mt-8 gap-6">
    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
      Previous
    </motion.button>
    <span className="text-gray-700 text-lg">Page {page} of {totalPages}</span>
    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPage(prev => (prev < totalPages ? prev + 1 : prev))} disabled={page === totalPages}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
      Next
    </motion.button>
  </div>
);

export default ProductList;