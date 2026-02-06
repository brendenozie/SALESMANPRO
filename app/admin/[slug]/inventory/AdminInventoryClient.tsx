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
  InboxStackIcon
} from "@heroicons/react/24/outline";

// Modals
import AddProductModal from "@/components/AddProductModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import AssignProductModal from "@/components/AssignProductModal";
import RestockProductModal from "@/components/RestockProductModal";
import ReturnProductModal from "@/components/ReturnProductModal";
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
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAssignProductModal, setShowAssignProductModal] = useState(false);
  const [showReturnProductModal, setShowReturnProductModal] = useState(false);
  const [showRestockProductModal, setShowRestockProductModal] = useState(false);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductForm | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* 🚀 TOP NAVIGATION/STATS */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <CubeIcon className="w-8 h-8 text-indigo-600" />
              Inventory Central
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Find product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <button
              onClick={() => { setSelectedProduct(null); setShowAddProductModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-none"
            >
              <PlusIcon className="w-5 h-5" />
              New Product
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 📊 KEY PERFORMANCE INDICATORS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatMiniCard title="Total Inventory" value={totalCompanyStock} icon={<InboxStackIcon />} color="text-blue-600" />
          <StatMiniCard title="Cumulative Sales" value={totalSales} icon={<ArrowTrendingUpIcon />} color="text-emerald-600" />
          <StatMiniCard title="Active Agents" value={agentsData.length} icon={<UserPlusIcon />} color="text-purple-600" />
        </div>

        {/* 📦 PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <InventoryCard 
                key={product.id} 
                product={product} 
                onEdit={() => openModal(product.productItem, setShowEditProductModal)}
                onRestock={() => openModal(product.productItem, setShowRestockProductModal)}
                onAssign={() => openModal(product.productItem, setShowAssignProductModal)}
                onReturn={() => openModal(product.productItem, setShowReturnProductModal)}
                onMarket={() => openModal(product.productItem, setShowAddToMarketProductModal)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAdd={() => setShowAddProductModal(true)} />
        )}
      </main>

      {/* MODALS */}
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
      />
    </div>
  );
}

// --- Sub-Components for Clarity ---

function InventoryCard({ product, onEdit, onRestock, onAssign, onReturn, onMarket }: any) {
  const stockRatio = (product.companyStock / (product.companyStock + 100)) * 100;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
            {product.category?.displayName}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
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
            <span className="text-gray-900 dark:text-white">{product.companyStock}</span>
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
        <ActionButton icon={<ShoppingBagIcon />} label="Market" onClick={onMarket} color="bg-indigo-50 text-indigo-700 hover:bg-indigo-500" />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 hover:text-white ${color}`}
    >
      {React.cloneElement(icon, { className: "w-4 h-4" })}
      {label}
    </button>
  );
}

function StatMiniCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 ${color}`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{title}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800">
      <InboxStackIcon className="w-20 h-20 text-gray-200 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouse is Empty</h2>
      <p className="text-gray-500 mt-2 mb-8">Start your journey by adding your first commercial product.</p>
      <button onClick={onAdd} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
        Initial Stock Intake
      </button>
    </div>
  );
}

// Just a wrapper to keep the main return clean
function ModalManager({ states, data }: any) {
  return (
    <>
      {states.showAddProductModal && (
        <AddProductModal
          showRequestProductModal={states.showAddProductModal}
          setShowRequestProductModal={states.setShowAddProductModal}
          companyId={data.companyId}
          categories={data.categoriesData}
          product={null}
        />
      )}
      {states.showEditProductModal && data.selectedProduct && (
        <AddProductModal
          showRequestProductModal={states.showEditProductModal}
          setShowRequestProductModal={states.setShowEditProductModal}
          categories={data.categoriesData}
          companyId={data.companyId}
          product={data.selectedProduct}
        />
      )}
      {states.showRestockProductModal && data.selectedProduct && (
        <RestockProductModal
          showRestockProductModal={states.showRestockProductModal}
          setShowRestockProductModal={states.setShowRestockProductModal}
          product={data.selectedProduct}
        />
      )}
      {states.showAssignProductModal && data.selectedProduct && (
        <AssignProductModal
          showAssignProductModal={states.showAssignProductModal}
          setShowAssignProductModal={states.setShowAssignProductModal}
          product={data.selectedProduct}
          companyId={data.companyId}
          agents={data.agentsData}
        />
      )}
      {states.showReturnProductModal && data.selectedProduct && (
        <ReturnProductModal
          showReturnProductModal={states.showReturnProductModal}
          setShowReturnProductModal={states.setShowReturnProductModal}
          product={data.selectedProduct}
          companyId={data.companyId}
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
        />
      )}
    </>
  );
}