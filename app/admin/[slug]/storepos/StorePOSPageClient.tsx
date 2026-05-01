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
  UserIcon,
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
import { Company } from '@prisma/client';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://salesmanpro.site/api" ||'http://127.0.0.1:3000/api';//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

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

export type CompanyInfo = Company & {
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
        //
        // Stringify the whole object so Kotlin can parse it easily
        const message = JSON.stringify({
            type: 'PRINT_ESC_POS',
            payload: desktopPayload
        });
        
        (window as any).AndroidBridge.postMessage(message);
        
        // (window as any).AndroidBridge.postMessage({
        //   type: 'PRINT_ESC_POS',
        //   payload: desktopPayload
        // });
    } else  if ((window as any).chrome?.webview) {
    // (window as any).chrome.webview.postMessage({
    //   type: 'PRINT_HTML_RECEIPT',
    //   payload: htmlContent
    // });

    // 1. Map the frontend data to the Desktop's OrderData class
    // const desktopPayload = {
    //   BusinessName: receiptDetails.storeName,
    //   Total: receiptDetails.finalTotal,
    //   PaymentMethod: "Cash", // Or map from your payment logic
    //   Date: receiptDetails.date + " " + receiptDetails.time,
    //   Items: receiptDetails.cart.map((item:any) => ({
    //     Name: item.name,
    //     Quantity: item.quantity,
    //     Price: item.finalPrice ?? 0,
    //     Total: item.subtotal,
    //     Category: (item as any).category || "General", // Match C# OrderItem
    //     Route: (item as any).route || "dispatch"      // Match C# OrderItem
    //   }))
    // };

    // const desktopPayload = {
    //     // Business Identity (Matches C# Properties)
    //     BusinessName: receiptDetails.storeName || "Gourmet Bites Bistro",
    //     BusinessAddress: receiptDetails.storeAddress || "123 Tech Lane, Silicon Valley",
    //     TaxId: receiptDetails.taxId || "VAT-987654321",
    //     PhoneNumber: receiptDetails.storePhone || "+1 (555) 012-3456",

    //     // Transaction Details
    //     InvoiceId: receiptDetails.invoiceId || `INV-${Date.now()}`,
    //     ReceiptNumber: receiptDetails.receiptNumber || `RCP-${Date.now()}`,
    //     CustomerName: receiptDetails.customerName || "Walking Customer",
    //     StaffName: receiptDetails.cashierName || "Alex P.",
    //     Date: `${receiptDetails.date} ${receiptDetails.time}`,

    //     // Financials
    //     Currency: receiptDetails.currency || "USD",
    //     TaxRate: receiptDetails.taxRatePercentage / 100 || 0.10, // Pass as decimal (e.g., 0.10 for 10%)
    //     ChangeGiven: receiptDetails.changeAmount || 0.00,
    //     PaymentMethod: receiptDetails.paymentType || "Cash",

    //     // Items List
    //     Items: receiptDetails.cart.map((item) => ({
    //         Name: item.name,
    //         Quantity: parseInt(item.quantity),
    //         Price: parseFloat(item.finalPrice || item.price || 0),
    //         Discount: parseFloat(item.discountAmount || 0),
    //         Category: item.category || "General",
    //         Route: item.route || "dispatch"
    //     }))
    // };

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

const printReceiptV1 = (htmlContent: string) => {
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
    // const fetchProducts = async () => {
      // console.log(`Fetching products for companyId: ${companyId}`);
      // Simulate API call for products
    //   await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    //   const fetchedProducts: Product[] = [
    //     { id: 'prod-001', name: 'Wireless Headphones XYZ', description: 'Premium noise-cancelling headphones.', price: 199.99, imageUrl: 'https://placehold.co/100x100/A78BFA/ffffff?text=Headphones', stock: 50 },
    //     { id: 'prod-002', name: 'Smartwatch Pro 2.0', description: 'Track your fitness and notifications.', price: 249.00, imageUrl: 'https://placehold.co/100x100/60A5FA/ffffff?text=Smartwatch', stock: 30 },
    //     { id: 'prod-003', name: 'Portable Bluetooth Speaker', description: 'Powerful sound on the go.', price: 79.50, imageUrl: 'https://placehold.co/100x100/34D399/ffffff?text=Speaker', stock: 120 },
    //     { id: 'prod-004', name: '4K UHD Smart TV 55"', description: 'Immersive viewing experience.', price: 799.00, imageUrl: 'https://placehold.co/100x100/F472B6/ffffff?text=SmartTV', stock: 15 },
    //     { id: 'prod-005', name: 'Ergonomic Office Chair', description: 'Comfort and support for long hours.', price: 299.99, imageUrl: 'https://placehold.co/100x100/FBBF24/ffffff?text=Chair', stock: 40 },
    //   ];
    // };

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
          return { ...item, quantity: newQuantity, subtotal: (item.finalPrice || item.sellingPrice || 0) * newQuantity };
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
  if (cart.length === 0) return alert("Cart is empty");
  
  setPaymentStatus(null);
  // console.log("Finalizing sale...");

  // 1. Map frontend cart to backend schema
  const orderPayload = {
    name: "Walk-in Customer", // Or collect from a field
    email: "pos-customer@store.com", // Fallback for POS
    phone: "0000000000",
    consumerId: userId || 'pos-agent',
    companyId: companyId,
    paymentOption: "cod", // POS usually defaults to Cash (cod) or Card
    totalPrice: subtotal,
    totalFinalPrice: finalTotal,
    items: cart.map(item => ({
      marketplaceListingId: item.id,
      quantity: item.quantity,
      price: item.finalPrice ?? 0,
    })),
    paymentData: {
      notes: `POS Sale by ${currentAgent?.name}`,
      discountApplied: totalDiscountAmount
    }
  };

  try {
    const response = await fetch(`/api/shop/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      // credentials: 'include',
      body: JSON.stringify(orderPayload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(`${result.error}` || 'Failed to process order');
    }

    // 2. Handle Payment Redirects (Stripe/Paystack/Paypal)
    if (result.data.authorizationUrl) {
      window.location.href = result.data.authorizationUrl;
      return;
    }

    setPaymentStatus('success');

    // 3. Print Receipt             
    const now = new Date();
    // const receiptDetails: ReceiptDetails = {
    //   cart,
    //   subtotal,
    //   totalDiscountAmount,
    //   totalTax,
    //   finalTotal,
    //   agentId: currentAgent?.id || 'N/A',
    //   agentName: currentAgent?.name || 'N/A',
    //   transactionId: result.data.trackingNumber, // Use tracking number from API
    //   date: now.toLocaleDateString(),
    //   time: now.toLocaleTimeString(),
    //   storeName: companyInfo?.name || 'Your Awesome Store',
    //   storeAddress: companyInfo?.address || '123 Main St',
    //   storePhone: companyInfo?.phone || '',
    //   currencySymbol: currencySymbol,
    // };
    const receiptDetails: ReceiptDetails = {
      // Items & Totals
      cart: cart.map(item => ({
        ...item,
        // Ensure these match the expected calculation: (Price * Qty) - Discount
        finalPrice: (item.finalPrice || item.sellingPrice || item.price || 0), // Fallbacks for price
        subtotal: ((item.finalPrice || item.sellingPrice || item.price || 0) * item.quantity) - (item.discount || 0),
        discountAmount: item.discount || 0,
        category: item.category || "General",
        route: item.route || "dispatch"
      })),
      
      subtotal: subtotal,
      totalDiscountAmount: totalDiscountAmount,
      taxRatePercentage: 10, // Added: Store the numeric rate (e.g., 10 for 10%)
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
      taxId: companyInfo?.taxId || 'VAT-987654321', // Added: Needed for professional receipt
      currencySymbol: currencySymbol,
    };

    const receiptHtml = generateReceiptHtml(receiptDetails);
    printReceipt(receiptHtml, receiptDetails);

    // 4. Cleanup
    setCart([]);
    setDiscountPercentage(0);
    setShowPaymentModal(false);

  } catch (error: any) {
    console.error("Order creation failed:", error);
    setPaymentStatus('failed');
    alert(`Error: ${error}`);
  }
}, [cart, finalTotal, subtotal, totalDiscountAmount, totalTax, companyId, userId, currentAgent, companyInfo, currencySymbol]);

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

        <div className="flex items-center gap-4">
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
                onClick={() => setSelectedCategory(typeof cat === 'string' ? cat : cat.id)}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="group cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 hover:ring-2 hover:ring-indigo-500 transition-all active:scale-95 shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
                  <img
                    src={product.images?.[0] || `https://placehold.co/200x200?text=${product.name}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    alt=""
                  />
                  {(product.stock) < 10 && (
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
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-indigo-500 transition-colors">
                    <PlusIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: CART SYSTEM */}
        <div className="hidden lg:flex lg:col-span-4 flex-col glass-panel rounded-[2rem] overflow-hidden border-none shadow-2xl">
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
                <div key={item.id} className="flex gap-4 group">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                    <img src={item.images?.[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <button onClick={() => handleQuantityChange(item.id, -1)} className="p-1 hover:text-indigo-500">
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, 1)} className="p-1 hover:text-indigo-500">
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-zinc-500">
                        {currencySymbol}{((item.finalPrice || item.sellingPrice || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between text-sm font-medium text-zinc-500">
                <span>Subtotal</span>
                <span>{currencySymbol}{subtotal.toLocaleString()}</span>
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
                Complete Transaction
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 glass-panel border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
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


    </div>
  
  );
};

export default StorePOSPageClient;

