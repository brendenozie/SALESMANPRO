import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// --- Helper: Generate Unique Login Code ---
async function generateUniqueLoginCode(): Promise<string> {
  const maxAttempts = 5;

  for (let i = 0; i < maxAttempts; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const existingParent = await prisma.parent.findUnique({
      where: { loginCode: code },
      select: { id: true },
    });

    if (!existingParent) return code;
  }

  throw new Error(
    "Failed to generate a unique login code after multiple attempts.",
  );
}

// --- Helper: Cache Key Builder ---
const getCacheKey = (companyId: string | null) =>
  `admin:parents:${companyId || "global"}:all`;

// --- GET /api/parents ---
async function handleGetParents(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const cacheKey = getCacheKey(companyId);

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (error) {
    console.error("Cache read error:", error);
  }

  const parents = await prisma.parent.findMany({
    where: companyId ? { companyId } : {},
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          emailVerified: true,
        },
      },
      _count: { select: { children: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const responseData = parents.map((parent) => ({
    id: parent.id,
    userId: parent.userId,
    loginCode: parent.loginCode,
    name: parent.user?.name,
    email: parent.user?.email,
    profilePicture: parent.profilePicture || parent.user?.image,
    phone: parent.phone,
    bio: parent.bio,
    address: parent.address,
    companyId: parent.companyId,
    totalChildren: parent._count.children,
    createdAt: parent.createdAt,
    updatedAt: parent.updatedAt,
  }));

  try {
    await cacheSet(cacheKey, responseData, 60);
  } catch (error) {
    console.error("Cache write error:", error);
  }

  return formatResponse(
    true,
    responseData,
    "Parents fetched successfully",
    200,
  );
}

// --- POST /api/parents ---
async function handlePostParent(request: Request) {
  const body = await request.json();
  const { email, name, companyId, phone, bio, address, profilePicture } = body;

  if (!email || !name) {
    return formatResponse(false, null, "Email and Name are required", 400);
  }

  // Matches schema: include capital "Parent" array
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { Parent: { select: { id: true } } },
  });

  // Since User schema dictates Parent[], evaluate its array population bounds
  if (existingUser && existingUser.Parent.length > 0) {
    return formatResponse(
      false,
      null,
      "A parent profile already exists for this user.",
      409,
    );
  }

  const loginCode = await generateUniqueLoginCode();

  // Atomic generation rollback window
  // Execute User and Parent linking inside an Atomic Transaction
  const newParent = await prisma.$transaction(async (tx) => {
    let user = existingUser;

    if (!user) {
      user = await tx.user.create({
        data: { email, name, image: profilePicture },
        // 👇 ADD THIS TO MATCH THE TYPE EXPECTED BY "existingUser"
        include: {
          Parent: { select: { id: true } },
        },
      });
    }

    return await tx.parent.create({
      data: {
        userId: user.id,
        loginCode,
        companyId,
        phone,
        bio,
        address,
        profilePicture,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  });

  const responseData = {
    id: newParent.id,
    userId: newParent.userId,
    loginCode: newParent.loginCode,
    name: newParent.user?.name,
    email: newParent.user?.email,
    profilePicture: newParent.profilePicture || newParent.user?.image,
    phone: newParent.phone,
    bio: newParent.bio,
    address: newParent.address,
    companyId: newParent.companyId,
    totalChildren: 0,
    createdAt: newParent.createdAt,
    updatedAt: newParent.updatedAt,
  };

  try {
    await cacheDel(getCacheKey(companyId));
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }

  return formatResponse(true, responseData, "Parent created successfully", 201);
}

export const GET = withApiHandler(handleGetParents);
export const POST = withApiHandler(handlePostParent);
