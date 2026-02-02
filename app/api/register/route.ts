import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/server/db/prismadb";

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return withCors(
        { error: "All fields are required." },
        400
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return withCors(
        { error: "Email already registered." },
        409
      );
    }

    const origin = req.headers.get("origin") || "";
    const isSalesmanPro = origin.includes("salesmanpro.site");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password:hashedPassword,
        role: isSalesmanPro ? "ADMIN" : "USER",
      },
    });

    if(!isSalesmanPro) {
      const company = await prisma.company.findFirst({
        where: { domain: origin.replace("www.", "") },
      });

      if (company) {
        await prisma.consumer.upsert({
            where: { userId: newUser.id },
            update: {},
            create: {
              companyId: company.id,
              userId: newUser.id,
            },
            include: { user: true }
          });
      }
    }

    return withCors(
      { message: "User registered successfully.", user: { id: newUser.id, email: newUser.email } },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return withCors(
      { error: "Internal Server Error." },
      500
    );
  }
}
