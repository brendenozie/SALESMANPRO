"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ArrowUturnLeftIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  InboxStackIcon,
  BoltIcon,
  TableCellsIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  TrashIcon,
  QrCodeIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon as CloseIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

// Modals & Tools
import AddProductModal from "@/components/AddProductModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import AssignProductModal from "@/components/AssignProductModal";
import RestockProductModal from "@/components/RestockProductModal";
import ReturnProductModal from "@/components/ReturnProductModal";
import QuickProductModal from "@/components/QuickProductModal";
import BulkImportWizard from "@/components/marketplace/BulkImportWizard";
import ProductBarcodeModal from "@/components/ProductBarcodeModal";
import BulkPriceAdjustModal from "@/components/BulkPriceAdjustModal";
import SyncStatusBadge from "@/components/marketplace/SyncStatusBadge";
import SocialSeoPreview from "@/components/marketplace/SocialSeoPreview";
import { ProductForm, IStoreCategory } from "@/types/typings";

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  companyStock: number;
  agentStock: number;
  sales: number;
  commissionType: string;
  commissionRate: number;
  category: {
    displayName: string;
  };
  productItem: ProductForm;
}

type Agent = { id: string; name: string };

interface ClientProps {
  companyId: string;
  productsData: InventoryItem[];
  categoriesData: IStoreCategory[];
  agentsData: Agent[];
}

export default function AdminInventoryClient({
  companyId,
  productsData,
  categoriesData,
  agentsData,
}: ClientProps) {
  // Modal states
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAssignProductModal, setShowAssignProductModal] = useState(false);
  const [showReturnProductModal, setShowReturnProductModal] = useState(false);
  const [showRestockProductModal, setShowRestockProductModal] = useState(false);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<any | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPublishingBulk, setIsPublishingBulk] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");

  const [productsList, setProductsList] = useState<InventoryItem[]>(productsData);
  const [selectedProduct, setSelectedProduct] = useState<ProductForm | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  React.useEffect(() => {
    setProductsList(productsData);
  }, [productsData]);

  const refreshInventory = () => {
    router.refresh();
  };

  const handleInlineUpdate = async (
    productId: string,
    field: "sellingPrice" | "companyStock",
    value: number
  ) => {
    const previousList = [...productsList];
    // Optimistic UI update
    setProductsList((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          if (field === "companyStock") {
            return { ...item, companyStock: value };
          } else {
            return {
              ...item,
              sellingPrice: value,
              productItem: {
                ...item.productItem,
                sellingPrice: value,
              },
            } as any;
          }
        }
        return item;
      })
    );

    try {
      const res = await fetch("/api/admin/post-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          companyId,
          [field]: value,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update");
      }
      toast.success(
        `Updated ${field === "sellingPrice" ? "Price" : "Stock"} successfully`
      );
    } catch (err: any) {
      setProductsList(previousList);
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDeleteProduct = async (product: any) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This will permanently remove its inventory and marketplace listings.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete product");
      }
      setProductsList((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} selected products?`)) {
      return;
    }
    try {
      const idsToDelete = Array.from(selectedIds);
      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`/api/admin/products/${id}`, { method: "DELETE" })
        )
      );
      setProductsList((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      toast.success(`${idsToDelete.length} products deleted`);
    } catch (err: any) {
      toast.error("Failed to delete some products");
    }
  };

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsList, searchQuery]);

  // Stat Calculations
  const totalCompanyStock = productsList.reduce((acc, curr) => acc + curr.companyStock, 0);
  const totalSales = productsList.reduce((acc, curr) => acc + curr.sales, 0);

  // Modal Triggers
  const openModal = (product: ProductForm, setter: (val: boolean) => void) => {
    setSelectedProduct(product);
    setter(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  // Bulk Publish to Marketplace
  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Publish ${selectedIds.size} selected products to Ghuba Marketplace?`)) return;

    setIsPublishingBulk(true);
    setBulkMessage("");

    try {
      let successCount = 0;
      for (const id of Array.from(selectedIds)) {
        const product = productsData.find((p) => p.id === id);
        if (!product) continue;

        const res = await fetch("/api/admin/post-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: product.id,
            companyId,
            name: product.name,
            costPrice: (product as any).costPrice ?? product.productItem?.costPrice ?? product.productItem?.buyingPrice ?? 0,
            sellingPrice: (product as any).sellingPrice ?? product.productItem?.sellingPrice ?? 0,
            publishToMarketplace: true,
          }),
        });

        if (res.ok) successCount++;
      }

      setBulkMessage(`Successfully published ${successCount} products to Marketplace!`);
      setSelectedIds(new Set());
      refreshInventory();
      setTimeout(() => setBulkMessage(""), 4000);
    } catch (err: any) {
      setBulkMessage(`Bulk publish error: ${err.message}`);
    } finally {
      setIsPublishingBulk(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-24">
      {/* 🚀 TOP NAVIGATION/STATS */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <CubeIcon className="w-8 h-8 text-indigo-600" />
              Inventory Central
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow md:w-56">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
              />
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => setShowQuickAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-none"
              title="Quick Add Product in seconds"
            >
              <BoltIcon className="w-4 h-4 text-yellow-300" />
              Quick Add
            </button>

            {/* Bulk Import Button */}
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Upload CSV / Excel"
            >
              <TableCellsIcon className="w-4 h-4 text-emerald-600" />
              Bulk Import
            </button>

            {/* Detailed Add Form Button */}
            <button
              onClick={() => { setSelectedProduct(null); setShowAddProductModal(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all"
              title="Open full multi-step product form"
            >
              <PlusIcon className="w-4 h-4" />
              Full Form
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {bulkMessage && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
            {bulkMessage}
          </div>
        )}

        {/* 📊 KEY PERFORMANCE INDICATORS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatMiniCard title="Total Inventory" value={totalCompanyStock} icon={<InboxStackIcon />} color="text-blue-600" />
          <StatMiniCard title="Cumulative Sales" value={totalSales} icon={<ArrowTrendingUpIcon />} color="text-emerald-600" />
          <StatMiniCard title="Active Agents" value={agentsData.length} icon={<UserPlusIcon />} color="text-purple-600" />
        </div>

        {/* Selection summary bar */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                onChange={selectAll}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="font-semibold">
                {selectedIds.size > 0
                  ? `${selectedIds.size} of ${filteredProducts.length} selected`
                  : `Select all (${filteredProducts.length})`}
              </span>
            </div>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Clear Selection
              </button>
            )}
          </div>
        )}

        {/* 📦 PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <InventoryCard 
                key={product.id} 
                product={product}
                isSelected={selectedIds.has(product.id)}
                onToggleSelect={() => toggleSelect(product.id)}
                onInlineUpdate={handleInlineUpdate}
                onBarcode={() => setBarcodeProduct(product)}
                onPreview={() => setPreviewProduct(product)}
                onEdit={() => openModal(product.productItem || (product as any), setShowEditProductModal)}
                onDelete={() => handleDeleteProduct(product)}
                onRestock={() => openModal(product.productItem || (product as any), setShowRestockProductModal)}
                onAssign={() => openModal(product.productItem || (product as any), setShowAssignProductModal)}
                onReturn={() => openModal(product.productItem || (product as any), setShowReturnProductModal)}
                onMarket={() => openModal(product.productItem || (product as any), setShowAddToMarketProductModal)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAdd={() => setShowQuickAddModal(true)} />
        )}
      </main>

      {/* FLOATING BULK ACTIONS TOOLBAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3.5 rounded-full shadow-2xl border border-gray-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-bold whitespace-nowrap">
            {selectedIds.size} items selected
          </span>
          <div className="h-4 w-px bg-gray-700" />
          <button
            onClick={() => setShowBulkPriceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-md whitespace-nowrap"
          >
            <CurrencyDollarIcon className="w-3.5 h-3.5" />
            Bulk Price Adjust
          </button>
          <button
            onClick={handleBulkPublish}
            disabled={isPublishingBulk}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-md whitespace-nowrap"
          >
            {isPublishingBulk ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RocketLaunchIcon className="w-3.5 h-3.5 text-yellow-300" />
            )}
            Publish to Marketplace
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition-all shadow-md whitespace-nowrap"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-gray-400 hover:text-white font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {/* QUICK ADD MODAL */}
      <QuickProductModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        companyId={companyId}
        categories={categoriesData}
        onProductCreated={() => {
          refreshInventory();
        }}
        onOpenDetailedForm={(prefilled) => {
          setSelectedProduct(prefilled);
          setShowAddProductModal(true);
        }}
      />

      {/* BULK IMPORT WIZARD */}
      <BulkImportWizard
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        companyId={companyId}
        onImportComplete={refreshInventory}
      />

      {/* EXISTING FULL MODALS */}
      <ModalManager 
        states={{
          showAddProductModal, setShowAddProductModal,
          showEditProductModal, setShowEditProductModal,
          showRestockProductModal, setShowRestockProductModal,
          showAssignProductModal, setShowAssignProductModal,
          showReturnProductModal, setShowReturnProductModal,
          showAddToMarketProductModal, setShowAddToMarketProductModal
        }}
        data={{ companyId, categoriesData, agentsData, selectedProduct }}
        refreshInventory={refreshInventory}
      />

      {/* PRODUCT BARCODE & QR SHELF LABEL MODAL */}
      <ProductBarcodeModal
        isOpen={!!barcodeProduct}
        onClose={() => setBarcodeProduct(null)}
        product={barcodeProduct}
      />

      {/* BULK PRICE ADJUSTMENT MODAL */}
      <BulkPriceAdjustModal
        isOpen={showBulkPriceModal}
        onClose={() => setShowBulkPriceModal(false)}
        selectedProducts={filteredProducts.filter((p) => selectedIds.has(p.id))}
        companyId={companyId}
        onSuccess={() => {
          setSelectedIds(new Set());
          refreshInventory();
        }}
      />

      {/* SOCIAL & SEARCH ENGINE PREVIEW MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShareIcon className="w-5 h-5 text-indigo-600" />
                Marketplace & Social Channel Live Preview
              </h3>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <SocialSeoPreview
              title={previewProduct.name}
              description={
                previewProduct.description ||
                previewProduct.productItem?.description ||
                ""
              }
              price={
                previewProduct.sellingPrice ||
                previewProduct.productItem?.sellingPrice ||
                0
              }
              imageUrl={
                previewProduct.images?.[0]?.url ||
                previewProduct.productItem?.images?.[0]?.url ||
                (typeof previewProduct.images?.[0] === "string"
                  ? previewProduct.images[0]
                  : undefined)
              }
              stock={
                previewProduct.companyStock ??
                previewProduct.productItem?.companyStock ??
                previewProduct.quantity ??
                0
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Components ---

function InventoryCard({
  product,
  isSelected,
  onToggleSelect,
  onInlineUpdate,
  onBarcode,
  onPreview,
  onEdit,
  onDelete,
  onRestock,
  onAssign,
  onReturn,
  onMarket,
}: any) {
  const stockRatio = (product.companyStock / (product.companyStock + 100)) * 100;
  const isMarketplaceActive =
    product.productItem?.showOnGhuba ||
    (product.productItem?.marketplaceListings &&
      product.productItem.marketplaceListings.length > 0) ||
    (product.marketplaceListings && product.marketplaceListings.length > 0);

  // Inline Price Editing State
  const currentPrice =
    product.productItem?.sellingPrice ||
    (product as any).sellingPrice ||
    (product as any).salesPrice ||
    0;
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState<string>(String(currentPrice));

  React.useEffect(() => {
    setPriceInput(String(currentPrice));
  }, [currentPrice]);

  const savePrice = () => {
    const val = parseFloat(priceInput);
    if (!isNaN(val) && val >= 0 && val !== currentPrice) {
      onInlineUpdate(product.id, "sellingPrice", val);
    }
    setIsEditingPrice(false);
  };

  // Inline Stock Editing State
  const currentStock = product.companyStock || 0;
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [stockInput, setStockInput] = useState<string>(String(currentStock));

  React.useEffect(() => {
    setStockInput(String(currentStock));
  }, [currentStock]);

  const saveStock = () => {
    const val = parseInt(stockInput, 10);
    if (!isNaN(val) && val >= 0 && val !== currentStock) {
      onInlineUpdate(product.id, "companyStock", val);
    }
    setIsEditingStock(false);
  };

  const stepStock = (delta: number) => {
    const nextVal = Math.max(0, currentStock + delta);
    if (nextVal !== currentStock) {
      onInlineUpdate(product.id, "companyStock", nextVal);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-3xl border p-6 shadow-sm hover:shadow-xl transition-all group relative ${
        isSelected
          ? "border-indigo-600 ring-2 ring-indigo-500/20"
          : "border-gray-100 dark:border-gray-800"
      }`}
    >
      {/* Multi-select checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
        />
      </div>

      <div className="flex justify-between items-start mb-6 pl-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
              {product.category?.displayName ||
                (product as any).category?.name ||
                "General"}
            </span>
            <SyncStatusBadge product={product} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          {/* Price with Inline Quick Editor */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-400 font-medium">Price:</span>
            {isEditingPrice ? (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-500">KES</span>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") savePrice();
                    if (e.key === "Escape") {
                      setPriceInput(String(currentPrice));
                      setIsEditingPrice(false);
                    }
                  }}
                  autoFocus
                  className="w-20 px-1.5 py-0.5 text-xs font-bold bg-white dark:bg-gray-800 border border-indigo-500 rounded focus:outline-none"
                />
                <button
                  onClick={savePrice}
                  className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                  title="Save price"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setPriceInput(String(currentPrice));
                    setIsEditingPrice(false);
                  }}
                  className="p-0.5 text-gray-400 hover:bg-gray-100 rounded"
                  title="Cancel"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingPrice(true)}
                className="text-xs font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 group/price px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Click to edit selling price inline"
              >
                <span>KES {currentPrice}</span>
                <PencilSquareIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover/price:opacity-100 transition-opacity" />
              </button>
            )}
            <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
            <span className="text-xs text-gray-400 font-medium">
              Cost: KES{" "}
              {product.productItem?.costPrice ||
                (product as any).costPrice ||
                0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPreview}
            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full transition-colors"
            title="Preview Social Share & Google Search snippet"
          >
            <ShareIcon className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
          </button>
          <button
            onClick={onBarcode}
            className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-full transition-colors"
            title="Print Barcode / QR Shelf Label"
          >
            <QrCodeIcon className="w-5 h-5 text-gray-400 hover:text-indigo-600" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Edit Product Details"
          >
            <PencilSquareIcon className="w-5 h-5 text-gray-400 hover:text-indigo-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition-colors"
            title="Delete Product"
          >
            <TrashIcon className="w-5 h-5 text-gray-400 hover:text-rose-600" />
          </button>
        </div>
      </div>

      {/* Stock Levels with Inline Stepper & Input */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <div className="flex justify-between items-center text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase">
            <span>Company Holding</span>
            {isEditingStock ? (
              <div className="flex items-center gap-1 normal-case">
                <input
                  type="number"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveStock();
                    if (e.key === "Escape") {
                      setStockInput(String(currentStock));
                      setIsEditingStock(false);
                    }
                  }}
                  autoFocus
                  className="w-16 px-1.5 py-0.5 text-xs font-bold bg-white dark:bg-gray-800 border border-indigo-500 rounded focus:outline-none"
                />
                <button
                  onClick={saveStock}
                  className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                  title="Save stock"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setStockInput(String(currentStock));
                    setIsEditingStock(false);
                  }}
                  className="p-0.5 text-gray-400 hover:bg-gray-100 rounded"
                  title="Cancel"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 normal-case">
                <button
                  onClick={() => stepStock(-1)}
                  className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-black text-xs"
                  title="Decrease stock by 1"
                >
                  -
                </button>
                <button
                  onClick={() => setIsEditingStock(true)}
                  className="text-gray-900 dark:text-white font-black hover:text-indigo-600 px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Click to edit stock inline"
                >
                  {currentStock} units
                </button>
                <button
                  onClick={() => stepStock(1)}
                  className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-black text-xs"
                  title="Increase stock by 1"
                >
                  +
                </button>
              </div>
            )}
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(stockRatio, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Agent Stock</p>
            <p className="text-lg font-black text-purple-600">{product.agentStock}</p>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 self-center" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Sales</p>
            <p className="text-lg font-black text-emerald-500">{product.sales}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-2">
        <ActionButton icon={<ArrowPathIcon />} label="Restock" onClick={onRestock} color="bg-emerald-50 text-emerald-700 hover:bg-emerald-500" />
        <ActionButton icon={<UserPlusIcon />} label="Assign" onClick={onAssign} color="bg-blue-50 text-blue-700 hover:bg-blue-500" />
        <ActionButton icon={<ArrowUturnLeftIcon />} label="Return" onClick={onReturn} color="bg-orange-50 text-orange-700 hover:bg-orange-500" />
        <ActionButton icon={<ShoppingBagIcon />} label={isMarketplaceActive ? "Market Listing" : "Publish"} onClick={onMarket} color="bg-indigo-50 text-indigo-700 hover:bg-indigo-500" />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 hover:text-white ${color}`}
    >
      {React.cloneElement(icon, { className: "w-4 h-4" })}
      <span>{label}</span>
    </button>
  );
}

function StatMiniCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 ${color}`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
      <CubeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">No inventory items found</h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-6">
        Start by adding your first product to inventory or importing a spreadsheet.
      </p>
      <button
        onClick={onAdd}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200"
      >
        + Add First Product
      </button>
    </div>
  );
}

function ModalManager({ states, data, refreshInventory }: any) {
  return (
    <>
      {states.showAddProductModal && (
        <AddProductModal
          showRequestProductModal={states.showAddProductModal}
          setShowRequestProductModal={states.setShowAddProductModal}
          categories={data.categoriesData}
          companyId={data.companyId}
          product={data.selectedProduct}
          refreshInventory={refreshInventory}
        />
      )}
      {states.showEditProductModal && data.selectedProduct && (
        <AddProductModal
          showRequestProductModal={states.showEditProductModal}
          setShowRequestProductModal={states.setShowEditProductModal}
          categories={data.categoriesData}
          companyId={data.companyId}
          product={data.selectedProduct}
          refreshInventory={refreshInventory}
        />
      )}
      {states.showRestockProductModal && data.selectedProduct && (
        <RestockProductModal
          showRestockProductModal={states.showRestockProductModal}
          setShowRestockProductModal={states.setShowRestockProductModal}
          product={data.selectedProduct}
          companyId={data.companyId}
          refreshInventory={refreshInventory}
        />
      )}
      {states.showAssignProductModal && data.selectedProduct && (
        <AssignProductModal
          showAssignProductModal={states.showAssignProductModal}
          setShowAssignProductModal={states.setShowAssignProductModal}
          product={data.selectedProduct}
          companyId={data.companyId}
          agents={data.agentsData}
          refreshInventory={refreshInventory}
        />
      )}
      {states.showReturnProductModal && data.selectedProduct && (
        <ReturnProductModal
          showReturnProductModal={states.showReturnProductModal}
          setShowReturnProductModal={states.setShowReturnProductModal}
          product={data.selectedProduct}
          companyId={data.companyId}
          refreshInventory={refreshInventory}
        />
      )}
      {states.showAddToMarketProductModal && data.selectedProduct && (
        <AddToProductMarketModal
          showRequestProductModal={states.showAddToMarketProductModal}
          setShowRequestProductModal={states.setShowAddToMarketProductModal}
          categories={data.categoriesData}
          product={data.selectedProduct}
          companyId={data.companyId}
          locations={[]}
          refreshInventory={refreshInventory}
        />
      )}
    </>
  );
}