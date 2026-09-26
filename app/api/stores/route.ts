import prisma from "@/server/db/prismadb";
import { companySchema } from "@/lib/validations/company";
import { Prisma } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { VerifiedUser } from "@/lib/verifyAuth";
import { revalidateCompanyCache } from "@/lib/company-fetcher";
import { encrypt } from "@/lib/crypto/aes";
import { cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { creditLedger } from "@/lib/ai/creditLedger";
import { AUTHORITATIVE_PLANS } from "@/lib/subscriptions/subscription-plans";

export const dynamic = "force-dynamic";

// Define a consistent type for the context that our handlers will receive.
type HandlerContext = {
  params: any;
  user?: VerifiedUser;
};

const storeSubscriptionInclude = {
  where: {
    status: {
      in: ["ACTIVE", "AWAITING_CONFIRMATION", "TRIALING", "PAST_DUE"],
    },
  },
  select: {
    id: true,
    status: true,
    renewalDate: true,
    trialEndsAt: true,
    billingCycle: true,
    amountPaid: true,
    meta: true,
    plan: {
      select: {
        id: true,
        name: true,
        priceMonthly: true,
        currency: true,
      },
    },
  },
  orderBy: { createdAt: "desc" as const },
  take: 1,
};

// =======================
// GET all companies for the authenticated user
// =======================
async function getCompanies(req: Request, context: HandlerContext) {
  try {
    const { user } = context;

    if (!user) {
      return formatResponse(false, null, "Unauthorized", 401);
    }

    const cacheKey = `user:${user.id}:companies:v2`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached)
        return formatResponse(
          true,
          cached,
          "Companies retrieved from cache",
          200,
        );
    } catch (e) {
      console.error("Failed to retrieve companies from cache:", e);
    }

    // Fetch all companies owned or affiliated (educator, staff, student) + active subscription status
    const [ownedCompanies, educatorProfiles, staffProfiles, studentProfiles] =
      await Promise.all([
        prisma.company.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
          include: {
            subscriptionCompanies: storeSubscriptionInclude,
          },
        }),
        prisma.educator.findMany({
          where: { userId: user.id },
          include: {
            Company: {
              include: {
                subscriptionCompanies: storeSubscriptionInclude,
              },
            },
          },
        }),
        prisma.staffProfile.findMany({
          where: { userId: user.id },
          include: {
            company: {
              include: {
                subscriptionCompanies: storeSubscriptionInclude,
              },
            },
          },
        }),
        prisma.student.findMany({
          where: { userId: user.id },
          include: {
            Company: {
              include: {
                subscriptionCompanies: storeSubscriptionInclude,
              },
            },
          },
        }),
      ]);

    const companyMap = new Map<string, any>();
    for (const c of ownedCompanies) {
      if (c && !companyMap.has(c.id)) companyMap.set(c.id, c);
    }
    for (const e of educatorProfiles) {
      if (e.Company && !companyMap.has(e.Company.id))
        companyMap.set(e.Company.id, e.Company);
    }
    for (const s of staffProfiles) {
      if (s.company && !companyMap.has(s.company.id))
        companyMap.set(s.company.id, s.company);
    }
    for (const st of studentProfiles) {
      if (st.Company && !companyMap.has(st.Company.id))
        companyMap.set(st.Company.id, st.Company);
    }
    const companies = Array.from(companyMap.values());

    const now = new Date();

    // Format into the structure frontend expects with robust subscription state
    const formattedStores = companies.map((c) => {
      const sub = c.subscriptionCompanies?.[0];

      // Determine active status: active status flag, or future renewal, or active trial period
      const isSubActive = Boolean(
        sub &&
          (sub.status === "ACTIVE" ||
            sub.status === "TRIALING" ||
            (sub.renewalDate && new Date(sub.renewalDate) > now) ||
            (sub.trialEndsAt && new Date(sub.trialEndsAt) > now) ||
            (sub.meta?.isTrial && (!sub.meta?.trialEndsAt || new Date(sub.meta.trialEndsAt) > now)))
      );

      const isTrial = Boolean(
        sub?.meta?.isTrial ||
          sub?.billingCycle === "TRIAL" ||
          sub?.status === "TRIALING"
      );

      // Determine expired state: trial ended and no paid renewal after it
      const isTrialExpired = Boolean(
        isTrial &&
          sub?.trialEndsAt &&
          new Date(sub.trialEndsAt) <= now &&
          (!sub?.renewalDate || new Date(sub.renewalDate) <= now)
      );

      return {
        id: c.id,
        name: c.name,
        companyId: c.id,
        slug: c.slug,
        domain: c.domain,
        category: c.category,
        bannerUrl: c.bannerUrl,
        logoUrl: c.logoUrl,
        description: c.description,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        subscriptionStatus: isTrialExpired
          ? "TRIAL_EXPIRED"
          : isSubActive
          ? "ACTIVE"
          : (sub?.status || "INACTIVE"),
        currentTier: sub?.plan?.name || (isTrial ? "SalesmanPro Starter (Trial)" : "INACTIVE"),
        planId: sub?.plan?.id || null,
        renewalDate: sub?.renewalDate || null,
        trialEndsAt: sub?.trialEndsAt || sub?.meta?.trialEndsAt || null,
        isTrial,
        isTrialExpired,
      };
    });

    try {
      await cacheSet(cacheKey, formattedStores, 120); // Cache for 2 minutes
    } catch (e) {
      console.error("Failed to cache companies data:", e);
    }

    return formatResponse(
      true,
      formattedStores,
      "Companies fetched successfully",
    );
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return formatResponse(false, null, "Server error", 500);
  }
}

// =======================
// POST a new company
// =======================
async function createCompany(req: Request, context: HandlerContext) {
  const { user } = context;

  const body = await req.json();
  const parseResult = companySchema.safeParse(body);

  if (!parseResult.success) {
    return formatResponse(
      false,
      parseResult.error.errors,
      "Validation failed",
      400,
    );
  }

  if (!user) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const data = parseResult.data;

  const paymentSettingsData = data.paymentSettings
    ? (({ id, ...rest }: any) => rest)({
        ...data.paymentSettings,
      })
    : undefined;

  let encryptedPaymentSettings: any = undefined;

  if (paymentSettingsData) {
    encryptedPaymentSettings = { ...paymentSettingsData };

    // Stripe Secret
    if (paymentSettingsData.stripeSecretKey) {
      const encrypted = encrypt(paymentSettingsData.stripeSecretKey);
      encryptedPaymentSettings.stripeSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.stripeSecret_iv = encrypted.iv;
      encryptedPaymentSettings.stripeSecret_tag = encrypted.tag;
      encryptedPaymentSettings.stripeSecretKey = null;
    }

    // PayPal Secret
    if (paymentSettingsData.paypalClientSecret) {
      const encrypted = encrypt(paymentSettingsData.paypalClientSecret);
      encryptedPaymentSettings.paypalSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.paypalSecret_iv = encrypted.iv;
      encryptedPaymentSettings.paypalSecret_tag = encrypted.tag;
      encryptedPaymentSettings.paypalClientSecret = null;
    }

    // Paystack Secret
    if (paymentSettingsData.paystackSecretKey) {
      const encrypted = encrypt(paymentSettingsData.paystackSecretKey);
      encryptedPaymentSettings.paystackSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.paystackSecret_iv = encrypted.iv;
      encryptedPaymentSettings.paystackSecret_tag = encrypted.tag;
      encryptedPaymentSettings.paystackSecretKey = null;
    }

    // Ghuba API Secret
    if (paymentSettingsData.ghubaApiKey) {
      const encrypted = encrypt(paymentSettingsData.ghubaApiKey);
      encryptedPaymentSettings.ghubaSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.ghubaSecret_iv = encrypted.iv;
      encryptedPaymentSettings.ghubaSecret_tag = encrypted.tag;
      encryptedPaymentSettings.ghubaApiKey = null;
    }

    // Mpesa Secret
    if (paymentSettingsData.mpesaConsumerSecret) {
      const encrypted = encrypt(paymentSettingsData.mpesaConsumerSecret);
      encryptedPaymentSettings.mpesaSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.mpesaSecret_iv = encrypted.iv;
      encryptedPaymentSettings.mpesaSecret_tag = encrypted.tag;
      encryptedPaymentSettings.mpesaConsumerSecret = null;
    }
  }

  try {
    // 1. Fetch Plan for Trial Subscription (Prioritize Starter tier for full trial experience)
    let trialPlan = await prisma.plan.findFirst({
      where: {
        OR: [
          { name: { contains: "Trial", mode: "insensitive" } },
          { name: { contains: "Free", mode: "insensitive" } },
          { name: "Ghuba Starter" },
          { name: "Ghuba Basic" },
        ],
        status: "ACTIVE",
      },
      orderBy: { priceMonthly: "desc" },
    });

    // If still null, fallback to the first authoritative plan ID
    const planIdToUse = trialPlan?.id || AUTHORITATIVE_PLANS[1].id;

    // Validate the resolved plan actually exists in DB to prevent FK error on company create
    if (!trialPlan) {
      const planExists = await prisma.plan.findUnique({ where: { id: planIdToUse }, select: { id: true } });
      if (!planExists) {
        console.error(`⚠️ Trial plan not found in DB. planIdToUse=${planIdToUse}. Store creation will proceed without a subscription.`);
      }
    }

    const now = new Date();
    // 14 Days Free Trial
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const newCompany = await prisma.company.create({
      data: {
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

        // User link
        user: { connect: { id: user.id } },

        // Automatically create 14-Day Full-Featured Trial Subscription
        subscriptionCompanies: {
          create: {
            userId: user.id,
            planId: planIdToUse,
            status: "TRIALING",
            billingCycle: "TRIAL",
            amountPaid: 0,
            currency: data.currency || "KES",
            startedAt: now,
            renewalDate: fourteenDaysFromNow,
            trialEndsAt: fourteenDaysFromNow,
            meta: {
              isTrial: true,
              trialDays: 14,
              trialEndsAt: fourteenDaysFromNow.toISOString(),
              planName: trialPlan?.name || "Ghuba Starter",
            },
          },
        },

        // Nested One-to-One
        SEO: data.seo ? { create: data.seo } : undefined,
        AnalyticsConfig: data.analyticsConfig
          ? { create: data.analyticsConfig }
          : undefined,
        PaymentSettings: encryptedPaymentSettings
          ? { create: encryptedPaymentSettings }
          : undefined,

        ShippingSettings: data.shippingSettings
          ? { create: data.shippingSettings }
          : undefined,

        // Nested One-to-Many
        socialLinks: data.socialLinks
          ? { create: data.socialLinks }
          : undefined,
        policies: data.policies ? { create: data.policies } : undefined,
        faqs: data.faqs ? { create: data.faqs } : undefined,
        testimonials: data.testimonials
          ? { create: data.testimonials }
          : undefined,
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
                title: p.title || "Untitled Promotion",
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
                image: sc.image,
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

        addresses: data.addresses
          ? {
              create: data.addresses.map((addr) => ({
                isMain: addr.isMain ?? false,
                address: addr.address ?? null,
                lat: addr.lat ?? null,
                lng: addr.lng ?? null,
                contactName: addr.contactName ?? null,
                contactPhone: addr.contactPhone ?? null,
                contactEmail: addr.contactEmail ?? null,
                label: addr.label ?? null,
                instructions: addr.instructions ?? null,
              })),
            }
          : undefined,
      },
    });

    // Promote creator to ADMIN for their newly created store and associate companyId
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          ...(user.companyId ? {} : { companyId: newCompany.id }),
        },
      });
    } catch (roleErr) {
      console.error("⚠️ Failed to update user role to ADMIN upon store creation:", roleErr);
    }

    // Automatic introductory AI credit grant for new store onboarding
    let welcomeCreditsInfo: { granted: boolean; amount: number; balance: number } = {
      granted: false,
      amount: 0,
      balance: 0,
    };

    try {
      const grantResult = await creditLedger.grantWelcomeCredits({
        companyId: newCompany.id,
        userId: user.id,
      });
      welcomeCreditsInfo = {
        granted: grantResult.granted,
        amount: grantResult.amount,
        balance: grantResult.balance,
      };
    } catch (creditErr) {
      console.error("⚠️ Failed to grant welcome AI credits:", creditErr);
    }

    await cacheDel(`user:${user.id}:companies*`);

    if (newCompany.slug) {
      await revalidateCompanyCache(newCompany.slug);
    }
    if (newCompany.domain) {
      await revalidateCompanyCache(newCompany.domain);
    }

    const responsePayload = {
      ...newCompany,
      aiCreditBalance: welcomeCreditsInfo.balance,
      welcomeCreditsGranted: welcomeCreditsInfo.granted,
      welcomeCreditsAmount: welcomeCreditsInfo.amount,
    };

    return formatResponse(
      true,
      responsePayload,
      welcomeCreditsInfo.granted
        ? `Company created successfully! 14-day full trial activated with ${welcomeCreditsInfo.amount} introductory AI credits.`
        : "Company created successfully! 14-day trial activated.",
      201,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return formatResponse(
        false,
        null,
        "The slug or domain is already taken.",
        409,
      );
    }

    throw error;
  }
}

// =======================
// Export handlers with wrapper
// =======================
export const GET = withApiHandler(getCompanies);
export const POST = withApiHandler(createCompany);
