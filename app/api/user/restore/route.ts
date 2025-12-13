import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.deletedAt) {
    return NextResponse.json(
      { message: "Account not eligible for restoration" },
      { status: 400 }
    );
  }

  // ⏱ 30-day grace period
  const daysSinceDelete =
    (Date.now() - user.deletedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceDelete > 30) {
    return NextResponse.json(
      { message: "Account permanently deleted" },
      { status: 410 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      deletedAt: null,
    },
  });

  return NextResponse.json({
    message: "Account restored successfully",
  });
}
