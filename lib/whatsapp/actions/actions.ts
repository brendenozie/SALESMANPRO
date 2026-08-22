import prisma from "@/server/db/prismadb";
import { calculateServerSideOrder } from "@/lib/pricing/serverPricing";

export const whatsappTools = [
  {
    type: "function" as const,
    name: "search_marketplace",
    description:
      "Search available Ghuba marketplace listings for products, properties, vehicles, or services.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
        },
        category: {
          type: ["string", "null"],
        },
        maxPrice: {
          type: ["number", "null"],
        },
      },
      required: ["query", "category", "maxPrice"],
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: "function" as const,
    name: "get_listing",
    description:
      "Retrieve detailed information about a specific marketplace listing.",
    parameters: {
      type: "object",
      properties: {
        listingId: {
          type: "string",
        },
      },
      required: ["listingId"],
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: "function" as const,
    name: "calculate_order",
    description:
      "Calculate the authoritative server-side price for an order before checkout.",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              marketplaceListingId: {
                type: "string",
              },
              quantity: {
                type: "integer",
              },
              selectedOptions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                    },
                    name: {
                      type: "string",
                    },
                  },
                  required: ["category", "name"],
                  additionalProperties: false,
                },
              },
            },
            required: ["marketplaceListingId", "quantity", "selectedOptions"],
            additionalProperties: false,
          },
        },
      },
      required: ["items"],
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: "function" as const,
    name: "create_order",
    description:
      "Create a marketplace order after the customer has confirmed the final price and payment method.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        email: {
          type: "string",
        },
        phone: {
          type: "string",
        },
        paymentOption: {
          type: "string",
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              marketplaceListingId: {
                type: "string",
              },
              quantity: {
                type: "integer",
              },
              price: {
                type: "number",
              },
              totalPrice: {
                type: "number",
              },
            },
            required: [
              "marketplaceListingId",
              "quantity",
              "price",
              "totalPrice",
            ],
            additionalProperties: false,
          },
        },
      },
      required: ["name", "email", "phone", "paymentOption", "items"],
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: "function" as const,
    name: "request_human_agent",
    description:
      "Transfer the WhatsApp conversation to a human sales or support agent.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
        },
      },
      required: ["reason"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export async function executeWhatsAppAction({
  action,
  args,
  companyId,
  conversationId,
}: {
  action: string;
  args: any;
  companyId: string;
  conversationId: string;
}) {
  switch (action) {
    case "search_marketplace":
      return searchMarketplace({
        companyId,
        ...args,
      });

    case "get_listing":
      return getListing({
        companyId,
        listingId: args.listingId,
      });

    case "calculate_order":
      return calculateOrder({
        companyId,
        ...args,
      });

    case "create_order":
      return createOrder({
        companyId,
        conversationId,
        ...args,
      });

    case "request_human_agent":
      return requestHumanAgent({
        conversationId,
        ...args,
      });

    default:
      throw new Error(`Unsupported WhatsApp action: ${action}`);
  }
}

async function searchMarketplace({
  companyId,
  query,
  category,
  maxPrice,
}: {
  companyId: string;
  query: string;
  category: string | null;
  maxPrice: number | null;
}) {
  const listings = await prisma.marketplaceListings.findMany({
    where: {
      companyId,

      status: "ACTIVE",

      isAvailable: true,

      showOnGhuba: true,

      ...(category
        ? {
            category: {
              contains: category,
              mode: "insensitive",
            },
          }
        : {}),

      ...(maxPrice !== null
        ? {
            finalPrice: {
              lte: maxPrice,
            },
          }
        : {}),

      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },

    select: {
      id: true,
      name: true,
      description: true,
      finalPrice: true,
      sellingPrice: true,
      images: true,
      category: true,
      subCategoryName: true,
      brand: true,
      condition: true,
      locationName: true,
      isAvailable: true,
      listingTransactionType: true,
    },

    take: 8,

    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    count: listings.length,
    listings,
  };
}

async function getListing({
  companyId,
  listingId,
}: {
  companyId: string;
  listingId: string;
}) {
  const listing = await prisma.marketplaceListings.findFirst({
    where: {
      id: listingId,
      companyId,
      status: "ACTIVE",
    },

    select: {
      id: true,
      name: true,
      description: true,
      longDescription: true,
      finalPrice: true,
      sellingPrice: true,
      discount: true,
      images: true,
      category: true,
      subCategoryName: true,
      brand: true,
      condition: true,
      quantity: true,
      locationName: true,
      latitude: true,
      longitude: true,
      delivery: true,
      paymentOption: true,
      amenities: true,
      features: true,
      make: true,
      model: true,
      year: true,
      mileage: true,
      bedrooms: true,
      bathrooms: true,
      propertyType: true,
    },
  });

  if (!listing) {
    return {
      found: false,
    };
  }

  return {
    found: true,
    listing,
  };
}

async function calculateOrder({
  companyId,
  items,
}: {
  companyId: string;
  items: Array<{
    marketplaceListingId: string;
    quantity: number;
    selectedOptions: Array<{
      category: string;
      name: string;
    }>;
  }>;
}) {
  const result = await calculateServerSideOrder({
    companyId,
    items,
  });

  return {
    success: true,
    pricing: result,
  };
}

async function createOrder({
  companyId,
  conversationId,
  name,
  email,
  phone,
  paymentOption,
  items,
}: {
  companyId: string;
  conversationId: string;
  name: string;
  email: string;
  phone: string;
  paymentOption: string;

  items: Array<{
    marketplaceListingId: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
}) {
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch(
    `${process.env.INTERNAL_API_BASE_URL}/api/shop/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-whatsapp": process.env.WHATSAPP_INTERNAL_SECRET!,
      },
      body: JSON.stringify({
        name,
        email,
        phone,

        consumerId: undefined,

        paymentOption,

        items,

        totalPrice: items.reduce((sum, item) => sum + item.totalPrice, 0),

        companyId,

        idempotencyKey,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || result?.error || "Order creation failed",
    );
  }

  return result;
}

async function requestHumanAgent({
  conversationId,
  reason,
}: {
  conversationId: string;
  reason: string;
}) {
  const conversation = await prisma.whatsAppConversation.update({
    where: {
      id: conversationId,
    },

    data: {
      status: "HUMAN",
      humanHandoff: true,
      aiEnabled: false,

      context: {
        handoffReason: reason,
        requestedAt: new Date().toISOString(),
      },
    },
  });

  return {
    success: true,
    handedOff: true,
    conversationId: conversation.id,
    message: "The conversation has been transferred to a human agent.",
  };
}