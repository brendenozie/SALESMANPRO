import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/server/db/prismadb";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: true,
      // student: true,
      // educator: true,
      // consumer: true,
      // salesAgent: true,
      // client: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 🔐 Require password confirmation if user has a password
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

  // 🧹 Transactional delete (safe + atomic)
  await prisma.$transaction([
    prisma.account.deleteMany({ where: { userId: user.id } }),

    prisma.student.deleteMany({ where: { userId: user.id } }),
    prisma.educator.deleteMany({ where: { userId: user.id } }),
    prisma.consumer.deleteMany({ where: { userId: user.id } }),
    prisma.salesAgent.deleteMany({ where: { userId: user.id } }),
    prisma.client.deleteMany({ where: { userId: user.id } }),

    prisma.session.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  return NextResponse.json({
    message: "Account permanently deleted",
  });
}
