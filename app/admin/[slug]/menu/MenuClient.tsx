"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import toast, { Toaster } from 'react-hot-toast';
import {
  MagnifyingGlassCircleIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, TagIcon, PhoneXMarkIcon, ListBulletIcon, CurrencyDollarIcon, InformationCircleIcon,
  HandRaisedIcon, ShoppingBagIcon, BuildingLibraryIcon, CalendarIcon, PercentBadgeIcon, EyeIcon, EyeSlashIcon,
  CircleStackIcon,
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline'; // Icons from Heroicons
import { CheckIcon } from "@heroicons/react/20/solid";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";
import { MarketListingForm, StoreCategory } from "@/types/typings";
import MarketLForm from "./MarketLForm";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Type Definitions (Moved here for self-containment) ---
interface ImageAsset {
  id?: string;
  url: string;
}

interface PaginatedListings {
  meta: {
    companyId:     string;
    totalItems:    number;
    totalPages:    number;
    currentPage:   number;
    perPage:       number;
  };
  results: MarketListingForm[];
}

// interface MarketListingForm {
//   id: string;
//   name: string;
//   description: string | null;
//   images: ImageAsset[];
//   video: string | null;
//   tags: string[];
//   productCategoryId: string;
//   category?: StoreCategory; // Optional, will be populated on client
//   costPrice: number;
//   salesPrice: number;
//   finalPrice: number;
//   discount: number;
//   isAvailable: boolean;
//   isOnOffer: boolean;
//   isFlashDeal: boolean;
//   isNewArrival: boolean;
//   isDiscounted: boolean;
//   isFeatured: boolean;
//   ingredients: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// interface StoreCategory {
//   id: string;
//   name: string;
//   slug: string;
//   description: string | null;
//   image: string | null;
//   sortOrder: number;
//   visible: boolean;
//   companyId: string | null; // Nullable as it's set by parent
//   createdAt: string;
//   updatedAt: string;
// }

// --- API Configuration ---
// In a real Next.js app, process.env.NEXT_PUBLIC_API_URL would be available.
// For a self-contained Canvas example, we'll use a placeholder URL.
// const apiUrl = "[https://your-api-url.com/api](https://your-api-url.com/api)"; // Replace with your actual API URL

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Image loader (for Next.js Image component) ---
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// --- Custom Hook for Menu Data ---
const useMenuData = (companyId: string) => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [products, setProducts] = useState<MarketListingForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API calls
      const categoriesRes = await fetch(`${apiUrl}/admin/my-market-place?companyId=${companyId}`, { cache: "no-store" });
      const productsRes = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${companyId}`, { cache: "no-store" });

      if (categoriesRes.ok && productsRes.ok) {
        
        const categoriesJson = (await categoriesRes.json()) as {
                                  results: StoreCategory[];
                                };

        const fetchedCategories: StoreCategory[] = categoriesJson.results;

        const data = (await productsRes.json()) as PaginatedListings;

        const fetchedProducts: MarketListingForm[]  = data.results;    

        // Map category names to products for display
        const productsWithCategories = fetchedProducts.map(product => ({
          ...product,
          category: fetchedCategories.find(cat => cat.categoryId === product.productCategoryId) || null
        }));

        setCategories(fetchedCategories);
        setProducts(productsWithCategories);
      } else {
        throw new Error("Failed to refresh menu data.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh menu data.");
      console.error("Error refreshing menu data:", err);
      toast.error(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return { products, loading, error, refreshData, setProducts, setCategories };
};

// --- API Service (Simulated) ---
// In a real app, these would be in a separate file (e.g., services/menuService.ts)
const menuApiService = {
  addProduct: async (newProduct: Omit<MarketListingForm, 'id' | 'createdAt' | 'updatedAt' | 'category'>) => {
    toast.loading('Adding dish...');
    try {
      // Simulate API call
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add product.');
      }
      const addedProduct = await res.json();
      toast.success('Dish added successfully!');
      return addedProduct;
    } catch (error: any) {
      toast.error(error.message || 'Failed to add dish.');
      throw error;
    }
  },

  addCategory: async (newCategory: Omit<StoreCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    toast.loading('Adding category...');
    try {
      // Simulate API call
      const res = await fetch(`${apiUrl}/product-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add category.');
      }
      const addedCategory = await res.json();
      toast.success('Category added successfully!');
      return addedCategory;
    } catch (error: any) {
      toast.error(error.message || 'Failed to add category.');
      throw error;
    }
  },

  updateProduct: async (productId: string, updates: Partial<MarketListingForm>) => {
    toast.loading('Updating dish...');
    try {
      // Simulate API call
      const res = await fetch(`${apiUrl}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update product.');
      }
      const updatedProduct = await res.json();
      toast.success('Dish updated successfully!');
      return updatedProduct;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update dish.');
      throw error;
    }
  },

  deleteProduct: async (productId: string) => {
    toast.loading('Deleting dish...');
    try {
      // Simulate API call
      const res = await fetch(`${apiUrl}/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete product.');
      }
      toast.success('Dish deleted successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete dish.');
      throw error;
    }
  },

  updateCategory: async (categoryId: string, updates: Partial<StoreCategory>) => {
    toast.loading('Updating category...');
    try {
      // Simulate API call
      const res = await fetch(`${apiUrl}/product-categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update category.');
      }
      const updatedCategory = await res.json();
      toast.success('Category updated successfully!');
      return updatedCategory;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category.');
      throw error;
    }
  },

  deleteCategory: async (categoryId: string) => {
    toast.loading('Deleting category...');
    try {
      // Simulate API call
      const res = await fetch(`${apiUrl}/product-categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete category.');
      }
      toast.success('Category deleted successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category.');
      throw error;
    }
  },
};

// --- Modal Component (Basic, can be replaced by a more robust one) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-scale-in-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <CircleStackIcon className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-rose-400 mb-6 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
};

// --- Confirmation Modal Component ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-scale-in-center">
        <h2 className="text-2xl font-bold text-rose-400 mb-4 text-center">{title}</h2>
        <p className="text-gray-300 text-center mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Summary Card Component ---
interface SummaryCardProps {
  title: string;
  value: string | number;
  bgColor: string;
  icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, bgColor, icon }) => (
  <div className={`${bgColor} text-white p-6 rounded-xl shadow-lg flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out`}>
    <div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-4xl font-extrabold">{value}</p>
    </div>
    <div className="text-white opacity-70">
      {icon}
    </div>
  </div>
);

// --- MarketListingForm Card Component ---
interface ProductCardProps {
  product: MarketListingForm;
  onEdit: (product: MarketListingForm) => void;
  onDelete: (productId: string) => void;
  onToggleAvailability: (productId: string, isAvailable: boolean) => void;
  onToggleOffer: (productId: string, isOnOffer: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleOffer
}) => {
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : "[https://placehold.co/400x200/333/eee?text=No+Image](https://placehold.co/400x200/333/eee?text=No+Image)";

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative flex flex-col transform hover:-translate-y-1">
      <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden border border-gray-700">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          loader={loader}
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            e.currentTarget.src = "[https://placehold.co/400x200/333/eee?text=Image+Load+Error](https://placehold.co/400x200/333/eee?text=Image+Load+Error)";
          }}
        />
        {product.isOnOffer && (
          <span className="absolute top-3 right-3 bg-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse-once">
            <PercentBadgeIcon  className="w-6 h-6 inline-block mr-1" /> On Offer!
          </span>
        )}
        {!product.isAvailable && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            <CircleStackIcon  className="w-6 h-6 inline-block mr-1" /> Unavailable
          </span>
        )}
      </div>
      <div className="flex-grow">
        <h3 className="text-3xl font-bold text-rose-400 mb-2 leading-tight">{product.name}</h3>
        <p className="text-sm text-gray-400 mb-1 flex items-center">
          <TagIcon  className="w-6 h-6 mr-2 text-gray-500" /> Category: <span className="text-gray-300 ml-1">{product.category?.displayName || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-1 line-clamp-2">
          <InformationCircleIcon  className="w-6 h-6 inline-block mr-2 text-gray-500" /> Description: <span className="text-gray-300">{product.description || 'No description provided.'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-4 flex items-center">
          <CurrencyDollarIcon  className="w-6 h-6 mr-2 text-gray-500" /> Price: <span className="text-green-400 font-medium text-lg">${product.finalPrice?.toFixed(2)}</span>
          {product.discount && product.discount > 0 && (
            <span className="ml-2 text-xs text-gray-500 line-through">${product.sellingPrice?.toFixed(2)}</span>
          )}
        </p>
      </div>
      <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Available:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={product.isAvailable}
              onChange={() => onToggleAvailability(product.id, !product.isAvailable)}
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-rose-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">On Offer:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={product.isOnOffer}
              onChange={() => onToggleOffer(product.id, !product.isOnOffer)}
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-rose-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all flex items-center font-semibold"
            onClick={() => onEdit(product)}
          >
            <PencilIcon className="w-6 h-6 mr-2" /> Edit
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all flex items-center font-semibold"
            onClick={() => onDelete(product.id)}
          >
            <TrashIcon  className="w-6 h-6 mr-2" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface ClientProps {
  // These would typically come from server-side props in Next.js
  // For this self-contained example, we'll let useMenuData handle initial fetch.
  companyId: string;
  categoriesData: StoreCategory[];
  productsData: MarketListingForm[];

}

const MenuClient: React.FC<ClientProps> = ({ companyId, categoriesData, productsData }) => {

  const { products, loading, error, refreshData, setProducts, setCategories } = useMenuData(companyId);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All"); // Filter by category ID or "All"
  const [currentPage, setCurrentPage] = useState<number>(1);
  // const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  
    const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<MarketListingForm | null | undefined>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'product' | 'category' } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('name-asc'); // 'name-asc', 'name-desc', 'price-asc', 'price-desc', 'date-desc'

  const itemsPerPage = 8;

  // Filter and Sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

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

    // Sorting logic
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name?.localeCompare(b.name);
        case 'name-desc':
          return b.name?.localeCompare(a.name);
        case 'price-asc':
          return a.finalPrice - b.finalPrice;
        case 'price-desc':
          return b.finalPrice - a.finalPrice;
        case 'date-desc':
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        default:
          return 0;
      }
    });
  }, [products, activeCategoryFilter, searchTerm, sortBy]);

  // Summaries
  const totalDishes = products.length;
  const availableDishes = products.filter(p => p.isAvailable).length;
  const dishesOnOffer = products.filter(p => p.isOnOffer).length;

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data for MarketListingForm Availability
  const availabilityCounts = {
    available: products.filter(p => p.isAvailable).length,
    unavailable: products.filter(p => !p.isAvailable).length,
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

  // --- Handlers for MarketListingForm Actions ---
  const handleAddProduct = async (newProduct: Omit<MarketListingForm, 'id' | 'createdAt' | 'updatedAt' | 'category'>) => {
    setIsActionLoading(true);
    try {
      const addedProduct = await menuApiService.addProduct({ ...newProduct, companyId });
      // Optimistically update the products list with the new product
      setProducts(prev => [...prev, { ...addedProduct, category: categoriesData.find(c => c.categoryId === addedProduct.productCategoryId) }]);
      setShowAddToMarketModal(false);
      // No need to refresh all data if we optimistically updated and the API returns the full object
      // await refreshData(); // Uncomment if optimistic update is not sufficient or API response is incomplete
    } catch (err) {
      // Error handled by toast in apiService
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditProduct = (product: MarketListingForm) => {
    setEditingProduct(product);
    setIsEditProductModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProductData: Omit<MarketListingForm, 'id' | 'createdAt' | 'updatedAt' | 'category'>) => {
    if (!editingProduct) return;
    setIsActionLoading(true);
    try {
      const updatedProduct = await menuApiService.updateProduct(editingProduct.id, updatedProductData);
      // Update the product in the state
      setProducts(prev => prev.map(p =>
        p.id === updatedProduct.id ? { ...updatedProduct, category: categoriesData.find(c => c.categoryId === updatedProduct.productCategoryId) } : p
      ));
      setIsEditProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      // Error handled by toast in apiService
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setItemToDelete({ id: productId, type: 'product' });
    setIsConfirmModalOpen(true);
  };

  const handleToggleProductAvailability = async (productId: string, isAvailable: boolean) => {
    setIsActionLoading(true);
    try {
      const updatedProduct = await menuApiService.updateProduct(productId, { isAvailable });
      setProducts(prev => prev.map(p =>
        p.id === updatedProduct.id ? { ...updatedProduct, category: categoriesData.find(c => c.categoryId === updatedProduct.productCategoryId) } : p
      ));
    } catch (err) {
      // Error handled by toast in apiService
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleProductOffer = async (productId: string, isOnOffer: boolean) => {
    setIsActionLoading(true);
    try {
      const updatedProduct = await menuApiService.updateProduct(productId, { isOnOffer });
      setProducts(prev => prev.map(p =>
        p.id === updatedProduct.id ? { ...updatedProduct, category: categoriesData.find(c => c.categoryId === updatedProduct.productCategoryId) } : p
      ));
    } catch (err) {
      // Error handled by toast in apiService
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsActionLoading(true);
    try {
      if (itemToDelete.type === 'product') {
        await menuApiService.deleteProduct(itemToDelete.id);
        setProducts(prev => prev.filter(p => p.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'category') {
        await menuApiService.deleteCategory(itemToDelete.id);
        setCategories(prev => prev.filter(c => c.id !== itemToDelete.id));
        // Also filter products belonging to the deleted category
        setProducts(prev => prev.filter(p => p.productCategoryId !== itemToDelete.id));
      }
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      // Error handled by toast in apiService
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 md:px-6 py-8 bg-gray-900 text-gray-100 min-h-screen font-inter">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 bg-gradient-to-r from-rose-400 to-pink-600 text-transparent bg-clip-text drop-shadow-lg animate-fade-in-down">
          Menu Management
        </h1>

        {/* Action Bar: Search, Add MarketListingForm, Add Category, Sort */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-800 rounded-xl shadow-xl">
          <div className="relative w-full lg:max-w-md">
            <MagnifyingGlassCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6"   />
            <input
              type="text"
              placeholder="Search dishes by name or ingredients..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-md transition-all"
              aria-label="Search dishes"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-full"
                aria-label="Clear search"
              >
                <CheckCircleIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto p-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-md transition-all"
              aria-label="Sort by"
            >
              <option value="name-asc">Sort by Name (A-Z)</option>
              <option value="name-desc">Sort by Name (Z-A)</option>
              <option value="price-asc">Sort by Price (Low to High)</option>
              <option value="price-desc">Sort by Price (High to Low)</option>
              <option value="date-desc">Sort by Date Added (Newest)</option>
            </select>
            <button
              onClick={() => setShowAddToMarketModal(true)}
              className="px-6 py-3 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 transition-all font-semibold flex items-center justify-center transform hover:scale-105"
            >
              <PlusIcon className="w-6 h-6 mr-2" /> Add New Dish
            </button>
            
          </div>
        </div>

        {loading && <p className="text-center text-blue-400 mb-4 animate-pulse">Loading menu data...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title="Total Dishes"
            value={totalDishes}
            bgColor="bg-rose-600"
            icon={<CheckIcon className="w-6 h-6" />}
          />
          <SummaryCard
            title="Available Dishes"
            value={availableDishes}
            bgColor="bg-green-600"
            icon={<CheckCircleIcon className="w-6 h-6" />}
          />
          <SummaryCard
            title="Dishes on Offer"
            value={dishesOnOffer}
            bgColor="bg-yellow-600"
            icon={<TagIcon className="w-6 h-6" />}
          />
          <SummaryCard
            title="Total Categories"
            value={categoriesData.length}
            bgColor="bg-indigo-600"
            icon={<ListBulletIcon className="w-6 h-6 " />}
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col mb-10 border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center">
            <ArchiveBoxIcon className="mr-3 w-6 h-6 text-rose-400" /> Dish Availability Overview
          </h2>
          <div className="chart-container" style={{ height: "300px" }}>
            <Bar
              data={productAvailabilityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" as const, labels: { color: "#ddd", font: { size: 14 } } },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                              label += ': ';
                          }
                          if (context.parsed.y !== null) {
                              label += context.parsed.y;
                          }
                          return label;
                      }
                    },
                    bodyFont: { size: 14 },
                    titleFont: { size: 16, weight: 'bold' },
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    borderColor: '#rose-500',
                    borderWidth: 1,
                    cornerRadius: 8,
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#ddd", font: { size: 14 } },
                    title: { display: true, text: 'Availability Status', color: '#bbb', font: { size: 16, weight: 'bold' } }
                  },
                  y: {
                    grid: { color: "#444" },
                    ticks: { color: "#ddd", font: { size: 14 } },
                    title: { display: true, text: 'Number of Dishes', color: '#bbb', font: { size: 16, weight: 'bold' } }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 p-3 bg-gray-800 rounded-full shadow-inner mb-8 border border-gray-700">
          <button
            onClick={() => { setActiveCategoryFilter("All"); setCurrentPage(1); }}
            className={`px-6 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
              ${activeCategoryFilter === "All"
                ? "bg-rose-500 text-white shadow-md transform scale-105"
                : "bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
          >
            <AdjustmentsVerticalIcon className="w-6 h-6 inline-block mr-2" /> All Dishes
          </button>
          {categoriesData.map(category => (
            <button
              key={category.id}
              onClick={() => { setActiveCategoryFilter(category.categoryId); setCurrentPage(1); }}
              className={`px-6 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
                ${activeCategoryFilter === category.categoryId
                  ? "bg-rose-500 text-white shadow-md transform scale-105"
                  : "bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
            >
              <TagIcon className="w-6 h-6 inline-block mr-2" /> {category.displayName}
            </button>
          ))}
        </div>

        {/* Products List */}
        <section>
          {paginatedProducts.length === 0 && !loading && !error ? (
            <div className="text-center py-16 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
              <img
                src="[https://placehold.co/150x150/555/eee?text=No+Dishes](https://placehold.co/150x150/555/eee?text=No+Dishes)"
                alt="No dishes found illustration"
                className="mx-auto mb-6 opacity-70"
              />
              <p className="text-xl text-gray-400 font-medium">
                No dishes match your current filters or search.
              </p>
              <p className="text-md text-gray-500 mt-2">
                Try adjusting your search, clearing filters, or adding a new dish!
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
                  onToggleAvailability={handleToggleProductAvailability}
                  onToggleOffer={handleToggleProductOffer}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-10">
            <button
              disabled={currentPage === 1 || loading || isActionLoading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-6 py-3 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition-all font-semibold transform hover:scale-105"
            >
              Previous
            </button>
            <span className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold flex items-center justify-center border border-gray-700">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || loading || isActionLoading}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-6 py-3 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition-all font-semibold transform hover:scale-105"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add MarketListingForm Modal */}
      <Modal isOpen={showAddToMarketModal} onClose={() => setShowAddToMarketModal(false)} title="Create New Dish">
        {/* <MarketLForm
          onSubmit={handleAddProduct}
          onCancel={() => setIsAddProductModalOpen(false)}
          isLoading={isActionLoading}
          categories={categoriesData}
        /> */}
        <AddToProductMarketModal
                      showRequestProductModal={showAddToMarketModal}
                      setShowRequestProductModal={setShowAddToMarketModal}
                      product={null}   
                      marketListItem={null}
                      categories={categoriesData}
                      companyId={companyId}
                    />
      </Modal>

      {/* Edit MarketListingForm Modal */}
      <Modal isOpen={isEditProductModalOpen} onClose={() => { setIsEditProductModalOpen(false); setEditingProduct(null); }} title="Edit Dish Details">
        {editingProduct && (
          // <MarketLForm
          //   onSubmit={handleUpdateProduct}
          //   onCancel={() => { setIsEditProductModalOpen(false); setEditingProduct(null); }}
          //   isLoading={isActionLoading}
          //   categories={categoriesData}
          //   initialData={editingProduct}
          // />
          <AddToProductMarketModal
                      showRequestProductModal={showAddToMarketModal}
                      setShowRequestProductModal={setShowAddToMarketModal}
                      product={null}   
                      marketListItem={editingProduct}
                      categories={categoriesData}
                      companyId={companyId}
                    />
        )}
      </Modal>

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setItemToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title={`Confirm Deletion of ${itemToDelete?.type === 'product' ? 'Dish' : 'Category'}`}
        message={`Are you sure you want to delete this ${itemToDelete?.type === 'product' ? 'dish' : 'category'}? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isActionLoading}
      />
    </main>
  );
};

export default MenuClient;
