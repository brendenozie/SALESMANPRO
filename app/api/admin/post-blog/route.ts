// app/api/blogs/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // adjust path if needed

// Safely parse JSON strings into objects
const parseJsonSafely = (data: any, fallback: any = null) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Destructure expected fields
    const {
      id,
      companyId,
      title,
      slug,
      content,
      excerpt,
      coverImage,
      categories,
      tags,
      author,       // expect { name: string; profileImage: string }
      seo,          // expect { title?: string; description?: string; keywords?: string[] }
      status,       // DRAFT | PUBLISHED | ARCHIVED
      publishedAt,  // ISO date string
    } = body;

    // Basic required-field validation
    if (!companyId || !title || !slug || !content) {
      return NextResponse.json(
        { message: "Missing required fields: companyId, title, slug or content." },
        { status: 400 }
      );
    }

    // Normalize arrays
    const safeCategories = Array.isArray(categories) ? categories : categories ? [categories] : [];
    const safeTags       = Array.isArray(tags)       ? tags       : tags       ? [tags]       : [];

    // Parse optional JSON fields
    const safeAuthor = parseJsonSafely(author, {});
    const safeSeo    = parseJsonSafely(seo, {});

    // Parse optional date
    const pubDate = publishedAt && !isNaN(Date.parse(publishedAt))
      ? new Date(publishedAt)
      : null;

    // Build data object for Prisma
    const data: any = {
      company:        { connect: { id: companyId } },
      title,
      slug,
      content,
      excerpt:        excerpt || null,
      coverImage:     coverImage || null,
      categories:     safeCategories,
      tags:           safeTags,
      author:         Object.keys(safeAuthor).length ? safeAuthor : null,
      status:         status || "DRAFT",
      ...(pubDate && { publishedAt: pubDate }),
    };

    // Handle nested SEO record
    if (Object.keys(safeSeo).length) {
      data.seo = {
        upsert: {
          create: {
            title:       safeSeo.title    || null,
            description: safeSeo.description || null,
            keywords:    Array.isArray(safeSeo.keywords) ? safeSeo.keywords : [],
          },
          update: {
            title:       safeSeo.title    || undefined,
            description: safeSeo.description || undefined,
            keywords:    Array.isArray(safeSeo.keywords) ? safeSeo.keywords : undefined,
          },
        },
      };
    }

    let blog;
    // If `id` provided, try update; otherwise create
    if (id) {
      blog = await prisma.blog.upsert({
        where: { id },
        create: data,
        update: data,
      });
    } else {
      blog = await prisma.blog.create({ data });
    }

    return NextResponse.json(
      { message: "Blog saved successfully.", blog },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error in blog POST:", error);
    return NextResponse.json(
      { message: "Failed to save blog.", error: error.message },
      { status: 500 }
    );
  }
}
