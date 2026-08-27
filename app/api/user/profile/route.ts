import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, avatarUrl } = await req.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone,
      image: avatarUrl,
      profilePicture: avatarUrl,
    },
  });

  return NextResponse.json({ message: "Profile updated successfully" });
}
