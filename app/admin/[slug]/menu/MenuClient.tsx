// app/admin/[slug]/menu/MenuClient.tsx
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ProductCategory, Product } from "./page";
import Modal from "../../../../../components/Modal"; // Adjust path as needed

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Image loader (same as elsewhere)
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

interface ClientProps {
  categoriesData: ProductCategory[];
  productsData: Product[];
  companyId: string;
}

const MenuClient: React.FC<ClientProps> = ({ categoriesData: initialCategoriesData, productsData: initialProductsData, companyId }) => {
  const [categoriesData, setCategoriesData] = useState<ProductCategory[]>(initialCategoriesData);
  const [productsData, setProductsData] = useState<Product[]>(initialProductsData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All"); // Filter by category ID or "All"
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 8;

  // Function to refresh data
  const refreshMenuData = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriesRes = await fetch(`${apiUrl}/product-categories?companyId=${companyId}`, { cache: "no-store" });
      const productsRes = await fetch(`${apiUrl}/products?companyId=${companyId}`, { cache: "no-store" });

      if (categoriesRes.ok && productsRes.ok) {
        setCategoriesData(await categoriesRes.json());
        setProductsData(await productsRes.json());
      } else {
        throw new Error("Failed to refresh menu data.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh menu data.");
      console.error("Error refreshing menu data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by search term and category
  const filteredProducts = useMemo(() => {
    let filtered = productsData;

    if (activeCategoryFilter !== "All") {
      filtered = filtered.filter(product => product.productCategoryId === activeCategoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [productsData, activeCategoryFilter, searchTerm]);

  // Summaries
  const totalDishes = productsData.length;
  const availableDishes = productsData.filter(p => p.isAvailable).length;
  const dishesOnOffer = productsData.filter(p => p.isOnOffer).length;

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data for Product Availability
  const availabilityCounts = {
    available: productsData.filter(p => p.isAvailable).length,
    unavailable: productsData.filter(p => !p.isAvailable).length,
  };

  const productAvailabilityChartData = {
    labels: ['Available', 'Unavailable'],
    datasets: [
      {
        data: [availabilityCounts.available, availabilityCounts.unavailable],
        backgroundColor: ['#4CAF50', '#EF5350'], // Green for available, Red for unavailable
        borderColor: '#333',
        borderWidth: 1,
      },
    ],
  };

  // Handle Add Product
  const handleAddProduct = async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, companyId }), // Ensure companyId is sent
      });

      if (res.ok) {
        setIsAddProductModalOpen(false);
        await refreshMenuData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add product.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to add product.");
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Category
  const handleAddCategory = async (newCategory: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/product-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCategory, companyId }), // Ensure companyId is sent
      });

      if (res.ok) {
        setIsAddCategoryModalOpen(false);
        await refreshMenuData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add category.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to add category.");
      console.error("Error adding category:", err);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for Edit/Delete actions
  const handleEditProduct = (id: string) => alert(`Editing product with ID ${id}`);
  const handleDeleteProduct = (id: string) => alert(`Deleting product with ID ${id}`);
  const handleEditCategory = (id: string) => alert(`Editing category with ID ${id}`);
  const handleDeleteCategory = (id: string) => alert(`Deleting category with ID ${id}`);

  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-rose-400 mb-10 drop-shadow-lg">
          Menu Management
        </h1>

        {/* Action Bar: Search, Add Product, Add Category */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search dishes by name or ingredients..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-md"
            aria-label="Search dishes"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsAddProductModalOpen(true)}
              className="px-6 py-3 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 transition-all font-semibold"
            >
              Add New Dish
            </button>
            <button
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg shadow-lg hover:bg-indigo-600 transition-all font-semibold"
            >
              Add New Category
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-blue-400 mb-4">Loading menu data...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title="Total Dishes"
            value={totalDishes}
            bgColor="bg-rose-600"
          />
          <SummaryCard
            title="Available Dishes"
            value={availableDishes}
            bgColor="bg-green-600"
          />
          <SummaryCard
            title="Dishes on Offer"
            value={dishesOnOffer}
            bgColor="bg-yellow-600"
          />
          <SummaryCard
            title="Total Categories"
            value={categoriesData.length}
            bgColor="bg-indigo-600"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col mb-10">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Dish Availability Overview
          </h2>
          <div className="chart-container" style={{ height: "300px" }}>
            <Bar
              data={productAvailabilityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" as const, labels: { color: "#ddd" } },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#ddd" } },
                  y: { grid: { color: "#444" }, ticks: { color: "#ddd" } },
                },
              }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 p-2 bg-gray-800 rounded-full shadow-inner mb-8">
          <button
            onClick={() => { setActiveCategoryFilter("All"); setCurrentPage(1); }}
            className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
              ${activeCategoryFilter === "All"
                ? "bg-rose-500 text-white shadow-md"
                : "bg-transparent text-gray-300 hover:bg-gray-700"
              }`}
          >
            All Dishes
          </button>
          {categoriesData.map(category => (
            <button
              key={category.id}
              onClick={() => { setActiveCategoryFilter(category.id); setCurrentPage(1); }}
              className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
                ${activeCategoryFilter === category.id
                  ? "bg-rose-500 text-white shadow-md"
                  : "bg-transparent text-gray-300 hover:bg-gray-700"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products List */}
        <section>
          {paginatedProducts.length === 0 && !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">
                No dishes match your criteria or are available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} title="Add New Dish">
        <AddProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setIsAddProductModalOpen(false)}
          isLoading={loading}
          categories={categoriesData}
        />
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)} title="Add New Menu Category">
        <AddCategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsAddCategoryModalOpen(false)}
          isLoading={loading}
        />
      </Modal>
    </main>
  );
};

export default MenuClient;

// ----------------------
// Helper components
// ----------------------

interface SummaryCardProps {
  title: string;
  value: string | number;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, bgColor }) => (
  <div className={`${bgColor} text-white p-5 rounded-lg shadow-md hover:shadow-lg transition`}>
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => (
  <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
    <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
      <Image
        src={product.images && product.images.length > 0 ? product.images[0].url : "https://placehold.co/400x200/333/eee?text=No+Image"}
        alt={product.name}
        fill
        className="object-cover"
        loader={loader}
      />
      {product.isOnOffer && (
        <span className="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
          On Offer!
        </span>
      )}
      {!product.isAvailable && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          Unavailable
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-rose-400 mb-2">{product.name}</h3>
      <p className="text-sm text-gray-400 mb-1">
        Category: <span className="text-gray-300">{product.category?.name || 'N/A'}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1 line-clamp-2">
        Description: <span className="text-gray-300">{product.description || 'No description.'}</span>
      </p>
      <p className="text-sm text-gray-400 mb-4">
        Price: <span className="text-green-400 font-medium">${product.finalPrice.toFixed(2)}</span>
        {product.discount && product.discount > 0 && (
          <span className="ml-2 text-xs text-gray-500 line-through">${product.salesPrice.toFixed(2)}</span>
        )}
      </p>
    </div>
    <div className="flex space-x-2 self-end mt-4">
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        onClick={() => onEdit(product.id)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        onClick={() => onDelete(product.id)}
      >
        Delete
      </button>
    </div>
  </div>
);

// Add Product Form Component
interface AddProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category'>) => void;
  onCancel: () => void;
  isLoading: boolean;
  categories: ProductCategory[];
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel, isLoading, categories }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [salesPrice, setSalesPrice] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>(''); // Added costPrice
  const [discount, setDiscount] = useState<string>('0');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isOnOffer, setIsOnOffer] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // For single image URL input
  const [formError, setFormError] = useState<string | null>(null);

  const calculateFinalPrice = (sPrice: number, disc: number) => {
    return sPrice * (1 - disc / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Dish name is required.');
      return;
    }
    if (!productCategoryId) {
      setFormError('Category is required.');
      return;
    }
    if (isNaN(parseFloat(salesPrice)) || parseFloat(salesPrice) <= 0) {
      setFormError('Sales price must be a positive number.');
      return;
    }
    if (isNaN(parseFloat(costPrice)) || parseFloat(costPrice) <= 0) {
      setFormError('Cost price must be a positive number.');
      return;
    }
    if (isNaN(parseFloat(discount)) || parseFloat(discount) < 0 || parseFloat(discount) > 100) {
      setFormError('Discount must be between 0 and 100.');
      return;
    }

    const finalPrice = calculateFinalPrice(parseFloat(salesPrice), parseFloat(discount));

    onSubmit({
      name,
      description: description || null,
      images: imageUrl ? [{ url: imageUrl }] : [], // Store as array of objects
      video: null, // Assuming no video input for now
      tags: [], // Assuming no tag input for now
      productCategoryId,
      costPrice: parseFloat(costPrice),
      salesPrice: parseFloat(salesPrice),
      finalPrice: finalPrice,
      discount: parseFloat(discount),
      isAvailable,
      isOnOffer,
      isFlashDeal: false, // Default
      isNewArrival: false, // Default
      isDiscounted: parseFloat(discount) > 0,
      isFeatured: false, // Default
      ingredients: ingredients || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Dish Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500"
        ></textarea>
      </div>
      <div>
        <label htmlFor="productCategoryId" className="block text-sm font-medium text-gray-300">Category</label>
        <select
          id="productCategoryId"
          value={productCategoryId}
          onChange={(e) => setProductCategoryId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500"
          required
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="costPrice" className="block text-sm font-medium text-gray-300">Cost Price ($)</label>
          <input
            type="number"
            id="costPrice"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            step="0.01"
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500"
            required
          />
        </div>
        <div>
          <label htmlFor="salesPrice" className="block text-sm font-medium text-gray-300">Sales Price ($)</label>
          <input
            type="number"
            id="salesPrice"
            value={salesPrice}
            onChange={(e) => setSalesPrice(e.target.value)}
            step="0.01"
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="discount" className="block text-sm font-medium text-gray-300">Discount (%)</label>
        <input
          type="number"
          id="discount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          min="0"
          max="100"
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500"
        />
      </div>
      <div>
        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-300">Ingredients (comma-separated)</label>
        <input
          type="text"
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500"
        />
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Image URL</label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500"
        />
      </div>
      <div className="flex items-center space-x-4">
        <label className="flex items-center text-sm font-medium text-gray-300">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="form-checkbox h-5 w-5 text-rose-500 rounded border-gray-600 bg-gray-700 focus:ring-rose-500"
          />
          <span className="ml-2">Available</span>
        </label>
        <label className="flex items-center text-sm font-medium text-gray-300">
          <input
            type="checkbox"
            checked={isOnOffer}
            onChange={(e) => setIsOnOffer(e.target.checked)}
            className="form-checkbox h-5 w-5 text-rose-500 rounded border-gray-600 bg-gray-700 focus:ring-rose-500"
          />
          <span className="ml-2">On Offer</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Dish'}
        </button>
      </div>
    </form>
  );
};

// Add Category Form Component
interface AddCategoryFormProps {
  onSubmit: (category: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [visible, setVisible] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (!slug.trim()) {
      setFormError('Slug is required.');
      return;
    }
    if (isNaN(parseInt(sortOrder))) {
      setFormError('Sort order must be a number.');
      return;
    }

    onSubmit({
      name,
      slug,
      description: description || '',
      image: image || null,
      sortOrder: parseInt(sortOrder),
      visible,
      companyId: null, // This will be set by the parent component (MenuClient)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      <div>
        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300">Category Name</label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="categorySlug" className="block text-sm font-medium text-gray-300">Slug</label>
        <input
          type="text"
          id="categorySlug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          id="categoryDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>
      <div>
        <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-300">Image URL</label>
        <input
          type="url"
          id="categoryImage"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-300">Sort Order</label>
          <input
            type="number"
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <label className="flex items-center text-sm font-medium text-gray-300 mt-6">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="form-checkbox h-5 w-5 text-indigo-500 rounded border-gray-600 bg-gray-700 focus:ring-indigo-500"
          />
          <span className="ml-2">Visible</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Category'}
        </button>
      </div>
    </form>
  );
};
