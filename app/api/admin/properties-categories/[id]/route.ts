// app/api/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/verifyAuth';
import { formatResponse } from '@/lib/formatResponse';
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// GET /api/categories/:id
const getCategory = async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { properties: true },
      },
      parentCategory: {
        select: { id: true, name: true },
      },
    },
  });

  if (!category) {
    return formatResponse(false, null, 'Category not found', 404);
  }

  const formattedCategory = {
    ...category,
    propertyCount: category._count.properties,
    _count: undefined,
  };

  return formatResponse(true, formattedCategory, 'Category fetched successfully', 200);
};

// PUT /api/categories/:id
const updateCategory = async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;
  const { name, description, parentCategoryId } = await request.json();

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { name, description, parentCategoryId },
  });

  return formatResponse(true, updatedCategory, 'Category updated successfully', 200);
};

// DELETE /api/categories/:id
const deleteCategory = async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  const propertiesCount = await prisma.property.count({
    where: { categoryId: id },
  });

  if (propertiesCount > 0) {
    return formatResponse(false, null, `Cannot delete category. It is associated with ${propertiesCount} properties.`, 409);
  }

  await prisma.category.delete({ where: { id } });
  return formatResponse(true, null, 'Category deleted successfully', 200);
};

// Wrap handlers with `withApiHandler`
export const GET = withApiHandler(getCategory, { requireAuth: true });
export const PUT = withApiHandler(updateCategory, { requireAuth: true });
export const DELETE = withApiHandler(deleteCategory, { requireAuth: true });
