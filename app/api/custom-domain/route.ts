// File: /app/api/custom-domain/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // if you use NextAuth
import { z } from "zod";

// ✅ Schema validation (using Zod)
const DomainSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain is too short")
    .regex(
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid domain format (e.g., yourdomain.com)"
    ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parse = DomainSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });
    }

    const { domain } = parse.data;

    // ✅ Optional authentication check
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find company by user (assuming each user owns one company)
    const company = await prisma.company.findFirst({
      where: { contactEmail: session.user.email },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // ✅ Check if domain is already taken
    const existing = await prisma.company.findFirst({
      where: { domain },
    });

    if (existing && existing.id !== company.id) {
      return NextResponse.json({ error: "Domain already in use by another account" }, { status: 409 });
    }

    // ✅ Update the domain
    await prisma.company.update({
      where: { id: company.id },
      data: { domain, hasWebsite: true },
    });

    return NextResponse.json({
      success: true,
      message: `Domain "${domain}" connected successfully!`,
    });
  } catch (error: any) {
    console.error("Domain API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findFirst({
      where: { contactEmail: session.user.email },
      select: { domain: true, hasWebsite: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      domain: company.domain,
      hasWebsite: company.hasWebsite,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
