"use client";

import React, { useState } from "react";
import UserNav from "@/components/AdminNav";
import ProductRequestModal from "@/components/ProductRequestModal";

type Product = {
  id: string;
  name: string;
  companyId: string;
  inventoryId: string;
  category: string;
  agentStock: number;
  companyStock: number;
  sales: number;
  image: string;
  costPrice: number;
  salesPrice: number;
  commissionRate: number;
  commissionType: number;
};

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
};

type Agent = {
  id: string;
  name: string;
};

type Props = {
  productsData: Product[];
  categoriesData: Category[];
  agentsData: Agent[];
};

export default function ProductsPageClient({
  productsData = [],
  categoriesData = [],
  agentsData = [],
}: Props) {
  const [showRequestCustomerProductModal, setShowRequestCustomerAssignProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [agentInventoryId, setSelectedAgentInventoryId] = useState<string>("");
  const [inventoryItemId, setSelectedInventoryItemId] = useState<string>("");

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
      <UserNav />

      <div className="container mx-auto">
        <div className="min-h-screen bg-gray-100 py-10">
          <h1 className="text-4xl font-bold text-black text-center mb-10">
            Products Catalog
          </h1>

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productsData.map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2 text-black">{product.name}</h2>
                    <p className="text-gray-600">Ksh {product.salesPrice}</p>
                  </div>
                  <div className="flex justify-end mt-2 space-x-2 p-2">
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowRequestCustomerAssignProductModal(true);
                        setSelectedAgentInventoryId(product.inventoryId);
                        setSelectedInventoryItemId(product.inventoryId);
                      }}
                    >
                      Request Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Request Modal */}
      {showRequestCustomerProductModal && selectedProduct && (
        <ProductRequestModal
          showRequestProductModal={showRequestCustomerProductModal}
          setShowRequestProductModal={setShowRequestCustomerAssignProductModal}
          product={selectedProduct}
          inventoryItemId={inventoryItemId}
          agentInventoryItemId={agentInventoryId}
          clientId="63f7c9e2d91b1b2a5e80b013"
        />
      )}
    </div>
  );
}
