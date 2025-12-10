"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import Image from "next/image";
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
  MagnifyingGlassCircleIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, TagIcon, ListBulletIcon, CurrencyDollarIcon, InformationCircleIcon,
  PercentBadgeIcon,
  CircleStackIcon,
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from "@heroicons/react/20/solid";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Simple image component fallback wrapper — uses <img> for robust external fallbacks
const SafeImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [failed, setFailed] = useState(false);
  const fallback = 'https://placehold.co/400x200/333/eee?text=No+Image';
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed || !src ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
};

// --- API Service ---
const menuApiService = {
  fetchProducts: async (companyId: string, page = 1) => {
    const res = await fetch(`${apiBaseUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}&page=${page}`, { cache: 'no-store', credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    return res.json();
  },

  fetchCategories: async (companyId: string) => {
    const res = await fetch(`${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`, { cache: 'no-store', credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
    return res.json();
  },

  createProduct: async (companyId: string, payload: any) => {
    const res = await fetch(`${apiBaseUrl}/admin/my-market-place/create`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...payload, companyId })
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  updateProduct: async (productId: string, payload: any) => {
    const res = await fetch(`${apiBaseUrl}/admin/my-market-place/update/${productId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  deleteProduct: async (productId: string) => {
    const res = await fetch(`${apiBaseUrl}/admin/my-market-place/delete/${productId}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  }
};

const Modal: React.FC<any> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <CircleStackIcon className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-rose-400 mb-6 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<any> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isLoading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
        <h2 className="text-2xl font-bold text-rose-400 mb-4 text-center">{title}</h2>
        <p className="text-gray-300 text-center mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button onClick={onClose} className="px-5 py-2 bg-gray-600 text-white rounded-lg" disabled={isLoading}>{cancelText}</button>
          <button onClick={onConfirm} className="px-5 py-2 bg-red-600 text-white rounded-lg" disabled={isLoading}>{isLoading ? 'Processing...' : confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<any> = ({ title, value, bgColor, icon }) => (
  <div className={`${bgColor} text-white p-6 rounded-xl shadow-lg flex items-center justify-between`}>
    <div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-4xl font-extrabold">{value}</p>
    </div>
    <div className="text-white opacity-70">{icon}</div>
  </div>
);

const ProductCard: React.FC<any> = ({ product, onEdit, onDelete, onToggleAvailability, onToggleOffer }) => {
  const imageUrl = (product.images && product.images.length > 0) ? (product.images[0].url ?? product.images[0]) : '';

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative flex flex-col">
      <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden border border-gray-700">
        <SafeImage src={imageUrl} alt={product.name || 'Dish image'} className="w-full h-full object-cover" />
        {product.isOnOffer && (
          <span className="absolute top-3 right-3 bg-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            <PercentBadgeIcon className="w-6 h-6 inline-block mr-1" /> On Offer!
          </span>
        )}
        {!product.isAvailable && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            <CircleStackIcon className="w-6 h-6 inline-block mr-1" /> Unavailable
          </span>
        )}
      </div>

      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-rose-400 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-400 mb-1 flex items-center">
          <TagIcon className="w-5 h-5 mr-2 text-gray-500" /> Category: <span className="text-gray-300 ml-1">{product.category?.displayName || product.category?.name || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-1 line-clamp-2 flex items-start">
          <InformationCircleIcon className="w-5 h-5 inline-block mr-2 text-gray-500" /> <span className="text-gray-300">{product.description || 'No description provided.'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-4 flex items-center">
          <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gray-500" />
          <span className="text-green-400 font-medium text-lg">${(Number(product.finalPrice) || 0).toFixed(2)}</span>
          {product.discount && product.discount > 0 && (
            <span className="ml-2 text-xs text-gray-500 line-through">${(Number(product.sellingPrice) || 0).toFixed(2)}</span>
          )}
        </p>
      </div>

      <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Available:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={!!product.isAvailable} onChange={() => onToggleAvailability(product.id || product._id, !product.isAvailable)} />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500" />
          </label>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">On Offer:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={!!product.isOnOffer} onChange={() => onToggleOffer(product.id || product._id, !product.isOnOffer)} />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-yellow-500" />
          </label>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => onEdit(product)}>
            <PencilIcon className="w-5 h-5 mr-2 inline" /> Edit
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={() => onDelete(product.id || product._id)}>
            <TrashIcon className="w-5 h-5 mr-2 inline" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuClient: React.FC<any> = ({ companyId, categoriesData = [], productsData = [] }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('name-asc');

  const itemsPerPage = 8;

  // fetch products with pagination
  const loadProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await menuApiService.fetchProducts(companyId, page);
      // Expecting API structure: { data: { results: [], meta: { totalPages, currentPage, totalItems } } }
      const results = res?.data?.results || res?.results || [];
      const meta = res?.data?.meta || res?.meta || { totalPages: 1 };

      setProducts(results.map((p: any) => ({ ...p })));
      setTotalPages(meta.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('loadProducts error', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await menuApiService.fetchCategories(companyId);
      const results = res?.data?.results || res?.results || [];
      setCategories(results);
    } catch (err: any) {
      console.error('loadCategories error', err);
    }
  }, [companyId]);

  useEffect(() => {
    setProducts(Array.isArray(productsData) ? productsData : []);
    setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    // If parent supplied data, set pagination to 1 initially
    setLoading(false);
  }, [productsData, categoriesData]);

  useEffect(() => {
    // load from API when companyId or page changes
    loadProducts(currentPage);
    loadCategories();
  }, [companyId, currentPage, loadProducts, loadCategories]);

  // Filter & Sort
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.slice();
    if (activeCategoryFilter !== 'All') {
      filtered = filtered.filter(p => (p.productCategoryId || p.productCategory || '') === activeCategoryFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const name = (p.name || '').toString().toLowerCase();
        const desc = (p.description || '').toString().toLowerCase();
        const ingredients = (p.ingredients || '').toString().toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || desc.includes(term) || ingredients.includes(term);
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').toString().localeCompare((b.name || '').toString());
        case 'name-desc':
          return (b.name || '').toString().localeCompare((a.name || '').toString());
        case 'price-asc':
          return (Number(a.finalPrice) || 0) - (Number(b.finalPrice) || 0);
        case 'price-desc':
          return (Number(b.finalPrice) || 0) - (Number(a.finalPrice) || 0);
        case 'date-desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, activeCategoryFilter, searchTerm, sortBy]);

  const totalDishes = products.length;
  const availableDishes = products.filter(p => !!p.isAvailable).length;
  const dishesOnOffer = products.filter(p => !!p.isOnOffer).length;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const availabilityCounts = { available: availableDishes, unavailable: totalDishes - availableDishes };
  const productAvailabilityChartData = {
    labels: ['Available', 'Unavailable'],
    datasets: [
      {
        data: [availabilityCounts.available, availabilityCounts.unavailable],
      },
    ],
  };

  // CRUD handlers
  const handleCreateProduct = async (formData: any) => {
    setIsActionLoading(true);
    try {
      await menuApiService.createProduct(companyId, formData);
      toast.success('Product created');
      // reload first page to show new item
      setCurrentPage(1);
      await loadProducts(1);
      setShowAddToMarketModal(false);
    } catch (err: any) {
      console.error('create error', err);
      toast.error(err?.message || 'Failed to create product');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateProduct = async (productId: string, formData: any) => {
    setIsActionLoading(true);
    try {
      await menuApiService.updateProduct(productId, formData);
      toast.success('Product updated');
      await loadProducts(currentPage);
      setIsEditProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('update error', err);
      toast.error(err?.message || 'Failed to update product');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setItemToDelete({ id: productId, type: 'product' });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsActionLoading(true);
    try {
      await menuApiService.deleteProduct(itemToDelete.id);
      toast.success('Deleted');
      // refresh current page
      await loadProducts(currentPage);
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('delete error', err);
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleAvailability = async (productId: string, isAvailable: boolean) => {
    setIsActionLoading(true);
    try {
      await menuApiService.updateProduct(productId, { isAvailable });
      await loadProducts(currentPage);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update availability');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleOffer = async (productId: string, isOnOffer: boolean) => {
    setIsActionLoading(true);
    try {
      await menuApiService.updateProduct(productId, { isOnOffer });
      await loadProducts(currentPage);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update offer flag');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 md:px-6 py-8 bg-gray-900 text-gray-100 min-h-screen font-inter">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 bg-gradient-to-r from-rose-400 to-pink-600 text-transparent bg-clip-text">Menu Management</h1>

        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-800 rounded-xl shadow-xl">
          <div className="relative w-full lg:max-w-md">
            <MagnifyingGlassCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input type="text" placeholder="Search dishes by name or ingredients..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-700 text-gray-200" />
            {searchTerm && (<button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"> <CheckCircleIcon className="w-6 h-6" /> </button>)}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-3 rounded-lg bg-gray-700 text-gray-200">
              <option value="name-asc">Sort by Name (A-Z)</option>
              <option value="name-desc">Sort by Name (Z-A)</option>
              <option value="price-asc">Sort by Price (Low to High)</option>
              <option value="price-desc">Sort by Price (High to Low)</option>
              <option value="date-desc">Sort by Date Added (Newest)</option>
            </select>
            <button onClick={() => setShowAddToMarketModal(true)} className="px-6 py-3 bg-rose-500 text-white rounded-lg flex items-center"> <PlusIcon className="w-6 h-6 mr-2" /> Add New Dish</button>
          </div>
        </div>

        {loading && <p className="text-center text-blue-400 mb-4">Loading menu data...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard title="Total Dishes" value={totalDishes} bgColor="bg-rose-600" icon={<CheckIcon className="w-6 h-6" />} />
          <SummaryCard title="Available Dishes" value={availableDishes} bgColor="bg-green-600" icon={<CheckCircleIcon className="w-6 h-6" />} />
          <SummaryCard title="Dishes on Offer" value={dishesOnOffer} bgColor="bg-yellow-600" icon={<TagIcon className="w-6 h-6" />} />
          <SummaryCard title="Total Categories" value={categories.length} bgColor="bg-indigo-600" icon={<ListBulletIcon className="w-6 h-6" />} />
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col mb-10 border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center"> <ArchiveBoxIcon className="mr-3 w-6 h-6 text-rose-400" /> Dish Availability Overview</h2>
          <div style={{ height: 300 }}>
            <Bar data={productAvailabilityChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 p-3 bg-gray-800 rounded-full shadow-inner mb-8 border border-gray-700">
          <button onClick={() => { setActiveCategoryFilter('All'); setCurrentPage(1); }} className={`${activeCategoryFilter === 'All' ? 'bg-rose-500 text-white' : 'bg-transparent text-gray-300'} px-6 py-2 rounded-full`}> <AdjustmentsVerticalIcon className="w-6 h-6 inline-block mr-2" /> All Dishes</button>
          {categories.map((category: any) => (
            <button key={category.id || category.categoryId} onClick={() => { setActiveCategoryFilter(category.categoryId || category.id || ''); setCurrentPage(1); }} className={`${activeCategoryFilter === (category.categoryId || category.id) ? 'bg-rose-500 text-white' : 'bg-transparent text-gray-300'} px-6 py-2 rounded-full`}>
              <TagIcon className="w-6 h-6 inline-block mr-2" /> {category.displayName || category.name}
            </button>
          ))}
        </div>

        <section>
          {paginatedProducts.length === 0 && !loading && !error ? (
            <div className="text-center py-16 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
              <img src={'https://placehold.co/150x150/555/eee?text=No+Dishes'} alt="No dishes" className="mx-auto mb-6 opacity-70" />
              <p className="text-xl text-gray-400 font-medium">No dishes match your current filters or search.</p>
              <p className="text-md text-gray-500 mt-2">Try adjusting your search, clearing filters, or adding a new dish!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={(product.id || product._id) ?? Math.random()} product={product} onEdit={(p:any) => { setEditingProduct(p); setIsEditProductModalOpen(true); }} onDelete={handleDeleteProduct} onToggleAvailability={(id:any, v:boolean) => handleToggleAvailability(id, v)} onToggleOffer={(id:any, v:boolean) => handleToggleOffer(id, v)} />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls (uses server-side totalPages where available) */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-10">
            <button disabled={currentPage === 1 || loading || isActionLoading} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="px-6 py-3 bg-gray-700 rounded-lg text-white">Previous</button>
            <span className="px-6 py-3 bg-gray-800 text-white rounded-lg">{`Page ${currentPage} of ${totalPages}`}</span>
            <button disabled={currentPage === totalPages || loading || isActionLoading} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className="px-6 py-3 bg-gray-700 rounded-lg text-white">Next</button>
          </div>
        )}

      </div>

      <Modal isOpen={showAddToMarketModal} onClose={() => setShowAddToMarketModal(false)} title="Create New Dish">
        <AddToProductMarketModal showRequestProductModal={showAddToMarketModal} setShowRequestProductModal={setShowAddToMarketModal} product={null} marketListItem={null} categories={categories} companyId={companyId} locations={[]} />
      </Modal>

      <Modal isOpen={isEditProductModalOpen} onClose={() => { setIsEditProductModalOpen(false); setEditingProduct(null); }} title="Edit Dish Details">
        {isEditProductModalOpen && (
          <AddToProductMarketModal showRequestProductModal={isEditProductModalOpen} setShowRequestProductModal={setIsEditProductModalOpen} product={null} marketListItem={editingProduct} categories={categories} companyId={companyId} locations={[]} />
        )}
      </Modal>

      <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => { setIsConfirmModalOpen(false); setItemToDelete(null); }} onConfirm={confirmDelete} title={`Confirm Deletion of ${itemToDelete?.type === 'product' ? 'Dish' : 'Category'}`} message={`Are you sure you want to delete this ${itemToDelete?.type === 'product' ? 'dish' : 'category'}? This action cannot be undone.`} confirmText="Delete" isLoading={isActionLoading} />
    </main>
  );
};

export default MenuClient;
