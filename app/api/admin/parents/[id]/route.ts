import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// Define the expected structure for route parameters
type RouteParams = { params: { id: string } };

// Helper function to format the Parent response data
const formatParentResponse = (parent: any) => ({
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
});

// --- GET Handler Core Logic ---
async function handleGetParent(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  const parent = await prisma.parent.findUnique({
    where: { id },
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
      _count: {
        select: {
          children: true,
        },
      },
    },
  });

  if (!parent) {
    return formatResponse(false, null, "Parent not found", 404);
  }

  return formatParentResponse(parent);
}

// --- PATCH Handler Core Logic ---
async function handlePatchParent(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const body = await request.json();
  const { phone, bio, address, profilePicture, name, email, loginCode, ...rest } = body;

  // 1. Check if parent exists
  const existingParent = await prisma.parent.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existingParent) {
    return formatResponse(false, null, "Parent not found", 404);
  }

  // 2. Prepare Parent profile update data
  const parentUpdateData: any = {};
  if (phone !== undefined) parentUpdateData.phone = phone;
  if (bio !== undefined) parentUpdateData.bio = bio;
  if (address !== undefined) parentUpdateData.address = address;
  if (profilePicture !== undefined) parentUpdateData.profilePicture = profilePicture;

  // 3. Prepare User profile update data
  const userUpdateData: any = {};
  if (name !== undefined) userUpdateData.name = name;
  if (profilePicture !== undefined) userUpdateData.image = profilePicture; // Update user's image too

  if (email !== undefined) {
    // Check for email conflict
    if (email !== existingParent.user?.email) {
      const existingUserWithNewEmail = await prisma.user.findUnique({ where: { email } });
      if (existingUserWithNewEmail && existingUserWithNewEmail.id !== existingParent.userId) {
        return formatResponse(false, null, "The provided email is already in use by another user.", 409);
      }
    }
    userUpdateData.email = email;
  }
  
  // 4. Execute updates in a transaction for atomicity
  const updatePromises = [];
  if (Object.keys(parentUpdateData).length > 0) {
    updatePromises.push(
      prisma.parent.update({
        where: { id },
        data: parentUpdateData,
      })
    );
  }
  if (Object.keys(userUpdateData).length > 0) {
    updatePromises.push(
      prisma.user.update({
        where: { id: existingParent.userId },
        data: userUpdateData,
      })
    );
  }

  await prisma.$transaction(updatePromises);

  // 5. Fetch the final, fully updated record
  const finalParent = await prisma.parent.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      _count: {
        select: {
          children: true,
        },
      },
    },
  });

  if (!finalParent) {
    // Should not happen, but as a safeguard
    return formatResponse(false, null, "Failed to retrieve updated parent record.", 500);
  }

  return formatParentResponse(finalParent);
}

// --- DELETE Handler Core Logic ---
async function handleDeleteParent(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const deletedParent = await prisma.parent.delete({
      where: { id },
    });
    
    // Attempt to delete the associated User record as well (optional, depending on business logic)
    // await prisma.user.delete({ where: { id: deletedParent.userId } });

    return { message: "Parent deleted successfully", deletedId: deletedParent.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            return formatResponse(false, null, "Parent not found.", 404);
        }
        if (error.code === 'P2003') {
            // Foreign key constraint failed (e.g., children records still exist)
            return formatResponse(false, null, "Cannot delete parent: They are linked to existing student records. Please reassign students or update their parentId first.", 409);
        }
    }
    throw error;
  }
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetParent);
export const PATCH = withApiHandler(handlePatchParent);
export const DELETE = withApiHandler(handleDeleteParent);
