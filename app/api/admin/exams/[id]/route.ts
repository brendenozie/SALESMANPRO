import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/parents/[id]
// Fetches a single parent by ID, including associated User data and children count.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
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
      return NextResponse.json({ message: "Parent not found" }, { status: 404 });
    }

    // Transform the data
    const responseData = {
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
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching parent with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch parent", error: error.message }, { status: 500 });
  }
}

// PATCH /api/parents/[id]
// Updates an existing Parent profile by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    const { phone, bio, address, profilePicture, name, email, loginCode, ...rest } = body; // Exclude loginCode from direct update

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for parent:", rest);
    }

    const existingParent = await prisma.parent.findUnique({
      where: { id },
    });

    if (!existingParent) {
      return NextResponse.json({ message: "Parent not found" }, { status: 404 });
    }

    const parentUpdateData: any = {};
    if (phone !== undefined) parentUpdateData.phone = phone;
    if (bio !== undefined) parentUpdateData.bio = bio;
    if (address !== undefined) parentUpdateData.address = address;
    if (profilePicture !== undefined) parentUpdateData.profilePicture = profilePicture;

    const updatedParent = await prisma.parent.update({
      where: { id },
      data: parentUpdateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (name !== undefined || email !== undefined) {
      const userUpdateData: any = {};
      if (name !== undefined) userUpdateData.name = name;
      if (email !== undefined) {
        if (email !== updatedParent.user?.email) {
          const existingUserWithNewEmail = await prisma.user.findUnique({ where: { email } });
          if (existingUserWithNewEmail && existingUserWithNewEmail.id !== updatedParent.userId) {
            return NextResponse.json({ message: "The provided email is already in use by another user." }, { status: 409 });
          }
        }
        userUpdateData.email = email;
      }
      if (profilePicture !== undefined) userUpdateData.image = profilePicture;

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: updatedParent.userId },
          data: userUpdateData,
        });
      }
    }

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

    const responseData = {
      id: finalParent!.id,
      userId: finalParent!.userId,
      loginCode: finalParent!.loginCode,
      name: finalParent!.user?.name,
      email: finalParent!.user?.email,
      profilePicture: finalParent!.profilePicture || finalParent!.user?.image,
      phone: finalParent!.phone,
      bio: finalParent!.bio,
      address: finalParent!.address,
      companyId: finalParent!.companyId,
      totalChildren: finalParent!._count.children,
      createdAt: finalParent!.createdAt,
      updatedAt: finalParent!.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating parent with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to update parent", error: error.message }, { status: 500 });
  }
}

// DELETE /api/parents/[id]
// Deletes a Parent profile by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const existingParent = await prisma.parent.findUnique({
      where: { id },
    });

    if (!existingParent) {
      return NextResponse.json({ message: "Parent not found" }, { status: 404 });
    }

    // IMPORTANT: Consider cascading effects.
    // If a parent is deleted, what happens to their children's parentId?
    // You might want to set children's parentId to NULL, or prevent deletion if children exist.
    // For now, Prisma will prevent deletion if children are still linked unless onDelete is configured.

    const deletedParent = await prisma.parent.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Parent deleted successfully", deletedId: deletedParent.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting parent with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete parent: They are linked to existing student records. Please reassign students or update their parentId first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete parent", error: error.message }, { status: 500 });
  }
}
