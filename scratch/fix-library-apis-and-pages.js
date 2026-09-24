const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. Repair app/api/admin/library/categories/[id]/route.ts
// =========================================================================
const catRoute = `import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/categories/[id]
const updateCategoryLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();
  const { name } = body;

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryCategory.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Category not found in this company.", 404);
  }

  const updatedCategory = await prisma.libraryCategory.update({
    where: { id },
    data: { name },
  });

  try {
    await cacheDel(\`tenant:\${companyId}:libraryCategories:*\`);
    await cacheDel(\`admin:libraryCategories:*\`);
  } catch (e) {}

  return formatResponse(true, updatedCategory, "Category updated successfully", 200);
};

export const PUT = withApiHandler(updateCategoryLogic, { requireAuth: true });

// DELETE /api/admin/library/categories/[id]
const deleteCategoryLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryCategory.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Category not found in this company.", 404);
  }

  await prisma.libraryCategory.delete({
    where: { id },
  });

  try {
    await cacheDel(\`tenant:\${companyId}:libraryCategories:*\`);
    await cacheDel(\`admin:libraryCategories:*\`);
  } catch (e) {}

  return formatResponse(true, null, "Category removed from archive", 200);
};

export const DELETE = withApiHandler(deleteCategoryLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/categories/[id]/route.ts', catRoute, 'utf8');

// =========================================================================
// 2. Repair app/api/admin/library/books/[id]/route.ts
// =========================================================================
const booksRoute = `import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/books/[id]
const updateBookLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryBook.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Book not found in this company.", 404);
  }

  const updatedBook = await prisma.libraryBook.update({
    where: { id },
    data: {
      title: body.title,
      author: body.author,
      isbn: body.isbn,
      publisher: body.publisher,
      status: body.status,
      location: body.location,
      ...(body.categoryId ? { categoryId: body.categoryId } : {}),
      ...(body.shelfLocation ? { shelfLocation: body.shelfLocation } : {}),
      ...(body.condition ? { condition: body.condition } : {}),
      ...(body.integrity !== undefined ? { integrity: Number(body.integrity) } : {}),
    },
    include: { category: true },
  });

  try {
    await cacheDel(\`tenant:\${companyId}:libraryBooks:*\`);
    await cacheDel(\`admin:libraryBooks:*\`);
  } catch (e) {}

  return formatResponse(true, updatedBook, "Archive record updated", 200);
};

export const PUT = withApiHandler(updateBookLogic, { requireAuth: true });

// DELETE /api/admin/library/books/[id]
const deleteBookLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryBook.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Book not found in this company.", 404);
  }

  // Clean dependent reservations and issuances safely
  await prisma.libraryReservation.deleteMany({ where: { bookId: id } });
  await prisma.libraryIssuance.deleteMany({ where: { bookId: id } });

  await prisma.libraryBook.delete({
    where: { id },
  });

  try {
    await cacheDel(\`tenant:\${companyId}:libraryBooks:*\`);
    await cacheDel(\`admin:libraryBooks:*\`);
  } catch (e) {}

  return formatResponse(true, null, "Volume removed from archive", 200);
};

export const DELETE = withApiHandler(deleteBookLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/books/[id]/route.ts', booksRoute, 'utf8');

// =========================================================================
// 3. Repair app/api/admin/library/members/[id]/route.ts
// =========================================================================
const membersRoute = `import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/members/[id]
const updateMemberLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryMember.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Member not found in this company.", 404);
  }

  const updatedMember = await prisma.libraryMember.update({
    where: { id },
    data: {
      status: body.status || existing.status,
    },
    include: {
      student: true,
      educator: { include: { user: true } },
    },
  });

  return formatResponse(true, updatedMember, "Member updated successfully", 200);
};

export const PUT = withApiHandler(updateMemberLogic, { requireAuth: true });

// DELETE /api/admin/library/members/[id]
const deleteMemberLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryMember.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Member not found in this company.", 404);
  }

  await prisma.libraryMember.delete({
    where: { id },
  });

  return formatResponse(true, null, "Member removed successfully", 200);
};

export const DELETE = withApiHandler(deleteMemberLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/members/[id]/route.ts', membersRoute, 'utf8');

// =========================================================================
// 4. Repair app/api/admin/library/issuance/[id]/route.ts
// =========================================================================
const issuanceRoute = `import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/issuance/[id]
const updateIssuanceLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryIssuance.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Issuance not found in this company.", 404);
  }

  const updated = await prisma.libraryIssuance.update({
    where: { id },
    data: {
      status: body.status || existing.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
      returnDate: body.returnDate ? new Date(body.returnDate) : existing.returnDate,
      isDamaged: body.isDamaged !== undefined ? Boolean(body.isDamaged) : existing.isDamaged,
    },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } },
        },
      },
    },
  });

  return formatResponse(true, updated, "Issuance record updated", 200);
};

export const PUT = withApiHandler(updateIssuanceLogic, { requireAuth: true });

// DELETE /api/admin/library/issuance/[id]
const deleteIssuanceLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryIssuance.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Issuance not found in this company.", 404);
  }

  // Delete fines attached to this issuance first
  await prisma.libraryFine.deleteMany({ where: { issuanceId: id } });

  await prisma.libraryIssuance.delete({
    where: { id },
  });

  return formatResponse(true, null, "Issuance record deleted", 200);
};

export const DELETE = withApiHandler(deleteIssuanceLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/issuance/[id]/route.ts', issuanceRoute, 'utf8');

// =========================================================================
// 5. Repair app/api/admin/library/fines/[id]/route.ts
// =========================================================================
const finesRoute = `import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/fines/[id]
const updateFineLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  const existing = await prisma.libraryFine.findFirst({
    where: {
      id,
      ...(companyId ? { issuance: { companyId } } : {}),
    },
  });
  if (!existing) {
    return formatResponse(false, null, "Fine record not found.", 404);
  }

  const updatedFine = await prisma.libraryFine.update({
    where: { id },
    data: {
      amount: body.amount !== undefined ? Number(body.amount) : existing.amount,
      status: body.status || existing.status,
      paidDate: body.status === 'PAID' ? new Date() : (body.paidDate ? new Date(body.paidDate) : null),
      reason: body.reason !== undefined ? body.reason : existing.reason,
    },
  });

  return formatResponse(true, updatedFine, "Fine record updated", 200);
};

export const PUT = withApiHandler(updateFineLogic, { requireAuth: true });

// DELETE /api/admin/library/fines/[id]
const deleteFineLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const existing = await prisma.libraryFine.findFirst({
    where: {
      id,
      ...(companyId ? { issuance: { companyId } } : {}),
    },
  });
  if (!existing) {
    return formatResponse(false, null, "Fine record not found.", 404);
  }

  await prisma.libraryFine.delete({
    where: { id },
  });

  return formatResponse(true, null, "Fine record removed", 200);
};

export const DELETE = withApiHandler(deleteFineLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/fines/[id]/route.ts', finesRoute, 'utf8');

// =========================================================================
// 6. Repair app/api/admin/library/acquisitions/[id]/route.ts
// =========================================================================
const acqRoute = `import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/acquisitions/[id]
const updateAcqLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryAcquisition.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Acquisition not found in this company.", 404);
  }

  const updated = await prisma.libraryAcquisition.update({
    where: { id },
    data: {
      title: body.title !== undefined ? body.title : existing.title,
      qty: body.qty !== undefined ? Number(body.qty) : existing.qty,
      cost: body.cost !== undefined ? Number(body.cost) : existing.cost,
      vendor: body.vendor !== undefined ? body.vendor : existing.vendor,
      status: body.status !== undefined ? body.status : existing.status,
      category: body.category !== undefined ? body.category : existing.category,
    },
  });

  return formatResponse(true, updated, "Acquisition updated successfully", 200);
};

export const PUT = withApiHandler(updateAcqLogic, { requireAuth: true });

// DELETE /api/admin/library/acquisitions/[id]
const deleteAcqLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryAcquisition.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Acquisition not found in this company.", 404);
  }

  await prisma.libraryAcquisition.delete({
    where: { id },
  });

  return formatResponse(true, null, "Acquisition deleted successfully", 200);
};

export const DELETE = withApiHandler(deleteAcqLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/acquisitions/[id]/route.ts', acqRoute, 'utf8');

// =========================================================================
// 7. Repair app/api/admin/library/suppliers-categories/[id]/route.ts
// =========================================================================
const supCatRoute = `import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/suppliers-categories/[id]
const updateSupCatLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.librarySupplierCategory.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Supplier category not found.", 404);
  }

  const updated = await prisma.librarySupplierCategory.update({
    where: { id },
    data: { name: body.name || existing.name },
  });

  return formatResponse(true, updated, "Supplier category updated", 200);
};

export const PUT = withApiHandler(updateSupCatLogic, { requireAuth: true });

// DELETE /api/admin/library/suppliers-categories/[id]
const deleteSupCatLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.librarySupplierCategory.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Supplier category not found.", 404);
  }

  await prisma.librarySupplierCategory.delete({
    where: { id },
  });

  return formatResponse(true, null, "Supplier category deleted", 200);
};

export const DELETE = withApiHandler(deleteSupCatLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/suppliers-categories/[id]/route.ts', supCatRoute, 'utf8');

// =========================================================================
// 8. Repair app/api/admin/library/suppliers/[id]/route.ts
// =========================================================================
const supRoute = `import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/suppliers/[id]
const updateSupLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.librarySupplier.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Supplier not found in this company.", 404);
  }

  const updated = await prisma.librarySupplier.update({
    where: { id },
    data: {
      name: body.name !== undefined ? body.name : existing.name,
      contactEmail: body.contactEmail !== undefined ? body.contactEmail : existing.contactEmail,
      phone: body.phone !== undefined ? body.phone : existing.phone,
      address: body.address !== undefined ? body.address : existing.address,
      categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
      leadTime: body.leadTime !== undefined ? body.leadTime : existing.leadTime,
      reliability: body.reliability !== undefined ? Number(body.reliability) : existing.reliability,
      status: body.status !== undefined ? body.status : existing.status,
    },
  });

  return formatResponse(true, updated, "Supplier updated successfully", 200);
};

export const PUT = withApiHandler(updateSupLogic, { requireAuth: true });

// DELETE /api/admin/library/suppliers/[id]
const deleteSupLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.librarySupplier.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Supplier not found in this company.", 404);
  }

  await prisma.librarySupplier.delete({
    where: { id },
  });

  return formatResponse(true, null, "Supplier removed successfully", 200);
};

export const DELETE = withApiHandler(deleteSupLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/suppliers/[id]/route.ts', supRoute, 'utf8');

// =========================================================================
// 9. Repair app/api/admin/library/reservations/[id]/route.ts
// =========================================================================
const resRoute = `import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/reservations/[id]
const updateResLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.libraryReservation.findUnique({
    where: { id },
  });
  if (!existing) {
    return formatResponse(false, null, "Reservation not found.", 404);
  }

  const updated = await prisma.libraryReservation.update({
    where: { id },
    data: {
      status: body.status || existing.status,
    },
  });

  return formatResponse(true, updated, "Reservation updated", 200);
};

export const PUT = withApiHandler(updateResLogic, { requireAuth: true });

// DELETE /api/admin/library/reservations/[id]
const deleteResLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;

  const existing = await prisma.libraryReservation.findUnique({
    where: { id },
  });
  if (!existing) {
    return formatResponse(false, null, "Reservation not found.", 404);
  }

  await prisma.libraryReservation.delete({
    where: { id },
  });

  return formatResponse(true, null, "Reservation removed", 200);
};

export const DELETE = withApiHandler(deleteResLogic, { requireAuth: true });
`;
fs.writeFileSync('app/api/admin/library/reservations/[id]/route.ts', resRoute, 'utf8');

console.log('All 9 library API routes fixed successfully!');
