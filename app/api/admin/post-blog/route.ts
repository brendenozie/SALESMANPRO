import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/blogs/route.ts
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Utility: parse JSON safely
const parseJsonSafely = (data: any, fallback: any = null) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

const createOrUpdateBlog = async (req: Request) => {

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
    return formatResponse(
      false,
      null,
      "Missing required fields: companyId, title, slug or content.",
      400
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
    // --- CREATE ---
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

    try { await cacheDel(`admin:post-blog:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { blog }, "Blog saved successfully.", 201);
};

// Export wrapped handler
export const POST = withApiHandler(createOrUpdateBlog);


export const PUT = withApiHandler(createOrUpdateBlog);
