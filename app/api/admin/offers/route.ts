import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

type RouteParams = { params: {} };
const VALID_STATUSES = ["Pending", "Accepted", "Rejected", "Closed"];

async function resolveCompanyId(idOrSlug: string): Promise<string> {
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    return idOrSlug;
  }
  const comp = await prisma.company.findFirst({
    where: { slug: idOrSlug },
    select: { id: true },
  });
  return comp?.id || idOrSlug;
}

// --- GET Handler Core Logic ---
async function handleGetOffers(request: Request, { params }: RouteParams) {
  const { searchParams } = new URL(request.url);
  const rawCompanyId = searchParams.get("companyId");

  if (!rawCompanyId) {
    return formatResponse(false, null, "Company ID is required to fetch offers.", 400);
  }

  const companyId = await resolveCompanyId(rawCompanyId);
  const cacheKey = buildTenantCacheKey(companyId, "offers", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const offers = await prisma.offerContract.findMany({
    where: {
      companyId: companyId,
    },
    orderBy: {
      offerDate: "desc",
    },
    include: {
      property: {
        select: { name: true, id: true, images: true }
      },
      client: {
        select: { name: true, id: true, email: true }
      },
      agent: {
        select: { name: true, id: true, email: true }
      },
    },
  });

  const formattedOffers = offers.map(offer => ({
    id: offer.id,
    propertyId: offer.propertyId,
    propertyName: offer.property?.name || offer.propertyName,
    clientId: offer.clientId,
    clientName: offer.client?.name || offer.clientName,
    agentId: offer.agentId,
    agentName: offer.agent?.name || offer.agentName,
    offerAmount: offer.offerAmount,
    status: offer.status,
    offerDate: offer.offerDate.toISOString(),
    closureDate: offer.closureDate?.toISOString() || undefined,
    notes: offer.notes,
    contractUrl: offer.contractUrl,
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
  }));

  try {
    if (formattedOffers) {
      await cacheSet(cacheKey, { results: formattedOffers }, 60);
    }
  } catch (e) {}

  return formatResponse(true, { results: formattedOffers }, "Offers fetched successfully", 200);
}

// --- POST Handler Core Logic ---
async function handlePostOffer(request: Request, { params }: RouteParams) {
  const body = await request.json();
  let {
    companyId: rawCompanyId,
    propertyId,
    propertyName,
    clientId,
    clientName,
    clientEmail,
    agentId,
    agentName,
    offerAmount,
    status,
    offerDate,
    closureDate,
    notes,
    contractUrl,
  } = body;

  if (!rawCompanyId || !propertyId || offerAmount === undefined) {
    return formatResponse(
      false,
      null,
      "Missing required fields (companyId, propertyId, offerAmount).",
      400
    );
  }

  const companyId = await resolveCompanyId(rawCompanyId);
  const parsedAmount = parseFloat(offerAmount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return formatResponse(false, null, "Offer amount must be a positive number.", 400);
  }

  // Resolve property
  const property = await prisma.marketplaceListings.findUnique({
    where: { id: propertyId },
    select: { id: true, name: true, sellerId: true, companyId: true },
  });

  if (!property) {
    return formatResponse(false, null, "Property not found", 404);
  }

  propertyName = propertyName || property.name;

  // Resolve Client (User)
  if (!clientId) {
    if (clientEmail) {
      let clientUser = await prisma.user.findFirst({ where: { email: clientEmail } });
      if (!clientUser) {
        clientUser = await prisma.user.create({
          data: {
            email: clientEmail,
            name: clientName || "Prospective Buyer",
            role: "CONSUMER",
          },
        });
      }
      clientId = clientUser.id;
      clientName = clientName || clientUser.name;
    } else {
      // Find company first user or fallback user
      const defaultUser = await prisma.user.findFirst({
        where: { companyId },
        select: { id: true, name: true },
      });
      clientId = defaultUser?.id;
      clientName = clientName || defaultUser?.name || "Client";
    }
  }

  // Resolve Agent (User)
  if (!agentId) {
    if (property.sellerId) {
      agentId = property.sellerId;
    } else {
      const companyUser = await prisma.user.findFirst({
        where: { companyId, role: { in: ["ADMIN", "MANAGER", "STAFF", "SALES_AGENT"] } },
        select: { id: true, name: true },
      });
      agentId = companyUser?.id;
      agentName = agentName || companyUser?.name || "Agent";
    }
  }

  // Fallback for agentId if still missing
  if (!agentId) {
    const anyUser = await prisma.user.findFirst({ select: { id: true, name: true } });
    agentId = anyUser?.id;
    agentName = agentName || anyUser?.name || "Agent";
  }

  if (!clientId || !agentId) {
    return formatResponse(false, null, "Could not resolve valid client and agent references for offer.", 400);
  }

  const validStatus = status && VALID_STATUSES.includes(status) ? status : "Pending";
  const finalOfferDate = offerDate ? new Date(offerDate) : new Date();

  const newOffer = await prisma.offerContract.create({
    data: {
      companyId,
      propertyId,
      propertyName,
      clientId,
      clientName: clientName || "Client",
      agentId,
      agentName: agentName || "Agent",
      offerAmount: parsedAmount,
      status: validStatus,
      offerDate: finalOfferDate,
      closureDate: closureDate ? new Date(closureDate) : null,
      notes: notes || null,
      contractUrl: contractUrl || null,
    },
    include: {
      property: { select: { id: true, name: true, images: true } },
      client: { select: { id: true, name: true, email: true } },
      agent: { select: { id: true, name: true, email: true } },
    },
  });

  try {
    await cacheDel(`tenant:${companyId}:offers:*`);
    await cacheDel(`admin:offers:*`);
  } catch (e) {}

  return formatResponse(true, newOffer, "Offer created successfully", 201);
}

export const GET = withApiHandler(handleGetOffers);
export const POST = withApiHandler(handlePostOffer, { requireAuth: false });
