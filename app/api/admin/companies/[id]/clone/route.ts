// app/api/admin/companies/[id]/clone/route.ts
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

// 1. Convert to an array so `pick()` can use `.reduce()` over the keys.
const CLONABLE_FIELDS = [
  // "name",
  "tagline",
  "description",
  "category",
  "variant",
  "logoUrl",
  "bannerUrl",
  "videoUrl",
  "currency",
  "locale",
  "pricingTiers",
  "themeSettings",
  "highlights",
  "awards",
  "metrics",
  "stats",
  "founderName",
  "founderQuote",
  "founderImage",
  "partnerLogos",
  "sectionTitle",
  "sectionSubtitle",
  "sectionDescription",
] as const;

function pick<T extends object, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K,
): Pick<T, K[number]> {
  return keys.reduce(
    (acc, key) => {
      if (obj[key] !== undefined) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K[number]>,
  );
}

interface CloneCompanyInput {
  sourceCompanyId: string;
  newName: string;
  newSlug: string;
  assignUserId?: string | null;
}

async function cloneCompanyTx({
  sourceCompanyId,
  newName,
  newSlug,
  assignUserId,
}: CloneCompanyInput) {
  return prisma.$transaction(async (tx) => {
    // 1️⃣ Load source company with clonable relations
    const source = await tx.company.findUnique({
      where: { id: sourceCompanyId },
      include: {
        PageSection: true,
        Collection: true,
        policies: true,
        faqs: true,
        testimonials: true,
        services: true,
        productCategories: true,
      },
    });

    if (!source) {
      throw new Error("SOURCE_COMPANY_NOT_FOUND");
    }

    // 2️⃣ Uniqueness guards
    const slugExists = await tx.company.findUnique({
      where: { slug: newSlug },
      select: { id: true },
    });

    if (slugExists) {
      throw new Error("SLUG_ALREADY_EXISTS");
    }

    // 3️⃣ Create cloned company
    const cloned = await tx.company.create({
      data: {
        // Required basic fields
        name: newName,
        slug: newSlug,

        // Safe field copy (cast to any to satisfy Prisma input types when source JSON
        // may contain nulls that aren't assignable to InputJsonValue)
        ...(pick(source, CLONABLE_FIELDS) as any),

        // Admin assignment
        userId: assignUserId ?? source.userId,
        // Required contact field for CompanyUncheckedCreateInput
        contactEmail: source.contactEmail ?? null,

        // Reset system state
        domain: null,
        domainVerified: false,
        sslStatus: "PENDING",
        sslError: null,
        deletedAt: null,

        // --- Deep Cloned Relations ---

        // Updated to match PageSection schema
        PageSection: {
          create: source.PageSection.map((p) => ({
            type: p.type,
            order: p.order,
            settings: p.settings ?? {},
            content: p.content ?? {},
          })),
        },

        // Updated to match Collection schema (also guarding the @unique slug)
        Collection: {
          create: source.Collection.map((c, index) => ({
            name: c.name,
            // Create a unique slug for the new collection to prevent collision
            slug: `${c.slug}-${newSlug}-${index}`,
            description: c.description,
            image: c.image,
            order: c.order,
          })),
        },

        // Updated to match Testimonial schema
        testimonials: {
          create: source.testimonials.map((t) => ({
            quote: t.quote,
            authorName: t.authorName,
            authorTitle: t.authorTitle,
            status: t.status,
            avatarUrl: t.avatarUrl,
            rating: t.rating,
            order: t.order,
          })),
        },

        policies: {
          create: source.policies.map((p) => ({
            title: p.title,
            content: p.content,
            type: p.type,
          })),
        },

        faqs: {
          create: source.faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
        },

        services: {
          create: source.services.map((s) => ({
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
          })),
        },

        productCategories: {
          connect: source.productCategories.map((c) => ({
            id: c.id, // shared taxonomy, not duplicated
          })),
        },
      },
    });

    return cloned;
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // 1. Update the type to be a Promise
) {
  try {
    const body = await req.json();

    // 2. Await the params object before using it
    const resolvedParams = await params;

    const company = await cloneCompanyTx({
      sourceCompanyId: resolvedParams.id,
      newName: body.newName,
      newSlug: body.newSlug,
      assignUserId: body.assignUserId ?? null,
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error: any) {
    const message =
      error.message === "SLUG_ALREADY_EXISTS"
        ? "Slug already exists"
        : "Failed to clone company";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
