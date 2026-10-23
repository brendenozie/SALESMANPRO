/**
 * Customer-Facing Display (CFD) Synchronization Client
 * 
 * Uses the browser BroadcastChannel API to mirror POS cart, checkout,
 * and payment status in real-time to a secondary customer-facing monitor.
 */

export interface CFDItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variantText?: string;
  image?: string;
}

export interface CFDPayload {
  type: 'SYNC' | 'CLEAR' | 'PAYMENT_PENDING' | 'PAYMENT_SUCCESS';
  storeName: string;
  storeLogo?: string;
  terminalId: string;
  cashierName: string;
  currencySymbol: string;
  items: CFDItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  mpesaPaybill?: string;
  mpesaTill?: string;
  mpesaAccount?: string;
  amountTendered?: number;
  changeDue?: number;
  timestamp: number;
}

const CFD_CHANNEL_NAME = 'salesmanpro_pos_cfd_channel';

/**
 * Broadcasts an update from the cashier terminal to the customer-facing screen.
 */
export function broadcastToCFD(payload: CFDPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const channel = new BroadcastChannel(CFD_CHANNEL_NAME);
    channel.postMessage(payload);
    channel.close();
  } catch (err) {
    console.warn('[CFD Broadcaster] BroadcastChannel error:', err);
  }
}

/**
 * Opens the CFD window on the secondary display or pops up a new tab/window.
 */
export function openCustomerFacingDisplay(): Window | null {
  if (typeof window === 'undefined') return null;
  const url = '/pos/cfd';
  const features = 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no';
  const win = window.open(url, 'SalesmanPro_CFD_Window', features);
  if (win) {
    win.focus();
  }
  return win;
}
