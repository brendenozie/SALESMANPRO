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
    TrashIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon
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
  currencySymbol: string;
};

export type CompanyInfo = Company & {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate?: number; 
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
    const [selectedCategory, setSelectedCategory] = usePersistentState<string>('pos:selectedCategory', 'all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [clientDetails, setClientDetails] = useState({ name: '', email: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const taxRate = companyInfo?.taxRate ?? 0.00;

    const [products, setProducts] = useState<MarketListingForm[]>(initialProducts || []);
    const [categories, setCategories] = useState<IStoreCategory[]>(initialCategories || []);

    const [currentAgent, setCurrentAgent] = useState<Agent | null>({
        id: 'agent-001',
        name: `${userName}`,
        dailySalesCount: 15,
        dailySalesValue: 1250.75,
    });
    
    const [timeSlot, setTimeSlot] = useState(new Date().toISOString().slice(0, 16)); 
    const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10)); 

    // Cart calculations
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
    const totalDiscountAmount = useMemo(() => (subtotal * discountPercent) / 100, [subtotal, discountPercent]);
    const totalTax = useMemo(() => (subtotal - totalDiscountAmount) * taxRate, [subtotal, totalDiscountAmount, companyInfo]);
    const finalTotal = useMemo(() => subtotal - totalDiscountAmount + totalTax, [subtotal, totalDiscountAmount, totalTax]);
    
    const currencySymbol = useMemo(() => companyInfo?.currency === 'KES' ? 'KSh' : '$', [companyInfo]);

    // Infinite Scroll
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(page < totalPages);
    
    const observer = useRef<IntersectionObserver | null>(null);
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

    useEffect(() => {
        if (page === 1) return; 

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
        const fetchAgentInfo = async () => {
            await new Promise(resolve => setTimeout(resolve, 300)); 
            setCurrentAgent({
                id: userId || 'agent-001',
                name: userName || 'Alice Smith',
                dailySalesCount: 15,
                dailySalesValue: 1250.75,
            });
        };
    
        const fetchCompanyInfo = async () => {
            await new Promise(resolve => setTimeout(resolve, 400)); 
            setCompanyInfo({
                name: 'Your Awesome Store',
                address: '123 Main St, Nairobi, Kenya',
                phone: '+254 7XX XXX XXX',
                currency: companyInfo?.currency || 'USD', 
            });
        };
    
        fetchAgentInfo();
        fetchCompanyInfo();
    }, [companyId]); 

    // --- Printing Logic ---
    const generateReceiptHtml = (details: ReceiptDetails): string => {
        const itemsHtml = details.cart.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
            <span style="width: 40px; text-align: center;">x${item.quantity}</span>
            <span style="width: 80px; text-align: right;">${details.currencySymbol} ${(item.finalPrice || item.sellingPrice || item.price || 0).toFixed(2)}</span>
            <span style="width: 100px; text-align: right; font-weight: bold;">${details.currencySymbol} ${item.subtotal.toFixed(2)}</span>
            </div>
        `).join('');

        return `
            <div style="font-family: 'Inter', sans-serif; width: 300px; margin: 0 auto; padding: 20px; color: #333; background-color: #fff; border: 1px solid #eee;">
            <h2 style="text-align: center; font-size: 24px; margin-bottom: 5px; color: #111;">${details.storeName}</h2>
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

            <div style="display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; border-top: 2px solid #111; padding-top: 10px; margin-top: 10px;">
                <span>TOTAL:</span><span>${details.currencySymbol} ${details.finalTotal.toFixed(2)}</span>
            </div>

            <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
            <p style="text-align: center; font-size: 13px; color: #555;">Served by: ${details.agentName}</p>
            <p style="text-align: center; font-size: 16px; font-weight: bold; margin-top: 15px; color: #111;">THANK YOU!</p>
            </div>
        `;
    };

    const printReceipt = (htmlContent: string, receiptDetails: any) => {
        const desktopPayload = {
            BusinessName: receiptDetails.storeName || "Gourmet Bites Bistro",
            BusinessAddress: receiptDetails.storeAddress || "123 Tech Lane, Silicon Valley",
            TaxId: receiptDetails.taxId || "VAT-987654321",
            PhoneNumber: receiptDetails.storePhone || "+1 (555) 012-3456",
            InvoiceId: receiptDetails.invoiceId || `INV-${Date.now()}`,
            ReceiptNumber: receiptDetails.receiptNumber || `RCP-${Date.now()}`,
            CustomerName: receiptDetails.customerName || "Walking Customer",
            StaffName: receiptDetails.cashierName || "Alex P.",
            Date: `${receiptDetails.date} ${receiptDetails.time}`,
            Currency: receiptDetails.currency || "USD",
            TaxRate: receiptDetails.taxRatePercentage / 100 || 0.10, 
            ChangeGiven: receiptDetails.changeAmount || 0.00,
            PaymentMethod: receiptDetails.paymentType || "Cash",
            Items: receiptDetails.cart.map((item: any) => ({
                Name: item.name,
                Quantity: parseInt(item.quantity),
                Price: parseFloat(item.finalPrice || item.price || item.sellingPrice || 0),
                Discount: parseFloat(item.discountAmount || 0),
                Category: item.category || "General",
                Route: item.route || "dispatch"
            }))
        };

        if ((window as any).AndroidBridge) {
            const message = JSON.stringify({ type: 'PRINT_ESC_POS', payload: desktopPayload });
            (window as any).AndroidBridge.postMessage(message);
        } else if ((window as any).chrome?.webview) {
            (window as any).chrome.webview.postMessage({ type: 'PRINT_ESC_POS', payload: desktopPayload });
            (window as any).chrome.webview.postMessage({ type: 'PRINT_HTML_RECEIPT', payload: htmlContent });
            (window as any).chrome.webview.postMessage({ type: 'NOTIFY', message: 'Receipt sent to printer!' });
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(htmlContent);
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
            }
        }
    };

    // --- Actions ---
    const handleAddToCart = (product: MarketListingForm) => {
        setCart(prev => {
            const exists = prev.find(i => i.id === product.id);
            const price = product.finalPrice || product.sellingPrice || product.price || 0;
            if (exists) {
                return prev.map(i => i.id === product.id 
                    ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * price } 
                    : i
                );
            }
            return [...prev, { ...product, quantity: 1, subtotal: price }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = item.quantity + delta;
                if (newQ < 1) return item; 
                const price = item.finalPrice || item.sellingPrice || item.price || 0;
                return { ...item, quantity: newQ, subtotal: newQ * price };
            }
            return item;
        }));
    };

    const finalizeSale = async () => {
        if (cart.length === 0) return alert("Please add items to the cart.");
        if (mode === 'appointment' && !clientDetails.name) return alert("Client name is required for appointments.");
        
        setIsLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/shop/serviceOrders`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    billing: { 
                        name: clientDetails.name || 'Walk-in Customer',
                        email: clientDetails.email || 'walk-in@store.com',
                        phone: clientDetails.phone,
                    },
                    consumerId: userId || 'pos-agent',
                    paymentOption: 'cod', 
                    listingId: cart[0]?.id,    
                    price: cart[0]?.sellingPrice, 
                    totalPrice: finalTotal,
                    appointment: mode === 'appointment' ? {
                        date: appointmentDate,
                        timeSlot: timeSlot,
                        locationType: "In-Store"
                    } : null
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Sale failed');

            const now = new Date();
            const receiptDetails: ReceiptDetails = {
                cart: cart.map(item => ({
                    ...item,
                    finalPrice: (item.finalPrice || item.sellingPrice || item.price || 0), 
                    subtotal: ((item.finalPrice || item.sellingPrice || item.price || 0) * item.quantity),
                    category: item.category || "General",
                })),
                subtotal: subtotal,
                totalDiscountAmount: totalDiscountAmount,
                totalTax: totalTax,
                finalTotal: finalTotal,
                agentId: currentAgent?.id || 'N/A',
                agentName: currentAgent?.name || 'N/A', 
                transactionId: result.data?.trackingNumber || `TXN-${Date.now()}`, 
                date: now.toISOString().split('T')[0], 
                time: now.toTimeString().split(' ')[0], 
                storeName: companyInfo?.name || 'Store Name',
                storeAddress: companyInfo?.address || 'Store Address',
                storePhone: companyInfo?.phone || 'Store Phone',
                currencySymbol: currencySymbol,
            };

            const receiptHtml = generateReceiptHtml(receiptDetails);
            printReceipt(receiptHtml, receiptDetails);

            setCart([]);
            setClientDetails({ name: '', email: '', phone: '' });
            setIsCartOpen(false);
            alert("Transaction Complete!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const catId = (p as any).productCategoryId || (p as any).categoryId || 'all';
            const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
            const matchesSearch = !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch ;
        });
    }, [products, searchTerm, selectedCategory]);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-gray-900 dark:text-gray-100 selection:bg-teal-200 dark:selection:bg-teal-900">
            {/* --- Main Catalog Area --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative z-10">
                
                {/* Header Section */}
                <header className="px-4 py-6 md:px-6 md:py-8 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl z-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">
                                Terminal<span style={{ color: primaryColor }}>.POS</span>
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">Welcome back, {userName}</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Mode Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-full md:w-auto">
                                {['invoice', 'appointment'].map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setMode(m as any)}
                                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${mode === m ? 'shadow-md text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                        style={{ backgroundColor: mode === m ? primaryColor : '' }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Search & Categories */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 max-w-7xl mx-auto w-full">
                        <div className="relative flex-1 group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input 
                                placeholder="Search products or services..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm focus:ring-2 focus:border-transparent outline-none transition-all text-sm font-medium"
                                style={{ '--tw-ring-color': primaryColor } as any}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Categories Scroll */}
                <div className="shrink-0 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 overflow-x-auto p-4 max-w-7xl mx-auto w-full no-scrollbar">
                        {['all', ...categories].map((cat: any) => {
                            const id = typeof cat === 'string' ? cat : (cat.categoryId || cat.category?.id || cat.id);
                            const name = typeof cat === 'string' ? 'All Items' : cat.displayName;
                            const isSelected = selectedCategory === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setSelectedCategory(id)}
                                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border-2 ${
                                        isSelected
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                                            : 'bg-white dark:bg-gray-900 border-transparent text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'
                                    }`}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 lg:pb-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => {
                                const isLast = filteredProducts.length === index + 1;
                                return (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        ref={isLast ? lastProductElementRef : null} 
                                        key={`${product.id}-${index}`}
                                    >
                                        <ProductCard 
                                            product={product} 
                                            handleAddToCart={handleAddToCart} 
                                            currencySymbol={currencySymbol} 
                                            primaryColor={primaryColor}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {loading && (
                            <div className="col-span-full py-10 flex justify-center">
                                <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        )}
                        {!loading && filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                                <MagnifyingGlassIcon className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-semibold">No products found</p>
                                <p className="text-sm">Try adjusting your search or category filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Mobile FAB --- */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-30 pb-safe">
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl shadow-xl active:scale-95 transition-transform"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="flex items-center gap-3 text-white">
                        <div className="relative">
                            <ShoppingBagIcon className="w-7 h-7" />
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {cart.length}
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-lg">View Order</span>
                    </div>
                    <span className="font-black text-xl text-white">{currencySymbol} {finalTotal.toFixed(2)}</span>
                </button>
            </div>

            {/* --- Cart Sidebar / Bottom Sheet --- */}
            <AnimatePresence>
                {(isCartOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                    <>
                        {/* Mobile Backdrop */}
                        {isCartOpen && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsCartOpen(false)}
                                className="lg:hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40"
                            />
                        )}

                        <motion.aside 
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={`fixed bottom-0 left-0 right-0 lg:relative lg:inset-auto z-50 lg:z-10 w-full lg:w-[420px] h-[90vh] lg:h-full bg-white dark:bg-gray-900 shadow-2xl lg:shadow-none border-l border-gray-200 dark:border-gray-800 flex flex-col rounded-t-3xl lg:rounded-none overflow-hidden`}
                        >
                            {/* Drawer Drag Handle (Mobile) */}
                            <div className="lg:hidden flex justify-center pt-3 pb-1 w-full touch-pan-y" onClick={() => setIsCartOpen(false)}>
                                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            </div>

                            {/* Cart Header */}
                            <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h2 className="font-black text-2xl">Current Order</h2>
                                    <p className="text-sm text-gray-500 font-medium">{cart.length} items</p>
                                </div>
                                <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Cart Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-6">
                                
                                {/* Customer Details */}
                                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="relative">
                                        <UserCircleIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input 
                                            placeholder="Client Name (Required for Appt)" 
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 outline-none transition-all"
                                            style={{ '--tw-ring-color': primaryColor } as any}
                                            value={clientDetails.name}
                                            onChange={e => setClientDetails({...clientDetails, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <DevicePhoneMobileIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input 
                                                placeholder="Phone" 
                                                value={clientDetails.phone}
                                                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as any}
                                                onChange={e => setClientDetails({...clientDetails, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="relative">
                                            <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input 
                                                placeholder="Email" 
                                                value={clientDetails.email}
                                                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as any}
                                                onChange={e => setClientDetails({...clientDetails, email: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {mode === 'appointment' && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} 
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                                            >
                                                <div className="relative">
                                                    <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                    <input 
                                                        type="date"
                                                        value={appointmentDate}
                                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2"
                                                        style={{ '--tw-ring-color': primaryColor } as any}
                                                        onChange={e => setAppointmentDate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <ClockIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                    <input 
                                                        type="time"
                                                        value={timeSlot}
                                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2"
                                                        style={{ '--tw-ring-color': primaryColor } as any}
                                                        onChange={e => setTimeSlot(e.target.value)}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Items List */}
                                <div className="flex-1 space-y-3">
                                    {cart.map((item, index) => (
                                        <div key={`${item.id}-${index}`} className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                                            <div className="flex justify-between items-start pr-6">
                                                <p className="font-bold text-sm leading-tight">{item.name}</p>
                                                <p className="font-black text-sm whitespace-nowrap ml-2">{currencySymbol} {item.subtotal.toFixed(2)}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-gray-500 font-medium">{currencySymbol} {(item.finalPrice || item.sellingPrice || item.price || 0).toFixed(2)} / ea</span>
                                                
                                                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300">
                                                        <MinusIcon className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300">
                                                        <PlusIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} 
                                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}

                                    {cart.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingBagIcon className="w-10 h-10 opacity-50" />
                                            </div>
                                            <p className="font-bold text-lg text-gray-600 dark:text-gray-300">Cart is empty</p>
                                            <p className="text-sm mt-1">Tap products to add them.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Checkout Footer */}
                            <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 pb-safe">
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <span>Subtotal</span>
                                        <span>{currencySymbol} {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-red-500">Discount (%)</span>
                                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                                            <input 
                                                type="number" 
                                                className="w-10 text-right bg-transparent border-none p-0 focus:ring-0 font-bold text-red-500" 
                                                value={discountPercent} 
                                                onChange={e => setDiscountPercent(Number(e.target.value))}
                                            />
                                            <span className="text-red-500">%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <span>Tax ({(taxRate * 100).toFixed(1)}%)</span>
                                        <span>{currencySymbol} {totalTax.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-end pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-500 font-bold">Total</span>
                                        <span className="text-3xl font-black" style={{ color: primaryColor }}>
                                            {currencySymbol} {finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={finalizeSale}
                                    disabled={isLoading || cart.length === 0}
                                    className="w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 group relative overflow-hidden"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="w-6 h-6 animate-spin"/> 
                                    ) : (
                                        <>
                                            <PrinterIcon className="w-6 h-6 group-hover:scale-110 transition-transform"/> 
                                            <span>Pay {currencySymbol} {finalTotal.toFixed(2)}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default AdminPOSClient;

// --- Subcomponents ---

const ProductCard = ({ product, handleAddToCart, currencySymbol, primaryColor }: { product: MarketListingForm; handleAddToCart: (product: MarketListingForm) => void; currencySymbol: string; primaryColor: string }) => {
    const price = product.finalPrice || product.sellingPrice || product.price || 0;
    
    return (
        <div
            onClick={() => handleAddToCart(product)}
            className="group cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 flex flex-col h-full"
        >
            <div className="relative aspect-square overflow-hidden rounded-2xl mb-3 bg-gray-100 dark:bg-gray-800 shrink-0">
                <img
                    src={product.images?.[0] || `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={product.name}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                
                {/* Add overlay button on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 text-gray-900 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                </div>

                {(product.stock ?? 0) < 10 && (
                    <span className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                        Low Stock
                    </span>
                )}
            </div>
            
            <div className="flex flex-col flex-1 justify-between">
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug mb-2">
                    {product.name}
                </h3>
                <div className="flex justify-between items-end mt-auto">
                    <span className="font-black text-lg" style={{ color: primaryColor }}>
                        {currencySymbol}{price.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};