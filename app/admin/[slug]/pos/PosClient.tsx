// app/admin/[slug]/pos/PosClient.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { Product, ProductCategory } from "./page"; // Re-use types from page.tsx

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

// Define types for POS specific state
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  course: string; // e.g., "Course 1", "Course 2"
}

interface PosClientProps {
  initialCategories: ProductCategory[];
  initialProducts: Product[];
  companyId: string;
}

const PosClient: React.FC<PosClientProps> = ({ initialCategories, initialProducts, companyId }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string>("All"); // Filter by category ID
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentCourse, setCurrentCourse] = useState<number>(1); // For grouping items into courses
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Constants for tax and service charge
  const TAX_RATE = 0.08; // 8% tax
  const SERVICE_CHARGE_RATE = 0.10; // 10% service charge

  // Fetch data on mount if initial data is empty (e.g., on first load or refresh)
  useEffect(() => {
    const fetchData = async () => {
      if (initialProducts.length === 0 || initialCategories.length === 0) {
        setLoading(true);
        setError(null);
        try {
          const productsRes = await fetch(`${apiUrl}/products?companyId=${companyId}`);
          const categoriesRes = await fetch(`${apiUrl}/product-categories?companyId=${companyId}`);

          if (productsRes.ok && categoriesRes.ok) {
            setProducts(await productsRes.json());
            setCategories(await categoriesRes.json());
          } else {
            throw new Error("Failed to fetch initial POS data.");
          }
        } catch (err: any) {
          setError(err.message || "Failed to load initial data.");
          console.error("Error fetching initial POS data:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [companyId, initialProducts, initialCategories]);


  // Filter products based on active category and search term
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.isAvailable); // Only show available products

    if (activeCategory !== "All") {
      filtered = filtered.filter(product => product.productCategoryId === activeCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [products, activeCategory, searchTerm]);

  // Group cart items by course
  const groupedCartItems = useMemo(() => {
    return cart.reduce((acc, item) => {
      if (!acc[item.course]) {
        acc[item.course] = [];
      }
      acc[item.course].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  }, [cart]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const taxAmount = subtotal * TAX_RATE;
  const serviceChargeAmount = subtotal * SERVICE_CHARGE_RATE;
  const grandTotal = subtotal + taxAmount + serviceChargeAmount;

  // Handlers for adding/removing items from cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.course === `Course ${currentCourse}`
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1,
        };
        return newCart;
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            name: product.name,
            price: product.finalPrice,
            quantity: 1,
            course: `Course ${currentCourse}`,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, course: string, delta: number) => {
    setCart((prevCart) => {
      const newCart = prevCart
        .map((item) =>
          item.productId === productId && item.course === course
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0); // Remove if quantity drops to 0 or less
      return newCart;
    });
  };

  const removeItem = (productId: string, course: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.productId === productId && item.course === course)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCurrentCourse(1);
  };

  const addCourse = () => {
    setCurrentCourse((prev) => prev + 1);
  };

  const removeCourse = (courseName: string) => {
    setCart((prevCart) => prevCart.filter(item => item.course !== courseName));
    // If the current course is removed and it's the highest, decrement currentCourse
    if (courseName === `Course ${currentCourse}` && currentCourse > 1) {
        setCurrentCourse(prev => prev - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items to place an order.");
      return;
    }

    setLoading(true);
    setError(null);

    // Prepare order data for API
    const orderData = {
      companyId: companyId, // From props
      consumerId: "clx91w11g000010v0j8235t4e", // Placeholder: In a real POS, this might be a selected customer ID or a guest ID
      name: "POS Customer", // Placeholder
      email: "pos@example.com", // Placeholder
      phone: "1234567890", // Placeholder
      items: cart.map(item => ({
        marketplaceListingId: item.productId, // Link to Product (marketplaceListing in schema)
        quantity: item.quantity,
        price: item.price,
        // No appointmentId, riderId, status for POS order items in this basic version
      })),
      totalPrice: grandTotal,
      orderSource: "IN_PERSON", // Or "POS" if you add a specific enum value
      status: "PENDING", // Initial status for POS orders
      delivery: false, // Assuming in-restaurant order for now
      // Add other relevant fields like shippingAddress if it's a delivery from POS
    };

    try {
      const res = await fetch(`${apiUrl}/customer-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("Order placed successfully!");
        clearCart(); // Clear cart after successful order
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to place order.");
      console.error("Error placing order:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Left Panel: Order Cart */}
      <div className="w-full lg:w-2/5 xl:w-1/3 bg-gray-800 p-6 flex flex-col shadow-lg overflow-hidden">
        <h2 className="text-3xl font-extrabold text-rose-400 mb-6 flex items-center">
          <ShoppingCartIcon className="h-8 w-8 mr-3" /> Current Order
        </h2>

        {loading && <p className="text-center text-blue-400 mb-4">Processing order...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* Order Grouping (Courses) */}
        <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
          {Object.keys(groupedCartItems).length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <ClipboardDocumentListIcon className="h-20 w-20 mx-auto mb-4 text-gray-600" />
              <p className="text-xl">Your cart is empty.</p>
              <p className="text-sm">Start by adding dishes from the menu.</p>
            </div>
          ) : (
            Object.keys(groupedCartItems).sort((a, b) => parseInt(a.replace('Course ', '')) - parseInt(b.replace('Course ', ''))).map(courseName => (
              <div key={courseName} className="mb-6 p-4 bg-gray-700 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-3 border-b border-gray-600 pb-2">
                  <h3 className="text-xl font-bold text-emerald-300">{courseName}</h3>
                  {courseName !== `Course 1` && ( // Don't allow removing the first course
                    <button
                      onClick={() => removeCourse(courseName)}
                      className="text-red-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${courseName}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <ul className="space-y-3">
                  {groupedCartItems[courseName].map((item) => (
                    <li key={item.productId} className="flex justify-between items-center text-lg">
                      <div className="flex-grow">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-400 text-sm block">
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.course, -1)}
                          className="p-1 rounded-full bg-gray-600 hover:bg-gray-500 transition"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.course, 1)}
                          className="p-1 rounded-full bg-gray-600 hover:bg-gray-500 transition"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.course)}
                          className="p-1 rounded-full text-red-400 hover:text-red-500 transition"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Course Actions */}
        <div className="mt-4 flex justify-between items-center border-t border-gray-700 pt-4">
            <button
                onClick={addCourse}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold"
            >
                Add Course ({currentCourse + 1})
            </button>
            <p className="text-lg font-medium">Current Course: <span className="text-rose-400 font-bold">Course {currentCourse}</span></p>
        </div>


        {/* Totals */}
        <div className="mt-6 pt-6 border-t-2 border-gray-700 space-y-3">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Tax ({TAX_RATE * 100}%):</span>
            <span className="font-semibold">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Service Charge ({SERVICE_CHARGE_RATE * 100}%):</span>
            <span className="font-semibold">${serviceChargeAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-3xl font-bold text-rose-400 pt-4 border-t border-gray-700">
            <span>Grand Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handlePlaceOrder}
            className="w-full py-4 bg-green-600 text-white text-xl font-bold rounded-lg shadow-xl hover:bg-green-700 transition disabled:opacity-50"
            disabled={cart.length === 0 || loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
          <button
            onClick={clearCart}
            className="w-full py-3 bg-red-600 text-white text-lg rounded-lg shadow-md hover:bg-red-700 transition disabled:opacity-50"
            disabled={cart.length === 0 || loading}
          >
            Clear Order
          </button>
        </div>
      </div>

      {/* Right Panel: Product Display */}
      <div className="flex-grow bg-gray-900 p-6 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-sky-400 flex items-center">
            <ClipboardDocumentListIcon className="h-8 w-8 mr-3" /> Menu Items
          </h2>
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-md"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 p-2 bg-gray-800 rounded-full shadow-inner mb-6 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
              ${activeCategory === "All"
                ? "bg-sky-500 text-white shadow-md"
                : "bg-transparent text-gray-300 hover:bg-gray-700"
              }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
                ${activeCategory === category.id
                  ? "bg-sky-500 text-white shadow-md"
                  : "bg-transparent text-gray-300 hover:bg-gray-700"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex-grow flex items-center justify-center text-blue-400">Loading dishes...</div>
        ) : error ? (
          <div className="flex-grow flex items-center justify-center text-red-500">Error loading dishes: {error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            <p className="text-lg">No dishes found for this category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-grow overflow-y-auto pr-4 custom-scrollbar">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
                onClick={() => addToCart(product)}
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={product.images && product.images.length > 0 ? product.images[0].url : "https://placehold.co/400x200/333/eee?text=No+Image"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    loader={loader}
                  />
                  {product.isOnOffer && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                      Offer
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-sky-400 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-extrabold text-green-400">${product.finalPrice.toFixed(2)}</span>
                    {product.discount && product.discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">${product.salesPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748; /* gray-800 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568; /* gray-700 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* gray-600 */
        }
      `}</style>
    </div>
  );
};

export default PosClient;
