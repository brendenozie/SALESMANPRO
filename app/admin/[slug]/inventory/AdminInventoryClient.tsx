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
} from "@heroicons/react/24/outline";

// Modals & Tools
import AddProductModal from "@/components/AddProductModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import AssignProductModal from "@/components/AssignProductModal";
import RestockProductModal from "@/components/RestockProductModal";
import ReturnProductModal from "@/components/ReturnProductModal";
import QuickProductModal from "@/components/QuickProductModal";
import BulkImportWizard from "@/components/marketplace/BulkImportWizard";
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

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPublishingBulk, setIsPublishingBulk] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<ProductForm | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const refreshInventory = () => {
    router.refresh();
  };

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return productsData.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsData, searchQuery]);

  // Stat Calculations
  const totalCompanyStock = productsData.reduce((acc, curr) => acc + curr.companyStock, 0);
  const totalSales = productsData.reduce((acc, curr) => acc + curr.sales, 0);

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
            id: product.productItem.id || product.id,
            companyId,
            name: product.name,
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
                onEdit={() => openModal(product.productItem, setShowEditProductModal)}
                onRestock={() => openModal(product.productItem, setShowRestockProductModal)}
                onAssign={() => openModal(product.productItem, setShowAssignProductModal)}
                onReturn={() => openModal(product.productItem, setShowReturnProductModal)}
                onMarket={() => openModal(product.productItem, setShowAddToMarketProductModal)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAdd={() => setShowQuickAddModal(true)} />
        )}
      </main>

      {/* FLOATING BULK ACTIONS TOOLBAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3.5 rounded-full shadow-2xl border border-gray-700 flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-bold">
            {selectedIds.size} items selected
          </span>
          <div className="h-4 w-px bg-gray-700" />
          <button
            onClick={handleBulkPublish}
            disabled={isPublishingBulk}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-md"
          >
            {isPublishingBulk ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RocketLaunchIcon className="w-3.5 h-3.5 text-yellow-300" />
            )}
            Publish to Marketplace
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
    </div>
  );
}

// --- Sub-Components ---

function InventoryCard({ product, isSelected, onToggleSelect, onEdit, onRestock, onAssign, onReturn, onMarket }: any) {
  const stockRatio = (product.companyStock / (product.companyStock + 100)) * 100;
  const isMarketplaceActive = product.productItem?.showOnGhuba || (product.productItem?.marketplaceListings && product.productItem.marketplaceListings.length > 0);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl border p-6 shadow-sm hover:shadow-xl transition-all group relative ${
      isSelected ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-gray-100 dark:border-gray-800"
    }`}>
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
              {product.category?.displayName}
            </span>
            {isMarketplaceActive ? (
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live on Ghuba
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                Internal Catalog
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            Price: KES {product.productItem?.sellingPrice || 0} • Cost: KES {product.productItem?.costPrice || 0}
          </p>
        </div>
        <button onClick={onEdit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <PencilSquareIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Stock Levels */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <div className="flex justify-between text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase">
            <span>Company Holding</span>
            <span className="text-gray-900 dark:text-white">{product.companyStock} units</span>
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