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
    EnvelopeIcon,
    UserGroupIcon,
    ClipboardDocumentIcon,
    SparklesIcon,
    BanknotesIcon,
    CreditCardIcon,
    CheckIcon,
    TagIcon,
    WalletIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { IStoreCategory, MarketListingForm } from '@/types/typings';
import type { Company } from '@prisma/client';
import POSOperatorModal from '@/components/pos/POSOperatorModal';
import POSSessionHeader from '@/components/pos/POSSessionHeader';
import POSCustomerSelector from '@/components/pos/POSCustomerSelector';
import POSHeldOrdersModal from '@/components/pos/POSHeldOrdersModal';
import type { POSCustomerRecord as POSCustomer, POSOperatorInfo as POSOperator, POSSessionInfo as POSSession, POSHeldOrder } from '@/types/pos';

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
export interface VariantOptionItem {
  category: string;
  name: string;
  extraPrice: number;
}

export type CartItem = MarketListingForm & {
  cartItemId: string; 
  price: number; 
  finalPrice: number; 
  quantity: number;
  subtotal: number; 
  selectedOptions?: VariantOptionItem[]; 
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
  paymentMethod: string;
  amountReceived?: number;
  changeDue?: number;
  transactionReference?: string;
  agentId: string;
  agentName: string;
  transactionId: string;
  date: string;
  time: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  currencySymbol: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  appointment?: {
    date: string;
    timeSlot: string;
    staffName: string;
    notes?: string;
  } | null;
}

export type CompanyInfo = Company & {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate?: number; 
};

// const AVAILABLE_STAFF = [
    // { id: 'staff-1', name: 'Alex Mwangi', role: 'Senior Specialist' },
    // { id: 'staff-2', name: 'Sarah Amina', role: 'Technical Expert' },
    // { id: 'staff-3', name: 'David Ochieng', role: 'Consultant' },
// ];

const AdminServicePOSClient: React.FC<{
    initialProducts?: MarketListingForm[];
    initialCategories?: IStoreCategory[];
    initialCompanyInfo?: {
      name: string;
      address: string;
      phone: string;
      currency: string;
      taxRate?: number;
    };
    initialStaff?: {
      id: string;
      name: string;
      role: string;
    }[];
    companyId: string;
    userName: string;
    userId: string | null;
    currentPage: number;
    totalPages: number;
}> = ({ companyId, initialProducts, initialCategories, initialCompanyInfo, initialStaff, userName, userId, currentPage, totalPages }) => {
    
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(initialCompanyInfo as any || null);
    const availableStaff = useMemo(() => {
        if (initialStaff && initialStaff.length > 0) return initialStaff;
        return [{ id: userId || 'staff-1', name: userName, role: 'Lead Specialist' }];
    }, [initialStaff, userId, userName]);

    // --- Core Service States ---
    const [bookingMode, setBookingMode] = useState<'instant' | 'scheduled'>('instant');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = usePersistentState<string>('service-pos:selectedCategory', 'all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discountPercent, setDiscountPercent] = useState(0);
    
    // Client & session details
    const [clientDetails, setClientDetails] = useState({ name: '', email: '', phone: '' });
    const [currentCustomer, setCurrentCustomer] = useState<POSCustomer | null>(null);
    const [serviceNotes, setServiceNotes] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState('');
    
    // POS Session & Operator States
    const [operator, setOperator] = useState<POSOperator | null>(null);
    const [posSession, setPosSession] = useState<POSSession | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(true);

    // Check for active POS session on load
    useEffect(() => {
        let isMounted = true;
        const checkActiveSession = async () => {
            try {
                const res = await fetch(`/api/pos/session?companyId=${companyId}&terminalId=T01`);
                if (res.ok) {
                    const data = await res.json();
                    const sessionData = data.data || data.session;
                    if (sessionData && isMounted) {
                        setPosSession(sessionData);
                        if (sessionData.operator) {
                            setOperator(sessionData.operator);
                            setShowAuthModal(false);
                            return;
                        }
                    }
                }
                if (isMounted) {
                    setShowAuthModal(true);
                }
            } catch (err) {
                console.error("Failed to fetch active POS session:", err);
                if (isMounted) {
                    setShowAuthModal(true);
                }
            }
        };
        checkActiveSession();
        return () => { isMounted = false; };
    }, [companyId]);

    const handleOperatorAuthenticated = (data: { operator: POSOperator; posSession: POSSession }) => {
        setOperator(data.operator);
        setPosSession(data.posSession);
        setShowAuthModal(false);
    };

    const handleSessionEnded = () => {
        setOperator(null);
        setPosSession(null);
        setCurrentCustomer(null);
        setClientDetails({ name: '', email: '', phone: '' });
        setCart([]);
        setShowAuthModal(true);
    };

    // Calculations
    const taxRate = companyInfo?.taxRate ?? 0.00;
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
    const totalDiscountAmount = useMemo(() => (subtotal * discountPercent) / 100, [subtotal, discountPercent]);
    const totalTax = useMemo(() => (subtotal - totalDiscountAmount) * taxRate, [subtotal, totalDiscountAmount, taxRate]);
    const finalTotal = useMemo(() => subtotal - totalDiscountAmount + totalTax, [subtotal, totalDiscountAmount, totalTax]);

    // Held Orders State & Handlers
    const [heldOrders, setHeldOrders] = useState<POSHeldOrder[]>([]);
    const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);

    const handleHoldCart = useCallback(() => {
        if (cart.length === 0) return alert("Cart is empty");
        const newHeld: POSHeldOrder = {
            id: `held-${Date.now()}`,
            sessionId: posSession?.id || "default",
            heldAt: new Date().toISOString(),
            note: `Service Ticket - ${cart.length} services`,
            customer: currentCustomer,
            items: cart,
            subtotal,
            discount: discountPercent,
            tax: totalTax,
            total: finalTotal,
        };
        setHeldOrders(prev => [newHeld, ...prev]);
        setCart([]);
        setServiceNotes('');
        setCurrentCustomer(null);
        setClientDetails({ name: '', email: '', phone: '' });
        alert("Service order placed on hold!");
    }, [cart, posSession, currentCustomer, subtotal, discountPercent, totalTax, finalTotal]);

    const handleResumeHeldOrder = useCallback((held: POSHeldOrder) => {
        setCart(held.items);
        if (held.customer) {
            setCurrentCustomer(held.customer);
            setClientDetails({
                name: held.customer.name,
                email: held.customer.email,
                phone: held.customer.phone,
            });
        }
        setDiscountPercent(held.discount || 0);
        setHeldOrders(prev => prev.filter(o => o.id !== held.id));
    }, []);

    const handleDeleteHeldOrder = useCallback((id: string) => {
        setHeldOrders(prev => prev.filter(o => o.id !== id));
    }, []);

    const [isLoading, setIsLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // --- Checkout & Advanced Payment Split States ---
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
    const [amountReceived, setAmountReceived] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [isSplit, setIsSplit] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [products, setProducts] = useState<MarketListingForm[]>(initialProducts || []);
    const [categories, setCategories] = useState<IStoreCategory[]>(initialCategories || []);

    const [currentAgent, setCurrentAgent] = useState<Agent | null>({
        id: 'agent-001',
        name: `${userName}`,
        dailySalesCount: 12,
        dailySalesValue: 2450.00,
    });
    
    const [timeSlot, setTimeSlot] = useState(new Date().toTimeString().slice(0, 5)); 
    const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10)); 
    
    // Variants Modal State
    const [variantModalProduct, setVariantModalProduct] = useState<MarketListingForm | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantOptionItem>>({});

    const [splits, setSplits] = useState<{ method: string; amount: number }[]>([
        { method: 'cash', amount: 0 }
    ]);

    // Track baseline updates to balance split arrays on state recalculation
    useEffect(() => {
        if (!isSplit && !isPending) {
            setSplits([{ method: selectedPaymentMethod, amount: finalTotal }]);
        }
    }, [finalTotal, isSplit, isPending, selectedPaymentMethod]);

    const currencySymbol = useMemo(() => companyInfo?.currency === 'KES' ? 'KSh' : '$', [companyInfo]);

    const changeDue = useMemo(() => {
        const received = parseFloat(amountReceived) || 0;
        return received > finalTotal ? received - finalTotal : 0;
    }, [amountReceived, finalTotal]);

    const activeStaffName = useMemo(() => {
        return availableStaff.find(s => s.id === selectedStaffId)?.name || (selectedStaffId ? 'Assigned Specialist' : 'Unassigned');
    }, [availableStaff, selectedStaffId]);

    // Infinite Scroll Configuration
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

        const fetchMoreServices = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/pos-marketplace-listings?companyId=${companyId}&page=${page}&limit=20`);
                const data = await res.json();
                const newProducts = data.data.results;
                setProducts(prev => [...prev, ...newProducts]);
                setHasMore(page < data.data.totalPages);
            } catch (err) {
                console.error("Failed to load services", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMoreServices();
    }, [page, companyId]);

    useEffect(() => {
        const fetchAgentAndCompany = async () => {
            setCurrentAgent({
                id: userId || 'agent-001',
                name: userName || 'System Operator',
                dailySalesCount: 12,
                dailySalesValue: 2450.00,
            });
            if (!initialCompanyInfo) {
                setCompanyInfo({
                    name: 'Premium Service Hub',
                    address: 'Headquarters',
                    phone: '+254 700 000 000',
                    currency: 'KES', 
                } as any);
            }
        };
        fetchAgentAndCompany();
    }, [companyId, userId, userName, initialCompanyInfo]); 

    // --- Dynamic Receipt Formatting ---
    const generateReceiptHtml = (details: ReceiptDetails): string => {
        const itemsHtml = details.cart.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
                <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
                <span style="width: 40px; text-align: center;">x${item.quantity}</span>
                <span style="width: 80px; text-align: right;">${details.currencySymbol} ${(item.finalPrice || item.price || 0).toFixed(2)}</span>
                <span style="width: 100px; text-align: right; font-weight: bold;">${details.currencySymbol} ${item.subtotal.toFixed(2)}</span>
            </div>
        `).join('');

        const clientInfoHtml = details.clientName ? `
            <div style="background-color: #f8fafc; padding: 10px; border-radius: 8px; margin: 12px 0; font-size: 12px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 800; margin-bottom: 4px; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Client Information</div>
                <div style="font-weight: 600; color: #0f172a;">${details.clientName}</div>
                ${details.clientPhone ? `<div style="color: #64748b; margin-top: 2px;">📞 ${details.clientPhone}</div>` : ''}
                ${details.clientEmail ? `<div style="color: #64748b; margin-top: 2px;">✉️ ${details.clientEmail}</div>` : ''}
            </div>
        ` : '';

        const serviceMetaHtml = details.appointment ? `
            <div style="background-color: #f0fdfa; padding: 10px; border-radius: 8px; margin: 12px 0; font-size: 12px; border: 1px solid #ccfbf1;">
                <div style="font-weight: 800; margin-bottom: 4px; color: #0f766e; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Service Appointment</div>
                <div><b>Schedule:</b> ${details.appointment.date} @ ${details.appointment.timeSlot}</div>
                <div><b>Assigned Specialist:</b> ${details.appointment.staffName}</div>
                ${details.appointment.notes ? `<div style="margin-top: 4px; font-style: italic; color: #475569;"><b>Notes:</b> ${details.appointment.notes}</div>` : ''}
            </div>
        ` : '';

        const dynamicPaymentHtml = `
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #555;">
                <span>Payment Method:</span><span style="text-transform: uppercase; font-weight: bold;">${details.paymentMethod}</span>
            </div>
            ${details.transactionReference ? `
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #555;">
                <span>Ref ID:</span><span style="font-family: monospace;">${details.transactionReference}</span>
            </div>` : ''}
            ${details.amountReceived ? `
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #555;">
                <span>Cash Tendered:</span><span>${details.currencySymbol} ${details.amountReceived.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #555;">
                <span>Change Due:</span><span>${details.currencySymbol} ${details.changeDue?.toFixed(2)}</span>
            </div>` : ''}
        `;

        return `
            <div style="font-family: 'Inter', sans-serif; width: 320px; margin: 0 auto; padding: 24px; color: #222; background-color: #fff; border: 1px solid #eaeaea; border-radius: 12px;">
                <h2 style="text-align: center; font-size: 20px; font-weight: 900; margin-bottom: 2px; color: #111;">${details.storeName}</h2>
                <div style="text-align: center; font-size: 10px; font-weight: 700; color: #0d9488; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Service Invoice & Receipt</div>
                <p style="text-align: center; font-size: 11px; margin-bottom: 12px; color: #666; line-height: 1.4;">${details.storeAddress}<br>${details.storePhone}</p>
                <hr style="border: none; border-top: 1px dashed #ddd; margin: 16px 0;">

                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #555;">
                    <span>Date / Time:</span><span>${details.date} ${details.time}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px; color: #555;">
                    <span>Invoice / Order #:</span><span style="font-family: monospace; font-weight: bold;">${details.transactionId}</span>
                </div>

                ${clientInfoHtml}
                ${serviceMetaHtml}

                <div style="font-size: 14px; font-weight: 800; margin-bottom: 8px; color: #333;">Services Booked:</div>
                ${itemsHtml}

                <hr style="border: none; border-top: 1px dashed #ddd; margin: 16px 0;">

                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                    <span>Subtotal:</span><span>${details.currencySymbol} ${details.subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                    <span>Discount:</span><span style="color: #df1c5a;">- ${details.currencySymbol} ${details.totalDiscountAmount.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px;">
                    <span>Tax (${(taxRate * 100).toFixed(0)}%):</span><span>${details.currencySymbol} ${details.totalTax.toFixed(2)}</span>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 900; border-top: 2px solid #111; padding-top: 12px; margin-top: 8px; color: #111;">
                    <span>TOTAL:</span><span>${details.currencySymbol} ${details.finalTotal.toFixed(2)}</span>
                </div>

                <hr style="border: none; border-top: 1px dashed #ddd; margin: 16px 0;">
                ${dynamicPaymentHtml}

                <hr style="border: none; border-top: 1px dashed #ddd; margin: 16px 0;">
                <p style="text-align: center; font-size: 12px; color: #666;">Served by: ${details.agentName}</p>
                <p style="text-align: center; font-size: 14px; font-weight: 800; margin-top: 12px; color: #111;">THANK YOU</p>
            </div>
        `;
    };

    const printReceipt = (htmlContent: string, receiptDetails: any) => {
        const extendedPayload = {
            BusinessName: receiptDetails.storeName,
            BusinessAddress: receiptDetails.storeAddress,
            PhoneNumber: receiptDetails.storePhone,
            InvoiceId: receiptDetails.transactionId,
            CustomerName: receiptDetails.customerName || "Walk-in Guest",
            StaffName: receiptDetails.agentName,
            Date: `${receiptDetails.date} ${receiptDetails.time}`,
            Currency: receiptDetails.currencySymbol,
            PaymentMethod: receiptDetails.paymentMethod,
            Items: receiptDetails.cart.map((item: any) => ({
                Name: item.name,
                Quantity: parseInt(item.quantity),
                Price: parseFloat(item.finalPrice || item.price || 0),
                Category: item.category || "Service",
            })),
            ServiceMeta: {
                ExecutionMode: bookingMode,
                Specialist: activeStaffName,
                ScheduledDate: appointmentDate,
                ScheduledTime: timeSlot
            }
        };

        if ((window as any).AndroidBridge) {
            (window as any).AndroidBridge.postMessage(JSON.stringify({ type: 'PRINT_ESC_POS', payload: extendedPayload }));
        } else if ((window as any).chrome?.webview) {
            (window as any).chrome.webview.postMessage({ type: 'PRINT_ESC_POS', payload: extendedPayload });
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
            iframeDoc.open(); iframeDoc.write(htmlContent); iframeDoc.close();
            iframe.onload = () => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                document.body.removeChild(iframe);
            };
        }
    };

    // --- Core Action Hooks ---
    const executeAddToCart = useCallback((product: MarketListingForm, options: VariantOptionItem[]) => {
      setCart(prevCart => {
        const optionsSignature = options
          .map(o => `${o.category}:${o.name}`)
          .sort()
          .join('|');
        const cartItemId = `${product.id}-${optionsSignature}`;
  
        const basePrice = product.finalPrice || product.sellingPrice || 0;
        const extraVariantPrice = options.reduce((sum, opt) => sum + (opt.extraPrice || 0), 0);
        const unitFinalPrice = basePrice + extraVariantPrice;
  
        const existingItemIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);
  
        if (existingItemIndex > -1) {
          const updatedCart = [...prevCart];
          const existingItem = updatedCart[existingItemIndex];
          const newQuantity = existingItem.quantity + 1;
          updatedCart[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            finalPrice: unitFinalPrice, 
            subtotal: unitFinalPrice * newQuantity,
          };
          return updatedCart;
        } else {
          return [
            ...prevCart,
            {
              ...product,
              cartItemId, 
              quantity: 1,
              price: basePrice,
              finalPrice: unitFinalPrice, 
              subtotal: unitFinalPrice,
              selectedOptions: options
            },
          ];
        }
      });
      setVariantModalProduct(null); 
    }, []);

    const handleAddToCart = useCallback((product: MarketListingForm) => {
        if (product.option && product.option.length > 0) {
          setVariantModalProduct(product);
          setSelectedVariants({}); 
        } else {
          executeAddToCart(product, []); 
        }
    }, [executeAddToCart]);
      
    const updateQuantity = useCallback((cartItemId: string, delta: number) => {
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

    const handleProcessPayment = useCallback(() => {
      if (cart.length === 0) return alert('Cart is empty.');
      
      setAmountReceived('');
      setTransactionRef('');
      setSplits([{ method: 'cash', amount: finalTotal }]);
      setIsSplit(false);
      setIsPending(false);
      setShowPaymentModal(true);
    }, [cart.length, finalTotal]);

    // --- Complete Order & Sync Live Payload ---
    const finalizeSale = useCallback(async () => {
        if (!operator && !posSession) {
            setShowAuthModal(true);
            return alert("Please authenticate with your staff or sales agent login code first.");
        }

        if (cart.length === 0) {
            return alert("Cart is empty");
        }

        if (isSplit && !isPending) {
          const totalAllocated = splits.reduce((sum, s) => sum + s.amount, 0);
          if (Math.abs(totalAllocated - finalTotal) > 0.01) {
            return alert(`Split total (${totalAllocated.toFixed(2)}) must exactly match total (${finalTotal.toFixed(2)})`);
          }
        }

        if (!isSplit && !isPending && selectedPaymentMethod === 'cash' && amountReceived && parseFloat(amountReceived) < finalTotal) {
            return alert("Amount received cannot be less than the total invoice value.");
        }
        
        setIsLoading(true);
        try {
            const itemsPayload = cart.map(item => ({
                listingId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.finalPrice || item.price || 0,
                subtotal: item.subtotal,
                variants: item.selectedOptions || []
            }));

            const response = await fetch(`${apiBaseUrl}/shop/serviceOrders`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: companyId,
                    billing: { 
                        name: currentCustomer?.name || clientDetails.name || 'Walk-in Guest',
                        email: currentCustomer?.email || clientDetails.email || 'walkin@pos.local',
                        phone: currentCustomer?.phone || clientDetails.phone || '0000000000',
                    },
                    isWalkIn: !currentCustomer,
                    customerType: currentCustomer ? "IDENTIFIED" : "WALK_IN",
                    channel: "POS",
                    actorType: "STAFF",
                    consumerId: currentCustomer?.id || (userId && userId !== 'null' ? userId : undefined),
                    posSessionId: posSession?.id,
                    operatorId: operator?.id || (userId && userId !== 'null' ? userId : undefined),
                    cashierName: operator?.name || userName,
                    paymentOption: isPending ? 'credit' : (isSplit ? 'split' : selectedPaymentMethod), 
                    splitLedger: isSplit ? splits : undefined,
                    transactionReference: transactionRef || undefined,
                    totalPrice: finalTotal,
                    assignedStaffId: selectedStaffId || undefined,
                    serviceNotes: serviceNotes,
                    appointment: {
                        date: appointmentDate,
                        timeSlot: timeSlot,
                        locationType: "In-Store",
                        mode: bookingMode,
                        staffName: activeStaffName
                    },
                    items: itemsPayload,
                    listingId: cart[0]?.id,    
                    price: cart[0]?.finalPrice || cart[0]?.price || 0, 
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to complete the booking.');

            const now = new Date();
            const receiptDetails: ReceiptDetails = {
                cart: cart,
                subtotal,
                totalDiscountAmount,
                totalTax,
                finalTotal,
                paymentMethod: isPending ? 'CREDIT / PENDING' : (isSplit ? 'SPLIT BILL' : selectedPaymentMethod.toUpperCase()),
                amountReceived: (!isSplit && selectedPaymentMethod === 'cash') ? (parseFloat(amountReceived) || finalTotal) : undefined,
                changeDue: (!isSplit && selectedPaymentMethod === 'cash') ? changeDue : undefined,
                transactionReference: transactionRef || undefined,
                agentId: operator?.id || currentAgent?.id || 'N/A',
                agentName: operator?.name || currentAgent?.name || 'N/A', 
                transactionId: result.data?.trackingNumber || `SRV-${Date.now()}`, 
                date: now.toISOString().split('T')[0], 
                time: now.toTimeString().split(' ')[0], 
                storeName: companyInfo?.name || 'Service Hub',
                storeAddress: companyInfo?.address || 'Nairobi',
                storePhone: companyInfo?.phone || 'Active',
                currencySymbol,
                clientName: currentCustomer?.name || clientDetails.name || undefined,
                clientPhone: currentCustomer?.phone || clientDetails.phone || undefined,
                clientEmail: currentCustomer?.email || clientDetails.email || undefined,
                appointment: {
                    date: appointmentDate,
                    timeSlot: timeSlot,
                    staffName: activeStaffName,
                    notes: serviceNotes
                }
            };

            const receiptHtml = generateReceiptHtml(receiptDetails);
            printReceipt(receiptHtml, receiptDetails);

            // Reset items & checkout, preserve currentCustomer for reuse across session
            setCart([]);
            setServiceNotes('');
            setSelectedStaffId('');
            setDiscountPercent(0);
            setShowPaymentModal(false);
            setIsCartOpen(false);
            alert("Order completed successfully!");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred processing this transactional request.");
        } finally {
            setIsLoading(false);
        }
    }, [cart, finalTotal, subtotal, totalDiscountAmount, totalTax, apiBaseUrl, userId, currentAgent, operator, posSession, currentCustomer, clientDetails, companyInfo, currencySymbol, isSplit, isPending, splits, selectedPaymentMethod, amountReceived, changeDue, transactionRef, selectedStaffId, serviceNotes, appointmentDate, timeSlot, bookingMode, activeStaffName]);

    const filteredServices = useMemo(() => {
        return products.filter(p => {
            const catId = (p as any).productCategoryId || (p as any).categoryId || 'all';
            const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
            const matchesSearch = !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, selectedCategory]);

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-gray-900 dark:text-gray-100 selection:bg-teal-200 dark:selection:bg-teal-900">
            {/* POS SESSION OPERATOR HEADER */}
            <POSSessionHeader
                companyId={companyId}
                companyName={companyInfo?.name || "Service POS"}
                onLockTerminal={() => setShowAuthModal(true)}
                operator={operator}
                posSession={posSession}
                onEndSession={handleSessionEnded}
                heldOrdersCount={heldOrders.length}
                onOpenHeldOrders={() => setShowHeldOrdersModal(true)}
                currencySymbol={currencySymbol}
            />

            <div className="flex flex-1 overflow-hidden w-full relative">
                {/* --- Main Catalog Grid --- */}
                <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative z-10">
                
                {/* Header */}
                <header className="px-4 py-5 md:px-6 md:py-6 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl z-20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                                Service<span style={{ color: primaryColor }}>Hub.POS</span>
                                <SparklesIcon className="w-5 h-5 opacity-80" style={{ color: primaryColor }} />
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">Logged in: {userName}</p>
                        </div>

                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto border border-gray-200/50 dark:border-gray-700/30">
                            {[
                                { id: 'instant', label: 'Walk-In' },
                                { id: 'scheduled', label: 'Book for Later' }
                            ].map(m => (
                                <button 
                                    key={m.id}
                                    onClick={() => setBookingMode(m.id as any)}
                                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap ${bookingMode === m.id ? 'shadow-sm text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                    style={{ backgroundColor: bookingMode === m.id ? primaryColor : '' }}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-4 max-w-7xl mx-auto w-full">
                        <div className="relative flex-1 group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input 
                                placeholder="Search services..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm focus:ring-2 focus:border-transparent outline-none transition-all text-sm font-medium"
                                style={{ '--tw-ring-color': primaryColor } as any}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Categories Tab Bar */}
                <div className="shrink-0 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 overflow-x-auto p-4 max-w-7xl mx-auto w-full no-scrollbar">
                        {['all', ...categories].map((cat: any) => {
                            const id = typeof cat === 'string' ? cat : (cat.categoryId || cat.category?.id || cat.id);
                            const name = typeof cat === 'string' ? 'All Services' : cat.displayName;
                            const isSelected = selectedCategory === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setSelectedCategory(id)}
                                    className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap border-2 ${
                                        isSelected
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-sm'
                                            : 'bg-white dark:bg-gray-900 border-transparent text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'
                                    }`}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Service Cards Grid */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 lg:pb-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        <AnimatePresence>
                            {filteredServices.map((service, index) => {
                                const isLast = filteredServices.length === index + 1;
                                return (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        ref={isLast ? lastProductElementRef : null} 
                                        key={`${service.id}-${index}`}
                                    >
                                        <ServiceCard 
                                            service={service} 
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
                        
                        {!loading && filteredServices.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                                <MagnifyingGlassIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-base font-bold text-gray-700 dark:text-gray-300">No services found</p>
                                <p className="text-xs text-gray-500">Try changing your search keywords.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Mobile Trigger Button --- */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-30 pb-safe">
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl shadow-lg active:scale-95 transition-transform text-white"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <ShoppingBagIcon className="w-6 h-6" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                    {cart.length}
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-base">View Current Order</span>
                    </div>
                    <span className="font-black text-lg">{currencySymbol} {finalTotal.toFixed(2)}</span>
                </button>
            </div>

            {/* --- Sidebar Checkout Container Drawer --- */}
            <AnimatePresence>
                {(isCartOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                    <>
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
                            className="fixed bottom-0 left-0 right-0 lg:relative lg:inset-auto z-40 w-full lg:w-[420px] h-[88vh] lg:h-full bg-white dark:bg-gray-900 shadow-2xl lg:shadow-none border-l border-gray-200 dark:border-gray-800 flex flex-col rounded-t-2xl lg:rounded-none overflow-hidden"
                        >
                            <div className="lg:hidden flex justify-center pt-3 pb-1 w-full" onClick={() => setIsCartOpen(false)}>
                                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            </div>

                            <div className="px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-b-gray-100 dark:border-b-gray-800">
                                <div>
                                    <h2 className="font-black text-xl tracking-tight">Current Order</h2>
                                    <p className="text-xs text-gray-500 font-medium">{cart.length} service(s) selected</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleHoldCart}
                                        disabled={cart.length === 0}
                                        className="text-xs font-bold text-amber-500 hover:text-amber-600 disabled:opacity-40 transition-colors uppercase tracking-wider"
                                        title="Hold current order to serve another customer"
                                    >
                                        Hold
                                    </button>
                                    <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Customer & Booking Settings Form */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar flex flex-col gap-4">
                                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                                    <div className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">1. Customer Details</div>
                                    <POSCustomerSelector
                                        companyId={companyId}
                                        selectedCustomer={currentCustomer}
                                        onSelectCustomer={(cust) => {
                                            setCurrentCustomer(cust);
                                            if (cust) {
                                                setClientDetails({
                                                    name: cust.name,
                                                    email: cust.email || '',
                                                    phone: cust.phone || '',
                                                });
                                            } else {
                                                setClientDetails({ name: '', email: '', phone: '' });
                                            }
                                        }}
                                        required={false}
                                    />

                                    <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/50 space-y-2.5">
                                        <div className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">2. Service Setup</div>
                                        <div className="relative">
                                            <UserGroupIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                            <select
                                                value={selectedStaffId}
                                                onChange={e => setSelectedStaffId(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold outline-none appearance-none focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as any}
                                            >
                                                <option value="">Assign Specialist / Staff</option>
                                                {availableStaff.map(staff => (
                                                    <option key={staff.id} value={staff.id}>
                                                        {staff.name} ({staff.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="relative">
                                            <ClipboardDocumentIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                            <textarea 
                                                placeholder="Special notes or requests..." 
                                                value={serviceNotes}
                                                rows={2}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium outline-none focus:ring-2 resize-none"
                                                style={{ '--tw-ring-color': primaryColor } as any}
                                                onChange={e => setServiceNotes(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {bookingMode === 'scheduled' && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                                            >
                                                <div className="relative">
                                                    <CalendarIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                                    <input 
                                                        type="date" value={appointmentDate}
                                                        className="w-full pl-8 pr-2 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold outline-none focus:ring-2"
                                                        style={{ '--tw-ring-color': primaryColor } as any}
                                                        onChange={e => setAppointmentDate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <ClockIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                                    <input 
                                                        type="time" value={timeSlot}
                                                        className="w-full pl-8 pr-2 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold outline-none focus:ring-2"
                                                        style={{ '--tw-ring-color': primaryColor } as any}
                                                        onChange={e => setTimeSlot(e.target.value)}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Active Service Items List */}
                                <div className="flex-1 space-y-2.5">
                                    <div className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">3. Selected Services</div>
                                    {cart.map((item, index) => (
                                        <div key={`${item.cartItemId}-${index}`} className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                                            <div className="flex justify-between items-start pr-6">
                                                <div>
                                                    <p className="font-bold text-xs md:text-sm leading-tight text-gray-800 dark:text-gray-100">{item.name}</p>
                                                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.selectedOptions.map((opt, oIdx) => (
                                                                <span key={oIdx} className="text-[10px] bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded font-medium">
                                                                    {opt.category}: {opt.name} (+{currencySymbol}{opt.extraPrice})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="font-black text-xs md:text-sm whitespace-nowrap ml-2">{currencySymbol} {item.subtotal.toFixed(2)}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-0.5">
                                                <span className="text-[11px] text-gray-500 font-semibold">{currencySymbol} {(item.finalPrice || item.price || 0).toFixed(2)} each</span>
                                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5">
                                                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300">
                                                        <MinusIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300">
                                                        <PlusIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleRemoveFromCart(item.cartItemId)} 
                                                className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}

                                    {cart.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                                                <ShoppingBagIcon className="w-6 h-6 opacity-30" />
                                            </div>
                                            <p className="font-bold text-sm text-gray-600 dark:text-gray-300">Your cart is empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Total Pricing Footer Container */}
                            <div className="p-4 md:p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 pb-safe">
                                <div className="space-y-2 mb-3">
                                    <div className="flex justify-between text-xs md:text-sm text-gray-500 font-medium">
                                        <span>Subtotal</span>
                                        <span className="font-bold">{currencySymbol} {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs md:text-sm font-medium">
                                        <span className="text-red-500">Discount (%)</span>
                                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-lg">
                                            <input 
                                                type="number" className="w-8 text-right bg-transparent border-none p-0 focus:ring-0 font-bold text-red-500 text-xs md:text-sm" 
                                                value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}
                                            />
                                            <span className="text-red-500 font-bold text-xs">%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm text-gray-500 font-medium">
                                        <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                        <span>{currencySymbol} {totalTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Amount</span>
                                        <span className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
                                            {currencySymbol} {finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleProcessPayment}
                                    disabled={cart.length === 0 || isLoading}
                                    className="w-full py-3.5 rounded-xl text-white font-black text-base shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <span>Proceed to Payment</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* --- Dynamic Variant Selection Modifier Modal --- */}
            <AnimatePresence>
                {variantModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col"
                        >
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Configure Service Option Variations</h3>
                                    <p className="text-xs text-zinc-400 mt-0.5">{variantModalProduct.name}</p>
                                </div>
                                <button onClick={() => setVariantModalProduct(null)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4 max-h-[350px] overflow-y-auto">
                                {(variantModalProduct.option as any[]).map((optGroup: any, idx: number) => (
                                    <div key={idx} className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{optGroup.name || 'Modifier'}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(optGroup.values || []).map((val: any, valIdx: number) => {
                                                const optionName = typeof val === 'string' ? val : val.name;
                                                const extraCost = typeof val === 'string' ? 0 : (val.extraPrice || 0);
                                                const isSelected = selectedVariants[optGroup.name]?.name === optionName;
                                                return (
                                                    <button
                                                        key={valIdx}
                                                        type="button"
                                                        onClick={() => setSelectedVariants(prev => ({
                                                            ...prev,
                                                            [optGroup.name]: { category: optGroup.name, name: optionName, extraPrice: extraCost }
                                                        }))}
                                                        className={`px-3 py-1.5 text-xs rounded-xl border transition ${
                                                            isSelected 
                                                                ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 font-bold' 
                                                                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                                        }`}
                                                    >
                                                        {optionName} {extraCost > 0 ? `(+${currencySymbol}${extraCost})` : ''}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <button
                                    type="button"
                                    onClick={() => executeAddToCart(variantModalProduct, Object.values(selectedVariants))}
                                    className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl active:scale-98 transition"
                                >
                                    Add Selection to Order Line
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- Interactive Checkout & Payment Processing Modal --- */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-zinc-100 dark:border-zinc-800">
                                                    
                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Process POS Payment</h3>
                                    <p className="text-sm text-zinc-500 mt-0.5">Total Amount due: <span className="font-semibold text-indigo-600">{currencySymbol} {finalTotal.toFixed(2)}</span></p>
                                </div>
                                <button 
                                    onClick={() => !isLoading && setShowPaymentModal(false)}
                                    className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
                                >
                                    ✕
                                </button>
                            </div>
                                    
                            {/* Mode Selectors */}
                            <div className="grid grid-cols-3 gap-3 my-5">
                                <button
                                    type="button"
                                    onClick={() => { setIsSplit(false); setIsPending(false); }}
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
                                    <div className="space-y-4">
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
                                                        onClick={() => setSelectedPaymentMethod(m.id)}
                                                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${selectedPaymentMethod === m.id ? 'border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800 font-semibold' : 'border-zinc-200 dark:border-zinc-800'}`}
                                                    >
                                                        <m.icon className="w-5 h-5 text-zinc-500" />
                                                        <span className="text-sm">{m.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Nested Input fields for single option configs */}
                                        {selectedPaymentMethod === 'cash' && (
                                            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2">
                                                <label className="text-[11px] font-bold text-zinc-400 block uppercase">Amount Tendered</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">{currencySymbol}</span>
                                                    <input 
                                                        type="number" step="any" placeholder={finalTotal.toFixed(2)} value={amountReceived}
                                                        onChange={e => setAmountReceived(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold outline-none text-sm"
                                                    />
                                                </div>
                                                {parseFloat(amountReceived) > finalTotal && (
                                                    <div className="flex justify-between items-center text-xs pt-1">
                                                        <span className="text-zinc-400">Change Due:</span>
                                                        <span className="font-bold text-green-600">{currencySymbol}{changeDue.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'stripe') && (
                                            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1.5">
                                                <label className="text-[11px] font-bold text-zinc-400 block uppercase">Transaction Confirmation Code</label>
                                                <input 
                                                    placeholder="e.g. QX76HJ92LK" value={transactionRef}
                                                    onChange={e => setTransactionRef(e.target.value.toUpperCase())}
                                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold uppercase tracking-wider outline-none"
                                                />
                                            </div>
                                        )}
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
                                    
                            {/* Actions */}
                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-98 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={finalizeSale}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <PrinterIcon className="w-4 h-4" />
                                            <span>Confirm & Complete</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
            </div>

            {/* POS OPERATOR AUTH MODAL */}
            <POSOperatorModal
                isOpen={showAuthModal}
                companyId={companyId}
                terminalId={posSession?.terminalId || "T01"}
                storeName={companyInfo?.name || "ServicePOS"}
                onSuccess={handleOperatorAuthenticated}
            />

            {/* POS HELD ORDERS MODAL */}
            <POSHeldOrdersModal
                isOpen={showHeldOrdersModal}
                onClose={() => setShowHeldOrdersModal(false)}
                heldOrders={heldOrders}
                onResumeOrder={handleResumeHeldOrder}
                onDeleteHeldOrder={handleDeleteHeldOrder}
                currencySymbol={currencySymbol}
            />

            <style>{`
                .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default AdminServicePOSClient;

// --- Service Card Card Layout Subcomponent ---
const ServiceCard = ({ service, handleAddToCart, currencySymbol, primaryColor }: { service: MarketListingForm; handleAddToCart: (product: MarketListingForm) => void; currencySymbol: string; primaryColor: string }) => {
    const price = service.finalPrice || service.sellingPrice || (service as any).price || 0;
    const hasVariants = service.option && (service.option as any[]).length > 0;
    
    return (
        <div
            onClick={() => handleAddToCart(service)}
            className="group cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex flex-col h-full relative overflow-hidden"
        >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-2.5 bg-gray-100 dark:bg-gray-800 shrink-0">
                <img
                    src={service.images?.[0] || `https://placehold.co/400x300?text=${encodeURIComponent(service.name)}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={service.name}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`p-2.5 rounded-full shadow-md transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 ${hasVariants ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white'}`}>
                        <PlusIcon className="w-4 h-4 font-black" />
                    </div>
                </div>

                <span className="absolute top-1.5 right-1.5 bg-gray-900/80 backdrop-blur-md text-[9px] font-bold text-white px-1.5 py-0.5 rounded shadow-sm tracking-wide uppercase">
                    Service
                </span>
            </div>
            
            <div className="flex flex-col flex-1 justify-between px-0.5">
                <div>
                    <h3 className="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {service.name}
                    </h3>
                    {service.description && (
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5 font-medium">{service.description}</p>
                    )}
                </div>
                <div className="flex justify-between items-end mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-800/60">
                    <span className="font-black text-sm md:text-base tracking-tight" style={{ color: primaryColor }}>
                        {currencySymbol}{price.toLocaleString()}
                    </span>
                    {hasVariants && (
                        <span className="text-[9px] text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md font-bold">
                            Has Options
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};