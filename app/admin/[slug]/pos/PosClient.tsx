"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  PrinterIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  ScissorsIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  TagIcon,
  TableCellsIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ReceiptPercentIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import POSSessionHeader from "@/components/pos/POSSessionHeader";
import POSOperatorModal from "@/components/pos/POSOperatorModal";
import POSShiftModal from "@/components/pos/POSShiftModal";
import POSCustomerSelector from "@/components/pos/POSCustomerSelector";
import POSHeldOrdersModal from "@/components/pos/POSHeldOrdersModal";
import { standardReceipt } from "@/lib/receipts/standardReceipt";
import { executeUnifiedPrint, NormalizedPrintPayload } from "@/lib/printing/unifiedPrintClient";
import { useBarcodeScannerWedge, scanAudio } from "@/lib/pos/useBarcodeScannerWedge";
import type {
  POSCustomerRecord,
  POSOperatorInfo,
  POSSessionInfo,
  POSHeldOrder,
  RestaurantTableRecord,
  RestaurantAreaRecord,
  TableStatusType,
} from "@/types/pos";

export type RestaurantOrderItem = MarketListingForm & {
  cartItemId: string;
  price: number;
  finalPrice: number;
  quantity: number;
  subtotal: number;
  totalPrice?: number;
  course: "STARTER" | "MAIN" | "DESSERT" | "BEVERAGE";
  kitchenStatus?: "PENDING" | "SENT" | "COOKING" | "READY" | "SERVED";
  notes?: string;
};

interface PosClientProps {
  initialProducts?: MarketListingForm[];
  initialCategories?: IStoreCategory[];
  companyId: string;
  userName: string;
  userId: string | null;
}

export default function PosClient({
  companyId,
  initialProducts = [],
  initialCategories = [],
  userName,
  userId,
}: PosClientProps) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#4f46e5";
  const currencySymbol = storeFormData?.currency || "USD";

  // Operator & Session State
  const [operator, setOperator] = useState<POSOperatorInfo | null>(null);
  const [posSession, setPosSession] = useState<POSSessionInfo | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Restaurant Tables & Areas State
  const [areas, setAreas] = useState<RestaurantAreaRecord[]>([]);
  const [tables, setTables] = useState<RestaurantTableRecord[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTable, setActiveTable] = useState<RestaurantTableRecord | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);

  // Table Opening Modal State
  const [openTableModalTarget, setOpenTableModalTarget] = useState<RestaurantTableRecord | null>(null);
  const [openGuestCount, setOpenGuestCount] = useState<number>(2);
  const [openServiceMode, setOpenServiceMode] = useState<"DINE_IN" | "TAKEAWAY" | "COUNTER">("DINE_IN");
  const [openTableNotes, setOpenTableNotes] = useState<string>("");
  const [isOpeningTable, setIsOpeningTable] = useState(false);

  // Active Table Order / Cart State
  const [orderItems, setOrderItems] = useState<RestaurantOrderItem[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<POSCustomerRecord | null>(null);
  const [activeCourse, setActiveCourse] = useState<"STARTER" | "MAIN" | "DESSERT" | "BEVERAGE">("MAIN");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [kitchenSent, setKitchenSent] = useState<boolean>(false);

  // Held Orders State
  const [heldOrders, setHeldOrders] = useState<POSHeldOrder[]>([]);
  const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);

  // Modals for Restaurant Actions
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetTableId, setTransferTargetTableId] = useState<string>("");
  const [transferReason, setTransferReason] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSourceTableId, setMergeSourceTableId] = useState<string>("");
  const [isMerging, setIsMerging] = useState(false);

  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [isSplitting, setIsSplitting] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile" | "mpesa" | "loyalty" | "credit" | "split">("cash");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // M-Pesa STK Push
  const [mpesaPhoneInput, setMpesaPhoneInput] = useState('');
  const [mpesaCheckoutId, setMpesaCheckoutId] = useState<string | null>(null);
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'sending' | 'pending' | 'completed' | 'failed'>('idle');
  const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
  const [mpesaCountdown, setMpesaCountdown] = useState(45);
  const mpesaPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mpesaCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // WhatsApp E-Receipt
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  // Loyalty Points
  const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(0);

  // eTIMS Fiscal Config
  const [etimsConfig, setEtimsConfig] = useState<any>(null);

  // Post-sale state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSaleReceipt, setLastSaleReceipt] = useState<any>(null);

  // Menu & Table Search Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<"MENU" | "TICKET">("MENU");

  // Check Active Session on Mount
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch(`/api/pos/session?companyId=${encodeURIComponent(companyId)}&terminalId=T01`);
        const data = await res.json();
        const sessionData = data.data || data.session;
        if (res.ok && sessionData && !sessionData.isOverdue && isMounted) {
          setPosSession({
            id: sessionData.id,
            terminalId: sessionData.terminalId,
            status: sessionData.status,
            openedAt: sessionData.openedAt,
          });
          if (sessionData.operator) {
            setOperator(sessionData.operator);
          }
          setShowAuthModal(false);
        } else if (isMounted) {
          setPosSession(null);
          setOperator(null);
          setShowAuthModal(true);
        }
      } catch (err) {
        console.error("Error checking POS session", err);
        if (isMounted) setShowAuthModal(true);
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, [companyId]);

  // Load Restaurant Areas & Tables
  const fetchRestaurantLayout = useCallback(async () => {
    try {
      setLoadingTables(true);
      const [areasRes, tablesRes] = await Promise.all([
        fetch(`/api/pos/restaurant/areas?companyId=${encodeURIComponent(companyId)}`),
        fetch(`/api/pos/restaurant/tables?companyId=${encodeURIComponent(companyId)}`),
      ]);

      if (areasRes.ok) {
        const areasJson = await areasRes.json();
        if (areasJson.data) setAreas(areasJson.data);
      }

      if (tablesRes.ok) {
        const tablesJson = await tablesRes.json();
        if (tablesJson.data) setTables(tablesJson.data);
      }
    } catch (err) {
      console.error("Error fetching restaurant layout", err);
    } finally {
      setLoadingTables(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchRestaurantLayout();
  }, [fetchRestaurantLayout]);

  // Table Selection & Loading Table State
  const handleSelectTable = (table: RestaurantTableRecord) => {
    setActiveTable(table);
    if (table.currentSession) {
      setActiveSession(table.currentSession);
      setOpenGuestCount(table.currentSession.guestCount || table.capacity || 2);
    } else {
      setActiveSession(null);
    }

    // Load active order if table has an open order
    if (table.currentOrder && table.currentOrder.orderItems) {
      const items: RestaurantOrderItem[] = table.currentOrder.orderItems.map((oi: any) => ({
        id: oi.marketplaceListingId,
        cartItemId: `${oi.id || oi.marketplaceListingId}-${Date.now()}`,
        name: oi.name,
        price: oi.price,
        finalPrice: oi.price,
        sellingPrice: oi.price,
        quantity: oi.quantity,
        subtotal: oi.totalPrice,
        course: (oi.course as any) || "MAIN",
        kitchenStatus: oi.kitchenStatus || "SENT",
        images: oi.images || [],
        category: oi.category || "Food",
      }));
      setOrderItems(items);
      setKitchenSent(true);
      if (table.currentOrder.customer) {
        setCurrentCustomer({
          id: table.currentOrder.customer.id,
          name: table.currentOrder.customer.name,
          email: table.currentOrder.customer.email,
          phone: table.currentOrder.customer.phone,
        });
      }
    } else {
      setOrderItems([]);
      setKitchenSent(false);
      setCurrentCustomer(null);
    }
  };

  // Open Table Session
  const handleConfirmOpenTable = async () => {
    if (!openTableModalTarget) return;
    setIsOpeningTable(true);
    try {
      const res = await fetch("/api/pos/restaurant/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          tableId: openTableModalTarget.id,
          openedById: operator?.id || userId || "staff-pos",
          guestCount: openGuestCount,
          serviceMode: openServiceMode,
          notes: openTableNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to open table");
      }

      await fetchRestaurantLayout();
      const updatedTable: RestaurantTableRecord = {
        ...openTableModalTarget,
        status: "OCCUPIED",
        guestCount: openGuestCount,
        currentSession: json.data,
      };
      handleSelectTable(updatedTable);
      setOpenTableModalTarget(null);
      setOpenTableNotes("");
    } catch (err: any) {
      alert(err.message || "Error opening table");
    } finally {
      setIsOpeningTable(false);
    }
  };

  // Add Item to Ticket
  const handleAddItemToTicket = (product: MarketListingForm) => {
    setOrderItems((prev) => {
      const price = Number(product.sellingPrice || product.finalPrice || 0);
      const existingIndex = prev.findIndex(
        (i) => i.id === product.id && i.course === activeCourse && i.kitchenStatus !== "SENT"
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        const item = copy[existingIndex];
        const newQty = item.quantity + 1;
        copy[existingIndex] = {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.price,
        };
        return copy;
      }

      const newItem: RestaurantOrderItem = {
        ...product,
        cartItemId: `${product.id}-${activeCourse}-${Date.now()}`,
        price,
        finalPrice: price,
        quantity: 1,
        subtotal: price,
        course: activeCourse,
        kitchenStatus: "PENDING",
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateItemQuantity = (cartItemId: string, delta: number) => {
    setOrderItems((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.price,
            };
          }
          return item;
        })
        .filter(Boolean) as RestaurantOrderItem[];
    });
  };

  // Calculations
  const subtotal = useMemo(
    () => orderItems.reduce((acc, item) => acc + item.subtotal, 0),
    [orderItems]
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxAmount = (subtotal - discountAmount) * 0.16; // 16% standard VAT
  const totalAmount = subtotal - discountAmount + taxAmount;

  // Send Order to Kitchen
  const handleSendToKitchen = async () => {
    if (orderItems.length === 0) return alert("Ticket has no items to send to the kitchen.");
    try {
      // If table has no existing active order, create/hold order first
      const orderPayload = {
        companyId,
        cashierId: operator?.id || userId || "pos-staff",
        cashierName: operator?.name || userName,
        cashierEmail: operator?.email || "cashier@pos.local",
        posSessionId: posSession?.id,
        tableId: activeTable?.id,
        tableSessionId: activeSession?.id,
        tableNumber: activeTable?.tableNumber,
        guestCount: openGuestCount,
        serviceMode: openServiceMode,
        channel: "POS",
        actorType: "STAFF",
        isWalkIn: !currentCustomer,
        customerType: currentCustomer ? "IDENTIFIED" : "WALK_IN",
        customer: currentCustomer
          ? {
              name: currentCustomer.name,
              email: currentCustomer.email,
              phone: currentCustomer.phone,
            }
          : {
              name: `Table ${activeTable?.tableNumber || "Order"} Guest`,
              email: "walkin@pos.local",
              phone: "0000000000",
            },
        items: orderItems.map((item) => ({
          marketplaceListingId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.subtotal,
          course: item.course,
          kitchenStatus: "COOKING",
        })),
        isHeld: true,
        heldNote: `Restaurant Floor Order - Table ${activeTable?.tableNumber || "Direct"}`,
        totalPrice: totalAmount,
        subTotal: subtotal,
        taxTotal: taxAmount,
        discountTotal: discountAmount,
      };

      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to dispatch to kitchen");

      const createdOrderId = json.order?.id || json.data?.id;

      if (createdOrderId) {
        await fetch("/api/pos/restaurant/kitchen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            orderId: createdOrderId,
            staffName: operator?.name || userName,
          }),
        });
      }

      setKitchenSent(true);
      setOrderItems((prev) =>
        prev.map((i) => ({ ...i, kitchenStatus: "COOKING" }))
      );

      // Print Kitchen Order Ticket (KOT)
      const kotContent = `
        <div style="font-family: monospace; width: 280px; padding: 10px;">
          <h2 style="text-align: center; margin: 0 0 4px 0;">KITCHEN TICKET (KOT)</h2>
          <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 6px 0; margin: 8px 0; font-size: 13px;">
            <div><strong>TABLE: ${activeTable?.tableNumber || "N/A"}</strong> | Guests: ${openGuestCount}</div>
            <div>Server: ${operator?.name || userName} | Time: ${new Date().toLocaleTimeString()}</div>
          </div>
          <div style="font-size: 14px;">
            ${orderItems
              .map(
                (item) => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>[${item.course}] ${item.name}</span>
                <strong>x${item.quantity}</strong>
              </div>
            `
              )
              .join("")}
          </div>
          ${orderNotes ? `<div style="margin-top: 8px; font-size: 12px; font-style: italic;">Note: ${orderNotes}</div>` : ""}
        </div>
      `;
      printHtml(kotContent);
      await fetchRestaurantLayout();
      alert(`Order sent to kitchen for Table ${activeTable?.tableNumber}!`);
    } catch (err: any) {
      alert(err.message || "Failed to dispatch order to kitchen");
    }
  };

  // Hold Active Order
  const handleHoldOrder = () => {
    if (orderItems.length === 0) return alert("Ticket is empty.");
    const newHeld: POSHeldOrder = {
      id: `held-${Date.now()}`,
      sessionId: posSession?.id || "default",
      heldAt: new Date().toISOString(),
      note: `Table ${activeTable?.tableNumber || "Order"} - ${orderItems.length} items`,
      customer: currentCustomer,
      tableNumber: activeTable?.tableNumber,
      items: orderItems,
      subtotal,
      discount: discountPercent,
      tax: taxAmount,
      total: totalAmount,
    };
    setHeldOrders((prev) => [newHeld, ...prev]);
    setOrderItems([]);
    setActiveTable(null);
    alert("Ticket held successfully!");
  };

  // Resume Held Order
  const handleResumeHeldOrder = (held: POSHeldOrder) => {
    setOrderItems(held.items);
    if (held.customer) setCurrentCustomer(held.customer);
    setDiscountPercent(held.discount || 0);
    setHeldOrders((prev) => prev.filter((o) => o.id !== held.id));
  };

  // Discard Held Order
  const handleDeleteHeldOrder = (id: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Transfer Table
  const handleConfirmTransfer = async () => {
    if (!activeTable || !transferTargetTableId) return;
    setIsTransferring(true);
    try {
      const res = await fetch("/api/pos/restaurant/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          transferType: "TABLE",
          fromTableId: activeTable.id,
          toTableId: transferTargetTableId,
          staffId: operator?.id || userId || "staff-pos",
          staffName: operator?.name || userName,
          reason: transferReason || "Customer request",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Transfer failed");

      setShowTransferModal(false);
      setTransferTargetTableId("");
      setTransferReason("");
      await fetchRestaurantLayout();
      alert(`Party successfully transferred to destination table.`);
      setActiveTable(null);
    } catch (err: any) {
      alert(err.message || "Table transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  // Merge Tables
  const handleConfirmMerge = async () => {
    if (!activeTable || !mergeSourceTableId) return;
    setIsMerging(true);
    try {
      // Find orders for activeTable and source table
      const sourceTable = tables.find((t) => t.id === mergeSourceTableId);
      if (!sourceTable?.currentOrderId || !activeTable?.currentOrderId) {
        throw new Error("Both tables must have active kitchen orders to merge.");
      }

      const res = await fetch("/api/pos/restaurant/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          sourceOrderId: sourceTable.currentOrderId,
          targetOrderId: activeTable.currentOrderId,
          staffId: operator?.id || userId || "staff-pos",
          staffName: operator?.name || userName,
          reason: "Customer requested bill consolidation",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Merge failed");

      setShowMergeModal(false);
      setMergeSourceTableId("");
      await fetchRestaurantLayout();
      alert(`Bills merged successfully into Table ${activeTable.tableNumber}.`);
    } catch (err: any) {
      alert(err.message || "Bill merge failed");
    } finally {
      setIsMerging(false);
    }
  };

  // Split Bill
  const handleConfirmSplit = async () => {
    if (!activeTable?.currentOrderId) {
      return alert("Save/Send order to kitchen first before splitting.");
    }
    setIsSplitting(true);
    try {
      const splitAmount = totalAmount / splitCount;
      const splitsArray = Array.from({ length: splitCount }, (_, i) => ({
        splitIndex: i + 1,
        label: `Guest ${i + 1}`,
        amount: Number(splitAmount.toFixed(2)),
      }));

      const res = await fetch("/api/pos/restaurant/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          orderId: activeTable.currentOrderId,
          splitType: "EQUAL",
          splits: splitsArray,
          staffId: operator?.id || userId || "staff-pos",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Split failed");

      setShowSplitModal(false);
      alert(`Bill split into ${splitCount} equal payments of ${currencySymbol} ${splitAmount.toFixed(2)}.`);
    } catch (err: any) {
      alert(err.message || "Bill split failed");
    } finally {
      setIsSplitting(false);
    }
  };

  // Barcode Scanner Wedge Listener
  useBarcodeScannerWedge({
    onBarcodeScanned: (barcode) => {
      const clean = barcode.trim().toLowerCase();
      const match = initialProducts.find(
        (p) =>
          p.id.toLowerCase() === clean ||
          (p as any).barcode?.toLowerCase() === clean ||
          (p as any).sku?.toLowerCase() === clean ||
          p.name.toLowerCase() === clean
      );
      if (match) {
        scanAudio.playSuccess();
        handleAddItemToTicket(match);
      } else {
        scanAudio.playError();
      }
    },
    enabled: !showPaymentModal && !showAuthModal,
  });

  // M-Pesa STK Polling Cleanup
  const cleanupMpesaPolling = useCallback(() => {
    if (mpesaPollingRef.current) {
      clearInterval(mpesaPollingRef.current);
      mpesaPollingRef.current = null;
    }
    if (mpesaCountdownRef.current) {
      clearInterval(mpesaCountdownRef.current);
      mpesaCountdownRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupMpesaPolling();
  }, [cleanupMpesaPolling]);

  // Trigger M-Pesa STK Push to customer phone
  const handleSendStkPush = useCallback(async () => {
    const phone = mpesaPhoneInput || currentCustomer?.phone;
    if (!phone) return alert("Please enter customer M-Pesa phone number.");
    if (totalAmount <= 0) return alert("Ticket is empty or total is zero.");

    setMpesaStatus("sending");
    setMpesaReceipt(null);
    setMpesaCheckoutId(null);
    cleanupMpesaPolling();

    try {
      const res = await fetch("/api/pos/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          phone,
          amount: totalAmount,
          accountReference: activeTable?.tableNumber ? `TBL-${activeTable.tableNumber}` : (posSession?.terminalId || "REST-POS"),
          transactionDesc: `Restaurant POS - Table ${activeTable?.tableNumber || "POS"}`,
        }),
      });
      const data = await res.json();

      if (!data.success || !data.checkoutRequestId) {
        setMpesaStatus("failed");
        alert(data.error || "STK Push failed. Check phone number.");
        return;
      }

      setMpesaCheckoutId(data.checkoutRequestId);
      setMpesaStatus("pending");
      setMpesaCountdown(45);

      mpesaCountdownRef.current = setInterval(() => {
        setMpesaCountdown((prev) => {
          if (prev <= 1) {
            cleanupMpesaPolling();
            setMpesaStatus("failed");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      mpesaPollingRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/pos/mpesa/status?checkoutRequestId=${data.checkoutRequestId}`);
          const pollData = await pollRes.json();
          const txn = pollData.transaction;

          if (txn?.status === "COMPLETED") {
            cleanupMpesaPolling();
            setMpesaStatus("completed");
            setMpesaReceipt(txn.mpesaReceiptNumber || "CONFIRMED");
          } else if (txn?.status === "FAILED" || txn?.status === "TIMEOUT") {
            cleanupMpesaPolling();
            setMpesaStatus("failed");
          }
        } catch {}
      }, 2000);
    } catch (err: any) {
      setMpesaStatus("failed");
      alert(err.message || "Network error sending STK push.");
    }
  }, [mpesaPhoneInput, currentCustomer, totalAmount, companyId, activeTable, posSession, cleanupMpesaPolling]);

  // Send E-Receipt to Customer via WhatsApp
  const handleSendWhatsAppReceipt = async () => {
    const targetPhone = whatsappPhone || currentCustomer?.phone || mpesaPhoneInput;
    if (!targetPhone) return alert("Enter customer WhatsApp phone number.");

    setWhatsappSending(true);
    try {
      const res = await fetch("/api/pos/receipt/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: targetPhone,
          receiptType: "SALE_RECEIPT",
          storeName: storeFormData?.name || "Restaurant & Bar",
          data: {
            receiptNumber: lastSaleReceipt?.transactionId || `REC-${Date.now().toString().slice(-6)}`,
            items: lastSaleReceipt?.items || orderItems,
            finalTotal: lastSaleReceipt?.totalAmount || totalAmount,
            currency: currencySymbol,
            cashierName: operator?.name || userName || "Staff",
            customerName: currentCustomer?.name,
            tableNumber: lastSaleReceipt?.tableNumber || activeTable?.tableNumber,
            paymentMethod: paymentMethod.toUpperCase(),
            loyaltyPointsEarned: Math.floor((lastSaleReceipt?.totalAmount || totalAmount) * 0.01),
            loyaltyPointsBalance: (currentCustomer?.loyaltyPoints || 0) + Math.floor((lastSaleReceipt?.totalAmount || totalAmount) * 0.01),
          },
        }),
      });
      if (res.ok) {
        setWhatsappSent(true);
        setTimeout(() => setWhatsappSent(false), 4000);
      } else {
        const errJson = await res.json();
        alert(errJson.error || "Failed to send WhatsApp receipt");
      }
    } catch (e) {
      console.error("Failed to send WhatsApp receipt:", e);
      alert("Error sending WhatsApp receipt");
    } finally {
      setWhatsappSending(false);
    }
  };

  // Finalize Payment & Close Table
  const handleFinalizePayment = async () => {
    if (orderItems.length === 0) return alert("Ticket is empty.");

    if (paymentMethod === "credit" && !currentCustomer) {
      return alert("Customer account selection is required to process Credit sales.");
    }

    if (paymentMethod === "loyalty" && !currentCustomer) {
      return alert("Customer selection is required to redeem loyalty points.");
    }

    setIsProcessingPayment(true);
    try {
      const paymentOption =
        paymentMethod === "cash"
          ? "CASH"
          : paymentMethod === "card"
          ? "CARD"
          : paymentMethod === "mpesa"
          ? "MPESA"
          : paymentMethod === "credit"
          ? "CREDIT"
          : paymentMethod === "loyalty"
          ? "LOYALTY"
          : "MOBILE_MONEY";

      const paymentPayload = {
        companyId,
        cashierId: operator?.id || userId || "pos-staff",
        cashierName: operator?.name || userName,
        cashierEmail: operator?.email || "cashier@pos.local",
        posSessionId: posSession?.id,
        tableId: activeTable?.id,
        tableSessionId: activeSession?.id,
        tableNumber: activeTable?.tableNumber,
        guestCount: openGuestCount,
        serviceMode: openServiceMode,
        channel: "POS",
        actorType: "STAFF",
        isWalkIn: !currentCustomer,
        customerType: currentCustomer ? "IDENTIFIED" : "WALK_IN",
        customer: currentCustomer
          ? {
              name: currentCustomer.name,
              email: currentCustomer.email,
              phone: currentCustomer.phone,
            }
          : {
              name: `Table ${activeTable?.tableNumber || "POS"} Walk-in`,
              email: "walkin@pos.local",
              phone: "0000000000",
            },
        items: orderItems.map((item) => ({
          marketplaceListingId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.subtotal,
          course: item.course,
          kitchenStatus: "SERVED",
        })),
        totalPrice: totalAmount,
        subTotal: subtotal,
        taxTotal: taxAmount,
        discountTotal: discountAmount,
        paymentStatus: "PAID",
        paymentOption,
        paidAmount: totalAmount,
        mpesaReceipt: mpesaReceipt || undefined,
      };

      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to process payment");

      const orderId = json.order?.id || json.data?.id;

      // Credit and Loyalty Ledgers
      if (currentCustomer?.id) {
        if (paymentMethod === "credit") {
          fetch("/api/credit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "PURCHASE",
              companyId,
              consumerId: currentCustomer.id,
              amount: totalAmount,
              orderId,
              notes: `Restaurant Bill - Table ${activeTable?.tableNumber || "POS"}`,
            }),
          }).catch((err) => console.error("[POS] Credit record error:", err));
        } else if (paymentMethod === "loyalty") {
          fetch("/api/loyalty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "REDEEM",
              companyId,
              consumerId: currentCustomer.consumerId || currentCustomer.id,
              points: Math.min(currentCustomer.loyaltyPoints || 0, Math.ceil(totalAmount)),
              orderTotal: totalAmount,
              amount: totalAmount,
              orderId,
            }),
          }).catch((err) => console.error("[POS] Loyalty redeem error:", err));
        } else {
          fetch("/api/loyalty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "EARN",
              companyId,
              consumerId: currentCustomer.consumerId || currentCustomer.id,
              orderTotal: totalAmount,
              amount: totalAmount,
              orderId,
            }),
          }).catch((err) => console.error("[POS] Loyalty earn error:", err));
        }
      }

      // Print Customer Receipt
      const receiptData = {
        storeName: storeFormData?.name || "Restaurant & Bar",
        storeAddress: storeFormData?.address || "",
        storePhone: storeFormData?.contactPhone || "",
        transactionId: json.order?.trackingNumber || json.data?.trackingNumber || `TXN-${Date.now()}`,
        cashierName: operator?.name || userName,
        customerName: currentCustomer ? currentCustomer.name : "Walk-in Guest",
        currencySymbol,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        tableNumber: activeTable?.tableNumber,
        guestCount: openGuestCount,
        serviceMode: openServiceMode,
        items: orderItems.map((i) => ({
          name: `[${i.course}] ${i.name}`,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.subtotal,
        })),
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentMethod: paymentOption,
        amountReceived: Number(cashTendered) || totalAmount,
        changeGiven: Math.max(0, (Number(cashTendered) || totalAmount) - totalAmount),
      };

      const receiptHtml = standardReceipt.generateThermalHtml(receiptData);
      printHtml(receiptHtml);

      // Auto Cash Drawer Kick
      if (paymentMethod === "cash") {
        try {
          if ((window as any).AndroidBridge) {
            (window as any).AndroidBridge.postMessage(JSON.stringify({ type: "CASH_DRAWER_KICK" }));
          } else if ((window as any).chrome?.webview) {
            (window as any).chrome.webview.postMessage({ type: "CASH_DRAWER_KICK" });
          }
        } catch {}
      }

      // Close Table Session
      if (activeSession?.id) {
        await fetch(
          `/api/pos/restaurant/sessions?companyId=${encodeURIComponent(companyId)}&sessionId=${encodeURIComponent(activeSession.id)}`,
          { method: "DELETE" }
        );
      }

      // Record for WhatsApp and reprint
      setLastSaleReceipt({
        ...receiptData,
        orderId,
        items: orderItems,
        html: receiptHtml,
      });
      setShowSuccessModal(true);
      setShowPaymentModal(false);
      setOrderItems([]);
      setActiveTable(null);
      setActiveSession(null);
      await fetchRestaurantLayout();
    } catch (err: any) {
      alert(err.message || "Payment failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const printHtml = (html: string, docType = "POS_RECEIPT", docId?: string) => {
    executeUnifiedPrint(
      {
        protocolVersion: 1,
        actionKey: (docType as any) || "POS_RECEIPT",
        jobId: `job_${Date.now()}`,
        documentType: docType as any,
        documentId: docId || `DOC-${Date.now()}`,
        companyId,
        createdAt: new Date().toISOString(),
        document: {
          number: docId || `RCP-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          customer: { name: currentCustomer?.name || "Walk-in Guest" },
          cashierName: operator?.name || userName,
          orderType: storeFormData?.name || "Restaurant POS",
          items: orderItems.map((i) => ({
            name: `[${i.course}] ${i.name}`,
            quantity: i.quantity,
            price: i.price,
            total: i.subtotal,
          })),
          totals: {
            subtotal,
            discount: discountPercent,
            tax: taxAmount,
            total: totalAmount,
            paid: totalAmount,
            currency: currencySymbol,
          },
        },
      },
      html
    );
  };

  // Filtered Tables with Multi-term Case-Insensitive Search
  const filteredTables = useMemo(() => {
    const rawQuery = (tableSearchTerm || "").trim().toLowerCase();
    const queryTerms = rawQuery ? rawQuery.split(/[\s,]+/).filter(Boolean) : [];

    return tables.filter((t) => {
      const matchArea = selectedAreaId === "ALL" || t.areaId === selectedAreaId;
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      if (!matchArea || !matchStatus) return false;

      if (queryTerms.length === 0) return true;
      const haystack = [
        `Table ${t.tableNumber}`,
        t.tableNumber?.toString(),
        t.areaName,
        t.status,
        t.capacity ? `${t.capacity} guests` : "",
        t.currentOrder?.orderNumber,
        t.currentOrder?.customerName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return queryTerms.every((term) => haystack.includes(term));
    });
  }, [tables, selectedAreaId, statusFilter, tableSearchTerm]);

  // Filtered Menu Items with Multi-term Case-Insensitive Search
  const filteredProducts = useMemo(() => {
    const rawQuery = (searchTerm || "").trim().toLowerCase();
    const queryTerms = rawQuery ? rawQuery.split(/[\s,]+/).filter(Boolean) : [];

    return initialProducts.filter((p) => {
      const matchCat =
        selectedCategory === "ALL" ||
        p.productCategoryId === selectedCategory ||
        p.category === selectedCategory;

      if (!matchCat) return false;
      if (queryTerms.length === 0) return true;

      const haystack = [
        p.name,
        p.description,
        p.category,
        p.productCategoryId,
        (p as any).sku,
        (p as any).barcode,
        Array.isArray((p as any).tags) ? (p as any).tags.join(" ") : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return queryTerms.every((term) => haystack.includes(term));
    });
  }, [initialProducts, selectedCategory, searchTerm]);

  // Total Items & Amount in Active Ticket
  const totalTicketItemCount = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [orderItems]);

  const totalTicketSubtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + (item.totalPrice || item.price * (item.quantity || 1)), 0);
  }, [orderItems]);

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Header with Operator, Drawer, Staff PIN, Held Orders */}
      <POSSessionHeader
        companyId={companyId}
        companyName={storeFormData?.name || "Restaurant POS"}
        operator={operator}
        posSession={posSession}
        onEndSession={() => {
          if (posSession && operator) {
            setShowShiftModal(true);
          } else {
            setOperator(null);
            setPosSession(null);
            setShowAuthModal(true);
          }
        }}
        onLockTerminal={() => setShowAuthModal(true)}
        heldOrdersCount={heldOrders.length}
        onOpenHeldOrders={() => setShowHeldOrdersModal(true)}
        currencySymbol={currencySymbol}
      />

      {/* 2. Main Terminal Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* FLOOR MAP VIEW (When no active table is focused) */}
        {!activeTable ? (
          <div className="flex-1 flex flex-col overflow-hidden p-6 bg-slate-900/60">
            {/* Floor Navigation & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <TableCellsIcon className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
                  <span>Floor &amp; Dining Layout</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Select a table to open a session, take orders, or settle bills
                </p>
              </div>

              {/* Status Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-64 group">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search tables (number, area)..."
                    value={tableSearchTerm}
                    onChange={(e) => setTableSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800 text-white placeholder:text-slate-400 border border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                  />
                  {tableSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setTableSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition"
                      title="Clear table search"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
                  {["ALL", "AVAILABLE", "OCCUPIED", "WAITING_PAYMENT"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        statusFilter === st
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {st === "ALL" ? "All Tables" : st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Area Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 custom-scroll border-b border-slate-800">
              <button
                onClick={() => setSelectedAreaId("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedAreaId === "ALL"
                    ? "bg-white text-slate-900 border-white shadow-md"
                    : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                All Areas ({tables.length})
              </button>
              {areas.map((area) => {
                const count = tables.filter((t) => t.areaId === area.id).length;
                return (
                  <button
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      selectedAreaId === area.id
                        ? "bg-white text-slate-900 border-white shadow-md"
                        : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    {area.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Tables Grid */}
            <div className="flex-1 overflow-y-auto custom-scroll pr-2">
              {loadingTables ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <TableCellsIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="font-bold text-base">No tables found</p>
                  <p className="text-xs">Adjust your area or status filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredTables.map((table) => {
                    const isOccupied = table.status === "OCCUPIED" || table.status === "ORDERING";
                    const isWaitingPayment = table.status === "WAITING_PAYMENT";
                    const isAvailable = table.status === "AVAILABLE";

                    let statusBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                    if (isOccupied) statusBg = "bg-amber-500/10 border-amber-500/40 text-amber-400";
                    if (isWaitingPayment) statusBg = "bg-purple-500/10 border-purple-500/40 text-purple-300";

                    return (
                      <motion.div
                        key={table.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isAvailable) {
                            setOpenTableModalTarget(table);
                            setOpenGuestCount(table.capacity || 2);
                          } else {
                            handleSelectTable(table);
                          }
                        }}
                        className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-44 shadow-lg ${
                          isAvailable
                            ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500"
                            : isWaitingPayment
                            ? "bg-purple-950/20 border-purple-800/60 hover:border-purple-500"
                            : "bg-slate-900/90 border-slate-700/80 hover:border-amber-400"
                        }`}
                      >
                        {/* Table Top Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xl text-white">
                            Table {table.tableNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${statusBg}`}
                          >
                            {table.status}
                          </span>
                        </div>

                        {/* Middle Info */}
                        <div className="my-2 space-y-1">
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <UserGroupIcon className="w-4 h-4 text-slate-500" />
                            <span>
                              {table.guestCount ? `${table.guestCount} guests` : `Seats ${table.capacity}`}
                            </span>
                          </div>
                          {table.areaName && (
                            <p className="text-[11px] text-slate-500 font-semibold">{table.areaName}</p>
                          )}
                          {table.elapsedMinutes !== undefined && table.elapsedMinutes > 0 && (
                            <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                              <ClockIcon className="w-3.5 h-3.5" />
                              <span>{table.elapsedMinutes} mins</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Action / Total */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          {isAvailable ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <PlusIcon className="w-4 h-4" /> Open Table
                            </span>
                          ) : (
                            <span className="text-xs font-black text-white font-mono">
                              {currencySymbol} {(table.currentOrder?.totalPrice || 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE TABLE WORKSPACE: MENU & ORDER TICKET */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left: Dishes / Menu Catalogue */}
            <div className={`flex-1 flex-col p-3 sm:p-4 overflow-hidden border-r border-slate-800 bg-slate-900/40 ${mobileWorkspaceTab === 'MENU' ? 'flex' : 'hidden lg:flex'}`}>
              {/* Mobile View Switcher (< lg only) */}
              <div className="lg:hidden flex items-center bg-slate-800/90 p-1 rounded-2xl mb-3 border border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileWorkspaceTab("MENU")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    mobileWorkspaceTab === "MENU"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BuildingStorefrontIcon className="w-4 h-4" />
                  <span>Menu Dishes ({filteredProducts.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileWorkspaceTab("TICKET")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    mobileWorkspaceTab === "TICKET"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  <span>Ticket ({orderItems.length})</span>
                  {totalTicketItemCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-[10px] text-white font-mono font-black">
                      {currencySymbol} {totalTicketSubtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  )}
                </button>
              </div>

              {/* Back to Floor + Table Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setActiveTable(null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition flex items-center gap-1 text-xs font-bold shrink-0"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Floor</span>
                  </button>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>Table {activeTable.tableNumber}</span>
                      <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40">
                        {openGuestCount} Guests
                      </span>
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-none">
                      {activeTable.areaName || "Main Hall"} • {operator?.name || userName}
                    </p>
                  </div>
                </div>

                {/* Course Selector Tabs */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 overflow-x-auto no-scrollbar max-w-full">
                  {(["STARTER", "MAIN", "DESSERT", "BEVERAGE"] as const).map((course) => (
                    <button
                      key={course}
                      onClick={() => setActiveCourse(course)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition whitespace-nowrap ${
                        activeCourse === course
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Categories Bar - Responsive & High Contrast */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4">
                <div className="relative flex-1 group">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search menu dishes (e.g. beef burger, fries)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-800 text-white placeholder:text-slate-400 border-2 border-slate-700 focus:border-indigo-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition"
                      title="Clear search"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold border-2 border-slate-700 text-sm focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="ALL">All Categories ({initialProducts.length})</option>
                  {initialCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Grid */}
              <div className="flex-1 overflow-y-auto custom-scroll pr-1 sm:pr-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 pb-20 lg:pb-0">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleAddItemToTicket(product)}
                    className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 hover:border-indigo-500 cursor-pointer flex flex-col justify-between group shadow-md"
                  >
                    <div className="aspect-video w-full rounded-xl bg-slate-700/50 overflow-hidden mb-2 relative">
                      <img
                        src={product.images?.[0] || "https://placehold.co/200x120?text=Dish"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[10px] font-bold text-slate-300 px-1.5 py-0.5 rounded">
                        {activeCourse}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white truncate">{product.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{product.category}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-black text-indigo-400 text-sm">
                        {currencySymbol} {(product.sellingPrice || product.finalPrice || 0).toFixed(2)}
                      </span>
                      <div className="p-1 rounded-lg bg-indigo-600/30 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <PlusIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Active Ticket & Order Sidebar */}
            <div className={`w-full lg:w-[440px] flex-col bg-slate-900 border-l border-slate-800 p-4 sm:p-5 overflow-y-auto ${mobileWorkspaceTab === 'TICKET' ? 'flex' : 'hidden lg:flex'}`}>
              {/* Back to Menu on Mobile (< lg) */}
              <div className="lg:hidden pb-3 mb-3 border-b border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMobileWorkspaceTab("MENU")}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  <span>Add More Dishes</span>
                </button>
                <span className="text-xs font-black text-indigo-400 font-mono">
                  {currencySymbol} {totalTicketSubtotal.toFixed(2)}
                </span>
              </div>

              {/* Ticket Header & Customer */}
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBagIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-black text-base text-white">
                      Order Ticket • Table {activeTable.tableNumber}
                    </h3>
                  </div>
                  {kitchenSent && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <FireIcon className="w-3 h-3" /> In Kitchen
                    </span>
                  )}
                </div>

                {/* Optional Customer Selector */}
                <POSCustomerSelector
                  companyId={companyId}
                  selectedCustomer={currentCustomer}
                  onSelectCustomer={setCurrentCustomer}
                  required={false}
                />
              </div>

              {/* Ticket Items List Grouped by Course */}
              <div className="flex-1 overflow-y-auto custom-scroll py-3 space-y-2 pr-1">
                {orderItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <ShoppingBagIcon className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs font-bold">Ticket is empty</p>
                    <p className="text-[10px]">Select items from menu catalogue</p>
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-indigo-900/60 text-indigo-300">
                            {item.course}
                          </span>
                          <h5 className="font-bold text-xs text-white truncate">{item.name}</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {currencySymbol} {item.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateItemQuantity(item.cartItemId, -1)}
                          className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                        >
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs w-5 text-center text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateItemQuantity(item.cartItemId, 1)}
                          className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-black text-xs text-indigo-300 ml-2 w-16 text-right">
                          {currencySymbol} {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Operational Actions (Transfer, Merge, Split, Hold) */}
              <div className="py-2.5 border-t border-slate-800 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition border border-slate-700"
                  title="Move to another table"
                >
                  <ArrowsRightLeftIcon className="w-4 h-4 text-sky-400" />
                  <span>Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMergeModal(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition border border-slate-700"
                  title="Merge bills from another table"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 text-amber-400" />
                  <span>Merge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSplitModal(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition border border-slate-700"
                  title="Split bill between guests"
                >
                  <ScissorsIcon className="w-4 h-4 text-purple-400" />
                  <span>Split</span>
                </button>

                <button
                  type="button"
                  onClick={handleHoldOrder}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition border border-slate-700"
                  title="Hold cart and free terminal"
                >
                  <ClockIcon className="w-4 h-4 text-emerald-400" />
                  <span>Hold</span>
                </button>
              </div>

              {/* Financial Breakdown */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">
                    {currencySymbol} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Discount</span>
                  <span className="font-mono text-rose-400">
                    -{currencySymbol} {discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax (16% VAT)</span>
                  <span className="font-mono text-slate-200">
                    {currencySymbol} {taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Due</span>
                  <span className="font-mono text-indigo-400 text-lg">
                    {currencySymbol} {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Kitchen KOT & Settlement */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSendToKitchen}
                  disabled={orderItems.length === 0}
                  className="py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <FireIcon className="w-4 h-4" />
                  <span>Send KOT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={orderItems.length === 0}
                  className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CreditCardIcon className="w-4 h-4" />
                  <span>Pay & Close</span>
                </button>
              </div>
            </div>

            {/* Floating Mobile Bottom Action Bar (When on Menu view and items exist) */}
            {mobileWorkspaceTab === "MENU" && orderItems.length > 0 && (
              <div className="lg:hidden fixed bottom-3 left-3 right-3 bg-indigo-600/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-indigo-400/30 z-30 animate-in fade-in slide-in-from-bottom-3">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 text-xs font-black">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono">{totalTicketItemCount} items</span>
                    <span className="truncate">Table {activeTable.tableNumber}</span>
                  </div>
                  <p className="text-base font-black font-mono mt-0.5">
                    {currencySymbol} {totalTicketSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileWorkspaceTab("TICKET")}
                  className="px-4 py-2 bg-white text-indigo-900 font-black rounded-xl text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <span>View Ticket</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Open Table Session Modal */}
      {openTableModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">
                Open Table {openTableModalTarget.tableNumber}
              </h3>
              <button
                onClick={() => setOpenTableModalTarget(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Guest Count</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenGuestCount((prev) => Math.max(1, prev - 1))}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={openGuestCount}
                    onChange={(e) => setOpenGuestCount(Number(e.target.value))}
                    className="flex-1 text-center py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setOpenGuestCount((prev) => prev + 1)}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Service Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["DINE_IN", "TAKEAWAY", "COUNTER"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setOpenServiceMode(m)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        openServiceMode === m
                          ? "bg-indigo-600 border-indigo-500 text-white shadow"
                          : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      {m.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Table Notes / Requests
                </label>
                <textarea
                  placeholder="e.g. Window preference, High chair requested..."
                  value={openTableNotes}
                  onChange={(e) => setOpenTableNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmOpenTable}
                disabled={isOpeningTable}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isOpeningTable ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Open Table & Start Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Transfer Table Modal */}
      {showTransferModal && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">
                Transfer Table {activeTable.tableNumber}
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Select Destination Table
                </label>
                <select
                  value={transferTargetTableId}
                  onChange={(e) => setTransferTargetTableId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Target Table --</option>
                  {tables
                    .filter((t) => t.id !== activeTable.id && t.status === "AVAILABLE")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} ({t.areaName || "Area"}, Seats {t.capacity})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Reason</label>
                <input
                  placeholder="e.g. Customer requested outdoor seating"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={!transferTargetTableId || isTransferring}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isTransferring ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowsRightLeftIcon className="w-4 h-4" />
                    <span>Complete Table Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Merge Bills Modal */}
      {showMergeModal && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">
                Merge Into Table {activeTable.tableNumber}
              </h3>
              <button
                onClick={() => setShowMergeModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Consolidates all items from the chosen table into Table {activeTable.tableNumber}'s bill
                and marks the source table available.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Select Source Table to Merge
                </label>
                <select
                  value={mergeSourceTableId}
                  onChange={(e) => setMergeSourceTableId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Occupied Table --</option>
                  {tables
                    .filter((t) => t.id !== activeTable.id && (t.status === "OCCUPIED" || t.status === "ORDERING"))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} ({currencySymbol} {(t.currentOrder?.totalPrice || 0).toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleConfirmMerge}
                disabled={!mergeSourceTableId || isMerging}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isMerging ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span>Merge Bills</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Split Bill Modal */}
      {showSplitModal && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">Split Bill</h3>
              <button
                onClick={() => setShowSplitModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex justify-between items-center text-sm">
                <span className="text-slate-400">Total to Split:</span>
                <span className="font-black text-white font-mono">
                  {currencySymbol} {totalAmount.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Number of Ways (Equal Split)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSplitCount((prev) => Math.max(2, prev - 1))}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-lg">
                    {splitCount} Guests
                  </div>
                  <button
                    type="button"
                    onClick={() => setSplitCount((prev) => prev + 1)}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/50 text-center">
                <p className="text-xs text-indigo-300 font-semibold">Each Guest Pays:</p>
                <p className="text-2xl font-black text-white font-mono mt-0.5">
                  {currencySymbol} {(totalAmount / splitCount).toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmSplit}
                disabled={isSplitting}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isSplitting ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ScissorsIcon className="w-4 h-4" />
                    <span>Confirm {splitCount}-Way Split</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Pay & Close Table Checkout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-white">Settle & Close Table</h3>
                <p className="text-xs text-slate-400">
                  {activeTable ? `Table ${activeTable.tableNumber}` : "POS Sale"} • Total:{" "}
                  <strong className="text-white font-mono">
                    {currencySymbol} {totalAmount.toFixed(2)}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                { id: "cash", label: "Cash", icon: BanknotesIcon },
                { id: "mpesa", label: "M-Pesa STK", icon: DevicePhoneMobileIcon },
                { id: "card", label: "Card", icon: CreditCardIcon },
                { id: "credit", label: "Credit", icon: UserCircleIcon },
                { id: "loyalty", label: "Loyalty", icon: StarIcon },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition text-center ${
                    paymentMethod === m.id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="text-[11px] font-bold leading-tight">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Cash Drawer Calculator */}
            {paymentMethod === "cash" && (
              <div className="space-y-3 mb-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <label className="text-xs font-bold text-slate-300 block">Amount Tendered</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-mono text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={totalAmount.toFixed(2)}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Quick Cash Presets */}
                <div className="flex gap-2">
                  {[totalAmount, Math.ceil(totalAmount / 10) * 10, Math.ceil(totalAmount / 50) * 50, Math.ceil(totalAmount / 100) * 100].map(
                    (preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashTendered(preset.toString())}
                        className="flex-1 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-mono font-bold text-slate-200 transition"
                      >
                        {preset.toFixed(0)}
                      </button>
                    )
                  )}
                </div>

                {/* Change Due Display */}
                {Number(cashTendered) > totalAmount && (
                  <div className="flex justify-between items-center pt-2 text-sm">
                    <span className="text-emerald-400 font-bold">Change Due:</span>
                    <span className="text-emerald-400 font-black font-mono text-base">
                      {currencySymbol} {(Number(cashTendered) - totalAmount).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* M-Pesa STK Push Section */}
            {paymentMethod === "mpesa" && (
              <div className="space-y-3 mb-4 bg-emerald-950/20 p-4 rounded-2xl border border-emerald-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Safaricom M-Pesa STK Push
                  </span>
                  {mpesaStatus === "pending" && (
                    <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5 animate-spin" />
                      {mpesaCountdown}s left
                    </span>
                  )}
                  {mpesaStatus === "completed" && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" /> Confirmed
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Customer M-Pesa Phone (e.g. 0712345678)"
                    value={mpesaPhoneInput || currentCustomer?.phone || ""}
                    onChange={(e) => setMpesaPhoneInput(e.target.value)}
                    disabled={mpesaStatus === "pending" || mpesaStatus === "completed"}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleSendStkPush}
                    disabled={mpesaStatus === "sending" || mpesaStatus === "pending" || mpesaStatus === "completed"}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    {mpesaStatus === "sending" || mpesaStatus === "pending" ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <DevicePhoneMobileIcon className="w-4 h-4" />
                    )}
                    <span>{mpesaStatus === "completed" ? "Sent ✓" : "Send STK"}</span>
                  </button>
                </div>

                {mpesaReceipt && (
                  <div className="p-2.5 bg-emerald-900/40 rounded-xl border border-emerald-700/50 flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-medium">M-Pesa Receipt Ref:</span>
                    <span className="font-mono font-bold text-white uppercase">{mpesaReceipt}</span>
                  </div>
                )}
                {mpesaStatus === "failed" && (
                  <p className="text-xs text-rose-400 font-medium">
                    STK Push timed out or cancelled on handset. Try again or tender via another method.
                  </p>
                )}
              </div>
            )}

            {/* Customer Credit Account Section */}
            {paymentMethod === "credit" && (
              <div className="space-y-3 mb-4 bg-sky-950/20 p-4 rounded-2xl border border-sky-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Charge to Customer Credit Account
                  </span>
                </div>
                {currentCustomer ? (
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs space-y-1">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <UserCircleIcon className="w-4 h-4 text-sky-400" />
                      {currentCustomer.name} ({currentCustomer.phone || "No phone"})
                    </p>
                    <p className="text-slate-400">
                      Amount <strong className="text-white font-mono">{currencySymbol} {totalAmount.toFixed(2)}</strong> will be booked as an outstanding credit invoice due under payment terms.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/50 text-xs text-amber-300 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Please select or search for an identified customer above to charge on credit.</span>
                  </div>
                )}
              </div>
            )}

            {/* Loyalty Points Section */}
            {paymentMethod === "loyalty" && (
              <div className="space-y-3 mb-4 bg-amber-950/20 p-4 rounded-2xl border border-amber-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Redeem Customer Loyalty Points
                  </span>
                </div>
                {currentCustomer ? (
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Available Points:</span>
                      <span className="font-black text-amber-400 font-mono text-sm">
                        {currentCustomer.loyaltyPoints || 0} pts
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Redemption Value (1 pt = {currencySymbol} 1):</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {currencySymbol} {((currentCustomer.loyaltyPoints || 0) * 1).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-1.5">
                      Points will be debited upon completion to settle this bill.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/50 text-xs text-amber-300 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Select an identified customer to redeem loyalty points.</span>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Payment Button */}
            <button
              type="button"
              onClick={handleFinalizePayment}
              disabled={isProcessingPayment}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-base shadow-xl shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PrinterIcon className="w-5 h-5" />
                  <span>Complete Payment & Settle Table</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 8. Post-Sale Success & WhatsApp E-Receipt Modal */}
      {showSuccessModal && lastSaleReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-950/60 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-800/50">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-white">Table Settled & Closed</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Receipt #{lastSaleReceipt.transactionId}
              {lastSaleReceipt.tableNumber ? ` • Table ${lastSaleReceipt.tableNumber}` : ""}
            </p>
            <p className="text-2xl font-black text-emerald-400 my-2 font-mono">
              {currencySymbol} {(lastSaleReceipt.totalAmount || 0).toFixed(2)}
            </p>

            {/* Instant WhatsApp Receipt Row */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-left">
                Send Digital Receipt via WhatsApp
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Customer Phone (e.g. 0712345678)"
                  value={whatsappPhone || currentCustomer?.phone || mpesaPhoneInput || ""}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  disabled={whatsappSending}
                  onClick={handleSendWhatsAppReceipt}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  {whatsappSending ? (
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <DevicePhoneMobileIcon className="w-3.5 h-3.5" />
                  )}
                  <span>{whatsappSent ? "Sent ✓" : "WhatsApp"}</span>
                </button>
              </div>
              {whatsappSent && (
                <p className="text-[11px] text-emerald-400 mt-1.5 font-medium text-left">
                  ✓ Digital receipt delivered to customer&apos;s WhatsApp
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (lastSaleReceipt.html) {
                    printHtml(lastSaleReceipt.html);
                  }
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <PrinterIcon className="w-4 h-4" />
                <span>Reprint Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Staff PIN Login Modal */}
      <POSOperatorModal
        isOpen={showAuthModal}
        companyId={companyId}
        terminalId={posSession?.terminalId || "T01"}
        storeName={storeFormData?.name || "Restaurant POS"}
        currentUserName={userName}
        currentUserId={userId}
        currencySymbol={currencySymbol}
        onSuccess={(data) => {
          setOperator(data.operator);
          setPosSession(data.posSession);
          setShowAuthModal(false);
        }}
        onClose={() => setShowAuthModal(false)}
      />

      {/* 8b. Shift Open / Close & Z-Report Modal */}
      <POSShiftModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        posSession={posSession}
        operator={operator}
        companyId={companyId}
        currencySymbol={currencySymbol}
        onShiftClosed={() => {
          setShowShiftModal(false);
          setOperator(null);
          setPosSession(null);
          setShowAuthModal(true);
        }}
      />

      {/* 9. Held Orders Modal */}
      <POSHeldOrdersModal
        isOpen={showHeldOrdersModal}
        onClose={() => setShowHeldOrdersModal(false)}
        heldOrders={heldOrders}
        onResumeOrder={handleResumeHeldOrder}
        onDeleteHeldOrder={handleDeleteHeldOrder}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}