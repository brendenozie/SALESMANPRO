import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
// import jwt from "jsonwebtoken";


// In-memory rate limiter (for demo purposes)
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// JWT Secret (store securely in env variables)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = "1h";

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


// POST /api/login
export async function POST(req: Request) {
  try {
        
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    // Rate limiting per IP
    const record = loginAttempts[ip] || { count: 0, lastAttempt: now };
    if (now - record.lastAttempt < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
      return withCors(
        { status: 429, message: "Too many login attempts. Please try again later." },
        429
      );
    }
    if (now - record.lastAttempt > WINDOW_MS) {
      record.count = 0;
    }
    record.count += 1;
    record.lastAttempt = now;
    loginAttempts[ip] = record;

    // Parse credentials
    const { email, password } = await req.json();
    if (!email || !password) {
      return withCors(
        { status: 400, message: "Missing login details" },
        400
      );
    }

    // Check user models
    const userTypes = [
      { model: prisma.consumer, role: "CONSUMER" },
      { model: prisma.salesAgent, role: "SALES_AGENT" },
      { model: prisma.client, role: "CLIENT" },
      { model: prisma.user, role: "ADMIN" },
    ];

    let foundUser: any = null;
    let userRole: string | null = null;

    for (const { model, role } of userTypes) {
      // Use type assertion to resolve union callable issue
      const u = await (model as { findUnique: (args: any) => Promise<any> }).findUnique({ where: { email } });
      if (u) {
        foundUser = u;
        userRole = role;
        break;
      }
    }

    // Log attempt
    // await prisma.loginAttempt.create({
    //   data: {
    //     email,
    //     success: !!foundUser,
    //     attemptedAt: new Date(),
    //     ipAddress: ip,
    //   },
    // });

    if (!foundUser) {
      return withCors(
        { status: 404, message: "Account not found. Please register first." },
        404
      );
    }

    // Verify password
    // const pwHash = foundUser.password;
    // const valid = await bcrypt.compare(password, pwHash);
    // if (!valid) {
    //   return NextResponse.json(
    //     { status: 401, message: "Invalid credentials" },
    //     { status: 401 }
    //   );
    // }

    // Generate JWT
    // const token = jwt.sign(
    //   { userId: foundUser.id, role: userRole },
    //   JWT_SECRET,
    //   { expiresIn: JWT_EXPIRES_IN }
    // );

    // Exclude password
    const { password: _pw, ...safeUser } = foundUser;

    return withCors(
      {
        status: 200,
        message: "Login successful",
        body: { ...safeUser, role: userRole, token : "xxmega" }
      }, 200
    );
  } catch (error: any) {
    console.error("Login Error:", error);
    return withCors(
      { status: 500, message: "Internal server error", detail: error.message },
      500
    );
  }
}
