// components/admin/components/AdminPOSClient.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ReceiptPercentIcon,
    CalendarDaysIcon,
    UserCircleIcon,
    XMarkIcon,
    PlusIcon,
    MinusIcon,
    ArrowPathIcon,
    PrinterIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    MagnifyingGlassIcon,
    ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { IStoreCategory, MarketListingForm } from '@/types/typings';

// --- Persistent State Hook ---
function usePersistentState<T>(key: string, initial: T) {
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') return initial;
        try {
            const raw = sessionStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initial;
        } catch { return initial; }
    });
    useEffect(() => {
        try { sessionStorage.setItem(key, JSON.stringify(state)); } catch {}
    }, [key, state]);
    return [state, setState] as const;
}

// --- Types ---
export type CartItem = MarketListingForm & {
    quantity: number;
    subtotal: number;
};

interface ReceiptDetails {
    cart: CartItem[];
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    finalTotal: number;
    agentName: string;
    transactionId: string;
    date: string;
    storeName: string;
    currency: string;
    storeAddress?: string;
    storePhone?: string;
}

const AdminPOSClient: React.FC<{
    initialProducts?: MarketListingForm[];
    initialCategories?: IStoreCategory[];
    companyId: string;
    userName: string;
    userId: string | null;
}> = ({ companyId, initialProducts = [], initialCategories = [], userName, userId }) => {
    
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

    // --- State ---
    const [mode, setMode] = useState<'invoice' | 'appointment'>('invoice');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = usePersistentState('pos_cat', 'All');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [clientDetails, setClientDetails] = useState({ name: '', email: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);

    // --- Helpers ---
    const currency = storeFormData?.currency || 'USD';
    const taxRate = 0.08;

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.subtotal, 0), [cart]);
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxAmount = (subtotal - discountAmount) * taxRate;
    const total = subtotal - discountAmount + taxAmount;

    // --- Printing Logic ---
    
const generateReceiptHtml = (details: ReceiptDetails): string => {
  const itemsHtml = details.cart.map(item => `
    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
      <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
      <span style="width: 40px; text-align: center;">x${item.quantity}</span>
      <span style="width: 80px; text-align: right;">${details.currency} ${item.finalPrice?.toFixed(2)}</span>
      <span style="width: 100px; text-align: right; font-weight: bold;">${details.currency} ${item.subtotal.toFixed(2)}</span>
    </div>
  `).join('');

  return `
    <div style="font-family: 'Inter', sans-serif; width: 300px; margin: 0 auto; padding: 20px; color: #333; background-color: #fff; border: 1px solid #eee;">
      <h2 style="text-align: center; font-size: 24px; margin-bottom: 5px; color: #6A0572;">${storeFormData?.name}</h2>
      <p style="text-align: center; font-size: 12px; margin-bottom: 10px; color: #555;">${storeFormData?.address}<br>${storeFormData?.contactPhone}</p>
      <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">

      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
        <span>Date:</span><span>${details.date}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px;">
        <span>Txn ID:</span><span>${details.transactionId}</span>
      </div>

      <div style="font-size: 15px; font-weight: bold; margin-bottom: 10px; color: #444;">Items:</div>
      ${itemsHtml}

      <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">

      <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px;">
        <span>Subtotal:</span><span style="font-weight: bold;">${details.currency} ${details.subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px;">
        <span>Discount:</span><span style="font-weight: bold; color: #E91E63;">- ${details.currency} ${discountAmount.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 15px;">
        <span>Tax:</span><span style="font-weight: bold;">${details.currency} ${details.totalTax.toFixed(2)}</span>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; border-top: 2px solid #6A0572; padding-top: 10px; margin-top: 10px;">
        <span>TOTAL:</span><span>${details.currency} ${details.finalTotal.toFixed(2)}</span>
      </div>

      <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
      <p style="text-align: center; font-size: 13px; color: #555;">Served by: ${details.agentName}</p>
      <p style="text-align: center; font-size: 16px; font-weight: bold; margin-top: 15px; color: #6A0572;">THANK YOU!</p>
      <p style="text-align: center; font-size: 11px; color: #777; margin-top: 10px;">All sales final. No refunds.</p>
    </div>
  `;
};

// --- Print Function (remains mostly the same, now uses dynamic currencySymbol) ---
// --- Updated Print Function for Desktop Integration ---
const printReceipt = (htmlContent: string) => {
  // 1. Check if we are running inside the SalesmanPro Desktop App
  if ((window as any).chrome?.webview) {
    (window as any).chrome.webview.postMessage({
      type: 'PRINT_HTML_RECEIPT',
      payload: htmlContent
    });
    console.log("Sent receipt to Desktop Printer Service");
      (window as any).chrome.webview.postMessage({ type: 'NOTIFY', message: 'Receipt sent to printer!' });

    return;
  }

  // 2. Fallback for standard Web Browsers (your existing logic)
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
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
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
      document.body.removeChild(iframe);
    };
  } else {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } else {
      alert('Could not open print window. Please allow pop-ups for printing.');
    }
  }
};
    const generateReceiptHtmlV1 = (details: ReceiptDetails): string => `
        <div style="font-family: 'Courier New', monospace; width: 300px; padding: 10px; color: #000;">
            <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px;">
                <h2 style="margin: 0;">${details.storeName}</h2>
                <p style="font-size: 12px;">ID: ${details.transactionId}</p>
            </div>
            <div style="margin-top: 10px;">
                ${details.cart.map(item => `
                    <div style="display: flex; justify-content: space-between; font-size: 14px;">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${details.currency}${item.subtotal.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div style="border-top: 1px dashed #000; margin-top: 10px; padding-top: 5px;">
                <div style="display: flex; justify-content: space-between;"><b>TOTAL:</b> <b>${details.currency}${details.finalTotal.toFixed(2)}</b></div>
            </div>
            <p style="text-align: center; font-size: 11px; margin-top: 20px;">Served by: ${details.agentName}<br>${details.date}</p>
        </div>
    `;

    const printReceiptV1 = (html: string) => {
        // Desktop Bridge
        if ((window as any).chrome?.webview) {
            (window as any).chrome.webview.postMessage({ type: 'PRINT_HTML_RECEIPT', payload: html });
            return;
        }
        // Browser Fallback
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.write(`<html><body onload="window.print()">${html}</body></html>`);
            doc.close();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }
    };

    // --- Actions ---
    const handleAddToCart = (product: MarketListingForm) => {
        setCart(prev => {
            const exists = prev.find(i => i.id === product.id);
            if (exists) {
                return prev.map(i => i.id === product.id 
                    ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * (i.sellingPrice || 0) } 
                    : i
                );
            }
            return [...prev, { ...product, quantity: 1, subtotal: product.sellingPrice || 0 }];
        });
    };

    const finalizeSale = async () => {
        if (cart.length === 0 || !clientDetails.name) return alert("Required: Cart items and Client Name");
        
        setIsLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/shop/serviceOrders`, { // Fixed URL
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    billing: { // Added billing wrapper
                                        name: clientDetails.name,
                                        email: clientDetails.email || 'walk-in@store.com',
                                        phone: clientDetails.phone,
                                    },
                                    consumerId: userId || 'pos-agent',
                                    paymentOption: 'cod', 
                                    listingId: cart[0]?.id,    // API expects top-level listingId
                                    price: cart[0]?.sellingPrice, // API expects top-level price
                                    totalPrice: total,
                                    appointment: {
                                        date: new Date().toISOString(),
                                        timeSlot: "Now",
                                        locationType: "In-Store"
                                    }
                                }),
                            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Sale failed');

            // Trigger Printing
            const receiptHtml = generateReceiptHtml({
                cart, subtotal, totalTax: taxAmount, totalDiscount: discountAmount,
                finalTotal: total, agentName: userName, currency,
                transactionId: result.data?.trackingNumber || 'N/A',
                date: new Date().toLocaleString(),
                storeName: storeFormData?.name || 'My Service Store'
            });
            printReceipt(receiptHtml);

            // Reset
            setCart([]);
            setClientDetails({ name: '', email: '', phone: '' });
            alert("Transaction Complete!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [initialProducts, selectedCategory, searchTerm]);

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
            <style>{`
                .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); }
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            {/* Catalog (Left) */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-black text-gray-800 dark:text-white">Terminal <span style={{ color: primaryColor }}>.POS</span></h1>
                    <div className="flex gap-2">
                        {['invoice', 'appointment'].map(m => (
                            <button 
                                key={m}
                                onClick={() => setMode(m as any)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${mode === m ? 'shadow-lg text-white' : 'bg-white text-gray-500'}`}
                                style={{ backgroundColor: mode === m ? primaryColor : '' }}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            placeholder="Search services..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 dark:bg-gray-800"
                            style={{ '--tw-ring-color': primaryColor } as any}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="rounded-2xl border-none shadow-sm dark:bg-gray-800"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {initialCategories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 custom-scroll pr-2">
                    {filteredProducts.map(product => (
                        <motion.div 
                            key={product.id}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddToCart(product)}
                            className="bg-white dark:bg-gray-800 p-3 rounded-3xl shadow-sm border border-transparent hover:border-teal-500 cursor-pointer group"
                        >
                            <div className="aspect-square rounded-2xl bg-gray-100 mb-3 overflow-hidden">
                                <img src={product.images?.[0] || 'https://placehold.co/200'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="font-bold text-sm truncate dark:text-white">{product.name}</h3>
                            <p className="text-xs text-gray-400 mb-2">{product.category}</p>
                            <p className="font-black text-lg" style={{ color: primaryColor }}>{currency} {product.sellingPrice?.toFixed(2)}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Cart & Checkout (Right) */}
            <div className="w-full lg:w-[400px] glass dark:bg-gray-800/50 p-6 flex flex-col border-l border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-teal-100 text-teal-600">
                        <ShoppingBagIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl dark:text-white">Order Details</h2>
                        <p className="text-xs text-gray-400">Agent: {userName}</p>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <input 
                        placeholder="Client Name *" 
                        className="w-full p-3 rounded-xl border-gray-200 dark:bg-gray-900 dark:border-gray-700" 
                        value={clientDetails.name}
                        onChange={e => setClientDetails({...clientDetails, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            placeholder="Phone" 
                            className="p-3 rounded-xl border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                            onChange={e => setClientDetails({...clientDetails, phone: e.target.value})}
                        />
                        <input 
                            placeholder="Email" 
                            className="p-3 rounded-xl border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                            onChange={e => setClientDetails({...clientDetails, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll mb-4 pr-2">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-3 mb-4 bg-white/50 dark:bg-gray-900 p-3 rounded-2xl">
                            <div className="flex-1">
                                <p className="font-bold text-sm dark:text-white">{item.name}</p>
                                <p className="text-xs text-gray-400">{currency} {item.sellingPrice} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-red-400"><XMarkIcon className="w-5 h-5"/></button>
                                <span className="font-black dark:text-white">{currency}{item.subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50"><ShoppingBagIcon className="w-12 h-12 mb-2"/>Empty Cart</div>}
                </div>

                <div className="pt-4 border-t border-dashed border-gray-300 space-y-2">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{currency}{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-red-500"><span>Discount (%)</span><input type="number" className="w-12 text-right bg-transparent border-none p-0 focus:ring-0" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}/></div>
                    <div className="flex justify-between text-gray-500"><span>Tax (8%)</span><span>{currency}{taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-2xl font-black pt-4 dark:text-white">
                        <span>Total</span>
                        <span style={{ color: primaryColor }}>{currency}{total.toFixed(2)}</span>
                    </div>

                    <button 
                        onClick={finalizeSale}
                        disabled={isLoading}
                        className="w-full py-4 rounded-3xl text-white font-black text-lg shadow-xl shadow-teal-500/20 mt-4 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {isLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin"/> : <><PrinterIcon className="w-6 h-6"/> Complete Sale</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPOSClient;