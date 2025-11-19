import prisma from "@/server/db/prismadb";
import { companySchema } from "@/lib/validations/company";
import { Prisma } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { VerifiedUser } from "@/lib/verifyAuth"; 
import { sl } from "date-fns/locale";

export const dynamic = "force-dynamic";

// Define a consistent type for the context that our handlers will receive.
type HandlerContext = {
  params: any;
  user?: VerifiedUser; // Use the imported type here
};

// =======================
// GET all companies for the authenticated user
// =======================
// async function getCompanies(req: Request, context: HandlerContext) {
//   // No need to check for the user's existence!
//   // The withApiHandler wrapper guarantees that 'context.user' is present.
//   const { user } = context;
  
//   if (!user) {
//     return formatResponse(false, null, "Unauthorized", 401);
//   }

//   const companies = await prisma.company.findMany({
//     where: { userId: user.id },
//     orderBy: { createdAt: "asc" },
//   });

//   return formatResponse(true, companies, "Companies fetched successfully");
// }

async function getCompanies(req: Request, context: HandlerContext) {
  try {
    const url = new URL(req.url);
    const { user } = context;

      if (!user) {
        return formatResponse(false, null, "Unauthorized", 401);
      }

    // Fetch all companies (stores) + active subscription status
    const companies = await prisma.company.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },

      include: {
        subscriptionCompanies: {
          where: {
            status: "ACTIVE", // Only active subs
          },
          select: {
            status: true,
          },
        },
      },
    });

    // Format into the structure your frontend expects
    const formattedStores = companies.map((c) => ({
      id: c.id,
      name: c.name,
      companyId: c.id,
      slug: c.slug,
      bannerUrl: c.bannerUrl,
      logoUrl: c.logoUrl,
      description: c.description,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,

      // If array contains at least 1 ACTIVE subscription → mark store as ACTIVE
      subscriptionStatus:
        c.subscriptionCompanies.length > 0 ? "ACTIVE" : "INACTIVE",
    }));

    return formatResponse(true, formattedStores, "Companies fetched successfully");
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return formatResponse(false, null, "Server error", 500);
  }
}


// =======================
// POST a new company
// =======================
async function createCompany(req: Request, context: HandlerContext) {
  // The user is guaranteed to be here as well.
  const { user } = context;

  const body = await req.json();
  const parseResult = companySchema.safeParse(body);

  if (!parseResult.success) {
    return formatResponse(false, parseResult.error.errors, "Validation failed", 400);
  }

  if (!user) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const data = parseResult.data;

  const paymentSettingsData = data.paymentSettings 
        ? (({ id, ...rest }: any) => rest)(data.paymentSettings) 
        : undefined;

  try {
    const newCompany = await prisma.company.create({
      data: {
        // Direct fields
        name: data.name,
        slug: data.slug,
        domain: data.domain,
        tagline: data.tagline,
        description: data.description,
        category: data.category,
        variant: data.variant,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        videoUrl: data.videoUrl,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        hasWebsite: data.hasWebsite,
        currency: data.currency,
        locale: data.locale,
        geoLocation: data.geoLocation,
        openingHours: data.openingHours,
        themeSettings: data.themeSettings,
        awards: data.awards,
        metrics: data.metrics,
        stats: data.stats,
        pricingTiers: data.pricingTiers,

        // User link - using the user ID from the handler's context
        user: { connect: { id: user.id } },

        // Nested One-to-One
        SEO: data.seo ? { create: data.seo } : undefined,
        AnalyticsConfig: data.analyticsConfig ? { create: data.analyticsConfig } : undefined,
        PaymentSettings: paymentSettingsData ? { create: paymentSettingsData } : undefined,
        ShippingSettings: data.shippingSettings ? { create: data.shippingSettings } : undefined,

        // Nested One-to-Many
        socialLinks: data.socialLinks ? { create: data.socialLinks } : undefined,
        policies: data.policies ? { create: data.policies } : undefined,
        faqs: data.faqs ? { create: data.faqs } : undefined,
        testimonials: data.testimonials ? { create: data.testimonials } : undefined,
        heroSlides: data.heroSlides
          ? {
              create: data.heroSlides.map((h) => ({
                ...h,
                endsAt: h.endsAt ? new Date(h.endsAt) : undefined,
              })),
            }
          : undefined,
        promotions: data.promotions
          ? {
              create: data.promotions.map((p) => ({
                ...p,
                title: p.title || "Untitled Promotion", // Ensure title is always defined
                startsAt: p.startsAt ? new Date(p.startsAt) : undefined,
                endsAt: p.endsAt ? new Date(p.endsAt) : undefined,
              })),
            }
          : undefined,

        // Many-to-Many (through StoreCategory join)
        StoreCategory: data.StoreCategory
          ? {
              create: data.StoreCategory.map((sc) => ({
                displayName: sc.displayName,
                icon: sc.icon,
                sortOrder: sc.sortOrder,
                visible: sc.visible,
                subcategories: sc.subcategories,
                allBrands: sc.allBrands,
                category: { connect: { id: sc.categoryId } },
              })),
            }
          : undefined,

        partnerLogos: data.partnerLogos,
        founderImage: data.founderImage,
        founderName: data.founderName,
        founderQuote: data.founderQuote,

        sectionTitle: data.sectionTitle,
        sectionSubtitle: data.sectionSubtitle,
        sectionDescription: data.sectionDescription,

      },
    });

    return formatResponse(true, newCompany, "Company created successfully", 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return formatResponse(false, null, "The slug or domain is already taken.", 409);
    }
    
    throw error;
  }
}

// =======================
// Export handlers with wrapper
// =======================
export const GET = withApiHandler(getCompanies);
export const POST = withApiHandler(createCompany);

