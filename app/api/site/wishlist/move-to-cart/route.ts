// app/api/wishlist/move-to-cart/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { authOptions } from "@/lib/auth";

async function POSTHandler(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { wishlistId } = await req.json();
  const userId = (session.user as any).id;

  const wish = await prisma.wishlistItem.findFirst({ where: { id: wishlistId, }, include: { marketplaceListings: true } });
  if (!wish) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // delete from wishlist
  await prisma.wishlistItem.delete({ where: { id: wishlistId } });

  // Return product to client to add to cart client-side
  return NextResponse.json({ marketplaceListings: wish.marketplaceListings });
}

export const POST = withApiHandler(POSTHandler);