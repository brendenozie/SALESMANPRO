import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "../../../../lib/auth";
import { companySchema } from "@/lib/validations/company";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET all companies for the authenticated user
export async function GET(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const companies = await prisma.company.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST a new company
export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  
  // Validate the request body with Zod
  const parseResult = companySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
  }

  const data = parseResult.data;

  try {
    const newCompany = await prisma.company.create({
      data: {
        ...data,
        // Securely associate with the logged-in user
        user: { connect: { id: session.user.id } },
        
        // Handle creation of nested relations
        heroSlides: data.heroSlides ? { create: data.heroSlides.map(h => ({...h, endsAt: h.endsAt ? new Date(h.endsAt) : null})) } : undefined,
        promotions: data.promotions ? { create: data.promotions.map(p => ({...p, startsAt: p.startsAt ? new Date(p.startsAt) : null, endsAt: p.endsAt ? new Date(p.endsAt) : null})) } : undefined,
        
        // Other one-to-many relations
        socialLinks: data.socialLinks ? { create: data.socialLinks } : undefined,
        policies: data.policies ? { create: data.policies } : undefined,
        faqs: data.faqs ? { create: data.faqs } : undefined,
        testimonials: data.testimonials ? { create: data.testimonials } : undefined,
        SEO: data.seo ? { create: data.seo } : undefined,
        AnalyticsConfig: data.analyticsConfig ? { create: data.analyticsConfig } : undefined,
        PaymentSettings: data.paymentSettings ? { create: data.paymentSettings } : undefined,
        ShippingSettings: data.shippingSettings ? { create: data.shippingSettings } : undefined,

        // Many-to-many relations
        StoreCategory: data.storeCategories ? {
            create: data.storeCategories.map((sc, idx) => ({
                category: { connect: { id: sc.id } },
                displayName: sc.displayName,
                sortOrder: sc.sortOrder ?? idx,
            }))
        } : undefined,
      },
    });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        return NextResponse.json(
          { error: `The slug or domain '${target.join(' ')}' is already taken.` },
          { status: 409 } // Conflict
        );
    }
    console.error("❌ Company creation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}