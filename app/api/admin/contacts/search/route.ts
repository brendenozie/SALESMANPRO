import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const query = (searchParams.get("query") || searchParams.get("q") || "").trim();

    if (!companyId) {
      return NextResponse.json({ success: false, error: "Missing companyId" }, { status: 400 });
    }

    // Search existing Clients for this tenant company
    const clients = await prisma.client.findMany({
      where: {
        companyId,
        ...(query
          ? {
              OR: [
                { user: { name: { contains: query, mode: "insensitive" } } },
                { user: { email: { contains: query, mode: "insensitive" } } },
                { user: { phone: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      take: 15,
      orderBy: { createdAt: "desc" },
    });

    // Search existing Consumers for this tenant company
    const consumers = await prisma.consumer.findMany({
      where: {
        companyId,
        ...(query
          ? {
              OR: [
                { user: { name: { contains: query, mode: "insensitive" } } },
                { user: { email: { contains: query, mode: "insensitive" } } },
                { user: { phone: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      take: 15,
      orderBy: { createdAt: "desc" },
    });

    const unified = [
      ...clients.map((c) => ({
        id: c.id,
        userId: c.userId,
        type: "CLIENT" as const,
        name: c.user?.name || "Client",
        email: c.user?.email || null,
        phone: c.user?.phone || null,
        source: "Existing Client Record",
      })),
      ...consumers.map((c) => ({
        id: c.id,
        userId: c.userId,
        type: "CONSUMER" as const,
        name: c.user?.name || "Consumer",
        email: c.user?.email || null,
        phone: c.user?.phone || null,
        source: "Existing Consumer Record",
      })),
    ];

    // De-duplicate by email/name if same person has both
    const seen = new Set<string>();
    const unique = unified.filter((item) => {
      const key = `${item.email || item.name || item.id}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ success: true, data: unique, contacts: unique });
  } catch (err: any) {
    console.error("Contacts search error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search contacts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    const body = await req.json();
    const { companyId, name, email, phone } = body;

    if (!companyId) {
      return NextResponse.json({ success: false, error: "Missing companyId" }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Customer name is required" }, { status: 400 });
    }

    const cleanEmail = email?.trim() || `client-${Date.now()}@internal.local`;
    const cleanPhone = phone?.trim() || null;

    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            ...(cleanPhone ? [{ phone: cleanPhone }] : []),
          ],
        },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            name: name.trim(),
            ...(cleanPhone && { phone: cleanPhone }),
          },
        });
      }

      let client = await tx.client.findFirst({
        where: { companyId, userId: user.id },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            companyId,
            userId: user.id,
          },
        });
      }

      return { user, client };
    });

    const contactPayload = {
      id: result.client.id,
      userId: result.user.id,
      type: "CLIENT" as const,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone,
      clientId: result.client.id,
    };

    return NextResponse.json({
      success: true,
      message: "Customer successfully registered in system",
      data: {
        ...contactPayload,
        contact: contactPayload,
      },
      contact: contactPayload,
    });
  } catch (err: any) {
    console.error("Create contact error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register customer" },
      { status: 500 }
    );
  }
}
