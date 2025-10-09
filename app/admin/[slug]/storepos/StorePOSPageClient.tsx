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
  CheckCircleIcon,
  PrinterIcon,
  ClipboardDocumentCheckIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/components/Modal'; // Assuming you have a reusable Modal component

// --- Chart.js Imports (if needed, not directly used in the POS core logic here but kept for completeness) ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { MarketListingForm, IStoreCategory } from '@/types/typings';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


/** usePersistentState - uses sessionStorage (session-lifetime) */
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Type Definitions (aligned with frontend needs, will be populated from API) ---
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  // Add other relevant fields from schema if needed for display, e.g., brand, category
};

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

export type CompanyInfo = {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate?: number; // Optional, default to 0.08 if not provided
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
  currencySymbol: string; // Added for dynamic currency display
};

/** useRipple - material-like ripple effect for clickable elements */
function useRipple() {
  const containerRef = useRef<HTMLElement | null>(null);

  const createRipple = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const target = containerRef.current || (e.currentTarget as HTMLElement);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const circle = document.createElement('span');

    // coordinates
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
    setTimeout(() => {
      circle.remove();
    }, 600);
  };

  return { containerRef, createRipple };
}

/* ---------------------- Small CSS-in-JSX for keyframes & scrollbar (kept inside file) ---------------------- */
const InlineStyles = () => (
  <style>{`
    @keyframes ripple {
      from { transform: scale(0); opacity: 0.4; }
      to   { transform: scale(1.8); opacity: 0; }
    }
    .animate-ripple { animation: ripple 600ms cubic-bezier(.22,.9,.35,1) forwards; }
    @keyframes slow-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    .animate-spin-slow { animation: slow-spin 3s linear infinite; }

    /* micro bounce */
    @keyframes tiny-bounce { 0% { transform: translateY(0) } 50% { transform: translateY(-4px) } 100% { transform: translateY(0) } }
    .animate-bounce-slow { animation: tiny-bounce 1.6s ease-in-out infinite; }

    /* skeleton shimmer */
    .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
    @keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }

    /* nice thin scrollbar for webkit */
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(148,0,211,0.16); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }

    /* utility for glass look */
    .glass { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.03); backdrop-filter: blur(6px); }
  `}</style>
);


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
const printReceipt = (htmlContent: string) => {
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


// --- Main POS Component ---
// Props for initial data and company ID, passed from the server-side Page.tsx
interface StorePOSPageClientProps {
  initialProducts?: MarketListingForm[]; // If you pre-fetch on the server
  initialCategories?: IStoreCategory[]; // If you pre-fetch on the server
  companyId: string; // The company ID is essential for fetching relevant data
  userName: string; // Current user's name for display
  userId: string | null; // Current user's ID for potential use
}

const StorePOSPageClient: React.FC<StorePOSPageClientProps> = ({ companyId, initialProducts, initialCategories, userName, userId }) => {
  // --- State Variables (now initialized as empty, will be populated by API calls) ---
  const [products, setProducts] = useState<MarketListingForm[]>(initialProducts || []);
  const [categories, setCategories] = useState<IStoreCategory[]>(initialCategories || []);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  // persistent category (session)
  const [selectedCategory, setSelectedCategory] = usePersistentState<string>('pos:selectedCategory', 'all');

  const ripple = useRipple();

  // State for Agent and Company Info
  const [currentAgent, setCurrentAgent] = useState<Agent | null>({
    id: 'agent-001',
    name: `${userName}`,
    dailySalesCount: 15,
    dailySalesValue: 1250.75,
  });
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const currencySymbol = useMemo(() => companyInfo?.currency === 'KES' ? 'KSh' : '$', [companyInfo]);

    /* ------------------- Mobile Cart swipe handling ------------------- */
  const mobileCartRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const currentTranslate = useRef<number>(0);

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


  // --- useEffect to fetch data on component mount ---
  useEffect(() => {
    // 1. Fetch Products
    const fetchProducts = async () => {
      console.log(`Fetching products for companyId: ${companyId}`);
      // Simulate API call for products
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const fetchedProducts: Product[] = [
        { id: 'prod-001', name: 'Wireless Headphones XYZ', description: 'Premium noise-cancelling headphones.', price: 199.99, imageUrl: 'https://placehold.co/100x100/A78BFA/ffffff?text=Headphones', stock: 50 },
        { id: 'prod-002', name: 'Smartwatch Pro 2.0', description: 'Track your fitness and notifications.', price: 249.00, imageUrl: 'https://placehold.co/100x100/60A5FA/ffffff?text=Smartwatch', stock: 30 },
        { id: 'prod-003', name: 'Portable Bluetooth Speaker', description: 'Powerful sound on the go.', price: 79.50, imageUrl: 'https://placehold.co/100x100/34D399/ffffff?text=Speaker', stock: 120 },
        { id: 'prod-004', name: '4K UHD Smart TV 55"', description: 'Immersive viewing experience.', price: 799.00, imageUrl: 'https://placehold.co/100x100/F472B6/ffffff?text=SmartTV', stock: 15 },
        { id: 'prod-005', name: 'Ergonomic Office Chair', description: 'Comfort and support for long hours.', price: 299.99, imageUrl: 'https://placehold.co/100x100/FBBF24/ffffff?text=Chair', stock: 40 },
      ];
      // setProducts(fetchedProducts);
      // In a real app:
      // try {
      //   const response = await fetch(`${apiBaseUrl}/products?companyId=${companyId}`);
      //   if (!response.ok) throw new Error('Failed to fetch products');
      //   const data = await response.json();
      //   setProducts(data);
      // } catch (error) {
      //   console.error("Error fetching products:", error);
      //   // Fallback to empty or previous state, or show error message
      //   setProducts([]);
      // }
    };

    // 2. Fetch Agent Info (assuming a current user/agent context)
    const fetchAgentInfo = async () => {
      console.log("Fetching current agent info");
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      const fetchedAgent: Agent = {
        id: userId || 'agent-001',
        name: userName || 'Alice Smith',
        dailySalesCount: 15,
        dailySalesValue: 1250.75,
      };
      setCurrentAgent(fetchedAgent);
      // In a real app:
      // try {
      //   // Assuming an endpoint like /api/auth/me or /api/users/{currentUserId}
      //   const response = await fetch(`${apiBaseUrl}/users/current`); // Or get current user ID from auth context
      //   if (!response.ok) throw new Error('Failed to fetch agent info');
      //   const data = await response.json();
      //   setCurrentAgent(data);
      // } catch (error) {
      //   console.error("Error fetching agent info:", error);
      //   setCurrentAgent(null);
      // }
    };

    // 3. Fetch Company Info
    const fetchCompanyInfo = async () => {
      console.log(`Fetching company info for companyId: ${companyId}`);
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
      const fetchedCompany: CompanyInfo = {
        name: 'Your Awesome Store',
        address: '123 Main St, Nairobi, Kenya',
        phone: '+254 7XX XXX XXX',
        currency: 'KES', // Default from schema, or fetched
      };
      setCompanyInfo(fetchedCompany);
      // In a real app:
      // try {
      //   const response = await fetch(`${apiBaseUrl}/companies/${companyId}`);
      //   if (!response.ok) throw new Error('Failed to fetch company info');
      //   const data = await response.json();
      //   setCompanyInfo(data);
      // } catch (error) {
      //   console.error("Error fetching company info:", error);
      //   setCompanyInfo(null);
      // }
    };

    fetchProducts();
    fetchAgentInfo();
    fetchCompanyInfo();
  }, [companyId]); // Dependency array: re-run if companyId changes


  // --- Cart Actions ---
  // const handleAddToCart = useCallback((product: MarketListingForm) => {
  //   setCart(prevCart => {
  //     const existingItem = prevCart.find(item => item.id === product.id);
  //     if (existingItem) {
  //       const newQuantity = existingItem.quantity + 1;
  //       // if (newQuantity > product.stock) {
  //       //   alert(`Cannot add more than available stock (${product.stock}) for ${product.name}`);
  //       //   return prevCart;
  //       // }
  //       return prevCart.map(item =>
  //         item.id === product.id
  //           ? { ...item, quantity: newQuantity, subtotal: (product.finalPrice ?? 0) * newQuantity }
  //           : item
  //       );
  //     } else {
  //       // if (1 > product.stock) {
  //       //   alert(`Cannot add ${product.name} as it's out of stock.`);
  //       //   return prevCart;
  //       // }
  //       return [...prevCart, { ...product, quantity: 1, subtotal: product.finalPrice }];
  //     }
  //   });
  // }, []);
  const handleAddToCart = useCallback((product: MarketListingForm) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        return prevCart.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: (product.finalPrice ?? 0) * newQuantity, // ✅ always number
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            ...product,
            quantity: 1,
            subtotal: product.finalPrice ?? 0, // ✅ always number
          },
        ];
      }
    });
  }, []);


  const handleQuantityChange = useCallback((itemId: string, delta: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          // if (newQuantity > item.stock) {
          //   alert(`Cannot add more than available stock (${item.stock}) for ${item.name}`);
          //   return item;
          // }
          return { ...item, quantity: newQuantity, subtotal: (item.finalPrice ?? 0) * newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
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

  

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const totalDiscountAmount = useMemo(() => {
    return (subtotal * discountPercentage) / 100;
  }, [subtotal, discountPercentage]);

  // const totalTax = useMemo(() => {
  //   // Example: 8% tax on subtotal after discount
  //   const taxableAmount = subtotal - totalDiscountAmount;
  //   return taxableAmount * 0.08;
  // }, [subtotal, totalDiscountAmount]);

  const totalTax = useMemo(() => {
    const taxRate = companyInfo?.taxRate ?? 0.08;
    const taxable = subtotal - totalDiscountAmount;
    return taxable * taxRate;
  }, [subtotal, totalDiscountAmount, companyInfo]);

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
  
  const finalTotal = useMemo(() => subtotal - totalDiscountAmount + totalTax, [subtotal, totalDiscountAmount, totalTax]);
  

  const finalizeSale = useCallback(async () => {
    setPaymentStatus(null); // Reset status
    console.log("Finalizing sale...");

    // Prepare payload for the /api/customer-orders API
    const orderPayload = {
      userId: currentAgent?.id, // Get current agent's ID
      companyId: companyId,
      totalAmount: finalTotal,
      discountAmount: totalDiscountAmount,
      taxAmount: totalTax,
      paymentDetails: {
        amount: finalTotal,
        status: 'COMPLETED', // Assuming immediate completion for this simulation
        transactionId: `TXN-${Date.now()}`, // Generate unique ID
      },
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        priceAtSale: item.finalPrice,
        subtotal: item.subtotal,
      })),
    };

    // Simulate API call to /api/customer-orders
    try {
      // In a real app:
      // const response = await fetch(`${apiBaseUrl}/customer-orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderPayload),
      // });
      // if (!response.ok) throw new Error('Failed to process order');
      // const result = await response.json(); // May contain transaction ID or order ID

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      const success = Math.random() > 0.1; // 90% success rate for simulation
      if (success) {
        setPaymentStatus('success');

        // --- Receipt Printing (uses dynamic company and agent info) ---
        const now = new Date();
        const receiptDetails: ReceiptDetails = {
          cart,
          subtotal,
          totalDiscountAmount,
          totalTax,
          finalTotal,
          agentId: currentAgent?.id || 'N/A',
          agentName: currentAgent?.name || 'N/A',
          transactionId: orderPayload.paymentDetails.transactionId,
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          storeName: companyInfo?.name || 'Your Awesome Store',
          storeAddress: companyInfo?.address || '123 Main St, City, Country',
          storePhone: companyInfo?.phone || '+1 (555) 123-4567',
          currencySymbol: currencySymbol,
        };
        const receiptHtml = generateReceiptHtml(receiptDetails);
        printReceipt(receiptHtml);
        // --- End Receipt Printing ---

        // Clear cart and reset discount
        setCart([]);
        setDiscountPercentage(0);

        // Simulate stock update on the frontend (real app would rely on backend confirmation)
        setProducts(prevProducts =>
          prevProducts.map(p => {
            const soldItem = cart.find(ci => ci.id === p.id);
            // if (soldItem) {
            //   return { ...p, stock: p.stock - soldItem.quantity };
            // }
            return p;
          })
        );
        // Potentially update agent's displayed sales metrics if they are stateful on frontend
        // setCurrentAgent(prev => prev ? { ...prev, dailySalesCount: prev.dailySalesCount + 1, dailySalesValue: prev.dailySalesValue + finalTotal } : null);

      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error("Error during sale finalization:", error);
      setPaymentStatus('failed');
    } finally {
      setShowPaymentModal(false);
      setShowConfirmationModal(true); // Show confirmation of success/failure
    }
  }, [cart, subtotal, totalDiscountAmount, totalTax, finalTotal, currentAgent, companyId, companyInfo, currencySymbol]);

  const handleProcessPayment = useCallback(() => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items before processing payment.');
      return;
    }
    setShowPaymentModal(true);
    finalizeSale(); // Call finalizeSale directly when showing payment modal
  }, [cart.length, finalizeSale]);

  
  /* ------------------- small helpers ------------------- */
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  /* ------------------- Render pieces ------------------- */

  // Cart Summary used in both desktop and mobile overlay
  const CartSummary = (
    <div className="lg:col-span-1 bg-gray-800 glass p-6 rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-purple-300 flex items-center">
          <ShoppingCartIcon className="h-8 w-8 mr-3 text-purple-400" /> Cart ({cart.length})
        </h2>
        <button
          onClick={handleClearCart}
          className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
          disabled={cart.length === 0}
        >
          Clear
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-gray-400 text-lg">
          <p className="text-center">Your cart is empty. Add products to begin.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-800 scrollbar-track-gray-900 mb-6">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-xl shadow-lg mb-3 border border-gray-600 transition-all duration-300 hover:bg-gray-600">
              <div className="flex items-center flex-grow">
                <img
                  src={(item.images && item.images[0]) || `https://placehold.co/50x50/4B5563/ffffff?text=Img`}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg object-cover mr-4 ring-2 ring-purple-500/50"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://placehold.co/50x50/4B5563/ffffff?text=Img`; }}
                />
                <div className="flex-grow min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">{item.name}</h3>
                  <p className="text-sm font-mono text-green-400">{currencySymbol} {(item.finalPrice ?? 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  className="bg-purple-800 text-white p-1 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
                  aria-label={`Decrease quantity of ${item.name}`}
                  disabled={item.quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="text-lg font-extrabold text-white w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, 1)}
                  className="bg-purple-800 text-white p-1 rounded-full hover:bg-purple-700 transition-colors"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="text-red-400 hover:text-red-300 ml-2 p-1 rounded-full hover:bg-gray-600"
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
      <div className="mb-4 p-4 bg-gray-700 rounded-xl shadow-inner border border-gray-600">
        <label htmlFor="discount" className="block text-pink-400 text-sm font-bold mb-2 flex items-center">
          <ReceiptPercentIcon className="h-5 w-5 mr-2" /> Discount (%)
        </label>
        <input
          type="number"
          id="discount"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
          className="w-full p-3 rounded-lg bg-gray-600 border border-gray-500 text-white font-mono text-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          min={0}
          max={100}
          step={1}
          aria-label="Discount percentage"
        />
        <p className="text-xs text-gray-400 mt-1">Saves: <span className="text-pink-400 font-bold">{currencySymbol} {totalDiscountAmount.toFixed(2)}</span></p>
      </div>

      {/* Order Summary */}
      <div className="space-y-3 mb-6 border-t border-gray-700 pt-4">
        <div className="flex justify-between text-lg">
          <span className="text-gray-300">Subtotal:</span>
          <span className="font-semibold text-white">{currencySymbol} {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-gray-300">Discount:</span>
          <span className="font-semibold text-pink-400">- {currencySymbol} {totalDiscountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-gray-300">Tax ({((companyInfo?.taxRate || 0.08) * 100).toFixed(0)}%):</span>
          <span className="font-semibold text-white">{currencySymbol} {totalTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-4xl font-extrabold border-t-2 border-green-500 pt-4 mt-4">
          <span className="text-purple-300">TOTAL:</span>
          <span className="text-green-400">{currencySymbol} {finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Agent Info & Checkout Button */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        {currentAgent ? (
          <div className="bg-gray-700 p-3 rounded-xl shadow-inner flex items-center mb-4 border border-gray-600">
            <UserCircleIcon className="h-7 w-7 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Agent: <span className="text-white font-semibold">{currentAgent.name}</span></p>
              <p className="text-xs text-gray-500">Sales: {currentAgent.dailySalesCount} | {currencySymbol} {currentAgent.dailySalesValue.toFixed(2)}</p>
            </div>
          </div>
        ) : null}
        <button
          onClick={(e) => { ripple.createRipple(e); handleProcessPayment(); }}
          ref={ripple.containerRef as any}
          className="w-full relative overflow-hidden bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl text-2xl font-bold shadow-2xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cart.length === 0 || !currentAgent || !companyInfo}
        >
          <CreditCardIcon className="h-7 w-7 mr-3" /> Pay Now
        </button>
      </div>
    </div>
  );

  
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

          {/* Category Pills */}
          <div className="flex space-x-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`snap-start flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedCategory === 'all' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/40 scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              All Products
            </button>
            {categories.map((cat) => {
              const id = (cat as any).categoryId || (cat as any).id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`snap-start flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedCategory === id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {cat.displayName}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {products.length === 0 && !searchTerm ? (
              <div className="col-span-full text-center py-10 text-gray-400 text-xl">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-400 text-xl">
                No products found matching your search.
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-gray-700 max-h-80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex flex-col overflow-hidden border border-gray-600"
                >
                  <img
                    src={product.images && product?.images?.length > 0 ? product.images[0] : `https://placehold.co/100x100/4B5563/ffffff?text=${product && product?.name || 'No+Image'}` }
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-t-xl border-b border-gray-600"
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/4B5563/ffffff?text=${product && product?.name || 'No+Image'}`; }}
                  />
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-purple-300 mb-1 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex justify-between items-end mt-auto">
                      <div>
                        <p className="text-lg font-bold text-green-400">{currencySymbol} {product.finalPrice?.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Stock: - </p> 
                          {/* {product.stock}*/}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-purple-600 text-white p-3 rounded-full shadow-md hover:bg-purple-700 transition-all duration-200 transform hover:scale-110"
                        aria-label={`Add ${product.name} to cart`}
                        // disabled={product.stock <= 0}
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
        
        <div className="hidden lg:block">{CartSummary}</div>

      </div>


      {/* Mobile floating cart button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
              <button
                onClick={() => setShowMobileCart(true)}
                className={`relative bg-gradient-to-r from-pink-500 to-red-500 text-white p-5 rounded-full shadow-2xl transition-transform duration-300 transform ${itemCount > 0 ? 'animate-bounce-slow' : ''}`}
                aria-label="Open cart"
                onMouseDown={(e) => ripple.createRipple(e as any)}
                ref={ripple.containerRef as any}
              >
                <ShoppingCartIcon className="h-7 w-7" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-xs font-bold px-2 py-1 rounded-full ring-2 ring-gray-900">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
      
            {/* Mobile full-screen cart overlay */}
            <div
              className={`fixed inset-0 z-[60] transform transition-transform duration-500 ease-in-out lg:hidden ${showMobileCart ? 'translate-x-0' : 'translate-x-full'} bg-gray-900/95 backdrop-blur-sm p-4 overflow-y-auto`}
              aria-hidden={!showMobileCart}
            >
              <div ref={mobileCartRef} className="max-w-[900px] mx-auto h-full">
                <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4 sticky top-0 bg-gray-900 z-10">
                  <button
                    onClick={() => setShowMobileCart(false)}
                    className="text-white p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    aria-label="Close cart"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <h2 className="text-3xl font-bold text-purple-300 flex items-center">
                    <ShoppingCartIcon className="h-8 w-8 mr-3 text-purple-400" /> Checkout
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-400 hover:text-red-300 transition-colors text-base font-medium"
                    disabled={cart.length === 0}
                  >
                    Clear
                  </button>
                </div>
      
                <div className="h-[calc(100vh-6rem)]">
                  {CartSummary}
                </div>
              </div>
            </div>

      {/* Confirmation Modal */}
      <Modal title="Confirm Payment" isOpen={showConfirmationModal} onClose={() => setShowConfirmationModal(false)}>
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
      <Modal title="Processing Payment" isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center">
          <CreditCardIcon className="h-20 w-20 text-indigo-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-indigo-400 mb-4">Processing Payment...</h2>
          <p className="text-lg text-gray-300 mb-7">Please wait while your transaction is being finalized.</p>
          <button
            onClick={finalizeSale}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center"
            disabled={true}
          >
            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" /> Finalizing...
          </button>
        </div>
      </Modal>

      

    </div>
  );
};

export default StorePOSPageClient;

