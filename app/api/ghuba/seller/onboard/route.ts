import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import prisma from "@/server/db/prismadb";
import { revalidateCompanyCache } from "@/lib/company-fetcher";
import { cacheDel } from "@/lib/cache";
import { resolveGhubaStoreVariant } from "@/lib/ghuba-store-mapper";
import { getOrCreateWebsite } from "@/lib/website-builder/website-service";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to create your seller store." }, { status: 401 });
    }

    const userId = auth.user.id;
    const body = await req.json();

    const name = (body.name || "").trim();
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Store name must be at least 2 characters long." }, { status: 400 });
    }

    const category = (body.category || "").trim() || "General Retail";
    const contactPhone = (body.contactPhone || "").trim();
    const contactEmail = (body.contactEmail || auth.user.email || "seller@ghuba.shop").trim();
    const logoUrl = body.logoUrl || null;
    const description = body.description || null;
    const address = body.address || null;

    // Check if user already has a store
    const existingStore = await prisma.company.findFirst({
      where: {
        OR: [
          { userId },
          ...(auth.user.companyId ? [{ id: auth.user.companyId }] : []),
        ],
      },
    });

    if (existingStore) {
      return NextResponse.json({
        success: true,
        message: "You already have an active store.",
        store: existingStore,
      });
    }

    // Generate unique slug
    let baseSlug = slugify(name);
    if (!baseSlug) baseSlug = "store";

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existingSlug = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existingSlug) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Deterministically map chosen retail category to standard E-commerce variant
    const variantMapping = resolveGhubaStoreVariant(category);

    // Create the Company record for Ghuba marketplace
    const newCompany = await prisma.company.create({
      data: {
        name,
        slug,
        category,
        variant: variantMapping.variant,
        contactPhone,
        contactEmail,
        logoUrl,
        description,
        address,
        storeOrigin: "GHUBA",
        showOnGhuba: true,
        hasWebsite: true,
        currency: "KES",
        locale: "en_KE",
        user: { connect: { id: userId } },
      },
    });

    // Pre-synthesize website config so website-builder is ready instantly with the correct e-commerce template
    try {
      await getOrCreateWebsite(newCompany.id);
    } catch (wsErr) {
      console.warn("Could not pre-synthesize website config on onboard:", wsErr);
    }

    // Promote user to ADMIN for their store
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: auth.user.role === "SUPER_ADMIN" ? auth.user.role : "ADMIN",
          companyId: newCompany.id,
        },
      });
    } catch (err) {
      console.error("Failed to update user role/companyId:", err);
    }

    await cacheDel(`user:${userId}:companies*`);
    await revalidateCompanyCache(newCompany.slug);

    return NextResponse.json({
      success: true,
      message: "Store onboarded successfully on Ghuba!",
      store: newCompany,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/ghuba/seller/onboard:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create seller store" },
      { status: 500 }
    );
  }
}
