import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/server/db/prismadb";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 🔐 Require password if credentials user
  if (user.password) {
    if (!password) {
      return NextResponse.json(
        { message: "Password confirmation required" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 400 }
      );
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  return NextResponse.json({
    message: "Account deactivated. You can restore it within 30 days.",
  });
}
