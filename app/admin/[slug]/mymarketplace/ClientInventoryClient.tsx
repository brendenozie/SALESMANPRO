"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductRequestModal from "@/components/ProductRequestModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import { ArrowTrendingDownIcon, ChevronLeftIcon, ChevronRightIcon, CubeTransparentIcon, GiftTopIcon, MagnifyingGlassCircleIcon, PencilIcon, PlusIcon, ShoppingBagIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ClientProps {
  companyId: string;
  productsData: MarketListingForm[];
  categoriesData: IStoreCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}

export default function ClientInventoryClient({ pagination, companyId, categoriesData, productsData }: ClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showRemoveProductModal, setShowRemoveProductModal] = useState(false);
  const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketListingForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const { page, totalPages } = pagination;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };
  
  const refreshInventory = () => {
    router.refresh();
  };
  

  const handleEditProductClick = (product: MarketListingForm) => {
    setSelectedProduct(product);
    setShowAddToMarketModal(true);
  };

  const handleRemoveProductClick = (product: MarketListingForm) => {
    setSelectedProduct(product);
    setShowRemoveProductModal(true);
  };

  const handleAddProductClick = () => {
    setSelectedProduct(null);
    setShowAddToMarketModal(true);
  };

  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productsData, searchTerm, selectedCategory]);

  const totalQuantity = productsData.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 p-4 md:p-10 transition-colors duration-300">
      
      {/* 🚀 HEADER SECTION */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              Management Portal
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Marketplace<span className="text-blue-600">.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Manage, track, and scale your product inventory.
          </p>
        </div>

        <button
          onClick={handleAddProductClick}
          className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
        >
          <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-bold">Add New Product</span>
        </button>
      </header>

      {/* 📊 ANALYTICS OVERVIEW */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Listings" value={pagination.total} icon={<ShoppingBagIcon className="w-5 h-5" />} color="text-blue-600" />
        <StatCard label="Total Stock" value={totalQuantity} icon={<GiftTopIcon className="w-5 h-5" />} color="text-emerald-600" />
        <StatCard label="Categories" value={categoriesData.length} icon={<CubeTransparentIcon className="w-5 h-5" />} color="text-purple-600" />
        <StatCard label="Market Reach" value="Top 10%" icon={<ArrowTrendingDownIcon className="w-5 h-5" />} color="text-orange-600" />
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="max-w-7xl mx-auto mb-8 sticky top-4 z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-3 rounded-2xl shadow-xl flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <MagnifyingGlassCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
            <input
              type="text"
              placeholder="Search by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white font-medium cursor-pointer min-w-[160px]"
            >
              <option value="ALL">All Categories</option>
              {categoriesData.map(cat => (
                <option key={cat.id} value={cat.displayName ?? ''}>{cat.displayName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 📦 PRODUCT GRID */}
      <div className="max-w-7xl mx-auto">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img 
                    src={product.images?.[0] || `https://via.placeholder.com/300`} 
                    alt={product.name} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {product.isNewArrival && (
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase shadow-lg">New</span>
                    )}
                    {product.isOnOffer && (
                      <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase shadow-lg">Sale</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{product.category.name}</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="mt-4 flex justify-between items-end">
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase">Price</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">
                        ${product.sellingPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs font-medium uppercase">Stock</p>
                      <p className={`text-sm font-bold ${product.quantity < 5 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {product.quantity} units
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex gap-2">
                  <button 
                    onClick={() => handleEditProductClick(product)}
                    className="flex-grow flex justify-center items-center gap-2 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleRemoveProductClick(product)}
                    className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <MagnifyingGlassCircleIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No products found</h3>
            <p className="text-gray-500 max-w-sm mt-2">We couldn't find anything matching your current filters. Try adjusting your search.</p>
          </div>
        )}
      </div>

      {/* 🔢 PAGINATION */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto mt-12 flex justify-center items-center gap-2">
          <PaginationButton onClick={() => goToPage(page - 1)} disabled={page <= 1} icon={<ChevronLeftIcon className="w-5 h-5" />} />
          <div className="flex gap-2 mx-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  page === i + 1 ? "bg-blue-600 text-white scale-110 shadow-lg" : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <PaginationButton onClick={() => goToPage(page + 1)} disabled={page >= totalPages} icon={<ChevronRightIcon className="w-5 h-5" />} />
        </div>
      )}

      {/* MODALS remain the same... */}
      {showRemoveProductModal && selectedProduct && (
        <ProductRequestModal
          showRequestProductModal={showRemoveProductModal}
          setShowRequestProductModal={setShowRemoveProductModal}
          product={selectedProduct}
        />
      )}

      {showAddToMarketModal && (
        <AddToProductMarketModal
          showRequestProductModal={showAddToMarketModal}
          setShowRequestProductModal={setShowAddToMarketModal}
          product={null} 
          marketListItem={selectedProduct}
          categories={categoriesData}
          companyId={companyId}
          locations={[]}
          refreshInventory={refreshInventory}
        />
      )}
    </div>
  );
}

// --- Helper Components ---

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-800 ${color}`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function PaginationButton({ onClick, disabled, icon }: { onClick: () => void; disabled: boolean; icon: React.ReactNode }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 transition-all ${
        disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white dark:hover:bg-gray-800 shadow-sm active:scale-90"
      }`}
    >
      {icon}
    </button>
  );
}