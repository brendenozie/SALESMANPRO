import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/categories/route.ts  
import prisma from '@/server/db/prismadb';

import { formatResponse } from '@/lib/formatResponse';
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// GET /api/categories
const getCategories = async () => {
  // const categories = await prisma.category.findMany({
  //   include: {
  //     _count: {
  //       select: { properties: true },
  //     },
  //     parentCategory: {
  //       select: { id: true, name: true },
  //     },
  //   },
  //   orderBy: { name: 'asc' },
  // });

  // const formattedCategories = categories.map((cat) => ({
  //   ...cat,
  //   propertyCount: cat._count.properties,
  //   _count: undefined,
  // }));

  return formatResponse(true, {formattedCategories:"formattedCategories"}, 'Categories fetched successfully', 200);
};

// POST /api/categories
const createCategory = async (request: Request) => {
  const { name, description, parentCategoryId } = await request.json();

  // if (!name) {
  //   return formatResponse(false, null, 'Category name is required', 400);
  // }

  // const newCategory = await prisma.category.create({
  //   data: { name, description, parentCategoryId },
  // });

  return formatResponse(true, {newCategory:"newCategory"}, 'Category created successfully', 201);
};

// Wrap handlers with `withApiHandler`
export const GET = withApiHandler(getCategories, { requireAuth: true });
export const POST = withApiHandler(createCategory, { requireAuth: true });
