"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductRequestModal from "@/components/ProductRequestModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import QuickMarketplaceModal from "@/components/QuickMarketplaceModal";
import ProductListingLinkerModal from "@/components/marketplace/ProductListingLinkerModal";
import BulkImportWizard from "@/components/marketplace/BulkImportWizard";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import {
  ArrowTrendingDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeTransparentIcon,
  GiftTopIcon,
  MagnifyingGlassCircleIcon,
  PencilIcon,
  PlusIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TrashIcon,
  BoltIcon,
  TableCellsIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

interface ClientProps {
  companyId: string;
  productsData: MarketListingForm[];
  categoriesData: IStoreCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  slug: string;
  page: number;
  limit: number;
  searchParams?: { page?: string };
}

export default function ClientInventoryClient({
  pagination,
  companyId,
  categoriesData,
  productsData,
  slug,
}: ClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modals
  const [showQuickMarketModal, setShowQuickMarketModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showLinkerModal, setShowLinkerModal] = useState(false);
  const [selectedListingForLink, setSelectedListingForLink] = useState<any | null>(null);

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

  const handleAiMarketingClick = (product: MarketListingForm) => {
    const query = new URLSearchParams({
      productId: product.id || "",
      name: product.name,
      description: product.description || "",
      price: product.sellingPrice.toString(),
      image: product.images?.[0] || "",
      imageUrl: product.images?.[0] || "",
      category:
        (product.category as any)?.name ||
        (product.category as any)?.displayName ||
        product.category ||
        "",
      subcategory: product.subCategory?.name || "",
    }).toString();

    router.push(`/admin/${slug}/ai-studio?${query}`);
  };

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || (product.category as any) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productsData, searchTerm, selectedCategory]);

  const totalQuantity = productsData.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 p-4 md:p-10 transition-colors duration-300 pb-24">
      {/* 🚀 HEADER SECTION */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              Management Portal
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Page {page} of {totalPages || 1}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Marketplace Listings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage public listings, pricing, and synchronization with inventory.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowQuickMarketModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 dark:shadow-none transition-all active:scale-95"
            title="Quick Add customer-facing listing"
          >
            <BoltIcon className="w-4 h-4 text-yellow-300" />
            Quick Add Listing
          </button>

          <button
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold shadow-sm transition-all"
            title="Bulk import listings via CSV"
          >
            <TableCellsIcon className="w-4 h-4 text-emerald-600" />
            Bulk Import
          </button>

          <button
            onClick={handleAddProductClick}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all"
            title="Open detailed multi-step listing modal"
          >
            <PlusIcon className="w-4 h-4" />
            Full Setup
          </button>
        </div>
      </header>

      {/* 📊 KPI SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600">
            <ShoppingBagIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Total Listings</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{pagination.total}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
            <CubeTransparentIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Total Units</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{totalQuantity}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600">
            <GiftTopIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">On Special Offer</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {productsData.filter((p) => p.isOnOffer).length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Featured Listings</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {productsData.filter((p) => p.isFeatured).length}
            </p>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH AND FILTERS */}
      <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search listings by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
          <MagnifyingGlassCircleIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex gap-4">
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              {categoriesData.map((cat) => (
                <option key={cat.categoryId || cat.displayName} value={cat.displayName ?? ""}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 📦 LISTING GRID */}
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
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {product.isNewArrival && (
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase shadow">
                        New
                      </span>
                    )}
                    {product.isOnOffer && (
                      <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase shadow">
                        Sale
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest truncate max-w-[120px]">
                      {(product.category as any)?.name || (product.category as any)?.displayName || product.category || "General"}
                    </span>

                    {/* Product Link Badge */}
                    {product.productId ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        ✓ Linked
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedListingForLink(product);
                          setShowLinkerModal(true);
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                        title="Connect with inventory product"
                      >
                        <LinkIcon className="w-3 h-3" /> Connect
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="pt-2 flex justify-between items-end">
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase">Customer Price</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        KES {product.sellingPrice?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-[10px] font-bold uppercase">Available</p>
                      <p
                        className={`text-xs font-bold ${
                          product.quantity < 5 ? "text-red-500" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {product.quantity} units
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex gap-2 border-t border-gray-100 dark:border-gray-800/60">
                  <button
                    onClick={() => handleEditProductClick(product)}
                    className="flex-grow flex justify-center items-center gap-1.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => handleAiMarketingClick(product)}
                    title="Generate AI Marketing Assets & Plan"
                    className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>AI Studio</span>
                  </button>

                  <button
                    onClick={() => handleRemoveProductClick(product)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MagnifyingGlassCircleIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No listings found</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6">
              Create your first customer-facing listing or import a batch.
            </p>
            <button
              onClick={() => setShowQuickMarketModal(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              + Quick Add Listing
            </button>
          </div>
        )}
      </div>

      {/* 🔢 PAGINATION */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto mt-12 flex justify-center items-center gap-2">
          <PaginationButton
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            icon={<ChevronLeftIcon className="w-4 h-4" />}
          />
          <div className="flex gap-2 mx-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => goToPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  page === i + 1
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <PaginationButton
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            icon={<ChevronRightIcon className="w-4 h-4" />}
          />
        </div>
      )}

      {/* QUICK MARKETPLACE MODAL */}
      <QuickMarketplaceModal
        isOpen={showQuickMarketModal}
        onClose={() => setShowQuickMarketModal(false)}
        companyId={companyId}
        categories={categoriesData}
        onListingCreated={refreshInventory}
        onOpenDetailedForm={(prefill) => {
          setSelectedProduct(prefill);
          setShowAddToMarketModal(true);
        }}
      />

      {/* BULK IMPORT WIZARD */}
      <BulkImportWizard
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        companyId={companyId}
        onImportComplete={refreshInventory}
      />

      {/* PRODUCT LISTING LINKER MODAL */}
      {selectedListingForLink && (
        <ProductListingLinkerModal
          isOpen={showLinkerModal}
          onClose={() => {
            setShowLinkerModal(false);
            setSelectedListingForLink(null);
          }}
          companyId={companyId}
          listing={selectedListingForLink}
          onLinkSuccess={refreshInventory}
        />
      )}

      {/* EXISTING FULL MODALS */}
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

function PaginationButton({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      }`}
    >
      {icon}
    </button>
  );
}