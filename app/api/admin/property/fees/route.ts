import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";

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
  room: {
    select: {
      id: true,
      roomNumber: true,
    },
  },
  hostelMember: {
    select: {
      id: true,
      memberId: true,
      student: {
        select: {
          id: true,
          // Assuming your Student model has name/email fields. Adjust as needed.
          // firstName: true,
          // lastName: true,
        },
      },
    },
  },
};

const getFees = async (req: Request, context: { user?: any }) => {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const companyId = searchParams.get("companyId") || context.user?.companyId;
  const status = searchParams.get("status");
  const skip = (page - 1) * limit;

  if (!companyId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const where: any = {
    companyId: companyId,
    ...(status && { status }),
  };

  const cacheKey = `admin:fees:${companyId}:page:${page}:limit:${limit}:status:${status || "all"}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {
    // Cache miss or error
  }

  // OPTIMIZATION: Run count and fetch in parallel
  const [fees, total] = await Promise.all([
    prisma.hostelFee.findMany({
      where: where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: FEE_SELECT,
    }),
    prisma.hostelFee.count({
      where: where,
    }),
  ]);

  const responseData = {
    data: fees,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  // Cache the result for 1 minute
  try {
    await cacheSet(cacheKey, responseData, 60);
  } catch (e) {}

  return NextResponse.json(responseData, { status: 200 });
};

const createFee = async (req: Request, context: { user?: any }) => {
  const body = await req.json();
  const companyId = context.user?.companyId;

  if (!companyId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {
    invoiceNumber,
    hostelMemberId,
    roomId,
    rentAmount,
    messAmount,
    dueDate,
    status,
  } = body;

  // Validation
  if (
    !invoiceNumber ||
    !hostelMemberId ||
    !roomId ||
    rentAmount === undefined ||
    messAmount === undefined ||
    !dueDate
  ) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }

  const totalAmount = Number(rentAmount) + Number(messAmount);

  const newFee = await prisma.hostelFee.create({
    data: {
      invoiceNumber,
      rentAmount: Number(rentAmount),
      messAmount: Number(messAmount),
      totalAmount,
      dueDate: new Date(dueDate),
      status: status ?? "PENDING",
      hostelMember: { connect: { id: hostelMemberId } },
      room: { connect: { id: roomId } },
      companyId: companyId, // 🔒 never trust client input for companyId
    },
    select: FEE_SELECT,
  });

  // Invalidate relevant caches
  try {
    await cacheDel(`tenant:${companyId}:fees:*`);
    await cacheDel(`admin:fees:*`);
  } catch (e) {}

  return NextResponse.json(
    { data: newFee, message: "Fee created successfully" },
    { status: 201 },
  );
};

export const GET = withApiHandler(getFees, {
  requireAuth: true,
  requireRateLimit: true,
});

export const POST = withApiHandler(createFee, {
  requireAuth: true,
  requireRateLimit: true,
});
