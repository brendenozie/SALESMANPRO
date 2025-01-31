import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
// import { useStateContext } from "@/context/";

const productsl = [
  {
    id: 1,
    name: "Apple AirPods Max",
    price: 549.0, // Numeric price
    brand: "Apple",
    image: "https://via.placeholder.com/200",
    description: "High-fidelity audio with Active Noise Cancellation.",
    popularity: 1,
  },
  {
    id: 2,
    name: "Sony WH-1000XM5",
    price: 399.0,
    brand: "Sony",
    image: "https://via.placeholder.com/200",
    description: "Industry-leading noise cancellation with adaptive sound control.",
    popularity: 2,
  },
  {
    id: 3,
    name: "Bose 700",
    price: 379.0,
    brand: "Bose",
    image: "https://via.placeholder.com/200",
    description: "Unrivaled voice pickup and crisp, balanced sound.",
    popularity: 3,
  },
  {
    id: 4,
    name: "Sennheiser Momentum 4",
    price: 349.0,
    brand: "Sennheiser",
    image: "https://via.placeholder.com/200",
    description: "Premium sound with adaptive noise cancellation.",
    popularity: 4,
  },
  {
    id: 5,
    name: "Sony WH-1000XM4",
    price: 349.0,
    brand: "Sony",
    image: "https://via.placeholder.com/200",
    description: "Exceptional noise cancellation with up to 30 hours of battery life.",
    popularity: 5,
  },
];
const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortOption, setSortOption] = useState("popularity");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState(productsl);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.example.com/products?page=${page}&limit=6`);
        if (!response.ok) throw new Error("Failed to fetch products.");
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (err) {
        // setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedBrand === "" || product.brand === selectedBrand)
      )
      .sort((a, b) => {
        if (sortOption === "price-asc") return a.price - b.price;
        if (sortOption === "price-desc") return b.price - a.price;
        return a.popularity - b.popularity;
      });
  }, [searchTerm, selectedBrand, sortOption, products]);

  const uniqueBrands = [...new Set(products.map((p) => p.brand))];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 bg-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Discover Premium Headphones
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-6 mb-8 justify-center">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <BrandFilter selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} brands={uniqueBrands} />
        <SortFilter sortOption={sortOption} setSortOption={setSortOption} />
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
  );
};

const ProductCard = ({ product }) => (
  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}
    className="bg-white shadow-xl p-6 rounded-2xl border border-gray-300 transition hover:shadow-2xl">
    <div className="w-full h-56 bg-gray-100 rounded-xl flex justify-center items-center overflow-hidden">
      <img src={product.image} alt={product.name} className="h-full w-auto object-cover" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mt-5">{product.name}</h3>
    <p className="text-gray-600 text-sm">{product.description}</p>
    <div className="flex justify-between items-center mt-5">
      <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
      <motion.button whileHover={{ scale: 1.1 }} className="px-5 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition shadow-lg">
        Add to Cart
      </motion.button>
    </div>
  </motion.div>
);

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
