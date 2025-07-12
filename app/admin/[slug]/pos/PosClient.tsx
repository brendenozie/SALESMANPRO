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
  ReceiptPercentIcon, // NEW: For offers/totals
  Bars3BottomLeftIcon, // NEW: For Menu
} from "@heroicons/react/24/outline";
import { Product, ProductCategory } from "./page";

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

const DUMMY_PRODUCTS: Product[] = [
  { id: "p1", name: "Spicy Chicken Burger", description: "Grilled chicken, jalapeños, spicy mayo.", images: [{ url: "https://placehold.co/400x200/FF5722/FFF?text=Spicy+Burger" }], finalPrice: 14.50, salesPrice: 16.00, discount: 10, isAvailable: true, isOnOffer: true, productCategoryId: "cat1", category: { name: "Burgers" }, tags: [], costPrice: 8.00, ingredients: "chicken, bun, jalapenos", createdAt: "", updatedAt: "", video: null, isFlashDeal: false, isNewArrival: false, isDiscounted: true, isFeatured: false },
  { id: "p2", name: "Margherita Pizza", description: "Classic tomato, mozzarella, fresh basil.", images: [{ url: "https://placehold.co/400x200/3F51B5/FFF?text=Margherita+Pizza" }], finalPrice: 12.00, salesPrice: 12.00, discount: 0, isAvailable: true, isOnOffer: false, productCategoryId: "cat2", category: { name: "Pizzas" }, tags: [], costPrice: 6.00, ingredients: "dough, sauce, cheese", createdAt: "", updatedAt: "", video: null, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false },
  { id: "p3", name: "Veggie Delight Wrap", description: "Fresh seasonal veggies, hummus, whole wheat wrap.", images: [{ url: "https://placehold.co/400x200/4CAF50/FFF?text=Veggie+Wrap" }], finalPrice: 9.75, salesPrice: 9.75, discount: 0, isAvailable: true, isOnOffer: false, productCategoryId: "cat3", category: { name: "Wraps" }, tags: [], costPrice: 5.00, ingredients: "veggies, wrap, hummus", createdAt: "", updatedAt: "", video: null, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false },
  { id: "p4", name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center.", images: [{ url: "https://placehold.co/400x200/795548/FFF?text=Lava+Cake" }], finalPrice: 7.00, salesPrice: 7.00, discount: 0, isAvailable: true, isOnOffer: false, productCategoryId: "cat4", category: { name: "Desserts" }, tags: [], costPrice: 3.50, ingredients: "chocolate, flour, sugar", createdAt: "", updatedAt: "", video: null, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false },
  { id: "p5", name: "Iced Coffee", description: "Refreshing cold brew with milk.", images: [{ url: "https://placehold.co/400x200/607D8B/FFF?text=Iced+Coffee" }], finalPrice: 4.00, salesPrice: 4.00, discount: 0, isAvailable: true, isOnOffer: false, productCategoryId: "cat5", category: { name: "Drinks" }, tags: [], costPrice: 2.00, ingredients: "coffee, milk, ice", createdAt: "", updatedAt: "", video: null, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false },
  { id: "p6", name: "Avocado Toast", description: "Smashed avocado on sourdough with chili flakes.", images: [{ url: "https://placehold.co/400x200/FFEB3B/333?text=Avocado+Toast" }], finalPrice: 8.50, salesPrice: 8.50, discount: 0, isAvailable: true, isOnOffer: false, productCategoryId: "cat1", category: { name: "Burgers" }, tags: [], costPrice: 4.00, ingredients: "avocado, bread, chili", createdAt: "", updatedAt: "", video: null, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false },
  { id: "p7", name: "BBQ Pulled Pork Sandwich", description: "Slow-cooked pork with tangy BBQ sauce.", images: [{ url: "https://placehold.co/400x200/F44336/FFF?text=Pulled+Pork" }], finalPrice: 13.00, salesPrice: 13.00, discount: 0, isAvailable: true, isOnOffer: false, productCategoryId: "cat1", category: { name: "Burgers" }, tags: [], costPrice: 7.00, ingredients: "pork, bun, BBQ sauce", createdAt: "", updatedAt: "", video: null, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false },
  { id: "p8", name: "Spicy Tuna Roll", description: "Fresh tuna, spicy mayo, cucumber.", images: [{ url: "https://placehold.co/400x200/9C27B0/FFF?text=Tuna+Roll" }], finalPrice: 11.00, salesPrice: 11.00, discount: 0, isAvailable: true, isOnOffer: false, productCategoryId: "cat6", category: { name: "Sushi" }, tags: [], costPrice: 5.50, ingredients: "tuna, rice, cucumber", createdAt: "", updatedAt: "", video: null, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false },
];
const DUMMY_CATEGORIES: ProductCategory[] = [
  { id: "cat1", name: "Burgers", slug: "burgers", description: "", image: null, sortOrder: 1, visible: true, companyId: "your_company_id" },
  { id: "cat2", name: "Pizzas", slug: "pizzas", description: "", image: null, sortOrder: 2, visible: true, companyId: "your_company_id" },
  { id: "cat3", name: "Wraps", slug: "wraps", description: "", image: null, sortOrder: 3, visible: true, companyId: "your_company_id" },
  { id: "cat4", name: "Desserts", slug: "desserts", description: "", image: null, sortOrder: 4, visible: true, companyId: "your_company_id" },
  { id: "cat5", name: "Drinks", slug: "drinks", description: "", image: null, sortOrder: 5, visible: true, companyId: "your_company_id" },
  { id: "cat6", name: "Sushi", slug: "sushi", description: "", image: null, sortOrder: 6, visible: true, companyId: "your_company_id" },
];

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  course: string;
}

interface PosClientProps {
  initialCategories: ProductCategory[];
  initialProducts: Product[];
  companyId: string;
}

const PosClient: React.FC<PosClientProps> = ({ initialCategories, initialProducts, companyId }) => {
  // ... (all existing state and handlers remain the same)
	const [products, setProducts] = useState<Product[]>(initialProducts.length > 0 ? initialProducts : DUMMY_PRODUCTS);
	const [categories, setCategories] = useState<ProductCategory[]>(initialCategories.length > 0 ? initialCategories : DUMMY_CATEGORIES);
	const [activeCategory, setActiveCategory] = useState<string>("All"); // Filter by category ID
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [cart, setCart] = useState<CartItem[]>([]);
	const [currentCourse, setCurrentCourse] = useState<number>(1); // For grouping items into courses
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Constants for tax and service charge
	const TAX_RATE = 0.08; // 8% tax
	const SERVICE_CHARGE_RATE = 0.10; // 10% service charge

  // --- NEW: State for mobile view ---
  const [mobileView, setMobileView] = useState<'menu' | 'order'>('menu');

  // ... (useEffect, useMemo calculations, and handlers like addToCart, updateQuantity, etc. remain unchanged) ...
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
      const res = await fetch(`http://localhost:3000/api/customer-orders`, {
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

  // --- Main Render ---
  return (
    // MODIFIED: Added relative positioning and pb-20 for mobile nav space
    <div className="relative flex flex-col lg:flex-row h-screen bg-gray-900 text-gray-100 font-sans lg:pb-0 pb-20">
      
      {/* --- Left Panel: Order Cart --- */}
      {/* MODIFIED: Conditional rendering for mobile vs. desktop */}
      <div className={`
        ${mobileView === 'order' ? 'flex' : 'hidden'} 
        lg:flex w-full lg:w-2/5 xl:w-1/3 bg-gray-800 p-4 sm:p-6 flex-col shadow-lg overflow-hidden
      `}>
        {/* MODIFIED: Header styling */}
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <ShoppingCartIcon className="h-7 w-7 mr-3 text-sky-400" /> Current Order
        </h2>

        {loading && <p className="text-center text-blue-400 mb-4">Processing order...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* MODIFIED: Cart scroll container */}
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {Object.keys(groupedCartItems).length === 0 ? (
            <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
              <ClipboardDocumentListIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-semibold">Your order is empty</p>
              <p className="text-sm">Add items from the menu to get started.</p>
            </div>
          ) : (
             Object.keys(groupedCartItems).sort((a, b) => parseInt(a.replace('Course ', '')) - parseInt(b.replace('Course ', ''))).map(courseName => (
              // MODIFIED: Course group styling
              <div key={courseName} className="mb-4 bg-gray-900/50 rounded-xl">
                <div className="flex justify-between items-center p-3 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-sky-300">{courseName}</h3>
                   {courseName !== `Course 1` && (
                    <button onClick={() => removeCourse(courseName)} className="text-red-400 hover:text-red-300 transition-colors" aria-label={`Remove ${courseName}`}>
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <ul className="space-y-2 p-3">
                  {groupedCartItems[courseName].map((item) => (
                    // MODIFIED: Cart item styling
                    <li key={item.productId} className="flex items-center text-base">
                      <div className="flex-grow">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-gray-400 text-xs">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button onClick={() => updateQuantity(item.productId, item.course, -1)} className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-transform active:scale-95" aria-label={`Decrease quantity of ${item.name}`}>
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="font-bold w-6 text-center text-lg">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.course, 1)} className="p-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-400 transition-transform active:scale-95" aria-label={`Increase quantity of ${item.name}`}>
                          <PlusIcon className="h-4 w-4" />
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
        
        {/* MODIFIED: Totals styling */}
        <div className="mt-auto pt-4 border-t-2 border-gray-700/50 space-y-2">
          <div className="flex justify-between text-base text-gray-300">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base text-gray-300">
            <span>Tax ({TAX_RATE * 100}%)</span>
            <span className="font-medium">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base text-gray-300">
            <span>Service</span>
            <span className="font-medium">${serviceChargeAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-white pt-2 mt-2 border-t border-gray-700">
            <span>Total</span>
            <span className="text-green-400">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* MODIFIED: Action buttons styling */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={clearCart} className="w-full py-3 bg-red-800/80 text-white text-base font-bold rounded-lg shadow-lg hover:bg-red-700 transition disabled:opacity-50" disabled={cart.length === 0 || loading}>
            Clear
          </button>
          <button onClick={handlePlaceOrder} className="w-full py-3 bg-green-600 text-white text-base font-bold rounded-lg shadow-xl hover:bg-green-500 transition disabled:opacity-50" disabled={cart.length === 0 || loading}>
            {loading ? 'Submitting...' : 'Place Order'}
          </button>
        </div>
      </div>

      {/* --- Right Panel: Product Display --- */}
      {/* MODIFIED: Conditional rendering for mobile vs. desktop */}
       <div className={`
        ${mobileView === 'menu' ? 'flex' : 'hidden'} 
        lg:flex flex-grow bg-gray-900 p-4 sm:p-6 flex-col overflow-hidden
      `}>
        {/* ... (Header and Search bar remain mostly the same, slight style tweaks) ... */}
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

        
        {/* MODIFIED: Category tabs styling */}
        {/* <div className="flex space-x-2 p-1.5 bg-gray-800 rounded-full shadow-inner mb-6 overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveCategory("All")} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 flex-shrink-0 ${activeCategory === "All" ? "bg-sky-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
            All Items
          </button>
          {categories.map((category) => (
            <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 flex-shrink-0 ${activeCategory === category.id ? "bg-sky-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
              {category.name}
            </button>
          ))}
        </div> */}

        {/* MODIFIED: Product Grid styling */}
        {loading ? ( <div className="flex-grow flex items-center justify-center">Loading...</div> ) 
         : error ? ( <div className="flex-grow flex items-center justify-center text-red-400">Error: {error}</div> ) 
         : filteredProducts.length === 0 ? ( <div className="flex-grow flex items-center justify-center text-gray-500">No items found.</div>) 
         : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            {filteredProducts.map((product) => (
              // MODIFIED: Product card design
              <div key={product.id} className="bg-gray-800 rounded-xl shadow-lg flex flex-col group">
                <div className="relative h-28 sm:h-32 w-full">
                  <Image src={product.images?.[0]?.url ?? "https://placehold.co/400x200/333/eee?text=No+Image"} alt={product.name} fill className="object-cover rounded-t-xl" loader={loader} />
                  {product.isOnOffer && (<span className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">Offer</span>)}
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="font-bold text-white text-base leading-tight truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 flex-grow">{product.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-baseline">
                      <span className="text-lg font-extrabold text-green-400">${product.finalPrice.toFixed(2)}</span>
                      {product.discount && product.discount > 0 && (<span className="text-xs text-gray-500 line-through ml-2">${product.salesPrice.toFixed(2)}</span>)}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="p-2 rounded-full bg-sky-500 text-white shadow-md group-hover:bg-sky-400 transition-transform active:scale-95" aria-label={`Add ${product.name} to cart`}>
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- NEW: Mobile Bottom Navigation --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 flex justify-around p-2 z-50">
        <button onClick={() => setMobileView('menu')} className={`flex flex-col items-center gap-1 transition-colors ${mobileView === 'menu' ? 'text-sky-400' : 'text-gray-400'}`}>
          <Bars3BottomLeftIcon className="h-6 w-6" />
          <span className="text-xs font-semibold">Menu</span>
        </button>
        <button onClick={() => setMobileView('order')} className={`relative flex flex-col items-center gap-1 transition-colors ${mobileView === 'order' ? 'text-sky-400' : 'text-gray-400'}`}>
          <ShoppingCartIcon className="h-6 w-6" />
          <span className="text-xs font-semibold">Order</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-sky-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
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
    </div>
  );
};

export default PosClient;