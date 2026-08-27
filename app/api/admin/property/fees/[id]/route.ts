import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { Prisma } from "@prisma/client";

// Define a reusable selection for performance
const FEE_SELECT = {
  id: true,
  invoiceNumber: true,
  rentAmount: true,
  messAmount: true,
  totalAmount: true,
  dueDate: true,
  status: true,
  createdAt: true,
  room: { select: { id: true, roomNumber: true } },
  hostelMember: { select: { id: true, memberId: true } },
};

// GET: Fetch a single fee invoice
const getFee = async (
  _req: Request,
  context: { params: { id: string }; user?: any },
) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;

  const cacheKey = `admin:fee:${id}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ data: cached }, { status: 200 });
  } catch (e) {}

  const singleFee = await prisma.hostelFee.findUnique({
    where: { id, companyId }, // Security: Must match user's company
    select: FEE_SELECT,
  });

  if (!singleFee) {
    return NextResponse.json(
      { message: "Fee not found or access denied" },
      { status: 404 },
    );
  }

  // Cache the result for 1 minute
  try {
    await cacheSet(cacheKey, singleFee, 60);
  } catch (e) {}

  return NextResponse.json({ data: singleFee }, { status: 200 });
};

// PUT: Update a fee invoice (e.g., mark as PAID)
const updateFee = async (
  req: Request,
  context: { params: { id: string }; user?: any },
) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;
  const body = await req.json();

  // Filter body to prevent accidental overwriting of sensitive fields
  const { status, rentAmount, messAmount, dueDate, hostelMemberId, roomId } =
    body;

  const cacheKey = `admin:fee:${id}`;

  try {
    // Recalculate total if amounts are being updated
    let totalAmount;
    if (rentAmount !== undefined || messAmount !== undefined) {
      // Fetch existing to do proper math if only one is provided, or just require both in the request
      const existing = await prisma.hostelFee.findUnique({ where: { id } });
      if (existing) {
        const newRent =
          rentAmount !== undefined ? Number(rentAmount) : existing.rentAmount;
        const newMess =
          messAmount !== undefined ? Number(messAmount) : existing.messAmount;
        totalAmount = newRent + newMess;
      }
    }

    const updatedFee = await prisma.hostelFee.update({
      where: { id, companyId },
      data: {
        ...(status && { status }),
        ...(rentAmount !== undefined && { rentAmount: Number(rentAmount) }),
        ...(messAmount !== undefined && { messAmount: Number(messAmount) }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(hostelMemberId && {
          hostelMember: { connect: { id: hostelMemberId } },
        }),
        ...(roomId && { room: { connect: { id: roomId } } }),
      },
      select: FEE_SELECT,
    });

    // Invalidate caches
    try {
      await cacheDel(cacheKey);
      await cacheDel(`admin:fees:${companyId}:*`);
    } catch (e) {}

    return NextResponse.json(
      { data: updatedFee, message: "Fee updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Fee not found or unauthorized" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};

// DELETE: Remove a fee invoice
const deleteFee = async (
  _req: Request,
  context: { params: { id: string }; user?: any },
) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;

  try {
    await prisma.hostelFee.delete({
      where: { id, companyId },
    });

    // Invalidate caches
    try {
      await cacheDel(`admin:fee:${id}`);
      await cacheDel(`admin:fees:${companyId}:*`);
    } catch (e) {}

    return NextResponse.json(
      { message: "Fee deleted successfully", data: { id } },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Fee not found or unauthorized" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};

export const GET = withApiHandler(getFee, {
  requireAuth: true,
  requireRateLimit: true,
});
export const PUT = withApiHandler(updateFee, {
  requireAuth: true,
  requireRateLimit: true,
});
export const DELETE = withApiHandler(deleteFee, {
  requireAuth: true,
  requireRateLimit: true,
});
