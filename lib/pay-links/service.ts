import prisma from "@/server/db/prismadb";
import crypto from "crypto";
import { getAvailableStorePaymentMethods } from "@/lib/payments/resolver";

export interface CreateDirectPayLinkInput {
  companyId: string;
  storeId?: string;
  productId?: string;
  marketplaceListingId?: string;
  name?: string;
  title?: string;
  image?: string;
  basePrice?: number;
  currency?: string;
  variantConfig?: Record<string, string> | null;
  defaultQuantity?: number;
  allowQuantityChange?: boolean;
  allowVariantChange?: boolean;
  checkoutType?: "BUY_VARIANT" | "CHOOSE_VARIANT" | "FIXED_CONFIGURATION";
  fixedPrice?: number | null;
  discountRules?: Record<string, any> | null;
  expiresAt?: Date | string | null;
  maxUses?: number | null;
  source?: string;
  campaignId?: string;
  creatorId?: string;
  subdomain?: string;
}

export interface DirectPayLinkResolution {
  success: boolean;
  error?: string;
  code?: string;
  link?: {
    id: string;
    code: string;
    name: string | null;
    status: string;
    checkoutType: string;
    defaultQuantity: number;
    allowQuantityChange: boolean;
    allowVariantChange: boolean;
    variantConfig: Record<string, string> | null;
    fixedPrice: number | null;
    currency: string;
    expiresAt: string | null;
    maxUses: number | null;
    successfulUses: number;
  };
  product?: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    price: number;
    sellingPrice: number;
    currency: string;
    quantity: number;
    isAvailable: boolean;
    option?: any;
    companyId: string;
  };
  store?: {
    id: string;
    name: string;
    slug?: string;
    logo?: string;
    phone?: string;
    email?: string;
  };
  availablePaymentMethods?: any[];
  shareUrls?: {
    payUrl: string;
    whatsAppUrl: string;
  };
}

/**
 * Generate a cryptographically secure, URL-safe unpredictable link code.
 * Example: "dp_8f2b6a9c"
 */
export function generatePayLinkCode(prefix = "dp_"): string {
  const bytes = crypto.randomBytes(6).toString("hex");
  return `${prefix}${bytes}`;
}

/**
 * Creates a new Direct Pay Link.
 */
export async function createDirectPayLink(
  input: CreateDirectPayLinkInput,
  baseUrl = "https://salesmanpro.store",
) {
  if (!input.companyId) {
    throw new Error("Company ID is required to create a Direct Pay Link.");
  }

  // 1. Fetch and validate product or marketplaceListing
  let resolvedListing: any = null;
  let resolvedProduct: any = null;

  if (input.marketplaceListingId) {
    resolvedListing = await prisma.marketplaceListings.findUnique({
      where: { id: input.marketplaceListingId },
    });
  }

  if (!resolvedListing && input.productId) {
    resolvedListing = await prisma.marketplaceListings.findFirst({
      where: { productId: input.productId, companyId: input.companyId },
    });
    if (!resolvedListing) {
      resolvedProduct = await prisma.product.findUnique({
        where: { id: input.productId },
      });
    }
  }

  const productName =
    input.title ||
    resolvedListing?.name ||
    resolvedProduct?.name ||
    "Selected Product";

  const rawImage =
    input.image ||
    resolvedListing?.image ||
    (Array.isArray(resolvedListing?.images) ? resolvedListing.images[0] : null) ||
    resolvedProduct?.image ||
    null;

  const resolvedBasePrice = Number(
    input.fixedPrice ??
      resolvedListing?.sellingPrice ??
      resolvedListing?.price ??
      resolvedProduct?.sellingPrice ??
      resolvedProduct?.price ??
      input.basePrice ??
      0,
  );

  // 2. Generate unique code
  let code = generatePayLinkCode();
  let existing = await prisma.directPayLink.findUnique({ where: { code } });
  while (existing) {
    code = generatePayLinkCode();
    existing = await prisma.directPayLink.findUnique({ where: { code } });
  }

  // 3. Compute Expiry Date if provided
  let expiryDate: Date | null = null;
  if (input.expiresAt) {
    expiryDate = new Date(input.expiresAt);
    if (isNaN(expiryDate.getTime())) expiryDate = null;
  }

  // 4. Save link in DB
  const directPayLink = await prisma.directPayLink.create({
    data: {
      code,
      companyId: input.companyId,
      storeId: input.storeId || input.companyId,
      productId: resolvedListing?.productId || input.productId || null,
      marketplaceListingId: resolvedListing?.id || input.marketplaceListingId || null,
      name: input.name || `Pay Link: ${productName}`,
      title: productName,
      image: rawImage,
      basePrice: resolvedBasePrice,
      currency: input.currency || "KES",
      variantConfig: input.variantConfig || undefined,
      defaultQuantity: Math.max(1, input.defaultQuantity || 1),
      allowQuantityChange: Boolean(input.allowQuantityChange),
      allowVariantChange: Boolean(input.allowVariantChange),
      checkoutType: input.checkoutType || "BUY_VARIANT",
      fixedPrice: input.fixedPrice ? Number(input.fixedPrice) : null,
      discountRules: input.discountRules || undefined,
      status: "ACTIVE",
      expiresAt: expiryDate,
      maxUses: input.maxUses ? Math.max(1, Number(input.maxUses)) : null,
      successfulUses: 0,
      source: input.source || "DIRECT_PAY_LINK",
      campaignId: input.campaignId || null,
      creatorId: input.creatorId || null,
    },
  });

  // 5. Construct canonical share URLs
  const hostDomain = input.subdomain
    ? `https://${input.subdomain}.salesmanpro.store`
    : baseUrl.replace(/\/$/, "");

  const payUrl = `${hostDomain}/pay/${code}`;
  const shareText = `Hi! You can quickly order "${productName}" directly via this secure checkout link: ${payUrl}`;
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return {
    link: directPayLink,
    payUrl,
    whatsAppUrl,
    shareText,
  };
}

/**
 * Resolves a Direct Pay Link securely for customer-facing checkout.
 * Checks expiry, usage limits, live stock, and resolves payment methods.
 */
export async function resolveDirectPayLink(
  code: string,
  options: { incrementVisit?: boolean } = {},
): Promise<DirectPayLinkResolution> {
  if (!code || typeof code !== "string") {
    return { success: false, error: "Invalid payment link code." };
  }

  const link = await prisma.directPayLink.findUnique({
    where: { code },
  });

  if (!link) {
    return { success: false, error: "Payment link not found or has been removed." };
  }

  // Check Revoked or Disabled status
  if (link.status === "REVOKED" || link.status === "DISABLED") {
    return {
      success: false,
      error: "This direct payment link has been revoked by the store owner.",
      code: link.code,
    };
  }

  // Check Expiry Date
  if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
    if (link.status !== "EXPIRED") {
      await prisma.directPayLink.update({
        where: { id: link.id },
        data: { status: "EXPIRED" },
      }).catch(() => null);
    }
    return {
      success: false,
      error: "This direct payment link has expired.",
      code: link.code,
    };
  }

  // Check Usage Limits
  if (link.maxUses && link.successfulUses >= link.maxUses) {
    return {
      success: false,
      error: "This payment link has reached its maximum allowed uses.",
      code: link.code,
    };
  }

  // Atomically increment visit counter if requested
  if (options.incrementVisit) {
    await prisma.directPayLink.update({
      where: { id: link.id },
      data: { visitCount: { increment: 1 } },
    }).catch(() => null);
  }

  // Fetch Company / Store Branding
  let company: any = null;
  try {
    company = await prisma.company.findUnique({
      where: { id: link.companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        contactPhone: true,
        contactEmail: true,
      },
    });
  } catch (err) {
    console.warn(`[DirectPayLink] Error fetching company details (${link.companyId}):`, err);
  }

  // Fetch Live Product / MarketplaceListing for Authoritative Stock & Pricing
  let liveListing: any = null;
  if (link.marketplaceListingId) {
    try {
      liveListing = await prisma.marketplaceListings.findUnique({
        where: { id: link.marketplaceListingId },
      });
    } catch {}
  }

  if (!liveListing && link.productId) {
    try {
      liveListing = await prisma.marketplaceListings.findFirst({
        where: { productId: link.productId, companyId: link.companyId },
      });
    } catch {}
  }

  const liveQuantity = Number(liveListing?.quantity ?? 10);
  const isOutOfStock = liveQuantity <= 0;

  const currentPrice = Number(
    link.fixedPrice ??
      liveListing?.sellingPrice ??
      liveListing?.price ??
      link.basePrice ??
      0,
  );

  // Fetch Authoritative Payment Methods for Store Context (Rule B/C)
  let availableMethods: any[] = [];
  try {
    const paymentMethodsResponse = await getAvailableStorePaymentMethods({
      storeId: link.companyId,
      isMarketplace: false,
    });
    availableMethods = paymentMethodsResponse.availableMethods;
  } catch {}

  const payUrl = `https://salesmanpro.store/pay/${link.code}`;
  const shareText = `Order "${link.title || liveListing?.name}" directly: ${payUrl}`;
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return {
    success: true,
    link: {
      id: link.id,
      code: link.code,
      name: link.name,
      status: link.status,
      checkoutType: link.checkoutType,
      defaultQuantity: link.defaultQuantity,
      allowQuantityChange: link.allowQuantityChange,
      allowVariantChange: link.allowVariantChange,
      variantConfig: (link.variantConfig as Record<string, string>) || null,
      fixedPrice: link.fixedPrice,
      currency: link.currency || "KES",
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      maxUses: link.maxUses,
      successfulUses: link.successfulUses,
    },
    product: {
      id: liveListing?.id || link.marketplaceListingId || link.productId || link.id,
      name: link.title || liveListing?.name || "Selected Product",
      description: liveListing?.description || undefined,
      image: link.image || liveListing?.image || (Array.isArray(liveListing?.images) ? liveListing.images[0] : null),
      price: currentPrice,
      sellingPrice: currentPrice,
      currency: link.currency || "KES",
      quantity: liveQuantity,
      isAvailable: !isOutOfStock && (liveListing?.isAvailable ?? true),
      option: liveListing?.option || undefined,
      companyId: link.companyId,
    },
    store: {
      id: company?.id || link.companyId,
      name: company?.name || "Store",
      slug: company?.slug || undefined,
      logo: company?.logoUrl || undefined,
      phone: company?.contactPhone || undefined,
      email: company?.contactEmail || undefined,
    },
    availablePaymentMethods: availableMethods,
    shareUrls: {
      payUrl,
      whatsAppUrl,
    },
  };
}

/**
 * Increment checkout started counter.
 */
export async function trackDirectPayLinkCheckoutStart(code: string) {
  try {
    await prisma.directPayLink.update({
      where: { code },
      data: { checkoutStartCount: { increment: 1 } },
    });
  } catch {}
}

/**
 * Increment orders created counter.
 */
export async function trackDirectPayLinkOrderCreated(code: string) {
  try {
    await prisma.directPayLink.update({
      where: { code },
      data: { ordersCreatedCount: { increment: 1 } },
    });
  } catch {}
}

/**
 * Atomically records verified payment success against link usage count.
 * If maxUses is reached, sets link status to COMPLETED.
 */
export async function recordDirectPayLinkPaymentSuccess(code: string) {
  try {
    const link = await prisma.directPayLink.findUnique({
      where: { code },
      select: { id: true, maxUses: true, successfulUses: true },
    });

    if (!link) return;

    const newSuccessfulUses = link.successfulUses + 1;
    const shouldComplete = link.maxUses && newSuccessfulUses >= link.maxUses;

    await prisma.directPayLink.update({
      where: { id: link.id },
      data: {
        successfulUses: { increment: 1 },
        ...(shouldComplete ? { status: "COMPLETED" } : {}),
      },
    });
  } catch (err) {
    console.warn(`[DirectPayLink] Error recording payment success for ${code}:`, err);
  }
}

/**
 * Revokes a pay link by ID or code for a specific company (tenant isolated).
 */
export async function revokeDirectPayLink(idOrCode: string, companyId: string) {
  const where = idOrCode.startsWith("dp_")
    ? { code: idOrCode }
    : { id: idOrCode };

  const link = await prisma.directPayLink.findFirst({
    where: {
      ...where,
      companyId,
    },
  });

  if (!link) {
    throw new Error("Pay link not found or you are not authorized to revoke it.");
  }

  return await prisma.directPayLink.update({
    where: { id: link.id },
    data: { status: "REVOKED" },
  });
}

/**
 * Lists Direct Pay Links for a store with filtering and conversion stats.
 */
export async function listStoreDirectPayLinks(
  companyId: string,
  options: { productId?: string; status?: string; limit?: number } = {},
) {
  const where: any = { companyId };

  if (options.productId) {
    where.OR = [
      { productId: options.productId },
      { marketplaceListingId: options.productId },
    ];
  }

  if (options.status && options.status !== "ALL") {
    where.status = options.status;
  }

  const links = await prisma.directPayLink.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit || 50,
  });

  return links.map((link) => {
    const conversionRate =
      link.visitCount > 0
        ? Number(((link.successfulUses / link.visitCount) * 100).toFixed(1))
        : 0;

    return {
      ...link,
      conversionRate,
      payUrl: `https://salesmanpro.store/pay/${link.code}`,
      whatsAppUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Hi! Order "${link.title}" directly: https://salesmanpro.store/pay/${link.code}`,
      )}`,
    };
  });
}
