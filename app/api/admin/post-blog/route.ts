// app/api/blogs/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

const parseJsonSafely = (data: any, fallback: any = null) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

export async function POST(req: Request) {
  try {
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
      author,
      seo,
      status,
      publishedAt,
    } = await req.json();

    if (!companyId || !title || !slug || !content) {
      return NextResponse.json(
        { message: "Missing required fields: companyId, title, slug or content." },
        { status: 400 }
      );
    }

    const safeCategories = Array.isArray(categories)
      ? categories
      : categories
      ? [categories]
      : [];
    const safeTags = Array.isArray(tags) ? tags : tags ? [tags] : [];
    const safeAuthor = parseJsonSafely(author, {});
    const safeSeo = parseJsonSafely(seo, {});

    const pubDate =
      publishedAt && !isNaN(Date.parse(publishedAt))
        ? new Date(publishedAt)
        : undefined;

    // Base payload (everything except SEO)
    const baseData: any = {
      company: { connect: { id: companyId } },
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      categories: safeCategories,
      tags: safeTags,
      author: Object.keys(safeAuthor).length ? safeAuthor : undefined,
      status: status || "DRAFT",
      publishedAt: pubDate,
    };

    let blog;
    if (id) {
      // --- UPDATE (with nested upsert for SEO) ---
      blog = await prisma.blog.upsert({
        where: { id },
        create: {
          ...baseData,
          // if no existing SEO, create it on the create-path too
          seo: Object.keys(safeSeo).length
            ? {
                create: {
                  title: safeSeo.title || null,
                  description: safeSeo.description || null,
                  keywords: Array.isArray(safeSeo.keywords)
                    ? safeSeo.keywords
                    : [],
                },
              }
            : undefined,
        },
        update: {
          ...baseData,
          // here we can safely upsert (update if exists, create otherwise)
          seo: Object.keys(safeSeo).length
            ? {
                upsert: {
                  create: {
                    title: safeSeo.title || null,
                    description: safeSeo.description || null,
                    keywords: Array.isArray(safeSeo.keywords)
                      ? safeSeo.keywords
                      : [],
                  },
                  update: {
                    title: safeSeo.title ?? undefined,
                    description: safeSeo.description ?? undefined,
                    keywords: Array.isArray(safeSeo.keywords)
                      ? safeSeo.keywords
                      : undefined,
                  },
                },
              }
            : undefined,
        },
      });
    } else {
      // --- CREATE (only create-branch) ---
      blog = await prisma.blog.create({
        data: {
          ...baseData,
          seo: Object.keys(safeSeo).length
            ? {
                create: {
                  title: safeSeo.title || null,
                  description: safeSeo.description || null,
                  keywords: Array.isArray(safeSeo.keywords)
                    ? safeSeo.keywords
                    : [],
                },
              }
            : undefined,
        },
      });
    }

    return NextResponse.json(
      { message: "Blog saved successfully.", blog },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error in blog POST:", error);
    return NextResponse.json(
      { message: "Failed to save blog.", error: error.message },
      { status: 500 }   // ← fixed comma here
    );
  }
}
