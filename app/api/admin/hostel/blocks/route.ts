import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const blocks = await prisma.hostelBlock.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { rooms: true }
        }
      }
    });

    return NextResponse.json({ data: blocks });
  } catch (error) {
    console.error("[BLOCKS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}