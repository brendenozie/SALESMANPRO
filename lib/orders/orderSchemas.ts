import { z } from "zod";

export const selectedOptionSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  extraPrice: z.number().nonnegative().optional(),
});

export const unifiedOrderItemSchema = z.object({
  marketplaceListingId: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive().optional(),
  totalPrice: z.number().positive().optional(),
  date: z.string().nullable().optional(),
  timeSlot: z.string().nullable().optional(),
  serviceNotes: z.string().nullable().optional(),
  course: z.string().nullable().optional(),
  kitchenStatus: z.string().nullable().optional(),
  selectedOptions: z.array(selectedOptionSchema).optional(),
  appointmentId: z.string().optional(),
  productId: z.string().optional(),
});

export const unifiedOrderSchema = z.object({
  name: z.string().min(1).default("Walk-in Customer"),
  email: z.string().optional().default("walkin@pos.local"),
  phone: z.string().optional().default("N/A"),
  mpesaPhone: z.string().optional(),
  consumerId: z.string().optional(),
  companyId: z.string().optional(),
  orderType: z
    .enum(["PRODUCT", "SERVICE", "RENTAL", "BOOKING", "OTHER"])
    .default("PRODUCT"),
  source: z
    .enum(["WEBSITE", "IN_PERSON", "MOBILE", "WHATSAPP", "AI", "POS"])
    .default("WEBSITE"),
  paymentOption: z
    .enum([
      "cod",
      "pickupatshop",
      "mpesa",
      "card",
      "paystack",
      "ghuba",
      "stripe",
      "paypal",
      "cash",
      "split",
      "pending",
    ])
    .default("cod"),
  items: z.array(unifiedOrderItemSchema).min(1),
  shippingAddress: z.record(z.string(), z.any()).optional(),
  shippingMethod: z.string().optional(),
  promoCode: z.string().optional(),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  idempotencyKey: z.string().optional(),
  customerPin: z.string().optional(),
  terminalId: z.string().optional(),
  cashierName: z.string().optional(),
  posSessionId: z.string().optional(),
  operatorId: z.string().optional(),
  tableId: z.string().optional(),
  tableSessionId: z.string().optional(),
  tableNumber: z.string().optional(),
  guestCount: z.number().int().optional(),
  serviceMode: z.string().optional(),
  kitchenStatus: z.string().optional(),
  isHeld: z.boolean().optional(),
  heldNote: z.string().optional(),
  isWalkIn: z.boolean().optional(),
  customerType: z.string().optional(),
  channel: z.enum(["WEBSITE", "MOBILE", "WHATSAPP", "FACEBOOK", "INSTAGRAM", "POS", "API", "AI"]).optional(),
  actorType: z.enum(["CUSTOMER", "USER", "STAFF", "AI", "SYSTEM"]).optional(),
  paymentData: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type UnifiedOrderRequest = z.infer<typeof unifiedOrderSchema>;

export const paymentOptionSchema = z.enum([
  "cod",
  "pickupatshop",
  "mpesa",
  "card",
  "paystack",
  "ghuba",
  "stripe",
  "paypal",
  "cash",
  "split",
  "pending",
]);

export const orderItemSchema = z.object({
  marketplaceListingId: z.string().min(1),
  date: z.string().nullable().optional(),
  timeSlot: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  totalPrice: z.number().positive(),
  selectedOptions: z.array(selectedOptionSchema).optional(),
  serviceNotes: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
});

export const normalizedOrderSchema = z.object({
  companyId: z.string().min(1).nullable().optional(),
  consumerId: z.string().min(1).nullable().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  mpesaPhone: z.string().nullable().optional(),
  paymentOption: paymentOptionSchema.default("cod"),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  totalPrice: z.number().positive(),
  totalFinalPrice: z.number().positive().optional(),
  shippingAddress: z.record(z.string(), z.unknown()).nullable().optional(),
  shippingMethod: z.string().nullable().optional(),
  paymentData: z.record(z.string(), z.unknown()).nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  idempotencyKey: z.string().uuid().nullable().optional(),
  orderSource: z.enum(["WEBSITE", "MOBILE", "IN_PERSON", "WHATSAPP"]).default("WEBSITE"),
  isServiceOrder: z.boolean().default(false),
});

export type NormalizedOrderInput = z.infer<typeof normalizedOrderSchema>;
