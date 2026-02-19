import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/parents/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// --- Helper: Generate Unique Login Code ---
async function generateUniqueLoginCode(): Promise<string> {
  let code: string = "";
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    code = code.padStart(6, "0");

    const existingParent = await prisma.parent.findUnique({
      where: { loginCode: code },
    });

    if (!existingParent) isUnique = true;
  }
  return code;
}

// --- GET /api/parents ---
async function handleGetParents(request: Request) { 

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const whereClause: any = {};
  if (companyId) whereClause.companyId = companyId;

  const cacheKey = `admin:parents:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const parents = await prisma.parent.findMany({
    where: whereClause,
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, emailVerified: true },
      },
      _count: { select: { children: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const response = parents.map((parent) => ({
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
    if (response) {
      await cacheSet(cacheKey, response, 60);
    }
  } catch (e) {}

  return formatResponse(true, response, "Parents fetched successfully", 200);
}

// --- POST /api/parents ---
async function handlePostParent(request: Request) {
  
  const body = await request.json();
  const { email, name, companyId, phone, bio, address, profilePicture } = body;

  if (!email || !name) {
    return formatResponse(false, null, "Email and Name are required", 400);
  }

  // 1. Find or Create User
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: { email, name, image: profilePicture },
    });
  } else {
    const existingParent = await prisma.parent.findUnique({ where: { userId: user.id } });
    if (existingParent) {
      return formatResponse(false, null, "A parent profile already exists for this user.", 409);
    }
  }

  // 2. Generate login code
  const loginCode = await generateUniqueLoginCode();

  // 3. Create Parent
  const newParent = await prisma.parent.create({
    data: {
      userId: user.id,
      loginCode,
      companyId,
      phone,
      bio,
      address,
      profilePicture,
    },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
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

  
    try { await cacheSet(`admin:parents:${companyId || 'global'}:all`, responseData, 60); } catch (e) {}
    return formatResponse(true, responseData, "Parent created successfully", 201);
}

// --- Export with handler wrapper ---
export const GET = withApiHandler(handleGetParents);
export const POST = withApiHandler(handlePostParent);
