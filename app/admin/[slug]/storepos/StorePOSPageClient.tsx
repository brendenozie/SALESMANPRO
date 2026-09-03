'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  UserCircleIcon,
  UserIcon,
  BanknotesIcon,
  CalendarIcon,
  TagIcon,
  WalletIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { MarketListingForm, IStoreCategory } from '@/types/typings';
import { Company } from '@prisma/client';
import { receiptRenderer } from '@/lib/receipts/receiptRenderer';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://salesmanpro.site/api";

function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
};

// --- Type Definitions ---
export interface VariantOptionItem {
  category: string;
  name: string;
  extraPrice: number;
}

export type CartItem = MarketListingForm & {
  cartItemId: string; // Unique ID combining productId and selected variants
  price: number; // Base price of the product
  finalPrice: number; // Price after adding variant extra costs
  quantity: number;
  subtotal: number; // finalPrice * quantity
  selectedOptions?: VariantOptionItem[]; // Track chosen variants
};

export type Agent = {
  id: string;
  name: string;
  dailySalesCount: number;
  dailySalesValue: number;
};

export type CompanyInfo = Company & {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate?: number; 
};

// --- Receipt Generation Helper ---
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

function useRipple() {
  const containerRef = useRef<HTMLElement | null>(null);

  const createRipple = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const target = containerRef.current || (e.currentTarget as HTMLElement);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const circle = document.createElement('span');

    const clientX = 'touches' in e && e.touches?.length ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches?.length ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const size = Math.max(rect.width, rect.height) * 1.2;
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${x - size / 2}px`;
    circle.style.top = `${y - size / 2}px`;
    circle.className = 'ripple animate-ripple absolute rounded-full opacity-30 pointer-events-none';
    circle.style.background = 'rgba(255,255,255,0.12)';

    target.appendChild(circle);
    setTimeout(() => { circle.remove(); }, 600);
  };

  return { containerRef, createRipple };
}

const InlineStyles = () => (
  <style>{`
    @keyframes ripple {
      from { transform: scale(0); opacity: 0.4; }
      to   { transform: scale(1.8); opacity: 0; }
    }
    .animate-ripple { animation: ripple 600ms cubic-bezier(.22,.9,.35,1) forwards; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.16); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
    .glass-panel { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }
    .dark .glass-panel { background: rgba(24, 24, 27, 0.8); backdrop-filter: blur(10px); }
  `}</style>
);

const generateReceiptHtml = (details: ReceiptDetails): string => {
  const itemsHtml = details.cart.map(item => {
    // Append variants to the receipt name if they exist
    const variantString = item.selectedOptions?.length 
      ? ` (${item.selectedOptions.map(o => o.name).join(', ')})` 
      : '';
    const displayName = `${item.name}${variantString}`;

    return `
    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
      <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</span>
      <span style="width: 40px; text-align: center;">x${item.quantity}</span>
      <span style="width: 80px; text-align: right;">${details.currencySymbol} ${item.finalPrice?.toFixed(2)}</span>
      <span style="width: 100px; text-align: right; font-weight: bold;">${details.currencySymbol} ${item.subtotal.toFixed(2)}</span>
    </div>
  `}).join('');

  return `
    <div style="font-family: 'Inter', sans-serif; width: 300px; margin: 0 auto; padding: 20px; color: #333; background-color: #fff; border: 1px solid #eee;">
      <h2 style="text-align: center; font-size: 24px; margin-bottom: 5px; color: #4F46E5;">${details.storeName}</h2>
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

      <div style="display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; border-top: 2px solid #4F46E5; padding-top: 10px; margin-top: 10px;">
        <span>TOTAL:</span><span>${details.currencySymbol} ${details.finalTotal.toFixed(2)}</span>
      </div>

      <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
      <p style="text-align: center; font-size: 13px; color: #555;">Served by: ${details.agentName}</p>
      <p style="text-align: center; font-size: 16px; font-weight: bold; margin-top: 15px; color: #4F46E5;">THANK YOU!</p>
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
        Items: receiptDetails.cart.map((item: any) => {
          // Append variant detail to C# receipt payload string
          const variantString = item.selectedOptions?.length 
            ? ` (${item.selectedOptions.map((o: any) => o.name).join(', ')})` : '';
          return {
            Name: `${item.name}${variantString}`,
            Quantity: parseInt(item.quantity),
            Price: parseFloat(item.finalPrice || item.price || 0),
            Discount: parseFloat(item.discountAmount || 0),
            Category: item.category || "General",
            Route: item.route || "dispatch"
          };
        })
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
     iframeDoc.write(`
      <!DOCTYPE html>
      <html><head><title>Receipt</title>
      <style>@page { size: 80mm auto; margin: 0; } body { margin: 0; -webkit-print-color-adjust: exact; }</style>
      </head><body>${htmlContent}</body></html>
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
    }
  }
};

interface StorePOSPageClientProps {
  initialProducts?: MarketListingForm[]; 
  initialCategories?: IStoreCategory[]; 
  companyId: string; 
  userName: string; 
  userId: string | null; 
  currentPage: number; 
  totalPages: number; 
}

const StorePOSPageClient: React.FC<StorePOSPageClientProps> = ({ companyId, initialProducts, initialCategories, userName, userId, currentPage, totalPages }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<MarketListingForm[]>(initialProducts || []);
  const [categories, setCategories] = useState<IStoreCategory[]>(initialCategories || []);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  
  // Add these state variables at the top of your POS component
  const [isSplit, setIsSplit] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [etimsConfig, setEtimsConfig] = useState<any>(null);
  const [customerPin, setCustomerPin] = useState('');
  const [lastSaleReceipt, setLastSaleReceipt] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
 
  // persistent category
  const [selectedCategory, setSelectedCategory] = usePersistentState<string>('pos:selectedCategory', 'all');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  
  // Variants Modal State
  const [variantModalProduct, setVariantModalProduct] = useState<MarketListingForm | null>(null);
  // Track selected variants by category. e.g. { "size": { name: "XL", extraPrice: 50 } }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantOptionItem>>({});

  const ripple = useRipple();
  const taxRate = companyInfo?.taxRate ?? 0.00;

  const [currentAgent, setCurrentAgent] = useState<Agent | null>({
    id: 'agent-001',
    name: `${userName}`,
    dailySalesCount: 15,
    dailySalesValue: 1250.75,
  });

  const currencySymbol = useMemo(() => companyInfo?.currency === 'KES' ? 'KSh' : '$', [companyInfo]);

  // Infinite Scroll State
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(page < totalPages);
  const observer = useRef<IntersectionObserver | null>(null);
  
    /* ------------------- Mobile Cart swipe handling ------------------- */
  const mobileCartRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const currentTranslate = useRef<number>(0);

  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prevPage => prevPage + 1);
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
        setProducts(prev => [...prev, ...data.data.results]);
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
        currency: 'KES',
      } as CompanyInfo);
    };
    const fetchEtimsConfig = async () => {
      try {
        const res = await fetch(`/api/admin/etims/config?companyId=${companyId}`);
        if (res.ok) {
          const json = await res.json();
          setEtimsConfig(json.data?.config);
        }
      } catch (e) {
        console.error("Failed to load store eTIMS config:", e);
      }
    };
    fetchAgentInfo();
    fetchCompanyInfo();
    fetchEtimsConfig();
  }, [companyId, userId, userName]);

  // -----------------------------------------------------
  // ADD TO CART LOGIC
  // -----------------------------------------------------
  const handleProductClick = useCallback((product: MarketListingForm) => {
    // Check if product has variants
    if (product.option && product.option.length > 0) {
      setVariantModalProduct(product);
      setSelectedVariants({}); // Reset variants modal state
    } else {
      executeAddToCart(product, []); // No variants, add directly
    }
  }, []);

  const executeAddToCart = useCallback((product: MarketListingForm, options: VariantOptionItem[]) => {
    setCart(prevCart => {
      // 1. Create a unique signature for this cart line-item
      // E.g. "prod123-color:Red|size:XL"
      const optionsSignature = options
        .map(o => `${o.category}:${o.name}`)
        .sort()
        .join('|');
      const cartItemId = `${product.id}-${optionsSignature}`;

      // 2. Calculate dynamic price
      const basePrice = product.finalPrice || product.sellingPrice || 0;
      const extraVariantPrice = options.reduce((sum, opt) => sum + (opt.extraPrice || 0), 0);
      const unitFinalPrice = basePrice + extraVariantPrice;

      // 3. Find if this exact configuration already exists in the cart
      const existingItemIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);

      if (existingItemIndex > -1) {
        // Increment quantity
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        const newQuantity = existingItem.quantity + 1;
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          finalPrice: unitFinalPrice, // Update final price in case variants changed
          subtotal: unitFinalPrice * newQuantity,
        };
        return updatedCart;
      } else {
        // Add new line item
        return [
          ...prevCart,
          {
            ...product,
            cartItemId, 
            quantity: 1,
            price: basePrice,
            finalPrice: unitFinalPrice, // Override final price with variant calculation
            subtotal: unitFinalPrice,
            selectedOptions: options
          },
        ];
      }
    });
    setVariantModalProduct(null); // Close modal if it was open
  }, []);

  const handleQuantityChange = useCallback((cartItemId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity, subtotal: (item.finalPrice || 0) * newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  }, []);

  const handleRemoveFromCart = useCallback((cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  }, []);

  const handleClearCart = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire cart?')) {
      setCart([]);
      setDiscountPercentage(0);
    }
  }, []);

  // --- Cart Math ---
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  const totalDiscountAmount = useMemo(() => (subtotal * discountPercentage) / 100, [subtotal, discountPercentage]);
  const totalTax = useMemo(() => (subtotal - totalDiscountAmount) * taxRate, [subtotal, totalDiscountAmount, taxRate]);
  const finalTotal = useMemo(() => subtotal - totalDiscountAmount + totalTax, [subtotal, totalDiscountAmount, totalTax]);
  
   const [splits, setSplits] = useState<{ method: string; amount: number }[]>([
    { method: 'cash', amount: finalTotal }
  ]);
  
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
  
  // 2. Updated finalizeSale accepts the dynamic payment schema
  const finalizeSale = useCallback(async () => {
    if (cart.length === 0) return alert("Cart is empty");
    
    // Validate split totals match final total
    if (isSplit && !isPending) {
      const totalAllocated = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalAllocated - finalTotal) > 0.01) {
        return alert(`Split total (${totalAllocated}) must equal final total (${finalTotal})`);
      }
    }

    setPaymentStatus(null);

    const orderPayload = {
      name: "Walk-in Customer",
      email: "pos-customer@store.com",
      phone: "0000000000",
      consumerId: userId || 'pos-agent',
      companyId: companyId,
      // Store 'split', 'pending', or the singular choice
      paymentOption: isPending ? "pending" : (isSplit ? "split" : splits[0].method),
      totalPrice: subtotal,
      totalFinalPrice: finalTotal,
      customerPin: customerPin ? customerPin.trim() : undefined,
      terminalId: "T01",
      cashierName: currentAgent?.name || userName || "Cashier",
      items: cart.map(item => ({
        marketplaceListingId: item.id,
        quantity: item.quantity,
        price: item.finalPrice,
        totalPrice: item.finalPrice * item.quantity,
        subtotal: item.subtotal,
        selectedOptions: item.selectedOptions || null,
      })),
      paymentData: {
        notes: `POS Sale by ${currentAgent?.name} ${isPending ? '[CREDIT/PENDING]' : ''}`,
        discountApplied: totalDiscountAmount,
        customerPin: customerPin ? customerPin.trim() : undefined,
        cashierName: currentAgent?.name || userName || "Cashier",
        paymentMethodDetails: isPending ? "PENDING/CREDIT" : (isSplit ? "SPLIT BILL" : splits[0].method.toUpperCase()),
        paymentBreakdown: isPending ? [] : splits,
      }
    };

    try {
      const response = await fetch(`/api/shop/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(`${result.error}` || 'Failed to process order');
      
      setPaymentStatus('success');

      // Unified Dual Receipt Printing (Mode A eTIMS vs Mode B Standard)
      if (result.data?.receipt) {
        setLastSaleReceipt(result.data.receipt);
        setShowSuccessModal(true);

        if (result.data.receipt.html) {
          receiptRenderer.printReceipt(result.data.receipt.html, result.data.receipt.escPos);
        }
      }

      // Reset workflow
      setCart([]);
      setDiscountPercentage(0);
      setCustomerPin('');
      setShowPaymentModal(false);

    } catch (error: any) {
      console.error("Order creation failed:", error);
      setPaymentStatus('failed');
      alert(`Error: ${error}`);
    }
  }, [cart, finalTotal, subtotal, totalDiscountAmount, totalTax, companyId, userId, currentAgent, companyInfo, currencySymbol, isSplit, isPending, splits]);

  const finalizeSalev1 = useCallback(async () => {
    if (cart.length === 0) return alert("Cart is empty");
    setPaymentStatus(null);

    const orderPayload = {
      name: "Walk-in Customer",
      email: "pos-customer@store.com",
      phone: "0000000000",
      consumerId: userId || 'pos-agent',
      companyId: companyId,
      paymentOption: "cod",
      totalPrice: subtotal,
      totalFinalPrice: finalTotal,
      items: cart.map(item => ({
        marketplaceListingId: item.id, // Original base ID for inventory tracking
        quantity: item.quantity,
        price: item.finalPrice,
        totalPrice: item.finalPrice * item.quantity,
        subtotal: item.subtotal,
        // Optional: you can pass the variant data to the backend here if your schema supports it
        selectedOptions: item.selectedOptions || null,
      })),
      paymentData: {
        notes: `POS Sale by ${currentAgent?.name}`,
        discountApplied: totalDiscountAmount
      }
    };

    try {
      const response = await fetch(`/api/shop/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) throw new Error(`${result.error}` || 'Failed to process order');
      if (result.data.authorizationUrl) {
        window.location.href = result.data.authorizationUrl;
        return;
      }

      setPaymentStatus('success');

      const now = new Date();
      const receiptDetails: ReceiptDetails = {
        cart: cart.map(item => ({
          ...item,
          finalPrice: item.finalPrice || 0,
          subtotal: item.subtotal - (item.discount || 0),
          category: item.category || "General",
        })) as CartItem[],
        subtotal: subtotal,
        totalDiscountAmount: totalDiscountAmount,
        totalTax: totalTax,
        finalTotal: finalTotal,
        agentId: currentAgent?.id || 'N/A',
        agentName: currentAgent?.name || 'N/A', 
        transactionId: result.data.trackingNumber, 
        date: now.toISOString().split('T')[0], 
        time: now.toTimeString().split(' ')[0], 
        storeName: companyInfo?.name || 'Store',
        storeAddress: companyInfo?.address || 'Address',
        storePhone: companyInfo?.contactPhone || 'Phone',
        currencySymbol: currencySymbol,
      };

      printReceipt(generateReceiptHtml(receiptDetails), receiptDetails);

      setCart([]);
      setDiscountPercentage(0);
      setShowPaymentModal(false);

    } catch (error: any) {
      console.error("Order creation failed:", error);
      setPaymentStatus('failed');
      alert(`Error: ${error}`);
    }
  }, [cart, finalTotal, subtotal, totalDiscountAmount, totalTax, companyId, userId, currentAgent, companyInfo, currencySymbol]);


// 1. Open the modal first instead of immediately finalizing the sale
const handleProcessPayment = useCallback(() => {
  if (cart.length === 0) return alert('Cart is empty.');
  
  // Reset payment states to current total
  setSplits([{ method: 'cash', amount: finalTotal }]);
  setIsSplit(false);
  setIsPending(false);
  setShowPaymentModal(true);
}, [cart.length, finalTotal]);

  // const handleProcessPayment = useCallback(() => {
  //   if (cart.length === 0) return alert('Cart is empty.');
  //   setShowPaymentModal(true);
  //   finalizeSale(); 
  // }, [cart.length, finalizeSale]);

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Group variants by category for the modal
  const groupedVariants = useMemo(() => {
    if (!variantModalProduct || !variantModalProduct.option) return {};
    return variantModalProduct.option.reduce((acc: any, opt: VariantOptionItem) => {
      if (!acc[opt.category]) acc[opt.category] = [];
      acc[opt.category].push(opt);
      return acc;
    }, {});
  }, [variantModalProduct]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <InlineStyles />

      {/* TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-30 glass-panel h-16 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight hidden md:block">
            Salesman<span className="text-indigo-600">Pro</span>
          </h1>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden sm:block">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search SKU or product name (Ctrl + K)"
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* eTIMS Compliance Status Badge */}
          {etimsConfig?.invoicingRequirement === 'REQUIRED' || etimsConfig?.status === 'ACTIVE' ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold shadow-sm">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
              KRA eTIMS Fiscal POS
            </span>
          ) : etimsConfig?.invoicingRequirement === 'NOT_APPLICABLE' ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-medium">
              <DocumentTextIcon className="w-4 h-4 text-zinc-500" />
              Standard Sales POS
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-medium">
              eTIMS Pending
            </span>
          )}

          <div className="text-right hidden md:block">
            <p className="text-xs font-medium text-zinc-500">Active Agent</p>
            <p className="text-sm font-bold">{userName}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <UserIcon className="h-5 w-5" />
          </div>
        </div>
      </nav>

      <main className="max-w-[1800px] mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-64px)]">
        
        {/* LEFT: PRODUCT CATALOGUE */}
        <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          {/* CATEGORIES */}
          <div className="flex items-center gap-2 overflow-x-auto p-4 custom-scrollbar">
            {['all', ...categories].map((cat: any) => (
              <button
                key={typeof cat === 'string' ? cat : cat.id}
                onClick={() => setSelectedCategory(typeof cat === 'string' ? cat : (cat.categoryId || cat.category.id || cat.id))}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${
                  selectedCategory === (typeof cat === 'string' ? cat : cat.id)
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg shadow-black/10'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
                }`}
              >
                {typeof cat === 'string' ? 'All Products' : cat.displayName}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-24 lg:pb-0">
            {filteredProducts.map((product, index) => {
              if (filteredProducts.length === index + 1) {
                return (
                  <div ref={lastProductElementRef} key={`${product.id}-${index}`}>
                    <ProductCard product={product} handleAddToCart={handleProductClick} currencySymbol={currencySymbol} />
                  </div>
                );
              }
              return <ProductCard key={`${product.id}-${index}`} product={product} handleAddToCart={handleProductClick} currencySymbol={currencySymbol} />;
            })}
            
            {loading && (
              <div className="col-span-full py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CART SYSTEM */}
        <div className="hidden lg:flex lg:col-span-4 flex-col glass-panel rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                Current Order <span className="bg-indigo-600 text-[10px] text-white px-2 py-0.5 rounded-full">{cart.length}</span>
              </h2>
              <button onClick={handleClearCart} className="text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                Reset
              </button>
            </div>

            {/* CART ITEMS */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.cartItemId} className="flex gap-4 group bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                    <img src={item.images?.[0] || `https://placehold.co/100x100`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    
                    {/* Render Selected Variants */}
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                        {item.selectedOptions.map(opt => `${opt.name}`).join(' • ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <button onClick={() => handleQuantityChange(item.cartItemId, -1)} className="p-1 hover:text-indigo-500">
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.cartItemId, 1)} className="p-1 hover:text-indigo-500">
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {currencySymbol}{item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromCart(item.cartItemId)}
                    className="self-start p-1 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-zinc-400 text-sm italic">Cart is empty</p>
                </div>
              )}
            </div>

            {/* Discount Input */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-800">
                <ReceiptPercentIcon className="h-5 w-5 text-zinc-400 mr-2" />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={discountPercentage || ''}
                  onChange={(e) => setDiscountPercentage(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="bg-transparent w-full outline-none text-sm font-bold text-zinc-900 dark:text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* TOTALS */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between text-sm font-medium text-zinc-500">
                <span>Subtotal</span>
                <span>{currencySymbol}{subtotal.toLocaleString()}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-sm font-medium text-pink-500">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>-{currencySymbol}{totalDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium text-zinc-500">
                <span>Tax ({((companyInfo?.taxRate || 0) * 100).toFixed(0)}%)</span>
                <span>{currencySymbol}{totalTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-2xl font-black pt-2">
                <span>Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">{currencySymbol}{finalTotal.toLocaleString()}</span>
              </div>
              
              <button
                onClick={handleProcessPayment}
                disabled={cart.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
              >
                <CreditCardIcon className="h-6 w-6" />
                Checkout
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM BAR (Unchanged largely, updates cart.length to itemCount) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 glass-panel border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between z-40">
        <div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Total Pay</p>
          <p className="text-xl font-black text-indigo-600">{currencySymbol}{finalTotal.toLocaleString()}</p>
        </div>
        <button 
          onClick={() => setShowMobileCart(true)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          Cart ({itemCount})
        </button>
      </div>

      {/* VARIANT SELECTION MODAL */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Select Options</h3>
                <p className="text-sm text-zinc-500">{variantModalProduct.name}</p>
              </div>
              <button onClick={() => setVariantModalProduct(null)} className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {Object.keys(groupedVariants).map((category) => (
                <div key={category}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {groupedVariants[category].map((opt: VariantOptionItem) => {
                      const isSelected = selectedVariants[category]?.name === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => setSelectedVariants({ ...selectedVariants, [category]: opt })}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                              : 'border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                          }`}
                        >
                          {opt.name}
                          {opt.extraPrice > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-500'}`}>
                              +{currencySymbol}{opt.extraPrice}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Modal Price Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-500 text-sm font-medium">Item Total</span>
                <span className="text-xl font-black text-indigo-600">
                  {currencySymbol}{(
                    (variantModalProduct.finalPrice || variantModalProduct.sellingPrice || 0) + 
                    Object.values(selectedVariants).reduce((sum, o) => sum + (o.extraPrice || 0), 0)
                  ).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => executeAddToCart(variantModalProduct, Object.values(selectedVariants))}
                disabled={Object.keys(groupedVariants).length !== Object.keys(selectedVariants).length}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 disabled:text-zinc-500 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
              >
                Add to Order
              </button>
              {Object.keys(groupedVariants).length !== Object.keys(selectedVariants).length && (
                <p className="text-[10px] text-center text-red-400 mt-2">Please select all required options.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* (Mobile Cart Overlay goes here - shortened for brevity, just ensure you map item.cartItemId instead of item.id in the loops) */}
      {/* MOBILE CART OVERLAY */}
      {showMobileCart && (
        <div ref={mobileCartRef} className="fixed inset-0 z-50 flex justify-end bg-zinc-900/60 backdrop-blur-md">
          {/* Cart Sidebar / Modal Content */}
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-900">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Your Cart</h2>
                <p className="text-xs text-zinc-500 font-medium">{cart.length} Items Selected</p>
              </div>
              <button 
                onClick={() => setShowMobileCart(false)} 
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex gap-5 group">
                  {/* Image Wrapper */}
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
                    <img src={item.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                  </div>

                  <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-1">{item.name}</p>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {currencySymbol}{((item.finalPrice || item.sellingPrice)).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      {/* Refined Quantity Stepper */}
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 px-2 gap-3">
                        <button 
                          onClick={() => handleQuantityChange(item.id, -1)} 
                          className="p-1 text-zinc-500 hover:text-indigo-600 transition-colors"
                        >
                          <MinusIcon className="h-4 w-4 stroke-[3px]" />
                        </button>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, 1)} 
                          className="p-1 text-zinc-500 hover:text-indigo-600 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 stroke-[3px]" />
                        </button>
                      </div>
                      
                      <span className="text-base font-black text-zinc-900 dark:text-white">
                        {currencySymbol}{((item.finalPrice || item.sellingPrice) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Summary */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-900">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-zinc-900 dark:text-white font-bold">Total Amount</span>
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-500 tracking-tighter">
                    {currencySymbol}{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => { setShowMobileCart(false); handleProcessPayment(); }}
                disabled={cart.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <CreditCardIcon className="h-6 w-6" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Process POS Payment</h3>
                    <p className="text-sm text-zinc-500 mt-0.5">Total Amount due: <span className="font-semibold text-indigo-600">{currencySymbol} {finalTotal.toFixed(2)}</span></p>
                  </div>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Mode Selectors */}
                <div className="grid grid-cols-3 gap-3 my-5">
                  <button
                    type="button"
                    onClick={() => { setIsSplit(false); setIsPending(false); setSplits([{ method: 'cash', amount: finalTotal }]); }}
                    className={`p-3 rounded-xl border font-medium text-sm transition flex flex-col items-center gap-1.5 ${!isSplit && !isPending ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30' : 'border-zinc-200 dark:border-zinc-800'}`}
                  >
                    <BanknotesIcon className="w-5 h-5" />
                    Single Method
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsSplit(true); setIsPending(false); setSplits([{ method: 'cash', amount: finalTotal / 2 }, { method: 'mpesa', amount: finalTotal / 2 }]); }}
                    className={`p-3 rounded-xl border font-medium text-sm transition flex flex-col items-center gap-1.5 ${isSplit && !isPending ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30' : 'border-zinc-200 dark:border-zinc-800'}`}
                  >
                    <WalletIcon className="w-5 h-5" />
                    Split Bill
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsPending(true); setIsSplit(false); }}
                    className={`p-3 rounded-xl border font-medium text-sm transition flex flex-col items-center gap-1.5 ${isPending ? 'border-amber-600 bg-amber-50/50 text-amber-700 dark:bg-amber-950/30' : 'border-zinc-200 dark:border-zinc-800'}`}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    Pending / Credit
                  </button>
                </div>

                {/* Main Dynamic Panel */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {isPending ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl">
                      <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                        This order will be registered under processing status without active payment confirmation ledger entry. Excellent for ongoing commercial invoice structures.
                      </p>
                    </div>
                  ) : !isSplit ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Select Payment Gateway Option</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'cash', label: 'Cash payment', icon: BanknotesIcon },
                          { id: 'mpesa', label: 'M-Pesa STK', icon: TagIcon },
                          { id: 'stripe', label: 'Card Reader / Stripe', icon: CreditCardIcon },
                          { id: 'ghuba', label: 'Ghuba Pay Wallet', icon: WalletIcon }
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSplits([{ method: m.id, amount: finalTotal }])}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${splits[0]?.method === m.id ? 'border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800 font-semibold' : 'border-zinc-200 dark:border-zinc-800'}`}
                          >
                            <m.icon className="w-5 h-5 text-zinc-500" />
                            <span className="text-sm">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Configure Multi-Split Breakdowns</label>
                        <button 
                          type="button" 
                          onClick={() => setSplits([...splits, { method: 'cash', amount: 0 }])}
                          className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline"
                        >
                          <PlusIcon className="w-3.5 h-3.5" /> Add Row
                        </button>
                      </div>
                      
                      {splits.map((split, idx) => (
                        <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-100">
                          <select
                            value={split.method}
                            onChange={(e) => {
                              const next = [...splits];
                              next[idx].method = e.target.value;
                              setSplits(next);
                            }}
                            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm flex-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            <option value="cash">Cash</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="stripe">Credit Card</option>
                            <option value="ghuba">Ghuba Pay</option>
                          </select>

                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium">{currencySymbol}</span>
                            <input
                              type="number"
                              step="any"
                              value={split.amount || ''}
                              onChange={(e) => {
                                const next = [...splits];
                                next[idx].amount = parseFloat(e.target.value) || 0;
                                setSplits(next);
                              }}
                              placeholder="0.00"
                              className="w-full p-2.5 pl-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-1 focus:ring-indigo-500 outline-none font-semibold"
                            />
                          </div>

                          {splits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSplits(splits.filter((_, i) => i !== idx))}
                              className="p-2.5 text-zinc-400 hover:text-red-500 rounded-xl transition"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {/* Split Balance Tracker */}
                      <div className="pt-2 flex justify-between text-xs font-semibold">
                        <span className="text-zinc-500">Total Allocated: {splits.reduce((s, x) => s + x.amount, 0).toFixed(2)}</span>
                        <span className={Math.abs(splits.reduce((s, x) => s + x.amount, 0) - finalTotal) < 0.01 ? 'text-green-600' : 'text-red-500'}>
                          Remaining: {(finalTotal - splits.reduce((s, x) => s + x.amount, 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* B2B / Customer Tax PIN */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Customer KRA PIN (Optional — for VAT Tax Invoice)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. P051234567Z"
                    maxLength={11}
                    value={customerPin}
                    onChange={(e) => setCustomerPin(e.target.value.toUpperCase())}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-1 focus:ring-indigo-500 font-mono uppercase tracking-wider"
                  />
                  {etimsConfig?.invoicingRequirement === 'REQUIRED' && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <ShieldCheckIcon className="w-3.5 h-3.5" /> Authoritative KRA eTIMS transmission enabled.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-98 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={finalizeSale}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 active:scale-98 transition"
                  >
                    Confirm & Complete
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* POST-SALE SUCCESS & FISCAL CONFIRMATION MODAL */}
          {showSuccessModal && lastSaleReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-center animate-in zoom-in-95 duration-150">
                {lastSaleReceipt.mode === 'ETIMS' ? (
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="w-9 h-9" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-9 h-9" />
                  </div>
                )}

                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                  {lastSaleReceipt.mode === 'ETIMS' ? 'eTIMS Fiscal Sale Confirmed' : 'Sale Completed'}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Receipt #{lastSaleReceipt.details?.trackingNumber}
                </p>

                {lastSaleReceipt.mode === 'ETIMS' && lastSaleReceipt.details?.controlCode && (
                  <div className="my-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left text-xs font-mono space-y-2">
                    <div>
                      <span className="text-zinc-400 font-sans text-[10px] uppercase font-bold block">KRA SCU Control Code:</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-wider">{lastSaleReceipt.details.controlCode}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
                      <div>
                        <span className="text-zinc-400 font-sans text-[10px] uppercase font-bold block">Fiscal Invoice:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{lastSaleReceipt.details.invoiceNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-400 font-sans text-[10px] uppercase font-bold block">Taxpayer PIN:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{lastSaleReceipt.details.kraPin || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      const reprintData = {
                        ...lastSaleReceipt.details,
                        isReprint: true,
                        reprintedAt: new Date().toLocaleString(),
                      };
                      const reprintHtml = receiptRenderer.renderHtml(reprintData, lastSaleReceipt.mode);
                      const reprintEscPos = receiptRenderer.renderEscPos(reprintData, lastSaleReceipt.mode);
                      receiptRenderer.printReceipt(reprintHtml, reprintEscPos);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-98"
                  >
                    Reprint Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition active:scale-98"
                  >
                    New Sale
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default StorePOSPageClient;

const ProductCard = ({ product, handleAddToCart, currencySymbol }: { product: MarketListingForm; handleAddToCart: (product: MarketListingForm) => void; currencySymbol: string }) => {
  const hasVariants = product.option && product.option.length > 0;
  
  return (
    <div
      key={product.id}
      onClick={() => handleAddToCart(product)}
      className="group cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 hover:ring-2 hover:ring-indigo-500 transition-all active:scale-95 shadow-sm relative"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3 bg-zinc-100 dark:bg-zinc-800">
        <img
          src={product.images?.[0] || `https://placehold.co/200x200?text=${product.name}`}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          alt=""
        />
        {(product.quantity) < 10 && (
          <span className="absolute top-2 left-2 bg-amber-500 text-[10px] font-bold text-white px-2 py-1 rounded-md uppercase">
            Low Stock
          </span>
        )}
      </div>
      <h3 className="font-bold text-sm truncate">{product.name}</h3>
      <div className="flex justify-between items-center mt-2">
        <span className="text-indigo-600 dark:text-indigo-400 font-black">
          {currencySymbol}{(product.finalPrice || product.sellingPrice || 0).toLocaleString()}
        </span>
        <div className={`p-1.5 rounded-lg transition-colors ${hasVariants ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-500'}`}>
          <PlusIcon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};