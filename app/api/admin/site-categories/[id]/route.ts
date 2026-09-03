import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// // app/api/academic-levels/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Force the use of Edge if your DB setup allows it
// export const runtime = 'edge'; 

// import prisma from "@/server/db/prismadb";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { cacheDel } from "@/lib/cache";

export const PATCH = withApiHandler(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();
  const { name, icon, status, variants } = body;

  const updatedCategory = await prisma.companyCategory.update({
    where: { id },
    data: {
      name,
      icon,
      status,
      // Logic: Delete existing variants and recreate them to sync the list
      // Or you can map them by ID if you want to preserve specific variant IDs
      variants: {
        deleteMany: {}, 
        create: variants.map((v: any) => ({
          name: v.name,
          link: v.link,
          description: v.description,
          tag: v.tag,
          desktopPreviewImage: v.desktopPreviewImage,
          mobilePreviewImage: v.mobilePreviewImage,
        })),
      },
    },
    include: { variants: true }
  });

  // Clear cache for both the list and any specific company caches
  await cacheDel(`tenant:${'unscoped'}:companycategory:*`);
  await cacheDel(`admin:companycategory:*`);
  
  return formatResponse(true, updatedCategory, "Category Updated", 200);
});

export const DELETE = withApiHandler(async (request, { params }) => {
  const { id } = params;

  // MongoDB doesn't have native Cascade Delete in Prisma schema 
  // so we manually clean up the variants first
  await prisma.variant.deleteMany({
    where: { categoryId: id }
  });

  await prisma.companyCategory.delete({
    where: { id }
  });

  await cacheDel(`tenant:${'unscoped'}:companycategory:*`);
  await cacheDel(`admin:companycategory:*`);
  
  return formatResponse(true, null, "Category and variants deleted", 200);
});