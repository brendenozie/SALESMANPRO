/**
 * SalesmanPro Kitchen & Bar Ticket Router
 *
 * Classifies cart items into KITCHEN_ORDER, BAR_ORDER, or POS_RECEIPT
 * based on product tags, category name keywords, and optional manual overrides.
 * Builds NormalizedPrintPayload objects for each distinct ticket destination.
 */

import { NormalizedPrintPayload, PrintingAction, NormalizedPrintItem } from './unifiedPrintClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KitchenRoute = 'KITCHEN_ORDER' | 'BAR_ORDER' | 'COUNTER';

export interface RoutedCartItem {
  id?: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
  category?: string;
  kitchenCategory?: KitchenRoute; // manual override from cashier
  tags?: string[];
}

export interface KitchenTicketGroup {
  route: KitchenRoute;
  actionKey: PrintingAction;
  items: NormalizedPrintItem[];
  tableNumber?: string;
  orderNumber: string;
  cashierName: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Keyword classifiers
// ---------------------------------------------------------------------------

/** Keywords that signal a food/kitchen item */
const KITCHEN_KEYWORDS = [
  'food', 'meal', 'dish', 'burger', 'pizza', 'pasta', 'sandwich', 'salad',
  'soup', 'steak', 'chicken', 'fish', 'rice', 'chips', 'fries', 'grill',
  'roast', 'noodle', 'spaghetti', 'curry', 'biryani', 'ugali', 'nyama',
  'pilau', 'chapati', 'samosa', 'snack', 'starter', 'main', 'dessert',
  'cake', 'pudding', 'appetizer', 'entree', 'side', 'hot dog',
];

/** Keywords that signal a bar/beverage item */
const BAR_KEYWORDS = [
  'drink', 'beer', 'wine', 'spirit', 'whisky', 'vodka', 'rum', 'gin',
  'cocktail', 'juice', 'soda', 'water', 'coffee', 'tea', 'latte',
  'espresso', 'smoothie', 'milkshake', 'shake', 'mocktail', 'brew',
  'ale', 'lager', 'stout', 'cider', 'champagne', 'prosecco', 'liqueur',
  'beverage', 'soft drink', 'energy drink', 'fizzy', 'cola', 'fanta',
  'sprite', 'pepsi', 'hot chocolate', 'cappuccino', 'americano',
];

// ---------------------------------------------------------------------------
// Classification engine
// ---------------------------------------------------------------------------

/**
 * Classify a single cart item into a kitchen route.
 * Priority: manual override > tags match > category keyword > name keyword > COUNTER
 */
export function classifyItem(item: RoutedCartItem): KitchenRoute {
  // 1. Respect explicit cashier override
  if (item.kitchenCategory) return item.kitchenCategory;

  const searchStr = [
    item.name,
    item.category || '',
    ...(item.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  // 2. Check bar keywords first (more specific)
  for (const kw of BAR_KEYWORDS) {
    if (searchStr.includes(kw)) return 'BAR_ORDER';
  }

  // 3. Check kitchen keywords
  for (const kw of KITCHEN_KEYWORDS) {
    if (searchStr.includes(kw)) return 'KITCHEN_ORDER';
  }

  // 4. Default: send to counter (POS_RECEIPT only — no kitchen ticket)
  return 'COUNTER';
}

// ---------------------------------------------------------------------------
// Ticket builder
// ---------------------------------------------------------------------------

const ROUTE_ACTION_MAP: Record<KitchenRoute, PrintingAction> = {
  KITCHEN_ORDER: 'KITCHEN_ORDER',
  BAR_ORDER: 'BAR_ORDER',
  COUNTER: 'POS_RECEIPT',
};

/**
 * Group classified items into distinct KitchenTicketGroup objects.
 * Returns only groups that have at least one item.
 * COUNTER items are excluded (they appear on the main POS receipt only).
 */
export function buildKitchenTicketGroups(
  items: RoutedCartItem[],
  orderNumber: string,
  cashierName: string,
  tableNumber?: string,
): KitchenTicketGroup[] {
  const groups: Map<KitchenRoute, KitchenTicketGroup> = new Map();

  for (const item of items) {
    const route = classifyItem(item);
    if (route === 'COUNTER') continue; // Counter items skip kitchen tickets

    if (!groups.has(route)) {
      groups.set(route, {
        route,
        actionKey: ROUTE_ACTION_MAP[route],
        items: [],
        orderNumber,
        cashierName,
        tableNumber,
      });
    }

    groups.get(route)!.items.push({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      notes: item.notes,
      category: item.category,
    });
  }

  return Array.from(groups.values());
}

// ---------------------------------------------------------------------------
// Payload factory
// ---------------------------------------------------------------------------

/**
 * Build a NormalizedPrintPayload for a kitchen or bar ticket.
 * Uses a minimal document structure — kitchen tickets don't need pricing.
 */
export function buildKitchenPrintPayload(
  group: KitchenTicketGroup,
  opts: {
    companyId: string;
    storeId?: string;
    deviceId?: string;
    targetPrinterId?: string | null;
    currency?: string;
  }
): NormalizedPrintPayload {
  const now = new Date();
  const ticketLabel = group.route === 'KITCHEN_ORDER' ? 'KITCHEN TICKET' : 'BAR TICKET';

  return {
    protocolVersion: 1,
    jobId: `${group.route.toLowerCase()}_${group.orderNumber}_${Date.now()}`,
    actionKey: group.actionKey,
    documentType: group.route,
    documentId: group.orderNumber,
    companyId: opts.companyId,
    storeId: opts.storeId,
    deviceId: opts.deviceId,
    createdAt: now.toISOString(),
    targetPrinterId: opts.targetPrinterId || undefined,
    document: {
      number: group.orderNumber,
      date: now.toISOString(),
      table: group.tableNumber,
      cashierName: group.cashierName,
      orderType: ticketLabel,
      items: group.items,
      totals: {
        subtotal: group.items.reduce((s, i) => s + i.total, 0),
        total: group.items.reduce((s, i) => s + i.total, 0),
        currency: opts.currency || 'KES',
      },
      footer: group.route === 'KITCHEN_ORDER'
        ? '*** KITCHEN COPY — NOT A RECEIPT ***'
        : '*** BAR COPY — NOT A RECEIPT ***',
    },
  };
}

// ---------------------------------------------------------------------------
// HTML ticket renderer (ESC-POS–optimised for 80mm thermal)
// ---------------------------------------------------------------------------

export function renderKitchenTicketHtml(
  group: KitchenTicketGroup,
  opts: { storeName?: string } = {}
): string {
  const isKitchen = group.route === 'KITCHEN_ORDER';
  const headerColor = isKitchen ? '#e65100' : '#1565c0';
  const headerLabel = isKitchen ? '🍳 KITCHEN ORDER' : '🍹 BAR ORDER';

  const itemRows = group.items
    .map(
      (item) => `
      <tr>
        <td style="padding:4px 0; font-size:16px; font-weight:bold;">${item.name}</td>
        <td style="padding:4px 8px; font-size:20px; font-weight:900; text-align:right; color:${headerColor};">×${item.quantity}</td>
      </tr>
      ${item.notes ? `<tr><td colspan="2" style="font-size:12px; color:#555; padding:0 0 6px 8px;">↳ ${item.notes}</td></tr>` : ''}
    `
    )
    .join('');

  return `
    <div style="font-family: 'Courier New', monospace; width: 280px; margin: 0 auto; padding: 12px; background:#fff; color:#000;">
      <div style="text-align:center; background:${headerColor}; color:#fff; padding:10px 0; border-radius:4px; margin-bottom:10px;">
        <div style="font-size:20px; font-weight:900; letter-spacing:2px;">${headerLabel}</div>
        ${opts.storeName ? `<div style="font-size:12px; opacity:0.85;">${opts.storeName}</div>` : ''}
      </div>

      <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:2px;">
        <span><b>Order #</b> ${group.orderNumber}</span>
        <span>${new Date().toLocaleTimeString()}</span>
      </div>
      ${group.tableNumber ? `<div style="font-size:14px; font-weight:bold; margin-bottom:4px;">Table: ${group.tableNumber}</div>` : ''}
      <div style="font-size:12px; color:#666; margin-bottom:8px;">Cashier: ${group.cashierName}</div>

      <hr style="border:1px dashed #000; margin:8px 0;" />

      <table style="width:100%; border-collapse:collapse;">
        <tbody>${itemRows}</tbody>
      </table>

      <hr style="border:2px solid #000; margin:10px 0;" />
      <div style="text-align:center; font-size:11px; color:#666; font-style:italic;">
        ${isKitchen ? 'Kitchen Copy — Not a Receipt' : 'Bar Copy — Not a Receipt'}
      </div>
    </div>
  `;
}
