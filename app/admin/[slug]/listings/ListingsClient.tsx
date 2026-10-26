// app/admin/[slug]/client-inventory/ClientInventoryClient.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProductRequestModal from "@/components/ProductRequestModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import { DirectPayLinkModal } from "@/components/dashboard/DirectPayLinkModal";
import { MarketListingForm, IStoreCategory } from "@/types/typings";




interface ClientProps {
  companyId: string;
  productsData: MarketListingForm[];  
  categoriesData: IStoreCategory[];
}

export default function ListingsClient({ companyId, categoriesData, productsData }: ClientProps) {
  // State for modal visibility + selected product
  const [showRemoveProductModal, setShowRemoveProductModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);
  const [showPayLinkModal, setShowPayLinkModal] = useState(false);
  const [payLinkProduct, setPayLinkProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<MarketListingForm | undefined | null>();

  return (    
        <div className="container mx-auto p-10">
          <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-14 tracking-tight">
            My Market Place
          </h1>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-10">
            
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold">Products</h2>
              <div className="flex items-center space-x-3">
                <Link
                  href="pay-links"
                  className="bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 font-semibold transition shadow-md flex items-center space-x-1.5"
                >
                  <span>⚡ Manage Pay Links</span>
                </Link>
                <button
                  onClick={() => setShowAddToMarketModal(true)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold transition shadow-md"
                >
                  Add New Product To Market Place
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productsData && productsData.map((product,index) => (
                <div
                  key={index}//{product._id}
                  className="bg-gray-100 border border-gray-200 rounded-xl p-6 transition transform hover:scale-105 shadow-md hover:shadow-xl duration-300"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Description: {product.description}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">Quantity: {product.quantity}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    Buying Price: ${product.buyingPrice}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Selling Price: ${product.sellingPrice}
                  </p>

                  <div className="flex flex-wrap justify-end mt-2 gap-2">
                    <button
                      onClick={() => {
                        setPayLinkProduct(product);
                        setShowPayLinkModal(true);
                      }}
                      className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-medium transition-all duration-300 ease-in-out hover:bg-emerald-700 shadow-md hover:shadow-lg flex items-center space-x-1"
                      title="Generate Direct Pay Link"
                    >
                      <span>⚡ Pay Link</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAddToMarketModal(true);
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-500 text-white font-medium transition-all duration-300 ease-in-out hover:bg-blue-600 shadow-md hover:shadow-lg"
                    >
                      Edit Product
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowRemoveProductModal(true);
                      }}
                      className="px-3 py-2 rounded-lg bg-red-500 text-white font-medium transition-all duration-300 ease-in-out hover:bg-red-600 shadow-md hover:shadow-lg"
                    >
                      Remove Product
                    </button>
                  </div>
                </div>
              ))}

              {productsData && productsData.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500 text-xl">
                    No products available in the marketplace.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========== Modals ========== */}
          {showPayLinkModal && payLinkProduct && (
            <DirectPayLinkModal
              isOpen={showPayLinkModal}
              onClose={() => {
                setShowPayLinkModal(false);
                setPayLinkProduct(null);
              }}
              product={payLinkProduct}
              companyId={companyId}
            />
          )}

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
            />
          )}

          {showRequestModal && selectedProduct && (
            <ProductRequestModal
              showRequestProductModal={showRequestModal}
              setShowRequestProductModal={setShowRequestModal}
              product={selectedProduct}
            />
          )}
        </div>
  );
}
