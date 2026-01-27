import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "Missing Company ID" }, { status: 400 });

  const records = await prisma.libraryIssuance.findMany({
    where: { companyId },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ data: records });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookId, memberId, dueDate, companyId } = body;

    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create Issuance (Converting dueDate string to Date object)
      const issuance = await tx.libraryIssuance.create({
        data: {
          bookId,
          libraryMemberId: memberId,
          companyId,
          dueDate: new Date(dueDate),
          status: 'ACTIVE',
        },
        include: { book: true }
      });

      // 2. Update Book Status (Assuming your model uses a status field)
      await tx.libraryBook.update({
        where: { id: bookId },
        data: { status: 'ISSUED' } 
      });

      return issuance;
    });

    return NextResponse.json({ data: transaction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}