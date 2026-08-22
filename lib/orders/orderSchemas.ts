import { z } from "zod";

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

export const selectedOptionSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  extraPrice: z.number().nonnegative().optional(),
});

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
