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
    ChevronUpIcon,
    CalendarIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { IStoreCategory, MarketListingForm } from '@/types/typings';
import { Company } from '@prisma/client';

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

export type Agent = {
  id: string;
  name: string;
  dailySalesCount: number;
  dailySalesValue: number;
};

interface ReceiptDetails {
  cart: CartItem[];
  subtotal: number;
  totalDiscountAmount: number;
  totalTax: number;
  finalTotal: number;
  agentId: string;
  agentName: string;
  transactionId: string;
  date: string;
  time: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  currencySymbol: string; // Added for dynamic currency display
};

export type CompanyInfo = Company & {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate?: number; // Optional, default to 0.08 if not provided
};


const AdminPOSClient: React.FC<{
    initialProducts?: MarketListingForm[];
    initialCategories?: IStoreCategory[];
    companyId: string;
    userName: string;
    userId: string | null;
    currentPage: number;
    totalPages: number;
}> = ({ companyId, initialProducts, initialCategories, userName, userId, currentPage, totalPages }) => {
    
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

    // --- State ---
    const [mode, setMode] = useState<'invoice' | 'appointment'>('invoice');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = usePersistentState('pos_cat', 'All');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [clientDetails, setClientDetails] = useState({ name: '', email: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);
      const [showMobileCart, setShowMobileCart] = useState(false);

    // --- Helpers ---
    const currency = storeFormData?.currency || 'USD';
    
    const taxRate = companyInfo?.taxRate ?? 0.00;

  const [products, setProducts] = useState<MarketListingForm[]>(initialProducts || []);
  const [categories, setCategories] = useState<IStoreCategory[]>(initialCategories || []);
    // const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.subtotal, 0), [cart]);

  // State for Agent and Company Info
  const [currentAgent, setCurrentAgent] = useState<Agent | null>({
    id: 'agent-001',
    name: `${userName}`,
    dailySalesCount: 15,
    dailySalesValue: 1250.75,
  });
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [timeSlot, setTimeSlot] = useState(new Date().toISOString().slice(0, 16)); // Default to current date & time
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10)); // Default to current date
    
          
          // Cart calculations
          const subtotal = useMemo(() => {
            return cart.reduce((sum, item) => sum + item.subtotal, 0);
          }, [cart]);
        
          const totalDiscountAmount = useMemo(() => {
            return (subtotal * discountPercentage) / 100;
          }, [subtotal, discountPercentage]);
        
          const totalTax = useMemo(() => {
            const taxable = subtotal - totalDiscountAmount;
            return taxable * taxRate;
          }, [subtotal, totalDiscountAmount, companyInfo]);

    const [isCartOpen, setIsCartOpen] = useState(false);
        const discountAmount = (subtotal * discountPercent) / 100;
    const taxAmount = (subtotal - discountAmount) * taxRate;
    const total = subtotal - discountAmount + taxAmount;

    
      const currencySymbol = useMemo(() => companyInfo?.currency === 'KES' ? 'KSh' : '$', [companyInfo]);
    
        /* ------------------- Mobile Cart swipe handling ------------------- */
      const mobileCartRef = useRef<HTMLDivElement | null>(null);
      const touchStartY = useRef<number | null>(null);
      const currentTranslate = useRef<number>(0);
    
    
      const [page, setPage] = useState(1);
      const [loading, setLoading] = useState(false);
      const [hasMore, setHasMore] = useState(page < totalPages);
      
      const observer = useRef<IntersectionObserver | null>(null);
    
      // The "Sentinel" ref: when this div enters the viewport, we load more
      const lastProductElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
    
        observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore) {
            setPage(prevPage => prevPage + 1);
          }
        });
    
        if (node) observer.current.observe(node);
      }, [loading, hasMore]);
    
      // Fetch more products when page changes
      useEffect(() => {
        if (page === 1) return; // Skip initial load as it's handled by Server Component
    
        const fetchMoreProducts = async () => {
          setLoading(true);
          try {
            const res = await fetch(`/api/admin/pos-marketplace-listings?companyId=${companyId}&page=${page}&limit=20`);
            const data = await res.json();
            
            const newProducts = data.data.results;
            setProducts(prev => [...prev, ...newProducts]);
            setHasMore(page < data.data.totalPages);
          } catch (err) {
            console.error("Failed to load products", err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchMoreProducts();
      }, [page, companyId]);
    
      useEffect(() => {
        const el = mobileCartRef.current;
        if (!el) return;
        const start = (e: TouchEvent) => {
          touchStartY.current = e.touches[0].clientY;
        };
        const move = (e: TouchEvent) => {
          if (touchStartY.current == null) return;
          const delta = e.touches[0].clientY - touchStartY.current;
          if (delta > 0) {
            currentTranslate.current = delta;
            el.style.transform = `translateY(${delta}px)`;
            el.style.transition = 'transform 0s';
          }
        };
        const end = () => {
          if (touchStartY.current == null) return;
          const delta = currentTranslate.current;
          el.style.transition = '';
          el.style.transform = '';
          if (delta > 120) {
            setShowMobileCart(false);
          }
          touchStartY.current = null;
          currentTranslate.current = 0;
        };
    
        el.addEventListener('touchstart', start, { passive: true });
        el.addEventListener('touchmove', move, { passive: true });
        el.addEventListener('touchend', end);
        return () => {
          el.removeEventListener('touchstart', start as any);
          el.removeEventListener('touchmove', move as any);
          el.removeEventListener('touchend', end as any);
        };
      }, [showMobileCart]);
    
    
    

    // --- Printing Logic ---
    const generateReceiptHtml = (details: ReceiptDetails): string => {
        const itemsHtml = details.cart.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
            <span style="width: 40px; text-align: center;">x${item.quantity}</span>
            <span style="width: 80px; text-align: right;">${details.currencySymbol} ${item.finalPrice?.toFixed(2)}</span>
            <span style="width: 100px; text-align: right; font-weight: bold;">${details.currencySymbol} ${item.subtotal.toFixed(2)}</span>
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
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px;">
                <span>Txn ID:</span><span>${details.transactionId}</span>
            </div>

            <div style="font-size: 15px; font-weight: bold; margin-bottom: 10px; color: #444;">Items:</div>
            ${itemsHtml}

            <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">

            <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px;">
                <span>Subtotal:</span><span style="font-weight: bold;">${details.currencySymbol} ${details.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px;">
                <span>Discount:</span><span style="font-weight: bold; color: #E91E63;">- ${details.currencySymbol} ${details.totalDiscountAmount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 15px;">
                <span>Tax:</span><span style="font-weight: bold;">${details.currencySymbol} ${details.totalTax.toFixed(2)}</span>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; border-top: 2px solid #6A0572; padding-top: 10px; margin-top: 10px;">
                <span>TOTAL:</span><span>${details.currencySymbol} ${details.finalTotal.toFixed(2)}</span>
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
// const printReceipt = (htmlContent: string) => {
//   // 1. Check if we are running inside the SalesmanPro Desktop App
//   if ((window as any).chrome?.webview) {
//     (window as any).chrome.webview.postMessage({
//       type: 'PRINT_HTML_RECEIPT',
//       payload: htmlContent
//     });
//     // console.log("Sent receipt to Desktop Printer Service");
//       (window as any).chrome.webview.postMessage({ type: 'NOTIFY', message: 'Receipt sent to printer!' });

//     return;
//   }

//   // 2. Fallback for standard Web Browsers (your existing logic)
//   const iframe = document.createElement('iframe');
//   iframe.style.display = 'none';
//   document.body.appendChild(iframe);

//   const iframeDoc = iframe.contentWindow?.document;
//   if (iframeDoc) {
//     iframeDoc.open();
//      iframeDoc.write(`
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Receipt</title>
//         <style>
//           @page {
//             size: 80mm auto;
//             margin: 0;
//           }
//           body {
//             margin: 0;
//             padding: 0;
//             -webkit-print-color-adjust: exact;
//           }
//           div { font-family: 'Inter', sans-serif; width: 300px; margin: 0 auto; padding: 20px; color: #333; background-color: #fff; border: 1px solid #eee; }
//           h2 { text-align: center; font-size: 24px; margin-bottom: 5px; color: #6A0572; }
//           p { text-align: center; font-size: 12px; margin-bottom: 10px; color: #555; }
//           hr { border: none; border-top: 1px dashed #ccc; margin: 15px 0; }
//           .flex-between { display: flex; justify-content: space-between; }
//           .item-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; }
//           .item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//           .item-qty { width: 40px; text-align: center; }
//           .item-price { width: 80px; text-align: right; }
//           .item-subtotal { width: 100px; text-align: right; font-weight: bold; }
//           .section-title { font-size: 15px; font-weight: bold; margin-bottom: 10px; color: #444; }
//           .summary-row { display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px; }
//           .total-row { display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; border-top: 2px solid #6A0572; padding-top: 10px; margin-top: 10px; }
//           .thank-you { text-align: center; font-size: 16px; font-weight: bold; margin-top: 15px; color: #6A0572; }
//           .policy { text-align: center; font-size: 11px; color: #777; margin-top: 10px; }
//         </style>
//       </head>
//       <body>
//         ${htmlContent}
//       </body>
//       </html>
//     `);
//     iframeDoc.close();
//     iframe.onload = () => {
//       iframe.contentWindow?.focus();
//       iframe.contentWindow?.print();
//       document.body.removeChild(iframe);
//     };
//   } else {
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(htmlContent);
//       printWindow.document.close();
//       printWindow.print();
//     } else {
//       alert('Could not open print window. Please allow pop-ups for printing.');
//     }
//   }
// };
// --- Print Function (remains mostly the same, now uses dynamic currencySymbol) ---
// --- Updated Print Function for Desktop Integration ---
    const printReceipt = (htmlContent: string, receiptDetails: any) => {
        const desktopPayload = {
            // Business Identity (Matches C# Properties)
            BusinessName: receiptDetails.storeName || "Gourmet Bites Bistro",
            BusinessAddress: receiptDetails.storeAddress || "123 Tech Lane, Silicon Valley",
            TaxId: receiptDetails.taxId || "VAT-987654321",
            PhoneNumber: receiptDetails.storePhone || "+1 (555) 012-3456",

            // Transaction Details
            InvoiceId: receiptDetails.invoiceId || `INV-${Date.now()}`,
            ReceiptNumber: receiptDetails.receiptNumber || `RCP-${Date.now()}`,
            CustomerName: receiptDetails.customerName || "Walking Customer",
            StaffName: receiptDetails.cashierName || "Alex P.",
            Date: `${receiptDetails.date} ${receiptDetails.time}`,

            // Financials
            Currency: receiptDetails.currency || "USD",
            TaxRate: receiptDetails.taxRatePercentage / 100 || 0.10, // Pass as decimal (e.g., 0.10 for 10%)
            ChangeGiven: receiptDetails.changeAmount || 0.00,
            PaymentMethod: receiptDetails.paymentType || "Cash",

            // Items List
            Items: receiptDetails.cart.map((item: any) => ({
                Name: item.name,
                Quantity: parseInt(item.quantity),
                Price: parseFloat(item.finalPrice || item.price || 0),
                Discount: parseFloat(item.discountAmount || 0),
                Category: item.category || "General",
                Route: item.route || "dispatch"
            }))
        };

        if ((window as any).AndroidBridge) {
            // This calls the Kotlin @JavascriptInterface
            // Stringify the whole object so Kotlin can parse it easily
            const message = JSON.stringify({
                type: 'PRINT_ESC_POS',
                payload: desktopPayload
            });
            
            (window as any).AndroidBridge.postMessage(message);
        
        } else  if ((window as any).chrome?.webview) {
        
        (window as any).chrome.webview.postMessage({
        type: 'PRINT_ESC_POS',
        payload: desktopPayload
        });

        // Change this in your React code
        (window as any).chrome.webview.postMessage({
        type: 'PRINT_HTML_RECEIPT',
        payload: htmlContent // Send the pre-rendered HTML string
        });

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

      const finalTotal = useMemo(() => subtotal - totalDiscountAmount + totalTax, [subtotal, totalDiscountAmount, totalTax]);
    
      // --- useEffect to fetch data on component mount ---
        useEffect(() => {
          // 1. Fetch Products
          // 2. Fetch Agent Info (assuming a current user/agent context)
          const fetchAgentInfo = async () => {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
            const fetchedAgent: Agent = {
              id: userId || 'agent-001',
              name: userName || 'Alice Smith',
              dailySalesCount: 15,
              dailySalesValue: 1250.75,
            };
            setCurrentAgent(fetchedAgent);
          };
      
          // 3. Fetch Company Info
          const fetchCompanyInfo = async () => {
            
            await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
            const fetchedCompany: CompanyInfo = {
              name: 'Your Awesome Store',
              address: '123 Main St, Nairobi, Kenya',
              phone: '+254 7XX XXX XXX',
              currency: 'KES', // Default from schema, or fetched
            };
            setCompanyInfo(fetchedCompany);
          };
      
          // // fetchProducts();
          fetchAgentInfo();
          fetchCompanyInfo();
        }, [companyId]); // Dependency array: re-run if companyId changes

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
                                        date: appointmentDate,
                                        timeSlot: timeSlot,
                                        locationType: "In-Store"
                                    }
                                }),
                            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Sale failed');

            // Trigger Printing
            const now = new Date();

    const receiptDetails: ReceiptDetails = {
      // Items & Totals
      cart: cart.map(item => ({
        ...item,
        // Ensure these match the expected calculation: (Price * Qty) - Discount
        finalPrice: (item.finalPrice || item.sellingPrice || item.price || 0), // Fallbacks for price
        subtotal: ((item.finalPrice || item.sellingPrice || item.price || 0) * item.quantity) - (item.discount || 0),
        discountAmount: item.discount || 0,
        category: item.category || "General",
        route: item.route || "dispatch",
      })),
      
      subtotal: subtotal,
      totalDiscountAmount: totalDiscountAmount,
      taxRatePercentage: taxRate, // Added: Store the numeric rate (e.g., 10 for 10%)
      totalTax: totalTax,
      finalTotal: finalTotal,
      currency: "USD", // Added: Explicit currency code for C# string Currency

      // Transaction & Personnel
      agentId: currentAgent?.id || 'N/A',
      staffName: currentAgent?.name || 'N/A', // Renamed to match C# StaffName
      customerName: "Walking Customer", // Added: Default or from state
      invoiceId: result.data.trackingNumber, 
      receiptNumber: `RCP-${result.data.trackingNumber}`, // Consistent with InvoiceId
      
      // Temporal
      date: now.toISOString().split('T')[0], // Format: YYYY-MM-DD
      time: now.toTimeString().split(' ')[0], // Format: HH:mm:ss
      
      // Business Identity
      storeName: companyInfo?.name || 'Gourmet Bites Bistro',
      storeAddress: companyInfo?.address || '123 Tech Lane, Silicon Valley',
      storePhone: companyInfo?.contactPhone || '+1 (555) 012-3456',
      taxId: companyInfo?.taxId || '', // Added: Needed for professional receipt
      currencySymbol: currencySymbol,
    };
            // printReceipt(receiptHtml, receiptDetails);
            const receiptHtml = generateReceiptHtml(receiptDetails);
            printReceipt(receiptHtml, receiptDetails);

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

        /* ------------------- filtering & derived values ------------------- */
      const filteredProducts = useMemo(() => {
        return products.filter(p => {
          const catId = (p as any).productCategoryId || (p as any).categoryId || 'all';
          const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
          const matchesSearch =
            !searchTerm ||
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
          return matchesCategory && matchesSearch;
        });
      }, [products, searchTerm, selectedCategory]);
      
    //   const finalTotal = useMemo(() => subtotal - totalDiscountAmount + totalTax, [subtotal, totalDiscountAmount, totalTax]);
      
    //   const finalizeSale = useCallback(async () => {
    //   if (cart.length === 0) return alert("Cart is empty");

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans relative">
            <style>{`
                .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); }
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            {/* Catalog (Main Section) */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden mb-20 lg:mb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h1 className="text-2xl font-black text-gray-800 dark:text-white">
                        Terminal <span style={{ color: primaryColor }}>.POS</span>
                    </h1>
                    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
                        {['invoice', 'appointment'].map(m => (
                            <button 
                                key={m}
                                onClick={() => setMode(m as any)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${mode === m ? 'shadow-md text-white' : 'text-gray-500'}`}
                                style={{ backgroundColor: mode === m ? primaryColor : '' }}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            placeholder="Search services..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 dark:bg-gray-800 text-sm"
                            style={{ '--tw-ring-color': primaryColor } as any}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="rounded-2xl border-none shadow-sm dark:bg-gray-800 text-sm py-3"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="ll">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 custom-scroll pr-1">
                    {filteredProducts.map((product, index) => (
                        <motion.div 
                            ref={lastProductElementRef} 
                            key={`${product.id}-${index}`}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddToCart(product)}
                            className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-3xl shadow-sm border border-transparent hover:border-teal-500 cursor-pointer group"
                        >
                            <div className="aspect-square rounded-2xl bg-gray-100 mb-2 overflow-hidden">
                                <img src={product.images?.[0] || 'https://placehold.co/200'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="font-bold text-xs sm:text-sm truncate dark:text-white">{product.name}</h3>
                            <p className="text-[10px] sm:text-xs text-gray-400 mb-1">{product.category}</p>
                            <p className="font-black text-sm sm:text-lg" style={{ color: primaryColor }}>{currency} {product.sellingPrice?.toFixed(2)}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Mobile Floating Action Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between z-40">
                <div onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 cursor-pointer">
                    <div className="relative p-3 rounded-2xl bg-teal-100 text-teal-600">
                        <ShoppingBagIcon className="w-6 h-6" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                        <p className="font-black text-xl dark:text-white">{currency}{total.toFixed(2)}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="p-4 rounded-2xl text-white shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                >
                    <ChevronUpIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Cart & Checkout (Right Sidebar / Mobile Drawer) */}
            <AnimatePresence>
                {(isCartOpen || window.innerWidth > 1024) && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-0 w-full lg:w-[400px] glass dark:bg-gray-800 p-6 flex flex-col border-l border-gray-200 dark:border-gray-700 h-full overflow-hidden`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-teal-100 text-teal-600">
                                    <ShoppingBagIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-xl dark:text-white">Order Details</h2>
                                    <p className="text-xs text-gray-400">Agent: {userName}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 text-gray-400">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-3 mb-6">
                            <input 
                                placeholder="Client Name *" 
                                className="w-full p-3 rounded-xl border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-sm focus:ring-1 focus:ring-teal-500 outline-none dark:text-white" 
                                value={clientDetails.name}
                                onChange={e => setClientDetails({...clientDetails, name: e.target.value})}
                            />
                            
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    placeholder="Phone" 
                                    value={clientDetails.phone}
                                    className="p-3 rounded-xl border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-sm outline-none dark:text-white"
                                    onChange={e => setClientDetails({...clientDetails, phone: e.target.value})}
                                />
                                <input 
                                    placeholder="Email" 
                                    value={clientDetails.email}
                                    className="p-3 rounded-xl border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-sm outline-none dark:text-white"
                                    onChange={e => setClientDetails({...clientDetails, email: e.target.value})}
                                />
                            </div>

                            {/* Appointment Specific Fields */}
                            {mode === 'appointment' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 mt-2"
                                >
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <input 
                                                type="date"
                                                value={appointmentDate}
                                                className="w-full pl-9 p-2.5 rounded-xl border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-sm outline-none dark:text-white"
                                                onChange={e => setAppointmentDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Time Slot</label>
                                        <div className="relative">
                                            <ClockIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <input 
                                                type="time"
                                                value={timeSlot}
                                                className="w-full pl-9 p-2.5 rounded-xl border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-sm outline-none dark:text-white"
                                                onChange={e => setTimeSlot(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scroll mb-4 pr-1">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 mb-3 bg-white/50 dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex-1">
                                        <p className="font-bold text-sm dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-400">{currency} {item.sellingPrice} x {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-red-400 p-1 hover:bg-red-50 rounded-lg transition-colors">
                                            <XMarkIcon className="w-5 h-5"/>
                                        </button>
                                        <span className="font-black text-sm dark:text-white">{currency}{item.subtotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 py-10">
                                    <ShoppingBagIcon className="w-12 h-12 mb-2"/>
                                    <p className="font-bold">Empty Cart</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 space-y-2">
                            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{currency}{subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm text-red-500"><span>Discount (%)</span><input type="number" className="w-12 text-right bg-transparent border-none p-0 focus:ring-0 font-bold" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}/></div>
                            <div className="flex justify-between text-sm text-gray-500"><span>Tax (8%)</span><span>{currency}{taxAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between text-2xl font-black pt-4 dark:text-white">
                                <span>Total</span>
                                <span style={{ color: primaryColor }}>{currency}{total.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={finalizeSale}
                                disabled={isLoading}
                                className="w-full py-4 rounded-3xl text-white font-black text-lg shadow-xl mt-4 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                                style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}
                            >
                                {isLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin"/> : <><PrinterIcon className="w-6 h-6"/> Complete Sale</>}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPOSClient;