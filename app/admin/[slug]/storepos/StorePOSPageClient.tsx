'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  TagIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  UserCircleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  PrinterIcon, // New icon for print button
} from '@heroicons/react/24/outline';
import Modal from '@/components/Modal'; // Assuming you have a reusable Modal component

// --- Chart.js Imports ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Type Definitions ---
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export type CartItem = Product & {
  quantity: number;
  subtotal: number;
};

export type Agent = {
  id: string;
  name: string;
  dailySalesCount: number;
  dailySalesValue: number;
};

// --- Mock Data (Replace with actual API calls) ---
const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-001', name: 'Wireless Headphones XYZ', description: 'Premium noise-cancelling headphones.', price: 199.99, imageUrl: 'https://placehold.co/100x100/A78BFA/ffffff?text=Headphones', stock: 50 },
  { id: 'prod-002', name: 'Smartwatch Pro 2.0', description: 'Track your fitness and notifications.', price: 249.00, imageUrl: 'https://placehold.co/100x100/60A5FA/ffffff?text=Smartwatch', stock: 30 },
  { id: 'prod-003', name: 'Portable Bluetooth Speaker', description: 'Powerful sound on the go.', price: 79.50, imageUrl: 'https://placehold.co/100x100/34D399/ffffff?text=Speaker', stock: 120 },
  { id: 'prod-004', name: '4K UHD Smart TV 55"', description: 'Immersive viewing experience.', price: 799.00, imageUrl: 'https://placehold.co/100x100/F472B6/ffffff?text=SmartTV', stock: 15 },
  { id: 'prod-005', name: 'Ergonomic Office Chair', description: 'Comfort and support for long hours.', price: 299.99, imageUrl: 'https://placehold.co/100x100/FBBF24/ffffff?text=Chair', stock: 40 },
  { id: 'prod-006', name: 'Gaming Laptop X1', description: 'High performance for serious gamers.', price: 1499.00, imageUrl: 'https://placehold.co/100x100/EF4444/ffffff?text=Laptop', stock: 10 },
  { id: 'prod-007', name: 'Coffee Maker Deluxe', description: 'Brew perfect coffee every time.', price: 89.95, imageUrl: 'https://placehold.co/100x100/8B5CF6/ffffff?text=Coffee', stock: 75 },
  { id: 'prod-008', name: 'External SSD 1TB', description: 'Fast and reliable portable storage.', price: 120.00, imageUrl: 'https://placehold.co/100x100/EC4899/ffffff?text=SSD', stock: 90 },
  { id: 'prod-009', name: 'Robot Vacuum Cleaner', description: 'Automated home cleaning.', price: 350.00, imageUrl: 'https://placehold.co/100x100/10B981/ffffff?text=Vacuum', stock: 25 },
  { id: 'prod-010', name: 'Fitness Tracker Band', description: 'Monitor your health and activity.', price: 49.99, imageUrl: 'https://placehold.co/100x100/F59E0B/ffffff?text=Tracker', stock: 200 },
];

const MOCK_AGENT: Agent = {
  id: 'agent-001',
  name: 'Alice Smith',
  dailySalesCount: 15,
  dailySalesValue: 1250.75,
};

// --- Receipt Generation Helper ---
interface ReceiptDetails {
  cart: CartItem[];
  subtotal: number;
  totalDiscountAmount: number;
  totalTax: number;
  finalTotal: number;
  agentName: string;
  transactionId: string;
  date: string;
  time: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
}

const generateReceiptHtml = (details: ReceiptDetails): string => {
  const itemsHtml = details.cart.map(item => `
    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
      <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
      <span style="width: 40px; text-align: center;">x${item.quantity}</span>
      <span style="width: 80px; text-align: right;">KSh ${item.price.toFixed(2)}</span>
      <span style="width: 100px; text-align: right; font-weight: bold;">KSh ${item.subtotal.toFixed(2)}</span>
    </div>
  `).join('');

  return `
    <div style="font-family: 'Inter', sans-serif; width: 300px; margin: 0 auto; padding: 20px; color: #333; background-color: #fff; border: 1px solid #eee;">
      <h2 style="text-align: center; font-size: 24px; margin-bottom: 5px; color: #6A0572;">${details.storeName}</h2>
      <p style="text-align: center; font-size: 12px; margin-bottom: 10px; color: #555;">${details.storeAddress}<br>${details.storePhone}</p>
      <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">

      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
        <span>Date:</span><span>${details.date}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
        <span>Time:</span><span>${details.time}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px;">
        <span>Txn ID:</span><span>${details.transactionId}</span>
      </div>

      <div style="font-size: 15px; font-weight: bold; margin-bottom: 10px; color: #444;">Items:</div>
      ${itemsHtml}

      <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">

      <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px;">
        <span>Subtotal:</span><span style="font-weight: bold;">KSh ${details.subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px;">
        <span>Discount:</span><span style="font-weight: bold; color: #E91E63;">- KSh ${details.totalDiscountAmount.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 15px;">
        <span>Tax:</span><span style="font-weight: bold;">KSh ${details.totalTax.toFixed(2)}</span>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; border-top: 2px solid #6A0572; padding-top: 10px; margin-top: 10px;">
        <span>TOTAL:</span><span>KSh ${details.finalTotal.toFixed(2)}</span>
      </div>

      <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
      <p style="text-align: center; font-size: 13px; color: #555;">Served by: ${details.agentName}</p>
      <p style="text-align: center; font-size: 16px; font-weight: bold; margin-top: 15px; color: #6A0572;">THANK YOU!</p>
      <p style="text-align: center; font-size: 11px; color: #777; margin-top: 10px;">All sales final. No refunds.</p>
    </div>
  `;
};

// --- Print Function ---
const printReceipt = (htmlContent: string) => {
  // Option 1: Using a hidden iframe for print preview (more control than window.print())
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          @page {
            size: 80mm auto; /* Typical receipt paper width */
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact; /* For background colors */
          }
          /* Add specific styles from generateReceiptHtml here to ensure consistent rendering */
          div { font-family: 'Inter', sans-serif; width: 300px; margin: 0 auto; padding: 20px; color: #333; background-color: #fff; border: 1px solid #eee; }
          h2 { text-align: center; font-size: 24px; margin-bottom: 5px; color: #6A0572; }
          p { text-align: center; font-size: 12px; margin-bottom: 10px; color: #555; }
          hr { border: none; border-top: 1px dashed #ccc; margin: 15px 0; }
          .flex-between { display: flex; justify-content: space-between; }
          .item-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; }
          .item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .item-qty { width: 40px; text-align: center; }
          .item-price { width: 80px; text-align: right; }
          .item-subtotal { width: 100px; text-align: right; font-weight: bold; }
          .section-title { font-size: 15px; font-weight: bold; margin-bottom: 10px; color: #444; }
          .summary-row { display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px; }
          .total-row { display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; border-top: 2px solid #6A0572; padding-top: 10px; margin-top: 10px; }
          .thank-you { text-align: center; font-size: 16px; font-weight: bold; margin-top: 15px; color: #6A0572; }
          .policy { text-align: center; font-size: 11px; color: #777; margin-top: 10px; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);
    iframeDoc.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe); // Clean up the iframe
    };
  } else {
    // Fallback if iframe contentWindow is not accessible
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
      // printWindow.close(); // Might close too fast for some browsers
    } else {
      alert('Could not open print window. Please allow pop-ups for printing.');
    }
  }

  // --- For a local print server (more robust for POS) ---
  // If you had a local print server (e.g., running on http://localhost:8000/print),
  // you would send the receipt data (could be raw text, HTML, or specific printer commands like ESC/POS)
  // to that endpoint. This would bypass the browser print dialog.
  /*
  fetch('http://localhost:8000/print-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receiptHtml: htmlContent, // Or raw text, or ESC/POS commands
      printerId: 'your-receipt-printer-id' // Optional: if you have multiple printers
    })
  })
  .then(response => {
    if (!response.ok) {
      console.error('Failed to send receipt to local printer:', response.statusText);
      alert('Failed to send receipt to printer. Please check printer connection.');
    } else {
      console.log('Receipt sent to local printer successfully.');
    }
  })
  .catch(error => {
    console.error('Error connecting to local printer server:', error);
    alert('Error connecting to local printer server. Ensure it is running.');
  });
  */
};


// --- Main POS Component ---
const StorePOSPageClient: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS); // In a real app, fetch this
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);

  const currentAgent = MOCK_AGENT; // In a real app, this would come from auth context

  // Filtered products for search
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const totalDiscountAmount = useMemo(() => {
    return (subtotal * discountPercentage) / 100;
  }, [subtotal, discountPercentage]);

  const totalTax = useMemo(() => {
    // Example: 8% tax on subtotal after discount
    const taxableAmount = subtotal - totalDiscountAmount;
    return taxableAmount * 0.08;
  }, [subtotal, totalDiscountAmount]);

  const finalTotal = useMemo(() => {
    return subtotal - totalDiscountAmount + totalTax;
  }, [subtotal, totalDiscountAmount, totalTax]);

  // --- Cart Actions ---
  const handleAddToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // Increase quantity if item already in cart
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) {
          alert(`Cannot add more than available stock (${product.stock}) for ${product.name}`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity, subtotal: product.price * newQuantity }
            : item
        );
      } else {
        // Add new item to cart
        if (1 > product.stock) {
          alert(`Cannot add ${product.name} as it's out of stock.`);
          return prevCart;
        }
        return [...prevCart, { ...product, quantity: 1, subtotal: product.price }];
      }
    });
  }, []);

  const handleQuantityChange = useCallback((itemId: string, delta: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null; // Mark for removal
          if (newQuantity > item.stock) {
            alert(`Cannot add more than available stock (${item.stock}) for ${item.name}`);
            return item;
          }
          return { ...item, quantity: newQuantity, subtotal: item.price * newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[]; // Filter out nulls (removed items)
      return updatedCart;
    });
  }, []);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  const handleClearCart = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire cart?')) {
      setCart([]);
      setDiscountPercentage(0);
    }
  }, []);

  const handleProcessPayment = useCallback(() => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items before processing payment.');
      return;
    }
    setShowPaymentModal(true);
  }, [cart.length]);

  const finalizeSale = useCallback(() => {
    // Simulate payment processing
    setPaymentStatus(null); // Reset status
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        setPaymentStatus('success');
        // In a real app:
        // 1. Send sale data to backend
        // 2. Update product stock in backend
        // 3. Update agent's sales metrics

        // --- Receipt Printing ---
        const now = new Date();
        const receiptDetails: ReceiptDetails = {
          cart,
          subtotal,
          totalDiscountAmount,
          totalTax,
          finalTotal,
          agentName: currentAgent.name,
          transactionId: `TXN-${Date.now()}`, // Generate a unique transaction ID
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          storeName: 'Your Awesome Store', // Replace with dynamic store name
          storeAddress: '123 Main St, City, Country', // Replace
          storePhone: '+1 (555) 123-4567', // Replace
        };
        const receiptHtml = generateReceiptHtml(receiptDetails);
        printReceipt(receiptHtml);
        // --- End Receipt Printing ---

        // 4. Clear cart
        setCart([]);
        setDiscountPercentage(0);
        // Simulate stock update (for demonstration)
        setProducts(prevProducts =>
          prevProducts.map(p => {
            const soldItem = cart.find(ci => ci.id === p.id);
            if (soldItem) {
              return { ...p, stock: p.stock - soldItem.quantity };
            }
            return p;
          })
        );
      } else {
        setPaymentStatus('failed');
      }
      setShowPaymentModal(false);
      setShowConfirmationModal(true); // Show confirmation of success/failure
    }, 1500);
  }, [cart, subtotal, totalDiscountAmount, totalTax, finalTotal, currentAgent.name]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-inter p-6 lg:p-10">
      <h1 className="text-5xl lg:text-6xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
        Store Point of Sale
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Column: Product Search & List */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 flex flex-col">
          <div className="flex items-center bg-gray-700 rounded-full px-5 py-3 mb-6 shadow-inner border border-gray-600">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              className="flex-grow bg-transparent outline-none text-lg text-white placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="ml-3 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-400 text-xl">
                No products found.
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex flex-col overflow-hidden border border-gray-600"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-t-xl border-b border-gray-600"
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/4B5563/ffffff?text=No+Image`; }}
                  />
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-purple-300 mb-1 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex justify-between items-end mt-auto">
                      <div>
                        <p className="text-lg font-bold text-green-400">KSh {product.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-purple-600 text-white p-3 rounded-full shadow-md hover:bg-purple-700 transition-all duration-200 transform hover:scale-110"
                        aria-label={`Add ${product.name} to cart`}
                        disabled={product.stock <= 0}
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Cart & Checkout */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
            <h2 className="text-3xl font-bold text-purple-300 flex items-center">
              <ShoppingCartIcon className="h-8 w-8 mr-3 text-purple-400" /> Cart
            </h2>
            <button
              onClick={handleClearCart}
              className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
              disabled={cart.length === 0}
            >
              Clear Cart
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-gray-400 text-lg">
              Your cart is empty. Add some products!
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md mb-3 border border-gray-600">
                  <div className="flex items-center flex-grow">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-12 w-12 rounded-md object-cover mr-4"
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/50x50/4B5563/ffffff?text=Img`; }}
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-white truncate">{item.name}</h3>
                      <p className="text-sm text-gray-400">KSh {item.price.toFixed(2)} / item</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="bg-gray-600 text-white p-1.5 rounded-full hover:bg-gray-500 transition-colors"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold text-purple-300 w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="bg-gray-600 text-white p-1.5 rounded-full hover:bg-gray-500 transition-colors"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discount Input */}
          <div className="mb-6 p-4 bg-gray-700 rounded-lg shadow-inner border border-gray-600">
            <label htmlFor="discount" className="block text-gray-300 text-sm font-semibold mb-2 flex items-center">
              <ReceiptPercentIcon className="h-5 w-5 mr-2 text-pink-400" /> Apply Discount (%)
            </label>
            <input
              type="number"
              id="discount"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="w-full p-3 rounded-lg bg-gray-600 border border-gray-500 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              min="0"
              max="100"
              step="1"
              aria-label="Discount percentage"
            />
            <p className="text-xs text-gray-400 mt-1">Discount applied: KSh {totalDiscountAmount.toFixed(2)}</p>
          </div>

          {/* Order Summary */}
          <div className="space-y-3 mb-6 border-t border-gray-700 pt-4">
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Subtotal:</span>
              <span className="font-semibold text-white">KSh {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Discount ({discountPercentage}%):</span>
              <span className="font-semibold text-pink-400">- KSh {totalDiscountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Tax (8%):</span>
              <span className="font-semibold text-white">KSh {totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-4xl font-extrabold border-t-2 border-purple-500 pt-4 mt-4">
              <span className="text-purple-300">TOTAL:</span>
              <span className="text-green-400">KSh {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Agent Info & Checkout Button */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="bg-gray-700 p-4 rounded-lg shadow-inner flex items-center mb-4 border border-gray-600">
              <UserCircleIcon className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-gray-300">Serving Agent:</p>
                <p className="text-lg font-semibold text-white">{currentAgent.name}</p>
                <p className="text-xs text-gray-400">Sales Today: {currentAgent.dailySalesCount} (KSh {currentAgent.dailySalesValue.toFixed(2)})</p>
              </div>
            </div>
            <button
              onClick={handleProcessPayment}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl text-2xl font-bold shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              disabled={cart.length === 0}
            >
              <CreditCardIcon className="h-7 w-7 mr-3" /> Process Payment
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmationModal} onClose={() => setShowConfirmationModal(false)}>
        <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center">
          {paymentStatus === 'success' ? (
            <>
              <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-green-400 mb-4">Payment Successful!</h2>
              <p className="text-lg text-gray-300 mb-7">Transaction completed. Your receipt should appear in a new window/tab for printing.</p>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 font-semibold"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <XMarkIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-red-400 mb-4">Payment Failed</h2>
              <p className="text-lg text-gray-300 mb-7">There was an issue processing the payment. Please try again.</p>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 font-semibold"
              >
                Close
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Payment Processing Modal (Simple) */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center">
          <CreditCardIcon className="h-20 w-20 text-indigo-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-indigo-400 mb-4">Processing Payment...</h2>
          <p className="text-lg text-gray-300 mb-7">Please wait while your transaction is being finalized.</p>
          <button
            onClick={finalizeSale} // This button is disabled, but the function is called by setTimeout
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center"
            disabled={true} // Disable during processing
          >
            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" /> Finalizing...
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StorePOSPageClient;
