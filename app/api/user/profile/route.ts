import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function GET() {
  const session = await getServerSession(authOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      bio: true,
      address: true,
      profilePicture: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, username, phone, bio, address, avatarUrl, profilePicture } = body;
  const imageToSave = profilePicture || avatarUrl;

  const dataToUpdate: any = {};
  if (typeof name === "string") dataToUpdate.name = name;
  if (typeof username === "string") dataToUpdate.username = username;
  if (typeof phone === "string") dataToUpdate.phone = phone;
  if (typeof bio === "string") dataToUpdate.bio = bio;
  if (typeof address === "string") dataToUpdate.address = address;
  if (typeof imageToSave === "string") {
    dataToUpdate.image = imageToSave;
    dataToUpdate.profilePicture = imageToSave;
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: dataToUpdate,
  });

  return NextResponse.json({
    message: "Profile updated successfully",
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      address: updatedUser.address,
      profilePicture: updatedUser.profilePicture || updatedUser.image,
    },
  });
}
